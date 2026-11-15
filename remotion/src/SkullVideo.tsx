import React, {useEffect, useLayoutEffect, useMemo} from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {CAM_FOV, computeFrame, H, W, type BoneState} from './skullMath';
import {Overlay} from './Overlay';

/**
 * Procedural studio environment (no network HDR needed): soft image-based
 * light so the bones get specular life instead of flat matte shading.
 * PMREM is generated once on mount; the Player and the still renderer
 * both reuse it across frames.
 */
function StudioEnvironment() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    scene.environmentIntensity = 0.7;
    return () => {
      scene.environment = null;
      envTex.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

/** Keeps the R3F camera aimed at the frame's look-at point as it animates. */
function CameraRig({
  position,
  target,
}: {
  position: [number, number, number];
  target: [number, number, number];
}) {
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    camera.position.set(position[0], position[1], position[2]);
    camera.lookAt(target[0], target[1], target[2]);
    camera.updateProjectionMatrix();
  });
  return null;
}

function BoneMesh({bone}: {bone: BoneState}) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(bone.def.positions, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(bone.def.normals, 3));
    g.setIndex(bone.def.indices);
    return g;
  }, [bone.def]);
  return (
    <mesh geometry={geometry} position={bone.position} castShadow receiveShadow>
      <meshStandardMaterial
        color={[bone.color[0], bone.color[1], bone.color[2]]}
        roughness={0.5}
        metalness={0}
      />
    </mesh>
  );
}

export const SkullVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const frameState = useMemo(() => computeFrame(frame), [frame]);
  const fade = frame < 24 ? 1 - (frame / 24) * (frame / 24) * (3 - 2 * (frame / 24)) : 0;
  return (
    <AbsoluteFill style={{width: W, height: H, backgroundColor: 'white'}}>
      <ThreeCanvas
        width={W}
        height={H}
        shadows
        camera={{
          fov: CAM_FOV,
          near: 0.1,
          far: 100,
          position: frameState.camPos,
        }}
      >
        <color attach="background" args={['white']} />
        <CameraRig position={frameState.camPos} target={frameState.camTarget} />
        <StudioEnvironment />
        {/* Key light (Blender sun) with soft shadows; the environment
            now carries the ambient, so the fill lights are turned down. */}
        <directionalLight
          position={[-2.5, 4.0, 3.0]}
          intensity={2.0}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-3}
          shadow-camera-right={3}
          shadow-camera-top={3}
          shadow-camera-bottom={-3}
          shadow-camera-near={0.5}
          shadow-camera-far={15}
          shadow-bias={-0.0005}
          shadow-normalBias={0.02}
        />
        <hemisphereLight args={['#ffffff', '#d8d8d8', 1.0]} />
        <ambientLight intensity={0.35} />
        {frameState.bones.map((b) => (
          <BoneMesh key={b.def.num} bone={b} />
        ))}
      </ThreeCanvas>
      <Overlay frameState={frameState} />
      <Audio src={staticFile('mixed.wav')} />
      {fade > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'white',
            opacity: fade,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

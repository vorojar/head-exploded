import {SceneReady} from './SceneReady';
import { CompactMarkers } from "./LearningOverlay";
import type { SceneProps } from "./lessons";
/** Episode 2 video component. Same 3D scene and studio lighting as
 * Episode 1, but driven by skullMath2 (new staging: vault-away, below
 * view, facial group explosion) and Overlay2 (custom anchor labels).
 */
import React, { useEffect, useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { CAM_FOV, H, W, type BoneDef } from "./skullMath";
import { computeFrame2, type BoneState2 } from "./skullMath2";
import { Overlay2 } from "./Overlay2";

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

/** Aims the R3F camera at the frame's look-at point, with the blended up
 * vector (world-up rotating to world-front for the vertical views). */
function CameraRig({
  position,
  target,
  up,
}: {
  position: [number, number, number];
  target: [number, number, number];
  up: [number, number, number];
}) {
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    camera.position.set(position[0], position[1], position[2]);
    camera.up.set(up[0], up[1], up[2]);
    camera.lookAt(target[0], target[1], target[2]);
    camera.updateProjectionMatrix();
  });
  return null;
}

function BoneMesh({ bone }: { bone: BoneState2 }) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(bone.def.positions, 3),
    );
    g.setAttribute(
      "normal",
      new THREE.Float32BufferAttribute(bone.def.normals, 3),
    );
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

export const SkullVideo2: React.FC<SceneProps> = ({
  webPlayer = false,
  compactLabels = false,
  onSceneReady,
}) => {
  const frame = useCurrentFrame();
  const frameState = useMemo(() => computeFrame2(frame), [frame]);
  const fade =
    !webPlayer && frame < 24
      ? 1 - (frame / 24) * (frame / 24) * (3 - 2 * (frame / 24))
      : 0;
  return (
    <AbsoluteFill style={{ width: W, height: H, backgroundColor: "white" }}>
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
        <color attach="background" args={["white"]} />
        <CameraRig
          position={frameState.camPos}
          target={frameState.camTarget}
          up={frameState.camUp}
        />
        <StudioEnvironment />
        {webPlayer && <SceneReady onReady={onSceneReady}/>}
        <directionalLight
          position={[-2.5, 4.0, 3.0]}
          intensity={2.0}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-3}
          shadow-camera-right={3}
          shadow-camera-top={3}
          shadow-camera-bottom={-3}
          shadow-camera-near={0.5}
          shadow-camera-far={15}
          shadow-bias={-0.0005}
          shadow-normalBias={0.02}
        />
        <hemisphereLight args={["#ffffff", "#d8d8d8", 1.0]} />
        <ambientLight intensity={0.35} />
        {frameState.bones.map((b) => (
          <BoneMesh key={b.def.num} bone={b} />
        ))}
      </ThreeCanvas>
      <Overlay2
        frameState={frameState}
        embeddedCaptions={!webPlayer}
        compactLabels={compactLabels}
      />
      {compactLabels && <CompactMarkers episode={1} frameState={frameState} />}
      <Audio src={staticFile("narration2.mp3")} />
      {fade > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "white",
            opacity: fade,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

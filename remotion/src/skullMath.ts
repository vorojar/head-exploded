/** Pure frame math for the head-exploded video. Ported 1:1 from head_video.py
 * (Blender) so the Remotion + Three.js render matches the Blender version:
 * same normalisation (max edge 2.6, centred), same explosion dirs/distances,
 * same segment timing, same focus dimming, same camera (40mm lens,
 * direction (-2.4,-3.2,1.7) in Blender coords, 6.5 close / 8.4 far).
 * Blender (x, y, z) -> Three.js (x, z, -y) was applied in obj2json.py.
 */
import * as THREE from 'three';
import timelineData from './timeline.json';
import skullData from '../public/skull.json';

// Colours must be used as-is (linear, as Blender set them), not reinterpreted
// as sRGB. With colour management off, three uses the values directly and the
// sRGB output conversion matches Blender's Standard view transform.
THREE.ColorManagement.enabled = false;

export const W = 1280;
export const H = 720;
export const FPS = 24;
export const TOTAL_FRAMES = 2758;
const RAMP = 24;

export type Vec3 = [number, number, number];

export type Segment = {
  id: string;
  start: number;
  end: number;
  bones: number[];
  labels: string[] | 'all';
  text: string;
};

export const TIMELINE: Segment[] = (
  timelineData as {timeline: Segment[]; total_frames: number; fps: number}
).timeline;

export type BoneDef = {
  num: number;
  name: string;
  color: [number, number, number];
  dist: number;
  dir: Vec3;
  center: Vec3;
  positions: number[];
  normals: number[];
  indices: number[];
};

export const BONES: BoneDef[] = (skullData as {bones: BoneDef[]}).bones;

export type BoneState = {
  def: BoneDef;
  /** world offset from assembled position */
  position: Vec3;
  /** current colour (dimmed to 45% when out of focus) */
  color: [number, number, number];
  /** projected AABB-centre on screen, or null when behind the camera */
  center2D: [number, number] | null;
};

export type FrameState = {
  segment: Segment;
  camPos: Vec3;
  /** point the camera looks at (origin in wide shots, the focused bone's centre in focus shots) */
  camTarget: Vec3;
  bones: BoneState[];
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const smooth = (t: number) => {
  const c = clamp(t, 0, 1);
  return c * c * (3 - 2 * c);
};

export function segmentAt(frame: number): Segment {
  for (const t of TIMELINE) {
    if (t.start <= frame && frame < t.end) return t;
  }
  return TIMELINE[TIMELINE.length - 1];
}

const BONE_SEGS = TIMELINE.filter((t) => t.bones.length > 0);
const ALLOUT = TIMELINE.find((t) => t.id === 'allout') as Segment;
const BACK = TIMELINE.find((t) => t.id === 'back') as Segment;

const CAM_DIR: Vec3 = (() => {
  // Blender (-2.4, -3.2, 1.7) -> Three (-2.4, 1.7, 3.2), normalised
  const v = new THREE.Vector3(-2.4, 1.7, 3.2).normalize();
  return [v.x, v.y, v.z];
})();

/** Vertical FOV matching Blender 40mm lens on 36mm sensor at 1280x720. */
export const CAM_FOV = (2 * Math.atan(0.45 * (H / W)) * 180) / Math.PI;

/** Distance curve for the wide shots (intro / allout / back / end). */
function baseDistance(frame: number): number {
  if (frame <= ALLOUT.end) {
    return 6.5 + (8.4 - 6.5) * smooth(frame / ALLOUT.end);
  }
  if (frame <= BACK.end) {
    return 8.4 + (6.5 - 8.4) * smooth((frame - ALLOUT.end) / (BACK.end - ALLOUT.end));
  }
  return 6.5;
}

const add3 = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale3 = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
const len3 = (a: Vec3) => Math.hypot(a[0], a[1], a[2]);
const norm3 = (a: Vec3): Vec3 => {
  const l = len3(a);
  return l > 1e-6 ? [a[0] / l, a[1] / l, a[2] / l] : [0, 0, 1];
};

type CamKF = {dir: Vec3; lookAt: Vec3; dist: number};

/** Per-bone AABB (assembled mesh), computed once from the vertices. */
const BONE_BOX = new Map<number, {min: Vec3; max: Vec3}>();
for (const def of BONES) {
  const mn: Vec3 = [Infinity, Infinity, Infinity];
  const mx: Vec3 = [-Infinity, -Infinity, -Infinity];
  const p = def.positions;
  for (let i = 0; i < p.length; i += 3) {
    for (let k = 0; k < 3; k++) {
      if (p[i + k] < mn[k]) mn[k] = p[i + k];
      if (p[i + k] > mx[k]) mx[k] = p[i + k];
    }
  }
  BONE_BOX.set(def.num, {min: mn, max: mx});
}

/**
 * Focus keyframe for a bone segment: the camera swings around so the bone
 * being discussed becomes the protagonist - it sits outside the bone's
 * exploded position looking back at it, and zooms in so the bone fills
 * ~70% of the frame height. Pairs (L/R) are framed together at their
 * midpoint; a pair exploding symmetrically (temporal) has no meaningful
 * outward direction, so it keeps the standard 3/4 view.
 */
const FOCUS_KF = new Map<string, CamKF>();
for (const seg of BONE_SEGS) {
  const defs = seg.bones.map((n) => BONES.find((b) => b.num === n) as BoneDef);
  // Mean exploded centre of the focused bones.
  let expC: Vec3 = [0, 0, 0];
  for (const d of defs) {
    const e = add3(d.center, scale3(d.dir, d.dist));
    expC = [
      expC[0] + e[0] / defs.length,
      expC[1] + e[1] / defs.length,
      expC[2] + e[2] / defs.length,
    ];
  }
  const dir = len3(expC) >= 0.5 ? norm3(expC) : CAM_DIR;
  // Union AABB of the focused bones at their exploded offsets.
  const mn: Vec3 = [Infinity, Infinity, Infinity];
  const mx: Vec3 = [-Infinity, -Infinity, -Infinity];
  for (const d of defs) {
    const box = BONE_BOX.get(d.num) as {min: Vec3; max: Vec3};
    const o = scale3(d.dir, d.dist);
    for (let k = 0; k < 3; k++) {
      if (box.min[k] + o[k] < mn[k]) mn[k] = box.min[k] + o[k];
      if (box.max[k] + o[k] > mx[k]) mx[k] = box.max[k] + o[k];
    }
  }
  const size = Math.max(mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]);
  // Visible height at distance d is ~0.506*d (FOV 28.4 deg); fill ~70%.
  const dist = clamp(2.82 * size, 2.2, 6.5);
  FOCUS_KF.set(seg.id, {dir, lookAt: expC, dist});
}

/** Tracked centre of the focused bones: follows them as they explode out. */
function focusLookAt(seg: Segment, frame: number): Vec3 {
  const t = boneOffset(seg.bones[0], frame);
  let c: Vec3 = [0, 0, 0];
  for (const n of seg.bones) {
    const d = BONES.find((b) => b.num === n) as BoneDef;
    const e = add3(d.center, scale3(d.dir, d.dist * t));
    c = [
      c[0] + e[0] / seg.bones.length,
      c[1] + e[1] / seg.bones.length,
      c[2] + e[2] / seg.bones.length,
    ];
  }
  return c;
}

function baseKF(frame: number): CamKF {
  return {dir: CAM_DIR, lookAt: [0, 0, 0], dist: baseDistance(frame)};
}

/** Settled keyframe of the segment before `seg` (its end state). */
function prevKF(seg: Segment): CamKF {
  const prevSeg = TIMELINE[TIMELINE.indexOf(seg) - 1];
  const fk = FOCUS_KF.get(prevSeg.id);
  if (fk) return fk;
  return baseKF(seg.start - 1);
}

/**
 * Camera for a frame. At each segment start the camera eases (same ramp as
 * the bone explosion) from the previous segment's keyframe to this one's,
 * then holds it - focus segments track the exploding bone, wide shots use
 * the standard direction and the 6.5 -> 8.4 -> 6.5 distance curve.
 */
export function cameraAt(frame: number): {pos: Vec3; lookAt: Vec3} {
  const seg = segmentAt(frame);
  const idx = TIMELINE.indexOf(seg);
  const ramp = Math.min(RAMP, Math.floor((seg.end - seg.start) / 3));
  const fk = FOCUS_KF.get(seg.id);
  const cur: CamKF = fk
    ? {dir: fk.dir, lookAt: focusLookAt(seg, frame), dist: fk.dist}
    : baseKF(frame);
  if (idx === 0) {
    return {pos: add3(cur.lookAt, scale3(cur.dir, cur.dist)), lookAt: cur.lookAt};
  }
  const prev = prevKF(seg);
  const u = smooth((frame - (seg.start - 1)) / (ramp + 1));
  const dir = norm3(lerp3(prev.dir, cur.dir, u));
  const lookAt = lerp3(prev.lookAt, cur.lookAt, u);
  const dist = prev.dist + (cur.dist - prev.dist) * u;
  return {pos: add3(lookAt, scale3(dir, dist)), lookAt};
}

/** Frame-driven orbit: ±5 degrees in 48 seconds; labels use this same camera. */
export function gentleOrbit<T extends {pos: Vec3; lookAt: Vec3; up?: Vec3}>(camera: T, frame: number, enabled: boolean): T {
  if (!enabled) return camera;
  const fade = smooth(frame / (FPS * 2));
  const angle = Math.sin(frame / FPS * Math.PI * 2 / 48) * Math.PI / 36 * fade;
  const offset = new THREE.Vector3(...camera.pos).sub(new THREE.Vector3(...camera.lookAt));
  offset.applyAxisAngle(new THREE.Vector3(...(camera.up ?? [0, 1, 0] as Vec3)).normalize(), angle);
  const pos: Vec3 = [camera.lookAt[0] + offset.x, camera.lookAt[1] + offset.y, camera.lookAt[2] + offset.z];
  return {...camera, pos};
}

function makeCamera(frame: number, motion = false): THREE.PerspectiveCamera {
  const cam = new THREE.PerspectiveCamera(CAM_FOV, W / H, 0.1, 100);
  const {pos, lookAt} = gentleOrbit(cameraAt(frame), frame, motion);
  cam.position.set(pos[0], pos[1], pos[2]);
  cam.lookAt(lookAt[0], lookAt[1], lookAt[2]);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld();
  return cam;
}

function boneOffset(num: number, frame: number): number {
  const seg = BONE_SEGS.find((t) => t.bones.includes(num));
  if (!seg) return 0;
  const ramp = Math.min(RAMP, Math.floor((seg.end - seg.start) / 3));
  let t = 0;
  if (frame >= seg.start - 1) {
    t = smooth((frame - (seg.start - 1)) / (ramp + 1));
  }
  // Reassembly in the back segment, reverse order, staggered 4 frames.
  const k = [...BONE_SEGS].reverse().findIndex((s) => s.bones.includes(num));
  const backStart = BACK.start + 4 * k;
  if (frame >= backStart - 1) {
    t = 1 - smooth((frame - (backStart - 1)) / 25);
  }
  return t;
}

function dimAmount(num: number, seg: Segment, frame: number): number {
  if (!seg.bones.length || seg.bones.includes(num)) return 0;
  const {start, end} = seg;
  if (frame < start - 1 || frame > end + 1) return 0;
  if (frame <= start + 12) return smooth((frame - (start - 1)) / 13);
  if (frame >= end - 12) return 1 - smooth((frame - (end - 12)) / 13);
  return 1;
}

export function computeFrame(frame: number, motion = false): FrameState {
  const seg = segmentAt(frame);
  const cam = makeCamera(frame, motion);
  const {pos, lookAt} = gentleOrbit(cameraAt(frame), frame, motion);
  const bones: BoneState[] = BONES.map((def) => {
    const t = boneOffset(def.num, frame);
    const position: Vec3 = [
      def.dir[0] * def.dist * t,
      def.dir[1] * def.dist * t,
      def.dir[2] * def.dist * t,
    ];
    const dim = dimAmount(def.num, seg, frame);
    const f = 1 - 0.55 * dim;
    const color: [number, number, number] = [
      def.color[0] * f,
      def.color[1] * f,
      def.color[2] * f,
    ];
    const world = new THREE.Vector3(
      def.center[0] + position[0],
      def.center[1] + position[1],
      def.center[2] + position[2],
    );
    const ndc = world.project(cam);
    const center2D: [number, number] | null =
      ndc.z < 1
        ? [
            (ndc.x * 0.5 + 0.5) * W,
            (-ndc.y * 0.5 + 0.5) * H,
          ]
        : null;
    return {def, position, color, center2D};
  });
  return {segment: seg, camPos: pos, camTarget: lookAt, bones};
}

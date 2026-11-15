/** Pure frame math for Episode 2 (sutures, foramina, clinical points).
 * Same bones / normalisation / lighting as Episode 1 (skullMath.ts), but
 * new staging: suture segments keep the skull assembled with no dimming,
 * vault segments lift the calvaria (frontal + parietals) away and look
 * down into the cranial cavity, one segment looks up at the skull base
 * from below, and the facial segment explodes the five small facial bones
 * forward as a group. Camera directions are per-segment (top, side,
 * below) instead of Episode 1's single 3/4 view.
 */
import * as THREE from 'three';
import timelineData from './timeline2.json';
import {BONES, W, H, FPS, CAM_FOV, type BoneDef, type Vec3} from './skullMath';

THREE.ColorManagement.enabled = false;

const RAMP = 24;

export type PointLabel = {
  x: number;
  y: number;
  z: number;
  label: string;
  latin: string;
};

export type Segment2 = {
  id: string;
  start: number;
  end: number;
  mode: 'intro' | 'suture' | 'vault' | 'below' | 'facial' | 'recap';
  bones: number[];
  labels: string[] | 'all';
  text: string;
  camDir: Vec3;
  lookAt: Vec3;
  dist: number;
  points: PointLabel[];
};

export const TIMELINE2: Segment2[] = (
  timelineData as unknown as {timeline: Segment2[]; total_frames: number; fps: number}
).timeline;

export const TOTAL2 = (timelineData as unknown as {total_frames: number}).total_frames;

export type BoneState2 = {
  def: BoneDef;
  /** world offset from assembled position */
  position: Vec3;
  /** current colour (dimmed to 45% when out of focus) */
  color: [number, number, number];
  /** projected AABB-centre on screen, or null when behind the camera */
  center2D: [number, number] | null;
};

export type PointState2 = {
  label: string;
  latin: string;
  /** projected anchor on screen, or null when behind the camera */
  pos2D: [number, number] | null;
};

export type FrameState2 = {
  segment: Segment2;
  camPos: Vec3;
  camTarget: Vec3;
  /** blended up vector (world-up, rotating to world-front for vertical views) */
  camUp: Vec3;
  bones: BoneState2[];
  points: PointState2[];
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const smooth = (t: number) => {
  const c = clamp(t, 0, 1);
  return c * c * (3 - 2 * c);
};

export function segmentAt2(frame: number): Segment2 {
  for (const t of TIMELINE2) {
    if (t.start <= frame && frame < t.end) return t;
  }
  return TIMELINE2[TIMELINE2.length - 1];
}

const INTRO = TIMELINE2[0];
const VAULT_START = TIMELINE2.find((t) => t.id === 'cranial-base') as Segment2;
const VAULT_END = TIMELINE2.find((t) => t.id === 'iam') as Segment2;
const BELOW = TIMELINE2.find((t) => t.id === 'posterior-base') as Segment2;
const FACIAL = TIMELINE2.find((t) => t.id === 'facial-cluster') as Segment2;
const RECAP = TIMELINE2.find((t) => t.id === 'recap') as Segment2;

/** The five small facial bones that explode forward together (segment 14). */
const FACIAL_BONES = [9, 10, 16, 17, 18, 19, 20, 21, 22];
/** Bones dimmed to 45% during the facial segment so the small bones read. */
const FACIAL_DIM = [11, 12, 13, 14];
/** Calvaria lift: up and back, clear of the top-down line of sight. */
const VAULT_LIFT: Vec3 = [0, 1.2, -1.3];
/** Occipital lift for the IAM segment: mostly back, slightly up. */
const OCC_LIFT: Vec3 = [0, 0.3, -1.5];

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

/** 0 -> 1 while the vault lifts (segment 7), 1 through segment 12, back to 0 in segment 13. */
function vaultLift(frame: number): number {
  if (frame < VAULT_START.start - 1) return 0;
  if (frame < VAULT_START.start - 1 + RAMP) {
    return smooth((frame - (VAULT_START.start - 1)) / (RAMP + 1));
  }
  if (frame < BELOW.start - 1) return 1;
  if (frame < BELOW.start - 1 + RAMP) {
    return 1 - smooth((frame - (BELOW.start - 1)) / (RAMP + 1));
  }
  return 0;
}

/** Occipital lift: up in the IAM segment, back down in the below segment. */
function occLift(frame: number): number {
  if (frame < VAULT_END.start - 1) return 0;
  if (frame < VAULT_END.start - 1 + RAMP) {
    return smooth((frame - (VAULT_END.start - 1)) / (RAMP + 1));
  }
  if (frame < BELOW.start - 1) return 1;
  if (frame < BELOW.start - 1 + RAMP) {
    return 1 - smooth((frame - (BELOW.start - 1)) / (RAMP + 1));
  }
  return 0;
}

/** Facial group explosion: 0 -> 1 in the facial segment, back to 0 in the recap. */
function facialT(frame: number): number {
  if (frame < FACIAL.start - 1) return 0;
  if (frame < FACIAL.start - 1 + RAMP) {
    return smooth((frame - (FACIAL.start - 1)) / (RAMP + 1));
  }
  if (frame < RECAP.start - 1) return 1;
  if (frame < RECAP.start - 1 + RAMP) {
    return 1 - smooth((frame - (RECAP.start - 1)) / (RAMP + 1));
  }
  return 0;
}

function boneOffset2(num: number, frame: number): Vec3 {
  const vl = vaultLift(frame);
  if (vl > 0 && (num === 1 || num === 2 || num === 3)) {
    return scale3(VAULT_LIFT, vl);
  }
  const ol = occLift(frame);
  if (ol > 0 && num === 6) {
    return scale3(OCC_LIFT, ol);
  }
  const ft = facialT(frame);
  if (ft > 0 && FACIAL_BONES.includes(num)) {
    const d = BONES.find((b) => b.num === num) as BoneDef;
    return scale3(d.dir, d.dist * 0.7 * ft);
  }
  return [0, 0, 0];
}

function dimAmount2(num: number, seg: Segment2, frame: number): number {
  if (seg.mode !== 'facial' || !FACIAL_DIM.includes(num)) return 0;
  const {start, end} = seg;
  if (frame < start - 1 || frame > end + 1) return 0;
  if (frame <= start + 12) return smooth((frame - (start - 1)) / 13);
  if (frame >= end - 12) return 1 - smooth((frame - (end - 12)) / 13);
  return 1;
}

type CamKF = {dir: Vec3; lookAt: Vec3; dist: number};

/** Intro pulls back 6.5 -> 8.4 like Episode 1; every other segment holds its own distance. */
function segKF(seg: Segment2, frame: number): CamKF {
  const dir = norm3(seg.camDir);
  let lookAt = seg.lookAt;
  let dist = seg.dist;
  if (seg.mode === 'intro') {
    dist = 6.5 + (8.4 - 6.5) * smooth(frame / seg.end);
  }
  if (seg.mode === 'facial') {
    // Track the facial bones' exploded centre, like Episode 1's focus tracking.
    const t = facialT(frame);
    let c: Vec3 = [0, 0, 0];
    for (const n of FACIAL_BONES) {
      const d = BONES.find((b) => b.num === n) as BoneDef;
      const e = add3(d.center, scale3(d.dir, d.dist * 0.7 * t));
      c = [
        c[0] + e[0] / FACIAL_BONES.length,
        c[1] + e[1] / FACIAL_BONES.length,
        c[2] + e[2] / FACIAL_BONES.length,
      ];
    }
    lookAt = c;
  }
  return {dir, lookAt, dist};
}

function prevKF(seg: Segment2): CamKF {
  const idx = TIMELINE2.indexOf(seg);
  if (idx <= 0) return segKF(seg, seg.start - 1);
  return segKF(TIMELINE2[idx - 1], seg.start - 1);
}

export function cameraAt2(frame: number): {pos: Vec3; lookAt: Vec3; up: Vec3} {
  const seg = segmentAt2(frame);
  const idx = TIMELINE2.indexOf(seg);
  const ramp = Math.min(RAMP, Math.floor((seg.end - seg.start) / 3));
  const cur = segKF(seg, frame);
  const upFor = (pos: Vec3, lookAt: Vec3): Vec3 => {
    // The top-down and below views look almost straight along the Y axis,
    // where the default up (0,1,0) is degenerate. Blend the up vector from
    // world-up towards world-front as the view goes vertical, so the front
    // of the skull stays at the top of the screen and the roll never jumps.
    const viewDir = norm3([
      lookAt[0] - pos[0],
      lookAt[1] - pos[1],
      lookAt[2] - pos[2],
    ]);
    const s = smooth((Math.abs(viewDir[1]) - 0.8) / 0.15);
    return norm3(lerp3([0, 1, 0], [0, 0, 1], s));
  };
  if (idx === 0) {
    const pos = add3(cur.lookAt, scale3(cur.dir, cur.dist));
    return {pos, lookAt: cur.lookAt, up: upFor(pos, cur.lookAt)};
  }
  const prev = prevKF(seg);
  const u = smooth((frame - (seg.start - 1)) / (ramp + 1));
  const dir = norm3(lerp3(prev.dir, cur.dir, u));
  const lookAt = lerp3(prev.lookAt, cur.lookAt, u);
  const dist = prev.dist + (cur.dist - prev.dist) * u;
  const pos = add3(lookAt, scale3(dir, dist));
  return {pos, lookAt, up: upFor(pos, lookAt)};
}

function makeCamera2(frame: number): THREE.PerspectiveCamera {
  const cam = new THREE.PerspectiveCamera(CAM_FOV, W / H, 0.1, 100);
  const {pos, lookAt, up} = cameraAt2(frame);
  cam.position.set(pos[0], pos[1], pos[2]);
  cam.up.set(up[0], up[1], up[2]);
  cam.lookAt(lookAt[0], lookAt[1], lookAt[2]);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld();
  return cam;
}

function project(cam: THREE.PerspectiveCamera, p: Vec3): [number, number] | null {
  const v = new THREE.Vector3(p[0], p[1], p[2]);
  const ndc = v.project(cam);
  if (ndc.z >= 1) return null;
  return [
    Math.round((ndc.x * 0.5 + 0.5) * W),
    Math.round((-ndc.y * 0.5 + 0.5) * H),
  ];
}

export function computeFrame2(frame: number): FrameState2 {
  const seg = segmentAt2(frame);
  const cam = makeCamera2(frame);
  const {pos, lookAt, up} = cameraAt2(frame);
  const bones: BoneState2[] = BONES.map((def) => {
    const position = boneOffset2(def.num, frame);
    const dim = dimAmount2(def.num, seg, frame);
    const f = 1 - 0.55 * dim;
    const color: [number, number, number] = [
      def.color[0] * f,
      def.color[1] * f,
      def.color[2] * f,
    ];
    const world: Vec3 = [
      def.center[0] + position[0],
      def.center[1] + position[1],
      def.center[2] + position[2],
    ];
    const center2D = project(cam, world);
    return {def, position, color, center2D};
  });
  const points: PointState2[] = seg.points.map((p) => ({
    label: p.label,
    latin: p.latin,
    pos2D: project(cam, [p.x, p.y, p.z]),
  }));
  return {segment: seg, camPos: pos, camTarget: lookAt, camUp: up, bones, points};
}

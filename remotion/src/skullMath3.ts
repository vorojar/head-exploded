/** Pure frame math for Episode 3 (systems & clinical).
 * Same bones / normalisation / lighting as Episodes 1–2, but new staging:
 * - vault: calvaria lifts away, top-down into the cranial cavity (CN map, CSF leak)
 * - vault-below / vault-front: two-part segments, camera swings from the
 *   vault view to a below view (cn-back) or a front view (orbit-apex)
 * - walls: the orbit's four walls highlight one at a time (orbit-walls)
 * - dislocate: the mandible translates forward, condyle over the eminence
 * - fracture: Le Fort lines drawn as projected overlay polylines
 * - signs: bruise patches (Battle's sign, raccoon eyes) as overlay ellipses
 * The vault is a per-segment target (up during vault segments, down during
 * assembled ones), ramped over 24 frames at each transition.
 */
import * as THREE from 'three';
import timelineData from './timeline3.json';
import {gentleOrbit, BONES, W, H, FPS, CAM_FOV, type BoneDef, type Vec3} from './skullMath';

THREE.ColorManagement.enabled = false;

const RAMP = 24;

export type PointLabel3 = {
  x: number;
  y: number;
  z: number;
  label: string;
  latin: string;
  /** which half of a two-part segment this point belongs to (default 0) */
  beat?: number;
};

export type WallDef = {
  bones: number[];
  label: string;
  latin: string;
};

export type Segment3 = {
  id: string;
  start: number;
  end: number;
  mode:
    | 'intro'
    | 'vault'
    | 'vault-below'
    | 'vault-front'
    | 'assembled'
    | 'walls'
    | 'dislocate'
    | 'fracture'
    | 'signs';
  bones: number[];
  text: string;
  camDir: Vec3;
  lookAt: Vec3;
  dist: number;
  distEnd?: number;
  camDir2?: Vec3;
  lookAt2?: Vec3;
  dist2?: number;
  points: PointLabel3[];
  walls?: WallDef[];
  fracture?: Vec3[];
  bruises?: [number, number, number, number, number][];
  drips?: [Vec3, Vec3][];
};

export const TIMELINE3: Segment3[] = (
  timelineData as unknown as {segments: Segment3[]; total: number; fps: number}
).segments;

export const TOTAL3 = (timelineData as unknown as {total: number}).total;

export type BoneState3 = {
  def: BoneDef;
  position: Vec3;
  color: [number, number, number];
  center2D: [number, number] | null;
};

export type PointState3 = {
  label: string;
  latin: string;
  pos2D: [number, number] | null;
  beat: number;
};

export type FrameState3 = {
  segment: Segment3;
  camPos: Vec3;
  camTarget: Vec3;
  camUp: Vec3;
  bones: BoneState3[];
  points: PointState3[];
  /** current half of a two-part segment (0 or 1) */
  beat: number;
  /** current wall index for walls mode, -1 otherwise */
  wallIndex: number;
  /** mandible translation for dislocate mode */
  mandibleShift: Vec3;
  /** projected fracture polyline (2D screen points), or null */
  fracture2D: [number, number][] | null;
  /** 0..1, how much of the fracture line has been drawn */
  fractureProgress: number;
  /** projected bruise ellipses: [x, y, rx, ry] */
  bruise2D: [number, number, number, number][];
  /** 0..1, bruise fade-in */
  bruiseOpacity: number;
  /** projected drip lines: [x1, y1, x2, y2] */
  drip2D: [number, number, number, number][];
  /** 0..1, how much of each drip line has grown */
  dripProgress: number;
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const smooth = (t: number) => {
  const c = clamp(t, 0, 1);
  return c * c * (3 - 2 * c);
};

export function segmentAt3(frame: number): Segment3 {
  for (const t of TIMELINE3) {
    if (t.start <= frame && frame < t.end) return t;
  }
  return TIMELINE3[TIMELINE3.length - 1];
}

/** Vault target keyframes: the calvaria lifts at each vault segment (or the
 * first half of a two-part segment) and drops at each assembled segment.
 * Gaps are all > RAMP, so every ramp finishes before the next starts. */
const VAULT_KEYS: {frame: number; target: number}[] = [
  {frame: 324, target: 1}, // cn-front start
  {frame: 1284, target: 0}, // cn-back midpoint (below half)
  {frame: 1482, target: 1}, // cn-table start
  {frame: 1691, target: 0}, // orbit-room start
  {frame: 2404, target: 1}, // orbit-apex start (vault half)
  {frame: 2606, target: 0}, // orbit-apex midpoint (front half)
  {frame: 4854, target: 1}, // csf-leak start
  {frame: 5188, target: 0}, // recap start
];

const VAULT_LIFT: Vec3 = [0, 1.2, -1.3];

function vaultLift3(frame: number): number {
  let idx = -1;
  for (let i = 0; i < VAULT_KEYS.length; i++) {
    if (VAULT_KEYS[i].frame <= frame) idx = i;
    else break;
  }
  if (idx < 0) return 0;
  const prev = idx > 0 ? VAULT_KEYS[idx - 1].target : 0;
  const cur = VAULT_KEYS[idx].target;
  const u = smooth((frame - VAULT_KEYS[idx].frame) / RAMP);
  return prev + (cur - prev) * u;
}

/** Mandible dislocation shift: forward (+z) and slightly down. */
const DISLOCATE_SHIFT: Vec3 = [0, -0.05, 0.25];

function dislocateT(frame: number): number {
  const seg = TIMELINE3.find((t) => t.id === 'tmj-dislocation') as Segment3;
  if (frame < seg.start - 1) return 0;
  if (frame < seg.start - 1 + RAMP) {
    return smooth((frame - (seg.start - 1)) / (RAMP + 1));
  }
  if (frame < seg.end - RAMP) return 1;
  if (frame < seg.end) {
    return 1 - smooth((frame - (seg.end - RAMP)) / (RAMP + 1));
  }
  return 0;
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

function boneOffset3(num: number, frame: number): Vec3 {
  const vl = vaultLift3(frame);
  if (vl > 0 && (num === 1 || num === 2 || num === 3)) {
    return scale3(VAULT_LIFT, vl);
  }
  const dt = dislocateT(frame);
  if (dt > 0 && num === 15) {
    return scale3(DISLOCATE_SHIFT, dt);
  }
  return [0, 0, 0];
}

/** Current wall index for walls mode (0..3), -1 otherwise. */
function wallIndex3(seg: Segment3, frame: number): number {
  if (seg.mode !== 'walls' || !seg.walls) return -1;
  const u = (frame - seg.start) / (seg.end - seg.start);
  return Math.min(3, Math.max(0, Math.floor(u * 4)));
}

/** Dimming: bones not in the highlight set go to 45%. */
function dimAmount3(num: number, seg: Segment3, frame: number): number {
  let highlight: number[] | null = null;
  if (seg.mode === 'walls' && seg.walls) {
    const wi = wallIndex3(seg, frame);
    if (wi >= 0) highlight = seg.walls[wi].bones;
  } else if (seg.bones.length > 0) {
    highlight = seg.bones;
  }
  if (!highlight || highlight.includes(num)) return 0;
  const {start, end} = seg;
  if (frame < start - 1 || frame > end + 1) return 0;
  if (frame <= start + 12) return smooth((frame - (start - 1)) / 13);
  if (frame >= end - 12) return 1 - smooth((frame - (end - 12)) / 13);
  return 1;
}

type CamKF = {dir: Vec3; lookAt: Vec3; dist: number};

/** Keyframe for a segment at a given frame (handles two-part segments and intro pull-back). */
function segKF(seg: Segment3, frame: number): CamKF {
  let dir = norm3(seg.camDir);
  let lookAt = seg.lookAt;
  let dist = seg.dist;
  if (seg.mode === 'intro' && seg.distEnd !== undefined) {
    dist = seg.dist + (seg.distEnd - seg.dist) * smooth(frame / seg.end);
  }
  if ((seg.mode === 'vault-below' || seg.mode === 'vault-front') && seg.camDir2) {
    const mid = (seg.start + seg.end) / 2;
    if (frame >= mid) {
      dir = norm3(seg.camDir2);
      lookAt = seg.lookAt2 as Vec3;
      dist = seg.dist2 as number;
    }
  }
  return {dir, lookAt, dist};
}

function prevKF(seg: Segment3): CamKF {
  const idx = TIMELINE3.indexOf(seg);
  if (idx <= 0) return segKF(seg, seg.start - 1);
  return segKF(TIMELINE3[idx - 1], seg.start - 1);
}

export function cameraAt3(frame: number): {pos: Vec3; lookAt: Vec3; up: Vec3} {
  const seg = segmentAt3(frame);
  const idx = TIMELINE3.indexOf(seg);
  const ramp = Math.min(RAMP, Math.floor((seg.end - seg.start) / 3));
  const cur = segKF(seg, frame);
  const upFor = (pos: Vec3, lookAt: Vec3): Vec3 => {
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
  // Blend from the previous segment's keyframe over the ramp.
  // For a two-part segment, the midpoint transition blends between its two halves.
  const prev = prevKF(seg);
  let u = smooth((frame - (seg.start - 1)) / (ramp + 1));
  let from = prev;
  if ((seg.mode === 'vault-below' || seg.mode === 'vault-front') && seg.camDir2) {
    const mid = (seg.start + seg.end) / 2;
    if (frame >= mid - RAMP / 2) {
      const u2 = smooth((frame - (mid - RAMP / 2)) / RAMP);
      const first = segKF(seg, mid - 1);
      const second = segKF(seg, mid);
      const dir = norm3(lerp3(first.dir, second.dir, u2));
      const lookAt = lerp3(first.lookAt, second.lookAt, u2);
      const dist = first.dist + (second.dist - first.dist) * u2;
      const pos = add3(lookAt, scale3(dir, dist));
      return {pos, lookAt, up: upFor(pos, lookAt)};
    }
    // First half: blend from the previous segment as usual.
    from = prev;
    u = smooth((frame - (seg.start - 1)) / (ramp + 1));
  }
  const dir = norm3(lerp3(from.dir, cur.dir, u));
  const lookAt = lerp3(from.lookAt, cur.lookAt, u);
  const dist = from.dist + (cur.dist - from.dist) * u;
  const pos = add3(lookAt, scale3(dir, dist));
  return {pos, lookAt, up: upFor(pos, lookAt)};
}

function makeCamera3(frame: number, motion = false): THREE.PerspectiveCamera {
  const cam = new THREE.PerspectiveCamera(CAM_FOV, W / H, 0.1, 100);
  const {pos, lookAt, up} = gentleOrbit(cameraAt3(frame), frame, motion);
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
    (ndc.x * 0.5 + 0.5) * W,
    (-ndc.y * 0.5 + 0.5) * H,
  ];
}

export function computeFrame3(frame: number, motion = false): FrameState3 {
  const seg = segmentAt3(frame);
  const cam = makeCamera3(frame, motion);
  const {pos, lookAt, up} = gentleOrbit(cameraAt3(frame), frame, motion);

  const beat =
    (seg.mode === 'vault-below' || seg.mode === 'vault-front') &&
    frame >= (seg.start + seg.end) / 2
      ? 1
      : 0;

  const wallIndex = wallIndex3(seg, frame);
  const dt = dislocateT(frame);
  const mandibleShift: Vec3 = scale3(DISLOCATE_SHIFT, dt);

  const bones: BoneState3[] = BONES.map((def) => {
    const position = boneOffset3(def.num, frame);
    const dim = dimAmount3(def.num, seg, frame);
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

  const points: PointState3[] = seg.points.map((p) => ({
    label: p.label,
    latin: p.latin,
    pos2D: project(cam, [p.x, p.y, p.z]),
    beat: p.beat ?? 0,
  }));

  // Fracture polyline: project each waypoint, draw progressively.
  let fracture2D: [number, number][] | null = null;
  let fractureProgress = 0;
  if (seg.mode === 'fracture' && seg.fracture) {
    fracture2D = seg.fracture
      .map((p) => project(cam, p))
      .filter((p): p is [number, number] => p !== null);
    fractureProgress = smooth(
      (frame - seg.start) / ((seg.end - seg.start) * 0.66),
    );
  }

  // Bruise ellipses (signs mode): project anchors, keep the authored radii.
  let bruise2D: [number, number, number, number][] = [];
  let bruiseOpacity = 0;
  if (seg.mode === 'signs' && seg.bruises) {
    bruise2D = seg.bruises
      .map((b) => {
        const p = project(cam, [b[0], b[1], b[2]]);
        return p ? [p[0], p[1], b[3], b[4]] as [number, number, number, number] : null;
      })
      .filter((b): b is [number, number, number, number] => b !== null);
    bruiseOpacity = smooth((frame - seg.start) / RAMP);
  }

  // CSF drip lines (csf-leak): project start/end, grow over the segment.
  let drip2D: [number, number, number, number][] = [];
  let dripProgress = 0;
  if (seg.id === 'csf-leak' && seg.drips) {
    drip2D = seg.drips
      .map((d) => {
        const a = project(cam, d[0]);
        const b = project(cam, d[1]);
        return a && b ? [a[0], a[1], b[0], b[1]] as [number, number, number, number] : null;
      })
      .filter((d): d is [number, number, number, number] => d !== null);
    dripProgress = smooth((frame - seg.start) / ((seg.end - seg.start) * 0.6));
  }

  return {
    segment: seg,
    camPos: pos,
    camTarget: lookAt,
    camUp: up,
    bones,
    points,
    beat,
    wallIndex,
    mandibleShift,
    fracture2D,
    fractureProgress,
    bruise2D,
    bruiseOpacity,
    drip2D,
    dripProgress,
  };
}

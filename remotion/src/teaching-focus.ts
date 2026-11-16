import type {BoneDef, Vec3} from './skullMath';

type FocusSegment = {id: string; start: number; end: number; bones: number[]; mode?: string; walls?: {bones: number[]}[]};
// These are teaching targets, not the bones lifted away to expose a structure.
const GROUPS: Record<number, Record<string, number[]>> = {
  1: {
    coronal:[1,2,3], sagittal:[2,3], lambdoid:[2,3,6], squamous:[2,3,4,5], pterion:[1,2,3,4,5,7],
    'cranial-base':[1,4,5,6,7,8], cribriform:[8], 'optic-canal':[7], sof:[7], 'sphenoid-trio':[7], iam:[4,5],
    'posterior-base':[4,5,6], 'facial-cluster':[9,10,16,17,18,19,20,21,22],
  },
  2: {
    'cn-front':[7,8], 'cn-middle':[4,5,6,7], 'cn-table':[4,5,6,7,8],
    'orbit-room':[1,7,8,11,12,13,14,16,17,18,19],
    tmj:[4,5,15], 'tmj-dislocation':[4,5,15], 'tmj-nerve':[15], 'csf-leak':[4,5,8],
  },
};
function focusAt(episode: number, timeline: FocusSegment[], frame: number) {
  const seg = timeline.find(s => s.start <= frame && frame < s.end) ?? timeline[timeline.length - 1];
  let start = seg.start;
  let bones: number[] | null = episode === 0 ? (seg.bones.length ? seg.bones : null) : GROUPS[episode]?.[seg.id] ?? null;
  if (episode === 2 && seg.mode === 'walls' && seg.walls) {
    const length = (seg.end - seg.start) / seg.walls.length;
    const index = Math.min(seg.walls.length - 1, Math.max(0, Math.floor((frame - seg.start) / length)));
    start += index * length; bones = seg.walls[index].bones;
  }
  if (episode === 2 && (seg.id === 'cn-back' || seg.id === 'orbit-apex')) {
    const mid = (seg.start + seg.end) / 2;
    const second = frame >= mid;
    if (second) start = mid;
    bones = seg.id === 'cn-back' ? (second ? [4,5,6] : [4,5]) : (second ? [1,7,11,12,13,14,18,19] : [7]);
  }
  return {start, bones};
}
/** Crossfade directly between focus sets: no rainbow flash at chapter edges. */
export function teachingColors(episode: number, timeline: FocusSegment[], frame: number): (bone: BoneDef) => Vec3 {
  const current = focusAt(episode, timeline, frame);
  const previous = focusAt(episode, timeline, current.start - 1);
  const u = Math.max(0, Math.min((frame - current.start) / 24, 1));
  const mix = u * u * (3 - 2 * u);
  const gray: Vec3 = [.10,.10,.10];
  return bone => {
    const from = previous.bones && !previous.bones.includes(bone.num) ? gray : bone.color;
    const to = current.bones && !current.bones.includes(bone.num) ? gray : bone.color;
    return [0,1,2].map(i => from[i] + (to[i] - from[i]) * mix) as Vec3;
  };
}

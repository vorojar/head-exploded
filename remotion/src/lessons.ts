import type { Caption } from "@remotion/captions";
import first from "./timeline.json";
import second from "./timeline2.json";
import third from "./timeline3.json";
import captionData from "./captions.json";

export type LessonCaption = Caption & { zh: string; segmentId: string };
export const WEB_PLAYER_BACKGROUND = "#3a3a3a";
export type SceneProps = { webPlayer?: boolean; compactLabels?: boolean; onSceneReady?:()=>void };
export type Point = { label: string; latin: string; beat?: number };
export type LessonSegment = {
  id: string;
  start: number;
  end: number;
  text: string;
  bones: number[];
  labels?: string[] | string;
  points?: Point[];
  mode?: string;
  walls?: { bones: number[]; label: string; latin: string }[];
};
export const BONE_NAMES = [
  ["Frontal bone", "额骨", "os frontale"],
  ["Parietal bone (L)", "左顶骨", "os parietale"],
  ["Parietal bone (R)", "右顶骨", "os parietale"],
  ["Temporal bone (L)", "左颞骨", "os temporale"],
  ["Temporal bone (R)", "右颞骨", "os temporale"],
  ["Occipital bone", "枕骨", "os occipitale"],
  ["Sphenoid bone", "蝶骨", "os sphenoidale"],
  ["Ethmoid bone", "筛骨", "os ethmoidale"],
  ["Nasal bone (L)", "左鼻骨", "os nasale"],
  ["Nasal bone (R)", "右鼻骨", "os nasale"],
  ["Maxilla (L)", "左上颌骨", "maxilla"],
  ["Maxilla (R)", "右上颌骨", "maxilla"],
  ["Zygomatic bone (L)", "左颧骨", "os zygomaticum"],
  ["Zygomatic bone (R)", "右颧骨", "os zygomaticum"],
  ["Mandible", "下颌骨", "mandibula"],
  ["Lacrimal bone (L)", "左泪骨", "os lacrimale"],
  ["Lacrimal bone (R)", "右泪骨", "os lacrimale"],
  ["Palatine bone (L)", "左腭骨", "os palatinum"],
  ["Palatine bone (R)", "右腭骨", "os palatinum"],
  ["Inferior nasal concha (L)", "左下鼻甲", "concha nasalis inferior"],
  ["Inferior nasal concha (R)", "右下鼻甲", "concha nasalis inferior"],
  ["Vomer", "犁骨", "vomer"],
] as const;
const titles: Record<string, string> = {
  intro: "导入",
  frontal: "额骨",
  parietal: "顶骨",
  temporal: "颞骨",
  occipital: "枕骨",
  sphenoid: "蝶骨",
  ethmoid: "筛骨",
  nasal: "鼻骨",
  lacrimal: "泪骨",
  maxilla: "上颌骨",
  zygomatic: "颧骨",
  palatine: "腭骨",
  concha: "下鼻甲",
  vomer: "犁骨",
  mandible: "下颌骨",
  allout: "22 块骨总览",
  back: "重新组合",
  end: "小结",
  coronal: "冠状缝",
  sagittal: "矢状缝",
  lambdoid: "人字缝",
  squamous: "鳞状缝",
  pterion: "翼点",
  "cranial-base": "颅底三窝",
  cribriform: "筛板",
  "optic-canal": "视神经管",
  sof: "眶上裂",
  "sphenoid-trio": "圆孔 · 卵圆孔 · 棘孔",
  iam: "内耳道",
  "posterior-base": "后颅底通道",
  "facial-cluster": "小面颅骨",
  recap: "本集回顾",
  "cn-front": "前方脑神经通道",
  "cn-middle": "中部通道与颈内动脉",
  "cn-back": "后方脑神经通道",
  "cn-table": "脑神经通道总表",
  "orbit-room": "眼眶内容物",
  "orbit-walls": "眼眶四壁",
  "orbit-apex": "眶尖与眶裂",
  tmj: "颞下颌关节",
  "tmj-dislocation": "下颌关节脱位",
  "tmj-nerve": "下牙槽神经与颏神经",
  "lefort-1": "Le Fort I 型",
  "lefort-2": "Le Fort II 型",
  "lefort-3": "Le Fort III 型",
  "battle-raccoon": "Battle 征与熊猫眼征",
  "csf-leak": "脑脊液漏",
};
export const chapterTitle = (s: LessonSegment) => titles[s.id] ?? s.id;
const pointNames: Record<string, string> = {
  "Coronal suture": "冠状缝",
  Bregma: "前囟点",
  "Sagittal suture": "矢状缝",
  Lambda: "人字点",
  "Lambdoid suture": "人字缝",
  "Squamous suture": "鳞状缝",
  Pterion: "翼点",
  "Cribriform plate": "筛板",
  "Optic canal": "视神经管",
  "Superior orbital fissure": "眶上裂",
  "Foramen rotundum": "圆孔",
  "Foramen ovale": "卵圆孔",
  "Foramen spinosum": "棘孔",
  "Internal acoustic meatus": "内耳道",
  "Foramen magnum": "枕骨大孔",
  "Jugular foramen": "颈静脉孔",
  "Hypoglossal canal": "舌下神经管",
  "Carotid canal": "颈动脉管",
  "Foramen lacerum": "破裂孔",
  "Stylomastoid foramen": "茎乳孔",
  Orbit: "眼眶",
  "Orbital apex": "眶尖",
  "Inferior orbital fissure": "眶下裂",
  "Mandibular foramen": "下颌孔",
  "Mental foramen": "颏孔",
};
export const lessons = [
  {
    id: "ep1",
    title: "22 块颅骨",
    description: "从整体到局部，认识脑颅骨与面颅骨。",
    total: first.total_frames,
    segments: first.timeline as LessonSegment[],
    load: () => import("./SkullVideo").then((m) => ({ default: m.SkullVideo })),
  },
  {
    id: "ep2",
    title: "颅缝与孔裂",
    description: "把骨性通道与穿行的神经、血管联系起来。",
    total: second.total_frames,
    segments: second.timeline as LessonSegment[],
    load: () =>
      import("./SkullVideo2").then((m) => ({ default: m.SkullVideo2 })),
  },
  {
    id: "ep3",
    title: "系统与临床",
    description: "脑神经、眼眶、下颌关节与典型损伤。",
    total: third.total,
    segments: third.segments as LessonSegment[],
    load: () =>
      import("./SkullVideo3").then((m) => ({ default: m.SkullVideo3 })),
  },
];
export const captions = captionData as Record<string, LessonCaption[]>;
export function segmentAt(episode: number, frame: number): LessonSegment {
  const lesson = lessons[episode];
  if (!lesson) throw new Error("Unknown episode");
  const segment =
    lesson.segments.find((s) => s.start <= frame && frame < s.end) ??
    lesson.segments.at(-1);
  if (!segment) throw new Error("Empty lesson");
  return segment;
}
export function captionAt(
  episode: number,
  frame: number,
): LessonCaption | undefined {
  const cues = captions[String(episode + 1)] ?? [];
  const ms = (frame * 1000) / 24;
  let low = 0,
    high = cues.length - 1;
  while (low <= high) {
    const mid = (low + high) >>> 1;
    const cue = cues[mid];
    if (!cue) break;
    if (ms < cue.startMs) high = mid - 1;
    else if (ms >= cue.endMs) low = mid + 1;
    else return cue;
  }
  return undefined;
}
export type Annotation = {
  number: number;
  name: string;
  zh: string;
  latin: string;
  bone?: number;
  point?: number;
};
export function annotationsAt(episode: number, frame: number): Annotation[] {
  const seg = segmentAt(episode, frame);
  if (episode === 0 || seg.mode === "facial") {
    const nums =
      seg.labels === "all" ? BONE_NAMES.map((_, i) => i + 1) : seg.bones;
    return nums.map((num, i) => {
      const b = BONE_NAMES[num - 1];
      if (!b) throw new Error("Unknown bone");
      return { number: i + 1, name: b[0], zh: b[1], latin: b[2], bone: num };
    });
  }
  if (seg.mode === "walls" && seg.walls) {
    const wall =
      seg.walls[
        Math.min(
          3,
          Math.floor(((frame - seg.start) / (seg.end - seg.start)) * 4),
        )
      ];
    return wall
      ? [
          {
            number: 1,
            name: wall.label,
            zh:
              ["眶顶", "眶底", "眶内侧壁", "眶外侧壁"][
                Math.min(
                  3,
                  Math.floor(((frame - seg.start) / (seg.end - seg.start)) * 4),
                )
              ] ?? "",
            latin: wall.latin,
            bone: wall.bones[0],
          },
        ]
      : [];
  }
  const beat =
    episode === 2 &&
    (seg.mode === "vault-below" || seg.mode === "vault-front") &&
    frame >= (seg.start + seg.end) / 2
      ? 1
      : 0;
  return (seg.points ?? [])
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => seg.id === "cn-table" || (p.beat ?? 0) === beat)
    .map(({ p, i }, j) => {
      const name = p.label.replace(/^\d+\s*[·.\-]?\s*/, "");
      return {
        number: j + 1,
        name,
        zh: pointNames[name] ?? name,
        latin: p.latin,
        point: i,
      };
    });
}
export function accuracyNote(episode: number, frame: number): string {
  const s = segmentAt(episode, frame);
  if (s.id.startsWith("lefort-"))
    return "骨折线为正面投影示意；完整路径还涉及翼突板，实际骨折可呈混合型。";
  if (s.mode === "signs")
    return "瘀斑为体征位置示意；体征需结合病史、检查和影像判断。";
  if ((s.points?.length ?? 0) > 0)
    return "圆点表示大致解剖区域。表面网格不能清晰显示所有孔道，尤其卵圆孔和棘孔。";
  return "模型用于认识骨性结构；不显示神经、血管、关节盘或其他软组织。";
}

/** Caption typography only; keep punctuation in the narration source. */
export function captionText(text: string): string {
  return text.replace(/['’]/gu, "").replace(/\p{P}+/gu, " ").replace(/\s+/gu, " ").trim();
}

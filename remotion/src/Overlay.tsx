import { useFixedLabels, EmbeddedCaption } from "./LearningOverlay";
import React, { useMemo } from "react";
import type { BoneState, FrameState, Segment } from "./skullMath";
import { H, W } from "./skullMath";

const INK = "#111418";
const BAND = "#1a1d24";
const RED = "#dc3c3c";
const GREY = "#787d87";

const NAMES_22 = [
  "Frontal bone",
  "Parietal bone (L)",
  "Parietal bone (R)",
  "Temporal bone (L)",
  "Temporal bone (R)",
  "Occipital bone",
  "Sphenoid bone",
  "Ethmoid bone",
  "Nasal bone (L)",
  "Nasal bone (R)",
  "Maxilla (L)",
  "Maxilla (R)",
  "Zygomatic bone (L)",
  "Zygomatic bone (R)",
  "Mandible",
  "Lacrimal bone (L)",
  "Lacrimal bone (R)",
  "Palatine bone (L)",
  "Palatine bone (R)",
  "Inferior nasal concha (L)",
  "Inferior nasal concha (R)",
  "Vomer",
];

/** Latin (Terminologia Anatomica) names, by bone number. */
const LATIN: Record<number, string> = {
  1: "os frontale",
  2: "os parietale",
  3: "os parietale",
  4: "os temporale",
  5: "os temporale",
  6: "os occipitale",
  7: "os sphenoidale",
  8: "os ethmoidale",
  9: "os nasale",
  10: "os nasale",
  11: "maxilla",
  12: "maxilla",
  13: "os zygomaticum",
  14: "os zygomaticum",
  15: "mandibula",
  16: "os lacrimale",
  17: "os lacrimale",
  18: "os palatinum",
  19: "os palatinum",
  20: "concha nasalis inferior",
  21: "concha nasalis inferior",
  22: "vomer",
};

type Placement = {
  bx: number;
  by: number;
  lx: number;
  ly: number;
  name: string;
  latin: string;
};

/** De-collision ported from the PIL overlay: 3 passes, push pills apart. */
function placePills(
  items: { bx: number; by: number; name: string; latin: string }[],
  bandTop: number,
): Placement[] {
  const estW = (name: string, latin: string) =>
    Math.max(name.length, latin.length) * 14 + 24;
  const placements: Placement[] = items.map(({ bx, by, name, latin }) => {
    // Push the pill away from screen centre; a bone framed dead-centre
    // (the new protagonist camera) has no direction, so push up-right.
    let dx = bx - W / 2;
    let dy = by - H / 2;
    if (Math.hypot(dx, dy) < 60) {
      dx = 60;
      dy = -60;
    }
    const norm = Math.max(Math.hypot(dx, dy), 1);
    const lx = Math.min(Math.max(bx + (dx / norm) * 95, 90), W - 90);
    const ly = Math.min(Math.max(by + (dy / norm) * 95, 40), bandTop - 40);
    return { bx, by, lx, ly, name, latin };
  });
  for (let pass = 0; pass < 3; pass++) {
    let moved = false;
    for (let i = 0; i < placements.length; i++) {
      for (let j = i + 1; j < placements.length; j++) {
        const a = placements[i];
        const b = placements[j];
        const wa = estW(a.name, a.latin);
        const wb = estW(b.name, b.latin);
        if (
          Math.abs(a.lx - b.lx) < (wa + wb) / 2 + 8 &&
          Math.abs(a.ly - b.ly) < 78
        ) {
          const overlap = (wa + wb) / 2 + 8 - Math.abs(a.lx - b.lx);
          const shift = overlap / 2 + 4;
          if (a.lx <= b.lx) {
            a.lx = Math.max(90, a.lx - shift);
            b.lx = Math.min(W - 90, b.lx + shift);
          } else {
            a.lx = Math.min(W - 90, a.lx + shift);
            b.lx = Math.max(90, b.lx - shift);
          }
          if (Math.abs(a.lx - b.lx) < (wa + wb) / 2 + 8) {
            a.ly = Math.min(Math.max(a.ly - 40, 40), bandTop - 40);
            b.ly = Math.min(Math.max(b.ly + 40, 40), bandTop - 40);
          }
          moved = true;
        }
      }
    }
    if (!moved) break;
  }
  return placements;
}

function FocusLabels({
  seg,
  bones,
  bandTop,
}: {
  seg: Segment;
  bones: BoneState[];
  bandTop: number;
}) {
  const movingPlacements = useMemo(() => {
    const items: { bx: number; by: number; name: string; latin: string }[] = [];
    const labels = seg.labels as string[];
    seg.bones.forEach((num, i) => {
      const b = bones.find((x) => x.def.num === num);
      if (b?.center2D)
        items.push({
          bx: b.center2D[0],
          by: b.center2D[1],
          name: labels[i],
          latin: LATIN[num] ?? "",
        });
    });
    return placePills(items, bandTop);
  }, [seg, bones, bandTop]);
  const placements = useFixedLabels(movingPlacements);
  return (
    <>
      <svg
        width={W}
        height={H}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {placements.map((p, i) => (
          <g key={i}>
            <line
              x1={p.bx}
              y1={p.by}
              x2={p.lx}
              y2={p.ly}
              stroke={`var(--annotation-leader, ${GREY})`}
              strokeWidth={2}
            />
            <circle cx={p.bx} cy={p.by} r={4} fill={RED} />
          </g>
        ))}
      </svg>
      {placements.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.lx,
            top: p.ly,
            transform: "translate(-50%, -50%)",
            background: "white",
            border: "2px solid #b4b9c0",
            borderRadius: 14,
            padding: "7px 12px",
            fontFamily: "DejaVu Sans, sans-serif",
            whiteSpace: "nowrap",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 700, color: INK }}>
            {p.name}
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 400,
              fontStyle: "italic",
              color: GREY,
            }}
          >
            {p.latin}
          </div>
        </div>
      ))}
    </>
  );
}

function measureText(entry: string): number {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return entry.length * 10;
  ctx.font = '700 18px "DejaVu Sans", sans-serif';
  return ctx.measureText(entry).width;
}

function AlloutLabels({
  bones,
  bandTop,
}: {
  bones: BoneState[];
  bandTop: number;
}) {
  const { dots: movingDots, trueDots } = useMemo(() => {
    const trueDots = new Map<number, [number, number]>();
    for (const b of bones) {
      if (b.center2D && b.center2D[1] < bandTop - 20) {
        trueDots.set(b.def.num, b.center2D);
      }
    }
    // The facial cluster (16-22) sits within a few pixels of each other,
    // so the number badges overlap. Push the badges apart until they are
    // >=30px apart; the true bone position keeps a small red dot.
    const pts: [number, [number, number]][] = [...trueDots.entries()].map(
      ([num, [x, y]]) => [num, [x, y]],
    );
    for (let iter = 0; iter < 8; iter++) {
      let moved = false;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const [xi, yi] = pts[i][1];
          const [xj, yj] = pts[j][1];
          const dx = xj - xi;
          const dy = yj - yi;
          const d = Math.hypot(dx, dy);
          if (d < 30 && d > 0.01) {
            const push = (30 - d) / 2 + 1;
            const ux = dx / d;
            const uy = dy / d;
            pts[i][1] = [xi - ux * push, yi - uy * push];
            pts[j][1] = [xj + ux * push, yj + uy * push];
            moved = true;
          }
        }
      }
      if (!moved) break;
    }
    const dots = new Map<number, [number, number]>();
    for (const [num, [x, y]] of pts) {
      dots.set(num, [
        Math.min(Math.max(x, 14), W - 14),
        Math.min(Math.max(y, 14), bandTop - 20),
      ]);
    }
    return { dots, trueDots };
  }, [bones, bandTop]);
  const dots = new Map(useFixedLabels([...movingDots].map(([num, [lx, ly]]) => ({num, lx, ly, labelKey:num}))).map(p => [p.num, [p.lx, p.ly] as [number, number]]));
  const lineH = 40;
  const yTop = 170;
  const entries: {
    num: number;
    x: number;
    y: number;
    anchor: [number, number];
    right: boolean;
  }[] = [];
  for (let col = 0; col < 2; col++) {
    const nums =
      col === 0
        ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        : [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
    nums.forEach((num, i) => {
      const entry = `${num}  ${NAMES_22[num - 1]}`;
      const y = yTop + i * lineH;
      const tw = measureText(entry);
      if (col === 0) {
        entries.push({
          num,
          x: 10,
          y,
          anchor: [10 + tw + 6, y + 9],
          right: false,
        });
      } else {
        entries.push({
          num,
          x: W - 10 - tw,
          y,
          anchor: [W - 10 - tw - 6, y + 9],
          right: true,
        });
      }
    });
  }
  return (
    <>
      <svg
        width={W}
        height={H}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {entries.map((e) => {
          const d = dots.get(e.num);
          if (!d) return null;
          return (
            <line
              key={e.num}
              x1={e.anchor[0]}
              y1={e.anchor[1]}
              x2={d[0]}
              y2={d[1]}
              stroke={`var(--annotation-leader, ${GREY})`}
              strokeWidth={1}
            />
          );
        })}
        {[...dots.entries()].map(([num, [x, y]]) => {
          const t = trueDots.get(num);
          if (!t || Math.hypot(t[0] - x, t[1] - y) < 8) return null;
          return (
            <g key={`t${num}`}>
              <line
                x1={x}
                y1={y}
                x2={t[0]}
                y2={t[1]}
                stroke={`var(--annotation-leader, ${GREY})`}
                strokeWidth={1}
              />
              <circle cx={t[0]} cy={t[1]} r={3} fill={RED} />
            </g>
          );
        })}
      </svg>
      {entries.map((e) => (
        <div
          key={e.num}
          style={{
            position: "absolute",
            left: e.x,
            top: e.y,
            fontFamily: "DejaVu Sans, sans-serif",
            whiteSpace: "nowrap",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, color: INK }}>
            {`${e.num}  ${NAMES_22[e.num - 1]}`}
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 400,
              fontStyle: "italic",
              color: GREY,
            }}
          >
            {LATIN[e.num]}
          </div>
        </div>
      ))}
      {[...dots.entries()].map(([num, [x, y]]) => (
        <div
          key={num}
          style={{
            position: "absolute",
            left: x,
            top: y,
            transform: "translate(-50%, -50%)",
            width: 24,
            height: 24,
            borderRadius: 12,
            background: "white",
            border: `2px solid ${INK}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            fontWeight: 700,
            color: INK,
            fontFamily: "DejaVu Sans, sans-serif",
          }}
        >
          {num}
        </div>
      ))}
    </>
  );
}

export function Overlay({
  frameState,
  embeddedCaptions = true,
  compactLabels = false,
}: {
  frameState: FrameState;
  embeddedCaptions?: boolean;
  compactLabels?: boolean;
}) {
  const { segment: seg, bones } = frameState;

  const bandTop = embeddedCaptions ? H - 116 : H - 36;
  const showLabels =
    seg.id !== "intro" && seg.id !== "back" && seg.id !== "end";
  return (
    <>
      {!compactLabels &&
        showLabels &&
        (seg.labels === "all" ? (
          <AlloutLabels bones={bones} bandTop={bandTop} />
        ) : (
          <FocusLabels seg={seg} bones={bones} bandTop={bandTop} />
        ))}
      {embeddedCaptions && <EmbeddedCaption episode={0} />}
    </>
  );
}

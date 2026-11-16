import { useFixedLabels, EmbeddedCaption } from "./LearningOverlay";
/** Overlay for Episode 2: subtitles + labels.
 * Two label kinds: custom 3D anchor points (sutures, foramina) and
 * bone-anchored pills (facial cluster). Same pill style as Episode 1
 * (English name + Latin second line), same subtitle band.
 */
import { useMemo } from "react";
import { H, W } from "./skullMath";
import type { FrameState2, Segment2 } from "./skullMath2";

const INK = "#11141a";
const GREY = "#6b7280";
const RED = "#e5484d";

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

/** De-collision ported from Episode 1: 3 passes, push pills apart. */
function placePills(
  items: { bx: number; by: number; name: string; latin: string }[],
  bandTop: number,
): Placement[] {
  const estW = (name: string, latin: string) =>
    Math.max(name.length, latin.length) * 14 + 24;
  const placements: Placement[] = items.map(({ bx, by, name, latin }) => {
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

function PillLayer({ placements: movingPlacements, illustrative=false }: { placements: Placement[]; illustrative?:boolean }) {
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
              strokeDasharray={illustrative?"10 7":undefined}
            />
            <circle cx={p.bx} cy={p.by} r={illustrative?6:4} fill={illustrative?"none":RED} stroke={illustrative?RED:undefined} strokeWidth={2}/>
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
          {p.latin ? (
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
          ) : null}
        </div>
      ))}
    </>
  );
}

function PointLabels({
  frameState,
  bandTop,
}: {
  frameState: FrameState2;
  bandTop: number;
}) {
  const placements = useMemo(() => {
    const items = frameState.points
      .filter((p) => p.pos2D)
      .map((p) => ({
        bx: (p.pos2D as [number, number])[0],
        by: (p.pos2D as [number, number])[1],
        name: p.label,
        latin: p.latin,
      }));
    return placePills(items, bandTop);
  }, [frameState, bandTop]);
  return <PillLayer placements={placements} illustrative/>;
}

function BoneLabels({
  frameState,
  bandTop,
}: {
  frameState: FrameState2;
  bandTop: number;
}) {
  const placements = useMemo(() => {
    const items: { bx: number; by: number; name: string; latin: string }[] = [];
    const labels = frameState.segment.labels as string[];
    frameState.segment.bones.forEach((num, i) => {
      const b = frameState.bones.find((x) => x.def.num === num);
      if (b?.center2D)
        items.push({
          bx: b.center2D[0],
          by: b.center2D[1],
          name: labels[i],
          latin: LATIN[num] ?? "",
        });
    });
    return placePills(items, bandTop);
  }, [frameState, bandTop]);
  return <PillLayer placements={placements} />;
}

export function Overlay2({
  frameState,
  embeddedCaptions = true,
  compactLabels = false,
}: {
  frameState: FrameState2;
  embeddedCaptions?: boolean;
  compactLabels?: boolean;
}) {
  const { segment: seg } = frameState;

  const bandTop = embeddedCaptions ? H - 116 : H - 36;
  const showPoints = seg.points.length > 0;
  const showBones = seg.mode === "facial";
  return (
    <>
      {!compactLabels && showPoints && (
        <PointLabels frameState={frameState} bandTop={bandTop} />
      )}
      {!compactLabels && showBones && (
        <BoneLabels frameState={frameState} bandTop={bandTop} />
      )}
      {embeddedCaptions && <EmbeddedCaption episode={1} />}
    </>
  );
}

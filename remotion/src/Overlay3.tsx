import { useFixedLabels, EmbeddedCaption } from "./LearningOverlay";
/** Overlay for Episode 3: subtitles + labels + fracture lines + sign overlays.
 * Point pills (with beat filtering for two-part segments), wall pill for the
 * orbit-walls segment, animated fracture polylines for the Le Fort segments,
 * soft bruise ellipses for Battle's sign / raccoon eyes, and drip lines for
 * the CSF leak. Subtitle band identical to Episodes 1–2.
 */
import { useMemo } from "react";
import { H, W } from "./skullMath";
import type { FrameState3 } from "./skullMath3";

const INK = "#11141a";
const GREY = "#6b7280";
const RED = "#e5484d";
const FRACTURE_RED = "#e5484d";

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

function PillLayer({ placements: movingPlacements }: { placements: Placement[] }) {
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
              stroke={GREY}
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
  frameState: FrameState3;
  bandTop: number;
}) {
  const placements = useMemo(() => {
    const items = frameState.points
      .filter((p) => p.pos2D && p.beat === frameState.beat)
      .map((p) => ({
        bx: (p.pos2D as [number, number])[0],
        by: (p.pos2D as [number, number])[1],
        name: p.label,
        latin: p.latin,
      }));
    return placePills(items, bandTop);
  }, [frameState, bandTop]);
  return <PillLayer placements={placements} />;
}

/** cn-table: ten numbered dots on the base + a side legend (Ep1 allout treatment). */
function CnTableLegend({ frameState }: { frameState: FrameState3 }) {
  const movingDots = useMemo(() => {
    const pts = frameState.points
      .filter((p) => p.pos2D)
      .map((p) => ({
        x: (p.pos2D as [number, number])[0],
        y: (p.pos2D as [number, number])[1],
        num: p.label.split(" ")[0],
        anchor:p.pos2D as [number, number],
      }));
    // Repel dots closer than 30px (Ep1 facial-cluster fix).
    for (let it = 0; it < 8; it++) {
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[j].x - pts[i].x;
          const dy = pts[j].y - pts[i].y;
          const d = Math.hypot(dx, dy);
          if (d < 30 && d > 0.01) {
            const push = (30 - d) / 2;
            const ux = dx / d;
            const uy = dy / d;
            pts[i].x -= ux * push;
            pts[i].y -= uy * push;
            pts[j].x += ux * push;
            pts[j].y += uy * push;
          }
        }
      }
    }
    return pts;
  }, [frameState]);
  const dots = useFixedLabels(movingDots.map(p => ({...p, lx:p.x, ly:p.y}))).map(p => ({...p, x:p.lx, y:p.ly}));
  const legend = frameState.points.map((p) => {
    const num = p.label.split(" ")[0];
    const name = p.label.slice(num.length + 2);
    return { num, name, latin: p.latin };
  });
  return (
    <>
      <svg
        width={W}
        height={H}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {dots.map((d, i) => (
          <g key={i}>
            <line x1={d.anchor[0]} y1={d.anchor[1]} x2={d.x} y2={d.y} stroke={GREY} strokeWidth={2}/>
            <circle cx={d.x} cy={d.y} r={11} fill={RED} />
            <text
              x={d.x}
              y={d.y + 4}
              textAnchor="middle"
              fontSize={13}
              fontWeight={700}
              fill="white"
              fontFamily="DejaVu Sans, sans-serif"
            >
              {d.num}
            </text>
          </g>
        ))}
      </svg>
      <div
        style={{
          position: "absolute",
          right: 24,
          top: 120,
          width: 330,
          fontFamily: "DejaVu Sans, sans-serif",
        }}
      >
        {legend.map((l, i) => (
          <div key={i} style={{ display: "flex", marginBottom: 4 }}>
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: RED,
                color: "white",
                fontSize: 13,
                fontWeight: 700,
                textAlign: "center",
                lineHeight: "22px",
                flexShrink: 0,
                marginRight: 8,
              }}
            >
              {l.num}
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: INK }}>
                {l.name}
              </div>
              <div style={{ fontSize: 14, fontStyle: "italic", color: GREY }}>
                {l.latin}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/** Orbit walls: one pill for the current wall, anchored at the centroid of its bones. */
function WallLabel({
  frameState,
  bandTop,
}: {
  frameState: FrameState3;
  bandTop: number;
}) {
  const placements = useMemo(() => {
    const seg = frameState.segment;
    if (seg.mode !== "walls" || !seg.walls || frameState.wallIndex < 0)
      return [];
    const wall = seg.walls[frameState.wallIndex];
    const centers = wall.bones
      .map((n) => frameState.bones.find((b) => b.def.num === n)?.center2D)
      .filter((c): c is [number, number] => !!c);
    if (centers.length === 0) return [];
    const bx = Math.round(
      centers.reduce((s, c) => s + c[0], 0) / centers.length,
    );
    const by = Math.round(
      centers.reduce((s, c) => s + c[1], 0) / centers.length,
    );
    return placePills(
      [{ bx, by, name: wall.label, latin: wall.latin }],
      bandTop,
    );
  }, [frameState, bandTop]);
  return <PillLayer placements={placements} />;
}

/** Le Fort fracture line: SVG polyline drawn progressively. */
function FractureLine({ frameState }: { frameState: FrameState3 }) {
  const pts = frameState.fracture2D;
  if (!pts || pts.length < 2) return null;
  const d = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`)
    .join(" ");
  const total = 1000;
  return (
    <svg width={W} height={H} style={{ position: "absolute", top: 0, left: 0 }}>
      <path
        d={d}
        fill="none"
        stroke={FRACTURE_RED}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={total}
        strokeDasharray={total}
        strokeDashoffset={total * (1 - frameState.fractureProgress)}
      />
    </svg>
  );
}

/** Bruise patches: soft blurred ellipses at the projected anchors. */
function Bruises({ frameState }: { frameState: FrameState3 }) {
  if (frameState.bruise2D.length === 0) return null;
  return (
    <svg width={W} height={H} style={{ position: "absolute", top: 0, left: 0 }}>
      <defs>
        <filter id="bruise-blur" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation={14} />
        </filter>
      </defs>
      {frameState.bruise2D.map((b, i) => (
        <ellipse
          key={i}
          cx={b[0]}
          cy={b[1]}
          rx={b[2]}
          ry={b[3]}
          fill="#5b2a86"
          opacity={0.45 * frameState.bruiseOpacity}
          filter="url(#bruise-blur)"
        />
      ))}
    </svg>
  );
}

/** CSF drip lines: thin lines growing from the leak site. */
function Drips({ frameState }: { frameState: FrameState3 }) {
  if (frameState.drip2D.length === 0) return null;
  return (
    <svg width={W} height={H} style={{ position: "absolute", top: 0, left: 0 }}>
      {frameState.drip2D.map((d, i) => {
        const x2 = d[0] + (d[2] - d[0]) * frameState.dripProgress;
        const y2 = d[1] + (d[3] - d[1]) * frameState.dripProgress;
        return (
          <g key={i}>
            <line
              x1={d[0]}
              y1={d[1]}
              x2={x2}
              y2={y2}
              stroke="#4a90d9"
              strokeWidth={4}
              strokeLinecap="round"
            />
            <circle cx={x2} cy={y2} r={5} fill="#4a90d9" />
          </g>
        );
      })}
    </svg>
  );
}

export function Overlay3({
  frameState,
  embeddedCaptions = true,
  compactLabels = false,
}: {
  frameState: FrameState3;
  embeddedCaptions?: boolean;
  compactLabels?: boolean;
}) {
  const { segment: seg } = frameState;

  const bandTop = embeddedCaptions ? H - 116 : H - 36;
  const isCnTable = seg.id === "cn-table";
  const showPoints = seg.points.length > 0 && !isCnTable;
  const showWalls = seg.mode === "walls";
  const showFracture = seg.mode === "fracture";
  const showBruises = seg.mode === "signs";
  const showDrips = seg.id === "csf-leak";
  return (
    <>
      {showBruises && <Bruises frameState={frameState} />}
      {showDrips && <Drips frameState={frameState} />}
      {showFracture && <FractureLine frameState={frameState} />}
      {!compactLabels && isCnTable && <CnTableLegend frameState={frameState} />}
      {!compactLabels && showPoints && (
        <PointLabels frameState={frameState} bandTop={bandTop} />
      )}
      {!compactLabels && showWalls && (
        <WallLabel frameState={frameState} bandTop={bandTop} />
      )}
      {embeddedCaptions && <EmbeddedCaption episode={2} />}
    </>
  );
}

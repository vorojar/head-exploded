import { useCurrentFrame } from "remotion";
import { annotationsAt, captionAt, captionText } from "./lessons";

export function EmbeddedCaption({ episode }: { episode: number }) {
  const frame = useCurrentFrame();
  const cue = captionAt(episode, frame);
  if (!cue) return null;
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: 1280,
        minHeight: 108,
        boxSizing: "border-box",
        padding: "12px 40px",
        background: "#11141a",
        color: "white",
        textAlign: "center",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ fontSize: 28, lineHeight: "38px" }}>{captionText(cue.zh)}</div>
      <div style={{ fontSize: 24, lineHeight: "32px", color: "#d8e0e9" }}>
        {captionText(cue.text)}
      </div>
    </div>
  );
}
export type MarkerState = {
  bones: { def: { num: number }; center2D: [number, number] | null }[];
  points?: { pos2D: [number, number] | null }[];
};
export function CompactMarkers({
  episode,
  frameState,
}: {
  episode: number;
  frameState: MarkerState;
}) {
  const frame = useCurrentFrame();
  const markers = annotationsAt(episode, frame)
    .map((a) => ({
      a,
      p:
        a.point !== undefined
          ? frameState.points?.[a.point]?.pos2D
          : frameState.bones.find((b) => b.def.num === a.bone)?.center2D,
    }))
    .filter((m) => m.p);
  // Preserve true anchors with leader lines while separating touch-sized numbers.
  const placed = markers.map(({ a, p }) => ({
    a,
    x: Math.max(40, Math.min(1240, p![0])),
    y: Math.max(40, Math.min(640, p![1])),
    anchor: p!,
  }));
  for (let pass = 0; pass < 10; pass++)
    for (let i = 0; i < placed.length; i++)
      for (let j = i + 1; j < placed.length; j++) {
        const a = placed[i],
          b = placed[j];
        if (!a || !b) continue;
        const dx = b.x - a.x,
          dy = b.y - a.y,
          d = Math.hypot(dx, dy);
        if (d < 76) {
          const ux = d > 0.1 ? dx / d : 1,
            uy = d > 0.1 ? dy / d : 0;
          const push = (76 - d) / 2;
          a.x = Math.max(40, Math.min(1240, a.x - ux * push));
          a.y = Math.max(40, Math.min(640, a.y - uy * push));
          b.x = Math.max(40, Math.min(1240, b.x + ux * push));
          b.y = Math.max(40, Math.min(640, b.y + uy * push));
        }
      }
  return (
    <svg
      width={1280}
      height={720}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      aria-hidden="true"
    >
      {placed.map(({ a, x, y, anchor }) => (
        <g key={a.number}>
          <line
            x1={anchor[0]}
            y1={anchor[1]}
            x2={x}
            y2={y}
            stroke="#156f68"
            strokeWidth={4}
          />
          <circle
            cx={x}
            cy={y}
            r={30}
            fill="#103e3a"
            stroke="white"
            strokeWidth={4}
          />
          <text
            x={x}
            y={y + 11}
            textAnchor="middle"
            fill="white"
            fontSize={32}
            fontWeight={700}
            fontFamily="sans-serif"
          >
            {a.number}
          </text>
        </g>
      ))}
    </svg>
  );
}

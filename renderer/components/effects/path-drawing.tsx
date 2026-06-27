import { motion } from "motion/react";
import { PenLine } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "duration", type: "slider", label: "Draw duration", min: 0.5, max: 4, step: 0.1, default: 1.5, unit: "s" },
  { id: "stagger", type: "slider", label: "Path stagger", min: 0.0, max: 0.5, step: 0.05, default: 0.2, unit: "s" },
  { id: "strokeWidth", type: "slider", label: "Stroke width", min: 1, max: 8, step: 0.5, default: 2.5, unit: "px" },
  { id: "color", type: "color", label: "Stroke color", default: "#6366f1" },
  {
    id: "easing",
    type: "segmented",
    label: "Easing",
    options: [
      { value: "easeInOut", label: "Ease" },
      { value: "linear", label: "Linear" },
    ],
    default: "easeInOut",
  },
] as const;

// Four paths: outer circle, inner circle arc, checkmark, decorative corner marks
const PATHS = [
  // Large outer circle
  "M 100 10 A 90 90 0 1 1 99.999 10",
  // Checkmark inside
  "M 55 100 L 85 130 L 145 68",
  // Small decorative arc (top-right)
  "M 148 30 A 25 25 0 0 1 170 52",
  // Small decorative arc (bottom-left)
  "M 52 170 A 25 25 0 0 1 30 148",
];

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const duration = Number(params.duration);
  const stagger = Number(params.stagger);
  const strokeWidth = Number(params.strokeWidth);
  const color = String(params.color);
  const easing = String(params.easing) as "easeInOut" | "linear";

  return (
    <div key={replayToken} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {PATHS.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              pathLength: { duration, delay: i * stagger, ease: easing },
              opacity: { duration: 0.01, delay: i * stagger },
            }}
          />
        ))}
      </svg>
    </div>
  );
}

export const pathDrawingEffect: Effect = {
  id: "path-drawing",
  name: "Path Drawing",
  description: "SVG paths animate as if being drawn in real time",
  category: "Experimental",
  icon: <PenLine size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import { motion } from "motion/react";

const PATHS = [
  "M 100 10 A 90 90 0 1 1 99.999 10",
  "M 55 100 L 85 130 L 145 68",
  "M 148 30 A 25 25 0 0 1 170 52",
  "M 52 170 A 25 25 0 0 1 30 148",
];

export function PathDrawing() {
  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {PATHS.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          stroke="${p.color}"
          strokeWidth={${n(p.strokeWidth)}}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: ${n(p.duration)}, delay: i * ${n(p.stagger)}, ease: "${p.easing}" },
            opacity: { duration: 0.01, delay: i * ${n(p.stagger)} },
          }}
        />
      ))}
    </svg>
  );
}`,
  },
};

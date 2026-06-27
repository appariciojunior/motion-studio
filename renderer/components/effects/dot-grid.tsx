import { motion } from "motion/react";
import { LayoutGrid } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "gap", type: "slider", label: "Spacing", min: 16, max: 48, step: 2, default: 28, unit: "px" },
  { id: "size", type: "slider", label: "Dot size", min: 2, max: 10, step: 1, default: 4, unit: "px" },
  { id: "duration", type: "slider", label: "Wave time", min: 1, max: 6, step: 0.5, default: 3, unit: "s" },
  { id: "color", type: "color", label: "Color", default: "#38bdf8" },
] as const;

const COLS = 11;
const ROWS = 7;

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const gap = Number(params.gap);
  const size = Number(params.size);
  const dur = Number(params.duration);
  return (
    <div
      key={replayToken}
      className="grid"
      style={{ gridTemplateColumns: `repeat(${COLS}, ${gap}px)`, gridTemplateRows: `repeat(${ROWS}, ${gap}px)` }}
    >
      {Array.from({ length: COLS * ROWS }).map((_, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const delay = (col + row) * 0.08;
        return (
          <div key={i} className="flex items-center justify-center">
            <motion.span
              className="rounded-full"
              style={{ width: size, height: size, background: String(params.color) }}
              animate={{ scale: [0.6, 1.6, 0.6], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay }}
            />
          </div>
        );
      })}
    </div>
  );
}

export const dotGridEffect: Effect = {
  id: "dot-grid",
  name: "Dot Grid Pulse",
  description: "A grid of dots pulsing in a diagonal wave.",
  category: "Backgrounds & ambient",
  icon: <LayoutGrid size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  supportsTexture: true,
  exports: {
    react: (p) => `import { motion } from "motion/react";

export function DotGrid({ cols = 12, rows = 8 }: { cols?: number; rows?: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: \`repeat(\${cols}, ${n(p.gap)}px)\`, gridTemplateRows: \`repeat(\${rows}, ${n(p.gap)}px)\` }}>
      {Array.from({ length: cols * rows }).map((_, i) => {
        const delay = ((i % cols) + Math.floor(i / cols)) * 0.08;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <motion.span
              style={{ width: ${n(p.size)}, height: ${n(p.size)}, borderRadius: "9999px", background: "${p.color}" }}
              animate={{ scale: [0.6, 1.6, 0.6], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: ${n(p.duration)}, repeat: Infinity, ease: "easeInOut", delay }}
            />
          </div>
        );
      })}
    </div>
  );
}`,
  },
};

import * as React from "react";
import { motion } from "motion/react";
import { LayoutGrid } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "cols", type: "slider", label: "Columns", min: 2, max: 5, step: 1, default: 3 },
  { id: "rows", type: "slider", label: "Rows", min: 2, max: 4, step: 1, default: 3 },
  { id: "stagger", type: "slider", label: "Stagger delay", min: 0.02, max: 0.2, step: 0.01, default: 0.08, unit: "s" },
  { id: "duration", type: "slider", label: "Duration", min: 0.2, max: 1, step: 0.05, default: 0.4, unit: "s" },
  {
    id: "direction",
    type: "select",
    label: "Enter from",
    options: [
      { value: "up", label: "Up" },
      { value: "down", label: "Down" },
      { value: "fade", label: "Fade only" },
    ],
    default: "up",
  },
  { id: "color", type: "color", label: "Color", default: "#6366f1" },
] as const;

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const cols = Math.round(Number(params.cols));
  const rows = Math.round(Number(params.rows));
  const stagger = Number(params.stagger);
  const duration = Number(params.duration);
  const direction = String(params.direction);
  const color = String(params.color);

  const totalItems = cols * rows;

  const initialY = direction === "up" ? 20 : direction === "down" ? -20 : 0;

  // Card size to fit neatly in 360×240 preview
  const gap = 8;
  const cardW = Math.floor((340 - gap * (cols - 1)) / cols);
  const cardH = Math.floor((220 - gap * (rows - 1)) / rows);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div
        key={replayToken}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, ${cardW}px)`,
          gridTemplateRows: `repeat(${rows}, ${cardH}px)`,
          gap,
        }}
      >
        {Array.from({ length: totalItems }).map((_, i) => {
          const row = Math.floor(i / cols);
          const rowOpacity = 0.6 + (row / (rows - 1 || 1)) * 0.4;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: initialY }}
              animate={{ opacity: rowOpacity, y: 0 }}
              transition={{ delay: i * stagger, duration }}
              style={{
                backgroundColor: color,
                borderRadius: 6,
                opacity: rowOpacity,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export const staggeredGridEffect: Effect = {
  id: "staggered-grid",
  name: "Staggered Grid",
  description: "Grid of cards that animate in sequentially with a stagger, like a portfolio loading in.",
  category: "Transitions & lists",
  icon: <LayoutGrid size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => {
      const cols = Math.round(Number(p.cols));
      const rows = Math.round(Number(p.rows));
      const stagger = n(p.stagger);
      const duration = n(p.duration);
      const direction = String(p.direction);
      const color = String(p.color);
      const initialY = direction === "up" ? 20 : direction === "down" ? -20 : 0;

      return `import { motion } from "motion/react";

export function StaggeredGrid({ items }: { items: React.ReactNode[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(${cols}, 1fr)",
        gap: 8,
      }}
    >
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: ${initialY} }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * ${stagger}, duration: ${duration} }}
          style={{ backgroundColor: "${color}", borderRadius: 6, padding: 16 }}
        >
          {item}
        </motion.div>
      ))}
    </div>
  );
}`;
    },
  },
};

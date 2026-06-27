import { motion } from "motion/react";
import { SplitSquareHorizontal } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "fontSize", type: "slider", label: "Font size", min: 18, max: 64, step: 1, default: 40, unit: "px" },
  { id: "duration", type: "slider", label: "Duration", min: 0.3, max: 2, step: 0.1, default: 0.6, unit: "s" },
  { id: "stagger", type: "slider", label: "Stagger", min: 0.02, max: 0.15, step: 0.01, default: 0.05, unit: "s" },
  { id: "color", type: "color", label: "Color", default: "#e8e8ee" },
  {
    id: "direction",
    type: "select",
    label: "Direction",
    options: [
      { value: "up", label: "Up" },
      { value: "down", label: "Down" },
      { value: "left", label: "Left" },
      { value: "right", label: "Right" },
    ],
    default: "up",
  },
] as const;

const TEXT = "SPLIT";

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const dir = String(params.direction);
  const offset = 40;
  const initial =
    dir === "up" ? { opacity: 0, y: offset } :
    dir === "down" ? { opacity: 0, y: -offset } :
    dir === "left" ? { opacity: 0, x: offset } :
    { opacity: 0, x: -offset };
  const animate = dir === "left" || dir === "right" ? { opacity: 1, x: 0 } : { opacity: 1, y: 0 };

  return (
    <div
      key={replayToken}
      style={{
        display: "flex",
        fontSize: Number(params.fontSize),
        fontWeight: 800,
        color: String(params.color),
        letterSpacing: "0.05em",
      }}
    >
      {TEXT.split("").map((ch, i) => (
        <motion.span
          key={i}
          style={{ display: "inline-block" }}
          initial={initial}
          animate={animate}
          transition={{
            duration: Number(params.duration),
            delay: i * Number(params.stagger),
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {ch}
        </motion.span>
      ))}
    </div>
  );
}

export const splitTextEffect: Effect = {
  id: "split-text",
  name: "Split Text",
  description: "Each letter animates in independently from a chosen direction with staggered timing.",
  category: "Text effects",
  icon: <SplitSquareHorizontal size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => {
      const dir = String(p.direction);
      const offset = 40;
      const initialX = dir === "left" ? offset : dir === "right" ? -offset : 0;
      const initialY = dir === "up" ? offset : dir === "down" ? -offset : 0;
      const animateX = dir === "left" || dir === "right" ? 0 : undefined;
      const animateY = dir === "up" || dir === "down" ? 0 : undefined;
      const animatePart = [
        animateX !== undefined ? `x: 0` : null,
        animateY !== undefined ? `y: 0` : null,
      ].filter(Boolean).join(", ");
      const initialPart = [
        initialX !== 0 ? `x: ${initialX}` : null,
        initialY !== 0 ? `y: ${initialY}` : null,
      ].filter(Boolean).join(", ");

      return `import { motion } from "motion/react";

export function SplitText({ text }: { text: string }) {
  return (
    <span style={{ display: "inline-flex", fontSize: ${n(p.fontSize)}, fontWeight: 800, color: "${p.color}" }}>
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          style={{ display: "inline-block" }}
          initial={{ opacity: 0, ${initialPart} }}
          animate={{ opacity: 1, ${animatePart} }}
          transition={{
            duration: ${n(p.duration)},
            delay: i * ${n(p.stagger)},
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {ch === " " ? "\\u00A0" : ch}
        </motion.span>
      ))}
    </span>
  );
}`;
    },
  },
};

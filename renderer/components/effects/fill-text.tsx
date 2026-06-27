import * as React from "react";
import { motion } from "motion/react";
import { PaintBucket } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "duration", type: "slider", label: "Duration", min: 0.5, max: 3, step: 0.1, default: 1.5, unit: "s" },
  { id: "color", type: "color", label: "Fill Color", default: "#6366f1" },
  { id: "fontSize", type: "slider", label: "Font Size", min: 18, max: 64, step: 1, default: 48, unit: "px" },
] as const;

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const duration = Number(params.duration);
  const color = String(params.color);
  const fontSize = Number(params.fontSize);

  return (
    <div key={replayToken} className="flex items-center justify-center w-full h-full">
      <div style={{ position: "relative", display: "inline-block" }}>
        {/* Outlined base layer */}
        <span
          style={{
            fontSize,
            fontWeight: 900,
            letterSpacing: "-0.02em",
            lineHeight: 1,
            WebkitTextStroke: `2px ${color}`,
            color: "transparent",
            userSelect: "none",
          }}
        >
          FILL
        </span>
        {/* Filled overlay that reveals left→right */}
        <motion.span
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            fontSize,
            fontWeight: 900,
            letterSpacing: "-0.02em",
            lineHeight: 1,
            color,
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          animate={{ clipPath: "inset(0 0% 0 0)" }}
          transition={{ duration, ease: [0.4, 0, 0.2, 1] }}
        >
          FILL
        </motion.span>
      </div>
    </div>
  );
}

export const fillTextEffect: Effect = {
  id: "fill-text",
  name: "Fill Text",
  description: "Text starts as an outline and progressively fills with color from left to right.",
  category: "Text effects",
  icon: <PaintBucket size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import { motion } from "motion/react";

export function FillText({ text = "FILL" }: { text?: string }) {
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <span
        style={{
          fontSize: ${n(p.fontSize)},
          fontWeight: 900,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          WebkitTextStroke: "2px ${p.color}",
          color: "transparent",
          userSelect: "none",
        }}
      >
        {text}
      </span>
      <motion.span
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          fontSize: ${n(p.fontSize)},
          fontWeight: 900,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          color: "${p.color}",
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
        initial={{ clipPath: "inset(0 100% 0 0)" }}
        animate={{ clipPath: "inset(0 0% 0 0)" }}
        transition={{ duration: ${n(p.duration)}, ease: [0.4, 0, 0.2, 1] }}
      >
        {text}
      </motion.span>
    </div>
  );
}`,
  },
};

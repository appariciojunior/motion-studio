import * as React from "react";
import { motion } from "motion/react";
import { Highlighter } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "duration", type: "slider", label: "Duration", min: 0.3, max: 2, step: 0.1, default: 0.8, unit: "s" },
  { id: "delay", type: "slider", label: "Delay", min: 0, max: 2, step: 0.1, default: 0.2, unit: "s" },
  { id: "color", type: "color", label: "Highlight Color", default: "#facc15" },
  { id: "textColor", type: "color", label: "Text Color", default: "#e8e8ee" },
  { id: "fontSize", type: "slider", label: "Font Size", min: 18, max: 64, step: 1, default: 40, unit: "px" },
] as const;

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const duration = Number(params.duration);
  const delay = Number(params.delay);
  const color = String(params.color);
  const textColor = String(params.textColor);
  const fontSize = Number(params.fontSize);

  return (
    <div key={replayToken} className="flex items-center justify-center w-full h-full">
      <div style={{ position: "relative", display: "inline-block" }}>
        {/* Highlight bar behind the text */}
        <motion.div
          style={{
            position: "absolute",
            bottom: "4px",
            left: "-4px",
            right: "-4px",
            height: "40%",
            backgroundColor: color,
            transformOrigin: "left",
            borderRadius: "2px",
            zIndex: 0,
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration, delay, ease: [0.4, 0, 0.2, 1] }}
        />
        {/* Text above the highlight */}
        <span
          style={{
            position: "relative",
            zIndex: 1,
            fontSize,
            fontWeight: 700,
            color: textColor,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          Highlight
        </span>
      </div>
    </div>
  );
}

export const highlightTextEffect: Effect = {
  id: "highlight-text",
  name: "Highlight Text",
  description: "An animated highlighter marker sweeps under the text from left to right.",
  category: "Text effects",
  icon: <Highlighter size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import { motion } from "motion/react";

export function HighlightText({
  text = "Highlight",
  children,
}: {
  text?: string;
  children?: React.ReactNode;
}) {
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <motion.div
        style={{
          position: "absolute",
          bottom: "4px",
          left: "-4px",
          right: "-4px",
          height: "40%",
          backgroundColor: "${p.color}",
          transformOrigin: "left",
          borderRadius: "2px",
          zIndex: 0,
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: ${n(p.duration)}, delay: ${n(p.delay)}, ease: [0.4, 0, 0.2, 1] }}
      />
      <span
        style={{
          position: "relative",
          zIndex: 1,
          fontSize: ${n(p.fontSize)},
          fontWeight: 700,
          color: "${p.textColor}",
        }}
      >
        {children ?? text}
      </span>
    </div>
  );
}`,
  },
};

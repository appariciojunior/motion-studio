import * as React from "react";
import { motion } from "motion/react";
import { Newspaper } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  {
    id: "text",
    type: "select",
    label: "Text",
    options: [
      { value: "Motion Studio • Design • Animate • Ship •", label: "Motion Studio" },
      { value: "New York • London • Tokyo • Paris • Berlin •", label: "Cities" },
      { value: "React • Motion • Tailwind • TypeScript •", label: "Tech Stack" },
    ],
    default: "Motion Studio • Design • Animate • Ship •",
  },
  { id: "speed", type: "slider", label: "Speed", min: 10, max: 100, step: 5, default: 40, unit: "px/s" },
  { id: "fontSize", type: "slider", label: "Font size", min: 12, max: 32, step: 1, default: 18, unit: "px" },
  { id: "color", type: "color", label: "Color", default: "#e8e8ee" },
  { id: "bgColor", type: "color", label: "Background", default: "#111116" },
] as const;

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const text = String(params.text);
  const speed = Number(params.speed);
  const fontSize = Number(params.fontSize);
  const color = String(params.color);
  const bgColor = String(params.bgColor);

  // Estimate text width: ~0.55 * fontSize per character is a rough approximation
  const charWidth = fontSize * 0.6;
  const textWidth = text.length * charWidth;
  const duration = textWidth / speed;

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div
        style={{
          width: 360,
          height: 60,
          overflow: "hidden",
          backgroundColor: bgColor,
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
        }}
      >
        <motion.div
          key={replayToken}
          style={{
            display: "flex",
            whiteSpace: "nowrap",
            willChange: "transform",
          }}
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {/* Two copies for seamless loop */}
          <span style={{ fontSize, color, paddingRight: 40, fontWeight: 500, letterSpacing: "0.01em" }}>
            {text}&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          <span style={{ fontSize, color, paddingRight: 40, fontWeight: 500, letterSpacing: "0.01em" }}>
            {text}&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
        </motion.div>
      </div>
    </div>
  );
}

export const tickerMarqueeEffect: Effect = {
  id: "ticker-marquee",
  name: "Ticker / Marquee",
  description: "Continuously scrolling horizontal text banner, like a news ticker.",
  category: "Transitions & lists",
  icon: <Newspaper size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => {
      const speed = n(p.speed);
      const fontSize = n(p.fontSize);
      const color = String(p.color);
      const bgColor = String(p.bgColor);
      return `import { motion } from "motion/react";

export function TickerMarquee({ text, speed = ${speed} }: { text: string; speed?: number }) {
  const charWidth = ${fontSize} * 0.6;
  const textWidth = text.length * charWidth;
  const duration = textWidth / speed;

  return (
    <div
      style={{
        overflow: "hidden",
        backgroundColor: "${bgColor}",
        display: "flex",
        alignItems: "center",
        height: 60,
      }}
    >
      <motion.div
        style={{ display: "flex", whiteSpace: "nowrap" }}
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        <span style={{ fontSize: ${fontSize}, color: "${color}", paddingRight: 40 }}>
          {text}{"    "}
        </span>
        <span style={{ fontSize: ${fontSize}, color: "${color}", paddingRight: 40 }}>
          {text}{"    "}
        </span>
      </motion.div>
    </div>
  );
}`;
    },
    css: () => `/* Ticker / Marquee — pure CSS */
.ticker-wrap {
  overflow: hidden;
  background: #111116;
  height: 60px;
  display: flex;
  align-items: center;
}

.ticker-track {
  display: flex;
  white-space: nowrap;
  animation: ticker-scroll 8s linear infinite;
}

.ticker-item {
  font-size: 18px;
  color: #e8e8ee;
  padding-right: 40px;
}

@keyframes ticker-scroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}`,
  },
};

import * as React from "react";
import { motion } from "motion/react";
import { Droplets } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "color", type: "color", label: "Liquid color", default: "#6366f1" },
  { id: "textColor", type: "color", label: "Text color", default: "#ffffff" },
  { id: "duration", type: "slider", label: "Duration", min: 0.2, max: 1.2, step: 0.05, default: 0.5, unit: "s" },
  { id: "stiffness", type: "slider", label: "Stiffness", min: 80, max: 400, step: 20, default: 180 },
] as const;

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const color = String(params.color);
  const textColor = String(params.textColor);
  const duration = Number(params.duration);
  const stiffness = Number(params.stiffness);

  return (
    <div
      key={replayToken}
      className="flex items-center justify-center"
      style={{ width: 320, height: 200 }}
    >
      <motion.div
        initial="idle"
        whileHover="hovered"
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 10,
          cursor: "pointer",
          border: `2px solid ${color}`,
          padding: "12px 32px",
          userSelect: "none",
        }}
      >
        {/* Liquid fill that slides in from the left */}
        <motion.div
          variants={{
            idle: { x: "-101%" },
            hovered: { x: "0%" },
          }}
          transition={{
            type: "spring",
            stiffness,
            damping: Math.round(stiffness * 0.12 + 10),
            duration,
          }}
          style={{
            position: "absolute",
            inset: 0,
            background: color,
            borderRadius: 8,
          }}
        />
        {/* Text always on top */}
        <motion.span
          variants={{
            idle: { color: color },
            hovered: { color: textColor },
          }}
          transition={{ duration: duration * 0.4 }}
          style={{
            position: "relative",
            zIndex: 1,
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          Hover me
        </motion.span>
      </motion.div>
    </div>
  );
}

export const liquidButtonEffect: Effect = {
  id: "liquid-button",
  name: "Liquid Button",
  description: "A fluid fill slides in from the left on hover, like liquid pouring into the button.",
  category: "Micro-interactions",
  icon: <Droplets size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => {
      const damping = Math.round(Number(p.stiffness) * 0.12 + 10);
      return `import { motion } from "motion/react";

export function LiquidButton({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="idle"
      whileHover="hovered"
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 10,
        cursor: "pointer",
        border: "2px solid ${p.color}",
        padding: "12px 32px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Liquid fill */}
      <motion.div
        variants={{
          idle: { x: "-101%" },
          hovered: { x: "0%" },
        }}
        transition={{
          type: "spring",
          stiffness: ${n(p.stiffness)},
          damping: ${damping},
        }}
        style={{
          position: "absolute",
          inset: 0,
          background: "${p.color}",
          borderRadius: 8,
        }}
      />
      {/* Text */}
      <motion.span
        variants={{
          idle: { color: "${p.color}" },
          hovered: { color: "${p.textColor}" },
        }}
        transition={{ duration: ${n(Number(p.duration) * 0.4)} }}
        style={{ position: "relative", zIndex: 1, fontWeight: 600 }}
      >
        {children}
      </motion.span>
    </motion.div>
  );
}`;
    },
  },
};

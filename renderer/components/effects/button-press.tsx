import { motion } from "motion/react";
import { MousePointerClick } from "lucide-react";
import { type Effect, type EffectParams, n, bezierCss } from "./types";

// Tactile press feedback. Emil Kowalski's tip: scale to ~0.97 on :active for a
// responsive, physical feel — never animate from a flat state at full speed.
const controls = [
  { id: "pressScale", type: "slider", label: "Press scale", min: 0.85, max: 1, step: 0.01, default: 0.97 },
  { id: "hoverScale", type: "slider", label: "Hover scale", min: 1, max: 1.1, step: 0.01, default: 1.02 },
  { id: "stiffness", type: "slider", label: "Spring stiffness", min: 200, max: 700, step: 10, default: 400 },
  { id: "damping", type: "slider", label: "Spring damping", min: 8, max: 30, step: 1, default: 17 },
  { id: "color", type: "color", label: "Color", default: "#6366f1" },
] as const;

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const press = Number(params.pressScale);
  const hover = Number(params.hoverScale);
  const stiffness = Number(params.stiffness);
  const damping = Number(params.damping);

  return (
    <div key={replayToken} className="flex items-center justify-center" style={{ width: 320, height: 200 }}>
      <motion.button
        whileHover={{ scale: hover }}
        whileTap={{ scale: press }}
        transition={{ type: "spring", stiffness, damping }}
        style={{ background: String(params.color) }}
        className="rounded-pill px-7 py-3 text-white text-strong shadow-lg select-none"
      >
        Press me
      </motion.button>
    </div>
  );
}

export const buttonPressEffect: Effect = {
  id: "button-press",
  name: "Button Press",
  description: "Tactile press feedback — scale down on tap, up on hover.",
  category: "Micro-interactions",
  icon: <MousePointerClick size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import { motion } from "motion/react";

export function PressButton({ children }: { children: React.ReactNode }) {
  return (
    <motion.button
      whileHover={{ scale: ${n(p.hoverScale)} }}
      whileTap={{ scale: ${n(p.pressScale)} }}
      transition={{ type: "spring", stiffness: ${n(p.stiffness)}, damping: ${n(p.damping)} }}
    >
      {children}
    </motion.button>
  );
}`,
    css: (p) => `/* Pure-CSS tactile press — no JS required. */
.press-button {
  transition: transform 0.12s ${bezierCss("0.34,1.56,0.64,1")};
}
.press-button:hover {
  transform: scale(${n(p.hoverScale)});
}
.press-button:active {
  transform: scale(${n(p.pressScale)});
}`,
  },
};

import { useState } from "react";
import { motion } from "motion/react";
import { Zap } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "stiffness", type: "slider", label: "Spring stiffness", min: 100, max: 500, step: 25, default: 260 },
  { id: "damping", type: "slider", label: "Damping", min: 10, max: 30, step: 2, default: 18 },
  { id: "mass", type: "slider", label: "Base mass", min: 0.5, max: 2, step: 0.1, default: 1 },
  { id: "stagger", type: "slider", label: "Char stagger", min: 0.02, max: 0.15, step: 0.01, default: 0.05, unit: "s" },
  { id: "color", type: "color", label: "Text color", default: "#f8f8f8" },
] as const;

const LINES = ["KINETIC", "MOTION"];
const CHARS = LINES.flatMap((line, li) => [
  ...line.split("").map((ch, ci) => ({ ch, li, ci, newline: false })),
  ...(li < LINES.length - 1 ? [{ ch: "\n", li, ci: line.length, newline: true }] : []),
]);
const TOTAL = CHARS.filter((c) => !c.newline).length;

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const stiffness = Number(params.stiffness);
  const damping = Number(params.damping);
  const mass = Number(params.mass);
  const stagger = Number(params.stagger);
  const color = String(params.color);

  const [settled, setSettled] = useState(false);
  const lastCharIndex = TOTAL - 1;
  let charIndex = -1;

  return (
    <div
      key={replayToken}
      style={{ color, fontWeight: 800, fontSize: 52, lineHeight: 1.1, textAlign: "center" }}
    >
      {CHARS.map((item, i) => {
        if (item.newline) return <br key={`br-${i}`} />;
        charIndex++;
        const ci = charIndex;
        const isLast = ci === lastCharIndex;
        return (
          <motion.span
            key={ci}
            className="inline-block"
            initial={{ y: -80, opacity: 0, rotate: -15 }}
            animate={
              settled
                ? { y: [0, -4, 0], opacity: 1, rotate: 0 }
                : { y: 0, opacity: 1, rotate: 0 }
            }
            transition={
              settled
                ? {
                    y: { repeat: Infinity, duration: 2 + ci * 0.1, ease: "easeInOut" },
                    opacity: { duration: 0 },
                    rotate: { duration: 0 },
                  }
                : {
                    type: "spring",
                    stiffness: stiffness + ci * 10,
                    damping,
                    mass: mass + ci * 0.05,
                    delay: ci * stagger,
                  }
            }
            onAnimationComplete={isLast && !settled ? () => setSettled(true) : undefined}
          >
            {item.ch}
          </motion.span>
        );
      })}
    </div>
  );
}

export const kineticTextEffect: Effect = {
  id: "kinetic-text",
  name: "Kinetic Text",
  description: "Words animate in with physics — each character has weight and bounces",
  category: "Text effects",
  icon: <Zap size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import { useState } from "react";
import { motion } from "motion/react";

const LINES = ["KINETIC", "MOTION"];
const CHARS = LINES.flatMap((line, li) => [
  ...line.split("").map((ch, ci) => ({ ch, li, ci, newline: false })),
  ...(li < LINES.length - 1 ? [{ ch: "\\n", li, ci: line.length, newline: true }] : []),
]);
const TOTAL = CHARS.filter((c) => !c.newline).length;

export function KineticText() {
  const [settled, setSettled] = useState(false);
  let charIndex = -1;
  return (
    <div style={{ fontWeight: 800, fontSize: 52, lineHeight: 1.1, textAlign: "center", color: "${n(p.color) || p.color}" }}>
      {CHARS.map((item, i) => {
        if (item.newline) return <br key={\`br-\${i}\`} />;
        charIndex++;
        const ci = charIndex;
        const isLast = ci === TOTAL - 1;
        return (
          <motion.span
            key={ci}
            style={{ display: "inline-block" }}
            initial={{ y: -80, opacity: 0, rotate: -15 }}
            animate={
              settled
                ? { y: [0, -4, 0], opacity: 1, rotate: 0 }
                : { y: 0, opacity: 1, rotate: 0 }
            }
            transition={
              settled
                ? {
                    y: { repeat: Infinity, duration: 2 + ci * 0.1, ease: "easeInOut" },
                    opacity: { duration: 0 },
                    rotate: { duration: 0 },
                  }
                : {
                    type: "spring",
                    stiffness: ${n(p.stiffness)} + ci * 10,
                    damping: ${n(p.damping)},
                    mass: ${n(p.mass)} + ci * 0.05,
                    delay: ci * ${n(p.stagger)},
                  }
            }
            onAnimationComplete={isLast && !settled ? () => setSettled(true) : undefined}
          >
            {item.ch}
          </motion.span>
        );
      })}
    </div>
  );
}`,
  },
};

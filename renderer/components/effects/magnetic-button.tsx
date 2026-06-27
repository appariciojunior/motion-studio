import * as React from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { Magnet } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "strength", type: "slider", label: "Pull strength", min: 0.1, max: 1, step: 0.05, default: 0.4, unit: "x" },
  { id: "radius", type: "slider", label: "Field radius", min: 40, max: 200, step: 5, default: 110, unit: "px" },
  { id: "stiffness", type: "slider", label: "Spring stiffness", min: 80, max: 500, step: 10, default: 200 },
  { id: "color", type: "color", label: "Color", default: "#6366f1" },
] as const;

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const strength = Number(params.strength);
  const radius = Number(params.radius);
  const stiffness = Number(params.stiffness);
  const x = useSpring(useMotionValue(0), { stiffness, damping: 15 });
  const y = useSpring(useMotionValue(0), { stiffness, damping: 15 });

  const handleMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist < radius) {
      x.set(dx * strength);
      y.set(dy * strength);
    }
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div key={replayToken} className="flex items-center justify-center" style={{ width: 320, height: 200 }}>
      <motion.button
        onPointerMove={handleMove}
        onPointerLeave={reset}
        style={{ x, y, background: String(params.color) }}
        className="rounded-pill px-7 py-3 text-white text-strong shadow-lg"
      >
        Magnetic
      </motion.button>
    </div>
  );
}

export const magneticButtonEffect: Effect = {
  id: "magnetic-button",
  name: "Magnetic Button",
  description: "A button that is pulled toward the cursor within a field.",
  category: "Micro-interactions",
  icon: <Magnet size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import * as React from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

export function MagneticButton({ children }: { children: React.ReactNode }) {
  const x = useSpring(useMotionValue(0), { stiffness: ${n(p.stiffness)}, damping: 15 });
  const y = useSpring(useMotionValue(0), { stiffness: ${n(p.stiffness)}, damping: 15 });
  return (
    <motion.button
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        if (Math.hypot(dx, dy) < ${n(p.radius)}) { x.set(dx * ${n(p.strength)}); y.set(dy * ${n(p.strength)}); }
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}
      style={{ x, y }}
    >
      {children}
    </motion.button>
  );
}`,
  },
};

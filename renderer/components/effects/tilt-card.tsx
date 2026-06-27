import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { MousePointer2 } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "maxTilt", type: "slider", label: "Max tilt", min: 4, max: 30, step: 1, default: 14, unit: "°" },
  { id: "scale", type: "slider", label: "Hover scale", min: 1, max: 1.2, step: 0.01, default: 1.05, unit: "x" },
  { id: "stiffness", type: "slider", label: "Spring stiffness", min: 80, max: 500, step: 10, default: 220 },
  { id: "glare", type: "switch", label: "Glare", default: true },
] as const;

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const maxTilt = Number(params.maxTilt);
  const stiffness = Number(params.stiffness);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [maxTilt, -maxTilt]), { stiffness, damping: 18 });
  const ry = useSpring(useTransform(mx, [0, 1], [-maxTilt, maxTilt]), { stiffness, damping: 18 });
  const glareX = useTransform(mx, [0, 1], ["0%", "100%"]);

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const reset = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <div key={replayToken} style={{ perspective: 900 }}>
      <motion.div
        onPointerMove={handleMove}
        onPointerLeave={reset}
        whileHover={{ scale: Number(params.scale) }}
        style={{
          rotateX: rx,
          rotateY: ry,
          transformStyle: "preserve-3d",
          width: 240,
          height: 300,
        }}
        className="relative rounded-panel overflow-hidden bg-control border border-separator shadow-lg flex items-end p-5 cursor-pointer"
      >
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, #6366f1, #ec4899)" }}
        />
        {params.glare === true && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(circle at center, rgba(255,255,255,0.5), transparent 60%)",
              backgroundPositionX: glareX,
              backgroundSize: "200% 200%",
            }}
          />
        )}
        <span className="relative text-strong text-white" style={{ fontSize: 18 }}>
          Tilt me
        </span>
      </motion.div>
    </div>
  );
}

export const tiltCardEffect: Effect = {
  id: "tilt-card",
  name: "Tilt Card",
  description: "A 3D card that tilts toward the pointer with spring physics.",
  category: "Micro-interactions",
  icon: <MousePointer2 size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

export function TiltCard({ children }: { children: React.ReactNode }) {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [${n(p.maxTilt)}, ${-n(p.maxTilt)}]), { stiffness: ${n(p.stiffness)}, damping: 18 });
  const ry = useSpring(useTransform(mx, [0, 1], [${-n(p.maxTilt)}, ${n(p.maxTilt)}]), { stiffness: ${n(p.stiffness)}, damping: 18 });
  return (
    <div style={{ perspective: 900 }}>
      <motion.div
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width);
          my.set((e.clientY - r.top) / r.height);
        }}
        onPointerLeave={() => { mx.set(0.5); my.set(0.5); }}
        whileHover={{ scale: ${n(p.scale)} }}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
      >
        {children}
      </motion.div>
    </div>
  );
}`,
  },
};

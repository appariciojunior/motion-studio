import * as React from "react";
import { motion } from "motion/react";
import { PartyPopper, CheckCircle } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const PALETTE = ["#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#a855f7", "#ec4899"];

const controls = [
  { id: "count", type: "slider", label: "Particles", min: 20, max: 140, step: 5, default: 70 },
  { id: "spread", type: "slider", label: "Spread", min: 60, max: 260, step: 10, default: 150, unit: "px" },
  { id: "size", type: "slider", label: "Particle size", min: 4, max: 16, step: 1, default: 9, unit: "px" },
  { id: "duration", type: "slider", label: "Duration", min: 0.6, max: 2.5, step: 0.1, default: 1.4, unit: "s" },
  { id: "gravity", type: "switch", label: "Gravity (fall)", default: true },
] as const;

interface Particle {
  id: number;
  x: number;
  y: number;
  rotate: number;
  color: string;
}

function makeParticles(count: number, spread: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = Math.random() * Math.PI * 2;
    const dist = spread * (0.4 + Math.random() * 0.6);
    return {
      id: i,
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      rotate: (Math.random() - 0.5) * 720,
      color: PALETTE[i % PALETTE.length],
    };
  });
}

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const count = Number(params.count);
  const spread = Number(params.spread);
  const size = Number(params.size);
  const gravity = Boolean(params.gravity);
  const duration = Number(params.duration);
  // Re-roll particle positions on each replay so the burst feels fresh.
  const particles = React.useMemo(
    () => makeParticles(count, spread),
    [count, spread, replayToken],
  );

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: spread * 2 + 64, height: spread * 2 + 64 }}
    >
      <motion.div
        key={`icon-${replayToken}`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.15, 1], opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-support-green"
      >
        <CheckCircle size={48} />
      </motion.div>
      <div className="absolute" style={{ left: "50%", top: "50%" }}>
        {particles.map((pt) => (
          <motion.span
            key={`${replayToken}-${pt.id}`}
            style={{
              position: "absolute",
              width: size,
              height: size,
              borderRadius: 2,
              background: pt.color,
            }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
            animate={{
              x: pt.x,
              y: gravity ? pt.y + spread * 0.6 : pt.y,
              scale: [0, 1, 1, 0.6],
              opacity: [1, 1, 1, 0],
              rotate: pt.rotate,
            }}
            transition={{ duration, ease: "easeOut" }}
          />
        ))}
      </div>
    </div>
  );
}

export const confettiEffect: Effect = {
  id: "confetti",
  name: "Confetti / Success Burst",
  description: "Particle explosion that celebrates a completed action.",
  category: "Loading & feedback",
  icon: <PartyPopper size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import * as React from "react";
import { motion } from "motion/react";

const PALETTE = ${JSON.stringify(PALETTE)};

function makeParticles(count, spread) {
  return Array.from({ length: count }, (_, i) => {
    const angle = Math.random() * Math.PI * 2;
    const dist = spread * (0.4 + Math.random() * 0.6);
    return {
      id: i,
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      rotate: (Math.random() - 0.5) * 720,
      color: PALETTE[i % PALETTE.length],
    };
  });
}

export function Confetti({ trigger }: { trigger: number }) {
  const particles = React.useMemo(() => makeParticles(${n(p.count)}, ${n(p.spread)}), [trigger]);
  return (
    <div style={{ position: "absolute", left: "50%", top: "50%" }}>
      {particles.map((pt) => (
        <motion.span
          key={\`\${trigger}-\${pt.id}\`}
          style={{ position: "absolute", width: ${n(p.size)}, height: ${n(p.size)}, borderRadius: 2, background: pt.color }}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
          animate={{
            x: pt.x,
            y: ${p.gravity ? `pt.y + ${n(Number(p.spread) * 0.6)}` : "pt.y"},
            scale: [0, 1, 1, 0.6],
            opacity: [1, 1, 1, 0],
            rotate: pt.rotate,
          }}
          transition={{ duration: ${n(p.duration)}, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}`,
    js: (p) => `import { animate } from "motion";

const PALETTE = ${JSON.stringify(PALETTE)};

// origin = a relatively/absolutely positioned element; the burst spawns at its center.
export function confettiBurst(origin) {
  const count = ${n(p.count)};
  const spread = ${n(p.spread)};
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = spread * (0.4 + Math.random() * 0.6);
    const piece = document.createElement("span");
    Object.assign(piece.style, {
      position: "absolute",
      left: "50%",
      top: "50%",
      width: "${n(p.size)}px",
      height: "${n(p.size)}px",
      borderRadius: "2px",
      background: PALETTE[i % PALETTE.length],
    });
    origin.appendChild(piece);
    animate(
      piece,
      {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist${p.gravity ? ` + ${n(Number(p.spread) * 0.6)}` : ""},
        scale: [0, 1, 1, 0.6],
        opacity: [1, 1, 1, 0],
        rotate: (Math.random() - 0.5) * 720,
      },
      { duration: ${n(p.duration)}, ease: "easeOut" },
    ).finished.then(() => piece.remove());
  }
}`,
  },
};

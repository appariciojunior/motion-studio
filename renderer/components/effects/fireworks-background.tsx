import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "burstCount", type: "slider", label: "Bursts on screen", min: 3, max: 12, step: 1, default: 6 },
  { id: "particleCount", type: "slider", label: "Particles per burst", min: 8, max: 24, step: 2, default: 14 },
  { id: "duration", type: "slider", label: "Burst duration", min: 0.5, max: 3, step: 0.1, default: 1.2, unit: "s" },
  { id: "bgColor", type: "color", label: "Background", default: "#0a0a0f" },
] as const;

const PALETTE = ["#f43f5e", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#6366f1", "#a855f7", "#ec4899"];

interface Burst {
  id: number;
  x: number;
  y: number;
  color: string;
}

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const burstCount = Number(params.burstCount);
  const particleCount = Number(params.particleCount);
  const duration = Number(params.duration);
  const bgColor = String(params.bgColor);

  const [bursts, setBursts] = React.useState<Burst[]>([]);
  const counterRef = React.useRef(0);
  const seedRef = React.useRef(0);

  React.useEffect(() => {
    setBursts([]);
    counterRef.current = 0;
    seedRef.current = 0;

    const spawnBurst = () => {
      const id = counterRef.current++;
      const seed = seedRef.current++;
      const x = (Math.sin(seed * 7.3) * 0.5 + 0.5) * 320 + 20;
      const y = (Math.cos(seed * 5.1) * 0.5 + 0.5) * 200 + 20;
      const color = PALETTE[seed % PALETTE.length];
      setBursts((prev) => {
        const next = [...prev, { id, x, y, color }];
        return next.slice(-burstCount);
      });
      setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== id));
      }, duration * 1000 + 200);
    };

    // spawn initial bursts staggered
    for (let i = 0; i < burstCount; i++) {
      setTimeout(spawnBurst, i * (duration * 1000) / burstCount);
    }

    const interval = setInterval(spawnBurst, (duration * 1000) / burstCount);
    return () => clearInterval(interval);
  }, [replayToken, burstCount, particleCount, duration]);

  const angles = Array.from({ length: particleCount }, (_, i) => (i / particleCount) * 360);

  return (
    <div
      key={replayToken}
      className="relative rounded-panel overflow-hidden"
      style={{ width: 360, height: 240, background: bgColor }}
    >
      <AnimatePresence>
        {bursts.map((burst) => (
          <React.Fragment key={burst.id}>
            {angles.map((angle, pi) => {
              const rad = (angle * Math.PI) / 180;
              const dist = 30 + (Math.sin(pi * 4.3 + burst.id) * 0.5 + 0.5) * 50;
              const tx = Math.cos(rad) * dist;
              const ty = Math.sin(rad) * dist;
              const size = 3 + (Math.sin(pi * 6.7) * 0.5 + 0.5) * 4;
              return (
                <motion.div
                  key={pi}
                  style={{
                    position: "absolute",
                    left: burst.x,
                    top: burst.y,
                    width: size,
                    height: size,
                    borderRadius: "50%",
                    background: burst.color,
                    translateX: "-50%",
                    translateY: "-50%",
                  }}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                  animate={{ x: tx, y: ty, scale: [0, 1, 0.5, 0], opacity: [0, 1, 1, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration, ease: "easeOut" }}
                />
              );
            })}
          </React.Fragment>
        ))}
      </AnimatePresence>
    </div>
  );
}

export const fireworksBackgroundEffect: Effect = {
  id: "fireworks-background",
  name: "Fireworks Background",
  description: "Colorful particle bursts that explode from random points like celebration fireworks.",
  category: "Backgrounds & ambient",
  icon: <Sparkles size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  supportsTexture: true,
  exports: {
    react: (p) => `import * as React from "react";
import { motion, AnimatePresence } from "motion/react";

const PALETTE = ["#f43f5e", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#6366f1", "#a855f7", "#ec4899"];

export function FireworksBackground() {
  const burstCount = ${n(p.burstCount)};
  const particleCount = ${n(p.particleCount)};
  const duration = ${n(p.duration)};
  const [bursts, setBursts] = React.useState([]);
  const counterRef = React.useRef(0);
  const seedRef = React.useRef(0);

  React.useEffect(() => {
    const spawnBurst = () => {
      const id = counterRef.current++;
      const seed = seedRef.current++;
      const x = (Math.sin(seed * 7.3) * 0.5 + 0.5) * 80 + 10;
      const y = (Math.cos(seed * 5.1) * 0.5 + 0.5) * 80 + 10;
      const color = PALETTE[seed % PALETTE.length];
      setBursts(prev => [...prev, { id, x, y, color }].slice(-burstCount));
      setTimeout(() => setBursts(prev => prev.filter(b => b.id !== id)), duration * 1000 + 200);
    };
    for (let i = 0; i < burstCount; i++) setTimeout(spawnBurst, i * (duration * 1000) / burstCount);
    const iv = setInterval(spawnBurst, (duration * 1000) / burstCount);
    return () => clearInterval(iv);
  }, []);

  const angles = Array.from({ length: particleCount }, (_, i) => (i / particleCount) * 360);

  return (
    <div style={{ position: "relative", overflow: "hidden", background: "${p.bgColor}", width: "100%", height: "100%" }}>
      <AnimatePresence>
        {bursts.map(burst => (
          <React.Fragment key={burst.id}>
            {angles.map((angle, pi) => {
              const rad = (angle * Math.PI) / 180;
              const dist = 30 + (Math.sin(pi * 4.3 + burst.id) * 0.5 + 0.5) * 50;
              const size = 3 + (Math.sin(pi * 6.7) * 0.5 + 0.5) * 4;
              return (
                <motion.div key={pi}
                  style={{ position: "absolute", left: \`\${burst.x}%\`, top: \`\${burst.y}%\`, width: size, height: size, borderRadius: "50%", background: burst.color, translateX: "-50%", translateY: "-50%" }}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                  animate={{ x: Math.cos(rad) * dist, y: Math.sin(rad) * dist, scale: [0, 1, 0.5, 0], opacity: [0, 1, 1, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration, ease: "easeOut" }}
                />
              );
            })}
          </React.Fragment>
        ))}
      </AnimatePresence>
    </div>
  );
}`,
  },
};

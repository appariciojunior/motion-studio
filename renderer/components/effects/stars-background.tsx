import { motion } from "motion/react";
import { Star } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "count", type: "slider", label: "Star count", min: 20, max: 120, step: 5, default: 60 },
  { id: "speed", type: "slider", label: "Twinkle speed", min: 0.5, max: 4, step: 0.1, default: 1.5, unit: "s" },
  { id: "color", type: "color", label: "Star color", default: "#ffffff" },
  { id: "bgColor", type: "color", label: "Background", default: "#0a0a0f" },
] as const;

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const count = Number(params.count);
  const speed = Number(params.speed);
  const color = String(params.color);
  const bgColor = String(params.bgColor);

  const stars = Array.from({ length: count }, (_, i) => {
    const left = (Math.sin(i * 7.3) * 0.5 + 0.5) * 100;
    const top = (Math.cos(i * 5.1) * 0.5 + 0.5) * 100;
    const size = 2 + (Math.sin(i * 3.7) * 0.5 + 0.5) * 2;
    const delay = (Math.sin(i * 11.13) * 0.5 + 0.5) * speed;
    const dur = speed + (Math.cos(i * 6.2) * 0.5 + 0.5) * speed;
    return { left, top, size, delay, dur };
  });

  return (
    <div
      key={replayToken}
      className="relative rounded-panel overflow-hidden"
      style={{ width: 360, height: 240, background: bgColor }}
    >
      {stars.map((s, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: color,
          }}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export const starsBackgroundEffect: Effect = {
  id: "stars-background",
  name: "Stars Background",
  description: "A field of twinkling stars that pulse at different speeds and sizes.",
  category: "Backgrounds & ambient",
  icon: <Star size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  supportsTexture: true,
  exports: {
    react: (p) => `import { motion } from "motion/react";

export function StarsBackground() {
  const count = ${n(p.count)};
  const stars = Array.from({ length: count }, (_, i) => ({
    left: (Math.sin(i * 7.3) * 0.5 + 0.5) * 100,
    top: (Math.cos(i * 5.1) * 0.5 + 0.5) * 100,
    size: 2 + (Math.sin(i * 3.7) * 0.5 + 0.5) * 2,
    delay: (Math.sin(i * 11.13) * 0.5 + 0.5) * ${n(p.speed)},
    dur: ${n(p.speed)} + (Math.cos(i * 6.2) * 0.5 + 0.5) * ${n(p.speed)},
  }));
  return (
    <div style={{ position: "relative", overflow: "hidden", background: "${p.bgColor}", width: "100%", height: "100%" }}>
      {stars.map((s, i) => (
        <motion.div
          key={i}
          style={{ position: "absolute", left: \`\${s.left}%\`, top: \`\${s.top}%\`, width: s.size, height: s.size, borderRadius: "50%", background: "${p.color}" }}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}`,
  },
};

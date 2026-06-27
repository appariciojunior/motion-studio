import { motion } from "motion/react";
import { Circle } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "count", type: "slider", label: "Bubble count", min: 5, max: 30, step: 1, default: 12 },
  { id: "speed", type: "slider", label: "Float speed", min: 2, max: 12, step: 0.5, default: 6, unit: "s" },
  { id: "color", type: "color", label: "Bubble color", default: "#6366f1" },
  { id: "opacity", type: "slider", label: "Opacity", min: 10, max: 80, step: 5, default: 30, unit: "%" },
  { id: "bgColor", type: "color", label: "Background", default: "#0a0a0f" },
] as const;

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const count = Number(params.count);
  const speed = Number(params.speed);
  const color = String(params.color);
  const opacity = Number(params.opacity) / 100;
  const bgColor = String(params.bgColor);

  const bubbles = Array.from({ length: count }, (_, i) => {
    const size = 20 + (Math.sin(i * 4.7) * 0.5 + 0.5) * 60;
    const left = (Math.sin(i * 7.3) * 0.5 + 0.5) * 90;
    const delay = (Math.cos(i * 5.9) * 0.5 + 0.5) * speed;
    const dur = speed + (Math.sin(i * 3.1) * 0.5 + 0.5) * speed * 0.5;
    const swayX = (Math.sin(i * 8.1) * 0.5 - 0.25) * 40;
    return { size, left, delay, dur, swayX };
  });

  return (
    <div
      key={replayToken}
      className="relative rounded-panel overflow-hidden"
      style={{ width: 360, height: 240, background: bgColor }}
    >
      {bubbles.map((b, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            left: `${b.left}%`,
            bottom: -b.size,
            width: b.size,
            height: b.size,
            borderRadius: "50%",
            background: color,
            opacity,
            border: `1.5px solid ${color}`,
          }}
          animate={{
            y: [0, -(240 + b.size)],
            x: [0, b.swayX, -b.swayX, 0],
          }}
          transition={{
            duration: b.dur,
            delay: b.delay,
            repeat: Infinity,
            ease: "easeInOut",
            x: { duration: b.dur * 0.5, repeat: Infinity, ease: "easeInOut" },
          }}
        />
      ))}
    </div>
  );
}

export const bubbleBackgroundEffect: Effect = {
  id: "bubble-background",
  name: "Bubble Background",
  description: "Soft translucent bubbles that float upward and gently sway.",
  category: "Backgrounds & ambient",
  icon: <Circle size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  supportsTexture: true,
  exports: {
    react: (p) => `import { motion } from "motion/react";

export function BubbleBackground() {
  const count = ${n(p.count)};
  const speed = ${n(p.speed)};
  const bubbles = Array.from({ length: count }, (_, i) => ({
    size: 20 + (Math.sin(i * 4.7) * 0.5 + 0.5) * 60,
    left: (Math.sin(i * 7.3) * 0.5 + 0.5) * 90,
    delay: (Math.cos(i * 5.9) * 0.5 + 0.5) * speed,
    dur: speed + (Math.sin(i * 3.1) * 0.5 + 0.5) * speed * 0.5,
    swayX: (Math.sin(i * 8.1) * 0.5 - 0.25) * 40,
  }));
  return (
    <div style={{ position: "relative", overflow: "hidden", background: "${p.bgColor}", width: "100%", height: "100%" }}>
      {bubbles.map((b, i) => (
        <motion.div
          key={i}
          style={{ position: "absolute", left: \`\${b.left}%\`, bottom: -b.size, width: b.size, height: b.size, borderRadius: "50%", background: "${p.color}", opacity: ${n(Number(p.opacity) / 100)}, border: "1.5px solid ${p.color}" }}
          animate={{ y: [0, -(240 + b.size)], x: [0, b.swayX, -b.swayX, 0] }}
          transition={{ duration: b.dur, delay: b.delay, repeat: Infinity, ease: "easeInOut", x: { duration: b.dur * 0.5, repeat: Infinity, ease: "easeInOut" } }}
        />
      ))}
    </div>
  );
}`,
  },
};

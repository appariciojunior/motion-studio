import { motion } from "motion/react";
import { Radio } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "rings", type: "slider", label: "Rings", min: 2, max: 5, step: 1, default: 3 },
  { id: "duration", type: "slider", label: "Duration", min: 1, max: 4, step: 0.1, default: 2, unit: "s" },
  { id: "size", type: "slider", label: "Max size", min: 60, max: 180, step: 5, default: 120, unit: "px" },
  { id: "thickness", type: "slider", label: "Ring width", min: 1, max: 6, step: 1, default: 2, unit: "px" },
  { id: "color", type: "color", label: "Color", default: "#38bdf8" },
] as const;

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const rings = Number(params.rings);
  const dur = Number(params.duration);
  const size = Number(params.size);
  return (
    <div key={replayToken} className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {Array.from({ length: rings }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{ width: size, height: size, border: `${Number(params.thickness)}px solid ${params.color}` }}
          animate={{ scale: [0, 1], opacity: [0.8, 0] }}
          transition={{ duration: dur, repeat: Infinity, ease: "easeOut", delay: (i * dur) / rings }}
        />
      ))}
      <span className="rounded-full" style={{ width: 12, height: 12, background: String(params.color) }} />
    </div>
  );
}

export const rippleLoaderEffect: Effect = {
  id: "ripple-loader",
  name: "Ripple Loader",
  description: "Concentric rings that expand and fade outward.",
  category: "Loading & feedback",
  icon: <Radio size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import { motion } from "motion/react";

export function RippleLoader() {
  const rings = ${n(p.rings)};
  const size = ${n(p.size)};
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: size, height: size }}>
      {Array.from({ length: rings }).map((_, i) => (
        <motion.span key={i}
          style={{ position: "absolute", width: size, height: size, borderRadius: "9999px", border: "${n(p.thickness)}px solid ${p.color}" }}
          animate={{ scale: [0, 1], opacity: [0.8, 0] }}
          transition={{ duration: ${n(p.duration)}, repeat: Infinity, ease: "easeOut", delay: (i * ${n(p.duration)}) / rings }} />
      ))}
    </div>
  );
}`,
    css: (p) => `.ripple-loader, .ripple-loader span {
  position: absolute;
  width: ${n(p.size)}px;
  height: ${n(p.size)}px;
  border: ${n(p.thickness)}px solid ${p.color};
  border-radius: 9999px;
  animation: ripple ${n(p.duration)}s ease-out infinite;
}

@keyframes ripple {
  from { transform: scale(0); opacity: 0.8; }
  to { transform: scale(1); opacity: 0; }
}`,
  },
};

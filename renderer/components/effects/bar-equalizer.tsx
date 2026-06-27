import { motion } from "motion/react";
import { AudioLines } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "bars", type: "slider", label: "Bars", min: 3, max: 24, step: 1, default: 9 },
  { id: "width", type: "slider", label: "Bar width", min: 4, max: 20, step: 1, default: 8, unit: "px" },
  { id: "gap", type: "slider", label: "Gap", min: 2, max: 16, step: 1, default: 6, unit: "px" },
  { id: "duration", type: "slider", label: "Speed", min: 0.3, max: 2, step: 0.1, default: 0.8, unit: "s" },
  { id: "color", type: "color", label: "Color", default: "#22c55e" },
] as const;

function rnd(seed: number) {
  const x = Math.sin(seed * 91.3) * 43758.5453;
  return x - Math.floor(x);
}

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const bars = Number(params.bars);
  const dur = Number(params.duration);
  return (
    <div key={replayToken} className="flex items-end" style={{ gap: Number(params.gap), height: 120 }}>
      {Array.from({ length: bars }).map((_, i) => {
        const lo = 20 + rnd(i + 1) * 20;
        const hi = 70 + rnd(i + 2) * 30;
        return (
          <motion.span
            key={i}
            className="rounded-pill"
            style={{ width: Number(params.width), background: String(params.color) }}
            animate={{ height: [`${lo}%`, `${hi}%`, `${lo}%`] }}
            transition={{ duration: dur * (0.7 + rnd(i + 3) * 0.6), repeat: Infinity, ease: "easeInOut" }}
          />
        );
      })}
    </div>
  );
}

export const barEqualizerEffect: Effect = {
  id: "bar-equalizer",
  name: "Audio Equalizer",
  description: "Bouncing bars like a music visualizer.",
  category: "Loading & feedback",
  icon: <AudioLines size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import { motion } from "motion/react";

function rnd(seed: number) {
  const x = Math.sin(seed * 91.3) * 43758.5453;
  return x - Math.floor(x);
}

export function AudioEqualizer({ bars = ${n(p.bars)} }: { bars?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: ${n(p.gap)}, height: 120 }}>
      {Array.from({ length: bars }).map((_, i) => {
        const lo = 20 + rnd(i + 1) * 20;
        const hi = 70 + rnd(i + 2) * 30;
        return (
          <motion.span key={i}
            style={{ width: ${n(p.width)}, borderRadius: "9999px", background: "${p.color}" }}
            animate={{ height: [lo + "%", hi + "%", lo + "%"] }}
            transition={{ duration: ${n(p.duration)} * (0.7 + rnd(i + 3) * 0.6), repeat: Infinity, ease: "easeInOut" }} />
        );
      })}
    </div>
  );
}`,
  },
};

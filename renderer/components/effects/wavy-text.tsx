import { motion } from "motion/react";
import { Waves } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "amplitude", type: "slider", label: "Wave height", min: 4, max: 40, step: 1, default: 14, unit: "px" },
  { id: "duration", type: "slider", label: "Duration", min: 0.6, max: 4, step: 0.1, default: 1.6, unit: "s" },
  { id: "stagger", type: "slider", label: "Char offset", min: 0.02, max: 0.2, step: 0.01, default: 0.06, unit: "s" },
  { id: "size", type: "slider", label: "Font size", min: 18, max: 64, step: 1, default: 40, unit: "px" },
  { id: "color", type: "color", label: "Color", default: "#e8e8ee" },
] as const;

const TEXT = "WAVY";

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const amp = Number(params.amplitude);
  return (
    <div key={replayToken} className="flex" style={{ fontSize: Number(params.size), fontWeight: 800, color: String(params.color) }}>
      {TEXT.split("").map((ch, i) => (
        <motion.span
          key={i}
          className="inline-block"
          animate={{ y: [0, -amp, 0, amp, 0] }}
          transition={{
            duration: Number(params.duration),
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * Number(params.stagger),
          }}
        >
          {ch}
        </motion.span>
      ))}
    </div>
  );
}

export const wavyTextEffect: Effect = {
  id: "wavy-text",
  name: "Wavy Text",
  description: "Letters ripple up and down in a travelling wave.",
  category: "Text effects",
  icon: <Waves size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import { motion } from "motion/react";

export function WavyText({ text }: { text: string }) {
  return (
    <span style={{ display: "inline-flex" }}>
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          style={{ display: "inline-block" }}
          animate={{ y: [0, ${-n(p.amplitude)}, 0, ${n(p.amplitude)}, 0] }}
          transition={{
            duration: ${n(p.duration)},
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * ${n(p.stagger)},
          }}
        >
          {ch === " " ? "\\u00A0" : ch}
        </motion.span>
      ))}
    </span>
  );
}`,
  },
};

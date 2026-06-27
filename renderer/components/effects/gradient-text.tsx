import { motion } from "motion/react";
import { Palette } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "duration", type: "slider", label: "Cycle time", min: 1, max: 8, step: 0.5, default: 4, unit: "s" },
  { id: "size", type: "slider", label: "Font size", min: 18, max: 72, step: 1, default: 44, unit: "px" },
  { id: "angle", type: "slider", label: "Angle", min: 0, max: 180, step: 5, default: 90, unit: "°" },
  { id: "c1", type: "color", label: "Color 1", default: "#ff6b6b" },
  { id: "c2", type: "color", label: "Color 2", default: "#4dabf7" },
  { id: "c3", type: "color", label: "Color 3", default: "#b197fc" },
] as const;

function gradient(p: EffectParams) {
  return `linear-gradient(${n(p.angle)}deg, ${p.c1}, ${p.c2}, ${p.c3}, ${p.c1})`;
}

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  return (
    <motion.span
      key={replayToken}
      style={{
        fontSize: Number(params.size),
        fontWeight: 800,
        backgroundImage: gradient(params),
        backgroundSize: "300% 100%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }}
      animate={{ backgroundPositionX: ["0%", "300%"] }}
      transition={{ duration: Number(params.duration), repeat: Infinity, ease: "linear" }}
    >
      Gradient Flow
    </motion.span>
  );
}

export const gradientTextEffect: Effect = {
  id: "gradient-text",
  name: "Gradient Text",
  description: "An animated multi-color gradient flowing through text.",
  category: "Text effects",
  icon: <Palette size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  supportsTexture: true,
  exports: {
    react: (p) => `import { motion } from "motion/react";

export function GradientText({ children }: { children: string }) {
  return (
    <motion.span
      style={{
        fontSize: ${n(p.size)},
        fontWeight: 800,
        backgroundImage: "${gradient(p)}",
        backgroundSize: "300% 100%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }}
      animate={{ backgroundPositionX: ["0%", "300%"] }}
      transition={{ duration: ${n(p.duration)}, repeat: Infinity, ease: "linear" }}
    >
      {children}
    </motion.span>
  );
}`,
    css: (p) => `.gradient-text {
  font-size: ${n(p.size)}px;
  font-weight: 800;
  background-image: ${gradient(p)};
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: gradient-text ${n(p.duration)}s linear infinite;
}

@keyframes gradient-text {
  from { background-position: 0% 0; }
  to { background-position: 300% 0; }
}`,
  },
};

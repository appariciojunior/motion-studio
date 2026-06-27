import { motion } from "motion/react";
import { Type } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "duration", type: "slider", label: "Duration", min: 0.6, max: 5, step: 0.1, default: 2, unit: "s" },
  { id: "size", type: "slider", label: "Font size", min: 18, max: 72, step: 1, default: 40, unit: "px" },
  { id: "band", type: "slider", label: "Highlight width", min: 10, max: 60, step: 1, default: 28, unit: "%" },
  { id: "base", type: "color", label: "Text color", default: "#5a5a64" },
  { id: "highlight", type: "color", label: "Shine color", default: "#ffffff" },
] as const;

function gradient(p: EffectParams) {
  const lo = 50 - Number(p.band) / 2;
  const hi = 50 + Number(p.band) / 2;
  return `linear-gradient(90deg, ${p.base} 0%, ${p.base} ${n(lo)}%, ${p.highlight} 50%, ${p.base} ${n(hi)}%, ${p.base} 100%)`;
}

function textStyle(p: EffectParams) {
  return {
    fontSize: Number(p.size),
    fontWeight: 700,
    lineHeight: 1.25,
    display: "inline-block" as const,
    paddingBlock: "0.1em",
    backgroundImage: gradient(p),
    backgroundSize: "200% 100%",
    WebkitBackgroundClip: "text" as const,
    backgroundClip: "text" as const,
    color: "transparent",
  };
}

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  return (
    <motion.span
      key={replayToken}
      style={textStyle(params)}
      animate={{ backgroundPositionX: ["150%", "-50%"] }}
      transition={{ duration: Number(params.duration), repeat: Infinity, ease: "linear" }}
    >
      Shimmer Text
    </motion.span>
  );
}

export const textShimmerEffect: Effect = {
  id: "text-shimmer",
  name: "Text Shimmer",
  description: "A light sweep that glides across text.",
  category: "Text effects",
  icon: <Type size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  supportsTexture: true,
  exports: {
    react: (p) => `import { motion } from "motion/react";

export function TextShimmer({ children }: { children: string }) {
  return (
    <motion.span
      style={{
        fontSize: ${n(p.size)},
        fontWeight: 700,
        lineHeight: 1.25,
        display: "inline-block",
        paddingBlock: "0.1em",
        backgroundImage: "${gradient(p)}",
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }}
      animate={{ backgroundPositionX: ["150%", "-50%"] }}
      transition={{ duration: ${n(p.duration)}, repeat: Infinity, ease: "linear" }}
    >
      {children}
    </motion.span>
  );
}`,
    css: (p) => `.text-shimmer {
  font-size: ${n(p.size)}px;
  font-weight: 700;
  line-height: 1.25;
  display: inline-block;
  padding-block: 0.1em;
  background-image: ${gradient(p)};
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: text-shimmer ${n(p.duration)}s linear infinite;
}

@keyframes text-shimmer {
  from { background-position: 150% 0; }
  to { background-position: -50% 0; }
}`,
  },
};

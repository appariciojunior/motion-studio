import type { CSSProperties } from "react";
import { motion } from "motion/react";
import { LoaderCircle } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "size", type: "slider", label: "Size", min: 16, max: 80, step: 2, default: 40, unit: "px" },
  { id: "thickness", type: "slider", label: "Thickness", min: 2, max: 10, step: 1, default: 4, unit: "px" },
  { id: "speed", type: "slider", label: "Speed", min: 0.4, max: 2, step: 0.1, default: 0.9, unit: "s" },
  { id: "color", type: "color", label: "Color", default: "#3b82f6" },
  { id: "track", type: "color", label: "Track", default: "#2b2b30" },
] as const;

function ringStyle(p: EffectParams): CSSProperties {
  const size = Number(p.size);
  return {
    width: size,
    height: size,
    borderRadius: "9999px",
    borderStyle: "solid",
    borderWidth: Number(p.thickness),
    borderColor: p.track as string,
    borderTopColor: p.color as string,
  };
}

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  return (
    <div key={replayToken} className="flex flex-col items-center gap-4">
      <motion.div
        style={ringStyle(params)}
        animate={{ rotate: 360 }}
        transition={{ duration: Number(params.speed), repeat: Infinity, ease: "linear" }}
      />
      <p className="text-small text-secondary">Loading…</p>
    </div>
  );
}

export const spinnerEffect: Effect = {
  id: "spinner",
  name: "Spinner",
  description: "Rotating ring loader with a colored arc.",
  category: "Loading & feedback",
  icon: <LoaderCircle size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import { motion } from "motion/react";

export function Spinner() {
  return (
    <motion.div
      style={{
        width: ${n(p.size)},
        height: ${n(p.size)},
        borderRadius: "9999px",
        borderStyle: "solid",
        borderWidth: ${n(p.thickness)},
        borderColor: "${p.track}",
        borderTopColor: "${p.color}",
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: ${n(p.speed)}, repeat: Infinity, ease: "linear" }}
    />
  );
}`,
    js: (p) => `import { animate } from "motion";

// Turn any element into a rotating ring loader.
export function spinner(el) {
  Object.assign(el.style, {
    width: "${n(p.size)}px",
    height: "${n(p.size)}px",
    borderRadius: "9999px",
    borderStyle: "solid",
    borderWidth: "${n(p.thickness)}px",
    borderColor: "${p.track}",
    borderTopColor: "${p.color}",
  });
  return animate(el, { rotate: 360 }, { duration: ${n(p.speed)}, ease: "linear", repeat: Infinity });
}`,
    css: (p) => `.spinner {
  width: ${n(p.size)}px;
  height: ${n(p.size)}px;
  border-radius: 9999px;
  border: ${n(p.thickness)}px solid ${p.track};
  border-top-color: ${p.color};
  animation: spinner ${n(p.speed)}s linear infinite;
}

@keyframes spinner {
  to { transform: rotate(360deg); }
}`,
  },
};

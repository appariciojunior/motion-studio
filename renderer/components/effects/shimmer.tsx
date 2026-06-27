import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "duration", type: "slider", label: "Duration", min: 0.4, max: 4, step: 0.1, default: 1.4, unit: "s" },
  { id: "angle", type: "slider", label: "Angle", min: 0, max: 180, step: 5, default: 100, unit: "°" },
  { id: "band", type: "slider", label: "Highlight width", min: 5, max: 60, step: 1, default: 24, unit: "%" },
  { id: "radius", type: "slider", label: "Corner radius", min: 0, max: 24, step: 1, default: 8, unit: "px" },
  { id: "base", type: "color", label: "Base color", default: "#2b2b30" },
  { id: "highlight", type: "color", label: "Highlight", default: "#4a4a52" },
] as const;

function gradient(p: EffectParams) {
  const lo = 50 - Number(p.band) / 2;
  const hi = 50 + Number(p.band) / 2;
  return `linear-gradient(${n(p.angle)}deg, ${p.base} 0%, ${p.highlight} ${n(lo)}%, ${p.highlight} ${n(hi)}%, ${p.base} 100%)`;
}

function Bar({ params, widthClass, height }: { params: EffectParams; widthClass: string; height: number }) {
  return (
    <div
      className={widthClass}
      style={{
        height,
        borderRadius: Number(params.radius),
        background: gradient(params),
        backgroundSize: "200% 100%",
        overflow: "hidden",
      }}
    >
      <motion.div
        className="h-full w-full"
        style={{ background: "inherit", backgroundSize: "200% 100%" }}
        animate={{ backgroundPositionX: ["200%", "-200%"] }}
        transition={{ duration: Number(params.duration), repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  return (
    <div key={replayToken} className="w-full max-w-md flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 9999,
            background: gradient(params),
            backgroundSize: "200% 100%",
            overflow: "hidden",
          }}
        >
          <motion.div
            className="h-full w-full"
            style={{ background: "inherit", backgroundSize: "200% 100%" }}
            animate={{ backgroundPositionX: ["200%", "-200%"] }}
            transition={{ duration: Number(params.duration), repeat: Infinity, ease: "linear" }}
          />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <Bar params={params} widthClass="w-2/3" height={14} />
          <Bar params={params} widthClass="w-1/2" height={12} />
        </div>
      </div>
      <Bar params={params} widthClass="w-full" height={120} />
      <Bar params={params} widthClass="w-full" height={14} />
      <Bar params={params} widthClass="w-5/6" height={14} />
    </div>
  );
}

export const shimmerEffect: Effect = {
  id: "shimmer",
  name: "Shimmer",
  description: "Animated gradient sweep for loading content.",
  category: "Loading & feedback",
  icon: <Sparkles size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import { motion } from "motion/react";

export function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={className}
      style={{
        borderRadius: ${n(p.radius)},
        background: "${gradient(p)}",
        backgroundSize: "200% 100%",
        overflow: "hidden",
      }}
    >
      <motion.div
        style={{ width: "100%", height: "100%", background: "inherit", backgroundSize: "200% 100%" }}
        animate={{ backgroundPositionX: ["200%", "-200%"] }}
        transition={{ duration: ${n(p.duration)}, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}`,
    js: (p) => `import { animate } from "motion";

// Apply a looping shimmer sweep to any block element.
export function shimmer(el) {
  Object.assign(el.style, {
    borderRadius: "${n(p.radius)}px",
    background: "${gradient(p)}",
    backgroundSize: "200% 100%",
    overflow: "hidden",
  });
  return animate(
    el,
    { backgroundPositionX: ["200%", "-200%"] },
    { duration: ${n(p.duration)}, ease: "linear", repeat: Infinity }
  );
}`,
    css: (p) => `.shimmer {
  border-radius: ${n(p.radius)}px;
  background: ${gradient(p)};
  background-size: 200% 100%;
  animation: shimmer ${n(p.duration)}s linear infinite;
}

@keyframes shimmer {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}`,
  },
};

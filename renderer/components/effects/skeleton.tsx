import { motion } from "motion/react";
import { LayoutTemplate } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  {
    id: "anim",
    type: "segmented",
    label: "Animation",
    default: "pulse",
    options: [
      { value: "pulse", label: "Pulse" },
      { value: "wave", label: "Wave" },
    ],
  },
  { id: "speed", type: "slider", label: "Speed", min: 0.6, max: 3, step: 0.1, default: 1.5, unit: "s" },
  { id: "lines", type: "slider", label: "Text lines", min: 1, max: 6, step: 1, default: 3 },
  { id: "radius", type: "slider", label: "Corner radius", min: 0, max: 16, step: 1, default: 6, unit: "px" },
  { id: "base", type: "color", label: "Base color", default: "#2b2b30" },
  { id: "highlight", type: "color", label: "Highlight", default: "#43434c" },
] as const;

function Block({ params, className, height }: { params: EffectParams; className?: string; height: number }) {
  const radius = Number(params.radius);
  if (params.anim === "wave") {
    return (
      <div
        className={className}
        style={{
          height,
          borderRadius: radius,
          background: `linear-gradient(90deg, ${params.base} 0%, ${params.highlight} 50%, ${params.base} 100%)`,
          backgroundSize: "200% 100%",
          overflow: "hidden",
        }}
      >
        <motion.div
          className="h-full w-full"
          style={{ background: "inherit", backgroundSize: "200% 100%" }}
          animate={{ backgroundPositionX: ["200%", "-200%"] }}
          transition={{ duration: Number(params.speed), repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }
  return (
    <motion.div
      className={className}
      style={{ height, borderRadius: radius, background: params.base as string }}
      animate={{ opacity: [1, 0.4, 1] }}
      transition={{ duration: Number(params.speed), repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const lineCount = Number(params.lines);
  return (
    <div key={replayToken} className="w-full max-w-md rounded-panel bg-control border border-separator p-5 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Block params={params} className="shrink-0" height={48} />
        <div className="flex-1 flex flex-col gap-2">
          <Block params={params} className="w-1/2" height={12} />
          <Block params={params} className="w-1/3" height={10} />
        </div>
      </div>
      <Block params={params} className="w-full" height={140} />
      <div className="flex flex-col gap-2">
        {Array.from({ length: lineCount }).map((_, i) => (
          <Block key={i} params={params} className={i === lineCount - 1 ? "w-2/3" : "w-full"} height={11} />
        ))}
      </div>
    </div>
  );
}

export const skeletonEffect: Effect = {
  id: "skeleton",
  name: "Skeleton",
  description: "Placeholder layout with pulse or wave loading.",
  category: "Loading & feedback",
  icon: <LayoutTemplate size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => {
      if (p.anim === "wave") {
        return `import { motion } from "motion/react";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={className}
      style={{
        borderRadius: ${n(p.radius)},
        background: "linear-gradient(90deg, ${p.base} 0%, ${p.highlight} 50%, ${p.base} 100%)",
        backgroundSize: "200% 100%",
        overflow: "hidden",
      }}
    >
      <motion.div
        style={{ width: "100%", height: "100%", background: "inherit", backgroundSize: "200% 100%" }}
        animate={{ backgroundPositionX: ["200%", "-200%"] }}
        transition={{ duration: ${n(p.speed)}, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}`;
      }
      return `import { motion } from "motion/react";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={className}
      style={{ borderRadius: ${n(p.radius)}, background: "${p.base}" }}
      animate={{ opacity: [1, 0.4, 1] }}
      transition={{ duration: ${n(p.speed)}, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}`;
    },
    js: (p) => {
      if (p.anim === "wave") {
        return `import { animate } from "motion";

// Apply a looping wave shimmer to any block element.
export function skeleton(el) {
  Object.assign(el.style, {
    borderRadius: "${n(p.radius)}px",
    background: "linear-gradient(90deg, ${p.base} 0%, ${p.highlight} 50%, ${p.base} 100%)",
    backgroundSize: "200% 100%",
    overflow: "hidden",
  });
  return animate(
    el,
    { backgroundPositionX: ["200%", "-200%"] },
    { duration: ${n(p.speed)}, ease: "linear", repeat: Infinity }
  );
}`;
      }
      return `import { animate } from "motion";

// Apply a looping pulse to any block element.
export function skeleton(el) {
  Object.assign(el.style, {
    borderRadius: "${n(p.radius)}px",
    background: "${p.base}",
  });
  return animate(
    el,
    { opacity: [1, 0.4, 1] },
    { duration: ${n(p.speed)}, ease: "easeInOut", repeat: Infinity }
  );
}`;
    },
    css: (p) =>
      p.anim === "wave"
        ? `.skeleton {
  border-radius: ${n(p.radius)}px;
  background: linear-gradient(90deg, ${p.base} 0%, ${p.highlight} 50%, ${p.base} 100%);
  background-size: 200% 100%;
  animation: skeleton-wave ${n(p.speed)}s linear infinite;
}

@keyframes skeleton-wave {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}`
        : `.skeleton {
  border-radius: ${n(p.radius)}px;
  background: ${p.base};
  animation: skeleton-pulse ${n(p.speed)}s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}`,
  },
};

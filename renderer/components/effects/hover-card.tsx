import { motion } from "motion/react";
import { MousePointerClick } from "lucide-react";
import { type Effect, type EffectParams, n, parseBezier, bezierArray } from "./types";

const controls = [
  { id: "lift", type: "slider", label: "Lift", min: 0, max: 24, step: 1, default: 8, unit: "px" },
  { id: "scale", type: "slider", label: "Scale", min: 1, max: 1.15, step: 0.01, default: 1.03 },
  { id: "tilt", type: "slider", label: "Tilt", min: 0, max: 12, step: 0.5, default: 0, unit: "°" },
  { id: "spring", type: "switch", label: "Spring physics", default: true },
  { id: "duration", type: "slider", label: "Duration", min: 0.1, max: 0.6, step: 0.05, default: 0.25, unit: "s", visibleWhen: (p: EffectParams) => p.spring !== true },
  { id: "curve", type: "bezier", label: "Easing curve", default: "0,0,0.58,1", visibleWhen: (p: EffectParams) => p.spring !== true },
] as const;

function hoverState(p: EffectParams) {
  return { y: -Number(p.lift), scale: Number(p.scale), rotate: Number(p.tilt) };
}

function transition(p: EffectParams) {
  return p.spring
    ? { type: "spring" as const, stiffness: 300, damping: 18 }
    : { duration: Number(p.duration), ease: parseBezier(p.curve) };
}

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  return (
    <div key={replayToken} className="flex flex-col items-center gap-4">
      <motion.div
        className="w-64 rounded-panel bg-elevated border border-separator p-5 shadow-lg cursor-pointer"
        whileHover={hoverState(params)}
        transition={transition(params)}
      >
        <div className="size-10 rounded-card bg-accent mb-3" />
        <p className="text-strong">Pricing plan</p>
        <p className="text-small text-secondary mt-1">Hover to see the card respond.</p>
      </motion.div>
      <p className="text-small text-secondary">Hover the card above</p>
    </div>
  );
}

export const hoverCardEffect: Effect = {
  id: "hover-card",
  name: "Hover Card",
  description: "A card that lifts and scales on pointer hover.",
  category: "Micro-interactions",
  icon: <MousePointerClick size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => {
      const hover = JSON.stringify(hoverState(p));
      const trans = p.spring
        ? `{ type: "spring", stiffness: 300, damping: 18 }`
        : `{ duration: ${n(p.duration)}, ease: ${bezierArray(p.curve)} }`;
      return `import { motion } from "motion/react";

export function HoverCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={${hover}}
      transition={${trans}}
      style={{ cursor: "pointer" }}
    >
      {children}
    </motion.div>
  );
}`;
    },
    js: (p) => {
      const trans = p.spring
        ? `{ type: "spring", stiffness: 300, damping: 18 }`
        : `{ duration: ${n(p.duration)}, ease: ${bezierArray(p.curve)} }`;
      return `import { animate } from "motion";

const TRANSITION = ${trans};

// el = the card element to make lift on hover.
export function hoverCard(el) {
  el.style.cursor = "pointer";
  el.addEventListener("mouseenter", () =>
    animate(el, { y: ${-n(p.lift)}, scale: ${n(p.scale)}, rotate: ${n(p.tilt)} }, TRANSITION)
  );
  el.addEventListener("mouseleave", () =>
    animate(el, { y: 0, scale: 1, rotate: 0 }, TRANSITION)
  );
}`;
    },
  },
};

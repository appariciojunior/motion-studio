import { motion } from "motion/react";
import { Gauge } from "lucide-react";
import {
  type Effect,
  type EffectParams,
  n,
  parseBezier,
  bezierArray,
  bezierCss,
} from "./types";

const controls = [
  { id: "size", type: "slider", label: "Size", min: 48, max: 180, step: 4, default: 104, unit: "px" },
  { id: "thickness", type: "slider", label: "Thickness", min: 4, max: 18, step: 1, default: 10, unit: "px" },
  { id: "progress", type: "slider", label: "Progress", min: 0, max: 100, step: 1, default: 72, unit: "%" },
  { id: "duration", type: "slider", label: "Duration", min: 0.4, max: 3, step: 0.1, default: 1.4, unit: "s" },
  { id: "color", type: "color", label: "Color", default: "#3b82f6" },
  { id: "track", type: "color", label: "Track", default: "#2b2b30" },
  { id: "label", type: "switch", label: "Show label", default: true },
  { id: "curve", type: "bezier", label: "Easing curve", default: "0.25,0.1,0.25,1" },
] as const;

function geometry(p: EffectParams) {
  const size = Number(p.size);
  const thickness = Number(p.thickness);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Number(p.progress);
  const offset = circumference * (1 - progress / 100);
  return { size, thickness, radius, circumference, progress, offset };
}

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const g = geometry(params);
  return (
    <div key={replayToken} style={{ position: "relative", width: g.size, height: g.size }}>
      <svg width={g.size} height={g.size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={g.size / 2}
          cy={g.size / 2}
          r={g.radius}
          fill="none"
          stroke={params.track as string}
          strokeWidth={g.thickness}
        />
        <motion.circle
          cx={g.size / 2}
          cy={g.size / 2}
          r={g.radius}
          fill="none"
          stroke={params.color as string}
          strokeWidth={g.thickness}
          strokeLinecap="round"
          strokeDasharray={g.circumference}
          initial={{ strokeDashoffset: g.circumference }}
          animate={{ strokeDashoffset: g.offset }}
          transition={{ duration: Number(params.duration), ease: parseBezier(params.curve) }}
        />
      </svg>
      {params.label ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-strong font-semibold tabular-nums" style={{ fontSize: g.size * 0.24 }}>
            {g.progress}%
          </span>
        </div>
      ) : null}
    </div>
  );
}

export const progressRingEffect: Effect = {
  id: "progress-ring",
  name: "Progress Ring",
  description: "Circular SVG ring that sweeps to a target value.",
  category: "Loading & feedback",
  icon: <Gauge size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => {
      const g = geometry(p);
      return `import { motion } from "motion/react";

const SIZE = ${n(g.size)};
const THICKNESS = ${n(g.thickness)};
const RADIUS = (SIZE - THICKNESS) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProgressRing({ value = ${n(g.progress)} }: { value?: number }) {
  const offset = CIRCUMFERENCE * (1 - value / 100);
  return (
    <div style={{ position: "relative", width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="${p.track}" strokeWidth={THICKNESS} />
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="${p.color}"
          strokeWidth={THICKNESS}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          initial={{ strokeDashoffset: CIRCUMFERENCE }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: ${n(p.duration)}, ease: ${bezierArray(p.curve)} }}
        />
      </svg>${
        p.label
          ? `
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{value}%</span>
      </div>`
          : ""
      }
    </div>
  );
}`;
    },
    js: (p) => {
      const g = geometry(p);
      return `import { animate } from "motion";

// circle = the foreground <circle> element of an SVG ring.
export function progressRing(circle, value = ${n(g.progress)}) {
  const radius = (${n(g.size)} - ${n(g.thickness)}) / 2;
  const circumference = 2 * Math.PI * radius;
  circle.style.strokeDasharray = String(circumference);
  return animate(
    circle,
    { strokeDashoffset: [circumference, circumference * (1 - value / 100)] },
    { duration: ${n(p.duration)}, ease: ${bezierArray(p.curve)} },
  );
}`;
    },
    css: (p) => {
      const g = geometry(p);
      return `/* <svg class="ring" width="${n(g.size)}" height="${n(g.size)}">
     <circle class="ring-track" .../>
     <circle class="ring-fill" .../>
   </svg> */
.ring {
  transform: rotate(-90deg);
}

.ring-track {
  fill: none;
  stroke: ${p.track};
  stroke-width: ${n(g.thickness)};
}

.ring-fill {
  fill: none;
  stroke: ${p.color};
  stroke-width: ${n(g.thickness)};
  stroke-linecap: round;
  stroke-dasharray: ${n(g.circumference)};
  animation: ring-fill ${n(p.duration)}s ${bezierCss(p.curve)} both;
}

@keyframes ring-fill {
  from { stroke-dashoffset: ${n(g.circumference)}; }
  to { stroke-dashoffset: ${n(g.offset)}; }
}`;
    },
  },
};

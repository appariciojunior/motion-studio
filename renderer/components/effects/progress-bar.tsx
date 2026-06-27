import type { CSSProperties } from "react";
import { motion } from "motion/react";
import { RectangleHorizontal } from "lucide-react";
import {
  type Effect,
  type EffectParams,
  n,
  parseBezier,
  bezierArray,
  bezierCss,
} from "./types";

const controls = [
  {
    id: "mode",
    type: "segmented",
    label: "Mode",
    options: [
      { value: "determinate", label: "Determinate" },
      { value: "indeterminate", label: "Indeterminate" },
    ],
    default: "determinate",
  },
  {
    id: "progress",
    type: "slider",
    label: "Progress",
    min: 0,
    max: 100,
    step: 1,
    default: 65,
    unit: "%",
    visibleWhen: (p: EffectParams) => p.mode === "determinate",
  },
  { id: "height", type: "slider", label: "Height", min: 4, max: 24, step: 1, default: 8, unit: "px" },
  { id: "duration", type: "slider", label: "Duration", min: 0.4, max: 3, step: 0.1, default: 1.2, unit: "s" },
  { id: "color", type: "color", label: "Color", default: "#3b82f6" },
  { id: "track", type: "color", label: "Track", default: "#2b2b30" },
  {
    id: "curve",
    type: "bezier",
    label: "Easing curve",
    default: "0.25,0.1,0.25,1",
    visibleWhen: (p: EffectParams) => p.mode === "determinate",
  },
] as const;

function trackStyle(p: EffectParams): CSSProperties {
  return {
    height: Number(p.height),
    background: p.track as string,
    borderRadius: 9999,
    overflow: "hidden",
    position: "relative",
  };
}

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const indeterminate = params.mode === "indeterminate";
  return (
    <div className="w-[360px] max-w-full">
      <div style={trackStyle(params)}>
        {indeterminate ? (
          <motion.div
            key={replayToken}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: "40%",
              background: params.color as string,
              borderRadius: 9999,
            }}
            animate={{ left: ["-40%", "100%"] }}
            transition={{ duration: Number(params.duration), repeat: Infinity, ease: "easeInOut" }}
          />
        ) : (
          <motion.div
            key={replayToken}
            style={{ height: "100%", background: params.color as string, borderRadius: 9999 }}
            initial={{ width: "0%" }}
            animate={{ width: `${Number(params.progress)}%` }}
            transition={{ duration: Number(params.duration), ease: parseBezier(params.curve) }}
          />
        )}
      </div>
    </div>
  );
}

export const progressBarEffect: Effect = {
  id: "progress-bar",
  name: "Progress Bar",
  description: "Horizontal bar with determinate or indeterminate fill.",
  category: "Loading & feedback",
  icon: <RectangleHorizontal size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) =>
      p.mode === "indeterminate"
        ? `import { motion } from "motion/react";

export function ProgressBar() {
  return (
    <div
      style={{
        height: ${n(p.height)},
        background: "${p.track}",
        borderRadius: 9999,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: "40%",
          background: "${p.color}",
          borderRadius: 9999,
        }}
        animate={{ left: ["-40%", "100%"] }}
        transition={{ duration: ${n(p.duration)}, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}`
        : `import { motion } from "motion/react";

export function ProgressBar({ value = ${n(p.progress)} }: { value?: number }) {
  return (
    <div
      style={{
        height: ${n(p.height)},
        background: "${p.track}",
        borderRadius: 9999,
        overflow: "hidden",
      }}
    >
      <motion.div
        style={{ height: "100%", background: "${p.color}", borderRadius: 9999 }}
        initial={{ width: "0%" }}
        animate={{ width: \`\${value}%\` }}
        transition={{ duration: ${n(p.duration)}, ease: ${bezierArray(p.curve)} }}
      />
    </div>
  );
}`,
    js: (p) =>
      p.mode === "indeterminate"
        ? `import { animate } from "motion";

// el = the fill element inside a relatively-positioned track.
export function progressBar(el) {
  Object.assign(el.style, {
    position: "absolute",
    top: "0",
    bottom: "0",
    width: "40%",
    background: "${p.color}",
    borderRadius: "9999px",
  });
  return animate(el, { left: ["-40%", "100%"] }, {
    duration: ${n(p.duration)},
    ease: "easeInOut",
    repeat: Infinity,
  });
}`
        : `import { animate } from "motion";

// el = the fill element inside the track.
export function progressBar(el, value = ${n(p.progress)}) {
  Object.assign(el.style, { height: "100%", background: "${p.color}", borderRadius: "9999px" });
  return animate(el, { width: ["0%", value + "%"] }, {
    duration: ${n(p.duration)},
    ease: ${bezierArray(p.curve)},
  });
}`,
    css: (p) =>
      p.mode === "indeterminate"
        ? `.progress-track {
  height: ${n(p.height)}px;
  background: ${p.track};
  border-radius: 9999px;
  overflow: hidden;
  position: relative;
}

.progress-bar {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 40%;
  background: ${p.color};
  border-radius: 9999px;
  animation: progress-slide ${n(p.duration)}s ease-in-out infinite;
}

@keyframes progress-slide {
  from { left: -40%; }
  to { left: 100%; }
}`
        : `.progress-track {
  height: ${n(p.height)}px;
  background: ${p.track};
  border-radius: 9999px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  width: ${n(p.progress)}%;
  background: ${p.color};
  border-radius: 9999px;
  transform-origin: left;
  animation: progress-fill ${n(p.duration)}s ${bezierCss(p.curve)} both;
}

@keyframes progress-fill {
  from { width: 0%; }
  to { width: ${n(p.progress)}%; }
}`,
  },
};

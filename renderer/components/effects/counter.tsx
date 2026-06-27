import * as React from "react";
import { animate, useMotionValue } from "motion/react";
import { Hash } from "lucide-react";
import { type Effect, type EffectParams, n, parseBezier, bezierArray } from "./types";

const controls = [
  { id: "target", type: "slider", label: "Target", min: 10, max: 10000, step: 10, default: 1280 },
  { id: "duration", type: "slider", label: "Duration", min: 0.3, max: 3, step: 0.1, default: 1.2, unit: "s" },
  { id: "decimals", type: "slider", label: "Decimals", min: 0, max: 2, step: 1, default: 0 },
  { id: "curve", type: "bezier", label: "Easing curve", default: "0,0,0.58,1" },
] as const;

function format(value: number, decimals: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const target = Number(params.target);
  const decimals = Number(params.decimals);
  const value = useMotionValue(0);
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    value.set(0);
    const playback = animate(value, target, {
      duration: Number(params.duration),
      ease: parseBezier(params.curve),
    });
    const unsubscribe = value.on("change", (v) => setDisplay(v));
    return () => {
      playback.stop();
      unsubscribe();
    };
  }, [replayToken, target, params.duration, params.curve, value]);

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-secondary text-small uppercase tracking-wide">Monthly active users</span>
      <span className="text-[64px] leading-none font-semibold tabular-nums text-strong">
        {format(display, decimals)}
      </span>
      <span className="text-small text-secondary">Hit Replay to count up again</span>
    </div>
  );
}

export const counterEffect: Effect = {
  id: "counter",
  name: "Number Counter",
  description: "Animated count-up for stats and metrics.",
  category: "Micro-interactions",
  icon: <Hash size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import * as React from "react";
import { animate, useMotionValue } from "motion/react";

export function Counter({ to = ${n(p.target)} }: { to?: number }) {
  const value = useMotionValue(0);
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    value.set(0);
    const playback = animate(value, to, {
      duration: ${n(p.duration)},
      ease: ${bezierArray(p.curve)},
    });
    const unsubscribe = value.on("change", (v) => setDisplay(v));
    return () => {
      playback.stop();
      unsubscribe();
    };
  }, [to, value]);

  return (
    <span>
      {display.toLocaleString(undefined, {
        minimumFractionDigits: ${n(p.decimals)},
        maximumFractionDigits: ${n(p.decimals)},
      })}
    </span>
  );
}`,
    js: (p) => `import { animate } from "motion";

// el = the element whose text will count up to \`to\`.
export function counter(el, to = ${n(p.target)}) {
  return animate(0, to, {
    duration: ${n(p.duration)},
    ease: ${bezierArray(p.curve)},
    onUpdate: (v) => {
      el.textContent = v.toLocaleString(undefined, {
        minimumFractionDigits: ${n(p.decimals)},
        maximumFractionDigits: ${n(p.decimals)},
      });
    },
  });
}`,
  },
};

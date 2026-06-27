import * as React from "react";
import { animate, useMotionValue } from "motion/react";
import { Hash } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "from", type: "slider", label: "From", min: 0, max: 1000, step: 1, default: 0 },
  { id: "to", type: "slider", label: "To", min: 1, max: 9999, step: 1, default: 2847 },
  { id: "duration", type: "slider", label: "Duration", min: 0.5, max: 4, step: 0.1, default: 2, unit: "s" },
  { id: "fontSize", type: "slider", label: "Font Size", min: 18, max: 80, step: 1, default: 56, unit: "px" },
  { id: "color", type: "color", label: "Color", default: "#e8e8ee" },
  {
    id: "prefix",
    type: "select",
    label: "Prefix",
    options: [
      { value: "", label: "None" },
      { value: "$", label: "$" },
      { value: "+", label: "+" },
    ],
    default: "",
  },
  {
    id: "suffix",
    type: "select",
    label: "Suffix",
    options: [
      { value: "", label: "None" },
      { value: "%", label: "%" },
      { value: "K", label: "K" },
    ],
    default: "",
  },
] as const;

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const from = Number(params.from);
  const to = Number(params.to);
  const duration = Number(params.duration);
  const fontSize = Number(params.fontSize);
  const color = String(params.color);
  const prefix = String(params.prefix);
  const suffix = String(params.suffix);

  const value = useMotionValue(from);
  const [display, setDisplay] = React.useState(from);

  React.useEffect(() => {
    value.set(from);
    setDisplay(from);
    const playback = animate(value, to, {
      duration,
      ease: [0.25, 0.1, 0.25, 1],
    });
    const unsubscribe = value.on("change", (v) => setDisplay(Math.round(v)));
    return () => {
      playback.stop();
      unsubscribe();
    };
  }, [replayToken, from, to, duration, value]);

  return (
    <div key={replayToken} className="flex flex-col items-center justify-center w-full h-full gap-2">
      <span
        style={{
          fontSize,
          fontWeight: 700,
          color,
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.03em",
        }}
      >
        {prefix}{display.toLocaleString()}{suffix}
      </span>
    </div>
  );
}

export const numberCounterEffect: Effect = {
  id: "number-counter",
  name: "Number Counter",
  description: "A number counts up from a start value to a target with smooth easing.",
  category: "Micro-interactions",
  icon: <Hash size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => {
      const prefix = String(p.prefix);
      const suffix = String(p.suffix);
      const displayExpr = prefix
        ? `"${prefix}" + display.toLocaleString()${suffix ? ` + "${suffix}"` : ""}`
        : `display.toLocaleString()${suffix ? ` + "${suffix}"` : ""}`;
      return `import * as React from "react";
import { animate, useMotionValue } from "motion/react";

export function NumberCounter({
  from = ${n(p.from)},
  to = ${n(p.to)},
  duration = ${n(p.duration)},
}: {
  from?: number;
  to?: number;
  duration?: number;
}) {
  const value = useMotionValue(from);
  const [display, setDisplay] = React.useState(from);

  React.useEffect(() => {
    value.set(from);
    setDisplay(from);
    const playback = animate(value, to, {
      duration,
      ease: [0.25, 0.1, 0.25, 1],
    });
    const unsubscribe = value.on("change", (v) => setDisplay(Math.round(v)));
    return () => {
      playback.stop();
      unsubscribe();
    };
  }, [from, to, duration, value]);

  return (
    <span style={{ fontVariantNumeric: "tabular-nums" }}>
      {${displayExpr}}
    </span>
  );
}`;
    },
  },
};

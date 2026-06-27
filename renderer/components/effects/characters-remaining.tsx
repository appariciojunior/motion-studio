import * as React from "react";
import { motion, useSpring, useTransform } from "motion/react";
import { TextCursorInput } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "maxLength", type: "slider", label: "Max characters", min: 20, max: 300, step: 10, default: 120 },
  { id: "warnAt", type: "slider", label: "Warn threshold", min: 5, max: 50, step: 5, default: 20, unit: "%" },
  { id: "stiffness", type: "slider", label: "Spring stiffness", min: 100, max: 600, step: 10, default: 300 },
  { id: "damping", type: "slider", label: "Spring damping", min: 5, max: 40, step: 1, default: 20 },
] as const;

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const maxLength = Number(params.maxLength);
  const warnAt = Number(params.warnAt);
  const stiffness = Number(params.stiffness);
  const damping = Number(params.damping);

  const [text, setText] = React.useState("");

  React.useEffect(() => {
    if (replayToken > 0) setText("");
  }, [replayToken]);

  const remaining = maxLength - text.length;
  const fraction = text.length / maxLength;
  const warnFraction = 1 - warnAt / 100;

  // Animated progress value
  const progress = useSpring(fraction, { stiffness, damping });
  React.useEffect(() => {
    progress.set(fraction);
  }, [fraction, progress]);

  // Color interpolation: green → yellow → red
  const ringColor = useTransform(progress, [0, warnFraction, 1], ["#22c55e", "#f59e0b", "#ef4444"]);
  const countColor = useTransform(progress, [0, warnFraction, 1], ["#6b7280", "#f59e0b", "#ef4444"]);

  const circumference = 2 * Math.PI * 16;
  const dashOffset = useTransform(progress, (v) => circumference * (1 - v));

  // Shake animation when at/over limit
  const isAtLimit = text.length >= maxLength;
  const shakeX = useSpring(0, { stiffness: 800, damping: 10 });
  const prevAtLimit = React.useRef(false);

  React.useEffect(() => {
    if (isAtLimit && !prevAtLimit.current) {
      shakeX.set(6);
      setTimeout(() => shakeX.set(-6), 80);
      setTimeout(() => shakeX.set(3), 160);
      setTimeout(() => shakeX.set(0), 240);
    }
    prevAtLimit.current = isAtLimit;
  }, [isAtLimit, shakeX]);

  return (
    <div key={replayToken} className="flex flex-col gap-3" style={{ width: 320 }}>
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, maxLength))}
          placeholder="Start typing…"
          className="w-full rounded-control border border-separator bg-control text-regular p-3 resize-none outline-none focus:ring-2 focus:ring-blue-500"
          style={{ height: 120 }}
        />
      </div>
      <div className="flex items-center justify-end gap-2">
        <motion.span
          style={{ x: shakeX, color: countColor }}
          className="text-small font-mono tabular-nums"
        >
          {remaining}
        </motion.span>
        {/* Circular progress ring */}
        <motion.svg
          width={38}
          height={38}
          style={{ x: shakeX }}
        >
          {/* Background track */}
          <circle
            cx={19}
            cy={19}
            r={16}
            fill="none"
            stroke="var(--color-separator)"
            strokeWidth={3}
          />
          {/* Animated progress arc */}
          <motion.circle
            cx={19}
            cy={19}
            r={16}
            fill="none"
            stroke={ringColor}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ rotate: -90, transformOrigin: "19px 19px" }}
          />
        </motion.svg>
      </div>
      {isAtLimit && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-small"
          style={{ color: "#ef4444" }}
        >
          Character limit reached
        </motion.p>
      )}
    </div>
  );
}

export const charactersRemainingEffect: Effect = {
  id: "characters-remaining",
  name: "Characters Remaining",
  description: "Textarea counter — ring and count shift toward red as you near the limit.",
  category: "Forms & inputs" as unknown as Effect["category"],
  icon: <TextCursorInput size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import * as React from "react";
import { motion, useSpring, useTransform } from "motion/react";

const MAX = ${n(p.maxLength)};
const WARN_FRACTION = ${n(1 - Number(p.warnAt) / 100)};
const SPRING = { stiffness: ${n(p.stiffness)}, damping: ${n(p.damping)} };
const CIRCUMFERENCE = 2 * Math.PI * 16;

export function CharactersRemaining() {
  const [text, setText] = React.useState("");
  const fraction = text.length / MAX;
  const progress = useSpring(fraction, SPRING);
  React.useEffect(() => { progress.set(fraction); }, [fraction, progress]);
  const ringColor = useTransform(progress, [0, WARN_FRACTION, 1], ["#22c55e", "#f59e0b", "#ef4444"]);
  const dashOffset = useTransform(progress, (v) => CIRCUMFERENCE * (1 - v));

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, MAX))}
        placeholder="Start typing…"
      />
      <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
        <span>{MAX - text.length}</span>
        <svg width={38} height={38}>
          <circle cx={19} cy={19} r={16} fill="none" stroke="#e5e7eb" strokeWidth={3} />
          <motion.circle cx={19} cy={19} r={16} fill="none" stroke={ringColor}
            strokeWidth={3} strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE} strokeDashoffset={dashOffset}
            style={{ rotate: -90, transformOrigin: "19px 19px" }} />
        </svg>
      </div>
    </div>
  );
}`,
  },
};

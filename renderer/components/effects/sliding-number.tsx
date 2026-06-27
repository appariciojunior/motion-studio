import * as React from "react";
import { motion, animate } from "motion/react";
import { SlidersHorizontal } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "targetValue", type: "slider", label: "Target Value", min: 0, max: 9999, step: 1, default: 1337 },
  { id: "duration", type: "slider", label: "Duration", min: 0.3, max: 2, step: 0.1, default: 0.6, unit: "s" },
  { id: "digitSize", type: "slider", label: "Digit Size", min: 16, max: 64, step: 1, default: 48, unit: "px" },
  { id: "color", type: "color", label: "Color", default: "#e8e8ee" },
] as const;

function DigitColumn({
  digit,
  digitSize,
  duration,
  color,
  replayToken,
}: {
  digit: number;
  digitSize: number;
  duration: number;
  color: string;
  replayToken: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Start from top (0) and animate to the target digit position
    const startY = 0;
    const targetY = -digit * digitSize;
    el.style.transform = `translateY(${startY}px)`;
    const playback = animate(startY, targetY, {
      duration,
      ease: [0.4, 0, 0.2, 1],
      onUpdate: (v) => {
        el.style.transform = `translateY(${v}px)`;
      },
    });
    return () => playback.stop();
  }, [digit, digitSize, duration, replayToken]);

  return (
    <div
      style={{
        height: digitSize,
        overflow: "hidden",
        display: "inline-block",
        lineHeight: `${digitSize}px`,
      }}
    >
      <div ref={ref} style={{ display: "flex", flexDirection: "column" }}>
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            style={{
              height: digitSize,
              lineHeight: `${digitSize}px`,
              fontSize: digitSize,
              fontWeight: 700,
              color,
              fontVariantNumeric: "tabular-nums",
              fontFamily: "monospace",
            }}
          >
            {i}
          </div>
        ))}
      </div>
    </div>
  );
}

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const targetValue = Math.round(Number(params.targetValue));
  const duration = Number(params.duration);
  const digitSize = Number(params.digitSize);
  const color = String(params.color);

  const digits = String(targetValue).split("").map(Number);

  return (
    <div key={replayToken} className="flex items-center justify-center w-full h-full">
      <div style={{ display: "flex", alignItems: "center" }}>
        {digits.map((digit, i) => (
          <DigitColumn
            key={i}
            digit={digit}
            digitSize={digitSize}
            duration={duration + i * 0.05}
            color={color}
            replayToken={replayToken}
          />
        ))}
      </div>
    </div>
  );
}

export const slidingNumberEffect: Effect = {
  id: "sliding-number",
  name: "Sliding Number",
  description: "Digits slide up like an odometer when the value changes.",
  category: "Micro-interactions",
  icon: <SlidersHorizontal size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import * as React from "react";
import { animate } from "motion/react";

function DigitColumn({ digit, digitSize = ${n(p.digitSize)}, duration = ${n(p.duration)}, color = "${p.color}" }: {
  digit: number;
  digitSize?: number;
  duration?: number;
  color?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targetY = -digit * digitSize;
    el.style.transform = "translateY(0px)";
    const playback = animate(0, targetY, {
      duration,
      ease: [0.4, 0, 0.2, 1],
      onUpdate: (v) => { el.style.transform = \`translateY(\${v}px)\`; },
    });
    return () => playback.stop();
  }, [digit, digitSize, duration]);

  return (
    <div style={{ height: digitSize, overflow: "hidden", display: "inline-block", lineHeight: \`\${digitSize}px\` }}>
      <div ref={ref} style={{ display: "flex", flexDirection: "column" }}>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} style={{ height: digitSize, lineHeight: \`\${digitSize}px\`, fontSize: digitSize, fontWeight: 700, color, fontFamily: "monospace" }}>
            {i}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SlidingNumber({ value = ${Math.round(n(p.targetValue))} }: { value?: number }) {
  const digits = String(Math.round(value)).split("").map(Number);
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {digits.map((digit, i) => (
        <DigitColumn key={i} digit={digit} />
      ))}
    </div>
  );
}`,
  },
};

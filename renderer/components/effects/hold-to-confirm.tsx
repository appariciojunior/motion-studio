import { useState, useRef, useCallback } from "react";
import { Timer } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "duration", type: "slider", label: "Hold duration", min: 0.5, max: 3, step: 0.1, default: 1.5, unit: "s" },
  { id: "size", type: "slider", label: "Button size", min: 60, max: 120, step: 4, default: 80, unit: "px" },
  { id: "color", type: "color", label: "Danger color", default: "#ef4444" },
  { id: "confirmColor", type: "color", label: "Confirm color", default: "#22c55e" },
  { id: "strokeWidth", type: "slider", label: "Ring width", min: 2, max: 8, step: 1, default: 4, unit: "px" },
] as const;

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const duration = Number(params.duration) * 1000; // ms
  const size = Number(params.size);
  const color = String(params.color);
  const confirmColor = String(params.confirmColor);
  const strokeWidth = Number(params.strokeWidth);

  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const confirmedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const radius = size / 2 + strokeWidth + 4;
  const svgSize = radius * 2 + strokeWidth;
  const circumference = 2 * Math.PI * radius;

  const reset = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    startTimeRef.current = null;
    setProgress(0);
    setHolding(false);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (confirmed) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setHolding(true);
    startTimeRef.current = performance.now();

    const tick = (now: number) => {
      if (startTimeRef.current === null) return;
      const elapsed = now - startTimeRef.current;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        setHolding(false);
        setConfirmed(true);
        confirmedTimerRef.current = setTimeout(() => {
          setConfirmed(false);
          setProgress(0);
        }, 1500);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [confirmed, duration]);

  const onPointerUp = useCallback(() => {
    if (confirmed) return;
    reset();
  }, [confirmed, reset]);

  const strokeDashoffset = circumference * (1 - progress);
  const currentColor = confirmed ? confirmColor : color;

  return (
    <div
      key={replayToken}
      className="flex items-center justify-center"
      style={{ width: svgSize + 40, height: svgSize + 40 }}
    >
      <div style={{ position: "relative", width: svgSize, height: svgSize, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* SVG ring */}
        <svg
          width={svgSize}
          height={svgSize}
          style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}
        >
          {/* Background track */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke={currentColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: confirmed ? "stroke 0.2s ease" : "none" }}
          />
        </svg>

        {/* Button */}
        <button
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            border: `2px solid ${currentColor}`,
            background: confirmed
              ? confirmColor
              : holding
              ? `${color}22`
              : "transparent",
            color: confirmed ? "#fff" : currentColor,
            cursor: confirmed ? "default" : "pointer",
            fontSize: size * 0.28,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            userSelect: "none",
            transition: "background 0.15s ease, color 0.15s ease, border-color 0.15s ease",
            outline: "none",
          }}
        >
          {confirmed ? "✓" : holding ? `${Math.round(progress * 100)}%` : "Hold"}
        </button>
      </div>
    </div>
  );
}

export const holdToConfirmEffect: Effect = {
  id: "hold-to-confirm",
  name: "Hold to Confirm",
  description: "Press and hold to confirm a destructive action",
  category: "Micro-interactions",
  icon: <Timer size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import { useState, useRef, useCallback } from "react";

export function HoldToConfirm() {
  const duration = ${n(p.duration)} * 1000;
  const size = ${n(p.size)};
  const color = "${p.color}";
  const confirmColor = "${p.confirmColor}";
  const strokeWidth = ${n(p.strokeWidth)};

  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const rafRef = useRef(null);
  const startTimeRef = useRef(null);

  const radius = size / 2 + strokeWidth + 4;
  const svgSize = radius * 2 + strokeWidth;
  const circumference = 2 * Math.PI * radius;

  const reset = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    startTimeRef.current = null;
    setProgress(0);
    setHolding(false);
  }, []);

  const onPointerDown = useCallback((e) => {
    if (confirmed) return;
    e.target.setPointerCapture(e.pointerId);
    setHolding(true);
    startTimeRef.current = performance.now();

    const tick = (now) => {
      if (startTimeRef.current === null) return;
      const elapsed = now - startTimeRef.current;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        setHolding(false);
        setConfirmed(true);
        setTimeout(() => {
          setConfirmed(false);
          setProgress(0);
        }, 1500);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [confirmed, duration]);

  const onPointerUp = useCallback(() => {
    if (confirmed) return;
    reset();
  }, [confirmed, reset]);

  const strokeDashoffset = circumference * (1 - progress);
  const currentColor = confirmed ? confirmColor : color;

  return (
    <div style={{ position: "relative", width: svgSize, height: svgSize, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg
        width={svgSize}
        height={svgSize}
        style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}
      >
        <circle cx={svgSize / 2} cy={svgSize / 2} r={radius} fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth={strokeWidth} />
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          fill="none"
          stroke={currentColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <button
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          border: \`2px solid \${currentColor}\`,
          background: confirmed ? confirmColor : holding ? \`\${color}22\` : "transparent",
          color: confirmed ? "#fff" : currentColor,
          cursor: confirmed ? "default" : "pointer",
          fontSize: size * 0.28,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          userSelect: "none",
        }}
      >
        {confirmed ? "✓" : holding ? \`\${Math.round(progress * 100)}%\` : "Hold"}
      </button>
    </div>
  );
}`,
  },
};

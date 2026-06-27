import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Waves } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "color", type: "color", label: "Ripple color", default: "#ffffff" },
  { id: "opacity", type: "slider", label: "Opacity", min: 10, max: 60, step: 5, default: 30, unit: "%" },
  { id: "duration", type: "slider", label: "Duration", min: 0.3, max: 1.5, step: 0.05, default: 0.6, unit: "s" },
  { id: "btnColor", type: "color", label: "Button color", default: "#6366f1" },
] as const;

interface Ripple {
  id: number;
  x: number;
  y: number;
}

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const color = String(params.color);
  const opacity = Number(params.opacity) / 100;
  const duration = Number(params.duration);
  const btnColor = String(params.btnColor);

  const [ripples, setRipples] = React.useState<Ripple[]>([]);
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const nextId = React.useRef(0);

  React.useEffect(() => {
    setRipples([]);
  }, [replayToken]);

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = nextId.current++;
    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, duration * 1000 + 100);
  }

  return (
    <div
      key={replayToken}
      className="flex items-center justify-center"
      style={{ width: 320, height: 200 }}
    >
      <motion.button
        ref={btnRef}
        onClick={handleClick}
        style={{
          background: btnColor,
          color: "#fff",
          border: "none",
          borderRadius: 10,
          padding: "12px 28px",
          fontSize: 15,
          fontWeight: 600,
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
          userSelect: "none",
        }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <AnimatePresence>
          {ripples.map((r) => (
            <motion.span
              key={r.id}
              initial={{ width: 0, height: 0, opacity }}
              animate={{ width: 400, height: 400, opacity: 0 }}
              transition={{ duration, ease: "easeOut" }}
              style={{
                position: "absolute",
                left: r.x,
                top: r.y,
                borderRadius: "50%",
                background: color,
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
              }}
            />
          ))}
        </AnimatePresence>
        <span style={{ position: "relative", zIndex: 1 }}>Click me</span>
      </motion.button>
    </div>
  );
}

export const rippleButtonEffect: Effect = {
  id: "ripple-button",
  name: "Ripple Button",
  description: "A circular ripple radiates from the click point and fades out.",
  category: "Micro-interactions",
  icon: <Waves size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import * as React from "react";
import { motion, AnimatePresence } from "motion/react";

interface Ripple { id: number; x: number; y: number; }

export function RippleButton({ children }: { children: React.ReactNode }) {
  const [ripples, setRipples] = React.useState<Ripple[]>([]);
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const nextId = React.useRef(0);

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = nextId.current++;
    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, ${Math.round(Number(p.duration) * 1000 + 100)});
  }

  return (
    <button
      ref={btnRef}
      onClick={handleClick}
      style={{
        background: "${p.btnColor}",
        color: "#fff",
        border: "none",
        borderRadius: 10,
        padding: "12px 28px",
        fontSize: 15,
        fontWeight: 600,
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            initial={{ width: 0, height: 0, opacity: ${n(Number(p.opacity) / 100)} }}
            animate={{ width: 400, height: 400, opacity: 0 }}
            transition={{ duration: ${n(p.duration)}, ease: "easeOut" }}
            style={{
              position: "absolute",
              left: r.x,
              top: r.y,
              borderRadius: "50%",
              background: "${p.color}",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
          />
        ))}
      </AnimatePresence>
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </button>
  );
}`,
  },
};

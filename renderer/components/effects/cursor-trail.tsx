import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { MousePointer2 } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "count", type: "slider", label: "Trail count", min: 5, max: 20, step: 1, default: 10 },
  { id: "size", type: "slider", label: "Dot size", min: 4, max: 20, step: 1, default: 8, unit: "px" },
  { id: "color", type: "color", label: "Color", default: "#6366f1" },
  { id: "duration", type: "slider", label: "Fade duration", min: 0.2, max: 1.5, step: 0.05, default: 0.5, unit: "s" },
] as const;

type TrailPoint = { id: number; x: number; y: number };

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const count = Number(params.count);
  const size = Number(params.size);
  const color = String(params.color);
  const duration = Number(params.duration);

  const [trail, setTrail] = React.useState<TrailPoint[]>([]);
  const counterRef = React.useRef(0);

  React.useEffect(() => {
    setTrail([]);
  }, [replayToken]);

  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = ++counterRef.current;
      setTrail((prev) => [...prev.slice(-(count - 1)), { id, x, y }]);
    },
    [count],
  );

  const removePoint = React.useCallback((id: number) => {
    setTrail((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return (
    <div
      key={replayToken}
      onPointerMove={handlePointerMove}
      className="relative overflow-hidden rounded-panel select-none"
      style={{ width: 360, height: 240, cursor: "none" }}
    >
      {trail.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-muted text-sm pointer-events-none">
          Move cursor here
        </div>
      )}
      <AnimatePresence>
        {trail.map((point) => (
          <motion.div
            key={point.id}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 0 }}
            exit={{}}
            transition={{ duration, ease: "easeOut" }}
            onAnimationComplete={() => removePoint(point.id)}
            style={{
              position: "absolute",
              left: point.x - size / 2,
              top: point.y - size / 2,
              width: size,
              height: size,
              borderRadius: "50%",
              background: color,
              pointerEvents: "none",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export const cursorTrailEffect: Effect = {
  id: "cursor-trail",
  name: "Cursor Trail",
  description: "Small dots appear and fade out, trailing behind the cursor as it moves.",
  category: "Micro-interactions",
  icon: <MousePointer2 size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import * as React from "react";
import { AnimatePresence, motion } from "motion/react";

type TrailPoint = { id: number; x: number; y: number };

export function CursorTrail({ children }: { children?: React.ReactNode }) {
  const [trail, setTrail] = React.useState<TrailPoint[]>([]);
  const counterRef = React.useRef(0);
  const count = ${n(p.count)};

  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = ++counterRef.current;
      setTrail((prev) => [...prev.slice(-(count - 1)), { id, x, y }]);
    },
    [],
  );

  const removePoint = (id: number) =>
    setTrail((prev) => prev.filter((p) => p.id !== id));

  return (
    <div
      onPointerMove={handlePointerMove}
      style={{ position: "relative", overflow: "hidden", cursor: "none" }}
    >
      {children}
      <AnimatePresence>
        {trail.map((point) => (
          <motion.div
            key={point.id}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 0 }}
            exit={{}}
            transition={{ duration: ${n(p.duration)}, ease: "easeOut" }}
            onAnimationComplete={() => removePoint(point.id)}
            style={{
              position: "absolute",
              left: point.x - ${n(p.size) / 2},
              top: point.y - ${n(p.size) / 2},
              width: ${n(p.size)},
              height: ${n(p.size)},
              borderRadius: "50%",
              background: "${p.color}",
              pointerEvents: "none",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}`,
  },
};

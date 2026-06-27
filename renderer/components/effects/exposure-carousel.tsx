import * as React from "react";
import { motion, useSpring } from "motion/react";
import { Sun } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "snapStiffness", type: "slider", label: "Snap stiffness", min: 100, max: 800, step: 10, default: 450 },
  { id: "snapDamping", type: "slider", label: "Snap damping", min: 5, max: 40, step: 1, default: 28 },
  { id: "tickSpacing", type: "slider", label: "Tick spacing", min: 18, max: 48, step: 2, default: 28, unit: "px" },
  { id: "tickCount", type: "slider", label: "Tick count", min: 11, max: 31, step: 2, default: 21 },
] as const;

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const snapStiffness = Number(params.snapStiffness);
  const snapDamping = Number(params.snapDamping);
  const tickSpacing = Number(params.tickSpacing);
  const tickCount = Number(params.tickCount);

  const [snapIndex, setSnapIndex] = React.useState(Math.floor(tickCount / 2));
  const dragStartX = React.useRef(0);
  const dragStartSnap = React.useRef(Math.floor(tickCount / 2));
  const [isDragging, setIsDragging] = React.useState(false);

  React.useEffect(() => {
    if (replayToken > 0) setSnapIndex(Math.floor(tickCount / 2));
  }, [replayToken, tickCount]);

  const centerIndex = Math.floor(tickCount / 2);
  const exposureVal = snapIndex - centerIndex;
  const exposureLabel = exposureVal === 0 ? "0" : exposureVal > 0 ? `+${exposureVal}` : `${exposureVal}`;

  // Spring-animated offset (in px) = -snapIndex * tickSpacing (center tick at 0)
  const offsetTarget = (centerIndex - snapIndex) * tickSpacing;
  const offsetSpring = useSpring(offsetTarget, { stiffness: snapStiffness, damping: snapDamping });

  React.useEffect(() => {
    offsetSpring.set(offsetTarget);
  }, [offsetTarget, offsetSpring]);

  const containerWidth = 280;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartSnap.current = snapIndex;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = React.useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const delta = e.clientX - dragStartX.current;
    const rawIndex = dragStartSnap.current - delta / tickSpacing;
    const clamped = Math.max(0, Math.min(tickCount - 1, Math.round(rawIndex)));
    setSnapIndex(clamped);
  }, [isDragging, tickSpacing, tickCount]);

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <div key={replayToken} className="flex flex-col items-center gap-4 select-none" style={{ width: containerWidth }}>
      {/* Exposure value */}
      <div className="flex items-center gap-2">
        <Sun size={16} className="text-secondary" />
        <motion.span
          key={exposureLabel}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-strong font-mono tabular-nums"
          style={{ minWidth: 32, textAlign: "center" }}
        >
          {exposureLabel}
        </motion.span>
      </div>

      {/* Carousel track */}
      <div
        className="relative overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ width: containerWidth, height: 48 }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Center indicator */}
        <div
          className="absolute top-0 bottom-0 z-10 pointer-events-none"
          style={{
            left: containerWidth / 2 - 1,
            width: 2,
            background: "#f59e0b",
            borderRadius: 2,
          }}
        />

        {/* Ticks strip */}
        <motion.div
          className="absolute top-0 flex items-center"
          style={{
            x: offsetSpring,
            left: containerWidth / 2,
            height: 48,
            gap: 0,
          }}
        >
          {Array.from({ length: tickCount }, (_, i) => {
            const distFromCenter = Math.abs(i - snapIndex);
            const isCenter = distFromCenter === 0;
            const isMajor = i % 5 === 0;
            const scale = isCenter ? 1 : Math.max(0.4, 1 - distFromCenter * 0.12);
            const height = isMajor ? 28 : isCenter ? 36 : 20;

            return (
              <motion.div
                key={i}
                animate={{ scaleY: scale, opacity: scale }}
                transition={{ type: "spring", stiffness: snapStiffness, damping: snapDamping }}
                style={{
                  width: tickSpacing - 4,
                  height,
                  marginLeft: 2,
                  marginRight: 2,
                  borderRadius: 2,
                  background: isCenter ? "#f59e0b" : isMajor ? "var(--color-text-primary)" : "var(--color-separator)",
                  transformOrigin: "center",
                }}
              />
            );
          })}
        </motion.div>
      </div>

      <p className="text-small text-secondary">Drag left/right to adjust exposure</p>
    </div>
  );
}

export const exposureCarouselEffect: Effect = {
  id: "exposure-carousel",
  name: "Exposure Carousel",
  description: "iOS-camera-style exposure dial — tick marks drift and snap with spring physics.",
  category: "Forms & inputs" as unknown as Effect["category"],
  icon: <Sun size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import * as React from "react";
import { motion, useSpring } from "motion/react";

const SNAP_SPRING = { stiffness: ${n(p.snapStiffness)}, damping: ${n(p.snapDamping)} };
const TICK_SPACING = ${n(p.tickSpacing)};
const TICK_COUNT = ${n(p.tickCount)};
const CENTER = Math.floor(TICK_COUNT / 2);

export function ExposureCarousel() {
  const [snapIndex, setSnapIndex] = React.useState(CENTER);
  const dragStart = React.useRef({ x: 0, index: CENTER });
  const offset = useSpring((CENTER - CENTER) * TICK_SPACING, SNAP_SPRING);

  React.useEffect(() => {
    offset.set((CENTER - snapIndex) * TICK_SPACING);
  }, [snapIndex, offset]);

  const exposure = snapIndex - CENTER;

  return (
    <div style={{ width: 280, display: "flex", flexDirection: "column", gap: 12 }}>
      <span style={{ textAlign: "center", fontVariantNumeric: "tabular-nums" }}>
        {exposure > 0 ? \`+\${exposure}\` : exposure}
      </span>
      <div style={{ position: "relative", overflow: "hidden", height: 48 }}
        onPointerDown={(e) => {
          dragStart.current = { x: e.clientX, index: snapIndex };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const delta = e.clientX - dragStart.current.x;
          const raw = dragStart.current.index - delta / TICK_SPACING;
          setSnapIndex(Math.max(0, Math.min(TICK_COUNT - 1, Math.round(raw))));
        }}>
        {/* Center indicator */}
        <div style={{ position: "absolute", left: 140, top: 0, bottom: 0, width: 2, background: "#f59e0b" }} />
        <motion.div style={{ x: offset, position: "absolute", left: 140, display: "flex", alignItems: "center" }}>
          {Array.from({ length: TICK_COUNT }, (_, i) => (
            <motion.div key={i}
              animate={{ scaleY: Math.max(0.4, 1 - Math.abs(i - snapIndex) * 0.12) }}
              transition={SNAP_SPRING}
              style={{
                width: TICK_SPACING - 4, height: i % 5 === 0 ? 28 : 20,
                margin: "0 2px", borderRadius: 2,
                background: i === snapIndex ? "#f59e0b" : "#9ca3af",
                transformOrigin: "center",
              }} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}`,
  },
};

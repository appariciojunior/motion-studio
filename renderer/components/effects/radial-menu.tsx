import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CircleDot } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "radius", type: "slider", label: "Orbit radius", min: 60, max: 160, step: 1, default: 90, unit: "px" },
  { id: "duration", type: "slider", label: "Duration", min: 0.2, max: 0.8, step: 0.05, default: 0.35, unit: "s" },
  { id: "stagger", type: "slider", label: "Stagger", min: 0.02, max: 0.12, step: 0.01, default: 0.05, unit: "s" },
  { id: "itemSize", type: "slider", label: "Item size", min: 24, max: 56, step: 1, default: 36, unit: "px" },
  { id: "color", type: "color", label: "Item color", default: "#6366f1" },
] as const;

const ITEM_COUNT = 6;

function getPositions(radius: number): { x: number; y: number }[] {
  return Array.from({ length: ITEM_COUNT }, (_, i) => {
    const angle = (i * (360 / ITEM_COUNT) - 90) * (Math.PI / 180);
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  });
}

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const radius = Number(params.radius);
  const duration = Number(params.duration);
  const stagger = Number(params.stagger);
  const itemSize = Number(params.itemSize);
  const color = String(params.color);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen((prev) => !prev);
  }, [replayToken]);

  const positions = getPositions(radius);

  return (
    <div
      style={{
        position: "relative",
        width: (radius + itemSize) * 2 + 20,
        height: (radius + itemSize) * 2 + 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Center button */}
      <motion.button
        onClick={() => setOpen((prev) => !prev)}
        animate={{ rotate: open ? 45 : 0 }}
        transition={{ duration: 0.25 }}
        style={{
          position: "relative",
          zIndex: 10,
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: color,
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        }}
      >
        <CircleDot size={20} />
      </motion.button>

      {/* Fan items */}
      <AnimatePresence>
        {open &&
          positions.map((pos, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
              animate={{ scale: 1, opacity: 1, x: pos.x, y: pos.y }}
              exit={{ scale: 0, opacity: 0, x: 0, y: 0 }}
              transition={{
                duration,
                delay: i * stagger,
                ease: "backOut",
              }}
              style={{
                position: "absolute",
                width: itemSize,
                height: itemSize,
                borderRadius: "50%",
                background: color,
                opacity: 0.85,
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              }}
            />
          ))}
      </AnimatePresence>
    </div>
  );
}

export const radialMenuEffect: Effect = {
  id: "radial-menu",
  name: "Radial Menu",
  description: "Circular menu that fans out from a center button",
  category: "Micro-interactions",
  icon: <CircleDot size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const ITEM_COUNT = 6;

function getPositions(radius) {
  return Array.from({ length: ITEM_COUNT }, (_, i) => {
    const angle = (i * (360 / ITEM_COUNT) - 90) * (Math.PI / 180);
    return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
  });
}

export function RadialMenu({ color = "${p.color}" }) {
  const [open, setOpen] = useState(false);
  const radius = ${n(p.radius)};
  const positions = getPositions(radius);

  return (
    <div style={{ position: "relative", width: ${n(Number(p.radius) + Number(p.itemSize)) * 2 + 20}, height: ${n(Number(p.radius) + Number(p.itemSize)) * 2 + 20}, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <motion.button
        onClick={() => setOpen((prev) => !prev)}
        animate={{ rotate: open ? 45 : 0 }}
        transition={{ duration: 0.25 }}
        style={{ position: "relative", zIndex: 10, width: 44, height: 44, borderRadius: "50%", background: color, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}
      >
        +
      </motion.button>
      <AnimatePresence>
        {open && positions.map((pos, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
            animate={{ scale: 1, opacity: 1, x: pos.x, y: pos.y }}
            exit={{ scale: 0, opacity: 0, x: 0, y: 0 }}
            transition={{ duration: ${n(p.duration)}, delay: i * ${n(p.stagger)}, ease: "backOut" }}
            style={{ position: "absolute", width: ${n(p.itemSize)}, height: ${n(p.itemSize)}, borderRadius: "50%", background: color, opacity: 0.85 }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}`,
  },
};

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Share2, Pencil, Download, Trash2 } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "size", type: "slider", label: "FAB size", min: 48, max: 80, step: 4, default: 56, unit: "px" },
  { id: "gap", type: "slider", label: "Item gap", min: 12, max: 24, step: 4, default: 16, unit: "px" },
  { id: "duration", type: "slider", label: "Duration", min: 0.2, max: 0.6, step: 0.05, default: 0.3, unit: "s" },
  { id: "color", type: "color", label: "FAB color", default: "#6366f1" },
  { id: "stagger", type: "slider", label: "Stagger", min: 0.03, max: 0.1, step: 0.01, default: 0.05, unit: "s" },
] as const;

const ACTION_ITEMS = [
  { icon: <Trash2 size={18} />, label: "Delete" },
  { icon: <Download size={18} />, label: "Download" },
  { icon: <Pencil size={18} />, label: "Edit" },
  { icon: <Share2 size={18} />, label: "Share" },
];

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const [open, setOpen] = useState(false);
  const size = Number(params.size);
  const gap = Number(params.gap);
  const duration = Number(params.duration);
  const color = String(params.color);
  const stagger = Number(params.stagger);
  const miniSize = Math.round(size * 0.75);

  useEffect(() => {
    setOpen(false);
    const t = setTimeout(() => setOpen(true), 300);
    return () => clearTimeout(t);
  }, [replayToken]);

  return (
    <div className="relative w-full h-full flex items-end justify-end" style={{ minHeight: 280, padding: 32 }}>
      {/* Scrim */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="scrim"
            className="absolute inset-0 rounded-xl"
            style={{ background: "rgba(0,0,0,0.25)", pointerEvents: "none" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration }}
          />
        )}
      </AnimatePresence>

      {/* FAB container */}
      <div className="relative flex flex-col items-end" style={{ gap: gap, zIndex: 10 }}>
        {/* Mini action items */}
        <AnimatePresence>
          {open &&
            ACTION_ITEMS.map((item, i) => (
              <motion.div
                key={item.label}
                className="flex items-center"
                style={{ gap: 10 }}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 24,
                  delay: i * stagger,
                  duration,
                }}
              >
                {/* Label */}
                <motion.span
                  className="text-white text-sm font-medium px-3 py-1 rounded-full"
                  style={{ background: "rgba(0,0,0,0.6)", whiteSpace: "nowrap" }}
                >
                  {item.label}
                </motion.span>
                {/* Mini button */}
                <motion.button
                  className="flex items-center justify-center rounded-full shadow-lg text-white"
                  style={{
                    width: miniSize,
                    height: miniSize,
                    background: color,
                    border: "none",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.icon}
                </motion.button>
              </motion.div>
            ))}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.button
          className="flex items-center justify-center rounded-full shadow-xl text-white"
          style={{
            width: size,
            height: size,
            background: color,
            border: "none",
            cursor: "pointer",
            flexShrink: 0,
          }}
          onClick={() => setOpen((v) => !v)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.span
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration, type: "spring", stiffness: 300, damping: 20 }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Plus size={Math.round(size * 0.45)} />
          </motion.span>
        </motion.button>
      </div>
    </div>
  );
}

export const floatingActionButtonEffect: Effect = {
  id: "floating-action-button",
  name: "Floating Action Button",
  description: "FAB that expands into a speed-dial menu of actions",
  category: "Micro-interactions",
  icon: <Plus size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Share2, Pencil, Download, Trash2 } from "lucide-react";

const ACTION_ITEMS = [
  { icon: <Trash2 size={18} />, label: "Delete" },
  { icon: <Download size={18} />, label: "Download" },
  { icon: <Pencil size={18} />, label: "Edit" },
  { icon: <Share2 size={18} />, label: "Share" },
];

export function FloatingActionButton() {
  const [open, setOpen] = useState(false);
  const size = ${n(p.size)};
  const gap = ${n(p.gap)};
  const duration = ${n(p.duration)};
  const color = "${p.color}";
  const stagger = ${n(p.stagger)};
  const miniSize = Math.round(size * 0.75);

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "flex-end", justifyContent: "flex-end", minHeight: 280, padding: 32 }}>
      <AnimatePresence>
        {open && (
          <motion.div
            key="scrim"
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)", borderRadius: 12, pointerEvents: "none" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration }}
          />
        )}
      </AnimatePresence>

      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "flex-end", gap, zIndex: 10 }}>
        <AnimatePresence>
          {open && ACTION_ITEMS.map((item, i) => (
            <motion.div
              key={item.label}
              style={{ display: "flex", alignItems: "center", gap: 10 }}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 24, delay: i * stagger, duration }}
            >
              <span style={{ background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 14, fontWeight: 500, padding: "4px 12px", borderRadius: 999, whiteSpace: "nowrap" }}>
                {item.label}
              </span>
              <motion.button
                style={{ width: miniSize, height: miniSize, background: color, border: "none", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.icon}
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>

        <motion.button
          style={{ width: size, height: size, background: color, border: "none", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer", boxShadow: "0 6px 16px rgba(0,0,0,0.35)" }}
          onClick={() => setOpen(v => !v)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.span
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration, type: "spring", stiffness: 300, damping: 20 }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Plus size={Math.round(size * 0.45)} />
          </motion.span>
        </motion.button>
      </div>
    </div>
  );
}`,
  },
};

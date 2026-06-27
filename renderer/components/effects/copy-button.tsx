import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Copy, Check } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "duration", type: "slider", label: "Duration", min: 0.1, max: 0.8, step: 0.05, default: 0.25, unit: "s" },
  { id: "color", type: "color", label: "Color", default: "#6366f1" },
  { id: "size", type: "slider", label: "Size", min: 32, max: 64, step: 4, default: 44, unit: "px" },
] as const;

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const duration = Number(params.duration);
  const color = String(params.color);
  const size = Number(params.size);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    setCopied(false);
  }, [replayToken]);

  function handleClick() {
    if (copied) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const iconSize = Math.round(size * 0.45);

  return (
    <div
      key={replayToken}
      className="flex flex-col items-center justify-center gap-3"
      style={{ width: 320, height: 200 }}
    >
      <motion.button
        onClick={handleClick}
        style={{
          width: size,
          height: size,
          background: color,
          borderRadius: 10,
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <AnimatePresence mode="wait">
          {!copied ? (
            <motion.span
              key="copy"
              initial={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              exit={{ scale: 0.5, opacity: 0, filter: "blur(4px)" }}
              transition={{ duration }}
              style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Copy size={iconSize} color="#fff" />
            </motion.span>
          ) : (
            <motion.span
              key="check"
              initial={{ scale: 0.5, opacity: 0, filter: "blur(4px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              exit={{ scale: 0.5, opacity: 0, filter: "blur(4px)" }}
              transition={{ duration }}
              style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Check size={iconSize} color="#fff" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
      <AnimatePresence mode="wait">
        <motion.span
          key={copied ? "copied" : "copy"}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: duration * 0.8 }}
          style={{ color: "#aaa", fontSize: 13 }}
        >
          {copied ? "Copied!" : "Copy"}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export const copyButtonEffect: Effect = {
  id: "copy-button",
  name: "Copy Button",
  description: "Icon button that morphs from a copy icon to a checkmark on click, then resets.",
  category: "Micro-interactions",
  icon: <Copy size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Copy, Check } from "lucide-react";

export function CopyButton() {
  const [copied, setCopied] = React.useState(false);

  function handleClick() {
    if (copied) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <motion.button
        onClick={handleClick}
        style={{
          width: ${n(p.size)},
          height: ${n(p.size)},
          background: "${p.color}",
          borderRadius: 10,
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <AnimatePresence mode="wait">
          {!copied ? (
            <motion.span
              key="copy"
              exit={{ scale: 0.5, opacity: 0, filter: "blur(4px)" }}
              transition={{ duration: ${n(p.duration)} }}
              style={{ display: "flex" }}
            >
              <Copy size={${Math.round(Number(p.size) * 0.45)}} color="#fff" />
            </motion.span>
          ) : (
            <motion.span
              key="check"
              initial={{ scale: 0.5, opacity: 0, filter: "blur(4px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: ${n(p.duration)} }}
              style={{ display: "flex" }}
            >
              <Check size={${Math.round(Number(p.size) * 0.45)}} color="#fff" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
      <span style={{ fontSize: 13, color: "#aaa" }}>{copied ? "Copied!" : "Copy"}</span>
    </div>
  );
}`,
  },
};

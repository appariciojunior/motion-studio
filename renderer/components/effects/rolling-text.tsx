import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronsUp } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "duration", type: "slider", label: "Duration", min: 0.2, max: 1.5, step: 0.05, default: 0.4, unit: "s" },
  { id: "pauseDuration", type: "slider", label: "Pause", min: 0.5, max: 4, step: 0.1, default: 1.5, unit: "s" },
  { id: "fontSize", type: "slider", label: "Font size", min: 18, max: 64, step: 1, default: 40, unit: "px" },
  { id: "color", type: "color", label: "Color", default: "#e8e8ee" },
] as const;

const WORDS = ["Build", "Design", "Animate", "Ship"];

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const [index, setIndex] = React.useState(0);
  const duration = Number(params.duration);
  const pauseDuration = Number(params.pauseDuration);

  React.useEffect(() => {
    setIndex(0);
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % WORDS.length);
    }, (duration + pauseDuration) * 1000);
    return () => clearInterval(interval);
  }, [replayToken, duration, pauseDuration]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <div
        style={{
          overflow: "hidden",
          position: "relative",
          height: Number(params.fontSize) * 1.3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 200,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={`${replayToken}-${index}`}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration, ease: [0.32, 0, 0.67, 0] }}
            style={{
              fontSize: Number(params.fontSize),
              fontWeight: 800,
              color: String(params.color),
              letterSpacing: "-0.02em",
              position: "absolute",
              whiteSpace: "nowrap",
            }}
          >
            {WORDS[index]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

export const rollingTextEffect: Effect = {
  id: "rolling-text",
  name: "Rolling Text",
  description: "Words roll in like a slot machine — each word exits upward as the next arrives from below.",
  category: "Text effects",
  icon: <ChevronsUp size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import * as React from "react";
import { motion, AnimatePresence } from "motion/react";

export function RollingText({ words }: { words: string[] }) {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, ${n(Number(p.duration) + Number(p.pauseDuration))} * 1000);
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <div style={{ overflow: "hidden", position: "relative", height: ${n(Number(p.fontSize) * 1.3)}, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: ${n(p.duration)}, ease: [0.32, 0, 0.67, 0] }}
          style={{ fontSize: ${n(p.fontSize)}, fontWeight: 800, color: "${p.color}", position: "absolute", whiteSpace: "nowrap" }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}`,
  },
};

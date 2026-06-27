import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "duration", type: "slider", label: "Duration", min: 0.5, max: 3, step: 0.1, default: 0.8, unit: "s" },
  { id: "pauseDuration", type: "slider", label: "Pause", min: 0.5, max: 4, step: 0.1, default: 2, unit: "s" },
  { id: "fontSize", type: "slider", label: "Font size", min: 18, max: 64, step: 1, default: 40, unit: "px" },
  { id: "color", type: "color", label: "Color", default: "#e8e8ee" },
] as const;

const WORDS = ["Motion", "Studio", "Design", "Create"];

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
      <AnimatePresence mode="wait">
        <motion.span
          key={`${replayToken}-${index}`}
          initial={{ opacity: 0, filter: "blur(12px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(12px)" }}
          transition={{ duration, ease: [0.77, 0, 0.175, 1] }}
          style={{
            fontSize: Number(params.fontSize),
            fontWeight: 800,
            color: String(params.color),
            letterSpacing: "-0.02em",
            position: "absolute",
          }}
        >
          {WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export const morphingTextEffect: Effect = {
  id: "morphing-text",
  name: "Morphing Text",
  description: "Words blur in and out, smoothly morphing from one to the next.",
  category: "Text effects",
  icon: <Sparkles size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import * as React from "react";
import { motion, AnimatePresence } from "motion/react";

export function MorphingText({ words }: { words: string[] }) {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, ${n(p.duration + Number(p.pauseDuration))} * 1000);
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, filter: "blur(12px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(12px)" }}
          transition={{ duration: ${n(p.duration)}, ease: [0.77, 0, 0.175, 1] }}
          style={{ fontSize: ${n(p.fontSize)}, fontWeight: 800, color: "${p.color}", position: "absolute" }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}`,
  },
};

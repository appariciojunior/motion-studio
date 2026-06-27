import * as React from "react";
import { motion } from "motion/react";
import { Keyboard } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "speed", type: "slider", label: "Typing speed", min: 4, max: 30, step: 1, default: 12, unit: "cps" },
  { id: "size", type: "slider", label: "Font size", min: 16, max: 56, step: 1, default: 32, unit: "px" },
  { id: "hold", type: "slider", label: "Hold before loop", min: 0.4, max: 4, step: 0.1, default: 1.4, unit: "s" },
  { id: "cursor", type: "switch", label: "Blinking cursor", default: true },
] as const;

const PHRASE = "Build motion that feels native.";

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const [count, setCount] = React.useState(0);
  const [loop, setLoop] = React.useState(0);
  const cps = Number(params.speed);
  const hold = Number(params.hold);

  React.useEffect(() => {
    setCount(0);
    let i = 0;
    const stepMs = 1000 / cps;
    let holdTimer: ReturnType<typeof setTimeout>;
    const timer = setInterval(() => {
      i++;
      setCount(i);
      if (i >= PHRASE.length) {
        clearInterval(timer);
        holdTimer = setTimeout(() => setLoop((l) => l + 1), hold * 1000);
      }
    }, stepMs);
    return () => {
      clearInterval(timer);
      clearTimeout(holdTimer);
    };
  }, [cps, hold, replayToken, loop]);

  return (
    <span style={{ fontSize: Number(params.size), fontWeight: 600 }} className="text-strong">
      {PHRASE.slice(0, count)}
      {params.cursor === true && (
        <motion.span
          className="inline-block"
          style={{ marginLeft: 2 }}
          animate={{ opacity: [1, 1, 0, 0] }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          |
        </motion.span>
      )}
    </span>
  );
}

export const typewriterEffect: Effect = {
  id: "typewriter",
  name: "Typewriter",
  description: "Text types out one character at a time with a cursor.",
  category: "Text effects",
  icon: <Keyboard size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import * as React from "react";

export function Typewriter({ text }: { text: string }) {
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setCount(i);
      if (i >= text.length) clearInterval(timer);
    }, 1000 / ${n(p.speed)});
    return () => clearInterval(timer);
  }, [text]);
  return (
    <span>
      {text.slice(0, count)}
      <span style={{ animation: "blink 1s steps(1) infinite" }}>|</span>
    </span>
  );
}`,
    css: () => `@keyframes blink {
  50% { opacity: 0; }
}`,
  },
};

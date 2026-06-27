import * as React from "react";
import { Binary } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "duration", type: "slider", label: "Resolve time", min: 0.4, max: 4, step: 0.1, default: 1.6, unit: "s" },
  { id: "speed", type: "slider", label: "Scramble rate", min: 10, max: 60, step: 2, default: 30, unit: "fps" },
  { id: "size", type: "slider", label: "Font size", min: 18, max: 64, step: 1, default: 36, unit: "px" },
  { id: "loop", type: "switch", label: "Loop", default: true },
] as const;

const GLYPHS = "!<>-_\\/[]{}—=+*^?#________";
const TARGET = "MOTION STUDIO";

function useScramble(target: string, duration: number, fps: number, replayToken: number, loop: boolean) {
  const [text, setText] = React.useState(target);

  React.useEffect(() => {
    let frame = 0;
    const totalFrames = Math.max(1, Math.round(duration * fps));
    const interval = 1000 / fps;
    let timer: ReturnType<typeof setInterval>;

    const run = () => {
      frame = 0;
      timer = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        const revealed = Math.floor(progress * target.length);
        const out = target
          .split("")
          .map((ch, i) => {
            if (ch === " ") return " ";
            if (i < revealed) return ch;
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join("");
        setText(out);
        if (frame >= totalFrames) {
          setText(target);
          clearInterval(timer);
          if (loop) setTimeout(run, 900);
        }
      }, interval);
    };

    run();
    return () => clearInterval(timer);
  }, [target, duration, fps, replayToken, loop]);

  return text;
}

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const text = useScramble(TARGET, Number(params.duration), Number(params.speed), replayToken, params.loop === true);
  return (
    <span
      style={{ fontSize: Number(params.size), fontWeight: 700, fontFamily: "ui-monospace, monospace", letterSpacing: "0.04em" }}
      className="text-strong tabular-nums"
    >
      {text}
    </span>
  );
}

export const textScrambleEffect: Effect = {
  id: "text-scramble",
  name: "Text Scramble",
  description: "Characters decode into place from random glyphs.",
  category: "Text effects",
  icon: <Binary size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import * as React from "react";

const GLYPHS = "!<>-_\\\\/[]{}=+*^?#";

export function TextScramble({ text }: { text: string }) {
  const [output, setOutput] = React.useState(text);
  React.useEffect(() => {
    const fps = ${n(p.speed)};
    const totalFrames = Math.round(${n(p.duration)} * fps);
    let frame = 0;
    const timer = setInterval(() => {
      frame++;
      const revealed = Math.floor((frame / totalFrames) * text.length);
      setOutput(
        text
          .split("")
          .map((ch, i) => (ch === " " ? " " : i < revealed ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join("")
      );
      if (frame >= totalFrames) {
        setOutput(text);
        clearInterval(timer);
      }
    }, 1000 / fps);
    return () => clearInterval(timer);
  }, [text]);
  return <span style={{ fontFamily: "monospace" }}>{output}</span>;
}`,
  },
};

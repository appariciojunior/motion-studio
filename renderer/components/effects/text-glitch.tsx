import { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "motion/react";
import { Tv2 } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "intensity", type: "slider", label: "RGB offset", min: 2, max: 20, step: 1, default: 8, unit: "px" },
  { id: "frequency", type: "slider", label: "Glitch interval", min: 0.5, max: 4, step: 0.25, default: 1.5, unit: "s" },
  { id: "duration", type: "slider", label: "Glitch duration", min: 0.05, max: 0.3, step: 0.05, default: 0.1, unit: "s" },
  { id: "color", type: "color", label: "Text color", default: "#00ff88" },
  { id: "size", type: "slider", label: "Font size", min: 24, max: 72, step: 4, default: 48, unit: "px" },
] as const;

const TEXT = "GLITCH";
const GLITCH_CHARS = "▓█▒░▄▐▌▀";

function pickGlitchChar(): string {
  return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
}

function corruptText(text: string): string {
  const chars = text.split("");
  const count = 2 + Math.floor(Math.random() * 2); // 2-3 chars
  const indices = new Set<number>();
  while (indices.size < Math.min(count, chars.length)) {
    indices.add(Math.floor(Math.random() * chars.length));
  }
  indices.forEach((i) => {
    chars[i] = pickGlitchChar();
  });
  return chars.join("");
}

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const intensity = Number(params.intensity);
  const frequency = Number(params.frequency);
  const duration = Number(params.duration);
  const color = String(params.color);
  const size = Number(params.size);

  const [displayText, setDisplayText] = useState(TEXT);
  const redControls = useAnimation();
  const blueControls = useAnimation();
  const isGlitching = useRef(false);

  const triggerGlitch = () => {
    if (isGlitching.current) return;
    isGlitching.current = true;

    setDisplayText(corruptText(TEXT));

    const steps = 4;
    const stepDuration = duration / steps;

    redControls.start({
      x: [-intensity, intensity, -intensity / 2, 0],
      opacity: [0.8, 0.8, 0.6, 0],
      transition: { duration, ease: "linear" },
    });
    blueControls.start({
      x: [intensity, -intensity, intensity / 2, 0],
      opacity: [0.8, 0.8, 0.6, 0],
      transition: { duration, ease: "linear" },
    });

    // Mid-glitch re-corrupt
    const midTimer = setTimeout(() => {
      setDisplayText(corruptText(TEXT));
    }, (duration * 1000) / 2);

    const endTimer = setTimeout(() => {
      setDisplayText(TEXT);
      isGlitching.current = false;
    }, duration * 1000 + 50);

    return () => {
      clearTimeout(midTimer);
      clearTimeout(endTimer);
    };
  };

  // Interval-based glitch
  useEffect(() => {
    const id = setInterval(() => {
      triggerGlitch();
    }, frequency * 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intensity, frequency, duration]);

  // Replay triggers immediate glitch
  useEffect(() => {
    triggerGlitch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replayToken]);

  const fontStyle: React.CSSProperties = {
    fontFamily: "monospace",
    fontWeight: 700,
    fontSize: size,
    textTransform: "uppercase",
    letterSpacing: "0.15em",
    color,
    userSelect: "none",
  };

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        background: "repeating-linear-gradient(transparent 0px, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
      }}
    >
      {/* Red channel */}
      <motion.span
        animate={redControls}
        initial={{ x: 0, opacity: 0 }}
        style={{
          ...fontStyle,
          position: "absolute",
          top: 0,
          left: 0,
          color: `rgba(255,0,60,0.75)`,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      >
        {displayText}
      </motion.span>

      {/* Blue channel */}
      <motion.span
        animate={blueControls}
        initial={{ x: 0, opacity: 0 }}
        style={{
          ...fontStyle,
          position: "absolute",
          top: 0,
          left: 0,
          color: `rgba(0,180,255,0.75)`,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      >
        {displayText}
      </motion.span>

      {/* Main text */}
      <span style={fontStyle}>{displayText}</span>
    </div>
  );
}

export const textGlitchEffect: Effect = {
  id: "text-glitch",
  name: "Text Glitch",
  description: "Text that glitches with RGB split and digital corruption",
  category: "Text effects",
  icon: <Tv2 size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "motion/react";

const GLITCH_CHARS = "▓█▒░▄▐▌▀";

function corruptText(text: string): string {
  const chars = text.split("");
  const count = 2 + Math.floor(Math.random() * 2);
  const indices = new Set<number>();
  while (indices.size < Math.min(count, chars.length)) {
    indices.add(Math.floor(Math.random() * chars.length));
  }
  indices.forEach((i) => {
    chars[i] = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
  });
  return chars.join("");
}

export function TextGlitch({ text = "GLITCH" }: { text?: string }) {
  const intensity = ${n(p.intensity)};
  const frequency = ${n(p.frequency)};
  const duration = ${n(p.duration)};
  const color = "${p.color}";
  const size = ${n(p.size)};

  const [displayText, setDisplayText] = useState(text);
  const redControls = useAnimation();
  const blueControls = useAnimation();
  const isGlitching = useRef(false);

  const triggerGlitch = () => {
    if (isGlitching.current) return;
    isGlitching.current = true;
    setDisplayText(corruptText(text));
    redControls.start({
      x: [-intensity, intensity, -intensity / 2, 0],
      opacity: [0.8, 0.8, 0.6, 0],
      transition: { duration, ease: "linear" },
    });
    blueControls.start({
      x: [intensity, -intensity, intensity / 2, 0],
      opacity: [0.8, 0.8, 0.6, 0],
      transition: { duration, ease: "linear" },
    });
    setTimeout(() => setDisplayText(corruptText(text)), (duration * 1000) / 2);
    setTimeout(() => {
      setDisplayText(text);
      isGlitching.current = false;
    }, duration * 1000 + 50);
  };

  useEffect(() => {
    const id = setInterval(triggerGlitch, frequency * 1000);
    return () => clearInterval(id);
  }, []);

  const fontStyle = {
    fontFamily: "monospace",
    fontWeight: 700,
    fontSize: size,
    textTransform: "uppercase" as const,
    letterSpacing: "0.15em",
    color,
    userSelect: "none" as const,
  };

  return (
    <div style={{ position: "relative", display: "inline-block", background: "repeating-linear-gradient(transparent 0px, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)" }}>
      <motion.span animate={redControls} initial={{ x: 0, opacity: 0 }} style={{ ...fontStyle, position: "absolute", top: 0, left: 0, color: "rgba(255,0,60,0.75)", mixBlendMode: "screen", pointerEvents: "none" }}>{displayText}</motion.span>
      <motion.span animate={blueControls} initial={{ x: 0, opacity: 0 }} style={{ ...fontStyle, position: "absolute", top: 0, left: 0, color: "rgba(0,180,255,0.75)", mixBlendMode: "screen", pointerEvents: "none" }}>{displayText}</motion.span>
      <span style={fontStyle}>{displayText}</span>
    </div>
  );
}`,
  },
};

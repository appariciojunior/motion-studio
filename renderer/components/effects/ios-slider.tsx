import * as React from "react";
import { motion, useSpring } from "motion/react";
import { SlidersHorizontal } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "stiffness", type: "slider", label: "Spring stiffness", min: 100, max: 800, step: 10, default: 400 },
  { id: "damping", type: "slider", label: "Spring damping", min: 5, max: 40, step: 1, default: 22 },
  { id: "expandHeight", type: "slider", label: "Height expand factor", min: 1.2, max: 3, step: 0.1, default: 2 },
  { id: "accentColor", type: "color", label: "Accent color", default: "#3b82f6" },
] as const;

const TRACK_W = 280;
const TRACK_H_BASE = 6;

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const stiffness = Number(params.stiffness);
  const damping = Number(params.damping);
  const expandHeight = Number(params.expandHeight);
  const accentColor = String(params.accentColor);

  const [value, setValue] = React.useState(0.5);
  const [pressed, setPressed] = React.useState(false);
  const trackRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (replayToken > 0) setValue(0.5);
  }, [replayToken]);

  const spring = { type: "spring" as const, stiffness, damping };

  // Rubber-band: value goes slightly past 0 or 1 at ends
  const displayValue = Math.max(0, Math.min(1, value));

  const heightSpring = useSpring(TRACK_H_BASE, spring);
  const labelScale = useSpring(0, spring);
  const labelY = useSpring(0, spring);

  React.useEffect(() => {
    heightSpring.set(pressed ? TRACK_H_BASE * expandHeight : TRACK_H_BASE);
    labelScale.set(pressed ? 1 : 0);
    labelY.set(pressed ? 0 : 6);
  }, [pressed, expandHeight, heightSpring, labelScale, labelY]);

  const handlePointer = React.useCallback((e: React.PointerEvent) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const raw = (e.clientX - rect.left) / rect.width;
    // Rubber-band at ends
    const clamped = Math.max(0, Math.min(1, raw));
    const overshoot = raw - clamped;
    setValue(clamped + overshoot * 0.3);
  }, []);

  const percent = Math.round(displayValue * 100);
  const thumbX = displayValue * TRACK_W;

  return (
    <div key={replayToken} className="flex flex-col items-center gap-6" style={{ width: TRACK_W }}>
      {/* Value label */}
      <motion.div
        style={{ scale: labelScale, y: labelY, opacity: labelScale }}
        className="text-small text-secondary font-mono tabular-nums"
      >
        {percent}%
      </motion.div>

      {/* Track container — fixed height container prevents layout shift */}
      <div
        className="relative flex items-center"
        style={{ width: TRACK_W, height: TRACK_H_BASE * expandHeight + 8 }}
      >
        {/* Track background */}
        <div
          className="absolute rounded-pill overflow-hidden"
          style={{
            left: 0,
            width: TRACK_W,
            background: "var(--color-separator)",
          }}
        >
          <motion.div
            style={{ height: heightSpring }}
            className="relative rounded-pill overflow-hidden w-full"
          >
            {/* Filled portion */}
            <div
              className="absolute inset-y-0 left-0 rounded-pill"
              style={{
                width: `${displayValue * 100}%`,
                background: accentColor,
              }}
            />
          </motion.div>
        </div>

        {/* Invisible full-width drag target */}
        <div
          ref={trackRef}
          className="absolute inset-0 cursor-pointer"
          onPointerDown={(e) => {
            setPressed(true);
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            handlePointer(e);
          }}
          onPointerMove={(e) => { if (pressed) handlePointer(e); }}
          onPointerUp={() => {
            setPressed(false);
            // Snap back from rubber-band
            setValue((v) => Math.max(0, Math.min(1, v)));
          }}
        />

        {/* Thumb */}
        <motion.div
          animate={{ x: thumbX - 12 }}
          transition={spring}
          style={{
            position: "absolute",
            top: "50%",
            translateY: "-50%",
            left: 0,
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
            pointerEvents: "none",
          }}
        />
      </div>

      <p className="text-small text-secondary">Drag to scrub</p>
    </div>
  );
}

export const iosSliderEffect: Effect = {
  id: "ios-slider",
  name: "iOS Slider",
  description: "Fluid slider: track expands on press, value label pops, rubber-band at ends.",
  category: "Forms & inputs" as unknown as Effect["category"],
  icon: <SlidersHorizontal size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import * as React from "react";
import { motion, useSpring } from "motion/react";

const SPRING = { type: "spring", stiffness: ${n(p.stiffness)}, damping: ${n(p.damping)} };
const TRACK_W = 280;
const H_BASE = 6;
const H_EXPANDED = ${n(Number(p.expandHeight) * 6)};

export function IOSSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [pressed, setPressed] = React.useState(false);
  const trackRef = React.useRef(null);
  const height = useSpring(H_BASE, SPRING);

  React.useEffect(() => { height.set(pressed ? H_EXPANDED : H_BASE); }, [pressed, height]);

  const handlePointer = (e) => {
    const rect = trackRef.current.getBoundingClientRect();
    const raw = (e.clientX - rect.left) / rect.width;
    const clamped = Math.max(0, Math.min(1, raw));
    onChange(clamped + (raw - clamped) * 0.3);
  };

  return (
    <div style={{ position: "relative", width: TRACK_W }} ref={trackRef}
      onPointerDown={(e) => { setPressed(true); e.currentTarget.setPointerCapture(e.pointerId); handlePointer(e); }}
      onPointerMove={(e) => { if (pressed) handlePointer(e); }}
      onPointerUp={() => { setPressed(false); onChange(Math.max(0, Math.min(1, value))); }}>
      <motion.div style={{ height, background: "#e5e7eb", borderRadius: 9999, overflow: "hidden" }}>
        <div style={{ width: \`\${value * 100}%\`, height: "100%", background: "${String(p.accentColor)}" }} />
      </motion.div>
      <motion.div animate={{ x: value * TRACK_W - 12 }} transition={SPRING}
        style={{ position: "absolute", top: "50%", translateY: "-50%", left: 0,
          width: 24, height: 24, borderRadius: "50%", background: "white",
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)" }} />
    </div>
  );
}`,
  },
};

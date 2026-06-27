import * as React from "react";
import { motion } from "motion/react";
import { Pipette } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "stiffness", type: "slider", label: "Spring stiffness", min: 100, max: 800, step: 10, default: 380 },
  { id: "damping", type: "slider", label: "Spring damping", min: 5, max: 40, step: 1, default: 22 },
  { id: "thumbSize", type: "slider", label: "Thumb size", min: 12, max: 28, step: 1, default: 18, unit: "px" },
] as const;

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return [Math.round(f(5) * 255), Math.round(f(3) * 255), Math.round(f(1) * 255)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const stiffness = Number(params.stiffness);
  const damping = Number(params.damping);
  const thumbSize = Number(params.thumbSize);

  const [hue, setHue] = React.useState(210);
  const [sat, setSat] = React.useState(0.75);
  const [val, setVal] = React.useState(0.85);

  React.useEffect(() => {
    if (replayToken > 0) {
      setHue(210);
      setSat(0.75);
      setVal(0.85);
    }
  }, [replayToken]);

  const fieldRef = React.useRef<HTMLDivElement>(null);
  const hueRef = React.useRef<HTMLDivElement>(null);

  const [rgb] = React.useMemo(() => {
    const rgb = hsvToRgb(hue, sat, 1 - val);
    return [rgb];
  }, [hue, sat, val]);

  const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
  const swatchColor = `hsl(${hue}, ${Math.round(sat * 100)}%, ${Math.round((1 - val * 0.5) * 100)}%)`;

  const handleFieldPointer = React.useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = fieldRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setSat(x);
    setVal(y);
  }, []);

  const handleHuePointer = React.useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = hueRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHue(Math.round(x * 360));
  }, []);

  const [fieldDragging, setFieldDragging] = React.useState(false);
  const [hueDragging, setHueDragging] = React.useState(false);

  const spring = { type: "spring" as const, stiffness, damping };

  return (
    <div key={replayToken} className="flex flex-col items-center gap-4" style={{ width: 280 }}>
      {/* Saturation / value field */}
      <div
        ref={fieldRef}
        className="relative rounded-control overflow-hidden select-none cursor-crosshair"
        style={{ width: 280, height: 180 }}
        onPointerDown={(e) => {
          setFieldDragging(true);
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          handleFieldPointer(e);
        }}
        onPointerMove={(e) => { if (fieldDragging) handleFieldPointer(e); }}
        onPointerUp={() => setFieldDragging(false)}
      >
        <div
          className="absolute inset-0"
          style={{ background: `hsl(${hue}, 100%, 50%)` }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to right, #fff 0%, transparent 100%)" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, transparent 0%, #000 100%)" }}
        />
        {/* Thumb */}
        <motion.div
          animate={{ x: sat * 280 - thumbSize / 2, y: val * 180 - thumbSize / 2 }}
          transition={spring}
          style={{
            position: "absolute",
            width: thumbSize,
            height: thumbSize,
            borderRadius: "50%",
            border: "2px solid white",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.4)",
            background: hex,
            pointerEvents: "none",
            top: 0,
            left: 0,
          }}
        />
      </div>

      {/* Hue slider */}
      <div
        ref={hueRef}
        className="relative rounded-pill select-none cursor-pointer"
        style={{
          width: 280,
          height: 14,
          background:
            "linear-gradient(to right, hsl(0,100%,50%), hsl(30,100%,50%), hsl(60,100%,50%), hsl(90,100%,50%), hsl(120,100%,50%), hsl(150,100%,50%), hsl(180,100%,50%), hsl(210,100%,50%), hsl(240,100%,50%), hsl(270,100%,50%), hsl(300,100%,50%), hsl(330,100%,50%), hsl(360,100%,50%))",
        }}
        onPointerDown={(e) => {
          setHueDragging(true);
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          handleHuePointer(e);
        }}
        onPointerMove={(e) => { if (hueDragging) handleHuePointer(e); }}
        onPointerUp={() => setHueDragging(false)}
      >
        <motion.div
          animate={{ x: (hue / 360) * 280 - 8 }}
          transition={spring}
          style={{
            position: "absolute",
            top: -3,
            left: 0,
            width: 20,
            height: 20,
            borderRadius: "50%",
            border: "2px solid white",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.35)",
            background: `hsl(${hue}, 100%, 50%)`,
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Swatch + hex value */}
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ background: swatchColor }}
          transition={spring}
          className="rounded-control"
          style={{ width: 36, height: 36 }}
        />
        <motion.p
          animate={{ color: swatchColor }}
          transition={spring}
          className="text-strong font-mono text-sm"
        >
          {hex}
        </motion.p>
      </div>
    </div>
  );
}

export const colorPickerEffect: Effect = {
  id: "color-picker",
  name: "Color Picker",
  description: "Animated hue/saturation field — spring thumb and morphing swatch.",
  category: "Forms & inputs" as unknown as Effect["category"],
  icon: <Pipette size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import * as React from "react";
import { motion } from "motion/react";

const SPRING = { type: "spring", stiffness: ${n(p.stiffness)}, damping: ${n(p.damping)} };
const THUMB = ${n(p.thumbSize)};

export function AnimatedColorPicker() {
  const [hue, setHue] = React.useState(210);
  const [sat, setSat] = React.useState(0.75);
  const [val, setVal] = React.useState(0.85);
  const hex = hsvToHex(hue, sat, 1 - val);
  return (
    <div style={{ width: 280, display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Sat/val field */}
      <div style={{ position: "relative", width: 280, height: 180 }}
        onPointerDown={/* ... */ undefined}>
        <motion.div animate={{ x: sat * 280 - THUMB / 2, y: val * 180 - THUMB / 2 }}
          transition={SPRING}
          style={{ position: "absolute", width: THUMB, height: THUMB,
            borderRadius: "50%", border: "2px solid white", background: hex }} />
      </div>
      {/* Hue rail */}
      <div style={{ position: "relative", height: 14, borderRadius: 9999 }}>
        <motion.div animate={{ x: (hue / 360) * 280 - 8 }} transition={SPRING}
          style={{ position: "absolute", width: 20, height: 20, borderRadius: "50%",
            background: \`hsl(\${hue}, 100%, 50%)\`, border: "2px solid white" }} />
      </div>
      {/* Swatch */}
      <motion.div animate={{ background: \`hsl(\${hue},\${sat*100}%,50%)\` }}
        transition={SPRING} style={{ width: 36, height: 36, borderRadius: 8 }} />
    </div>
  );
}`,
  },
};

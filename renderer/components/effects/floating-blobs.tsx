import { motion } from "motion/react";
import { Droplets } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "count", type: "slider", label: "Blob count", min: 3, max: 14, step: 1, default: 8 },
  { id: "size", type: "slider", label: "Max size", min: 20, max: 90, step: 2, default: 48, unit: "px" },
  { id: "duration", type: "slider", label: "Float time", min: 3, max: 16, step: 1, default: 8, unit: "s" },
  { id: "blur", type: "slider", label: "Blur", min: 0, max: 30, step: 1, default: 6, unit: "px" },
  { id: "color", type: "color", label: "Color", default: "#60a5fa" },
] as const;

// Deterministic pseudo-random so preview & export stay stable per index.
function rnd(seed: number) {
  const x = Math.sin(seed * 99.7) * 43758.5453;
  return x - Math.floor(x);
}

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const count = Number(params.count);
  const maxSize = Number(params.size);
  const dur = Number(params.duration);
  return (
    <div
      key={replayToken}
      className="relative rounded-panel overflow-hidden bg-control border border-separator"
      style={{ width: 360, height: 240 }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const s = 16 + rnd(i + 1) * (maxSize - 16);
        const left = rnd(i + 2) * 320;
        const top = rnd(i + 3) * 200;
        const drift = 20 + rnd(i + 4) * 40;
        return (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              width: s,
              height: s,
              left,
              top,
              background: String(params.color),
              filter: `blur(${Number(params.blur)}px)`,
              opacity: 0.5,
            }}
            animate={{ y: [0, -drift, 0, drift, 0], x: [0, drift * 0.5, 0] }}
            transition={{ duration: dur * (0.7 + rnd(i + 5) * 0.6), repeat: Infinity, ease: "easeInOut" }}
          />
        );
      })}
    </div>
  );
}

export const floatingBlobsEffect: Effect = {
  id: "floating-blobs",
  name: "Floating Blobs",
  description: "Soft circles drifting gently around the canvas.",
  category: "Backgrounds & ambient",
  icon: <Droplets size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  supportsTexture: true,
  exports: {
    react: (p) => `import { motion } from "motion/react";

function rnd(seed: number) {
  const x = Math.sin(seed * 99.7) * 43758.5453;
  return x - Math.floor(x);
}

export function FloatingBlobs({ count = ${n(p.count)} }: { count?: number }) {
  return (
    <div style={{ position: "relative", overflow: "hidden", width: "100%", height: "100%" }}>
      {Array.from({ length: count }).map((_, i) => {
        const s = 16 + rnd(i + 1) * ${n(Number(p.size) - 16)};
        const drift = 20 + rnd(i + 4) * 40;
        return (
          <motion.span key={i}
            style={{ position: "absolute", borderRadius: "9999px", width: s, height: s,
              left: rnd(i + 2) * 320, top: rnd(i + 3) * 200,
              background: "${p.color}", filter: "blur(${n(p.blur)}px)", opacity: 0.5 }}
            animate={{ y: [0, -drift, 0, drift, 0], x: [0, drift * 0.5, 0] }}
            transition={{ duration: ${n(p.duration)} * (0.7 + rnd(i + 5) * 0.6), repeat: Infinity, ease: "easeInOut" }} />
        );
      })}
    </div>
  );
}`,
  },
};

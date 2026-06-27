import { motion } from "motion/react";
import { Sparkle } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "duration", type: "slider", label: "Drift speed", min: 4, max: 24, step: 1, default: 12, unit: "s" },
  { id: "blur", type: "slider", label: "Blur", min: 20, max: 120, step: 2, default: 60, unit: "px" },
  { id: "intensity", type: "slider", label: "Intensity", min: 20, max: 100, step: 1, default: 70, unit: "%" },
  { id: "c1", type: "color", label: "Color 1", default: "#22d3ee" },
  { id: "c2", type: "color", label: "Color 2", default: "#a855f7" },
  { id: "c3", type: "color", label: "Color 3", default: "#ec4899" },
] as const;

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const dur = Number(params.duration);
  const blur = Number(params.blur);
  const op = Number(params.intensity) / 100;
  return (
    <div
      key={replayToken}
      className="relative rounded-panel overflow-hidden bg-black"
      style={{ width: 360, height: 240 }}
    >
      <motion.div
        className="absolute rounded-full"
        style={{ width: 260, height: 260, background: String(params.c1), filter: `blur(${blur}px)`, opacity: op }}
        animate={{ x: [-40, 120, 20, -40], y: [-30, 40, 120, -30] }}
        transition={{ duration: dur, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{ width: 220, height: 220, background: String(params.c2), filter: `blur(${blur}px)`, opacity: op }}
        animate={{ x: [180, 40, 200, 180], y: [120, 20, 90, 120] }}
        transition={{ duration: dur * 1.3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{ width: 200, height: 200, background: String(params.c3), filter: `blur(${blur}px)`, opacity: op }}
        animate={{ x: [80, 160, 0, 80], y: [60, 140, 30, 60] }}
        transition={{ duration: dur * 0.8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export const auroraEffect: Effect = {
  id: "aurora",
  name: "Aurora",
  description: "Soft blurred color blobs drifting like northern lights.",
  category: "Backgrounds & ambient",
  icon: <Sparkle size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  supportsTexture: true,
  exports: {
    react: (p) => `import { motion } from "motion/react";

export function Aurora() {
  const blob = { position: "absolute", borderRadius: "9999px", filter: "blur(${n(p.blur)}px)", opacity: ${n(Number(p.intensity) / 100)} } as const;
  return (
    <div style={{ position: "relative", overflow: "hidden", background: "#000", width: "100%", height: "100%" }}>
      <motion.div style={{ ...blob, width: 260, height: 260, background: "${p.c1}" }}
        animate={{ x: [-40, 120, 20, -40], y: [-30, 40, 120, -30] }}
        transition={{ duration: ${n(p.duration)}, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div style={{ ...blob, width: 220, height: 220, background: "${p.c2}" }}
        animate={{ x: [180, 40, 200, 180], y: [120, 20, 90, 120] }}
        transition={{ duration: ${n(Number(p.duration) * 1.3)}, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div style={{ ...blob, width: 200, height: 200, background: "${p.c3}" }}
        animate={{ x: [80, 160, 0, 80], y: [60, 140, 30, 60] }}
        transition={{ duration: ${n(Number(p.duration) * 0.8)}, repeat: Infinity, ease: "easeInOut" }} />
    </div>
  );
}`,
  },
};

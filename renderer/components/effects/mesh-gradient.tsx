import { motion } from "motion/react";
import { Grid2x2 } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "duration", type: "slider", label: "Flow speed", min: 4, max: 24, step: 1, default: 10, unit: "s" },
  { id: "radius", type: "slider", label: "Corner radius", min: 0, max: 32, step: 1, default: 16, unit: "px" },
  { id: "c1", type: "color", label: "Color 1", default: "#f97316" },
  { id: "c2", type: "color", label: "Color 2", default: "#8b5cf6" },
  { id: "c3", type: "color", label: "Color 3", default: "#06b6d4" },
  { id: "c4", type: "color", label: "Color 4", default: "#ec4899" },
] as const;

function mesh(p: EffectParams, a: string) {
  return (
    `radial-gradient(at ${a === "a" ? "20% 20%" : "80% 30%"}, ${p.c1} 0px, transparent 50%),` +
    `radial-gradient(at ${a === "a" ? "80% 0%" : "10% 70%"}, ${p.c2} 0px, transparent 50%),` +
    `radial-gradient(at ${a === "a" ? "0% 80%" : "70% 80%"}, ${p.c3} 0px, transparent 50%),` +
    `radial-gradient(at ${a === "a" ? "80% 80%" : "30% 10%"}, ${p.c4} 0px, transparent 50%)`
  );
}

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  return (
    <motion.div
      key={replayToken}
      style={{
        width: 360,
        height: 240,
        borderRadius: Number(params.radius),
        backgroundColor: String(params.c1),
      }}
      animate={{ backgroundImage: [mesh(params, "a"), mesh(params, "b"), mesh(params, "a")] }}
      transition={{ duration: Number(params.duration), repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export const meshGradientEffect: Effect = {
  id: "mesh-gradient",
  name: "Mesh Gradient",
  description: "Overlapping radial gradients that slowly shift around.",
  category: "Backgrounds & ambient",
  icon: <Grid2x2 size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  supportsTexture: true,
  exports: {
    react: (p) => `import { motion } from "motion/react";

const A = "${mesh(p, "a")}";
const B = "${mesh(p, "b")}";

export function MeshGradient() {
  return (
    <motion.div
      style={{ width: "100%", height: "100%", borderRadius: ${n(p.radius)}, backgroundColor: "${p.c1}" }}
      animate={{ backgroundImage: [A, B, A] }}
      transition={{ duration: ${n(p.duration)}, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}`,
  },
};

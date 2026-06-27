import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "count", type: "slider", label: "Particles", min: 6, max: 24, step: 1, default: 12 },
  { id: "distance", type: "slider", label: "Spread", min: 30, max: 120, step: 5, default: 70, unit: "px" },
  { id: "duration", type: "slider", label: "Duration", min: 0.4, max: 1.6, step: 0.1, default: 0.8, unit: "s" },
  { id: "color", type: "color", label: "Color", default: "#f43f5e" },
] as const;

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const [liked, setLiked] = React.useState(false);
  const [burst, setBurst] = React.useState(0);
  const count = Number(params.count);
  const dist = Number(params.distance);
  const dur = Number(params.duration);

  React.useEffect(() => {
    setLiked(false);
  }, [replayToken]);

  const fire = () => {
    setLiked((v) => !v);
    setBurst((b) => b + 1);
  };

  return (
    <div key={replayToken} className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
      <AnimatePresence>
        {Array.from({ length: count }).map((_, i) => {
          const angle = (i / count) * Math.PI * 2;
          return (
            <motion.span
              key={`${burst}-${i}`}
              className="absolute rounded-full"
              style={{ width: 8, height: 8, background: String(params.color) }}
              initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
              animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, scale: 0, opacity: 0 }}
              transition={{ duration: dur, ease: "easeOut" }}
            />
          );
        })}
      </AnimatePresence>
      <motion.button
        onClick={fire}
        whileTap={{ scale: 0.85 }}
        animate={{ scale: liked ? [1, 1.3, 1] : 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10"
      >
        <Heart size={48} fill={liked ? String(params.color) : "transparent"} color={String(params.color)} />
      </motion.button>
    </div>
  );
}

export const likeBurstEffect: Effect = {
  id: "like-burst",
  name: "Like Burst",
  description: "A heart that pops and showers particles when tapped.",
  category: "Micro-interactions",
  icon: <Heart size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import * as React from "react";
import { motion, AnimatePresence } from "motion/react";

export function LikeBurst() {
  const [liked, setLiked] = React.useState(false);
  const [burst, setBurst] = React.useState(0);
  const count = ${n(p.count)};
  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <AnimatePresence>
        {liked && Array.from({ length: count }).map((_, i) => {
          const a = (i / count) * Math.PI * 2;
          return (
            <motion.span key={burst + "-" + i}
              style={{ position: "absolute", width: 8, height: 8, borderRadius: "9999px", background: "${p.color}", left: "50%", top: "50%" }}
              initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
              animate={{ x: Math.cos(a) * ${n(p.distance)}, y: Math.sin(a) * ${n(p.distance)}, scale: 0, opacity: 0 }}
              transition={{ duration: ${n(p.duration)}, ease: "easeOut" }} />
          );
        })}
      </AnimatePresence>
      <motion.button onClick={() => { setLiked((v) => !v); setBurst((b) => b + 1); }} whileTap={{ scale: 0.85 }}
        animate={{ scale: liked ? [1, 1.3, 1] : 1 }}>
        ♥
      </motion.button>
    </div>
  );
}`,
  },
};

import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { FlipHorizontal2 } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "duration", type: "slider", label: "Duration", min: 0.3, max: 1.5, step: 0.1, default: 0.6, unit: "s" },
  { id: "stiffness", type: "slider", label: "Stiffness", min: 80, max: 400, step: 20, default: 200 },
  {
    id: "trigger",
    type: "select",
    label: "Trigger",
    options: [
      { value: "hover", label: "Hover" },
      { value: "click", label: "Click" },
    ],
    default: "hover",
  },
  { id: "frontColor", type: "color", label: "Front color", default: "#6366f1" },
  { id: "backColor", type: "color", label: "Back color", default: "#ec4899" },
] as const;

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const stiffness = Number(params.stiffness);
  const trigger = String(params.trigger);
  const frontColor = String(params.frontColor);
  const backColor = String(params.backColor);

  const rotateY = useMotionValue(0);
  const springY = useSpring(rotateY, { stiffness, damping: 30 });

  const flippedRef = React.useRef(false);

  React.useEffect(() => {
    rotateY.set(0);
    flippedRef.current = false;
  }, [replayToken, rotateY]);

  const frontOpacity = useTransform(springY, [-180, -90, 0, 90, 180], [1, 0, 1, 0, 1]);
  const backOpacity = useTransform(springY, [-180, -90, 0, 90, 180], [0, 1, 0, 1, 0]);

  const flipIn = () => rotateY.set(180);
  const flipOut = () => rotateY.set(0);
  const toggle = () => {
    flippedRef.current = !flippedRef.current;
    rotateY.set(flippedRef.current ? 180 : 0);
  };

  const interactionProps =
    trigger === "hover"
      ? { onPointerEnter: flipIn, onPointerLeave: flipOut }
      : { onClick: toggle };

  return (
    <div
      key={replayToken}
      className="flex items-center justify-center"
      style={{ width: 360, height: 240, perspective: 800 }}
    >
      <motion.div
        {...interactionProps}
        style={{
          width: 200,
          height: 260,
          transformStyle: "preserve-3d",
          rotateY: springY,
          cursor: "pointer",
          position: "relative",
        }}
      >
        {/* Front */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 16,
            background: frontColor,
            backfaceVisibility: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: frontOpacity,
          }}
        >
          <span className="text-white text-strong" style={{ fontSize: 24, fontWeight: 700 }}>
            Front
          </span>
        </motion.div>

        {/* Back */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 16,
            background: backColor,
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: backOpacity,
          }}
        >
          <span className="text-white text-strong" style={{ fontSize: 24, fontWeight: 700 }}>
            Back
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}

export const flipCardEffect: Effect = {
  id: "flip-card",
  name: "Flip Card",
  description: "A card that flips 180° on hover or click to reveal its back face.",
  category: "Micro-interactions",
  icon: <FlipHorizontal2 size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

export function FlipCard({ front, back }: { front: React.ReactNode; back: React.ReactNode }) {
  const rotateY = useMotionValue(0);
  const springY = useSpring(rotateY, { stiffness: ${n(p.stiffness)}, damping: 30 });
  ${
    p.trigger === "click"
      ? `const flippedRef = React.useRef(false);
  const toggle = () => {
    flippedRef.current = !flippedRef.current;
    rotateY.set(flippedRef.current ? 180 : 0);
  };`
      : ""
  }

  const frontOpacity = useTransform(springY, [-180, -90, 0, 90, 180], [1, 0, 1, 0, 1]);
  const backOpacity = useTransform(springY, [-180, -90, 0, 90, 180], [0, 1, 0, 1, 0]);

  return (
    <div style={{ perspective: 800 }}>
      <motion.div
        ${
          p.trigger === "hover"
            ? `onPointerEnter={() => rotateY.set(180)}
        onPointerLeave={() => rotateY.set(0)}`
            : `onClick={toggle}`
        }
        style={{
          transformStyle: "preserve-3d",
          rotateY: springY,
          cursor: "pointer",
          position: "relative",
          width: "100%",
          height: "100%",
        }}
      >
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 16,
            backfaceVisibility: "hidden",
            opacity: frontOpacity,
          }}
        >
          {front}
        </motion.div>
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 16,
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            opacity: backOpacity,
          }}
        >
          {back}
        </motion.div>
      </motion.div>
    </div>
  );
}`,
  },
};

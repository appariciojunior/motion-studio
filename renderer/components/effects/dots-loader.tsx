import { motion } from "motion/react";
import { Ellipsis } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "count", type: "slider", label: "Dots", min: 3, max: 6, step: 1, default: 3 },
  { id: "size", type: "slider", label: "Size", min: 6, max: 24, step: 1, default: 12, unit: "px" },
  { id: "gap", type: "slider", label: "Gap", min: 4, max: 24, step: 1, default: 10, unit: "px" },
  { id: "speed", type: "slider", label: "Speed", min: 0.4, max: 2, step: 0.1, default: 0.7, unit: "s" },
  {
    id: "motionType",
    type: "segmented",
    label: "Motion",
    options: [
      { value: "bounce", label: "Bounce" },
      { value: "pulse", label: "Pulse" },
    ],
    default: "bounce",
  },
  { id: "color", type: "color", label: "Color", default: "#3b82f6" },
] as const;

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const count = Number(params.count);
  const size = Number(params.size);
  const speed = Number(params.speed);
  const bounce = params.motionType === "bounce";
  return (
    <div key={replayToken} className="flex items-center" style={{ gap: Number(params.gap) }}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.span
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: 9999,
            background: params.color as string,
            display: "block",
          }}
          animate={bounce ? { y: [0, -size, 0] } : { scale: [1, 0.4, 1], opacity: [1, 0.4, 1] }}
          transition={{
            duration: speed,
            repeat: Infinity,
            ease: "easeInOut",
            delay: (i * speed) / (count * 1.6),
          }}
        />
      ))}
    </div>
  );
}

export const dotsLoaderEffect: Effect = {
  id: "dots-loader",
  name: "Dots Loader",
  description: "A row of dots that bounce or pulse in sequence.",
  category: "Loading & feedback",
  icon: <Ellipsis size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => {
      const bounce = p.motionType === "bounce";
      const anim = bounce
        ? `{ y: [0, -${n(p.size)}, 0] }`
        : `{ scale: [1, 0.4, 1], opacity: [1, 0.4, 1] }`;
      return `import { motion } from "motion/react";

const DOTS = ${n(p.count)};

export function DotsLoader() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: ${n(p.gap)} }}>
      {Array.from({ length: DOTS }).map((_, i) => (
        <motion.span
          key={i}
          style={{
            width: ${n(p.size)},
            height: ${n(p.size)},
            borderRadius: 9999,
            background: "${p.color}",
            display: "block",
          }}
          animate={${anim}}
          transition={{
            duration: ${n(p.speed)},
            repeat: Infinity,
            ease: "easeInOut",
            delay: (i * ${n(p.speed)}) / (DOTS * 1.6),
          }}
        />
      ))}
    </div>
  );
}`;
    },
    js: (p) => {
      const bounce = p.motionType === "bounce";
      const anim = bounce
        ? `{ y: [0, -${n(p.size)}, 0] }`
        : `{ scale: [1, 0.4, 1], opacity: [1, 0.4, 1] }`;
      return `import { animate } from "motion";

// container = wrapper element; this builds the dots and animates them.
export function dotsLoader(container) {
  const count = ${n(p.count)};
  Object.assign(container.style, { display: "flex", alignItems: "center", gap: "${n(p.gap)}px" });
  for (let i = 0; i < count; i++) {
    const dot = document.createElement("span");
    Object.assign(dot.style, {
      width: "${n(p.size)}px",
      height: "${n(p.size)}px",
      borderRadius: "9999px",
      background: "${p.color}",
      display: "block",
    });
    container.appendChild(dot);
    animate(dot, ${anim}, {
      duration: ${n(p.speed)},
      repeat: Infinity,
      ease: "easeInOut",
      delay: (i * ${n(p.speed)}) / (count * 1.6),
    });
  }
}`;
    },
    css: (p) => {
      const bounce = p.motionType === "bounce";
      const keyframes = bounce
        ? `@keyframes dot-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-${n(p.size)}px); }
}`
        : `@keyframes dot-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.4); opacity: 0.4; }
}`;
      const animName = bounce ? "dot-bounce" : "dot-pulse";
      const delays = Array.from({ length: Number(p.count) })
        .map(
          (_, i) =>
            `.dots span:nth-child(${i + 1}) { animation-delay: ${n(
              (i * Number(p.speed)) / (Number(p.count) * 1.6),
            )}s; }`,
        )
        .join("\n");
      return `.dots {
  display: flex;
  align-items: center;
  gap: ${n(p.gap)}px;
}

.dots span {
  width: ${n(p.size)}px;
  height: ${n(p.size)}px;
  border-radius: 9999px;
  background: ${p.color};
  animation: ${animName} ${n(p.speed)}s ease-in-out infinite;
}

${delays}

${keyframes}`;
    },
  },
};

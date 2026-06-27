import { motion } from "motion/react";
import { Radio } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "size", type: "slider", label: "Size", min: 8, max: 28, step: 1, default: 12, unit: "px" },
  { id: "rings", type: "slider", label: "Rings", min: 1, max: 3, step: 1, default: 2 },
  { id: "scale", type: "slider", label: "Spread", min: 1.6, max: 4, step: 0.1, default: 2.6, unit: "x" },
  { id: "speed", type: "slider", label: "Speed", min: 0.6, max: 3, step: 0.1, default: 1.4, unit: "s" },
  { id: "color", type: "color", label: "Color", default: "#ef4444" },
] as const;

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const size = Number(params.size);
  const rings = Number(params.rings);
  const speed = Number(params.speed);
  const scale = Number(params.scale);
  return (
    <div key={replayToken} style={{ position: "relative", width: size, height: size }}>
      {Array.from({ length: rings }).map((_, i) => (
        <motion.span
          key={i}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 9999,
            background: params.color as string,
          }}
          animate={{ scale: [1, scale], opacity: [0.6, 0] }}
          transition={{ duration: speed, repeat: Infinity, ease: "easeOut", delay: (i * speed) / rings }}
        />
      ))}
      <span
        style={{ position: "absolute", inset: 0, borderRadius: 9999, background: params.color as string }}
      />
    </div>
  );
}

export const pulsePingEffect: Effect = {
  id: "pulse-ping",
  name: "Pulse / Ping",
  description: "Notification dot with expanding, fading rings.",
  category: "Loading & feedback",
  icon: <Radio size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import { motion } from "motion/react";

const RINGS = ${n(p.rings)};

export function PulsePing() {
  return (
    <span style={{ position: "relative", display: "inline-block", width: ${n(p.size)}, height: ${n(p.size)} }}>
      {Array.from({ length: RINGS }).map((_, i) => (
        <motion.span
          key={i}
          style={{ position: "absolute", inset: 0, borderRadius: 9999, background: "${p.color}" }}
          animate={{ scale: [1, ${n(p.scale)}], opacity: [0.6, 0] }}
          transition={{ duration: ${n(p.speed)}, repeat: Infinity, ease: "easeOut", delay: (i * ${n(p.speed)}) / RINGS }}
        />
      ))}
      <span style={{ position: "absolute", inset: 0, borderRadius: 9999, background: "${p.color}" }} />
    </span>
  );
}`,
    js: (p) => `import { animate } from "motion";

// dot = the solid badge element; rings are appended around it.
export function pulsePing(dot) {
  const rings = ${n(p.rings)};
  dot.style.position = "relative";
  for (let i = 0; i < rings; i++) {
    const ring = document.createElement("span");
    Object.assign(ring.style, {
      position: "absolute",
      inset: "0",
      borderRadius: "9999px",
      background: "${p.color}",
    });
    dot.appendChild(ring);
    animate(ring, { scale: [1, ${n(p.scale)}], opacity: [0.6, 0] }, {
      duration: ${n(p.speed)},
      repeat: Infinity,
      ease: "easeOut",
      delay: (i * ${n(p.speed)}) / rings,
    });
  }
}`,
    css: (p) => {
      const delays = Array.from({ length: Number(p.rings) })
        .map(
          (_, i) =>
            `.ping span:nth-child(${i + 1}) { animation-delay: ${n(
              (i * Number(p.speed)) / Number(p.rings),
            )}s; }`,
        )
        .join("\n");
      return `.ping {
  position: relative;
  display: inline-block;
  width: ${n(p.size)}px;
  height: ${n(p.size)}px;
}

.ping span,
.ping::after {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background: ${p.color};
}

.ping::after {
  content: "";
}

.ping span {
  animation: ping ${n(p.speed)}s ease-out infinite;
}

${delays}

@keyframes ping {
  from { transform: scale(1); opacity: 0.6; }
  to { transform: scale(${n(p.scale)}); opacity: 0; }
}`;
    },
  },
};

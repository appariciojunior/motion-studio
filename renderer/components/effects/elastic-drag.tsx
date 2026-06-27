import { useRef } from "react";
import { motion, useMotionValue, useSpring, useVelocity, useTransform } from "motion/react";
import { Move } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "stiffness", type: "slider", label: "Spring stiffness", min: 100, max: 600, step: 50, default: 300 },
  { id: "damping", type: "slider", label: "Damping", min: 10, max: 40, step: 2, default: 20 },
  { id: "skew", type: "slider", label: "Skew amount", min: 0, max: 15, step: 1, default: 6, unit: "°" },
  { id: "mass", type: "slider", label: "Mass", min: 0.5, max: 3, step: 0.25, default: 1 },
  { id: "color", type: "color", label: "Card color", default: "#6366f1" },
] as const;

const CARDS = [
  { label: "Drag me", lighten: 0 },
  { label: "Pull hard", lighten: 0.15 },
  { label: "Snap back", lighten: 0.3 },
];

function lightenHex(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lr = Math.round(r + (255 - r) * amount);
  const lg = Math.round(g + (255 - g) * amount);
  const lb = Math.round(b + (255 - b) * amount);
  return `rgb(${lr},${lg},${lb})`;
}

function DraggableCard({
  label,
  color,
  stiffness,
  damping,
  mass,
  skewMax,
  constraintRef,
}: {
  label: string;
  color: string;
  stiffness: number;
  damping: number;
  mass: number;
  skewMax: number;
  constraintRef: React.RefObject<HTMLDivElement | null>;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness, damping, mass });
  const springY = useSpring(y, { stiffness, damping, mass });
  const vx = useVelocity(springX);
  const skewX = useTransform(vx, [-500, 500], [-skewMax, skewMax]);

  return (
    <motion.div
      drag
      dragConstraints={constraintRef}
      dragElastic={0.3}
      style={{ x: springX, y: springY, skewX }}
      whileDrag={{ scale: 1.05, zIndex: 10 }}
      onDragEnd={() => {
        x.set(0);
        y.set(0);
      }}
      className="cursor-grab active:cursor-grabbing select-none rounded-xl px-5 py-3 text-white font-semibold text-sm shadow-lg"
      style={{
        x: springX,
        y: springY,
        skewX,
        backgroundColor: color,
        boxShadow: `0 4px 20px ${color}55`,
        cursor: "grab",
        userSelect: "none",
        borderRadius: "12px",
        padding: "12px 20px",
        color: "#fff",
        fontWeight: 600,
        fontSize: "14px",
      }}
    >
      {label}
    </motion.div>
  );
}

function Preview({ params }: { params: EffectParams }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stiffness = Number(params.stiffness);
  const damping = Number(params.damping);
  const skewMax = Number(params.skew);
  const mass = Number(params.mass);
  const baseColor = String(params.color);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "24px",
        overflow: "hidden",
      }}
    >
      {CARDS.map((card) => (
        <DraggableCard
          key={card.label}
          label={card.label}
          color={lightenHex(baseColor, card.lighten)}
          stiffness={stiffness}
          damping={damping}
          mass={mass}
          skewMax={skewMax}
          constraintRef={containerRef}
        />
      ))}
    </div>
  );
}

export const elasticDragEffect: Effect = {
  id: "elastic-drag",
  name: "Elastic Drag",
  description: "Drag elements with rubbery elastic physics that snap back",
  category: "Micro-interactions",
  icon: <Move size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import { useRef } from "react";
import { motion, useMotionValue, useSpring, useVelocity, useTransform } from "motion/react";

function DraggableCard({ label, color, constraintRef }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: ${n(p.stiffness)}, damping: ${n(p.damping)}, mass: ${n(p.mass)} });
  const springY = useSpring(y, { stiffness: ${n(p.stiffness)}, damping: ${n(p.damping)}, mass: ${n(p.mass)} });
  const vx = useVelocity(springX);
  const skewX = useTransform(vx, [-500, 500], [${-n(p.skew)}, ${n(p.skew)}]);

  return (
    <motion.div
      drag
      dragConstraints={constraintRef}
      dragElastic={0.3}
      style={{ x: springX, y: springY, skewX, backgroundColor: color }}
      whileDrag={{ scale: 1.05 }}
      onDragEnd={() => { x.set(0); y.set(0); }}
    >
      {label}
    </motion.div>
  );
}

export function ElasticDrag() {
  const ref = useRef(null);
  return (
    <div ref={ref} style={{ position: "relative", display: "flex", gap: 24, padding: 40 }}>
      {["Drag me", "Pull hard", "Snap back"].map((label) => (
        <DraggableCard key={label} label={label} color="${p.color}" constraintRef={ref} />
      ))}
    </div>
  );
}`,
  },
};

import { useRef } from "react";
import { motion } from "motion/react";
import { ScrollText } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "distance", type: "slider", label: "Slide distance", min: 20, max: 80, step: 4, default: 40, unit: "px" },
  { id: "duration", type: "slider", label: "Duration", min: 0.3, max: 1, step: 0.05, default: 0.5, unit: "s" },
  { id: "stagger", type: "slider", label: "Stagger", min: 0.05, max: 0.3, step: 0.05, default: 0.1, unit: "s" },
  {
    id: "easing",
    type: "segmented",
    label: "Easing",
    options: [
      { value: "easeOut", label: "Ease Out" },
      { value: "spring", label: "Spring" },
    ],
    default: "easeOut",
  },
] as const;

const CARDS = [
  { title: "Design system", desc: "Consistent tokens across all surfaces", tag: "UI", color: "#6366f1" },
  { title: "Accessibility", desc: "WCAG 2.1 AA compliance built in", tag: "A11y", color: "#10b981" },
  { title: "Performance", desc: "Sub-100ms interaction budgets", tag: "Perf", color: "#f59e0b" },
  { title: "Dark mode", desc: "Adaptive palettes with no extra config", tag: "Theme", color: "#8b5cf6" },
  { title: "Animations", desc: "Physics-based spring transitions", tag: "Motion", color: "#ec4899" },
  { title: "Responsive", desc: "Fluid grids from 320 px to 4K", tag: "Layout", color: "#14b8a6" },
  { title: "Localisation", desc: "RTL support and ICU message format", tag: "i18n", color: "#f97316" },
];

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const distance = Number(params.distance);
  const duration = Number(params.duration);
  const stagger = Number(params.stagger);
  const easing = String(params.easing);
  const scrollRef = useRef<HTMLDivElement>(null);

  // On replay, scroll container back to top so cards can reveal again
  const handleRef = (el: HTMLDivElement | null) => {
    (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    if (el) el.scrollTop = 0;
  };

  const transition = (index: number) =>
    easing === "spring"
      ? { type: "spring" as const, stiffness: 260, damping: 20, delay: index * stagger }
      : { duration, ease: [0.23, 1, 0.32, 1] as const, delay: index * stagger };

  return (
    <div
      key={replayToken}
      ref={handleRef}
      style={{
        height: 280,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: "4px 2px 16px",
        scrollbarWidth: "thin",
      }}
    >
      {CARDS.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: distance }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={transition(i)}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10,
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              background: card.color + "22",
              color: card.color,
              borderRadius: 6,
              padding: "2px 8px",
              fontSize: 11,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {card.tag}
          </span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#e8e8ee" }}>{card.title}</div>
            <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{card.desc}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export const scrollRevealEffect: Effect = {
  id: "scroll-reveal",
  name: "Scroll Reveal",
  description: "Elements animate in as they enter the viewport while scrolling",
  category: "Transitions & lists",
  icon: <ScrollText size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import { motion } from "motion/react";

const ITEMS = [
  { title: "Item one", desc: "Short supporting description" },
  { title: "Item two", desc: "Short supporting description" },
  { title: "Item three", desc: "Short supporting description" },
];

export function ScrollReveal() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {ITEMS.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: ${n(p.distance)} }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={${
            p.easing === "spring"
              ? `{ type: "spring", stiffness: 260, damping: 20, delay: i * ${n(p.stagger)} }`
              : `{ duration: ${n(p.duration)}, ease: "easeOut", delay: i * ${n(p.stagger)} }`
          }}
        >
          <strong>{item.title}</strong>
          <p>{item.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}`,
  },
};

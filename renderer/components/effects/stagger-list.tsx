import { motion } from "motion/react";
import { ListChecks } from "lucide-react";
import { type Effect, type EffectParams, n, parseBezier, bezierArray } from "./types";

const controls = [
  {
    id: "direction",
    type: "segmented",
    label: "Enter from",
    default: "up",
    options: [
      { value: "up", label: "Up" },
      { value: "down", label: "Down" },
      { value: "left", label: "Left" },
    ],
  },
  { id: "stagger", type: "slider", label: "Stagger delay", min: 0.02, max: 0.3, step: 0.01, default: 0.08, unit: "s" },
  { id: "duration", type: "slider", label: "Item duration", min: 0.2, max: 1, step: 0.05, default: 0.4, unit: "s" },
  { id: "distance", type: "slider", label: "Distance", min: 8, max: 80, step: 2, default: 24, unit: "px" },
  { id: "spring", type: "switch", label: "Spring physics", default: false },
  { id: "curve", type: "bezier", label: "Easing curve", default: "0,0,0.58,1", visibleWhen: (p: EffectParams) => p.spring !== true },
] as const;

function hiddenState(p: EffectParams) {
  const d = Number(p.distance);
  switch (p.direction) {
    case "down":
      return { opacity: 0, y: -d };
    case "left":
      return { opacity: 0, x: d };
    default:
      return { opacity: 0, y: d };
  }
}

function itemTransition(p: EffectParams) {
  return p.spring
    ? { type: "spring" as const, stiffness: 320, damping: 24 }
    : { duration: Number(p.duration), ease: parseBezier(p.curve) };
}

const rows = ["Design review", "Ship release notes", "Sync with team", "Plan next sprint", "Close the loop"];

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const hidden = hiddenState(params);
  return (
    <motion.div
      key={replayToken}
      className="w-full max-w-xl flex flex-col gap-2"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: Number(params.stagger) } } }}
    >
      {rows.map((row, i) => (
        <motion.div
          key={i}
          className="rounded-card bg-control border border-separator px-4 py-3 flex items-center gap-3"
          variants={{ hidden, show: { opacity: 1, x: 0, y: 0, transition: itemTransition(params) } }}
        >
          <span className="size-2 rounded-full bg-accent shrink-0" />
          <span className="text-regular">{row}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

export const staggerListEffect: Effect = {
  id: "stagger-list",
  name: "Stagger List",
  description: "List items that cascade in one after another.",
  category: "Transitions & lists",
  icon: <ListChecks size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => {
      const hidden = JSON.stringify(hiddenState(p));
      const trans = p.spring
        ? `{ type: "spring", stiffness: 320, damping: 24 }`
        : `{ duration: ${n(p.duration)}, ease: ${bezierArray(p.curve)} }`;
      return `import { motion } from "motion/react";

export function StaggerList({ items }: { items: React.ReactNode[] }) {
  return (
    <motion.ul
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: ${n(p.stagger)} } } }}
    >
      {items.map((item, i) => (
        <motion.li
          key={i}
          variants={{
            hidden: ${hidden},
            show: { opacity: 1, x: 0, y: 0, transition: ${trans} },
          }}
        >
          {item}
        </motion.li>
      ))}
    </motion.ul>
  );
}`;
    },
    js: (p) => {
      const hidden = hiddenState(p) as unknown as Record<string, number>;
      const finals: Record<string, number> = { opacity: 1, x: 0, y: 0 };
      const enter = Object.keys(hidden)
        .map((k) => `${k}: [${hidden[k]}, ${finals[k]}]`)
        .join(", ");
      const trans = p.spring
        ? `type: "spring", stiffness: 320, damping: 24`
        : `duration: ${n(p.duration)}, ease: ${bezierArray(p.curve)}`;
      return `import { animate, stagger } from "motion";

// selector = the list items to cascade in (e.g. ".item" or a NodeList).
export function staggerList(selector) {
  return animate(
    selector,
    { ${enter} },
    { ${trans}, delay: stagger(${n(p.stagger)}) }
  );
}`;
    },
  },
};

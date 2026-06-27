import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ListCollapse } from "lucide-react";
import { type Effect, type EffectParams, n, parseBezier, bezierArray } from "./types";

const ITEMS = [
  { id: "a", question: "What is Motion?", answer: "Motion is a production-ready animation library for React. It ships with a simple, yet powerful API that solves the hardest part of animation." },
  { id: "b", question: "How does layout animation work?", answer: "Motion's layout prop tells the component to animate its layout changes. Under the hood it uses the FLIP technique to smoothly interpolate between states." },
  { id: "c", question: "Can I use spring physics?", answer: "Yes. Pass type: 'spring' to any transition — or omit the type and Motion will choose the best default for the animated property." },
  { id: "d", question: "What about exit animations?", answer: "Wrap your components in AnimatePresence and provide an exit prop. Motion will hold the element in the DOM until its exit animation finishes." },
];

const controls = [
  { id: "duration", type: "slider", label: "Duration", min: 0.1, max: 0.8, step: 0.05, default: 0.3, unit: "s" },
  { id: "curve", type: "bezier", label: "Easing curve", default: "0.4,0,0.2,1" },
  { id: "singleOpen", type: "switch", label: "Single open at a time", default: true },
] as const;

function AccordionItem({
  id,
  question,
  answer,
  isOpen,
  onToggle,
  duration,
  ease,
}: {
  id: string;
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
  duration: number;
  ease: [number, number, number, number];
}) {
  return (
    <div className="border-b border-separator last:border-b-0">
      <button
        className="w-full flex items-center justify-between px-4 py-3.5 text-left select-none"
        onClick={() => onToggle(id)}
      >
        <span className="text-strong" style={{ fontSize: 14 }}>{question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration, ease }}
          style={{ display: "flex", alignItems: "center", color: "var(--color-text-secondary)", flexShrink: 0, marginLeft: 12 }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 5L7 9.5L11.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration, ease }}
            style={{ overflow: "hidden" }}
          >
            <p className="text-small text-secondary px-4 pb-4" style={{ lineHeight: 1.6 }}>
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const duration = Number(params.duration);
  const ease = parseBezier(params.curve);
  const singleOpen = params.singleOpen === true;
  const [openIds, setOpenIds] = React.useState<Set<string>>(new Set(["a"]));

  React.useEffect(() => {
    setOpenIds(new Set(["a"]));
  }, [replayToken]);

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (singleOpen) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div key={replayToken} className="w-full max-w-xl rounded-panel border border-separator overflow-hidden bg-elevated">
      {ITEMS.map((item) => (
        <AccordionItem
          key={item.id}
          id={item.id}
          question={item.question}
          answer={item.answer}
          isOpen={openIds.has(item.id)}
          onToggle={toggle}
          duration={duration}
          ease={ease}
        />
      ))}
    </div>
  );
}

export const accordionEffect: Effect = {
  id: "accordion",
  name: "Accordion",
  description: "Expand/collapse items with animated height, chevron rotation, and fade.",
  category: "Overlays & dialogs",
  icon: <ListCollapse size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import * as React from "react";
import { AnimatePresence, motion } from "motion/react";

const TRANSITION = { duration: ${n(p.duration)}, ease: ${bezierArray(p.curve)} };
const SINGLE_OPEN = ${p.singleOpen === true};

function AccordionItem({ question, answer, isOpen, onToggle }: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <button onClick={onToggle} style={{ display: "flex", width: "100%", justifyContent: "space-between", padding: "14px 16px" }}>
        <span>{question}</span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={TRANSITION}>
          ▼
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={TRANSITION}
            style={{ overflow: "hidden" }}
          >
            <p style={{ padding: "0 16px 14px" }}>{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Accordion({ items }: { items: { id: string; question: string; answer: string }[] }) {
  const [openIds, setOpenIds] = React.useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); }
      else { if (SINGLE_OPEN) next.clear(); next.add(id); }
      return next;
    });
  };

  return (
    <div>
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          question={item.question}
          answer={item.answer}
          isOpen={openIds.has(item.id)}
          onToggle={() => toggle(item.id)}
        />
      ))}
    </div>
  );
}`,
    css: (p) => `/* Pure CSS accordion — no JS animation library needed. */
.accordion-item {
  border-bottom: 1px solid #e5e7eb;
}

.accordion-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 14px 16px;
  cursor: pointer;
  background: none;
  border: none;
}

.accordion-trigger[aria-expanded="true"] .chevron {
  transform: rotate(180deg);
}

.chevron {
  transition: transform ${n(p.duration)}s ${bezierCss(p.curve)};
}

.accordion-content {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows ${n(p.duration)}s ${bezierCss(p.curve)};
}

.accordion-content[aria-hidden="false"] {
  grid-template-rows: 1fr;
}

.accordion-inner {
  overflow: hidden;
  padding: 0 16px;
}`,
  },
};

function bezierCss(value: import("./types").ParamValue): string {
  const parts = String(value)
    .split(",")
    .map((s) => Math.round(Number(s.trim()) * 100) / 100);
  const [a = 0, b = 0, c = 1, d = 1] = parts;
  return `cubic-bezier(${a}, ${b}, ${c}, ${d})`;
}

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Info } from "lucide-react";
import { type Effect, type EffectParams, n, parseBezier, bezierArray } from "./types";

// Tooltip with a delay group: the first tooltip waits, but once one is showing,
// moving to a sibling opens instantly (the Radix / Base UI behaviour). Hover the
// three chips to feel the difference.
const controls = [
  { id: "delay", type: "slider", label: "Open delay", min: 0, max: 1000, step: 50, default: 400, unit: "ms" },
  { id: "group", type: "switch", label: "Instant within group", default: true },
  { id: "duration", type: "slider", label: "Duration", min: 0.05, max: 0.3, step: 0.005, default: 0.125, unit: "s" },
  { id: "distance", type: "slider", label: "Lift distance", min: 0, max: 16, step: 1, default: 6, unit: "px" },
  { id: "scaleFrom", type: "slider", label: "Scale from", min: 0.85, max: 1, step: 0.01, default: 0.96 },
  { id: "curve", type: "bezier", label: "Easing curve", default: "0,0,0.2,1" },
] as const;

const CHIPS = ["Bold", "Italic", "Link"];
const HINTS = ["Make text bold", "Italicise text", "Insert a link"];

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const delay = Number(params.delay);
  const group = params.group === true;
  const duration = Number(params.duration);
  const distance = Number(params.distance);
  const scaleFrom = Number(params.scaleFrom);
  const ease = parseBezier(params.curve);

  const [active, setActive] = React.useState<number | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastClose = React.useRef(0);

  const show = (i: number) => {
    clearTimeout(timer.current);
    const instant = group && Date.now() - lastClose.current < 300;
    if (instant) setActive(i);
    else timer.current = setTimeout(() => setActive(i), delay);
  };
  const hide = () => {
    clearTimeout(timer.current);
    lastClose.current = Date.now();
    setActive(null);
  };

  React.useEffect(() => {
    if (replayToken > 0) {
      setActive(0);
      const t = setTimeout(() => setActive(null), 1200);
      return () => clearTimeout(t);
    }
  }, [replayToken]);

  React.useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div className="relative w-full max-w-xl aspect-[4/3] rounded-panel overflow-hidden bg-control border border-separator flex flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-2">
        {CHIPS.map((chip, i) => (
          <div key={chip} className="relative">
            <button
              onMouseEnter={() => show(i)}
              onMouseLeave={hide}
              onFocus={() => show(i)}
              onBlur={hide}
              className="rounded-control bg-elevated border border-separator px-3.5 py-1.5 text-regular"
            >
              {chip}
            </button>
            <AnimatePresence>
              {active === i && (
                <motion.div
                  style={{ transformOrigin: "bottom center" }}
                  initial={{ opacity: 0, y: distance, scale: scaleFrom }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: distance, scale: scaleFrom }}
                  transition={{ duration, ease }}
                  className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-control bg-elevated border border-separator px-2.5 py-1 text-small text-strong shadow-lg"
                >
                  {HINTS[i]}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
      <p className="text-small text-secondary">
        {group ? "Hover one, then slide across — neighbours open instantly." : "Each tooltip waits the full delay."}
      </p>
    </div>
  );
}

export const tooltipEffect: Effect = {
  id: "tooltip",
  name: "Tooltip",
  description: "Delayed tooltip that opens instantly once the group is active.",
  category: "Overlays & dialogs",
  icon: <Info size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import * as React from "react";
import { AnimatePresence, motion } from "motion/react";

const DELAY = ${n(p.delay)};
const TRANSITION = { duration: ${n(p.duration)}, ease: ${bezierArray(p.curve)} };
// Share one ref across all tooltips so siblings open instantly.
const lastClose = { t: 0 };

export function Tooltip({ label, children }: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const show = () => {
    clearTimeout(timer.current);
    const instant = ${p.group ? "Date.now() - lastClose.t < 300" : "false"};
    if (instant) setOpen(true);
    else timer.current = setTimeout(() => setOpen(true), DELAY);
  };
  const hide = () => {
    clearTimeout(timer.current);
    lastClose.t = Date.now();
    setOpen(false);
  };

  return (
    <span style={{ position: "relative" }} onMouseEnter={show} onMouseLeave={hide}>
      {children}
      <AnimatePresence>
        {open && (
          <motion.span
            role="tooltip"
            style={{ position: "absolute", bottom: "100%", left: "50%", transformOrigin: "bottom center" }}
            initial={{ opacity: 0, y: ${n(p.distance)}, scale: ${n(p.scaleFrom)}, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: ${n(p.distance)}, scale: ${n(p.scaleFrom)}, x: "-50%" }}
            transition={TRANSITION}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}`,
  },
};

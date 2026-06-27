import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { MessageSquare } from "lucide-react";
import { Button } from "@glaze/core/components";
import { type Effect, type EffectParams, n, parseBezier, bezierArray } from "./types";

// Origin-aware popover: it scales out FROM the trigger, not from its own center.
// Emil Kowalski's tip — set transform-origin to the edge nearest the trigger so
// the motion reads as "growing out of" the button. Optional blur bridges the
// crossfade between states.
const controls = [
  {
    id: "side",
    type: "segmented",
    label: "Side",
    default: "bottom",
    options: [
      { value: "top", label: "Top" },
      { value: "bottom", label: "Bottom" },
      { value: "left", label: "Left" },
      { value: "right", label: "Right" },
    ],
  },
  { id: "scaleFrom", type: "slider", label: "Scale from", min: 0.8, max: 1, step: 0.01, default: 0.95 },
  { id: "duration", type: "slider", label: "Duration", min: 0.1, max: 0.6, step: 0.01, default: 0.15, unit: "s" },
  {
    id: "curve",
    type: "select",
    label: "Easing curve",
    default: "0,0,0.2,1",
    options: [
      { value: "0,0,0.2,1", label: "Decelerate" },
      { value: "0.4,0,0.2,1", label: "Standard" },
      { value: "0.4,0,1,1", label: "Accelerate" },
      { value: "0.4,0,0.6,1", label: "Sharp" },
    ],
  },
  { id: "blur", type: "slider", label: "Blur bridge", min: 0, max: 12, step: 1, default: 0, unit: "px" },
] as const;

const ORIGIN: Record<string, string> = {
  bottom: "top center",
  top: "bottom center",
  left: "center right",
  right: "center left",
};

const POSITION: Record<string, string> = {
  bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
  top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
  left: "right-full mr-2 top-1/2 -translate-y-1/2",
  right: "left-full ml-2 top-1/2 -translate-y-1/2",
};

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const [open, setOpen] = React.useState(false);
  const side = String(params.side);
  const scaleFrom = Number(params.scaleFrom);
  const duration = Number(params.duration);
  const ease = parseBezier(params.curve);
  const blur = Number(params.blur);
  const blurFilter = `blur(${blur}px)`;

  React.useEffect(() => {
    if (replayToken > 0) setOpen(true);
  }, [replayToken]);

  return (
    <div className="relative w-full max-w-xl aspect-[4/3] rounded-panel overflow-hidden bg-control border border-separator flex items-center justify-center">
      {open && <div className="absolute inset-0" onClick={() => setOpen(false)} />}
      <div className="relative">
        <Button variant="accent" onClick={() => setOpen((o) => !o)}>
          {open ? "Close" : "Open popover"}
        </Button>
        <AnimatePresence>
          {open && (
            <div className={`absolute z-10 ${POSITION[side]}`}>
              <motion.div
                style={{ transformOrigin: ORIGIN[side] }}
                initial={{ opacity: 0, scale: scaleFrom, filter: blurFilter }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: scaleFrom, filter: blurFilter }}
                transition={{ duration, ease }}
                onClick={(e) => e.stopPropagation()}
                className="w-56 rounded-card bg-elevated border border-separator shadow-xl p-3"
              >
                <p className="text-strong">Popover</p>
                <p className="text-small text-secondary mt-1">
                  Scales out from the {side} edge of the trigger.
                </p>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export const popoverEffect: Effect = {
  id: "popover",
  name: "Popover",
  description: "Origin-aware popover that scales out from its trigger.",
  category: "Overlays & dialogs",
  icon: <MessageSquare size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => {
      const side = String(p.side);
      const blur = `blur(${n(p.blur)}px)`;
      return `import { AnimatePresence, motion } from "motion/react";

// Anchor this inside a \`position: relative\` trigger wrapper.
export function Popover({ open, children }: {
  open: boolean;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          style={{ position: "absolute", transformOrigin: "${ORIGIN[side]}" }}
          initial={{ opacity: 0, scale: ${n(p.scaleFrom)}, filter: "${blur}" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: ${n(p.scaleFrom)}, filter: "${blur}" }}
          transition={{ duration: ${n(p.duration)}, ease: ${bezierArray(p.curve)} }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}`;
    },
    css: (p) => `/* Origin-aware popover. Radix/Base UI expose a CSS var for the
   correct origin: transform-origin: var(--radix-popover-content-transform-origin); */
.popover[data-state="open"] {
  animation: popover-in ${n(p.duration)}s ${`cubic-bezier(${parseBezier(p.curve).map(n).join(", ")})`};
  transform-origin: ${ORIGIN[String(p.side)]};
}
@keyframes popover-in {
  from { opacity: 0; transform: scale(${n(p.scaleFrom)}); filter: blur(${n(p.blur)}px); }
  to   { opacity: 1; transform: scale(1); filter: blur(0); }
}`,
  },
};

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Layers } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "stiffness", type: "slider", label: "Spring stiffness", min: 60, max: 400, step: 10, default: 160 },
  { id: "damping", type: "slider", label: "Spring damping", min: 8, max: 40, step: 1, default: 22 },
  { id: "skew", type: "slider", label: "Skew amount", min: 0, max: 20, step: 0.5, default: 8, unit: "deg" },
  { id: "blur", type: "slider", label: "Entry blur", min: 0, max: 20, step: 1, default: 8, unit: "px" },
  { id: "scaleFrom", type: "slider", label: "Scale from", min: 0.7, max: 1.1, step: 0.01, default: 0.88 },
] as const;

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const [open, setOpen] = React.useState(false);
  const stiffness = Number(params.stiffness);
  const damping = Number(params.damping);
  const skew = Number(params.skew);
  const blurAmt = Number(params.blur);
  const scaleFrom = Number(params.scaleFrom);

  React.useEffect(() => {
    if (replayToken > 0) setOpen(false);
  }, [replayToken]);

  return (
    <div className="flex flex-col items-center justify-center gap-4" style={{ width: 320, height: 220 }}>
      <div className="relative flex items-center justify-center rounded-panel bg-control border border-separator" style={{ width: 240, height: 140 }}>
        <p className="text-secondary text-sm">Background content</p>

        <AnimatePresence>
          {open && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center rounded-panel overflow-hidden"
              style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
              initial={{
                opacity: 0,
                scale: scaleFrom,
                skewX: skew,
                skewY: skew * 0.4,
                filter: `blur(${blurAmt}px)`,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                skewX: 0,
                skewY: 0,
                filter: "blur(0px)",
              }}
              exit={{
                opacity: 0,
                scale: scaleFrom,
                skewX: -skew,
                skewY: -skew * 0.4,
                filter: `blur(${blurAmt}px)`,
              }}
              transition={{ type: "spring", stiffness, damping }}
            >
              <p className="text-white text-strong font-semibold text-sm">Warp Overlay</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        className="rounded-control px-4 py-1.5 bg-control border border-separator text-small select-none cursor-pointer hover:bg-elevated transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Close" : "Open overlay"}
      </button>
    </div>
  );
}

export const warpOverlayEffect: Effect = {
  id: "warp-overlay",
  name: "Warp Overlay",
  description: "Overlay reveal with scale, skew distortion and blur — spring settles to rest.",
  category: "Experimental" as unknown as Effect["category"],
  icon: <Layers size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import { AnimatePresence, motion } from "motion/react";

interface WarpOverlayProps {
  open: boolean;
  children: React.ReactNode;
}

export function WarpOverlay({ open, children }: WarpOverlayProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          style={{ position: "absolute", inset: 0 }}
          initial={{ opacity: 0, scale: ${n(p.scaleFrom)}, skewX: ${n(p.skew)}, skewY: ${n(Number(p.skew) * 0.4)}, filter: "blur(${n(p.blur)}px)" }}
          animate={{ opacity: 1, scale: 1, skewX: 0, skewY: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: ${n(p.scaleFrom)}, skewX: ${n(-Number(p.skew))}, skewY: ${n(-Number(p.skew) * 0.4)}, filter: "blur(${n(p.blur)}px)" }}
          transition={{ type: "spring", stiffness: ${n(p.stiffness)}, damping: ${n(p.damping)} }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}`,
  },
};

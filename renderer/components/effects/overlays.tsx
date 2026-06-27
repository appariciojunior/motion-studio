import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Layers } from "lucide-react";
import { Button } from "@glaze/core/components";
import { type Effect, type EffectParams, n, parseBezier, bezierArray } from "./types";

const controls = [
  { id: "blur", type: "slider", label: "Backdrop blur", min: 0, max: 24, step: 1, default: 8, unit: "px" },
  { id: "opacity", type: "slider", label: "Backdrop opacity", min: 0, max: 1, step: 0.05, default: 0.5 },
  { id: "duration", type: "slider", label: "Fade duration", min: 0.1, max: 1.5, step: 0.05, default: 0.35, unit: "s" },
  { id: "curve", type: "bezier", label: "Easing curve", default: "0,0,0.58,1" },
  { id: "scaleFrom", type: "slider", label: "Content scale from", min: 0.6, max: 1, step: 0.02, default: 0.92 },
  { id: "color", type: "color", label: "Backdrop color", default: "#000000" },
] as const;

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (replayToken > 0) setOpen(true);
  }, [replayToken]);

  return (
    <div className="relative w-full max-w-xl aspect-[4/3] rounded-panel overflow-hidden bg-control border border-separator flex items-center justify-center">
      <Button variant="accent" onClick={() => setOpen(true)}>
        Open overlay
      </Button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: params.color as string }}
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: Number(params.opacity), backdropFilter: `blur(${n(params.blur)}px)` }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: Number(params.duration), ease: parseBezier(params.curve) }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="rounded-card bg-elevated px-6 py-5 shadow-xl text-center"
              initial={{ opacity: 0, scale: Number(params.scaleFrom) }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: Number(params.scaleFrom) }}
              transition={{ duration: Number(params.duration), ease: parseBezier(params.curve) }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-strong">Overlay content</p>
              <p className="text-small text-secondary mt-1">Click anywhere to dismiss</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const overlaysEffect: Effect = {
  id: "overlays",
  name: "Overlays",
  description: "Blurred backdrop that fades in with scaling content.",
  category: "Overlays & dialogs",
  icon: <Layers size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import { AnimatePresence, motion } from "motion/react";

export function Overlay({ open, onClose, children }: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          onClick={onClose}
          style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "${p.color}" }}
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: ${n(p.opacity)}, backdropFilter: "blur(${n(p.blur)}px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: ${n(p.duration)}, ease: ${bezierArray(p.curve)} }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: ${n(p.scaleFrom)} }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: ${n(p.scaleFrom)} }}
            transition={{ duration: ${n(p.duration)}, ease: ${bezierArray(p.curve)} }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}`,
    js: (p) => `import { animate } from "motion";

const TRANSITION = { duration: ${n(p.duration)}, ease: ${bezierArray(p.curve)} };

// backdrop = the full-screen overlay element, content = the centered panel.
export function openOverlay(backdrop, content) {
  backdrop.style.display = "flex";
  backdrop.style.background = "${p.color}";
  animate(
    backdrop,
    { opacity: [0, ${n(p.opacity)}], backdropFilter: ["blur(0px)", "blur(${n(p.blur)}px)"] },
    TRANSITION
  );
  return animate(content, { opacity: [0, 1], scale: [${n(p.scaleFrom)}, 1] }, TRANSITION);
}

export async function closeOverlay(backdrop, content) {
  animate(content, { opacity: 0, scale: ${n(p.scaleFrom)} }, TRANSITION);
  await animate(backdrop, { opacity: 0, backdropFilter: "blur(0px)" }, TRANSITION);
  backdrop.style.display = "none";
}`,
  },
};

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { SquareStack } from "lucide-react";
import { Button } from "@glaze/core/components";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "blur", type: "slider", label: "Backdrop blur", min: 0, max: 16, step: 1, default: 0, unit: "px" },
  { id: "scaleFrom", type: "slider", label: "Card scale-from", min: 0.8, max: 1, step: 0.01, default: 0.9 },
  { id: "stiffness", type: "slider", label: "Spring stiffness", min: 100, max: 600, step: 10, default: 380 },
  { id: "damping", type: "slider", label: "Spring damping", min: 10, max: 40, step: 1, default: 28 },
] as const;

function transition(p: EffectParams) {
  return { type: "spring" as const, stiffness: Number(p.stiffness), damping: Number(p.damping) };
}

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const [open, setOpen] = React.useState(false);
  const blur = Number(params.blur);

  React.useEffect(() => {
    if (replayToken > 0) setOpen(true);
  }, [replayToken]);

  return (
    <div className="relative w-full max-w-xl aspect-[4/3] rounded-panel overflow-hidden bg-control border border-separator flex items-center justify-center">
      <Button variant="accent" onClick={() => setOpen(true)}>
        Open modal
      </Button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/40"
            style={blur > 0 ? { backdropFilter: `blur(${blur}px)` } : undefined}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="rounded-dialog bg-elevated p-5 w-64 shadow-2xl"
              initial={{ scale: Number(params.scaleFrom), opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 8 }}
              transition={transition(params)}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-strong">Modal title</p>
              <p className="text-small text-secondary mt-1">
                A dialog animated with the current settings.
              </p>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="secondary" size="small" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button variant="accent" size="small" onClick={() => setOpen(false)}>
                  Done
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const modalsEffect: Effect = {
  id: "modals",
  name: "Modal",
  description: "Backdrop fade with a spring-scaled card; closes on backdrop click.",
  category: "Overlays & dialogs",
  icon: <SquareStack size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => {
      const trans = `{ type: "spring", stiffness: ${n(p.stiffness)}, damping: ${n(p.damping)} }`;
      const backdropStyle = `position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)"${
        Number(p.blur) > 0 ? `, backdropFilter: "blur(${n(p.blur)}px)"` : ""
      }`;
      return `import { AnimatePresence, motion } from "motion/react";

export function Modal({ open, onClose, children }: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          onClick={onClose}
          style={{ ${backdropStyle} }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: ${n(p.scaleFrom)}, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={${trans}}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}`;
    },
    js: (p) => {
      const trans = `{ type: "spring", stiffness: ${n(p.stiffness)}, damping: ${n(p.damping)} }`;
      return `import { animate } from "motion";

// backdrop = the full-screen dimmer, content = the dialog box.
export function openModal(backdrop, content) {
  backdrop.style.display = "flex";
  animate(backdrop, { opacity: [0, 1] }, { duration: 0.2 });
  return animate(content, { scale: [${n(p.scaleFrom)}, 1], opacity: [0, 1], y: [12, 0] }, ${trans});
}

export async function closeModal(backdrop, content) {
  animate(content, { scale: 0.95, opacity: 0, y: 8 }, ${trans});
  await animate(backdrop, { opacity: 0 }, { duration: 0.2 });
  backdrop.style.display = "none";
}`;
    },
  },
};

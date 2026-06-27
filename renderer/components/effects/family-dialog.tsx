import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Blend } from "lucide-react";
import { Button } from "@glaze/core/components";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "stiffness", type: "slider", label: "Spring stiffness", min: 100, max: 700, step: 10, default: 380 },
  { id: "damping", type: "slider", label: "Spring damping", min: 8, max: 50, step: 1, default: 28 },
  { id: "radius", type: "slider", label: "Corner radius", min: 12, max: 48, step: 2, default: 28, unit: "px" },
  { id: "blur", type: "switch", label: "Backdrop blur", default: true },
] as const;

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const [open, setOpen] = React.useState(false);
  const stiffness = Number(params.stiffness);
  const damping = Number(params.damping);
  const radius = Number(params.radius);
  const backdropBlur = params.blur === true;
  const spring = { type: "spring" as const, stiffness, damping };

  React.useEffect(() => {
    if (replayToken > 0) setOpen(true);
  }, [replayToken]);

  return (
    <div
      key={replayToken}
      className="relative w-full max-w-xl aspect-[4/3] rounded-panel overflow-hidden bg-control border border-separator flex items-center justify-center"
    >
      <AnimatePresence initial={false}>
        {!open && (
          <motion.button
            layoutId="family-surface"
            key="pill"
            onClick={() => setOpen(true)}
            transition={spring}
            style={{ borderRadius: 9999, background: "#111" }}
            className="px-5 py-2.5 text-white text-strong shadow-lg select-none"
          >
            <motion.span layoutId="family-label" transition={spring} style={{ fontSize: 14 }}>
              Open
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <>
            {/* backdrop */}
            <motion.div
              className="absolute inset-0"
              style={{ background: backdropBlur ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.4)", backdropFilter: backdropBlur ? "blur(8px)" : "none" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setOpen(false)}
            />

            {/* dialog card */}
            <motion.div
              layoutId="family-surface"
              key="dialog"
              transition={spring}
              style={{ borderRadius: radius, background: "#18181b", width: 260 }}
              className="relative shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 pt-5 pb-4">
                <motion.p
                  layoutId="family-label"
                  transition={spring}
                  style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}
                >
                  Open
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ delay: 0.1, duration: 0.2 }}
                >
                  <p className="text-small text-secondary mt-1">
                    This pill morphed into a dialog using a shared layoutId and spring physics.
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button variant="secondary" size="small" onClick={() => setOpen(false)}>
                      Dismiss
                    </Button>
                    <Button variant="accent" size="small" onClick={() => setOpen(false)}>
                      Confirm
                    </Button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export const familyDialogEffect: Effect = {
  id: "family-dialog",
  name: "Family Dialog",
  description: "A pill morphs into a full dialog card via shared layoutId and spring.",
  category: "Overlays & dialogs",
  icon: <Blend size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import * as React from "react";
import { AnimatePresence, motion } from "motion/react";

const SPRING = { type: "spring", stiffness: ${n(p.stiffness)}, damping: ${n(p.damping)} };
const RADIUS = ${n(p.radius)};

export function FamilyDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {!open && (
        <motion.button
          layoutId="family-surface"
          transition={SPRING}
          style={{ borderRadius: 9999 }}
          onClick={/* open handler */undefined}
        >
          <motion.span layoutId="family-label" transition={SPRING}>Open</motion.span>
        </motion.button>
      )}
      {open && (
        <>
          <motion.div
            style={{ position: "fixed", inset: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            layoutId="family-surface"
            transition={SPRING}
            style={{ borderRadius: RADIUS }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.span layoutId="family-label" transition={SPRING}>Open</motion.span>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.2 }}
            >
              {/* dialog body */}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}`,
  },
};

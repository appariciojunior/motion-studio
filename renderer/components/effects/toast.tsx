import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bell } from "lucide-react";
import { Button } from "@glaze/core/components";
import { type Effect, type EffectParams, n } from "./types";

// Stacked toasts that collapse behind the newest. Each new toast pushes to the
// front, the stack is capped at maxVisible, and toasts auto-dismiss after ~3.2s.
const controls = [
  { id: "offset", type: "slider", label: "Stack offset", min: 4, max: 20, step: 1, default: 10, unit: "px" },
  { id: "scaleStep", type: "slider", label: "Scale step", min: 0.02, max: 0.08, step: 0.01, default: 0.04 },
  { id: "maxVisible", type: "slider", label: "Max visible", min: 2, max: 5, step: 1, default: 4 },
  {
    id: "exitDir",
    type: "segmented",
    label: "Exit direction",
    default: "right",
    options: [
      { value: "right", label: "Right" },
      { value: "left", label: "Left" },
      { value: "up", label: "Up" },
    ],
  },
] as const;

interface ToastItem {
  id: number;
  title: string;
  desc: string;
}

const MESSAGES = [
  { title: "Changes saved", desc: "Your edits are live." },
  { title: "Copied to clipboard", desc: "Link ready to share." },
  { title: "Message sent", desc: "We'll notify you on reply." },
  { title: "Upload complete", desc: "3 files added." },
  { title: "Subscribed", desc: "You're on the list." },
];

const DISMISS_MS = 3200;

function exitFor(dir: string) {
  if (dir === "left") return { x: -80, opacity: 0 };
  if (dir === "up") return { y: -80, opacity: 0 };
  return { x: 80, opacity: 0 };
}

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const offset = Number(params.offset);
  const scaleStep = Number(params.scaleStep);
  const maxVisible = Number(params.maxVisible);
  const exitDir = String(params.exitDir);
  const spring = { type: "spring" as const, stiffness: 350, damping: 30 };

  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const seq = React.useRef(0);

  const remove = React.useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = React.useCallback(() => {
    const m = MESSAGES[seq.current % MESSAGES.length];
    seq.current += 1;
    const id = seq.current;
    setToasts((prev) => [{ id, ...m }, ...prev].slice(0, maxVisible));
    window.setTimeout(() => remove(id), DISMISS_MS);
  }, [maxVisible, remove]);

  // Auto-spawn a lively stream so the stacking/dismiss behaviour is visible.
  React.useEffect(() => {
    addToast();
    const t = window.setInterval(addToast, 1800);
    return () => window.clearInterval(t);
  }, [addToast]);

  React.useEffect(() => {
    if (replayToken > 0) addToast();
  }, [replayToken, addToast]);

  return (
    <div className="relative w-full max-w-xl aspect-[4/3] rounded-panel overflow-hidden bg-control border border-separator flex items-center justify-center">
      <Button variant="accent" onClick={addToast}>
        Add toast
      </Button>

      <div className="absolute inset-x-0 top-4 flex justify-center">
        <div className="relative" style={{ width: 300, height: 64 }}>
          <AnimatePresence mode="popLayout">
            {toasts.map((t, i) => (
              <motion.div
                key={t.id}
                layout
                className="absolute inset-x-0"
                style={{ zIndex: 100 - i, transformOrigin: "top center" }}
                initial={{ y: 20, scale: 0.9, opacity: 0 }}
                animate={{
                  opacity: Math.max(0, 1 - i * scaleStep * 4.5),
                  y: i * offset,
                  scale: 1 - i * scaleStep,
                }}
                exit={exitFor(exitDir)}
                transition={spring}
              >
                <div className="flex items-center gap-3 rounded-card bg-elevated border border-separator px-4 py-3 shadow-xl">
                  <span className="size-2 rounded-full bg-support-green shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-regular truncate">{t.title}</span>
                    <span className="text-small text-secondary truncate">{t.desc}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export const toastEffect: Effect = {
  id: "toast",
  name: "Toast",
  description: "Stacked notifications that collapse behind the newest and auto-dismiss.",
  category: "Overlays & dialogs",
  icon: <Bell size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => {
      const exit = exitFor(String(p.exitDir));
      return `import * as React from "react";
import { AnimatePresence, motion } from "motion/react";

const OFFSET = ${n(p.offset)};
const SCALE_STEP = ${n(p.scaleStep)};
const MAX_VISIBLE = ${n(p.maxVisible)};
const DISMISS_MS = ${DISMISS_MS};
const SPRING = { type: "spring", stiffness: 350, damping: 30 };

// toasts[0] is the newest (front). Stack collapses behind it; auto-dismiss after ~3.2s.
export function Toaster({ toasts, onDismiss }: {
  toasts: { id: number; node: React.ReactNode }[];
  onDismiss: (id: number) => void;
}) {
  React.useEffect(() => {
    const timers = toasts.map((t) => setTimeout(() => onDismiss(t.id), DISMISS_MS));
    return () => timers.forEach(clearTimeout);
  }, [toasts, onDismiss]);

  return (
    <div style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)" }}>
      <AnimatePresence mode="popLayout">
        {toasts.slice(0, MAX_VISIBLE).map((t, i) => (
          <motion.div
            key={t.id}
            layout
            style={{ position: "absolute", insetInline: 0, zIndex: 100 - i, transformOrigin: "top center" }}
            initial={{ y: 20, scale: 0.9, opacity: 0 }}
            animate={{
              opacity: Math.max(0, 1 - i * SCALE_STEP * 4.5),
              y: i * OFFSET,
              scale: 1 - i * SCALE_STEP,
            }}
            exit={${JSON.stringify(exit)}}
            transition={SPRING}
          >
            {t.node}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}`;
    },
  },
};

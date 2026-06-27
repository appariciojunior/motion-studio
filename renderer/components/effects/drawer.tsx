import * as React from "react";
import { motion, useMotionValue, useTransform, animate, type PanInfo } from "motion/react";
import { PanelBottom } from "lucide-react";
import { Button } from "@glaze/core/components";
import { type Effect, type EffectParams, n, parseBezier, bezierArray } from "./types";

// Bottom sheet modelled on Vaul / iOS sheets: drag to dismiss, flick (velocity)
// to throw it closed, optional half-open snap, and a background that scales back.
// Default curve is the iOS sheet bezier (0.32, 0.72, 0, 1) from Ionic.
const controls = [
  { id: "height", type: "slider", label: "Drawer height", min: 150, max: 280, step: 10, default: 220, unit: "px" },
  { id: "snap", type: "switch", label: "Half-open snap point", default: false },
  { id: "scaleBg", type: "switch", label: "Scale background", default: true },
  { id: "duration", type: "slider", label: "Duration", min: 0.2, max: 0.9, step: 0.05, default: 0.5, unit: "s" },
  { id: "curve", type: "bezier", label: "Easing curve", default: "0.32,0.72,0,1" },
  { id: "flick", type: "slider", label: "Flick to dismiss", min: 200, max: 1600, step: 50, default: 700, unit: "px/s" },
] as const;

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const height = Number(params.height);
  const duration = Number(params.duration);
  const ease = parseBezier(params.curve);
  const flick = Number(params.flick);
  const snap = params.snap === true;
  const scaleBg = params.scaleBg === true;

  const y = useMotionValue(height); // start closed (pushed fully down)
  const [open, setOpen] = React.useState(false);

  const snapPoints = React.useMemo(
    () => (snap ? [0, height * 0.45, height] : [0, height]),
    [snap, height],
  );

  const settle = React.useCallback(
    (target: number) => {
      animate(y, target, { duration, ease });
      setOpen(target !== height);
    },
    [y, height, duration, ease],
  );

  const lastReplay = React.useRef(0);
  React.useEffect(() => {
    if (replayToken > 0 && replayToken !== lastReplay.current) {
      lastReplay.current = replayToken;
      settle(0);
    }
  }, [replayToken, settle]);

  const onDragEnd = (_e: unknown, info: PanInfo) => {
    if (info.velocity.y > flick) return settle(height);
    const projected = y.get() + info.velocity.y * 0.2;
    const target = snapPoints.reduce((a, b) =>
      Math.abs(b - projected) < Math.abs(a - projected) ? b : a,
    );
    settle(target);
  };

  // Backdrop opacity and background scale derive continuously from the drag.
  const backdrop = useTransform(y, [0, height], [0.5, 0]);
  const bgScale = useTransform(y, [0, height], [0.93, 1]);
  const bgRadius = useTransform(y, [0, height], [16, 0]);

  return (
    <div className="relative w-[36rem] max-w-full aspect-[4/3] rounded-panel overflow-hidden bg-control border border-separator">
      {/* faux app screen behind the sheet */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center bg-elevated"
        style={scaleBg ? { scale: bgScale, borderRadius: bgRadius } : undefined}
      >
        <Button variant="accent" onClick={() => settle(0)}>
          Open drawer
        </Button>
      </motion.div>

      {/* dimmed backdrop */}
      <motion.div
        className="absolute inset-0 bg-black"
        style={{ opacity: backdrop, pointerEvents: open ? "auto" : "none" }}
        onClick={() => settle(height)}
      />

      {/* the sheet */}
      <motion.div
        className="absolute inset-x-0 bottom-0 rounded-t-panel bg-elevated border-t border-separator shadow-2xl"
        style={{ y, height }}
        drag="y"
        dragConstraints={{ top: 0, bottom: height }}
        dragElastic={0.06}
        dragMomentum={false}
        onDragEnd={onDragEnd}
      >
        <div className="mx-auto mt-2.5 h-1 w-9 rounded-full bg-separator" />
        <div className="px-5 py-4">
          <p className="text-strong">Bottom sheet</p>
          <p className="text-small text-secondary mt-1">
            Drag down to dismiss, or flick to throw it closed.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export const drawerEffect: Effect = {
  id: "drawer",
  name: "Drawer",
  description: "iOS-style bottom sheet with drag, flick-to-dismiss, and snap points.",
  category: "Overlays & dialogs",
  icon: <PanelBottom size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => {
      const snapExpr = p.snap ? "[0, HEIGHT * 0.45, HEIGHT]" : "[0, HEIGHT]";
      return `import * as React from "react";
import { motion, useMotionValue, animate, type PanInfo } from "motion/react";

const HEIGHT = ${n(p.height)};
const TRANSITION = { duration: ${n(p.duration)}, ease: ${bezierArray(p.curve)} };
const SNAP = ${snapExpr};

export function Drawer({ open, onClose, children }: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const y = useMotionValue(HEIGHT);

  React.useEffect(() => {
    animate(y, open ? 0 : HEIGHT, TRANSITION);
  }, [open, y]);

  const onDragEnd = (_e: unknown, info: PanInfo) => {
    if (info.velocity.y > ${n(p.flick)}) return onClose();
    const projected = y.get() + info.velocity.y * 0.2;
    const target = SNAP.reduce((a, b) =>
      Math.abs(b - projected) < Math.abs(a - projected) ? b : a
    );
    if (target === HEIGHT) onClose();
    else animate(y, target, TRANSITION);
  };

  return (
    <motion.div
      style={{ position: "fixed", left: 0, right: 0, bottom: 0, height: HEIGHT, y }}
      drag="y"
      dragConstraints={{ top: 0, bottom: HEIGHT }}
      dragElastic={0.06}
      dragMomentum={false}
      onDragEnd={onDragEnd}
    >
      {children}
    </motion.div>
  );
}`;
    },
  },
};

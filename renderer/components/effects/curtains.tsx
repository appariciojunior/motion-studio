import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { PanelTopOpen } from "lucide-react";
import { Button } from "@glaze/core/components";
import { type Effect, type EffectParams, n, parseBezier, bezierArray } from "./types";

const controls = [
  {
    id: "effect",
    type: "segmented",
    label: "Effect",
    default: "wipe",
    options: [
      { value: "wipe", label: "Wipe" },
      { value: "blinds", label: "Blinds" },
      { value: "doors", label: "Doors" },
      { value: "iris", label: "Iris" },
      { value: "shutter", label: "Shutter" },
      { value: "pixels", label: "Pixels" },
      { value: "stagger", label: "Stagger" },
      { value: "clip", label: "Clip" },
      { value: "fade", label: "Fade" },
    ],
  },
  { id: "duration", type: "slider", label: "Duration", min: 0.2, max: 2, step: 0.05, default: 0.7, unit: "s" },
  { id: "curve", type: "bezier", label: "Easing curve", default: "0.76,0,0.24,1" },
  {
    id: "irisFromClick",
    type: "switch",
    label: "Iris from click point",
    default: false,
    visibleWhen: (p: EffectParams) => p.effect === "iris",
  },
  {
    id: "blindsCount",
    type: "slider",
    label: "Blind count",
    min: 2,
    max: 16,
    step: 1,
    default: 6,
    visibleWhen: (p: EffectParams) => p.effect === "blinds",
  },
  {
    id: "shutterCount",
    type: "slider",
    label: "Bar count",
    min: 2,
    max: 20,
    step: 1,
    default: 8,
    visibleWhen: (p: EffectParams) => p.effect === "shutter",
  },
  {
    id: "pixelGrid",
    type: "slider",
    label: "Grid size",
    min: 3,
    max: 10,
    step: 1,
    default: 5,
    visibleWhen: (p: EffectParams) => p.effect === "pixels",
  },
  {
    id: "staggerDelay",
    type: "slider",
    label: "Stagger delay",
    min: 0.02,
    max: 0.15,
    step: 0.01,
    default: 0.04,
    unit: "s",
    visibleWhen: (p: EffectParams) => p.effect === "stagger" || p.effect === "pixels",
  },
] as const;

// Two demo panels
const PANELS = [
  { label: "Home", bg: "#1e3a5f", text: "#93c5fd" },
  { label: "Studio", bg: "#2d1b4e", text: "#c4b5fd" },
];

// ── Curtain overlays ──────────────────────────────────────────────────────────

function WipeOverlay({ duration, ease, visible }: { duration: number; ease: number[]; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute inset-0"
          style={{ background: "#111", transformOrigin: "left center" }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          exit={{ scaleX: 0, transformOrigin: "right center" }}
          transition={{ duration, ease }}
        />
      )}
    </AnimatePresence>
  );
}

function FadeOverlay({ duration, ease, visible }: { duration: number; ease: number[]; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute inset-0"
          style={{ background: "#000" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration, ease }}
        />
      )}
    </AnimatePresence>
  );
}

function ClipOverlay({ duration, ease, visible }: { duration: number; ease: number[]; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute inset-0"
          style={{ background: "#111" }}
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          animate={{ clipPath: "inset(0 0% 0 0)" }}
          exit={{ clipPath: "inset(0 0% 0 100%)" }}
          transition={{ duration, ease }}
        />
      )}
    </AnimatePresence>
  );
}

function DoorsOverlay({ duration, ease, visible }: { duration: number; ease: number[]; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            className="absolute top-0 left-0 bottom-0"
            style={{ width: "50%", background: "#111", transformOrigin: "left center" }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            transition={{ duration, ease }}
          />
          <motion.div
            className="absolute top-0 right-0 bottom-0"
            style={{ width: "50%", background: "#111", transformOrigin: "right center" }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            transition={{ duration, ease }}
          />
        </>
      )}
    </AnimatePresence>
  );
}

function BlindsOverlay({
  count, duration, ease, visible,
}: { count: number; duration: number; ease: number[]; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible &&
        Array.from({ length: count }, (_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              top: `${(i / count) * 100}%`,
              left: 0,
              right: 0,
              height: `${100 / count}%`,
              background: "#111",
              transformOrigin: "top center",
            }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ scaleY: 0 }}
            transition={{ duration: duration * 0.7, ease, delay: (i / count) * duration * 0.3 }}
          />
        ))}
    </AnimatePresence>
  );
}

function ShutterOverlay({
  count, duration, ease, visible,
}: { count: number; duration: number; ease: number[]; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible &&
        Array.from({ length: count }, (_, i) => (
          <motion.div
            key={i}
            className="absolute top-0 bottom-0"
            style={{
              left: `${(i / count) * 100}%`,
              width: `${100 / count}%`,
              background: "#111",
              transformOrigin: "top center",
            }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ scaleY: 0 }}
            transition={{ duration: duration * 0.7, ease, delay: (i / count) * duration * 0.3 }}
          />
        ))}
    </AnimatePresence>
  );
}

function IrisOverlay({
  duration, ease, visible, originX, originY,
}: { duration: number; ease: number[]; visible: boolean; originX: number; originY: number }) {
  // Use clipPath circle to grow/shrink from origin
  const origin = `${originX}px ${originY}px`;
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute inset-0"
          style={{ background: "#111" }}
          initial={{ clipPath: `circle(0px at ${origin})` }}
          animate={{ clipPath: `circle(600px at ${origin})` }}
          exit={{ clipPath: `circle(0px at ${origin})` }}
          transition={{ duration, ease }}
        />
      )}
    </AnimatePresence>
  );
}

function PixelsOverlay({
  grid, duration, ease, staggerDelay, visible,
}: { grid: number; duration: number; ease: number[]; staggerDelay: number; visible: boolean }) {
  const cells = grid * grid;
  return (
    <AnimatePresence>
      {visible &&
        Array.from({ length: cells }, (_, i) => {
          const row = Math.floor(i / grid);
          const col = i % grid;
          return (
            <motion.div
              key={i}
              className="absolute"
              style={{
                top: `${(row / grid) * 100}%`,
                left: `${(col / grid) * 100}%`,
                width: `${100 / grid}%`,
                height: `${100 / grid}%`,
                background: "#111",
              }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: duration * 0.5, ease, delay: i * staggerDelay }}
            />
          );
        })}
    </AnimatePresence>
  );
}

function StaggerOverlay({
  duration, ease, staggerDelay, visible,
}: { duration: number; ease: number[]; staggerDelay: number; visible: boolean }) {
  // 3 diagonal strips
  const strips = 5;
  return (
    <AnimatePresence>
      {visible &&
        Array.from({ length: strips }, (_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              top: "-20%",
              left: `${(i / strips) * 120 - 10}%`,
              width: `${120 / strips}%`,
              height: "140%",
              background: "#111",
              transform: "skewX(-12deg)",
              transformOrigin: "top left",
            }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ scaleY: 0 }}
            transition={{ duration: duration * 0.7, ease, delay: i * staggerDelay * 3 }}
          />
        ))}
    </AnimatePresence>
  );
}

// ── Preview ───────────────────────────────────────────────────────────────────

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const effectType = String(params.effect);
  const duration = Number(params.duration);
  const ease = parseBezier(params.curve);
  const blindsCount = Number(params.blindsCount);
  const shutterCount = Number(params.shutterCount);
  const pixelGrid = Number(params.pixelGrid);
  const staggerDelay = Number(params.staggerDelay);
  const irisFromClick = Boolean(params.irisFromClick);

  const [panelIndex, setPanelIndex] = React.useState(0);
  const [overlayVisible, setOverlayVisible] = React.useState(false);
  const [irisOrigin, setIrisOrigin] = React.useState({ x: 160, y: 100 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Phase: idle | covering | covered | revealing
  const phaseRef = React.useRef<"idle" | "covering" | "covered" | "revealing">("idle");

  const runTransition = React.useCallback((clickX?: number, clickY?: number) => {
    if (phaseRef.current !== "idle") return;

    if (irisFromClick && clickX !== undefined && clickY !== undefined) {
      setIrisOrigin({ x: clickX, y: clickY });
    } else if (!irisFromClick) {
      setIrisOrigin({ x: 160, y: 100 });
    }

    phaseRef.current = "covering";
    setOverlayVisible(true);

    // Midpoint: swap panels, then reveal
    const midpoint = (duration * 1000) * 0.9;
    setTimeout(() => {
      phaseRef.current = "covered";
      setPanelIndex((i) => (i + 1) % PANELS.length);
      // Brief pause at full cover before revealing
      setTimeout(() => {
        phaseRef.current = "revealing";
        setOverlayVisible(false);
        setTimeout(() => { phaseRef.current = "idle"; }, duration * 1000 * 1.1);
      }, 80);
    }, midpoint);
  }, [duration, irisFromClick]);

  // Retrigger on replay
  React.useEffect(() => {
    if (replayToken > 0) runTransition();
  }, [replayToken, runTransition]);

  const panel = PANELS[panelIndex];

  const sharedProps = { duration, ease: ease as number[], visible: overlayVisible };

  return (
    <div className="flex flex-col items-center gap-4" style={{ width: 480 }}>
      <div
        ref={containerRef}
        className="relative rounded-panel overflow-hidden border border-separator"
        style={{ width: 480, height: 300 }}
      >
        {/* Background panel */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: panel.bg }}
        >
          <p className="text-heading3" style={{ color: panel.text }}>{panel.label}</p>
        </div>

        {/* Curtain overlays */}
        {effectType === "wipe" && <WipeOverlay {...sharedProps} />}
        {effectType === "fade" && <FadeOverlay {...sharedProps} />}
        {effectType === "clip" && <ClipOverlay {...sharedProps} />}
        {effectType === "doors" && <DoorsOverlay {...sharedProps} />}
        {effectType === "blinds" && (
          <BlindsOverlay {...sharedProps} count={blindsCount} />
        )}
        {effectType === "shutter" && (
          <ShutterOverlay {...sharedProps} count={shutterCount} />
        )}
        {effectType === "iris" && (
          <IrisOverlay {...sharedProps} originX={irisOrigin.x} originY={irisOrigin.y} />
        )}
        {effectType === "pixels" && (
          <PixelsOverlay {...sharedProps} grid={pixelGrid} staggerDelay={staggerDelay} />
        )}
        {effectType === "stagger" && (
          <StaggerOverlay {...sharedProps} staggerDelay={staggerDelay} />
        )}
      </div>

      <Button
        variant="accent"
        onClick={(e) => {
          let relX = 160;
          let relY = 100;
          if (containerRef.current && irisFromClick) {
            const rect = containerRef.current.getBoundingClientRect();
            relX = e.clientX - rect.left;
            relY = e.clientY - rect.top;
          }
          runTransition(relX, relY);
        }}
      >
        Run transition
      </Button>
    </div>
  );
}

export const curtainsEffect: Effect = {
  id: "curtains",
  name: "Curtains",
  description: "Full-panel curtain transitions — wipe, blinds, doors, iris, shutter, pixels, stagger, clip, fade.",
  category: "Transitions & lists",
  icon: <PanelTopOpen size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => {
      const ease = bezierArray(p.curve);
      const dur = n(p.duration);
      const effectType = String(p.effect);

      const overlaySource: Record<string, string> = {
        wipe: `<motion.div className="absolute inset-0" style={{ background: "#111", transformOrigin: "left center" }}
        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0, transformOrigin: "right center" }}
        transition={{ duration: ${dur}, ease: ${ease} }} />`,
        fade: `<motion.div className="absolute inset-0" style={{ background: "#000" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: ${dur}, ease: ${ease} }} />`,
        doors: `<>
      <motion.div className="absolute top-0 left-0 bottom-0" style={{ width: "50%", background: "#111", transformOrigin: "left center" }}
        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }} transition={{ duration: ${dur}, ease: ${ease} }} />
      <motion.div className="absolute top-0 right-0 bottom-0" style={{ width: "50%", background: "#111", transformOrigin: "right center" }}
        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }} transition={{ duration: ${dur}, ease: ${ease} }} />
    </>`,
        iris: `<motion.div className="absolute inset-0" style={{ background: "#111" }}
        initial={{ clipPath: "circle(0px at 50% 50%)" }} animate={{ clipPath: "circle(600px at 50% 50%)" }}
        exit={{ clipPath: "circle(0px at 50% 50%)" }} transition={{ duration: ${dur}, ease: ${ease} }} />`,
        clip: `<motion.div className="absolute inset-0" style={{ background: "#111" }}
        initial={{ clipPath: "inset(0 100% 0 0)" }} animate={{ clipPath: "inset(0 0% 0 0)" }}
        exit={{ clipPath: "inset(0 0% 0 100%)" }} transition={{ duration: ${dur}, ease: ${ease} }} />`,
        shutter: `{Array.from({ length: ${n(p.shutterCount)} }, (_, i) => (
      <motion.div key={i} className="absolute top-0 bottom-0"
        style={{ left: \`\${(i/${n(p.shutterCount)})*100}%\`, width: \`\${100/${n(p.shutterCount)}}%\`, background: "#111", transformOrigin: "top center" }}
        initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} exit={{ scaleY: 0 }}
        transition={{ duration: ${n(dur * 0.7)}, ease: ${ease}, delay: (i/${n(p.shutterCount)})*${n(dur * 0.3)} }} />
    ))}`,
        blinds: `{Array.from({ length: ${n(p.blindsCount)} }, (_, i) => (
      <motion.div key={i} className="absolute left-0 right-0"
        style={{ top: \`\${(i/${n(p.blindsCount)})*100}%\`, height: \`\${100/${n(p.blindsCount)}}%\`, background: "#111", transformOrigin: "top center" }}
        initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} exit={{ scaleY: 0 }}
        transition={{ duration: ${n(dur * 0.7)}, ease: ${ease}, delay: (i/${n(p.blindsCount)})*${n(dur * 0.3)} }} />
    ))}`,
        pixels: `{Array.from({ length: ${n(p.pixelGrid)}*${n(p.pixelGrid)} }, (_, i) => {
      const row = Math.floor(i/${n(p.pixelGrid)}); const col = i%${n(p.pixelGrid)};
      return <motion.div key={i} className="absolute"
        style={{ top: \`\${(row/${n(p.pixelGrid)})*100}%\`, left: \`\${(col/${n(p.pixelGrid)})*100}%\`,
          width: \`\${100/${n(p.pixelGrid)}}%\`, height: \`\${100/${n(p.pixelGrid)}}%\`, background: "#111" }}
        initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}
        transition={{ duration: ${n(dur * 0.5)}, ease: ${ease}, delay: i*${n(p.staggerDelay)} }} />;
    })}`,
        stagger: `{Array.from({ length: 5 }, (_, i) => (
      <motion.div key={i} className="absolute"
        style={{ top: "-20%", left: \`\${(i/5)*120-10}%\`, width: "24%", height: "140%",
          background: "#111", transform: "skewX(-12deg)", transformOrigin: "top left" }}
        initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} exit={{ scaleY: 0 }}
        transition={{ duration: ${n(dur * 0.7)}, ease: ${ease}, delay: i*${n(Number(p.staggerDelay) * 3)} }} />
    ))}`,
      };

      const overlayCode = overlaySource[effectType] ?? overlaySource["fade"];

      return `import * as React from "react";
import { AnimatePresence, motion } from "motion/react";

// Curtains: "${effectType}" transition  duration=${dur}s
export function CurtainsTransition({ children, routeKey }: { children: React.ReactNode; routeKey: string }) {
  const [overlayVisible, setOverlayVisible] = React.useState(false);
  const [currentKey, setCurrentKey] = React.useState(routeKey);

  React.useEffect(() => {
    if (routeKey === currentKey) return;
    setOverlayVisible(true);
    const mid = ${dur} * 900;
    setTimeout(() => { setCurrentKey(routeKey); setTimeout(() => setOverlayVisible(false), 80); }, mid);
  }, [routeKey, currentKey]);

  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      {children}
      <AnimatePresence>
        {overlayVisible && (
          ${overlayCode}
        )}
      </AnimatePresence>
    </div>
  );
}`;
    },

    js: (p) => `// Vanilla JS curtains: "${String(p.effect)}" — duration ${n(p.duration)}s
import { animate } from "motion";

const DURATION = ${n(p.duration)};
const EASE = ${bezierArray(p.curve)};

/**
 * Run a curtain transition between two DOM elements.
 * @param {HTMLElement} container - The panel container (position: relative, overflow: hidden)
 * @param {() => void} swapContent - Called at the midpoint to swap inner content
 */
export function runCurtains(container, swapContent) {
  const overlay = document.createElement("div");
  Object.assign(overlay.style, {
    position: "absolute", inset: 0, background: "#111",
    transformOrigin: "left center", transform: "scaleX(0)",
  });
  container.appendChild(overlay);

  animate(overlay, { scaleX: [0, 1] }, { duration: DURATION * 0.9, ease: EASE })
    .then(() => {
      swapContent();
      overlay.style.transformOrigin = "right center";
      return animate(overlay, { scaleX: [1, 0] }, { duration: DURATION * 0.9, ease: EASE });
    })
    .then(() => overlay.remove());
}`,
  },
};

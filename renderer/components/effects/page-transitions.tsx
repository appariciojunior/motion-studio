import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { GalleryHorizontalEnd } from "lucide-react";
import { Button } from "@glaze/core/components";
import { type Effect, type EffectParams, n, parseBezier, bezierArray } from "./types";

const controls = [
  {
    id: "type",
    type: "segmented",
    label: "Transition",
    default: "slide",
    options: [
      { value: "fade", label: "Fade" },
      { value: "slide", label: "Slide" },
      { value: "scale", label: "Scale" },
      { value: "up", label: "Up" },
    ],
  },
  { id: "duration", type: "slider", label: "Duration", min: 0.15, max: 1.2, step: 0.05, default: 0.45, unit: "s" },
  { id: "curve", type: "bezier", label: "Easing curve", default: "0.42,0,0.58,1" },
  {
    id: "distance",
    type: "slider",
    label: "Distance",
    min: 20,
    max: 200,
    step: 5,
    default: 80,
    unit: "px",
    visibleWhen: (p: EffectParams) => p.type === "slide" || p.type === "up",
  },
  { id: "blur", type: "slider", label: "Blur bridge", min: 0, max: 6, step: 0.5, default: 0, unit: "px" },
] as const;

interface Variants {
  initial: Record<string, number | string>;
  animate: Record<string, number | string>;
  exit: Record<string, number | string>;
}

/** Emil Kowalski's tip: a small blur bridges the visual gap in a crossfade. */
function withBlur(v: Variants, blur: number): Variants {
  if (!blur) return v;
  const f = `blur(${blur}px)`;
  return {
    initial: { ...v.initial, filter: f },
    animate: { ...v.animate, filter: "blur(0px)" },
    exit: { ...v.exit, filter: f },
  };
}

function variantsFor(p: EffectParams): Variants {
  const d = Number(p.distance);
  switch (p.type) {
    case "slide":
      return { initial: { opacity: 0, x: d }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -d } };
    case "scale":
      return { initial: { opacity: 0, scale: 0.92 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 1.04 } };
    case "up":
      return { initial: { opacity: 0, y: d }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -d } };
    default:
      return { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };
  }
}

const pages = [
  { title: "Inbox", body: "Your messages live here.", tone: "bg-control" },
  { title: "Settings", body: "Tune the app to your taste.", tone: "bg-elevated" },
];

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const [index, setIndex] = React.useState(0);
  const v = withBlur(variantsFor(params), Number(params.blur));

  React.useEffect(() => {
    if (replayToken > 0) setIndex((i) => (i + 1) % pages.length);
  }, [replayToken]);

  const page = pages[index];
  return (
    <div className="w-full max-w-xl flex flex-col items-center gap-4">
      <div className="relative w-full aspect-[4/3] rounded-panel overflow-hidden border border-separator">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            className={`absolute inset-0 flex flex-col items-center justify-center ${page.tone}`}
            initial={v.initial}
            animate={v.animate}
            exit={v.exit}
            transition={{ duration: Number(params.duration), ease: parseBezier(params.curve) }}
          >
            <p className="text-heading3">{page.title}</p>
            <p className="text-small text-secondary mt-1">{page.body}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <Button variant="accent" onClick={() => setIndex((i) => (i + 1) % pages.length)}>
        Next page
      </Button>
    </div>
  );
}

export const pageTransitionsEffect: Effect = {
  id: "page-transitions",
  name: "Page Transitions",
  description: "Route changes with directional enter/exit.",
  category: "Transitions & lists",
  icon: <GalleryHorizontalEnd size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => {
      const v = withBlur(variantsFor(p), Number(p.blur));
      return `import { AnimatePresence, motion } from "motion/react";

export function PageTransition({ routeKey, children }: {
  routeKey: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={routeKey}
        initial={${JSON.stringify(v.initial)}}
        animate={${JSON.stringify(v.animate)}}
        exit={${JSON.stringify(v.exit)}}
        transition={{ duration: ${n(p.duration)}, ease: ${bezierArray(p.curve)} }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}`;
    },
    js: (p) => {
      const v = variantsFor(p) as unknown as {
        initial: Record<string, number>;
        animate: Record<string, number>;
        exit: Record<string, number>;
      };
      const enter = Object.keys(v.initial)
        .map((k) => `${k}: [${v.initial[k]}, ${v.animate[k]}]`)
        .join(", ");
      const exitKf = Object.entries(v.exit)
        .map(([k, val]) => `${k}: ${val}`)
        .join(", ");
      return `import { animate } from "motion";

const TRANSITION = { duration: ${n(p.duration)}, ease: ${bezierArray(p.curve)} };

// Animate the incoming page in; optionally pass the outgoing element to fade it out.
export function transitionPage(incoming, outgoing) {
  if (outgoing) {
    animate(outgoing, { ${exitKf} }, TRANSITION).then(() => outgoing.remove());
  }
  return animate(incoming, { ${enter} }, TRANSITION);
}`;
    },
  },
};

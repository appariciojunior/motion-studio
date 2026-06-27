import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, animate } from "motion/react";
import { Sun, Zap, Star, Heart, Globe, Music } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "radius", type: "slider", label: "Spotlight radius", min: 100, max: 400, step: 20, default: 200, unit: "px" },
  { id: "softness", type: "slider", label: "Edge softness", min: 0.2, max: 0.8, step: 0.05, default: 0.4 },
  { id: "color", type: "color", label: "Light color", default: "#f8f8ff" },
  { id: "bgColor", type: "color", label: "Background", default: "#0a0a0f" },
  { id: "springStiffness", type: "slider", label: "Lag stiffness", min: 50, max: 300, step: 25, default: 100 },
] as const;

const CARDS = [
  { icon: Zap, label: "Performance", desc: "Blazing fast results", color: "#f59e0b" },
  { icon: Star, label: "Quality", desc: "Best in class output", color: "#a78bfa" },
  { icon: Heart, label: "Delight", desc: "Users love it", color: "#f43f5e" },
  { icon: Globe, label: "Scale", desc: "Works everywhere", color: "#38bdf8" },
  { icon: Music, label: "Rhythm", desc: "Smooth animations", color: "#34d399" },
  { icon: Sun, label: "Clarity", desc: "Crystal clear vision", color: "#fbbf24" },
];

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const radius = Number(params.radius);
  const softness = Number(params.softness);
  const color = String(params.color);
  const bgColor = String(params.bgColor);
  const stiffness = Number(params.springStiffness);

  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const isMouseActive = useRef(false);
  const autoAnimRef = useRef<ReturnType<typeof animate> | null>(null);

  const springX = useSpring(mouseX, { stiffness, damping: 30, mass: 0.5 });
  const springY = useSpring(mouseY, { stiffness, damping: 30, mass: 0.5 });

  const spotlightStyle = useTransform([springX, springY], ([x, y]) => {
    const xPct = `${(x as number) * 100}%`;
    const yPct = `${(y as number) * 100}%`;
    const inner = radius;
    const outer = radius * (1 + softness);
    return {
      background: `radial-gradient(circle ${inner}px at ${xPct} ${yPct}, ${color}22 0%, ${color}18 30%, transparent ${outer}px)`,
    };
  });

  const maskStyle = useTransform([springX, springY], ([x, y]) => {
    const xPct = `${(x as number) * 100}%`;
    const yPct = `${(y as number) * 100}%`;
    const inner = radius;
    const outer = radius * (1 + softness);
    return {
      background: `radial-gradient(circle ${inner}px at ${xPct} ${yPct}, transparent 0%, transparent 60%, ${bgColor}cc ${outer}px, ${bgColor}f0 100%)`,
    };
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
      isMouseActive.current = true;
      autoAnimRef.current?.stop();
    };

    const handlePointerLeave = () => {
      isMouseActive.current = false;
      startAutoAnimation();
    };

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", handlePointerLeave);
    return () => {
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [mouseX, mouseY]);

  function startAutoAnimation() {
    autoAnimRef.current?.stop();
    // figure-8 via lemniscate parametric: x = sin(t), y = sin(2t)/2
    const duration = 6;
    const startTime = Date.now();
    let raf: number;
    const tick = () => {
      const t = ((Date.now() - startTime) / 1000 / duration) * Math.PI * 2;
      const x = 0.5 + 0.35 * Math.sin(t);
      const y = 0.5 + 0.3 * Math.sin(2 * t) / 2;
      mouseX.set(x);
      mouseY.set(y);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    autoAnimRef.current = { stop: () => cancelAnimationFrame(raf) } as ReturnType<typeof animate>;
    return () => cancelAnimationFrame(raf);
  }

  useEffect(() => {
    isMouseActive.current = false;
    const cleanup = startAutoAnimation();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replayToken, stiffness]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none"
      style={{ background: bgColor, cursor: "none" }}
    >
      {/* Content grid */}
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
          {CARDS.map(({ icon: Icon, label, desc, color: iconColor }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1.5 rounded-xl p-3 border border-white/10"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <Icon size={20} style={{ color: iconColor }} />
              <span className="text-white text-[10px] font-semibold leading-tight text-center">{label}</span>
              <span className="text-white/40 text-[8px] leading-tight text-center">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Spotlight glow layer */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={spotlightStyle}
      />

      {/* Dark mask layer */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={maskStyle}
      />
    </div>
  );
}

export const spotlightEffect: Effect = {
  id: "spotlight",
  name: "Spotlight",
  description: "Mouse-tracked spotlight that illuminates content on a dark background",
  category: "Backgrounds & ambient",
  icon: <Sun size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

export function Spotlight({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springX = useSpring(mouseX, { stiffness: ${n(p.springStiffness)}, damping: 30, mass: 0.5 });
  const springY = useSpring(mouseY, { stiffness: ${n(p.springStiffness)}, damping: 30, mass: 0.5 });

  const maskStyle = useTransform([springX, springY], ([x, y]) => {
    const xPct = \`\${(x as number) * 100}%\`;
    const yPct = \`\${(y as number) * 100}%\`;
    const inner = ${n(p.radius)};
    const outer = ${n(p.radius)} * ${1 + n(p.softness)};
    return {
      background: \`radial-gradient(circle \${inner}px at \${xPct} \${yPct}, transparent 0%, transparent 60%, ${"${p.bgColor}"}cc \${outer}px, ${"${p.bgColor}"}f0 100%)\`,
    };
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      mouseX.set((e.clientX - r.left) / r.width);
      mouseY.set((e.clientY - r.top) / r.height);
    };
    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, [mouseX, mouseY]);

  return (
    <div ref={containerRef} style={{ position: "relative", background: "${p.bgColor}", overflow: "hidden" }}>
      {children}
      <motion.div style={{ position: "absolute", inset: 0, pointerEvents: "none", ...maskStyle }} />
    </div>
  );
}`,
  },
};

import { useRef, useEffect, useCallback } from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { Box } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "size", type: "slider", label: "Cube size", min: 80, max: 200, step: 10, default: 120, unit: "px" },
  { id: "speed", type: "slider", label: "Rotation speed", min: 0.5, max: 4, step: 0.25, default: 1.5, unit: "s/rev" },
  { id: "perspective", type: "slider", label: "Perspective", min: 400, max: 1200, step: 100, default: 700, unit: "px" },
  { id: "gap", type: "switch", label: "Show gaps", default: false },
  { id: "color", type: "color", label: "Face tint", default: "#6366f1" },
] as const;

const FACES = [
  { label: "Front",  transform: (h: number) => `translateZ(${h}px)` },
  { label: "Back",   transform: (h: number) => `rotateY(180deg) translateZ(${h}px)` },
  { label: "Left",   transform: (h: number) => `rotateY(-90deg) translateZ(${h}px)` },
  { label: "Right",  transform: (h: number) => `rotateY(90deg) translateZ(${h}px)` },
  { label: "Top",    transform: (h: number) => `rotateX(90deg) translateZ(${h}px)` },
  { label: "Bottom", transform: (h: number) => `rotateX(-90deg) translateZ(${h}px)` },
];

const FACE_LIGHTNESS = [1, 0.55, 0.7, 0.7, 0.85, 0.45];

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const num = parseInt(clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const size = Number(params.size);
  const speed = Number(params.speed);
  const persp = Number(params.perspective);
  const gap = Boolean(params.gap);
  const color = String(params.color);
  const half = size / 2;
  const gapPx = gap ? 2 : 0;

  const rotX = useMotionValue(20);
  const rotY = useMotionValue(0);

  const transform = useTransform(
    [rotX, rotY],
    ([rx, ry]: number[]) => `rotateX(${rx}deg) rotateY(${ry}deg)`
  );

  // auto-rotation controls
  const autoAnimY = useRef<ReturnType<typeof animate> | null>(null);
  const autoAnimX = useRef<ReturnType<typeof animate> | null>(null);

  const startAuto = useCallback(() => {
    autoAnimY.current?.stop();
    autoAnimX.current?.stop();
    const currentY = rotY.get();
    const currentX = rotX.get();
    autoAnimY.current = animate(rotY, currentY + 360, {
      duration: speed,
      ease: "linear",
      repeat: Infinity,
    });
    autoAnimX.current = animate(rotX, currentX + 360, {
      duration: speed * 2.5,
      ease: "linear",
      repeat: Infinity,
    });
  }, [rotX, rotY, speed]);

  // restart on replayToken or param changes
  useEffect(() => {
    rotX.set(20);
    rotY.set(0);
    startAuto();
    return () => {
      autoAnimY.current?.stop();
      autoAnimX.current?.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replayToken, speed]);

  // drag
  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const momentumRaf = useRef<number | null>(null);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    autoAnimY.current?.stop();
    autoAnimX.current?.stop();
    if (momentumRaf.current) cancelAnimationFrame(momentumRaf.current);
    isDragging.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    velocity.current = { x: 0, y: 0 };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    velocity.current = { x: dx, y: dy };
    rotY.set(rotY.get() + dx * 0.5);
    rotX.set(rotX.get() - dy * 0.5);
  }, [rotX, rotY]);

  const onPointerUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    let vx = velocity.current.x * 0.5;
    let vy = velocity.current.y * 0.5;
    const decay = () => {
      if (Math.abs(vx) < 0.05 && Math.abs(vy) < 0.05) {
        startAuto();
        return;
      }
      rotY.set(rotY.get() + vx);
      rotX.set(rotX.get() - vy);
      vx *= 0.92;
      vy *= 0.92;
      momentumRaf.current = requestAnimationFrame(decay);
    };
    momentumRaf.current = requestAnimationFrame(decay);
  }, [rotX, rotY, startAuto]);

  const [r, g, b] = hexToRgb(color);

  return (
    <div
      style={{ perspective: `${persp}px`, width: size, height: size, cursor: "grab" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <motion.div
        style={{
          width: size,
          height: size,
          position: "relative",
          transformStyle: "preserve-3d",
          transform,
        }}
      >
        {FACES.map(({ label, transform: faceTransform }, i) => (
          <div
            key={label}
            style={{
              position: "absolute",
              width: size - gapPx * 2,
              height: size - gapPx * 2,
              top: gapPx,
              left: gapPx,
              transform: faceTransform(half),
              backfaceVisibility: "visible",
              background: `rgba(${r}, ${g}, ${b}, ${(FACE_LIGHTNESS[i] * 0.8).toFixed(2)})`,
              border: `1px solid rgba(${r}, ${g}, ${b}, 0.9)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: Math.max(10, size * 0.12),
              fontWeight: 700,
              color: `rgba(255,255,255,0.9)`,
              letterSpacing: "0.05em",
              userSelect: "none",
            }}
          >
            {label}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export const cube3dEffect: Effect = {
  id: "cube-3d",
  name: "3D Cube",
  description: "CSS 3D cube that spins and can be dragged to rotate",
  category: "Experimental",
  icon: <Box size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import { useRef, useEffect, useCallback } from "react";
import { useMotionValue, useTransform, animate, motion } from "motion/react";

const FACES = [
  { label: "Front",  t: (h) => \`translateZ(\${h}px)\` },
  { label: "Back",   t: (h) => \`rotateY(180deg) translateZ(\${h}px)\` },
  { label: "Left",   t: (h) => \`rotateY(-90deg) translateZ(\${h}px)\` },
  { label: "Right",  t: (h) => \`rotateY(90deg) translateZ(\${h}px)\` },
  { label: "Top",    t: (h) => \`rotateX(90deg) translateZ(\${h}px)\` },
  { label: "Bottom", t: (h) => \`rotateX(-90deg) translateZ(\${h}px)\` },
];
const LIGHTNESS = [1, 0.55, 0.7, 0.7, 0.85, 0.45];

export function Cube3D() {
  const size = ${n(p.size)};
  const half = size / 2;
  const rotX = useMotionValue(20);
  const rotY = useMotionValue(0);
  const transform = useTransform([rotX, rotY], ([rx, ry]) => \`rotateX(\${rx}deg) rotateY(\${ry}deg)\`);
  const ayRef = useRef(null);
  const axRef = useRef(null);
  const startAuto = useCallback(() => {
    ayRef.current?.stop();
    axRef.current?.stop();
    ayRef.current = animate(rotY, rotY.get() + 360, { duration: ${n(p.speed)}, ease: "linear", repeat: Infinity });
    axRef.current = animate(rotX, rotX.get() + 360, { duration: ${n(p.speed) * 2.5}, ease: "linear", repeat: Infinity });
  }, []);
  useEffect(() => { startAuto(); return () => { ayRef.current?.stop(); axRef.current?.stop(); }; }, []);
  const isDragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const vel = useRef({ x: 0, y: 0 });
  const raf = useRef(null);
  const onPointerDown = (e) => {
    ayRef.current?.stop(); axRef.current?.stop();
    if (raf.current) cancelAnimationFrame(raf.current);
    isDragging.current = true; last.current = { x: e.clientX, y: e.clientY }; vel.current = { x: 0, y: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - last.current.x, dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY }; vel.current = { x: dx, y: dy };
    rotY.set(rotY.get() + dx * 0.5); rotX.set(rotX.get() - dy * 0.5);
  };
  const onPointerUp = () => {
    if (!isDragging.current) return; isDragging.current = false;
    let vx = vel.current.x * 0.5, vy = vel.current.y * 0.5;
    const decay = () => {
      if (Math.abs(vx) < 0.05 && Math.abs(vy) < 0.05) { startAuto(); return; }
      rotY.set(rotY.get() + vx); rotX.set(rotX.get() - vy); vx *= 0.92; vy *= 0.92;
      raf.current = requestAnimationFrame(decay);
    };
    raf.current = requestAnimationFrame(decay);
  };
  return (
    <div style={{ perspective: "${n(p.perspective)}px", width: size, height: size, cursor: "grab" }}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
      <motion.div style={{ width: size, height: size, position: "relative", transformStyle: "preserve-3d", transform }}>
        {FACES.map(({ label, t }, i) => (
          <div key={label} style={{ position: "absolute", width: size, height: size, transform: t(half),
            backfaceVisibility: "visible", background: \`rgba(99,102,241,\${LIGHTNESS[i] * 0.8})\`,
            border: "1px solid rgba(99,102,241,0.9)", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: size * 0.12, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>
            {label}
          </div>
        ))}
      </motion.div>
    </div>
  );
}`,
  },
};

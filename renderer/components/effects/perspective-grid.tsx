import { motion, useSpring, useMotionValue, animate } from "motion/react";
import { Grid3X3 } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";
import { useRef, useEffect } from "react";

const controls = [
  { id: "tiltStrength", type: "slider", label: "Tilt angle", min: 5, max: 30, step: 1, default: 15, unit: "°" },
  { id: "gridSize", type: "slider", label: "Grid size", min: 20, max: 80, step: 5, default: 40, unit: "px" },
  { id: "speed", type: "slider", label: "Scroll speed", min: 1, max: 8, step: 0.5, default: 3, unit: "s" },
  { id: "color", type: "color", label: "Grid color", default: "#6366f1" },
  { id: "perspective", type: "slider", label: "Perspective", min: 300, max: 800, step: 50, default: 500, unit: "px" },
] as const;

function Preview({ params }: { params: EffectParams }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tiltStrength = Number(params.tiltStrength);
  const gridSize = Number(params.gridSize);
  const speed = Number(params.speed);
  const color = String(params.color);
  const perspective = Number(params.perspective);

  const rotateX = useSpring(0, { stiffness: 80, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 80, damping: 20 });
  const bgPosY = useMotionValue(0);

  useEffect(() => {
    const controls = animate(bgPosY, gridSize, {
      duration: speed,
      ease: "linear",
      repeat: Infinity,
      repeatType: "loop",
    });
    return () => controls.stop();
  }, [gridSize, speed]);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    rotateX.set((y - 0.5) * -tiltStrength);
    rotateY.set((x - 0.5) * tiltStrength);
  }

  function handlePointerLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  // Convert hex color to rgba for subtle lines
  const gridLineColor = color + "80"; // 50% opacity

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        width: "100%",
        height: "100%",
        perspective: `${perspective}px`,
        overflow: "hidden",
        background: "#0a0a0f",
        cursor: "none",
      }}
    >
      <motion.div
        style={{
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          rotateX,
          rotateY,
          backgroundImage: `linear-gradient(${gridLineColor} 1px, transparent 1px), linear-gradient(90deg, ${gridLineColor} 1px, transparent 1px)`,
          backgroundSize: `${gridSize}px ${gridSize}px`,
          backgroundPositionY: bgPosY,
          boxShadow: `inset 0 0 ${gridSize * 2}px ${color}22`,
        }}
      >
        {/* Radial depth overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at 50% 40%, transparent 20%, #0a0a0f99 70%, #0a0a0f 100%)`,
            pointerEvents: "none",
          }}
        />
        {/* Center glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at 50% 50%, ${color}18 0%, transparent 60%)`,
            pointerEvents: "none",
          }}
        />
      </motion.div>
    </div>
  );
}

export const perspectiveGridEffect: Effect = {
  id: "perspective-grid",
  name: "Perspective Grid",
  description: "A 3D perspective grid that tilts to follow the mouse",
  category: "Backgrounds & ambient",
  icon: <Grid3X3 size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import { motion, useSpring, useMotionValue, animate } from "motion/react";
import { useRef, useEffect } from "react";

export function PerspectiveGrid() {
  const containerRef = useRef(null);
  const rotateX = useSpring(0, { stiffness: 80, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 80, damping: 20 });
  const bgPosY = useMotionValue(0);

  useEffect(() => {
    const ctrl = animate(bgPosY, ${n(p.gridSize)}, {
      duration: ${n(p.speed)},
      ease: "linear",
      repeat: Infinity,
      repeatType: "loop",
    });
    return () => ctrl.stop();
  }, []);

  function handlePointerMove(e) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    rotateX.set((y - 0.5) * ${-n(p.tiltStrength)});
    rotateY.set((x - 0.5) * ${n(p.tiltStrength)});
  }

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => { rotateX.set(0); rotateY.set(0); }}
      style={{
        width: "100%",
        height: "100%",
        perspective: "${n(p.perspective)}px",
        overflow: "hidden",
        background: "#0a0a0f",
      }}
    >
      <motion.div
        style={{
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          rotateX,
          rotateY,
          backgroundImage: \`linear-gradient(${"${p.color}"}80 1px, transparent 1px), linear-gradient(90deg, ${"${p.color}"}80 1px, transparent 1px)\`,
          backgroundSize: "${n(p.gridSize)}px ${n(p.gridSize)}px",
          backgroundPositionY: bgPosY,
        }}
      >
        <div style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 40%, transparent 20%, #0a0a0f99 70%, #0a0a0f 100%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute",
          inset: 0,
          background: \`radial-gradient(ellipse at 50% 50%, ${"${p.color}"}18 0%, transparent 60%)\`,
          pointerEvents: "none",
        }} />
      </motion.div>
    </div>
  );
}`,
  },
};

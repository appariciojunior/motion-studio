import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { SlidersHorizontal } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "duration", type: "slider", label: "Demo speed", min: 1, max: 4, step: 0.5, default: 2, unit: "s" },
  { id: "handleSize", type: "slider", label: "Handle size", min: 24, max: 56, step: 4, default: 36, unit: "px" },
  { id: "colorA", type: "color", label: "Left color", default: "#6366f1" },
  { id: "colorB", type: "color", label: "Right color", default: "#f59e0b" },
] as const;

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const duration = Number(params.duration);
  const handleSize = Number(params.handleSize);
  const colorA = String(params.colorA);
  const colorB = String(params.colorB);

  const dividerX = useMotionValue(50);
  const leftWidth = useTransform(dividerX, (v) => `${v}%`);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Auto-animate on replayToken change
  useEffect(() => {
    dividerX.set(25);
    const controls = animate(dividerX, [25, 75, 25], {
      duration: duration * 2,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop",
    });
    return () => controls.stop();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replayToken, duration]);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    isDragging.current = true;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    updatePosition(e);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging.current) return;
    updatePosition(e);
  }

  function handlePointerUp() {
    isDragging.current = false;
  }

  function updatePosition(e: React.PointerEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    dividerX.set(x);
  }

  return (
    <div
      ref={containerRef}
      style={{ width: 300, height: 200, position: "relative", overflow: "hidden", borderRadius: 8, cursor: "col-resize", userSelect: "none" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Right panel (background, full width) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(135deg, ${colorB}aa 0%, ${colorB} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ color: "white", fontWeight: 700, fontSize: 13, opacity: 0.7, letterSpacing: 2, textTransform: "uppercase" }}>After</span>
      </div>

      {/* Left panel clipped by motion width */}
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: leftWidth,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: 300,
            height: 200,
            background: `linear-gradient(135deg, ${colorA}aa 0%, ${colorA} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "white", fontWeight: 700, fontSize: 13, opacity: 0.7, letterSpacing: 2, textTransform: "uppercase" }}>Before</span>
        </div>
      </motion.div>

      {/* Divider line + handle */}
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: leftWidth,
          width: 2,
          background: "white",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: handleSize,
            height: handleSize,
            borderRadius: "50%",
            background: "white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width={handleSize * 0.55} height={handleSize * 0.55} viewBox="0 0 24 24" fill="none">
            <path d="M8 12L4 12M4 12L7 9M4 12L7 15" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 12L20 12M20 12L17 9M20 12L17 15" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </motion.div>
    </div>
  );
}

export const imageRevealSliderEffect: Effect = {
  id: "image-reveal-slider",
  name: "Image Reveal Slider",
  description: "Drag a divider to compare two versions side by side",
  category: "Micro-interactions",
  icon: <SlidersHorizontal size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import { useRef } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";

export function ImageRevealSlider({
  colorA = "${p.colorA}",
  colorB = "${p.colorB}",
  handleSize = ${n(p.handleSize)},
}: {
  colorA?: string;
  colorB?: string;
  handleSize?: number;
}) {
  const dividerX = useMotionValue(50);
  const leftWidth = useTransform(dividerX, (v) => \`\${v}%\`);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    isDragging.current = true;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    updatePosition(e);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging.current) return;
    updatePosition(e);
  }

  function handlePointerUp() {
    isDragging.current = false;
  }

  function updatePosition(e: React.PointerEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    dividerX.set(x);
  }

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", overflow: "hidden", cursor: "col-resize", userSelect: "none" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Right panel */}
      <div style={{ background: \`linear-gradient(135deg, \${colorB}aa, \${colorB})\`, width: "100%", height: "100%" }} />

      {/* Left panel */}
      <motion.div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: leftWidth, overflow: "hidden" }}>
        <div style={{ background: \`linear-gradient(135deg, \${colorA}aa, \${colorA})\`, width: "100%", height: "100%" }} />
      </motion.div>

      {/* Divider */}
      <motion.div style={{ position: "absolute", top: 0, bottom: 0, left: leftWidth, width: 2, background: "white", transform: "translateX(-50%)", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        <div style={{ width: handleSize, height: handleSize, borderRadius: "50%", background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* arrow icon */}
        </div>
      </motion.div>
    </div>
  );
}`,
  },
};

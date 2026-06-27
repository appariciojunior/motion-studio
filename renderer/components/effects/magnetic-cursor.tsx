import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { Magnet } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "attractRadius", type: "slider", label: "Attract radius", min: 40, max: 150, step: 10, default: 80, unit: "px" },
  { id: "cursorSize", type: "slider", label: "Cursor size", min: 8, max: 24, step: 2, default: 12, unit: "px" },
  { id: "strength", type: "slider", label: "Pull strength", min: 0.1, max: 0.6, step: 0.05, default: 0.3 },
  { id: "springStiffness", type: "slider", label: "Spring stiffness", min: 100, max: 400, step: 20, default: 200 },
  { id: "color", type: "color", label: "Cursor color", default: "#6366f1" },
] as const;

const MAGNET_ELEMENTS = [
  { color: "#f43f5e", label: "A" },
  { color: "#f59e0b", label: "B" },
  { color: "#10b981", label: "C" },
  { color: "#3b82f6", label: "D" },
  { color: "#a855f7", label: "E" },
];

const POSITIONS = [
  { x: 20, y: 25 },
  { x: 70, y: 20 },
  { x: 45, y: 55 },
  { x: 18, y: 72 },
  { x: 75, y: 68 },
];

interface MagnetElementProps {
  color: string;
  label: string;
  posX: number;
  posY: number;
  mouseX: React.MutableRefObject<number>;
  mouseY: React.MutableRefObject<number>;
  attractRadius: number;
  strength: number;
  springStiffness: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function MagnetElement({
  color,
  label,
  posX,
  posY,
  mouseX,
  mouseY,
  attractRadius,
  strength,
  springStiffness,
  containerRef,
}: MagnetElementProps) {
  const [isNear, setIsNear] = useState(false);
  const elemRef = useRef<HTMLDivElement>(null);

  const offsetX = useSpring(0, { stiffness: springStiffness, damping: 20 });
  const offsetY = useSpring(0, { stiffness: springStiffness, damping: 20 });

  useEffect(() => {
    let animFrame: number;

    function update() {
      const container = containerRef.current;
      const elem = elemRef.current;
      if (!container || !elem) {
        animFrame = requestAnimationFrame(update);
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const elemRect = elem.getBoundingClientRect();
      const elemCenterX = elemRect.left - containerRect.left + elemRect.width / 2;
      const elemCenterY = elemRect.top - containerRect.top + elemRect.height / 2;

      const dx = mouseX.current - elemCenterX;
      const dy = mouseY.current - elemCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < attractRadius) {
        offsetX.set(dx * strength);
        offsetY.set(dy * strength);
        setIsNear(true);
      } else {
        offsetX.set(0);
        offsetY.set(0);
        setIsNear(false);
      }

      animFrame = requestAnimationFrame(update);
    }

    animFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animFrame);
  }, [attractRadius, strength, springStiffness, offsetX, offsetY, mouseX, mouseY, containerRef]);

  return (
    <motion.div
      ref={elemRef}
      style={{
        position: "absolute",
        left: `${posX}%`,
        top: `${posY}%`,
        x: offsetX,
        y: offsetY,
        width: 56,
        height: 56,
        borderRadius: "50%",
        backgroundColor: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: 18,
        boxShadow: isNear
          ? `0 0 0 3px #fff, 0 0 0 5px ${color}, 0 8px 24px ${color}88`
          : `0 4px 12px ${color}55`,
        transition: "box-shadow 0.2s ease",
        cursor: "none",
        userSelect: "none",
        zIndex: 1,
      }}
    >
      {label}
    </motion.div>
  );
}

function Preview({ params }: { params: EffectParams }) {
  const attractRadius = Number(params.attractRadius);
  const cursorSize = Number(params.cursorSize);
  const strength = Number(params.strength);
  const springStiffness = Number(params.springStiffness);
  const color = String(params.color);

  const containerRef = useRef<HTMLDivElement>(null);
  const mouseXRef = useRef<number>(-9999);
  const mouseYRef = useRef<number>(-9999);
  const [isInside, setIsInside] = useState(false);
  const [nearAny, setNearAny] = useState(false);

  const rawX = useMotionValue(-9999);
  const rawY = useMotionValue(-9999);
  const cursorX = useSpring(rawX, { stiffness: 150, damping: 15 });
  const cursorY = useSpring(rawY, { stiffness: 150, damping: 15 });

  // Track nearAny for cursor styling
  useEffect(() => {
    let frame: number;
    function check() {
      const container = containerRef.current;
      if (!container) { frame = requestAnimationFrame(check); return; }
      const containerRect = container.getBoundingClientRect();

      let anyNear = false;
      const elems = container.querySelectorAll("[data-magnet]");
      elems.forEach((el) => {
        const rect = (el as HTMLElement).getBoundingClientRect();
        const cx = rect.left - containerRect.left + rect.width / 2;
        const cy = rect.top - containerRect.top + rect.height / 2;
        const dx = mouseXRef.current - cx;
        const dy = mouseYRef.current - cy;
        if (Math.sqrt(dx * dx + dy * dy) < attractRadius) anyNear = true;
      });
      setNearAny(anyNear);
      frame = requestAnimationFrame(check);
    }
    frame = requestAnimationFrame(check);
    return () => cancelAnimationFrame(frame);
  }, [attractRadius]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseXRef.current = x;
    mouseYRef.current = y;
    rawX.set(x);
    rawY.set(y);
  }, [rawX, rawY]);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setIsInside(true)}
      onPointerLeave={() => {
        setIsInside(false);
        mouseXRef.current = -9999;
        mouseYRef.current = -9999;
        rawX.set(-9999);
        rawY.set(-9999);
      }}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        cursor: "none",
        overflow: "hidden",
        background: "radial-gradient(ellipse at center, #1e1b2e 0%, #0f0d1a 100%)",
        minHeight: 320,
      }}
    >
      {MAGNET_ELEMENTS.map((el, i) => (
        <div key={el.label} data-magnet="true" style={{ position: "absolute", left: `${POSITIONS[i].x}%`, top: `${POSITIONS[i].y}%` }}>
          <MagnetElement
            color={el.color}
            label={el.label}
            posX={0}
            posY={0}
            mouseX={mouseXRef}
            mouseY={mouseYRef}
            attractRadius={attractRadius}
            strength={strength}
            springStiffness={springStiffness}
            containerRef={containerRef}
          />
        </div>
      ))}

      {/* Custom cursor dot */}
      {isInside && (
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            x: cursorX,
            y: cursorY,
            width: nearAny ? cursorSize * 1.8 : cursorSize,
            height: nearAny ? cursorSize * 1.8 : cursorSize,
            marginLeft: nearAny ? -(cursorSize * 1.8) / 2 : -cursorSize / 2,
            marginTop: nearAny ? -(cursorSize * 1.8) / 2 : -cursorSize / 2,
            borderRadius: "50%",
            backgroundColor: nearAny ? "#fff" : color,
            boxShadow: nearAny
              ? `0 0 0 2px ${color}, 0 0 12px ${color}`
              : `0 0 8px ${color}99`,
            pointerEvents: "none",
            zIndex: 100,
            transition: "width 0.2s ease, height 0.2s ease, margin 0.2s ease, background-color 0.2s ease",
          }}
        />
      )}

      {/* Hint text */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: 0,
          right: 0,
          textAlign: "center",
          color: "#ffffff44",
          fontSize: 12,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        Move cursor over the circles
      </div>
    </div>
  );
}

export const magneticCursorEffect: Effect = {
  id: "magnetic-cursor",
  name: "Magnetic Cursor",
  description: "Custom cursor that magnetically attracts nearby elements",
  category: "Micro-interactions",
  icon: <Magnet size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

const ATTRACT_RADIUS = ${n(p.attractRadius)};
const CURSOR_SIZE = ${n(p.cursorSize)};
const STRENGTH = ${n(p.strength)};
const SPRING_STIFFNESS = ${n(p.springStiffness)};
const CURSOR_COLOR = "${p.color}";

const ELEMENTS = [
  { color: "#f43f5e", label: "A", x: 20, y: 25 },
  { color: "#f59e0b", label: "B", x: 70, y: 20 },
  { color: "#10b981", label: "C", x: 45, y: 55 },
  { color: "#3b82f6", label: "D", x: 18, y: 72 },
  { color: "#a855f7", label: "E", x: 75, y: 68 },
];

function MagnetDot({ color, label, posX, posY, mouseX, mouseY, containerRef }) {
  const elemRef = useRef(null);
  const [isNear, setIsNear] = useState(false);
  const offsetX = useSpring(0, { stiffness: SPRING_STIFFNESS, damping: 20 });
  const offsetY = useSpring(0, { stiffness: SPRING_STIFFNESS, damping: 20 });

  useEffect(() => {
    let frame;
    function update() {
      const container = containerRef.current;
      const elem = elemRef.current;
      if (container && elem) {
        const cr = container.getBoundingClientRect();
        const er = elem.getBoundingClientRect();
        const cx = er.left - cr.left + er.width / 2;
        const cy = er.top - cr.top + er.height / 2;
        const dx = mouseX.current - cx;
        const dy = mouseY.current - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < ATTRACT_RADIUS) {
          offsetX.set(dx * STRENGTH);
          offsetY.set(dy * STRENGTH);
          setIsNear(true);
        } else {
          offsetX.set(0);
          offsetY.set(0);
          setIsNear(false);
        }
      }
      frame = requestAnimationFrame(update);
    }
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [offsetX, offsetY, mouseX, mouseY, containerRef]);

  return (
    <motion.div
      ref={elemRef}
      style={{
        position: "absolute",
        left: posX + "%",
        top: posY + "%",
        x: offsetX,
        y: offsetY,
        width: 56,
        height: 56,
        borderRadius: "50%",
        backgroundColor: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: 18,
        boxShadow: isNear
          ? \`0 0 0 3px #fff, 0 0 0 5px \${color}\`
          : \`0 4px 12px \${color}55\`,
        cursor: "none",
      }}
    >
      {label}
    </motion.div>
  );
}

export function MagneticCursor() {
  const containerRef = useRef(null);
  const mouseXRef = useRef(-9999);
  const mouseYRef = useRef(-9999);
  const [inside, setInside] = useState(false);
  const [nearAny, setNearAny] = useState(false);
  const rawX = useMotionValue(-9999);
  const rawY = useMotionValue(-9999);
  const cursorX = useSpring(rawX, { stiffness: 150, damping: 15 });
  const cursorY = useSpring(rawY, { stiffness: 150, damping: 15 });

  useEffect(() => {
    let frame;
    function check() {
      const container = containerRef.current;
      if (container) {
        const cr = container.getBoundingClientRect();
        let any = false;
        container.querySelectorAll("[data-magnet]").forEach((el) => {
          const r = el.getBoundingClientRect();
          const cx = r.left - cr.left + r.width / 2;
          const cy = r.top - cr.top + r.height / 2;
          const dx = mouseXRef.current - cx;
          const dy = mouseYRef.current - cy;
          if (Math.sqrt(dx * dx + dy * dy) < ATTRACT_RADIUS) any = true;
        });
        setNearAny(any);
      }
      frame = requestAnimationFrame(check);
    }
    frame = requestAnimationFrame(check);
    return () => cancelAnimationFrame(frame);
  }, []);

  const onMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseXRef.current = x;
    mouseYRef.current = y;
    rawX.set(x);
    rawY.set(y);
  }, [rawX, rawY]);

  return (
    <div
      ref={containerRef}
      onPointerMove={onMove}
      onPointerEnter={() => setInside(true)}
      onPointerLeave={() => { setInside(false); rawX.set(-9999); rawY.set(-9999); }}
      style={{ position: "relative", width: "100%", height: 400, cursor: "none", overflow: "hidden" }}
    >
      {ELEMENTS.map((el) => (
        <div key={el.label} data-magnet="true" style={{ position: "absolute", left: el.x + "%", top: el.y + "%" }}>
          <MagnetDot color={el.color} label={el.label} posX={0} posY={0} mouseX={mouseXRef} mouseY={mouseYRef} containerRef={containerRef} />
        </div>
      ))}
      {inside && (
        <motion.div
          style={{
            position: "absolute",
            top: 0, left: 0,
            x: cursorX, y: cursorY,
            width: nearAny ? CURSOR_SIZE * 1.8 : CURSOR_SIZE,
            height: nearAny ? CURSOR_SIZE * 1.8 : CURSOR_SIZE,
            marginLeft: nearAny ? -(CURSOR_SIZE * 1.8) / 2 : -CURSOR_SIZE / 2,
            marginTop: nearAny ? -(CURSOR_SIZE * 1.8) / 2 : -CURSOR_SIZE / 2,
            borderRadius: "50%",
            backgroundColor: nearAny ? "#fff" : CURSOR_COLOR,
            pointerEvents: "none",
            zIndex: 100,
          }}
        />
      )}
    </div>
  );
}`,
  },
};

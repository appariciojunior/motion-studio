import * as React from "react";
import { useSpring, useMotionValue, motion } from "motion/react";
import { Watch } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "count", type: "slider", label: "Icon count", min: 9, max: 25, step: 1, default: 16 },
  { id: "fisheye", type: "slider", label: "Fisheye strength", min: 0.5, max: 3, step: 0.1, default: 1.4 },
  { id: "stiffness", type: "slider", label: "Spring stiffness", min: 80, max: 400, step: 10, default: 200 },
  { id: "damping", type: "slider", label: "Spring damping", min: 8, max: 40, step: 1, default: 20 },
  { id: "gap", type: "slider", label: "Gap", min: 4, max: 24, step: 1, default: 10, unit: "px" },
] as const;


const APP_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#06b6d4", "#3b82f6", "#6366f1", "#a855f7",
  "#ec4899", "#14b8a6", "#84cc16", "#f59e0b",
];

const APP_LABELS = ["Mail", "Maps", "Music", "Photos", "Clock", "Fit", "Pay", "Store", "Home", "Watch", "News", "Notes", "Wallet", "Phone", "Siri", "Cal"];

function HoneycombIcon({
  index,
  pointerX,
  pointerY,
  cx,
  cy,
  iconSize,
  fisheye,
  stiffness,
  damping,
}: {
  index: number;
  pointerX: number;
  pointerY: number;
  cx: number;
  cy: number;
  iconSize: number;
  fisheye: number;
  stiffness: number;
  damping: number;
}) {
  const dx = pointerX - cx;
  const dy = pointerY - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const maxDist = iconSize * 3;
  const proximity = Math.max(0, 1 - dist / maxDist);
  const targetScale = 1 + proximity * fisheye * 0.6;

  const scale = useSpring(1, { stiffness, damping });

  React.useEffect(() => {
    scale.set(targetScale);
  }, [targetScale, scale]);

  const color = APP_COLORS[index % APP_COLORS.length];
  const label = APP_LABELS[index % APP_LABELS.length];
  const iconRadius = iconSize / 2;

  return (
    <motion.div
      style={{
        width: iconSize,
        height: iconSize,
        borderRadius: iconRadius * 0.46,
        background: color,
        scale,
        position: "absolute",
        left: cx - iconSize / 2,
        top: cy - iconSize / 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        cursor: "default",
        userSelect: "none",
        transformOrigin: "center",
        boxShadow: `0 2px 6px rgba(0,0,0,0.28)`,
      }}
    >
      <span style={{ color: "white", fontSize: iconSize * 0.22, fontWeight: 600, lineHeight: 1 }}>
        {label.slice(0, 2)}
      </span>
    </motion.div>
  );
}

function buildHoneycombPositions(count: number, containerW: number, containerH: number, iconSize: number, gap: number) {
  const cols = Math.ceil(Math.sqrt(count * 1.3));
  const cellW = iconSize + gap;
  const cellH = (iconSize + gap) * 0.866;
  const positions: { cx: number; cy: number }[] = [];

  for (let row = 0; positions.length < count; row++) {
    const offsetX = (row % 2) * (cellW / 2);
    const colCount = row % 2 === 0 ? cols : cols - 1;
    for (let col = 0; col < colCount && positions.length < count; col++) {
      const cx = offsetX + col * cellW + cellW / 2;
      const cy = row * cellH + (iconSize + gap) / 2;
      positions.push({ cx, cy });
    }
  }

  // Center in container
  const maxCx = Math.max(...positions.map((p) => p.cx));
  const maxCy = Math.max(...positions.map((p) => p.cy));
  const offX = (containerW - maxCx - iconSize / 2) / 2;
  const offY = (containerH - maxCy - iconSize / 2) / 2;
  return positions.map(({ cx, cy }) => ({ cx: cx + offX, cy: cy + offY }));
}

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const count = Number(params.count);
  const fisheye = Number(params.fisheye);
  const stiffness = Number(params.stiffness);
  const damping = Number(params.damping);
  const gap = Number(params.gap);

  const containerW = 340;
  const containerH = 220;
  const iconSize = Math.max(28, Math.floor((containerW / Math.ceil(Math.sqrt(count * 1.3))) * 0.72));

  const rawPointerX = useMotionValue(containerW / 2);
  const rawPointerY = useMotionValue(containerH / 2);
  const pointerX = useSpring(rawPointerX, { stiffness: 300, damping: 30 });
  const pointerY = useSpring(rawPointerY, { stiffness: 300, damping: 30 });

  const [px, setPx] = React.useState(containerW / 2);
  const [py, setPy] = React.useState(containerH / 2);

  React.useEffect(() => {
    const unsubX = pointerX.on("change", (v) => setPx(v));
    const unsubY = pointerY.on("change", (v) => setPy(v));
    return () => { unsubX(); unsubY(); };
  }, [pointerX, pointerY]);

  const positions = React.useMemo(
    () => buildHoneycombPositions(count, containerW, containerH, iconSize, gap),
    [count, iconSize, gap]
  );

  return (
    <div
      key={replayToken}
      className="relative rounded-panel overflow-hidden bg-control border border-separator select-none"
      style={{ width: containerW, height: containerH }}
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        rawPointerX.set(e.clientX - rect.left);
        rawPointerY.set(e.clientY - rect.top);
      }}
      onPointerLeave={() => {
        rawPointerX.set(containerW / 2);
        rawPointerY.set(containerH / 2);
      }}
    >
      {positions.map((pos, i) => (
        <HoneycombIcon
          key={i}
          index={i}
          pointerX={px}
          pointerY={py}
          cx={pos.cx}
          cy={pos.cy}
          iconSize={iconSize}
          fisheye={fisheye}
          stiffness={stiffness}
          damping={damping}
        />
      ))}
    </div>
  );
}

export const appleWatchEffect: Effect = {
  id: "apple-watch",
  name: "Apple Watch Home",
  description: "Honeycomb icon grid with fisheye magnification driven by pointer proximity.",
  category: "Experimental" as unknown as Effect["category"],
  icon: <Watch size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import { useSpring, useMotionValue, motion } from "motion/react";
import { useEffect, useState, useMemo } from "react";

function buildPositions(count, containerW, containerH, iconSize, gap) {
  const cols = Math.ceil(Math.sqrt(count * 1.3));
  const cellW = iconSize + gap;
  const cellH = cellW * 0.866;
  const positions = [];
  for (let row = 0; positions.length < count; row++) {
    const offsetX = (row % 2) * (cellW / 2);
    const colCount = row % 2 === 0 ? cols : cols - 1;
    for (let col = 0; col < colCount && positions.length < count; col++) {
      positions.push({ cx: offsetX + col * cellW + cellW / 2, cy: row * cellH + (iconSize + gap) / 2 });
    }
  }
  const maxCx = Math.max(...positions.map(p => p.cx));
  const maxCy = Math.max(...positions.map(p => p.cy));
  const offX = (containerW - maxCx - iconSize / 2) / 2;
  const offY = (containerH - maxCy - iconSize / 2) / 2;
  return positions.map(({ cx, cy }) => ({ cx: cx + offX, cy: cy + offY }));
}

export function AppleWatchGrid({ count = ${n(p.count)} }: { count?: number }) {
  const containerW = 340, containerH = 220;
  const iconSize = Math.max(28, Math.floor((containerW / Math.ceil(Math.sqrt(count * 1.3))) * 0.72));
  const rawX = useMotionValue(containerW / 2);
  const rawY = useMotionValue(containerH / 2);
  const px = useSpring(rawX, { stiffness: 300, damping: 30 });
  const py = useSpring(rawY, { stiffness: 300, damping: 30 });
  const [cursor, setCursor] = useState({ x: containerW / 2, y: containerH / 2 });

  useEffect(() => {
    const ux = px.on("change", x => setCursor(c => ({ ...c, x })));
    const uy = py.on("change", y => setCursor(c => ({ ...c, y })));
    return () => { ux(); uy(); };
  }, [px, py]);

  const positions = useMemo(() => buildPositions(count, containerW, containerH, iconSize, ${n(p.gap)}), [count, iconSize]);

  return (
    <div
      style={{ position: "relative", width: containerW, height: containerH, overflow: "hidden" }}
      onPointerMove={e => { const r = e.currentTarget.getBoundingClientRect(); rawX.set(e.clientX - r.left); rawY.set(e.clientY - r.top); }}
      onPointerLeave={() => { rawX.set(containerW / 2); rawY.set(containerH / 2); }}
    >
      {positions.map((pos, i) => {
        const dist = Math.sqrt((cursor.x - pos.cx) ** 2 + (cursor.y - pos.cy) ** 2);
        const proximity = Math.max(0, 1 - dist / (iconSize * 3));
        const scale = 1 + proximity * ${n(p.fisheye)} * 0.6;
        const springScale = useSpring(scale, { stiffness: ${n(p.stiffness)}, damping: ${n(p.damping)} });
        return (
          <motion.div key={i} style={{
            position: "absolute", width: iconSize, height: iconSize,
            borderRadius: iconSize * 0.23,
            left: pos.cx - iconSize / 2, top: pos.cy - iconSize / 2,
            scale: springScale, transformOrigin: "center",
          }} />
        );
      })}
    </div>
  );
}`,
  },
};

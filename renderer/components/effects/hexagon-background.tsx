import { motion } from "motion/react";
import { Hexagon } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "size", type: "slider", label: "Hex size", min: 20, max: 60, step: 5, default: 36, unit: "px" },
  { id: "speed", type: "slider", label: "Pulse speed", min: 0.3, max: 3, step: 0.1, default: 1, unit: "s" },
  { id: "color", type: "color", label: "Hex color", default: "#6366f1" },
  { id: "bgColor", type: "color", label: "Background", default: "#0a0a0f" },
  { id: "gap", type: "slider", label: "Gap", min: 2, max: 16, step: 1, default: 4, unit: "px" },
] as const;

function hexPoints(r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (i * 60 * Math.PI) / 180;
    return `${r + Math.cos(angle) * r},${r + Math.sin(angle) * r}`;
  }).join(" ");
}

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const size = Number(params.size);
  const speed = Number(params.speed);
  const color = String(params.color);
  const bgColor = String(params.bgColor);
  const gap = Number(params.gap);

  const r = size / 2;
  const hexW = size;
  const hexH = Math.sqrt(3) * r;
  const colStep = hexW * 0.75 + gap;
  const rowStep = hexH + gap;

  const cols = Math.ceil(360 / colStep) + 2;
  const rows = Math.ceil(240 / rowStep) + 2;

  const hexagons: { x: number; y: number; idx: number }[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * colStep - hexW / 2;
      const y = row * rowStep + (col % 2 === 1 ? rowStep / 2 : 0) - hexH / 2;
      hexagons.push({ x, y, idx: row * cols + col });
    }
  }

  const pts = hexPoints(r);

  return (
    <div
      key={replayToken}
      className="relative rounded-panel overflow-hidden"
      style={{ width: 360, height: 240, background: bgColor }}
    >
      <svg width={360} height={240} style={{ position: "absolute", inset: 0 }}>
        {hexagons.map((h) => (
          <motion.polygon
            key={h.idx}
            points={pts}
            transform={`translate(${h.x}, ${h.y})`}
            fill={color}
            stroke={color}
            strokeWidth={0.5}
            strokeOpacity={0.3}
            initial={{ fillOpacity: 0.05 }}
            animate={{ fillOpacity: [0.05, 0.6, 0.05] }}
            transition={{
              duration: speed,
              delay: ((h.idx * 0.13) % 1) * speed,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

export const hexagonBackgroundEffect: Effect = {
  id: "hexagon-background",
  name: "Hexagon Background",
  description: "A honeycomb grid of hexagonal cells that pulse and glow sequentially.",
  category: "Backgrounds & ambient",
  icon: <Hexagon size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  supportsTexture: true,
  exports: {
    react: (p) => {
      const size = Number(p.size);
      const r = size / 2;
      const hexH = Math.sqrt(3) * r;
      const colStep = size * 0.75 + Number(p.gap);
      const rowStep = hexH + Number(p.gap);
      return `import { motion } from "motion/react";

function hexPoints(r) {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (i * 60 * Math.PI) / 180;
    return \`\${r + Math.cos(angle) * r},\${r + Math.sin(angle) * r}\`;
  }).join(" ");
}

export function HexagonBackground() {
  const r = ${n(r)};
  const colStep = ${n(colStep)};
  const rowStep = ${n(rowStep)};
  const hexH = ${n(hexH)};
  const hexW = ${n(size)};
  const cols = Math.ceil(window.innerWidth / colStep) + 2;
  const rows = Math.ceil(window.innerHeight / rowStep) + 2;
  const hexagons = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      hexagons.push({
        x: col * colStep - hexW / 2,
        y: row * rowStep + (col % 2 === 1 ? rowStep / 2 : 0) - hexH / 2,
        idx: row * cols + col,
      });
    }
  }
  const pts = hexPoints(r);
  return (
    <div style={{ position: "relative", overflow: "hidden", background: "${p.bgColor}", width: "100%", height: "100%" }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        {hexagons.map(h => (
          <motion.polygon key={h.idx} points={pts} transform={\`translate(\${h.x}, \${h.y})\`}
            fill="${p.color}" stroke="${p.color}" strokeWidth={0.5} strokeOpacity={0.3}
            initial={{ fillOpacity: 0.05 }}
            animate={{ fillOpacity: [0.05, 0.6, 0.05] }}
            transition={{ duration: ${n(p.speed)}, delay: ((h.idx * 0.13) % 1) * ${n(p.speed)}, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </svg>
    </div>
  );
}`;
    },
  },
};

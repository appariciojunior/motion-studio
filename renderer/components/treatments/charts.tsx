import { ChartLine } from "lucide-react";
import type { ControlDef } from "../effects/types";
import type { Treatment } from "./types";
import { mulberry32 } from "../../lib/canvas-fx";

const controls: ControlDef[] = [
  {
    id: "type",
    type: "segmented",
    label: "Type",
    default: "line",
    options: [
      { value: "line", label: "Line" },
      { value: "pie", label: "Pie" },
    ],
  },
  { id: "count", type: "slider", label: "Data points", min: 3, max: 16, step: 1, default: 8 },
  { id: "duration", type: "slider", label: "Animate", min: 0.5, max: 4, step: 0.5, default: 1.4, unit: "s" },
  { id: "color", type: "color", label: "Color", default: "#5b8cff" },
  { id: "seed", type: "slider", label: "Data seed", min: 1, max: 50, step: 1, default: 7 },
  { id: "grid", type: "switch", label: "Grid", default: true },
];

function hexToHsl(hex: string): [number, number, number] {
  const v = hex.replace("#", "");
  const full = v.length === 3 ? v.split("").map((c) => c + c).join("") : v;
  const int = parseInt(full, 16);
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const dl = max - min;
  const s = dl === 0 ? 0 : dl / (1 - Math.abs(2 * l - 1));
  if (dl !== 0) {
    if (max === r) h = ((g - b) / dl) % 6;
    else if (max === g) h = (b - r) / dl + 2;
    else h = (r - g) / dl + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, s, l];
}

function palette(base: string, n: number): string[] {
  const [h, s, l] = hexToHsl(base);
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const hue = (h + (i * 360) / n) % 360;
    out.push(`hsl(${hue.toFixed(0)}, ${(s * 100).toFixed(0)}%, ${(l * 100).toFixed(0)}%)`);
  }
  return out;
}

function values(count: number, seed: number): number[] {
  const rng = mulberry32(seed * 9973);
  return Array.from({ length: count }, () => 0.15 + rng() * 0.85);
}

export const chartsTreatment: Treatment = {
  id: "charts",
  name: "Charts",
  description: "Animated line and pie charts with sample data.",
  group: "Generators",
  icon: <ChartLine size={16} />,
  needsSource: false,
  animated: true,
  maxDim: 1100,
  aspect: 1.5,
  controls,
  draw: ({ ctx, width, height, params, time }) => {
    const type = String(params.type);
    const count = Number(params.count);
    const duration = Number(params.duration);
    const base = String(params.color);
    const seed = Number(params.seed);
    const showGrid = params.grid === true;
    const progress = duration > 0 ? Math.min(1, time / duration) : 1;
    // Ease-out for a lively draw-in.
    const p = 1 - Math.pow(1 - progress, 3);
    ctx.clearRect(0, 0, width, height);

    if (type === "pie") {
      const vals = values(count, seed);
      const total = vals.reduce((a, b) => a + b, 0);
      const colors = palette(base, count);
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.36;
      let start = -Math.PI / 2;
      const sweepTotal = Math.PI * 2 * p;
      let drawn = 0;
      for (let i = 0; i < count; i++) {
        const slice = (vals[i] / total) * Math.PI * 2;
        const remaining = sweepTotal - drawn;
        if (remaining <= 0) break;
        const thisSweep = Math.min(slice, remaining);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, start, start + thisSweep);
        ctx.closePath();
        ctx.fillStyle = colors[i];
        ctx.fill();
        start += slice;
        drawn += thisSweep;
      }
      // Donut hole.
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.globalCompositeOperation = "destination-out";
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      return;
    }

    // Line chart.
    const padX = width * 0.08;
    const padY = height * 0.12;
    const plotW = width - padX * 2;
    const plotH = height - padY * 2;
    const vals = values(count, seed);
    const pointAt = (i: number) => ({
      x: padX + (i / (count - 1)) * plotW,
      y: padY + (1 - vals[i]) * plotH,
    });

    if (showGrid) {
      ctx.strokeStyle = "rgba(128,128,128,0.25)";
      ctx.lineWidth = 1;
      for (let g = 0; g <= 4; g++) {
        const y = padY + (g / 4) * plotH;
        ctx.beginPath();
        ctx.moveTo(padX, y);
        ctx.lineTo(padX + plotW, y);
        ctx.stroke();
      }
    }

    // Path up to progress.
    const progIdx = p * (count - 1);
    const path: { x: number; y: number }[] = [];
    for (let i = 0; i < count; i++) {
      if (i <= progIdx) {
        path.push(pointAt(i));
      } else {
        const prev = pointAt(i - 1);
        const cur = pointAt(i);
        const f = progIdx - (i - 1);
        path.push({ x: prev.x + (cur.x - prev.x) * f, y: prev.y + (cur.y - prev.y) * f });
        break;
      }
    }

    if (path.length > 1) {
      // Area fill.
      const grad = ctx.createLinearGradient(0, padY, 0, padY + plotH);
      grad.addColorStop(0, `${base}66`);
      grad.addColorStop(1, `${base}00`);
      ctx.beginPath();
      ctx.moveTo(path[0].x, padY + plotH);
      for (const pt of path) ctx.lineTo(pt.x, pt.y);
      ctx.lineTo(path[path.length - 1].x, padY + plotH);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Line.
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (const pt of path) ctx.lineTo(pt.x, pt.y);
      ctx.strokeStyle = base;
      ctx.lineWidth = Math.max(2, width * 0.004);
      ctx.lineJoin = "round";
      ctx.stroke();

      // Leading dot.
      const tip = path[path.length - 1];
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, Math.max(3, width * 0.006), 0, Math.PI * 2);
      ctx.fillStyle = base;
      ctx.fill();
    }
  },
};

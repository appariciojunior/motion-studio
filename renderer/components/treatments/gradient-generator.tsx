import { Blend } from "lucide-react";
import type { ControlDef, EffectParams } from "../effects/types";
import type { Treatment } from "./types";
import { mulberry32 } from "../../lib/canvas-fx";

const controls: ControlDef[] = [
  {
    id: "type",
    type: "segmented",
    label: "Type",
    default: "linear",
    options: [
      { value: "linear", label: "Linear" },
      { value: "radial", label: "Radial" },
      { value: "mesh", label: "Mesh" },
    ],
  },
  {
    id: "angle",
    type: "slider",
    label: "Angle",
    min: 0,
    max: 360,
    step: 5,
    default: 45,
    unit: "°",
    visibleWhen: (p: EffectParams) => String(p.type) === "linear",
  },
  { id: "color1", type: "color", label: "Color 1", default: "#5b8cff" },
  { id: "color2", type: "color", label: "Color 2", default: "#b06ab3" },
  { id: "color3", type: "color", label: "Color 3", default: "#ff7e5f" },
  { id: "grain", type: "slider", label: "Grain", min: 0, max: 100, step: 1, default: 12, unit: "%" },
];

export const gradientGeneratorTreatment: Treatment = {
  id: "gradient-generator",
  name: "Gradient Generator",
  description: "Build linear, radial or mesh gradient backgrounds.",
  group: "Generators",
  icon: <Blend size={16} />,
  needsSource: false,
  animate: { param: "angle", from: 0, drift: { param: "angle", range: 360, cyclic: true } },
  maxDim: 1280,
  aspect: 1.6,
  controls,
  draw: ({ ctx, width, height, params }) => {
    const type = String(params.type);
    const c1 = String(params.color1);
    const c2 = String(params.color2);
    const c3 = String(params.color3);

    if (type === "mesh") {
      ctx.fillStyle = c2;
      ctx.fillRect(0, 0, width, height);
      const blobs: [number, number, string][] = [
        [0.25, 0.3, c1],
        [0.8, 0.35, c3],
        [0.55, 0.85, c1],
        [0.15, 0.8, c3],
      ];
      ctx.globalCompositeOperation = "lighter";
      for (const [x, y, color] of blobs) {
        const g = ctx.createRadialGradient(
          x * width,
          y * height,
          0,
          x * width,
          y * height,
          Math.min(width, height) * 0.7,
        );
        g.addColorStop(0, color);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
      }
      ctx.globalCompositeOperation = "source-over";
    } else if (type === "radial") {
      const g = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.7,
      );
      g.addColorStop(0, c1);
      g.addColorStop(0.55, c2);
      g.addColorStop(1, c3);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
    } else {
      const rad = (Number(params.angle) * Math.PI) / 180;
      const cx = width / 2;
      const cy = height / 2;
      const len = (Math.abs(Math.cos(rad)) * width + Math.abs(Math.sin(rad)) * height) / 2;
      const dx = Math.cos(rad) * len;
      const dy = Math.sin(rad) * len;
      const g = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
      g.addColorStop(0, c1);
      g.addColorStop(0.5, c2);
      g.addColorStop(1, c3);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
    }

    const grain = (Number(params.grain) / 100) * 60;
    if (grain > 0) {
      const img = ctx.getImageData(0, 0, width, height);
      const d = img.data;
      const rng = mulberry32(2026);
      for (let i = 0; i < d.length; i += 4) {
        const n = (rng() - 0.5) * 2 * grain;
        d[i] += n;
        d[i + 1] += n;
        d[i + 2] += n;
      }
      ctx.putImageData(img, 0, 0);
    }
  },
};

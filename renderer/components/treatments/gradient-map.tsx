import { Palette } from "lucide-react";
import type { ControlDef } from "../effects/types";
import type { Treatment } from "./types";
import { drawCover, luma } from "./types";
import { buildGradientLut, mulberry32 } from "../../lib/canvas-fx";

const GRADIENTS: Record<string, [number, string][]> = {
  cobalt: [[0, "#0b1e3f"], [0.35, "#2f6fd0"], [0.6, "#b9a07a"], [0.82, "#e9b8e0"], [1, "#1a1230"]],
  magma: [[0, "#000004"], [0.35, "#7a0177"], [0.65, "#f1652a"], [0.85, "#fee08b"], [1, "#ffffff"]],
  viridis: [[0, "#440154"], [0.4, "#31688e"], [0.7, "#35b779"], [1, "#fde725"]],
  ice: [[0, "#03045e"], [0.5, "#00b4d8"], [1, "#caf0f8"]],
  mono: [[0, "#000000"], [1, "#ffffff"]],
  sunset: [[0, "#0d1b2a"], [0.4, "#e63946"], [0.7, "#f4a261"], [1, "#ffe8d6"]],
};

const controls: ControlDef[] = [
  {
    id: "gradient",
    type: "select",
    label: "Gradient",
    default: "cobalt",
    options: [
      { value: "cobalt", label: "Cobalt" },
      { value: "magma", label: "Magma" },
      { value: "viridis", label: "Viridis" },
      { value: "ice", label: "Ice" },
      { value: "sunset", label: "Sunset" },
      { value: "mono", label: "Mono" },
    ],
  },
  { id: "scatter", type: "slider", label: "Scatter", min: 0, max: 60, step: 1, default: 0 },
  { id: "offset", type: "slider", label: "Offset", min: 0, max: 100, step: 1, default: 0 },
  {
    id: "repeat",
    type: "select",
    label: "Repeat type",
    default: "clamp",
    options: [
      { value: "clamp", label: "None" },
      { value: "repeat", label: "Repeat" },
      { value: "mirror", label: "Mirror" },
    ],
  },
];

function remap(v: number, mode: string): number {
  if (mode === "repeat") return ((v % 256) + 256) % 256;
  if (mode === "mirror") {
    const m = ((v % 512) + 512) % 512;
    return m < 256 ? m : 511 - m;
  }
  return Math.min(255, Math.max(0, v));
}

export const gradientMapTreatment: Treatment = {
  id: "gradient-map",
  name: "Gradient Map",
  description: "Remap image luminance through a color gradient.",
  group: "Image effects",
  icon: <Palette size={16} />,
  needsSource: true,
  animate: { param: "offset", from: 0, drift: { param: "offset", range: 100 } },
  maxDim: 1280,
  controls,
  draw: ({ ctx, width, height, source, params }) => {
    if (!source) return;
    drawCover(ctx, source, width, height);
    const img = ctx.getImageData(0, 0, width, height);
    const d = img.data;
    const lut = buildGradientLut(GRADIENTS[String(params.gradient)] ?? GRADIENTS.cobalt);
    const scatter = Number(params.scatter);
    const offset = (Number(params.offset) / 100) * 255;
    const mode = String(params.repeat);
    const rng = mulberry32(1337);
    for (let i = 0; i < d.length; i += 4) {
      let l = luma(d[i], d[i + 1], d[i + 2]) + offset;
      if (scatter > 0) l += (rng() - 0.5) * 2 * scatter;
      const idx = Math.round(remap(l, mode)) * 3;
      d[i] = lut[idx];
      d[i + 1] = lut[idx + 1];
      d[i + 2] = lut[idx + 2];
    }
    ctx.putImageData(img, 0, 0);
  },
};

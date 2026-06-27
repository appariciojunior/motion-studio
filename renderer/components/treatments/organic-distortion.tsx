import { Waves } from "lucide-react";
import type { ControlDef } from "../effects/types";
import type { Treatment } from "./types";
import { drawCover } from "./types";
import { makeValueNoise, sampleBilinear, boxBlur } from "../../lib/canvas-fx";

const controls: ControlDef[] = [
  { id: "displace", type: "slider", label: "Displace", min: 0, max: 100, step: 1, default: 30, unit: "%" },
  { id: "noise", type: "slider", label: "Noise", min: 1, max: 12, step: 1, default: 3 },
  { id: "angle", type: "slider", label: "Angle", min: 0, max: 360, step: 5, default: 45, unit: "°" },
  { id: "blur", type: "slider", label: "Blur radius", min: 0, max: 24, step: 1, default: 0, unit: "px" },
];

export const organicDistortionTreatment: Treatment = {
  id: "organic-distortion",
  name: "Organic Distortion",
  description: "Warp the image with a smooth, organic noise field.",
  group: "Image effects",
  icon: <Waves size={16} />,
  needsSource: true,
  animate: { param: "displace", from: 0, drift: { param: "angle", range: 360, cyclic: true } },
  maxDim: 920,
  controls,
  draw: ({ ctx, width, height, source, params }) => {
    if (!source) return;
    // Render source into a temp canvas to read pixels, then displace into ctx.
    const tmp = document.createElement("canvas");
    tmp.width = width;
    tmp.height = height;
    const tctx = tmp.getContext("2d");
    if (!tctx) return;
    drawCover(tctx, source, width, height);
    const src = tctx.getImageData(0, 0, width, height).data;

    const out = ctx.createImageData(width, height);
    const o = out.data;
    const cells = Number(params.noise);
    const nx = makeValueNoise(cells, cells, 7);
    const ny = makeValueNoise(cells, cells, 99);
    const amp = (Number(params.displace) / 100) * Math.min(width, height) * 0.25;
    const rad = (Number(params.angle) * Math.PI) / 180;
    const ca = Math.cos(rad);
    const sa = Math.sin(rad);
    const sample: number[] = [0, 0, 0, 0];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const u = x / width;
        const v = y / height;
        const dx = (nx(u, v) - 0.5) * 2 * amp;
        const dy = (ny(u, v) - 0.5) * 2 * amp;
        const rx = dx * ca - dy * sa;
        const ry = dx * sa + dy * ca;
        sampleBilinear(src, width, height, x + rx, y + ry, sample);
        const i = (y * width + x) * 4;
        o[i] = sample[0];
        o[i + 1] = sample[1];
        o[i + 2] = sample[2];
        o[i + 3] = 255;
      }
    }
    const blur = Number(params.blur);
    if (blur > 0) boxBlur(o, width, height, blur);
    ctx.putImageData(out, 0, 0);
  },
};

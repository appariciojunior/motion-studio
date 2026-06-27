import { Droplets } from "lucide-react";
import type { ControlDef } from "../effects/types";
import type { Treatment } from "./types";
import { drawCover } from "./types";
import { sampleBilinear } from "../../lib/canvas-fx";

const controls: ControlDef[] = [
  { id: "amp", type: "slider", label: "Amplitude", min: 0, max: 40, step: 1, default: 14, unit: "px" },
  { id: "freq", type: "slider", label: "Rings", min: 1, max: 40, step: 1, default: 16 },
  { id: "cx", type: "slider", label: "Center X", min: 0, max: 100, step: 1, default: 50, unit: "%" },
  { id: "cy", type: "slider", label: "Center Y", min: 0, max: 100, step: 1, default: 50, unit: "%" },
  { id: "decay", type: "slider", label: "Falloff", min: 0, max: 100, step: 1, default: 40, unit: "%" },
  { id: "speed", type: "slider", label: "Speed", min: 0, max: 6, step: 0.5, default: 2, unit: "x" },
];

export const rippleTreatment: Treatment = {
  id: "ripple",
  name: "Ripple",
  description: "Animated concentric ripples radiating from a center point.",
  group: "Image effects",
  icon: <Droplets size={16} />,
  needsSource: true,
  animated: true,
  animate: { param: "amp", from: 0 },
  maxDim: 760,
  controls,
  draw: ({ ctx, width, height, source, params, time }) => {
    if (!source) return;
    const tmp = document.createElement("canvas");
    tmp.width = width;
    tmp.height = height;
    const tctx = tmp.getContext("2d");
    if (!tctx) return;
    drawCover(tctx, source, width, height);
    const src = tctx.getImageData(0, 0, width, height).data;

    const out = ctx.createImageData(width, height);
    const o = out.data;
    const amp = Number(params.amp);
    const freq = Number(params.freq);
    const cx = (Number(params.cx) / 100) * width;
    const cy = (Number(params.cy) / 100) * height;
    const decay = Number(params.decay) / 100;
    const speed = Number(params.speed);
    const maxR = Math.hypot(width, height);
    const k = (freq * Math.PI * 2) / maxR;
    const phase = time * speed * Math.PI * 2;
    const sample: number[] = [0, 0, 0, 0];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.hypot(dx, dy) || 1;
        const fall = 1 - decay * (dist / maxR);
        const disp = Math.sin(dist * k - phase) * amp * fall;
        const sx = x + (dx / dist) * disp;
        const sy = y + (dy / dist) * disp;
        sampleBilinear(src, width, height, sx, sy, sample);
        const i = (y * width + x) * 4;
        o[i] = sample[0];
        o[i + 1] = sample[1];
        o[i + 2] = sample[2];
        o[i + 3] = 255;
      }
    }
    ctx.putImageData(out, 0, 0);
  },
};

import { AudioWaveform } from "lucide-react";
import type { ControlDef } from "../effects/types";
import type { Treatment } from "./types";
import { drawCover, luma } from "./types";
import { BAYER4 } from "../../lib/canvas-fx";

const controls: ControlDef[] = [
  { id: "pixel", type: "slider", label: "Pixel size", min: 1, max: 16, step: 1, default: 4, unit: "px" },
  { id: "levels", type: "slider", label: "Levels", min: 2, max: 6, step: 1, default: 2 },
  { id: "amp", type: "slider", label: "Wave amount", min: 0, max: 60, step: 1, default: 18, unit: "px" },
  { id: "freq", type: "slider", label: "Wave frequency", min: 1, max: 30, step: 1, default: 8 },
  { id: "mono", type: "switch", label: "Monochrome", default: true },
];

function quantize(v: number, levels: number, threshold: number): number {
  const step = 255 / (levels - 1);
  return Math.round((v + (threshold - 0.5) * step) / step) * step;
}

export const ditherWavesTreatment: Treatment = {
  id: "dither-waves",
  name: "Dither Waves",
  description: "Ordered dithering with a rippling wave displacement.",
  group: "Image effects",
  icon: <AudioWaveform size={16} />,
  needsSource: true,
  animate: { param: "amp", from: 0, drift: { param: "freq", range: 12 } },
  maxDim: 1100,
  controls,
  draw: ({ ctx, width, height, source, params }) => {
    if (!source) return;
    const tmp = document.createElement("canvas");
    tmp.width = width;
    tmp.height = height;
    const tctx = tmp.getContext("2d");
    if (!tctx) return;
    drawCover(tctx, source, width, height);
    const src = tctx.getImageData(0, 0, width, height).data;

    const px = Number(params.pixel);
    const levels = Number(params.levels);
    const amp = Number(params.amp);
    const freq = Number(params.freq);
    const mono = params.mono === true;
    const waveK = (freq * Math.PI * 2) / height;

    ctx.clearRect(0, 0, width, height);
    const cols = Math.ceil(width / px);
    const rows = Math.ceil(height / px);
    for (let r = 0; r < rows; r++) {
      const by = r * px;
      const shift = Math.round(Math.sin(by * waveK) * amp);
      for (let c = 0; c < cols; c++) {
        const bx = c * px;
        const sx = Math.min(width - 1, Math.max(0, bx + shift));
        const sy = Math.min(height - 1, by);
        const i = (sy * width + sx) * 4;
        const th = BAYER4[r % 4][c % 4];
        if (mono) {
          const v = quantize(luma(src[i], src[i + 1], src[i + 2]), levels, th);
          ctx.fillStyle = `rgb(${v},${v},${v})`;
        } else {
          const rr = quantize(src[i], levels, th);
          const gg = quantize(src[i + 1], levels, th);
          const bb = quantize(src[i + 2], levels, th);
          ctx.fillStyle = `rgb(${rr},${gg},${bb})`;
        }
        ctx.fillRect(bx, by, px, px);
      }
    }
  },
};

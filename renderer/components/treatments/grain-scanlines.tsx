import { Tv } from "lucide-react";
import type { ControlDef } from "../effects/types";
import type { Treatment } from "./types";
import { drawCover } from "./types";
import { mulberry32 } from "../../lib/canvas-fx";

const controls: ControlDef[] = [
  { id: "grain", type: "slider", label: "Film grain", min: 0, max: 100, step: 1, default: 35, unit: "%" },
  { id: "scanlines", type: "slider", label: "Scanlines", min: 0, max: 100, step: 1, default: 30, unit: "%" },
  { id: "scanGap", type: "slider", label: "Scanline gap", min: 2, max: 12, step: 1, default: 3, unit: "px" },
  { id: "vignette", type: "slider", label: "Vignette", min: 0, max: 100, step: 1, default: 40, unit: "%" },
  { id: "contrast", type: "slider", label: "Contrast", min: 50, max: 200, step: 5, default: 105, unit: "%" },
];

export const grainScanlinesTreatment: Treatment = {
  id: "grain-scanlines",
  name: "Grain & Scanlines",
  description: "Analog film grain, scanlines and vignette baked into the image.",
  group: "Image effects",
  icon: <Tv size={16} />,
  needsSource: true,
  animate: { param: "scanlines", from: 0, drift: { param: "scanGap", range: 10 } },
  maxDim: 1280,
  controls,
  draw: ({ ctx, width, height, source, params }) => {
    if (!source) return;
    drawCover(ctx, source, width, height);
    const img = ctx.getImageData(0, 0, width, height);
    const d = img.data;
    const grain = (Number(params.grain) / 100) * 80;
    const contrast = Number(params.contrast) / 100;
    const rng = mulberry32(555);
    if (grain > 0 || contrast !== 1) {
      for (let i = 0; i < d.length; i += 4) {
        const noise = grain > 0 ? (rng() - 0.5) * 2 * grain : 0;
        for (let c = 0; c < 3; c++) {
          let v = d[i + c];
          if (contrast !== 1) v = (v - 128) * contrast + 128;
          d[i + c] = v + noise;
        }
      }
    }
    ctx.putImageData(img, 0, 0);

    const scan = Number(params.scanlines) / 100;
    const gap = Number(params.scanGap);
    if (scan > 0) {
      ctx.fillStyle = `rgba(0,0,0,${(scan * 0.6).toFixed(3)})`;
      for (let y = 0; y < height; y += gap) ctx.fillRect(0, y, width, 1);
    }

    const vig = Number(params.vignette) / 100;
    if (vig > 0) {
      const g = ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.3,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.72,
      );
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, `rgba(0,0,0,${(vig * 0.85).toFixed(3)})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
    }
  },
};

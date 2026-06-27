import { Grid2x2 } from "lucide-react";
import type { ControlDef } from "../effects/types";
import type { Treatment } from "./types";
import { drawCover, luma } from "./types";
import { mulberry32 } from "../../lib/canvas-fx";

const controls: ControlDef[] = [
  { id: "cell", type: "slider", label: "Cell size", min: 6, max: 40, step: 1, default: 14, unit: "px" },
  { id: "gap", type: "slider", label: "Gap", min: 0, max: 8, step: 1, default: 2, unit: "px" },
  {
    id: "shape",
    type: "segmented",
    label: "Shape",
    default: "bar",
    options: [
      { value: "square", label: "Square" },
      { value: "circle", label: "Circle" },
      { value: "bar", label: "Bar" },
    ],
  },
  { id: "scale", type: "slider", label: "Brightness size", min: 0, max: 100, step: 1, default: 40, unit: "%" },
  { id: "jitter", type: "slider", label: "Jitter", min: 0, max: 100, step: 1, default: 0, unit: "%" },
];

export const particleGridTreatment: Treatment = {
  id: "particle-grid",
  name: "Particle Grid",
  description: "Sample the image into a grid of colored cells.",
  group: "Image effects",
  icon: <Grid2x2 size={16} />,
  needsSource: true,
  animate: { param: "scale", from: 0, drift: { param: "jitter", range: 100 } },
  maxDim: 1280,
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

    const cell = Number(params.cell);
    const gap = Number(params.gap);
    const shape = String(params.shape);
    const scaleAmt = Number(params.scale) / 100;
    const jitterAmt = Number(params.jitter) / 100;
    const rng = mulberry32(42);

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);
    const cols = Math.ceil(width / cell);
    const rows = Math.ceil(height / cell);
    const inner = Math.max(1, cell - gap);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const sx = Math.min(width - 1, Math.floor(c * cell + cell / 2));
        const sy = Math.min(height - 1, Math.floor(r * cell + cell / 2));
        const i = (sy * width + sx) * 4;
        const rr = src[i];
        const gg = src[i + 1];
        const bb = src[i + 2];
        const l = luma(rr, gg, bb) / 255;
        // size factor: blend full size with luminance-scaled size
        const sizeF = 1 - scaleAmt + scaleAmt * l;
        const jx = jitterAmt ? (rng() - 0.5) * cell * jitterAmt : 0;
        const jy = jitterAmt ? (rng() - 0.5) * cell * jitterAmt : 0;
        const w = inner * sizeF;
        const x = c * cell + (cell - w) / 2 + jx;
        const y = r * cell + (cell - w) / 2 + jy;
        ctx.fillStyle = `rgb(${rr},${gg},${bb})`;
        if (shape === "circle") {
          ctx.beginPath();
          ctx.arc(x + w / 2, y + w / 2, w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (shape === "bar") {
          const barH = inner * (0.4 + 0.6 * l);
          const bw = Math.max(1, inner * 0.7);
          ctx.fillRect(c * cell + (cell - bw) / 2 + jx, r * cell + (cell - barH) / 2 + jy, bw, barH);
        } else {
          ctx.fillRect(x, y, w, w);
        }
      }
    }
  },
};

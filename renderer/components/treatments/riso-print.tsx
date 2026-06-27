import { Layers } from "lucide-react";
import type { ControlDef, EffectParams } from "../effects/types";
import type { Treatment } from "./types";
import { drawCover, luma, hexToRgb } from "./types";
import { mulberry32 } from "../../lib/canvas-fx";

const controls: ControlDef[] = [
  {
    id: "inks",
    type: "segmented",
    label: "Inks",
    default: "2",
    options: [
      { value: "2", label: "2" },
      { value: "3", label: "3" },
    ],
  },
  { id: "ink1", type: "color", label: "Ink 1", default: "#3d34d6" },
  { id: "ink2", type: "color", label: "Ink 2", default: "#ff7a59" },
  {
    id: "ink3",
    type: "color",
    label: "Ink 3",
    default: "#1a1a1a",
    visibleWhen: (p: EffectParams) => String(p.inks) === "3",
  },
  { id: "registration", type: "slider", label: "Registration", min: 0, max: 16, step: 1, default: 4, unit: "px" },
  { id: "grain", type: "slider", label: "Grain", min: 0, max: 100, step: 1, default: 35, unit: "%" },
  { id: "contrast", type: "slider", label: "Contrast", min: 50, max: 200, step: 5, default: 120, unit: "%" },
];

const OFFSETS: [number, number][] = [
  [0, 0],
  [1, -1],
  [-1, 1],
];

export const risoPrintTreatment: Treatment = {
  id: "riso-print",
  name: "Riso Print",
  description: "Posterized spot-color inks with grain and misregistration.",
  group: "Image effects",
  icon: <Layers size={16} />,
  needsSource: true,
  animate: { param: "registration", from: 0 },
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

    const inkCount = String(params.inks) === "3" ? 3 : 2;
    const inks = [String(params.ink1), String(params.ink2), String(params.ink3)]
      .slice(0, inkCount)
      .map(hexToRgb);
    const reg = Number(params.registration);
    const grain = Number(params.grain) / 100;
    const contrast = Number(params.contrast) / 100;
    const rng = mulberry32(2024);

    // Paper.
    ctx.fillStyle = "#f4f1ea";
    ctx.fillRect(0, 0, width, height);

    for (let k = 0; k < inkCount; k++) {
      const layer = ctx.createImageData(width, height);
      const ld = layer.data;
      const [ir, ig, ib] = inks[k];
      for (let i = 0; i < src.length; i += 4) {
        let l = luma(src[i], src[i + 1], src[i + 2]) / 255;
        l = Math.min(1, Math.max(0, (l - 0.5) * contrast + 0.5));
        const band = Math.min(inkCount - 1, Math.floor((1 - l) * inkCount));
        let on = band === k;
        // Stipple grain: randomly drop ink, and sprinkle into the lightest band.
        if (on && grain > 0 && rng() < grain * 0.35) on = false;
        if (!on && k === inkCount - 1 && band === inkCount - 2 && grain > 0 && rng() < grain * 0.12) {
          on = true;
        }
        if (on) {
          ld[i] = ir;
          ld[i + 1] = ig;
          ld[i + 2] = ib;
          ld[i + 3] = 255;
        }
      }
      tctx.clearRect(0, 0, width, height);
      tctx.putImageData(layer, 0, 0);
      const [ox, oy] = OFFSETS[k];
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(tmp, ox * reg, oy * reg);
    }
    ctx.globalCompositeOperation = "source-over";
  },
};

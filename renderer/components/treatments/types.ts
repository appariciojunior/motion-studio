import type { ReactNode } from "react";
import type { ControlDef, EffectParams } from "../effects/types";

// ── Image treatment model ─────────────────────────────────────────────
// The "Effects" library: pixel/canvas treatments that run on a source image
// (or generate their own output), tuned live and exported as PNG. Treatments
// reuse the same `ControlDef` schema as motion effects so the control panel
// renders them with no extra work — but they draw to a <canvas> instead of
// rendering a motion React tree.

export type TreatmentGroup = "Image effects" | "Generators";

export const TREATMENT_GROUPS: readonly TreatmentGroup[] = [
  "Image effects",
  "Generators",
] as const;

export interface DrawContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  /** Decoded source image, or null for generators / before load. */
  source: HTMLImageElement | null;
  params: EffectParams;
  /** Elapsed seconds since mount/replay; 0 for static treatments. */
  time: number;
}

/**
 * How a treatment moves when animation is enabled. The stage drives this by
 * overriding params per frame — no per-treatment draw code needed.
 * - `param`/`from`: in **Ease** mode this param eases from `from` up to its set
 *   value and back (a reveal). It's also the fallback drift target.
 * - `drift`: in **Drift** mode this companion param keeps moving. Mark it
 *   `cyclic` (with `range` = one full cycle, e.g. 360 for an angle) to advance
 *   continuously and wrap seamlessly; otherwise it sways organically across
 *   `range` and returns without a jump.
 */
export interface AnimateConfig {
  param: string;
  from: number;
  drift?: { param: string; range: number; cyclic?: boolean };
}

export interface Treatment {
  id: string;
  name: string;
  description: string;
  group: TreatmentGroup;
  icon: ReactNode;
  /** Needs a source image to render meaningfully (vs. a generator). */
  needsSource: boolean;
  /** Drive an rAF loop (charts, ripple). Static treatments redraw on change. */
  animated?: boolean;
  /** Opt in to easing-driven animation + video/GIF export. */
  animate?: AnimateConfig;
  /** Longest canvas edge in px (perf cap for heavy per-pixel treatments). */
  maxDim?: number;
  /** Width/height ratio for generators (no source). Default 1.6 (16:10). */
  aspect?: number;
  controls: ControlDef[];
  draw: (dc: DrawContext) => void;
}

// ── Shared canvas helpers ─────────────────────────────────────────────

/** Cover-fit a source image into w×h (like CSS object-fit: cover). */
export function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
) {
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

/** Perceptual luminance 0..255 from 8-bit RGB. */
export function luma(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Parse "#rrggbb" into [r,g,b] (0..255). */
export function hexToRgb(hex: string): [number, number, number] {
  const v = hex.replace("#", "");
  const full = v.length === 3 ? v.split("").map((c) => c + c).join("") : v;
  const int = parseInt(full, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

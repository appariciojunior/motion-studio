import type { ComponentType, ReactNode } from "react";

// ── Control schema ────────────────────────────────────────────────────
// Each effect declares the knobs it exposes. The control panel renders these
// with the Glaze design system and the export generators read the same values.

export type ParamValue = number | string | boolean;
export type EffectParams = Record<string, ParamValue>;

interface ControlBase {
  id: string;
  label: string;
  /** Hide this control unless the predicate is true (e.g. spring-only knobs). */
  visibleWhen?: (params: EffectParams) => boolean;
}

export type ControlDef =
  | (ControlBase & {
      type: "slider";
      min: number;
      max: number;
      step: number;
      default: number;
      unit?: string;
    })
  | (ControlBase & { type: "switch"; default: boolean })
  | (ControlBase & {
      type: "select";
      options: { value: string; label: string }[];
      default: string;
    })
  | (ControlBase & {
      type: "segmented";
      options: { value: string; label: string }[];
      default: string;
    })
  | (ControlBase & { type: "color"; default: string })
  // Cubic-bezier easing curve. Value is stored as "x1,y1,x2,y2".
  | (ControlBase & { type: "bezier"; default: string });

// ── Categories ────────────────────────────────────────────────────────
// Effects are grouped in the sidebar by category, in this order.

export const CATEGORIES = [
  "Text effects",
  "Loading & feedback",
  "Backgrounds & ambient",
  "Overlays & dialogs",
  "Transitions & lists",
  "Micro-interactions",
  "Forms & inputs",
  "Heroes",
  "Experimental",
] as const;

export type Category = (typeof CATEGORIES)[number];

// ── Effect definition ─────────────────────────────────────────────────

export interface PreviewProps {
  params: EffectParams;
  /** Increments whenever the user hits Replay — remount or retrigger on change. */
  replayToken: number;
}

export interface EffectExport {
  /** React component source using `motion`. */
  react: (params: EffectParams) => string;
  /** Vanilla JavaScript (no React) using `motion`'s `animate`. */
  js?: (params: EffectParams) => string;
  /** Plain CSS equivalent. Omitted when the effect can't be expressed in CSS. */
  css?: (params: EffectParams) => string;
}

export interface Effect {
  id: string;
  name: string;
  description: string;
  category: Category;
  icon: ReactNode;
  controls: ControlDef[];
  Preview: ComponentType<PreviewProps>;
  exports: EffectExport;
  /**
   * Opt in to the Texture & grain controls. Only meaningful for gradient /
   * ambient surfaces where grain adds depth; the overlay is scoped to this
   * effect's item, not the whole preview stage.
   */
  supportsTexture?: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────

export function defaultParams(controls: ControlDef[]): EffectParams {
  const params: EffectParams = {};
  for (const control of controls) params[control.id] = control.default;
  return params;
}

/** Round a number to at most 2 decimals for clean export strings. */
export function n(value: ParamValue): number {
  return Math.round(Number(value) * 100) / 100;
}

// ── Cubic-bezier easing helpers ───────────────────────────────────────
// Easing curves are stored as a "x1,y1,x2,y2" string so they fit ParamValue.

export type BezierPoints = [number, number, number, number];

/** Parse a "x1,y1,x2,y2" string into a 4-tuple (falls back to linear). */
export function parseBezier(value: ParamValue): BezierPoints {
  const parts = String(value)
    .split(",")
    .map((s) => Number(s.trim()));
  const [a = 0, b = 0, c = 1, d = 1] = parts;
  return [a, b, c, d];
}

/** Source literal for a motion `ease` array, e.g. `[0.25, 0.1, 0.25, 1]`. */
export function bezierArray(value: ParamValue): string {
  return `[${parseBezier(value).map(n).join(", ")}]`;
}

/** CSS easing string, e.g. `cubic-bezier(0.25, 0.1, 0.25, 1)`. */
export function bezierCss(value: ParamValue): string {
  return `cubic-bezier(${parseBezier(value).map(n).join(", ")})`;
}

/**
 * Build an easing function `f(x) -> y` from cubic-bezier control points, the
 * same math browsers use for `cubic-bezier()`. Solves x(t) = input with a few
 * Newton iterations, then evaluates y(t). Used to drive image-effect animation.
 */
export function makeBezierEasing(points: BezierPoints): (x: number) => number {
  const [x1, y1, x2, y2] = points;
  if (x1 === y1 && x2 === y2) return (x) => x; // linear shortcut
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const fx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const dfx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  const fy = (t: number) => ((ay * t + by) * t + cy) * t;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const err = fx(t) - x;
      if (Math.abs(err) < 1e-5) break;
      const d = dfx(t);
      if (Math.abs(d) < 1e-6) break;
      t -= err / d;
    }
    return fy(Math.min(1, Math.max(0, t)));
  };
}

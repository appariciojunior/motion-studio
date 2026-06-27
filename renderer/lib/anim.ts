// Easing-driven animation engine for the image-treatment lab. The stage calls
// `applyAnimation` once per frame to produce a param set that the treatment then
// draws normally — so every effect "moves" without bespoke draw code.

import { makeBezierEasing, parseBezier, type EffectParams } from "../components/effects/types";
import type { Treatment } from "../components/treatments/types";

export type AnimMode = "ease" | "drift";

export interface AnimationSettings {
  /** Master switch for easing-driven motion. */
  enabled: boolean;
  /** `ease` = reveal that eases in and out; `drift` = continuous motion. */
  mode: AnimMode;
  /** Seconds for one full loop (ease = there-and-back). */
  duration: number;
  /** Loop forever (true) or play once and hold (false). */
  loop: boolean;
  /** Cubic-bezier easing as "x1,y1,x2,y2". */
  easing: string;
}

export const defaultAnimation: AnimationSettings = {
  enabled: false,
  // Default to the organic, always-moving loop — what "animate" usually means.
  mode: "drift",
  duration: 4,
  loop: true,
  easing: "0.32,0.72,0,1",
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
/** Map a wave in ~[-1,1] to [0,1]. */
const unit = (w: number) => clamp01(0.5 + 0.5 * w);

/**
 * A perfectly periodic, organic-looking wave (returns to the same value AND
 * slope every loop, so motion never jumps at the boundary). It sums a few
 * harmonics whose periods all divide the loop, giving natural, non-mechanical
 * motion. `phase` shifts it without breaking periodicity — use it to give two
 * params a cross-rhythm so they don't move in lockstep.
 */
function organicWave(loopT: number, phase = 0): number {
  const p = 2 * Math.PI * loopT;
  return (
    Math.sin(p + phase) * 0.62 +
    Math.sin(2 * p + phase + 1.3) * 0.26 +
    Math.sin(3 * p + phase + 2.1) * 0.12
  );
}

/** Normalized position within the current loop, 0..1. */
export function loopProgress(elapsed: number, anim: AnimationSettings): number {
  if (anim.duration <= 0) return 0;
  const x = elapsed / anim.duration;
  return anim.loop ? x - Math.floor(x) : Math.min(x, 1);
}

/** Whether a treatment has any motion to animate or record. */
export function canAnimate(t: Treatment, anim: AnimationSettings): boolean {
  return Boolean(t.animated) || (anim.enabled && Boolean(t.animate));
}

/**
 * Produce the per-frame params for `treatment` at loop position `loopT` (0..1).
 * Returns the base params unchanged when animation is off or unsupported.
 */
export function applyAnimation(
  treatment: Treatment,
  base: EffectParams,
  anim: AnimationSettings,
  loopT: number,
): EffectParams {
  const cfg = treatment.animate;
  if (!anim.enabled || !cfg) return base;
  const out = { ...base };
  const setV = Number(base[cfg.param]);

  if (anim.mode === "drift") {
    // Organic, seamless, always-moving loop. The main param gently breathes near
    // its set value (the effect stays clearly visible) while an optional
    // companion param keeps moving: cyclic params (e.g. an angle) rotate
    // continuously and wrap; others sway on a cross-rhythm. Every loop joins the
    // next with no snap because organicWave() is perfectly periodic.
    const span = Math.abs(setV - cfg.from);
    out[cfg.param] = setV - span * 0.3 * unit(organicWave(loopT));
    if (cfg.drift) {
      const d = cfg.drift;
      const baseV = Number(base[d.param]);
      out[d.param] = d.cyclic
        ? baseV + d.range * loopT // continuous, wraps seamlessly (range = one cycle)
        : baseV + d.range * unit(organicWave(loopT, 2.4));
    }
    return out;
  }

  // Ease: triangle 0->1->0 shaped by the curve — a reveal that builds and recedes.
  const ease = makeBezierEasing(parseBezier(anim.easing));
  const tri = loopT < 0.5 ? loopT * 2 : (1 - loopT) * 2;
  out[cfg.param] = lerp(cfg.from, setV, ease(tri));
  return out;
}

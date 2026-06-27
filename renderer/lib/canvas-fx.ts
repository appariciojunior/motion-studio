// Shared low-level helpers for the canvas image treatments: seeded RNG, value
// noise, gradient lookup tables, ordered-dither matrix, and bilinear sampling.

/** Deterministic seeded PRNG (mulberry32). Returns a function -> [0,1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Normalized 4×4 Bayer matrix (values in [0,1)) for ordered dithering. */
export const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((row) => row.map((v) => v / 16));

type Stop = [number, string];

function hex3(hex: string): [number, number, number] {
  const v = hex.replace("#", "");
  const full = v.length === 3 ? v.split("").map((c) => c + c).join("") : v;
  const int = parseInt(full, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

/** Build a `size`-entry RGB lookup table from gradient stops (pos 0..1). */
export function buildGradientLut(stops: Stop[], size = 256): Uint8ClampedArray {
  const sorted = [...stops].sort((a, b) => a[0] - b[0]);
  const lut = new Uint8ClampedArray(size * 3);
  for (let i = 0; i < size; i++) {
    const t = i / (size - 1);
    let a = sorted[0];
    let b = sorted[sorted.length - 1];
    for (let s = 0; s < sorted.length - 1; s++) {
      if (t >= sorted[s][0] && t <= sorted[s + 1][0]) {
        a = sorted[s];
        b = sorted[s + 1];
        break;
      }
    }
    const span = b[0] - a[0] || 1;
    const f = Math.min(1, Math.max(0, (t - a[0]) / span));
    const ca = hex3(a[1]);
    const cb = hex3(b[1]);
    lut[i * 3] = ca[0] + (cb[0] - ca[0]) * f;
    lut[i * 3 + 1] = ca[1] + (cb[1] - ca[1]) * f;
    lut[i * 3 + 2] = ca[2] + (cb[2] - ca[2]) * f;
  }
  return lut;
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

/** Value-noise sampler over a random grid. Returns f(u,v) in [0,1], u/v in [0,1]. */
export function makeValueNoise(cols: number, rows: number, seed: number): (u: number, v: number) => number {
  const rng = mulberry32(seed);
  const gw = cols + 1;
  const gh = rows + 1;
  const grid = new Float32Array(gw * gh);
  for (let i = 0; i < grid.length; i++) grid[i] = rng();
  return (u: number, v: number) => {
    const x = Math.min(0.9999, Math.max(0, u)) * cols;
    const y = Math.min(0.9999, Math.max(0, v)) * rows;
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = smoothstep(x - x0);
    const fy = smoothstep(y - y0);
    const a = grid[y0 * gw + x0];
    const b = grid[y0 * gw + x0 + 1];
    const c = grid[(y0 + 1) * gw + x0];
    const d = grid[(y0 + 1) * gw + x0 + 1];
    const top = a + (b - a) * fx;
    const bot = c + (d - c) * fx;
    return top + (bot - top) * fy;
  };
}

/**
 * Fast separable box blur over the RGB channels of RGBA `data` (in place).
 * Three passes approximate a Gaussian. `radius` is in pixels; <= 0 is a no-op.
 * Reliable everywhere — avoids `ctx.filter`, which is flaky in WKWebView.
 */
export function boxBlur(data: Uint8ClampedArray, w: number, h: number, radius: number): void {
  const r = Math.round(radius);
  if (r <= 0 || w <= 0 || h <= 0) return;
  const passes = 3;
  const tmp = new Uint8ClampedArray(data.length);
  for (let p = 0; p < passes; p++) {
    // Horizontal pass: data -> tmp
    boxBlurAxis(data, tmp, w, h, r, true);
    // Vertical pass: tmp -> data
    boxBlurAxis(tmp, data, w, h, r, false);
  }
}

function boxBlurAxis(
  src: Uint8ClampedArray,
  dst: Uint8ClampedArray,
  w: number,
  h: number,
  r: number,
  horizontal: boolean,
): void {
  const len = horizontal ? w : h;
  const lines = horizontal ? h : w;
  const norm = 1 / (2 * r + 1);
  for (let line = 0; line < lines; line++) {
    const stride = horizontal ? 1 : w;
    const base = horizontal ? line * w : line;
    let sr = 0;
    let sg = 0;
    let sb = 0;
    // Prime the running sum over the initial window (edges clamped).
    for (let k = -r; k <= r; k++) {
      const idx = (base + clampIdx(k, len) * stride) * 4;
      sr += src[idx];
      sg += src[idx + 1];
      sb += src[idx + 2];
    }
    for (let i = 0; i < len; i++) {
      const o = (base + i * stride) * 4;
      dst[o] = sr * norm;
      dst[o + 1] = sg * norm;
      dst[o + 2] = sb * norm;
      dst[o + 3] = src[o + 3];
      const addI = clampIdx(i + r + 1, len);
      const subI = clampIdx(i - r, len);
      const add = (base + addI * stride) * 4;
      const sub = (base + subI * stride) * 4;
      sr += src[add] - src[sub];
      sg += src[add + 1] - src[sub + 1];
      sb += src[add + 2] - src[sub + 2];
    }
  }
}

function clampIdx(i: number, len: number): number {
  return i < 0 ? 0 : i >= len ? len - 1 : i;
}

/** Bilinear-sample RGBA from raw image data into `out` ([r,g,b,a]). Clamps edges. */
export function sampleBilinear(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  x: number,
  y: number,
  out: number[],
): void {
  const cx = Math.min(w - 1, Math.max(0, x));
  const cy = Math.min(h - 1, Math.max(0, y));
  const x0 = Math.floor(cx);
  const y0 = Math.floor(cy);
  const x1 = Math.min(w - 1, x0 + 1);
  const y1 = Math.min(h - 1, y0 + 1);
  const fx = cx - x0;
  const fy = cy - y0;
  const i00 = (y0 * w + x0) * 4;
  const i10 = (y0 * w + x1) * 4;
  const i01 = (y1 * w + x0) * 4;
  const i11 = (y1 * w + x1) * 4;
  for (let c = 0; c < 4; c++) {
    const top = data[i00 + c] + (data[i10 + c] - data[i00 + c]) * fx;
    const bot = data[i01 + c] + (data[i11 + c] - data[i01 + c]) * fx;
    out[c] = top + (bot - top) * fy;
  }
}

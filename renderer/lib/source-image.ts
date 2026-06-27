// ── Source image system ───────────────────────────────────────────────
// The image-treatment lab ("Effects") runs pixel/canvas treatments on a
// source image. We ship a handful of procedurally-generated sample images
// (license-clean, no bundled binaries) and let the user drop / pick their own.

export interface SampleImage {
  id: string;
  name: string;
  /** CSS background for the sidebar/panel thumbnail swatch. */
  swatch: string;
  /** Paint the sample into a 2D context of the given size. */
  render: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
}

const SAMPLE_W = 1280;
const SAMPLE_H = 800;

interface Blob {
  x: number; // 0..1
  y: number; // 0..1
  r: number; // 0..1 of min(w,h)
  color: string;
}

function paintMesh(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  bg: string,
  blobs: Blob[],
  composite: "source-over" | "lighter",
) {
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  const min = Math.min(w, h);
  ctx.globalCompositeOperation = composite;
  for (const b of blobs) {
    const cx = b.x * w;
    const cy = b.y * h;
    const radius = b.r * min;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    g.addColorStop(0, b.color);
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.globalCompositeOperation = "source-over";
}

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: "sunset",
    name: "Sunset",
    swatch: "radial-gradient(circle at 30% 30%, #ff5f6d, transparent 60%), radial-gradient(circle at 75% 70%, #845ec2, #1b0e3d)",
    render: (ctx, w, h) =>
      paintMesh(
        ctx,
        w,
        h,
        "#1b0e3d",
        [
          { x: 0.2, y: 0.3, r: 0.9, color: "#ff5f6d" },
          { x: 0.8, y: 0.25, r: 0.8, color: "#ffc371" },
          { x: 0.65, y: 0.8, r: 1.0, color: "#845ec2" },
          { x: 0.1, y: 0.9, r: 0.7, color: "#ff7e5f" },
        ],
        "lighter",
      ),
  },
  {
    id: "ocean",
    name: "Ocean",
    swatch: "radial-gradient(circle at 30% 35%, #00b4d8, transparent 60%), radial-gradient(circle at 70% 75%, #0077b6, #03045e)",
    render: (ctx, w, h) =>
      paintMesh(
        ctx,
        w,
        h,
        "#03045e",
        [
          { x: 0.25, y: 0.35, r: 0.85, color: "#00b4d8" },
          { x: 0.75, y: 0.3, r: 0.75, color: "#48cae4" },
          { x: 0.6, y: 0.85, r: 1.0, color: "#0077b6" },
          { x: 0.15, y: 0.8, r: 0.7, color: "#90e0ef" },
        ],
        "lighter",
      ),
  },
  {
    id: "citrus",
    name: "Citrus",
    swatch: "radial-gradient(circle at 75% 25%, #f3722c, transparent 55%), radial-gradient(circle at 25% 80%, #90be6d, #f9c74f)",
    render: (ctx, w, h) =>
      paintMesh(
        ctx,
        w,
        h,
        "#f9c74f",
        [
          { x: 0.8, y: 0.2, r: 0.7, color: "#f3722c" },
          { x: 0.2, y: 0.3, r: 0.6, color: "#90be6d" },
          { x: 0.7, y: 0.8, r: 0.9, color: "#f94144" },
          { x: 0.25, y: 0.85, r: 0.6, color: "#f9844a" },
        ],
        "source-over",
      ),
  },
  {
    id: "mono",
    name: "Mono",
    swatch: "linear-gradient(135deg, #0a0a0a, #7a7a7a, #f2f2f2)",
    render: (ctx, w, h) => {
      // Grayscale gradient + shapes — ideal for showing gradient map / dither.
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#0a0a0a");
      g.addColorStop(0.5, "#7a7a7a");
      g.addColorStop(1, "#f2f2f2");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      paintMesh(
        ctx,
        w,
        h,
        "rgba(0,0,0,0)",
        [
          { x: 0.3, y: 0.35, r: 0.5, color: "rgba(255,255,255,0.6)" },
          { x: 0.72, y: 0.62, r: 0.55, color: "rgba(0,0,0,0.55)" },
        ],
        "source-over",
      );
    },
  },
];

/** Render a sample image to an offscreen canvas and resolve it as an <img>. */
export function loadSample(sample: SampleImage): Promise<HTMLImageElement> {
  const canvas = document.createElement("canvas");
  canvas.width = SAMPLE_W;
  canvas.height = SAMPLE_H;
  const ctx = canvas.getContext("2d");
  if (ctx) sample.render(ctx, SAMPLE_W, SAMPLE_H);
  return dataUrlToImage(canvas.toDataURL("image/png"));
}

/** Read a user-dropped / picked image File into an <img>. */
export function loadFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const url = reader.result;
      if (typeof url !== "string") return reject(new Error("Unexpected file data"));
      dataUrlToImage(url).then(resolve, reject);
    };
    reader.readAsDataURL(file);
  });
}

function dataUrlToImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not decode image"));
    img.src = url;
  });
}

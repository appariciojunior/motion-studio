// Export an animated <canvas> as a video (MP4/WebM via MediaRecorder) or an
// animated GIF (gifenc). Both replay the same `render(elapsedSeconds)` callback
// the live stage uses, so exports match the preview exactly.

import { GIFEncoder, quantize, applyPalette } from "gifenc";

export type VideoFormat = "mp4" | "gif";

interface ExportOptions {
  /** Seconds of animation to capture (one full loop). */
  duration: number;
  /** Target frames per second. */
  fps: number;
  /** Draw a frame at the given elapsed time, in seconds. */
  render: (elapsed: number) => void;
  /** 0..1 progress callback (GIF only — video records in real time). */
  onProgress?: (progress: number) => void;
}

/** Pick the best MediaRecorder mime type this engine supports. */
function pickVideoMime(): { mime: string; ext: "mp4" | "webm" } | null {
  const candidates: { mime: string; ext: "mp4" | "webm" }[] = [
    { mime: "video/mp4;codecs=h264", ext: "mp4" },
    { mime: "video/mp4", ext: "mp4" },
    { mime: "video/webm;codecs=vp9", ext: "webm" },
    { mime: "video/webm;codecs=vp8", ext: "webm" },
    { mime: "video/webm", ext: "webm" },
  ];
  for (const c of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(c.mime)) return c;
  }
  return null;
}

/** True when this engine can capture a canvas stream to a video file. */
export function videoExportSupported(): boolean {
  return (
    typeof MediaRecorder !== "undefined" &&
    typeof HTMLCanvasElement !== "undefined" &&
    "captureStream" in HTMLCanvasElement.prototype &&
    pickVideoMime() !== null
  );
}

/** Record the canvas to a video Blob in real time. */
export async function exportCanvasVideo(
  canvas: HTMLCanvasElement,
  opts: ExportOptions,
): Promise<{ blob: Blob; ext: "mp4" | "webm" }> {
  const picked = pickVideoMime();
  if (!picked) throw new Error("Video recording is not supported in this environment.");
  const stream = (canvas as HTMLCanvasElement & {
    captureStream: (fps?: number) => MediaStream;
  }).captureStream(opts.fps);
  const recorder = new MediaRecorder(stream, {
    mimeType: picked.mime,
    videoBitsPerSecond: 12_000_000,
  });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  const stopped = new Promise<Blob>((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: picked.mime }));
  });

  recorder.start();
  const start = performance.now();
  await new Promise<void>((resolve) => {
    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      if (elapsed >= opts.duration) {
        opts.render(opts.duration);
        resolve();
        return;
      }
      opts.render(elapsed);
      opts.onProgress?.(elapsed / opts.duration);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  // Let the final frame land before stopping the recorder.
  await new Promise((r) => setTimeout(r, 60));
  recorder.stop();
  const blob = await stopped;
  return { blob, ext: picked.ext };
}

/** Encode the canvas to an animated GIF Blob, frame by frame. */
export async function exportCanvasGif(
  canvas: HTMLCanvasElement,
  opts: ExportOptions,
): Promise<Blob> {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable.");
  const gif = GIFEncoder();
  const frames = Math.max(2, Math.round(opts.duration * opts.fps));
  const delay = Math.round(1000 / opts.fps);
  for (let i = 0; i < frames; i++) {
    const elapsed = (i / frames) * opts.duration;
    opts.render(elapsed);
    const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const palette = quantize(data, 256);
    const index = applyPalette(data, palette);
    gif.writeFrame(index, width, height, { palette, delay });
    opts.onProgress?.((i + 1) / frames);
    // Yield so the UI stays responsive on large frames.
    if (i % 3 === 0) await new Promise((r) => setTimeout(r, 0));
  }
  gif.finish();
  return new Blob([new Uint8Array(gif.bytes())], { type: "image/gif" });
}

/** Trigger a browser download for a Blob. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

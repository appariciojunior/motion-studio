import * as React from "react";
import {
  Button,
  SegmentedControl,
  SegmentedControlItem,
  EmptyState,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@glaze/core/components";
import { ChevronLeft, ChevronRight, RotateCcw, Download, Check, ImageUp, Loader2 } from "lucide-react";
import type { Treatment } from "./treatments/types";
import type { EffectParams } from "./effects/types";
import { StageCanvasControls, type StageBackgroundMode, type StageCanvasTone } from "./stage-canvas-controls";
import { downloadCanvasPng } from "../lib/image-export";
import {
  applyAnimation,
  loopProgress,
  canAnimate,
  type AnimationSettings,
} from "../lib/anim";
import {
  exportCanvasVideo,
  exportCanvasGif,
  videoExportSupported,
  downloadBlob,
  type VideoFormat,
} from "../lib/video-export";

interface TreatmentStageProps {
  treatment: Treatment;
  params: EffectParams;
  source: HTMLImageElement | null;
  anim: AnimationSettings;
  replayToken: number;
  previousLabel: string;
  nextLabel: string;
  backgroundMode: StageBackgroundMode;
  canvasTone: StageCanvasTone;
  zoom: number;
  onBackgroundModeChange: (mode: StageBackgroundMode) => void;
  onCanvasToneChange: (tone: StageCanvasTone) => void;
  onZoomChange: (zoom: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onReplay: () => void;
  onDropFile: (file: File) => void;
}

type ExportFormat = "png" | VideoFormat;

const VIDEO_FPS = 30;
const GIF_FPS = 20;

function sizeFor(t: Treatment, source: HTMLImageElement | null): { w: number; h: number } {
  if (t.needsSource) {
    if (!source) return { w: 1280, h: 800 };
    const max = t.maxDim ?? 1280;
    const scale = Math.min(1, max / Math.max(source.width, source.height));
    return { w: Math.max(1, Math.round(source.width * scale)), h: Math.max(1, Math.round(source.height * scale)) };
  }
  const max = t.maxDim ?? 1280;
  const aspect = t.aspect ?? 1.6;
  return { w: max, h: Math.round(max / aspect) };
}

export function TreatmentStage({
  treatment,
  params,
  source,
  anim,
  replayToken,
  previousLabel,
  nextLabel,
  backgroundMode,
  canvasTone,
  zoom,
  onBackgroundModeChange,
  onCanvasToneChange,
  onZoomChange,
  onPrevious,
  onNext,
  onReplay,
  onDropFile,
}: TreatmentStageProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [exported, setExported] = React.useState(false);
  const [dragOver, setDragOver] = React.useState(false);
  const [format, setFormat] = React.useState<ExportFormat>("png");
  const [busy, setBusy] = React.useState<null | { kind: ExportFormat; progress: number }>(null);

  const missingSource = treatment.needsSource && !source;
  const motion = canAnimate(treatment, anim);
  const videoOk = React.useMemo(() => videoExportSupported(), []);

  // Draw a single frame of the treatment at `elapsed` seconds.
  const renderFrame = React.useCallback(
    (elapsed: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const { width: w, height: h } = canvas;
      if (treatment.needsSource && !source) {
        ctx.clearRect(0, 0, w, h);
        return;
      }
      const loopT = anim.enabled ? loopProgress(elapsed, anim) : 0;
      const frameParams = applyAnimation(treatment, params, anim, loopT);
      ctx.save();
      treatment.draw({ ctx, width: w, height: h, source, params: frameParams, time: elapsed });
      ctx.restore();
    },
    [treatment, params, source, anim],
  );

  // Size the canvas and run the live preview loop (paused while exporting).
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { w, h } = sizeFor(treatment, source);
    canvas.width = w;
    canvas.height = h;
    if (busy) return; // export drives frames itself
    const loop = treatment.animated || anim.enabled;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      renderFrame((now - start) / 1000);
      if (loop) raf = requestAnimationFrame(tick);
    };
    if (loop) raf = requestAnimationFrame(tick);
    else renderFrame(0);
    return () => cancelAnimationFrame(raf);
  }, [treatment, source, anim, replayToken, renderFrame, busy]);

  const handleExportPng = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ok = await downloadCanvasPng(canvas, `${treatment.id}.png`);
    if (ok) {
      setExported(true);
      setTimeout(() => setExported(false), 1500);
    }
  };

  const handleExport = async () => {
    if (format === "png") return handleExportPng();
    const canvas = canvasRef.current;
    if (!canvas) return;
    setBusy({ kind: format, progress: 0 });
    const duration = Math.max(0.5, anim.duration);
    try {
      if (format === "mp4") {
        const { blob, ext } = await exportCanvasVideo(canvas, {
          duration,
          fps: VIDEO_FPS,
          render: renderFrame,
          onProgress: (p) => setBusy({ kind: "mp4", progress: p }),
        });
        downloadBlob(blob, `${treatment.id}.${ext}`);
      } else {
        const blob = await exportCanvasGif(canvas, {
          duration,
          fps: GIF_FPS,
          render: renderFrame,
          onProgress: (p) => setBusy({ kind: "gif", progress: p }),
        });
        downloadBlob(blob, `${treatment.id}.gif`);
      }
      setExported(true);
      setTimeout(() => setExported(false), 1500);
    } catch {
      /* recording unsupported / interrupted — leave UI untouched */
    } finally {
      setBusy(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) onDropFile(file);
  };

  const exportLabel = () => {
    if (busy) {
      const pct = Math.round(busy.progress * 100);
      return busy.kind === "mp4" ? `Recording ${pct}%` : `Encoding ${pct}%`;
    }
    if (exported) return "Exported";
    if (format === "png") return "Export PNG";
    return format === "mp4" ? "Export MP4" : "Export GIF";
  };

  return (
    <div className="h-full flex flex-col">
      <div
        className="motion-stage relative flex-1 flex items-center justify-center overflow-x-hidden overflow-y-auto p-10"
        data-bg-mode={backgroundMode}
        data-canvas-tone={canvasTone}
        onDragOver={(e) => {
          if (treatment.needsSource) {
            e.preventDefault();
            setDragOver(true);
          }
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={treatment.needsSource ? handleDrop : undefined}
      >
        <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex items-center justify-center">
          <div className="pointer-events-auto flex max-w-[min(70%,28rem)] items-center gap-1 rounded-full border border-separator bg-background/85 p-1 shadow-sm backdrop-blur">
            <Button
              variant="default"
              size="small"
              iconOnly
              className="rounded-full"
              aria-label={`Previous effect: ${previousLabel}`}
              title={previousLabel}
              onClick={onPrevious}
            >
              <ChevronLeft size={15} />
            </Button>
            <span className="min-w-0 truncate px-2 text-center text-sm font-medium">{treatment.name}</span>
            <Button
              variant="default"
              size="small"
              iconOnly
              className="rounded-full"
              aria-label={`Next effect: ${nextLabel}`}
              title={nextLabel}
              onClick={onNext}
            >
              <ChevronRight size={15} />
            </Button>
          </div>
        </div>
        {missingSource ? (
          <div className="transition-transform" style={{ transform: `scale(${zoom})` }}>
            <EmptyState>
              <EmptyStateTitle>No image yet</EmptyStateTitle>
              <EmptyStateDescription>
                Pick a sample or drop an image to start treating it.
              </EmptyStateDescription>
            </EmptyState>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-full object-contain rounded-card shadow-lg transition-transform"
            style={{ transform: `scale(${zoom})` }}
          />
        )}

        {dragOver && treatment.needsSource && (
          <div className="pointer-events-none absolute inset-4 rounded-panel border-2 border-dashed border-accent bg-accent/10 flex items-center justify-center">
            <span className="text-strong text-accent inline-flex items-center gap-2">
              <ImageUp size={18} />
              Drop image to treat
            </span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-5 flex items-center justify-center gap-2">
          <div className="pointer-events-auto flex items-center gap-2">
            {(treatment.animated || anim.enabled) && (
              <Button variant="glass" size="small" onClick={onReplay} disabled={!!busy}>
                <RotateCcw size={15} />
                Replay
              </Button>
            )}
            {motion && (
              <SegmentedControl
                type="single"
                size="small"
                value={format}
                onValueChange={(v) => v && setFormat(v as ExportFormat)}
              >
                <SegmentedControlItem value="png">PNG</SegmentedControlItem>
                <SegmentedControlItem value="mp4" disabled={!videoOk}>
                  MP4
                </SegmentedControlItem>
                <SegmentedControlItem value="gif">GIF</SegmentedControlItem>
              </SegmentedControl>
            )}
            <Button variant="accent" size="small" onClick={handleExport} disabled={missingSource || !!busy}>
              {busy ? (
                <Loader2 size={15} className="animate-spin" />
              ) : exported ? (
                <Check size={15} />
              ) : (
                <Download size={15} />
              )}
              {exportLabel()}
            </Button>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-5 right-3 z-20">
          <StageCanvasControls
            backgroundMode={backgroundMode}
            canvasTone={canvasTone}
            zoom={zoom}
            onBackgroundModeChange={onBackgroundModeChange}
            onCanvasToneChange={onCanvasToneChange}
            onZoomChange={onZoomChange}
          />
        </div>
      </div>
    </div>
  );
}

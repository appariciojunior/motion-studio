import { Button } from "@glaze/core/components";
import { ChevronLeft, ChevronRight, RefreshCcw, RotateCcw, Share } from "lucide-react";
import type { Effect, EffectParams } from "./effects/types";
import { StageCanvasControls, type StageBackgroundMode, type StageCanvasTone } from "./stage-canvas-controls";

interface PreviewStageProps {
  effect: Effect;
  params: EffectParams;
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
  canReset: boolean;
  onReset: () => void;
  onReplay: () => void;
  onExport: () => void;
}

// Slider ids that feed a transition (duration/speed/stagger/etc). Motion does
// NOT restart a running `repeat: Infinity` animation when only the transition
// changes — so timing sliders wouldn't take effect live. Folding these into the
// preview's React key remounts it on change, restarting the loop at the new
// rate. Non-timing knobs (size, color, distance) stay out of the key so they
// keep updating in place without a jarring restart.
const TIMING_IDS = new Set(["duration", "speed", "stagger", "hold", "delay"]);

function timingSignature(effect: Effect, params: EffectParams): string {
  return effect.controls
    .filter((c) => TIMING_IDS.has(c.id))
    .map((c) => `${c.id}=${params[c.id]}`)
    .join("&");
}

export function PreviewStage({
  effect,
  params,
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
  canReset,
  onReset,
  onReplay,
  onExport,
}: PreviewStageProps) {
  const Preview = effect.Preview;
  return (
    <div className="h-full flex flex-col">
      <div
        className="titlebar-drag motion-stage relative flex-1 flex items-center justify-center overflow-x-hidden overflow-y-auto p-10"
        data-bg-mode={backgroundMode}
        data-canvas-tone={canvasTone}
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
            <span className="min-w-0 truncate px-2 text-center text-sm font-medium">{effect.name}</span>
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
        {/* Give the preview a definite, centered width so panel-style effects
            using `w-full max-w-*` (overlays, dialogs, transitions) expand to
            their intended size instead of collapsing to ~0 in a shrink-to-fit
            wrapper. Intrinsic-size effects stay centered at their natural size. */}
        <div
          className="relative flex w-full max-w-2xl items-center justify-center transition-transform"
          style={{ transform: `scale(${zoom})` }}
        >
          <Preview
            key={`${replayToken}:${timingSignature(effect, params)}`}
            params={params}
            replayToken={replayToken}
          />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-5 flex items-center justify-center gap-2">
          <div className="pointer-events-auto flex items-center gap-2">
            {canReset && (
              <Button variant="glass" size="small" onClick={onReset}>
                <RefreshCcw size={15} />
                Reset
              </Button>
            )}
            <Button variant="glass" size="small" onClick={onReplay}>
              <RotateCcw size={15} />
              Replay
            </Button>
            <Button variant="accent" size="small" onClick={onExport}>
              <Share size={15} />
              Export
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

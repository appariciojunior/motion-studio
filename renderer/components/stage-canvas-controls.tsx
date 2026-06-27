import { Button } from "@glaze/core/components";
import { CircleDot, Grid2X2, Laptop, Minus, Moon, Plus, Square, Sun } from "lucide-react";

export type StageBackgroundMode = "dots" | "grid" | "solid";
export type StageCanvasTone = "system" | "light" | "dark";

interface StageCanvasControlsProps {
  backgroundMode: StageBackgroundMode;
  canvasTone: StageCanvasTone;
  zoom: number;
  onBackgroundModeChange: (mode: StageBackgroundMode) => void;
  onCanvasToneChange: (tone: StageCanvasTone) => void;
  onZoomChange: (zoom: number) => void;
}

const BACKGROUND_MODES: StageBackgroundMode[] = ["dots", "grid", "solid"];
const CANVAS_TONES: StageCanvasTone[] = ["system", "dark", "light"];

export function StageCanvasControls({
  backgroundMode,
  canvasTone,
  zoom,
  onBackgroundModeChange,
  onCanvasToneChange,
  onZoomChange,
}: StageCanvasControlsProps) {
  const nextMode = BACKGROUND_MODES[(BACKGROUND_MODES.indexOf(backgroundMode) + 1) % BACKGROUND_MODES.length];
  const nextTone = CANVAS_TONES[(CANVAS_TONES.indexOf(canvasTone) + 1) % CANVAS_TONES.length];
  const zoomOut = () => onZoomChange(Math.max(0.5, Number((zoom - 0.1).toFixed(2))));
  const zoomIn = () => onZoomChange(Math.min(2, Number((zoom + 0.1).toFixed(2))));
  const PatternIcon = backgroundMode === "dots" ? CircleDot : backgroundMode === "grid" ? Grid2X2 : Square;
  const ToneIcon = canvasTone === "system" ? Laptop : canvasTone === "dark" ? Moon : Sun;

  return (
    <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-separator bg-background/85 p-1 shadow-sm backdrop-blur">
      <Button
        variant="default"
        size="small"
        iconOnly
        className="rounded-full"
        aria-label={`Switch canvas background to ${nextMode}`}
        title={`Canvas background: ${backgroundMode}`}
        onClick={() => onBackgroundModeChange(nextMode)}
      >
        <PatternIcon size={15} />
      </Button>
      <Button
        variant="default"
        size="small"
        iconOnly
        className="rounded-full"
        aria-label={`Switch canvas tone to ${nextTone}`}
        title={`Canvas tone: ${canvasTone}`}
        onClick={() => onCanvasToneChange(nextTone)}
      >
        <ToneIcon size={15} />
      </Button>
      <div className="mx-1 h-4 w-px bg-black/12 dark:bg-white/12" />
      <Button
        variant="default"
        size="small"
        iconOnly
        className="rounded-full"
        aria-label="Zoom out"
        onClick={zoomOut}
      >
        <Minus size={15} />
      </Button>
      <button
        type="button"
        className="h-6 min-w-12 rounded-full px-2 text-small font-medium text-secondary tabular-nums hover:text-foreground"
        aria-label="Reset canvas zoom"
        title="Reset zoom"
        onClick={() => onZoomChange(1)}
      >
        {Math.round(zoom * 100)}%
      </button>
      <Button
        variant="default"
        size="small"
        iconOnly
        className="rounded-full"
        aria-label="Zoom in"
        onClick={zoomIn}
      >
        <Plus size={15} />
      </Button>
    </div>
  );
}

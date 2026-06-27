import { Button } from "@glaze/core/components";
import { CircleDot, Grid2X2, Minus, Plus, Square } from "lucide-react";

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

const CANVAS_PRESETS: Array<{ mode: StageBackgroundMode; tone: StageCanvasTone }> = [
  { mode: "dots", tone: "system" },
  { mode: "grid", tone: "system" },
  { mode: "solid", tone: "system" },
  { mode: "dots", tone: "dark" },
  { mode: "grid", tone: "dark" },
  { mode: "solid", tone: "dark" },
  { mode: "dots", tone: "light" },
  { mode: "grid", tone: "light" },
  { mode: "solid", tone: "light" },
];

export function StageCanvasControls({
  backgroundMode,
  canvasTone,
  zoom,
  onBackgroundModeChange,
  onCanvasToneChange,
  onZoomChange,
}: StageCanvasControlsProps) {
  const currentPresetIndex = CANVAS_PRESETS.findIndex(
    (preset) => preset.mode === backgroundMode && preset.tone === canvasTone,
  );
  const nextPreset = CANVAS_PRESETS[(Math.max(0, currentPresetIndex) + 1) % CANVAS_PRESETS.length];
  const zoomOut = () => onZoomChange(Math.max(0.5, Number((zoom - 0.1).toFixed(2))));
  const zoomIn = () => onZoomChange(Math.min(2, Number((zoom + 0.1).toFixed(2))));
  const PatternIcon = backgroundMode === "dots" ? CircleDot : backgroundMode === "grid" ? Grid2X2 : Square;
  const switchCanvasPreset = () => {
    onBackgroundModeChange(nextPreset.mode);
    onCanvasToneChange(nextPreset.tone);
  };

  return (
    <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-separator bg-background/85 p-1 shadow-sm backdrop-blur">
      <Button
        variant="default"
        size="small"
        iconOnly
        className="rounded-full"
        aria-label={`Switch canvas background to ${nextPreset.mode}`}
        title={`Canvas: ${backgroundMode}, ${canvasTone}`}
        onClick={switchCanvasPreset}
      >
        <PatternIcon size={15} />
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

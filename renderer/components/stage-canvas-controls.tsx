import { Button } from "@glaze/core/components";
import { Circle, Grid2X2, Minus, Plus } from "lucide-react";

export type StageBackgroundMode = "dots" | "grid" | "solid";

interface StageCanvasControlsProps {
  backgroundMode: StageBackgroundMode;
  zoom: number;
  onBackgroundModeChange: (mode: StageBackgroundMode) => void;
  onZoomChange: (zoom: number) => void;
}

const BACKGROUND_MODES: StageBackgroundMode[] = ["dots", "grid", "solid"];

export function StageCanvasControls({
  backgroundMode,
  zoom,
  onBackgroundModeChange,
  onZoomChange,
}: StageCanvasControlsProps) {
  const nextMode = BACKGROUND_MODES[(BACKGROUND_MODES.indexOf(backgroundMode) + 1) % BACKGROUND_MODES.length];
  const zoomOut = () => onZoomChange(Math.max(0.5, Number((zoom - 0.1).toFixed(2))));
  const zoomIn = () => onZoomChange(Math.min(2, Number((zoom + 0.1).toFixed(2))));

  return (
    <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-separator bg-background/85 p-1 shadow-sm backdrop-blur">
      <Button
        variant="default"
        size="small"
        iconOnly
        className="rounded-full"
        aria-label={`Switch canvas background to ${nextMode}`}
        title={`Background: ${backgroundMode}`}
        onClick={() => onBackgroundModeChange(nextMode)}
      >
        {backgroundMode === "grid" ? <Grid2X2 size={15} /> : <Circle size={15} />}
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

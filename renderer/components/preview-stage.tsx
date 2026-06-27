import { Toolbar, ToolbarRow, ToolbarTitle, ToolbarActions, Button } from "@glaze/core/components";
import { RotateCcw, Share } from "lucide-react";
import type { Effect, EffectParams } from "./effects/types";
import { AppearanceToggle } from "./appearance-toggle";

interface PreviewStageProps {
  effect: Effect;
  params: EffectParams;
  replayToken: number;
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

export function PreviewStage({ effect, params, replayToken, onReplay, onExport }: PreviewStageProps) {
  const Preview = effect.Preview;
  return (
    <div className="h-full flex flex-col">
      <Toolbar position="top">
        <ToolbarRow>
          <ToolbarTitle>{effect.name}</ToolbarTitle>
        </ToolbarRow>
        <ToolbarActions>
          <AppearanceToggle />
        </ToolbarActions>
      </Toolbar>
      <div className="motion-stage relative flex-1 flex items-center justify-center overflow-auto p-10">
        {/* Give the preview a definite, centered width so panel-style effects
            using `w-full max-w-*` (overlays, dialogs, transitions) expand to
            their intended size instead of collapsing to ~0 in a shrink-to-fit
            wrapper. Intrinsic-size effects stay centered at their natural size. */}
        <div className="relative flex w-full max-w-2xl items-center justify-center">
          <Preview
            key={`${replayToken}:${timingSignature(effect, params)}`}
            params={params}
            replayToken={replayToken}
          />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-5 flex items-center justify-center gap-2">
          <div className="pointer-events-auto flex items-center gap-2">
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
      </div>
    </div>
  );
}

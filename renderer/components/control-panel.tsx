import { Button, Separator } from "@glaze/core/components";
import { RotateCcw } from "lucide-react";
import { ControlRow } from "./control-row";
import type { Effect, EffectParams, ParamValue } from "./effects/types";

interface ControlPanelProps {
  effect: Effect;
  params: EffectParams;
  onChange: (id: string, value: ParamValue) => void;
  onReset: () => void;
}

export function ControlPanel({ effect, params, onChange, onReset }: ControlPanelProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 pt-13 pb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-strong">{effect.name}</h2>
          <p className="text-small text-secondary mt-0.5">{effect.description}</p>
        </div>
        <Button
          variant="transparent"
          size="small"
          iconOnly
          className="shrink-0 text-secondary"
          title="Reset to defaults"
          aria-label="Reset to defaults"
          onClick={onReset}
        >
          <RotateCcw size={15} />
        </Button>
      </div>
      <Separator />
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {effect.controls.map((control) => (
          <ControlRow key={control.id} control={control} params={params} onChange={onChange} />
        ))}
      </div>
    </div>
  );
}

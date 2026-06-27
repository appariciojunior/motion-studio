import { Separator } from "@glaze/core/components";
import * as React from "react";
import { ColorPresetGrid, ControlRow } from "./control-row";
import type { Effect, EffectParams, ParamValue } from "./effects/types";

interface ControlPanelProps {
  effect: Effect;
  params: EffectParams;
  onChange: (id: string, value: ParamValue) => void;
}

export function ControlPanel({ effect, params, onChange }: ControlPanelProps) {
  let colorPresetsShown = false;

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-strong">{effect.name}</h2>
          <p className="text-small text-secondary mt-0.5">{effect.description}</p>
        </div>
      </div>
      <Separator />
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-4 flex flex-col gap-4">
        {effect.controls.map((control) => {
          const showColorPresets =
            !colorPresetsShown &&
            control.type === "color" &&
            (!control.visibleWhen || control.visibleWhen(params));
          if (showColorPresets) colorPresetsShown = true;
          return (
            <React.Fragment key={control.id}>
              {showColorPresets && (
                <ColorPresetGrid controls={effect.controls} params={params} onChange={onChange} />
              )}
              <ControlRow control={control} params={params} onChange={onChange} />
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

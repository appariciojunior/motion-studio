import * as React from "react";
import {
  Button,
  Separator,
  Switch,
  SegmentedControl,
  SegmentedControlItem,
} from "@glaze/core/components";
import { ImageUp, Check } from "lucide-react";
import { cn } from "@glaze/core/utils";
import { ColorPresetGrid, ControlRow, LabeledSlider } from "./control-row";
import { CurveEditor } from "./curve-editor";
import type { Treatment } from "./treatments/types";
import type { EffectParams, ParamValue } from "./effects/types";
import type { AnimationSettings } from "../lib/anim";
import { SAMPLE_IMAGES, type SampleImage } from "../lib/source-image";

interface TreatmentPanelProps {
  treatment: Treatment;
  params: EffectParams;
  onChange: (id: string, value: ParamValue) => void;
  sourceId: string;
  onPickSample: (sample: SampleImage) => void;
  onPickFile: (file: File) => void;
  anim: AnimationSettings;
  onAnimChange: (patch: Partial<AnimationSettings>) => void;
}

function AnimationControls({
  treatment,
  anim,
  onAnimChange,
}: {
  treatment: Treatment;
  anim: AnimationSettings;
  onAnimChange: (patch: Partial<AnimationSettings>) => void;
}) {
  const hasDrift = Boolean(treatment.animate?.drift);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-small text-secondary">Animate</span>
        <Switch
          checked={anim.enabled}
          onCheckedChange={(checked) => onAnimChange({ enabled: checked })}
        />
      </div>
      {anim.enabled && (
        <>
          <div className="flex flex-col gap-1.5">
            <span className="text-small text-secondary">Motion</span>
            <SegmentedControl
              type="single"
              size="small"
              value={anim.mode}
              onValueChange={(v) => v && onAnimChange({ mode: v as AnimationSettings["mode"] })}
            >
              <SegmentedControlItem value="ease">Ease in/out</SegmentedControlItem>
              <SegmentedControlItem value="drift">Drift</SegmentedControlItem>
            </SegmentedControl>
            {anim.mode === "drift" && !hasDrift && (
              <span className="text-small text-secondary/70">
                This effect oscillates continuously in Drift.
              </span>
            )}
          </div>
          <LabeledSlider
            label="Duration"
            value={anim.duration}
            unit="s"
            min={0.5}
            max={6}
            step={0.5}
            onValueChange={(duration) => onAnimChange({ duration })}
          />
          <div className="flex items-center justify-between">
            <span className="text-small text-secondary">Loop</span>
            <Switch
              checked={anim.loop}
              onCheckedChange={(checked) => onAnimChange({ loop: checked })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-small text-secondary">Easing</span>
            <CurveEditor value={anim.easing} onChange={(v) => onAnimChange({ easing: v })} animate />
          </div>
        </>
      )}
    </div>
  );
}

function SourcePicker({
  sourceId,
  onPickSample,
  onPickFile,
}: {
  sourceId: string;
  onPickSample: (sample: SampleImage) => void;
  onPickFile: (file: File) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-small text-secondary">Source image</span>
      <div className="grid grid-cols-4 gap-2">
        {SAMPLE_IMAGES.map((sample) => {
          const active = sourceId === sample.id;
          return (
            <button
              key={sample.id}
              type="button"
              title={sample.name}
              onClick={() => onPickSample(sample)}
              className={cn(
                "relative aspect-[4/3] rounded-md overflow-hidden border transition-shadow",
                active ? "border-accent ring-2 ring-accent/40" : "border-separator",
              )}
              style={{ background: sample.swatch }}
            >
              {active && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Check size={14} className="text-white drop-shadow" />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <Button
        variant="filled"
        size="small"
        className={cn(sourceId === "custom" && "ring-2 ring-accent/40")}
        onClick={() => inputRef.current?.click()}
      >
        <ImageUp size={15} />
        {sourceId === "custom" ? "Custom image" : "Upload image"}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPickFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export function TreatmentPanel({
  treatment,
  params,
  onChange,
  sourceId,
  onPickSample,
  onPickFile,
  anim,
  onAnimChange,
}: TreatmentPanelProps) {
  const supportsMotion = Boolean(treatment.animate || treatment.animated);
  let colorPresetsShown = false;
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-strong">{treatment.name}</h2>
          <p className="text-small text-secondary mt-0.5">{treatment.description}</p>
        </div>
      </div>
      <Separator />
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-4 flex flex-col gap-4">
        {treatment.needsSource && (
          <>
            <SourcePicker sourceId={sourceId} onPickSample={onPickSample} onPickFile={onPickFile} />
            <Separator />
          </>
        )}
        {treatment.controls.map((control) => {
          const showColorPresets =
            !colorPresetsShown &&
            control.type === "color" &&
            (!control.visibleWhen || control.visibleWhen(params));
          if (showColorPresets) colorPresetsShown = true;
          return (
            <React.Fragment key={control.id}>
              {showColorPresets && (
                <ColorPresetGrid controls={treatment.controls} params={params} onChange={onChange} />
              )}
              <ControlRow control={control} params={params} onChange={onChange} />
            </React.Fragment>
          );
        })}
        {supportsMotion && (
          <>
            <Separator />
            <AnimationControls treatment={treatment} anim={anim} onAnimChange={onAnimChange} />
          </>
        )}
      </div>
    </div>
  );
}

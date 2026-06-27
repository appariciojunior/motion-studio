import * as React from "react";
import {
  Slider,
  Switch,
  SegmentedControl,
  SegmentedControlItem,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@glaze/core/components";
import { CurveEditor } from "./curve-editor";
import type { ControlDef, EffectParams, ParamValue } from "./effects/types";

function decimalsFor(step: number) {
  const [, decimals = ""] = String(step).split(".");
  return decimals.length;
}

function snapToStep(value: number, min: number, max: number, step: number) {
  const clamped = Math.min(max, Math.max(min, value));
  const snapped = Math.round((clamped - min) / step) * step + min;
  return Number(snapped.toFixed(decimalsFor(step)));
}

export function LabeledSlider({
  label,
  value,
  unit = "",
  min,
  max,
  step,
  onValueChange,
}: {
  label: string;
  value: number;
  unit?: string;
  min: number;
  max: number;
  step: number;
  onValueChange: (value: number) => void;
}) {
  const [draft, setDraft] = React.useState(String(value));

  React.useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commitDraft = () => {
    const parsed = Number(draft);
    if (!Number.isFinite(parsed)) {
      setDraft(String(value));
      return;
    }
    const nextValue = snapToStep(parsed, min, max, step);
    setDraft(String(nextValue));
    onValueChange(nextValue);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative min-w-0 flex-1">
        <Slider
          aria-label={label}
          className="inspector-slider"
          min={min}
          max={max}
          step={step}
          value={[value]}
          onValueChange={([nextValue]) => onValueChange(nextValue)}
        />
        <span className="pointer-events-none absolute inset-y-0 left-3 z-10 flex items-center text-small font-medium text-secondary">
          {label}
        </span>
      </div>
      <label className="flex h-9 min-w-16 shrink-0 items-center justify-end gap-0.5 rounded-md border border-separator bg-black/5 px-2 text-small text-secondary tabular-nums focus-within:ring-2 focus-within:ring-blue-500 dark:bg-white/5">
        <input
          type="number"
          value={draft}
          min={min}
          max={max}
          step={step}
          aria-label={`${label} value`}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commitDraft}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
            if (event.key === "Escape") {
              setDraft(String(value));
              event.currentTarget.blur();
            }
          }}
          className="w-10 bg-transparent text-right text-inherit outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        {unit && <span className="shrink-0">{unit}</span>}
      </label>
    </div>
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="relative inline-flex items-center gap-2 cursor-pointer">
      <span
        className="size-6 rounded-control border border-separator shadow-sm"
        style={{ background: value }}
      />
      <span className="text-small text-secondary tabular-nums uppercase">{value}</span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 size-full cursor-pointer opacity-0"
      />
    </label>
  );
}

/** Renders a single control from the shared `ControlDef` schema. Used by both
 * the motion-effect control panel and the image-treatment panel. */
export function ControlRow({
  control,
  params,
  onChange,
}: {
  control: ControlDef;
  params: EffectParams;
  onChange: (id: string, value: ParamValue) => void;
}) {
  if (control.visibleWhen && !control.visibleWhen(params)) return null;

  switch (control.type) {
    case "slider": {
      const value = Number(params[control.id]);
      return (
        <LabeledSlider
          label={control.label}
          value={value}
          unit={control.unit}
          min={control.min}
          max={control.max}
          step={control.step}
          onValueChange={(nextValue) => onChange(control.id, nextValue)}
        />
      );
    }
    case "switch":
      return (
        <div className="flex h-9 items-center justify-between rounded-md border border-separator bg-black/5 px-3 dark:bg-white/5">
          <span className="text-small font-medium text-secondary">{control.label}</span>
          <Switch
            checked={params[control.id] === true}
            onCheckedChange={(checked) => onChange(control.id, checked)}
          />
        </div>
      );
    case "color":
      return (
        <div className="flex items-center justify-between">
          <span className="text-small text-secondary">{control.label}</span>
          <ColorInput
            value={String(params[control.id])}
            onChange={(v) => onChange(control.id, v)}
          />
        </div>
      );
    case "select":
      return (
        <div className="flex flex-col gap-1.5">
          <span className="text-small text-secondary">{control.label}</span>
          <Select value={String(params[control.id])} onValueChange={(v) => onChange(control.id, v)}>
            <SelectTrigger size="small">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {control.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    case "bezier":
      return (
        <div className="flex flex-col gap-1.5">
          <span className="text-small text-secondary">{control.label}</span>
          <CurveEditor
            value={String(params[control.id])}
            onChange={(v) => onChange(control.id, v)}
          />
        </div>
      );
    case "segmented":
      return (
        <div className="flex flex-col gap-1.5">
          <span className="text-small text-secondary">{control.label}</span>
          <SegmentedControl
            type="single"
            size="small"
            value={String(params[control.id])}
            onValueChange={(v) => v && onChange(control.id, v as string)}
          >
            {control.options.map((opt) => (
              <SegmentedControlItem key={opt.value} value={opt.value}>
                {opt.label}
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
        </div>
      );
    default:
      return null;
  }
}

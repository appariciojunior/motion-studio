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
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-small text-secondary">{control.label}</span>
            <span className="text-small text-secondary tabular-nums">
              {value}
              {control.unit ?? ""}
            </span>
          </div>
          <Slider
            variant="filled"
            size="small"
            min={control.min}
            max={control.max}
            step={control.step}
            value={[value]}
            onValueChange={([v]) => onChange(control.id, v)}
          />
        </div>
      );
    }
    case "switch":
      return (
        <div className="flex items-center justify-between">
          <span className="text-small text-secondary">{control.label}</span>
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

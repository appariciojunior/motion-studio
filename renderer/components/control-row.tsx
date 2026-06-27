import * as React from "react";
import {
  Button,
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
import { Shuffle } from "lucide-react";
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

const COLOR_PALETTES = [
  ["#ef4444", "#f97316", "#facc15", "#38bdf8", "#f8fafc"],
  ["#22d3ee", "#ec4899", "#f97316", "#7c3aed", "#111827"],
  ["#2563eb", "#8b5cf6", "#d946ef", "#fb7185", "#f8fafc"],
  ["#84cc16", "#22c55e", "#0f766e", "#ecfccb", "#111827"],
  ["#0f4c81", "#2f8ac4", "#bae6fd", "#e0f2fe", "#0f172a"],
  ["#ff3b30", "#ff8a5b", "#ffd166", "#4c1d95", "#ffffff"],
  ["#ffffff", "#a1a1aa", "#3f3f46", "#18181b", "#09090b"],
  ["#fb923c", "#e5e7eb", "#111827", "#fdba74", "#fff7ed"],
];

const HARMONY_OFFSETS = [
  [0, 24, -24, 48, -48],
  [0, 180, 30, 210, 150],
  [0, 150, 210, 30, 330],
  [0, 120, 240, 60, 300],
  [0, 90, 180, 270, 45],
];

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function wrapHue(hue: number) {
  return ((hue % 360) + 360) % 360;
}

function hslToHex(hue: number, saturation: number, lightness: number) {
  const s = saturation / 100;
  const l = lightness / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    hue < 60 ? [c, x, 0] :
    hue < 120 ? [x, c, 0] :
    hue < 180 ? [0, c, x] :
    hue < 240 ? [0, x, c] :
    hue < 300 ? [x, 0, c] :
    [c, 0, x];
  return [r, g, b]
    .map((channel) => Math.round((channel + m) * 255).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()
    .padStart(6, "0")
    .replace(/^/, "#");
}

function randomHarmonyPalette(count: number) {
  const baseHue = Math.floor(Math.random() * 360);
  const offsets = HARMONY_OFFSETS[Math.floor(Math.random() * HARMONY_OFFSETS.length)];
  const saturation = randomBetween(64, 88);
  const lightness = randomBetween(48, 66);

  return Array.from({ length: count }, (_, index) => {
    const hue = wrapHue(baseHue + offsets[index % offsets.length] + randomBetween(-5, 5));
    const sat = Math.min(92, Math.max(54, saturation + randomBetween(-8, 8)));
    const light = Math.min(74, Math.max(38, lightness + randomBetween(-8, 8)));
    return hslToHex(hue, sat, light);
  });
}

export function ColorPresetGrid({
  controls,
  params,
  onChange,
}: {
  controls: ControlDef[];
  params: EffectParams;
  onChange: (id: string, value: ParamValue) => void;
}) {
  const colorControls = controls.filter(
    (control) => control.type === "color" && (!control.visibleWhen || control.visibleWhen(params)),
  );

  if (colorControls.length === 0) return null;

  const currentColors = colorControls.map((control) => String(params[control.id]).toLowerCase());
  const colorCount = colorControls.length;
  const previewPalettes = COLOR_PALETTES.map((palette) => palette.slice(0, colorCount));
  const colorsChanged = colorControls.some(
    (control) => control.type === "color" && String(params[control.id]).toLowerCase() !== control.default.toLowerCase(),
  );
  const applyPalette = (palette: string[]) => {
    colorControls.forEach((control, index) => {
      onChange(control.id, palette[index % palette.length]);
    });
  };
  const resetColors = () => {
    colorControls.forEach((control) => {
      if (control.type === "color") onChange(control.id, control.default);
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-small text-secondary">Presets</span>
        <div className="flex items-center gap-1">
          {colorsChanged && (
            <button
              type="button"
              className="h-6 px-1 text-small font-medium text-secondary hover:text-foreground"
              onClick={resetColors}
            >
              Reset
            </button>
          )}
          <Button
            variant="default"
            size="small"
            iconOnly
            aria-label="Randomize colors"
            title="Randomize colors"
            onClick={() => applyPalette(randomHarmonyPalette(colorCount))}
          >
            <Shuffle size={14} />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {previewPalettes.map((palette) => {
          const selected = currentColors.every(
            (color, index) => color === palette[index % palette.length].toLowerCase(),
          );
          return (
            <button
              key={palette.join("-")}
              type="button"
              className={`flex h-7 overflow-hidden rounded-md border transition ${
                selected ? "border-blue-500 ring-2 ring-blue-500/40" : "border-separator"
              }`}
              aria-label="Apply color preset"
              onClick={() => applyPalette(palette)}
            >
              {palette.map((color) => (
                <span key={color} className="flex-1" style={{ background: color }} />
              ))}
            </button>
          );
        })}
      </div>
    </div>
  );
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
      if (control.options.length <= 4) {
        const value = String(params[control.id]);
        const gridClass =
          control.options.length === 4
            ? "grid-cols-2"
            : control.options.length === 3
              ? "grid-cols-3"
              : "grid-cols-2";
        return (
          <div className="flex flex-col gap-1.5">
            <span className="text-small text-secondary">{control.label}</span>
            <div className={`grid gap-2 ${gridClass}`}>
              {control.options.map((opt) => {
                const selected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    aria-pressed={selected}
                    className={`h-9 rounded-md border px-3 text-small font-medium transition-colors ${
                      selected
                        ? "border-blue-500 bg-blue-500/14 text-blue-700 dark:text-blue-300"
                        : "border-separator bg-black/5 text-secondary hover:bg-black/8 dark:bg-white/5 dark:hover:bg-white/8"
                    }`}
                    onClick={() => onChange(control.id, opt.value)}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }
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

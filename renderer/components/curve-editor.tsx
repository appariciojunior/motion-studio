import * as React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@glaze/core/components";
import { parseBezier, makeBezierEasing, type BezierPoints } from "./effects/types";

// Named easing presets, mirroring the Curves app library.
const CURVE_PRESETS: { value: string; label: string }[] = [
  { value: "0,0,1,1", label: "Linear" },
  { value: "0.25,0.1,0.25,1", label: "Ease" },
  { value: "0.42,0,1,1", label: "Ease in" },
  { value: "0,0,0.58,1", label: "Ease out" },
  { value: "0.16,1,0.3,1", label: "Ease out (strong)" },
  { value: "0.42,0,0.58,1", label: "Ease in-out" },
  { value: "0.32,0.72,0,1", label: "iOS / Sheet" },
  { value: "0,0.55,0.45,1", label: "Circ out" },
  { value: "0.25,1,0.5,1", label: "Snappy" },
  { value: "0.55,0,0.1,1", label: "Swift out" },
  { value: "0.45,0,0.55,1", label: "Smooth" },
  { value: "0.34,1.56,0.64,1", label: "Spring" },
  { value: "0.68,-0.55,0.27,1.55", label: "Overshoot" },
  { value: "0.34,1.3,0.64,1", label: "Bounce out" },
  { value: "0.4,0,0.6,1", label: "Sharp" },
  { value: "0,0,0.2,1", label: "Decelerate" },
  { value: "0.4,0,1,1", label: "Accelerate" },
];

// Abstract SVG coordinate space. The [0,1] band sits in the middle so the
// handles have headroom to overshoot (springy/bouncy curves go past 0–1).
const W = 260;
const H = 200;
const PAD_X = 24;
const PLOT_LEFT = PAD_X;
const PLOT_RIGHT = W - PAD_X;
const PLOT_TOP = H * 0.3; // y = 1
const PLOT_BOTTOM = H * 0.7; // y = 0

const toPxX = (x: number) => PLOT_LEFT + x * (PLOT_RIGHT - PLOT_LEFT);
const toPxY = (y: number) => PLOT_BOTTOM - y * (PLOT_BOTTOM - PLOT_TOP);

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const round2 = (v: number) => Math.round(v * 100) / 100;
const fmt = (v: number) => v.toFixed(2);

function matchPreset(value: string): string | null {
  const key = parseBezier(value).map(round2).join(",");
  return CURVE_PRESETS.find((p) => parseBezier(p.value).map(round2).join(",") === key)?.value ?? null;
}

export function CurveEditor({
  value,
  onChange,
  animate = false,
}: {
  value: string;
  onChange: (value: string) => void;
  /** Run a looping playhead along the curve so you can feel the easing. */
  animate?: boolean;
}) {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const dragging = React.useRef<1 | 2 | null>(null);
  const [x1, y1, x2, y2] = parseBezier(value);
  const matched = matchPreset(value);

  // Looping playhead: x advances linearly, y follows the eased value, so the
  // dot rides the curve and a tracer shows the eased output over linear time.
  const [play, setPlay] = React.useState(0);
  React.useEffect(() => {
    if (!animate) return;
    const period = 2000;
    const moving = 1500;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      setPlay(Math.min(1, ((now - start) % period) / moving));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animate]);
  const easeFn = makeBezierEasing(parseBezier(value));
  const playY = easeFn(play);

  const updateFromPointer = React.useCallback(
    (clientX: number, clientY: number) => {
      const handle = dragging.current;
      const svg = svgRef.current;
      if (!handle || !svg) return;
      const rect = svg.getBoundingClientRect();
      const vx = ((clientX - rect.left) / rect.width) * W;
      const vy = ((clientY - rect.top) / rect.height) * H;
      const x = clamp((vx - PLOT_LEFT) / (PLOT_RIGHT - PLOT_LEFT), 0, 1);
      const y = clamp((PLOT_BOTTOM - vy) / (PLOT_BOTTOM - PLOT_TOP), -0.5, 1.5);
      const p = parseBezier(value);
      const next: BezierPoints = handle === 1 ? [round2(x), round2(y), p[2], p[3]] : [p[0], p[1], round2(x), round2(y)];
      onChange(next.join(","));
    },
    [onChange, value],
  );

  React.useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!dragging.current) return;
      e.preventDefault();
      updateFromPointer(e.clientX, e.clientY);
    };
    const up = () => {
      dragging.current = null;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [updateFromPointer]);

  const start = { x: toPxX(0), y: toPxY(0) };
  const end = { x: toPxX(1), y: toPxY(1) };
  const c1 = { x: toPxX(x1), y: toPxY(y1) };
  const c2 = { x: toPxX(x2), y: toPxY(y2) };
  const curvePath = `M ${start.x} ${start.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${end.x} ${end.y}`;

  return (
    <div className="flex flex-col gap-2.5">
      <Select
        value={matched ?? "__custom"}
        onValueChange={(v) => v !== "__custom" && onChange(v)}
      >
        <SelectTrigger size="small">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {!matched && (
            <SelectItem value="__custom" disabled>
              Custom
            </SelectItem>
          )}
          {CURVE_PRESETS.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="rounded-control border border-separator bg-control overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full touch-none select-none"
          style={{ display: "block" }}
        >
          {/* baseline guides for y = 0 and y = 1 */}
          <line
            x1={PLOT_LEFT}
            y1={toPxY(0)}
            x2={PLOT_RIGHT}
            y2={toPxY(0)}
            className="text-separator"
            stroke="currentColor"
            strokeWidth={1}
          />
          <line
            x1={PLOT_LEFT}
            y1={toPxY(1)}
            x2={PLOT_RIGHT}
            y2={toPxY(1)}
            className="text-separator"
            stroke="currentColor"
            strokeWidth={1}
            strokeDasharray="3 4"
          />

          {/* handle guide lines */}
          <line
            x1={start.x}
            y1={start.y}
            x2={c1.x}
            y2={c1.y}
            className="text-accent"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            opacity={0.5}
          />
          <line
            x1={end.x}
            y1={end.y}
            x2={c2.x}
            y2={c2.y}
            className="text-support-green"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            opacity={0.5}
          />

          {/* the curve */}
          <path
            d={curvePath}
            className="text-accent"
            stroke="currentColor"
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
          />

          {/* looping playhead riding the curve */}
          {animate && (
            <g className="text-accent">
              <line
                x1={toPxX(play)}
                y1={toPxY(0)}
                x2={toPxX(play)}
                y2={toPxY(playY)}
                stroke="currentColor"
                strokeWidth={1}
                opacity={0.3}
              />
              <line
                x1={PLOT_LEFT}
                y1={toPxY(playY)}
                x2={toPxX(play)}
                y2={toPxY(playY)}
                stroke="currentColor"
                strokeWidth={1}
                opacity={0.3}
              />
              <circle cx={toPxX(play)} cy={toPxY(playY)} r={4.5} fill="currentColor" />
            </g>
          )}

          {/* endpoints */}
          <circle cx={start.x} cy={start.y} r={3} className="text-secondary" fill="currentColor" />
          <circle cx={end.x} cy={end.y} r={3} className="text-secondary" fill="currentColor" />

          {/* draggable control points (large transparent hit areas) */}
          <g
            className="text-accent cursor-grab active:cursor-grabbing"
            onPointerDown={(e) => {
              e.preventDefault();
              dragging.current = 1;
            }}
          >
            <circle cx={c1.x} cy={c1.y} r={13} fill="transparent" />
            <circle cx={c1.x} cy={c1.y} r={6} fill="currentColor" stroke="white" strokeWidth={1.5} />
          </g>
          <g
            className="text-support-green cursor-grab active:cursor-grabbing"
            onPointerDown={(e) => {
              e.preventDefault();
              dragging.current = 2;
            }}
          >
            <circle cx={c2.x} cy={c2.y} r={13} fill="transparent" />
            <circle cx={c2.x} cy={c2.y} r={6} fill="currentColor" stroke="white" strokeWidth={1.5} />
          </g>
        </svg>
      </div>

      <div className="flex items-center justify-between text-small text-secondary tabular-nums">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-accent" />
          {fmt(x1)}, {fmt(y1)}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-support-green" />
          {fmt(x2)}, {fmt(y2)}
        </span>
      </div>
    </div>
  );
}

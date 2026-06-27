import * as React from "react";
import { motion, useSpring } from "motion/react";
import { Grid2x2 } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "cols", type: "slider", label: "Columns", min: 4, max: 10, step: 1, default: 6 },
  { id: "rows", type: "slider", label: "Rows", min: 3, max: 7, step: 1, default: 4 },
  { id: "stiffness", type: "slider", label: "Stiffness", min: 100, max: 600, step: 20, default: 300 },
  { id: "amplitude", type: "slider", label: "Amplitude", min: 4, max: 30, step: 1, default: 16, unit: "px" },
  { id: "color", type: "color", label: "Color", default: "#6366f1" },
] as const;

function TileGrid({
  cols,
  rows,
  stiffness,
  amplitude,
  color,
}: {
  cols: number;
  rows: number;
  stiffness: number;
  amplitude: number;
  color: string;
}) {
  const springs = React.useMemo(
    () =>
      Array.from({ length: cols * rows }, () => ({
        // eslint-disable-next-line react-hooks/rules-of-hooks
        y: useSpring(0, { stiffness, damping: 20 }),
      })),
    // Remount via key when dimensions change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cols, rows, stiffness],
  );

  const handleEnter = React.useCallback(
    (idx: number) => {
      springs[idx].y.set(-amplitude);
      // Nudge orthogonal neighbours
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const neighbours = [
        row > 0 ? idx - cols : -1,
        row < rows - 1 ? idx + cols : -1,
        col > 0 ? idx - 1 : -1,
        col < cols - 1 ? idx + 1 : -1,
      ];
      for (const ni of neighbours) {
        if (ni >= 0 && ni < cols * rows) {
          springs[ni].y.set(-amplitude * 0.4);
        }
      }
    },
    [springs, amplitude, cols, rows],
  );

  const STAGE_W = 360;
  const STAGE_H = 240;
  const GAP = 4;
  const tileW = (STAGE_W - GAP * (cols + 1)) / cols;
  const tileH = (STAGE_H - GAP * (rows + 1)) / rows;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, ${tileW}px)`,
        gridTemplateRows: `repeat(${rows}, ${tileH}px)`,
        gap: GAP,
        padding: GAP,
        width: STAGE_W,
        height: STAGE_H,
      }}
    >
      {springs.map((spring, i) => (
        <motion.div
          key={i}
          style={{
            y: spring.y,
            background: color,
            borderRadius: 6,
            cursor: "default",
          }}
          onPointerEnter={() => handleEnter(i)}
        />
      ))}
    </div>
  );
}

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const cols = Number(params.cols);
  const rows = Number(params.rows);
  const stiffness = Number(params.stiffness);
  const amplitude = Number(params.amplitude);
  const color = String(params.color);

  return (
    <TileGrid
      key={`${replayToken}-${cols}-${rows}-${stiffness}`}
      cols={cols}
      rows={rows}
      stiffness={stiffness}
      amplitude={amplitude}
      color={color}
    />
  );
}

export const bobbleHoverEffect: Effect = {
  id: "bobble-hover",
  name: "Bobble Hover",
  description: "A grid of tiles that spring upward on hover, rippling to adjacent tiles.",
  category: "Micro-interactions",
  icon: <Grid2x2 size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import * as React from "react";
import { motion, useSpring } from "motion/react";

const COLS = ${n(p.cols)};
const ROWS = ${n(p.rows)};
const GAP = 4;

export function BobbleHover() {
  const springs = React.useMemo(
    () => Array.from({ length: COLS * ROWS }, () => ({ y: useSpring(0, { stiffness: ${n(p.stiffness)}, damping: 20 }) })),
    [],
  );

  const handleEnter = React.useCallback((idx: number) => {
    springs[idx].y.set(-${n(p.amplitude)});
    const col = idx % COLS;
    const row = Math.floor(idx / COLS);
    const neighbours = [
      row > 0 ? idx - COLS : -1,
      row < ROWS - 1 ? idx + COLS : -1,
      col > 0 ? idx - 1 : -1,
      col < COLS - 1 ? idx + 1 : -1,
    ];
    for (const ni of neighbours) {
      if (ni >= 0 && ni < COLS * ROWS) springs[ni].y.set(-${n(p.amplitude * 0.4)});
    }
  }, [springs]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: \`repeat(\${COLS}, 1fr)\`,
        gridTemplateRows: \`repeat(\${ROWS}, 1fr)\`,
        gap: GAP,
        padding: GAP,
        width: "100%",
        height: "100%",
      }}
    >
      {springs.map((spring, i) => (
        <motion.div
          key={i}
          style={{ y: spring.y, background: "${p.color}", borderRadius: 6 }}
          onPointerEnter={() => handleEnter(i)}
        />
      ))}
    </div>
  );
}`,
  },
};

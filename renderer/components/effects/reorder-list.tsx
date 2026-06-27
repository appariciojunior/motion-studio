import * as React from "react";
import { Reorder } from "motion/react";
import { GripVertical } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "itemCount", type: "slider", label: "Item count", min: 3, max: 6, step: 1, default: 4 },
  { id: "duration", type: "slider", label: "Transition duration", min: 0.1, max: 0.5, step: 0.05, default: 0.2, unit: "s" },
  { id: "color", type: "color", label: "Accent color", default: "#6366f1" },
  { id: "spring", type: "switch", label: "Spring physics", default: true },
] as const;

const ITEM_LABELS = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5", "Item 6"];

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const itemCount = Math.round(Number(params.itemCount));
  const duration = Number(params.duration);
  const color = String(params.color);
  const spring = Boolean(params.spring);

  const [items, setItems] = React.useState(() => ITEM_LABELS.slice(0, itemCount));

  // Reset when params change or replay is triggered
  React.useEffect(() => {
    setItems(ITEM_LABELS.slice(0, itemCount));
  }, [itemCount, replayToken]);

  const layoutTransition = spring
    ? { type: "spring" as const, stiffness: 400, damping: 30 }
    : { type: "tween" as const, duration };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div style={{ width: 280 }}>
        <Reorder.Group
          axis="y"
          values={items}
          onReorder={setItems}
          style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}
        >
          {items.map((item) => (
            <Reorder.Item
              key={item}
              value={item}
              layoutTransition={layoutTransition}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                backgroundColor: "#1c1c22",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
                padding: "10px 14px",
                cursor: "grab",
                userSelect: "none",
              }}
              whileDrag={{
                scale: 1.02,
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                zIndex: 10,
                cursor: "grabbing",
              }}
            >
              <GripVertical size={14} color="rgba(255,255,255,0.3)" style={{ flexShrink: 0 }} />
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: color,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 14, color: "#e8e8ee", flex: 1 }}>{item}</span>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>
    </div>
  );
}

export const reorderListEffect: Effect = {
  id: "reorder-list",
  name: "Reorder List",
  description: "Draggable list with smooth layout animations when items are reordered.",
  category: "Transitions & lists",
  icon: <GripVertical size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => {
      const duration = n(p.duration);
      const color = String(p.color);
      const spring = Boolean(p.spring);
      const layoutTransition = spring
        ? `{ type: "spring", stiffness: 400, damping: 30 }`
        : `{ type: "tween", duration: ${duration} }`;

      return `import * as React from "react";
import { Reorder } from "motion/react";

export function ReorderList({ items: initialItems }: { items: string[] }) {
  const [items, setItems] = React.useState(initialItems);

  return (
    <Reorder.Group
      axis="y"
      values={items}
      onReorder={setItems}
      style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 6 }}
    >
      {items.map((item) => (
        <Reorder.Item
          key={item}
          value={item}
          layoutTransition={${layoutTransition}}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            backgroundColor: "#1c1c22",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8,
            padding: "10px 14px",
            cursor: "grab",
          }}
          whileDrag={{ scale: 1.02, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}
        >
          <span
            style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "${color}" }}
          />
          <span style={{ fontSize: 14, flex: 1 }}>{item}</span>
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}`;
    },
  },
};

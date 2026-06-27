import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Layers } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "cardCount", type: "slider", label: "Cards", min: 2, max: 5, step: 1, default: 3 },
  { id: "offset", type: "slider", label: "Offset", min: 4, max: 20, step: 1, default: 8, unit: "px" },
  { id: "rotation", type: "slider", label: "Rotation", min: 0, max: 10, step: 0.5, default: 3, unit: "°" },
  { id: "duration", type: "slider", label: "Duration", min: 0.2, max: 1, step: 0.05, default: 0.4, unit: "s" },
  { id: "color", type: "color", label: "Color", default: "#6366f1" },
] as const;

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace("#", "");
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  return { r: isNaN(r) ? 99 : r, g: isNaN(g) ? 102 : g, b: isNaN(b) ? 241 : b };
}

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const cardCount = Number(params.cardCount);
  const offset = Number(params.offset);
  const rotation = Number(params.rotation);
  const duration = Number(params.duration);
  const color = String(params.color);

  const { r, g, b } = hexToRgb(color);

  // ids array — top card is last
  const [cards, setCards] = React.useState(() =>
    Array.from({ length: cardCount }, (_, i) => i),
  );

  React.useEffect(() => {
    setCards(Array.from({ length: cardCount }, (_, i) => i));
  }, [replayToken, cardCount]);

  const dismissTop = () => {
    setCards((prev) => {
      if (prev.length === 0) return prev;
      return prev.slice(0, -1);
    });
  };

  const stackLen = cards.length;

  return (
    <div
      className="flex flex-col items-center justify-center gap-3"
      style={{ width: 360, height: 240 }}
    >
      <div
        style={{
          position: "relative",
          width: 200,
          height: 130,
        }}
      >
        <AnimatePresence>
          {cards.map((id, stackIdx) => {
            const isTop = stackIdx === stackLen - 1;
            // Distance from top: 0 = top card
            const fromTop = stackLen - 1 - stackIdx;
            const yOffset = fromTop * offset;
            const rot = fromTop % 2 === 0 ? fromTop * rotation * 0.5 : -(fromTop * rotation * 0.5);
            const lightness = 1 - fromTop * 0.12;
            const cardBg = `rgba(${r}, ${g}, ${b}, ${lightness})`;

            return (
              <motion.div
                key={id}
                initial={false}
                animate={{
                  y: yOffset,
                  rotate: rot,
                  scale: 1 - fromTop * 0.03,
                  zIndex: stackIdx,
                }}
                exit={{
                  x: 320,
                  opacity: 0,
                  rotate: rot + 15,
                  transition: { duration, ease: "easeInOut" },
                }}
                transition={{ duration, type: "spring", stiffness: 200, damping: 24 }}
                onClick={isTop ? dismissTop : undefined}
                style={{
                  position: "absolute",
                  width: 200,
                  height: 130,
                  borderRadius: 16,
                  background: cardBg,
                  cursor: isTop ? "pointer" : "default",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
                  transformOrigin: "center bottom",
                }}
              >
                {isTop && (
                  <span className="text-white select-none" style={{ fontSize: 13, opacity: 0.85 }}>
                    Click to dismiss
                  </span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        {stackLen === 0 && (
          <div
            className="flex items-center justify-center text-muted text-sm"
            style={{ width: 200, height: 130, border: "1.5px dashed", borderRadius: 16, opacity: 0.4 }}
          >
            Stack empty
          </div>
        )}
      </div>
    </div>
  );
}

export const cardStackEffect: Effect = {
  id: "card-stack",
  name: "Card Stack",
  description: "Multiple cards stacked with depth — click to dismiss the top card and reveal the next.",
  category: "Micro-interactions",
  icon: <Layers size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import * as React from "react";
import { motion, AnimatePresence } from "motion/react";

export function CardStack({ cards }: { cards: React.ReactNode[] }) {
  const [stack, setStack] = React.useState(() => cards.map((_, i) => i));
  const stackLen = stack.length;

  const dismissTop = () => setStack((prev) => prev.slice(0, -1));

  return (
    <div style={{ position: "relative", width: 200, height: 130 }}>
      <AnimatePresence>
        {stack.map((id, stackIdx) => {
          const isTop = stackIdx === stackLen - 1;
          const fromTop = stackLen - 1 - stackIdx;
          const yOffset = fromTop * ${n(p.offset)};
          const rot = fromTop % 2 === 0 ? fromTop * ${n(p.rotation * 0.5)} : -(fromTop * ${n(p.rotation * 0.5)});

          return (
            <motion.div
              key={id}
              initial={false}
              animate={{
                y: yOffset,
                rotate: rot,
                scale: 1 - fromTop * 0.03,
                zIndex: stackIdx,
              }}
              exit={{
                x: 320,
                opacity: 0,
                rotate: rot + 15,
                transition: { duration: ${n(p.duration)}, ease: "easeInOut" },
              }}
              transition={{ duration: ${n(p.duration)}, type: "spring", stiffness: 200, damping: 24 }}
              onClick={isTop ? dismissTop : undefined}
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                borderRadius: 16,
                background: "${p.color}",
                cursor: isTop ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 1 - fromTop * 0.12,
                transformOrigin: "center bottom",
              }}
            >
              {isTop && cards[id]}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}`,
  },
};

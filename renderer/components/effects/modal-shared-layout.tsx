import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { LayoutGrid } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const CARDS = [
  { id: "a", color: "#6366f1", emoji: "🌊", title: "Ocean Vibes", sub: "Deep sea photography" },
  { id: "b", color: "#f59e0b", emoji: "🌄", title: "Sunrise Run", sub: "Morning routines" },
  { id: "c", color: "#10b981", emoji: "🌿", title: "Botanical", sub: "Plants & growth" },
  { id: "d", color: "#ef4444", emoji: "🔥", title: "Hot Takes", sub: "Bold opinions" },
];

const controls = [
  { id: "stiffness", type: "slider", label: "Spring stiffness", min: 100, max: 700, step: 10, default: 350 },
  { id: "damping", type: "slider", label: "Spring damping", min: 8, max: 50, step: 1, default: 30 },
  { id: "backdrop", type: "slider", label: "Backdrop opacity", min: 0, max: 1, step: 0.05, default: 0.5 },
] as const;

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const stiffness = Number(params.stiffness);
  const damping = Number(params.damping);
  const backdrop = Number(params.backdrop);
  const spring = { type: "spring" as const, stiffness, damping };

  React.useEffect(() => {
    if (replayToken > 0) setSelectedId(null);
  }, [replayToken]);

  const selected = CARDS.find((c) => c.id === selectedId);

  return (
    <div className="relative w-full max-w-xl">
      {/* card grid */}
      <div className="grid grid-cols-2 gap-3 p-1">
        {CARDS.map((card) => (
          <motion.div
            key={card.id}
            layoutId={`card-${card.id}`}
            onClick={() => setSelectedId(card.id)}
            transition={spring}
            style={{ borderRadius: 16, background: card.color, cursor: "pointer" }}
            className="p-4 select-none"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <motion.p layoutId={`emoji-${card.id}`} transition={spring} style={{ fontSize: 24 }}>
              {card.emoji}
            </motion.p>
            <motion.p layoutId={`title-${card.id}`} transition={spring} style={{ color: "#fff", fontWeight: 600, fontSize: 14, marginTop: 6 }}>
              {card.title}
            </motion.p>
            <motion.p layoutId={`sub-${card.id}`} transition={spring} style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 2 }}>
              {card.sub}
            </motion.p>
          </motion.div>
        ))}
      </div>

      {/* expanded modal */}
      <AnimatePresence>
        {selectedId && selected && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{ zIndex: 10 }}
          >
            {/* backdrop */}
            <motion.div
              className="absolute inset-0 bg-black"
              style={{ borderRadius: 16 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: backdrop }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedId(null)}
            />

            {/* expanded card */}
            <motion.div
              layoutId={`card-${selectedId}`}
              transition={spring}
              style={{ borderRadius: 24, background: selected.color, width: "85%", position: "relative", zIndex: 1 }}
              className="p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.p layoutId={`emoji-${selectedId}`} transition={spring} style={{ fontSize: 48 }}>
                {selected.emoji}
              </motion.p>
              <motion.p layoutId={`title-${selectedId}`} transition={spring} style={{ color: "#fff", fontWeight: 700, fontSize: 22, marginTop: 12 }}>
                {selected.title}
              </motion.p>
              <motion.p layoutId={`sub-${selectedId}`} transition={spring} style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, marginTop: 4 }}>
                {selected.sub}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.15, duration: 0.2 }}
                style={{ marginTop: 16 }}
              >
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, lineHeight: 1.6 }}>
                  Full details and description appear here after the card expands into a modal.
                </p>
                <button
                  onClick={() => setSelectedId(null)}
                  style={{ marginTop: 16, background: "rgba(255,255,255,0.2)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer" }}
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const modalSharedLayoutEffect: Effect = {
  id: "modal-shared-layout",
  name: "Modal Shared Layout",
  description: "Grid cards expand into a centered modal via shared layoutId.",
  category: "Overlays & dialogs",
  icon: <LayoutGrid size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import * as React from "react";
import { AnimatePresence, motion } from "motion/react";

const SPRING = { type: "spring", stiffness: ${n(p.stiffness)}, damping: ${n(p.damping)} };

// items: { id, title, sub, color }[]
export function SharedLayoutGrid({ items }: { items: { id: string; title: string; sub: string; color: string }[] }) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const selected = items.find((i) => i.id === selectedId);

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {items.map((item) => (
          <motion.div
            key={item.id}
            layoutId={\`card-\${item.id}\`}
            onClick={() => setSelectedId(item.id)}
            transition={SPRING}
            style={{ borderRadius: 16, background: item.color, padding: 16, cursor: "pointer" }}
          >
            <motion.p layoutId={\`title-\${item.id}\`} transition={SPRING} style={{ fontWeight: 600 }}>
              {item.title}
            </motion.p>
            <motion.p layoutId={\`sub-\${item.id}\`} transition={SPRING} style={{ opacity: 0.7 }}>
              {item.sub}
            </motion.p>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedId && selected && (
          <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
            <motion.div
              style={{ position: "absolute", inset: 0, background: "black" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: ${n(p.backdrop)} }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedId(null)}
            />
            <motion.div
              layoutId={\`card-\${selectedId}\`}
              transition={SPRING}
              style={{ borderRadius: 24, background: selected.color, padding: 24, width: 320, position: "relative", zIndex: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.p layoutId={\`title-\${selectedId}\`} transition={SPRING} style={{ fontWeight: 700, fontSize: 22 }}>
                {selected.title}
              </motion.p>
              <motion.p layoutId={\`sub-\${selectedId}\`} transition={SPRING}>
                {selected.sub}
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.15 }}>
                {/* expanded content */}
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}`,
  },
};

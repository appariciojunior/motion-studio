import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring, animate } from "motion/react";
import { Layers } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "threshold", type: "slider", label: "Snap threshold", min: 40, max: 100, step: 10, default: 60, unit: "px" },
  { id: "duration", type: "slider", label: "Snap speed", min: 0.2, max: 0.6, step: 0.05, default: 0.3, unit: "s" },
  { id: "itemHeight", type: "slider", label: "Item height", min: 48, max: 80, step: 4, default: 60, unit: "px" },
  { id: "color", type: "color", label: "Delete color", default: "#ef4444" },
  { id: "archiveColor", type: "color", label: "Archive color", default: "#22c55e" },
] as const;

const SEED_ITEMS = [
  { id: 1, avatar: "#6366f1", initials: "AJ", title: "Alice Johnson", subtitle: "Meeting at 3pm today" },
  { id: 2, avatar: "#f59e0b", initials: "BM", title: "Bob Martinez", subtitle: "Re: Project proposal" },
  { id: 3, avatar: "#14b8a6", initials: "CL", title: "Carol Lee", subtitle: "Lunch tomorrow?" },
  { id: 4, avatar: "#ec4899", initials: "DS", title: "Dave Smith", subtitle: "Invoice attached" },
];

const ACTION_WIDTH = 120;

type SeedItem = (typeof SEED_ITEMS)[number];

function SwipeItem({
  item,
  params,
  onDelete,
  autoDemo,
}: {
  item: SeedItem;
  params: EffectParams;
  onDelete: (id: number) => void;
  autoDemo: boolean;
}) {
  const threshold = Number(params.threshold);
  const duration = Number(params.duration);
  const itemHeight = Number(params.itemHeight);
  const deleteColor = String(params.color);
  const archiveColor = String(params.archiveColor);

  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 400, damping: 40 });
  const heightVal = useMotionValue(itemHeight);
  const opacityVal = useMotionValue(1);
  const autoDoneRef = useRef(false);

  useEffect(() => {
    if (!autoDemo || autoDoneRef.current) return;
    autoDoneRef.current = true;
    const run = async () => {
      await new Promise<void>((res) => setTimeout(res, 400));
      await animate(x, -ACTION_WIDTH, { duration, ease: [0.77, 0, 0.175, 1]});
      await new Promise<void>((res) => setTimeout(res, 700));
      await animate(x, 0, { duration, ease: [0.77, 0, 0.175, 1]});
    };
    run();
  }, [autoDemo, duration, x]);

  function handleDragEnd(_: unknown, info: { offset: { x: number } }) {
    if (info.offset.x < -threshold) {
      animate(x, -ACTION_WIDTH, { duration, ease: [0.77, 0, 0.175, 1]});
    } else {
      animate(x, 0, { duration, ease: [0.77, 0, 0.175, 1]});
    }
  }

  function handleDelete() {
    animate(opacityVal, 0, { duration: 0.2 }).then(() => {
      animate(heightVal, 0, { duration: 0.25, ease: "easeIn" }).then(() => {
        onDelete(item.id);
      });
    });
  }

  function handleArchive() {
    animate(x, 0, { duration, ease: [0.77, 0, 0.175, 1]});
  }

  return (
    <motion.div style={{ height: heightVal, opacity: opacityVal, overflow: "hidden" }}>
      <div style={{ position: "relative", height: itemHeight, overflow: "hidden" }}>
        {/* Action buttons behind the card */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: ACTION_WIDTH,
            display: "flex",
          }}
        >
          <button
            onClick={handleArchive}
            style={{
              flex: 1,
              background: archiveColor,
              border: "none",
              color: "#fff",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="5" rx="1" />
              <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
              <path d="M10 12h4" />
            </svg>
            Archive
          </button>
          <button
            onClick={handleDelete}
            style={{
              flex: 1,
              background: deleteColor,
              border: "none",
              color: "#fff",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
            Delete
          </button>
        </div>

        {/* Draggable card */}
        <motion.div
          drag="x"
          dragConstraints={{ right: 0, left: -ACTION_WIDTH }}
          dragElastic={0.05}
          onDragEnd={handleDragEnd}
          style={{
            x: springX,
            position: "absolute",
            inset: 0,
            background: "rgba(255,255,255,0.05)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            gap: 12,
            cursor: "grab",
            userSelect: "none",
          }}
          whileTap={{ cursor: "grabbing" }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: item.avatar,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: 12,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {item.initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "rgba(255,255,255,0.9)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {item.title}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.45)",
                marginTop: 2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {item.subtitle}
            </div>
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", flexShrink: 0 }}>←</div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  return <PreviewInner key={replayToken} params={params} replayToken={replayToken} />;
}

function PreviewInner({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const [items, setItems] = useState<SeedItem[]>([...SEED_ITEMS]);

  // Reset when replayToken changes (handled by key on Preview, so this is a no-op safety)
  useEffect(() => {
    setItems([...SEED_ITEMS]);
  }, [replayToken]);

  function handleDelete(id: number) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 360,
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(0,0,0,0.3)",
      }}
    >
      <div
        style={{
          padding: "10px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          fontSize: 11,
          fontWeight: 600,
          color: "rgba(255,255,255,0.4)",
          letterSpacing: "0.08em",
          textTransform: "uppercase" as const,
        }}
      >
        Messages
      </div>
      {items.map((item, idx) => (
        <SwipeItem
          key={item.id}
          item={item}
          params={params}
          onDelete={handleDelete}
          autoDemo={idx === 0}
        />
      ))}
      {items.length === 0 && (
        <div
          style={{
            padding: 24,
            textAlign: "center" as const,
            fontSize: 12,
            color: "rgba(255,255,255,0.3)",
          }}
        >
          All cleared
        </div>
      )}
    </div>
  );
}

export const swipeActionsEffect: Effect = {
  id: "swipe-actions",
  name: "Swipe Actions",
  description: "Swipe a list item to reveal action buttons underneath",
  category: "Micro-interactions",
  icon: <Layers size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import { useState } from "react";
import { motion, useMotionValue, useSpring, animate } from "motion/react";

const ACTION_WIDTH = 120;

function SwipeItem({ item, onDelete }) {
  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 400, damping: 40 });
  const heightVal = useMotionValue(${n(p.itemHeight)});
  const opacityVal = useMotionValue(1);

  function handleDragEnd(_, info) {
    if (info.offset.x < -${n(p.threshold)}) {
      animate(x, -ACTION_WIDTH, { duration: ${n(p.duration)}, ease: "easeOut" });
    } else {
      animate(x, 0, { duration: ${n(p.duration)}, ease: "easeOut" });
    }
  }

  function handleDelete() {
    animate(opacityVal, 0, { duration: 0.2 }).then(() => {
      animate(heightVal, 0, { duration: 0.25 }).then(() => onDelete(item.id));
    });
  }

  return (
    <motion.div style={{ height: heightVal, opacity: opacityVal, overflow: "hidden" }}>
      <div style={{ position: "relative", height: ${n(p.itemHeight)}, overflow: "hidden" }}>
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: ACTION_WIDTH, display: "flex" }}>
          <button
            onClick={() => animate(x, 0, { duration: ${n(p.duration)} })}
            style={{ flex: 1, background: "${p.archiveColor}", border: "none", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
          >
            Archive
          </button>
          <button
            onClick={handleDelete}
            style={{ flex: 1, background: "${p.color}", border: "none", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
          >
            Delete
          </button>
        </div>
        <motion.div
          drag="x"
          dragConstraints={{ right: 0, left: -ACTION_WIDTH }}
          dragElastic={0.05}
          onDragEnd={handleDragEnd}
          style={{ x: springX, position: "absolute", inset: 0, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", padding: "0 16px", gap: 12, cursor: "grab" }}
        >
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: item.avatar, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>
            {item.initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{item.title}</div>
            <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>{item.subtitle}</div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export function SwipeActions() {
  const [items, setItems] = useState([
    { id: 1, avatar: "#6366f1", initials: "AJ", title: "Alice Johnson", subtitle: "Meeting at 3pm today" },
    { id: 2, avatar: "#f59e0b", initials: "BM", title: "Bob Martinez", subtitle: "Re: Project proposal" },
    { id: 3, avatar: "#14b8a6", initials: "CL", title: "Carol Lee", subtitle: "Lunch tomorrow?" },
  ]);

  return (
    <div style={{ width: 360, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
      {items.map((item) => (
        <SwipeItem key={item.id} item={item} onDelete={(id) => setItems((prev) => prev.filter((i) => i.id !== id))} />
      ))}
    </div>
  );
}`,
  },
};

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { GalleryHorizontal } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "cardWidth", type: "slider", label: "Card width", min: 140, max: 240, step: 10, default: 180, unit: "px" },
  { id: "gap", type: "slider", label: "Gap", min: 8, max: 24, step: 4, default: 12, unit: "px" },
  { id: "stiffness", type: "slider", label: "Snap stiffness", min: 200, max: 600, step: 50, default: 400 },
  { id: "damping", type: "slider", label: "Damping", min: 20, max: 50, step: 5, default: 35 },
  { id: "elasticity", type: "slider", label: "Edge elasticity", min: 0.05, max: 0.4, step: 0.05, default: 0.15 },
] as const;

const CARDS = [
  { gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", title: "Card 01" },
  { gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", title: "Card 02" },
  { gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", title: "Card 03" },
  { gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", title: "Card 04" },
  { gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", title: "Card 05" },
  { gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)", title: "Card 06" },
];

function Preview({ params }: { params: EffectParams }) {
  const cardWidth = Number(params.cardWidth);
  const gap = Number(params.gap);
  const stiffness = Number(params.stiffness);
  const damping = Number(params.damping);
  const elasticity = Number(params.elasticity);

  const containerRef = useRef<HTMLDivElement>(null);
  const currentIndex = useRef(0);

  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness, damping });

  const cardStep = cardWidth + gap;
  const totalCards = CARDS.length;

  // Constraints: left boundary keeps last card visible, right boundary at 0
  const containerWidth = 320; // approximate preview width
  const trackWidth = totalCards * cardStep - gap;
  const leftConstraint = -(trackWidth - containerWidth);
  const rightConstraint = 0;

  function snapToCard(index: number) {
    const clampedIndex = Math.max(0, Math.min(totalCards - 1, index));
    currentIndex.current = clampedIndex;
    const targetX = -clampedIndex * cardStep;
    x.set(targetX);
  }

  function handleDragEnd(_e: never, info: { offset: { x: number }; velocity: { x: number } }) {
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    // Use velocity to determine direction bias
    let targetIndex = currentIndex.current;
    if (Math.abs(velocity) > 200) {
      targetIndex = velocity < 0
        ? currentIndex.current + 1
        : currentIndex.current - 1;
    } else {
      // Snap to nearest card based on current x position
      const currentX = x.get();
      targetIndex = Math.round(-currentX / cardStep);
    }

    // Also account for large drags
    const dragCards = Math.round(-offset / cardStep);
    if (Math.abs(velocity) <= 200 && Math.abs(dragCards) > 0) {
      targetIndex = currentIndex.current + dragCards;
    }

    snapToCard(targetIndex);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, userSelect: "none" }}>
      <div
        ref={containerRef}
        style={{
          width: containerWidth,
          overflow: "hidden",
          cursor: "grab",
          position: "relative",
        }}
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: leftConstraint, right: rightConstraint }}
          dragElastic={elasticity}
          style={{
            x: springX,
            display: "flex",
            gap,
            width: trackWidth,
            paddingBottom: 4,
          }}
          onDragEnd={handleDragEnd as never}
          whileDrag={{ cursor: "grabbing" }}
        >
          {CARDS.map((card, i) => (
            <div
              key={i}
              style={{
                width: cardWidth,
                height: 160,
                borderRadius: 12,
                background: card.gradient,
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: 14,
                gap: 6,
                boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
              }}
            >
              <span style={{ fontSize: 32, fontWeight: 800, opacity: 0.9 }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ fontSize: 13, opacity: 0.85, letterSpacing: "0.05em" }}>{card.title}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Dot indicators */}
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {CARDS.map((_, i) => (
          <motion.div
            key={i}
            onClick={() => snapToCard(i)}
            style={{
              width: i === currentIndex.current ? 20 : 8,
              height: 8,
              borderRadius: 4,
              background: i === currentIndex.current ? "var(--accent, #7c6af7)" : "rgba(128,128,128,0.4)",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export const momentumCarouselEffect: Effect = {
  id: "momentum-carousel",
  name: "Momentum Carousel",
  description: "Drag a carousel with momentum and elastic boundaries",
  category: "Transitions & lists",
  icon: <GalleryHorizontal size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

const CARDS = [
  { gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", title: "Card 01" },
  { gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", title: "Card 02" },
  { gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", title: "Card 03" },
  { gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", title: "Card 04" },
  { gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", title: "Card 05" },
  { gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)", title: "Card 06" },
];

export function MomentumCarousel({ containerWidth = 320 }: { containerWidth?: number }) {
  const currentIndex = useRef(0);
  const cardWidth = ${n(p.cardWidth)};
  const gap = ${n(p.gap)};
  const cardStep = cardWidth + gap;
  const trackWidth = CARDS.length * cardStep - gap;

  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: ${n(p.stiffness)}, damping: ${n(p.damping)} });

  function snapToCard(index) {
    const clampedIndex = Math.max(0, Math.min(CARDS.length - 1, index));
    currentIndex.current = clampedIndex;
    x.set(-clampedIndex * cardStep);
  }

  function handleDragEnd(_e, info) {
    const velocity = info.velocity.x;
    const offset = info.offset.x;
    let targetIndex = currentIndex.current;
    if (Math.abs(velocity) > 200) {
      targetIndex = velocity < 0 ? currentIndex.current + 1 : currentIndex.current - 1;
    } else {
      const dragCards = Math.round(-offset / cardStep);
      targetIndex = currentIndex.current + dragCards;
    }
    snapToCard(targetIndex);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ width: containerWidth, overflow: "hidden", cursor: "grab" }}>
        <motion.div
          drag="x"
          dragConstraints={{ left: -(trackWidth - containerWidth), right: 0 }}
          dragElastic={${n(p.elasticity)}}
          style={{ x: springX, display: "flex", gap, width: trackWidth }}
          onDragEnd={handleDragEnd}
          whileDrag={{ cursor: "grabbing" }}
        >
          {CARDS.map((card, i) => (
            <div
              key={i}
              style={{
                width: cardWidth, height: 160, borderRadius: 12, background: card.gradient,
                flexShrink: 0, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                color: "white", fontWeight: 700, gap: 6,
                boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
              }}
            >
              <span style={{ fontSize: 32, fontWeight: 800 }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ fontSize: 13 }}>{card.title}</span>
            </div>
          ))}
        </motion.div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {CARDS.map((_, i) => (
          <div
            key={i}
            onClick={() => snapToCard(i)}
            style={{
              width: 8, height: 8, borderRadius: 4, cursor: "pointer",
              background: i === 0 ? "#7c6af7" : "rgba(128,128,128,0.4)",
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}`,
  },
};

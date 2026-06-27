import { motion } from "motion/react";
import { Rocket } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const HEADLINE_WORDS = ["Build", "interfaces", "that", "feel", "alive."];
const AVATARS = ["AJ", "MK", "SR", "LP", "JW"];
const AVATAR_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

const controls = [
  { id: "stagger", type: "slider", label: "Stagger", min: 0.02, max: 0.2, step: 0.01, default: 0.07, unit: "s" },
  { id: "stiffness", type: "slider", label: "Spring stiffness", min: 80, max: 500, step: 10, default: 220 },
  { id: "damping", type: "slider", label: "Spring damping", min: 8, max: 40, step: 1, default: 20 },
  { id: "yOffset", type: "slider", label: "Initial Y offset", min: 10, max: 80, step: 5, default: 32, unit: "px" },
  { id: "blurIn", type: "switch", label: "Blur-in effect", default: true },
] as const;

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const stagger = Number(params.stagger);
  const stiffness = Number(params.stiffness);
  const damping = Number(params.damping);
  const yOffset = Number(params.yOffset);
  const blurIn = params.blurIn === true;

  const spring = { type: "spring" as const, stiffness, damping };

  function itemInitial(_i: number) {
    return {
      opacity: 0,
      y: yOffset,
      filter: blurIn ? `blur(6px)` : "blur(0px)",
    };
  }

  function itemAnimate(i: number) {
    return {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { ...spring, delay: i * stagger },
    };
  }

  // index assignments: badge=0, headline words=1..5, sub=6, buttons=7,8, chips=9
  const badge = 0;
  const headlineStart = 1;
  const sub = headlineStart + HEADLINE_WORDS.length;
  const btnPrimary = sub + 1;
  const btnSecondary = btnPrimary + 1;
  const chipsStart = btnSecondary + 1;

  return (
    <div key={replayToken} className="w-full max-w-lg flex flex-col items-center gap-5 py-4 px-2" style={{ userSelect: "none" }}>
      {/* badge */}
      <motion.div
        initial={itemInitial(badge)}
        animate={itemAnimate(badge)}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 9999, padding: "4px 12px" }}
      >
        <span style={{ width: 6, height: 6, borderRadius: 9999, background: "#6366f1", display: "inline-block" }} />
        <span className="text-small" style={{ color: "#6366f1", fontWeight: 500, fontSize: 12 }}>Open Source</span>
      </motion.div>

      {/* headline */}
      <h1 style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 8px", margin: 0 }}>
        {HEADLINE_WORDS.map((word, i) => (
          <motion.span
            key={i}
            initial={itemInitial(headlineStart + i)}
            animate={itemAnimate(headlineStart + i)}
            style={{ fontSize: 28, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}
          >
            {word}
          </motion.span>
        ))}
      </h1>

      {/* subtext */}
      <motion.p
        initial={itemInitial(sub)}
        animate={itemAnimate(sub)}
        className="text-secondary"
        style={{ textAlign: "center", fontSize: 14, lineHeight: 1.6, maxWidth: 360, margin: 0 }}
      >
        A production-ready motion library that ships with spring physics, layout animations, and gesture support.
      </motion.p>

      {/* buttons */}
      <div style={{ display: "flex", gap: 10 }}>
        <motion.button
          initial={itemInitial(btnPrimary)}
          animate={itemAnimate(btnPrimary)}
          style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, padding: "9px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          Get Started
        </motion.button>
        <motion.button
          initial={itemInitial(btnSecondary)}
          animate={itemAnimate(btnSecondary)}
          style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "9px 20px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          View on GitHub
        </motion.button>
      </div>

      {/* avatar + star chips row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
        <div style={{ display: "flex" }}>
          {AVATARS.map((initials, i) => (
            <motion.div
              key={initials}
              initial={itemInitial(chipsStart + i)}
              animate={itemAnimate(chipsStart + i)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 9999,
                background: AVATAR_COLORS[i],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 600,
                color: "#fff",
                border: "2px solid #09090b",
                marginLeft: i === 0 ? 0 : -8,
              }}
            >
              {initials}
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={itemInitial(chipsStart + AVATARS.length)}
          animate={itemAnimate(chipsStart + AVATARS.length)}
          style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 9999, padding: "4px 10px" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
          <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 500 }}>24k+ stars</span>
        </motion.div>
      </div>
    </div>
  );
}

export const ossHeroEffect: Effect = {
  id: "oss-hero",
  name: "OSS Hero",
  description: "Open-source project hero with staggered spring entrance per element.",
  category: "Heroes",
  icon: <Rocket size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import { motion } from "motion/react";

const STAGGER = ${n(p.stagger)};
const SPRING = { type: "spring", stiffness: ${n(p.stiffness)}, damping: ${n(p.damping)} };
const Y_OFFSET = ${n(p.yOffset)};
const BLUR_IN = ${p.blurIn === true};

const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: STAGGER,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: Y_OFFSET, filter: BLUR_IN ? "blur(6px)" : "blur(0px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: SPRING,
  },
};

const WORDS = ["Build", "interfaces", "that", "feel", "alive."];

export function OssHero() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}
    >
      {/* Badge */}
      <motion.div variants={staggerItem}>
        <span>Open Source</span>
      </motion.div>

      {/* Headline — each word staggered */}
      <h1 style={{ display: "flex", flexWrap: "wrap", gap: "0 8px" }}>
        {WORDS.map((word) => (
          <motion.span key={word} variants={staggerItem}>{word}</motion.span>
        ))}
      </h1>

      {/* Subtext */}
      <motion.p variants={staggerItem}>
        A production-ready motion library with spring physics, layout animations, and gestures.
      </motion.p>

      {/* Buttons */}
      <motion.div variants={staggerItem} style={{ display: "flex", gap: 10 }}>
        <button>Get Started</button>
        <button>View on GitHub</button>
      </motion.div>

      {/* Social proof */}
      <motion.div variants={staggerItem}>
        {/* avatars + star count */}
      </motion.div>
    </motion.div>
  );
}`,
  },
};

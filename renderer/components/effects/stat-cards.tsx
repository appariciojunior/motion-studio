import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { BarChart3, TrendingUp, TrendingDown, Users, DollarSign, MousePointerClick, Clock } from "lucide-react";
import { type Effect, type EffectParams } from "./types";

const controls = [
  { id: "duration", type: "slider", label: "Count duration", min: 0.5, max: 3, step: 0.25, default: 1.5, unit: "s" },
  { id: "stagger", type: "slider", label: "Card stagger", min: 0.05, max: 0.3, step: 0.05, default: 0.1, unit: "s" },
  { id: "color", type: "color", label: "Accent color", default: "#6366f1" },
  {
    id: "easing",
    type: "segmented",
    label: "Count easing",
    options: [
      { value: "easeOut", label: "Ease Out" },
      { value: "easeInOut", label: "Ease In-Out" },
    ],
    default: "easeOut",
  },
] as const;

interface StatConfig {
  label: string;
  targetValue: number;
  targetPercent: number;
  trendUp: boolean;
  trendPercent: string;
  format: (v: number) => string;
  icon: React.ReactNode;
}

const STATS: StatConfig[] = [
  {
    label: "Total Revenue",
    targetValue: 124592,
    targetPercent: 72,
    trendUp: true,
    trendPercent: "12.4%",
    format: (v) => "$" + Math.round(v).toLocaleString(),
    icon: <DollarSign size={18} />,
  },
  {
    label: "Active Users",
    targetValue: 8429,
    targetPercent: 58,
    trendUp: true,
    trendPercent: "8.1%",
    format: (v) => Math.round(v).toLocaleString(),
    icon: <Users size={18} />,
  },
  {
    label: "Conversion",
    targetValue: 324,
    targetPercent: 34,
    trendUp: false,
    trendPercent: "2.3%",
    format: (v) => (v / 100).toFixed(2) + "%",
    icon: <MousePointerClick size={18} />,
  },
  {
    label: "Avg Session",
    targetValue: 272,
    targetPercent: 61,
    trendUp: true,
    trendPercent: "5.7%",
    format: (v) => {
      const secs = Math.round(v);
      return `${Math.floor(secs / 60)}m ${secs % 60}s`;
    },
    icon: <Clock size={18} />,
  },
];

function CountDisplay({
  value,
  format,
}: {
  value: ReturnType<typeof useTransform>;
  format: (v: number) => string;
}) {
  const [display, setDisplay] = useState(() => format(0));

  useEffect(() => {
    const unsub = value.on("change", (v: number) => {
      setDisplay(format(v));
    });
    return unsub;
  }, [value, format]);

  return <span>{display}</span>;
}

function StatCard({
  stat,
  index,
  params,
  replayToken,
}: {
  stat: StatConfig;
  index: number;
  params: EffectParams;
  replayToken: number;
}) {
  const duration = Number(params.duration);
  const stagger = Number(params.stagger);
  const color = String(params.color);
  const easing = String(params.easing) as "easeOut" | "easeInOut";

  const progress = useMotionValue(0);
  const displayValue = useTransform(progress, [0, 1], [0, stat.targetValue]);
  const barWidth = useTransform(progress, [0, 1], ["0%", `${stat.targetPercent}%`]);

  const animRef = useRef<ReturnType<typeof animate> | null>(null);

  useEffect(() => {
    progress.set(0);
    const delay = index * stagger;
    const timer = setTimeout(() => {
      animRef.current = animate(progress, 1, {
        duration,
        ease: easing,
      });
    }, delay * 1000);
    return () => {
      clearTimeout(timer);
      animRef.current?.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replayToken, duration, stagger, easing]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * stagger, ease: [0.23, 1, 0.32, 1] }}
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 12,
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: `${color}22`,
            color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {stat.icon}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            fontSize: 11,
            fontWeight: 600,
            color: stat.trendUp ? "#4ade80" : "#f87171",
          }}
        >
          {stat.trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {stat.trendPercent}
        </div>
      </div>

      {/* Number */}
      <div style={{ fontSize: 22, fontWeight: 700, color: "#f0f0f8", lineHeight: 1.1 }}>
        <CountDisplay value={displayValue} format={stat.format} />
      </div>

      {/* Label */}
      <div style={{ fontSize: 11, color: "rgba(240,240,248,0.5)", fontWeight: 500 }}>
        {stat.label}
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 3,
          background: "rgba(255,255,255,0.1)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <motion.div
          style={{
            height: "100%",
            width: barWidth,
            background: color,
            borderRadius: 2,
          }}
        />
      </div>
    </motion.div>
  );
}

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  return (
    <div
      key={replayToken}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10,
        width: "100%",
        maxWidth: 380,
      }}
    >
      {STATS.map((stat, i) => (
        <StatCard key={stat.label} stat={stat} index={i} params={params} replayToken={replayToken} />
      ))}
    </div>
  );
}

export const statCardsEffect: Effect = {
  id: "stat-cards",
  name: "Stat Cards",
  description: "Dashboard stat cards that animate in with counting numbers and progress bars",
  category: "Heroes",
  icon: <BarChart3 size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";

const STATS = [
  { label: "Total Revenue", targetValue: 124592, targetPercent: 72, trendUp: true, trendPercent: "12.4%", format: (v) => "$" + Math.round(v).toLocaleString() },
  { label: "Active Users", targetValue: 8429, targetPercent: 58, trendUp: true, trendPercent: "8.1%", format: (v) => Math.round(v).toLocaleString() },
  { label: "Conversion", targetValue: 324, targetPercent: 34, trendUp: false, trendPercent: "2.3%", format: (v) => (v / 100).toFixed(2) + "%" },
  { label: "Avg Session", targetValue: 272, targetPercent: 61, trendUp: true, trendPercent: "5.7%", format: (v) => { const s = Math.round(v); return \`\${Math.floor(s/60)}m \${s%60}s\`; } },
];

function StatCard({ stat, index }) {
  const progress = useMotionValue(0);
  const displayValue = useTransform(progress, [0, 1], [0, stat.targetValue]);
  const barWidth = useTransform(progress, [0, 1], ["0%", stat.targetPercent + "%"]);
  const [display, setDisplay] = useState(stat.format(0));

  useEffect(() => {
    const timer = setTimeout(() => {
      animate(progress, 1, { duration: ${p.duration}, ease: "${p.easing}" });
    }, index * ${p.stagger} * 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => displayValue.on("change", (v) => setDisplay(stat.format(v))), [displayValue]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * ${p.stagger}, ease: "easeOut" }}
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 8 }}
    >
      <div style={{ fontSize: 22, fontWeight: 700 }}>{display}</div>
      <div style={{ fontSize: 11, opacity: 0.5 }}>{stat.label}</div>
      <div style={{ height: 3, background: "rgba(255,255,255,0.1)", borderRadius: 2, overflow: "hidden", marginTop: 8 }}>
        <motion.div style={{ height: "100%", width: barWidth, background: "${p.color}", borderRadius: 2 }} />
      </div>
    </motion.div>
  );
}

export function StatCards() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: 380 }}>
      {STATS.map((stat, i) => <StatCard key={stat.label} stat={stat} index={i} />)}
    </div>
  );
}`,
  },
};

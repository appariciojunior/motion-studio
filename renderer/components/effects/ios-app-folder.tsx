import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Grid2X2 } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "duration", type: "slider", label: "Duration", min: 0.3, max: 0.8, step: 0.05, default: 0.4, unit: "s" },
  { id: "scale", type: "slider", label: "Scatter scale", min: 0.5, max: 0.95, step: 0.05, default: 0.85 },
  { id: "blur", type: "slider", label: "Folder blur", min: 8, max: 24, step: 2, default: 16, unit: "px" },
  { id: "color", type: "color", label: "Folder bg", default: "#1c1c1e" },
] as const;

const APPS = [
  { emoji: "🎵", color: "#FF2D55" },
  { emoji: "📷", color: "#007AFF" },
  { emoji: "📧", color: "#34C759" },
  { emoji: "🗓️", color: "#FF9500" },
  { emoji: "🗺️", color: "#5AC8FA" },
  { emoji: "📱", color: "#AF52DE" },
  { emoji: "🎮", color: "#FF3B30" },
  { emoji: "🌤️", color: "#30B0C7" },
];

function FolderIcon() {
  return (
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: 14,
        background: "rgba(120,120,128,0.35)",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 3,
        padding: 8,
        boxSizing: "border-box",
      }}
    >
      {APPS.slice(0, 4).map((app, i) => (
        <div
          key={i}
          style={{
            borderRadius: 4,
            background: app.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
          }}
        >
          {app.emoji}
        </div>
      ))}
    </div>
  );
}

function AppIcon({ app, size = 56 }: { app: { emoji: string; color: string }; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.25,
        background: app.color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.45,
        flexShrink: 0,
      }}
    >
      {app.emoji}
    </div>
  );
}

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const duration = Number(params.duration);
  const scatterScale = Number(params.scale);
  const blur = Number(params.blur);
  const folderBg = String(params.color);

  useEffect(() => {
    setIsOpen(false);
    const t1 = setTimeout(() => setIsOpen(true), 400);
    const t2 = setTimeout(() => setIsOpen(false), 2200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [replayToken]);

  // 3x3 grid: indices 0-8, index 4 is the folder (center)
  const gridItems: Array<{ type: "app"; appIndex: number } | { type: "folder" }> = [
    { type: "app", appIndex: 0 },
    { type: "app", appIndex: 1 },
    { type: "app", appIndex: 2 },
    { type: "app", appIndex: 3 },
    { type: "folder" },
    { type: "app", appIndex: 4 },
    { type: "app", appIndex: 5 },
    { type: "app", appIndex: 6 },
    { type: "app", appIndex: 7 },
  ];

  return (
    <div
      style={{
        position: "relative",
        width: 220,
        height: 220,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* 3x3 grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 56px)",
          gridTemplateRows: "repeat(3, 56px)",
          gap: 12,
        }}
      >
        {gridItems.map((item, i) => {
          if (item.type === "folder") {
            return (
              <motion.div
                key="folder"
                layoutId="folder-panel"
                onClick={() => setIsOpen((v) => !v)}
                style={{
                  cursor: "pointer",
                  borderRadius: 14,
                  overflow: "hidden",
                  position: "relative",
                }}
                whileTap={{ scale: 0.92 }}
              >
                <FolderIcon />
              </motion.div>
            );
          }
          return (
            <motion.div
              key={i}
              animate={
                isOpen
                  ? { scale: scatterScale, opacity: 0.3 }
                  : { scale: 1, opacity: 1 }
              }
              transition={{ duration, type: "spring", bounce: 0.25 }}
            >
              <AppIcon app={APPS[item.appIndex]} />
            </motion.div>
          );
        })}
      </div>

      {/* Expanded folder panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            layoutId="folder-panel"
            onClick={() => setIsOpen(false)}
            initial={{ borderRadius: 14 }}
            animate={{ borderRadius: 22 }}
            exit={{ borderRadius: 14 }}
            transition={{ duration, type: "spring", bounce: 0.3 }}
            style={{
              position: "absolute",
              inset: -16,
              background: `${folderBg}cc`,
              backdropFilter: `blur(${blur}px)`,
              WebkitBackdropFilter: `blur(${blur}px)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              cursor: "pointer",
              zIndex: 10,
            }}
          >
            {/* Sub-grid of apps */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: duration * 0.7, delay: duration * 0.2 }}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 36px)",
                gridTemplateRows: "repeat(3, 36px)",
                gap: 8,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {APPS.map((app, i) => (
                <AppIcon key={i} app={app} size={36} />
              ))}
              {/* Empty 9th slot */}
              <div style={{ width: 36, height: 36 }} />
            </motion.div>

            {/* Label */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: duration * 0.6, delay: duration * 0.3 }}
              style={{
                color: "#fff",
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: 0.2,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
              }}
            >
              My Apps
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const iosAppFolderEffect: Effect = {
  id: "ios-app-folder",
  name: "iOS App Folder",
  description: "Tap an app grid to open a folder like iOS springboard",
  category: "Micro-interactions",
  icon: <Grid2X2 size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const APPS = [
  { emoji: "🎵", color: "#FF2D55" },
  { emoji: "📷", color: "#007AFF" },
  { emoji: "📧", color: "#34C759" },
  { emoji: "🗓️", color: "#FF9500" },
  { emoji: "🗺️", color: "#5AC8FA" },
  { emoji: "📱", color: "#AF52DE" },
  { emoji: "🎮", color: "#FF3B30" },
  { emoji: "🌤️", color: "#30B0C7" },
];

function AppIcon({ app, size = 56 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.25, background: app.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.45 }}>
      {app.emoji}
    </div>
  );
}

function FolderIcon() {
  return (
    <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(120,120,128,0.35)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, padding: 8, boxSizing: "border-box" }}>
      {APPS.slice(0, 4).map((app, i) => (
        <div key={i} style={{ borderRadius: 4, background: app.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>{app.emoji}</div>
      ))}
    </div>
  );
}

export function IosAppFolder() {
  const [isOpen, setIsOpen] = useState(false);
  const duration = ${n(p.duration)};
  const scatterScale = ${n(p.scale)};
  const blur = ${n(p.blur)};
  const folderBg = "${p.color}";

  const gridItems = [
    { type: "app", appIndex: 0 }, { type: "app", appIndex: 1 }, { type: "app", appIndex: 2 },
    { type: "app", appIndex: 3 }, { type: "folder" }, { type: "app", appIndex: 4 },
    { type: "app", appIndex: 5 }, { type: "app", appIndex: 6 }, { type: "app", appIndex: 7 },
  ];

  return (
    <div style={{ position: "relative", width: 220, height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 56px)", gridTemplateRows: "repeat(3, 56px)", gap: 12 }}>
        {gridItems.map((item, i) => {
          if (item.type === "folder") {
            return (
              <motion.div key="folder" layoutId="folder-panel" onClick={() => setIsOpen(v => !v)} style={{ cursor: "pointer", borderRadius: 14, overflow: "hidden" }} whileTap={{ scale: 0.92 }}>
                <FolderIcon />
              </motion.div>
            );
          }
          return (
            <motion.div key={i} animate={isOpen ? { scale: scatterScale, opacity: 0.3 } : { scale: 1, opacity: 1 }} transition={{ duration, type: "spring", bounce: 0.25 }}>
              <AppIcon app={APPS[item.appIndex]} />
            </motion.div>
          );
        })}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            layoutId="folder-panel"
            onClick={() => setIsOpen(false)}
            initial={{ borderRadius: 14 }}
            animate={{ borderRadius: 22 }}
            exit={{ borderRadius: 14 }}
            transition={{ duration, type: "spring", bounce: 0.3 }}
            style={{ position: "absolute", inset: -16, background: folderBg + "cc", backdropFilter: \`blur(\${blur}px)\`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, cursor: "pointer", zIndex: 10 }}
          >
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: duration * 0.7, delay: duration * 0.2 }} style={{ display: "grid", gridTemplateColumns: "repeat(3, 36px)", gridTemplateRows: "repeat(3, 36px)", gap: 8 }} onClick={e => e.stopPropagation()}>
              {APPS.map((app, i) => <AppIcon key={i} app={app} size={36} />)}
              <div style={{ width: 36, height: 36 }} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: duration * 0.6, delay: duration * 0.3 }} style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>
              My Apps
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}`,
  },
};

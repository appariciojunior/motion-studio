import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Command } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "stagger", type: "slider", label: "Item stagger", min: 0.02, max: 0.12, step: 0.01, default: 0.04, unit: "s" },
  { id: "blur", type: "slider", label: "Backdrop blur", min: 4, max: 20, step: 2, default: 12, unit: "px" },
  { id: "color", type: "color", label: "Accent color", default: "#6366f1" },
  { id: "maxItems", type: "slider", label: "Max results", min: 3, max: 8, step: 1, default: 5 },
] as const;

const ALL_COMMANDS = [
  { id: "new-file",      emoji: "📄", name: "New File",        shortcut: "⌘N" },
  { id: "settings",     emoji: "⚙️", name: "Open Settings",   shortcut: "⌘," },
  { id: "theme",        emoji: "🎨", name: "Toggle Theme",    shortcut: "⌘⇧T" },
  { id: "export",       emoji: "📦", name: "Export Code",     shortcut: "⌘E" },
  { id: "search",       emoji: "🔍", name: "Search Effects",  shortcut: "⌘K" },
  { id: "add-effect",   emoji: "✨", name: "Add Effect",      shortcut: "⌘⇧A" },
  { id: "replay",       emoji: "▶️", name: "Replay Preview",  shortcut: "Space" },
  { id: "docs",         emoji: "📚", name: "Documentation",   shortcut: "⌘?" },
];

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const stagger = Number(params.stagger);
  const blur = Number(params.blur);
  const color = String(params.color);
  const maxItems = Number(params.maxItems);

  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery("");
    const letters = "export".split("");
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    letters.forEach((_, i) => {
      timeouts.push(
        setTimeout(() => {
          setQuery("export".slice(0, i + 1));
        }, i * 150 + 300)
      );
    });
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => timeouts.forEach(clearTimeout);
  }, [replayToken]);

  const filtered = ALL_COMMANDS.filter((cmd) =>
    cmd.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, maxItems);

  return (
    <div
      className="flex items-start justify-center w-full"
      style={{ paddingTop: 24 }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: `blur(${blur}px)`,
          WebkitBackdropFilter: `blur(${blur}px)`,
        }}
      />

      {/* Palette modal */}
      <motion.div
        key={replayToken}
        initial={{ opacity: 0, scale: 0.96, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          position: "relative",
          width: 480,
          maxWidth: "calc(100% - 32px)",
          background: "rgba(20, 20, 28, 0.92)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        }}
      >
        {/* Search row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, opacity: 0.5 }}>
            <circle cx="7" cy="7" r="4.5" stroke="white" strokeWidth="1.5" />
            <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command…"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "rgba(255,255,255,0.9)",
              fontSize: 15,
              fontWeight: 400,
              fontFamily: "inherit",
            }}
          />
          <kbd
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.3)",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 5,
              padding: "2px 6px",
              fontFamily: "inherit",
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div style={{ padding: "6px 0 8px" }}>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.3)",
              padding: "4px 16px 6px",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontWeight: 600,
            }}
          >
            Commands
          </div>
          <AnimatePresence initial={false}>
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  color: "rgba(255,255,255,0.3)",
                  fontSize: 13,
                  textAlign: "center",
                  padding: "20px 16px",
                }}
              >
                No results for &ldquo;{query}&rdquo;
              </motion.div>
            ) : (
              filtered.map((cmd, i) => (
                <motion.div
                  key={cmd.id}
                  layout
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.18, delay: i * stagger, ease: "easeOut" }}
                  whileHover={{ background: "rgba(255,255,255,0.06)" }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 16px",
                    cursor: "pointer",
                    borderRadius: 8,
                    margin: "0 6px",
                  }}
                >
                  <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>{cmd.emoji}</span>
                  <span
                    style={{
                      flex: 1,
                      fontSize: 13,
                      color: "rgba(255,255,255,0.85)",
                      fontWeight: 450,
                    }}
                  >
                    {cmd.name}
                  </span>
                  <kbd
                    style={{
                      fontSize: 11,
                      color: color,
                      background: `${color}22`,
                      border: `1px solid ${color}44`,
                      borderRadius: 5,
                      padding: "2px 6px",
                      fontFamily: "inherit",
                      fontWeight: 600,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {cmd.shortcut}
                  </kbd>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export const commandPaletteEffect: Effect = {
  id: "command-palette",
  name: "Command Palette",
  description: "Spotlight-style command palette with animated results",
  category: "Overlays & dialogs",
  icon: <Command size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

const ALL_COMMANDS = [
  { id: "new-file",    emoji: "📄", name: "New File",       shortcut: "⌘N" },
  { id: "settings",   emoji: "⚙️", name: "Open Settings",  shortcut: "⌘," },
  { id: "theme",      emoji: "🎨", name: "Toggle Theme",   shortcut: "⌘⇧T" },
  { id: "export",     emoji: "📦", name: "Export Code",    shortcut: "⌘E" },
  { id: "search",     emoji: "🔍", name: "Search Effects", shortcut: "⌘K" },
  { id: "add-effect", emoji: "✨", name: "Add Effect",     shortcut: "⌘⇧A" },
  { id: "replay",     emoji: "▶️", name: "Replay Preview", shortcut: "Space" },
  { id: "docs",       emoji: "📚", name: "Documentation",  shortcut: "⌘?" },
];

export function CommandPalette({ maxItems = ${n(p.maxItems)} }: { maxItems?: number }) {
  const [query, setQuery] = useState("");
  const stagger = ${n(p.stagger)};
  const color = "${p.color}";

  const filtered = ALL_COMMANDS.filter((cmd) =>
    cmd.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, maxItems);

  return (
    <div style={{ position: "relative", width: 480, background: "rgba(20,20,28,0.92)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}>
      {/* Search */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <span style={{ opacity: 0.5, color: "white" }}>⌕</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a command…"
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "rgba(255,255,255,0.9)", fontSize: 15 }}
        />
      </div>

      {/* Results */}
      <div style={{ padding: "6px 0 8px" }}>
        <AnimatePresence initial={false}>
          {filtered.map((cmd, i) => (
            <motion.div
              key={cmd.id}
              layout
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.18, delay: i * stagger, ease: "easeOut" }}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", cursor: "pointer" }}
            >
              <span>{cmd.emoji}</span>
              <span style={{ flex: 1, fontSize: 13, color: "rgba(255,255,255,0.85)" }}>{cmd.name}</span>
              <kbd style={{ fontSize: 11, color: color, background: color + "22", border: \`1px solid \${color}44\`, borderRadius: 5, padding: "2px 6px" }}>
                {cmd.shortcut}
              </kbd>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}`,
  },
};

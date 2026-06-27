import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BellRing } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

const controls = [
  { id: "duration", type: "slider", label: "Animation speed", min: 0.3, max: 1, step: 0.05, default: 0.4, unit: "s" },
  { id: "maxVisible", type: "slider", label: "Max visible", min: 2, max: 6, step: 1, default: 4 },
  { id: "gap", type: "slider", label: "Gap", min: 4, max: 16, step: 2, default: 8, unit: "px" },
  { id: "color", type: "color", label: "Accent color", default: "#6366f1" },
] as const;

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#3b82f6", "#8b5cf6"];
const MESSAGES = [
  { title: "New message", body: "You have a new message from Alex." },
  { title: "Build succeeded", body: "Deploy to production completed." },
  { title: "Payment received", body: "$49.00 from Acme Corp." },
  { title: "New follower", body: "Jordan started following you." },
  { title: "Reminder", body: "Team standup starts in 5 minutes." },
  { title: "Update available", body: "Version 2.4.0 is ready to install." },
];

interface Notification {
  id: number;
  title: string;
  body: string;
  color: string;
}

let _counter = 0;

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const duration = Number(params.duration);
  const maxVisible = Number(params.maxVisible);
  const gap = Number(params.gap);
  const accentColor = String(params.color);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [msgIndex, setMsgIndex] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);

  useEffect(() => {
    setNotifications([]);
    setMsgIndex(0);
    setColorIndex(0);
    _counter = 0;

    const add = () => {
      setNotifications((prev) => {
        const id = ++_counter;
        const msg = MESSAGES[id % MESSAGES.length];
        const color = id === 1 ? accentColor : COLORS[(id - 1) % COLORS.length];
        const next = [...prev, { id, title: msg.title, body: msg.body, color }];
        return next.length > maxVisible ? next.slice(next.length - maxVisible) : next;
      });
    };

    add();
    const interval = setInterval(add, 2000);
    return () => clearInterval(interval);
  }, [replayToken, maxVisible, accentColor]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        width: "100%",
        maxWidth: 340,
        gap,
      }}
    >
      <AnimatePresence initial={false}>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            layout
            initial={{ opacity: 0, y: -24, x: 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ duration, ease: [0.23, 1, 0.32, 1] }}
            style={{
              width: "100%",
              background: "var(--card, #fff)",
              borderRadius: 10,
              boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
              borderLeft: `4px solid ${notif.color}`,
              padding: "10px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <span
              style={{
                fontWeight: 600,
                fontSize: 13,
                color: "var(--foreground, #111)",
                lineHeight: 1.3,
              }}
            >
              {notif.title}
            </span>
            <span
              style={{
                fontSize: 12,
                color: "var(--muted-foreground, #666)",
                lineHeight: 1.4,
              }}
            >
              {notif.body}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export const notificationStackEffect: Effect = {
  id: "notification-stack",
  name: "Notification Stack",
  description: "Toast notifications that stack and push each other down",
  category: "Overlays & dialogs",
  icon: <BellRing size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#3b82f6", "#8b5cf6"];
const MESSAGES = [
  { title: "New message", body: "You have a new message from Alex." },
  { title: "Build succeeded", body: "Deploy to production completed." },
  { title: "Payment received", body: "$49.00 from Acme Corp." },
  { title: "New follower", body: "Jordan started following you." },
  { title: "Reminder", body: "Team standup starts in 5 minutes." },
  { title: "Update available", body: "Version 2.4.0 is ready to install." },
];

let _id = 0;

export function NotificationStack() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const add = () => {
      setNotifications((prev) => {
        const id = ++_id;
        const msg = MESSAGES[id % MESSAGES.length];
        const color = COLORS[(id - 1) % COLORS.length];
        const next = [...prev, { id, title: msg.title, body: msg.body, color }];
        return next.length > ${n(p.maxVisible)} ? next.slice(next.length - ${n(p.maxVisible)}) : next;
      });
    };

    add();
    const interval = setInterval(add, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", width: "100%", maxWidth: 340, gap: ${n(p.gap)} }}>
      <AnimatePresence initial={false}>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            layout
            initial={{ opacity: 0, y: -24, x: 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ duration: ${n(p.duration)}, ease: "easeOut" }}
            style={{
              width: "100%",
              background: "#fff",
              borderRadius: 10,
              boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
              borderLeft: \`4px solid \${notif.color}\`,
              padding: "10px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <span style={{ fontWeight: 600, fontSize: 13, color: "#111", lineHeight: 1.3 }}>{notif.title}</span>
            <span style={{ fontSize: 12, color: "#666", lineHeight: 1.4 }}>{notif.body}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}`,
  },
};

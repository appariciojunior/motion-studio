import { useState } from "react";
import { motion } from "motion/react";
import { LayoutGrid } from "lucide-react";
import { type Effect, type EffectParams, n } from "./types";

// Segmented tabs where the active pill glides to the clicked tab via motion's
// shared layout (layoutId). The label sits above the pill with z-index so the
// pill animates behind it.
const TABS = ["Home", "Projects", "Tasks", "Settings"];

const controls = [
  { id: "stiffness", type: "slider", label: "Spring stiffness", min: 200, max: 600, step: 10, default: 380 },
  { id: "damping", type: "slider", label: "Spring damping", min: 20, max: 40, step: 1, default: 30 },
] as const;

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const stiffness = Number(params.stiffness);
  const damping = Number(params.damping);
  const [active, setActive] = useState(0);

  return (
    <div key={replayToken} className="flex items-center justify-center" style={{ width: 360, height: 200 }}>
      <div className="flex gap-1 rounded-pill bg-control p-1">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActive(i)}
            className="relative rounded-pill px-4 py-2 text-small font-medium outline-none"
          >
            {active === i && (
              <motion.div
                layoutId="tab-pill"
                className="absolute inset-0 rounded-pill bg-accent shadow-sm"
                transition={{ type: "spring", stiffness, damping }}
              />
            )}
            <span
              className={`relative z-10 transition-colors ${
                active === i ? "text-white" : "text-secondary"
              }`}
            >
              {tab}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export const smoothTabsEffect: Effect = {
  id: "smooth-tabs",
  name: "Smooth Tabs",
  description: "Active pill glides between tabs via shared layout.",
  category: "Micro-interactions",
  icon: <LayoutGrid size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import { useState } from "react";
import { motion } from "motion/react";

const TABS = ["Home", "Projects", "Tasks", "Settings"];

export function SmoothTabs() {
  const [active, setActive] = useState(0);
  return (
    <div className="flex gap-1 rounded-full bg-zinc-100 p-1">
      {TABS.map((tab, i) => (
        <button
          key={tab}
          onClick={() => setActive(i)}
          className="relative rounded-full px-4 py-2 text-sm font-medium"
        >
          {active === i && (
            <motion.div
              layoutId="tab-pill"
              className="absolute inset-0 rounded-full bg-indigo-500 shadow-sm"
              transition={{ type: "spring", stiffness: ${n(p.stiffness)}, damping: ${n(p.damping)} }}
            />
          )}
          <span className={\`relative z-10 \${active === i ? "text-white" : "text-zinc-500"}\`}>
            {tab}
          </span>
        </button>
      ))}
    </div>
  );
}`,
  },
};

import { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles } from "lucide-react";
import { type Effect, type EffectParams } from "./types";

const GRAVITY = 200; // px/s²

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  birth: number;
}

let nextId = 0;

function spawnBurst(
  x: number,
  y: number,
  count: number,
  speed: number,
  now: number
): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const magnitude = speed * (0.5 + Math.random() * 0.5);
    particles.push({
      id: nextId++,
      x,
      y,
      vx: Math.cos(angle) * magnitude,
      vy: Math.sin(angle) * magnitude,
      birth: now,
    });
  }
  return particles;
}

function Preview({ params, replayToken }: { params: EffectParams; replayToken: number }) {
  const count = Number(params.count);
  const speed = Number(params.speed);
  const lifetime = Number(params.lifetime);
  const size = Number(params.size);
  const color = String(params.color);

  const [particles, setParticles] = useState<Particle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const lastTime = useRef<number>(0);
  const lastMoveEmit = useRef<number>(0);

  // rAF loop
  useEffect(() => {
    const loop = (ts: number) => {
      const dt = lastTime.current ? (ts - lastTime.current) / 1000 : 0;
      lastTime.current = ts;
      setParticles((prev) => {
        if (prev.length === 0) return prev;
        const now = ts;
        return prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx * dt,
            y: p.y + p.vy * dt + 0.5 * GRAVITY * dt * dt,
            vy: p.vy + GRAVITY * dt,
          }))
          .filter((p) => (now - p.birth) / 1000 < lifetime);
      });
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [lifetime]);

  // Replay: clear and emit burst at center
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const now = performance.now();
    setParticles(spawnBurst(cx, cy, count, speed, now));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replayToken]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const now = performance.now();
      if (now - lastMoveEmit.current < 40) return; // throttle to ~25/s
      lastMoveEmit.current = now;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setParticles((prev) => [
        ...prev,
        ...spawnBurst(x, y, Math.max(1, Math.floor(count / 4)), speed, now),
      ]);
    },
    [count, speed]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const now = performance.now();
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setParticles((prev) => [...prev, ...spawnBurst(x, y, count, speed, now)]);
    },
    [count, speed]
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden cursor-crosshair"
      style={{ background: "#0f0f13", minHeight: 200 }}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
    >
      {/* hint */}
      {particles.length === 0 && (
        <div
          className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
          style={{ color: "#ffffff33", fontSize: 13 }}
        >
          Click or move to emit particles
        </div>
      )}

      {particles.map((p) => {
        const age = (performance.now() - p.birth) / 1000;
        const opacity = Math.max(0, 1 - age / lifetime);
        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: p.x - size / 2,
              top: p.y - size / 2,
              width: size,
              height: size,
              borderRadius: "50%",
              background: color,
              opacity,
              pointerEvents: "none",
              willChange: "transform, opacity",
            }}
          />
        );
      })}
    </div>
  );
}

const controls = [
  { id: "count", type: "slider", label: "Burst count", min: 5, max: 30, step: 1, default: 12 },
  { id: "speed", type: "slider", label: "Launch speed", min: 50, max: 300, step: 10, default: 150, unit: "px/s" },
  { id: "lifetime", type: "slider", label: "Lifetime", min: 0.4, max: 2, step: 0.1, default: 0.8, unit: "s" },
  { id: "size", type: "slider", label: "Particle size", min: 4, max: 20, step: 2, default: 8, unit: "px" },
  { id: "color", type: "color", label: "Color", default: "#f59e0b" },
] as const;

export const particleEmitterEffect: Effect = {
  id: "particle-emitter",
  name: "Particle Emitter",
  description: "Click or move to emit animated particles that float away",
  category: "Experimental",
  icon: <Sparkles size={16} />,
  controls: controls as unknown as Effect["controls"],
  Preview,
  exports: {
    react: (p) => `import { useState, useEffect, useRef, useCallback } from "react";

const GRAVITY = 200;
let nextId = 0;

function spawnBurst(x, y, count, speed, now) {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const mag = speed * (0.5 + Math.random() * 0.5);
    return { id: nextId++, x, y, vx: Math.cos(angle) * mag, vy: Math.sin(angle) * mag, birth: now };
  });
}

export function ParticleEmitter() {
  const [particles, setParticles] = useState([]);
  const rafRef = useRef(0);
  const lastTime = useRef(0);
  const count = ${p.count};
  const speed = ${p.speed};
  const lifetime = ${p.lifetime};
  const size = ${p.size};
  const color = "${p.color}";

  useEffect(() => {
    const loop = (ts) => {
      const dt = lastTime.current ? (ts - lastTime.current) / 1000 : 0;
      lastTime.current = ts;
      setParticles((prev) =>
        prev
          .map((p) => ({ ...p, x: p.x + p.vx * dt, y: p.y + p.vy * dt + 0.5 * GRAVITY * dt * dt, vy: p.vy + GRAVITY * dt }))
          .filter((p) => (ts - p.birth) / 1000 < lifetime)
      );
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [lifetime]);

  const emit = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setParticles((prev) => [...prev, ...spawnBurst(e.clientX - rect.left, e.clientY - rect.top, count, speed, performance.now())]);
  }, [count, speed]);

  return (
    <div style={{ position: "relative", width: "100%", height: 300, background: "#0f0f13", cursor: "crosshair", overflow: "hidden" }} onClick={emit} onPointerMove={emit}>
      {particles.map((p) => {
        const opacity = Math.max(0, 1 - (performance.now() - p.birth) / 1000 / lifetime);
        return <div key={p.id} style={{ position: "absolute", left: p.x - size / 2, top: p.y - size / 2, width: size, height: size, borderRadius: "50%", background: color, opacity, pointerEvents: "none" }} />;
      })}
    </div>
  );
}`,
  },
};

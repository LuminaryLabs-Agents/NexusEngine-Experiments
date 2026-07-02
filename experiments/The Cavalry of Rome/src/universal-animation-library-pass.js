const UNIVERSAL_ANIMATION_STYLE = "cavalry-universal-animation-library-013";
const now = () => performance.now();
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));
const easings = Object.freeze({
  linear: (t) => t,
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  settle: (t) => 1 - Math.pow(1 - t, 2) * Math.cos(t * Math.PI * 0.5)
});

const active = new Map();
const completed = new Map();

function play(name, payload = {}) {
  const startedAt = now();
  const duration = Math.max(1, Number(payload.duration ?? 360));
  const easing = typeof payload.easing === "function" ? payload.easing : (easings[payload.easing] ?? easings.easeOutCubic);
  const entry = {
    ...payload,
    name,
    startedAt,
    duration,
    easing,
    done: false,
    progress: 0,
    eased: 0,
    promise: null,
    resolve: null
  };
  entry.promise = new Promise((resolve) => { entry.resolve = resolve; });
  active.set(name, entry);
  return entry.promise;
}

function stop(name, reason = "cancelled") {
  const entry = active.get(name);
  if (!entry) return false;
  active.delete(name);
  entry.done = true;
  entry.cancelled = true;
  entry.reason = reason;
  completed.set(name, { ...entry, completedAt: now() });
  entry.resolve?.(entry);
  return true;
}

function sample(name) {
  const entry = active.get(name);
  if (!entry) return null;
  const t = clamp((now() - entry.startedAt) / entry.duration, 0, 1);
  entry.progress = t;
  entry.eased = clamp(entry.easing(t), 0, 1.35);
  if (t >= 1) {
    active.delete(name);
    entry.done = true;
    entry.completedAt = now();
    completed.set(name, { ...entry });
    entry.resolve?.(entry);
  }
  return entry;
}

function value(name, fallback = 0) {
  const entry = sample(name);
  return entry ? entry.eased : fallback;
}

function isActive(name) {
  return active.has(name);
}

function clear(prefix = "") {
  for (const key of [...active.keys()]) {
    if (!prefix || key.startsWith(prefix)) stop(key, "clear");
  }
}

function getState() {
  return {
    style: UNIVERSAL_ANIMATION_STYLE,
    active: [...active.keys()],
    completed: [...completed.keys()].slice(-20)
  };
}

const api = {
  style: UNIVERSAL_ANIMATION_STYLE,
  easings,
  play,
  stop,
  sample,
  value,
  isActive,
  clear,
  getState
};

globalThis.CavalryUniversalAnimations = globalThis.CavalryUniversalAnimations ?? api;
globalThis.UniversalAnimations = globalThis.UniversalAnimations ?? globalThis.CavalryUniversalAnimations;

window.addEventListener("cavalry:animation", (event) => {
  const detail = event.detail ?? {};
  if (!detail.name) return;
  play(detail.name, detail);
});

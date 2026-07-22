function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

const counterweightCathedralApplicationDomainKit = deepFreeze({
  schema: "nexusengine.application-domain-kit/1",
  id: "counterweight-cathedral-application-domain-kit",
  version: 1,
  layer: "application-domain-kit",
  source: {
    experimentId: "SAT-005",
    route: "experiments/counterweight-cathedral/",
    sourceLayer: "validated-playable",
  },
  fantasy: "Tune a suspended cathedral mobile until three weighted bowls sing in exact balance.",
  heroVerb: "shift and settle a physical counterweight",
  pressureLoop: "Every settled stone commits its mass; any overloaded bowl fractures the frame.",
  playerLoop: [
    "select a stone",
    "shift it along the rail",
    "settle it into a bowl",
    "read aggregate weight",
    "recover by restarting after overload or complete exact balance",
  ],
  controls: [
    { id: "select-previous", keys: ["Q"], role: "hero" },
    { id: "select-next", keys: ["E"], role: "hero" },
    { id: "shift-left", keys: ["1"], role: "hero" },
    { id: "shift-right", keys: ["2"], role: "hero" },
    { id: "settle", keys: ["3"], role: "hero" },
    { id: "restart", keys: ["R"], role: "recovery" },
  ],
  baselines: {
    core: "a5882b47bd5a9284550bb3af1f0cd8580c62665e",
    protokits: "5986b69b047d622ea2efe58d12876033f3de2291",
  },
  dependencies: {
    core: ["engine lifecycle", "fixed deterministic tick", "domain installation"],
    engineDomains: [
      {
        id: "physics-body-lite",
        service: "physicsBodyLite",
        owns: ["body position", "mass", "impulse", "velocity", "friction"],
      },
      {
        id: "weighted-trigger",
        service: "weightedTrigger",
        owns: ["trigger bounds", "weight sources", "aggregate weight", "activation"],
      },
    ],
  },
  simulation: {
    gravity: { x: 0, y: 0, z: 0 },
    defaultFriction: 1,
    bodySize: { w: 0.18, h: 0.18, d: 0.18 },
    rackX: -1,
    rail: { minX: -1, maxX: 2, step: 1, impulsePerMass: 60 },
    trigger: { tolerance: 0.25, depth: 2, height: 2, sourceTags: ["cathedral-stone"] },
  },
  scene: {
    stones: [
      { id: "stone-two", name: "Two", weight: 2, tone: "#7ee8ef", y: -0.5 },
      { id: "stone-three", name: "Three", weight: 3, tone: "#ffd787", y: 0 },
      { id: "stone-one", name: "One", weight: 1, tone: "#ff8eb8", y: 0.5 },
    ],
    bowls: [
      { id: "dawn-bowl", name: "Dawn", required: 2, index: 0 },
      { id: "zenith-bowl", name: "Zenith", required: 3, index: 1 },
      { id: "vesper-bowl", name: "Vesper", required: 1, index: 2 },
    ],
  },
  outcomes: {
    won: {
      eyebrow: "Three bowls aligned",
      title: "Cathedral Chord",
      copy: "Dawn 2, Zenith 3, and Vesper 1 entered exact balance. The cathedral chord answered.",
    },
    lost: {
      eyebrow: "Mobile overloaded",
      title: "Frame Fractured",
    },
  },
  presentation: {
    targetGuide: {
      label: "target",
      idleLineDash: [6, 8],
      idleLineWidth: 3,
    },
  },
  qualityBudget: {
    minimumFeelScore: 7,
    targetAverageFeelScore: 8,
    requiredProof: ["overload loss", "exact-balance success", "restart", "deterministic replay"],
  },
  performanceBudget: {
    targetFps: 60,
    maximumAverageFrameMs: 20,
    maximumP95FrameMs: 30,
    maximumDomNodes: 85,
    maximumCanvases: 1,
    maximumLongTasks: 0,
    maximumRegressionPercent: 10,
  },
  ownership: {
    local: [
      "fantasy and authored scene",
      "selection and rail controls",
      "settle bridge",
      "exact arrangement and outcome policy",
      "browser input, Canvas, DOM, and diagnostics",
    ],
    reusable: ["physics-body-lite", "weighted-trigger"],
    rejectedDomains: ["counterweight-puzzle-domain", "balance-mobile-domain"],
  },
});

export function createCounterweightCathedralApplicationDomainKit() {
  return counterweightCathedralApplicationDomainKit;
}

export { counterweightCathedralApplicationDomainKit };

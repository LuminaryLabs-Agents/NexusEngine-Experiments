const DOMAIN_TREE = `living-agent-canal-bucket-brigade-readiness-domain
├─ water-source-domain
│  ├─ canal-cistern-domain
│  │  └─ living-agent-canal-cistern-intake-kit
│  └─ pump-wheel-domain
│     └─ living-agent-pump-wheel-primer-kit
├─ brigade-routing-domain
│  ├─ bucket-chain-domain
│  │  ├─ handoff-spacing-domain
│  │  │  └─ living-agent-bucket-chain-handoff-kit
│  └─ wet-burlap-screen-domain
│     └─ living-agent-wet-burlap-screen-kit
├─ civilian-safety-domain
│  ├─ child-muster-ribbon-domain
│  │  └─ living-agent-child-muster-ribbon-kit
│  └─ dawn-brigade-ledger-domain
│     └─ living-agent-dawn-brigade-ledger-kit
└─ renderer-handoff
   └─ living-agent-canal-bucket-brigade-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

const OWNERSHIP_BOUNDARY = Object.freeze([
  "no-renderer",
  "no-dom",
  "no-browser-input",
  "no-threejs",
  "no-webgl",
  "no-audio",
  "no-asset-loading",
  "no-frame-loop",
  "no-agent-policy-ownership",
  "no-physics-ownership",
  "no-storage",
  "no-network"
]);

const ATOMIC_KITS = Object.freeze([
  "living-agent-canal-cistern-intake-kit",
  "living-agent-pump-wheel-primer-kit",
  "living-agent-bucket-chain-handoff-kit",
  "living-agent-wet-burlap-screen-kit",
  "living-agent-child-muster-ribbon-kit",
  "living-agent-dawn-brigade-ledger-kit",
  "living-agent-canal-bucket-brigade-renderer-handoff-kit"
]);

function clamp(value, min = 0, max = 1) {
  const number = Number.isFinite(Number(value)) ? Number(value) : 0;
  return Math.max(min, Math.min(max, number));
}

function round(value, places = 3) {
  const scale = 10 ** places;
  return Math.round((Number(value) || 0) * scale) / scale;
}

function stateValue(state = {}, key, fallback = 0) {
  return Number.isFinite(Number(state[key])) ? Number(state[key]) : fallback;
}

function progressFromState(state = {}) {
  const inspected = clamp(stateValue(state, "inspectedLanterns") / 4);
  const cleared = clamp(stateValue(state, "clearedAisles") / 3);
  const relays = clamp(stateValue(state, "bucketRelays") / 3);
  const firebreaks = clamp(stateValue(state, "firebreaksPlaced") / 4);
  const mustered = clamp(stateValue(state, "musteredMerchants") / 5);
  return { inspected, cleared, relays, firebreaks, mustered };
}

function seedNoise(seed = 41, index = 0) {
  const value = Math.sin((Number(seed) || 1) * 12.9898 + index * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

export function createCanalCisternIntakeKit() {
  return Object.freeze({
    id: "living-agent-canal-cistern-intake-kit",
    domain: "living-agent-canal-bucket-brigade/water-source/canal-cistern",
    describe(state = {}) {
      const progress = progressFromState(state);
      return Array.from({ length: 3 }, (_, index) => {
        const flow = clamp(0.25 + progress.cleared * 0.3 + progress.relays * 0.3 - index * 0.06);
        return {
          id: `canal-cistern-${index + 1}`,
          kind: "canal-cistern-intake",
          x: round(82 + index * 72),
          y: round(516 + seedNoise(state.seed, index) * 28),
          flow,
          siltRisk: round(clamp(0.72 - progress.cleared * 0.32 - progress.inspected * 0.18 + index * 0.05)),
          status: flow > 0.72 ? "strong" : flow > 0.42 ? "usable" : "choked"
        };
      });
    }
  });
}

export function createPumpWheelPrimerKit() {
  return Object.freeze({
    id: "living-agent-pump-wheel-primer-kit",
    domain: "living-agent-canal-bucket-brigade/water-source/pump-wheel",
    describe(state = {}) {
      const progress = progressFromState(state);
      return Array.from({ length: 2 }, (_, index) => {
        const spin = clamp(0.18 + progress.relays * 0.48 + progress.firebreaks * 0.22 - index * 0.08);
        return {
          id: `pump-wheel-${index + 1}`,
          kind: "pump-wheel-primer",
          x: round(214 + index * 148),
          y: round(472 - index * 34),
          spin,
          primed: spin > 0.55,
          crewNeeded: Math.max(0, 3 - stateValue(state, "bucketRelays") - index)
        };
      });
    }
  });
}

export function createBucketChainHandoffKit() {
  return Object.freeze({
    id: "living-agent-bucket-chain-handoff-kit",
    domain: "living-agent-canal-bucket-brigade/brigade-routing/bucket-chain-handoff",
    describe(state = {}) {
      const progress = progressFromState(state);
      return Array.from({ length: 6 }, (_, index) => {
        const active = index < stateValue(state, "bucketRelays") * 2;
        return {
          id: `bucket-chain-handoff-${index + 1}`,
          kind: "bucket-chain-handoff",
          x: round(150 + index * 92),
          y: round(432 - Math.sin(index * 0.7) * 46),
          active,
          spacing: round(clamp(0.34 + progress.cleared * 0.26 - Math.abs(index - 2.5) * 0.035)),
          flow: round(active ? clamp(0.42 + progress.relays * 0.44 - index * 0.025) : 0.14)
        };
      });
    }
  });
}

export function createWetBurlapScreenKit() {
  return Object.freeze({
    id: "living-agent-wet-burlap-screen-kit",
    domain: "living-agent-canal-bucket-brigade/brigade-routing/wet-burlap-screen",
    describe(state = {}) {
      const progress = progressFromState(state);
      return Array.from({ length: 4 }, (_, index) => {
        const soaked = index < stateValue(state, "firebreaksPlaced");
        return {
          id: `wet-burlap-screen-${index + 1}`,
          kind: "wet-burlap-screen",
          x: round(394 + index * 76),
          y: round(220 + seedNoise(state.seed, index + 8) * 176),
          soaked,
          heatBlock: round(clamp((soaked ? 0.48 : 0.16) + progress.relays * 0.18 + progress.firebreaks * 0.28)),
          smokeLeak: round(clamp(0.82 - progress.firebreaks * 0.42 - progress.relays * 0.1 + index * 0.03))
        };
      });
    }
  });
}

export function createChildMusterRibbonKit() {
  return Object.freeze({
    id: "living-agent-child-muster-ribbon-kit",
    domain: "living-agent-canal-bucket-brigade/civilian-safety/child-muster-ribbon",
    describe(state = {}) {
      const progress = progressFromState(state);
      return Array.from({ length: 5 }, (_, index) => {
        const accounted = index < stateValue(state, "musteredMerchants");
        return {
          id: `child-muster-ribbon-${index + 1}`,
          kind: "child-muster-ribbon",
          x: round(690 + seedNoise(state.seed, index + 20) * 176),
          y: round(122 + index * 34),
          accounted,
          visibility: round(clamp((accounted ? 0.75 : 0.28) + progress.cleared * 0.18)),
          escortRisk: round(clamp(0.86 - progress.mustered * 0.48 - progress.cleared * 0.16 + index * 0.035))
        };
      });
    }
  });
}

export function createDawnBrigadeLedgerKit() {
  return Object.freeze({
    id: "living-agent-dawn-brigade-ledger-kit",
    domain: "living-agent-canal-bucket-brigade/civilian-safety/dawn-brigade-ledger",
    describe(state = {}, derived = {}) {
      const progress = progressFromState(state);
      const waterFlow = clamp(derived.waterFlow ?? 0);
      const screenCoverage = clamp(derived.screenCoverage ?? 0);
      const childSafety = clamp(derived.childSafety ?? progress.mustered);
      const readiness = clamp(waterFlow * 0.24 + progress.relays * 0.2 + screenCoverage * 0.2 + childSafety * 0.22 + progress.cleared * 0.14);
      const smokeRisk = clamp(0.92 - readiness * 0.68 - progress.inspected * 0.1);
      let missionState = "prime-canal";
      if (readiness > 0.86) missionState = "market-secured";
      else if (childSafety > 0.72) missionState = "seal-firebreaks";
      else if (screenCoverage > 0.5) missionState = "muster-children";
      else if (waterFlow > 0.5) missionState = "pass-buckets";
      return {
        id: "dawn-canal-bucket-brigade-ledger",
        kind: "dawn-brigade-ledger",
        readiness: round(readiness),
        smokeRisk: round(smokeRisk),
        waterFlow: round(waterFlow),
        screenCoverage: round(screenCoverage),
        childSafety: round(childSafety),
        missionState,
        nextInstruction: missionState === "market-secured" ? "Hold the canal line until dawn" : missionState === "seal-firebreaks" ? "Soak the last burlap screens" : missionState === "muster-children" ? "Escort children to the east gate ribbons" : missionState === "pass-buckets" ? "Keep the bucket chain moving" : "Prime canal cistern intakes"
      };
    }
  });
}

function createRendererHandoff(readiness) {
  const descriptors = {
    canalCisternIntakes: readiness.canalCisternIntakes,
    pumpWheelPrimers: readiness.pumpWheelPrimers,
    bucketChainHandoffs: readiness.bucketChainHandoffs,
    wetBurlapScreens: readiness.wetBurlapScreens,
    childMusterRibbons: readiness.childMusterRibbons,
    dawnBrigadeLedgers: [readiness.dawnBrigadeLedger]
  };
  const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : 0]));
  counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  return {
    id: "living-agent-canal-bucket-brigade-renderer-handoff",
    kind: "renderer-handoff",
    policy: "renderer-consumes-descriptors-only",
    ownershipBoundary: [...OWNERSHIP_BOUNDARY],
    descriptors,
    counts
  };
}

export const LIVING_AGENT_CANAL_BUCKET_BRIGADE_DOMAIN_TREE = Object.freeze({
  root: "living-agent-canal-bucket-brigade-readiness-domain",
  tree: DOMAIN_TREE,
  contract: "renderer consumes descriptors only; no renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, frame-loop, agent policy, physics, storage, or network ownership"
});

export function createLivingAgentCanalBucketBrigadeReadinessDomainKit() {
  const canalCisternIntakeKit = createCanalCisternIntakeKit();
  const pumpWheelPrimerKit = createPumpWheelPrimerKit();
  const bucketChainHandoffKit = createBucketChainHandoffKit();
  const wetBurlapScreenKit = createWetBurlapScreenKit();
  const childMusterRibbonKit = createChildMusterRibbonKit();
  const dawnBrigadeLedgerKit = createDawnBrigadeLedgerKit();

  function describe(state = {}) {
    const canalCisternIntakes = canalCisternIntakeKit.describe(state);
    const pumpWheelPrimers = pumpWheelPrimerKit.describe(state);
    const bucketChainHandoffs = bucketChainHandoffKit.describe(state);
    const wetBurlapScreens = wetBurlapScreenKit.describe(state);
    const childMusterRibbons = childMusterRibbonKit.describe(state);
    const waterFlow = canalCisternIntakes.reduce((sum, item) => sum + item.flow, 0) / Math.max(1, canalCisternIntakes.length);
    const screenCoverage = wetBurlapScreens.reduce((sum, item) => sum + item.heatBlock, 0) / Math.max(1, wetBurlapScreens.length);
    const childSafety = childMusterRibbons.filter((item) => item.accounted).length / Math.max(1, childMusterRibbons.length);
    const dawnBrigadeLedger = dawnBrigadeLedgerKit.describe(state, { waterFlow, screenCoverage, childSafety });
    const readiness = {
      id: "living-agent-canal-bucket-brigade-readiness",
      kind: "canal-bucket-brigade-readiness",
      tree: DOMAIN_TREE,
      ownershipBoundary: [...OWNERSHIP_BOUNDARY],
      atomicKits: [...ATOMIC_KITS],
      canalCisternIntakes,
      pumpWheelPrimers,
      bucketChainHandoffs,
      wetBurlapScreens,
      childMusterRibbons,
      dawnBrigadeLedger,
      readiness: dawnBrigadeLedger.readiness,
      smokeRisk: dawnBrigadeLedger.smokeRisk,
      missionState: dawnBrigadeLedger.missionState
    };
    readiness.rendererHandoff = createRendererHandoff(readiness);
    return readiness;
  }

  return Object.freeze({
    id: "living-agent-canal-bucket-brigade-readiness-domain-kit",
    tree: DOMAIN_TREE,
    ownershipBoundary: [...OWNERSHIP_BOUNDARY],
    atomicKits: [...ATOMIC_KITS],
    kits: Object.freeze({ canalCisternIntakeKit, pumpWheelPrimerKit, bucketChainHandoffKit, wetBurlapScreenKit, childMusterRibbonKit, dawnBrigadeLedgerKit }),
    describe,
    snapshot: describe
  });
}

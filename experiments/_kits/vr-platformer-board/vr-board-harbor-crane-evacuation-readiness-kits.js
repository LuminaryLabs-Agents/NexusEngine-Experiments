const DOMAIN_TREE = `vr-board-harbor-crane-evacuation-readiness-domain
├─ crane-rigging-domain
│  ├─ gantry-rail-domain
│  │  └─ vr-board-gantry-rail-kit
│  └─ rescue-hook-domain
│     └─ vr-board-rescue-hook-sling-kit
├─ cargo-corridor-domain
│  ├─ crate-bridge-domain
│  │  └─ vr-board-floating-crate-bridge-kit
│  └─ tide-counterweight-domain
│     └─ vr-board-tide-counterweight-kit
├─ survivor-transfer-domain
│  ├─ triage-basket-domain
│  │  └─ vr-board-triage-basket-kit
│  └─ dawn-crane-ledger-domain
│     └─ vr-board-dawn-crane-ledger-kit
└─ renderer-handoff
   └─ vr-board-harbor-crane-evacuation-renderer-handoff-kit
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
  "no-physics-ownership",
  "no-storage",
  "no-network"
]);

const ATOMIC_KITS = Object.freeze([
  "vr-board-gantry-rail-kit",
  "vr-board-rescue-hook-sling-kit",
  "vr-board-floating-crate-bridge-kit",
  "vr-board-tide-counterweight-kit",
  "vr-board-triage-basket-kit",
  "vr-board-dawn-crane-ledger-kit",
  "vr-board-harbor-crane-evacuation-renderer-handoff-kit"
]);

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));
const round = (value, places = 3) => Math.round((Number(value) || 0) * 10 ** places) / 10 ** places;

function avatarCenter(avatar = {}) {
  return {
    x: Number(avatar?.position?.x ?? avatar?.x ?? 0) + Number(avatar?.size?.x ?? 0.5) * 0.5,
    y: Number(avatar?.position?.y ?? avatar?.y ?? 0) + Number(avatar?.size?.y ?? 0.8) * 0.5
  };
}

function defaultPlatforms(level = {}) {
  return Array.isArray(level.platforms) && level.platforms.length ? level.platforms : [
    { id: "storm-pier", x: -0.7, y: 1.08, w: 3.24, h: 0.28 },
    { id: "crane-footing", x: 3.05, y: 2, w: 1.82, h: 0.26 },
    { id: "flooded-dock", x: 5.78, y: 2.78, w: 2.2, h: 0.24 },
    { id: "cargo-net-cache", x: 8.82, y: 2.28, w: 1.92, h: 0.26 },
    { id: "skiff-berth", x: 11.72, y: 3.58, w: 2.42, h: 0.28 },
    { id: "launch-ramp", x: 14.65, y: 4.46, w: 1.72, h: 0.3 }
  ];
}

function defaultCollectibles(level = {}) {
  return Array.isArray(level.collectibles) && level.collectibles.length ? level.collectibles : [
    { id: "flare-storm-pier", x: 2.18, y: 2.07, value: 1 },
    { id: "dry-net-crane", x: 4.18, y: 2.92, value: 1 },
    { id: "flare-flooded-dock", x: 6.83, y: 3.62, value: 1 },
    { id: "blanket-cache", x: 9.64, y: 3.12, value: 1 },
    { id: "skiff-rope", x: 12.92, y: 4.46, value: 1 }
  ];
}

function collectedIds(objects = {}) {
  return Array.isArray(objects.collectedIds) ? objects.collectedIds : [];
}

function platformCenter(platform = {}) {
  return {
    x: Number(platform.x ?? 0) + Number(platform.w ?? 1) * 0.5,
    y: Number(platform.y ?? 0)
  };
}

export function createGantryRailKit() {
  return Object.freeze({
    id: "vr-board-gantry-rail-kit",
    domain: "vr-board-harbor-crane-evacuation/crane-rigging/gantry-rail",
    describe(input = {}) {
      const platforms = defaultPlatforms(input.level);
      const avatar = avatarCenter(input.avatar);
      return platforms.slice(0, 5).map((platform, index) => {
        const center = platformCenter(platform);
        const reach = clamp(1 - Math.abs(avatar.x - center.x) / 8, 0.12, 1);
        return {
          id: `gantry-rail-${platform.id ?? index}`,
          kind: "gantry-rail",
          x1: round(center.x - 0.62),
          y1: round(center.y + 1.18),
          x2: round(center.x + 0.62),
          y2: round(center.y + 1.18 + Math.sin(index) * 0.08),
          reach: round(reach),
          repairState: reach > 0.62 ? "reachable" : "distant",
          sequenceIndex: index
        };
      });
    }
  });
}

export function createRescueHookSlingKit() {
  return Object.freeze({
    id: "vr-board-rescue-hook-sling-kit",
    domain: "vr-board-harbor-crane-evacuation/crane-rigging/rescue-hook",
    describe(input = {}) {
      const avatar = avatarCenter(input.avatar);
      const tide = clamp(input.weather?.tideLevel ?? input.stormHarborReadiness?.tideRisk ?? 0.5);
      return Array.from({ length: 4 }, (_, index) => {
        const x = 2.6 + index * 3.35;
        const distance = Math.abs(avatar.x - x);
        const tension = clamp(0.74 - tide * 0.22 - distance * 0.035 + index * 0.03);
        return {
          id: `rescue-hook-sling-${index + 1}`,
          kind: "rescue-hook-sling",
          x: round(x),
          y: round(4.72 - tide * 0.24 + Math.sin(index + Number(input.time ?? 0)) * 0.06),
          dropY: round(2.22 + index * 0.34),
          tension: round(tension),
          status: tension > 0.66 ? "stable" : tension > 0.42 ? "swinging" : "danger"
        };
      });
    }
  });
}

export function createFloatingCrateBridgeKit() {
  return Object.freeze({
    id: "vr-board-floating-crate-bridge-kit",
    domain: "vr-board-harbor-crane-evacuation/cargo-corridor/crate-bridge",
    describe(input = {}) {
      const ids = new Set(collectedIds(input.objects));
      const collectibles = defaultCollectibles(input.level);
      return collectibles.slice(0, 5).map((item, index) => {
        const secured = ids.has(item.id) || ids.size > index;
        return {
          id: `floating-crate-bridge-${item.id ?? index}`,
          kind: "floating-crate-bridge",
          x: round(Number(item.x ?? index) + 0.2),
          y: round(Number(item.y ?? 2) - 0.34),
          buoyancy: round(clamp(0.38 + ids.size * 0.08 + (secured ? 0.18 : 0) - index * 0.025)),
          secured,
          laneStatus: secured ? "lashed" : index < 2 ? "reachable" : "adrift"
        };
      });
    }
  });
}

export function createTideCounterweightKit() {
  return Object.freeze({
    id: "vr-board-tide-counterweight-kit",
    domain: "vr-board-harbor-crane-evacuation/cargo-corridor/tide-counterweight",
    describe(input = {}) {
      const tide = clamp(input.weather?.tideLevel ?? 0.5);
      const wind = clamp(input.weather?.wind ?? 0.35);
      return [0, 1, 2, 3].map((index) => ({
        id: `tide-counterweight-${index + 1}`,
        kind: "tide-counterweight",
        x: round(3.1 + index * 3.15),
        y: round(4.24 - tide * 0.48 + index * 0.05),
        balance: round(clamp(0.64 - tide * 0.24 - wind * 0.12 + index * 0.06)),
        hazard: tide > 0.72 ? "surge" : wind > 0.62 ? "swing" : "steady"
      }));
    }
  });
}

export function createTriageBasketKit() {
  return Object.freeze({
    id: "vr-board-triage-basket-kit",
    domain: "vr-board-harbor-crane-evacuation/survivor-transfer/triage-basket",
    describe(input = {}) {
      const avatar = avatarCenter(input.avatar);
      return [0, 1, 2].map((index) => {
        const x = 5.4 + index * 3.78;
        const loaded = avatar.x > x - 0.45;
        return {
          id: `triage-basket-${index + 1}`,
          kind: "triage-basket",
          x: round(x),
          y: round(3.05 + index * 0.38),
          loaded,
          capacity: 2 + index,
          warmth: round(clamp(0.42 + index * 0.12 + (loaded ? 0.18 : 0)))
        };
      });
    }
  });
}

export function createDawnCraneLedgerKit() {
  return Object.freeze({
    id: "vr-board-dawn-crane-ledger-kit",
    domain: "vr-board-harbor-crane-evacuation/survivor-transfer/dawn-crane-ledger",
    describe(input = {}, derived = {}) {
      const avatar = avatarCenter(input.avatar);
      const exit = input.level?.exit ?? { x: 15.4, y: 4.62 };
      const progress = clamp((avatar.x - Number(input.level?.start?.x ?? 0)) / Math.max(1, Number(exit.x ?? 15) - Number(input.level?.start?.x ?? 0)));
      const collected = collectedIds(input.objects).length;
      const tideRisk = clamp(input.stormHarborReadiness?.tideRisk ?? input.weather?.tideLevel ?? 0.5);
      const railScore = clamp((derived.reachableRails ?? 0) / Math.max(1, derived.railCount ?? 1));
      const stableHooks = clamp((derived.stableHooks ?? 0) / Math.max(1, derived.hookCount ?? 1));
      const crateScore = clamp((derived.securedCrates ?? 0) / Math.max(1, derived.crateCount ?? 1));
      const readiness = clamp(progress * 0.24 + collected * 0.045 + railScore * 0.2 + stableHooks * 0.2 + crateScore * 0.18 + (1 - tideRisk) * 0.12);
      let missionState = "repair-gantry-rails";
      if (readiness > 0.84 && progress > 0.78) missionState = "swing-survivors-to-skiff";
      else if (crateScore > 0.56) missionState = "load-triage-baskets";
      else if (stableHooks > 0.5) missionState = "lash-floating-crate-bridge";
      else if (railScore > 0.45) missionState = "steady-rescue-hooks";
      return {
        id: "dawn-harbor-crane-ledger",
        kind: "dawn-crane-ledger",
        readiness: round(readiness),
        progress: round(progress),
        collected,
        tideRisk: round(tideRisk),
        railScore: round(railScore),
        stableHookScore: round(stableHooks),
        crateScore: round(crateScore),
        missionState,
        nextInstruction: missionState === "swing-survivors-to-skiff" ? "Swing survivors to the skiff" : missionState === "load-triage-baskets" ? "Load the triage baskets" : missionState === "lash-floating-crate-bridge" ? "Lash the floating crate bridge" : missionState === "steady-rescue-hooks" ? "Steady the rescue hooks" : "Repair the gantry rails"
      };
    }
  });
}

function createRendererHandoff(readiness) {
  const descriptors = {
    gantryRails: readiness.gantryRails,
    rescueHookSlings: readiness.rescueHookSlings,
    floatingCrateBridges: readiness.floatingCrateBridges,
    tideCounterweights: readiness.tideCounterweights,
    triageBaskets: readiness.triageBaskets,
    dawnCraneLedgers: [readiness.dawnCraneLedger]
  };
  const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : 0]));
  counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  return {
    id: "vr-board-harbor-crane-evacuation-renderer-handoff",
    kind: "renderer-handoff",
    policy: "renderer-consumes-descriptors-only",
    ownershipBoundary: [...OWNERSHIP_BOUNDARY],
    descriptors,
    counts
  };
}

export const VR_BOARD_HARBOR_CRANE_EVACUATION_DOMAIN_TREE = Object.freeze({
  root: "vr-board-harbor-crane-evacuation-readiness-domain",
  tree: DOMAIN_TREE,
  contract: "renderer consumes descriptors only; no DOM, browser input, Three.js, WebGL, audio, asset loading, network, storage, physics, or frame-loop ownership"
});

export function createVrBoardHarborCraneEvacuationReadinessDomainKit() {
  const gantryRailKit = createGantryRailKit();
  const rescueHookSlingKit = createRescueHookSlingKit();
  const floatingCrateBridgeKit = createFloatingCrateBridgeKit();
  const tideCounterweightKit = createTideCounterweightKit();
  const triageBasketKit = createTriageBasketKit();
  const dawnCraneLedgerKit = createDawnCraneLedgerKit();

  function describe(input = {}) {
    const gantryRails = gantryRailKit.describe(input);
    const rescueHookSlings = rescueHookSlingKit.describe(input);
    const floatingCrateBridges = floatingCrateBridgeKit.describe(input);
    const tideCounterweights = tideCounterweightKit.describe(input);
    const triageBaskets = triageBasketKit.describe(input);
    const dawnCraneLedger = dawnCraneLedgerKit.describe(input, {
      reachableRails: gantryRails.filter((rail) => rail.repairState === "reachable").length,
      railCount: gantryRails.length,
      stableHooks: rescueHookSlings.filter((hook) => hook.status === "stable").length,
      hookCount: rescueHookSlings.length,
      securedCrates: floatingCrateBridges.filter((crate) => crate.secured).length,
      crateCount: floatingCrateBridges.length
    });
    const readiness = {
      id: "vr-board-harbor-crane-evacuation-readiness",
      kind: "harbor-crane-evacuation-readiness",
      tree: DOMAIN_TREE,
      ownershipBoundary: [...OWNERSHIP_BOUNDARY],
      atomicKits: [...ATOMIC_KITS],
      gantryRails,
      rescueHookSlings,
      floatingCrateBridges,
      tideCounterweights,
      triageBaskets,
      dawnCraneLedger,
      evacuationReadiness: dawnCraneLedger.readiness,
      tideRisk: dawnCraneLedger.tideRisk,
      missionState: dawnCraneLedger.missionState
    };
    readiness.rendererHandoff = createRendererHandoff(readiness);
    return readiness;
  }

  return Object.freeze({
    id: "vr-board-harbor-crane-evacuation-readiness-domain-kit",
    kind: "domain-kit",
    tree: DOMAIN_TREE,
    ownershipBoundary: [...OWNERSHIP_BOUNDARY],
    atomicKits: [...ATOMIC_KITS],
    describe
  });
}

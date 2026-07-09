const DOMAIN_TREE = `vr-board-storm-harbor-evacuation-readiness-domain
├─ tide-warning-domain
│  ├─ harbor-tide-gauge-domain
│  │  └─ vr-board-harbor-tide-gauge-kit
│  └─ flare-buoy-domain
│     └─ vr-board-flare-buoy-marker-kit
├─ cargo-extraction-domain
│  ├─ crane-cable-domain
│  │  └─ vr-board-crane-cable-route-kit
│  └─ supply-net-domain
│     └─ vr-board-supply-net-cache-kit
├─ evacuation-handoff-domain
│  ├─ rescue-skiff-domain
│  │  ├─ skiff-berth-domain
│  │  │  └─ vr-board-rescue-skiff-berth-kit
│  └─ dawn-harbor-ledger-domain
│     └─ vr-board-dawn-harbor-ledger-kit
└─ renderer-handoff
   └─ vr-board-storm-harbor-renderer-handoff-kit
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
  "no-storage"
]);

const ATOMIC_KITS = Object.freeze([
  "vr-board-harbor-tide-gauge-kit",
  "vr-board-flare-buoy-marker-kit",
  "vr-board-crane-cable-route-kit",
  "vr-board-supply-net-cache-kit",
  "vr-board-rescue-skiff-berth-kit",
  "vr-board-dawn-harbor-ledger-kit",
  "vr-board-storm-harbor-renderer-handoff-kit"
]);

function clamp(value, min = 0, max = 1) {
  const number = Number.isFinite(Number(value)) ? Number(value) : 0;
  return Math.max(min, Math.min(max, number));
}

function round(value, places = 3) {
  const scale = 10 ** places;
  return Math.round((Number(value) || 0) * scale) / scale;
}

function avatarCenter(avatar = {}) {
  return {
    x: Number(avatar?.position?.x ?? avatar?.x ?? 0) + Number(avatar?.size?.x ?? 0.5) * 0.5,
    y: Number(avatar?.position?.y ?? avatar?.y ?? 0) + Number(avatar?.size?.y ?? 0.8) * 0.5
  };
}

function platformCenter(platform = {}) {
  return {
    x: Number(platform.x ?? 0) + Number(platform.w ?? 1) * 0.5,
    y: Number(platform.y ?? 0)
  };
}

function nearestDistance(point, list, mapper = (item) => item) {
  if (!Array.isArray(list) || list.length === 0) return 999;
  return Math.min(...list.map((item) => {
    const mapped = mapper(item);
    return Math.hypot(Number(point.x) - Number(mapped.x), Number(point.y) - Number(mapped.y));
  }));
}

function defaultPlatforms(level = {}) {
  return Array.isArray(level.platforms) && level.platforms.length ? level.platforms : [
    { id: "storm-pier", x: -0.6, y: 1.15, w: 3.2, h: 0.28 },
    { id: "cargo-crane", x: 3.0, y: 2.05, w: 1.75, h: 0.26 },
    { id: "flooded-gap", x: 5.85, y: 2.82, w: 2.18, h: 0.25 },
    { id: "net-cache", x: 8.95, y: 2.24, w: 1.85, h: 0.26 },
    { id: "skiff-berth", x: 12.1, y: 3.55, w: 2.35, h: 0.28 },
    { id: "harbor-exit", x: 15.0, y: 4.45, w: 1.62, h: 0.3 }
  ];
}

function defaultCollectibles(level = {}) {
  return Array.isArray(level.collectibles) && level.collectibles.length ? level.collectibles : [
    { id: "flare-low", x: 2.2, y: 2.1, value: 1 },
    { id: "flare-gap", x: 6.85, y: 3.65, value: 1 },
    { id: "net-cache", x: 9.7, y: 3.08, value: 1 },
    { id: "skiff-rope", x: 13.0, y: 4.42, value: 1 }
  ];
}

function defaultHazards(level = {}) {
  return Array.isArray(level.hazards) && level.hazards.length ? level.hazards : [
    { id: "surge-low-water", x: 4.75, y: 1.0, w: 0.92, h: 0.36 },
    { id: "swinging-hook", x: 7.42, y: 2.62, w: 0.74, h: 0.38 },
    { id: "broken-dock", x: 10.92, y: 1.05, w: 0.88, h: 0.36 }
  ];
}

function collectedIds(objects = {}) {
  return Array.isArray(objects.collectedIds) ? objects.collectedIds : [];
}

export function createHarborTideGaugeKit() {
  return Object.freeze({
    id: "vr-board-harbor-tide-gauge-kit",
    describe(input = {}) {
      const platforms = defaultPlatforms(input.level);
      const weather = input.weather ?? {};
      const tideLevel = clamp(weather.tideLevel ?? weather.surge ?? (0.34 + (defaultHazards(input.level).length * 0.07)), 0, 1);
      return platforms.slice(0, 4).map((platform, index) => {
        const center = platformCenter(platform);
        const local = clamp(tideLevel + index * 0.05 - center.y * 0.03, 0, 1);
        return {
          id: `tide-gauge-${platform.id ?? index}`,
          kind: "harbor-tide-gauge",
          x: round(center.x),
          y: round(center.y + 0.14),
          tideLevel: round(local),
          warning: local > 0.7 ? "red" : local > 0.48 ? "amber" : "green",
          sourcePlatformId: platform.id ?? `platform-${index}`
        };
      });
    }
  });
}

export function createFlareBuoyMarkerKit() {
  return Object.freeze({
    id: "vr-board-flare-buoy-marker-kit",
    describe(input = {}) {
      const ids = new Set(collectedIds(input.objects));
      return defaultCollectibles(input.level).map((item, index) => {
        const available = !ids.has(item.id);
        return {
          id: `flare-buoy-${item.id ?? index}`,
          kind: "flare-buoy-marker",
          x: round(item.x),
          y: round(item.y),
          brightness: round(available ? 0.82 : 0.25),
          available,
          rescueValue: Number(item.value ?? 1)
        };
      });
    }
  });
}

export function createCraneCableRouteKit() {
  return Object.freeze({
    id: "vr-board-crane-cable-route-kit",
    describe(input = {}) {
      const platforms = defaultPlatforms(input.level);
      const avatar = avatarCenter(input.avatar);
      return platforms.slice(1).map((platform, index) => {
        const a = platformCenter(platforms[index]);
        const b = platformCenter(platform);
        const d = Math.hypot(avatar.x - b.x, avatar.y - b.y);
        return {
          id: `crane-cable-${platform.id ?? index}`,
          kind: "crane-cable-route",
          x1: round(a.x),
          y1: round(a.y + 0.55),
          x2: round(b.x),
          y2: round(b.y + 0.65),
          slack: round(clamp(0.18 + Math.abs(b.y - a.y) * 0.11, 0.12, 0.62)),
          priority: round(clamp(1 - d / 6, 0.2, 1)),
          stage: index < 2 ? "approach" : index < 4 ? "cargo-lift" : "final-handoff"
        };
      });
    }
  });
}

export function createSupplyNetCacheKit() {
  return Object.freeze({
    id: "vr-board-supply-net-cache-kit",
    describe(input = {}) {
      const hazards = defaultHazards(input.level);
      const pickups = defaultCollectibles(input.level);
      const ids = new Set(collectedIds(input.objects));
      return pickups.map((pickup, index) => {
        const risk = clamp(1 - nearestDistance(pickup, hazards, (hazard) => ({ x: Number(hazard.x) + Number(hazard.w ?? 0.5) * 0.5, y: Number(hazard.y) })) / 4, 0, 1);
        return {
          id: `supply-net-${pickup.id ?? index}`,
          kind: "supply-net-cache",
          x: round(pickup.x + (index % 2 ? 0.16 : -0.16)),
          y: round(pickup.y - 0.18),
          secured: ids.has(pickup.id),
          floodRisk: round(risk),
          contents: index % 2 ? "dry-blankets" : "flare-canisters"
        };
      });
    }
  });
}

export function createRescueSkiffBerthKit() {
  return Object.freeze({
    id: "vr-board-rescue-skiff-berth-kit",
    describe(input = {}) {
      const platforms = defaultPlatforms(input.level);
      const exit = input.level?.exit ?? { id: "harbor-exit", x: 15, y: 4.45, w: 1.6, h: 1.0 };
      const avatar = avatarCenter(input.avatar);
      const progress = clamp((avatar.x - Number(input.level?.start?.x ?? 0)) / Math.max(1, Number(exit.x ?? 15) - Number(input.level?.start?.x ?? 0)), 0, 1);
      const collected = collectedIds(input.objects).length;
      return [
        {
          id: "rescue-skiff-forward-berth",
          kind: "rescue-skiff-berth",
          x: round(Number(exit.x ?? 15) + Number(exit.w ?? 1.2) * 0.5),
          y: round(Number(exit.y ?? platforms.at(-1)?.y ?? 4.4) - 0.22),
          readiness: round(clamp(progress * 0.56 + collected * 0.12, 0, 1)),
          phase: progress > 0.82 && collected >= 3 ? "launch" : progress > 0.5 ? "boarding" : "distant",
          berthIndex: 1
        },
        {
          id: "rescue-skiff-lower-berth",
          kind: "rescue-skiff-berth",
          x: round(Number(platforms[2]?.x ?? 6.2) + 1.1),
          y: round(Number(platforms[2]?.y ?? 2.7) - 0.45),
          readiness: round(clamp(collected * 0.18 + progress * 0.2, 0, 1)),
          phase: collected >= 2 ? "standby" : "dark",
          berthIndex: 0
        }
      ];
    }
  });
}

export function createDawnHarborLedgerKit() {
  return Object.freeze({
    id: "vr-board-dawn-harbor-ledger-kit",
    describe(input = {}, derived = {}) {
      const avatar = avatarCenter(input.avatar);
      const exit = input.level?.exit ?? { x: 15, y: 4.45 };
      const collected = collectedIds(input.objects).length;
      const required = defaultCollectibles(input.level).length;
      const tideRisk = derived.tideRisk ?? 0;
      const progress = clamp((avatar.x - Number(input.level?.start?.x ?? 0)) / Math.max(1, Number(exit.x ?? 15) - Number(input.level?.start?.x ?? 0)), 0, 1);
      const readiness = clamp(progress * 0.34 + (collected / Math.max(1, required)) * 0.46 + (1 - tideRisk) * 0.2, 0, 1);
      let missionState = "survey-harbor";
      if (readiness > 0.86 && collected >= required - 1) missionState = "launch-skiff";
      else if (collected >= Math.ceil(required * 0.65)) missionState = "secure-final-cargo";
      else if (progress > 0.35) missionState = "cross-flooded-dock";
      return {
        id: "dawn-harbor-evacuation-ledger",
        kind: "dawn-harbor-ledger",
        readiness: round(readiness),
        tideRisk: round(tideRisk),
        collected,
        required,
        progress: round(progress),
        missionState,
        nextInstruction: missionState === "launch-skiff" ? "Launch the rescue skiff" : missionState === "secure-final-cargo" ? "Tie the last supply nets" : missionState === "cross-flooded-dock" ? "Cross the crane cable route" : "Light the harbor flare buoys"
      };
    }
  });
}

function createRendererHandoff(readiness) {
  const descriptors = {
    tideGauges: readiness.tideGauges,
    flareBuoys: readiness.flareBuoys,
    craneCables: readiness.craneCables,
    supplyNets: readiness.supplyNets,
    rescueSkiffs: readiness.rescueSkiffs,
    dawnHarborLedgers: [readiness.dawnHarborLedger]
  };
  const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : 0]));
  counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  return {
    id: "vr-board-storm-harbor-evacuation-renderer-handoff",
    kind: "renderer-handoff",
    policy: "renderer-consumes-descriptors-only",
    ownershipBoundary: [...OWNERSHIP_BOUNDARY],
    descriptors,
    counts
  };
}

export function createVrBoardStormHarborEvacuationReadinessDomainKit() {
  const tideGaugeKit = createHarborTideGaugeKit();
  const flareBuoyKit = createFlareBuoyMarkerKit();
  const craneCableKit = createCraneCableRouteKit();
  const supplyNetKit = createSupplyNetCacheKit();
  const rescueSkiffKit = createRescueSkiffBerthKit();
  const ledgerKit = createDawnHarborLedgerKit();

  function describe(input = {}) {
    const tideGauges = tideGaugeKit.describe(input);
    const flareBuoys = flareBuoyKit.describe(input);
    const craneCables = craneCableKit.describe(input);
    const supplyNets = supplyNetKit.describe(input);
    const rescueSkiffs = rescueSkiffKit.describe(input);
    const tideRisk = clamp(tideGauges.reduce((sum, item) => sum + item.tideLevel, 0) / Math.max(1, tideGauges.length));
    const dawnHarborLedger = ledgerKit.describe(input, { tideRisk });
    const readiness = {
      id: "vr-board-storm-harbor-evacuation-readiness",
      kind: "storm-harbor-evacuation-readiness",
      tree: DOMAIN_TREE,
      ownershipBoundary: [...OWNERSHIP_BOUNDARY],
      atomicKits: [...ATOMIC_KITS],
      tideGauges,
      flareBuoys,
      craneCables,
      supplyNets,
      rescueSkiffs,
      dawnHarborLedger,
      evacuationReadiness: dawnHarborLedger.readiness,
      tideRisk: dawnHarborLedger.tideRisk,
      missionState: dawnHarborLedger.missionState
    };
    readiness.rendererHandoff = createRendererHandoff(readiness);
    return readiness;
  }

  return Object.freeze({
    id: "vr-board-storm-harbor-evacuation-readiness-domain-kit",
    tree: DOMAIN_TREE,
    ownershipBoundary: [...OWNERSHIP_BOUNDARY],
    atomicKits: [...ATOMIC_KITS],
    kits: Object.freeze({ tideGaugeKit, flareBuoyKit, craneCableKit, supplyNetKit, rescueSkiffKit, ledgerKit }),
    describe,
    snapshot: describe
  });
}

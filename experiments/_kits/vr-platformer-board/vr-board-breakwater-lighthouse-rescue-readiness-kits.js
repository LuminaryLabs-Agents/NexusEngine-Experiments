const DOMAIN_TREE = `vr-board-breakwater-lighthouse-rescue-readiness-domain
├─ breakwater-signal-domain
│  ├─ storm-lamp-post-domain
│  │  └─ vr-board-storm-lamp-post-kit
│  └─ wave-splash-marker-domain
│     └─ vr-board-wave-splash-marker-kit
├─ lighthouse-focus-domain
│  ├─ prism-calibration-domain
│  │  ├─ prism-ring-domain
│  │  │  └─ vr-board-prism-calibration-ring-kit
│  └─ foghorn-timing-domain
│     └─ vr-board-foghorn-timing-bell-kit
├─ survivor-lane-domain
│  ├─ lifeline-rope-domain
│  │  └─ vr-board-lifeline-rope-lane-kit
│  └─ dawn-lighthouse-ledger-domain
│     └─ vr-board-dawn-lighthouse-ledger-kit
└─ renderer-handoff
   └─ vr-board-breakwater-lighthouse-renderer-handoff-kit
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
  "vr-board-storm-lamp-post-kit",
  "vr-board-wave-splash-marker-kit",
  "vr-board-prism-calibration-ring-kit",
  "vr-board-foghorn-timing-bell-kit",
  "vr-board-lifeline-rope-lane-kit",
  "vr-board-dawn-lighthouse-ledger-kit",
  "vr-board-breakwater-lighthouse-renderer-handoff-kit"
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

function defaultHazards(level = {}) {
  return Array.isArray(level.hazards) && level.hazards.length ? level.hazards : [
    { id: "surge-low-water", x: 4.8, y: 1, w: 0.88, h: 0.36 },
    { id: "swinging-crane-hook", x: 7.36, y: 2.58, w: 0.78, h: 0.4 },
    { id: "broken-dock-drop", x: 10.86, y: 1.05, w: 0.86, h: 0.36 }
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

export function createStormLampPostKit() {
  return Object.freeze({
    id: "vr-board-storm-lamp-post-kit",
    domain: "vr-board-breakwater-lighthouse-rescue/breakwater-signal/storm-lamp-post",
    describe(input = {}) {
      const avatar = avatarCenter(input.avatar);
      const ids = new Set(collectedIds(input.objects));
      return defaultPlatforms(input.level).slice(0, 5).map((platform, index) => {
        const center = platformCenter(platform);
        const distance = Math.hypot(avatar.x - center.x, avatar.y - center.y);
        const lit = ids.size > index || distance < 1.45;
        return {
          id: `storm-lamp-${platform.id ?? index}`,
          kind: "storm-lamp-post",
          x: round(center.x),
          y: round(center.y + 0.7),
          lit,
          glow: round(lit ? clamp(0.52 + ids.size * 0.08, 0, 1) : clamp(1 - distance / 8, 0.1, 0.42)),
          sequenceIndex: index
        };
      });
    }
  });
}

export function createWaveSplashMarkerKit() {
  return Object.freeze({
    id: "vr-board-wave-splash-marker-kit",
    domain: "vr-board-breakwater-lighthouse-rescue/breakwater-signal/wave-splash-marker",
    describe(input = {}) {
      const tide = clamp(input.weather?.tideLevel ?? input.stormHarborReadiness?.tideRisk ?? 0.5);
      return defaultHazards(input.level).map((hazard, index) => ({
        id: `wave-splash-${hazard.id ?? index}`,
        kind: "wave-splash-marker",
        x: round(Number(hazard.x ?? 0) + Number(hazard.w ?? 0.8) * 0.5),
        y: round(Number(hazard.y ?? 0) + 0.18 + tide * 0.55),
        height: round(clamp(0.24 + tide * 0.72 + index * 0.04, 0.16, 1.0)),
        danger: tide > 0.68 ? "red" : tide > 0.5 ? "amber" : "blue",
        sourceHazardId: hazard.id ?? `hazard-${index}`
      }));
    }
  });
}

export function createPrismCalibrationRingKit() {
  return Object.freeze({
    id: "vr-board-prism-calibration-ring-kit",
    domain: "vr-board-breakwater-lighthouse-rescue/lighthouse-focus/prism-calibration-ring",
    describe(input = {}) {
      const platforms = defaultPlatforms(input.level);
      const exit = input.level?.exit ?? { x: 15.4, y: 4.62, w: 0.82 };
      const avatar = avatarCenter(input.avatar);
      const routeProgress = clamp((avatar.x - Number(input.level?.start?.x ?? 0)) / Math.max(1, Number(exit.x ?? 15) - Number(input.level?.start?.x ?? 0)));
      const baseX = Number(exit.x ?? platforms.at(-1)?.x ?? 15) + Number(exit.w ?? 1) * 0.5;
      return Array.from({ length: 4 }, (_, index) => ({
        id: `lighthouse-prism-ring-${index + 1}`,
        kind: "prism-calibration-ring",
        x: round(baseX + Math.cos(index * Math.PI * 0.5) * 0.42),
        y: round(Number(exit.y ?? platforms.at(-1)?.y ?? 4.4) + 1.0 + Math.sin(index * Math.PI * 0.5) * 0.24),
        radius: round(0.24 + index * 0.08),
        aligned: routeProgress > index * 0.22,
        focus: round(clamp(routeProgress + index * 0.08, 0, 1))
      }));
    }
  });
}

export function createFoghornTimingBellKit() {
  return Object.freeze({
    id: "vr-board-foghorn-timing-bell-kit",
    domain: "vr-board-breakwater-lighthouse-rescue/lighthouse-focus/foghorn-timing-bell",
    describe(input = {}) {
      const wind = clamp(input.weather?.wind ?? 0.35);
      const time = Number(input.time ?? 0);
      return [0, 1, 2].map((index) => ({
        id: `foghorn-bell-${index + 1}`,
        kind: "foghorn-timing-bell",
        x: round(2.1 + index * 5.15),
        y: round(5.05 + Math.sin(time + index) * 0.08),
        cadence: round(clamp(0.3 + wind * 0.42 + index * 0.08, 0, 1)),
        phase: (Math.floor(time + index) % 3) === 0 ? "ring" : "wait",
        visibilityBoost: round(clamp(1 - wind * 0.35 + index * 0.04, 0, 1))
      }));
    }
  });
}

export function createLifelineRopeLaneKit() {
  return Object.freeze({
    id: "vr-board-lifeline-rope-lane-kit",
    domain: "vr-board-breakwater-lighthouse-rescue/survivor-lane/lifeline-rope",
    describe(input = {}) {
      const platforms = defaultPlatforms(input.level);
      const ids = new Set(collectedIds(input.objects));
      return platforms.slice(1).map((platform, index) => {
        const a = platformCenter(platforms[index]);
        const b = platformCenter(platform);
        return {
          id: `lifeline-rope-${platform.id ?? index}`,
          kind: "lifeline-rope-lane",
          x1: round(a.x),
          y1: round(a.y + 0.38),
          x2: round(b.x),
          y2: round(b.y + 0.38),
          tension: round(clamp(0.38 + ids.size * 0.08 - index * 0.02, 0, 1)),
          survivorCapacity: Math.max(1, 2 + ids.size - Math.floor(index / 2)),
          status: ids.size > index ? "secured" : index < 2 ? "reachable" : "dark"
        };
      });
    }
  });
}

export function createDawnLighthouseLedgerKit() {
  return Object.freeze({
    id: "vr-board-dawn-lighthouse-ledger-kit",
    domain: "vr-board-breakwater-lighthouse-rescue/survivor-lane/dawn-lighthouse-ledger",
    describe(input = {}, derived = {}) {
      const avatar = avatarCenter(input.avatar);
      const exit = input.level?.exit ?? { x: 15.4, y: 4.62 };
      const collected = collectedIds(input.objects).length;
      const required = defaultCollectibles(input.level).length;
      const tideRisk = clamp(input.stormHarborReadiness?.tideRisk ?? input.weather?.tideLevel ?? derived.tideRisk ?? 0.5);
      const progress = clamp((avatar.x - Number(input.level?.start?.x ?? 0)) / Math.max(1, Number(exit.x ?? 15) - Number(input.level?.start?.x ?? 0)));
      const lampScore = clamp((derived.litLampCount ?? 0) / Math.max(1, derived.lampCount ?? 1));
      const prismScore = clamp((derived.alignedPrismCount ?? 0) / Math.max(1, derived.prismCount ?? 1));
      const readiness = clamp(progress * 0.28 + (collected / Math.max(1, required)) * 0.26 + lampScore * 0.2 + prismScore * 0.16 + (1 - tideRisk) * 0.1);
      let missionState = "light-breakwater";
      if (readiness > 0.86 && progress > 0.82) missionState = "guide-survivors-home";
      else if (prismScore > 0.55) missionState = "pull-lifeline-ropes";
      else if (lampScore > 0.5) missionState = "align-lighthouse-prism";
      return {
        id: "dawn-lighthouse-rescue-ledger",
        kind: "dawn-lighthouse-ledger",
        readiness: round(readiness),
        progress: round(progress),
        collected,
        required,
        lampScore: round(lampScore),
        prismScore: round(prismScore),
        tideRisk: round(tideRisk),
        missionState,
        nextInstruction: missionState === "guide-survivors-home" ? "Guide survivors through the lighthouse beam" : missionState === "pull-lifeline-ropes" ? "Pull lifeline ropes across the breakwater" : missionState === "align-lighthouse-prism" ? "Align the lighthouse prism rings" : "Light every breakwater storm lamp"
      };
    }
  });
}

function createRendererHandoff(readiness) {
  const descriptors = {
    stormLampPosts: readiness.stormLampPosts,
    waveSplashMarkers: readiness.waveSplashMarkers,
    prismCalibrationRings: readiness.prismCalibrationRings,
    foghornTimingBells: readiness.foghornTimingBells,
    lifelineRopeLanes: readiness.lifelineRopeLanes,
    dawnLighthouseLedgers: [readiness.dawnLighthouseLedger]
  };
  const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : 0]));
  counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  return {
    id: "vr-board-breakwater-lighthouse-rescue-renderer-handoff",
    kind: "renderer-handoff",
    policy: "renderer-consumes-descriptors-only",
    ownershipBoundary: [...OWNERSHIP_BOUNDARY],
    descriptors,
    counts
  };
}

export const VR_BOARD_BREAKWATER_LIGHTHOUSE_RESCUE_DOMAIN_TREE = Object.freeze({
  root: "vr-board-breakwater-lighthouse-rescue-readiness-domain",
  tree: DOMAIN_TREE,
  contract: "renderer consumes descriptors only; no DOM, browser input, Three.js, WebGL, audio, asset loading, network, storage, physics, or frame-loop ownership"
});

export function createVrBoardBreakwaterLighthouseRescueReadinessDomainKit() {
  const stormLampPostKit = createStormLampPostKit();
  const waveSplashMarkerKit = createWaveSplashMarkerKit();
  const prismCalibrationRingKit = createPrismCalibrationRingKit();
  const foghornTimingBellKit = createFoghornTimingBellKit();
  const lifelineRopeLaneKit = createLifelineRopeLaneKit();
  const dawnLighthouseLedgerKit = createDawnLighthouseLedgerKit();

  function describe(input = {}) {
    const stormLampPosts = stormLampPostKit.describe(input);
    const waveSplashMarkers = waveSplashMarkerKit.describe(input);
    const prismCalibrationRings = prismCalibrationRingKit.describe(input);
    const foghornTimingBells = foghornTimingBellKit.describe(input);
    const lifelineRopeLanes = lifelineRopeLaneKit.describe(input);
    const litLampCount = stormLampPosts.filter((lamp) => lamp.lit).length;
    const alignedPrismCount = prismCalibrationRings.filter((ring) => ring.aligned).length;
    const dawnLighthouseLedger = dawnLighthouseLedgerKit.describe(input, {
      litLampCount,
      lampCount: stormLampPosts.length,
      alignedPrismCount,
      prismCount: prismCalibrationRings.length
    });
    const readiness = {
      id: "vr-board-breakwater-lighthouse-rescue-readiness",
      kind: "breakwater-lighthouse-rescue-readiness",
      tree: DOMAIN_TREE,
      ownershipBoundary: [...OWNERSHIP_BOUNDARY],
      atomicKits: [...ATOMIC_KITS],
      stormLampPosts,
      waveSplashMarkers,
      prismCalibrationRings,
      foghornTimingBells,
      lifelineRopeLanes,
      dawnLighthouseLedger,
      rescueReadiness: dawnLighthouseLedger.readiness,
      tideRisk: dawnLighthouseLedger.tideRisk,
      missionState: dawnLighthouseLedger.missionState
    };
    readiness.rendererHandoff = createRendererHandoff(readiness);
    return readiness;
  }

  return Object.freeze({
    id: "vr-board-breakwater-lighthouse-rescue-readiness-domain-kit",
    tree: DOMAIN_TREE,
    ownershipBoundary: [...OWNERSHIP_BOUNDARY],
    atomicKits: [...ATOMIC_KITS],
    kits: Object.freeze({ stormLampPostKit, waveSplashMarkerKit, prismCalibrationRingKit, foghornTimingBellKit, lifelineRopeLaneKit, dawnLighthouseLedgerKit }),
    describe,
    snapshot: describe
  });
}

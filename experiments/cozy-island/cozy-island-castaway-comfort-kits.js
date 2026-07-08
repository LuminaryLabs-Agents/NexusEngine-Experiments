export const COZY_ISLAND_CASTAWAY_COMFORT_DOMAIN_TREE = `
cozy-island-castaway-comfort-readiness-domain
├─ survival-resource-domain
│  ├─ fresh-water-domain
│  │  └─ cozy-island-fresh-water-spring-kit
│  └─ forage-cache-domain
│     └─ cozy-island-forage-cache-ring-kit
├─ shelter-signal-domain
│  ├─ shade-shelter-domain
│  │  └─ cozy-island-shade-shelter-canopy-kit
│  └─ signal-fire-domain
│     └─ cozy-island-signal-fire-readiness-kit
├─ tide-return-domain
│  ├─ storm-cover-domain
│  │  └─ cozy-island-storm-cover-pocket-kit
│  └─ canoe-launch-domain
│     └─ cozy-island-canoe-launch-window-kit
└─ renderer-handoff
   └─ cozy-island-castaway-comfort-renderer-handoff-kit
      └─ renderer consumes descriptors only
`;

export const COZY_ISLAND_CASTAWAY_FORBIDDEN_OWNERSHIP = [
  "NexusRealtime",
  "document.",
  "window.",
  "HTMLElement",
  "THREE.",
  "WebGL",
  "AudioContext",
  "requestAnimationFrame",
  "addEventListener"
];

const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const vec = (value = {}, fallback = {}) => ({
  x: num(value.x, fallback.x ?? 0),
  y: num(value.y, fallback.y ?? 0),
  z: num(value.z, fallback.z ?? 0)
});
const round = (value, digits = 3) => Number(num(value).toFixed(digits));
const hash01 = (seed = "cozy") => {
  let h = 2166136261;
  for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  h ^= h << 13;
  h ^= h >>> 17;
  h ^= h << 5;
  return (h >>> 0) / 4294967295;
};
const polarPoint = (radius, angle, y = 0) => ({ x: round(Math.cos(angle) * radius), y: round(y), z: round(Math.sin(angle) * radius) });
const descriptor = (kind, id, position, state = {}) => ({ kind, id, position: vec(position), state });

function islandSnapshot(input = {}) {
  const seed = input.seed ?? "cozy-island";
  const tide = clamp01(input.tide ?? 0.42);
  const stormRisk = clamp01(input.stormRisk ?? input.weather?.stormRisk ?? 0.24);
  const hunger = clamp01(input.hunger ?? 0.36);
  const thirst = clamp01(input.thirst ?? 0.44);
  const timeOfDay = clamp01(input.timeOfDay ?? 0.48);
  const smokeStrength = clamp01(input.smokeStrength ?? input.campfire?.smokeStrength ?? 0.58);
  const wind = vec(input.wind ?? { x: 0.42, y: 0, z: -0.18 });
  const camp = vec(input.camp ?? input.campfire?.position ?? { x: 6, y: 0.2, z: -8 });
  const beachRadius = num(input.beachRadius, 78);
  const clearingRadius = num(input.clearingRadius, 16);
  const comfortNeed = clamp01((hunger + thirst + stormRisk) / 3);
  return { seed, tide, stormRisk, hunger, thirst, timeOfDay, smokeStrength, wind, camp, beachRadius, clearingRadius, comfortNeed };
}

export function createCozyIslandFreshWaterSpringKit(input = {}) {
  const s = islandSnapshot(input);
  const base = hash01(`${s.seed}:water`);
  const count = s.thirst > 0.72 ? 3 : 2;
  return Array.from({ length: count }, (_, i) => {
    const angle = base * Math.PI * 2 + i * 2.38;
    const radius = s.clearingRadius + 8 + i * 7;
    const position = polarPoint(radius, angle, 0.16);
    return descriptor("cozy-island.fresh-water-spring", `fresh-water-${i + 1}`, position, {
      priority: round(clamp01(s.thirst + i * 0.08)),
      flow: round(0.44 + (1 - s.tide) * 0.32 + i * 0.04),
      label: i === 0 ? "nearest drinkable spring" : "backup water trickle"
    });
  });
}

export function createCozyIslandForageCacheRingKit(input = {}) {
  const s = islandSnapshot(input);
  const base = hash01(`${s.seed}:forage`);
  const count = s.hunger > 0.66 ? 4 : 3;
  return Array.from({ length: count }, (_, i) => {
    const angle = base * Math.PI * 2 + i * 1.61;
    const radius = 22 + i * 8 + s.hunger * 5;
    return descriptor("cozy-island.forage-cache-ring", `forage-cache-${i + 1}`, polarPoint(radius, angle, 0.32), {
      calories: Math.round(60 + s.hunger * 120 + i * 24),
      spoilRisk: round(clamp01(s.stormRisk * 0.4 + s.tide * 0.2)),
      priority: round(clamp01(s.hunger + 0.06 * i))
    });
  });
}

export function createCozyIslandShadeShelterCanopyKit(input = {}) {
  const s = islandSnapshot(input);
  const middayHeat = 1 - Math.abs(s.timeOfDay - 0.5) * 2;
  const base = hash01(`${s.seed}:shade`);
  return Array.from({ length: 3 }, (_, i) => {
    const angle = base * Math.PI * 2 + i * 2.08;
    const radius = s.clearingRadius + 11 + i * 4;
    return descriptor("cozy-island.shade-shelter-canopy", `shade-shelter-${i + 1}`, polarPoint(radius, angle, 1.1), {
      shade: round(clamp01(0.46 + middayHeat * 0.38 - i * 0.04)),
      windBreak: round(clamp01(0.32 + s.stormRisk * 0.5 + i * 0.06)),
      coverageMeters: round(5.4 + i * 1.2 + middayHeat * 1.6)
    });
  });
}

export function createCozyIslandSignalFireReadinessKit(input = {}) {
  const s = islandSnapshot(input);
  const smokeLean = round(Math.hypot(s.wind.x, s.wind.z));
  return [descriptor("cozy-island.signal-fire-readiness", "signal-fire-main", { x: s.camp.x, y: s.camp.y + 1.3, z: s.camp.z }, {
    visibility: round(clamp01(s.smokeStrength * 0.7 + smokeLean * 0.18 + (1 - s.stormRisk) * 0.18)),
    wetFuelRisk: round(clamp01(s.stormRisk * 0.8 + s.tide * 0.15)),
    relightUrgency: round(clamp01(1 - s.smokeStrength + s.stormRisk * 0.35))
  })];
}

export function createCozyIslandStormCoverPocketKit(input = {}) {
  const s = islandSnapshot(input);
  const base = hash01(`${s.seed}:storm-cover`);
  const count = s.stormRisk > 0.68 ? 3 : 2;
  return Array.from({ length: count }, (_, i) => {
    const angle = base * Math.PI * 2 + i * 2.51;
    const radius = 18 + i * 9;
    return descriptor("cozy-island.storm-cover-pocket", `storm-cover-${i + 1}`, polarPoint(radius, angle, 0.42), {
      cover: round(clamp01(0.54 + s.stormRisk * 0.36 - i * 0.03)),
      floodRisk: round(clamp01(s.tide * 0.5 + i * 0.08)),
      minutesSafe: Math.round(8 + (1 - s.tide) * 16 + (1 - i * 0.12) * 6)
    });
  });
}

export function createCozyIslandCanoeLaunchWindowKit(input = {}) {
  const s = islandSnapshot(input);
  const safeTide = 1 - Math.abs(s.tide - 0.38) * 2.1;
  const base = hash01(`${s.seed}:canoe`);
  return Array.from({ length: 2 }, (_, i) => {
    const angle = base * Math.PI * 2 + i * Math.PI;
    const radius = s.beachRadius + 5 + i * 8;
    return descriptor("cozy-island.canoe-launch-window", `canoe-launch-${i + 1}`, polarPoint(radius, angle, 0.12), {
      launchReadiness: round(clamp01(safeTide - s.stormRisk * 0.35 - i * 0.08)),
      tide: round(s.tide),
      surfRisk: round(clamp01(s.stormRisk * 0.55 + s.tide * 0.28 + i * 0.05))
    });
  });
}

export function createCozyIslandCastawayComfortRendererHandoffKit(readiness = {}) {
  const descriptors = [
    ...(readiness.freshWaterSprings ?? []),
    ...(readiness.forageCacheRings ?? []),
    ...(readiness.shadeShelterCanopies ?? []),
    ...(readiness.signalFireReadiness ?? []),
    ...(readiness.stormCoverPockets ?? []),
    ...(readiness.canoeLaunchWindows ?? [])
  ];
  return {
    kind: "cozy-island.castaway-comfort.renderer-handoff",
    descriptorPolicy: "renderer-consumes-descriptors-only",
    descriptors,
    counts: {
      freshWaterSprings: readiness.freshWaterSprings?.length ?? 0,
      forageCacheRings: readiness.forageCacheRings?.length ?? 0,
      shadeShelterCanopies: readiness.shadeShelterCanopies?.length ?? 0,
      signalFireReadiness: readiness.signalFireReadiness?.length ?? 0,
      stormCoverPockets: readiness.stormCoverPockets?.length ?? 0,
      canoeLaunchWindows: readiness.canoeLaunchWindows?.length ?? 0,
      total: descriptors.length
    }
  };
}

export function createCozyIslandCastawayComfortReadinessDomainKit(defaultInput = {}) {
  return {
    id: "cozy-island-castaway-comfort-readiness-domain-kit",
    domainTree: COZY_ISLAND_CASTAWAY_COMFORT_DOMAIN_TREE,
    ownership: "headless snapshot-to-descriptor domain kit",
    atomicKits: [
      "cozy-island-fresh-water-spring-kit",
      "cozy-island-forage-cache-ring-kit",
      "cozy-island-shade-shelter-canopy-kit",
      "cozy-island-signal-fire-readiness-kit",
      "cozy-island-storm-cover-pocket-kit",
      "cozy-island-canoe-launch-window-kit",
      "cozy-island-castaway-comfort-renderer-handoff-kit"
    ],
    evaluate(input = {}) {
      const snapshot = islandSnapshot({ ...defaultInput, ...input });
      const readiness = {
        kind: "cozy-island.castaway-comfort.readiness",
        snapshot,
        freshWaterSprings: createCozyIslandFreshWaterSpringKit(snapshot),
        forageCacheRings: createCozyIslandForageCacheRingKit(snapshot),
        shadeShelterCanopies: createCozyIslandShadeShelterCanopyKit(snapshot),
        signalFireReadiness: createCozyIslandSignalFireReadinessKit(snapshot),
        stormCoverPockets: createCozyIslandStormCoverPocketKit(snapshot),
        canoeLaunchWindows: createCozyIslandCanoeLaunchWindowKit(snapshot),
        summary: {
          comfortNeed: round(snapshot.comfortNeed),
          topConcern: snapshot.thirst >= snapshot.hunger && snapshot.thirst >= snapshot.stormRisk ? "water" : snapshot.hunger >= snapshot.stormRisk ? "food" : "storm-cover"
        }
      };
      readiness.rendererHandoff = createCozyIslandCastawayComfortRendererHandoffKit(readiness);
      return readiness;
    }
  };
}

export const COZY_ISLAND_SEA_TURTLE_HATCHERY_DOMAIN_TREE = `
cozy-island-sea-turtle-hatchery-readiness-domain
├─ nest-protection-domain
│  ├─ nest-temperature-domain
│  │  └─ cozy-island-nest-temperature-band-kit
│  └─ predator-track-domain
│     └─ cozy-island-predator-track-buffer-kit
├─ hatchling-route-domain
│  ├─ moonlit-lane-domain
│  │  └─ cozy-island-moonlit-hatchling-lane-kit
│  └─ surf-window-domain
│     └─ cozy-island-surf-window-timing-kit
├─ stewardship-handoff-domain
│  ├─ volunteer-rope-line-domain
│  │  └─ cozy-island-volunteer-rope-line-kit
│  └─ release-ledger-domain
│     └─ cozy-island-release-ledger-stamp-kit
└─ renderer-handoff
   └─ cozy-island-sea-turtle-hatchery-renderer-handoff-kit
      └─ renderer consumes descriptors only
`;

export const COZY_ISLAND_SEA_TURTLE_FORBIDDEN_OWNERSHIP = [
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
const hash01 = (seed = "cozy-sea-turtle") => {
  let h = 2166136261;
  for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  h ^= h << 13;
  h ^= h >>> 17;
  h ^= h << 5;
  return (h >>> 0) / 4294967295;
};
const polarPoint = (radius, angle, y = 0) => ({ x: round(Math.cos(angle) * radius), y: round(y), z: round(Math.sin(angle) * radius) });
const descriptor = (kind, id, position, state = {}) => ({ kind, id, position: vec(position), state });

function hatcherySnapshot(input = {}) {
  const seed = input.seed ?? "cozy-island-sea-turtle-hatchery";
  const tide = clamp01(input.tide ?? 0.46);
  const stormRisk = clamp01(input.stormRisk ?? input.weather?.stormRisk ?? 0.2);
  const sandHeat = clamp01(input.sandHeat ?? input.temperature ?? 0.52);
  const moonPhase = clamp01(input.moonPhase ?? input.timeOfDay ?? 0.5);
  const predatorPressure = clamp01(input.predatorPressure ?? input.crabActivity ?? 0.34);
  const visitorPressure = clamp01(input.visitorPressure ?? 0.32);
  const surfCalm = clamp01(input.surfCalm ?? input.waterClarity ?? 0.62);
  const volunteerCoverage = clamp01(input.volunteerCoverage ?? 0.5);
  const wind = vec(input.wind ?? { x: 0.18, y: 0, z: -0.22 });
  const camp = vec(input.camp ?? input.campfire?.position ?? { x: 6, y: 0.2, z: -8 });
  const beachRadius = num(input.beachRadius, 78);
  const hatcheryRadius = num(input.hatcheryRadius, beachRadius - 9);
  const hatcheryNeed = clamp01(stormRisk * 0.24 + predatorPressure * 0.24 + visitorPressure * 0.18 + (1 - surfCalm) * 0.16 + Math.abs(sandHeat - 0.52) * 0.18 + (1 - volunteerCoverage) * 0.16);
  return { seed, tide, stormRisk, sandHeat, moonPhase, predatorPressure, visitorPressure, surfCalm, volunteerCoverage, wind, camp, beachRadius, hatcheryRadius, hatcheryNeed };
}

export function createCozyIslandNestTemperatureBandKit(input = {}) {
  const s = hatcherySnapshot(input);
  const base = hash01(`${s.seed}:nest-temperature`);
  const count = Math.abs(s.sandHeat - 0.52) > 0.28 ? 4 : 3;
  return Array.from({ length: count }, (_, i) => {
    const angle = base * Math.PI * 2 + i * 1.36;
    const radius = s.hatcheryRadius - 7 + i * 2.8;
    const heatDrift = Math.abs(s.sandHeat - 0.52);
    return descriptor("cozy-island.nest-temperature-band", `nest-temperature-band-${i + 1}`, polarPoint(radius, angle, 0.09), {
      heatDrift: round(clamp01(heatDrift + i * 0.03)),
      shadeUrgency: round(clamp01((s.sandHeat - 0.55) * 1.6 + i * 0.04)),
      insulationUrgency: round(clamp01((0.48 - s.sandHeat) * 1.5 + s.stormRisk * 0.22)),
      label: s.sandHeat > 0.58 ? "cool nest band" : s.sandHeat < 0.42 ? "warm nest band" : "stable nest band"
    });
  });
}

export function createCozyIslandPredatorTrackBufferKit(input = {}) {
  const s = hatcherySnapshot(input);
  const base = hash01(`${s.seed}:predator-buffer`);
  const count = s.predatorPressure > 0.68 ? 4 : 3;
  return Array.from({ length: count }, (_, i) => {
    const angle = base * Math.PI * 2 + i * 1.82;
    const radius = s.hatcheryRadius + 3 + i * 4.6;
    return descriptor("cozy-island.predator-track-buffer", `predator-track-buffer-${i + 1}`, polarPoint(radius, angle, 0.12), {
      trackDensity: round(clamp01(s.predatorPressure + i * 0.04)),
      quietSweep: round(clamp01(s.volunteerCoverage * 0.52 + (1 - s.visitorPressure) * 0.24)),
      bufferPriority: round(clamp01(s.predatorPressure * 0.66 + s.visitorPressure * 0.18 + s.tide * 0.12))
    });
  });
}

export function createCozyIslandMoonlitHatchlingLaneKit(input = {}) {
  const s = hatcherySnapshot(input);
  const base = hash01(`${s.seed}:moonlit-lane`);
  const count = s.moonPhase > 0.72 ? 5 : 4;
  return Array.from({ length: count }, (_, i) => {
    const angle = base * Math.PI * 2 + i * 1.08;
    const radius = s.beachRadius - 18 + i * 4.2;
    const moonPull = 1 - Math.abs(s.moonPhase - 0.86) * 1.4;
    return descriptor("cozy-island.moonlit-hatchling-lane", `moonlit-hatchling-lane-${i + 1}`, polarPoint(radius, angle, 0.14), {
      moonGuidance: round(clamp01(moonPull + i * 0.025)),
      lightConfusionRisk: round(clamp01(s.visitorPressure * 0.54 + (1 - moonPull) * 0.2)),
      laneClarity: round(clamp01(s.surfCalm * 0.28 + Math.max(0, moonPull) * 0.48 + s.volunteerCoverage * 0.16))
    });
  });
}

export function createCozyIslandSurfWindowTimingKit(input = {}) {
  const s = hatcherySnapshot(input);
  const base = hash01(`${s.seed}:surf-window`);
  return Array.from({ length: 3 }, (_, i) => {
    const angle = base * Math.PI * 2 + i * 2.14;
    const radius = s.beachRadius + 6 + i * 4.5;
    const tideFit = 1 - Math.abs(s.tide - (0.22 + i * 0.22)) * 2.2;
    return descriptor("cozy-island.surf-window-timing", `surf-window-${i + 1}`, polarPoint(radius, angle, -0.02), {
      releaseReadiness: round(clamp01(tideFit * 0.38 + s.surfCalm * 0.42 + (1 - s.stormRisk) * 0.2)),
      safeMinutes: Math.round(5 + s.surfCalm * 14 + Math.max(0, tideFit) * 9 - s.stormRisk * 5),
      tideFit: round(clamp01(tideFit))
    });
  });
}

export function createCozyIslandVolunteerRopeLineKit(input = {}) {
  const s = hatcherySnapshot(input);
  const base = hash01(`${s.seed}:rope-line`);
  const count = s.volunteerCoverage < 0.34 || s.visitorPressure > 0.68 ? 4 : 3;
  return Array.from({ length: count }, (_, i) => {
    const angle = base * Math.PI * 2 + i * 1.57;
    const radius = s.hatcheryRadius - 12 + i * 5;
    return descriptor("cozy-island.volunteer-rope-line", `volunteer-rope-line-${i + 1}`, polarPoint(radius, angle, 0.18), {
      coverageGap: round(clamp01(1 - s.volunteerCoverage + i * 0.03)),
      visitorDeflection: round(clamp01(s.visitorPressure * 0.72 + i * 0.02)),
      setupPriority: round(clamp01((1 - s.volunteerCoverage) * 0.48 + s.visitorPressure * 0.34 + s.hatcheryNeed * 0.18))
    });
  });
}

export function createCozyIslandReleaseLedgerStampKit(input = {}) {
  const s = hatcherySnapshot(input);
  const successScore = clamp01(s.surfCalm * 0.28 + (1 - s.stormRisk) * 0.22 + (1 - s.predatorPressure) * 0.18 + s.volunteerCoverage * 0.2 + (1 - s.visitorPressure) * 0.12);
  return [descriptor("cozy-island.release-ledger-stamp", "release-ledger-main", { x: s.camp.x - 3.8, y: s.camp.y + 0.74, z: s.camp.z + 2.8 }, {
    successScore: round(successScore),
    hatcheryNeed: round(s.hatcheryNeed),
    priority: successScore < 0.48 ? "hold release" : s.predatorPressure > 0.62 ? "sweep tracks" : s.volunteerCoverage < 0.44 ? "staff rope line" : "open moon lane"
  })];
}

export function createCozyIslandSeaTurtleHatcheryRendererHandoffKit(readiness = {}) {
  const descriptors = [
    ...(readiness.nestTemperatureBands ?? []),
    ...(readiness.predatorTrackBuffers ?? []),
    ...(readiness.moonlitHatchlingLanes ?? []),
    ...(readiness.surfWindowTimings ?? []),
    ...(readiness.volunteerRopeLines ?? []),
    ...(readiness.releaseLedgerStamps ?? [])
  ];
  return {
    kind: "cozy-island.sea-turtle-hatchery.renderer-handoff",
    descriptorPolicy: "renderer-consumes-descriptors-only",
    descriptors,
    counts: {
      nestTemperatureBands: readiness.nestTemperatureBands?.length ?? 0,
      predatorTrackBuffers: readiness.predatorTrackBuffers?.length ?? 0,
      moonlitHatchlingLanes: readiness.moonlitHatchlingLanes?.length ?? 0,
      surfWindowTimings: readiness.surfWindowTimings?.length ?? 0,
      volunteerRopeLines: readiness.volunteerRopeLines?.length ?? 0,
      releaseLedgerStamps: readiness.releaseLedgerStamps?.length ?? 0,
      total: descriptors.length
    }
  };
}

export function createCozyIslandSeaTurtleHatcheryReadinessDomainKit(defaultInput = {}) {
  return {
    id: "cozy-island-sea-turtle-hatchery-readiness-domain-kit",
    domainTree: COZY_ISLAND_SEA_TURTLE_HATCHERY_DOMAIN_TREE,
    ownership: "headless snapshot-to-descriptor domain kit",
    atomicKits: [
      "cozy-island-nest-temperature-band-kit",
      "cozy-island-predator-track-buffer-kit",
      "cozy-island-moonlit-hatchling-lane-kit",
      "cozy-island-surf-window-timing-kit",
      "cozy-island-volunteer-rope-line-kit",
      "cozy-island-release-ledger-stamp-kit",
      "cozy-island-sea-turtle-hatchery-renderer-handoff-kit"
    ],
    evaluate(input = {}) {
      const snapshot = hatcherySnapshot({ ...defaultInput, ...input });
      const readiness = {
        kind: "cozy-island.sea-turtle-hatchery.readiness",
        snapshot,
        nestTemperatureBands: createCozyIslandNestTemperatureBandKit(snapshot),
        predatorTrackBuffers: createCozyIslandPredatorTrackBufferKit(snapshot),
        moonlitHatchlingLanes: createCozyIslandMoonlitHatchlingLaneKit(snapshot),
        surfWindowTimings: createCozyIslandSurfWindowTimingKit(snapshot),
        volunteerRopeLines: createCozyIslandVolunteerRopeLineKit(snapshot),
        releaseLedgerStamps: createCozyIslandReleaseLedgerStampKit(snapshot),
        summary: {
          hatcheryNeed: round(snapshot.hatcheryNeed),
          topConcern: snapshot.predatorPressure > 0.68 ? "predator buffer" : snapshot.stormRisk > 0.62 ? "surf window" : snapshot.visitorPressure > 0.68 ? "rope line" : Math.abs(snapshot.sandHeat - 0.52) > 0.28 ? "nest temperature" : "moon lane"
        }
      };
      readiness.rendererHandoff = createCozyIslandSeaTurtleHatcheryRendererHandoffKit(readiness);
      return readiness;
    }
  };
}

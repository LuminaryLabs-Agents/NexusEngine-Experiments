export const COZY_ISLAND_TIDEPOOL_CONSERVATORY_DOMAIN_TREE = `
cozy-island-tidepool-conservatory-readiness-domain
├─ reef-stewardship-domain
│  ├─ coral-nursery-domain
│  │  └─ cozy-island-coral-nursery-bed-kit
│  └─ tidepool-specimen-domain
│     └─ cozy-island-tidepool-specimen-trail-kit
├─ shorelife-safety-domain
│  ├─ hermit-crab-crossing-domain
│  │  └─ cozy-island-hermit-crab-crossing-kit
│  └─ shell-marker-domain
│     └─ cozy-island-shell-marker-mosaic-kit
├─ moon-return-domain
│  ├─ moon-tide-survey-domain
│  │  └─ cozy-island-moon-tide-survey-kit
│  └─ conservation-ledger-domain
│     └─ cozy-island-conservation-ledger-kit
└─ renderer-handoff
   └─ cozy-island-tidepool-conservatory-renderer-handoff-kit
      └─ renderer consumes descriptors only
`;

export const COZY_ISLAND_TIDEPOOL_FORBIDDEN_OWNERSHIP = [
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
const hash01 = (seed = "cozy-tidepool") => {
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
  const seed = input.seed ?? "cozy-island-tidepool";
  const tide = clamp01(input.tide ?? 0.42);
  const stormRisk = clamp01(input.stormRisk ?? input.weather?.stormRisk ?? 0.22);
  const waterClarity = clamp01(input.waterClarity ?? 0.64);
  const coralHealth = clamp01(input.coralHealth ?? 0.58);
  const crabActivity = clamp01(input.crabActivity ?? 0.52);
  const shellSupply = clamp01(input.shellSupply ?? 0.48);
  const moonPhase = clamp01(input.moonPhase ?? input.timeOfDay ?? 0.5);
  const visitorPressure = clamp01(input.visitorPressure ?? 0.32);
  const wind = vec(input.wind ?? { x: 0.24, y: 0, z: -0.16 });
  const camp = vec(input.camp ?? input.campfire?.position ?? { x: 6, y: 0.2, z: -8 });
  const reefRadius = num(input.reefRadius, input.beachRadius ? num(input.beachRadius) + 14 : 92);
  const lagoonRadius = num(input.lagoonRadius, 46);
  const stewardshipNeed = clamp01((1 - coralHealth) * 0.42 + stormRisk * 0.24 + visitorPressure * 0.2 + (1 - waterClarity) * 0.14);
  return { seed, tide, stormRisk, waterClarity, coralHealth, crabActivity, shellSupply, moonPhase, visitorPressure, wind, camp, reefRadius, lagoonRadius, stewardshipNeed };
}

export function createCozyIslandCoralNurseryBedKit(input = {}) {
  const s = islandSnapshot(input);
  const base = hash01(`${s.seed}:coral-nursery`);
  const count = s.coralHealth < 0.42 ? 4 : 3;
  return Array.from({ length: count }, (_, i) => {
    const angle = base * Math.PI * 2 + i * 1.47;
    const radius = s.lagoonRadius + 8 + i * 5;
    return descriptor("cozy-island.coral-nursery-bed", `coral-nursery-${i + 1}`, polarPoint(radius, angle, -0.08), {
      transplantPriority: round(clamp01((1 - s.coralHealth) + i * 0.05)),
      clarityNeed: round(clamp01(1 - s.waterClarity + i * 0.04)),
      stormAnchor: round(clamp01(s.stormRisk * 0.72 + i * 0.05)),
      label: i === 0 ? "fragile coral nursery" : "backup coral tray"
    });
  });
}

export function createCozyIslandTidepoolSpecimenTrailKit(input = {}) {
  const s = islandSnapshot(input);
  const base = hash01(`${s.seed}:specimen-trail`);
  const count = s.waterClarity > 0.72 ? 5 : 4;
  return Array.from({ length: count }, (_, i) => {
    const angle = base * Math.PI * 2 + i * 1.19;
    const radius = 24 + i * 6 + s.tide * 5;
    return descriptor("cozy-island.tidepool-specimen-trail", `specimen-trail-${i + 1}`, polarPoint(radius, angle, 0.18), {
      visibility: round(clamp01(s.waterClarity - s.tide * 0.16 + i * 0.03)),
      catalogValue: Math.round(40 + s.waterClarity * 90 + i * 18),
      slipRisk: round(clamp01(s.tide * 0.42 + s.stormRisk * 0.34 + i * 0.02))
    });
  });
}

export function createCozyIslandHermitCrabCrossingKit(input = {}) {
  const s = islandSnapshot(input);
  const base = hash01(`${s.seed}:crab-crossing`);
  const count = s.crabActivity > 0.7 ? 4 : 3;
  return Array.from({ length: count }, (_, i) => {
    const angle = base * Math.PI * 2 + i * 2.04;
    const radius = 18 + i * 9;
    return descriptor("cozy-island.hermit-crab-crossing", `hermit-crab-crossing-${i + 1}`, polarPoint(radius, angle, 0.11), {
      crossingDensity: round(clamp01(s.crabActivity + i * 0.04)),
      quietWindow: round(clamp01(1 - s.visitorPressure + (0.5 - Math.abs(s.moonPhase - 0.5)) * 0.2)),
      detourUrgency: round(clamp01(s.crabActivity * 0.64 + s.visitorPressure * 0.3))
    });
  });
}

export function createCozyIslandShellMarkerMosaicKit(input = {}) {
  const s = islandSnapshot(input);
  const base = hash01(`${s.seed}:shell-mosaic`);
  const count = s.shellSupply < 0.32 ? 2 : 3;
  return Array.from({ length: count }, (_, i) => {
    const angle = base * Math.PI * 2 + i * 2.31;
    const radius = s.lagoonRadius - 10 + i * 7;
    return descriptor("cozy-island.shell-marker-mosaic", `shell-mosaic-${i + 1}`, polarPoint(radius, angle, 0.06), {
      markerCompleteness: round(clamp01(s.shellSupply - i * 0.08 + 0.22)),
      visitorGuidance: round(clamp01(0.42 + s.visitorPressure * 0.44 + i * 0.04)),
      repairNeed: round(clamp01(1 - s.shellSupply + s.stormRisk * 0.28 + i * 0.05))
    });
  });
}

export function createCozyIslandMoonTideSurveyKit(input = {}) {
  const s = islandSnapshot(input);
  const base = hash01(`${s.seed}:moon-tide`);
  return Array.from({ length: 3 }, (_, i) => {
    const angle = base * Math.PI * 2 + i * 2.09;
    const radius = s.reefRadius - 6 + i * 4;
    const idealMoon = 1 - Math.abs(s.moonPhase - (0.18 + i * 0.28)) * 2;
    return descriptor("cozy-island.moon-tide-survey", `moon-tide-survey-${i + 1}`, polarPoint(radius, angle, 0.2), {
      tideReadability: round(clamp01(idealMoon * 0.42 + (1 - s.stormRisk) * 0.34 + s.waterClarity * 0.24)),
      safeMinutes: Math.round(6 + (1 - s.tide) * 18 + Math.max(0, idealMoon) * 8),
      moonPhase: round(s.moonPhase)
    });
  });
}

export function createCozyIslandConservationLedgerKit(input = {}) {
  const s = islandSnapshot(input);
  const healthScore = clamp01(s.coralHealth * 0.38 + s.waterClarity * 0.24 + (1 - s.stormRisk) * 0.2 + (1 - s.visitorPressure) * 0.18);
  return [descriptor("cozy-island.conservation-ledger", "conservation-ledger-main", { x: s.camp.x + 3.4, y: s.camp.y + 0.8, z: s.camp.z - 2.6 }, {
    healthScore: round(healthScore),
    actionDebt: round(clamp01(1 - healthScore + s.stewardshipNeed * 0.25)),
    priority: healthScore < 0.52 ? "restore reef" : s.visitorPressure > 0.58 ? "reroute visitors" : "catalog specimens"
  })];
}

export function createCozyIslandTidepoolConservatoryRendererHandoffKit(readiness = {}) {
  const descriptors = [
    ...(readiness.coralNurseryBeds ?? []),
    ...(readiness.tidepoolSpecimenTrails ?? []),
    ...(readiness.hermitCrabCrossings ?? []),
    ...(readiness.shellMarkerMosaics ?? []),
    ...(readiness.moonTideSurveys ?? []),
    ...(readiness.conservationLedgers ?? [])
  ];
  return {
    kind: "cozy-island.tidepool-conservatory.renderer-handoff",
    descriptorPolicy: "renderer-consumes-descriptors-only",
    descriptors,
    counts: {
      coralNurseryBeds: readiness.coralNurseryBeds?.length ?? 0,
      tidepoolSpecimenTrails: readiness.tidepoolSpecimenTrails?.length ?? 0,
      hermitCrabCrossings: readiness.hermitCrabCrossings?.length ?? 0,
      shellMarkerMosaics: readiness.shellMarkerMosaics?.length ?? 0,
      moonTideSurveys: readiness.moonTideSurveys?.length ?? 0,
      conservationLedgers: readiness.conservationLedgers?.length ?? 0,
      total: descriptors.length
    }
  };
}

export function createCozyIslandTidepoolConservatoryReadinessDomainKit(defaultInput = {}) {
  return {
    id: "cozy-island-tidepool-conservatory-readiness-domain-kit",
    domainTree: COZY_ISLAND_TIDEPOOL_CONSERVATORY_DOMAIN_TREE,
    ownership: "headless snapshot-to-descriptor domain kit",
    atomicKits: [
      "cozy-island-coral-nursery-bed-kit",
      "cozy-island-tidepool-specimen-trail-kit",
      "cozy-island-hermit-crab-crossing-kit",
      "cozy-island-shell-marker-mosaic-kit",
      "cozy-island-moon-tide-survey-kit",
      "cozy-island-conservation-ledger-kit",
      "cozy-island-tidepool-conservatory-renderer-handoff-kit"
    ],
    evaluate(input = {}) {
      const snapshot = islandSnapshot({ ...defaultInput, ...input });
      const readiness = {
        kind: "cozy-island.tidepool-conservatory.readiness",
        snapshot,
        coralNurseryBeds: createCozyIslandCoralNurseryBedKit(snapshot),
        tidepoolSpecimenTrails: createCozyIslandTidepoolSpecimenTrailKit(snapshot),
        hermitCrabCrossings: createCozyIslandHermitCrabCrossingKit(snapshot),
        shellMarkerMosaics: createCozyIslandShellMarkerMosaicKit(snapshot),
        moonTideSurveys: createCozyIslandMoonTideSurveyKit(snapshot),
        conservationLedgers: createCozyIslandConservationLedgerKit(snapshot),
        summary: {
          stewardshipNeed: round(snapshot.stewardshipNeed),
          topConcern: snapshot.coralHealth < 0.46 ? "coral nursery" : snapshot.visitorPressure > 0.58 ? "shoreline detour" : snapshot.stormRisk > 0.62 ? "moon tide timing" : "specimen catalog"
        }
      };
      readiness.rendererHandoff = createCozyIslandTidepoolConservatoryRendererHandoffKit(readiness);
      return readiness;
    }
  };
}

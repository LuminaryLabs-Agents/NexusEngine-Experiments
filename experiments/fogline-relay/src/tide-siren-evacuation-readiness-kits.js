function stableArray(value) {
  return Array.isArray(value) ? [...value] : [];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function clamp01(value) {
  return clamp(value, 0, 1);
}

function round(value, digits = 3) {
  return Number((Number(value) || 0).toFixed(digits));
}

function routePoints(level = {}) {
  const route = stableArray(level.route);
  if (route.length) {
    return route.map((point, index) => ({
      id: point.id ?? `route-${index}`,
      x: Number(point.x ?? point.position?.x ?? 0),
      z: Number(point.z ?? point.position?.z ?? index * 7)
    }));
  }
  return [
    { id: "causeway", x: -10, z: 2 },
    { id: "tide-marker", x: -6, z: 11 },
    { id: "muster-house", x: 2, z: 20 },
    { id: "fuel-shed", x: 7, z: 30 },
    { id: "boat-slip", x: -1, z: 42 }
  ];
}

function pick(points, index) {
  if (!points.length) return { id: "fallback", x: 0, z: 0 };
  return points[Math.min(points.length - 1, Math.max(0, index))];
}

function readPlayer(game = {}) {
  const player = game.player ?? game.avatar ?? {};
  return {
    x: Number(player.x ?? player.position?.x ?? 0),
    z: Number(player.z ?? player.position?.z ?? 0),
    scan: Boolean(game.scanActive ?? game.scanning ?? player.scan)
  };
}

function routeProgress(game = {}, level = {}) {
  const player = readPlayer(game);
  const bounds = level.bounds ?? { minZ: -8, maxZ: 48 };
  return clamp01((player.z - Number(bounds.minZ ?? -8)) / Math.max(1, Number(bounds.maxZ ?? 48) - Number(bounds.minZ ?? -8)));
}

function tidePressure(input = {}) {
  const game = input.game ?? {};
  const base = Number(game.tidePressure ?? game.fogPressure ?? game.hazardPressure ?? 0.34);
  const timePulse = Math.sin(Number(input.time ?? 0) * 0.8) * 0.07;
  const scanRelief = readPlayer(game).scan ? -0.08 : 0;
  return clamp01(base + timePulse + scanRelief);
}

function notOwnRendererContract(owner) {
  return {
    owner,
    rendererConsumes: "serializable tide siren evacuation descriptors only",
    rendererMustOwn: ["screen placement", "draw order", "color application", "view interpolation"],
    rendererMustNotOwn: ["simulation state", "browser input", "DOM ownership", "collision", "asset loading", "sound", "timing loop", "Three.js runtime", "WebGL runtime", "network"]
  };
}

export const FOGLINE_TIDE_SIREN_EVACUATION_READINESS_DOMAIN_TREE = Object.freeze({
  root: "fogline-tide-siren-evacuation-readiness-domain",
  subdomains: [
    {
      id: "flood-warning-domain",
      subdomains: [
        { id: "tide-gauge-domain", kits: ["fogline-tide-gauge-stake-kit"] },
        { id: "siren-bell-domain", kits: ["fogline-siren-bell-tower-kit"] }
      ]
    },
    {
      id: "evacuation-routing-domain",
      subdomains: [
        {
          id: "boat-route-domain",
          subdomains: [
            { id: "rope-lane-domain", kits: ["fogline-boat-rope-lane-kit"] },
            { id: "family-muster-domain", kits: ["fogline-family-muster-flag-kit"] }
          ]
        }
      ]
    },
    {
      id: "departure-supply-domain",
      subdomains: [
        { id: "fuel-drum-cache-domain", kits: ["fogline-fuel-drum-cache-kit"] },
        { id: "dawn-evacuation-ledger-domain", kits: ["fogline-dawn-evacuation-ledger-kit"] }
      ]
    },
    {
      id: "renderer-handoff",
      kits: ["fogline-tide-siren-evacuation-renderer-handoff-kit"],
      contract: "renderer consumes descriptors only"
    }
  ],
  contract: "renderer consumes tide siren evacuation descriptors only; reusable kits do not own presentation, DOM, input, assets, sound, timing, physics, or graphics runtime"
});

export function createFoglineTideGaugeStakeKit() {
  return {
    id: "n-fogline-tide-gauge-stake-kit",
    domain: "fogline-tide-siren-evacuation-readiness/flood-warning/tide-gauge",
    describe(input = {}) {
      const points = routePoints(input.level);
      const pressure = tidePressure(input);
      const progress = routeProgress(input.game, input.level);
      return [pick(points, 0), pick(points, 1), pick(points, 2)].map((point, index) => {
        const crest = clamp01(pressure * 0.72 + index * 0.08 + progress * 0.18);
        return {
          id: `tide-gauge-stake-${point.id}`,
          kind: "tide-gauge-stake",
          compatibleBucket: "pressureVignettes",
          position: { x: round(point.x + index * 0.38), y: 0.2, z: round(point.z) },
          tideCrest: round(crest),
          radius: round(1.2 + crest * 1.8),
          opacity: round(0.12 + crest * 0.22),
          color: crest > 0.72 ? "#ff9d8e" : "#9deaff",
          rendererContract: notOwnRendererContract("fogline-tide-gauge-stake-kit")
        };
      });
    }
  };
}

export function createFoglineSirenBellTowerKit() {
  return {
    id: "n-fogline-siren-bell-tower-kit",
    domain: "fogline-tide-siren-evacuation-readiness/flood-warning/siren-bell",
    describe(input = {}) {
      const points = routePoints(input.level);
      const pressure = tidePressure(input);
      return [pick(points, 1), pick(points, 3)].map((point, index) => {
        const alarm = clamp01(0.26 + pressure * 0.58 + index * 0.08);
        return {
          id: `siren-bell-tower-${point.id}`,
          kind: "siren-bell-tower",
          compatibleBucket: "objectiveNeedles",
          position: { x: round(point.x + (index ? 1.2 : -0.8)), y: 0.5, z: round(point.z + 0.6) },
          alarm,
          radius: round(0.95 + alarm * 1.25),
          opacity: round(0.14 + alarm * 0.24),
          color: alarm > 0.7 ? "#ffd36d" : "#c3f7ff",
          rendererContract: notOwnRendererContract("fogline-siren-bell-tower-kit")
        };
      });
    }
  };
}

export function createFoglineBoatRopeLaneKit() {
  return {
    id: "n-fogline-boat-rope-lane-kit",
    domain: "fogline-tide-siren-evacuation-readiness/evacuation-routing/boat-route/rope-lane",
    describe(input = {}) {
      const points = routePoints(input.level);
      const pressure = tidePressure(input);
      const progress = routeProgress(input.game, input.level);
      return points.slice(1).map((point, index) => {
        const next = pick(points, index + 2);
        const dx = next.x - point.x;
        const dz = next.z - point.z;
        const clarity = clamp01(0.22 + progress * 0.46 + (readPlayer(input.game).scan ? 0.14 : 0) - pressure * 0.12 + index * 0.03);
        return {
          id: `boat-rope-lane-${point.id}-to-${next.id}`,
          kind: "boat-rope-lane",
          compatibleBucket: "routeThreads",
          position: { x: round((point.x + next.x) * 0.5), y: 0.32, z: round((point.z + next.z) * 0.5) },
          length: round(Math.hypot(dx, dz)),
          yaw: round(Math.atan2(dx, dz)),
          clarity: round(clarity),
          width: round(0.8 + clarity * 1.2),
          opacity: round(0.1 + clarity * 0.22),
          color: "#dfffb7",
          rendererContract: notOwnRendererContract("fogline-boat-rope-lane-kit")
        };
      });
    }
  };
}

export function createFoglineFamilyMusterFlagKit() {
  return {
    id: "n-fogline-family-muster-flag-kit",
    domain: "fogline-tide-siren-evacuation-readiness/evacuation-routing/boat-route/family-muster",
    describe(input = {}) {
      const points = routePoints(input.level);
      const pressure = tidePressure(input);
      const rescued = Number(input.game?.rescued ?? input.game?.familiesMustered ?? 0);
      return [pick(points, 0), pick(points, 2), pick(points, 4)].map((point, index) => {
        const urgency = clamp01(0.72 + pressure * 0.18 - rescued * 0.06 - index * 0.05);
        return {
          id: `family-muster-flag-${point.id}`,
          kind: "family-muster-flag",
          compatibleBucket: "objectiveNeedles",
          position: { x: round(point.x + index * 0.72), y: 0.38, z: round(point.z - 1.2) },
          urgency: round(urgency),
          radius: round(0.85 + urgency * 1.1),
          opacity: round(0.13 + urgency * 0.25),
          color: urgency > 0.68 ? "#ffbf9d" : "#fff3bf",
          rendererContract: notOwnRendererContract("fogline-family-muster-flag-kit")
        };
      });
    }
  };
}

export function createFoglineFuelDrumCacheKit() {
  return {
    id: "n-fogline-fuel-drum-cache-kit",
    domain: "fogline-tide-siren-evacuation-readiness/departure-supply/fuel-drum-cache",
    describe(input = {}) {
      const points = routePoints(input.level);
      const supplies = Number(input.game?.supplies ?? input.game?.fuelDrums ?? input.game?.inventory?.fuel ?? 0);
      const progress = routeProgress(input.game, input.level);
      return [pick(points, 3), pick(points, 4)].map((point, index) => {
        const fuel = clamp01(0.28 + supplies * 0.11 + progress * 0.28 + index * 0.12);
        return {
          id: `fuel-drum-cache-${point.id}`,
          kind: "fuel-drum-cache",
          compatibleBucket: "gateSigils",
          position: { x: round(point.x + (index ? -1.5 : 1.25)), y: 0.25, z: round(point.z + 1.45) },
          fuel: round(fuel),
          radius: round(0.9 + fuel * 0.78),
          opacity: round(0.12 + fuel * 0.24),
          color: fuel > 0.68 ? "#b8ff93" : "#ffe08a",
          rendererContract: notOwnRendererContract("fogline-fuel-drum-cache-kit")
        };
      });
    }
  };
}

export function createFoglineDawnEvacuationLedgerKit() {
  return {
    id: "n-fogline-dawn-evacuation-ledger-kit",
    domain: "fogline-tide-siren-evacuation-readiness/departure-supply/dawn-evacuation-ledger",
    describe(input = {}, descriptors = {}) {
      const lanes = stableArray(descriptors.boatRopeLanes);
      const fuelCaches = stableArray(descriptors.fuelDrumCaches);
      const flags = stableArray(descriptors.familyMusterFlags);
      const gaugePressure = stableArray(descriptors.tideGaugeStakes).reduce((sum, item) => sum + Number(item.tideCrest ?? 0), 0) / Math.max(1, stableArray(descriptors.tideGaugeStakes).length);
      const laneClarity = lanes.reduce((sum, item) => sum + Number(item.clarity ?? 0), 0) / Math.max(1, lanes.length);
      const fuel = fuelCaches.reduce((sum, item) => sum + Number(item.fuel ?? 0), 0) / Math.max(1, fuelCaches.length);
      const readiness = clamp01(laneClarity * 0.38 + fuel * 0.34 + routeProgress(input.game, input.level) * 0.18 + (readPlayer(input.game).scan ? 0.1 : 0) - gaugePressure * 0.1);
      const points = routePoints(input.level);
      const slip = pick(points, points.length - 1);
      return [{
        id: "dawn-evacuation-ledger-primary",
        kind: "dawn-evacuation-ledger",
        compatibleBucket: "gateSigils",
        position: { x: round(slip.x), y: 0.6, z: round(slip.z + 2.4) },
        readiness: round(readiness),
        pendingFamilies: flags.filter((flag) => flag.urgency > 0.56).length,
        tidePressure: round(gaugePressure),
        phase: readiness > 0.74 ? "launch" : readiness > 0.48 ? "muster" : "warning",
        radius: round(1.25 + readiness * 1.85),
        opacity: round(0.15 + readiness * 0.25),
        color: readiness > 0.74 ? "#d7ffad" : "#ffe7a3",
        rendererContract: notOwnRendererContract("fogline-dawn-evacuation-ledger-kit")
      }];
    }
  };
}

export function createFoglineTideSirenEvacuationRendererHandoffKit() {
  return {
    id: "n-fogline-tide-siren-evacuation-renderer-handoff-kit",
    domain: "fogline-tide-siren-evacuation-readiness/renderer-handoff",
    describe(parts = {}) {
      const drawOrder = [
        ...stableArray(parts.tideGaugeStakes),
        ...stableArray(parts.boatRopeLanes),
        ...stableArray(parts.sirenBellTowers),
        ...stableArray(parts.familyMusterFlags),
        ...stableArray(parts.fuelDrumCaches),
        ...stableArray(parts.dawnEvacuationLedger)
      ];
      return {
        id: "fogline-tide-siren-evacuation-renderer-handoff",
        policy: "renderer-consumes-descriptors-only",
        descriptors: drawOrder,
        counts: {
          tideGaugeStakes: stableArray(parts.tideGaugeStakes).length,
          sirenBellTowers: stableArray(parts.sirenBellTowers).length,
          boatRopeLanes: stableArray(parts.boatRopeLanes).length,
          familyMusterFlags: stableArray(parts.familyMusterFlags).length,
          fuelDrumCaches: stableArray(parts.fuelDrumCaches).length,
          dawnEvacuationLedger: stableArray(parts.dawnEvacuationLedger).length,
          total: drawOrder.length
        },
        ownership: notOwnRendererContract("fogline-tide-siren-evacuation-renderer-handoff-kit")
      };
    }
  };
}

export function createFoglineTideSirenEvacuationReadinessDomainKit() {
  const tideGaugeStakeKit = createFoglineTideGaugeStakeKit();
  const sirenBellTowerKit = createFoglineSirenBellTowerKit();
  const boatRopeLaneKit = createFoglineBoatRopeLaneKit();
  const familyMusterFlagKit = createFoglineFamilyMusterFlagKit();
  const fuelDrumCacheKit = createFoglineFuelDrumCacheKit();
  const dawnEvacuationLedgerKit = createFoglineDawnEvacuationLedgerKit();
  const rendererHandoffKit = createFoglineTideSirenEvacuationRendererHandoffKit();
  return {
    id: "n-fogline-tide-siren-evacuation-readiness-domain-kit",
    domain: "fogline-tide-siren-evacuation-readiness",
    tree: FOGLINE_TIDE_SIREN_EVACUATION_READINESS_DOMAIN_TREE,
    kits: [
      tideGaugeStakeKit,
      sirenBellTowerKit,
      boatRopeLaneKit,
      familyMusterFlagKit,
      fuelDrumCacheKit,
      dawnEvacuationLedgerKit,
      rendererHandoffKit
    ],
    describe(input = {}) {
      const tideGaugeStakes = tideGaugeStakeKit.describe(input);
      const sirenBellTowers = sirenBellTowerKit.describe(input);
      const boatRopeLanes = boatRopeLaneKit.describe(input);
      const familyMusterFlags = familyMusterFlagKit.describe(input);
      const fuelDrumCaches = fuelDrumCacheKit.describe(input);
      const dawnEvacuationLedger = dawnEvacuationLedgerKit.describe(input, { tideGaugeStakes, boatRopeLanes, familyMusterFlags, fuelDrumCaches });
      const rendererHandoff = rendererHandoffKit.describe({ tideGaugeStakes, sirenBellTowers, boatRopeLanes, familyMusterFlags, fuelDrumCaches, dawnEvacuationLedger });
      const readiness = dawnEvacuationLedger[0]?.readiness ?? 0;
      const tidePressureValue = dawnEvacuationLedger[0]?.tidePressure ?? 0;
      return {
        id: "fogline-tide-siren-evacuation-readiness",
        missionState: readiness > 0.74 ? "launch" : readiness > 0.48 ? "muster" : "warning",
        readiness,
        tidePressure: tidePressureValue,
        tideGaugeStakes,
        sirenBellTowers,
        boatRopeLanes,
        familyMusterFlags,
        fuelDrumCaches,
        dawnEvacuationLedger,
        drawOrder: rendererHandoff.descriptors,
        rendererHandoff,
        tree: this.tree
      };
    },
    snapshot(input = {}) {
      const described = this.describe(input);
      return {
        missionState: described.missionState,
        readiness: described.readiness,
        tidePressure: described.tidePressure,
        descriptors: described.drawOrder.length
      };
    }
  };
}

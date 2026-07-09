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
      z: Number(point.z ?? point.position?.z ?? index * 6)
    }));
  }
  return [
    { id: "dock", x: -8, z: 4 },
    { id: "generator", x: -3, z: 12 },
    { id: "battery-cache", x: 4, z: 20 },
    { id: "fresnel-house", x: 8, z: 30 },
    { id: "lighthouse", x: 0, z: 40 }
  ];
}

function readPlayer(game = {}) {
  const player = game.player ?? game.avatar ?? {};
  return {
    x: Number(player.x ?? player.position?.x ?? 0),
    z: Number(player.z ?? player.position?.z ?? 0),
    scan: Boolean(game.scanActive ?? game.scanning ?? player.scan)
  };
}

function progressFromGame(game = {}, level = {}) {
  const player = readPlayer(game);
  const bounds = level.bounds ?? { minZ: -8, maxZ: 48 };
  return clamp01((player.z - Number(bounds.minZ ?? -8)) / Math.max(1, Number(bounds.maxZ ?? 48) - Number(bounds.minZ ?? -8)));
}

function pick(points, index) {
  if (!points.length) return { id: "fallback", x: 0, z: 0 };
  return points[Math.min(points.length - 1, Math.max(0, index))];
}

function notOwnRendererContract(owner) {
  return {
    owner,
    rendererConsumes: "serializable lighthouse battery descriptors only",
    rendererMustOwn: ["placement", "draw order", "color application", "view interpolation"],
    rendererMustNotOwn: ["simulation state", "input", "collision", "scan state", "asset loading", "sound", "timing loop", "3D runtime", "GPU runtime"]
  };
}

export const FOGLINE_LIGHTHOUSE_BATTERY_READINESS_DOMAIN_TREE = Object.freeze({
  root: "fogline-lighthouse-battery-readiness-domain",
  subdomains: [
    {
      id: "power-source-domain",
      subdomains: [
        { id: "hand-crank-generator-domain", kits: ["fogline-hand-crank-generator-kit"] },
        { id: "battery-cache-domain", kits: ["fogline-battery-cache-kit"] }
      ]
    },
    {
      id: "beam-routing-domain",
      subdomains: [
        {
          id: "fresnel-alignment-domain",
          subdomains: [
            { id: "lens-angle-domain", kits: ["fogline-fresnel-alignment-kit"] },
            { id: "fog-breach-domain", kits: ["fogline-fog-breach-window-kit"] }
          ]
        }
      ]
    },
    {
      id: "evacuation-signal-domain",
      subdomains: [
        { id: "family-signal-flare-domain", kits: ["fogline-family-signal-flare-kit"] },
        { id: "dawn-beam-ledger-domain", kits: ["fogline-dawn-beam-ledger-kit"] }
      ]
    },
    {
      id: "renderer-handoff",
      kits: ["fogline-lighthouse-battery-renderer-handoff-kit"],
      contract: "renderer consumes descriptors only"
    }
  ],
  contract: "renderer consumes lighthouse battery descriptors only; reusable kits do not own presentation, input, assets, sound, timing, or graphics runtime"
});

export function createFoglineHandCrankGeneratorKit() {
  return {
    id: "n-fogline-hand-crank-generator-kit",
    domain: "fogline-lighthouse-battery-readiness/power-source/hand-crank-generator",
    describe(input = {}) {
      const points = routePoints(input.level);
      const progress = progressFromGame(input.game, input.level);
      return [pick(points, 1), pick(points, 2)].map((point, index) => {
        const charge = clamp01(0.32 + progress * 0.34 + (input.game?.scanActive ? 0.18 : 0) - index * 0.08);
        return {
          id: `hand-crank-generator-${point.id}`,
          kind: "hand-crank-generator",
          compatibleBucket: "objectiveNeedles",
          position: { x: round(point.x), y: 0.2, z: round(point.z) },
          charge: round(charge),
          radius: round(1.1 + charge * 0.8),
          opacity: round(0.12 + charge * 0.26),
          color: charge > 0.62 ? "#fff2a8" : "#9deaff",
          rendererContract: notOwnRendererContract("fogline-hand-crank-generator-kit")
        };
      });
    }
  };
}

export function createFoglineBatteryCacheKit() {
  return {
    id: "n-fogline-battery-cache-kit",
    domain: "fogline-lighthouse-battery-readiness/power-source/battery-cache",
    describe(input = {}) {
      const points = routePoints(input.level);
      const collected = Number(input.game?.supplies ?? input.game?.inventory?.batteries ?? input.game?.rescued ?? 0);
      return [pick(points, 2), pick(points, 3)].map((point, index) => {
        const reserve = clamp01(0.38 + collected * 0.12 + index * 0.1);
        return {
          id: `battery-cache-${point.id}`,
          kind: "battery-cache",
          compatibleBucket: "gateSigils",
          position: { x: round(point.x + (index ? 1.4 : -1.2)), y: 0.25, z: round(point.z + 1.8) },
          reserve: round(reserve),
          radius: round(0.9 + reserve * 0.6),
          opacity: round(0.14 + reserve * 0.22),
          color: reserve > 0.65 ? "#b9ff9d" : "#ffe38a",
          rendererContract: notOwnRendererContract("fogline-battery-cache-kit")
        };
      });
    }
  };
}

export function createFoglineFresnelAlignmentKit() {
  return {
    id: "n-fogline-fresnel-alignment-kit",
    domain: "fogline-lighthouse-battery-readiness/beam-routing/fresnel-alignment",
    describe(input = {}) {
      const points = routePoints(input.level);
      const progress = progressFromGame(input.game, input.level);
      return points.slice(1).map((point, index) => {
        const next = pick(points, index + 2);
        const dx = next.x - point.x;
        const dz = next.z - point.z;
        return {
          id: `fresnel-alignment-${point.id}-to-${next.id}`,
          kind: "fresnel-alignment-thread",
          compatibleBucket: "routeThreads",
          position: { x: round((point.x + next.x) * 0.5), y: 0.3, z: round((point.z + next.z) * 0.5) },
          length: round(Math.hypot(dx, dz)),
          yaw: round(Math.atan2(dx, dz)),
          alignment: round(clamp01(0.26 + progress * 0.48 + index * 0.05)),
          width: round(0.8 + progress * 0.8),
          opacity: round(0.09 + progress * 0.2),
          color: "#fff7c2",
          rendererContract: notOwnRendererContract("fogline-fresnel-alignment-kit")
        };
      });
    }
  };
}

export function createFoglineFogBreachWindowKit() {
  return {
    id: "n-fogline-fog-breach-window-kit",
    domain: "fogline-lighthouse-battery-readiness/beam-routing/fog-breach-window",
    describe(input = {}) {
      const points = routePoints(input.level);
      const progress = progressFromGame(input.game, input.level);
      return [pick(points, 2), pick(points, 3), pick(points, 4)].map((point, index) => {
        const breach = clamp01(0.24 + progress * 0.4 + Math.sin((Number(input.time) || 0) + index) * 0.08);
        return {
          id: `fog-breach-window-${point.id}`,
          kind: "fog-breach-window",
          compatibleBucket: "pressureVignettes",
          position: { x: round(point.x), y: 0.1, z: round(point.z) },
          breach: round(breach),
          radius: round(2.2 + breach * 2.6),
          opacity: round(0.08 + breach * 0.18),
          color: "#bafcff",
          rendererContract: notOwnRendererContract("fogline-fog-breach-window-kit")
        };
      });
    }
  };
}

export function createFoglineFamilySignalFlareKit() {
  return {
    id: "n-fogline-family-signal-flare-kit",
    domain: "fogline-lighthouse-battery-readiness/evacuation-signal/family-signal-flare",
    describe(input = {}) {
      const points = routePoints(input.level);
      const progress = progressFromGame(input.game, input.level);
      return [pick(points, 0), pick(points, 2), pick(points, 4)].map((point, index) => {
        const urgency = clamp01(0.68 - progress * 0.22 + index * 0.07);
        return {
          id: `family-signal-flare-${point.id}`,
          kind: "family-signal-flare",
          compatibleBucket: "objectiveNeedles",
          position: { x: round(point.x + index * 0.55), y: 0.35, z: round(point.z - 1.25) },
          urgency: round(urgency),
          radius: round(1.0 + urgency * 1.1),
          opacity: round(0.14 + urgency * 0.24),
          color: urgency > 0.7 ? "#ffb067" : "#ffd6a8",
          rendererContract: notOwnRendererContract("fogline-family-signal-flare-kit")
        };
      });
    }
  };
}

export function createFoglineDawnBeamLedgerKit() {
  return {
    id: "n-fogline-dawn-beam-ledger-kit",
    domain: "fogline-lighthouse-battery-readiness/evacuation-signal/dawn-beam-ledger",
    describe(input = {}, descriptors = {}) {
      const generators = stableArray(descriptors.handCrankGenerators);
      const caches = stableArray(descriptors.batteryCaches);
      const flares = stableArray(descriptors.familySignalFlares);
      const readiness = clamp01((generators.reduce((sum, item) => sum + item.charge, 0) / Math.max(1, generators.length)) * 0.38 + (caches.reduce((sum, item) => sum + item.reserve, 0) / Math.max(1, caches.length)) * 0.34 + progressFromGame(input.game, input.level) * 0.28);
      const points = routePoints(input.level);
      const lighthouse = pick(points, points.length - 1);
      return [{
        id: "dawn-beam-ledger-primary",
        kind: "dawn-beam-ledger",
        compatibleBucket: "gateSigils",
        position: { x: round(lighthouse.x), y: 0.6, z: round(lighthouse.z + 2.5) },
        readiness: round(readiness),
        pendingFlares: flares.filter((flare) => flare.urgency > 0.55).length,
        phase: readiness > 0.74 ? "broadcast" : readiness > 0.48 ? "charging" : "dark",
        radius: round(1.3 + readiness * 1.8),
        opacity: round(0.16 + readiness * 0.24),
        color: readiness > 0.74 ? "#d7ffad" : "#fff2a8",
        rendererContract: notOwnRendererContract("fogline-dawn-beam-ledger-kit")
      }];
    }
  };
}

export function createFoglineLighthouseBatteryRendererHandoffKit() {
  return {
    id: "n-fogline-lighthouse-battery-renderer-handoff-kit",
    domain: "fogline-lighthouse-battery-readiness/renderer-handoff",
    describe(parts = {}) {
      const drawOrder = [
        ...stableArray(parts.fogBreachWindows),
        ...stableArray(parts.fresnelAlignments),
        ...stableArray(parts.handCrankGenerators),
        ...stableArray(parts.batteryCaches),
        ...stableArray(parts.familySignalFlares),
        ...stableArray(parts.dawnBeamLedger)
      ];
      return {
        id: "fogline-lighthouse-battery-renderer-handoff",
        policy: "renderer-consumes-descriptors-only",
        descriptors: drawOrder,
        counts: {
          handCrankGenerators: stableArray(parts.handCrankGenerators).length,
          batteryCaches: stableArray(parts.batteryCaches).length,
          fresnelAlignments: stableArray(parts.fresnelAlignments).length,
          fogBreachWindows: stableArray(parts.fogBreachWindows).length,
          familySignalFlares: stableArray(parts.familySignalFlares).length,
          dawnBeamLedger: stableArray(parts.dawnBeamLedger).length,
          total: drawOrder.length
        },
        ownership: notOwnRendererContract("fogline-lighthouse-battery-renderer-handoff-kit")
      };
    }
  };
}

export function createFoglineLighthouseBatteryReadinessDomainKit() {
  const handCrankGeneratorKit = createFoglineHandCrankGeneratorKit();
  const batteryCacheKit = createFoglineBatteryCacheKit();
  const fresnelAlignmentKit = createFoglineFresnelAlignmentKit();
  const fogBreachWindowKit = createFoglineFogBreachWindowKit();
  const familySignalFlareKit = createFoglineFamilySignalFlareKit();
  const dawnBeamLedgerKit = createFoglineDawnBeamLedgerKit();
  const rendererHandoffKit = createFoglineLighthouseBatteryRendererHandoffKit();
  return {
    id: "n-fogline-lighthouse-battery-readiness-domain-kit",
    domain: "fogline-lighthouse-battery-readiness",
    tree: FOGLINE_LIGHTHOUSE_BATTERY_READINESS_DOMAIN_TREE,
    kits: [
      handCrankGeneratorKit,
      batteryCacheKit,
      fresnelAlignmentKit,
      fogBreachWindowKit,
      familySignalFlareKit,
      dawnBeamLedgerKit,
      rendererHandoffKit
    ],
    describe(input = {}) {
      const handCrankGenerators = handCrankGeneratorKit.describe(input);
      const batteryCaches = batteryCacheKit.describe(input);
      const fresnelAlignments = fresnelAlignmentKit.describe(input);
      const fogBreachWindows = fogBreachWindowKit.describe(input);
      const familySignalFlares = familySignalFlareKit.describe(input);
      const dawnBeamLedger = dawnBeamLedgerKit.describe(input, { handCrankGenerators, batteryCaches, familySignalFlares });
      const rendererHandoff = rendererHandoffKit.describe({ handCrankGenerators, batteryCaches, fresnelAlignments, fogBreachWindows, familySignalFlares, dawnBeamLedger });
      const readiness = dawnBeamLedger[0]?.readiness ?? 0;
      return {
        id: "fogline-lighthouse-battery-readiness",
        missionState: readiness > 0.74 ? "broadcast" : readiness > 0.48 ? "charging" : "dark",
        readiness,
        handCrankGenerators,
        batteryCaches,
        fresnelAlignments,
        fogBreachWindows,
        familySignalFlares,
        dawnBeamLedger,
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
        descriptors: described.drawOrder.length
      };
    }
  };
}

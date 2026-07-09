export const FOGLINE_RIDGE_AMBULANCE_DOMAIN_TREE = `fogline-ridge-ambulance-readiness-domain
├─ casualty-location-domain
│  ├─ injured-runner-domain
│  │  └─ fogline-injured-runner-beacon-kit
│  └─ triage-sash-domain
│     └─ fogline-triage-sash-route-kit
├─ medical-supply-domain
│  ├─ stretcher-cache-domain
│  │  └─ fogline-stretcher-cache-kit
│  └─ oxygen-lantern-domain
│     └─ fogline-oxygen-lantern-kit
├─ extraction-handoff-domain
│  ├─ medic-radio-domain
│  │  └─ fogline-medic-radio-ping-kit
│  └─ ambulance-gate-domain
│     └─ fogline-ambulance-gate-window-kit
└─ renderer-handoff
   └─ fogline-ridge-ambulance-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export const FOGLINE_RIDGE_AMBULANCE_KIT_NAMES = Object.freeze([
  "fogline-injured-runner-beacon-kit",
  "fogline-triage-sash-route-kit",
  "fogline-stretcher-cache-kit",
  "fogline-oxygen-lantern-kit",
  "fogline-medic-radio-ping-kit",
  "fogline-ambulance-gate-window-kit",
  "fogline-ridge-ambulance-renderer-handoff-kit",
  "fogline-ridge-ambulance-readiness-domain-kit"
]);

const BUCKET_ARCHETYPES = Object.freeze({
  routeThreads: "fogline.route.thread",
  relayAuras: "fogline.relay.aura",
  scanCones: "fogline.scan.cone",
  objectiveNeedles: "fogline.objective.needle",
  gateSigils: "fogline.gate.sigil",
  safePockets: "fogline.safe.pocket",
  pressureVignettes: "fogline.pressure.vignette"
});

const OWNERSHIP = Object.freeze({
  renderer: "consume-only",
  dom: "excluded",
  browserInput: "excluded",
  three: "excluded",
  webgl: "excluded",
  audio: "excluded",
  assets: "excluded",
  frameLoop: "excluded",
  physics: "excluded"
});

function clamp01(value) {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function safeNumber(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function pointOf(value = {}, fallback = {}) {
  return {
    x: safeNumber(value.x, safeNumber(fallback.x, 0)),
    z: safeNumber(value.z, safeNumber(fallback.z, 0))
  };
}

function midpoint(a = {}, b = {}) {
  return {
    x: (safeNumber(a.x) + safeNumber(b.x)) * 0.5,
    z: (safeNumber(a.z) + safeNumber(b.z)) * 0.5
  };
}

function distance(a = {}, b = {}) {
  return Math.hypot(safeNumber(b.x) - safeNumber(a.x), safeNumber(b.z) - safeNumber(a.z));
}

function yawBetween(a = {}, b = {}) {
  return Math.atan2(safeNumber(b.x) - safeNumber(a.x), safeNumber(b.z) - safeNumber(a.z));
}

function scanProgress(relay = {}) {
  if (relay.scanned) return 1;
  return clamp01(safeNumber(relay.scanProgress, 0));
}

function medicalPressure(game = {}, level = {}) {
  const relays = game.relays ?? level.relays ?? [];
  const wraiths = game.wraiths ?? level.wraiths ?? [];
  const scanRatio = clamp01(relays.reduce((total, relay) => total + scanProgress(relay), 0) / Math.max(1, relays.length));
  const elapsed = safeNumber(game.stats?.elapsed, 0);
  const budget = Math.max(1, safeNumber(game.stats?.timeBudget, 420));
  const chaseRatio = clamp01(wraiths.filter((wraith) => wraith.mode === "chase").length / Math.max(1, wraiths.length));
  const routeDebt = clamp01(1 - scanRatio);
  return clamp01(0.18 + routeDebt * 0.34 + clamp01(elapsed / budget) * 0.26 + chaseRatio * 0.22);
}

function descriptor({ id, archetype, bucket, position, yaw = 0, radius = 1, width = 1, length = 1, opacity = 0.1, color = "#bafcff", extra = {} }) {
  return {
    id,
    archetype,
    originalArchetype: archetype,
    compatibleBucket: bucket,
    compatibleArchetype: BUCKET_ARCHETYPES[bucket] ?? archetype,
    position: pointOf(position),
    yaw: safeNumber(yaw),
    radius: Math.max(0.1, safeNumber(radius, 1)),
    width: Math.max(0.1, safeNumber(width, 1)),
    length: Math.max(0.1, safeNumber(length, 1)),
    opacity: clamp01(opacity),
    color,
    ...extra
  };
}

function routePoint(route = [], ratio = 0.5, fallback = {}) {
  if (!route.length) return pointOf(fallback);
  const index = Math.max(0, Math.min(route.length - 1, Math.round((route.length - 1) * clamp01(ratio))));
  return pointOf(route[index], fallback);
}

export function createFoglineInjuredRunnerBeaconKit() {
  return {
    id: "fogline-injured-runner-beacon-kit",
    describe(input = {}) {
      const level = input.level ?? {};
      const game = input.game ?? {};
      const route = input.route ?? level.route ?? [];
      const player = game.player ?? level.spawn ?? route[0] ?? {};
      const pressure = medicalPressure(game, level);
      const fallback = routePoint(route, 0.72, level.gate ?? player);
      const wraiths = game.wraiths ?? level.wraiths ?? [];
      const sources = wraiths.length ? wraiths.slice(0, 3) : [fallback];
      return sources.map((source, index) => {
        const urgency = clamp01(pressure + index * 0.08 + distance(player, source) / 120);
        return descriptor({
          id: `injured-runner-beacon-${source.id ?? index}`,
          archetype: "fogline.ridge.ambulance.injured.runner.beacon",
          bucket: "objectiveNeedles",
          position: midpoint(source, fallback),
          yaw: yawBetween(player, source),
          radius: 1.6 + urgency * 3.9,
          width: 0.3 + urgency * 0.62,
          opacity: 0.08 + urgency * 0.18,
          color: urgency > 0.72 ? "#ff8ea1" : "#ffd68a",
          extra: { urgency, casualtyIndex: index + 1, needsEscort: urgency > 0.52 }
        });
      });
    }
  };
}

export function createFoglineTriageSashRouteKit() {
  return {
    id: "fogline-triage-sash-route-kit",
    describe(input = {}) {
      const level = input.level ?? {};
      const route = input.route ?? level.route ?? [];
      const pressure = medicalPressure(input.game, level);
      return route.slice(0, -1).map((point, index) => {
        const next = route[index + 1];
        const segmentLength = distance(point, next);
        const triageLoad = clamp01(pressure + index / Math.max(1, route.length) * 0.28);
        return descriptor({
          id: `triage-sash-route-${index + 1}`,
          archetype: "fogline.ridge.ambulance.triage.sash.route",
          bucket: "routeThreads",
          position: midpoint(point, next),
          yaw: yawBetween(point, next),
          length: segmentLength,
          width: 0.28 + triageLoad * 0.55,
          opacity: 0.05 + triageLoad * 0.14,
          color: triageLoad > 0.68 ? "#ffcab0" : "#b6f7ff",
          extra: { segmentLength, triageLoad, sashCount: Math.max(1, Math.round(segmentLength / 4)) }
        });
      });
    }
  };
}

export function createFoglineStretcherCacheKit() {
  return {
    id: "fogline-stretcher-cache-kit",
    describe(input = {}) {
      const level = input.level ?? {};
      const game = input.game ?? {};
      const route = input.route ?? level.route ?? [];
      const pressure = medicalPressure(game, level);
      const points = [routePoint(route, 0.25, level.spawn), routePoint(route, 0.55, level.gate), routePoint(route, 0.82, level.gate)];
      return points.map((point, index) => {
        const readiness = clamp01(0.78 - pressure * 0.25 + scanProgress((game.relays ?? level.relays ?? [])[index]) * 0.25);
        return descriptor({
          id: `stretcher-cache-${index + 1}`,
          archetype: "fogline.ridge.ambulance.stretcher.cache",
          bucket: "safePockets",
          position: { x: point.x + (index - 1) * 1.7, z: point.z - 1.1 },
          yaw: index * 0.35,
          radius: 1.8 + readiness * 3.1,
          width: 0.28 + readiness * 0.42,
          opacity: 0.06 + readiness * 0.13,
          color: readiness > 0.55 ? "#caffb0" : "#ffb06d",
          extra: { readiness, foldedStretchers: 1 + index }
        });
      });
    }
  };
}

export function createFoglineOxygenLanternKit() {
  return {
    id: "fogline-oxygen-lantern-kit",
    describe(input = {}) {
      const level = input.level ?? {};
      const relays = input.game?.relays ?? level.relays ?? [];
      const pressure = medicalPressure(input.game, level);
      return relays.map((relay, index) => {
        const charge = clamp01(scanProgress(relay) * 0.62 + (1 - pressure) * 0.26 + 0.12);
        return descriptor({
          id: `oxygen-lantern-${relay.id ?? index}`,
          archetype: "fogline.ridge.ambulance.oxygen.lantern",
          bucket: index % 2 === 0 ? "relayAuras" : "scanCones",
          position: relay,
          yaw: safeNumber(relay.yaw, 0) + pressure * 0.34,
          radius: 2.2 + charge * 4.8,
          width: 0.24 + charge * 0.5,
          length: 3.2 + charge * 6.5,
          opacity: 0.05 + charge * 0.17,
          color: charge > 0.58 ? "#9fffe9" : "#ffc28d",
          extra: { charge, oxygenMinutes: Math.round(4 + charge * 18) }
        });
      });
    }
  };
}

export function createFoglineMedicRadioPingKit() {
  return {
    id: "fogline-medic-radio-ping-kit",
    describe(input = {}) {
      const level = input.level ?? {};
      const game = input.game ?? {};
      const relays = game.relays ?? level.relays ?? [];
      const pressure = medicalPressure(game, level);
      const active = relays.filter((relay) => scanProgress(relay) > 0.35);
      const sources = active.length ? active : relays.slice(0, 2);
      return sources.map((relay, index) => {
        const clarity = clamp01(scanProgress(relay) * 0.7 + (1 - pressure) * 0.3);
        return descriptor({
          id: `medic-radio-ping-${relay.id ?? index}`,
          archetype: "fogline.ridge.ambulance.medic.radio.ping",
          bucket: "scanCones",
          position: { x: safeNumber(relay.x) + 1.1, z: safeNumber(relay.z) + 0.9 },
          yaw: safeNumber(game.player?.yaw, 0) + index * 0.5,
          radius: 1.5 + clarity * 4.4,
          width: 0.25 + clarity * 0.46,
          length: 4 + clarity * 8,
          opacity: 0.05 + clarity * 0.18,
          color: clarity > 0.62 ? "#baffff" : "#ff87ab",
          extra: { clarity, channel: `MED-${index + 1}`, acknowledged: clarity > 0.5 }
        });
      });
    }
  };
}

export function createFoglineAmbulanceGateWindowKit() {
  return {
    id: "fogline-ambulance-gate-window-kit",
    describe(input = {}) {
      const level = input.level ?? {};
      const game = input.game ?? {};
      const gate = game.gate ?? level.gate ?? routePoint(input.route ?? level.route ?? [], 1, {});
      const relays = game.relays ?? level.relays ?? [];
      const scanRatio = clamp01(relays.reduce((total, relay) => total + scanProgress(relay), 0) / Math.max(1, relays.length));
      const pressure = medicalPressure(game, level);
      const windowOpen = clamp01(scanRatio * 0.75 + (1 - pressure) * 0.25);
      return [
        descriptor({
          id: "ambulance-gate-window",
          archetype: "fogline.ridge.ambulance.gate.window",
          bucket: "gateSigils",
          position: gate,
          radius: 2.4 + windowOpen * 5.6,
          width: 0.4 + windowOpen * 0.62,
          opacity: 0.08 + windowOpen * 0.18,
          color: windowOpen > 0.64 ? "#fff5a6" : "#ff9f80",
          extra: { windowOpen, ambulanceEtaSeconds: Math.round(90 - windowOpen * 54 + pressure * 18) }
        }),
        descriptor({
          id: "ambulance-fog-gap-pressure",
          archetype: "fogline.ridge.ambulance.fog.gap.pressure",
          bucket: "pressureVignettes",
          position: { x: safeNumber(gate.x) - 3.4, z: safeNumber(gate.z) - 2.2 },
          radius: 2 + pressure * 4.6,
          width: 0.36 + pressure * 0.52,
          opacity: 0.05 + pressure * 0.16,
          color: pressure > 0.72 ? "#ff7894" : "#c7c2ff",
          extra: { pressure, fogGapStable: pressure < 0.76 }
        })
      ];
    }
  };
}

export function createFoglineRidgeAmbulanceRendererHandoffKit() {
  return {
    id: "fogline-ridge-ambulance-renderer-handoff-kit",
    describe(domain = {}) {
      const descriptors = domain.drawOrder ?? [];
      return {
        id: "fogline-ridge-ambulance-renderer-handoff",
        archetype: "fogline.ridge.ambulance.renderer.handoff",
        policy: "renderer-consumes-descriptors-only",
        descriptorCount: descriptors.length,
        descriptors,
        counts: {
          injuredRunnerBeacons: domain.injuredRunnerBeacons?.length ?? 0,
          triageSashRoutes: domain.triageSashRoutes?.length ?? 0,
          stretcherCaches: domain.stretcherCaches?.length ?? 0,
          oxygenLanterns: domain.oxygenLanterns?.length ?? 0,
          medicRadioPings: domain.medicRadioPings?.length ?? 0,
          ambulanceGateWindows: domain.ambulanceGateWindows?.length ?? 0
        },
        ownership: { ...OWNERSHIP }
      };
    }
  };
}

export function createFoglineRidgeAmbulanceReadinessDomainKit() {
  const injuredRunnerBeaconKit = createFoglineInjuredRunnerBeaconKit();
  const triageSashRouteKit = createFoglineTriageSashRouteKit();
  const stretcherCacheKit = createFoglineStretcherCacheKit();
  const oxygenLanternKit = createFoglineOxygenLanternKit();
  const medicRadioPingKit = createFoglineMedicRadioPingKit();
  const ambulanceGateWindowKit = createFoglineAmbulanceGateWindowKit();
  const rendererHandoffKit = createFoglineRidgeAmbulanceRendererHandoffKit();
  return {
    id: "fogline-ridge-ambulance-readiness-domain-kit",
    tree: FOGLINE_RIDGE_AMBULANCE_DOMAIN_TREE,
    kitNames: FOGLINE_RIDGE_AMBULANCE_KIT_NAMES,
    describe(input = {}) {
      const injuredRunnerBeacons = injuredRunnerBeaconKit.describe(input);
      const triageSashRoutes = triageSashRouteKit.describe(input);
      const stretcherCaches = stretcherCacheKit.describe(input);
      const oxygenLanterns = oxygenLanternKit.describe(input);
      const medicRadioPings = medicRadioPingKit.describe(input);
      const ambulanceGateWindows = ambulanceGateWindowKit.describe(input);
      const drawOrder = [
        ...triageSashRoutes,
        ...stretcherCaches,
        ...oxygenLanterns,
        ...injuredRunnerBeacons,
        ...medicRadioPings,
        ...ambulanceGateWindows
      ];
      const domain = {
        id: "fogline-ridge-ambulance-readiness-domain",
        archetype: "fogline.ridge.ambulance.readiness.domain",
        tree: FOGLINE_RIDGE_AMBULANCE_DOMAIN_TREE,
        kitNames: FOGLINE_RIDGE_AMBULANCE_KIT_NAMES,
        injuredRunnerBeacons,
        triageSashRoutes,
        stretcherCaches,
        oxygenLanterns,
        medicRadioPings,
        ambulanceGateWindows,
        drawOrder
      };
      return {
        ...domain,
        rendererHandoff: rendererHandoffKit.describe(domain)
      };
    }
  };
}

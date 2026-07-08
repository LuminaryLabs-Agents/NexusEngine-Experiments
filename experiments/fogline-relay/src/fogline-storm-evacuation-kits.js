export const FOGLINE_STORM_EVACUATION_DOMAIN_TREE = `fogline-storm-evacuation-readiness-domain
├─ storm-warning-domain
│  ├─ thunderhead-vector-domain
│  │  └─ fogline-thunderhead-vector-kit
│  └─ radio-static-domain
│     └─ fogline-radio-static-noise-kit
├─ evacuation-support-domain
│  ├─ battery-cache-domain
│  │  └─ fogline-battery-cache-kit
│  └─ stretcher-lane-domain
│     └─ fogline-stretcher-lane-kit
├─ convoy-handoff-domain
│  ├─ convoy-rally-domain
│  │  └─ fogline-convoy-rally-marker-kit
│  └─ extraction-flare-domain
│     └─ fogline-extraction-flare-window-kit
└─ renderer-handoff
   └─ fogline-storm-evacuation-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export const FOGLINE_STORM_EVACUATION_KIT_NAMES = Object.freeze([
  "fogline-thunderhead-vector-kit",
  "fogline-radio-static-noise-kit",
  "fogline-battery-cache-kit",
  "fogline-stretcher-lane-kit",
  "fogline-convoy-rally-marker-kit",
  "fogline-extraction-flare-window-kit",
  "fogline-storm-evacuation-renderer-handoff-kit",
  "fogline-storm-evacuation-readiness-domain-kit"
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

function distance(a = {}, b = {}) {
  const ax = safeNumber(a.x);
  const az = safeNumber(a.z);
  const bx = safeNumber(b.x);
  const bz = safeNumber(b.z);
  return Math.hypot(bx - ax, bz - az);
}

function midpoint(a = {}, b = {}) {
  return {
    x: (safeNumber(a.x) + safeNumber(b.x)) * 0.5,
    z: (safeNumber(a.z) + safeNumber(b.z)) * 0.5
  };
}

function yawBetween(a = {}, b = {}) {
  return Math.atan2(safeNumber(b.x) - safeNumber(a.x), safeNumber(b.z) - safeNumber(a.z));
}

function scanProgress(relay = {}) {
  if (relay.scanned) return 1;
  return clamp01(safeNumber(relay.scanProgress, 0));
}

function evacuationPressure(game = {}, level = {}) {
  const relays = game.relays ?? level.relays ?? [];
  const scanned = relays.reduce((total, relay) => total + scanProgress(relay), 0);
  const scanRatio = clamp01(scanned / Math.max(1, relays.length));
  const elapsed = safeNumber(game.stats?.elapsed, 0);
  const budget = Math.max(1, safeNumber(game.stats?.timeBudget, 420));
  const timePressure = clamp01(elapsed / budget);
  const chasePressure = clamp01((game.wraiths ?? []).filter((wraith) => wraith.mode === "chase").length / Math.max(1, (game.wraiths ?? level.wraiths ?? []).length));
  return clamp01(0.18 + timePressure * 0.42 + chasePressure * 0.3 + (1 - scanRatio) * 0.1);
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

export function createFoglineThunderheadVectorKit() {
  return {
    id: "fogline-thunderhead-vector-kit",
    describe(input = {}) {
      const level = input.level ?? {};
      const route = input.route ?? level.route ?? [];
      const game = input.game ?? {};
      const pressure = evacuationPressure(game, level);
      return route.slice(1, 4).map((point, index) => {
        const next = route[index + 2] ?? level.gate ?? point;
        const pos = pointOf(point);
        return descriptor({
          id: `storm-vector-${index + 1}`,
          archetype: "fogline.storm.thunderhead.vector",
          bucket: "routeThreads",
          position: { x: pos.x + (index - 1) * 1.2, z: pos.z - 2.8 - pressure * 2.2 },
          yaw: yawBetween(pos, next) + 0.18,
          length: 7 + pressure * 11 + index * 1.4,
          width: 0.38 + pressure * 0.7,
          opacity: 0.09 + pressure * 0.14,
          color: "#a9dcff",
          extra: { stormPressure: pressure, evacuationPriority: 1 - index * 0.17 }
        });
      });
    }
  };
}

export function createFoglineRadioStaticNoiseKit() {
  return {
    id: "fogline-radio-static-noise-kit",
    describe(input = {}) {
      const level = input.level ?? {};
      const relays = input.game?.relays ?? level.relays ?? [];
      const pressure = evacuationPressure(input.game, level);
      return relays.map((relay, index) => {
        const progress = scanProgress(relay);
        const staticLoad = clamp01(1 - progress * 0.74 + pressure * 0.18);
        return descriptor({
          id: `radio-static-${relay.id ?? index}`,
          archetype: "fogline.storm.radio.static.noise",
          bucket: index % 2 === 0 ? "scanCones" : "relayAuras",
          position: relay,
          yaw: safeNumber(input.game?.player?.yaw, 0) + index * 0.42,
          radius: 2.6 + staticLoad * 4.4,
          length: 5 + staticLoad * 8,
          width: 0.3 + staticLoad * 0.5,
          opacity: 0.08 + staticLoad * 0.16,
          color: staticLoad > 0.65 ? "#ffb3a4" : "#98f3ff",
          extra: { staticLoad, scanProgress: progress }
        });
      });
    }
  };
}

export function createFoglineBatteryCacheKit() {
  return {
    id: "fogline-battery-cache-kit",
    describe(input = {}) {
      const level = input.level ?? {};
      const relays = input.game?.relays ?? level.relays ?? [];
      return relays.map((relay, index) => {
        const readiness = clamp01(0.25 + scanProgress(relay) * 0.62 + index * 0.035);
        return descriptor({
          id: `battery-cache-${relay.id ?? index}`,
          archetype: "fogline.evacuation.battery.cache",
          bucket: "safePockets",
          position: { x: safeNumber(relay.x) + (index - 1) * 1.5, z: safeNumber(relay.z) + 1.8 },
          radius: 1.4 + readiness * 2.2,
          width: 0.34 + readiness * 0.38,
          opacity: 0.07 + readiness * 0.12,
          color: "#ffe58a",
          extra: { readiness, charges: Math.round(1 + readiness * 4) }
        });
      });
    }
  };
}

export function createFoglineStretcherLaneKit() {
  return {
    id: "fogline-stretcher-lane-kit",
    describe(input = {}) {
      const level = input.level ?? {};
      const route = input.route ?? level.route ?? [];
      const pressure = evacuationPressure(input.game, level);
      return route.slice(0, -1).map((point, index) => {
        const next = route[index + 1];
        return descriptor({
          id: `stretcher-lane-${index + 1}`,
          archetype: "fogline.evacuation.stretcher.lane",
          bucket: "routeThreads",
          position: midpoint(point, next),
          yaw: yawBetween(point, next),
          length: distance(point, next),
          width: 0.5 + pressure * 0.64,
          opacity: 0.07 + pressure * 0.1,
          color: "#c7ffd2",
          extra: { laneLoad: clamp01(pressure + index * 0.08), stretcherSafe: pressure < 0.82 }
        });
      });
    }
  };
}

export function createFoglineConvoyRallyMarkerKit() {
  return {
    id: "fogline-convoy-rally-marker-kit",
    describe(input = {}) {
      const level = input.level ?? {};
      const route = input.route ?? level.route ?? [];
      const player = input.game?.player ?? level.spawn ?? route[0] ?? {};
      const gate = input.game?.gate ?? level.gate ?? route[route.length - 1] ?? {};
      const mid = route[Math.floor(route.length * 0.55)] ?? midpoint(player, gate);
      const pressure = evacuationPressure(input.game, level);
      return [player, mid, gate].map((point, index) => descriptor({
        id: `convoy-rally-${index + 1}`,
        archetype: "fogline.convoy.rally.marker",
        bucket: "objectiveNeedles",
        position: point,
        yaw: yawBetween(player, gate) + index * 0.35,
        radius: 1.8 + pressure * 2.8 + index * 0.4,
        width: 0.44 + pressure * 0.4,
        opacity: 0.09 + pressure * 0.12,
        color: index === 2 ? "#bafcff" : "#ffeb9a",
        extra: { rallyOrder: index + 1, convoyConfidence: clamp01(1 - pressure + index * 0.08) }
      }));
    }
  };
}

export function createFoglineExtractionFlareWindowKit() {
  return {
    id: "fogline-extraction-flare-window-kit",
    describe(input = {}) {
      const level = input.level ?? {};
      const game = input.game ?? {};
      const gate = game.gate ?? level.gate ?? {};
      const scanned = (game.relays ?? level.relays ?? []).reduce((total, relay) => total + scanProgress(relay), 0);
      const readiness = clamp01(scanned / Math.max(1, (game.relays ?? level.relays ?? []).length));
      const pressure = evacuationPressure(game, level);
      return [
        descriptor({
          id: "extraction-flare-gate-window",
          archetype: "fogline.extraction.flare.window",
          bucket: "gateSigils",
          position: gate,
          radius: 2.4 + readiness * 4.8,
          width: 0.5 + readiness * 0.5,
          opacity: 0.1 + readiness * 0.16,
          color: readiness > 0.7 ? "#c4fff1" : "#ffb06d",
          extra: { readiness, windowSeconds: Math.round(18 + readiness * 42 - pressure * 10) }
        }),
        descriptor({
          id: "extraction-flare-storm-deadline",
          archetype: "fogline.extraction.storm.deadline",
          bucket: "pressureVignettes",
          position: { x: safeNumber(gate.x) - 4.5, z: safeNumber(gate.z) - 3.5 },
          radius: 3 + pressure * 5,
          width: 0.6 + pressure * 0.6,
          opacity: 0.08 + pressure * 0.18,
          color: "#ff7082",
          extra: { stormDeadline: pressure, urgent: pressure > 0.7 }
        })
      ];
    }
  };
}

export function createFoglineStormEvacuationRendererHandoffKit() {
  return {
    id: "fogline-storm-evacuation-renderer-handoff-kit",
    describe(domain = {}) {
      const descriptors = domain.drawOrder ?? [];
      const counts = descriptors.reduce((acc, item) => {
        const key = item.originalArchetype ?? item.archetype;
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {});
      return {
        id: "fogline-storm-evacuation-renderer-handoff",
        archetype: "fogline.storm.evacuation.renderer.handoff",
        policy: "renderer-consumes-descriptors-only",
        descriptorCount: descriptors.length,
        counts,
        ownership: {
          renderer: "consume-only",
          dom: "excluded",
          browserInput: "excluded",
          three: "excluded",
          webgl: "excluded",
          audio: "excluded",
          assets: "excluded",
          frameLoop: "excluded"
        }
      };
    }
  };
}

export function createFoglineStormEvacuationReadinessDomainKit() {
  const thunderheadVectorKit = createFoglineThunderheadVectorKit();
  const radioStaticNoiseKit = createFoglineRadioStaticNoiseKit();
  const batteryCacheKit = createFoglineBatteryCacheKit();
  const stretcherLaneKit = createFoglineStretcherLaneKit();
  const convoyRallyMarkerKit = createFoglineConvoyRallyMarkerKit();
  const extractionFlareWindowKit = createFoglineExtractionFlareWindowKit();
  const rendererHandoffKit = createFoglineStormEvacuationRendererHandoffKit();
  return {
    id: "fogline-storm-evacuation-readiness-domain-kit",
    tree: FOGLINE_STORM_EVACUATION_DOMAIN_TREE,
    kitNames: FOGLINE_STORM_EVACUATION_KIT_NAMES,
    describe(input = {}) {
      const thunderheadVectors = thunderheadVectorKit.describe(input);
      const radioStaticNoiseFields = radioStaticNoiseKit.describe(input);
      const batteryCaches = batteryCacheKit.describe(input);
      const stretcherLanes = stretcherLaneKit.describe(input);
      const convoyRallyMarkers = convoyRallyMarkerKit.describe(input);
      const extractionFlareWindows = extractionFlareWindowKit.describe(input);
      const drawOrder = [
        ...stretcherLanes,
        ...batteryCaches,
        ...radioStaticNoiseFields,
        ...thunderheadVectors,
        ...convoyRallyMarkers,
        ...extractionFlareWindows
      ];
      const domain = {
        id: "fogline-storm-evacuation-readiness-domain",
        archetype: "fogline.storm.evacuation.readiness.domain",
        tree: FOGLINE_STORM_EVACUATION_DOMAIN_TREE,
        thunderheadVectors,
        radioStaticNoiseFields,
        batteryCaches,
        stretcherLanes,
        convoyRallyMarkers,
        extractionFlareWindows,
        drawOrder
      };
      return {
        ...domain,
        rendererHandoff: rendererHandoffKit.describe(domain)
      };
    }
  };
}

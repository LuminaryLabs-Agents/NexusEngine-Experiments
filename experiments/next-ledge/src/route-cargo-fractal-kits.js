const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min, max) => Math.max(min, Math.min(max, n(value, min)));
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

function ledgesFor(snapshot = {}) {
  return Array.isArray(snapshot.route?.ledges) ? snapshot.route.ledges : [];
}

function routeIdFor(snapshot = {}) {
  return String(snapshot.levelId ?? snapshot.route?.id ?? `next-ledge-sector-${n(snapshot.sector, 1)}`);
}

function staminaRatio(snapshot = {}) {
  return clamp(n(snapshot.stamina, 0) / Math.max(1, n(snapshot.constants?.maxStamina, 100)), 0, 1);
}

function cargoCapacityFor(snapshot = {}) {
  const restCount = ledgesFor(snapshot).filter((ledge) => ledge.type === "rest").length;
  return Math.max(3, restCount + 2);
}

function checkpointForLedge(ledge = {}, index = 0, snapshot = {}) {
  return {
    id: String(ledge.id ?? `ledge-${index}`),
    label: String(ledge.label ?? ledge.id ?? `Ledge ${index + 1}`),
    objective: ledge.type === "summit" ? "Deliver cargo to the summit extraction beam." : ledge.type === "rest" ? "Recover pressure and gather cargo at the rest cache." : "Cross this traversal checkpoint.",
    order: index,
    required: ledge.type === "summit" || index === 0,
    position: { x: n(ledge.x), y: n(ledge.y), z: 1 },
    radius: Math.max(1, n(ledge.r, 8)),
    tags: ["next-ledge", "route-cargo", ledge.type ?? "anchor"].filter(Boolean),
    descriptor: { kind: "route-cargo-checkpoint", cargoRole: ledge.type === "rest" ? "pickup" : ledge.type === "summit" ? "delivery" : "transit" },
    metadata: { sector: n(snapshot.sector, 1), source: "next-ledge-route-cargo-domain" }
  };
}

export const NEXT_LEDGE_ROUTE_CARGO_FRACTAL_TREE = `next-ledge-route-cargo-domain
├─ cargo-source-domain
│  ├─ cache-anchor-domain
│  │  └─ cargo-cache-anchor-kit
│  └─ shard-route-domain
│     └─ cargo-route-thread-kit
├─ extraction-pressure-domain
│  ├─ fall-risk-channel
│  │  └─ extraction-pressure-channel-kit
│  └─ rest-recovery-channel
│     └─ pressure-recovery-anchor-kit
├─ delivery-handoff-domain
│  ├─ summit-delivery-domain
│  │  └─ extraction-summit-handoff-kit
│  └─ cargo-status-readout-domain
│     └─ cargo-status-descriptor-kit
└─ renderer-handoff
   └─ route-cargo-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export function createCargoCacheAnchorKit(options = {}) {
  const cargoId = options.cargoId ?? "anchor-signal-cargo";
  return {
    id: "cargo-cache-anchor-kit",
    createResources(snapshot = {}) {
      const capacity = cargoCapacityFor(snapshot);
      return [{
        id: cargoId,
        label: "Anchor Signal Cargo",
        min: 0,
        max: capacity,
        initial: 0,
        thresholds: [
          { id: "empty", value: 0, direction: "below" },
          { id: "loaded", value: 1, direction: "above" },
          { id: "full", value: capacity, direction: "above" }
        ],
        tags: ["cargo", "signal", "next-ledge", "extraction"],
        metadata: { sector: n(snapshot.sector, 1), source: "rest-and-anchor-caches" }
      }];
    },
    describe(snapshot = {}, cargoSnapshot = null) {
      const resource = cargoSnapshot?.cargo?.resourcesById?.[cargoId] ?? cargoSnapshot?.cargo?.resources?.find?.((item) => item.id === cargoId);
      const value = n(resource?.value, 0);
      return ledgesFor(snapshot)
        .filter((ledge, index) => ledge.type === "rest" || (ledge.type === "normal" && index % 3 === 1))
        .map((ledge, index) => ({
          id: `cargo-cache:${ledge.id ?? index}`,
          kind: "cargo-cache-anchor",
          layer: "interactive",
          cargoId,
          cargoValue: value,
          active: snapshot.currentAnchorId === ledge.id,
          available: value < cargoCapacityFor(snapshot),
          position: { x: n(ledge.x), y: n(ledge.y), z: 10 + index % 3 },
          radius: Math.max(10, n(ledge.r, 8) * (ledge.type === "rest" ? 2.3 : 1.4)),
          pulse: clamp(0.22 + (ledge.type === "rest" ? 0.32 : 0.12) + (snapshot.currentAnchorId === ledge.id ? 0.34 : 0), 0.1, 1),
          styleId: ledge.type === "rest" ? "cargo-rest-cache" : "cargo-anchor-shard",
          tags: ["cargo", "pickup", ledge.type ?? "anchor"]
        }));
    }
  };
}

export function createCargoRouteThreadKit(options = {}) {
  const maxThreads = Math.max(3, Math.floor(n(options.maxThreads, 11)));
  return {
    id: "cargo-route-thread-kit",
    describe(snapshot = {}, cargoSnapshot = null) {
      const completed = new Set(cargoSnapshot?.route?.completedIds ?? []);
      const ledges = ledgesFor(snapshot).slice(0, maxThreads + 1);
      const threads = [];
      for (let i = 0; i < ledges.length - 1; i += 1) {
        const a = ledges[i];
        const b = ledges[i + 1];
        threads.push({
          id: `cargo-thread:${a.id ?? i}:${b.id ?? i + 1}`,
          kind: "cargo-route-thread",
          layer: "mid-static",
          start: { x: n(a.x), y: n(a.y), z: -3 },
          end: { x: n(b.x), y: n(b.y), z: -3 },
          completed: completed.has(a.id) && completed.has(b.id),
          active: cargoSnapshot?.route?.activeId === a.id || cargoSnapshot?.route?.activeId === b.id,
          tension: clamp(Math.hypot(n(b.x) - n(a.x), n(b.y) - n(a.y)) / 220, 0.1, 1),
          styleId: completed.has(a.id) ? "cargo-thread-complete" : "cargo-thread-pending"
        });
      }
      return threads;
    }
  };
}

export function createExtractionPressureChannelKit(options = {}) {
  const pressureId = options.pressureId ?? "fall-pressure";
  return {
    id: "extraction-pressure-channel-kit",
    createChannels(snapshot = {}) {
      const initial = ["falling", "launched", "retracting"].includes(snapshot.mode) ? 18 : staminaRatio(snapshot) < 0.25 ? 12 : 0;
      return [{
        id: pressureId,
        label: "Fall Pressure",
        min: 0,
        max: 100,
        value: clamp(initial, 0, 100),
        warningAt: 62,
        failAt: 100,
        risePerSecond: 0,
        tags: ["pressure", "fall-risk", "next-ledge", "extraction"],
        metadata: { sector: n(snapshot.sector, 1), source: "fall-and-recovery-events" }
      }];
    },
    describe(snapshot = {}, cargoSnapshot = null) {
      const channel = cargoSnapshot?.pressure?.channelsById?.[pressureId] ?? cargoSnapshot?.pressure?.channels?.find?.((item) => item.id === pressureId);
      const value = n(channel?.value, ["falling", "launched", "retracting"].includes(snapshot.mode) ? 18 : 0);
      const danger = clamp(value / 100 + (1 - staminaRatio(snapshot)) * 0.35, 0, 1);
      const player = snapshot.player ?? {};
      return [{
        id: `pressure-veil:${pressureId}`,
        kind: "extraction-pressure-veil",
        layer: "near-static",
        pressureId,
        status: channel?.status ?? (danger > 0.65 ? "warning" : "active"),
        value,
        position: { x: n(player.x), y: n(player.y) - 90, z: 26 },
        width: 260 + danger * 220,
        height: 340 + danger * 260,
        alpha: clamp(0.12 + danger * 0.48, 0.08, 0.72),
        styleId: danger > 0.65 ? "pressure-danger" : "pressure-cool"
      }];
    }
  };
}

export function createExtractionSummitHandoffKit(options = {}) {
  const cargoId = options.cargoId ?? "anchor-signal-cargo";
  return {
    id: "extraction-summit-handoff-kit",
    createRoute(snapshot = {}) {
      return {
        id: routeIdFor(snapshot),
        label: `Next Ledge Sector ${n(snapshot.sector, 1)} Cargo Extraction`,
        checkpoints: ledgesFor(snapshot).map((ledge, index) => checkpointForLedge(ledge, index, snapshot))
      };
    },
    describe(snapshot = {}, cargoSnapshot = null) {
      const resource = cargoSnapshot?.cargo?.resourcesById?.[cargoId] ?? cargoSnapshot?.cargo?.resources?.find?.((item) => item.id === cargoId);
      const cargoValue = n(resource?.value, 0);
      return ledgesFor(snapshot)
        .filter((ledge) => ledge.type === "summit")
        .map((ledge, index) => ({
          id: `extraction-summit:${ledge.id ?? index}`,
          kind: "extraction-summit-handoff",
          layer: "interactive",
          cargoId,
          cargoValue,
          deliverable: cargoValue > 0,
          completed: Boolean(snapshot.completed),
          position: { x: n(ledge.x), y: n(ledge.y), z: 18 },
          radius: Math.max(28, n(ledge.r, 10) * 3.4),
          beamHeight: 280 + cargoValue * 34,
          styleId: snapshot.completed ? "extraction-complete" : cargoValue > 0 ? "extraction-ready" : "extraction-empty"
        }));
    }
  };
}

export function createCargoStatusDescriptorKit(options = {}) {
  const cargoId = options.cargoId ?? "anchor-signal-cargo";
  return {
    id: "cargo-status-descriptor-kit",
    describe(snapshot = {}, cargoSnapshot = null) {
      const resource = cargoSnapshot?.cargo?.resourcesById?.[cargoId] ?? cargoSnapshot?.cargo?.resources?.find?.((item) => item.id === cargoId);
      const channel = cargoSnapshot?.pressure?.channelsById?.["fall-pressure"] ?? cargoSnapshot?.pressure?.channels?.find?.((item) => item.id === "fall-pressure");
      return [{
        id: "cargo-status:primary",
        kind: "cargo-status-readout",
        layer: "diagnostic",
        cargoId,
        cargoValue: n(resource?.value, 0),
        cargoCapacity: n(resource?.max, cargoCapacityFor(snapshot)),
        pressureValue: n(channel?.value, 0),
        routeStatus: cargoSnapshot?.status ?? "initializing",
        label: `Cargo ${n(resource?.value, 0)}/${n(resource?.max, cargoCapacityFor(snapshot))} · Pressure ${Math.round(n(channel?.value, 0))}`,
        styleId: n(channel?.value, 0) > 62 ? "cargo-status-danger" : n(resource?.value, 0) > 0 ? "cargo-status-loaded" : "cargo-status-empty"
      }];
    }
  };
}

export function createRouteCargoRendererHandoffKit() {
  return {
    id: "route-cargo-renderer-handoff-kit",
    describe(groups = {}) {
      const descriptors = Object.values(groups).flatMap((group) => Array.isArray(group) ? group : []);
      return {
        id: "route-cargo-renderer-handoff",
        kind: "renderer-handoff",
        descriptorCount: descriptors.length,
        descriptors: descriptors.map(clone),
        rendererContract: "renderer consumes descriptors only; route-cargo kits own no Three.js, DOM, browser input, audio, asset loading, or frame loop"
      };
    }
  };
}

export function createNextLedgeRouteCargoDomainKit(options = {}) {
  const cargoCaches = createCargoCacheAnchorKit(options.cargoCaches);
  const routeThreads = createCargoRouteThreadKit(options.routeThreads);
  const pressureChannel = createExtractionPressureChannelKit(options.pressureChannel);
  const summitHandoff = createExtractionSummitHandoffKit(options.summitHandoff);
  const statusDescriptor = createCargoStatusDescriptorKit(options.statusDescriptor);
  const rendererHandoff = createRouteCargoRendererHandoffKit();
  return {
    id: "next-ledge-route-cargo-domain-kit",
    createConfig(snapshot = {}) {
      const route = summitHandoff.createRoute(snapshot);
      return {
        kitId: "next-ledge-route-cargo-extraction-kit",
        id: "next-ledge-route-cargo-extraction",
        stateId: "next-ledge-route-cargo-extraction-state",
        label: route.label,
        routeId: route.id,
        routeLabel: route.label,
        route,
        checkpoints: route.checkpoints,
        cargoId: "anchor-signal-cargo",
        cargoResources: cargoCaches.createResources(snapshot),
        pressureId: "fall-pressure",
        pressureChannels: pressureChannel.createChannels(snapshot)
      };
    },
    describe(snapshot = {}, cargoSnapshot = null) {
      const groups = {
        cargoCaches: cargoCaches.describe(snapshot, cargoSnapshot),
        routeThreads: routeThreads.describe(snapshot, cargoSnapshot),
        pressureVeils: pressureChannel.describe(snapshot, cargoSnapshot),
        summitHandoffs: summitHandoff.describe(snapshot, cargoSnapshot),
        statusReadouts: statusDescriptor.describe(snapshot, cargoSnapshot)
      };
      return {
        version: "next-ledge-route-cargo-domain-0.1.0",
        kitTree: NEXT_LEDGE_ROUTE_CARGO_FRACTAL_TREE,
        ...groups,
        rendererHandoff: rendererHandoff.describe(groups)
      };
    }
  };
}

export default createNextLedgeRouteCargoDomainKit;

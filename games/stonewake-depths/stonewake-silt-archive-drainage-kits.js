const FORBIDDEN_OWNERSHIP = Object.freeze([
  "renderer",
  "dom",
  "browser-input",
  "threejs",
  "webgl",
  "audio",
  "asset-loading",
  "frame-loop",
  "physics",
  "storage"
]);

export const STONEWAKE_SILT_ARCHIVE_DRAINAGE_TREE = `stonewake-silt-archive-drainage-readiness-domain
├─ sediment-survey-domain
│  ├─ silt-gauge-domain
│  │  └─ stonewake-silt-depth-gauge-kit
│  └─ fossil-shelf-domain
│     └─ stonewake-fossil-shelf-archive-kit
├─ drainage-restoration-domain
│  ├─ siphon-hose-domain
│  │  └─ stonewake-siphon-hose-route-kit
│  └─ sump-crank-domain
│     └─ stonewake-sump-crank-wheel-kit
├─ survivor-record-handoff-domain
│  ├─ waxed-map-case-domain
│  │  └─ stonewake-waxed-map-case-kit
│  └─ dawn-drainage-ledger-domain
│     └─ stonewake-dawn-drainage-ledger-kit
└─ renderer-handoff
   └─ stonewake-silt-archive-drainage-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export const STONEWAKE_SILT_ARCHIVE_DRAINAGE_KITS = Object.freeze([
  "stonewake-silt-depth-gauge-kit",
  "stonewake-fossil-shelf-archive-kit",
  "stonewake-siphon-hose-route-kit",
  "stonewake-sump-crank-wheel-kit",
  "stonewake-waxed-map-case-kit",
  "stonewake-dawn-drainage-ledger-kit",
  "stonewake-silt-archive-drainage-renderer-handoff-kit",
  "stonewake-silt-archive-drainage-readiness-domain-kit"
]);

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const round = (value, digits = 3) => {
  const power = 10 ** digits;
  return Math.round(finite(value) * power) / power;
};
const center = (thing = {}) => ({ x: finite(thing.x) + finite(thing.w) * 0.5, y: finite(thing.y) + finite(thing.h) * 0.5 });
const distance = (a, b) => Math.hypot(finite(a?.x) - finite(b?.x), finite(a?.y) - finite(b?.y));

function objectByType(level = {}, type) {
  return (level.objects ?? []).find((object) => object.type === type) ?? null;
}

function routePlatforms(level = {}) {
  return (level.platforms ?? [])
    .filter((platform) => !["boundary", "floor"].includes(platform.role))
    .sort((a, b) => finite(a.x) - finite(b.x));
}

function platformTop(platform = {}) {
  return { x: finite(platform.x) + finite(platform.w) * 0.5, y: finite(platform.y) };
}

function waterLine({ state = {}, level = {} } = {}) {
  return finite(state.water?.level, level.bounds?.height ?? 720);
}

function playerProgress({ state = {}, level = {} } = {}) {
  const width = Math.max(1, finite(level.bounds?.width, 3000) - 280);
  return clamp((finite(state.player?.x, 90) - 90) / width, 0, 1);
}

function drainageReadiness({ state = {}, level = {} } = {}) {
  const valve = clamp(state.valve, 0, 1);
  const door = clamp(state.door, 0, 1);
  const plate = state.plate ? 1 : 0;
  const carry = state.carry ? 0.05 : 0.18;
  const progress = playerProgress({ state, level });
  const water = waterLine({ state, level });
  const playerBottom = finite(state.player?.y, 0) + finite(state.player?.h, 46);
  const headroom = clamp((water - playerBottom) / 430, 0, 1);
  return clamp(valve * 0.24 + door * 0.18 + plate * 0.16 + progress * 0.22 + headroom * 0.14 + carry * 0.06, 0, 1);
}

function siltPressure({ state = {}, level = {} } = {}) {
  const water = waterLine({ state, level });
  const playerBottom = finite(state.player?.y, 0) + finite(state.player?.h, 46);
  const floodRisk = 1 - clamp((water - playerBottom) / 430, 0, 1);
  const stalledDrain = 1 - clamp(state.valve, 0, 1);
  const blockedDoor = 1 - clamp(state.door, 0, 1);
  const plateLag = state.plate ? 0 : 0.18;
  const carrying = state.carry ? 0.08 : 0;
  return clamp(floodRisk * 0.34 + stalledDrain * 0.24 + blockedDoor * 0.16 + plateLag + carrying, 0, 1);
}

function phaseFrom(readiness, pressure) {
  if (readiness >= 0.84) return "archive-handoff-ready";
  if (pressure >= 0.74) return "silt-collapse-warning";
  if (readiness >= 0.55) return "siphon-route-open";
  return "archive-drainage-staged";
}

export function createStonewakeSiltDepthGaugeKit() {
  return {
    id: "stonewake-silt-depth-gauge-kit",
    ownership: { excludes: FORBIDDEN_OWNERSHIP },
    describe({ state = {}, level = {}, count = 6 } = {}) {
      const water = waterLine({ state, level });
      const pressure = siltPressure({ state, level });
      const startX = Math.max(90, finite(state.player?.x, 0) - 120);
      const width = finite(level.bounds?.width, 3000);
      const step = Math.max(140, Math.min(380, (width - startX - 180) / Math.max(1, count)));
      return Array.from({ length: Math.max(1, count) }, (_, index) => ({
        kind: "silt-depth-gauge",
        id: `silt-depth-gauge-${index + 1}`,
        x: round(startX + index * step),
        y: round(water - 34 - (index % 3) * 14),
        depthLine: round(water),
        sedimentLoad: round(clamp(pressure + index * 0.028, 0, 1)),
        label: pressure > 0.72 ? "black-silt" : pressure > 0.42 ? "murky-rise" : "clear-run"
      }));
    }
  };
}

export function createStonewakeFossilShelfArchiveKit() {
  return {
    id: "stonewake-fossil-shelf-archive-kit",
    ownership: { excludes: FORBIDDEN_OWNERSHIP },
    describe({ state = {}, level = {}, count = 4 } = {}) {
      const progress = playerProgress({ state, level });
      const pressure = siltPressure({ state, level });
      const shelves = routePlatforms(level).filter((platform) => finite(platform.y) < waterLine({ state, level }) - 80);
      const candidates = shelves.length ? shelves : routePlatforms(level);
      return candidates.slice(0, Math.max(1, count)).map((platform, index) => {
        const p = platformTop(platform);
        return {
          kind: "fossil-shelf-archive",
          id: `fossil-shelf-${platform.id ?? index}`,
          x: round(p.x + ((index % 2) ? 36 : -36)),
          y: round(p.y - 34),
          fragility: round(clamp(0.24 + pressure * 0.5 - progress * 0.18 + index * 0.025, 0, 1)),
          catalogPriority: index + 1,
          state: pressure > 0.68 ? "bag-before-flood" : progress > 0.48 ? "catalogued" : "chalk-outline"
        };
      });
    }
  };
}

export function createStonewakeSiphonHoseRouteKit() {
  return {
    id: "stonewake-siphon-hose-route-kit",
    ownership: { excludes: FORBIDDEN_OWNERSHIP },
    describe({ state = {}, level = {}, count = 5 } = {}) {
      const platforms = routePlatforms(level);
      const valve = objectByType(level, "valve") ?? platforms[1] ?? { x: 360, y: 420 };
      const gate = objectByType(level, "finish-gate") ?? { x: finite(level.bounds?.width, 3000) - 200, y: 300 };
      const anchors = [valve, ...platforms.slice(1, Math.max(2, count)), gate].slice(0, Math.max(2, count + 1));
      const readiness = drainageReadiness({ state, level });
      return anchors.slice(0, -1).map((anchor, index) => {
        const next = anchors[index + 1];
        const from = "w" in anchor ? platformTop(anchor) : { x: finite(anchor.x), y: finite(anchor.y) };
        const to = "w" in next ? platformTop(next) : { x: finite(next.x), y: finite(next.y) };
        return {
          kind: "siphon-hose-route",
          id: `siphon-hose-${index + 1}`,
          from: { x: round(from.x), y: round(from.y - 18) },
          to: { x: round(to.x), y: round(to.y - 18) },
          flow: round(clamp(readiness * 0.62 + clamp(state.valve, 0, 1) * 0.28 - index * 0.035, 0.06, 1)),
          segment: index + 1
        };
      });
    }
  };
}

export function createStonewakeSumpCrankWheelKit() {
  return {
    id: "stonewake-sump-crank-wheel-kit",
    ownership: { excludes: FORBIDDEN_OWNERSHIP },
    describe({ state = {}, level = {} } = {}) {
      const valve = objectByType(level, "valve") ?? { x: 360, y: 420 };
      const plate = objectByType(level, "weighted-trigger") ?? { x: 740, y: 560 };
      const gate = objectByType(level, "finish-gate") ?? { x: finite(level.bounds?.width, 3000) - 180, y: 300 };
      const readiness = drainageReadiness({ state, level });
      const pressure = siltPressure({ state, level });
      return [valve, plate, gate].map((point, index) => ({
        kind: "sump-crank-wheel",
        id: `sump-crank-${index + 1}`,
        x: round(finite(point.x) + (index === 2 ? -32 : 28)),
        y: round(finite(point.y) + (index === 1 ? -24 : 36)),
        readiness: round(clamp(readiness + index * 0.035, 0, 1)),
        pressure: round(clamp(pressure - index * 0.045, 0, 1)),
        state: readiness > 0.78 ? "primed" : pressure > 0.72 ? "crank-now" : "tagged"
      }));
    }
  };
}

export function createStonewakeWaxedMapCaseKit() {
  return {
    id: "stonewake-waxed-map-case-kit",
    ownership: { excludes: FORBIDDEN_OWNERSHIP },
    describe({ state = {}, level = {}, count = 3 } = {}) {
      const player = center(state.player ?? {});
      const readiness = drainageReadiness({ state, level });
      const shelves = routePlatforms(level).slice(-Math.max(1, count + 1));
      return shelves.slice(0, Math.max(1, count)).map((platform, index) => {
        const p = platformTop(platform);
        return {
          kind: "waxed-map-case",
          id: `waxed-map-case-${platform.id ?? index}`,
          x: round(p.x + 18),
          y: round(p.y - 62),
          seal: round(clamp(0.36 + readiness * 0.48 - distance(p, player) / 3600, 0.12, 1)),
          contents: index === 0 ? "drainage-map" : index === 1 ? "survivor-route" : "fossil-ledger",
          pickupHint: distance(p, player) < 180 ? "within-reach" : "mark-route"
        };
      });
    }
  };
}

export function createStonewakeDawnDrainageLedgerKit() {
  return {
    id: "stonewake-dawn-drainage-ledger-kit",
    ownership: { excludes: FORBIDDEN_OWNERSHIP },
    describe({ state = {}, level = {} } = {}) {
      const gate = objectByType(level, "finish-gate") ?? { x: finite(level.bounds?.width, 3000) - 180, y: 300 };
      const readiness = drainageReadiness({ state, level });
      const pressure = siltPressure({ state, level });
      const phase = phaseFrom(readiness, pressure);
      return {
        kind: "dawn-drainage-ledger",
        id: "dawn-drainage-ledger",
        x: round(finite(gate.x) - 56),
        y: round(finite(gate.y) + 112),
        readiness: round(readiness),
        siltPressure: round(pressure),
        phase,
        archivedShelves: Math.max(0, Math.round(readiness * 6 - pressure * 2)),
        nextAction: phase === "archive-handoff-ready"
          ? "Carry sealed map cases through the opened lock."
          : phase === "silt-collapse-warning"
            ? "Open siphon hoses before the black silt buries the shelves."
            : phase === "siphon-route-open"
              ? "Crank sump wheels and bag the fossil shelves."
              : "Survey silt gauges and trace the first drainage hose."
      };
    }
  };
}

export function createStonewakeSiltArchiveDrainageRendererHandoffKit() {
  const siltGaugeKit = createStonewakeSiltDepthGaugeKit();
  const fossilShelfKit = createStonewakeFossilShelfArchiveKit();
  const siphonHoseKit = createStonewakeSiphonHoseRouteKit();
  const sumpCrankKit = createStonewakeSumpCrankWheelKit();
  const waxedMapKit = createStonewakeWaxedMapCaseKit();
  const ledgerKit = createStonewakeDawnDrainageLedgerKit();

  return {
    id: "stonewake-silt-archive-drainage-renderer-handoff-kit",
    ownership: { excludes: FORBIDDEN_OWNERSHIP },
    describe(input = {}) {
      const siltDepthGauges = siltGaugeKit.describe(input);
      const fossilShelfArchives = fossilShelfKit.describe(input);
      const siphonHoseRoutes = siphonHoseKit.describe(input);
      const sumpCrankWheels = sumpCrankKit.describe(input);
      const waxedMapCases = waxedMapKit.describe(input);
      const dawnDrainageLedger = ledgerKit.describe(input);
      const descriptors = {
        siltDepthGauges,
        fossilShelfArchives,
        siphonHoseRoutes,
        sumpCrankWheels,
        waxedMapCases,
        dawnDrainageLedger
      };
      const total = Object.values(descriptors).reduce((sum, value) => sum + (Array.isArray(value) ? value.length : value ? 1 : 0), 0);
      return {
        id: "stonewake-silt-archive-drainage-renderer-handoff",
        rendererConsumesDescriptorsOnly: true,
        descriptors,
        counts: {
          siltDepthGauges: siltDepthGauges.length,
          fossilShelfArchives: fossilShelfArchives.length,
          siphonHoseRoutes: siphonHoseRoutes.length,
          sumpCrankWheels: sumpCrankWheels.length,
          waxedMapCases: waxedMapCases.length,
          dawnDrainageLedger: dawnDrainageLedger ? 1 : 0,
          total
        }
      };
    }
  };
}

export function createStonewakeSiltArchiveDrainageReadinessDomainKit() {
  const handoffKit = createStonewakeSiltArchiveDrainageRendererHandoffKit();
  return {
    id: "stonewake-silt-archive-drainage-readiness-domain-kit",
    ownership: { excludes: FORBIDDEN_OWNERSHIP },
    tree: STONEWAKE_SILT_ARCHIVE_DRAINAGE_TREE,
    kits: STONEWAKE_SILT_ARCHIVE_DRAINAGE_KITS,
    describe(input = {}) {
      const readiness = drainageReadiness(input);
      const pressure = siltPressure(input);
      const rendererHandoff = handoffKit.describe(input);
      const ledger = rendererHandoff.descriptors.dawnDrainageLedger;
      return {
        id: "stonewake-silt-archive-drainage-readiness",
        tree: STONEWAKE_SILT_ARCHIVE_DRAINAGE_TREE,
        kits: STONEWAKE_SILT_ARCHIVE_DRAINAGE_KITS,
        ownership: { excludes: FORBIDDEN_OWNERSHIP },
        readiness: round(readiness),
        siltPressure: round(pressure),
        missionState: phaseFrom(readiness, pressure),
        siltDepthGauges: rendererHandoff.descriptors.siltDepthGauges,
        fossilShelfArchives: rendererHandoff.descriptors.fossilShelfArchives,
        siphonHoseRoutes: rendererHandoff.descriptors.siphonHoseRoutes,
        sumpCrankWheels: rendererHandoff.descriptors.sumpCrankWheels,
        waxedMapCases: rendererHandoff.descriptors.waxedMapCases,
        dawnDrainageLedger: ledger,
        rendererHandoff
      };
    }
  };
}

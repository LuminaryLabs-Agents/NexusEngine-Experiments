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

export const STONEWAKE_PRESSURE_LOCK_PUMP_TREE = `stonewake-pressure-lock-pump-readiness-domain
├─ hydraulic-control-domain
│  ├─ pressure-gate-domain
│  │  └─ stonewake-pressure-gate-wheel-kit
│  └─ pump-chain-domain
│     └─ stonewake-pump-chain-tension-kit
├─ air-pocket-routing-domain
│  ├─ bellows-air-pocket-domain
│  │  └─ stonewake-bellows-air-pocket-kit
│  └─ chalk-depth-marker-domain
│     └─ stonewake-chalk-depth-marker-kit
├─ rescue-power-handoff-domain
│  ├─ carbide-lamp-relay-domain
│  │  └─ stonewake-carbide-lamp-relay-kit
│  └─ lockmaster-ledger-domain
│     └─ stonewake-lockmaster-ledger-kit
└─ renderer-handoff
   └─ stonewake-pressure-lock-pump-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export const STONEWAKE_PRESSURE_LOCK_PUMP_KITS = Object.freeze([
  "stonewake-pressure-gate-wheel-kit",
  "stonewake-pump-chain-tension-kit",
  "stonewake-bellows-air-pocket-kit",
  "stonewake-chalk-depth-marker-kit",
  "stonewake-carbide-lamp-relay-kit",
  "stonewake-lockmaster-ledger-kit",
  "stonewake-pressure-lock-pump-renderer-handoff-kit",
  "stonewake-pressure-lock-pump-readiness-domain-kit"
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

function objectsByType(level = {}, type) {
  return (level.objects ?? []).filter((object) => object.type === type);
}

function routePlatforms(level = {}) {
  return (level.platforms ?? [])
    .filter((platform) => !["boundary", "floor"].includes(platform.role))
    .sort((a, b) => finite(a.x) - finite(b.x));
}

function platformTop(platform = {}) {
  return { x: finite(platform.x) + finite(platform.w) * 0.5, y: finite(platform.y) };
}

function waterThreat({ state = {}, level = {} } = {}) {
  const water = finite(state.water?.level, level.bounds?.height ?? 720);
  const playerBottom = finite(state.player?.y) + finite(state.player?.h, 46);
  const headroom = clamp((water - playerBottom) / 420, 0, 1);
  const valveLag = 1 - clamp(state.valve, 0, 1);
  const doorLag = 1 - clamp(state.door, 0, 1);
  const plateLag = state.plate ? 0 : 1;
  const carryDrag = state.carry ? 0.08 : 0;
  return clamp((1 - headroom) * 0.36 + valveLag * 0.22 + doorLag * 0.18 + plateLag * 0.16 + carryDrag, 0, 1);
}

function pumpReadiness({ state = {}, level = {} } = {}) {
  const valve = clamp(state.valve, 0, 1);
  const door = clamp(state.door, 0, 1);
  const plate = state.plate ? 1 : 0;
  const playerProgress = clamp((finite(state.player?.x, 0) - 80) / Math.max(1, finite(level.bounds?.width, 3000) - 260), 0, 1);
  const water = finite(state.water?.level, level.bounds?.height ?? 720);
  const playerBottom = finite(state.player?.y) + finite(state.player?.h, 46);
  const headroom = clamp((water - playerBottom) / 420, 0, 1);
  const blockPlaced = state.carry ? 0.08 : 0.2;
  return clamp(valve * 0.24 + door * 0.2 + plate * 0.18 + playerProgress * 0.2 + headroom * 0.12 + blockPlaced * 0.06, 0, 1);
}

function phaseFrom(readiness, pressure) {
  if (readiness >= 0.84) return "lockmaster-handoff-ready";
  if (pressure >= 0.72) return "pressure-critical";
  if (readiness >= 0.52) return "air-pocket-route";
  return "lock-pump-staged";
}

export function createStonewakePressureGateWheelKit() {
  return {
    id: "stonewake-pressure-gate-wheel-kit",
    ownership: { excludes: FORBIDDEN_OWNERSHIP },
    describe({ state = {}, level = {} } = {}) {
      const valve = objectByType(level, "valve") ?? { x: 360, y: 360 };
      const gate = objectByType(level, "finish-gate") ?? { x: finite(level.bounds?.width, 1280) - 160, y: 280 };
      const plate = objectByType(level, "weighted-trigger") ?? { x: 720, y: 560 };
      const pressure = waterThreat({ state, level });
      const readiness = pumpReadiness({ state, level });
      return [
        { source: "valve", point: valve, progress: clamp(state.valve, 0, 1) },
        { source: "rune-plate", point: plate, progress: state.plate ? 1 : 0.18 },
        { source: "finish-lock", point: gate, progress: clamp(state.door, 0, 1) }
      ].map((entry, index) => ({
        kind: "pressure-gate-wheel",
        id: `pressure-gate-wheel-${entry.source}`,
        x: round(finite(entry.point.x) + (entry.source === "finish-lock" ? -22 : 34)),
        y: round(finite(entry.point.y) + (entry.source === "finish-lock" ? 76 : 26)),
        progress: round(entry.progress),
        pressure: round(clamp(pressure + index * 0.04, 0, 1)),
        readiness: round(readiness),
        state: entry.progress >= 0.9 ? "locked" : pressure > 0.68 ? "turn-now" : "staged"
      }));
    }
  };
}

export function createStonewakePumpChainTensionKit() {
  return {
    id: "stonewake-pump-chain-tension-kit",
    ownership: { excludes: FORBIDDEN_OWNERSHIP },
    describe({ state = {}, level = {}, count = 5 } = {}) {
      const chains = objectsByType(level, "chain");
      const platforms = routePlatforms(level);
      const anchors = chains.length ? chains : platforms.slice(1, Math.max(2, count + 1)).map((platform) => ({ ...platform, ...platformTop(platform), h: 120 }));
      const player = center(state.player ?? objectByType(level, "player") ?? {});
      const pressure = waterThreat({ state, level });
      return anchors
        .slice(0, Math.max(1, count))
        .map((chain, index) => {
          const chainPoint = { x: finite(chain.x), y: finite(chain.y) + finite(chain.h, 120) * 0.5 };
          return {
            kind: "pump-chain-tension",
            id: `pump-chain-${chain.id ?? index}`,
            from: { x: round(chainPoint.x), y: round(chainPoint.y - 42) },
            to: { x: round(chainPoint.x + 34 + index * 10), y: round(chainPoint.y + 62) },
            tension: round(clamp(0.34 + pressure * 0.48 - distance(chainPoint, player) / 2600, 0.14, 1)),
            slackRisk: round(clamp(distance(chainPoint, player) / 2400 + pressure * 0.22, 0, 1)),
            pullOrder: index + 1
          };
        });
    }
  };
}

export function createStonewakeBellowsAirPocketKit() {
  return {
    id: "stonewake-bellows-air-pocket-kit",
    ownership: { excludes: FORBIDDEN_OWNERSHIP },
    describe({ state = {}, level = {}, count = 4 } = {}) {
      const water = finite(state.water?.level, level.bounds?.height ?? 720);
      const readiness = pumpReadiness({ state, level });
      const playerX = finite(state.player?.x, 0);
      const visible = routePlatforms(level).filter((platform) => finite(platform.x) > playerX - 180);
      const candidates = visible.length ? visible : routePlatforms(level).slice(-Math.max(1, count));
      const dryCandidates = candidates.filter((platform) => finite(platform.y) < water - 70);
      return (dryCandidates.length ? dryCandidates : candidates)
        .slice(0, Math.max(1, count))
        .map((platform, index) => {
          const p = platformTop(platform);
          const clearance = clamp((water - p.y) / 440, 0, 1);
          return {
            kind: "bellows-air-pocket",
            id: `bellows-air-pocket-${platform.id ?? index}`,
            x: round(p.x),
            y: round(p.y - 52),
            clearance: round(clearance),
            airReserve: round(clamp(0.26 + clearance * 0.42 + readiness * 0.24 - index * 0.025, 0.12, 1)),
            use: clearance > 0.55 ? "breather-cache" : "last-resort"
          };
        });
    }
  };
}

export function createStonewakeChalkDepthMarkerKit() {
  return {
    id: "stonewake-chalk-depth-marker-kit",
    ownership: { excludes: FORBIDDEN_OWNERSHIP },
    describe({ state = {}, level = {}, count = 6 } = {}) {
      const water = finite(state.water?.level, level.bounds?.height ?? 720);
      const width = finite(level.bounds?.width, 3000);
      const startX = Math.max(120, finite(state.player?.x, 0) - 120);
      const step = Math.max(120, Math.min(360, (width - startX - 160) / Math.max(1, count)));
      const pressure = waterThreat({ state, level });
      return Array.from({ length: Math.max(1, count) }, (_, index) => {
        const x = startX + index * step;
        return {
          kind: "chalk-depth-marker",
          id: `chalk-depth-marker-${index + 1}`,
          x: round(x),
          y: round(water - 24 - (index % 2) * 18),
          depthLine: round(water),
          urgency: round(clamp(pressure + index * 0.035, 0, 1)),
          label: pressure > 0.7 ? "crest" : pressure > 0.42 ? "rising" : "safe-line"
        };
      });
    }
  };
}

export function createStonewakeCarbideLampRelayKit() {
  return {
    id: "stonewake-carbide-lamp-relay-kit",
    ownership: { excludes: FORBIDDEN_OWNERSHIP },
    describe({ state = {}, level = {}, count = 7 } = {}) {
      const readiness = pumpReadiness({ state, level });
      const pressure = waterThreat({ state, level });
      const playerX = finite(state.player?.x, 0);
      const visible = routePlatforms(level).filter((platform) => finite(platform.x) > playerX - 220);
      return (visible.length ? visible : routePlatforms(level).slice(-Math.max(1, count)))
        .slice(0, Math.max(1, count))
        .map((platform, index) => {
          const p = platformTop(platform);
          return {
            kind: "carbide-lamp-relay",
            id: `carbide-lamp-${platform.id ?? index}`,
            x: round(p.x + ((index % 2) ? 28 : -28)),
            y: round(p.y - 76),
            brightness: round(clamp(0.28 + readiness * 0.46 - pressure * 0.12 - index * 0.012, 0.12, 1)),
            relayIndex: index,
            status: readiness > 0.7 ? "lit-route" : pressure > 0.68 ? "flicker-warning" : "pilot-light"
          };
        });
    }
  };
}

export function createStonewakeLockmasterLedgerKit() {
  return {
    id: "stonewake-lockmaster-ledger-kit",
    ownership: { excludes: FORBIDDEN_OWNERSHIP },
    describe({ state = {}, level = {} } = {}) {
      const gate = objectByType(level, "finish-gate") ?? { x: finite(level.bounds?.width, 1280) - 160, y: 280 };
      const readiness = pumpReadiness({ state, level });
      const pressure = waterThreat({ state, level });
      const phase = phaseFrom(readiness, pressure);
      const pumpsPrimed = Math.max(0, Math.round(readiness * 6 - pressure));
      return {
        kind: "lockmaster-ledger",
        id: "stonewake-lockmaster-ledger",
        x: round(finite(gate.x) + 64),
        y: round(finite(gate.y) - 58),
        readiness: round(readiness),
        pressure: round(pressure),
        pumpsPrimed,
        phase,
        nextAction: phase === "lockmaster-handoff-ready" ? "open pressure lock and escort survivors" : phase === "pressure-critical" ? "pull pump chains before the crest" : phase === "air-pocket-route" ? "mark bellows pockets and lamp relays" : "stage gate wheels and chalk depth marks"
      };
    }
  };
}

export function createStonewakePressureLockPumpRendererHandoffKit(kits = {}) {
  return {
    id: "stonewake-pressure-lock-pump-renderer-handoff-kit",
    ownership: { excludes: FORBIDDEN_OWNERSHIP },
    describe(input = {}) {
      const descriptors = {
        pressureGateWheels: (kits.pressureGateWheelKit ?? createStonewakePressureGateWheelKit()).describe(input),
        pumpChainTensions: (kits.pumpChainTensionKit ?? createStonewakePumpChainTensionKit()).describe(input),
        bellowsAirPockets: (kits.bellowsAirPocketKit ?? createStonewakeBellowsAirPocketKit()).describe(input),
        chalkDepthMarkers: (kits.chalkDepthMarkerKit ?? createStonewakeChalkDepthMarkerKit()).describe(input),
        carbideLampRelays: (kits.carbideLampRelayKit ?? createStonewakeCarbideLampRelayKit()).describe(input),
        lockmasterLedger: (kits.lockmasterLedgerKit ?? createStonewakeLockmasterLedgerKit()).describe(input)
      };
      const total = Object.values(descriptors).reduce((sum, value) => sum + (Array.isArray(value) ? value.length : value ? 1 : 0), 0);
      return {
        id: "stonewake-pressure-lock-pump-renderer-handoff",
        domain: "stonewake-pressure-lock-pump-readiness-domain",
        rendererConsumesDescriptorsOnly: true,
        descriptors,
        counts: {
          pressureGateWheels: descriptors.pressureGateWheels.length,
          pumpChainTensions: descriptors.pumpChainTensions.length,
          bellowsAirPockets: descriptors.bellowsAirPockets.length,
          chalkDepthMarkers: descriptors.chalkDepthMarkers.length,
          carbideLampRelays: descriptors.carbideLampRelays.length,
          lockmasterLedger: descriptors.lockmasterLedger ? 1 : 0,
          total
        },
        ownership: { excludes: FORBIDDEN_OWNERSHIP }
      };
    }
  };
}

export function createStonewakePressureLockPumpReadinessDomainKit() {
  const pressureGateWheelKit = createStonewakePressureGateWheelKit();
  const pumpChainTensionKit = createStonewakePumpChainTensionKit();
  const bellowsAirPocketKit = createStonewakeBellowsAirPocketKit();
  const chalkDepthMarkerKit = createStonewakeChalkDepthMarkerKit();
  const carbideLampRelayKit = createStonewakeCarbideLampRelayKit();
  const lockmasterLedgerKit = createStonewakeLockmasterLedgerKit();
  const rendererHandoffKit = createStonewakePressureLockPumpRendererHandoffKit({ pressureGateWheelKit, pumpChainTensionKit, bellowsAirPocketKit, chalkDepthMarkerKit, carbideLampRelayKit, lockmasterLedgerKit });
  return {
    id: "stonewake-pressure-lock-pump-readiness-domain-kit",
    domain: "stonewake-pressure-lock-pump-readiness-domain",
    tree: STONEWAKE_PRESSURE_LOCK_PUMP_TREE,
    kits: STONEWAKE_PRESSURE_LOCK_PUMP_KITS,
    ownership: { excludes: FORBIDDEN_OWNERSHIP },
    describe(input = {}) {
      const readiness = pumpReadiness(input);
      const pressure = waterThreat(input);
      const rendererHandoff = rendererHandoffKit.describe(input);
      const ledger = rendererHandoff.descriptors.lockmasterLedger;
      return {
        id: "stonewake-pressure-lock-pump-readiness",
        domain: "stonewake-pressure-lock-pump-readiness-domain",
        tree: STONEWAKE_PRESSURE_LOCK_PUMP_TREE,
        readiness: round(readiness),
        pressure: round(pressure),
        missionState: ledger.phase,
        pressureGateWheels: rendererHandoff.descriptors.pressureGateWheels,
        pumpChainTensions: rendererHandoff.descriptors.pumpChainTensions,
        bellowsAirPockets: rendererHandoff.descriptors.bellowsAirPockets,
        chalkDepthMarkers: rendererHandoff.descriptors.chalkDepthMarkers,
        carbideLampRelays: rendererHandoff.descriptors.carbideLampRelays,
        lockmasterLedger: ledger,
        rendererHandoff,
        ownership: { excludes: FORBIDDEN_OWNERSHIP }
      };
    }
  };
}

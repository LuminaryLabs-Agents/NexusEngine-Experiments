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

export const STONEWAKE_CAVE_CLINIC_TRIAGE_TREE = `stonewake-cave-clinic-triage-readiness-domain
├─ patient-stabilization-domain
│  ├─ thermal-blanket-domain
│  │  └─ stonewake-thermal-blanket-cache-kit
│  └─ splint-stretcher-domain
│     └─ stonewake-splint-stretcher-route-kit
├─ cave-infrastructure-domain
│  ├─ glowworm-lantern-domain
│  │  └─ stonewake-glowworm-lantern-string-kit
│  └─ sump-pump-domain
│     └─ stonewake-sump-pump-prime-kit
├─ extraction-accounting-domain
│  ├─ medic-triage-domain
│  │  └─ stonewake-medic-triage-card-kit
│  └─ evacuation-stretcher-ledger-domain
│     └─ stonewake-evacuation-stretcher-ledger-kit
└─ renderer-handoff
   └─ stonewake-cave-clinic-triage-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export const STONEWAKE_CAVE_CLINIC_TRIAGE_KITS = Object.freeze([
  "stonewake-thermal-blanket-cache-kit",
  "stonewake-splint-stretcher-route-kit",
  "stonewake-glowworm-lantern-string-kit",
  "stonewake-sump-pump-prime-kit",
  "stonewake-medic-triage-card-kit",
  "stonewake-evacuation-stretcher-ledger-kit",
  "stonewake-cave-clinic-triage-renderer-handoff-kit",
  "stonewake-cave-clinic-triage-readiness-domain-kit"
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

function cavePressure({ state = {}, level = {} } = {}) {
  const water = finite(state.water?.level, level.bounds?.height ?? 720);
  const playerBottom = finite(state.player?.y) + finite(state.player?.h, 46);
  const waterThreat = clamp(1 - (water - playerBottom) / Math.max(220, finite(level.bounds?.height, 720)), 0, 1);
  const routeLag = (1 - clamp(state.valve, 0, 1)) * 0.24 + (1 - clamp(state.door, 0, 1)) * 0.22 + (state.plate ? 0 : 0.14);
  const carryLoad = state.carry ? 0.08 : 0;
  return clamp(waterThreat * 0.32 + routeLag + carryLoad, 0, 1);
}

function clinicReadiness({ state = {}, level = {} } = {}) {
  const valve = clamp(state.valve, 0, 1);
  const door = clamp(state.door, 0, 1);
  const plate = state.plate ? 1 : 0;
  const waterHeadroom = clamp((finite(state.water?.level, level.bounds?.height ?? 720) - (finite(state.player?.y) + finite(state.player?.h, 46))) / 420, 0, 1);
  const routeProgress = clamp((finite(state.player?.x, 0) - 80) / Math.max(1, finite(level.bounds?.width, 3000) - 260), 0, 1);
  return clamp(valve * 0.22 + door * 0.2 + plate * 0.16 + waterHeadroom * 0.2 + routeProgress * 0.22, 0, 1);
}

function phaseFrom(readiness, pressure) {
  if (readiness >= 0.86) return "stretcher-extraction-ready";
  if (pressure >= 0.72) return "hypothermia-critical";
  if (readiness >= 0.55) return "clinic-staging";
  return "triage-marking";
}

export function createStonewakeThermalBlanketCacheKit() {
  return {
    id: "stonewake-thermal-blanket-cache-kit",
    ownership: { excludes: FORBIDDEN_OWNERSHIP },
    describe({ state = {}, level = {}, count = 4 } = {}) {
      const water = finite(state.water?.level, level.bounds?.height ?? 720);
      const pressure = cavePressure({ state, level });
      const player = center(state.player ?? objectByType(level, "player") ?? {});
      return routePlatforms(level)
        .filter((platform) => finite(platform.y) < water - 54)
        .sort((a, b) => distance(platformTop(a), player) - distance(platformTop(b), player))
        .slice(0, Math.max(1, count))
        .map((platform, index) => {
          const p = platformTop(platform);
          return {
            kind: "thermal-blanket-cache",
            id: `thermal-blanket-${platform.id ?? index}`,
            x: round(p.x - 24),
            y: round(p.y - 28),
            warmth: round(clamp(0.72 - pressure * 0.34 + index * 0.03, 0.28, 1)),
            dryness: round(clamp((water - p.y) / 460, 0.12, 1)),
            priority: index === 0 ? "nearest-patient" : pressure > 0.62 ? "urgent" : "cache",
            focusId: platform.focusId ?? null
          };
        });
    }
  };
}

export function createStonewakeSplintStretcherRouteKit() {
  return {
    id: "stonewake-splint-stretcher-route-kit",
    ownership: { excludes: FORBIDDEN_OWNERSHIP },
    describe({ state = {}, level = {}, count = 5 } = {}) {
      const platforms = routePlatforms(level).slice(0, Math.max(2, count + 1));
      const pressure = cavePressure({ state, level });
      return platforms.slice(0, -1).map((platform, index) => {
        const from = platformTop(platform);
        const to = platformTop(platforms[index + 1]);
        const rise = from.y - to.y;
        const span = Math.abs(to.x - from.x);
        return {
          kind: "splint-stretcher-route",
          id: `stretcher-route-${platform.id ?? index}`,
          from: { x: round(from.x), y: round(from.y - 18) },
          to: { x: round(to.x), y: round(to.y - 18) },
          span: round(span),
          rise: round(rise),
          slopeRisk: round(clamp((Math.abs(rise) / Math.max(1, span)) * 0.7 + pressure * 0.3, 0, 1)),
          clearance: round(clamp((finite(state.water?.level, 720) - Math.max(from.y, to.y)) / 360, 0, 1))
        };
      });
    }
  };
}

export function createStonewakeGlowwormLanternStringKit() {
  return {
    id: "stonewake-glowworm-lantern-string-kit",
    ownership: { excludes: FORBIDDEN_OWNERSHIP },
    describe({ state = {}, level = {}, count = 8 } = {}) {
      const playerX = finite(state.player?.x, 0);
      const readiness = clinicReadiness({ state, level });
      return routePlatforms(level)
        .filter((platform) => finite(platform.x) > playerX - 160)
        .slice(0, Math.max(1, count))
        .map((platform, index) => {
          const p = platformTop(platform);
          return {
            kind: "glowworm-lantern-string",
            id: `glowworm-lantern-${platform.id ?? index}`,
            x: round(p.x),
            y: round(p.y - 64 - (index % 2) * 18),
            glow: round(clamp(0.34 + readiness * 0.44 - index * 0.018, 0.18, 1)),
            spacing: index % 3 === 0 ? "wide" : "close",
            routeIndex: index
          };
        });
    }
  };
}

export function createStonewakeSumpPumpPrimeKit() {
  return {
    id: "stonewake-sump-pump-prime-kit",
    ownership: { excludes: FORBIDDEN_OWNERSHIP },
    describe({ state = {}, level = {} } = {}) {
      const valve = objectByType(level, "valve") ?? { x: 320, y: 320 };
      const pressure = cavePressure({ state, level });
      const prime = clamp(state.valve, 0, 1);
      return {
        kind: "sump-pump-prime",
        id: "stonewake-sump-pump-prime",
        x: round(finite(valve.x) + 44),
        y: round(finite(valve.y) + 34),
        prime: round(prime),
        drawdown: round(clamp(prime - pressure * 0.22, 0, 1)),
        phase: prime >= 0.94 ? "drawdown" : pressure > 0.68 ? "prime-now" : "standby",
        message: prime >= 0.94 ? "Sump line drawing water" : "Hold valve to prime clinic pump"
      };
    }
  };
}

export function createStonewakeMedicTriageCardKit() {
  return {
    id: "stonewake-medic-triage-card-kit",
    ownership: { excludes: FORBIDDEN_OWNERSHIP },
    describe({ state = {}, level = {}, count = 3 } = {}) {
      const pressure = cavePressure({ state, level });
      const readiness = clinicReadiness({ state, level });
      const playerX = finite(state.player?.x, 0);
      return routePlatforms(level)
        .filter((platform) => finite(platform.x) > playerX + 80)
        .slice(0, Math.max(1, count))
        .map((platform, index) => {
          const p = platformTop(platform);
          const severity = clamp(pressure + 0.16 * index - readiness * 0.18, 0, 1);
          return {
            kind: "medic-triage-card",
            id: `medic-triage-${platform.id ?? index}`,
            x: round(p.x + 28),
            y: round(p.y - 86),
            severity: round(severity),
            tag: severity > 0.72 ? "red" : severity > 0.42 ? "yellow" : "green",
            treatment: severity > 0.72 ? "warmth-first" : severity > 0.42 ? "splint-and-move" : "escort"
          };
        });
    }
  };
}

export function createStonewakeEvacuationStretcherLedgerKit() {
  return {
    id: "stonewake-evacuation-stretcher-ledger-kit",
    ownership: { excludes: FORBIDDEN_OWNERSHIP },
    describe({ state = {}, level = {} } = {}) {
      const gate = objectByType(level, "finish-gate") ?? { x: finite(level.bounds?.width, 1280) - 120, y: 260 };
      const readiness = clinicReadiness({ state, level });
      const pressure = cavePressure({ state, level });
      const staged = Math.max(0, Math.round(readiness * 5 - pressure * 1.2));
      return {
        kind: "evacuation-stretcher-ledger",
        id: "stonewake-evacuation-stretcher-ledger",
        x: round(finite(gate.x) + 72),
        y: round(finite(gate.y) - 74),
        readiness: round(readiness),
        pressure: round(pressure),
        evacueesStaged: staged,
        phase: phaseFrom(readiness, pressure),
        nextAction: readiness >= 0.86 ? "ring clinic bell and move stretchers" : pressure >= 0.72 ? "blankets before the flood crest" : "mark lantern route and prime pump"
      };
    }
  };
}

export function createStonewakeCaveClinicTriageRendererHandoffKit(kits = {}) {
  return {
    id: "stonewake-cave-clinic-triage-renderer-handoff-kit",
    ownership: { excludes: FORBIDDEN_OWNERSHIP },
    describe(input = {}) {
      const descriptors = {
        thermalBlanketCaches: (kits.thermalBlanketCacheKit ?? createStonewakeThermalBlanketCacheKit()).describe(input),
        splintStretcherRoutes: (kits.splintStretcherRouteKit ?? createStonewakeSplintStretcherRouteKit()).describe(input),
        glowwormLanternStrings: (kits.glowwormLanternStringKit ?? createStonewakeGlowwormLanternStringKit()).describe(input),
        sumpPumpPrime: (kits.sumpPumpPrimeKit ?? createStonewakeSumpPumpPrimeKit()).describe(input),
        medicTriageCards: (kits.medicTriageCardKit ?? createStonewakeMedicTriageCardKit()).describe(input),
        evacuationStretcherLedger: (kits.evacuationStretcherLedgerKit ?? createStonewakeEvacuationStretcherLedgerKit()).describe(input)
      };
      const total = Object.values(descriptors).reduce((sum, value) => sum + (Array.isArray(value) ? value.length : value ? 1 : 0), 0);
      return {
        id: "stonewake-cave-clinic-triage-renderer-handoff",
        domain: "stonewake-cave-clinic-triage-readiness-domain",
        rendererConsumesDescriptorsOnly: true,
        descriptors,
        counts: {
          thermalBlanketCaches: descriptors.thermalBlanketCaches.length,
          splintStretcherRoutes: descriptors.splintStretcherRoutes.length,
          glowwormLanternStrings: descriptors.glowwormLanternStrings.length,
          sumpPumpPrime: descriptors.sumpPumpPrime ? 1 : 0,
          medicTriageCards: descriptors.medicTriageCards.length,
          evacuationStretcherLedger: descriptors.evacuationStretcherLedger ? 1 : 0,
          total
        },
        ownership: { excludes: FORBIDDEN_OWNERSHIP }
      };
    }
  };
}

export function createStonewakeCaveClinicTriageReadinessDomainKit() {
  const thermalBlanketCacheKit = createStonewakeThermalBlanketCacheKit();
  const splintStretcherRouteKit = createStonewakeSplintStretcherRouteKit();
  const glowwormLanternStringKit = createStonewakeGlowwormLanternStringKit();
  const sumpPumpPrimeKit = createStonewakeSumpPumpPrimeKit();
  const medicTriageCardKit = createStonewakeMedicTriageCardKit();
  const evacuationStretcherLedgerKit = createStonewakeEvacuationStretcherLedgerKit();
  const rendererHandoffKit = createStonewakeCaveClinicTriageRendererHandoffKit({ thermalBlanketCacheKit, splintStretcherRouteKit, glowwormLanternStringKit, sumpPumpPrimeKit, medicTriageCardKit, evacuationStretcherLedgerKit });
  return {
    id: "stonewake-cave-clinic-triage-readiness-domain-kit",
    domain: "stonewake-cave-clinic-triage-readiness-domain",
    tree: STONEWAKE_CAVE_CLINIC_TRIAGE_TREE,
    kits: STONEWAKE_CAVE_CLINIC_TRIAGE_KITS,
    ownership: { excludes: FORBIDDEN_OWNERSHIP },
    describe(input = {}) {
      const readiness = clinicReadiness(input);
      const pressure = cavePressure(input);
      const rendererHandoff = rendererHandoffKit.describe(input);
      const ledger = rendererHandoff.descriptors.evacuationStretcherLedger;
      return {
        id: "stonewake-cave-clinic-triage-readiness",
        domain: "stonewake-cave-clinic-triage-readiness-domain",
        tree: STONEWAKE_CAVE_CLINIC_TRIAGE_TREE,
        readiness: round(readiness),
        pressure: round(pressure),
        missionState: ledger.phase,
        thermalBlanketCaches: rendererHandoff.descriptors.thermalBlanketCaches,
        splintStretcherRoutes: rendererHandoff.descriptors.splintStretcherRoutes,
        glowwormLanternStrings: rendererHandoff.descriptors.glowwormLanternStrings,
        sumpPumpPrime: rendererHandoff.descriptors.sumpPumpPrime,
        medicTriageCards: rendererHandoff.descriptors.medicTriageCards,
        evacuationStretcherLedger: ledger,
        rendererHandoff,
        ownership: { excludes: FORBIDDEN_OWNERSHIP }
      };
    }
  };
}

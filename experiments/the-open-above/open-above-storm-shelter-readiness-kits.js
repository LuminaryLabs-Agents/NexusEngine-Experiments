const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, n(value)));
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const hashText = (text = "") => {
  let hash = 2166136261;
  for (const char of String(text)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};
const wave01 = (seed, index = 0, salt = 0) => ((hashText(`${seed}:${index}:${salt}`) % 10000) / 10000);
const body = (snapshot = {}) => snapshot.body ?? {};
const input = (snapshot = {}) => snapshot.input ?? {};
const position = (snapshot = {}) => body(snapshot).position ?? {};
const count = (items) => Array.isArray(items) ? items.length : 0;
const totalCount = (groups = {}) => Object.values(groups).reduce((sum, value) => sum + count(value), 0);

export const OPEN_ABOVE_STORM_SHELTER_READINESS_TREE = `open-above-storm-shelter-readiness-domain
├─ shelter-discovery-domain
│  ├─ ridge-shelter-domain
│  │  └─ open-above-ridge-shelter-beacon-kit
│  └─ thermal-lift-domain
│     └─ open-above-thermal-lift-corridor-kit
├─ weather-relief-domain
│  ├─ blanket-cache-domain
│  │  └─ open-above-blanket-cache-warmth-kit
│  └─ lightning-gap-domain
│     └─ open-above-lightning-gap-window-kit
├─ airlift-handoff-domain
│  ├─ medicine-sling-domain
│  │  └─ open-above-medicine-sling-drop-kit
│  └─ valley-landing-domain
│     └─ open-above-valley-landing-flare-kit
└─ renderer-handoff
   └─ open-above-storm-shelter-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export function createOpenAboveRidgeShelterBeaconKit(options = {}) {
  const seed = options.seed ?? "open-above-ridge-shelter-beacons";
  const shelters = Math.max(3, Math.floor(n(options.shelters, 4)));
  return {
    id: "open-above-ridge-shelter-beacon-kit",
    domain: "open-above.storm-shelter.discovery.ridge-shelter",
    describe(snapshot = {}) {
      const b = body(snapshot);
      const altitude01 = clamp(n(b.altitude, n(b.position?.y, 180)) / 520);
      const clearance01 = clamp(n(b.clearance, 160) / 340);
      const sinkRisk = clamp(Math.abs(Math.min(0, n(b.stability?.sinkRate, 0))) / 70);
      const frameBand = Math.floor(n(snapshot.frame) / 100);
      return Array.from({ length: shelters }, (_, index) => {
        const urgency = clamp(0.18 + (1 - clearance01) * 0.32 + sinkRisk * 0.2 + wave01(seed, index, frameBand) * 0.28);
        return {
          id: `ridge-shelter-beacon:${index}`,
          domain: "open-above.storm-shelter.discovery.ridge-shelter.beacon",
          kind: "ridge-shelter-beacon",
          x01: clamp(0.14 + index * (0.72 / Math.max(1, shelters - 1)) + (wave01(seed, index, 2) - 0.5) * 0.05),
          y01: clamp(0.2 + wave01(seed, index, 4) * 0.38 - altitude01 * 0.08),
          radius01: clamp(0.026 + urgency * 0.054, 0.026, 0.09),
          urgency,
          shelterNeed: urgency > 0.65 ? "urgent" : urgency > 0.4 ? "watch" : "stable",
          opacity: clamp(0.16 + urgency * 0.62)
        };
      });
    }
  };
}

export function createOpenAboveThermalLiftCorridorKit(options = {}) {
  const seed = options.seed ?? "open-above-thermal-lift-corridors";
  const corridors = Math.max(4, Math.floor(n(options.corridors, 6)));
  return {
    id: "open-above-thermal-lift-corridor-kit",
    domain: "open-above.storm-shelter.discovery.thermal-lift",
    describe(snapshot = {}) {
      const b = body(snapshot);
      const speed01 = clamp(n(b.speed, 0) / n(options.maxSpeed, 170));
      const lift = clamp(0.22 + speed01 * 0.22 + (input(snapshot).boost ? 0.16 : 0) + clamp(n(b.velocity?.y, 0) / 45) * 0.18);
      return Array.from({ length: corridors }, (_, index) => ({
        id: `thermal-lift-corridor:${index}`,
        domain: "open-above.storm-shelter.discovery.thermal-lift.corridor",
        kind: "thermal-lift-corridor",
        x01: clamp(0.5 + Math.sin(index * 0.78 + n(snapshot.elapsed) * 0.75) * (0.18 + lift * 0.1)),
        y01: clamp(0.18 + index * (0.58 / Math.max(1, corridors - 1)) + (wave01(seed, index, 6) - 0.5) * 0.04),
        length01: clamp(0.08 + lift * 0.18 + index * 0.006, 0.08, 0.32),
        lift,
        routeAdvice: lift > 0.62 ? "ride lift" : lift > 0.42 ? "hold line" : "seek stronger lift",
        opacity: clamp(0.13 + lift * 0.52 - index * 0.012)
      }));
    }
  };
}

export function createOpenAboveBlanketCacheWarmthKit(options = {}) {
  const seed = options.seed ?? "open-above-blanket-cache-warmth";
  const caches = Math.max(2, Math.floor(n(options.caches, 3)));
  return {
    id: "open-above-blanket-cache-warmth-kit",
    domain: "open-above.storm-shelter.weather-relief.blanket-cache",
    describe(snapshot = {}) {
      const b = body(snapshot);
      const altitudeCold = clamp(n(b.altitude, n(b.position?.y, 180)) / 540);
      const windCold = clamp(Math.abs(n(b.rotation?.roll, 0)) * 0.55 + Math.abs(Math.min(0, n(b.stability?.sinkRate, 0))) / 100);
      return Array.from({ length: caches }, (_, index) => {
        const warmthDebt = clamp(0.18 + altitudeCold * 0.28 + windCold * 0.28 + wave01(seed, index, Math.floor(n(snapshot.frame) / 130)) * 0.18);
        return {
          id: `blanket-cache-warmth:${index}`,
          domain: "open-above.storm-shelter.weather-relief.blanket-cache.cache",
          kind: "blanket-cache-warmth",
          x01: clamp(0.2 + index * (0.6 / Math.max(1, caches - 1))),
          y01: clamp(0.72 - warmthDebt * 0.25 + (wave01(seed, index, 5) - 0.5) * 0.05),
          radius01: clamp(0.034 + warmthDebt * 0.052, 0.034, 0.095),
          warmthDebt,
          packState: warmthDebt > 0.58 ? "deliver blankets" : warmthDebt > 0.34 ? "reserve blankets" : "warm enough",
          opacity: clamp(0.16 + warmthDebt * 0.56)
        };
      });
    }
  };
}

export function createOpenAboveLightningGapWindowKit(options = {}) {
  const seed = options.seed ?? "open-above-lightning-gap-windows";
  const windows = Math.max(4, Math.floor(n(options.windows, 5)));
  return {
    id: "open-above-lightning-gap-window-kit",
    domain: "open-above.storm-shelter.weather-relief.lightning-gap",
    describe(snapshot = {}) {
      const b = body(snapshot);
      const bankRisk = clamp(Math.abs(n(b.rotation?.roll, 0)) * 0.72);
      const speedRisk = clamp(n(b.speed, 0) / n(options.maxSpeed, 170) * 0.32);
      return Array.from({ length: windows }, (_, index) => {
        const gapSafety = clamp(0.82 - bankRisk * 0.26 - speedRisk + wave01(seed, index, Math.floor(n(snapshot.elapsed) * 2)) * 0.18 - index * 0.025);
        return {
          id: `lightning-gap-window:${index}`,
          domain: "open-above.storm-shelter.weather-relief.lightning-gap.slot",
          kind: "lightning-gap-window",
          side: index % 2 === 0 ? "left" : "right",
          x01: index % 2 === 0 ? clamp(0.08 + index * 0.035) : clamp(0.92 - index * 0.035),
          y01: clamp(0.24 + index * 0.11),
          length01: clamp(0.14 + gapSafety * 0.32, 0.14, 0.48),
          gapSafety,
          clearanceCall: gapSafety > 0.66 ? "cross now" : gapSafety > 0.42 ? "thread carefully" : "hold outside",
          opacity: clamp(0.1 + gapSafety * 0.52)
        };
      });
    }
  };
}

export function createOpenAboveMedicineSlingDropKit(options = {}) {
  const seed = options.seed ?? "open-above-medicine-sling-drops";
  const drops = Math.max(3, Math.floor(n(options.drops, 4)));
  return {
    id: "open-above-medicine-sling-drop-kit",
    domain: "open-above.storm-shelter.airlift-handoff.medicine-sling",
    describe(snapshot = {}) {
      const b = body(snapshot);
      const speed01 = clamp(n(b.speed, 0) / n(options.maxSpeed, 170));
      const clearance01 = clamp(n(b.clearance, 160) / 320);
      const stableRoll = clamp(1 - Math.abs(n(b.rotation?.roll, 0)) * 0.9);
      const base = clamp((1 - Math.abs(clearance01 - 0.44)) * 0.42 + (1 - speed01) * 0.24 + stableRoll * 0.28 + (input(snapshot).pitchDown ? 0.06 : 0));
      return Array.from({ length: drops }, (_, index) => {
        const readiness = clamp(base + (wave01(seed, index, 8) - 0.5) * 0.16);
        return {
          id: `medicine-sling-drop:${index}`,
          domain: "open-above.storm-shelter.airlift-handoff.medicine-sling.drop-zone",
          kind: "medicine-sling-drop",
          x01: clamp(0.22 + index * (0.56 / Math.max(1, drops - 1)) + (wave01(seed, index, 3) - 0.5) * 0.05),
          y01: clamp(0.77 - readiness * 0.2 + index * 0.012),
          radius01: clamp(0.035 + readiness * 0.07, 0.035, 0.12),
          readiness,
          dropCall: readiness > 0.64 ? "drop medicine" : readiness > 0.42 ? "line up sling" : "circle again",
          opacity: clamp(0.13 + readiness * 0.6)
        };
      });
    }
  };
}

export function createOpenAboveValleyLandingFlareKit(options = {}) {
  const flares = Math.max(4, Math.floor(n(options.flares, 5)));
  return {
    id: "open-above-valley-landing-flare-kit",
    domain: "open-above.storm-shelter.airlift-handoff.valley-landing",
    describe(snapshot = {}) {
      const p = position(snapshot);
      const distance = Math.hypot(n(p.x), n(p.z));
      const bearing = Math.atan2(-n(p.x), -n(p.z));
      const yaw = n(body(snapshot).rotation?.yaw, 0);
      const alignment = clamp((Math.cos(bearing - yaw) + 1) / 2);
      const distance01 = clamp(distance / 1800);
      return Array.from({ length: flares }, (_, index) => ({
        id: `valley-landing-flare:${index}`,
        domain: "open-above.storm-shelter.airlift-handoff.valley-landing.flare",
        kind: "valley-landing-flare",
        x01: clamp(0.5 + Math.sin(bearing) * 0.18 + (index - (flares - 1) / 2) * 0.034),
        y01: clamp(0.82 - index * 0.078 - alignment * 0.08),
        alignment,
        distance: Math.round(distance),
        distance01,
        flareCall: alignment > 0.72 ? "flare aligned" : distance01 > 0.55 ? "return to valley" : "turn toward flare",
        opacity: clamp(0.12 + alignment * 0.5 - index * 0.014)
      }));
    }
  };
}

export function createOpenAboveStormShelterRendererHandoffKit() {
  return {
    id: "open-above-storm-shelter-renderer-handoff-kit",
    domain: "open-above.storm-shelter.renderer-handoff",
    compose(groups = {}) {
      const descriptors = {
        ridgeShelterBeacons: clone(groups.ridgeShelterBeacons ?? []),
        thermalLiftCorridors: clone(groups.thermalLiftCorridors ?? []),
        blanketCacheWarmth: clone(groups.blanketCacheWarmth ?? []),
        lightningGapWindows: clone(groups.lightningGapWindows ?? []),
        medicineSlingDrops: clone(groups.medicineSlingDrops ?? []),
        valleyLandingFlares: clone(groups.valleyLandingFlares ?? [])
      };
      return {
        id: "open-above-storm-shelter-renderer-handoff",
        contract: "renderer-consumes-descriptors-only",
        rendererOwns: ["DOM overlay placement", "CSS styling", "presentation timing"],
        rendererDoesNotOwn: ["shelter urgency truth", "airlift scoring", "flight physics", "browser input", "asset loading", "frame-loop ownership"],
        descriptors,
        flatDescriptors: Object.values(descriptors).flat(),
        counts: {
          ridgeShelterBeacons: count(descriptors.ridgeShelterBeacons),
          thermalLiftCorridors: count(descriptors.thermalLiftCorridors),
          blanketCacheWarmth: count(descriptors.blanketCacheWarmth),
          lightningGapWindows: count(descriptors.lightningGapWindows),
          medicineSlingDrops: count(descriptors.medicineSlingDrops),
          valleyLandingFlares: count(descriptors.valleyLandingFlares),
          total: totalCount(descriptors)
        }
      };
    }
  };
}

export function createOpenAboveStormShelterReadinessDomainKit(options = {}) {
  const shelters = options.shelters ?? createOpenAboveRidgeShelterBeaconKit(options.shelterOptions);
  const thermals = options.thermals ?? createOpenAboveThermalLiftCorridorKit(options.thermalOptions);
  const blankets = options.blankets ?? createOpenAboveBlanketCacheWarmthKit(options.blanketOptions);
  const lightning = options.lightning ?? createOpenAboveLightningGapWindowKit(options.lightningOptions);
  const slings = options.slings ?? createOpenAboveMedicineSlingDropKit(options.slingOptions);
  const flares = options.flares ?? createOpenAboveValleyLandingFlareKit(options.flareOptions);
  const handoff = options.handoff ?? createOpenAboveStormShelterRendererHandoffKit(options.handoffOptions);
  return {
    id: "open-above-storm-shelter-readiness-domain-kit",
    domain: "open-above.storm-shelter-readiness",
    tree: OPEN_ABOVE_STORM_SHELTER_READINESS_TREE,
    compose(snapshot = {}) {
      const groups = {
        ridgeShelterBeacons: shelters.describe(snapshot),
        thermalLiftCorridors: thermals.describe(snapshot),
        blanketCacheWarmth: blankets.describe(snapshot),
        lightningGapWindows: lightning.describe(snapshot),
        medicineSlingDrops: slings.describe(snapshot),
        valleyLandingFlares: flares.describe(snapshot)
      };
      const rendererHandoff = handoff.compose(groups);
      return {
        id: "open-above-storm-shelter-readiness",
        version: "2026-07-08-storm-shelter-readiness",
        tree: OPEN_ABOVE_STORM_SHELTER_READINESS_TREE,
        groups,
        rendererHandoff,
        summary: {
          descriptorCount: rendererHandoff.counts.total,
          urgentShelters: groups.ridgeShelterBeacons.filter((beacon) => beacon.shelterNeed === "urgent").length,
          strongLiftCorridors: groups.thermalLiftCorridors.filter((corridor) => corridor.lift > 0.55).length,
          coldCaches: groups.blanketCacheWarmth.filter((cache) => cache.warmthDebt > 0.5).length,
          safeLightningGaps: groups.lightningGapWindows.filter((gap) => gap.gapSafety > 0.58).length,
          viableSlingDrops: groups.medicineSlingDrops.filter((drop) => drop.readiness > 0.55).length,
          landingAlignment: groups.valleyLandingFlares[0]?.alignment ?? 0
        }
      };
    }
  };
}

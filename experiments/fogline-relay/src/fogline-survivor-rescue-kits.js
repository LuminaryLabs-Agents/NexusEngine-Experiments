const VERSION = "0.1.0";

export const FOGLINE_SURVIVOR_RESCUE_DOMAIN_TREE = `fogline-survivor-rescue-readiness-domain
├─ survivor-signal-domain
│  ├─ distress-lantern-domain
│  │  └─ fogline-survivor-distress-lantern-kit
│  └─ rescue-path-domain
│     └─ fogline-rescue-path-ribbon-kit
├─ triage-and-decoy-domain
│  ├─ triage-cache-domain
│  │  └─ fogline-triage-cache-halo-kit
│  └─ flare-decoy-domain
│     └─ fogline-flare-decoy-field-kit
├─ blackout-extraction-domain
│  ├─ blackout-deadline-domain
│  │  └─ fogline-blackout-deadline-ring-kit
│  └─ extraction-warmth-domain
│     └─ fogline-extraction-warmth-corridor-kit
└─ renderer-handoff
   └─ fogline-survivor-rescue-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

function clamp(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function clonePoint(point = {}) {
  return { x: Number(point.x ?? 0), z: Number(point.z ?? point.y ?? 0) };
}

function distance(a = {}, b = {}) {
  return Math.hypot(Number(a.x ?? 0) - Number(b.x ?? 0), Number(a.z ?? a.y ?? 0) - Number(b.z ?? b.y ?? 0));
}

function midpoint(a = {}, b = {}) {
  return { x: (Number(a.x ?? 0) + Number(b.x ?? 0)) / 2, z: (Number(a.z ?? a.y ?? 0) + Number(b.z ?? b.y ?? 0)) / 2 };
}

function yawBetween(a = {}, b = {}) {
  return Math.atan2(Number(b.x ?? 0) - Number(a.x ?? 0), Number(b.z ?? b.y ?? 0) - Number(a.z ?? a.y ?? 0));
}

function relaysOf(game = {}, level = {}) {
  return game.relays ?? level.relays ?? [];
}

function wraithsOf(game = {}, level = {}) {
  return game.wraiths ?? level.wraiths ?? [];
}

function routeOf(route = [], level = {}) {
  return route.length ? route : level.route ?? [];
}

function playerOf(game = {}, level = {}) {
  return game.player ?? level.spawn ?? { x: 0, z: 0, yaw: 0 };
}

function scannedRatio(game = {}, level = {}) {
  const relays = relaysOf(game, level);
  const scanned = Number(game.stats?.scanned ?? relays.filter((relay) => relay.scanned).length ?? 0);
  return clamp(scanned / Math.max(1, relays.length), 0, 1);
}

function survivorTemplate(level = {}) {
  const relays = level.relays ?? [];
  const gate = level.gate ?? { x: 0, z: 42 };
  return [
    { id: "survivor-relay-west", x: Number(relays[0]?.x ?? -8) - 2.2, z: Number(relays[0]?.z ?? 11) + 1.8, condition: "critical", carried: false },
    { id: "survivor-canopy", x: Number(relays[1]?.x ?? 9) + 2.4, z: Number(relays[1]?.z ?? 18) - 1.4, condition: "injured", carried: false },
    { id: "survivor-gate", x: Number(gate.x ?? 0) - 2.8, z: Number(gate.z ?? 42) - 4.4, condition: "stable", carried: false }
  ];
}

function survivorsOf(game = {}, level = {}) {
  const template = survivorTemplate(level);
  const source = game.survivors && game.survivors.length ? game.survivors : template;
  return source.map((survivor, index) => ({
    ...template[index],
    ...survivor,
    id: survivor.id ?? `survivor-${index}`,
    rescued: Boolean(survivor.rescued),
    carried: Boolean(survivor.carried)
  }));
}

function unresolvedSurvivors(game = {}, level = {}) {
  return survivorsOf(game, level).filter((survivor) => !survivor.rescued);
}

function nearestUnresolvedSurvivor(game = {}, level = {}) {
  const player = playerOf(game, level);
  const survivors = unresolvedSurvivors(game, level);
  if (!survivors.length) return null;
  return survivors.reduce((nearest, survivor) => {
    const d = distance(player, survivor);
    return d < nearest.distance ? { survivor, distance: d } : nearest;
  }, { survivor: survivors[0], distance: Infinity }).survivor;
}

function urgencyFor(survivor = {}, game = {}, level = {}) {
  const condition = survivor.condition === "critical" ? 0.72 : survivor.condition === "injured" ? 0.48 : 0.25;
  const nearestThreat = wraithsOf(game, level).reduce((nearest, wraith) => Math.min(nearest, distance(survivor, wraith)), Infinity);
  const threat = clamp(1 - nearestThreat / 24, 0, 1) * 0.32;
  const carried = survivor.carried ? -0.16 : 0;
  return clamp(condition + threat + carried, 0.08, 1);
}

function allDescriptorBuckets(domain = {}) {
  return [
    domain.survivorDistressLanterns,
    domain.rescuePathRibbons,
    domain.triageCacheHalos,
    domain.flareDecoyFields,
    domain.blackoutDeadlineRings,
    domain.extractionWarmthCorridors
  ].flatMap((bucket) => bucket ?? []);
}

export function createFoglineSurvivorDistressLanternKit(config = {}) {
  const color = config.color ?? "#ffe3a3";
  return {
    id: config.id ?? "fogline-survivor-distress-lantern-kit",
    describe({ game = {}, level = {} } = {}) {
      return survivorsOf(game, level).map((survivor, index) => {
        const urgency = urgencyFor(survivor, game, level);
        return {
          id: `survivor-distress-lantern-${survivor.id ?? index}`,
          sourceId: survivor.id ?? `survivor-${index}`,
          archetype: "fogline.survivor.distress.lantern",
          compatibleBucket: "objectiveNeedles",
          compatibleArchetype: "fogline.objective.needle",
          position: clonePoint(survivor),
          height: clamp(2.8 + urgency * 6.4, 2.2, 9.6),
          radius: clamp(1.2 + urgency * 3.8, 1, 5.6),
          opacity: survivor.rescued ? 0.035 : clamp(0.06 + urgency * 0.23, 0.04, 0.36),
          color: survivor.rescued ? "#bafcff" : color,
          urgency,
          rescued: Boolean(survivor.rescued),
          carried: Boolean(survivor.carried)
        };
      });
    }
  };
}

export function createFoglineRescuePathRibbonKit(config = {}) {
  const color = config.color ?? "#9deaff";
  return {
    id: config.id ?? "fogline-rescue-path-ribbon-kit",
    describe({ game = {}, level = {}, route = [] } = {}) {
      const player = playerOf(game, level);
      const survivor = nearestUnresolvedSurvivor(game, level);
      const gate = game.gate ?? level.gate ?? player;
      const target = survivor ?? gate;
      const path = routeOf(route, level);
      const pivot = path.length ? path[Math.min(path.length - 1, Math.max(1, Math.floor(path.length * scannedRatio(game, level))))] : target;
      return [
        {
          id: "rescue-path-ribbon-survivor",
          sourceId: target.id ?? "rescue-target",
          archetype: "fogline.rescue.path.ribbon",
          compatibleBucket: "routeThreads",
          compatibleArchetype: "fogline.route.thread",
          position: midpoint(player, target),
          yaw: yawBetween(player, target),
          length: clamp(distance(player, target), 4, 30),
          width: clamp(0.34 + urgencyFor(target, game, level) * 1.4, 0.3, 2.4),
          opacity: clamp(0.065 + urgencyFor(target, game, level) * 0.18, 0.045, 0.3),
          color,
          urgency: urgencyFor(target, game, level)
        },
        {
          id: "rescue-path-ribbon-extraction",
          sourceId: gate.id ?? "gate",
          archetype: "fogline.rescue.path.ribbon",
          compatibleBucket: "routeThreads",
          compatibleArchetype: "fogline.route.thread",
          position: midpoint(pivot, gate),
          yaw: yawBetween(pivot, gate),
          length: clamp(distance(pivot, gate), 4, 32),
          width: clamp(0.28 + scannedRatio(game, level) * 1.1, 0.25, 1.9),
          opacity: clamp(0.04 + scannedRatio(game, level) * 0.15, 0.035, 0.24),
          color: "#bafcff",
          extractionReady: scannedRatio(game, level) >= 0.98
        }
      ];
    }
  };
}

export function createFoglineTriageCacheHaloKit(config = {}) {
  const color = config.color ?? "#bafcff";
  return {
    id: config.id ?? "fogline-triage-cache-halo-kit",
    describe({ game = {}, level = {} } = {}) {
      const player = playerOf(game, level);
      const relays = relaysOf(game, level);
      const anchors = relays.filter((relay) => relay.scanned || Number(relay.scanProgress ?? 0) > 0.35);
      const caches = (anchors.length ? anchors : [level.spawn ?? player]).slice(0, 4);
      return caches.map((cache, index) => {
        const readiness = clamp(0.24 + scannedRatio(game, level) * 0.46 + clamp(1 - distance(player, cache) / 34, 0, 1) * 0.28, 0.1, 1);
        return {
          id: `triage-cache-halo-${cache.id ?? index}`,
          sourceId: cache.id ?? "spawn",
          archetype: "fogline.triage.cache.halo",
          compatibleBucket: "safePockets",
          compatibleArchetype: "fogline.safe.pocket",
          position: clonePoint(cache),
          radius: clamp(2.2 + readiness * 4.8, 2, 8.4),
          opacity: clamp(0.045 + readiness * 0.16, 0.035, 0.25),
          color,
          readiness
        };
      });
    }
  };
}

export function createFoglineFlareDecoyFieldKit(config = {}) {
  const color = config.color ?? "#ff5068";
  return {
    id: config.id ?? "fogline-flare-decoy-field-kit",
    describe({ game = {}, level = {} } = {}) {
      const player = playerOf(game, level);
      const elapsed = Number(game.stats?.elapsed ?? 0);
      return wraithsOf(game, level).map((wraith, index) => {
        const d = distance(player, wraith);
        const phase = ((elapsed / 11) + index * 0.27) % 1;
        const decoyStrength = clamp((wraith.mode === "chase" ? 0.62 : 0.28) + clamp(1 - d / 28, 0, 1) * 0.34 + phase * 0.16, 0.08, 1);
        return {
          id: `flare-decoy-field-${wraith.id ?? index}`,
          sourceId: wraith.id ?? `wraith-${index}`,
          archetype: "fogline.flare.decoy.field",
          compatibleBucket: "pressureVignettes",
          compatibleArchetype: "fogline.pressure.vignette",
          position: midpoint(player, wraith),
          radius: clamp(2.6 + decoyStrength * 8.8, 2.4, 13),
          opacity: clamp(0.05 + decoyStrength * 0.2, 0.04, 0.32),
          color,
          decoyStrength,
          phase
        };
      });
    }
  };
}

export function createFoglineBlackoutDeadlineRingKit(config = {}) {
  const color = config.color ?? "#ffe3a3";
  return {
    id: config.id ?? "fogline-blackout-deadline-ring-kit",
    describe({ game = {}, level = {} } = {}) {
      const gate = game.gate ?? level.gate ?? {};
      const elapsed = Number(game.stats?.elapsed ?? 0);
      const timeBudget = Number(game.stats?.timeBudget ?? 360);
      const pressure = clamp(elapsed / Math.max(1, timeBudget), 0, 1);
      const relief = scannedRatio(game, level) * 0.38;
      const blackout = clamp(pressure - relief + unresolvedSurvivors(game, level).length * 0.08, 0, 1);
      return [
        {
          id: "blackout-deadline-ring-gate",
          sourceId: gate.id ?? "gate",
          archetype: "fogline.blackout.deadline.ring",
          compatibleBucket: "gateSigils",
          compatibleArchetype: "fogline.gate.sigil",
          position: clonePoint(gate),
          radius: clamp(Number(gate.radius ?? 3) + 2 + blackout * 6.5, 3.2, 12),
          opacity: clamp(0.05 + blackout * 0.24, 0.04, 0.34),
          rotation: blackout * Math.PI * 2,
          color,
          blackout
        },
        {
          id: "blackout-deadline-ring-field",
          sourceId: "fogline-blackout-field",
          archetype: "fogline.blackout.deadline.ring",
          compatibleBucket: "pressureVignettes",
          compatibleArchetype: "fogline.pressure.vignette",
          position: midpoint(playerOf(game, level), gate),
          radius: clamp(4 + blackout * 12, 4, 18),
          opacity: clamp(0.035 + blackout * 0.2, 0.03, 0.3),
          color: "#ff5068",
          blackout
        }
      ];
    }
  };
}

export function createFoglineExtractionWarmthCorridorKit(config = {}) {
  const color = config.color ?? "#e0ffff";
  return {
    id: config.id ?? "fogline-extraction-warmth-corridor-kit",
    describe({ game = {}, level = {} } = {}) {
      const player = playerOf(game, level);
      const gate = game.gate ?? level.gate ?? player;
      const survivors = survivorsOf(game, level);
      const rescuedRatio = clamp(survivors.filter((survivor) => survivor.rescued || survivor.carried).length / Math.max(1, survivors.length), 0, 1);
      const readiness = Math.max(scannedRatio(game, level), clamp(gate.openProgress ?? 0, 0, 1)) * 0.6 + rescuedRatio * 0.4;
      return [
        {
          id: "extraction-warmth-corridor-route",
          sourceId: gate.id ?? "gate",
          archetype: "fogline.extraction.warmth.corridor",
          compatibleBucket: "routeThreads",
          compatibleArchetype: "fogline.route.thread",
          position: midpoint(player, gate),
          yaw: yawBetween(player, gate),
          length: clamp(distance(player, gate), 6, 36),
          width: clamp(0.42 + readiness * 1.8, 0.35, 2.7),
          opacity: clamp(0.045 + readiness * 0.2, 0.035, 0.3),
          color,
          readiness
        },
        {
          id: "extraction-warmth-corridor-pocket",
          sourceId: gate.id ?? "gate",
          archetype: "fogline.extraction.warmth.corridor",
          compatibleBucket: "safePockets",
          compatibleArchetype: "fogline.safe.pocket",
          position: clonePoint(gate),
          radius: clamp(2.8 + readiness * 6.2, 2.4, 10.2),
          opacity: clamp(0.04 + readiness * 0.18, 0.035, 0.28),
          color,
          readiness,
          ready: readiness >= 0.92
        }
      ];
    }
  };
}

export function createFoglineSurvivorRescueRendererHandoffKit(config = {}) {
  const policy = config.policy ?? "renderer-consumes-descriptors-only";
  return {
    id: config.id ?? "fogline-survivor-rescue-renderer-handoff-kit",
    describe(domain = {}) {
      const descriptors = allDescriptorBuckets(domain);
      const counts = descriptors.reduce((acc, descriptor) => {
        acc[descriptor.archetype] = (acc[descriptor.archetype] ?? 0) + 1;
        return acc;
      }, {});
      return {
        id: "fogline-survivor-rescue-renderer-handoff",
        archetype: "fogline.survivor.rescue.renderer.handoff",
        policy,
        descriptorCount: descriptors.length,
        descriptors,
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

export function createFoglineSurvivorRescueReadinessDomainKit(config = {}) {
  const kits = config.kits ?? [
    createFoglineSurvivorDistressLanternKit(),
    createFoglineRescuePathRibbonKit(),
    createFoglineTriageCacheHaloKit(),
    createFoglineFlareDecoyFieldKit(),
    createFoglineBlackoutDeadlineRingKit(),
    createFoglineExtractionWarmthCorridorKit()
  ];
  const handoffKit = config.handoffKit ?? createFoglineSurvivorRescueRendererHandoffKit();
  return {
    id: config.id ?? "fogline-survivor-rescue-readiness-domain-kit",
    tree: FOGLINE_SURVIVOR_RESCUE_DOMAIN_TREE,
    describe(input = {}) {
      const [
        survivorDistressLanterns,
        rescuePathRibbons,
        triageCacheHalos,
        flareDecoyFields,
        blackoutDeadlineRings,
        extractionWarmthCorridors
      ] = kits.map((kit) => kit.describe(input));
      const domain = {
        version: VERSION,
        survivorDistressLanterns,
        rescuePathRibbons,
        triageCacheHalos,
        flareDecoyFields,
        blackoutDeadlineRings,
        extractionWarmthCorridors
      };
      domain.drawOrder = allDescriptorBuckets(domain);
      domain.rendererHandoff = handoffKit.describe(domain);
      return domain;
    }
  };
}

export function createFoglineSurvivorRescueReadinessDomain(input = {}) {
  return createFoglineSurvivorRescueReadinessDomainKit().describe(input);
}

export const FOGLINE_SURVIVOR_RESCUE_KIT_NAMES = Object.freeze([
  "fogline-survivor-distress-lantern-kit",
  "fogline-rescue-path-ribbon-kit",
  "fogline-triage-cache-halo-kit",
  "fogline-flare-decoy-field-kit",
  "fogline-blackout-deadline-ring-kit",
  "fogline-extraction-warmth-corridor-kit",
  "fogline-survivor-rescue-renderer-handoff-kit",
  "fogline-survivor-rescue-readiness-domain-kit"
]);

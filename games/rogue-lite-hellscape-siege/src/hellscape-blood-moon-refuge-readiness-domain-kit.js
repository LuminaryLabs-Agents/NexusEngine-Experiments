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

function point2(value = {}, fallback = {}) {
  const nested = value.position ?? value.pos ?? value;
  return {
    x: round(nested.x ?? fallback.x ?? 0),
    y: round(nested.y ?? fallback.y ?? 0)
  };
}

function actorPosition(state = {}) {
  return point2(state.avatar ?? state.player ?? state.hero ?? {}, { x: 0, y: 0 });
}

function corePosition(state = {}) {
  return point2(state.core ?? state.bastion ?? state.base ?? state.sanctuary ?? {}, { x: 0, y: 0 });
}

function stableSurvivors(state = {}) {
  const candidates = [state.survivors, state.refugees, state.npcs, state.civilians, state.allies].find(Array.isArray);
  if (candidates?.length) return stableArray(candidates);
  const actor = actorPosition(state);
  return [
    { id: 'scribe-child', x: actor.x - 1.8, y: actor.y + 1.2, condition: 'panicked' },
    { id: 'ash-herbalist', x: actor.x + 2.4, y: actor.y - 0.9, condition: 'burned' },
    { id: 'gate-runner', x: actor.x + 0.4, y: actor.y + 2.1, condition: 'exhausted' }
  ];
}

function stableEnemies(state = {}) {
  const candidates = [state.enemies, state.demons, state.hostiles, state.mobs, state.wave?.enemies, state.waves?.enemies].find(Array.isArray);
  if (candidates?.length) return stableArray(candidates);
  const wave = Number(state.wave?.index ?? state.waves?.current ?? state.wave ?? 1);
  const core = corePosition(state);
  return Array.from({ length: Math.max(2, Math.min(6, wave + 2)) }, (_, index) => ({
    id: `blood-moon-fiend-${index + 1}`,
    x: core.x + 3.2 + index * 0.74,
    y: core.y + (index % 2 ? -2.4 : 2.4),
    threat: 0.44 + index * 0.08
  }));
}

function stableBuilds(state = {}) {
  const candidates = [state.builds, state.structures, state.towers, state.wards, state.objects?.builds].find(Array.isArray);
  if (candidates?.length) return stableArray(candidates);
  const core = corePosition(state);
  return [
    { id: 'ember-watch', x: core.x - 1.4, y: core.y - 1.2, kind: 'watch' },
    { id: 'bone-gate', x: core.x + 1.7, y: core.y + 0.9, kind: 'gate' }
  ];
}

function resourceCount(state = {}, key, fallback = 0) {
  const buckets = [state.inventory, state.resources, state.materials, state.stockpile, state.player?.inventory].filter(Boolean);
  for (const bucket of buckets) {
    if (typeof bucket.get === 'function') return Number(bucket.get(key) ?? fallback) || fallback;
    if (bucket[key] != null) return Number(bucket[key]) || 0;
  }
  return fallback;
}

function distance(a = {}, b = {}) {
  return Math.hypot(Number(a.x ?? 0) - Number(b.x ?? 0), Number(a.y ?? 0) - Number(b.y ?? 0));
}

function nearestEnemyPressure(point, enemies) {
  if (!enemies.length) return 0.12;
  const nearest = enemies.reduce((best, enemy) => Math.min(best, distance(point, point2(enemy))), 99);
  return clamp01(0.82 - nearest * 0.11);
}

function notOwnRendererContract(owner) {
  return {
    owner,
    rendererConsumes: 'serializable blood moon refuge descriptors only',
    rendererMustOwn: ['canvas placement', 'draw order', 'color application', 'view interpolation', 'input binding'],
    rendererMustNotOwn: ['simulation state', 'browser input', 'collision', 'wave timing', 'inventory mutation', 'asset loading', 'audio', 'frame loop', 'Three.js', 'WebGL']
  };
}

export const HELLSCAPE_BLOOD_MOON_REFUGE_READINESS_DOMAIN_TREE = Object.freeze({
  root: 'hellscape-blood-moon-refuge-readiness-domain',
  subdomains: [
    {
      id: 'refugee-location-domain',
      subdomains: [
        { id: 'refuge-sigil-domain', kits: ['hellscape-refuge-sigil-beacon-kit'] },
        { id: 'ash-medicine-domain', kits: ['hellscape-ash-medicine-cache-kit'] }
      ]
    },
    {
      id: 'sanctuary-defense-domain',
      subdomains: [
        { id: 'warded-shelter-ring-domain', kits: ['hellscape-warded-shelter-ring-kit'] },
        { id: 'demon-pressure-front-domain', kits: ['hellscape-demon-pressure-front-kit'] }
      ]
    },
    {
      id: 'evacuation-handoff-domain',
      subdomains: [
        { id: 'soul-ferry-route-domain', kits: ['hellscape-soul-ferry-route-kit'] },
        { id: 'dawn-refuge-ledger-domain', kits: ['hellscape-dawn-refuge-ledger-kit'] }
      ]
    },
    {
      id: 'renderer-handoff',
      kits: ['hellscape-blood-moon-refuge-renderer-handoff-kit'],
      contract: 'renderer consumes descriptors only'
    }
  ],
  contract: 'renderer consumes blood moon refuge descriptors only; no DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop ownership'
});

export function createHellscapeRefugeSigilBeaconKit() {
  return {
    id: 'hellscape-refuge-sigil-beacon-kit',
    domain: 'hellscape-blood-moon-refuge-readiness/refuge-sigil',
    describe(state = {}) {
      const enemies = stableEnemies(state).map(point2);
      return stableSurvivors(state).map((survivor, index) => {
        const p = point2(survivor, { x: index, y: index * 0.4 });
        const conditionPressure = survivor.condition === 'burned' ? 0.22 : survivor.condition === 'panicked' ? 0.16 : 0.09;
        const urgency = clamp01(0.28 + nearestEnemyPressure(p, enemies) + conditionPressure + index * 0.035);
        return {
          id: `refuge-sigil-${survivor.id ?? index}`,
          kind: 'refuge-sigil-beacon',
          survivorId: survivor.id ?? `survivor-${index}`,
          x: p.x,
          y: p.y,
          urgency: round(urgency),
          pulse: round(0.4 + urgency * 0.6),
          call: urgency > 0.72 ? 'carry-now' : urgency > 0.52 ? 'escort' : 'watch',
          rendererContract: notOwnRendererContract('hellscape-refuge-sigil-beacon-kit')
        };
      });
    },
    snapshot(state) {
      const beacons = this.describe(state);
      return { beacons: beacons.length, urgent: beacons.filter((beacon) => beacon.call === 'carry-now').length };
    }
  };
}

export function createHellscapeAshMedicineCacheKit() {
  return {
    id: 'hellscape-ash-medicine-cache-kit',
    domain: 'hellscape-blood-moon-refuge-readiness/ash-medicine-cache',
    describe(state = {}) {
      const core = corePosition(state);
      const herbs = resourceCount(state, 'herbs', 2) + resourceCount(state, 'ashHerbs', 0);
      const brimstone = resourceCount(state, 'brimstone', 1);
      const survivors = stableSurvivors(state).length;
      const capacity = Math.max(2, Math.min(8, herbs + brimstone + 1));
      return Array.from({ length: Math.min(4, Math.max(2, Math.ceil(survivors / 2))) }, (_, index) => {
        const fill = clamp01((capacity - index) / Math.max(1, survivors));
        return {
          id: `ash-medicine-cache-${index + 1}`,
          kind: 'ash-medicine-cache',
          x: round(core.x - 1.8 + index * 1.2),
          y: round(core.y + 1.42 + (index % 2) * 0.36),
          fill: round(fill),
          doses: Math.max(0, Math.floor(capacity - index)),
          priority: fill < 0.45 ? 'restock' : 'ready',
          rendererContract: notOwnRendererContract('hellscape-ash-medicine-cache-kit')
        };
      });
    },
    snapshot(state) {
      const caches = this.describe(state);
      return { caches: caches.length, doses: caches.reduce((sum, cache) => sum + cache.doses, 0) };
    }
  };
}

export function createHellscapeWardedShelterRingKit() {
  return {
    id: 'hellscape-warded-shelter-ring-kit',
    domain: 'hellscape-blood-moon-refuge-readiness/warded-shelter-ring',
    describe(state = {}) {
      const core = corePosition(state);
      const builds = stableBuilds(state);
      const anchors = [{ id: 'core-sanctuary', ...core, kind: 'core' }, ...builds].slice(0, 5);
      return anchors.map((anchor, index) => {
        const p = point2(anchor, core);
        const wardStrength = clamp01(0.42 + resourceCount(state, 'runes', 1) * 0.08 + index * 0.035);
        return {
          id: `warded-shelter-ring-${anchor.id ?? index}`,
          kind: 'warded-shelter-ring',
          anchorId: anchor.id ?? `anchor-${index}`,
          x: p.x,
          y: p.y,
          radius: round(1.05 + wardStrength * 1.15),
          wardStrength: round(wardStrength),
          gap: wardStrength < 0.56 ? 'thin' : 'sealed',
          rendererContract: notOwnRendererContract('hellscape-warded-shelter-ring-kit')
        };
      });
    },
    snapshot(state) {
      const rings = this.describe(state);
      return { rings: rings.length, thin: rings.filter((ring) => ring.gap === 'thin').length };
    }
  };
}

export function createHellscapeDemonPressureFrontKit() {
  return {
    id: 'hellscape-demon-pressure-front-kit',
    domain: 'hellscape-blood-moon-refuge-readiness/demon-pressure-front',
    describe(state = {}) {
      const core = corePosition(state);
      const wave = Number(state.wave?.index ?? state.waves?.current ?? state.wave ?? 1) || 1;
      return stableEnemies(state).slice(0, 8).map((enemy, index) => {
        const p = point2(enemy, { x: core.x + 3 + index, y: core.y });
        const threat = clamp01(Number(enemy.threat ?? enemy.power ?? 0.4) + wave * 0.035 + Math.max(0, 4 - distance(p, core)) * 0.06);
        return {
          id: `demon-pressure-front-${enemy.id ?? index}`,
          kind: 'demon-pressure-front',
          enemyId: enemy.id ?? `enemy-${index}`,
          x: p.x,
          y: p.y,
          pressure: round(threat),
          width: round(0.82 + threat * 1.6),
          breachRisk: threat > 0.72 ? 'critical' : threat > 0.5 ? 'rising' : 'contained',
          rendererContract: notOwnRendererContract('hellscape-demon-pressure-front-kit')
        };
      });
    },
    snapshot(state) {
      const fronts = this.describe(state);
      return { fronts: fronts.length, critical: fronts.filter((front) => front.breachRisk === 'critical').length };
    }
  };
}

export function createHellscapeSoulFerryRouteKit() {
  return {
    id: 'hellscape-soul-ferry-route-kit',
    domain: 'hellscape-blood-moon-refuge-readiness/soul-ferry-route',
    describe(state = {}) {
      const core = corePosition(state);
      const enemies = stableEnemies(state).map(point2);
      return stableSurvivors(state).map((survivor, index) => {
        const p = point2(survivor, { x: index, y: 0 });
        const pressure = nearestEnemyPressure(p, enemies);
        const midway = { x: (p.x + core.x) * 0.5, y: (p.y + core.y) * 0.5 };
        return {
          id: `soul-ferry-route-${survivor.id ?? index}`,
          kind: 'soul-ferry-route',
          survivorId: survivor.id ?? `survivor-${index}`,
          x1: p.x,
          y1: p.y,
          x2: core.x,
          y2: core.y,
          midX: round(midway.x),
          midY: round(midway.y),
          risk: round(pressure),
          routing: pressure > 0.64 ? 'detour' : 'direct',
          rendererContract: notOwnRendererContract('hellscape-soul-ferry-route-kit')
        };
      });
    },
    snapshot(state) {
      const routes = this.describe(state);
      return { routes: routes.length, detours: routes.filter((route) => route.routing === 'detour').length };
    }
  };
}

export function createHellscapeDawnRefugeLedgerKit() {
  return {
    id: 'hellscape-dawn-refuge-ledger-kit',
    domain: 'hellscape-blood-moon-refuge-readiness/dawn-refuge-ledger',
    describe(state = {}) {
      const survivors = stableSurvivors(state).length;
      const enemies = stableEnemies(state).length;
      const medicine = resourceCount(state, 'herbs', 2) + resourceCount(state, 'ashHerbs', 0);
      const wards = stableBuilds(state).length + resourceCount(state, 'runes', 1);
      const rescued = Number(state.rescued ?? state.objectives?.rescued ?? state.stats?.rescued ?? 0) || 0;
      const readiness = clamp01((rescued + medicine * 0.55 + wards * 0.45) / Math.max(3, survivors + enemies * 0.5));
      const phase = readiness > 0.78 ? 'dawn-transfer' : readiness > 0.52 ? 'hold-refuge' : 'gather-survivors';
      return [{
        id: 'dawn-refuge-ledger',
        kind: 'dawn-refuge-ledger',
        survivors,
        enemies,
        medicine,
        wards,
        rescued,
        readiness: round(readiness),
        phase,
        nextAction: phase === 'gather-survivors' ? 'mark every sigil beacon' : phase === 'hold-refuge' ? 'seal thin shelter rings' : 'commit dawn ferry handoff',
        rendererContract: notOwnRendererContract('hellscape-dawn-refuge-ledger-kit')
      }];
    },
    snapshot(state) {
      const [ledger] = this.describe(state);
      return { readiness: ledger.readiness, phase: ledger.phase };
    }
  };
}

export function createHellscapeBloodMoonRefugeRendererHandoffKit() {
  return {
    id: 'hellscape-blood-moon-refuge-renderer-handoff-kit',
    domain: 'hellscape-blood-moon-refuge-readiness/renderer-handoff',
    describe(parts = {}) {
      const descriptors = {
        refugeSigilBeacons: stableArray(parts.refugeSigilBeacons),
        ashMedicineCaches: stableArray(parts.ashMedicineCaches),
        wardedShelterRings: stableArray(parts.wardedShelterRings),
        demonPressureFronts: stableArray(parts.demonPressureFronts),
        soulFerryRoutes: stableArray(parts.soulFerryRoutes),
        dawnRefugeLedgers: stableArray(parts.dawnRefugeLedgers)
      };
      const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, value.length]));
      counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
      return {
        id: 'hellscape-blood-moon-refuge-renderer-handoff',
        kit: this.id,
        kind: 'renderer-handoff',
        policy: notOwnRendererContract(this.id),
        descriptors,
        counts
      };
    },
    snapshot(parts) {
      return this.describe(parts).counts;
    }
  };
}

export function createHellscapeBloodMoonRefugeReadinessDomainKit({
  refugeSigilBeaconKit = createHellscapeRefugeSigilBeaconKit(),
  ashMedicineCacheKit = createHellscapeAshMedicineCacheKit(),
  wardedShelterRingKit = createHellscapeWardedShelterRingKit(),
  demonPressureFrontKit = createHellscapeDemonPressureFrontKit(),
  soulFerryRouteKit = createHellscapeSoulFerryRouteKit(),
  dawnRefugeLedgerKit = createHellscapeDawnRefugeLedgerKit(),
  rendererHandoffKit = createHellscapeBloodMoonRefugeRendererHandoffKit()
} = {}) {
  const kitIds = [
    refugeSigilBeaconKit.id,
    ashMedicineCacheKit.id,
    wardedShelterRingKit.id,
    demonPressureFrontKit.id,
    soulFerryRouteKit.id,
    dawnRefugeLedgerKit.id,
    rendererHandoffKit.id
  ];
  return {
    id: 'hellscape-blood-moon-refuge-readiness-domain-kit',
    domain: 'hellscape-blood-moon-refuge-readiness',
    tree: HELLSCAPE_BLOOD_MOON_REFUGE_READINESS_DOMAIN_TREE,
    kitIds,
    describe(state = {}) {
      const refugeSigilBeacons = refugeSigilBeaconKit.describe(state);
      const ashMedicineCaches = ashMedicineCacheKit.describe(state);
      const wardedShelterRings = wardedShelterRingKit.describe(state);
      const demonPressureFronts = demonPressureFrontKit.describe(state);
      const soulFerryRoutes = soulFerryRouteKit.describe(state);
      const dawnRefugeLedgers = dawnRefugeLedgerKit.describe(state);
      const rendererHandoff = rendererHandoffKit.describe({ refugeSigilBeacons, ashMedicineCaches, wardedShelterRings, demonPressureFronts, soulFerryRoutes, dawnRefugeLedgers });
      const [ledger] = dawnRefugeLedgers;
      return {
        id: 'hellscape-blood-moon-refuge-readiness',
        kit: this.id,
        domain: this.domain,
        tree: this.tree,
        kitIds,
        refugeSigilBeacons,
        ashMedicineCaches,
        wardedShelterRings,
        demonPressureFronts,
        soulFerryRoutes,
        dawnRefugeLedgers,
        readiness: ledger?.readiness ?? 0,
        phase: ledger?.phase ?? 'gather-survivors',
        rendererHandoff
      };
    },
    snapshot(state) {
      const readiness = this.describe(state);
      return {
        readiness: readiness.readiness,
        phase: readiness.phase,
        descriptors: readiness.rendererHandoff.counts.total,
        kitIds: kitIds.length
      };
    }
  };
}

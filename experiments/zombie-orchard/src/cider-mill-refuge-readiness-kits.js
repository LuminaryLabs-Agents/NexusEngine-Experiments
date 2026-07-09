const exclusions = Object.freeze(['renderer','dom','browser-input','three-js','webgl','audio','asset-loading','frame-loop','physics','storage']);

export const ZOMBIE_ORCHARD_CIDER_MILL_REFUGE_DOMAIN_TREE = Object.freeze({
  id: 'zombie-orchard-cider-mill-refuge-readiness-domain',
  children: [
    { id: 'refuge-provision-domain', children: [
      { id: 'cider-press-domain', children: ['zombie-orchard-cider-press-kit'] },
      { id: 'root-cellar-cache-domain', children: ['zombie-orchard-root-cellar-cache-kit'] }
    ] },
    { id: 'path-clearing-domain', children: [
      { id: 'mill-lantern-route-domain', children: [
        { id: 'lantern-waypoint-domain', children: ['zombie-orchard-mill-lantern-route-kit'] }
      ] },
      { id: 'sawbuck-barricade-domain', children: ['zombie-orchard-sawbuck-barricade-kit'] }
    ] },
    { id: 'family-handoff-domain', children: [
      { id: 'refugee-wagon-domain', children: ['zombie-orchard-refugee-wagon-kit'] },
      { id: 'dawn-refuge-ledger-domain', children: ['zombie-orchard-dawn-refuge-ledger-kit'] }
    ] },
    { id: 'renderer-handoff', children: [
      { id: 'zombie-orchard-cider-mill-refuge-renderer-handoff-kit', note: 'renderer consumes descriptors only' }
    ] }
  ]
});

const C = (value) => Math.max(0, Math.min(1, Number.isFinite(Number(value)) ? Number(value) : 0));
const R = (value, digits = 3) => Math.round(value * 10 ** digits) / 10 ** digits;
const N = (value, fallback, min, max) => Math.max(min, Math.min(max, Math.round(Number.isFinite(Number(value)) ? Number(value) : fallback)));
function hash(seed) { let h = 2166136261; for (const c of String(seed ?? 'cider-mill-refuge')) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let x = hash(seed) || 1; return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return (x >>> 0) / 4294967296; }; }
function pos(seed, index, radius, jitter = 0) { const q = rng(seed + ':' + index); const angle = (index * 0.61803398875 + q() * 0.16) * Math.PI * 2; const rr = radius + (q() - 0.5) * jitter; return { x: R(Math.cos(angle) * rr), y: 0, z: R(Math.sin(angle) * rr) }; }
function readState(input = {}) {
  const round = Math.max(1, Math.round(Number(input.round ?? input.wave ?? 1) || 1));
  const pressure = C(input.pressure ?? input.hordePressure ?? round / 14);
  const healthRaw = Number(input.health ?? input.playerHealth ?? 100);
  const staminaRaw = Number(input.stamina ?? input.playerStamina ?? 100);
  const apples = Math.max(0, Math.round(Number(input.apples ?? 0) || 0));
  const families = Math.max(0, Math.round(Number(input.families ?? input.survivors ?? 2) || 0));
  return {
    seed: String(input.seed ?? 'zombie-orchard-cider-mill-refuge'),
    round,
    pressure,
    health: C(healthRaw > 1 ? healthRaw / 100 : healthRaw),
    stamina: C(staminaRaw > 1 ? staminaRaw / 100 : staminaRaw),
    apples,
    ciderPressed: Math.max(0, Math.round(Number(input.ciderPressed ?? input.cider ?? Math.floor(apples / 4)) || 0)),
    cellarCrates: Math.max(0, Math.round(Number(input.cellarCrates ?? input.crates ?? 1) || 0)),
    routeLanterns: Math.max(0, Math.round(Number(input.routeLanterns ?? input.lanterns ?? 0) || 0)),
    sawbuckCount: Math.max(0, Math.round(Number(input.sawbuckCount ?? input.barricadesBuilt ?? input.barricades ?? 0) || 0)),
    wagonsLoaded: Math.max(0, Math.round(Number(input.wagonsLoaded ?? input.wagons ?? 0) || 0)),
    families,
    familiesSheltered: Math.max(0, Math.round(Number(input.familiesSheltered ?? input.rescued ?? 0) || 0))
  };
}
function descriptor(kind, id, position, state, tags = []) {
  return {
    kind,
    id,
    position,
    state,
    tags,
    rendererHints: {
      shape: kind.includes('press') ? 'gear-press' : kind.includes('cellar') ? 'crate-stack' : kind.includes('lantern') ? 'warm-waypoint' : kind.includes('sawbuck') ? 'wooden-x' : kind.includes('wagon') ? 'wagon' : 'ledger-card',
      layer: 'zombie-orchard-cider-mill-refuge',
      consumes: 'descriptor-only'
    }
  };
}
function kit(id, fn) { return { id, ownershipExclusions: exclusions, evaluate(input = {}) { return fn(readState(input), input); } }; }

export const createZombieOrchardCiderPressKit = (options = {}) => kit('zombie-orchard-cider-press-kit', (state, input) => Array.from({ length: N(input.count ?? state.ciderPressed / 2 + 2, 3, 2, 7) }, (_, index) => {
  const output = C(0.28 + state.apples * 0.018 + state.stamina * 0.16 - state.pressure * 0.12 - index * 0.018);
  return descriptor('zombie-orchard-cider-press', 'cider-press-' + (index + 1), pos(state.seed + ':press', index, 20 + index * 5, 7), { output, gallonsReady: R(4 + output * 18 + state.ciderPressed * 1.4, 2), jamRisk: C(state.pressure * 0.42 + index * 0.025) }, ['provision', 'cider']);
}));

export const createZombieOrchardRootCellarCacheKit = (options = {}) => kit('zombie-orchard-root-cellar-cache-kit', (state, input) => Array.from({ length: N(input.count ?? state.cellarCrates + 2, 3, 2, 8) }, (_, index) => {
  const rationReadiness = C(0.2 + state.cellarCrates * 0.12 + state.apples * 0.01 + state.health * 0.15 - state.pressure * 0.08 - index * 0.012);
  return descriptor('zombie-orchard-root-cellar-cache', 'root-cellar-cache-' + (index + 1), pos(state.seed + ':cellar', index, 14 + index * 6, 8), { rationReadiness, coolness: C(0.66 - state.pressure * 0.14 + index * 0.01), crateCount: Math.max(1, state.cellarCrates + index) }, ['cellar', 'food-cache']);
}));

export const createZombieOrchardMillLanternRouteKit = (options = {}) => kit('zombie-orchard-mill-lantern-route-kit', (state, input) => Array.from({ length: N(input.count ?? state.routeLanterns + 3, 4, 3, 10) }, (_, index) => {
  const lit = C(0.22 + state.routeLanterns * 0.09 + state.stamina * 0.18 - state.pressure * 0.1 - index * 0.01);
  return descriptor('zombie-orchard-mill-lantern-route', 'mill-lantern-route-' + (index + 1), pos(state.seed + ':lantern', index, 36 + (index % 4) * 8, 16), { lit, sightlineMeters: R(9 + lit * 22 + index * 0.7, 2), routeIndex: index + 1 }, ['route', 'lantern']);
}));

export const createZombieOrchardSawbuckBarricadeKit = (options = {}) => kit('zombie-orchard-sawbuck-barricade-kit', (state, input) => Array.from({ length: N(input.count ?? state.sawbuckCount + 3 + state.round / 5, 4, 3, 9) }, (_, index) => {
  const integrity = C(0.3 + state.sawbuckCount * 0.11 + state.health * 0.12 - state.pressure * 0.2 - index * 0.014);
  return descriptor('zombie-orchard-sawbuck-barricade', 'sawbuck-barricade-' + (index + 1), pos(state.seed + ':sawbuck', index, 42 + (index % 3) * 10, 18), { integrity, splinterRisk: C(state.pressure * 0.64 + index * 0.025), laneWidthMeters: R(2.4 + (1 - integrity) * 2.2, 2) }, ['barricade', 'path-clearing']);
}));

export const createZombieOrchardRefugeeWagonKit = (options = {}) => kit('zombie-orchard-refugee-wagon-kit', (state, input) => Array.from({ length: N(input.count ?? state.wagonsLoaded + 2, 2, 2, 6) }, (_, index) => {
  const loadingReadiness = C(0.16 + state.wagonsLoaded * 0.18 + state.routeLanterns * 0.035 + state.cellarCrates * 0.05 - state.pressure * 0.12 - index * 0.02);
  return descriptor('zombie-orchard-refugee-wagon', 'refugee-wagon-' + (index + 1), pos(state.seed + ':wagon', index, 24 + index * 5, 7), { loadingReadiness, seatsOpen: Math.max(0, 4 + state.wagonsLoaded - index - state.familiesSheltered), blanketBundles: Math.max(1, state.cellarCrates + Math.floor(state.ciderPressed / 3)) }, ['family', 'wagon']);
}));

export const createZombieOrchardDawnRefugeLedgerKit = (options = {}) => kit('zombie-orchard-dawn-refuge-ledger-kit', (state) => [descriptor('zombie-orchard-dawn-refuge-ledger', 'dawn-refuge-ledger', { x: 0, y: 0, z: -14 }, { familiesSheltered: Math.min(state.families, state.familiesSheltered), familiesWaiting: Math.max(0, state.families - state.familiesSheltered), provisionsReady: state.ciderPressed + state.cellarCrates, orchardPressure: state.pressure, round: state.round }, ['ledger', 'summary'])]);

export function createZombieOrchardCiderMillRefugeRendererHandoffKit(options = {}) {
  const kits = [createZombieOrchardCiderPressKit(options), createZombieOrchardRootCellarCacheKit(options), createZombieOrchardMillLanternRouteKit(options), createZombieOrchardSawbuckBarricadeKit(options), createZombieOrchardRefugeeWagonKit(options), createZombieOrchardDawnRefugeLedgerKit(options)];
  return {
    id: 'zombie-orchard-cider-mill-refuge-renderer-handoff-kit',
    ownershipExclusions: exclusions,
    evaluate(input = {}) {
      const [ciderPresses, rootCellarCaches, millLanternRoutes, sawbuckBarricades, refugeeWagons, dawnRefugeLedgers] = kits.map((candidate) => candidate.evaluate(input));
      const flatDescriptors = [...ciderPresses, ...rootCellarCaches, ...millLanternRoutes, ...sawbuckBarricades, ...refugeeWagons, ...dawnRefugeLedgers];
      return {
        passId: 'cider-mill-refuge-readiness-renderer-handoff-pass',
        ownershipExclusions: exclusions,
        ciderPresses,
        rootCellarCaches,
        millLanternRoutes,
        sawbuckBarricades,
        refugeeWagons,
        dawnRefugeLedgers,
        flatDescriptors,
        counts: {
          ciderPresses: ciderPresses.length,
          rootCellarCaches: rootCellarCaches.length,
          millLanternRoutes: millLanternRoutes.length,
          sawbuckBarricades: sawbuckBarricades.length,
          refugeeWagons: refugeeWagons.length,
          dawnRefugeLedgers: dawnRefugeLedgers.length,
          total: flatDescriptors.length
        }
      };
    }
  };
}

export function createZombieOrchardCiderMillRefugeReadinessDomainKit(options = {}) {
  const handoff = createZombieOrchardCiderMillRefugeRendererHandoffKit(options);
  return {
    id: 'zombie-orchard-cider-mill-refuge-readiness-domain-kit',
    domainTree: ZOMBIE_ORCHARD_CIDER_MILL_REFUGE_DOMAIN_TREE,
    ownershipExclusions: exclusions,
    compose(input = {}) {
      const state = readState({ ...options, ...input });
      const rendererHandoff = handoff.evaluate(state);
      const parts = rendererHandoff.flatDescriptors.map((item) => item.state.output ?? item.state.rationReadiness ?? item.state.lit ?? item.state.integrity ?? item.state.loadingReadiness ?? (1 - item.state.orchardPressure) ?? 0);
      const average = parts.reduce((sum, part) => sum + C(part), 0) / Math.max(1, parts.length);
      const familyProgress = state.families <= 0 ? 1 : C(state.familiesSheltered / state.families);
      const provisionScore = C((state.ciderPressed + state.cellarCrates) / Math.max(4, state.families * 2));
      const readinessScore = C(average * 0.62 + familyProgress * 0.24 + provisionScore * 0.08 + (1 - state.pressure) * 0.06);
      const missionState = readinessScore > 0.78 ? 'refuge-convoy-ready' : state.pressure > 0.72 ? 'mill-under-siege' : readinessScore > 0.52 ? 'families-staging' : 'provisions-forming';
      const topPriority = state.ciderPressed < Math.max(2, state.families) ? 'press cider for medicine and morale' : state.cellarCrates < 2 ? 'stock the root cellar cache' : state.routeLanterns < 3 ? 'light the mill route' : state.sawbuckCount < 3 ? 'brace sawbuck barricades' : state.wagonsLoaded < 1 ? 'load refugee wagons' : state.familiesSheltered < state.families ? 'move families into refuge wagons' : 'hold the cider mill until dawn';
      return {
        id: 'zombie-orchard-cider-mill-refuge-readiness',
        state,
        summary: {
          readinessScore: R(readinessScore),
          hordePressure: R(state.pressure),
          familyProgress: R(familyProgress),
          provisionScore: R(provisionScore),
          missionState,
          topPriority
        },
        rendererHandoff
      };
    }
  };
}

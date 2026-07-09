function num(value, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, num(value, min)));
}

function clamp01(value) {
  return clamp(value, 0, 1);
}

function vector(value, fallback = [0, 0, 0]) {
  const source = Array.isArray(value) ? value : fallback;
  return [num(source[0], fallback[0] ?? 0), num(source[1], fallback[1] ?? 0), num(source[2], fallback[2] ?? 0)];
}

function round(value) {
  return Math.round(num(value, 0) * 1000) / 1000;
}

function distance(a, b) {
  return Math.hypot(num(a.x, 0) - num(b.x, 0), num(a.z, 0) - num(b.z, 0));
}

function direction(x, z, fallback = { x: 0, z: -1 }) {
  const length = Math.hypot(x, z);
  return length > 0.0001 ? { x: x / length, z: z / length } : fallback;
}

function noise(seed, offset = 0) {
  const value = Math.sin((num(seed, 0) + offset * 97.31) * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

const CACHES = Object.freeze([
  { id: 'north-alley-cache', label: 'north alley cache', x: -18, z: 15, stock: 0.42, urgency: 0.34 },
  { id: 'fallen-column-cache', label: 'fallen column cache', x: -8, z: 5, stock: 0.64, urgency: 0.5 },
  { id: 'plaza-stair-cache', label: 'plaza stair cache', x: 5, z: -3, stock: 0.74, urgency: 0.67 },
  { id: 'east-roof-cache', label: 'east roof cache', x: 16, z: -14, stock: 0.58, urgency: 0.79 }
]);

const RUBBLE = Object.freeze([
  { id: 'west-rubble', label: 'west rubble', x: -13, z: 9, width: 4.8, depth: 2.8, instability: 0.36 },
  { id: 'fountain-collapse', label: 'fountain collapse', x: 1, z: 2, width: 6.2, depth: 3.6, instability: 0.58 },
  { id: 'east-scaffold', label: 'east scaffold', x: 12, z: -8, width: 5.2, depth: 3.1, instability: 0.5 }
]);

export const THIRD_PERSON_WAYFINDING_CACHE_READINESS_TREE = `third-person-wayfinding-cache-readiness-domain
├─ route-marking-domain
│  ├─ chalk-arrow-domain
│  │  └─ third-person-chalk-arrow-mark-kit
│  └─ rescue-ribbon-domain
│     └─ third-person-rescue-ribbon-line-kit
├─ obstacle-assessment-domain
│  ├─ rubble-silhouette-domain
│  │  └─ third-person-rubble-silhouette-kit
│  └─ safe-step-domain
│     └─ third-person-safe-step-tile-kit
├─ supply-cache-handoff-domain
│  ├─ medkit-cache-domain
│  │  ├─ cache-stock-domain
│  │  │  └─ third-person-medkit-cache-crate-kit
│  └─ dawn-wayfinding-ledger-domain
│     └─ third-person-dawn-wayfinding-ledger-kit
└─ renderer-handoff
   └─ third-person-wayfinding-cache-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export const THIRD_PERSON_WAYFINDING_CACHE_OWNERSHIP_EXCLUSIONS = Object.freeze([
  'renderer',
  'DOM',
  'browser input',
  'Three.js',
  'WebGL',
  'audio',
  'asset loading',
  'physics engine',
  'storage',
  'navigation',
  'network',
  'frame-loop ownership'
]);

function readSnapshot(snapshot = {}) {
  const actorVector = vector(snapshot.targetPosition ?? snapshot.actor?.position, [0, 0, 8]);
  const wishVector = vector(snapshot.movementWishWorld, [0, 0, 0]);
  const forwardVector = vector(snapshot.actorForwardWorld, [0, 0, -1]);
  const movementStrength = clamp01(Math.hypot(wishVector[0], wishVector[2]));
  const facing = direction(forwardVector[0], forwardVector[2]);
  const wish = direction(wishVector[0], wishVector[2], facing);
  return {
    actor: { x: actorVector[0], y: actorVector[1], z: actorVector[2] },
    wish,
    facing,
    movementStrength,
    frame: Math.max(0, Math.round(num(snapshot.frame, 0))),
    staminaRatio: clamp01(snapshot.staminaRatio ?? snapshot.stamina ?? 1),
    grounded: snapshot.grounded !== false,
    yVel: num(snapshot.yVel ?? snapshot.actor?.yVel, 0),
    colliderCount: Math.max(0, Math.round(num(snapshot.colliderCount ?? snapshot.colliders, 0))),
    yawStress: clamp01(Math.abs(num(snapshot.orbitYawOffset ?? snapshot.yawOffset, 0)) / Math.PI),
    discoveredCaches: Math.max(0, Math.round(num(snapshot.discoveredCaches ?? snapshot.cacheCount, 0))),
    carriedMedkits: Math.max(0, Math.round(num(snapshot.carriedMedkits ?? snapshot.medkits, 0)))
  };
}

function cacheProgress(state) {
  const nearest = CACHES.reduce((best, cache, index) => {
    const gap = distance(state.actor, cache);
    return gap < best.gap ? { index, gap } : best;
  }, { index: 0, gap: Infinity });
  const discovered = clamp01(state.discoveredCaches / CACHES.length);
  return {
    nearestIndex: nearest.index,
    nearestDistance: nearest.gap,
    cacheCoverage: clamp01(discovered + state.carriedMedkits * 0.09),
    routeProgress: clamp01(discovered * 0.7 + clamp01(1 - nearest.gap / 24) * 0.18 + state.carriedMedkits * 0.08)
  };
}

export function createThirdPersonChalkArrowMarkKit({ arrowCount = 7 } = {}) {
  return { id: 'third-person-chalk-arrow-mark-kit', describe(snapshot = {}) {
    const state = readSnapshot(snapshot);
    return Array.from({ length: Math.max(4, Math.round(arrowCount)) }, (_, index) => {
      const cache = CACHES[index % CACHES.length];
      const t = (index + 1) / (arrowCount + 1);
      const drift = (noise(state.frame, index) - 0.5) * (0.5 + state.yawStress);
      const x = state.actor.x + (cache.x - state.actor.x) * t + state.facing.z * drift;
      const z = state.actor.z + (cache.z - state.actor.z) * t - state.facing.x * drift;
      const legibility = clamp01(0.34 + state.staminaRatio * 0.16 + state.colliderCount * 0.012 + (state.grounded ? 0.08 : -0.08) + state.discoveredCaches * 0.045 - state.yawStress * 0.12);
      return { id: `chalk-arrow-${index}`, kind: 'chalk-arrow-mark', index, targetCacheId: cache.id, position: { x: round(x), y: 0.035, z: round(z) }, heading: round(Math.atan2(cache.x - x, cache.z - z)), legibility: round(legibility), state: legibility > 0.66 ? 'clear-arrow' : legibility > 0.4 ? 'scuffed-arrow' : 'lost-arrow', rendererHint: 'ground chalk arrow descriptor' };
    });
  } };
}

export function createThirdPersonRescueRibbonLineKit() {
  return { id: 'third-person-rescue-ribbon-line-kit', describe(snapshot = {}) {
    const state = readSnapshot(snapshot);
    return CACHES.map((cache) => {
      const gap = distance(state.actor, cache);
      const tension = clamp01(0.24 + state.movementStrength * 0.22 + clamp01(1 - gap / 35) * 0.36 + state.discoveredCaches * 0.035 - state.yawStress * 0.08);
      return { id: `rescue-ribbon-${cache.id}`, kind: 'rescue-ribbon-line', cacheId: cache.id, label: cache.label, start: { x: round(state.actor.x), y: round(0.9 + tension * 0.3), z: round(state.actor.z) }, end: { x: cache.x, y: round(0.7 + cache.urgency * 0.45), z: cache.z }, distance: round(gap), tension: round(tension), state: tension > 0.66 ? 'taut-ribbon' : tension > 0.4 ? 'readable-ribbon' : 'slack-ribbon', rendererHint: 'rescue ribbon route descriptor' };
    });
  } };
}

export function createThirdPersonRubbleSilhouetteKit() {
  return { id: 'third-person-rubble-silhouette-kit', describe(snapshot = {}) {
    const state = readSnapshot(snapshot);
    return RUBBLE.map((field) => {
      const gap = distance(state.actor, field);
      const hazard = clamp01(field.instability * 0.5 + clamp01(1 - gap / 22) * 0.32 + Math.abs(state.yVel) / 34 + state.yawStress * 0.1);
      return { id: `rubble-silhouette-${field.id}`, kind: 'rubble-silhouette', fieldId: field.id, label: field.label, center: { x: field.x, y: round(0.22 + hazard * 0.25), z: field.z }, width: round(field.width), depth: round(field.depth), hazard: round(hazard), state: hazard > 0.66 ? 'unstable-rubble' : hazard > 0.4 ? 'watch-rubble' : 'marked-rubble', rendererHint: 'rubble obstacle descriptor' };
    });
  } };
}

export function createThirdPersonSafeStepTileKit({ tileCount = 9 } = {}) {
  return { id: 'third-person-safe-step-tile-kit', describe(snapshot = {}) {
    const state = readSnapshot(snapshot);
    return Array.from({ length: Math.max(5, Math.round(tileCount)) }, (_, index) => {
      const lane = index % 3 - 1;
      const row = Math.floor(index / 3) + 1;
      const spacing = 1.6 + state.movementStrength * 1.4;
      const x = state.actor.x + state.wish.x * spacing * row + state.facing.z * lane * 1.35;
      const z = state.actor.z + state.wish.z * spacing * row - state.facing.x * lane * 1.35;
      const trust = clamp01(0.3 + state.staminaRatio * 0.2 + (state.grounded ? 0.16 : 0) + state.movementStrength * 0.14 - state.yawStress * 0.09 + noise(state.frame, index) * 0.08);
      return { id: `safe-step-tile-${index}`, kind: 'safe-step-tile', index, position: { x: round(x), y: 0.025, z: round(z) }, trust: round(trust), state: trust > 0.66 ? 'safe-step' : trust > 0.4 ? 'probable-step' : 'uncertain-step', rendererHint: 'safe footing tile descriptor' };
    });
  } };
}

export function createThirdPersonMedkitCacheCrateKit() {
  return { id: 'third-person-medkit-cache-crate-kit', describe(snapshot = {}) {
    const state = readSnapshot(snapshot);
    return CACHES.map((cache) => {
      const gap = distance(state.actor, cache);
      const access = clamp01(0.22 + clamp01(1 - gap / 18) * 0.4 + state.discoveredCaches * 0.08 + state.staminaRatio * 0.08);
      const stock = clamp01(cache.stock + state.carriedMedkits * 0.04 - cache.urgency * 0.08 + access * 0.16);
      return { id: `medkit-cache-${cache.id}`, kind: 'medkit-cache-crate', cacheId: cache.id, label: cache.label, position: { x: cache.x, y: round(0.35 + stock * 0.55), z: cache.z }, stock: round(stock), access: round(access), urgency: round(cache.urgency), state: stock > 0.66 ? 'stocked-cache' : stock > 0.38 ? 'partial-cache' : 'thin-cache', rendererHint: 'medkit cache descriptor' };
    });
  } };
}

export function createThirdPersonDawnWayfindingLedgerKit() {
  return { id: 'third-person-dawn-wayfinding-ledger-kit', describe(snapshot = {}) {
    const state = readSnapshot(snapshot);
    const progress = cacheProgress(state);
    const routePressure = clamp01(0.58 - progress.cacheCoverage * 0.22 + state.yawStress * 0.16 + (state.grounded ? 0 : 0.1) + progress.nearestDistance / 90);
    const readiness = clamp01(0.22 + progress.cacheCoverage * 0.35 + state.staminaRatio * 0.18 + state.colliderCount * 0.015 + progress.routeProgress * 0.22 - routePressure * 0.12);
    const phase = readiness > 0.72 ? 'cache-route-secured' : readiness > 0.48 ? 'cache-route-forming' : 'cache-route-at-risk';
    return [{ id: 'dawn-wayfinding-ledger', kind: 'dawn-wayfinding-ledger', cachesTotal: CACHES.length, cachesDiscovered: Math.min(CACHES.length, state.discoveredCaches), carriedMedkits: state.carriedMedkits, nearestCacheIndex: progress.nearestIndex, nearestCacheDistance: round(progress.nearestDistance), cacheCoverage: round(progress.cacheCoverage), routePressure: round(routePressure), readiness: round(readiness), state: phase, rendererHint: 'wayfinding cache readiness ledger descriptor' }];
  } };
}

export function createThirdPersonWayfindingCacheRendererHandoffKit() {
  return { id: 'third-person-wayfinding-cache-renderer-handoff-kit', describe(descriptors = {}) {
    const safe = {
      chalkArrowMarks: Array.isArray(descriptors.chalkArrowMarks) ? descriptors.chalkArrowMarks : [],
      rescueRibbonLines: Array.isArray(descriptors.rescueRibbonLines) ? descriptors.rescueRibbonLines : [],
      rubbleSilhouettes: Array.isArray(descriptors.rubbleSilhouettes) ? descriptors.rubbleSilhouettes : [],
      safeStepTiles: Array.isArray(descriptors.safeStepTiles) ? descriptors.safeStepTiles : [],
      medkitCacheCrates: Array.isArray(descriptors.medkitCacheCrates) ? descriptors.medkitCacheCrates : [],
      dawnWayfindingLedgers: Array.isArray(descriptors.dawnWayfindingLedgers) ? descriptors.dawnWayfindingLedgers : []
    };
    return { id: 'third-person-wayfinding-cache-renderer-handoff', policy: 'renderer-consumes-descriptors-only', domain: 'third-person-wayfinding-cache-readiness-domain', descriptors: safe, counts: Object.fromEntries(Object.entries(safe).map(([key, value]) => [key, value.length])) };
  } };
}

export function createThirdPersonWayfindingCacheReadinessDomainKit() {
  const kits = [createThirdPersonChalkArrowMarkKit(), createThirdPersonRescueRibbonLineKit(), createThirdPersonRubbleSilhouetteKit(), createThirdPersonSafeStepTileKit(), createThirdPersonMedkitCacheCrateKit(), createThirdPersonDawnWayfindingLedgerKit(), createThirdPersonWayfindingCacheRendererHandoffKit()];
  function describe(snapshot = {}) {
    const descriptors = {
      chalkArrowMarks: kits[0].describe(snapshot),
      rescueRibbonLines: kits[1].describe(snapshot),
      rubbleSilhouettes: kits[2].describe(snapshot),
      safeStepTiles: kits[3].describe(snapshot),
      medkitCacheCrates: kits[4].describe(snapshot),
      dawnWayfindingLedgers: kits[5].describe(snapshot)
    };
    const rendererHandoff = kits[6].describe(descriptors);
    const ledger = descriptors.dawnWayfindingLedgers[0] ?? {};
    return { id: 'third-person-wayfinding-cache-readiness-description', domain: 'third-person-wayfinding-cache-readiness-domain', tree: THIRD_PERSON_WAYFINDING_CACHE_READINESS_TREE, ownershipExclusions: THIRD_PERSON_WAYFINDING_CACHE_OWNERSHIP_EXCLUSIONS, descriptors, counts: rendererHandoff.counts, summary: { readiness: round(ledger.readiness), routePressure: round(ledger.routePressure), cacheCoverage: round(ledger.cacheCoverage), missionState: ledger.state ?? 'cache-route-at-risk' }, rendererHandoff };
  }
  return { id: 'third-person-wayfinding-cache-readiness-domain-kit', domain: 'third-person-wayfinding-cache-readiness-domain', tree: THIRD_PERSON_WAYFINDING_CACHE_READINESS_TREE, ownershipExclusions: THIRD_PERSON_WAYFINDING_CACHE_OWNERSHIP_EXCLUSIONS, kits, describe, snapshot(snapshot = {}) { const description = describe(snapshot); return { domain: description.domain, tree: description.tree, counts: description.counts, summary: description.summary, rendererHandoff: description.rendererHandoff }; } };
}

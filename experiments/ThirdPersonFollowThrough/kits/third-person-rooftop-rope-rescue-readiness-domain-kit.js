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

function round(value) {
  return Math.round(num(value, 0) * 1000) / 1000;
}

function vector(value, fallback = [0, 0, 0]) {
  const source = Array.isArray(value) ? value : fallback;
  return [num(source[0], fallback[0] ?? 0), num(source[1], fallback[1] ?? 0), num(source[2], fallback[2] ?? 0)];
}

function direction(x, z, fallback = { x: 0, z: -1 }) {
  const length = Math.hypot(x, z);
  return length > 0.0001 ? { x: x / length, z: z / length } : fallback;
}

function distance(a, b) {
  return Math.hypot(num(a.x, 0) - num(b.x, 0), num(a.z, 0) - num(b.z, 0));
}

function noise(seed, offset = 0) {
  const value = Math.sin((num(seed, 0) + offset * 131.13) * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

const ANCHORS = Object.freeze([
  { id: 'north-water-tower', label: 'north water tower anchor', x: -18, z: 18, height: 5.8, exposure: 0.34 },
  { id: 'glass-atrium', label: 'glass atrium anchor', x: -5, z: 8, height: 4.7, exposure: 0.52 },
  { id: 'clockwork-roof', label: 'clockwork roof anchor', x: 9, z: -4, height: 6.4, exposure: 0.66 },
  { id: 'east-bell-stack', label: 'east bell stack anchor', x: 20, z: -17, height: 7.1, exposure: 0.78 }
]);

const TRIAGE_TARPS = Object.freeze([
  { id: 'lower-courtyard', label: 'lower courtyard tarp', x: -15, z: 4, capacity: 0.48 },
  { id: 'market-roof', label: 'market roof tarp', x: 2, z: -2, capacity: 0.68 },
  { id: 'eastern-stair', label: 'eastern stair tarp', x: 16, z: -12, capacity: 0.58 }
]);

export const THIRD_PERSON_ROOFTOP_ROPE_RESCUE_READINESS_TREE = `third-person-rooftop-rope-rescue-readiness-domain
├─ rooftop-anchor-domain
│  ├─ anchor-bolt-domain
│  │  └─ third-person-rooftop-anchor-bolt-cluster-kit
│  └─ rope-span-domain
│     └─ third-person-rope-bridge-span-kit
├─ casualty-routing-domain
│  ├─ stretcher-route-domain
│  │  └─ third-person-stretcher-route-marker-kit
│  └─ triage-tarp-domain
│     └─ third-person-triage-tarp-kit
├─ air-signal-handoff-domain
│  ├─ wind-sock-domain
│  │  ├─ gust-risk-domain
│  │  │  └─ third-person-rooftop-wind-sock-hazard-kit
│  └─ dusk-evacuation-ledger-domain
│     └─ third-person-dusk-rooftop-evacuation-ledger-kit
└─ renderer-handoff
   └─ third-person-rooftop-rope-rescue-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export const THIRD_PERSON_ROOFTOP_ROPE_RESCUE_OWNERSHIP_EXCLUSIONS = Object.freeze([
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
  const facing = direction(forwardVector[0], forwardVector[2]);
  const wish = direction(wishVector[0], wishVector[2], facing);
  const movementStrength = clamp01(Math.hypot(wishVector[0], wishVector[2]));
  return {
    actor: { x: actorVector[0], y: actorVector[1], z: actorVector[2] },
    facing,
    wish,
    movementStrength,
    frame: Math.max(0, Math.round(num(snapshot.frame, 0))),
    staminaRatio: clamp01(snapshot.staminaRatio ?? snapshot.stamina ?? 1),
    grounded: snapshot.grounded !== false,
    yVel: num(snapshot.yVel ?? snapshot.actor?.yVel, 0),
    colliderCount: Math.max(0, Math.round(num(snapshot.colliderCount ?? snapshot.colliders, 0))),
    yawStress: clamp01(Math.abs(num(snapshot.orbitYawOffset ?? snapshot.yawOffset, 0)) / Math.PI),
    securedAnchors: Math.max(0, Math.round(num(snapshot.securedAnchors ?? snapshot.anchorCount, 0))),
    bridgedSpans: Math.max(0, Math.round(num(snapshot.bridgedSpans ?? snapshot.spanCount, 0))),
    triagedStretchers: Math.max(0, Math.round(num(snapshot.triagedStretchers ?? snapshot.stretcherCount, 0)))
  };
}

function rescueProgress(state) {
  const nearest = ANCHORS.reduce((best, anchor, index) => {
    const gap = distance(state.actor, anchor);
    return gap < best.gap ? { index, gap } : best;
  }, { index: 0, gap: Infinity });
  const anchorCoverage = clamp01(state.securedAnchors / ANCHORS.length);
  const spanCoverage = clamp01(state.bridgedSpans / Math.max(1, ANCHORS.length - 1));
  const stretcherCoverage = clamp01(state.triagedStretchers / TRIAGE_TARPS.length);
  const routeProgress = clamp01(anchorCoverage * 0.32 + spanCoverage * 0.28 + stretcherCoverage * 0.22 + clamp01(1 - nearest.gap / 26) * 0.18);
  return { nearestIndex: nearest.index, nearestDistance: nearest.gap, anchorCoverage, spanCoverage, stretcherCoverage, routeProgress };
}

export function createThirdPersonRooftopAnchorBoltClusterKit() {
  return { id: 'third-person-rooftop-anchor-bolt-cluster-kit', describe(snapshot = {}) {
    const state = readSnapshot(snapshot);
    return ANCHORS.map((anchor, index) => {
      const gap = distance(state.actor, anchor);
      const integrity = clamp01(0.28 + state.staminaRatio * 0.14 + clamp01(1 - gap / 30) * 0.26 + state.securedAnchors * 0.06 - anchor.exposure * 0.11 - state.yawStress * 0.07);
      return { id: `anchor-bolt-${anchor.id}`, kind: 'rooftop-anchor-bolt-cluster', anchorId: anchor.id, label: anchor.label, index, position: { x: anchor.x, y: round(anchor.height), z: anchor.z }, exposure: round(anchor.exposure), integrity: round(integrity), state: integrity > 0.68 ? 'secured-anchor' : integrity > 0.42 ? 'inspect-anchor' : 'loose-anchor', rendererHint: 'anchor bolt cluster descriptor' };
    });
  } };
}

export function createThirdPersonRopeBridgeSpanKit() {
  return { id: 'third-person-rope-bridge-span-kit', describe(snapshot = {}) {
    const state = readSnapshot(snapshot);
    return ANCHORS.slice(0, -1).map((anchor, index) => {
      const next = ANCHORS[index + 1];
      const midpoint = { x: (anchor.x + next.x) / 2, z: (anchor.z + next.z) / 2 };
      const sag = clamp01(0.24 + (anchor.exposure + next.exposure) * 0.16 + Math.abs(state.yVel) / 40 - state.bridgedSpans * 0.04);
      const tension = clamp01(0.36 + state.bridgedSpans * 0.09 + state.securedAnchors * 0.045 + state.staminaRatio * 0.12 - sag * 0.2 + clamp01(1 - distance(state.actor, midpoint) / 36) * 0.12);
      return { id: `rope-span-${anchor.id}-to-${next.id}`, kind: 'rope-bridge-span', fromAnchorId: anchor.id, toAnchorId: next.id, start: { x: anchor.x, y: round(anchor.height), z: anchor.z }, end: { x: next.x, y: round(next.height), z: next.z }, sag: round(sag), tension: round(tension), state: tension > 0.66 ? 'walkable-span' : tension > 0.4 ? 'threaded-span' : 'loose-span', rendererHint: 'rope bridge span descriptor' };
    });
  } };
}

export function createThirdPersonStretcherRouteMarkerKit({ markerCount = 8 } = {}) {
  return { id: 'third-person-stretcher-route-marker-kit', describe(snapshot = {}) {
    const state = readSnapshot(snapshot);
    const progress = rescueProgress(state);
    const target = TRIAGE_TARPS[Math.min(TRIAGE_TARPS.length - 1, progress.nearestIndex % TRIAGE_TARPS.length)];
    return Array.from({ length: Math.max(5, Math.round(markerCount)) }, (_, index) => {
      const t = (index + 1) / (markerCount + 1);
      const lane = index % 2 === 0 ? -1 : 1;
      const drift = (noise(state.frame, index) - 0.5) * (0.8 + state.yawStress);
      const x = state.actor.x + (target.x - state.actor.x) * t + state.facing.z * lane * 0.9 + drift;
      const z = state.actor.z + (target.z - state.actor.z) * t - state.facing.x * lane * 0.9 - drift;
      const clarity = clamp01(0.3 + state.staminaRatio * 0.2 + state.triagedStretchers * 0.07 + progress.routeProgress * 0.22 - state.yawStress * 0.1 + noise(state.frame, index + 5) * 0.07);
      return { id: `stretcher-route-marker-${index}`, kind: 'stretcher-route-marker', targetTarpId: target.id, index, position: { x: round(x), y: 0.06, z: round(z) }, clarity: round(clarity), state: clarity > 0.68 ? 'clear-marker' : clarity > 0.42 ? 'fading-marker' : 'lost-marker', rendererHint: 'stretcher route marker descriptor' };
    });
  } };
}

export function createThirdPersonTriageTarpKit() {
  return { id: 'third-person-triage-tarp-kit', describe(snapshot = {}) {
    const state = readSnapshot(snapshot);
    return TRIAGE_TARPS.map((tarp, index) => {
      const gap = distance(state.actor, tarp);
      const access = clamp01(0.24 + tarp.capacity * 0.24 + state.triagedStretchers * 0.08 + clamp01(1 - gap / 28) * 0.28 + state.grounded * 0.08 - state.yawStress * 0.08);
      const load = clamp01(0.2 + (index + 1) * 0.11 + state.triagedStretchers * 0.07 - access * 0.1);
      return { id: `triage-tarp-${tarp.id}`, kind: 'triage-tarp', tarpId: tarp.id, label: tarp.label, position: { x: tarp.x, y: round(0.08 + load * 0.18), z: tarp.z }, capacity: round(tarp.capacity), access: round(access), load: round(load), state: access > 0.66 ? 'ready-tarp' : access > 0.42 ? 'crowded-tarp' : 'blocked-tarp', rendererHint: 'triage tarp descriptor' };
    });
  } };
}

export function createThirdPersonRooftopWindSockHazardKit() {
  return { id: 'third-person-rooftop-wind-sock-hazard-kit', describe(snapshot = {}) {
    const state = readSnapshot(snapshot);
    return ANCHORS.map((anchor, index) => {
      const gust = clamp01(0.22 + anchor.exposure * 0.42 + state.yawStress * 0.14 + Math.abs(state.yVel) / 52 + noise(state.frame, index + 17) * 0.13 - state.securedAnchors * 0.025);
      const lean = round((noise(state.frame, index + 31) - 0.5) * Math.PI * (0.18 + gust * 0.28));
      return { id: `wind-sock-${anchor.id}`, kind: 'rooftop-wind-sock-hazard', anchorId: anchor.id, position: { x: round(anchor.x + 1.1), y: round(anchor.height + 0.9), z: round(anchor.z - 0.7) }, gust: round(gust), lean, state: gust > 0.7 ? 'danger-gust' : gust > 0.45 ? 'watch-gust' : 'steady-wind', rendererHint: 'wind sock hazard descriptor' };
    });
  } };
}

export function createThirdPersonDuskRooftopEvacuationLedgerKit() {
  return { id: 'third-person-dusk-rooftop-evacuation-ledger-kit', describe(snapshot = {}) {
    const state = readSnapshot(snapshot);
    const progress = rescueProgress(state);
    const fallRisk = clamp01(0.5 - progress.spanCoverage * 0.16 - progress.anchorCoverage * 0.13 + state.yawStress * 0.18 + Math.abs(state.yVel) / 40 + (state.grounded ? -0.05 : 0.08) + progress.nearestDistance / 105);
    const readiness = clamp01(0.16 + progress.anchorCoverage * 0.26 + progress.spanCoverage * 0.24 + progress.stretcherCoverage * 0.22 + state.staminaRatio * 0.14 + progress.routeProgress * 0.14 - fallRisk * 0.15);
    const phase = readiness > 0.72 ? 'rooftop-rescue-secured' : readiness > 0.48 ? 'rooftop-rescue-forming' : 'rooftop-rescue-at-risk';
    return [{ id: 'dusk-rooftop-evacuation-ledger', kind: 'dusk-rooftop-evacuation-ledger', anchorsTotal: ANCHORS.length, securedAnchors: Math.min(ANCHORS.length, state.securedAnchors), spansTotal: Math.max(1, ANCHORS.length - 1), bridgedSpans: Math.min(Math.max(1, ANCHORS.length - 1), state.bridgedSpans), tarpsTotal: TRIAGE_TARPS.length, triagedStretchers: Math.min(TRIAGE_TARPS.length, state.triagedStretchers), nearestAnchorIndex: progress.nearestIndex, nearestAnchorDistance: round(progress.nearestDistance), readiness: round(readiness), fallRisk: round(fallRisk), state: phase, rendererHint: 'rooftop rope rescue readiness ledger descriptor' }];
  } };
}

export function createThirdPersonRooftopRopeRescueRendererHandoffKit() {
  return { id: 'third-person-rooftop-rope-rescue-renderer-handoff-kit', describe(descriptors = {}) {
    const safe = {
      anchorBoltClusters: Array.isArray(descriptors.anchorBoltClusters) ? descriptors.anchorBoltClusters : [],
      ropeBridgeSpans: Array.isArray(descriptors.ropeBridgeSpans) ? descriptors.ropeBridgeSpans : [],
      stretcherRouteMarkers: Array.isArray(descriptors.stretcherRouteMarkers) ? descriptors.stretcherRouteMarkers : [],
      triageTarps: Array.isArray(descriptors.triageTarps) ? descriptors.triageTarps : [],
      windSockHazards: Array.isArray(descriptors.windSockHazards) ? descriptors.windSockHazards : [],
      duskEvacuationLedgers: Array.isArray(descriptors.duskEvacuationLedgers) ? descriptors.duskEvacuationLedgers : []
    };
    return { id: 'third-person-rooftop-rope-rescue-renderer-handoff', policy: 'renderer-consumes-descriptors-only', domains: ['third-person-rooftop-rope-rescue-readiness-domain'], descriptors: safe, counts: Object.fromEntries(Object.entries(safe).map(([key, value]) => [key, value.length])) };
  } };
}

export function createThirdPersonRooftopRopeRescueReadinessDomainKit() {
  const anchorKit = createThirdPersonRooftopAnchorBoltClusterKit();
  const spanKit = createThirdPersonRopeBridgeSpanKit();
  const markerKit = createThirdPersonStretcherRouteMarkerKit();
  const tarpKit = createThirdPersonTriageTarpKit();
  const windKit = createThirdPersonRooftopWindSockHazardKit();
  const ledgerKit = createThirdPersonDuskRooftopEvacuationLedgerKit();
  const handoffKit = createThirdPersonRooftopRopeRescueRendererHandoffKit();
  return {
    id: 'third-person-rooftop-rope-rescue-readiness-domain-kit',
    tree: THIRD_PERSON_ROOFTOP_ROPE_RESCUE_READINESS_TREE,
    ownershipExclusions: THIRD_PERSON_ROOFTOP_ROPE_RESCUE_OWNERSHIP_EXCLUSIONS,
    kits: [anchorKit.id, spanKit.id, markerKit.id, tarpKit.id, windKit.id, ledgerKit.id, handoffKit.id],
    describe(snapshot = {}) {
      const descriptors = {
        anchorBoltClusters: anchorKit.describe(snapshot),
        ropeBridgeSpans: spanKit.describe(snapshot),
        stretcherRouteMarkers: markerKit.describe(snapshot),
        triageTarps: tarpKit.describe(snapshot),
        windSockHazards: windKit.describe(snapshot),
        duskEvacuationLedgers: ledgerKit.describe(snapshot)
      };
      const rendererHandoff = handoffKit.describe(descriptors);
      const ledger = descriptors.duskEvacuationLedgers[0];
      return { domainId: 'third-person-rooftop-rope-rescue-readiness-domain', tree: THIRD_PERSON_ROOFTOP_ROPE_RESCUE_READINESS_TREE, kits: this.kits, ownershipExclusions: this.ownershipExclusions, descriptors, counts: rendererHandoff.counts, summary: { readiness: ledger.readiness, fallRisk: ledger.fallRisk, state: ledger.state, securedAnchors: ledger.securedAnchors, bridgedSpans: ledger.bridgedSpans, triagedStretchers: ledger.triagedStretchers }, rendererHandoff };
    },
    snapshot(snapshot = {}) {
      return this.describe(snapshot).summary;
    }
  };
}

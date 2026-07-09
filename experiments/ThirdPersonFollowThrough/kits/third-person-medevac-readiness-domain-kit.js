function finite(value, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, finite(value, min)));
}

function clamp01(value) {
  return clamp(value, 0, 1);
}

function arr(value, fallback = []) {
  return Array.isArray(value) ? value : fallback;
}

function vec3(value, fallback = [0, 0, 0]) {
  const source = arr(value, fallback);
  return [finite(source[0], fallback[0] ?? 0), finite(source[1], fallback[1] ?? 0), finite(source[2], fallback[2] ?? 0)];
}

function distance2(a, b) {
  const dx = (a?.x ?? 0) - (b?.x ?? 0);
  const dz = (a?.z ?? 0) - (b?.z ?? 0);
  return Math.sqrt(dx * dx + dz * dz);
}

function magnitude2(x, z) {
  return Math.sqrt(x * x + z * z);
}

function round(value, digits = 3) {
  const scale = 10 ** digits;
  return Math.round(finite(value, 0) * scale) / scale;
}

const DEFAULT_CASUALTIES = [
  { id: 'north-stair-caller', label: 'north stair', x: -12, z: -12, severity: 0.72 },
  { id: 'courtyard-fall', label: 'courtyard', x: 4, z: 2, severity: 0.52 },
  { id: 'gate-runner', label: 'gate runner', x: 15, z: -8, severity: 0.66 },
  { id: 'archive-medic', label: 'archive medic', x: -4, z: 16, severity: 0.44 }
];

const DEFAULT_CORRIDORS = [
  { id: 'left-cover-walk', label: 'left cover', x: -14, z: 6, width: 4.2, safety: 0.66 },
  { id: 'center-column-pass', label: 'center column', x: 0, z: 4, width: 3.8, safety: 0.58 },
  { id: 'right-ambulance-lane', label: 'right lane', x: 15, z: 8, width: 4.4, safety: 0.62 }
];

const DEFAULT_PICKUPS = [
  { id: 'west-stretcher-point', label: 'west stretcher', x: -18, z: -16, readiness: 0.52 },
  { id: 'south-ambulance-ring', label: 'ambulance ring', x: 0, z: -20, readiness: 0.7 },
  { id: 'east-supply-cart', label: 'east cart', x: 18, z: -14, readiness: 0.48 }
];

export const THIRD_PERSON_MEDEVAC_READINESS_TREE = `third-person-medevac-readiness-domain
├─ casualty-triage-domain
│  ├─ casualty-beacon-domain
│  │  └─ third-person-casualty-beacon-kit
│  └─ vital-sign-domain
│     └─ third-person-vital-sign-ribbon-kit
├─ route-safety-domain
│  ├─ cover-corridor-domain
│  │  └─ third-person-cover-corridor-kit
│  └─ signal-flare-domain
│     └─ third-person-signal-flare-kit
├─ extraction-handoff-domain
│  ├─ stretcher-pickup-domain
│  │  └─ third-person-stretcher-pickup-kit
│  └─ evacuation-timer-domain
│     └─ third-person-evacuation-timer-kit
└─ renderer-handoff
   └─ third-person-medevac-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

function snapshotBasics(snapshot = {}) {
  const actor = vec3(snapshot.targetPosition ?? snapshot.actor?.position, [0, 0, 8]);
  const camera = vec3(snapshot.cameraPosition ?? snapshot.camera?.position, [actor[0], 3.2, actor[2] + 7]);
  const movementWish = vec3(snapshot.movementWishWorld, [0, 0, 0]);
  const movementStrength = clamp01(magnitude2(movementWish[0], movementWish[2]));
  const grounded = snapshot.grounded !== false;
  const yVel = finite(snapshot.yVel ?? snapshot.actor?.yVel, 0);
  const colliderCount = Math.max(0, Math.round(finite(snapshot.colliderCount, 6)));
  const frame = Math.max(0, Math.round(finite(snapshot.frame, 0)));
  const staminaRatio = clamp01(snapshot.staminaRatio ?? snapshot.stamina ?? 1);
  return { actor: { x: actor[0], y: actor[1], z: actor[2] }, camera: { x: camera[0], y: camera[1], z: camera[2] }, movementStrength, grounded, yVel, colliderCount, frame, staminaRatio };
}

export function createThirdPersonCasualtyBeaconKit({ casualties = DEFAULT_CASUALTIES } = {}) {
  return {
    id: 'third-person-casualty-beacon-kit',
    domain: 'third-person-medevac/casualty-triage/casualty-beacon',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      return casualties.map((casualty, index) => {
        const distance = distance2(basics.actor, casualty);
        const proximity = clamp01(1 - distance / 28);
        const urgency = clamp01(casualty.severity * 0.72 + proximity * 0.28 + (basics.grounded ? 0.02 : -0.04));
        return { id: `casualty-beacon-${casualty.id}`, kind: 'casualty-beacon', casualtyId: casualty.id, label: casualty.label, index, position: { x: casualty.x, y: 0.2, z: casualty.z }, distance: round(distance), urgency: round(urgency), state: urgency > 0.72 ? 'critical' : urgency > 0.48 ? 'urgent' : 'stable', opacity: round(clamp(0.18 + urgency * 0.62, 0.16, 0.86)), rendererHint: 'world-space casualty beacon descriptor' };
      });
    }
  };
}

export function createThirdPersonVitalSignRibbonKit({ casualties = DEFAULT_CASUALTIES } = {}) {
  return {
    id: 'third-person-vital-sign-ribbon-kit',
    domain: 'third-person-medevac/casualty-triage/vital-sign',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      return casualties.map((casualty, index) => {
        const distance = distance2(basics.actor, casualty);
        const stabilization = clamp01((1 - casualty.severity) * 0.38 + clamp01(1 - distance / 18) * 0.42 + basics.staminaRatio * 0.16 + (basics.grounded ? 0.04 : -0.06));
        return { id: `vital-sign-ribbon-${casualty.id}`, kind: 'vital-sign-ribbon', casualtyId: casualty.id, index, position: { x: casualty.x, y: 0.35, z: casualty.z }, stabilization: round(stabilization), pulse: round(clamp(0.22 + casualty.severity * 0.5 - stabilization * 0.12, 0.12, 0.78)), state: stabilization > 0.62 ? 'stabilizing' : stabilization > 0.36 ? 'fragile' : 'declining', rendererHint: 'casualty vital sign ribbon descriptor' };
      });
    }
  };
}

export function createThirdPersonCoverCorridorKit({ corridors = DEFAULT_CORRIDORS } = {}) {
  return {
    id: 'third-person-cover-corridor-kit',
    domain: 'third-person-medevac/route-safety/cover-corridor',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      return corridors.map((corridor, index) => {
        const distance = distance2(basics.actor, corridor);
        const approach = clamp01(1 - distance / 26);
        const safety = clamp01(corridor.safety * 0.66 + approach * 0.22 + (basics.colliderCount >= 6 ? 0.08 : -0.06) + (basics.grounded ? 0.04 : -0.04));
        return { id: `cover-corridor-${corridor.id}`, kind: 'cover-corridor', corridorId: corridor.id, label: corridor.label, index, center: { x: corridor.x, y: 0.12, z: corridor.z }, width: round(corridor.width * (0.9 + safety * 0.22)), safety: round(safety), state: safety > 0.64 ? 'clear' : safety > 0.42 ? 'contested' : 'exposed', opacity: round(clamp(0.16 + safety * 0.58, 0.14, 0.82)), rendererHint: 'safe medevac corridor descriptor' };
      });
    }
  };
}

export function createThirdPersonSignalFlareKit({ casualties = DEFAULT_CASUALTIES } = {}) {
  return {
    id: 'third-person-signal-flare-kit',
    domain: 'third-person-medevac/route-safety/signal-flare',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      return casualties.slice(0, 3).map((casualty, index) => {
        const distance = distance2(basics.actor, casualty);
        const signal = clamp01(casualty.severity * 0.5 + clamp01(1 - distance / 24) * 0.3 + basics.movementStrength * 0.08 + (basics.frame % 120) / 120 * 0.12);
        return { id: `signal-flare-${casualty.id}`, kind: 'signal-flare', casualtyId: casualty.id, index, origin: { x: casualty.x, y: 1.2 + index * 0.12, z: casualty.z }, signal: round(signal), state: signal > 0.62 ? 'lit' : signal > 0.34 ? 'warming' : 'unlit', radius: round(2.4 + signal * 7.5), rendererHint: 'vertical rescue flare descriptor' };
      });
    }
  };
}

export function createThirdPersonStretcherPickupKit({ pickups = DEFAULT_PICKUPS } = {}) {
  return {
    id: 'third-person-stretcher-pickup-kit',
    domain: 'third-person-medevac/extraction-handoff/stretcher-pickup',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      return pickups.map((pickup, index) => {
        const distance = distance2(basics.actor, pickup);
        const approach = clamp01(1 - distance / 32);
        const readiness = clamp01(pickup.readiness * 0.62 + approach * 0.24 + basics.staminaRatio * 0.1 + (basics.grounded ? 0.04 : -0.08));
        return { id: `stretcher-pickup-${pickup.id}`, kind: 'stretcher-pickup', pickupId: pickup.id, label: pickup.label, index, center: { x: pickup.x, y: 0.16, z: pickup.z }, distance: round(distance), readiness: round(readiness), state: readiness > 0.7 ? 'ready' : readiness > 0.45 ? 'assembling' : 'delayed', opacity: round(clamp(0.2 + readiness * 0.56, 0.18, 0.86)), rendererHint: 'stretcher pickup zone descriptor' };
      });
    }
  };
}

export function createThirdPersonEvacuationTimerKit() {
  return {
    id: 'third-person-evacuation-timer-kit',
    domain: 'third-person-medevac/extraction-handoff/evacuation-timer',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      const pressure = clamp01(basics.movementStrength * 0.24 + Math.abs(basics.yVel) / 18 + (1 - basics.staminaRatio) * 0.34 + Math.max(0, 6 - basics.colliderCount) * 0.04);
      const readiness = clamp01(0.76 - pressure * 0.44 + (basics.grounded ? 0.08 : -0.1));
      return [{ id: 'evacuation-timer-primary', kind: 'evacuation-timer', readiness: round(readiness), pressure: round(pressure), seconds: Math.max(12, Math.round(54 - readiness * 28 + pressure * 16)), state: readiness > 0.68 ? 'go' : readiness > 0.44 ? 'hold' : 'delay', rendererHint: 'medevac timing descriptor' }];
    }
  };
}

export function createThirdPersonMedevacRendererHandoffKit() {
  return {
    id: 'third-person-medevac-renderer-handoff-kit',
    policy: 'renderer-consumes-descriptors-only',
    describe(parts = {}) {
      const descriptors = {
        casualtyBeacons: arr(parts.casualtyBeacons),
        vitalSignRibbons: arr(parts.vitalSignRibbons),
        coverCorridors: arr(parts.coverCorridors),
        signalFlares: arr(parts.signalFlares),
        stretcherPickups: arr(parts.stretcherPickups),
        evacuationTimers: arr(parts.evacuationTimers)
      };
      const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, value.length]));
      return { id: 'third-person-medevac-readiness-renderer-handoff', policy: this.policy, domain: 'third-person-medevac-readiness-domain', descriptors, counts, descriptorCount: Object.values(counts).reduce((sum, count) => sum + count, 0) };
    }
  };
}

export function createThirdPersonMedevacReadinessDomainKit() {
  const casualtyBeaconKit = createThirdPersonCasualtyBeaconKit();
  const vitalSignRibbonKit = createThirdPersonVitalSignRibbonKit();
  const coverCorridorKit = createThirdPersonCoverCorridorKit();
  const signalFlareKit = createThirdPersonSignalFlareKit();
  const stretcherPickupKit = createThirdPersonStretcherPickupKit();
  const evacuationTimerKit = createThirdPersonEvacuationTimerKit();
  const handoffKit = createThirdPersonMedevacRendererHandoffKit();

  function describe(snapshot = {}) {
    const rendererHandoff = handoffKit.describe({
      casualtyBeacons: casualtyBeaconKit.describe(snapshot),
      vitalSignRibbons: vitalSignRibbonKit.describe(snapshot),
      coverCorridors: coverCorridorKit.describe(snapshot),
      signalFlares: signalFlareKit.describe(snapshot),
      stretcherPickups: stretcherPickupKit.describe(snapshot),
      evacuationTimers: evacuationTimerKit.describe(snapshot)
    });
    const criticalCasualties = rendererHandoff.descriptors.casualtyBeacons.filter((beacon) => beacon.state === 'critical').length;
    const readyPickups = rendererHandoff.descriptors.stretcherPickups.filter((pickup) => pickup.state === 'ready').length;
    const evacuationReadiness = rendererHandoff.descriptors.evacuationTimers[0]?.readiness ?? 0;
    return { id: 'third-person-medevac-readiness-description', domainId: 'third-person-medevac-readiness-domain', tree: THIRD_PERSON_MEDEVAC_READINESS_TREE, counts: rendererHandoff.counts, summary: { criticalCasualties, readyPickups, evacuationReadiness, timerState: rendererHandoff.descriptors.evacuationTimers[0]?.state ?? 'hold' }, rendererHandoff };
  }

  return {
    id: 'third-person-medevac-readiness-domain-kit',
    tree: THIRD_PERSON_MEDEVAC_READINESS_TREE,
    kits: { casualtyBeaconKit, vitalSignRibbonKit, coverCorridorKit, signalFlareKit, stretcherPickupKit, evacuationTimerKit, handoffKit },
    describe,
    snapshot(snapshot = {}) {
      const description = describe(snapshot);
      return { domainId: description.domainId, tree: description.tree, counts: description.counts, summary: description.summary, rendererHandoff: description.rendererHandoff };
    }
  };
}

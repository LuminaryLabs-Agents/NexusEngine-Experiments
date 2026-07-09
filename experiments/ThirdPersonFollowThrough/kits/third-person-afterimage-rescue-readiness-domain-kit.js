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
  const dx = finite(a?.x, 0) - finite(b?.x, 0);
  const dz = finite(a?.z, 0) - finite(b?.z, 0);
  return Math.sqrt(dx * dx + dz * dz);
}

function magnitude2(x, z) {
  return Math.sqrt(x * x + z * z);
}

function normalize2(x, z, fallback = { x: 0, z: -1 }) {
  const length = magnitude2(x, z);
  if (length <= 0.0001) return fallback;
  return { x: x / length, z: z / length };
}

function round(value, digits = 3) {
  const scale = 10 ** digits;
  return Math.round(finite(value, 0) * scale) / scale;
}

function seededNoise(seed, offset = 0) {
  const value = Math.sin((finite(seed, 0) + offset * 101.17) * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

const DEFAULT_RESCUE_WAYPOINTS = Object.freeze([
  { id: 'courtyard-flare', label: 'courtyard flare', x: -16, z: 13, urgency: 0.28 },
  { id: 'roofline-runner', label: 'roofline runner', x: -5, z: 3, urgency: 0.44 },
  { id: 'collapsed-bridge', label: 'collapsed bridge', x: 7, z: -6, urgency: 0.68 },
  { id: 'east-extraction-mat', label: 'east extraction mat', x: 17, z: -15, urgency: 0.52 }
]);

const DEFAULT_SWING_ARCS = Object.freeze([
  { id: 'blue-rope-swing', label: 'blue rope swing', x: -11, z: 5, span: 6.4, load: 0.36 },
  { id: 'clocktower-gap', label: 'clocktower gap', x: 2, z: -2, span: 8.1, load: 0.62 },
  { id: 'east-banner-line', label: 'east banner line', x: 13, z: -9, span: 7.3, load: 0.5 }
]);

const DEFAULT_DRONES = Object.freeze([
  { id: 'north-drone', label: 'north signal drone', x: -14, z: -4, altitude: 3.4 },
  { id: 'center-drone', label: 'center signal drone', x: 1, z: 9, altitude: 4.2 },
  { id: 'east-drone', label: 'east signal drone', x: 15, z: -2, altitude: 3.8 }
]);

export const THIRD_PERSON_AFTERIMAGE_RESCUE_READINESS_TREE = `third-person-afterimage-rescue-readiness-domain
├─ motion-evidence-domain
│  ├─ afterimage-trace-domain
│  │  └─ third-person-afterimage-trace-kit
│  └─ landing-dust-domain
│     └─ third-person-landing-dust-puff-kit
├─ rescue-routing-domain
│  ├─ flare-waypoint-domain
│  │  └─ third-person-rescue-flare-waypoint-kit
│  └─ rope-swing-domain
│     └─ third-person-rope-swing-arc-kit
├─ extraction-handoff-domain
│  ├─ signal-drone-domain
│  │  ├─ drone-altitude-domain
│  │  │  └─ third-person-signal-drone-kit
│  └─ dawn-run-ledger-domain
│     └─ third-person-dawn-run-ledger-kit
└─ renderer-handoff
   └─ third-person-afterimage-rescue-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export const THIRD_PERSON_AFTERIMAGE_RESCUE_OWNERSHIP_EXCLUSIONS = Object.freeze([
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
  'frame-loop ownership'
]);

function snapshotBasics(snapshot = {}) {
  const actor = vec3(snapshot.targetPosition ?? snapshot.actor?.position, [0, 0, 8]);
  const camera = vec3(snapshot.cameraPosition ?? snapshot.camera?.position, [actor[0], 3.2, actor[2] + 7]);
  const movementWish = vec3(snapshot.movementWishWorld, [0, 0, 0]);
  const actorForward = vec3(snapshot.actorForwardWorld, [0, 0, -1]);
  const movementStrength = clamp01(magnitude2(movementWish[0], movementWish[2]));
  const facing = normalize2(actorForward[0], actorForward[2]);
  const wish = normalize2(movementWish[0], movementWish[2], facing);
  const grounded = snapshot.grounded !== false;
  const yVel = finite(snapshot.yVel ?? snapshot.actor?.yVel, 0);
  const frame = Math.max(0, Math.round(finite(snapshot.frame, 0)));
  const staminaRatio = clamp01(snapshot.staminaRatio ?? snapshot.stamina ?? 1);
  const colliderCount = Math.max(0, Math.round(finite(snapshot.colliderCount ?? snapshot.colliders, 0)));
  const yawStress = clamp01(Math.abs(finite(snapshot.orbitYawOffset ?? snapshot.yawOffset, 0)) / Math.PI);
  const jumpCount = Math.max(0, Math.round(finite(snapshot.jumpCount ?? snapshot.jumps, 0)));
  return {
    actor: { x: actor[0], y: actor[1], z: actor[2] },
    camera: { x: camera[0], y: camera[1], z: camera[2] },
    movementStrength,
    facing,
    wish,
    grounded,
    yVel,
    frame,
    staminaRatio,
    colliderCount,
    yawStress,
    jumpCount
  };
}

function rescueProgress(basics, waypoints = DEFAULT_RESCUE_WAYPOINTS) {
  if (!waypoints.length) return 0;
  const nearest = waypoints.reduce((best, waypoint, index) => {
    const distance = distance2(basics.actor, waypoint);
    return distance < best.distance ? { index, distance } : best;
  }, { index: 0, distance: Infinity });
  const proximity = clamp01(1 - nearest.distance / 24) / Math.max(1, waypoints.length);
  return clamp01(nearest.index / Math.max(1, waypoints.length - 1) + proximity);
}

export function createThirdPersonAfterimageTraceKit({ trailCount = 6 } = {}) {
  return {
    id: 'third-person-afterimage-trace-kit',
    domain: 'third-person-afterimage-rescue/motion-evidence/afterimage-trace',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      const stride = 1.25 + basics.movementStrength * 2.2 + Math.abs(basics.yVel) * 0.04;
      return Array.from({ length: Math.max(3, Math.round(trailCount)) }, (_, index) => {
        const fade = clamp01(1 - index / Math.max(1, trailCount));
        const sway = (seededNoise(basics.frame, index) - 0.5) * (0.4 + basics.yawStress * 0.8);
        const offset = index + 1;
        const x = basics.actor.x - basics.wish.x * stride * offset + basics.facing.z * sway;
        const z = basics.actor.z - basics.wish.z * stride * offset - basics.facing.x * sway;
        const clarity = clamp01(0.2 + fade * 0.46 + basics.movementStrength * 0.26 + (basics.grounded ? 0.06 : 0.13) - basics.yawStress * 0.08);
        return {
          id: `afterimage-trace-${index}`,
          kind: 'afterimage-trace',
          index,
          position: { x: round(x), y: round(basics.actor.y + 0.05 + index * 0.015), z: round(z) },
          scale: round(0.72 + fade * 0.32 + basics.movementStrength * 0.1),
          clarity: round(clarity),
          state: clarity > 0.68 ? 'bright-echo' : clarity > 0.42 ? 'readable-echo' : 'faint-echo',
          rendererHint: 'motion afterimage descriptor'
        };
      });
    }
  };
}

export function createThirdPersonLandingDustPuffKit() {
  return {
    id: 'third-person-landing-dust-puff-kit',
    domain: 'third-person-afterimage-rescue/motion-evidence/landing-dust',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      const impact = clamp01((basics.grounded ? 0.18 : 0.04) + Math.abs(basics.yVel) / 22 + basics.movementStrength * 0.24 + basics.jumpCount * 0.025);
      return Array.from({ length: 4 }, (_, index) => {
        const angle = (Math.PI * 2 * index) / 4 + seededNoise(basics.frame, index) * 0.45;
        const radius = 0.8 + impact * 2.6 + index * 0.22;
        const lift = impact * 0.18 + index * 0.02;
        return {
          id: `landing-dust-puff-${index}`,
          kind: 'landing-dust-puff',
          index,
          center: {
            x: round(basics.actor.x + Math.cos(angle) * radius),
            y: round(Math.max(0.04, basics.actor.y + lift)),
            z: round(basics.actor.z + Math.sin(angle) * radius)
          },
          radius: round(0.55 + impact * 1.65 + index * 0.12),
          density: round(clamp01(impact * (0.9 - index * 0.12))),
          state: impact > 0.68 ? 'hard-landing' : impact > 0.38 ? 'tracking-dust' : 'quiet-dust',
          rendererHint: 'ground contact dust descriptor'
        };
      });
    }
  };
}

export function createThirdPersonRescueFlareWaypointKit({ waypoints = DEFAULT_RESCUE_WAYPOINTS } = {}) {
  return {
    id: 'third-person-rescue-flare-waypoint-kit',
    domain: 'third-person-afterimage-rescue/rescue-routing/flare-waypoint',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      return waypoints.map((waypoint, index) => {
        const distance = distance2(basics.actor, waypoint);
        const proximity = clamp01(1 - distance / 28);
        const pulse = seededNoise(basics.frame, index) * 0.12;
        const visibility = clamp01(0.26 + proximity * 0.38 + basics.colliderCount * 0.018 + basics.staminaRatio * 0.08 + pulse - waypoint.urgency * 0.05);
        return {
          id: `rescue-flare-waypoint-${waypoint.id}`,
          kind: 'rescue-flare-waypoint',
          waypointId: waypoint.id,
          label: waypoint.label,
          index,
          position: { x: waypoint.x, y: 0.4 + waypoint.urgency * 1.3, z: waypoint.z },
          distance: round(distance),
          urgency: round(waypoint.urgency),
          visibility: round(visibility),
          state: visibility > 0.64 ? 'visible-flare' : visibility > 0.38 ? 'search-flare' : 'hidden-flare',
          rendererHint: 'rescue route flare descriptor'
        };
      });
    }
  };
}

export function createThirdPersonRopeSwingArcKit({ arcs = DEFAULT_SWING_ARCS } = {}) {
  return {
    id: 'third-person-rope-swing-arc-kit',
    domain: 'third-person-afterimage-rescue/rescue-routing/rope-swing',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      return arcs.map((arc, index) => {
        const distance = distance2(basics.actor, arc);
        const approach = clamp01(1 - distance / 24);
        const tension = clamp01(arc.load * 0.48 + basics.movementStrength * 0.2 + Math.abs(basics.yVel) / 30 + approach * 0.22 + basics.yawStress * 0.12);
        return {
          id: `rope-swing-arc-${arc.id}`,
          kind: 'rope-swing-arc',
          arcId: arc.id,
          label: arc.label,
          index,
          center: { x: arc.x, y: 1.5 + tension * 0.7, z: arc.z },
          span: round(arc.span),
          tension: round(tension),
          state: tension > 0.66 ? 'taut-swing' : tension > 0.38 ? 'usable-swing' : 'slack-swing',
          rendererHint: 'jump assist rope arc descriptor'
        };
      });
    }
  };
}

export function createThirdPersonSignalDroneKit({ drones = DEFAULT_DRONES } = {}) {
  return {
    id: 'third-person-signal-drone-kit',
    domain: 'third-person-afterimage-rescue/extraction-handoff/signal-drone/drone-altitude',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      const progress = rescueProgress(basics);
      return drones.map((drone, index) => {
        const distance = distance2(basics.actor, drone);
        const lock = clamp01(0.22 + progress * 0.32 + clamp01(1 - distance / 32) * 0.28 + basics.staminaRatio * 0.1 - basics.yawStress * 0.06);
        return {
          id: `signal-drone-${drone.id}`,
          kind: 'signal-drone',
          droneId: drone.id,
          label: drone.label,
          index,
          position: { x: drone.x, y: round(drone.altitude + lock * 0.8), z: drone.z },
          lock: round(lock),
          rotorPulse: round(clamp01(0.28 + lock * 0.46 + seededNoise(basics.frame, index) * 0.12)),
          state: lock > 0.68 ? 'extraction-lock' : lock > 0.42 ? 'tracking' : 'searching',
          rendererHint: 'aerial rescue drone descriptor'
        };
      });
    }
  };
}

export function createThirdPersonDawnRunLedgerKit() {
  return {
    id: 'third-person-dawn-run-ledger-kit',
    domain: 'third-person-afterimage-rescue/extraction-handoff/dawn-run-ledger',
    describe(snapshot = {}, parts = {}) {
      const basics = snapshotBasics(snapshot);
      const flareVisibility = arr(parts.flareWaypoints).reduce((sum, item) => sum + finite(item.visibility, 0), 0) / Math.max(1, arr(parts.flareWaypoints).length);
      const droneLock = arr(parts.signalDrones).reduce((sum, item) => sum + finite(item.lock, 0), 0) / Math.max(1, arr(parts.signalDrones).length);
      const swingTension = arr(parts.ropeSwingArcs).reduce((sum, item) => sum + finite(item.tension, 0), 0) / Math.max(1, arr(parts.ropeSwingArcs).length);
      const motionClarity = arr(parts.afterimageTraces).reduce((sum, item) => sum + finite(item.clarity, 0), 0) / Math.max(1, arr(parts.afterimageTraces).length);
      const fatigueRisk = clamp01((1 - basics.staminaRatio) * 0.46 + basics.yawStress * 0.24 + Math.abs(basics.yVel) / 34 + basics.jumpCount * 0.02);
      const rescueReadiness = clamp01(flareVisibility * 0.3 + droneLock * 0.24 + swingTension * 0.16 + motionClarity * 0.22 + basics.staminaRatio * 0.08 - fatigueRisk * 0.14);
      return [{
        id: 'dawn-run-ledger-primary',
        kind: 'dawn-run-ledger',
        rescueReadiness: round(rescueReadiness),
        fatigueRisk: round(fatigueRisk),
        flareVisibility: round(flareVisibility),
        droneLock: round(droneLock),
        swingTension: round(swingTension),
        motionClarity: round(motionClarity),
        state: rescueReadiness > 0.7 ? 'extraction-ready' : rescueReadiness > 0.44 ? 'route-forming' : 'needs-readable-motion',
        rendererHint: 'rescue readiness summary descriptor'
      }];
    }
  };
}

export function createThirdPersonAfterimageRescueRendererHandoffKit() {
  return {
    id: 'third-person-afterimage-rescue-renderer-handoff-kit',
    domain: 'third-person-afterimage-rescue/renderer-handoff',
    describe(parts = {}) {
      const descriptors = {
        afterimageTraces: arr(parts.afterimageTraces),
        landingDustPuffs: arr(parts.landingDustPuffs),
        rescueFlareWaypoints: arr(parts.rescueFlareWaypoints),
        ropeSwingArcs: arr(parts.ropeSwingArcs),
        signalDrones: arr(parts.signalDrones),
        dawnRunLedgers: arr(parts.dawnRunLedgers)
      };
      return {
        id: 'third-person-afterimage-rescue-renderer-handoff',
        policy: 'renderer-consumes-descriptors-only',
        domains: ['third-person-afterimage-rescue-readiness-domain'],
        descriptors,
        counts: Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, value.length])),
        ownershipExclusions: [...THIRD_PERSON_AFTERIMAGE_RESCUE_OWNERSHIP_EXCLUSIONS]
      };
    }
  };
}

export function createThirdPersonAfterimageRescueReadinessDomainKit() {
  const afterimageTraceKit = createThirdPersonAfterimageTraceKit();
  const landingDustPuffKit = createThirdPersonLandingDustPuffKit();
  const rescueFlareWaypointKit = createThirdPersonRescueFlareWaypointKit();
  const ropeSwingArcKit = createThirdPersonRopeSwingArcKit();
  const signalDroneKit = createThirdPersonSignalDroneKit();
  const dawnRunLedgerKit = createThirdPersonDawnRunLedgerKit();
  const rendererHandoffKit = createThirdPersonAfterimageRescueRendererHandoffKit();

  return {
    id: 'third-person-afterimage-rescue-readiness-domain-kit',
    domain: 'third-person-afterimage-rescue-readiness-domain',
    tree: THIRD_PERSON_AFTERIMAGE_RESCUE_READINESS_TREE,
    ownershipExclusions: [...THIRD_PERSON_AFTERIMAGE_RESCUE_OWNERSHIP_EXCLUSIONS],
    kits: [
      afterimageTraceKit,
      landingDustPuffKit,
      rescueFlareWaypointKit,
      ropeSwingArcKit,
      signalDroneKit,
      dawnRunLedgerKit,
      rendererHandoffKit
    ],
    describe(snapshot = {}) {
      const afterimageTraces = afterimageTraceKit.describe(snapshot);
      const landingDustPuffs = landingDustPuffKit.describe(snapshot);
      const rescueFlareWaypoints = rescueFlareWaypointKit.describe(snapshot);
      const ropeSwingArcs = ropeSwingArcKit.describe(snapshot);
      const signalDrones = signalDroneKit.describe(snapshot);
      const dawnRunLedgers = dawnRunLedgerKit.describe(snapshot, {
        afterimageTraces,
        rescueFlareWaypoints,
        ropeSwingArcs,
        signalDrones
      });
      const rendererHandoff = rendererHandoffKit.describe({
        afterimageTraces,
        landingDustPuffs,
        rescueFlareWaypoints,
        ropeSwingArcs,
        signalDrones,
        dawnRunLedgers
      });
      const ledger = dawnRunLedgers[0] ?? { rescueReadiness: 0, fatigueRisk: 1, state: 'needs-readable-motion' };
      return {
        domain: this.domain,
        tree: this.tree,
        ownershipExclusions: this.ownershipExclusions,
        descriptors: rendererHandoff.descriptors,
        rendererHandoff,
        counts: rendererHandoff.counts,
        summary: {
          rescueReadiness: ledger.rescueReadiness,
          fatigueRisk: ledger.fatigueRisk,
          state: ledger.state,
          motionClarity: ledger.motionClarity ?? 0,
          droneLock: ledger.droneLock ?? 0,
          flareVisibility: ledger.flareVisibility ?? 0
        }
      };
    },
    snapshot(snapshot = {}) {
      const description = this.describe(snapshot);
      return {
        domain: description.domain,
        summary: description.summary,
        counts: description.counts,
        rendererHandoff: description.rendererHandoff
      };
    }
  };
}

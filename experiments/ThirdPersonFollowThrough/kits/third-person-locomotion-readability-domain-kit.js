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

function magnitude2(x, z) {
  return Math.sqrt(x * x + z * z);
}

function normalize2(x, z, fallback = [0, -1]) {
  const length = magnitude2(x, z);
  if (length < 0.00001) return fallback;
  return [x / length, z / length];
}

function dot2(a, b) {
  return a[0] * b[0] + a[1] * b[1];
}

function yawDeg(x, z, fallback = 0) {
  if (Math.abs(x) + Math.abs(z) < 0.00001) return fallback;
  return Math.round((Math.atan2(x, z) * 180) / Math.PI);
}

const DEFAULT_OBSTACLES = [
  { id: 'left-stack', x: -9, z: -8, radius: 4.3 },
  { id: 'rear-wall-block', x: 0, z: -16, radius: 2.4 },
  { id: 'right-stack', x: 7, z: -11, radius: 5.2 },
  { id: 'pillar-proxy', x: 14, z: 3, radius: 2.2 },
  { id: 'ramp-proxy', x: -13, z: 7, radius: 5.8 },
  { id: 'round-platform', x: 13, z: 9, radius: 5.7 }
];

export const THIRD_PERSON_LOCOMOTION_READABILITY_TREE = `third-person-locomotion-readability-domain
├─ movement-intent-domain
│  ├─ root-yaw-alignment-domain
│  │  └─ third-person-root-yaw-alignment-fan-kit
│  └─ backpedal-guard-domain
│     └─ third-person-backpedal-guard-rail-kit
├─ aerial-control-domain
│  ├─ jump-apex-domain
│  │  └─ third-person-jump-apex-band-kit
│  └─ landing-safety-domain
│     └─ third-person-landing-safety-patch-kit
├─ camera-coaching-domain
│  ├─ recenter-leash-domain
│  │  └─ third-person-camera-recenter-leash-kit
│  └─ input-cadence-domain
│     └─ third-person-input-cadence-beat-kit
└─ renderer-handoff
   └─ third-person-locomotion-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

function snapshotBasics(snapshot = {}) {
  const actor = vec3(snapshot.targetPosition ?? snapshot.actor?.position, [0, 0, 8]);
  const head = vec3(snapshot.headWorld, [actor[0], actor[1] + 1.6, actor[2]]);
  const movementWish = vec3(snapshot.movementWishWorld, [0, 0, 0]);
  const movementForward = vec3(snapshot.movementBasisForwardWorld, [0, 0, -1]);
  const actorForward = vec3(snapshot.actorForwardWorld, [0, 0, -1]);
  const wishPlanar = normalize2(movementWish[0], movementWish[2], normalize2(movementForward[0], movementForward[2]));
  const actorPlanar = normalize2(actorForward[0], actorForward[2]);
  const forwardPlanar = normalize2(movementForward[0], movementForward[2]);
  const moving = magnitude2(movementWish[0], movementWish[2]) > 0.01;
  const grounded = snapshot.grounded !== false;
  const orbitYawOffsetDeg = finite(snapshot.orbitYawOffsetDeg, 0);
  const handoffAlpha = clamp01(snapshot.handoffAlpha ?? 0);
  const moveSpeed = finite(snapshot.moveSpeed, 7.5);
  const yVel = finite(snapshot.yVel, grounded ? 0 : 2);
  const input = snapshot.input ?? {};
  return { actor, head, movementWish, movementForward, actorForward, wishPlanar, actorPlanar, forwardPlanar, moving, grounded, orbitYawOffsetDeg, handoffAlpha, moveSpeed, yVel, input };
}

function obstacleRisk(x, z, obstacles = DEFAULT_OBSTACLES) {
  let risk = 0;
  let nearest = 'none';
  for (const obstacle of obstacles) {
    const distance = magnitude2(x - obstacle.x, z - obstacle.z);
    const next = clamp01(1 - (distance - obstacle.radius) / 5.4);
    if (next > risk) {
      risk = next;
      nearest = obstacle.id;
    }
  }
  return { risk: Number(risk.toFixed(3)), nearest };
}

export function createThirdPersonRootYawAlignmentFanKit() {
  return {
    id: 'third-person-root-yaw-alignment-fan-kit',
    domain: 'third-person-controller/movement-intent/root-yaw-alignment',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      const movementYaw = yawDeg(basics.wishPlanar[0], basics.wishPlanar[1], finite(snapshot.movementYawDeg, 0));
      const actorYaw = yawDeg(basics.actorPlanar[0], basics.actorPlanar[1], finite(snapshot.rootYawDeg, 0));
      const delta = Math.abs((((movementYaw - actorYaw + 540) % 360) - 180));
      const alignment = clamp01(1 - delta / 135);
      return Array.from({ length: 5 }, (_, index) => {
        const spread = (index - 2) * 14;
        return {
          id: `root-yaw-alignment-fan-${index}`,
          kind: 'root-yaw-alignment-fan',
          index,
          anchor: { x: Number(basics.actor[0].toFixed(3)), y: 0.16 + index * 0.003, z: Number(basics.actor[2].toFixed(3)) },
          movementYawDeg: movementYaw,
          actorYawDeg: actorYaw,
          fanYawDeg: movementYaw + spread,
          alignment: Number(alignment.toFixed(3)),
          opacity: Number(clamp(0.2 + alignment * 0.55 - Math.abs(index - 2) * 0.055, 0.12, 0.78).toFixed(3)),
          rendererHint: 'floor yaw intent fan'
        };
      });
    },
    snapshot(snapshot = {}) {
      const fans = this.describe(snapshot);
      return { fans: fans.length, centerAlignment: fans[2]?.alignment ?? 0 };
    }
  };
}

export function createThirdPersonBackpedalGuardRailKit() {
  return {
    id: 'third-person-backpedal-guard-rail-kit',
    domain: 'third-person-controller/movement-intent/backpedal-guard',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      const backpedalDot = dot2(basics.wishPlanar, basics.actorPlanar);
      const isBackpedal = basics.moving && backpedalDot < -0.22;
      const side = [-basics.actorPlanar[1], basics.actorPlanar[0]];
      return Array.from({ length: 4 }, (_, index) => {
        const offset = (index - 1.5) * 0.62;
        const distance = 0.95 + index * 0.42;
        return {
          id: `backpedal-guard-rail-${index}`,
          kind: 'backpedal-guard-rail',
          index,
          position: {
            x: Number((basics.actor[0] - basics.actorPlanar[0] * distance + side[0] * offset).toFixed(3)),
            y: 0.2,
            z: Number((basics.actor[2] - basics.actorPlanar[1] * distance + side[1] * offset).toFixed(3))
          },
          active: isBackpedal,
          backpedalDot: Number(backpedalDot.toFixed(3)),
          opacity: Number((isBackpedal ? 0.72 - index * 0.08 : 0.14).toFixed(3)),
          label: isBackpedal ? 'backpedal keeps root facing' : 'forward root rotation available',
          rendererHint: 'rear guard rail tick'
        };
      });
    },
    snapshot(snapshot = {}) {
      const rails = this.describe(snapshot);
      return { rails: rails.length, active: rails.some((rail) => rail.active) };
    }
  };
}

export function createThirdPersonJumpApexBandKit() {
  return {
    id: 'third-person-jump-apex-band-kit',
    domain: 'third-person-controller/aerial-control/jump-apex',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      const airAlpha = basics.grounded ? 0 : clamp01((basics.actor[1] + Math.max(0, basics.yVel) * 0.12) / 2.5);
      return Array.from({ length: 3 }, (_, index) => {
        const height = basics.head[1] + 0.22 + index * 0.42 + airAlpha * 0.75;
        return {
          id: `jump-apex-band-${index}`,
          kind: 'jump-apex-band',
          index,
          center: { x: Number(basics.head[0].toFixed(3)), y: Number(height.toFixed(3)), z: Number(basics.head[2].toFixed(3)) },
          radius: Number((0.85 + index * 0.42 + airAlpha * 0.55).toFixed(3)),
          airAlpha: Number(airAlpha.toFixed(3)),
          grounded: basics.grounded,
          opacity: Number((basics.grounded ? 0.12 + index * 0.025 : 0.38 + airAlpha * 0.32 - index * 0.04).toFixed(3)),
          rendererHint: 'screen-space jump apex halo'
        };
      });
    },
    snapshot(snapshot = {}) {
      const bands = this.describe(snapshot);
      return { bands: bands.length, airAlpha: bands[0]?.airAlpha ?? 0 };
    }
  };
}

export function createThirdPersonLandingSafetyPatchKit({ obstacles = DEFAULT_OBSTACLES } = {}) {
  return {
    id: 'third-person-landing-safety-patch-kit',
    domain: 'third-person-controller/aerial-control/landing-safety',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      const direction = basics.moving ? basics.wishPlanar : basics.forwardPlanar;
      const fallBias = basics.grounded ? 0.45 : clamp(1.15 - basics.yVel * 0.08, 0.55, 1.45);
      return Array.from({ length: 6 }, (_, index) => {
        const distance = (0.78 + index * 0.74) * fallBias;
        const x = basics.actor[0] + direction[0] * distance;
        const z = basics.actor[2] + direction[1] * distance;
        const safety = obstacleRisk(x, z, obstacles);
        return {
          id: `landing-safety-patch-${index}`,
          kind: 'landing-safety-patch',
          index,
          position: { x: Number(x.toFixed(3)), y: 0.11 + index * 0.002, z: Number(z.toFixed(3)) },
          radius: Number((0.42 + index * 0.045).toFixed(3)),
          risk: safety.risk,
          nearestObstacleId: safety.nearest,
          state: safety.risk > 0.68 ? 'danger' : safety.risk > 0.3 ? 'caution' : 'clear',
          opacity: Number(clamp(0.28 + (basics.grounded ? 0 : 0.22) + safety.risk * 0.22 - index * 0.022, 0.18, 0.78).toFixed(3)),
          rendererHint: 'predicted landing floor patch'
        };
      });
    },
    snapshot(snapshot = {}) {
      const patches = this.describe(snapshot);
      return { patches: patches.length, risky: patches.filter((patch) => patch.state !== 'clear').length };
    }
  };
}

export function createThirdPersonCameraRecenterLeashKit() {
  return {
    id: 'third-person-camera-recenter-leash-kit',
    domain: 'third-person-camera/recenter/leash',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      const side = basics.orbitYawOffsetDeg < 0 ? -1 : 1;
      const pull = clamp01(Math.abs(basics.orbitYawOffsetDeg) / 90 + basics.handoffAlpha * 0.5);
      return Array.from({ length: 5 }, (_, index) => ({
        id: `camera-recenter-leash-${index}`,
        kind: 'camera-recenter-leash',
        index,
        side: side < 0 ? 'left' : 'right',
        orbitYawOffsetDeg: Number(basics.orbitYawOffsetDeg.toFixed(2)),
        pull: Number(pull.toFixed(3)),
        screenAnchor: { xPercent: Number((50 + side * (12 + index * 4)).toFixed(2)), yPercent: Number((18 + index * 5).toFixed(2)) },
        opacity: Number(clamp(0.16 + pull * 0.64 - index * 0.055, 0.1, 0.82).toFixed(3)),
        rendererHint: 'screen-space camera recenter leash'
      }));
    },
    snapshot(snapshot = {}) {
      const leashes = this.describe(snapshot);
      return { leashes: leashes.length, maxPull: Math.max(...leashes.map((leash) => leash.pull)) };
    }
  };
}

export function createThirdPersonInputCadenceBeatKit() {
  return {
    id: 'third-person-input-cadence-beat-kit',
    domain: 'third-person-controller/input-cadence/beats',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      const keys = arr(snapshot.keys, []).concat(Object.entries(basics.input).filter(([, value]) => value === true).map(([key]) => key));
      const uniqueKeys = [...new Set(keys.map((key) => String(key).toLowerCase()))];
      const stride = basics.moving ? clamp01(magnitude2(basics.movementWish[0], basics.movementWish[2])) : 0;
      const labels = ['move', 'strafe', 'backpedal', 'jump', 'orbit', 'debug'];
      return labels.map((label, index) => {
        const active = label === 'move' ? uniqueKeys.some((key) => ['w', 'a', 's', 'd'].includes(key)) || basics.moving
          : label === 'strafe' ? uniqueKeys.some((key) => ['a', 'd'].includes(key))
          : label === 'backpedal' ? uniqueKeys.includes('s') || dot2(basics.wishPlanar, basics.actorPlanar) < -0.22
          : label === 'jump' ? uniqueKeys.includes(' ') || uniqueKeys.includes('space') || !basics.grounded
          : label === 'orbit' ? uniqueKeys.some((key) => key.includes('arrow')) || Math.abs(basics.orbitYawOffsetDeg) > 20
          : uniqueKeys.includes('v');
        return {
          id: `input-cadence-beat-${label}`,
          kind: 'input-cadence-beat',
          index,
          label,
          active,
          stride: Number(stride.toFixed(3)),
          opacity: Number((active ? 0.76 : 0.18 + index * 0.018).toFixed(3)),
          rendererHint: 'controller cadence chip'
        };
      });
    },
    snapshot(snapshot = {}) {
      const beats = this.describe(snapshot);
      return { beats: beats.length, active: beats.filter((beat) => beat.active).length };
    }
  };
}

export function createThirdPersonLocomotionRendererHandoffKit() {
  return {
    id: 'third-person-locomotion-renderer-handoff-kit',
    domain: 'third-person-locomotion-readability/renderer-handoff',
    describe(descriptors = {}) {
      const safe = {
        rootYawFans: arr(descriptors.rootYawFans),
        backpedalGuardRails: arr(descriptors.backpedalGuardRails),
        jumpApexBands: arr(descriptors.jumpApexBands),
        landingSafetyPatches: arr(descriptors.landingSafetyPatches),
        cameraRecenterLeashes: arr(descriptors.cameraRecenterLeashes),
        inputCadenceBeats: arr(descriptors.inputCadenceBeats)
      };
      const counts = Object.fromEntries(Object.entries(safe).map(([key, value]) => [key, value.length]));
      return {
        id: 'third-person-locomotion-renderer-handoff',
        policy: 'renderer-consumes-descriptors-only',
        descriptors: safe,
        counts,
        rendererConsumes: Object.keys(safe),
        rendererOwns: ['DOM overlay placement', 'presentation styling', 'visual interpolation'],
        rendererMustNotOwn: ['controller math', 'camera handoff state', 'jump truth', 'collision truth', 'descriptor generation', 'browser input', 'frame-loop ownership']
      };
    },
    snapshot(descriptors = {}) {
      const handoff = this.describe(descriptors);
      return { countKeys: Object.keys(handoff.counts), totalDescriptors: Object.values(handoff.counts).reduce((sum, value) => sum + value, 0) };
    }
  };
}

export function createThirdPersonLocomotionReadabilityDomainKit(options = {}) {
  const rootYawAlignmentFanKit = createThirdPersonRootYawAlignmentFanKit(options);
  const backpedalGuardRailKit = createThirdPersonBackpedalGuardRailKit(options);
  const jumpApexBandKit = createThirdPersonJumpApexBandKit(options);
  const landingSafetyPatchKit = createThirdPersonLandingSafetyPatchKit(options);
  const cameraRecenterLeashKit = createThirdPersonCameraRecenterLeashKit(options);
  const inputCadenceBeatKit = createThirdPersonInputCadenceBeatKit(options);
  const rendererHandoffKit = createThirdPersonLocomotionRendererHandoffKit(options);
  return {
    id: 'third-person-locomotion-readability-domain-kit',
    domain: 'third-person-follow-through/locomotion-readability-domain',
    tree: THIRD_PERSON_LOCOMOTION_READABILITY_TREE,
    kits: { rootYawAlignmentFanKit, backpedalGuardRailKit, jumpApexBandKit, landingSafetyPatchKit, cameraRecenterLeashKit, inputCadenceBeatKit, rendererHandoffKit },
    describe(snapshot = {}) {
      const descriptors = {
        rootYawFans: rootYawAlignmentFanKit.describe(snapshot),
        backpedalGuardRails: backpedalGuardRailKit.describe(snapshot),
        jumpApexBands: jumpApexBandKit.describe(snapshot),
        landingSafetyPatches: landingSafetyPatchKit.describe(snapshot),
        cameraRecenterLeashes: cameraRecenterLeashKit.describe(snapshot),
        inputCadenceBeats: inputCadenceBeatKit.describe(snapshot)
      };
      const rendererHandoff = rendererHandoffKit.describe(descriptors);
      return {
        id: 'third-person-locomotion-readability-domain',
        route: 'ThirdPersonFollowThrough',
        tree: THIRD_PERSON_LOCOMOTION_READABILITY_TREE,
        descriptors,
        rendererHandoff,
        counts: rendererHandoff.counts,
        ownership: {
          kitOwns: ['serializable locomotion readability descriptors', 'jump/camera/movement classifications', 'landing safety shaping'],
          rendererOwns: rendererHandoff.rendererOwns,
          rendererMustNotOwn: rendererHandoff.rendererMustNotOwn
        }
      };
    },
    snapshot(snapshot = {}) {
      const description = this.describe(snapshot);
      return { route: description.route, kitCount: Object.keys(this.kits).length, counts: description.counts, totalDescriptors: Object.values(description.counts).reduce((sum, value) => sum + value, 0) };
    }
  };
}

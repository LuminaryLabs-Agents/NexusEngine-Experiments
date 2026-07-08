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

function yawDegreesFromVector(x, z, fallback = 0) {
  if (Math.abs(x) + Math.abs(z) < 0.00001) return fallback;
  return Math.round((Math.atan2(x, z) * 180) / Math.PI);
}

function snapshotBasics(snapshot = {}) {
  const actor = vec3(snapshot.targetPosition ?? snapshot.actor?.position, [0, 0, 8]);
  const head = vec3(snapshot.headWorld, [actor[0], actor[1] + 1.6, actor[2]]);
  const camera = vec3(snapshot.cameraPosition, [0, 3.2, 15]);
  const movementWish = vec3(snapshot.movementWishWorld, [0, 0, 0]);
  const movementForward = vec3(snapshot.movementBasisForwardWorld, [0, 0, -1]);
  const actorForward = vec3(snapshot.actorForwardWorld, [0, 0, -1]);
  const orbitYawOffsetDeg = finite(snapshot.orbitYawOffsetDeg, 0);
  const handoffAlpha = clamp01(snapshot.handoffAlpha ?? 0);
  const grounded = snapshot.grounded !== false;
  const moving = magnitude2(movementWish[0], movementWish[2]) > 0.01;
  const debugVisible = snapshot.debugVisible !== false;
  return { actor, head, camera, movementWish, movementForward, actorForward, orbitYawOffsetDeg, handoffAlpha, grounded, moving, debugVisible };
}

const DEFAULT_OBSTACLES = [
  { id: 'left-stack', x: -9, z: -8, radius: 4.3, height: 3 },
  { id: 'rear-wall-block', x: 0, z: -16, radius: 2.4, height: 2 },
  { id: 'right-stack', x: 7, z: -11, radius: 5.2, height: 5 },
  { id: 'pillar-proxy', x: 14, z: 3, radius: 2.2, height: 2.5 },
  { id: 'ramp-proxy', x: -13, z: 7, radius: 5.8, height: 1.7 },
  { id: 'round-platform', x: 13, z: 9, radius: 5.7, height: 1.2 }
];

export function createThirdPersonArenaSurfaceBandKit() {
  return {
    id: 'third-person-arena-surface-band-kit',
    domain: 'third-person-arena/readability/surface-bands',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      const speedBias = clamp01(magnitude2(basics.movementWish[0], basics.movementWish[2]));
      return Array.from({ length: 6 }, (_, index) => {
        const radius = 4 + index * 3.1;
        return {
          id: `arena-band-${index}`,
          kind: 'surface-band',
          index,
          center: { x: Number(basics.actor[0].toFixed(3)), y: 0.018 + index * 0.002, z: Number(basics.actor[2].toFixed(3)) },
          radius: Number(radius.toFixed(2)),
          thickness: Number((0.06 + index * 0.012).toFixed(3)),
          opacity: Number(clamp(0.11 + index * 0.035 + speedBias * 0.08, 0.08, 0.48).toFixed(3)),
          phase: basics.grounded ? 'grounded' : 'airborne',
          rendererHint: 'thin floor ring'
        };
      });
    },
    snapshot(snapshot = {}) {
      const bands = this.describe(snapshot);
      return { bands: bands.length, outerRadius: bands.at(-1)?.radius ?? 0 };
    }
  };
}

export function createThirdPersonMovementBasisTrailKit() {
  return {
    id: 'third-person-movement-basis-trail-kit',
    domain: 'third-person-controller/movement-basis/trails',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      const [mx, mz] = normalize2(basics.movementWish[0], basics.movementWish[2], normalize2(basics.movementForward[0], basics.movementForward[2]));
      const [ax, az] = normalize2(basics.actorForward[0], basics.actorForward[2]);
      const movementYaw = yawDegreesFromVector(mx, mz, finite(snapshot.movementYawDeg, 0));
      const actorYaw = yawDegreesFromVector(ax, az, finite(snapshot.rootYawDeg, 0));
      return Array.from({ length: 8 }, (_, index) => {
        const distance = 0.72 + index * 0.64;
        const side = index % 2 === 0 ? -0.22 : 0.22;
        return {
          id: `movement-trail-${index}`,
          kind: 'basis-trail',
          index,
          position: {
            x: Number((basics.actor[0] + mx * distance + az * side).toFixed(3)),
            y: 0.08,
            z: Number((basics.actor[2] + mz * distance - ax * side).toFixed(3))
          },
          scale: Number((0.42 - index * 0.026).toFixed(3)),
          opacity: Number(clamp(0.84 - index * 0.084, 0.18, 0.84).toFixed(3)),
          movementYawDeg: movementYaw,
          actorYawDeg: actorYaw,
          basisDeltaDeg: Math.round(Math.abs(movementYaw - actorYaw)),
          rendererHint: 'flat ghost footprint'
        };
      });
    },
    snapshot(snapshot = {}) {
      const trails = this.describe(snapshot);
      return { trails: trails.length, maxBasisDeltaDeg: Math.max(...trails.map((trail) => trail.basisDeltaDeg)) };
    }
  };
}

export function createThirdPersonCameraHandoffArcKit() {
  return {
    id: 'third-person-camera-handoff-arc-kit',
    domain: 'third-person-camera/orbit-handoff/arcs',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      const sign = basics.orbitYawOffsetDeg < 0 ? -1 : 1;
      return Array.from({ length: 5 }, (_, index) => {
        const threshold = 18 + index * 18;
        const engaged = Math.abs(basics.orbitYawOffsetDeg) >= threshold || basics.handoffAlpha > index * 0.16;
        return {
          id: `camera-handoff-arc-${index}`,
          kind: 'camera-handoff-arc',
          index,
          pivot: { x: Number(basics.head[0].toFixed(3)), y: Number(basics.head[1].toFixed(3)), z: Number(basics.head[2].toFixed(3)) },
          side: sign < 0 ? 'left' : 'right',
          thresholdDeg: threshold,
          orbitYawOffsetDeg: Number(basics.orbitYawOffsetDeg.toFixed(2)),
          handoffAlpha: Number(basics.handoffAlpha.toFixed(3)),
          engaged,
          opacity: Number((engaged ? 0.52 + index * 0.055 : 0.16 + index * 0.024).toFixed(3)),
          rendererHint: 'screen-space orbit arc'
        };
      });
    },
    snapshot(snapshot = {}) {
      const arcs = this.describe(snapshot);
      return { arcs: arcs.length, engaged: arcs.filter((arc) => arc.engaged).length, side: arcs[0]?.side ?? 'right' };
    }
  };
}

export function createThirdPersonColliderProximityHaloKit({ obstacles = DEFAULT_OBSTACLES } = {}) {
  return {
    id: 'third-person-collider-proximity-halo-kit',
    domain: 'third-person-arena/collision-readability/proximity-halos',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      return obstacles.map((obstacle, index) => {
        const dx = basics.actor[0] - obstacle.x;
        const dz = basics.actor[2] - obstacle.z;
        const distance = magnitude2(dx, dz);
        const risk = clamp01(1 - (distance - obstacle.radius) / 8);
        return {
          id: `collider-halo-${obstacle.id}`,
          kind: 'collider-proximity-halo',
          index,
          obstacleId: obstacle.id,
          position: { x: obstacle.x, y: 0.12 + index * 0.004, z: obstacle.z },
          radius: Number(obstacle.radius.toFixed(2)),
          height: Number(obstacle.height.toFixed(2)),
          distance: Number(distance.toFixed(2)),
          risk: Number(risk.toFixed(3)),
          state: risk > 0.7 ? 'near' : risk > 0.25 ? 'watch' : 'clear',
          rendererHint: 'floor warning halo'
        };
      });
    },
    snapshot(snapshot = {}) {
      const halos = this.describe(snapshot);
      return { halos: halos.length, near: halos.filter((halo) => halo.state === 'near').length, watch: halos.filter((halo) => halo.state === 'watch').length };
    }
  };
}

export function createThirdPersonRigMetricSpineKit() {
  return {
    id: 'third-person-rig-metric-spine-kit',
    domain: 'third-person-rig/debug-readability/metric-spine',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      const boneCount = arr(snapshot.rigBoneNames).length;
      const jointCount = finite(snapshot.rigJointCount, 0);
      const debugRayCount = finite(snapshot.debugRayCount, 0);
      return ['root', 'pelvis', 'chest', 'head'].map((name, index) => {
        const t = index / 3;
        return {
          id: `rig-metric-spine-${name}`,
          kind: 'rig-metric-spine',
          segment: name,
          index,
          position: {
            x: Number((basics.actor[0] * (1 - t) + basics.head[0] * t).toFixed(3)),
            y: Number((basics.actor[1] + 0.15 + t * Math.max(1.4, basics.head[1] - basics.actor[1])).toFixed(3)),
            z: Number((basics.actor[2] * (1 - t) + basics.head[2] * t).toFixed(3))
          },
          boneCount,
          jointCount,
          debugRayCount,
          debugVisible: basics.debugVisible,
          rendererHint: 'rig metric bead'
        };
      });
    },
    snapshot(snapshot = {}) {
      const spine = this.describe(snapshot);
      return { segments: spine.length, boneCount: spine[0]?.boneCount ?? 0, jointCount: spine[0]?.jointCount ?? 0 };
    }
  };
}

export function createThirdPersonTrainingCueKit() {
  return {
    id: 'third-person-training-cue-kit',
    domain: 'third-person-controller/training-cues/readout',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      const cues = [];
      if (!basics.moving) cues.push({ id: 'cue-move', label: 'press WASD to test camera-relative movement', priority: 0.55, state: 'idle' });
      if (Math.abs(basics.orbitYawOffsetDeg) > 55) cues.push({ id: 'cue-handoff', label: 'root yaw handoff active', priority: 0.9, state: 'handoff' });
      if (!basics.grounded) cues.push({ id: 'cue-air', label: 'jump arc exposes camera lag', priority: 0.72, state: 'airborne' });
      if (finite(snapshot.colliderCount, 0) > 0) cues.push({ id: 'cue-collision', label: 'graybox collision probes online', priority: 0.48, state: 'collision' });
      if (cues.length === 0) cues.push({ id: 'cue-neutral', label: 'controller state nominal', priority: 0.35, state: 'neutral' });
      return cues.map((cue, index) => ({ ...cue, kind: 'training-cue', index, opacity: Number(clamp(0.28 + cue.priority * 0.58, 0.2, 0.94).toFixed(3)), rendererHint: 'diagnostic cue chip' }));
    },
    snapshot(snapshot = {}) {
      const cues = this.describe(snapshot);
      return { cues: cues.length, topCue: cues[0]?.id ?? 'none' };
    }
  };
}

export function createThirdPersonArenaRendererHandoffKit() {
  return {
    id: 'third-person-arena-renderer-handoff-kit',
    domain: 'third-person-arena/renderer-handoff',
    describe(descriptors = {}) {
      const safe = {
        surfaceBands: arr(descriptors.surfaceBands),
        movementTrails: arr(descriptors.movementTrails),
        cameraHandoffArcs: arr(descriptors.cameraHandoffArcs),
        colliderHalos: arr(descriptors.colliderHalos),
        rigMetricSpine: arr(descriptors.rigMetricSpine),
        trainingCues: arr(descriptors.trainingCues)
      };
      const counts = Object.fromEntries(Object.entries(safe).map(([key, value]) => [key, value.length]));
      return {
        id: 'third-person-arena-renderer-handoff',
        descriptors: safe,
        counts,
        rendererConsumes: Object.keys(safe),
        rendererOwns: ['DOM overlay placement', 'Three.js mesh/material creation', 'visual interpolation'],
        rendererMustNotOwn: ['controller math', 'camera handoff state', 'collision truth', 'rig state', 'descriptor generation', 'browser input']
      };
    },
    snapshot(descriptors = {}) {
      const handoff = this.describe(descriptors);
      return { countKeys: Object.keys(handoff.counts), totalDescriptors: Object.values(handoff.counts).reduce((sum, value) => sum + value, 0) };
    }
  };
}

export function createThirdPersonArenaFractalDomainKit(options = {}) {
  const surfaceBandKit = createThirdPersonArenaSurfaceBandKit(options);
  const movementTrailKit = createThirdPersonMovementBasisTrailKit(options);
  const cameraHandoffArcKit = createThirdPersonCameraHandoffArcKit(options);
  const colliderProximityHaloKit = createThirdPersonColliderProximityHaloKit(options);
  const rigMetricSpineKit = createThirdPersonRigMetricSpineKit(options);
  const trainingCueKit = createThirdPersonTrainingCueKit(options);
  const rendererHandoffKit = createThirdPersonArenaRendererHandoffKit(options);
  return {
    id: 'third-person-arena-fractal-domain-kit',
    domain: 'third-person-follow-through/arena-fractal-domain',
    kits: { surfaceBandKit, movementTrailKit, cameraHandoffArcKit, colliderProximityHaloKit, rigMetricSpineKit, trainingCueKit, rendererHandoffKit },
    describe(snapshot = {}) {
      const descriptors = {
        surfaceBands: surfaceBandKit.describe(snapshot),
        movementTrails: movementTrailKit.describe(snapshot),
        cameraHandoffArcs: cameraHandoffArcKit.describe(snapshot),
        colliderHalos: colliderProximityHaloKit.describe(snapshot),
        rigMetricSpine: rigMetricSpineKit.describe(snapshot),
        trainingCues: trainingCueKit.describe(snapshot)
      };
      const rendererHandoff = rendererHandoffKit.describe(descriptors);
      return {
        id: 'third-person-arena-fractal-domain',
        snapshotFrame: finite(snapshot.debugExport?.clock?.frame ?? snapshot.frame, 0),
        route: 'ThirdPersonFollowThrough',
        descriptors,
        rendererHandoff,
        counts: rendererHandoff.counts,
        ownership: {
          kitOwns: ['serializable diagnostic descriptors', 'camera/movement readability classification', 'proximity descriptor shaping'],
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

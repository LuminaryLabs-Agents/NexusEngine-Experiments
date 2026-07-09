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

function round(value, digits = 3) {
  const scale = 10 ** digits;
  return Math.round(finite(value, 0) * scale) / scale;
}

const DEFAULT_CHECKPOINTS = [
  { id: 'blue-start-gate', label: 'blue start gate', x: -16, z: 14, height: 0.3, difficulty: 0.22 },
  { id: 'north-balance-plank', label: 'north balance plank', x: -7, z: 4, height: 0.85, difficulty: 0.48 },
  { id: 'center-vault-rail', label: 'center vault rail', x: 5, z: -3, height: 1.1, difficulty: 0.66 },
  { id: 'east-landing-mat', label: 'east landing mat', x: 15, z: -13, height: 0.25, difficulty: 0.38 }
];

const DEFAULT_BEAMS = [
  { id: 'left-rope-bridge', label: 'left rope bridge', x: -11, z: -2, length: 7.5, wobble: 0.58 },
  { id: 'center-stone-spine', label: 'center stone spine', x: 1, z: 7, length: 6.6, wobble: 0.42 },
  { id: 'right-high-rail', label: 'right high rail', x: 13, z: 1, length: 8.2, wobble: 0.64 }
];

const DEFAULT_RECOVERY = [
  { id: 'west-breath-pad', label: 'west breath pad', x: -18, z: -11, radius: 2.8, relief: 0.58 },
  { id: 'south-water-pad', label: 'south water pad', x: -2, z: -18, radius: 3.2, relief: 0.72 },
  { id: 'east-coach-pad', label: 'east coach pad', x: 18, z: -4, radius: 2.6, relief: 0.5 }
];

export const THIRD_PERSON_TRAVERSAL_COURSE_READINESS_TREE = `third-person-traversal-course-readiness-domain
├─ route-literacy-domain
│  ├─ checkpoint-gate-domain
│  │  └─ third-person-checkpoint-gate-kit
│  └─ ghost-footstep-domain
│     └─ third-person-ghost-footstep-ribbon-kit
├─ body-control-domain
│  ├─ balance-beam-domain
│  │  ├─ wobble-meter-domain
│  │  │  └─ third-person-balance-beam-wobble-kit
│  └─ vault-target-domain
│     └─ third-person-vault-target-arc-kit
├─ recovery-handoff-domain
│  ├─ breath-pad-domain
│  │  └─ third-person-breath-recovery-pad-kit
│  └─ coach-ledger-domain
│     └─ third-person-course-coach-ledger-kit
└─ renderer-handoff
   └─ third-person-traversal-course-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export const THIRD_PERSON_TRAVERSAL_COURSE_OWNERSHIP_EXCLUSIONS = Object.freeze([
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
  const grounded = snapshot.grounded !== false;
  const yVel = finite(snapshot.yVel ?? snapshot.actor?.yVel, 0);
  const jumpCount = Math.max(0, Math.round(finite(snapshot.jumpCount ?? snapshot.jumps, 0)));
  const frame = Math.max(0, Math.round(finite(snapshot.frame, 0)));
  const staminaRatio = clamp01(snapshot.staminaRatio ?? snapshot.stamina ?? 1);
  const yawStress = clamp01(Math.abs(finite(snapshot.orbitYawOffset ?? snapshot.yawOffset, 0)) / Math.PI);
  return {
    actor: { x: actor[0], y: actor[1], z: actor[2] },
    camera: { x: camera[0], y: camera[1], z: camera[2] },
    movementStrength,
    actorForward: { x: actorForward[0], y: actorForward[1], z: actorForward[2] },
    grounded,
    yVel,
    jumpCount,
    frame,
    staminaRatio,
    yawStress
  };
}

function routeProgress(basics, checkpoints = DEFAULT_CHECKPOINTS) {
  if (!checkpoints.length) return 0;
  const nearestIndex = checkpoints.reduce((best, checkpoint, index) => {
    const distance = distance2(basics.actor, checkpoint);
    return distance < best.distance ? { index, distance } : best;
  }, { index: 0, distance: Infinity }).index;
  return clamp01((nearestIndex + 1) / checkpoints.length);
}

export function createThirdPersonCheckpointGateKit({ checkpoints = DEFAULT_CHECKPOINTS } = {}) {
  return {
    id: 'third-person-checkpoint-gate-kit',
    domain: 'third-person-traversal-course/route-literacy/checkpoint-gate',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      return checkpoints.map((checkpoint, index) => {
        const distance = distance2(basics.actor, checkpoint);
        const proximity = clamp01(1 - distance / 22);
        const clarity = clamp01(0.26 + proximity * 0.42 + basics.movementStrength * 0.14 + (basics.grounded ? 0.12 : -0.05) - checkpoint.difficulty * 0.08);
        return {
          id: `checkpoint-gate-${checkpoint.id}`,
          kind: 'checkpoint-gate',
          checkpointId: checkpoint.id,
          label: checkpoint.label,
          index,
          position: { x: checkpoint.x, y: checkpoint.height, z: checkpoint.z },
          difficulty: round(checkpoint.difficulty),
          distance: round(distance),
          clarity: round(clarity),
          state: clarity > 0.68 ? 'locked-on' : clarity > 0.42 ? 'visible' : 'searching',
          opacity: round(clamp(0.18 + clarity * 0.64, 0.16, 0.88)),
          rendererHint: 'world-space checkpoint gate descriptor'
        };
      });
    }
  };
}

export function createThirdPersonGhostFootstepRibbonKit({ checkpoints = DEFAULT_CHECKPOINTS } = {}) {
  return {
    id: 'third-person-ghost-footstep-ribbon-kit',
    domain: 'third-person-traversal-course/route-literacy/ghost-footstep',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      return checkpoints.slice(0, -1).map((checkpoint, index) => {
        const next = checkpoints[index + 1];
        const center = { x: (checkpoint.x + next.x) / 2, y: 0.08, z: (checkpoint.z + next.z) / 2 };
        const distance = distance2(basics.actor, center);
        const tempo = clamp01(0.22 + basics.movementStrength * 0.4 + clamp01(1 - distance / 26) * 0.28 + (basics.frame % 90) / 90 * 0.1);
        return {
          id: `ghost-footstep-ribbon-${checkpoint.id}-${next.id}`,
          kind: 'ghost-footstep-ribbon',
          fromCheckpointId: checkpoint.id,
          toCheckpointId: next.id,
          index,
          center,
          strideCount: Math.max(3, Math.round(5 + tempo * 7)),
          tempo: round(tempo),
          state: tempo > 0.62 ? 'running-line' : tempo > 0.36 ? 'walking-line' : 'faint-line',
          rendererHint: 'projected route-footstep descriptor'
        };
      });
    }
  };
}

export function createThirdPersonBalanceBeamWobbleKit({ beams = DEFAULT_BEAMS } = {}) {
  return {
    id: 'third-person-balance-beam-wobble-kit',
    domain: 'third-person-traversal-course/body-control/balance-beam/wobble-meter',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      return beams.map((beam, index) => {
        const distance = distance2(basics.actor, beam);
        const approach = clamp01(1 - distance / 24);
        const wobble = clamp01(beam.wobble * 0.5 + basics.yawStress * 0.22 + Math.abs(basics.yVel) / 24 + approach * 0.14 + (basics.grounded ? -0.05 : 0.08));
        return {
          id: `balance-beam-wobble-${beam.id}`,
          kind: 'balance-beam-wobble',
          beamId: beam.id,
          label: beam.label,
          index,
          center: { x: beam.x, y: 0.55, z: beam.z },
          length: round(beam.length),
          wobble: round(wobble),
          state: wobble > 0.66 ? 'unstable' : wobble > 0.4 ? 'active' : 'steady',
          opacity: round(clamp(0.2 + wobble * 0.62, 0.18, 0.88)),
          rendererHint: 'balance beam risk descriptor'
        };
      });
    }
  };
}

export function createThirdPersonVaultTargetArcKit({ checkpoints = DEFAULT_CHECKPOINTS } = {}) {
  return {
    id: 'third-person-vault-target-arc-kit',
    domain: 'third-person-traversal-course/body-control/vault-target',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      return checkpoints.filter((checkpoint) => checkpoint.height >= 0.8).map((checkpoint, index) => {
        const distance = distance2(basics.actor, checkpoint);
        const launch = clamp01(0.18 + clamp01(1 - distance / 20) * 0.36 + basics.movementStrength * 0.24 + (basics.grounded ? 0.1 : -0.06) + basics.staminaRatio * 0.12);
        return {
          id: `vault-target-arc-${checkpoint.id}`,
          kind: 'vault-target-arc',
          checkpointId: checkpoint.id,
          index,
          apex: { x: checkpoint.x, y: 1.45 + checkpoint.height * 0.34, z: checkpoint.z },
          launch: round(launch),
          radius: round(1.2 + launch * 2.6),
          state: launch > 0.68 ? 'ready' : launch > 0.42 ? 'charging' : 'missable',
          rendererHint: 'jump/vault target arc descriptor'
        };
      });
    }
  };
}

export function createThirdPersonBreathRecoveryPadKit({ recoveryPads = DEFAULT_RECOVERY } = {}) {
  return {
    id: 'third-person-breath-recovery-pad-kit',
    domain: 'third-person-traversal-course/recovery-handoff/breath-pad',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      return recoveryPads.map((pad, index) => {
        const distance = distance2(basics.actor, pad);
        const restNeed = clamp01((1 - basics.staminaRatio) * 0.56 + basics.movementStrength * 0.18 + Math.abs(basics.yVel) / 28 + basics.jumpCount * 0.035);
        const recovery = clamp01(pad.relief * 0.56 + clamp01(1 - distance / 18) * 0.28 + (basics.grounded ? 0.1 : -0.06) - restNeed * 0.12);
        return {
          id: `breath-recovery-pad-${pad.id}`,
          kind: 'breath-recovery-pad',
          padId: pad.id,
          label: pad.label,
          index,
          center: { x: pad.x, y: 0.1, z: pad.z },
          radius: round(pad.radius * (0.92 + recovery * 0.22)),
          recovery: round(recovery),
          restNeed: round(restNeed),
          state: recovery > 0.64 ? 'restorative' : recovery > 0.38 ? 'available' : 'weak',
          rendererHint: 'stamina recovery pad descriptor'
        };
      });
    }
  };
}

export function createThirdPersonCourseCoachLedgerKit() {
  return {
    id: 'third-person-course-coach-ledger-kit',
    domain: 'third-person-traversal-course/recovery-handoff/coach-ledger',
    describe(snapshot = {}, parts = {}) {
      const basics = snapshotBasics(snapshot);
      const gates = arr(parts.checkpointGates);
      const beams = arr(parts.balanceBeams);
      const pads = arr(parts.breathPads);
      const progress = routeProgress(basics);
      const visibility = gates.length ? gates.reduce((sum, gate) => sum + gate.clarity, 0) / gates.length : 0;
      const averageWobble = beams.length ? beams.reduce((sum, beam) => sum + beam.wobble, 0) / beams.length : 0;
      const bestRecovery = pads.length ? Math.max(...pads.map((pad) => pad.recovery)) : 0;
      const readiness = clamp01(progress * 0.28 + visibility * 0.26 + (1 - averageWobble) * 0.18 + bestRecovery * 0.16 + basics.staminaRatio * 0.12);
      return [{
        id: 'course-coach-ledger-primary',
        kind: 'course-coach-ledger',
        progress: round(progress),
        routeVisibility: round(visibility),
        balanceRisk: round(averageWobble),
        bestRecovery: round(bestRecovery),
        staminaRatio: round(basics.staminaRatio),
        readiness: round(readiness),
        state: readiness > 0.72 ? 'course-clear' : readiness > 0.48 ? 'coach-ready' : 'needs-routing',
        rendererHint: 'traversal course summary ledger descriptor'
      }];
    }
  };
}

export function createThirdPersonTraversalCourseRendererHandoffKit() {
  return {
    id: 'third-person-traversal-course-renderer-handoff-kit',
    policy: 'renderer-consumes-descriptors-only',
    describe(parts = {}) {
      const descriptors = {
        checkpointGates: arr(parts.checkpointGates),
        ghostFootstepRibbons: arr(parts.ghostFootstepRibbons),
        balanceBeamWobbles: arr(parts.balanceBeamWobbles),
        vaultTargetArcs: arr(parts.vaultTargetArcs),
        breathRecoveryPads: arr(parts.breathRecoveryPads),
        coachLedgers: arr(parts.coachLedgers)
      };
      const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, value.length]));
      return {
        id: 'third-person-traversal-course-renderer-handoff',
        policy: this.policy,
        domain: 'third-person-traversal-course-readiness-domain',
        descriptors,
        counts,
        descriptorCount: Object.values(counts).reduce((sum, count) => sum + count, 0)
      };
    }
  };
}

export function createThirdPersonTraversalCourseReadinessDomainKit() {
  const checkpointGateKit = createThirdPersonCheckpointGateKit();
  const ghostFootstepRibbonKit = createThirdPersonGhostFootstepRibbonKit();
  const balanceBeamWobbleKit = createThirdPersonBalanceBeamWobbleKit();
  const vaultTargetArcKit = createThirdPersonVaultTargetArcKit();
  const breathRecoveryPadKit = createThirdPersonBreathRecoveryPadKit();
  const coachLedgerKit = createThirdPersonCourseCoachLedgerKit();
  const handoffKit = createThirdPersonTraversalCourseRendererHandoffKit();

  function describe(snapshot = {}) {
    const checkpointGates = checkpointGateKit.describe(snapshot);
    const ghostFootstepRibbons = ghostFootstepRibbonKit.describe(snapshot);
    const balanceBeamWobbles = balanceBeamWobbleKit.describe(snapshot);
    const vaultTargetArcs = vaultTargetArcKit.describe(snapshot);
    const breathRecoveryPads = breathRecoveryPadKit.describe(snapshot);
    const coachLedgers = coachLedgerKit.describe(snapshot, {
      checkpointGates,
      balanceBeams: balanceBeamWobbles,
      breathPads: breathRecoveryPads
    });
    const rendererHandoff = handoffKit.describe({
      checkpointGates,
      ghostFootstepRibbons,
      balanceBeamWobbles,
      vaultTargetArcs,
      breathRecoveryPads,
      coachLedgers
    });
    const ledger = coachLedgers[0] ?? {};
    return {
      id: 'third-person-traversal-course-readiness-domain-kit',
      domain: 'third-person-traversal-course-readiness-domain',
      tree: THIRD_PERSON_TRAVERSAL_COURSE_READINESS_TREE,
      ownershipExclusions: [...THIRD_PERSON_TRAVERSAL_COURSE_OWNERSHIP_EXCLUSIONS],
      kits: [
        checkpointGateKit.id,
        ghostFootstepRibbonKit.id,
        balanceBeamWobbleKit.id,
        vaultTargetArcKit.id,
        breathRecoveryPadKit.id,
        coachLedgerKit.id,
        handoffKit.id
      ],
      summary: {
        courseReadiness: round(ledger.readiness),
        routeVisibility: round(ledger.routeVisibility),
        balanceRisk: round(ledger.balanceRisk),
        bestRecovery: round(ledger.bestRecovery),
        missionState: ledger.state ?? 'needs-routing'
      },
      counts: rendererHandoff.counts,
      rendererHandoff
    };
  }

  return {
    id: 'third-person-traversal-course-readiness-domain-kit',
    domain: 'third-person-traversal-course-readiness-domain',
    tree: THIRD_PERSON_TRAVERSAL_COURSE_READINESS_TREE,
    ownershipExclusions: [...THIRD_PERSON_TRAVERSAL_COURSE_OWNERSHIP_EXCLUSIONS],
    describe,
    snapshot: describe
  };
}

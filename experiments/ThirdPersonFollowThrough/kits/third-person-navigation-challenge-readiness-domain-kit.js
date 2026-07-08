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

function distance2(a, b) {
  return magnitude2((a?.x ?? 0) - (b?.x ?? 0), (a?.z ?? 0) - (b?.z ?? 0));
}

function yawDeg(x, z, fallback = 0) {
  if (Math.abs(x) + Math.abs(z) < 0.00001) return fallback;
  return Math.round((Math.atan2(x, z) * 180) / Math.PI);
}

function angleDeltaDeg(a, b) {
  let delta = finite(a, 0) - finite(b, 0);
  while (delta > 180) delta -= 360;
  while (delta < -180) delta += 360;
  return delta;
}

const DEFAULT_CHECKPOINTS = [
  { id: 'warmup-strafe-lane', label: 'warmup strafe', x: 0, z: 8, radius: 2.8, order: 0 },
  { id: 'pillar-cut-gate', label: 'pillar cut', x: 14, z: 3, radius: 3.4, order: 1 },
  { id: 'round-platform-loop', label: 'platform loop', x: 13, z: 9, radius: 3.8, order: 2 },
  { id: 'ramp-vault-lane', label: 'ramp vault', x: -13, z: 7, radius: 4.2, order: 3 },
  { id: 'finish-wall-run', label: 'finish wall', x: 0, z: -18, radius: 3.2, order: 4 }
];

const DEFAULT_VAULTS = [
  { id: 'ramp-vault', label: 'ramp vault', x: -13, z: 7, height: 1.25, radius: 5.2 },
  { id: 'round-platform-hop', label: 'platform hop', x: 13, z: 9, height: 1.2, radius: 4.8 },
  { id: 'pillar-pop', label: 'pillar pop', x: 14, z: 3, height: 2.5, radius: 3.2 }
];

const DEFAULT_RECOVERY_POCKETS = [
  { id: 'center-reset-pocket', x: 0, z: 3, radius: 3.5, cover: 0.28 },
  { id: 'left-wall-breath-pocket', x: -18, z: 13, radius: 3.2, cover: 0.18 },
  { id: 'right-wall-breath-pocket', x: 18, z: 12, radius: 3.2, cover: 0.2 },
  { id: 'rear-lane-pocket', x: 0, z: 18, radius: 4.0, cover: 0.12 },
  { id: 'front-lane-pocket', x: 0, z: -12, radius: 3.6, cover: 0.34 }
];

export const THIRD_PERSON_NAVIGATION_CHALLENGE_READINESS_TREE = `third-person-navigation-challenge-readiness-domain
├─ route-intent-domain
│  ├─ checkpoint-thread-domain
│  │  └─ third-person-checkpoint-thread-kit
│  └─ turn-commitment-domain
│     └─ third-person-turn-commitment-wedge-kit
├─ traversal-execution-domain
│  ├─ vault-window-domain
│  │  └─ third-person-vault-window-arc-kit
│  └─ recovery-pocket-domain
│     └─ third-person-recovery-pocket-kit
├─ mastery-feedback-domain
│  ├─ camera-actor-sync-domain
│  │  └─ third-person-camera-actor-sync-meter-kit
│  └─ finish-commitment-domain
│     └─ third-person-finish-commitment-beacon-kit
└─ renderer-handoff
   └─ third-person-navigation-challenge-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

function snapshotBasics(snapshot = {}) {
  const actor = vec3(snapshot.targetPosition ?? snapshot.actor?.position, [0, 0, 8]);
  const camera = vec3(snapshot.cameraPosition ?? snapshot.camera?.position, [actor[0], 3.2, actor[2] + 7]);
  const movementWish = vec3(snapshot.movementWishWorld, [0, 0, 0]);
  const actorForward = vec3(snapshot.actorForwardWorld, [0, 0, -1]);
  const cameraForward = vec3(snapshot.cameraForwardWorld, [0, 0, -1]);
  const cameraPlanar = normalize2(cameraForward[0], cameraForward[2]);
  const actorPlanar = normalize2(actorForward[0], actorForward[2]);
  const movementPlanar = normalize2(movementWish[0], movementWish[2], actorPlanar);
  const movementStrength = clamp01(magnitude2(movementWish[0], movementWish[2]));
  const actorYaw = finite(snapshot.rootYawDeg, yawDeg(actorPlanar[0], actorPlanar[1], 0));
  const cameraYaw = finite(snapshot.cameraYawDeg, yawDeg(cameraPlanar[0], cameraPlanar[1], actorYaw));
  const movementYaw = finite(snapshot.movementYawDeg, yawDeg(movementPlanar[0], movementPlanar[1], cameraYaw));
  const orbitYawOffsetDeg = finite(snapshot.orbitYawOffsetDeg, angleDeltaDeg(cameraYaw, actorYaw));
  const handoffAlpha = clamp01(snapshot.handoffAlpha ?? Math.abs(orbitYawOffsetDeg) / 90);
  const grounded = snapshot.grounded !== false;
  const yVel = finite(snapshot.yVel ?? snapshot.actor?.yVel, 0);
  const colliderCount = Math.max(0, Math.round(finite(snapshot.colliderCount, 6)));
  return { actor: { x: actor[0], y: actor[1], z: actor[2] }, camera: { x: camera[0], y: camera[1], z: camera[2] }, movementStrength, actorYaw, cameraYaw, movementYaw, orbitYawOffsetDeg, handoffAlpha, grounded, yVel, colliderCount };
}

function progressFor(actor, checkpoints = DEFAULT_CHECKPOINTS) {
  const nearest = checkpoints.reduce((best, checkpoint, index) => {
    const distance = distance2(actor, checkpoint);
    return distance < best.distance ? { checkpoint, index, distance } : best;
  }, { checkpoint: checkpoints[0], index: 0, distance: Number.POSITIVE_INFINITY });
  const insideNearest = nearest.distance <= nearest.checkpoint.radius;
  const nextIndex = insideNearest ? Math.min(checkpoints.length - 1, nearest.index + 1) : nearest.index;
  return { nearest, nextIndex, next: checkpoints[nextIndex], completion: clamp01(nextIndex / Math.max(1, checkpoints.length - 1)) };
}

export function createThirdPersonCheckpointThreadKit({ checkpoints = DEFAULT_CHECKPOINTS } = {}) {
  return {
    id: 'third-person-checkpoint-thread-kit',
    domain: 'third-person-navigation-challenge/route-intent/checkpoint-thread',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      const progress = progressFor(basics.actor, checkpoints);
      return checkpoints.map((checkpoint, index) => {
        const distance = distance2(basics.actor, checkpoint);
        const toward = normalize2(checkpoint.x - basics.actor.x, checkpoint.z - basics.actor.z);
        const routeYaw = yawDeg(toward[0], toward[1], basics.movementYaw);
        const state = index < progress.nextIndex ? 'complete' : index === progress.nextIndex ? 'next' : 'queued';
        return { id: `checkpoint-thread-${checkpoint.id}`, kind: 'checkpoint-thread', checkpointId: checkpoint.id, label: checkpoint.label, index, state, position: { x: checkpoint.x, y: 0.08, z: checkpoint.z }, radius: checkpoint.radius, distance: Number(distance.toFixed(3)), routeYawDeg: routeYaw, priority: Number(clamp01(1 - Math.abs(index - progress.nextIndex) / 4).toFixed(3)), opacity: Number(clamp(state === 'next' ? 0.82 : state === 'queued' ? 0.34 : 0.18, 0.12, 0.86).toFixed(3)), rendererHint: 'world-space checkpoint route thread' };
      });
    },
    snapshot(snapshot = {}) {
      const threads = this.describe(snapshot);
      return { checkpoints: threads.length, next: threads.find((thread) => thread.state === 'next')?.checkpointId ?? 'finish-wall-run' };
    }
  };
}

export function createThirdPersonTurnCommitmentWedgeKit({ checkpoints = DEFAULT_CHECKPOINTS } = {}) {
  return {
    id: 'third-person-turn-commitment-wedge-kit',
    domain: 'third-person-navigation-challenge/route-intent/turn-commitment',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      const progress = progressFor(basics.actor, checkpoints);
      return checkpoints.slice(progress.nextIndex, progress.nextIndex + 4).map((checkpoint, localIndex) => {
        const toTarget = normalize2(checkpoint.x - basics.actor.x, checkpoint.z - basics.actor.z);
        const targetYaw = yawDeg(toTarget[0], toTarget[1], basics.movementYaw);
        const yawError = Math.abs(angleDeltaDeg(basics.movementYaw, targetYaw));
        const actorError = Math.abs(angleDeltaDeg(basics.actorYaw, targetYaw));
        const commitment = clamp01(1 - (yawError * 0.7 + actorError * 0.3) / 110);
        return { id: `turn-commitment-wedge-${checkpoint.id}`, kind: 'turn-commitment-wedge', checkpointId: checkpoint.id, index: localIndex, anchor: { x: basics.actor.x, y: 0.34 + localIndex * 0.08, z: basics.actor.z }, target: { x: checkpoint.x, y: 0.18, z: checkpoint.z }, targetYawDeg: targetYaw, yawErrorDeg: Number(yawError.toFixed(2)), commitment: Number(commitment.toFixed(3)), state: commitment > 0.66 ? 'committed' : commitment > 0.34 ? 'negotiating' : 'misaligned', opacity: Number(clamp(0.18 + commitment * 0.55 + basics.movementStrength * 0.12, 0.14, 0.82).toFixed(3)), rendererHint: 'turn commitment wedge toward next gate' };
      });
    },
    snapshot(snapshot = {}) {
      const wedges = this.describe(snapshot);
      return { wedges: wedges.length, committed: wedges.filter((wedge) => wedge.state === 'committed').length };
    }
  };
}

export function createThirdPersonVaultWindowArcKit({ vaults = DEFAULT_VAULTS } = {}) {
  return {
    id: 'third-person-vault-window-arc-kit',
    domain: 'third-person-navigation-challenge/traversal-execution/vault-window',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      return vaults.map((vault, index) => {
        const distance = distance2(basics.actor, vault);
        const proximity = clamp01(1 - distance / (vault.radius + 6));
        const verticalIntent = !basics.grounded ? clamp01((Math.abs(basics.yVel) + 1) / 8) : 0;
        const windowStrength = clamp01(proximity * 0.72 + basics.movementStrength * 0.18 + verticalIntent * 0.1);
        return { id: `vault-window-arc-${vault.id}`, kind: 'vault-window-arc', vaultId: vault.id, label: vault.label, index, center: { x: vault.x, y: vault.height, z: vault.z }, radius: Number((vault.radius * (0.68 + windowStrength * 0.3)).toFixed(3)), distance: Number(distance.toFixed(3)), windowStrength: Number(windowStrength.toFixed(3)), state: !basics.grounded ? (basics.yVel >= 0 ? 'airborne-rise' : 'airborne-fall') : windowStrength > 0.55 ? 'available' : 'dormant', opacity: Number(clamp(0.14 + windowStrength * 0.56, 0.1, 0.78).toFixed(3)), rendererHint: 'vault or hop window arc' };
      });
    },
    snapshot(snapshot = {}) {
      const arcs = this.describe(snapshot);
      return { arcs: arcs.length, available: arcs.filter((arc) => arc.state !== 'dormant').length };
    }
  };
}

export function createThirdPersonRecoveryPocketKit({ pockets = DEFAULT_RECOVERY_POCKETS } = {}) {
  return {
    id: 'third-person-recovery-pocket-kit',
    domain: 'third-person-navigation-challenge/traversal-execution/recovery-pocket',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      const airborneRisk = basics.grounded ? 0 : clamp01((Math.abs(basics.yVel) + basics.actor.y) / 8);
      return pockets.map((pocket, index) => {
        const distance = distance2(basics.actor, pocket);
        const reachability = clamp01(1 - distance / 26);
        const safety = clamp01(0.38 + reachability * 0.4 + pocket.cover * 0.2 - airborneRisk * 0.12);
        return { id: `recovery-pocket-${pocket.id}`, kind: 'recovery-pocket', pocketId: pocket.id, index, center: { x: pocket.x, y: 0.1, z: pocket.z }, radius: pocket.radius, reachability: Number(reachability.toFixed(3)), safety: Number(safety.toFixed(3)), state: safety > 0.68 ? 'safe' : safety > 0.44 ? 'usable' : 'thin', opacity: Number(clamp(0.16 + safety * 0.52 + airborneRisk * 0.12, 0.12, 0.8).toFixed(3)), rendererHint: 'fall recovery and camera reset pocket' };
      });
    },
    snapshot(snapshot = {}) {
      const pockets = this.describe(snapshot);
      return { pockets: pockets.length, safe: pockets.filter((pocket) => pocket.state === 'safe').length };
    }
  };
}

export function createThirdPersonCameraActorSyncMeterKit() {
  return {
    id: 'third-person-camera-actor-sync-meter-kit',
    domain: 'third-person-navigation-challenge/mastery-feedback/camera-actor-sync',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      const yawGap = Math.abs(angleDeltaDeg(basics.cameraYaw, basics.actorYaw));
      const movementGap = Math.abs(angleDeltaDeg(basics.cameraYaw, basics.movementYaw));
      const syncScore = clamp01(1 - (yawGap * 0.62 + movementGap * 0.28 + basics.handoffAlpha * 32) / 150);
      return Array.from({ length: 5 }, (_, index) => {
        const threshold = (index + 1) / 5;
        const active = syncScore >= threshold;
        return { id: `camera-actor-sync-meter-${index}`, kind: 'camera-actor-sync-meter', index, yawGapDeg: Number(yawGap.toFixed(2)), movementGapDeg: Number(movementGap.toFixed(2)), syncScore: Number(syncScore.toFixed(3)), threshold: Number(threshold.toFixed(2)), active, state: syncScore > 0.72 ? 'synced' : syncScore > 0.42 ? 'recovering' : 'split', opacity: Number(clamp(active ? 0.76 : 0.22, 0.12, 0.82).toFixed(3)), rendererHint: 'camera actor sync mastery meter' };
      });
    },
    snapshot(snapshot = {}) {
      const meters = this.describe(snapshot);
      return { meters: meters.length, active: meters.filter((meter) => meter.active).length, state: meters[0]?.state ?? 'split' };
    }
  };
}

export function createThirdPersonFinishCommitmentBeaconKit({ checkpoints = DEFAULT_CHECKPOINTS } = {}) {
  return {
    id: 'third-person-finish-commitment-beacon-kit',
    domain: 'third-person-navigation-challenge/mastery-feedback/finish-commitment',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      const progress = progressFor(basics.actor, checkpoints);
      const finish = checkpoints[checkpoints.length - 1];
      const finishDistance = distance2(basics.actor, finish);
      const finishVector = normalize2(finish.x - basics.actor.x, finish.z - basics.actor.z);
      const finishYaw = yawDeg(finishVector[0], finishVector[1], basics.movementYaw);
      const alignment = clamp01(1 - Math.abs(angleDeltaDeg(basics.movementYaw, finishYaw)) / 120);
      const readiness = clamp01(progress.completion * 0.55 + alignment * 0.25 + clamp01(1 - finishDistance / 36) * 0.2);
      return [{ id: 'finish-commitment-beacon-primary', kind: 'finish-commitment-beacon', index: 0, center: { x: finish.x, y: 1.2, z: finish.z }, finishDistance: Number(finishDistance.toFixed(3)), finishYawDeg: finishYaw, readiness: Number(readiness.toFixed(3)), state: readiness > 0.7 ? 'commit' : readiness > 0.42 ? 'prepare' : 'distant', opacity: Number(clamp(0.18 + readiness * 0.66, 0.14, 0.88).toFixed(3)), rendererHint: 'finish commitment beacon' }];
    },
    snapshot(snapshot = {}) {
      const beacon = this.describe(snapshot)[0];
      return { beacons: 1, state: beacon.state, readiness: beacon.readiness };
    }
  };
}

export function createThirdPersonNavigationChallengeRendererHandoffKit() {
  return {
    id: 'third-person-navigation-challenge-renderer-handoff-kit',
    domain: 'third-person-navigation-challenge/renderer-handoff',
    describe(descriptors = {}) {
      const checkpointThreads = arr(descriptors.checkpointThreads);
      const turnCommitmentWedges = arr(descriptors.turnCommitmentWedges);
      const vaultWindowArcs = arr(descriptors.vaultWindowArcs);
      const recoveryPockets = arr(descriptors.recoveryPockets);
      const cameraActorSyncMeters = arr(descriptors.cameraActorSyncMeters);
      const finishCommitmentBeacons = arr(descriptors.finishCommitmentBeacons);
      return { id: 'third-person-navigation-challenge-renderer-handoff', policy: 'renderer-consumes-descriptors-only', rendererConsumes: ['checkpointThreads', 'turnCommitmentWedges', 'vaultWindowArcs', 'recoveryPockets', 'cameraActorSyncMeters', 'finishCommitmentBeacons'], rendererMustNotOwn: ['route scoring', 'checkpoint progression truth', 'jump physics', 'camera sync scoring', 'browser input', 'frame loop'], counts: { checkpointThreads: checkpointThreads.length, turnCommitmentWedges: turnCommitmentWedges.length, vaultWindowArcs: vaultWindowArcs.length, recoveryPockets: recoveryPockets.length, cameraActorSyncMeters: cameraActorSyncMeters.length, finishCommitmentBeacons: finishCommitmentBeacons.length }, descriptors: { checkpointThreads, turnCommitmentWedges, vaultWindowArcs, recoveryPockets, cameraActorSyncMeters, finishCommitmentBeacons } };
    }
  };
}

export function createThirdPersonNavigationChallengeReadinessDomainKit() {
  const checkpointThreadKit = createThirdPersonCheckpointThreadKit();
  const turnCommitmentWedgeKit = createThirdPersonTurnCommitmentWedgeKit();
  const vaultWindowArcKit = createThirdPersonVaultWindowArcKit();
  const recoveryPocketKit = createThirdPersonRecoveryPocketKit();
  const cameraActorSyncMeterKit = createThirdPersonCameraActorSyncMeterKit();
  const finishCommitmentBeaconKit = createThirdPersonFinishCommitmentBeaconKit();
  const handoffKit = createThirdPersonNavigationChallengeRendererHandoffKit();
  return {
    id: 'third-person-navigation-challenge-readiness-domain-kit',
    route: 'ThirdPersonFollowThrough',
    tree: THIRD_PERSON_NAVIGATION_CHALLENGE_READINESS_TREE,
    kits: [checkpointThreadKit, turnCommitmentWedgeKit, vaultWindowArcKit, recoveryPocketKit, cameraActorSyncMeterKit, finishCommitmentBeaconKit, handoffKit],
    describe(snapshot = {}) {
      const descriptors = { checkpointThreads: checkpointThreadKit.describe(snapshot), turnCommitmentWedges: turnCommitmentWedgeKit.describe(snapshot), vaultWindowArcs: vaultWindowArcKit.describe(snapshot), recoveryPockets: recoveryPocketKit.describe(snapshot), cameraActorSyncMeters: cameraActorSyncMeterKit.describe(snapshot), finishCommitmentBeacons: finishCommitmentBeaconKit.describe(snapshot) };
      const rendererHandoff = handoffKit.describe(descriptors);
      return { id: 'third-person-navigation-challenge-readiness-domain', route: 'ThirdPersonFollowThrough', tree: THIRD_PERSON_NAVIGATION_CHALLENGE_READINESS_TREE, descriptors, counts: rendererHandoff.counts, rendererHandoff, ownership: { kitOwns: ['navigation challenge scoring descriptors', 'route intent descriptors', 'recovery readiness descriptors', 'mastery feedback descriptors'], rendererMustNotOwn: rendererHandoff.rendererMustNotOwn }, summary: { nextCheckpoint: descriptors.checkpointThreads.find((thread) => thread.state === 'next')?.checkpointId ?? 'finish-wall-run', cameraActorSync: cameraActorSyncMeterKit.snapshot(snapshot).state, finishReadiness: finishCommitmentBeaconKit.snapshot(snapshot).readiness } };
    },
    snapshot(snapshot = {}) {
      const description = this.describe(snapshot);
      return { id: this.id, route: description.route, counts: description.counts, summary: description.summary, totalDescriptors: Object.values(description.counts).reduce((sum, count) => sum + count, 0) };
    }
  };
}

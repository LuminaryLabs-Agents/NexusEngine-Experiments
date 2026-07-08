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

const DEFAULT_PATROLS = [
  { id: 'north-gallery-watch', x: -9, z: -10, yaw: 42, radius: 13, widthDeg: 62, severity: 0.72 },
  { id: 'pillar-corner-watch', x: 15, z: 3, yaw: -120, radius: 11, widthDeg: 56, severity: 0.58 },
  { id: 'finish-door-watch', x: 0, z: -19, yaw: 180, radius: 15, widthDeg: 70, severity: 0.84 }
];

const DEFAULT_COVERS = [
  { id: 'center-crate-shadow', x: 0, z: 3, radius: 3.2, cover: 0.58 },
  { id: 'left-column-shadow', x: -15, z: 8, radius: 3.5, cover: 0.66 },
  { id: 'right-column-shadow', x: 17, z: 11, radius: 3.4, cover: 0.61 },
  { id: 'rear-arch-shadow', x: 0, z: 18, radius: 4.1, cover: 0.5 }
];

const DEFAULT_BREADCRUMBS = [
  { id: 'intel-table', label: 'intel', x: 0, z: 7, order: 0 },
  { id: 'pillar-slip', label: 'slip', x: 14, z: 3, order: 1 },
  { id: 'low-cover-cut', label: 'cover', x: -13, z: 8, order: 2 },
  { id: 'extraction-door', label: 'extract', x: 0, z: -18, order: 3 }
];

export const THIRD_PERSON_STEALTH_EXTRACTION_READINESS_TREE = `third-person-stealth-extraction-readiness-domain
├─ threat-awareness-domain
│  ├─ patrol-sight-domain
│  │  └─ third-person-patrol-sight-cone-kit
│  └─ noise-trace-domain
│     └─ third-person-noise-trace-pulse-kit
├─ cover-and-route-domain
│  ├─ cover-island-domain
│  │  └─ third-person-cover-island-shadow-kit
│  └─ extraction-breadcrumb-domain
│     └─ third-person-extraction-breadcrumb-kit
├─ mastery-resolution-domain
│  ├─ stamina-debt-domain
│  │  └─ third-person-stamina-debt-meter-kit
│  └─ extraction-commit-domain
│     └─ third-person-extraction-commit-badge-kit
└─ renderer-handoff
   └─ third-person-stealth-extraction-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

function snapshotBasics(snapshot = {}) {
  const actor = vec3(snapshot.targetPosition ?? snapshot.actor?.position, [0, 0, 8]);
  const camera = vec3(snapshot.cameraPosition ?? snapshot.camera?.position, [actor[0], 3.2, actor[2] + 7]);
  const movementWish = vec3(snapshot.movementWishWorld, [0, 0, 0]);
  const actorForward = vec3(snapshot.actorForwardWorld, [0, 0, -1]);
  const movementStrength = clamp01(magnitude2(movementWish[0], movementWish[2]));
  const actorPlanar = normalize2(actorForward[0], actorForward[2]);
  const actorYaw = finite(snapshot.rootYawDeg, yawDeg(actorPlanar[0], actorPlanar[1], 0));
  const grounded = snapshot.grounded !== false;
  const yVel = finite(snapshot.yVel ?? snapshot.actor?.yVel, 0);
  const colliderCount = Math.max(0, Math.round(finite(snapshot.colliderCount, 6)));
  const frame = Math.max(0, Math.round(finite(snapshot.frame, 0)));
  const staminaRatio = clamp01(snapshot.staminaRatio ?? snapshot.stamina ?? 1);
  return { actor: { x: actor[0], y: actor[1], z: actor[2] }, camera: { x: camera[0], y: camera[1], z: camera[2] }, movementStrength, actorYaw, grounded, yVel, colliderCount, frame, staminaRatio };
}

function nearestBreadcrumb(actor, breadcrumbs = DEFAULT_BREADCRUMBS) {
  const nearest = breadcrumbs.reduce((best, breadcrumb, index) => {
    const distance = distance2(actor, breadcrumb);
    return distance < best.distance ? { breadcrumb, index, distance } : best;
  }, { breadcrumb: breadcrumbs[0], index: 0, distance: Number.POSITIVE_INFINITY });
  const nextIndex = nearest.distance < 3.5 ? Math.min(breadcrumbs.length - 1, nearest.index + 1) : nearest.index;
  return { nearest, nextIndex, next: breadcrumbs[nextIndex], progress: clamp01(nextIndex / Math.max(1, breadcrumbs.length - 1)) };
}

function detectionForPatrol(basics, patrol) {
  const toActor = normalize2(basics.actor.x - patrol.x, basics.actor.z - patrol.z);
  const patrolYawToActor = yawDeg(toActor[0], toActor[1], patrol.yaw);
  const angleError = Math.abs(angleDeltaDeg(patrolYawToActor, patrol.yaw));
  const distance = distance2(basics.actor, patrol);
  const distancePressure = clamp01(1 - distance / patrol.radius);
  const anglePressure = clamp01(1 - angleError / Math.max(1, patrol.widthDeg * 0.5));
  const movementNoise = basics.grounded ? basics.movementStrength * 0.22 : 0.36;
  return clamp01(distancePressure * anglePressure * patrol.severity + movementNoise * distancePressure);
}

export function createThirdPersonPatrolSightConeKit({ patrols = DEFAULT_PATROLS } = {}) {
  return {
    id: 'third-person-patrol-sight-cone-kit',
    domain: 'third-person-stealth-extraction/threat-awareness/patrol-sight',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      return patrols.map((patrol, index) => {
        const detection = detectionForPatrol(basics, patrol);
        return { id: `patrol-sight-cone-${patrol.id}`, kind: 'patrol-sight-cone', patrolId: patrol.id, index, origin: { x: patrol.x, y: 0.18, z: patrol.z }, yawDeg: patrol.yaw, widthDeg: patrol.widthDeg, radius: patrol.radius, detection: Number(detection.toFixed(3)), state: detection > 0.62 ? 'spotted' : detection > 0.34 ? 'watched' : 'clear', opacity: Number(clamp(0.14 + detection * 0.72, 0.12, 0.88).toFixed(3)), rendererHint: 'world-space patrol sight cone descriptor' };
      });
    },
    snapshot(snapshot = {}) {
      const cones = this.describe(snapshot);
      return { cones: cones.length, spotted: cones.filter((cone) => cone.state === 'spotted').length, highestDetection: Math.max(...cones.map((cone) => cone.detection), 0) };
    }
  };
}

export function createThirdPersonNoiseTracePulseKit() {
  return {
    id: 'third-person-noise-trace-pulse-kit',
    domain: 'third-person-stealth-extraction/threat-awareness/noise-trace',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      const airborneNoise = basics.grounded ? 0 : clamp01(Math.abs(basics.yVel) / 8);
      const noise = clamp01(basics.movementStrength * 0.72 + airborneNoise * 0.22 + Math.max(0, 6 - basics.colliderCount) * 0.02);
      const pulseCount = noise > 0.66 ? 3 : noise > 0.28 ? 2 : 1;
      return Array.from({ length: pulseCount }, (_, index) => ({ id: `noise-trace-pulse-${index}`, kind: 'noise-trace-pulse', index, center: { x: basics.actor.x, y: 0.12 + index * 0.02, z: basics.actor.z }, radius: Number((2.6 + noise * 8 + index * 1.8).toFixed(3)), noise: Number(noise.toFixed(3)), state: noise > 0.66 ? 'loud' : noise > 0.28 ? 'audible' : 'quiet', opacity: Number(clamp(0.12 + noise * 0.5 - index * 0.08, 0.1, 0.74).toFixed(3)), rendererHint: 'noise radius pulse around actor' }));
    },
    snapshot(snapshot = {}) {
      const pulses = this.describe(snapshot);
      return { pulses: pulses.length, state: pulses[0]?.state ?? 'quiet', noise: pulses[0]?.noise ?? 0 };
    }
  };
}

export function createThirdPersonCoverIslandShadowKit({ covers = DEFAULT_COVERS } = {}) {
  return {
    id: 'third-person-cover-island-shadow-kit',
    domain: 'third-person-stealth-extraction/cover-and-route/cover-island',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      return covers.map((cover, index) => {
        const distance = distance2(basics.actor, cover);
        const reachability = clamp01(1 - distance / 22);
        const protection = clamp01(cover.cover * 0.68 + reachability * 0.28 + (basics.grounded ? 0.04 : -0.06));
        return { id: `cover-island-shadow-${cover.id}`, kind: 'cover-island-shadow', coverId: cover.id, index, center: { x: cover.x, y: 0.1, z: cover.z }, radius: Number((cover.radius * (0.85 + protection * 0.18)).toFixed(3)), protection: Number(protection.toFixed(3)), reachability: Number(reachability.toFixed(3)), state: protection > 0.62 ? 'strong' : protection > 0.42 ? 'thin' : 'exposed', opacity: Number(clamp(0.16 + protection * 0.52, 0.12, 0.76).toFixed(3)), rendererHint: 'stealth cover island descriptor' };
      });
    },
    snapshot(snapshot = {}) {
      const shadows = this.describe(snapshot);
      return { covers: shadows.length, strong: shadows.filter((shadow) => shadow.state === 'strong').length };
    }
  };
}

export function createThirdPersonExtractionBreadcrumbKit({ breadcrumbs = DEFAULT_BREADCRUMBS } = {}) {
  return {
    id: 'third-person-extraction-breadcrumb-kit',
    domain: 'third-person-stealth-extraction/cover-and-route/extraction-breadcrumb',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      const progress = nearestBreadcrumb(basics.actor, breadcrumbs);
      return breadcrumbs.map((breadcrumb, index) => {
        const distance = distance2(basics.actor, breadcrumb);
        const priority = clamp01(1 - Math.abs(index - progress.nextIndex) / 3);
        const state = index < progress.nextIndex ? 'collected' : index === progress.nextIndex ? 'next' : 'hidden';
        return { id: `extraction-breadcrumb-${breadcrumb.id}`, kind: 'extraction-breadcrumb', breadcrumbId: breadcrumb.id, label: breadcrumb.label, index, position: { x: breadcrumb.x, y: 0.2, z: breadcrumb.z }, distance: Number(distance.toFixed(3)), priority: Number(priority.toFixed(3)), state, opacity: Number(clamp(state === 'next' ? 0.8 : state === 'collected' ? 0.24 : 0.18 + priority * 0.24, 0.14, 0.82).toFixed(3)), rendererHint: 'ordered stealth extraction breadcrumb' };
      });
    },
    snapshot(snapshot = {}) {
      const crumbs = this.describe(snapshot);
      return { breadcrumbs: crumbs.length, next: crumbs.find((crumb) => crumb.state === 'next')?.breadcrumbId ?? 'extraction-door' };
    }
  };
}

export function createThirdPersonStaminaDebtMeterKit() {
  return {
    id: 'third-person-stamina-debt-meter-kit',
    domain: 'third-person-stealth-extraction/mastery-resolution/stamina-debt',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      return Array.from({ length: 5 }, (_, index) => {
        const threshold = (index + 1) / 5;
        const debt = clamp01(1 - basics.staminaRatio + basics.movementStrength * 0.24 + (!basics.grounded ? 0.1 : 0));
        return { id: `stamina-debt-meter-${index}`, kind: 'stamina-debt-meter', index, threshold: Number(threshold.toFixed(2)), debt: Number(debt.toFixed(3)), state: debt > threshold ? 'spent' : debt + 0.18 > threshold ? 'warning' : 'ready', opacity: Number(clamp(0.18 + Math.max(debt, threshold * 0.42), 0.16, 0.86).toFixed(3)), rendererHint: 'stealth sprint stamina debt meter' };
      });
    },
    snapshot(snapshot = {}) {
      const meters = this.describe(snapshot);
      return { meters: meters.length, spent: meters.filter((meter) => meter.state === 'spent').length };
    }
  };
}

export function createThirdPersonExtractionCommitBadgeKit({ breadcrumbs = DEFAULT_BREADCRUMBS, patrols = DEFAULT_PATROLS } = {}) {
  return {
    id: 'third-person-extraction-commit-badge-kit',
    domain: 'third-person-stealth-extraction/mastery-resolution/extraction-commit',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      const progress = nearestBreadcrumb(basics.actor, breadcrumbs);
      const highestDetection = Math.max(...patrols.map((patrol) => detectionForPatrol(basics, patrol)), 0);
      const exitDistance = distance2(basics.actor, breadcrumbs[breadcrumbs.length - 1]);
      const readiness = clamp01(progress.progress * 0.45 + (1 - highestDetection) * 0.32 + (1 - Math.min(1, exitDistance / 28)) * 0.23);
      return [{ id: 'extraction-commit-badge', kind: 'extraction-commit-badge', center: { x: breadcrumbs[breadcrumbs.length - 1].x, y: 0.6, z: breadcrumbs[breadcrumbs.length - 1].z }, readiness: Number(readiness.toFixed(3)), highestDetection: Number(highestDetection.toFixed(3)), exitDistance: Number(exitDistance.toFixed(3)), state: readiness > 0.72 ? 'commit' : readiness > 0.42 ? 'prepare' : 'hold', opacity: Number(clamp(0.24 + readiness * 0.6, 0.2, 0.88).toFixed(3)), rendererHint: 'final stealth extraction commitment badge' }];
    },
    snapshot(snapshot = {}) {
      const [badge] = this.describe(snapshot);
      return { state: badge.state, readiness: badge.readiness };
    }
  };
}

export function createThirdPersonStealthExtractionRendererHandoffKit() {
  return {
    id: 'third-person-stealth-extraction-renderer-handoff-kit',
    domain: 'third-person-stealth-extraction/renderer-handoff',
    describe(description = {}) {
      const descriptors = {
        patrolSightCones: description.patrolSightCones ?? [],
        noiseTracePulses: description.noiseTracePulses ?? [],
        coverIslandShadows: description.coverIslandShadows ?? [],
        extractionBreadcrumbs: description.extractionBreadcrumbs ?? [],
        staminaDebtMeters: description.staminaDebtMeters ?? [],
        extractionCommitBadges: description.extractionCommitBadges ?? []
      };
      const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, value.length]));
      return { id: 'third-person-stealth-extraction-renderer-handoff', policy: 'renderer-consumes-descriptors-only', domains: ['third-person-stealth-extraction-readiness-domain'], descriptors, counts, descriptorCount: Object.values(counts).reduce((sum, count) => sum + count, 0) };
    }
  };
}

export function createThirdPersonStealthExtractionReadinessDomainKit(options = {}) {
  const patrolSightConeKit = createThirdPersonPatrolSightConeKit(options);
  const noiseTracePulseKit = createThirdPersonNoiseTracePulseKit(options);
  const coverIslandShadowKit = createThirdPersonCoverIslandShadowKit(options);
  const extractionBreadcrumbKit = createThirdPersonExtractionBreadcrumbKit(options);
  const staminaDebtMeterKit = createThirdPersonStaminaDebtMeterKit(options);
  const extractionCommitBadgeKit = createThirdPersonExtractionCommitBadgeKit(options);
  const rendererHandoffKit = createThirdPersonStealthExtractionRendererHandoffKit(options);
  return {
    id: 'third-person-stealth-extraction-readiness-domain-kit',
    domain: 'third-person-stealth-extraction-readiness-domain',
    tree: THIRD_PERSON_STEALTH_EXTRACTION_READINESS_TREE,
    kits: [patrolSightConeKit, noiseTracePulseKit, coverIslandShadowKit, extractionBreadcrumbKit, staminaDebtMeterKit, extractionCommitBadgeKit, rendererHandoffKit].map((kit) => kit.id),
    describe(snapshot = {}) {
      const patrolSightCones = patrolSightConeKit.describe(snapshot);
      const noiseTracePulses = noiseTracePulseKit.describe(snapshot);
      const coverIslandShadows = coverIslandShadowKit.describe(snapshot);
      const extractionBreadcrumbs = extractionBreadcrumbKit.describe(snapshot);
      const staminaDebtMeters = staminaDebtMeterKit.describe(snapshot);
      const extractionCommitBadges = extractionCommitBadgeKit.describe(snapshot);
      const rendererHandoff = rendererHandoffKit.describe({ patrolSightCones, noiseTracePulses, coverIslandShadows, extractionBreadcrumbs, staminaDebtMeters, extractionCommitBadges });
      const highestDetection = Math.max(...patrolSightCones.map((cone) => cone.detection), 0);
      const nextBreadcrumb = extractionBreadcrumbs.find((crumb) => crumb.state === 'next')?.breadcrumbId ?? 'extraction-door';
      const extractionReadiness = extractionCommitBadges[0]?.readiness ?? 0;
      const counts = rendererHandoff.counts;
      const summary = { highestDetection: Number(highestDetection.toFixed(3)), nextBreadcrumb, extractionReadiness, descriptorCount: rendererHandoff.descriptorCount, alertState: highestDetection > 0.62 ? 'compromised' : highestDetection > 0.34 ? 'watched' : 'clean' };
      return { id: 'third-person-stealth-extraction-readiness', tree: THIRD_PERSON_STEALTH_EXTRACTION_READINESS_TREE, patrolSightCones, noiseTracePulses, coverIslandShadows, extractionBreadcrumbs, staminaDebtMeters, extractionCommitBadges, counts, summary, rendererHandoff };
    },
    snapshot(snapshot = {}) {
      const description = this.describe(snapshot);
      return { id: description.id, domain: this.domain, tree: this.tree, kits: this.kits, counts: description.counts, summary: description.summary, rendererHandoff: description.rendererHandoff };
    }
  };
}

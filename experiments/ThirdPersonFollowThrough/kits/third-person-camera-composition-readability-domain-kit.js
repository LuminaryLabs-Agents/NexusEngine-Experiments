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

function distance3(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function yawDeg(x, z, fallback = 0) {
  if (Math.abs(x) + Math.abs(z) < 0.00001) return fallback;
  return Math.round((Math.atan2(x, z) * 180) / Math.PI);
}

function linePointDistance2D(a, b, point) {
  const ax = a[0];
  const az = a[2];
  const bx = b[0];
  const bz = b[2];
  const px = point.x;
  const pz = point.z;
  const dx = bx - ax;
  const dz = bz - az;
  const lengthSq = dx * dx + dz * dz;
  if (lengthSq < 0.00001) return magnitude2(px - ax, pz - az);
  const t = clamp(((px - ax) * dx + (pz - az) * dz) / lengthSq, 0, 1);
  const cx = ax + dx * t;
  const cz = az + dz * t;
  return magnitude2(px - cx, pz - cz);
}

const DEFAULT_OCCLUDERS = [
  { id: 'left-stack', x: -9, z: -8, radius: 4.2, height: 3 },
  { id: 'rear-wall-block', x: 0, z: -16, radius: 2.1, height: 2 },
  { id: 'right-stack', x: 7, z: -11, radius: 5.1, height: 5 },
  { id: 'pillar-proxy', x: 14, z: 3, radius: 2.0, height: 2.5 },
  { id: 'ramp-proxy', x: -13, z: 7, radius: 5.6, height: 2.2 },
  { id: 'round-platform', x: 13, z: 9, radius: 5.4, height: 1.2 }
];

export const THIRD_PERSON_CAMERA_COMPOSITION_READABILITY_TREE = `third-person-camera-composition-readability-domain
├─ focus-framing-domain
│  ├─ focus-target-domain
│  │  └─ third-person-focus-target-ribbon-kit
│  └─ near-clip-domain
│     └─ third-person-near-clip-cushion-kit
├─ camera-clearance-domain
│  ├─ shoulder-clearance-domain
│  │  └─ third-person-shoulder-clearance-wedge-kit
│  └─ occlusion-risk-domain
│     └─ third-person-occlusion-risk-veil-kit
├─ orbit-comfort-domain
│  ├─ orbit-intent-domain
│  │  └─ third-person-orbit-intent-rail-kit
│  └─ camera-comfort-domain
│     └─ third-person-camera-comfort-meter-kit
└─ renderer-handoff
   └─ third-person-camera-composition-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

function snapshotBasics(snapshot = {}) {
  const actor = vec3(snapshot.targetPosition ?? snapshot.actor?.position, [0, 0, 8]);
  const head = vec3(snapshot.headWorld, [actor[0], actor[1] + 1.6, actor[2]]);
  const camera = vec3(snapshot.cameraPosition ?? snapshot.camera?.position, [actor[0], 3.2, actor[2] + 7]);
  const pivot = vec3(snapshot.cameraPivotWorld, [actor[0], actor[1] + 1.45, actor[2]]);
  const lookAhead = vec3(snapshot.lookAheadWorld, [actor[0], actor[1] + 1.55, actor[2] - 2.4]);
  const cameraForward = vec3(snapshot.cameraForwardWorld, [0, 0, -1]);
  const movementWish = vec3(snapshot.movementWishWorld, [0, 0, 0]);
  const toActor = normalize2(actor[0] - camera[0], actor[2] - camera[2]);
  const cameraPlanar = normalize2(cameraForward[0], cameraForward[2], toActor);
  const movementPlanar = normalize2(movementWish[0], movementWish[2], cameraPlanar);
  const distance = distance3(camera, pivot);
  const orbitYawOffsetDeg = finite(snapshot.orbitYawOffsetDeg, 0);
  const cameraYawDeg = finite(snapshot.cameraYawDeg, yawDeg(cameraPlanar[0], cameraPlanar[1], 0));
  const cameraPitch = finite(snapshot.cameraPitch ?? snapshot.pitch ?? snapshot.camera?.pitch, 0.28);
  const handoffAlpha = clamp01(snapshot.handoffAlpha ?? 0);
  const grounded = snapshot.grounded !== false;
  const colliderCount = Math.max(0, Math.round(finite(snapshot.colliderCount, DEFAULT_OCCLUDERS.length)));
  return { actor, head, camera, pivot, lookAhead, cameraForward, toActor, cameraPlanar, movementPlanar, movementWish, distance, orbitYawOffsetDeg, cameraYawDeg, cameraPitch, handoffAlpha, grounded, colliderCount };
}

function occlusionProfile(basics, occluders = DEFAULT_OCCLUDERS) {
  let maxRisk = 0;
  let nearest = 'none';
  const perOccluder = occluders.map((occluder, index) => {
    const lineDistance = linePointDistance2D(basics.camera, basics.pivot, occluder);
    const heightBias = clamp01(occluder.height / 5);
    const lineRisk = clamp01(1 - (lineDistance - occluder.radius * 0.52) / 4.6);
    const proximity = clamp01(1 - magnitude2(basics.actor[0] - occluder.x, basics.actor[2] - occluder.z) / 14);
    const risk = Number(clamp01(lineRisk * 0.72 + proximity * 0.18 + heightBias * 0.1).toFixed(3));
    if (risk > maxRisk) {
      maxRisk = risk;
      nearest = occluder.id;
    }
    return { ...occluder, index, risk, lineDistance: Number(lineDistance.toFixed(3)) };
  });
  return { maxRisk: Number(maxRisk.toFixed(3)), nearest, perOccluder };
}

export function createThirdPersonFocusTargetRibbonKit() {
  return {
    id: 'third-person-focus-target-ribbon-kit',
    domain: 'third-person-camera-composition/focus-framing/focus-target',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      const movementStrength = clamp01(magnitude2(basics.movementWish[0], basics.movementWish[2]));
      const focusYaw = yawDeg(basics.movementPlanar[0], basics.movementPlanar[1], basics.cameraYawDeg);
      return Array.from({ length: 4 }, (_, index) => {
        const t = (index + 1) / 5;
        const x = basics.head[0] * (1 - t) + basics.lookAhead[0] * t;
        const y = basics.head[1] * (1 - t) + basics.lookAhead[1] * t;
        const z = basics.head[2] * (1 - t) + basics.lookAhead[2] * t;
        return {
          id: `focus-target-ribbon-${index}`,
          kind: 'focus-target-ribbon',
          index,
          center: { x: Number(x.toFixed(3)), y: Number(y.toFixed(3)), z: Number(z.toFixed(3)) },
          focusYawDeg: focusYaw,
          movementStrength: Number(movementStrength.toFixed(3)),
          opacity: Number(clamp(0.22 + movementStrength * 0.34 + basics.handoffAlpha * 0.16 - index * 0.035, 0.16, 0.82).toFixed(3)),
          rendererHint: 'screen-space focus target ribbon'
        };
      });
    },
    snapshot(snapshot = {}) {
      const ribbons = this.describe(snapshot);
      return { ribbons: ribbons.length, peakOpacity: Math.max(...ribbons.map((ribbon) => ribbon.opacity)) };
    }
  };
}

export function createThirdPersonShoulderClearanceWedgeKit({ occluders = DEFAULT_OCCLUDERS } = {}) {
  return {
    id: 'third-person-shoulder-clearance-wedge-kit',
    domain: 'third-person-camera-composition/camera-clearance/shoulder-clearance',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      const profile = occlusionProfile(basics, occluders);
      const sideSign = basics.orbitYawOffsetDeg < 0 ? -1 : 1;
      const orbitLoad = clamp01(Math.abs(basics.orbitYawOffsetDeg) / 90);
      const right = [-basics.toActor[1], basics.toActor[0]];
      return Array.from({ length: 4 }, (_, index) => {
        const side = index % 2 === 0 ? -1 : 1;
        const depth = 0.9 + Math.floor(index / 2) * 0.72;
        const lane = 0.68 + Math.floor(index / 2) * 0.42;
        const clearance = clamp01(1 - profile.maxRisk * 0.72 - (side === sideSign ? orbitLoad * 0.18 : 0.04));
        return {
          id: `shoulder-clearance-wedge-${index}`,
          kind: 'shoulder-clearance-wedge',
          index,
          side: side < 0 ? 'left' : 'right',
          anchor: {
            x: Number((basics.pivot[0] + right[0] * side * lane + basics.toActor[0] * depth).toFixed(3)),
            y: Number((basics.pivot[1] + 0.08).toFixed(3)),
            z: Number((basics.pivot[2] + right[1] * side * lane + basics.toActor[1] * depth).toFixed(3))
          },
          clearance: Number(clearance.toFixed(3)),
          state: clearance < 0.35 ? 'blocked' : clearance < 0.62 ? 'tight' : 'open',
          opacity: Number(clamp(0.18 + (1 - clearance) * 0.55 + orbitLoad * 0.12, 0.16, 0.78).toFixed(3)),
          rendererHint: 'camera shoulder clearance wedge'
        };
      });
    },
    snapshot(snapshot = {}) {
      const wedges = this.describe(snapshot);
      return { wedges: wedges.length, tight: wedges.filter((wedge) => wedge.state !== 'open').length };
    }
  };
}

export function createThirdPersonNearClipCushionKit() {
  return {
    id: 'third-person-near-clip-cushion-kit',
    domain: 'third-person-camera-composition/focus-framing/near-clip',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      const closeRisk = clamp01((5.4 - basics.distance) / 2.4);
      return Array.from({ length: 5 }, (_, index) => {
        const radius = 0.78 + index * 0.34;
        return {
          id: `near-clip-cushion-${index}`,
          kind: 'near-clip-cushion',
          index,
          center: { x: Number(basics.pivot[0].toFixed(3)), y: Number(basics.pivot[1].toFixed(3)), z: Number(basics.pivot[2].toFixed(3)) },
          radius: Number(radius.toFixed(3)),
          cameraDistance: Number(basics.distance.toFixed(3)),
          closeRisk: Number(closeRisk.toFixed(3)),
          state: closeRisk > 0.66 ? 'too-close' : closeRisk > 0.28 ? 'watch' : 'clear',
          opacity: Number(clamp(0.12 + closeRisk * 0.58 - index * 0.032, 0.1, 0.76).toFixed(3)),
          rendererHint: 'near clip cushion ring'
        };
      });
    },
    snapshot(snapshot = {}) {
      const cushions = this.describe(snapshot);
      return { cushions: cushions.length, maxCloseRisk: Math.max(...cushions.map((cushion) => cushion.closeRisk)) };
    }
  };
}

export function createThirdPersonOrbitIntentRailKit() {
  return {
    id: 'third-person-orbit-intent-rail-kit',
    domain: 'third-person-camera-composition/orbit-comfort/orbit-intent',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      const side = basics.orbitYawOffsetDeg < 0 ? -1 : 1;
      const orbitLoad = clamp01(Math.abs(basics.orbitYawOffsetDeg) / 90);
      return Array.from({ length: 6 }, (_, index) => ({
        id: `orbit-intent-rail-${index}`,
        kind: 'orbit-intent-rail',
        index,
        side: side < 0 ? 'left' : 'right',
        orbitYawOffsetDeg: Number(basics.orbitYawOffsetDeg.toFixed(2)),
        orbitLoad: Number(orbitLoad.toFixed(3)),
        handoffAlpha: Number(basics.handoffAlpha.toFixed(3)),
        screenAnchor: {
          xPercent: Number((50 + side * (14 + index * 3.7)).toFixed(2)),
          yPercent: Number((70 - index * 5.8).toFixed(2))
        },
        opacity: Number(clamp(0.16 + orbitLoad * 0.54 + basics.handoffAlpha * 0.22 - index * 0.048, 0.1, 0.84).toFixed(3)),
        rendererHint: 'screen orbit intent rail'
      }));
    },
    snapshot(snapshot = {}) {
      const rails = this.describe(snapshot);
      return { rails: rails.length, active: rails.some((rail) => rail.orbitLoad > 0.22) };
    }
  };
}

export function createThirdPersonOcclusionRiskVeilKit({ occluders = DEFAULT_OCCLUDERS } = {}) {
  return {
    id: 'third-person-occlusion-risk-veil-kit',
    domain: 'third-person-camera-composition/camera-clearance/occlusion-risk',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      const profile = occlusionProfile(basics, occluders);
      return profile.perOccluder.map((occluder) => ({
        id: `occlusion-risk-veil-${occluder.id}`,
        kind: 'occlusion-risk-veil',
        index: occluder.index,
        occluderId: occluder.id,
        position: { x: Number(occluder.x.toFixed(3)), y: Number((0.28 + occluder.height * 0.18).toFixed(3)), z: Number(occluder.z.toFixed(3)) },
        radius: Number(occluder.radius.toFixed(3)),
        lineDistance: occluder.lineDistance,
        risk: occluder.risk,
        state: occluder.risk > 0.62 ? 'occluding' : occluder.risk > 0.28 ? 'near-line' : 'clear',
        opacity: Number(clamp(0.1 + occluder.risk * 0.7, 0.08, 0.82).toFixed(3)),
        rendererHint: 'occlusion risk floor veil'
      }));
    },
    snapshot(snapshot = {}) {
      const veils = this.describe(snapshot);
      return { veils: veils.length, occluding: veils.filter((veil) => veil.state === 'occluding').length };
    }
  };
}

export function createThirdPersonCameraComfortMeterKit({ occluders = DEFAULT_OCCLUDERS } = {}) {
  return {
    id: 'third-person-camera-comfort-meter-kit',
    domain: 'third-person-camera-composition/orbit-comfort/camera-comfort',
    describe(snapshot = {}) {
      const basics = snapshotBasics(snapshot);
      const profile = occlusionProfile(basics, occluders);
      const orbitLoad = clamp01(Math.abs(basics.orbitYawOffsetDeg) / 90);
      const distanceComfort = clamp01(1 - Math.abs(basics.distance - 6.2) / 4.2);
      const pitchComfort = clamp01(1 - Math.abs(basics.cameraPitch - 0.28) / 0.62);
      const metrics = [
        ['distance', distanceComfort],
        ['pitch', pitchComfort],
        ['orbit', 1 - orbitLoad * 0.72],
        ['handoff', 1 - basics.handoffAlpha * 0.44],
        ['occlusion', 1 - profile.maxRisk]
      ];
      return metrics.map(([label, score], index) => ({
        id: `camera-comfort-meter-${label}`,
        kind: 'camera-comfort-meter',
        index,
        label,
        score: Number(clamp01(score).toFixed(3)),
        state: score < 0.42 ? 'strained' : score < 0.68 ? 'watch' : 'comfortable',
        nearestOccluderId: profile.nearest,
        opacity: Number(clamp(0.2 + (1 - score) * 0.48 + index * 0.018, 0.18, 0.82).toFixed(3)),
        rendererHint: 'camera comfort meter chip'
      }));
    },
    snapshot(snapshot = {}) {
      const meters = this.describe(snapshot);
      return { meters: meters.length, strained: meters.filter((meter) => meter.state === 'strained').length };
    }
  };
}

export function createThirdPersonCameraCompositionRendererHandoffKit() {
  return {
    id: 'third-person-camera-composition-renderer-handoff-kit',
    domain: 'third-person-camera-composition-readability/renderer-handoff',
    describe(descriptors = {}) {
      const safe = {
        focusTargetRibbons: arr(descriptors.focusTargetRibbons),
        shoulderClearanceWedges: arr(descriptors.shoulderClearanceWedges),
        nearClipCushions: arr(descriptors.nearClipCushions),
        orbitIntentRails: arr(descriptors.orbitIntentRails),
        occlusionRiskVeils: arr(descriptors.occlusionRiskVeils),
        cameraComfortMeters: arr(descriptors.cameraComfortMeters)
      };
      const counts = Object.fromEntries(Object.entries(safe).map(([key, value]) => [key, value.length]));
      return {
        id: 'third-person-camera-composition-renderer-handoff',
        policy: 'renderer-consumes-descriptors-only',
        descriptors: safe,
        counts,
        rendererConsumes: Object.keys(safe),
        rendererOwns: ['DOM overlay placement', 'presentation styling', 'visual interpolation'],
        rendererMustNotOwn: ['camera follow math', 'collision truth', 'occlusion descriptor generation', 'controller math', 'browser input', 'frame-loop ownership', 'asset loading']
      };
    },
    snapshot(descriptors = {}) {
      const handoff = this.describe(descriptors);
      return { countKeys: Object.keys(handoff.counts), totalDescriptors: Object.values(handoff.counts).reduce((sum, value) => sum + value, 0) };
    }
  };
}

export function createThirdPersonCameraCompositionReadabilityDomainKit(options = {}) {
  const focusTargetRibbonKit = createThirdPersonFocusTargetRibbonKit(options);
  const shoulderClearanceWedgeKit = createThirdPersonShoulderClearanceWedgeKit(options);
  const nearClipCushionKit = createThirdPersonNearClipCushionKit(options);
  const orbitIntentRailKit = createThirdPersonOrbitIntentRailKit(options);
  const occlusionRiskVeilKit = createThirdPersonOcclusionRiskVeilKit(options);
  const cameraComfortMeterKit = createThirdPersonCameraComfortMeterKit(options);
  const rendererHandoffKit = createThirdPersonCameraCompositionRendererHandoffKit(options);
  return {
    id: 'third-person-camera-composition-readability-domain-kit',
    domain: 'third-person-follow-through/camera-composition-readability-domain',
    tree: THIRD_PERSON_CAMERA_COMPOSITION_READABILITY_TREE,
    kits: { focusTargetRibbonKit, shoulderClearanceWedgeKit, nearClipCushionKit, orbitIntentRailKit, occlusionRiskVeilKit, cameraComfortMeterKit, rendererHandoffKit },
    describe(snapshot = {}) {
      const descriptors = {
        focusTargetRibbons: focusTargetRibbonKit.describe(snapshot),
        shoulderClearanceWedges: shoulderClearanceWedgeKit.describe(snapshot),
        nearClipCushions: nearClipCushionKit.describe(snapshot),
        orbitIntentRails: orbitIntentRailKit.describe(snapshot),
        occlusionRiskVeils: occlusionRiskVeilKit.describe(snapshot),
        cameraComfortMeters: cameraComfortMeterKit.describe(snapshot)
      };
      const rendererHandoff = rendererHandoffKit.describe(descriptors);
      return {
        id: 'third-person-camera-composition-readability-domain',
        route: 'ThirdPersonFollowThrough',
        tree: THIRD_PERSON_CAMERA_COMPOSITION_READABILITY_TREE,
        descriptors,
        rendererHandoff,
        counts: rendererHandoff.counts,
        ownership: {
          kitOwns: ['serializable camera composition descriptors', 'framing classifications', 'occlusion risk shaping', 'camera comfort scoring'],
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

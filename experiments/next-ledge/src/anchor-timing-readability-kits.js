const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, n(value, min)));
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

function ledgesFor(snapshot = {}) {
  return Array.isArray(snapshot.route?.ledges) ? snapshot.route.ledges : [];
}

function playerFor(snapshot = {}) {
  return snapshot.player ?? { x: 0, y: 0, z: 1, vx: 0, vy: 0, angle: 0 };
}

function distance(a = {}, b = {}) {
  return Math.hypot(n(a.x) - n(b.x), n(a.y) - n(b.y));
}

function maxCable(snapshot = {}) {
  return Math.max(32, n(snapshot.constants?.maxCableLength, 168));
}

function staminaRatio(snapshot = {}) {
  return clamp(n(snapshot.stamina, 0) / Math.max(1, n(snapshot.constants?.maxStamina, 115)), 0, 1);
}

function activeLedgeIndex(snapshot = {}) {
  const ledges = ledgesFor(snapshot);
  const id = snapshot.currentAnchorId ?? snapshot.lastLgeId ?? snapshot.lastLedgeId;
  const index = ledges.findIndex((ledge) => ledge.id === id);
  return index >= 0 ? index : 0;
}

function nextLedges(snapshot = {}, limit = 6) {
  const ledges = ledgesFor(snapshot);
  const current = activeLedgeIndex(snapshot);
  const enabled = new Set(snapshot.enabledTargetIds ?? []);
  return ledges
    .map((ledge, index) => ({ ledge, index }))
    .filter(({ ledge, index }) => index > current || enabled.has(ledge.id))
    .slice(0, limit);
}

function velocityAngle(snapshot = {}) {
  const player = playerFor(snapshot);
  const vx = n(player.vx);
  const vy = n(player.vy);
  return Math.atan2(vy, vx || 0.0001);
}

function pressureValue(cargoSnapshot = null) {
  const channel = cargoSnapshot?.pressure?.channelsById?.["fall-pressure"] ?? cargoSnapshot?.pressure?.channels?.find?.((item) => item.id === "fall-pressure");
  return clamp(n(channel?.value, 0), 0, 100);
}

export const NEXT_LEDGE_ANCHOR_TIMING_READABILITY_TREE = `next-ledge-anchor-timing-readability-domain
├─ timing-intent-domain
│  ├─ release-timing-domain
│  │  └─ anchor-release-timing-dial-kit
│  └─ line-of-sight-domain
│     └─ grapple-line-of-sight-strip-kit
├─ commitment-route-domain
│  ├─ energy-pocket-domain
│  │  └─ swing-energy-pocket-kit
│  └─ route-commitment-domain
│     └─ route-commitment-stair-kit
├─ hazard-anticipation-domain
│  ├─ wall-bounce-domain
│  │  └─ wall-bounce-warning-field-kit
│  └─ fail-floor-domain
│     └─ fail-floor-proximity-wave-kit
└─ renderer-handoff
   └─ anchor-timing-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export function createAnchorReleaseTimingDialKit() {
  return {
    id: "anchor-release-timing-dial-kit",
    describe(snapshot = {}, cargoSnapshot = null) {
      const player = playerFor(snapshot);
      const speed = Math.hypot(n(player.vx), n(player.vy));
      const stamina = staminaRatio(snapshot);
      const pressure = pressureValue(cargoSnapshot);
      const activeMode = ["swinging", "reeling", "falling", "launched", "retracting"].includes(snapshot.mode);
      const releaseScore = clamp((activeMode ? 0.22 : 0.04) + speed / 48 + stamina * 0.28 - pressure / 180, 0, 1);
      return [{
        id: "anchor-release-timing:player",
        kind: "anchor-release-timing-dial",
        layer: "interactive",
        position: { x: n(player.x), y: n(player.y), z: 24 },
        radius: 28 + releaseScore * 54,
        angle: velocityAngle(snapshot),
        phase: ((n(snapshot.frame) % 90) / 90),
        releaseScore,
        active: activeMode && Boolean(snapshot.alive !== false) && !snapshot.completed,
        styleId: releaseScore > 0.68 ? "release-now" : releaseScore > 0.38 ? "release-build" : "release-hold"
      }];
    }
  };
}

export function createGrappleLineOfSightStripKit(options = {}) {
  const limit = Math.max(2, Math.floor(n(options.limit, 5)));
  return {
    id: "grapple-line-of-sight-strip-kit",
    describe(snapshot = {}) {
      const player = playerFor(snapshot);
      const cable = maxCable(snapshot);
      const enabled = new Set(snapshot.enabledTargetIds ?? []);
      return nextLedges(snapshot, limit).map(({ ledge, index }, order) => {
        const gap = distance(player, ledge);
        const reachable = enabled.has(ledge.id) || gap <= cable + n(ledge.r, 8);
        const clearance = clamp(1 - Math.abs(gap - cable * 0.72) / Math.max(1, cable), 0, 1);
        return {
          id: `grapple-los:${ledge.id ?? order}`,
          kind: "grapple-line-of-sight-strip",
          layer: "interactive",
          start: { x: n(player.x), y: n(player.y), z: 8 },
          end: { x: n(ledge.x), y: n(ledge.y), z: 10 + order },
          order: index,
          distance: gap,
          reachable,
          clearance,
          score: clamp((reachable ? 0.42 : 0.1) + clearance * 0.38 + staminaRatio(snapshot) * 0.2, 0, 1),
          styleId: reachable ? "grapple-los-open" : "grapple-los-stretch"
        };
      });
    }
  };
}

export function createSwingEnergyPocketKit(options = {}) {
  const limit = Math.max(3, Math.floor(n(options.limit, 6)));
  return {
    id: "swing-energy-pocket-kit",
    describe(snapshot = {}) {
      const stamina = staminaRatio(snapshot);
      return nextLedges(snapshot, limit).map(({ ledge }, order) => {
        const restBonus = ledge.type === "rest" ? 0.28 : ledge.type === "summit" ? 0.18 : 0;
        const energy = clamp(0.18 + stamina * 0.48 + restBonus - order * 0.035, 0, 1);
        return {
          id: `swing-energy-pocket:${ledge.id ?? order}`,
          kind: "swing-energy-pocket",
          layer: "mid-static",
          position: { x: n(ledge.x), y: n(ledge.y), z: 13 + order * 0.25 },
          radius: Math.max(18, n(ledge.r, 8) * (2.1 + energy * 2.2)),
          energy,
          anchorType: ledge.type ?? "normal",
          styleId: ledge.type === "rest" ? "energy-rest-pocket" : ledge.type === "summit" ? "energy-summit-pocket" : energy > 0.55 ? "energy-usable-pocket" : "energy-thin-pocket"
        };
      });
    }
  };
}

export function createWallBounceWarningFieldKit() {
  return {
    id: "wall-bounce-warning-field-kit",
    describe(snapshot = {}) {
      const player = playerFor(snapshot);
      const boundary = Math.max(80, n(snapshot.constants?.scaffoldBoundary, 176));
      const speedX = Math.abs(n(player.vx));
      return [-1, 1].map((side) => {
        const edgeX = side * boundary;
        const edgeDistance = Math.abs(edgeX - n(player.x));
        const proximity = clamp(1 - edgeDistance / Math.max(1, boundary * 0.55), 0, 1);
        const severity = clamp(proximity * 0.72 + speedX / 55 + (snapshot.mode === "falling" ? 0.12 : 0), 0, 1);
        return {
          id: `wall-bounce-warning:${side < 0 ? "left" : "right"}`,
          kind: "wall-bounce-warning-field",
          layer: "near-static",
          position: { x: edgeX, y: n(player.y), z: 7 },
          side: side < 0 ? "left" : "right",
          width: 24 + severity * 34,
          height: 130 + severity * 110,
          severity,
          styleId: severity > 0.65 ? "wall-bounce-critical" : severity > 0.3 ? "wall-bounce-watch" : "wall-bounce-quiet"
        };
      });
    }
  };
}

export function createRouteCommitmentStairKit(options = {}) {
  const limit = Math.max(4, Math.floor(n(options.limit, 7)));
  return {
    id: "route-commitment-stair-kit",
    describe(snapshot = {}) {
      const player = playerFor(snapshot);
      const cable = maxCable(snapshot);
      return nextLedges(snapshot, limit).map(({ ledge, index }, order) => {
        const gap = distance(player, ledge);
        const typeBonus = ledge.type === "rest" ? 0.2 : ledge.type === "summit" ? 0.28 : 0.06;
        const commitment = clamp(0.38 + typeBonus + staminaRatio(snapshot) * 0.22 - gap / Math.max(1, cable * 3.2), 0, 1);
        return {
          id: `route-commitment:${ledge.id ?? order}`,
          kind: "route-commitment-stair",
          layer: "mid-static",
          position: { x: n(ledge.x), y: n(ledge.y), z: 18 + order * 0.4 },
          order: index,
          step: order,
          label: ledge.type === "summit" ? "commit to summit" : ledge.type === "rest" ? "commit to rest" : "commit to anchor",
          commitment,
          styleId: ledge.type === "summit" ? "commitment-summit" : commitment > 0.55 ? "commitment-strong" : "commitment-soft"
        };
      });
    }
  };
}

export function createFailFloorProximityWaveKit() {
  return {
    id: "fail-floor-proximity-wave-kit",
    describe(snapshot = {}, cargoSnapshot = null) {
      const player = playerFor(snapshot);
      const failFloorDistance = Math.max(220, n(snapshot.constants?.failFloorDistance, n(snapshot.tuning?.failFloorDistance, 520)));
      const highest = Math.max(n(snapshot.maxHeight, n(player.y)), n(snapshot.anchorLedge?.y, 0), n(snapshot.camera?.targetY, 0));
      const floorY = highest - failFloorDistance;
      const clearance = n(player.y) - floorY;
      const severity = clamp(1 - clearance / 320 + pressureValue(cargoSnapshot) / 170, 0, 1);
      return [{
        id: "fail-floor-proximity:active",
        kind: "fail-floor-proximity-wave",
        layer: "near-static",
        position: { x: 0, y: floorY, z: 5 },
        width: 380,
        clearance,
        severity,
        active: Boolean(snapshot.alive !== false) && !snapshot.completed,
        styleId: severity > 0.65 ? "fail-floor-critical" : severity > 0.34 ? "fail-floor-near" : "fail-floor-distant"
      }];
    }
  };
}

export function createAnchorTimingRendererHandoffKit() {
  return {
    id: "anchor-timing-renderer-handoff-kit",
    describe(groups = {}) {
      const descriptors = Object.values(groups).flatMap((group) => Array.isArray(group) ? group : []);
      return {
        id: "anchor-timing-readability-renderer-handoff",
        kind: "renderer-handoff",
        descriptorCount: descriptors.length,
        buckets: Object.fromEntries(Object.entries(groups).map(([key, value]) => [key, Array.isArray(value) ? value.length : 0])),
        descriptors: descriptors.map(clone),
        rendererContract: "renderer consumes descriptors only; anchor timing kits own no Three.js, DOM, browser input, audio, asset loading, or frame loop"
      };
    }
  };
}

export function createNextLedgeAnchorTimingReadabilityDomainKit(options = {}) {
  const releaseTimingDials = createAnchorReleaseTimingDialKit(options.releaseTimingDials);
  const grappleLineOfSightStrips = createGrappleLineOfSightStripKit(options.grappleLineOfSightStrips);
  const swingEnergyPockets = createSwingEnergyPocketKit(options.swingEnergyPockets);
  const wallBounceWarningFields = createWallBounceWarningFieldKit(options.wallBounceWarningFields);
  const routeCommitmentStairs = createRouteCommitmentStairKit(options.routeCommitmentStairs);
  const failFloorProximityWaves = createFailFloorProximityWaveKit(options.failFloorProximityWaves);
  const rendererHandoff = createAnchorTimingRendererHandoffKit();

  return {
    id: "next-ledge-anchor-timing-readability-domain-kit",
    describe(snapshot = {}, cargoSnapshot = null) {
      const groups = {
        releaseTimingDials: releaseTimingDials.describe(snapshot, cargoSnapshot),
        grappleLineOfSightStrips: grappleLineOfSightStrips.describe(snapshot, cargoSnapshot),
        swingEnergyPockets: swingEnergyPockets.describe(snapshot, cargoSnapshot),
        wallBounceWarningFields: wallBounceWarningFields.describe(snapshot, cargoSnapshot),
        routeCommitmentStairs: routeCommitmentStairs.describe(snapshot, cargoSnapshot),
        failFloorProximityWaves: failFloorProximityWaves.describe(snapshot, cargoSnapshot)
      };
      return {
        version: "next-ledge-anchor-timing-readability-domain-0.1.0",
        kitTree: NEXT_LEDGE_ANCHOR_TIMING_READABILITY_TREE,
        ...groups,
        rendererHandoff: rendererHandoff.describe(groups)
      };
    }
  };
}

export default createNextLedgeAnchorTimingReadabilityDomainKit;

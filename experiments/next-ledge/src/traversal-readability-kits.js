const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min, max) => Math.max(min, Math.min(max, n(value, min)));
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

const TRAVERSAL_MODES = new Set(["swinging", "falling", "launched", "retracting", "reeling"]);

function ledgesFor(snapshot = {}) {
  return Array.isArray(snapshot.route?.ledges) ? snapshot.route.ledges : [];
}

function playerFor(snapshot = {}) {
  return snapshot.player ?? { x: 0, y: 0, z: 1, vx: 0, vy: 0 };
}

function staminaRatio(snapshot = {}) {
  return clamp(n(snapshot.stamina, 0) / Math.max(1, n(snapshot.constants?.maxStamina, 100)), 0, 1);
}

function maxCable(snapshot = {}) {
  return Math.max(32, n(snapshot.constants?.maxCableLength, 160));
}

function distance(a = {}, b = {}) {
  return Math.hypot(n(a.x) - n(b.x), n(a.y) - n(b.y));
}

function activeLedgeIndex(snapshot = {}) {
  const ledges = ledgesFor(snapshot);
  const id = snapshot.currentAnchorId ?? snapshot.lastLedgeId;
  const index = ledges.findIndex((ledge) => ledge.id === id);
  return index >= 0 ? index : 0;
}

function routeProgress(snapshot = {}) {
  const ledges = ledgesFor(snapshot);
  if (ledges.length <= 1) return 0;
  return clamp(activeLedgeIndex(snapshot) / Math.max(1, ledges.length - 1), 0, 1);
}

function nextLedges(snapshot = {}, limit = 5) {
  const ledges = ledgesFor(snapshot);
  const current = activeLedgeIndex(snapshot);
  const enabled = new Set(snapshot.enabledTargetIds ?? []);
  return ledges
    .map((ledge, index) => ({ ledge, index }))
    .filter(({ ledge, index }) => index > current || enabled.has(ledge.id))
    .slice(0, limit);
}

function forecastPoints(snapshot = {}, maxPoints = 12) {
  const trajectory = Array.isArray(snapshot.trajectory) ? snapshot.trajectory : [];
  if (trajectory.length) {
    const step = Math.max(1, Math.floor(trajectory.length / maxPoints));
    return trajectory.filter((_, index) => index % step === 0).slice(0, maxPoints).map((point) => ({ x: n(point.x), y: n(point.y), z: n(point.z, 3) }));
  }

  const player = playerFor(snapshot);
  const points = [];
  let x = n(player.x);
  let y = n(player.y);
  let vx = n(player.vx);
  let vy = n(player.vy);
  const gravity = Math.max(0.01, n(snapshot.constants?.gravity, 0.05));
  for (let index = 0; index < maxPoints; index += 1) {
    vx *= 0.982;
    vy -= gravity * 7.5;
    x += vx * 5;
    y += vy * 5;
    points.push({ x, y, z: 3 + index * 0.03 });
  }
  return points;
}

function pressureValue(cargoSnapshot = null) {
  const channel = cargoSnapshot?.pressure?.channelsById?.["fall-pressure"] ?? cargoSnapshot?.pressure?.channels?.find?.((item) => item.id === "fall-pressure");
  return clamp(n(channel?.value, 0), 0, 100);
}

export const NEXT_LEDGE_TRAVERSAL_READABILITY_TREE = `next-ledge-traversal-readability-domain
├─ swing-decision-domain
│  ├─ arc-forecast-domain
│  │  └─ swing-arc-forecast-kit
│  └─ momentum-window-domain
│     └─ momentum-window-kit
├─ anchor-choice-domain
│  ├─ anchor-confidence-domain
│  │  └─ anchor-confidence-field-kit
│  └─ summit-route-beat-domain
│     └─ summit-route-beat-kit
├─ survival-recovery-domain
│  ├─ stamina-risk-domain
│  │  └─ stamina-risk-band-kit
│  └─ recovery-vector-domain
│     └─ recovery-vector-kit
└─ renderer-handoff
   └─ traversal-readability-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export function createSwingArcForecastKit(options = {}) {
  const maxPoints = Math.max(5, Math.floor(n(options.maxPoints, 12)));
  return {
    id: "swing-arc-forecast-kit",
    describe(snapshot = {}) {
      const points = forecastPoints(snapshot, maxPoints);
      const active = TRAVERSAL_MODES.has(snapshot.mode) && Boolean(snapshot.alive !== false) && !snapshot.completed;
      const velocity = Math.hypot(n(snapshot.player?.vx), n(snapshot.player?.vy));
      return [{
        id: `swing-arc:${snapshot.levelId ?? "next-ledge"}:${snapshot.frame ?? 0}`,
        kind: "swing-arc-forecast",
        layer: "interactive",
        active,
        points,
        confidence: clamp(0.35 + staminaRatio(snapshot) * 0.35 + Math.min(0.3, velocity / 70), 0.1, 1),
        styleId: snapshot.mode === "falling" ? "arc-emergency" : snapshot.mode === "swinging" ? "arc-release-ready" : "arc-traversal"
      }];
    }
  };
}

export function createAnchorConfidenceFieldKit(options = {}) {
  const limit = Math.max(4, Math.floor(n(options.limit, 10)));
  return {
    id: "anchor-confidence-field-kit",
    describe(snapshot = {}) {
      const player = playerFor(snapshot);
      const enabled = new Set(snapshot.enabledTargetIds ?? []);
      const aimId = snapshot.aimAssistTargetId;
      const cable = maxCable(snapshot);
      return ledgesFor(snapshot)
        .filter((ledge) => ledge.id !== snapshot.currentAnchorId)
        .map((ledge, index) => {
          const gap = distance(player, ledge);
          const reachable = enabled.has(ledge.id) || gap <= cable + n(ledge.r, 8);
          const aheadBonus = n(ledge.y) > n(player.y) ? 0.18 : -0.08;
          return {
            id: `anchor-confidence:${ledge.id ?? index}`,
            kind: "anchor-confidence-field",
            layer: "interactive",
            position: { x: n(ledge.x), y: n(ledge.y), z: 8 + (index % 3) },
            radius: Math.max(12, n(ledge.r, 8) * (reachable ? 2.4 : 1.35)),
            confidence: clamp((reachable ? 0.48 : 0.12) + aheadBonus + (ledge.id === aimId ? 0.3 : 0) + staminaRatio(snapshot) * 0.18, 0.05, 1),
            reachable,
            styleId: ledge.id === aimId ? "anchor-aim-assisted" : ledge.type === "rest" ? "anchor-rest-safe" : ledge.type === "summit" ? "anchor-summit" : reachable ? "anchor-reachable" : "anchor-far"
          };
        })
        .sort((a, b) => Number(b.reachable) - Number(a.reachable) || b.confidence - a.confidence)
        .slice(0, limit);
    }
  };
}

export function createStaminaRiskBandKit() {
  return {
    id: "stamina-risk-band-kit",
    describe(snapshot = {}, cargoSnapshot = null) {
      const player = playerFor(snapshot);
      const stamina = staminaRatio(snapshot);
      const pressure = pressureValue(cargoSnapshot);
      const fallMode = ["falling", "launched", "retracting"].includes(snapshot.mode) ? 0.25 : 0;
      const risk = clamp((1 - stamina) * 0.72 + pressure / 140 + fallMode, 0, 1);
      return [{
        id: "stamina-risk:player",
        kind: "stamina-risk-band",
        layer: "near-static",
        position: { x: n(player.x), y: n(player.y), z: 16 },
        radius: 34 + risk * 92,
        staminaRatio: stamina,
        pressureValue: pressure,
        risk,
        styleId: risk > 0.68 ? "stamina-critical" : risk > 0.42 ? "stamina-warning" : "stamina-stable"
      }];
    }
  };
}

export function createRecoveryVectorKit(options = {}) {
  const limit = Math.max(1, Math.floor(n(options.limit, 4)));
  return {
    id: "recovery-vector-kit",
    describe(snapshot = {}) {
      const player = playerFor(snapshot);
      return ledgesFor(snapshot)
        .filter((ledge) => ledge.type === "rest" && n(ledge.y) >= n(player.y) - 80)
        .slice(0, limit)
        .map((ledge, index) => ({
          id: `recovery-vector:${ledge.id ?? index}`,
          kind: "recovery-vector",
          layer: "interactive",
          start: { x: n(player.x), y: n(player.y), z: 5 },
          end: { x: n(ledge.x), y: n(ledge.y), z: 9 },
          distance: distance(player, ledge),
          urgency: clamp(1 - staminaRatio(snapshot) + (snapshot.mode === "falling" ? 0.22 : 0), 0, 1),
          styleId: "rest-recovery-vector"
        }));
    }
  };
}

export function createMomentumWindowKit() {
  return {
    id: "momentum-window-kit",
    describe(snapshot = {}) {
      const player = playerFor(snapshot);
      const speed = Math.hypot(n(player.vx), n(player.vy));
      const angle = n(player.angle, Math.atan2(n(player.vy), n(player.vx || 1)));
      const ready = snapshot.mode === "swinging" && speed > 1.2 && staminaRatio(snapshot) > 0.14;
      return ["release-left", "release-right"].map((side, index) => ({
        id: `momentum-window:${side}`,
        kind: "momentum-window",
        layer: "interactive",
        position: {
          x: n(player.x) + Math.cos(angle + (index ? 0.55 : -0.55)) * (42 + speed * 1.8),
          y: n(player.y) + Math.sin(angle + (index ? 0.55 : -0.55)) * (42 + speed * 1.8),
          z: 14 + index
        },
        width: 28 + speed * 3.5,
        ready,
        score: clamp((ready ? 0.42 : 0.08) + speed / 44 + staminaRatio(snapshot) * 0.25, 0, 1),
        styleId: ready ? "momentum-release-ready" : "momentum-build"
      }));
    }
  };
}

export function createSummitRouteBeatKit(options = {}) {
  const limit = Math.max(3, Math.floor(n(options.limit, 7)));
  return {
    id: "summit-route-beat-kit",
    describe(snapshot = {}) {
      const progress = routeProgress(snapshot);
      return nextLedges(snapshot, limit).map(({ ledge, index }, beatIndex) => ({
        id: `summit-beat:${ledge.id ?? beatIndex}`,
        kind: "summit-route-beat",
        layer: "mid-static",
        position: { x: n(ledge.x), y: n(ledge.y), z: ledge.type === "summit" ? 20 : 11 },
        order: index,
        progress,
        beat: beatIndex,
        required: ledge.type === "summit" || beatIndex === 0,
        label: ledge.type === "summit" ? "Summit handoff" : ledge.type === "rest" ? "Recover" : "Anchor",
        styleId: ledge.type === "summit" ? "summit-route-beat" : ledge.type === "rest" ? "rest-route-beat" : "anchor-route-beat"
      }));
    }
  };
}

export function createTraversalReadabilityRendererHandoffKit() {
  return {
    id: "traversal-readability-renderer-handoff-kit",
    describe(groups = {}) {
      const descriptors = Object.values(groups).flatMap((group) => Array.isArray(group) ? group : []);
      return {
        id: "traversal-readability-renderer-handoff",
        kind: "renderer-handoff",
        descriptorCount: descriptors.length,
        buckets: Object.fromEntries(Object.entries(groups).map(([key, value]) => [key, Array.isArray(value) ? value.length : 0])),
        descriptors: descriptors.map(clone),
        rendererContract: "renderer consumes descriptors only; traversal readability kits own no Three.js, DOM, browser input, audio, asset loading, or frame loop"
      };
    }
  };
}

export function createNextLedgeTraversalReadabilityDomainKit(options = {}) {
  const swingArc = createSwingArcForecastKit(options.swingArc);
  const anchorConfidence = createAnchorConfidenceFieldKit(options.anchorConfidence);
  const staminaRisk = createStaminaRiskBandKit(options.staminaRisk);
  const recoveryVectors = createRecoveryVectorKit(options.recoveryVectors);
  const momentumWindows = createMomentumWindowKit(options.momentumWindows);
  const summitBeats = createSummitRouteBeatKit(options.summitBeats);
  const rendererHandoff = createTraversalReadabilityRendererHandoffKit();
  return {
    id: "next-ledge-traversal-readability-domain-kit",
    describe(snapshot = {}, cargoSnapshot = null) {
      const groups = {
        swingArcs: swingArc.describe(snapshot),
        anchorConfidenceFields: anchorConfidence.describe(snapshot),
        staminaRiskBands: staminaRisk.describe(snapshot, cargoSnapshot),
        recoveryVectors: recoveryVectors.describe(snapshot),
        momentumWindows: momentumWindows.describe(snapshot),
        summitRouteBeats: summitBeats.describe(snapshot)
      };
      return {
        version: "next-ledge-traversal-readability-domain-0.1.0",
        kitTree: NEXT_LEDGE_TRAVERSAL_READABILITY_TREE,
        ...groups,
        rendererHandoff: rendererHandoff.describe(groups)
      };
    }
  };
}

export default createNextLedgeTraversalReadabilityDomainKit;

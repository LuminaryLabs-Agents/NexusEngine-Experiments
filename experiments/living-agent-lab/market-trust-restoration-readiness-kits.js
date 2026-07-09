const FORBIDDEN_OWNERSHIP = Object.freeze([
  "renderer",
  "dom",
  "browser-input",
  "threejs",
  "webgl",
  "audio",
  "asset-loading",
  "frame-loop"
]);

export const LIVING_AGENT_MARKET_TRUST_RESTORATION_DOMAIN_TREE = `living-agent-market-trust-restoration-domain
├─ trust-observation-domain
│  ├─ witness-trail-domain
│  │  └─ living-agent-witness-trail-kit
│  └─ evidence-stall-domain
│     └─ living-agent-evidence-stall-kit
├─ restitution-path-domain
│  ├─ return-route-domain
│  │  └─ living-agent-restitution-route-kit
│  └─ gate-permit-domain
│     └─ living-agent-guard-permit-kit
├─ civic-handoff-domain
│  ├─ crowd-calm-domain
│  │  └─ living-agent-crowd-calm-kit
│  └─ mediator-oath-domain
│     └─ living-agent-mediator-oath-kit
└─ renderer-handoff
   └─ living-agent-market-trust-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export const LIVING_AGENT_MARKET_TRUST_KITS = Object.freeze([
  "living-agent-witness-trail-kit",
  "living-agent-evidence-stall-kit",
  "living-agent-restitution-route-kit",
  "living-agent-guard-permit-kit",
  "living-agent-crowd-calm-kit",
  "living-agent-mediator-oath-kit",
  "living-agent-market-trust-renderer-handoff-kit",
  "living-agent-market-trust-restoration-domain-kit"
]);

function clamp(value, min = 0, max = 1) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.max(min, Math.min(max, number));
}

function point(entity, fallbackX, fallbackY) {
  return {
    x: Number.isFinite(Number(entity?.x)) ? Number(entity.x) : fallbackX,
    y: Number.isFinite(Number(entity?.y)) ? Number(entity.y) : fallbackY
  };
}

function facts(world) {
  return Array.isArray(world?.facts) ? world.facts.map((fact) => String(fact)) : [];
}

function hasFact(world, pattern) {
  return facts(world).some((fact) => pattern.test(fact));
}

function trustScore(world) {
  let score = 0.56;
  if (world?.apple?.stolen) score -= 0.35;
  if (world?.guard?.mood === "suspicious") score -= 0.12;
  if (world?.guard?.mood === "alert") score -= 0.06;
  if (world?.merchant?.mood === "nervous") score -= 0.05;
  if (hasFact(world, /returned apple/i)) score += 0.22;
  if (hasFact(world, /questioned merchant/i)) score += 0.08;
  if (hasFact(world, /warned player/i)) score += 0.04;
  if (world?.gate?.locked === false) score += 0.18;
  return clamp(score);
}

function restorationPhase(world) {
  if (world?.apple?.stolen) return "breach";
  if (world?.gate?.locked === false && trustScore(world) >= 0.72) return "restored";
  if (hasFact(world, /returned apple/i) || hasFact(world, /questioned merchant/i)) return "repairing";
  return "watching";
}

function lastChoiceLabel(world) {
  return String(world?.lastChoice?.label ?? "none");
}

export function createLivingAgentWitnessTrailKit() {
  return {
    id: "living-agent-witness-trail-kit",
    describe(input = {}) {
      const world = input.world ?? input;
      const guard = point(world.guard, 480, 250);
      const merchant = point(world.merchant, 300, 230);
      const player = point(world.player, 170, 300);
      const stolen = Boolean(world.apple?.stolen);
      return [
        {
          id: "witness-guard",
          kind: "witness-trail",
          label: stolen ? "guard saw the missing apple" : "guard has a clean sightline",
          from: guard,
          to: player,
          urgency: clamp(stolen ? 0.88 : 0.34),
          testimonyWeight: stolen ? 0.82 : 0.48
        },
        {
          id: "witness-merchant",
          kind: "witness-trail",
          label: world.merchant?.mood === "nervous" ? "merchant needs reassurance" : "merchant can corroborate",
          from: merchant,
          to: player,
          urgency: clamp(world.merchant?.mood === "nervous" ? 0.66 : 0.28),
          testimonyWeight: hasFact(world, /questioned merchant/i) ? 0.76 : 0.42
        }
      ];
    }
  };
}

export function createLivingAgentEvidenceStallKit() {
  return {
    id: "living-agent-evidence-stall-kit",
    describe(input = {}) {
      const world = input.world ?? input;
      const apple = point(world.apple, 310, 330);
      const stolen = Boolean(world.apple?.stolen);
      return [
        {
          id: "evidence-apple-stall",
          kind: "evidence-stall",
          label: stolen ? "empty apple stall" : "apple accounted for",
          x: apple.x,
          y: apple.y,
          evidenceState: stolen ? "missing" : "present",
          clarity: stolen ? 0.86 : 0.62
        },
        {
          id: "evidence-fact-ledger",
          kind: "evidence-stall",
          label: `${facts(world).slice(0, 3).join(" · ") || "quiet market"}`,
          x: apple.x + 42,
          y: apple.y - 34,
          evidenceState: hasFact(world, /returned apple/i) ? "reconciled" : "open",
          clarity: clamp(0.36 + facts(world).length * 0.08)
        }
      ];
    }
  };
}

export function createLivingAgentRestitutionRouteKit() {
  return {
    id: "living-agent-restitution-route-kit",
    describe(input = {}) {
      const world = input.world ?? input;
      const player = point(world.player, 170, 300);
      const apple = point(world.apple, 310, 330);
      const merchant = point(world.merchant, 300, 230);
      const returned = hasFact(world, /returned apple/i);
      return [
        {
          id: "route-player-apple",
          kind: "restitution-route",
          label: returned ? "return path completed" : "return apple to stall",
          points: [player, apple, merchant],
          routeState: returned ? "complete" : world.apple?.stolen ? "urgent" : "available",
          pressure: clamp(world.apple?.stolen ? 0.92 : 0.32)
        }
      ];
    }
  };
}

export function createLivingAgentGuardPermitKit() {
  return {
    id: "living-agent-guard-permit-kit",
    describe(input = {}) {
      const world = input.world ?? input;
      const gate = point(world.gate, 650, 290);
      const guard = point(world.guard, 480, 250);
      const score = trustScore(world);
      return [
        {
          id: "permit-gate",
          kind: "guard-permit",
          label: world.gate?.locked === false ? "gate permit issued" : "gate permit pending",
          x: gate.x,
          y: gate.y,
          issued: world.gate?.locked === false,
          requiredTrust: 0.72,
          currentTrust: score
        },
        {
          id: "permit-guard-review",
          kind: "guard-permit",
          label: score >= 0.72 ? "guard can unlock route" : "guard needs more proof",
          x: guard.x,
          y: guard.y - 48,
          issued: score >= 0.72,
          requiredTrust: 0.72,
          currentTrust: score
        }
      ];
    }
  };
}

export function createLivingAgentCrowdCalmKit() {
  return {
    id: "living-agent-crowd-calm-kit",
    describe(input = {}) {
      const world = input.world ?? input;
      const score = trustScore(world);
      const phase = restorationPhase(world);
      return [
        {
          id: "crowd-square-calm",
          kind: "crowd-calm-ring",
          label: phase === "breach" ? "crowd tension rising" : phase === "restored" ? "market trust restored" : "market watching",
          x: 330,
          y: 285,
          radius: 92,
          calm: score,
          pulse: clamp(1 - score + (world.apple?.stolen ? 0.2 : 0))
        }
      ];
    }
  };
}

export function createLivingAgentMediatorOathKit() {
  return {
    id: "living-agent-mediator-oath-kit",
    describe(input = {}) {
      const world = input.world ?? input;
      const choice = lastChoiceLabel(world);
      const phase = restorationPhase(world);
      return [
        {
          id: "mediator-oath-current",
          kind: "mediator-oath",
          label: phase === "restored" ? "oath sealed" : "oath still forming",
          x: 410,
          y: 170,
          oathState: phase === "restored" ? "sealed" : choice === "accuse player" ? "contested" : "draft",
          latestAction: choice,
          trustScore: trustScore(world)
        }
      ];
    }
  };
}

export function createLivingAgentMarketTrustRendererHandoffKit(kits = {}) {
  const witnessTrailKit = kits.witnessTrailKit ?? createLivingAgentWitnessTrailKit();
  const evidenceStallKit = kits.evidenceStallKit ?? createLivingAgentEvidenceStallKit();
  const restitutionRouteKit = kits.restitutionRouteKit ?? createLivingAgentRestitutionRouteKit();
  const guardPermitKit = kits.guardPermitKit ?? createLivingAgentGuardPermitKit();
  const crowdCalmKit = kits.crowdCalmKit ?? createLivingAgentCrowdCalmKit();
  const mediatorOathKit = kits.mediatorOathKit ?? createLivingAgentMediatorOathKit();

  return {
    id: "living-agent-market-trust-renderer-handoff-kit",
    describe(input = {}) {
      const descriptors = {
        witnessTrails: witnessTrailKit.describe(input),
        evidenceStalls: evidenceStallKit.describe(input),
        restitutionRoutes: restitutionRouteKit.describe(input),
        guardPermits: guardPermitKit.describe(input),
        crowdCalmRings: crowdCalmKit.describe(input),
        mediatorOaths: mediatorOathKit.describe(input)
      };
      const total = Object.values(descriptors).reduce((sum, bucket) => sum + bucket.length, 0);
      return {
        id: "living-agent-market-trust-renderer-handoff",
        rendererConsumesDescriptorsOnly: true,
        descriptors,
        counts: {
          witnessTrails: descriptors.witnessTrails.length,
          evidenceStalls: descriptors.evidenceStalls.length,
          restitutionRoutes: descriptors.restitutionRoutes.length,
          guardPermits: descriptors.guardPermits.length,
          crowdCalmRings: descriptors.crowdCalmRings.length,
          mediatorOaths: descriptors.mediatorOaths.length,
          total
        }
      };
    }
  };
}

export function createLivingAgentMarketTrustRestorationReadinessDomainKit(options = {}) {
  const handoffKit = options.rendererHandoffKit ?? createLivingAgentMarketTrustRendererHandoffKit(options);
  return {
    id: "living-agent-market-trust-restoration-domain-kit",
    tree: LIVING_AGENT_MARKET_TRUST_RESTORATION_DOMAIN_TREE,
    kits: LIVING_AGENT_MARKET_TRUST_KITS,
    forbiddenOwnership: FORBIDDEN_OWNERSHIP,
    describe(input = {}) {
      const world = input.world ?? input;
      const score = trustScore(world);
      const phase = restorationPhase(world);
      const rendererHandoff = handoffKit.describe({ ...input, world });
      const blockers = [];
      if (world.apple?.stolen) blockers.push("apple-still-missing");
      if (world.merchant?.mood === "nervous") blockers.push("merchant-needs-reassurance");
      if (world.gate?.locked !== false) blockers.push("gate-permit-not-issued");
      return {
        id: "living-agent-market-trust-restoration-readiness",
        phase,
        trustScore: score,
        missionState: phase === "restored" ? "ready" : phase === "breach" ? "at-risk" : "recovering",
        blockers,
        recommendedAction: world.apple?.stolen ? "return apple" : score >= 0.72 && world.gate?.locked !== false ? "unlock gate" : "ask agent",
        rendererHandoff,
        sourceBoundary: {
          reusableLogicOwns: ["market trust scoring", "descriptor composition", "state-derived readiness"],
          forbiddenOwnership: FORBIDDEN_OWNERSHIP
        }
      };
    }
  };
}

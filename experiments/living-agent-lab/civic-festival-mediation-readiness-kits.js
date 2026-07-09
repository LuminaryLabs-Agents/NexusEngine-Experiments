const FORBIDDEN_OWNERSHIP = Object.freeze([
  "renderer",
  "dom",
  "browser-input",
  "threejs",
  "webgl",
  "audio",
  "asset-loading",
  "frame-loop",
  "model-inference",
  "storage"
]);

export const LIVING_AGENT_CIVIC_FESTIVAL_MEDIATION_DOMAIN_TREE = `living-agent-civic-festival-mediation-readiness-domain
├─ permit-prep-domain
│  ├─ permit-scroll-domain
│  │  └─ living-agent-permit-scroll-board-kit
│  └─ vendor-lane-domain
│     └─ living-agent-vendor-lane-marker-kit
├─ ceremony-routing-domain
│  ├─ lantern-route-domain
│  │  └─ living-agent-lantern-route-thread-kit
│  └─ dispute-hearing-domain
│     └─ living-agent-dispute-hearing-card-kit
├─ safety-handoff-domain
│  ├─ steward-post-domain
│  │  └─ living-agent-safety-steward-post-kit
│  └─ night-market-ledger-domain
│     └─ living-agent-night-market-ledger-kit
└─ renderer-handoff
   └─ living-agent-civic-festival-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export const LIVING_AGENT_CIVIC_FESTIVAL_MEDIATION_KITS = Object.freeze([
  "living-agent-permit-scroll-board-kit",
  "living-agent-vendor-lane-marker-kit",
  "living-agent-lantern-route-thread-kit",
  "living-agent-dispute-hearing-card-kit",
  "living-agent-safety-steward-post-kit",
  "living-agent-night-market-ledger-kit",
  "living-agent-civic-festival-renderer-handoff-kit",
  "living-agent-civic-festival-mediation-domain-kit"
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

function textList(value) {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

function facts(world) {
  return textList(world?.facts);
}

function hasFact(world, pattern) {
  return facts(world).some((fact) => pattern.test(fact));
}

function normFestival(input = {}) {
  const festival = input.festival ?? input.world?.festival ?? {};
  return {
    permitFiled: Boolean(festival.permitFiled),
    vendorLaneCleared: Boolean(festival.vendorLaneCleared),
    lanternsLit: Math.max(0, Math.min(12, Math.floor(Number(festival.lanternsLit) || 0))),
    stewardPosts: Math.max(0, Math.min(8, Math.floor(Number(festival.stewardPosts) || 0))),
    mediatorBriefings: Math.max(0, Math.min(8, Math.floor(Number(festival.mediatorBriefings) || 0))),
    routeSeed: Math.max(0, Math.floor(Number(festival.routeSeed) || 0)),
    note: String(festival.note ?? "festival mediation pending")
  };
}

function festivalReadiness(world, festival) {
  let score = 0.16;
  if (festival.permitFiled) score += 0.16;
  if (festival.vendorLaneCleared) score += 0.14;
  score += clamp(festival.lanternsLit / 8) * 0.18;
  score += clamp(festival.stewardPosts / 5) * 0.15;
  score += clamp(festival.mediatorBriefings / 4) * 0.12;
  if (world?.apple?.stolen) score -= 0.18;
  if (world?.merchant?.mood === "nervous") score -= 0.08;
  if (world?.guard?.mood === "suspicious") score -= 0.08;
  if (world?.gate?.locked === false) score += 0.12;
  if (hasFact(world, /returned apple/i)) score += 0.08;
  if (hasFact(world, /questioned merchant/i)) score += 0.05;
  return clamp(score);
}

function festivalPhase(world, festival) {
  const score = festivalReadiness(world, festival);
  if (world?.apple?.stolen || world?.guard?.mood === "suspicious") return "dispute";
  if (score >= 0.78 && world?.gate?.locked === false) return "open";
  if (festival.permitFiled && festival.vendorLaneCleared && festival.lanternsLit >= 4) return "staging";
  if (festival.permitFiled || festival.vendorLaneCleared || festival.lanternsLit > 0) return "preparing";
  return "planning";
}

function seededJitter(seed, index, span) {
  const value = Math.sin((seed + 1) * 97.3 + index * 41.7) * 10000;
  return (value - Math.floor(value) - 0.5) * span;
}

export function createLivingAgentPermitScrollBoardKit() {
  return {
    id: "living-agent-permit-scroll-board-kit",
    describe(input = {}) {
      const world = input.world ?? input;
      const festival = normFestival(input);
      const gate = point(world.gate, 650, 290);
      const guard = point(world.guard, 480, 250);
      const ready = festivalReadiness(world, festival);
      return [
        {
          id: "festival-permit-scroll",
          kind: "festival-permit-scroll",
          label: festival.permitFiled ? "festival permit filed" : "festival permit needs filing",
          x: guard.x + 58,
          y: guard.y - 74,
          filed: festival.permitFiled,
          civicWeight: clamp(0.36 + ready * 0.48)
        },
        {
          id: "festival-gate-permit-review",
          kind: "festival-permit-scroll",
          label: world.gate?.locked === false ? "gate route approved" : "gate review pending",
          x: gate.x,
          y: gate.y - 56,
          filed: world.gate?.locked === false,
          civicWeight: clamp(world.gate?.locked === false ? 0.88 : ready)
        }
      ];
    }
  };
}

export function createLivingAgentVendorLaneMarkerKit() {
  return {
    id: "living-agent-vendor-lane-marker-kit",
    describe(input = {}) {
      const world = input.world ?? input;
      const festival = normFestival(input);
      const merchant = point(world.merchant, 300, 230);
      const seed = festival.routeSeed + facts(world).length * 3;
      return Array.from({ length: 4 }, (_, index) => ({
        id: `vendor-lane-${index + 1}`,
        kind: "vendor-lane-marker",
        label: festival.vendorLaneCleared ? `vendor stall ${index + 1} cleared` : `vendor stall ${index + 1} blocked`,
        x: merchant.x - 90 + index * 58 + seededJitter(seed, index, 16),
        y: merchant.y + 82 + seededJitter(seed, index + 11, 18),
        laneState: festival.vendorLaneCleared ? "clear" : world.apple?.stolen ? "contested" : "crowded",
        crowding: clamp(festival.vendorLaneCleared ? 0.18 : 0.68 + (world.apple?.stolen ? 0.18 : 0))
      }));
    }
  };
}

export function createLivingAgentLanternRouteThreadKit() {
  return {
    id: "living-agent-lantern-route-thread-kit",
    describe(input = {}) {
      const world = input.world ?? input;
      const festival = normFestival(input);
      const player = point(world.player, 170, 300);
      const merchant = point(world.merchant, 300, 230);
      const guard = point(world.guard, 480, 250);
      const gate = point(world.gate, 650, 290);
      const lanternRatio = clamp(festival.lanternsLit / 8);
      return [
        {
          id: "lantern-route-main",
          kind: "lantern-route-thread",
          label: lanternRatio >= 0.75 ? "lantern route fully visible" : "lantern route needs more light",
          points: [player, merchant, guard, gate],
          lanternsLit: festival.lanternsLit,
          visibility: clamp(0.22 + lanternRatio * 0.74)
        },
        {
          id: "lantern-route-side-stall",
          kind: "lantern-route-thread",
          label: festival.vendorLaneCleared ? "side lane safe" : "side lane still crowded",
          points: [merchant, { x: merchant.x + 128, y: merchant.y + 112 }, gate],
          lanternsLit: Math.max(0, festival.lanternsLit - 2),
          visibility: clamp(0.14 + lanternRatio * 0.52 - (festival.vendorLaneCleared ? 0 : 0.12))
        }
      ];
    }
  };
}

export function createLivingAgentDisputeHearingCardKit() {
  return {
    id: "living-agent-dispute-hearing-card-kit",
    describe(input = {}) {
      const world = input.world ?? input;
      const festival = normFestival(input);
      const guard = point(world.guard, 480, 250);
      const merchant = point(world.merchant, 300, 230);
      const disputeOpen = Boolean(world.apple?.stolen || world.guard?.mood === "suspicious" || world.merchant?.mood === "nervous");
      return [
        {
          id: "dispute-hearing-current",
          kind: "dispute-hearing-card",
          label: disputeOpen ? "festival dispute hearing open" : "festival hearing clear",
          x: (guard.x + merchant.x) / 2,
          y: Math.min(guard.y, merchant.y) - 104,
          hearingState: disputeOpen ? "open" : festival.mediatorBriefings >= 2 ? "briefed" : "quiet",
          urgency: clamp(disputeOpen ? 0.82 : 0.24 - festival.mediatorBriefings * 0.03),
          mediatorBriefings: festival.mediatorBriefings
        }
      ];
    }
  };
}

export function createLivingAgentSafetyStewardPostKit() {
  return {
    id: "living-agent-safety-steward-post-kit",
    describe(input = {}) {
      const world = input.world ?? input;
      const festival = normFestival(input);
      const seed = festival.routeSeed + festival.stewardPosts * 5;
      const anchors = [
        point(world.player, 170, 300),
        point(world.guard, 480, 250),
        point(world.merchant, 300, 230),
        point(world.gate, 650, 290)
      ];
      return anchors.map((anchor, index) => ({
        id: `safety-steward-post-${index + 1}`,
        kind: "safety-steward-post",
        label: index < festival.stewardPosts ? "steward assigned" : "steward post empty",
        x: anchor.x + seededJitter(seed, index, 22),
        y: anchor.y + 62 + seededJitter(seed, index + 17, 18),
        assigned: index < festival.stewardPosts,
        coverage: clamp(index < festival.stewardPosts ? 0.72 + festivalReadiness(world, festival) * 0.18 : 0.18)
      }));
    }
  };
}

export function createLivingAgentNightMarketLedgerKit() {
  return {
    id: "living-agent-night-market-ledger-kit",
    describe(input = {}) {
      const world = input.world ?? input;
      const festival = normFestival(input);
      const score = festivalReadiness(world, festival);
      const phase = festivalPhase(world, festival);
      return [
        {
          id: "night-market-ledger-current",
          kind: "night-market-ledger",
          label: phase === "open" ? "night market can open" : `night market ${phase}`,
          x: 410,
          y: 148,
          readiness: score,
          phase,
          blockers: [
            !festival.permitFiled ? "permit-not-filed" : null,
            !festival.vendorLaneCleared ? "vendor-lane-crowded" : null,
            festival.lanternsLit < 4 ? "lantern-route-dim" : null,
            festival.stewardPosts < 3 ? "stewards-missing" : null,
            world.apple?.stolen ? "apple-dispute-open" : null,
            world.gate?.locked !== false ? "gate-route-closed" : null
          ].filter(Boolean)
        }
      ];
    }
  };
}

export function createLivingAgentCivicFestivalRendererHandoffKit(kits = {}) {
  const permitScrollBoardKit = kits.permitScrollBoardKit ?? createLivingAgentPermitScrollBoardKit();
  const vendorLaneMarkerKit = kits.vendorLaneMarkerKit ?? createLivingAgentVendorLaneMarkerKit();
  const lanternRouteThreadKit = kits.lanternRouteThreadKit ?? createLivingAgentLanternRouteThreadKit();
  const disputeHearingCardKit = kits.disputeHearingCardKit ?? createLivingAgentDisputeHearingCardKit();
  const safetyStewardPostKit = kits.safetyStewardPostKit ?? createLivingAgentSafetyStewardPostKit();
  const nightMarketLedgerKit = kits.nightMarketLedgerKit ?? createLivingAgentNightMarketLedgerKit();

  return {
    id: "living-agent-civic-festival-renderer-handoff-kit",
    describe(input = {}) {
      const descriptors = {
        permitScrolls: permitScrollBoardKit.describe(input),
        vendorLaneMarkers: vendorLaneMarkerKit.describe(input),
        lanternRouteThreads: lanternRouteThreadKit.describe(input),
        disputeHearingCards: disputeHearingCardKit.describe(input),
        safetyStewardPosts: safetyStewardPostKit.describe(input),
        nightMarketLedgers: nightMarketLedgerKit.describe(input)
      };
      const total = Object.values(descriptors).reduce((sum, bucket) => sum + bucket.length, 0);
      return {
        id: "living-agent-civic-festival-renderer-handoff",
        rendererConsumesDescriptorsOnly: true,
        descriptors,
        counts: {
          permitScrolls: descriptors.permitScrolls.length,
          vendorLaneMarkers: descriptors.vendorLaneMarkers.length,
          lanternRouteThreads: descriptors.lanternRouteThreads.length,
          disputeHearingCards: descriptors.disputeHearingCards.length,
          safetyStewardPosts: descriptors.safetyStewardPosts.length,
          nightMarketLedgers: descriptors.nightMarketLedgers.length,
          total
        }
      };
    }
  };
}

export function createLivingAgentCivicFestivalMediationReadinessDomainKit(options = {}) {
  const handoffKit = options.rendererHandoffKit ?? createLivingAgentCivicFestivalRendererHandoffKit(options);
  return {
    id: "living-agent-civic-festival-mediation-domain-kit",
    tree: LIVING_AGENT_CIVIC_FESTIVAL_MEDIATION_DOMAIN_TREE,
    kits: LIVING_AGENT_CIVIC_FESTIVAL_MEDIATION_KITS,
    forbiddenOwnership: FORBIDDEN_OWNERSHIP,
    describe(input = {}) {
      const world = input.world ?? input;
      const festival = normFestival({ ...input, world });
      const score = festivalReadiness(world, festival);
      const phase = festivalPhase(world, festival);
      const rendererHandoff = handoffKit.describe({ ...input, world, festival });
      const blockers = [];
      if (!festival.permitFiled) blockers.push("permit-not-filed");
      if (!festival.vendorLaneCleared) blockers.push("vendor-lane-crowded");
      if (festival.lanternsLit < 4) blockers.push("lantern-route-dim");
      if (festival.stewardPosts < 3) blockers.push("stewards-missing");
      if (world.apple?.stolen) blockers.push("apple-dispute-open");
      if (world.gate?.locked !== false) blockers.push("gate-route-closed");
      return {
        id: "living-agent-civic-festival-mediation-readiness",
        phase,
        festivalReadiness: score,
        missionState: phase === "open" ? "ready" : phase === "dispute" ? "at-risk" : "staging",
        blockers,
        recommendedAction: blockers[0] ? `resolve ${blockers[0]}` : "open night market",
        festival,
        rendererHandoff,
        sourceBoundary: {
          reusableLogicOwns: ["festival mediation scoring", "descriptor composition", "state-derived civic readiness"],
          forbiddenOwnership: FORBIDDEN_OWNERSHIP
        }
      };
    }
  };
}

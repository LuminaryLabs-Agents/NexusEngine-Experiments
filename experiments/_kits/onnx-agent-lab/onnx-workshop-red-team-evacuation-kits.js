export const NEXUS_ENGINE_MAIN_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";

export const ONNX_WORKSHOP_RED_TEAM_EVACUATION_DOMAIN = Object.freeze({
  id: "onnx-workshop-red-team-evacuation-readiness-domain",
  tree: `onnx-workshop-red-team-evacuation-readiness-domain
├─ adversarial-signal-domain
│  ├─ canary-prompt-domain
│  │  └─ onnx-red-team-canary-prompt-strip-kit
│  └─ sandbox-gate-domain
│     └─ onnx-red-team-sandbox-gate-lock-kit
├─ evidence-recovery-domain
│  ├─ evidence-chain-domain
│  │  └─ onnx-red-team-evidence-chain-tag-kit
│  └─ rollback-route-domain
│     └─ rollback-branch-domain
│        └─ onnx-red-team-rollback-branch-route-kit
├─ operator-evacuation-domain
│  ├─ operator-card-domain
│  │  └─ onnx-red-team-operator-evacuation-card-kit
│  └─ dawn-drill-ledger-domain
│     └─ onnx-red-team-dawn-drill-ledger-kit
└─ renderer-handoff
   └─ onnx-red-team-evacuation-renderer-handoff-kit
      └─ renderer consumes descriptors only`,
  ownershipExclusions: Object.freeze([
    "renderer",
    "DOM",
    "browser input",
    "Three.js",
    "WebGL",
    "audio",
    "asset loading",
    "ONNX runtime loading",
    "model inference",
    "storage",
    "navigation",
    "network",
    "frame-loop ownership"
  ])
});

export const ONNX_WORKSHOP_RED_TEAM_EVACUATION_KITS = Object.freeze([
  "onnx-red-team-canary-prompt-strip-kit",
  "onnx-red-team-sandbox-gate-lock-kit",
  "onnx-red-team-evidence-chain-tag-kit",
  "onnx-red-team-rollback-branch-route-kit",
  "onnx-red-team-operator-evacuation-card-kit",
  "onnx-red-team-dawn-drill-ledger-kit",
  "onnx-red-team-evacuation-renderer-handoff-kit"
]);

const clampNumber = (value, min, max) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));
const clamp01 = (value) => clampNumber(value, 0, 1);
const round = (value, digits = 3) => Number(clampNumber(value, -999999, 999999).toFixed(digits));
const idSafe = (value) => String(value ?? "red-team").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "red-team";

export function normalizeRedTeamEvacuationInput(input = {}) {
  const canaryCount = Math.trunc(clampNumber(input.canaryCount ?? input.canaries ?? 5, 0, 40));
  const passedCanaries = Math.trunc(clampNumber(input.passedCanaries ?? input.passed ?? 0, 0, Math.max(0, canaryCount)));
  const blockedPrompts = Math.trunc(clampNumber(input.blockedPrompts ?? input.blocked ?? Math.max(0, canaryCount - passedCanaries), 0, 60));
  const routedIncidents = Math.trunc(clampNumber(input.routedIncidents ?? input.routed ?? 0, 0, 60));
  const sandboxIntegrity = clamp01(input.sandboxIntegrity ?? input.sandbox ?? 0.42);
  const evidenceCoverage = clamp01(input.evidenceCoverage ?? input.evidence ?? 0.33);
  const rollbackCoverage = clamp01(input.rollbackCoverage ?? input.rollback ?? 0.38);
  const operatorFatigue = clamp01(input.operatorFatigue ?? input.fatigue ?? 0.64);
  const modelLoaded = Boolean(input.modelLoaded ?? input.loaded ?? false);
  const drillArmed = Boolean(input.drillArmed ?? input.armed ?? false);
  const selectedAction = idSafe(input.selectedAction ?? input.action ?? "observe");
  const seed = Math.abs(Math.trunc(Number(input.seed ?? 73))) % 997;
  return { canaryCount, passedCanaries, blockedPrompts, routedIncidents, sandboxIntegrity, evidenceCoverage, rollbackCoverage, operatorFatigue, modelLoaded, drillArmed, selectedAction, seed };
}

export function createRedTeamCanaryPromptStrips(input = {}) {
  const state = normalizeRedTeamEvacuationInput(input);
  const count = Math.max(4, Math.min(10, state.canaryCount + 2));
  return Array.from({ length: count }, (_, index) => {
    const passed = index < state.passedCanaries;
    const volatility = clamp01((1 - state.sandboxIntegrity) * 0.42 + (index % 4) * 0.11 + state.operatorFatigue * 0.18);
    return {
      id: `canary-prompt-strip-${state.seed}-${index}`,
      kit: "onnx-red-team-canary-prompt-strip-kit",
      descriptorKind: "red-team-canary-prompt-strip",
      label: passed ? `Passed canary ${index + 1}` : `Unresolved canary ${index + 1}`,
      lane: ["policy", "tool", "memory", "runtime", "handoff"][index % 5],
      passed,
      volatility: round(volatility),
      x: round(8 + ((index * 17 + state.seed) % 78)),
      y: round(14 + ((index * 23 + state.seed) % 62)),
      pulse: round(0.5 + volatility * 1.7)
    };
  });
}

export function createRedTeamSandboxGateLocks(input = {}) {
  const state = normalizeRedTeamEvacuationInput(input);
  const gates = ["prompt boundary", "tool allowlist", "memory quarantine", "egress filter", "operator review"];
  return gates.map((gate, index) => {
    const integrity = clamp01(state.sandboxIntegrity * 0.7 + index * 0.04 + (state.drillArmed ? 0.08 : 0));
    return {
      id: `sandbox-gate-${idSafe(gate)}`,
      kit: "onnx-red-team-sandbox-gate-lock-kit",
      descriptorKind: "red-team-sandbox-gate-lock",
      label: gate,
      integrity: round(integrity),
      locked: integrity > 0.58,
      riskState: integrity > 0.76 ? "sealed" : integrity > 0.48 ? "watch" : "open",
      x: round(15 + index * 17),
      y: round(72 - integrity * 36)
    };
  });
}

export function createRedTeamEvidenceChainTags(input = {}) {
  const state = normalizeRedTeamEvacuationInput(input);
  const count = Math.max(3, Math.min(8, 3 + Math.ceil(state.evidenceCoverage * 5)));
  return Array.from({ length: count }, (_, index) => {
    const coverage = clamp01(state.evidenceCoverage * 0.74 + index * 0.045 + (state.modelLoaded ? 0.09 : 0));
    return {
      id: `evidence-chain-tag-${state.seed}-${index}`,
      kit: "onnx-red-team-evidence-chain-tag-kit",
      descriptorKind: "red-team-evidence-chain-tag",
      label: ["prompt transcript", "tool trace", "model logits", "fallback note", "operator note", "state snapshot", "postmortem clip", "diff marker"][index % 8],
      coverage: round(coverage),
      sealed: coverage > 0.7,
      x: round(12 + index * 10.3),
      y: round(24 + (1 - coverage) * 42)
    };
  });
}

export function createRedTeamRollbackBranchRoutes(input = {}) {
  const state = normalizeRedTeamEvacuationInput(input);
  const routes = ["last safe prompt", "fallback answer", "tool revoke", "memory scrub", "human review", "replay smoke"];
  return routes.map((route, index) => {
    const coverage = clamp01(state.rollbackCoverage * 0.68 + state.evidenceCoverage * 0.18 + (index % 2) * 0.05 + (state.drillArmed ? 0.08 : 0));
    return {
      id: `rollback-branch-${idSafe(route)}`,
      kit: "onnx-red-team-rollback-branch-route-kit",
      descriptorKind: "red-team-rollback-branch-route",
      label: route,
      coverage: round(coverage),
      routeState: coverage > 0.78 ? "rehearsed" : coverage > 0.5 ? "mapped" : "missing",
      x1: round(10 + index * 13),
      x2: round(18 + index * 13),
      y: round(42 + (index % 3) * 11)
    };
  });
}

export function createRedTeamOperatorEvacuationCards(input = {}) {
  const state = normalizeRedTeamEvacuationInput(input);
  const count = Math.max(3, Math.min(8, 3 + Math.ceil((1 - state.operatorFatigue) * 5) + Math.min(2, state.routedIncidents)));
  return Array.from({ length: count }, (_, index) => {
    const fatigueShare = clamp01(state.operatorFatigue * (0.9 - index * 0.055));
    return {
      id: `operator-evacuation-card-${state.seed}-${index}`,
      kit: "onnx-red-team-operator-evacuation-card-kit",
      descriptorKind: "red-team-operator-evacuation-card",
      label: `Operator evac card ${index + 1}`,
      fatigueShare: round(fatigueShare),
      handoffReady: fatigueShare < 0.68 && state.rollbackCoverage > 0.5,
      routedIncidentLane: index < state.routedIncidents,
      x: round(18 + index * 9.2),
      y: round(84 - fatigueShare * 28)
    };
  });
}

export function createRedTeamDawnDrillLedger(input = {}) {
  const state = normalizeRedTeamEvacuationInput(input);
  const passedRatio = state.passedCanaries / Math.max(1, state.canaryCount);
  const drillCompleteness = clamp01(passedRatio * 0.22 + state.sandboxIntegrity * 0.22 + state.evidenceCoverage * 0.2 + state.rollbackCoverage * 0.22 + (1 - state.operatorFatigue) * 0.08 + (state.drillArmed ? 0.06 : 0));
  return {
    id: `red-team-dawn-drill-ledger-${state.seed}`,
    kit: "onnx-red-team-dawn-drill-ledger-kit",
    descriptorKind: "red-team-dawn-drill-ledger",
    label: "Red-team evacuation drill ledger",
    drillCompleteness: round(drillCompleteness),
    passedCanaries: state.passedCanaries,
    blockedPrompts: state.blockedPrompts,
    routedIncidents: state.routedIncidents,
    selectedAction: state.selectedAction,
    signoffState: drillCompleteness > 0.84 ? "ready-for-red-team-postmortem" : drillCompleteness > 0.56 ? "needs-final-rehearsal" : "containment-drill-open"
  };
}

export function createOnnxRedTeamEvacuationRendererHandoff(input = {}) {
  const canaryPromptStrips = createRedTeamCanaryPromptStrips(input);
  const sandboxGateLocks = createRedTeamSandboxGateLocks(input);
  const evidenceChainTags = createRedTeamEvidenceChainTags(input);
  const rollbackBranchRoutes = createRedTeamRollbackBranchRoutes(input);
  const operatorEvacuationCards = createRedTeamOperatorEvacuationCards(input);
  const drillLedger = createRedTeamDawnDrillLedger(input);
  const flatDescriptors = [...canaryPromptStrips, ...sandboxGateLocks, ...evidenceChainTags, ...rollbackBranchRoutes, ...operatorEvacuationCards, drillLedger];
  return {
    passId: "onnx-workshop-red-team-evacuation-renderer-handoff-pass",
    descriptorOnly: true,
    descriptors: { canaryPromptStrips, sandboxGateLocks, evidenceChainTags, rollbackBranchRoutes, operatorEvacuationCards, drillLedger },
    flatDescriptors,
    counts: {
      canaryPromptStrips: canaryPromptStrips.length,
      sandboxGateLocks: sandboxGateLocks.length,
      evidenceChainTags: evidenceChainTags.length,
      rollbackBranchRoutes: rollbackBranchRoutes.length,
      operatorEvacuationCards: operatorEvacuationCards.length,
      drillLedgers: 1,
      total: flatDescriptors.length
    }
  };
}

export function createOnnxWorkshopRedTeamEvacuationReadiness(input = {}) {
  const state = normalizeRedTeamEvacuationInput(input);
  const rendererHandoff = createOnnxRedTeamEvacuationRendererHandoff(state);
  const passedRatio = state.passedCanaries / Math.max(1, state.canaryCount);
  const pressure = clamp01((state.blockedPrompts / Math.max(1, state.canaryCount + state.blockedPrompts + 1)) * 0.34 + (1 - state.sandboxIntegrity) * 0.26 + (1 - state.evidenceCoverage) * 0.16 + state.operatorFatigue * 0.24);
  const readinessScore = clamp01(
    passedRatio * 0.18 +
    state.sandboxIntegrity * 0.23 +
    state.evidenceCoverage * 0.2 +
    state.rollbackCoverage * 0.2 +
    (1 - state.operatorFatigue) * 0.09 +
    (state.modelLoaded ? 0.04 : 0) +
    (state.drillArmed ? 0.06 : 0)
  );
  const missionState = readinessScore > 0.84 ? "postmortem-ready" : pressure > 0.66 ? "containment-surge" : readinessScore > 0.58 ? "drill-stable" : "collect-red-team-evidence";
  const topPriority = pressure > 0.66 ? "reduce containment pressure" : state.sandboxIntegrity < 0.58 ? "lock sandbox gates" : state.evidenceCoverage < 0.58 ? "tag evidence chain" : state.rollbackCoverage < 0.62 ? "rehearse rollback route" : "close red-team drill ledger";
  return {
    domainId: ONNX_WORKSHOP_RED_TEAM_EVACUATION_DOMAIN.id,
    domainTree: ONNX_WORKSHOP_RED_TEAM_EVACUATION_DOMAIN.tree,
    kits: ONNX_WORKSHOP_RED_TEAM_EVACUATION_KITS,
    ownershipExclusions: ONNX_WORKSHOP_RED_TEAM_EVACUATION_DOMAIN.ownershipExclusions,
    input: state,
    summary: { readinessScore: round(readinessScore), pressure: round(pressure), missionState, topPriority, descriptorCount: rendererHandoff.counts.total },
    rendererHandoff
  };
}

export function createOnnxWorkshopRedTeamEvacuationDomainKit(options = {}) {
  const seed = options.seed ?? 73;
  return {
    id: ONNX_WORKSHOP_RED_TEAM_EVACUATION_DOMAIN.id,
    domainTree: ONNX_WORKSHOP_RED_TEAM_EVACUATION_DOMAIN.tree,
    kits: ONNX_WORKSHOP_RED_TEAM_EVACUATION_KITS,
    ownershipExclusions: ONNX_WORKSHOP_RED_TEAM_EVACUATION_DOMAIN.ownershipExclusions,
    compose(input = {}) {
      return createOnnxWorkshopRedTeamEvacuationReadiness({ seed, ...input });
    }
  };
}

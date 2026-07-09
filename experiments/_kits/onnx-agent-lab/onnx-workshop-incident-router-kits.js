export const NEXUS_ENGINE_MAIN_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";

export const ONNX_WORKSHOP_INCIDENT_ROUTER_DOMAIN = Object.freeze({
  id: "onnx-workshop-incident-router-readiness-domain",
  tree: `onnx-workshop-incident-router-readiness-domain
├─ signal-intake-domain
│  ├─ alert-beacon-domain
│  │  └─ onnx-incident-alert-beacon-kit
│  └─ trace-sampler-domain
│     └─ onnx-incident-trace-sampler-kit
├─ diagnosis-routing-domain
│  ├─ classifier-lane-domain
│  │  └─ onnx-incident-classifier-lane-kit
│  └─ fallback-brief-domain
│     └─ fallback-playbook-domain
│        └─ onnx-incident-fallback-brief-kit
├─ resolution-handoff-domain
│  ├─ operator-shift-domain
│  │  └─ onnx-incident-operator-shift-kit
│  └─ audit-ledger-domain
│     └─ onnx-incident-audit-ledger-kit
└─ renderer-handoff
   └─ onnx-incident-router-renderer-handoff-kit
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

export const ONNX_WORKSHOP_INCIDENT_ROUTER_KITS = Object.freeze([
  "onnx-incident-alert-beacon-kit",
  "onnx-incident-trace-sampler-kit",
  "onnx-incident-classifier-lane-kit",
  "onnx-incident-fallback-brief-kit",
  "onnx-incident-operator-shift-kit",
  "onnx-incident-audit-ledger-kit",
  "onnx-incident-router-renderer-handoff-kit"
]);

const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(Number(value)) ? Number(value) : 0));
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));
const round = (value, digits = 3) => Number(clamp(value, -999999, 999999).toFixed(digits));
const idSafe = (value) => String(value ?? "signal").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "signal";

export function normalizeIncidentRouterInput(input = {}) {
  const alertCount = Math.trunc(clamp(input.alertCount ?? input.alerts ?? input.pendingAlerts ?? 4, 0, 48));
  const unresolved = Math.trunc(clamp(input.unresolved ?? input.openIncidents ?? Math.ceil(alertCount * 0.55), 0, 48));
  const ackedIncidents = Math.trunc(clamp(input.ackedIncidents ?? input.acked ?? input.acknowledged ?? 0, 0, 48));
  const escalatedIncidents = Math.trunc(clamp(input.escalatedIncidents ?? input.escalated ?? 0, 0, 48));
  const traceQuality = clamp01(input.traceQuality ?? input.traceCompleteness ?? 0.34);
  const classifierConfidence = clamp01(input.classifierConfidence ?? input.intentConfidence ?? 0.31);
  const fallbackCoverage = clamp01(input.fallbackCoverage ?? input.playbookCoverage ?? 0.45);
  const operatorLoad = clamp01(input.operatorLoad ?? input.load ?? 0.62);
  const modelLoaded = Boolean(input.modelLoaded ?? input.loaded ?? false);
  const sceneOpen = Boolean(input.sceneOpen ?? input.open ?? false);
  const selectedAction = idSafe(input.selectedAction ?? input.action ?? "observe");
  const seed = Math.abs(Math.trunc(Number(input.seed ?? 41))) % 997;
  return { alertCount, unresolved, ackedIncidents, escalatedIncidents, traceQuality, classifierConfidence, fallbackCoverage, operatorLoad, modelLoaded, sceneOpen, selectedAction, seed };
}

export function createIncidentAlertBeacons(input = {}) {
  const state = normalizeIncidentRouterInput(input);
  const count = Math.max(3, Math.min(10, state.alertCount + 2));
  return Array.from({ length: count }, (_, index) => {
    const urgency = clamp01((state.unresolved / Math.max(1, state.alertCount + 1)) * 0.58 + (index % 3) * 0.14 + (state.operatorLoad * 0.2));
    return {
      id: `alert-beacon-${state.seed}-${index}`,
      kit: "onnx-incident-alert-beacon-kit",
      descriptorKind: "incident-alert-beacon",
      label: index < state.unresolved ? `Unresolved incident ${index + 1}` : `Acknowledged incident ${index + 1}`,
      channel: ["runtime", "prompt", "tool", "memory", "fallback"][index % 5],
      urgency: round(urgency),
      acknowledged: index < state.ackedIncidents,
      x: round(8 + ((index * 17 + state.seed) % 78)),
      y: round(16 + ((index * 19 + state.seed) % 58)),
      pulse: round(0.45 + urgency * 1.55)
    };
  });
}

export function createIncidentTraceSamplers(input = {}) {
  const state = normalizeIncidentRouterInput(input);
  const count = Math.max(3, Math.min(8, 3 + Math.ceil(state.traceQuality * 5)));
  return Array.from({ length: count }, (_, index) => {
    const completeness = clamp01(state.traceQuality * 0.72 + index * 0.045 + (state.modelLoaded ? 0.1 : 0));
    return {
      id: `trace-sampler-${state.seed}-${index}`,
      kit: "onnx-incident-trace-sampler-kit",
      descriptorKind: "incident-trace-sampler",
      label: `Trace packet ${index + 1}`,
      completeness: round(completeness),
      missingSpanCount: Math.max(0, Math.round((1 - completeness) * 6)),
      spanColor: completeness > 0.72 ? "stable" : completeness > 0.42 ? "partial" : "thin",
      x: round(12 + index * 10.5),
      y: round(68 - completeness * 34)
    };
  });
}

export function createIncidentClassifierLanes(input = {}) {
  const state = normalizeIncidentRouterInput(input);
  const lanes = ["intent", "runtime", "tool", "memory", "safety", "fallback"];
  return lanes.map((lane, index) => {
    const confidence = clamp01(state.classifierConfidence * 0.66 + state.traceQuality * 0.2 + (index % 2) * 0.045 + (state.modelLoaded ? 0.12 : 0));
    return {
      id: `classifier-lane-${lane}`,
      kit: "onnx-incident-classifier-lane-kit",
      descriptorKind: "incident-classifier-lane",
      lane,
      label: `${lane} lane`,
      confidence: round(confidence),
      queued: Math.max(0, Math.round(state.unresolved * (0.26 - index * 0.025))),
      routeState: confidence > 0.76 ? "auto-route" : confidence > 0.46 ? "review" : "manual",
      x1: round(10 + index * 13),
      x2: round(17 + index * 13),
      y: round(38 + (index % 3) * 12)
    };
  });
}

export function createIncidentFallbackBriefs(input = {}) {
  const state = normalizeIncidentRouterInput(input);
  const count = Math.max(3, Math.min(7, 3 + Math.ceil((1 - state.classifierConfidence) * 4)));
  return Array.from({ length: count }, (_, index) => {
    const coverage = clamp01(state.fallbackCoverage * 0.72 + (index + 1) * 0.035 + (state.sceneOpen ? 0.09 : 0));
    return {
      id: `fallback-brief-${state.seed}-${index}`,
      kit: "onnx-incident-fallback-brief-kit",
      descriptorKind: "incident-fallback-brief",
      label: ["Manual triage", "Known limitation", "Safe alternative", "Retry envelope", "Escalation note", "User-facing summary", "Recovery test"][index % 7],
      coverage: round(coverage),
      playbookStep: index + 1,
      required: state.classifierConfidence < 0.58 || !state.modelLoaded,
      x: round(76 - index * 8.5),
      y: round(18 + index * 8.4)
    };
  });
}

export function createIncidentOperatorShifts(input = {}) {
  const state = normalizeIncidentRouterInput(input);
  const count = Math.max(3, Math.min(8, 3 + Math.ceil((1 - state.operatorLoad) * 5) + Math.min(2, state.escalatedIncidents)));
  return Array.from({ length: count }, (_, index) => {
    const loadShare = clamp01(state.operatorLoad * (0.88 - index * 0.055));
    return {
      id: `operator-shift-${state.seed}-${index}`,
      kit: "onnx-incident-operator-shift-kit",
      descriptorKind: "incident-operator-shift",
      label: `Operator post ${index + 1}`,
      loadShare: round(loadShare),
      handoffReady: loadShare < 0.72 && state.fallbackCoverage > 0.48,
      escalationLane: index < state.escalatedIncidents,
      x: round(18 + index * 9.4),
      y: round(83 - loadShare * 30)
    };
  });
}

export function createIncidentAuditLedger(input = {}) {
  const state = normalizeIncidentRouterInput(input);
  const routed = Math.max(0, state.ackedIncidents + state.escalatedIncidents);
  const auditCompleteness = clamp01((routed / Math.max(1, state.alertCount)) * 0.38 + state.traceQuality * 0.26 + state.fallbackCoverage * 0.22 + (state.sceneOpen ? 0.14 : 0));
  return {
    id: `incident-audit-ledger-${state.seed}`,
    kit: "onnx-incident-audit-ledger-kit",
    descriptorKind: "incident-audit-ledger",
    label: "Incident audit ledger",
    auditCompleteness: round(auditCompleteness),
    routed,
    open: Math.max(0, state.unresolved - routed),
    selectedAction: state.selectedAction,
    signoffState: auditCompleteness > 0.82 ? "ready-for-postmortem" : auditCompleteness > 0.52 ? "needs-operator-review" : "collect-more-evidence"
  };
}

export function createOnnxIncidentRouterRendererHandoff(input = {}) {
  const alertBeacons = createIncidentAlertBeacons(input);
  const traceSamplers = createIncidentTraceSamplers(input);
  const classifierLanes = createIncidentClassifierLanes(input);
  const fallbackBriefs = createIncidentFallbackBriefs(input);
  const operatorShifts = createIncidentOperatorShifts(input);
  const auditLedger = createIncidentAuditLedger(input);
  const flatDescriptors = [...alertBeacons, ...traceSamplers, ...classifierLanes, ...fallbackBriefs, ...operatorShifts, auditLedger];
  return {
    passId: "onnx-workshop-incident-router-renderer-handoff-pass",
    descriptorOnly: true,
    descriptors: { alertBeacons, traceSamplers, classifierLanes, fallbackBriefs, operatorShifts, auditLedger },
    flatDescriptors,
    counts: {
      alertBeacons: alertBeacons.length,
      traceSamplers: traceSamplers.length,
      classifierLanes: classifierLanes.length,
      fallbackBriefs: fallbackBriefs.length,
      operatorShifts: operatorShifts.length,
      auditLedgers: 1,
      total: flatDescriptors.length
    }
  };
}

export function createOnnxWorkshopIncidentRouterReadiness(input = {}) {
  const state = normalizeIncidentRouterInput(input);
  const rendererHandoff = createOnnxIncidentRouterRendererHandoff(state);
  const pressure = clamp01(state.unresolved / Math.max(1, state.alertCount + 1) * 0.48 + state.operatorLoad * 0.34 + (1 - state.traceQuality) * 0.18);
  const readinessScore = clamp01(
    state.traceQuality * 0.23 +
    state.classifierConfidence * 0.22 +
    state.fallbackCoverage * 0.2 +
    (1 - state.operatorLoad) * 0.12 +
    (state.ackedIncidents / Math.max(1, state.alertCount)) * 0.12 +
    (state.modelLoaded ? 0.06 : 0) +
    (state.sceneOpen ? 0.05 : 0)
  );
  const missionState = readinessScore > 0.84 ? "postmortem-ready" : pressure > 0.66 ? "triage-surge" : readinessScore > 0.58 ? "routing-stable" : "collect-evidence";
  const topPriority = pressure > 0.66 ? "reduce operator load" : state.traceQuality < 0.55 ? "sample traces" : state.classifierConfidence < 0.6 ? "route uncertain classifiers" : state.fallbackCoverage < 0.62 ? "expand fallback brief" : "close audit ledger";
  return {
    domainId: ONNX_WORKSHOP_INCIDENT_ROUTER_DOMAIN.id,
    domainTree: ONNX_WORKSHOP_INCIDENT_ROUTER_DOMAIN.tree,
    kits: ONNX_WORKSHOP_INCIDENT_ROUTER_KITS,
    ownershipExclusions: ONNX_WORKSHOP_INCIDENT_ROUTER_DOMAIN.ownershipExclusions,
    input: state,
    summary: {
      readinessScore: round(readinessScore),
      pressure: round(pressure),
      missionState,
      topPriority,
      descriptorCount: rendererHandoff.counts.total
    },
    rendererHandoff
  };
}

export function createOnnxWorkshopIncidentRouterDomainKit(options = {}) {
  const seed = options.seed ?? 41;
  return {
    id: ONNX_WORKSHOP_INCIDENT_ROUTER_DOMAIN.id,
    domainTree: ONNX_WORKSHOP_INCIDENT_ROUTER_DOMAIN.tree,
    kits: ONNX_WORKSHOP_INCIDENT_ROUTER_KITS,
    ownershipExclusions: ONNX_WORKSHOP_INCIDENT_ROUTER_DOMAIN.ownershipExclusions,
    describe(input = {}) {
      return createOnnxWorkshopIncidentRouterReadiness({ seed, ...input });
    },
    compose(input = {}) {
      return createOnnxWorkshopIncidentRouterReadiness({ seed, ...input });
    },
    snapshot(input = {}) {
      const readiness = createOnnxWorkshopIncidentRouterReadiness({ seed, ...input });
      return { id: this.id, summary: readiness.summary, counts: readiness.rendererHandoff.counts };
    }
  };
}

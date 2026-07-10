export const NEXUS_ENGINE_MAIN_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";

const DOMAIN_TREE = `onnx-safehouse-rollback-readiness-domain
├─ safehouse-prep-domain
│  ├─ lantern-ward-domain
│  │  └─ onnx-safehouse-lantern-ward-kit
│  └─ rollback-key-domain
│     └─ onnx-safehouse-rollback-key-kit
├─ evidence-preservation-domain
│  ├─ evidence-locker-domain
│  │  └─ onnx-safehouse-evidence-locker-kit
│  └─ quarantine-seal-domain
│     └─ model-quarantine-seal-domain
│        └─ onnx-safehouse-model-quarantine-seal-kit
├─ operator-recovery-domain
│  ├─ operator-bunk-domain
│  │  └─ onnx-safehouse-operator-bunk-kit
│  └─ dawn-safehouse-ledger-domain
│     └─ onnx-safehouse-dawn-ledger-kit
└─ renderer-handoff
   └─ onnx-safehouse-rollback-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

const OWNERSHIP_EXCLUSIONS = Object.freeze([
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
  "network",
  "frame-loop ownership"
]);

const KITS = Object.freeze([
  "onnx-safehouse-lantern-ward-kit",
  "onnx-safehouse-rollback-key-kit",
  "onnx-safehouse-evidence-locker-kit",
  "onnx-safehouse-model-quarantine-seal-kit",
  "onnx-safehouse-operator-bunk-kit",
  "onnx-safehouse-dawn-ledger-kit",
  "onnx-safehouse-rollback-renderer-handoff-kit"
]);

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));
const round = (value, digits = 3) => Number(clamp(value, -9999, 9999).toFixed(digits));
const positiveInt = (value, fallback = 0, max = 99) => Math.trunc(clamp(value ?? fallback, 0, max));

export const ONNX_SAFEHOUSE_ROLLBACK_DOMAIN = Object.freeze({
  id: "onnx-safehouse-rollback-readiness-domain",
  tree: DOMAIN_TREE,
  kits: KITS,
  ownershipExclusions: OWNERSHIP_EXCLUSIONS
});

export function normalizeSafehouseRollbackInput(input = {}) {
  const redTeam = input.redTeamEvacuationReadiness?.summary ?? input.redTeam ?? {};
  return {
    seed: positiveInt(input.seed ?? redTeam.seed ?? 211, 211, 999),
    rollbackKeys: positiveInt(input.rollbackKeys ?? input.keys ?? Math.round((redTeam.readinessScore ?? 0.32) * 6), 2, 12),
    sealedEvidence: positiveInt(input.sealedEvidence ?? input.evidence ?? Math.round((redTeam.readinessScore ?? 0.32) * 8), 2, 16),
    quarantinedModels: positiveInt(input.quarantinedModels ?? input.models ?? (input.modelLoaded ? 1 : 0), 0, 8),
    operatorRest: clamp(input.operatorRest ?? input.rest ?? (1 - Number(redTeam.pressure ?? 0.58))),
    sandboxIntegrity: clamp(input.sandboxIntegrity ?? input.sandbox ?? 0.48),
    evacuationPressure: clamp(input.evacuationPressure ?? input.pressure ?? redTeam.pressure ?? 0.58),
    drillReadiness: clamp(input.drillReadiness ?? input.readiness ?? redTeam.readinessScore ?? 0.36),
    action: String(input.action ?? input.selectedAction ?? "inspect-safehouse")
  };
}

export function createSafehouseLanternWardDescriptors(input = {}) {
  const state = normalizeSafehouseRollbackInput(input);
  return Array.from({ length: 5 }, (_, index) => {
    const glow = clamp(0.32 + state.sandboxIntegrity * 0.32 + index * 0.055 - state.evacuationPressure * 0.11);
    return {
      id: `safehouse-lantern-ward-${state.seed}-${index}`,
      kit: "onnx-safehouse-lantern-ward-kit",
      descriptorKind: "safehouse-lantern-ward",
      x: round(12 + index * 18),
      y: round(18 + ((state.seed + index * 13) % 22)),
      glow: round(glow),
      wardState: glow > 0.68 ? "bright" : glow > 0.46 ? "lit" : "dim",
      label: `Lantern ward ${index + 1}`
    };
  });
}

export function createSafehouseRollbackKeyDescriptors(input = {}) {
  const state = normalizeSafehouseRollbackInput(input);
  return Array.from({ length: 4 }, (_, index) => {
    const tuned = index < state.rollbackKeys;
    const checksum = clamp(0.24 + state.drillReadiness * 0.42 + (tuned ? 0.22 : 0) + index * 0.03);
    return {
      id: `safehouse-rollback-key-${state.seed}-${index}`,
      kit: "onnx-safehouse-rollback-key-kit",
      descriptorKind: "safehouse-rollback-key",
      x: round(20 + index * 16),
      y: round(56 - checksum * 18),
      tuned,
      checksum: round(checksum),
      routeState: checksum > 0.72 ? "verified" : checksum > 0.48 ? "paired" : "loose",
      label: `Rollback key ${index + 1}`
    };
  });
}

export function createSafehouseEvidenceLockerDescriptors(input = {}) {
  const state = normalizeSafehouseRollbackInput(input);
  return Array.from({ length: 5 }, (_, index) => {
    const sealed = index < Math.ceil(state.sealedEvidence / 2);
    const coverage = clamp(0.28 + state.drillReadiness * 0.26 + state.sandboxIntegrity * 0.16 + (sealed ? 0.22 : 0));
    return {
      id: `safehouse-evidence-locker-${state.seed}-${index}`,
      kit: "onnx-safehouse-evidence-locker-kit",
      descriptorKind: "safehouse-evidence-locker",
      x: round(14 + index * 17),
      y: round(68 + (index % 2) * 12),
      sealed,
      coverage: round(coverage),
      label: ["prompt log", "tool trace", "operator note", "state export", "rollback diff"][index]
    };
  });
}

export function createSafehouseModelQuarantineSealDescriptors(input = {}) {
  const state = normalizeSafehouseRollbackInput(input);
  return Array.from({ length: 3 }, (_, index) => {
    const quarantined = index < state.quarantinedModels;
    const sealStrength = clamp(0.38 + state.sandboxIntegrity * 0.34 + (quarantined ? 0.2 : 0) - state.evacuationPressure * 0.08);
    return {
      id: `safehouse-model-quarantine-seal-${state.seed}-${index}`,
      kit: "onnx-safehouse-model-quarantine-seal-kit",
      descriptorKind: "safehouse-model-quarantine-seal",
      x: round(26 + index * 22),
      y: round(36 + index * 8),
      quarantined,
      sealStrength: round(sealStrength),
      sealState: sealStrength > 0.7 ? "sealed" : sealStrength > 0.5 ? "watched" : "leaking",
      label: `Model seal ${index + 1}`
    };
  });
}

export function createSafehouseOperatorBunkDescriptors(input = {}) {
  const state = normalizeSafehouseRollbackInput(input);
  return Array.from({ length: 4 }, (_, index) => {
    const recovery = clamp(state.operatorRest * 0.62 + index * 0.065 + (state.evacuationPressure < 0.45 ? 0.1 : 0));
    return {
      id: `safehouse-operator-bunk-${state.seed}-${index}`,
      kit: "onnx-safehouse-operator-bunk-kit",
      descriptorKind: "safehouse-operator-bunk",
      x: round(18 + index * 18),
      y: round(86 - recovery * 24),
      recovery: round(recovery),
      ready: recovery > 0.62,
      label: `Operator bunk ${index + 1}`
    };
  });
}

export function createSafehouseDawnLedger(input = {}, derived = {}) {
  const state = normalizeSafehouseRollbackInput(input);
  const lanternScore = clamp((derived.brightLanterns ?? 0) / Math.max(1, derived.lanterns ?? 1));
  const keyScore = clamp((derived.verifiedKeys ?? 0) / Math.max(1, derived.keys ?? 1));
  const evidenceScore = clamp((derived.sealedLockers ?? 0) / Math.max(1, derived.lockers ?? 1));
  const sealScore = clamp((derived.strongSeals ?? 0) / Math.max(1, derived.seals ?? 1));
  const bunkScore = clamp((derived.readyBunks ?? 0) / Math.max(1, derived.bunks ?? 1));
  const readiness = clamp(lanternScore * 0.18 + keyScore * 0.2 + evidenceScore * 0.18 + sealScore * 0.17 + bunkScore * 0.15 + state.drillReadiness * 0.12);
  const pressure = clamp(state.evacuationPressure * 0.58 + (1 - evidenceScore) * 0.16 + (1 - sealScore) * 0.14 + (1 - bunkScore) * 0.12);
  const missionState = readiness > 0.82 ? "safehouse-closed" : keyScore < 0.45 ? "pair-rollback-keys" : evidenceScore < 0.55 ? "seal-evidence-lockers" : sealScore < 0.55 ? "quarantine-model-seals" : "rest-operators";
  return {
    id: `safehouse-dawn-ledger-${state.seed}`,
    kit: "onnx-safehouse-dawn-ledger-kit",
    descriptorKind: "safehouse-dawn-ledger",
    readiness: round(readiness),
    pressure: round(pressure),
    missionState,
    nextInstruction: missionState === "safehouse-closed" ? "Close the safehouse rollback ledger" : missionState === "pair-rollback-keys" ? "Pair rollback keys" : missionState === "seal-evidence-lockers" ? "Seal evidence lockers" : missionState === "quarantine-model-seals" ? "Quarantine model seals" : "Rest operators before handoff",
    action: state.action
  };
}

function createRendererHandoff(readiness) {
  const descriptors = {
    lanternWards: readiness.lanternWards,
    rollbackKeys: readiness.rollbackKeys,
    evidenceLockers: readiness.evidenceLockers,
    modelQuarantineSeals: readiness.modelQuarantineSeals,
    operatorBunks: readiness.operatorBunks,
    dawnLedgers: [readiness.dawnLedger]
  };
  const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : 0]));
  counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  return {
    passId: "onnx-safehouse-rollback-readiness-renderer-handoff-pass",
    policy: "renderer-consumes-descriptors-only",
    descriptorOnly: true,
    ownershipExclusions: [...OWNERSHIP_EXCLUSIONS],
    descriptors,
    counts
  };
}

export function createOnnxSafehouseRollbackReadiness(input = {}) {
  const lanternWards = createSafehouseLanternWardDescriptors(input);
  const rollbackKeys = createSafehouseRollbackKeyDescriptors(input);
  const evidenceLockers = createSafehouseEvidenceLockerDescriptors(input);
  const modelQuarantineSeals = createSafehouseModelQuarantineSealDescriptors(input);
  const operatorBunks = createSafehouseOperatorBunkDescriptors(input);
  const dawnLedger = createSafehouseDawnLedger(input, {
    brightLanterns: lanternWards.filter((item) => item.wardState === "bright").length,
    lanterns: lanternWards.length,
    verifiedKeys: rollbackKeys.filter((item) => item.routeState === "verified").length,
    keys: rollbackKeys.length,
    sealedLockers: evidenceLockers.filter((item) => item.sealed).length,
    lockers: evidenceLockers.length,
    strongSeals: modelQuarantineSeals.filter((item) => item.sealState === "sealed").length,
    seals: modelQuarantineSeals.length,
    readyBunks: operatorBunks.filter((item) => item.ready).length,
    bunks: operatorBunks.length
  });
  const readiness = {
    domainId: ONNX_SAFEHOUSE_ROLLBACK_DOMAIN.id,
    domainTree: DOMAIN_TREE,
    kits: [...KITS],
    ownershipExclusions: [...OWNERSHIP_EXCLUSIONS],
    lanternWards,
    rollbackKeys,
    evidenceLockers,
    modelQuarantineSeals,
    operatorBunks,
    dawnLedger,
    safehouseReadiness: dawnLedger.readiness,
    rollbackPressure: dawnLedger.pressure,
    missionState: dawnLedger.missionState
  };
  readiness.rendererHandoff = createRendererHandoff(readiness);
  return readiness;
}

export function createOnnxSafehouseRollbackReadinessDomainKit(options = {}) {
  const seed = options.seed ?? 211;
  return Object.freeze({
    id: ONNX_SAFEHOUSE_ROLLBACK_DOMAIN.id,
    domainTree: DOMAIN_TREE,
    kits: [...KITS],
    ownershipExclusions: [...OWNERSHIP_EXCLUSIONS],
    describe(input = {}) {
      return createOnnxSafehouseRollbackReadiness({ seed, ...input });
    }
  });
}

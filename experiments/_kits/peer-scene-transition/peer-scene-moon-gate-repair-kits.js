export const PEER_SCENE_MOON_GATE_REPAIR_DOMAIN = Object.freeze({
  id: "peer-scene-moon-gate-repair-readiness-domain",
  owns: [
    "sceneId",
    "visitedSceneCount",
    "moonGateRuneAlignment",
    "counterweightBalance",
    "witnessEchoCoverage",
    "oathRibbonContinuity",
    "thresholdLanternCoverage",
    "descriptorOnlyRendererHandoff"
  ],
  excludes: [
    "renderer",
    "dom",
    "browser-input",
    "three-js",
    "webgl",
    "audio",
    "asset-loading",
    "frame-loop",
    "model-inference",
    "storage",
    "navigation",
    "physics",
    "network"
  ],
  tree: `peer-scene-moon-gate-repair-readiness-domain
├─ threshold-repair-domain
│  ├─ moon-gate-rune-domain
│  │  └─ peer-scene-moon-gate-rune-kit
│  └─ hinge-counterweight-domain
│     └─ peer-scene-hinge-counterweight-kit
├─ witness-chorus-domain
│  ├─ echo-choir-domain
│  │  ├─ memory-voice-domain
│  │  │  └─ peer-scene-echo-choir-kit
│  └─ oath-ribbon-domain
│     └─ peer-scene-oath-ribbon-kit
├─ dawn-threshold-handoff-domain
│  ├─ threshold-lantern-domain
│  │  └─ peer-scene-threshold-lantern-kit
│  └─ moon-gate-ledger-domain
│     └─ peer-scene-dawn-moon-gate-ledger-kit
└─ renderer-handoff
   └─ peer-scene-moon-gate-repair-renderer-handoff-kit
      └─ renderer consumes descriptors only`
});

export const PEER_SCENE_MOON_GATE_REPAIR_KITS = Object.freeze([
  "peer-scene-moon-gate-rune-kit",
  "peer-scene-hinge-counterweight-kit",
  "peer-scene-echo-choir-kit",
  "peer-scene-oath-ribbon-kit",
  "peer-scene-threshold-lantern-kit",
  "peer-scene-dawn-moon-gate-ledger-kit",
  "peer-scene-moon-gate-repair-renderer-handoff-kit"
]);

const SCENE_ORDER = Object.freeze(["camp", "crossroads", "forest", "bridge", "shrine", "ending"]);
const SCENE_LABELS = Object.freeze({
  camp: "Ash Road Camp",
  crossroads: "Crossroads",
  forest: "Lantern Forest",
  bridge: "Old Bridge",
  shrine: "Silent Shrine",
  ending: "Dawn Ending"
});
const RUNE_GLYPHS = Object.freeze(["☾", "◇", "✦", "♢", "◌", "☼"]);

function clamp(value, min, max) {
  const numeric = Number.isFinite(Number(value)) ? Number(value) : min;
  return Math.max(min, Math.min(max, numeric));
}

function clamp01(value) {
  return clamp(value, 0, 1);
}

function normalizeList(value) {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function normalizeState(input = {}) {
  const sceneId = String(input.sceneId ?? input.currentScene ?? input.currentSceneId ?? "camp");
  const currentScene = SCENE_ORDER.includes(sceneId) ? sceneId : "camp";
  const visited = normalizeList(input.visited ?? input.visitedScenes ?? input.visitedSceneIds);
  const inventory = normalizeList(input.inventory ?? input.items);
  const tokens = normalizeList(input.tokens ?? input.routeTokens);
  const actions = normalizeList(input.actions ?? input.completedActions ?? input.doneActions);
  const flags = input.flags && typeof input.flags === "object" ? Object.keys(input.flags).filter((key) => input.flags[key]) : [];
  const log = normalizeList(input.log ?? input.messages);
  const pressureSource = typeof input.pressure === "object" ? input.pressure?.score : input.pressure;
  const pressure = clamp(Number(input.pressureScore ?? input.hazardPressure ?? pressureSource ?? 0), 0, 100);
  const allTokens = [...inventory, ...tokens, ...actions, ...flags, ...log].map(String);
  return Object.freeze({
    sceneId: currentScene,
    visited: visited.length ? [...new Set(visited)] : [currentScene],
    inventory,
    tokens,
    actions,
    flags,
    log,
    allTokens,
    pressure,
    time: clamp(Number(input.time ?? input.tick ?? 0), 0, 9999),
    seed: String(input.seed ?? currentScene)
  });
}

function hasToken(state, token) {
  const needle = String(token).toLowerCase();
  return state.allTokens.some((item) => item.toLowerCase().includes(needle));
}

function makeDescriptor(kind, id, fields = {}) {
  return Object.freeze({ kind, id, ...fields });
}

function sceneIndex(sceneId) {
  return Math.max(0, SCENE_ORDER.indexOf(sceneId));
}

function readinessPhase(score) {
  if (score >= 88) return "moon-gate-open";
  if (score >= 68) return "threshold-lanterns-aligned";
  if (score >= 42) return "witness-chorus-forming";
  return "threshold-fractured";
}

function tokenCount(state, terms) {
  return terms.reduce((count, term) => count + (hasToken(state, term) ? 1 : 0), 0);
}

export function createPeerSceneMoonGateRuneKit() {
  return Object.freeze({
    id: "peer-scene-moon-gate-rune-kit",
    describe(input = {}) {
      const state = normalizeState(input);
      const index = sceneIndex(state.sceneId);
      const runeClues = tokenCount(state, ["rune", "seal", "shrine", "moon", "map", "clue"]);
      return SCENE_ORDER.slice(0, 5).map((scene, slot) => {
        const visited = state.visited.includes(scene);
        const alignment = clamp01(0.18 + (visited ? 0.24 : 0) + runeClues * 0.075 + (slot <= index ? 0.08 : 0) - state.pressure / 420);
        return makeDescriptor("moonGateRune", `moon-gate-rune-${scene}`, {
          scene,
          label: `${SCENE_LABELS[scene]} moon gate rune`,
          glyph: RUNE_GLYPHS[slot],
          x: 13 + slot * 17,
          y: 62 - ((slot + index) % 4) * 9,
          aligned: alignment >= 0.52,
          carvingDepth: Number((0.35 + slot * 0.08 + runeClues * 0.03).toFixed(2)),
          glow: Number(alignment.toFixed(3))
        });
      });
    }
  });
}

export function createPeerSceneHingeCounterweightKit() {
  return Object.freeze({
    id: "peer-scene-hinge-counterweight-kit",
    describe(input = {}) {
      const state = normalizeState(input);
      const index = sceneIndex(state.sceneId);
      const mechanicalTokens = tokenCount(state, ["rope", "bridge", "lever", "plank", "iron", "key"]);
      return SCENE_ORDER.slice(0, 5).map((scene, slot) => {
        const tension = clamp01(0.74 - mechanicalTokens * 0.08 - state.visited.length * 0.035 + state.pressure / 190 + Math.abs(index - slot) * 0.03);
        return makeDescriptor("hingeCounterweight", `hinge-counterweight-${scene}`, {
          scene,
          label: `${SCENE_LABELS[scene]} counterweight`,
          chainLinks: 6 + slot + mechanicalTokens,
          balanced: tension <= 0.48,
          tension: Number(tension.toFixed(3)),
          x: 20 + slot * 14,
          y: 28 + (slot % 3) * 11
        });
      });
    }
  });
}

export function createPeerSceneEchoChoirKit() {
  return Object.freeze({
    id: "peer-scene-echo-choir-kit",
    describe(input = {}) {
      const state = normalizeState(input);
      const memoryTokens = tokenCount(state, ["witness", "oracle", "echo", "memory", "name", "answer"]);
      return SCENE_ORDER.slice(0, 5).map((scene, slot) => {
        const heard = state.visited.includes(scene) || memoryTokens > slot / 2;
        const volume = clamp01(0.2 + (heard ? 0.32 : 0) + memoryTokens * 0.07 - state.pressure / 360);
        return makeDescriptor("echoChoir", `echo-choir-${scene}`, {
          scene,
          label: `${SCENE_LABELS[scene]} echo choir`,
          voices: 1 + slot + (heard ? 2 : 0) + Math.min(3, memoryTokens),
          heard,
          volume: Number(volume.toFixed(3)),
          orbit: Number((0.52 + slot * 0.11).toFixed(2))
        });
      });
    }
  });
}

export function createPeerSceneOathRibbonKit() {
  return Object.freeze({
    id: "peer-scene-oath-ribbon-kit",
    describe(input = {}) {
      const state = normalizeState(input);
      const oathTokens = tokenCount(state, ["oath", "ritual", "seal", "archive", "evidence", "promise"]);
      return SCENE_ORDER.slice(0, 5).map((scene, slot) => {
        const continuity = clamp01(0.16 + state.visited.length * 0.08 + oathTokens * 0.09 + (state.visited.includes(scene) ? 0.18 : 0) - state.pressure / 430);
        return makeDescriptor("oathRibbon", `oath-ribbon-${scene}`, {
          scene,
          label: `${SCENE_LABELS[scene]} oath ribbon`,
          tied: continuity >= 0.5,
          continuity: Number(continuity.toFixed(3)),
          ribbonCount: 2 + slot + oathTokens,
          arc: Number((18 + slot * 9 + continuity * 12).toFixed(1))
        });
      });
    }
  });
}

export function createPeerSceneThresholdLanternKit() {
  return Object.freeze({
    id: "peer-scene-threshold-lantern-kit",
    describe(input = {}) {
      const state = normalizeState(input);
      const lanternTokens = tokenCount(state, ["lantern", "light", "torch", "forest", "moon", "dawn"]);
      const index = sceneIndex(state.sceneId);
      return SCENE_ORDER.slice(0, 5).map((scene, slot) => {
        const lit = state.visited.includes(scene) && (lanternTokens > 0 || slot <= index);
        const coverage = clamp01(0.22 + (lit ? 0.35 : 0) + lanternTokens * 0.08 + (slot <= index ? 0.08 : 0) - state.pressure / 380);
        return makeDescriptor("thresholdLantern", `threshold-lantern-${scene}`, {
          scene,
          label: `${SCENE_LABELS[scene]} threshold lantern`,
          lit,
          coverage: Number(coverage.toFixed(3)),
          beamAngle: Number((-32 + slot * 16 + coverage * 14).toFixed(1)),
          lanterns: 1 + slot + (lit ? 2 : 0)
        });
      });
    }
  });
}

export function createPeerSceneDawnMoonGateLedgerKit() {
  return Object.freeze({
    id: "peer-scene-dawn-moon-gate-ledger-kit",
    describe(input = {}, descriptors = {}) {
      const runes = descriptors.moonGateRunes?.filter((item) => item.aligned).length ?? 0;
      const weights = descriptors.hingeCounterweights?.filter((item) => item.balanced).length ?? 0;
      const choirs = descriptors.echoChoirs?.filter((item) => item.heard).length ?? 0;
      const ribbons = descriptors.oathRibbons?.filter((item) => item.tied).length ?? 0;
      const lanterns = descriptors.thresholdLanterns?.filter((item) => item.lit).length ?? 0;
      const readiness = Math.round(clamp01((runes + weights + choirs + ribbons + lanterns) / 25) * 100);
      return [makeDescriptor("dawnMoonGateLedger", "dawn-moon-gate-ledger", {
        label: "Dawn moon gate repair ledger",
        runes,
        weights,
        choirs,
        ribbons,
        lanterns,
        readiness,
        phase: readinessPhase(readiness),
        missing: [
          runes < 5 ? "align moon gate runes" : null,
          weights < 5 ? "balance hinge counterweights" : null,
          choirs < 5 ? "call the witness chorus" : null,
          ribbons < 5 ? "tie oath ribbons" : null,
          lanterns < 5 ? "light threshold lanterns" : null
        ].filter(Boolean)
      })];
    }
  });
}

export function createPeerSceneMoonGateRepairRendererHandoffKit() {
  return Object.freeze({
    id: "peer-scene-moon-gate-repair-renderer-handoff-kit",
    describe(input = {}, descriptors = {}) {
      const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : 0]));
      const flatDescriptors = Object.values(descriptors).flatMap((value) => Array.isArray(value) ? value : []);
      return Object.freeze({
        type: "peer-scene-moon-gate-repair-renderer-handoff",
        passId: "moon-gate-repair-readiness-renderer-handoff-pass",
        descriptorOnly: true,
        policy: "renderer-consumes-descriptors-only",
        descriptors,
        flatDescriptors,
        counts,
        ownership: {
          reusableLogic: "plain-input-to-plain-descriptor-output",
          renderer: "consume-only",
          exclusions: PEER_SCENE_MOON_GATE_REPAIR_DOMAIN.excludes
        }
      });
    }
  });
}

export function createPeerSceneMoonGateRepairReadiness(input = {}) {
  return createPeerSceneMoonGateRepairDomainKit().describe(input);
}

export function createPeerSceneMoonGateRepairDomainKit() {
  const runeKit = createPeerSceneMoonGateRuneKit();
  const counterweightKit = createPeerSceneHingeCounterweightKit();
  const choirKit = createPeerSceneEchoChoirKit();
  const ribbonKit = createPeerSceneOathRibbonKit();
  const lanternKit = createPeerSceneThresholdLanternKit();
  const ledgerKit = createPeerSceneDawnMoonGateLedgerKit();
  const handoffKit = createPeerSceneMoonGateRepairRendererHandoffKit();

  return Object.freeze({
    id: "peer-scene-moon-gate-repair-readiness-domain-kit",
    tree: PEER_SCENE_MOON_GATE_REPAIR_DOMAIN.tree,
    describe(input = {}) {
      const state = normalizeState(input);
      const descriptors = {
        moonGateRunes: runeKit.describe(state),
        hingeCounterweights: counterweightKit.describe(state),
        echoChoirs: choirKit.describe(state),
        oathRibbons: ribbonKit.describe(state),
        thresholdLanterns: lanternKit.describe(state)
      };
      descriptors.dawnMoonGateLedgers = ledgerKit.describe(state, descriptors);
      const rendererHandoff = handoffKit.describe(state, descriptors);
      const ledger = descriptors.dawnMoonGateLedgers[0];
      const fractureRisk = Math.round(clamp01((state.pressure + (100 - ledger.readiness) * 0.56) / 156) * 100);
      return Object.freeze({
        domainId: PEER_SCENE_MOON_GATE_REPAIR_DOMAIN.id,
        domainTree: PEER_SCENE_MOON_GATE_REPAIR_DOMAIN.tree,
        kits: PEER_SCENE_MOON_GATE_REPAIR_KITS,
        ownershipExclusions: PEER_SCENE_MOON_GATE_REPAIR_DOMAIN.excludes,
        sceneId: state.sceneId,
        readiness: ledger.readiness,
        fractureRisk,
        phase: ledger.phase,
        missing: ledger.missing,
        summary: Object.freeze({
          readinessScore: Number((ledger.readiness / 100).toFixed(3)),
          risk: Number((fractureRisk / 100).toFixed(3)),
          missionState: ledger.phase
        }),
        descriptors,
        rendererHandoff
      });
    },
    snapshot(input = {}) {
      const readiness = this.describe(input);
      return Object.freeze({
        domainId: readiness.domainId,
        sceneId: readiness.sceneId,
        readiness: readiness.readiness,
        fractureRisk: readiness.fractureRisk,
        phase: readiness.phase,
        counts: readiness.rendererHandoff.counts
      });
    }
  });
}

const clampNumber = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));
const clamp01 = (value) => clampNumber(value, 0, 1);
const round = (value, places = 3) => Number((Number.isFinite(Number(value)) ? Number(value) : 0).toFixed(places));
const hashText = (text = "") => [...String(text)].reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 3), 17);

export const SCENE_TIME_CAPSULE_COURIER_READINESS_TREE = Object.freeze({
  id: "scene-time-capsule-courier-readiness-domain",
  owns: ["memory preservation descriptors", "courier route readiness", "descriptor-only renderer handoff"],
  excludes: ["renderer", "DOM", "browser input", "Three.js", "WebGL", "audio", "asset loading", "frame loop", "storage", "navigation"],
  tree: {
    "memory-preservation-domain": {
      "keepsake-tag-domain": ["scene-keepsake-tag-kit"],
      "archive-satchel-domain": ["scene-archive-satchel-kit"]
    },
    "courier-routing-domain": {
      "lantern-courier-thread-domain": ["scene-lantern-courier-thread-kit"],
      "gate-seal-domain": ["scene-gate-seal-kit"]
    },
    "final-handoff-domain": {
      "oath-ledger-domain": ["scene-oath-ledger-kit"],
      "time-capsule-threshold-domain": ["scene-time-capsule-threshold-kit"]
    },
    "renderer-handoff": ["scene-time-capsule-courier-renderer-handoff-kit"]
  },
  contract: "renderer consumes serializable time capsule courier descriptors only; reusable kits do not own DOM, renderer, browser input, Three.js, WebGL, audio, asset loading, storage, navigation, or frame-loop work"
});

const SCENE_ORDER = ["camp", "crossroads", "forest", "bridge", "shrine", "ending"];

function normalizeSceneId(input = {}) {
  return String(input.sceneId || input.activeScene || input.currentSceneId || input.scene || "camp");
}

function normalizeState(input = {}) {
  const sceneId = normalizeSceneId(input);
  const inventory = Array.isArray(input.inventory) ? input.inventory.map(String) : [];
  const log = Array.isArray(input.log) ? input.log.map(String) : [];
  const visited = Array.isArray(input.visited) ? input.visited.map(String) : [sceneId];
  const actions = Array.isArray(input.actions) ? input.actions : [];
  const progress = clamp01(input.progress ?? (visited.length + inventory.length * 0.75) / 10);
  const pressure = clamp01(input.pressure ?? input.pressureScore ?? input.score ?? (log.length * 0.07 + actions.length * 0.04));
  const memory = clamp01((inventory.length * 0.13) + (visited.length * 0.08) + (log.length * 0.035));
  const seed = hashText(`${sceneId}:${inventory.join("|")}:${visited.join("|")}:${log.slice(-5).join("|")}`);
  return { sceneId, inventory, log, visited, actions, progress, pressure, memory, seed };
}

function sceneIndex(sceneId) {
  return Math.max(0, SCENE_ORDER.indexOf(sceneId));
}

function point(seed, index, xBase, yBase) {
  const rawX = ((seed * 13 + index * 37 + xBase) % 100) / 100;
  const rawY = ((seed * 29 + index * 23 + yBase) % 100) / 100;
  return { x01: round(0.08 + rawX * 0.84), y01: round(0.12 + rawY * 0.74) };
}

function rendererContract(owner) {
  return {
    owner,
    rendererConsumes: "serializable scene time capsule courier descriptors only",
    rendererMustOwn: ["DOM placement", "draw order", "color application", "view animation", "pointer capture"],
    kitMustNotOwn: ["renderer", "DOM", "browser input", "Three.js", "WebGL", "audio", "asset loading", "storage", "navigation", "frame loop"]
  };
}

export function createSceneKeepsakeTagKit() {
  return {
    id: "scene-keepsake-tag-kit",
    describe(input = {}) {
      const state = normalizeState(input);
      const count = 3 + (state.visited.length % 3);
      return Array.from({ length: count }, (_, index) => {
        const p = point(state.seed, index, 11, 17);
        const secured = index < state.inventory.length || state.visited.includes(SCENE_ORDER[index] ?? state.sceneId);
        return {
          id: `keepsake-tag-${state.sceneId}-${index}`,
          kind: "keepsake-tag",
          sceneId: state.sceneId,
          label: secured ? "sealed memory" : "unclaimed memory",
          ...p,
          secured,
          pulse: round(0.28 + state.memory * 0.46 + index * 0.035),
          urgency: round(0.24 + state.pressure * 0.5 + (secured ? 0.04 : 0.18)),
          rendererContract: rendererContract("scene-keepsake-tag-kit")
        };
      });
    }
  };
}

export function createSceneArchiveSatchelKit() {
  return {
    id: "scene-archive-satchel-kit",
    describe(input = {}) {
      const state = normalizeState(input);
      const sorted = [...state.inventory, "map-scrap", "camp-photo", "river-note"].slice(0, 5);
      return sorted.map((item, index) => ({
        id: `archive-satchel-${state.sceneId}-${index}`,
        kind: "archive-satchel",
        sceneId: state.sceneId,
        item,
        ...point(state.seed, index, 47, 31),
        fill: round(clamp01(0.22 + state.memory * 0.52 + index * 0.04)),
        sealed: state.inventory.includes(item) || state.progress > 0.7,
        rendererContract: rendererContract("scene-archive-satchel-kit")
      }));
    }
  };
}

export function createSceneLanternCourierThreadKit() {
  return {
    id: "scene-lantern-courier-thread-kit",
    describe(input = {}) {
      const state = normalizeState(input);
      const current = sceneIndex(state.sceneId);
      return SCENE_ORDER.slice(0, 5).map((scene, index) => ({
        id: `lantern-courier-thread-${scene}-${index}`,
        kind: "lantern-courier-thread",
        sceneId: scene,
        fromScene: SCENE_ORDER[Math.max(0, index - 1)],
        toScene: scene,
        x01: round(0.11 + index * 0.16),
        y01: round(0.26 + ((index + current) % 3) * 0.11),
        length01: round(0.13 + state.progress * 0.13),
        glow: round(0.28 + (state.visited.includes(scene) ? 0.38 : 0.08) + state.memory * 0.24),
        angle: Math.round(-22 + index * 9 + state.pressure * 26),
        rendererContract: rendererContract("scene-lantern-courier-thread-kit")
      }));
    }
  };
}

export function createSceneGateSealKit() {
  return {
    id: "scene-gate-seal-kit",
    describe(input = {}) {
      const state = normalizeState(input);
      return SCENE_ORDER.slice(1, 5).map((scene, index) => {
        const opened = state.visited.includes(scene) || index < state.inventory.length || state.sceneId === scene;
        return {
          id: `gate-seal-${scene}-${index}`,
          kind: "gate-seal",
          sceneId: scene,
          x01: round(0.22 + index * 0.17),
          y01: round(0.64 - index * 0.045),
          opened,
          integrity: round(clamp01(0.32 + state.progress * 0.36 + (opened ? 0.24 : -state.pressure * 0.18))),
          missing: opened ? [] : ["witness", "keepsake", "lantern"].slice(0, 1 + (index % 2)),
          rendererContract: rendererContract("scene-gate-seal-kit")
        };
      });
    }
  };
}

export function createSceneOathLedgerKit() {
  return {
    id: "scene-oath-ledger-kit",
    describe(input = {}) {
      const state = normalizeState(input);
      return SCENE_ORDER.slice(0, 5).map((scene, index) => ({
        id: `oath-ledger-${scene}-${index}`,
        kind: "oath-ledger",
        sceneId: scene,
        x01: round(0.13 + index * 0.15),
        y01: round(0.86 - (index % 2) * 0.04),
        signed: state.visited.includes(scene) || state.sceneId === scene,
        confidence: round(0.24 + state.progress * 0.42 + (state.visited.includes(scene) ? 0.26 : 0) + state.memory * 0.12),
        rendererContract: rendererContract("scene-oath-ledger-kit")
      }));
    }
  };
}

export function createSceneTimeCapsuleThresholdKit() {
  return {
    id: "scene-time-capsule-threshold-kit",
    describe(input = {}) {
      const state = normalizeState(input);
      const readiness = clamp01(state.progress * 0.38 + state.memory * 0.34 + state.inventory.length * 0.055 + (1 - state.pressure) * 0.16);
      return [{
        id: `time-capsule-threshold-${state.sceneId}`,
        kind: "time-capsule-threshold",
        sceneId: state.sceneId,
        x01: 0.79,
        y01: 0.22,
        radius01: round(0.045 + readiness * 0.045),
        readiness: round(readiness),
        phase: readiness > 0.74 ? "seal-ready" : readiness > 0.48 ? "courier-threading" : "memory-gathering",
        rendererContract: rendererContract("scene-time-capsule-threshold-kit")
      }];
    }
  };
}

export function createSceneTimeCapsuleCourierRendererHandoffKit() {
  return {
    id: "scene-time-capsule-courier-renderer-handoff-kit",
    describe(descriptors = {}) {
      const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : 0]));
      counts.total = Object.values(counts).reduce((sum, value) => sum + Number(value || 0), 0);
      return {
        id: "scene-time-capsule-courier-renderer-handoff",
        contract: "renderer-consumes-descriptors-only",
        rendererConsumesDescriptorsOnly: true,
        sourceBoundary: "scene-time-capsule-courier-readiness-domain",
        descriptors,
        counts
      };
    }
  };
}

export function createSceneTimeCapsuleCourierReadinessDomainKit() {
  const kits = {
    keepsakeTag: createSceneKeepsakeTagKit(),
    archiveSatchel: createSceneArchiveSatchelKit(),
    lanternCourierThread: createSceneLanternCourierThreadKit(),
    gateSeal: createSceneGateSealKit(),
    oathLedger: createSceneOathLedgerKit(),
    timeCapsuleThreshold: createSceneTimeCapsuleThresholdKit(),
    rendererHandoff: createSceneTimeCapsuleCourierRendererHandoffKit()
  };
  return {
    id: "scene-time-capsule-courier-readiness-domain-kit",
    tree: SCENE_TIME_CAPSULE_COURIER_READINESS_TREE,
    kits,
    describe(sceneId = "camp", state = {}) {
      const input = normalizeState({ ...state, sceneId });
      const descriptors = {
        keepsakeTags: kits.keepsakeTag.describe(input),
        archiveSatchels: kits.archiveSatchel.describe(input),
        lanternCourierThreads: kits.lanternCourierThread.describe(input),
        gateSeals: kits.gateSeal.describe(input),
        oathLedgers: kits.oathLedger.describe(input),
        timeCapsuleThresholds: kits.timeCapsuleThreshold.describe(input)
      };
      const rendererHandoff = kits.rendererHandoff.describe(descriptors);
      const readiness = clamp01(input.progress * 0.36 + input.memory * 0.32 + input.inventory.length * 0.045 + input.visited.length * 0.035 + (1 - input.pressure) * 0.14);
      return {
        id: `scene-time-capsule-courier-readiness-${input.sceneId}`,
        sceneId: input.sceneId,
        summary: {
          readiness: round(readiness),
          phase: readiness > 0.74 ? "seal-ready" : readiness > 0.48 ? "courier-threading" : "memory-gathering",
          descriptorCount: rendererHandoff.counts.total,
          pressure: round(input.pressure),
          memory: round(input.memory)
        },
        rendererHandoff
      };
    },
    snapshot(sceneId = "camp", state = {}) {
      const described = this.describe(sceneId, state);
      return { id: described.id, sceneId: described.sceneId, summary: described.summary, counts: described.rendererHandoff.counts };
    }
  };
}

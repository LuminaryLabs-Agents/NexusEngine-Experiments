const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(Number(value)) ? Number(value) : 0));
const clampNumber = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));
const round = (value, places = 3) => Number(clampNumber(value).toFixed(places));
const hashText = (text = "") => [...String(text)].reduce((sum, char) => sum + char.charCodeAt(0), 0);

export const SCENE_FLOOD_RESCUE_READINESS_TREE = {
  id: "scene-flood-rescue-readiness-domain",
  owns: ["flood rescue descriptors", "scene evacuation readiness", "renderer handoff policy"],
  excludes: ["renderer", "DOM", "browser input", "Three.js", "WebGL", "audio", "asset loading", "frame loop", "storage"],
  tree: {
    "survivor-location-domain": {
      "evacuee-trace-domain": ["scene-evacuee-trace-kit"],
      "flood-gauge-domain": ["scene-flood-gauge-band-kit"]
    },
    "crossing-stabilization-domain": {
      "canoe-mooring-domain": ["scene-canoe-mooring-kit"],
      "rope-bridge-domain": ["scene-rope-bridge-span-kit"]
    },
    "dawn-relief-domain": {
      "blanket-cache-domain": ["scene-warm-blanket-cache-kit"],
      "rescue-roster-domain": ["scene-dawn-roster-ledger-kit"]
    },
    "renderer-handoff": ["scene-flood-rescue-renderer-handoff-kit"]
  }
};

const SCENE_ORDER = ["camp", "crossroads", "forest", "bridge", "shrine", "ending"];

function normalizeSceneId(input = {}) {
  return String(input.sceneId || input.activeScene || input.currentSceneId || input.scene || "camp");
}

function normalizeState(input = {}) {
  const inventory = Array.isArray(input.inventory) ? input.inventory.map(String) : [];
  const log = Array.isArray(input.log) ? input.log.map(String) : [];
  const sceneId = normalizeSceneId(input);
  const visited = Array.isArray(input.visited) ? input.visited.map(String) : [sceneId];
  const actions = Array.isArray(input.actions) ? input.actions : [];
  const pressure = clampNumber(input.pressure ?? input.pressureScore ?? input.score ?? (log.length * 0.08 + inventory.length * 0.05), 0, 1);
  const progress = clampNumber(input.progress ?? (inventory.length + visited.length) / 10, 0, 1);
  const seed = hashText(`${sceneId}:${inventory.join("|")}:${visited.join("|")}:${log.slice(0, 3).join("|")}`);
  return { sceneId, inventory, log, visited, actions, pressure, progress, seed };
}

function point(seed, index, xBase, yBase) {
  const x = ((seed * 17 + index * 29 + xBase) % 100) / 100;
  const y = ((seed * 31 + index * 19 + yBase) % 100) / 100;
  return { x01: round(0.08 + x * 0.84), y01: round(0.14 + y * 0.72) };
}

export function createSceneEvacueeTraceKit() {
  return {
    id: "scene-evacuee-trace-kit",
    describe(input = {}) {
      const state = normalizeState(input);
      const count = 3 + (state.visited.length % 3);
      return Array.from({ length: count }, (_, index) => {
        const p = point(state.seed, index, 7, 11);
        return {
          id: `evacuee-trace-${state.sceneId}-${index}`,
          kind: "evacuee-trace",
          sceneId: state.sceneId,
          ...p,
          opacity: round(0.34 + clamp01(state.progress) * 0.48),
          urgency: round(0.35 + state.pressure * 0.55),
          label: index === 0 ? "primary survivor trace" : "secondary trace"
        };
      });
    }
  };
}

export function createSceneFloodGaugeBandKit() {
  return {
    id: "scene-flood-gauge-band-kit",
    describe(input = {}) {
      const state = normalizeState(input);
      return [0, 1, 2].map((band) => ({
        id: `flood-gauge-${state.sceneId}-${band}`,
        kind: "flood-gauge-band",
        sceneId: state.sceneId,
        x01: round(0.12 + band * 0.28),
        y01: round(0.78 - band * 0.09 - state.pressure * 0.1),
        width01: round(0.2 + state.pressure * 0.16),
        height01: round(0.014 + band * 0.005),
        severity: state.pressure > 0.68 ? "surging" : state.pressure > 0.38 ? "rising" : "watch"
      }));
    }
  };
}

export function createSceneCanoeMooringKit() {
  return {
    id: "scene-canoe-mooring-kit",
    describe(input = {}) {
      const state = normalizeState(input);
      const hasLantern = state.inventory.includes("has-lantern");
      return [0, 1].map((slot) => ({
        id: `canoe-mooring-${state.sceneId}-${slot}`,
        kind: "canoe-mooring",
        sceneId: state.sceneId,
        ...point(state.seed, slot, 41, 23),
        radius01: round(0.025 + slot * 0.006 + (hasLantern ? 0.006 : 0)),
        ready: hasLantern || state.sceneId === "bridge" || state.progress > 0.45,
        tetherLoad: round(0.42 + state.pressure * 0.42 + slot * 0.08)
      }));
    }
  };
}

export function createSceneRopeBridgeSpanKit() {
  return {
    id: "scene-rope-bridge-span-kit",
    describe(input = {}) {
      const state = normalizeState(input);
      const index = Math.max(0, SCENE_ORDER.indexOf(state.sceneId));
      return [0, 1, 2].map((span) => ({
        id: `rope-bridge-span-${state.sceneId}-${span}`,
        kind: "rope-bridge-span",
        sceneId: state.sceneId,
        x01: round(0.18 + span * 0.21),
        y01: round(0.32 + ((index + span) % 3) * 0.09),
        length01: round(0.16 + state.progress * 0.12),
        angle: Math.round(-18 + span * 18 + state.pressure * 20),
        tension: round(0.3 + state.progress * 0.4 + state.pressure * 0.22)
      }));
    }
  };
}

export function createSceneWarmBlanketCacheKit() {
  return {
    id: "scene-warm-blanket-cache-kit",
    describe(input = {}) {
      const state = normalizeState(input);
      const solved = state.inventory.filter((item) => item.includes("lit") || item.includes("repaired") || item.includes("open")).length;
      return [0, 1].map((cache) => ({
        id: `blanket-cache-${state.sceneId}-${cache}`,
        kind: "warm-blanket-cache",
        sceneId: state.sceneId,
        ...point(state.seed, cache, 73, 37),
        warmth: round(0.44 + solved * 0.12 + cache * 0.05),
        assigned: solved > cache,
        label: cache === 0 ? "dry blanket cache" : "tea and lantern cache"
      }));
    }
  };
}

export function createSceneDawnRosterLedgerKit() {
  return {
    id: "scene-dawn-roster-ledger-kit",
    describe(input = {}) {
      const state = normalizeState(input);
      const complete = state.sceneId === "ending" || state.inventory.includes("shrine-open");
      return SCENE_ORDER.slice(0, 4).map((scene, slot) => ({
        id: `dawn-roster-${scene}-${slot}`,
        kind: "dawn-roster-ledger",
        sceneId: scene,
        x01: round(0.2 + slot * 0.17),
        y01: round(0.88 - slot * 0.03),
        accounted: complete || state.visited.includes(scene) || state.sceneId === scene,
        confidence: round(0.28 + state.progress * 0.52 + (state.visited.includes(scene) ? 0.18 : 0))
      }));
    }
  };
}

export function createSceneFloodRescueRendererHandoffKit() {
  return {
    id: "scene-flood-rescue-renderer-handoff-kit",
    describe(descriptors = {}) {
      const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : 0]));
      counts.total = Object.values(counts).reduce((sum, value) => sum + Number(value || 0), 0);
      return {
        id: "scene-flood-rescue-renderer-handoff",
        contract: "renderer-consumes-descriptors-only",
        rendererConsumesDescriptorsOnly: true,
        sourceBoundary: "scene-flood-rescue-readiness-domain",
        descriptors,
        counts
      };
    }
  };
}

export function createSceneFloodRescueReadinessDomainKit() {
  const kits = {
    evacueeTrace: createSceneEvacueeTraceKit(),
    floodGauge: createSceneFloodGaugeBandKit(),
    canoeMooring: createSceneCanoeMooringKit(),
    ropeBridge: createSceneRopeBridgeSpanKit(),
    warmBlanketCache: createSceneWarmBlanketCacheKit(),
    dawnRoster: createSceneDawnRosterLedgerKit(),
    rendererHandoff: createSceneFloodRescueRendererHandoffKit()
  };
  return {
    id: "scene-flood-rescue-readiness-domain-kit",
    tree: SCENE_FLOOD_RESCUE_READINESS_TREE,
    kits,
    describe(sceneId = "camp", state = {}) {
      const input = normalizeState({ ...state, sceneId });
      const descriptors = {
        evacueeTraces: kits.evacueeTrace.describe(input),
        floodGaugeBands: kits.floodGauge.describe(input),
        canoeMoorings: kits.canoeMooring.describe(input),
        ropeBridgeSpans: kits.ropeBridge.describe(input),
        warmBlanketCaches: kits.warmBlanketCache.describe(input),
        dawnRosterLedgers: kits.dawnRoster.describe(input)
      };
      const rendererHandoff = kits.rendererHandoff.describe(descriptors);
      const readiness = round((input.progress * 0.4) + ((1 - input.pressure) * 0.22) + (input.inventory.length / 8) * 0.2 + (input.visited.length / 6) * 0.18);
      return {
        id: `scene-flood-rescue-readiness-${input.sceneId}`,
        sceneId: input.sceneId,
        summary: {
          readiness,
          phase: readiness > 0.72 ? "dawn-relief-ready" : readiness > 0.45 ? "crossing-stabilizing" : "survivor-location",
          descriptorCount: rendererHandoff.counts.total,
          pressure: round(input.pressure)
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

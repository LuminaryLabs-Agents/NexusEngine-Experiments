export const SCENE_EVIDENCE_RITUAL_READINESS_DOMAIN_TREE = `
peer-scene-evidence-ritual-readiness-domain
├─ testimony-domain
│  ├─ witness-statement-domain
│  │  └─ scene-witness-statement-web-kit
│  └─ contradiction-thread-domain
│     └─ scene-contradiction-thread-kit
├─ proof-assembly-domain
│  ├─ evidence-board-domain
│  │  └─ scene-evidence-board-pin-kit
│  └─ ritual-sequence-domain
│     └─ scene-ritual-sequence-rune-kit
├─ verdict-pressure-domain
│  ├─ doubt-pressure-domain
│  │  └─ scene-doubt-pressure-dial-kit
│  └─ verdict-door-domain
│     └─ scene-verdict-door-readiness-kit
└─ renderer-handoff
   └─ scene-evidence-ritual-renderer-handoff-kit
      └─ renderer consumes descriptors only
`;

const ORDER = ["camp", "crossroads", "forest", "bridge", "shrine", "ending"];
const GLYPHS = ["ash", "fork", "lantern", "rope", "vow", "dawn"];
const REQUIRED_PROOF = ["Lantern", "Bridge rope", "Forest sequence solved", "Bridge repaired", "Shrine opened"];

function clamp01(value) {
  const number = Number.isFinite(Number(value)) ? Number(value) : 0;
  return Math.max(0, Math.min(1, number));
}

function normalizeState(state = {}) {
  const inventory = Array.isArray(state.inventory) ? state.inventory : [];
  const visitedScenes = Array.isArray(state.visitedScenes) ? state.visitedScenes : [];
  const log = Array.isArray(state.log) ? state.log : [];
  return {
    ...state,
    currentScene: state.currentScene ?? state.sceneId ?? "camp",
    inventory,
    visitedScenes,
    log,
    pressureScore: Number.isFinite(Number(state.pressureScore)) ? Number(state.pressureScore) : log.length * 9
  };
}

function sceneEntries(scenes = {}) {
  const entries = Object.entries(scenes);
  return entries.length ? entries : ORDER.map((id) => [id, { title: id, exits: {} }]);
}

function hasProof(state, token) {
  return state.inventory.includes(token) || state.inventory.includes(token.toLowerCase()) || state.inventory.includes(token.replaceAll(" ", "-"));
}

function missingForScene(scene, state) {
  return Object.values(scene.exits ?? {}).flatMap((exit) => (exit.requires ?? []).filter((need) => !state.inventory.includes(need) && !state.inventory.includes(String(need).replaceAll("-", " "))));
}

export function createSceneWitnessStatementWebKit() {
  return {
    id: "scene-witness-statement-web-kit",
    describe({ sceneId = "camp", state = {}, scenes = {} } = {}) {
      const safe = normalizeState(state);
      return sceneEntries(scenes).map(([id, scene], index) => {
        const current = id === sceneId || id === safe.currentScene;
        const visited = current || safe.visitedScenes.includes(id);
        const exitCount = Object.keys(scene.exits ?? {}).length;
        return {
          id: `witness-${id}`,
          kind: "witness-statement-web",
          sceneId: id,
          label: scene.title ?? id,
          slot: index,
          x: 12 + ((index * 17) % 74),
          y: 16 + ((index * 23) % 62),
          trust: clamp01((visited ? 0.52 : 0.16) + exitCount * 0.08 + (current ? 0.24 : 0)),
          current,
          visited,
          exitCount
        };
      });
    },
    snapshot(input) {
      const webs = this.describe(input);
      return { kit: this.id, webs: webs.length, active: webs.filter((web) => web.visited).length };
    }
  };
}

export function createSceneContradictionThreadKit() {
  return {
    id: "scene-contradiction-thread-kit",
    describe({ sceneId = "camp", state = {}, scenes = {} } = {}) {
      const safe = normalizeState(state);
      return sceneEntries(scenes).flatMap(([id, scene], sceneIndex) => {
        const missing = missingForScene(scene, safe);
        const exits = Object.values(scene.exits ?? {});
        return exits.map((exit, exitIndex) => {
          const required = exit.requires ?? [];
          const blocked = required.some((need) => missing.includes(need));
          return {
            id: `contradiction-${id}-${exit.to ?? exitIndex}`,
            kind: "contradiction-thread",
            sceneId: id,
            targetSceneId: exit.to ?? "unknown",
            label: exit.label ?? exit.to ?? "route",
            slot: sceneIndex * 2 + exitIndex,
            arc: clamp01((sceneIndex + 1) / Math.max(1, ORDER.length)),
            tension: clamp01((blocked ? 0.58 : 0.18) + required.length * 0.16 + (id === sceneId ? 0.12 : 0)),
            blocked,
            missing: required.filter((need) => !safe.inventory.includes(need))
          };
        });
      });
    },
    snapshot(input) {
      const threads = this.describe(input);
      return { kit: this.id, threads: threads.length, blocked: threads.filter((thread) => thread.blocked).length };
    }
  };
}

export function createSceneEvidenceBoardPinKit() {
  return {
    id: "scene-evidence-board-pin-kit",
    describe({ state = {} } = {}) {
      const safe = normalizeState(state);
      const pins = [
        ...safe.inventory.map((item, index) => ({ source: "inventory", label: item, index })),
        ...safe.visitedScenes.map((scene, index) => ({ source: "visited", label: scene, index: index + safe.inventory.length }))
      ];
      return pins.slice(0, 10).map((pin, index) => ({
        id: `evidence-pin-${pin.source}-${String(pin.label).replaceAll(" ", "-")}`,
        kind: "evidence-board-pin",
        label: String(pin.label),
        source: pin.source,
        slot: index,
        x: 10 + ((index * 19) % 78),
        y: 18 + ((index * 29) % 58),
        weight: clamp01(0.28 + index * 0.07 + (pin.source === "inventory" ? 0.22 : 0.08))
      }));
    },
    snapshot(input) {
      const pins = this.describe(input);
      return { kit: this.id, pins: pins.length, inventoryPins: pins.filter((pin) => pin.source === "inventory").length };
    }
  };
}

export function createSceneRitualSequenceRuneKit() {
  return {
    id: "scene-ritual-sequence-rune-kit",
    describe({ sceneId = "camp", state = {} } = {}) {
      const safe = normalizeState(state);
      const currentIndex = Math.max(0, ORDER.indexOf(sceneId));
      return ORDER.map((id, index) => {
        const visited = id === sceneId || safe.visitedScenes.includes(id);
        const solved = visited || index < currentIndex;
        return {
          id: `ritual-rune-${id}`,
          kind: "ritual-sequence-rune",
          sceneId: id,
          glyph: GLYPHS[index] ?? id.slice(0, 3),
          slot: index,
          phase: solved ? "lit" : index === currentIndex + 1 ? "next" : "dormant",
          completion: clamp01((visited ? 0.65 : 0.15) + (solved ? 0.25 : 0) + safe.inventory.length * 0.025)
        };
      });
    },
    snapshot(input) {
      const runes = this.describe(input);
      return { kit: this.id, runes: runes.length, lit: runes.filter((rune) => rune.phase === "lit").length };
    }
  };
}

export function createSceneDoubtPressureDialKit() {
  return {
    id: "scene-doubt-pressure-dial-kit",
    describe({ sceneId = "camp", state = {}, scenes = {} } = {}) {
      const safe = normalizeState(state);
      const missingRouteCount = sceneEntries(scenes).reduce((sum, [, scene]) => sum + missingForScene(scene, safe).length, 0);
      const proofCount = REQUIRED_PROOF.filter((token) => hasProof(safe, token)).length;
      const dials = [
        { label: "missing proof", value: clamp01(missingRouteCount / 6), tone: "risk" },
        { label: "route memory", value: clamp01(safe.visitedScenes.length / ORDER.length), tone: "memory" },
        { label: "ritual proof", value: clamp01(proofCount / REQUIRED_PROOF.length), tone: "proof" },
        { label: "scene pressure", value: clamp01(safe.pressureScore / 100), tone: "pressure" }
      ];
      return dials.map((dial, index) => ({
        id: `doubt-dial-${index}`,
        kind: "doubt-pressure-dial",
        sceneId,
        slot: index,
        label: dial.label,
        value: dial.value,
        tone: dial.tone,
        severity: dial.tone === "risk" || dial.tone === "pressure" ? dial.value : 1 - dial.value
      }));
    },
    snapshot(input) {
      const dials = this.describe(input);
      return { kit: this.id, dials: dials.length, highest: Math.max(...dials.map((dial) => dial.value), 0) };
    }
  };
}

export function createSceneVerdictDoorReadinessKit() {
  return {
    id: "scene-verdict-door-readiness-kit",
    describe({ sceneId = "camp", state = {}, scenes = {} } = {}) {
      const safe = normalizeState(state);
      const proofCount = REQUIRED_PROOF.filter((token) => hasProof(safe, token)).length;
      const routeCount = sceneEntries(scenes).length;
      const visitedCount = new Set([safe.currentScene, ...safe.visitedScenes]).size;
      const routeReadiness = clamp01(visitedCount / Math.max(1, routeCount));
      const proofReadiness = clamp01(proofCount / REQUIRED_PROOF.length);
      return [{
        id: "verdict-door-final",
        kind: "verdict-door-readiness",
        sceneId,
        label: "Dawn verdict door",
        routeReadiness,
        proofReadiness,
        readiness: clamp01((routeReadiness + proofReadiness) / 2),
        open: routeReadiness > 0.82 && proofReadiness > 0.78,
        missingProof: REQUIRED_PROOF.filter((token) => !hasProof(safe, token))
      }];
    },
    snapshot(input) {
      const [door] = this.describe(input);
      return { kit: this.id, doors: 1, readiness: door.readiness, open: door.open };
    }
  };
}

export function createSceneEvidenceRitualRendererHandoffKit() {
  return {
    id: "scene-evidence-ritual-renderer-handoff-kit",
    describe(descriptors = {}) {
      const counts = {
        witnessStatementWebs: descriptors.witnessStatementWebs?.length ?? 0,
        contradictionThreads: descriptors.contradictionThreads?.length ?? 0,
        evidenceBoardPins: descriptors.evidenceBoardPins?.length ?? 0,
        ritualSequenceRunes: descriptors.ritualSequenceRunes?.length ?? 0,
        doubtPressureDials: descriptors.doubtPressureDials?.length ?? 0,
        verdictDoorReadiness: descriptors.verdictDoorReadiness?.length ?? 0
      };
      return {
        id: this.id,
        policy: "renderer-consumes-descriptors-only",
        descriptors,
        counts,
        descriptorCount: Object.values(counts).reduce((sum, count) => sum + count, 0)
      };
    },
    snapshot(descriptors) {
      const handoff = this.describe(descriptors);
      return { kit: this.id, ...handoff.counts, descriptorCount: handoff.descriptorCount };
    }
  };
}

export function createSceneEvidenceRitualReadinessDomainKit() {
  const witnessStatementWebKit = createSceneWitnessStatementWebKit();
  const contradictionThreadKit = createSceneContradictionThreadKit();
  const evidenceBoardPinKit = createSceneEvidenceBoardPinKit();
  const ritualSequenceRuneKit = createSceneRitualSequenceRuneKit();
  const doubtPressureDialKit = createSceneDoubtPressureDialKit();
  const verdictDoorReadinessKit = createSceneVerdictDoorReadinessKit();
  const rendererHandoffKit = createSceneEvidenceRitualRendererHandoffKit();

  function descriptors(input = {}) {
    return {
      witnessStatementWebs: witnessStatementWebKit.describe(input),
      contradictionThreads: contradictionThreadKit.describe(input),
      evidenceBoardPins: evidenceBoardPinKit.describe(input),
      ritualSequenceRunes: ritualSequenceRuneKit.describe(input),
      doubtPressureDials: doubtPressureDialKit.describe(input),
      verdictDoorReadiness: verdictDoorReadinessKit.describe(input)
    };
  }

  return {
    id: "peer-scene-evidence-ritual-readiness-domain-kit",
    tree: SCENE_EVIDENCE_RITUAL_READINESS_DOMAIN_TREE,
    kitCount: 8,
    describe(input = {}) {
      const handoff = rendererHandoffKit.describe(descriptors(input));
      return {
        sceneId: input.sceneId ?? input.state?.currentScene ?? "camp",
        kit: this.id,
        kitCount: this.kitCount,
        policy: handoff.policy,
        descriptors: handoff.descriptors,
        counts: handoff.counts,
        descriptorCount: handoff.descriptorCount
      };
    },
    snapshot(input = {}) {
      const description = this.describe(input);
      const door = description.descriptors.verdictDoorReadiness[0];
      return {
        kit: this.id,
        sceneId: description.sceneId,
        kitCount: this.kitCount,
        ...description.counts,
        descriptorCount: description.descriptorCount,
        verdictReadiness: door?.readiness ?? 0,
        verdictOpen: Boolean(door?.open)
      };
    }
  };
}

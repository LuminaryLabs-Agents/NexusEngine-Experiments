export const SCENE_BELL_ARCHIVE_EVACUATION_DOMAIN = Object.freeze({
  id: "scene-bell-archive-evacuation-readiness-domain",
  owns: [
    "sceneId",
    "visitedSceneCount",
    "archiveCrateCount",
    "signalCordCount",
    "plankCrossingCount",
    "witnessRosterCount",
    "readinessScore",
    "evacuationPhase",
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
    "storage",
    "navigation",
    "physics"
  ],
  tree: `scene-bell-archive-evacuation-readiness-domain
├─ audible-warning-domain
│  ├─ bell-tower-anchor-domain
│  │  └─ scene-bell-tower-anchor-kit
│  └─ signal-cord-thread-domain
│     └─ scene-signal-cord-thread-kit
├─ archive-preservation-domain
│  ├─ archive-crate-domain
│  │  └─ scene-archive-crate-kit
│  └─ flood-plank-crossing-domain
│     └─ scene-flood-plank-crossing-kit
├─ witness-handoff-domain
│  ├─ witness-roster-seal-domain
│  │  └─ scene-witness-roster-seal-kit
│  └─ dawn-evidence-ledger-domain
│     └─ scene-dawn-evidence-ledger-kit
└─ renderer-handoff
   └─ scene-bell-archive-evacuation-renderer-handoff-kit
      └─ renderer consumes descriptors only`
});

const SCENE_ORDER = Object.freeze(["camp", "crossroads", "forest", "bridge"]);
const SCENE_LABELS = Object.freeze({
  camp: "Camp",
  crossroads: "Crossroads",
  forest: "Forest",
  bridge: "Bridge"
});

function clamp01(value) {
  const numeric = Number.isFinite(Number(value)) ? Number(value) : 0;
  return Math.max(0, Math.min(1, numeric));
}

function clamp(value, min, max) {
  const numeric = Number.isFinite(Number(value)) ? Number(value) : min;
  return Math.max(min, Math.min(max, numeric));
}

function normalizeList(value) {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function normalizeState(input = {}) {
  const sceneId = String(input.sceneId || input.activeScene || input.currentScene || "camp");
  const visited = normalizeList(input.visited ?? input.visitedScenes ?? input.scenesVisited);
  const inventory = normalizeList(input.inventory ?? input.items);
  const log = normalizeList(input.log ?? input.messages);
  const actions = normalizeList(input.actions ?? input.completedActions ?? input.doneActions);
  const pressure = clamp(Number(input.pressure ?? input.pressureScore ?? input.floodPressure ?? 0), 0, 100);
  return {
    sceneId: SCENE_ORDER.includes(sceneId) ? sceneId : "camp",
    visited: visited.length ? visited : [sceneId],
    inventory,
    log,
    actions,
    pressure,
    time: clamp(Number(input.time ?? input.tick ?? 0), 0, 9999),
    seed: String(input.seed ?? sceneId)
  };
}

function hasToken(state, token) {
  const needle = token.toLowerCase();
  return [...state.inventory, ...state.actions, ...state.log].some((item) => String(item).toLowerCase().includes(needle));
}

function makeDescriptor(kind, id, fields = {}) {
  return Object.freeze({ kind, id, ...fields });
}

function sceneIndex(sceneId) {
  return Math.max(0, SCENE_ORDER.indexOf(sceneId));
}

function readinessBucket(score) {
  if (score >= 84) return "ready-for-dawn-handoff";
  if (score >= 60) return "evacuation-chain-staged";
  if (score >= 34) return "archive-warning-open";
  return "unprepared";
}

export function createSceneBellTowerAnchorKit() {
  return Object.freeze({
    id: "scene-bell-tower-anchor-kit",
    describe(input = {}) {
      const state = normalizeState(input);
      const index = sceneIndex(state.sceneId);
      const visitedWeight = clamp01(state.visited.length / SCENE_ORDER.length);
      return SCENE_ORDER.map((scene, slot) => makeDescriptor("bellTowerAnchor", `bell-anchor-${scene}`, {
        scene,
        label: `${SCENE_LABELS[scene]} bell anchor`,
        x: 14 + slot * 23,
        y: 18 + ((slot + index) % 2) * 11,
        height: 42 + slot * 7,
        rungCount: 2 + slot + Math.round(visitedWeight * 2),
        armed: state.visited.includes(scene) || slot <= index,
        resonance: Number(clamp01(0.26 + visitedWeight * 0.52 + (slot === index ? 0.18 : 0)).toFixed(3))
      }));
    }
  });
}

export function createSceneSignalCordThreadKit() {
  return Object.freeze({
    id: "scene-signal-cord-thread-kit",
    describe(input = {}) {
      const state = normalizeState(input);
      const index = sceneIndex(state.sceneId);
      return SCENE_ORDER.slice(0, -1).map((scene, slot) => makeDescriptor("signalCordThread", `signal-cord-${scene}-${SCENE_ORDER[slot + 1]}`, {
        from: scene,
        to: SCENE_ORDER[slot + 1],
        slot,
        tension: Number(clamp01(0.32 + slot * 0.12 + state.visited.length * 0.08 - state.pressure / 260).toFixed(3)),
        lit: slot < index || state.visited.includes(SCENE_ORDER[slot + 1]),
        sag: Number(clamp01(0.7 - state.visited.length * 0.08 + state.pressure / 220).toFixed(3)),
        label: `${SCENE_LABELS[scene]} to ${SCENE_LABELS[SCENE_ORDER[slot + 1]]} warning cord`
      }));
    }
  });
}

export function createSceneArchiveCrateKit() {
  return Object.freeze({
    id: "scene-archive-crate-kit",
    describe(input = {}) {
      const state = normalizeState(input);
      const hasClue = hasToken(state, "clue") || hasToken(state, "map") || hasToken(state, "evidence");
      return SCENE_ORDER.map((scene, slot) => makeDescriptor("archiveCrate", `archive-crate-${scene}`, {
        scene,
        slot,
        label: `${SCENE_LABELS[scene]} sealed archive crate`,
        crateCount: 1 + slot + (hasClue ? 1 : 0),
        sealed: hasClue || state.visited.includes(scene),
        preservation: Number(clamp01(0.24 + (state.visited.includes(scene) ? 0.31 : 0) + (hasClue ? 0.25 : 0) - state.pressure / 300).toFixed(3)),
        x: 18 + slot * 18,
        y: 64 - (slot % 2) * 12
      }));
    }
  });
}

export function createSceneFloodPlankCrossingKit() {
  return Object.freeze({
    id: "scene-flood-plank-crossing-kit",
    describe(input = {}) {
      const state = normalizeState(input);
      const plankBonus = hasToken(state, "rope") || hasToken(state, "plank") || hasToken(state, "bridge") ? 0.22 : 0;
      return SCENE_ORDER.slice(1).map((scene, slot) => makeDescriptor("floodPlankCrossing", `flood-plank-${scene}`, {
        scene,
        slot,
        label: `${SCENE_LABELS[scene]} archive plank crossing`,
        plankCount: 2 + slot + Math.round(plankBonus * 6),
        safe: state.visited.includes(scene) && state.pressure < 78,
        waterline: Number(clamp01(0.32 + state.pressure / 130 - plankBonus - state.visited.length * 0.035).toFixed(3)),
        routeWidth: Number((1.2 + slot * 0.35 + plankBonus).toFixed(2))
      }));
    }
  });
}

export function createSceneWitnessRosterSealKit() {
  return Object.freeze({
    id: "scene-witness-roster-seal-kit",
    describe(input = {}) {
      const state = normalizeState(input);
      const witnessTokens = ["witness", "oracle", "family", "guide", "keeper"].filter((token) => hasToken(state, token)).length;
      return SCENE_ORDER.map((scene, slot) => makeDescriptor("witnessRosterSeal", `witness-roster-${scene}`, {
        scene,
        slot,
        label: `${SCENE_LABELS[scene]} witness roster seal`,
        signed: state.visited.includes(scene),
        witnessCount: Math.max(1, witnessTokens + (state.visited.includes(scene) ? 1 : 0) + slot % 2),
        sealIntegrity: Number(clamp01(0.3 + witnessTokens * 0.13 + (state.visited.includes(scene) ? 0.24 : 0) - state.pressure / 360).toFixed(3))
      }));
    }
  });
}

export function createSceneDawnEvidenceLedgerKit() {
  return Object.freeze({
    id: "scene-dawn-evidence-ledger-kit",
    describe(input = {}, families = {}) {
      const state = normalizeState(input);
      const bellCount = families.bellTowerAnchors?.filter((item) => item.armed).length ?? 0;
      const crateCount = families.archiveCrates?.filter((item) => item.sealed).length ?? 0;
      const rosterCount = families.witnessRosterSeals?.filter((item) => item.signed).length ?? 0;
      const crossingSafety = families.floodPlankCrossings?.filter((item) => item.safe).length ?? 0;
      const readiness = Math.round(clamp01((bellCount + crateCount + rosterCount + crossingSafety) / 15) * 100);
      return [makeDescriptor("dawnEvidenceLedger", "dawn-evidence-ledger", {
        label: "Dawn evidence evacuation ledger",
        bellCount,
        crateCount,
        rosterCount,
        crossingSafety,
        readiness,
        phase: readinessBucket(readiness),
        missing: [
          bellCount < 4 ? "arm bell anchors" : null,
          crateCount < 4 ? "seal archive crates" : null,
          rosterCount < 4 ? "sign witness rosters" : null,
          crossingSafety < 3 ? "stabilize plank crossings" : null
        ].filter(Boolean)
      })];
    }
  });
}

export function createSceneBellArchiveEvacuationRendererHandoffKit() {
  return Object.freeze({
    id: "scene-bell-archive-evacuation-renderer-handoff-kit",
    describe(input = {}, descriptors = {}) {
      const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : 0]));
      return Object.freeze({
        type: "scene-bell-archive-evacuation-renderer-handoff",
        policy: "renderer-consumes-descriptors-only",
        descriptors,
        counts,
        ownership: {
          reusableLogic: "plain-input-to-plain-descriptor-output",
          renderer: "consume-only",
          exclusions: SCENE_BELL_ARCHIVE_EVACUATION_DOMAIN.excludes
        }
      });
    }
  });
}

export function createSceneBellArchiveEvacuationReadinessDomainKit() {
  const bellTowerKit = createSceneBellTowerAnchorKit();
  const signalCordKit = createSceneSignalCordThreadKit();
  const archiveCrateKit = createSceneArchiveCrateKit();
  const floodPlankKit = createSceneFloodPlankCrossingKit();
  const witnessRosterKit = createSceneWitnessRosterSealKit();
  const dawnLedgerKit = createSceneDawnEvidenceLedgerKit();
  const handoffKit = createSceneBellArchiveEvacuationRendererHandoffKit();

  return Object.freeze({
    id: "scene-bell-archive-evacuation-readiness-domain-kit",
    tree: SCENE_BELL_ARCHIVE_EVACUATION_DOMAIN.tree,
    describe(input = {}) {
      const state = normalizeState(input);
      const descriptors = {
        bellTowerAnchors: bellTowerKit.describe(state),
        signalCordThreads: signalCordKit.describe(state),
        archiveCrates: archiveCrateKit.describe(state),
        floodPlankCrossings: floodPlankKit.describe(state),
        witnessRosterSeals: witnessRosterKit.describe(state)
      };
      descriptors.dawnEvidenceLedgers = dawnLedgerKit.describe(state, descriptors);
      const handoff = handoffKit.describe(state, descriptors);
      const ledger = descriptors.dawnEvidenceLedgers[0];
      const floodPressure = Math.round(clamp01((state.pressure + (100 - ledger.readiness) * 0.55) / 155) * 100);
      return Object.freeze({
        domainId: SCENE_BELL_ARCHIVE_EVACUATION_DOMAIN.id,
        tree: SCENE_BELL_ARCHIVE_EVACUATION_DOMAIN.tree,
        sceneId: state.sceneId,
        readiness: ledger.readiness,
        floodPressure,
        phase: ledger.phase,
        missing: ledger.missing,
        descriptors,
        rendererHandoff: handoff
      });
    },
    snapshot(input = {}) {
      const readiness = this.describe(input);
      return Object.freeze({
        domainId: readiness.domainId,
        sceneId: readiness.sceneId,
        readiness: readiness.readiness,
        floodPressure: readiness.floodPressure,
        phase: readiness.phase,
        counts: readiness.rendererHandoff.counts
      });
    }
  });
}

function stableArray(value) {
  return Array.isArray(value) ? [...value] : [];
}

function unique(value) {
  return [...new Set(stableArray(value).filter(Boolean))];
}

function clamp(value, min, max) {
  const next = Number(value);
  if (!Number.isFinite(next)) return min;
  return Math.max(min, Math.min(max, next));
}

function clamp01(value) {
  return clamp(value, 0, 1);
}

function hasToken(state, token) {
  return Boolean(state?.tokens?.includes(token) || state?.flags?.[token]);
}

function hashText(value = "") {
  let hash = 0;
  for (const char of String(value)) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

function seededUnit(seed, index = 0) {
  const n = Math.sin((hashText(seed) + index * 109) * 12.9898) * 43758.5453;
  return n - Math.floor(n);
}

function sceneFrom(manifestKit, sceneId) {
  const scene = manifestKit?.get?.(sceneId);
  return {
    id: sceneId,
    title: scene?.title ?? sceneId,
    exits: scene?.exits ?? {},
    landmarks: stableArray(scene?.landmarks).length ? stableArray(scene.landmarks) : [sceneId, "route", "gate"],
    mood: scene?.mood ?? sceneId,
    palette: stableArray(scene?.palette).length ? stableArray(scene.palette) : ["#111827", "#f2c36b", "#ffffff"]
  };
}

function completionForState(state) {
  const tokens = ["has-lantern", "has-rope", "forest-lit", "bridge-repaired", "shrine-open"];
  const count = tokens.filter((token) => hasToken(state, token)).length;
  return Math.round((count / tokens.length) * 100);
}

function pressureScore(state) {
  const pressure = state?.pressure?.score;
  if (Number.isFinite(pressure)) return clamp(pressure, 0, 100);
  const ledger = stableArray(state?.transitionLedger).length + stableArray(state?.actionLedger).length + stableArray(state?.blockedLedger).length;
  return clamp(stableArray(state?.visitedSceneIds).length * 6 + ledger * 3, 0, 100);
}

const OBJECTIVE_STEPS = [
  { token: "has-lantern", label: "Lantern acquired", sceneId: "camp", shortLabel: "lantern" },
  { token: "has-rope", label: "Bridge rope packed", sceneId: "camp", shortLabel: "rope" },
  { token: "forest-lit", label: "Forest route lit", sceneId: "forest", shortLabel: "forest" },
  { token: "bridge-repaired", label: "Bridge repaired", sceneId: "bridge", shortLabel: "bridge" },
  { token: "shrine-open", label: "Shrine seal opened", sceneId: "shrine", shortLabel: "seal" }
];

export function createSceneObjectiveBeatKit({ manifestKit } = {}) {
  return {
    id: "n-peer-scene-objective-beat-kit",
    domain: "peer-scene-chronicle/objective-beats",
    describe(sceneId, state) {
      const current = sceneFrom(manifestKit, sceneId);
      const completion = completionForState(state);
      return OBJECTIVE_STEPS.map((step, index) => {
        const done = hasToken(state, step.token);
        const currentScene = sceneId === step.sceneId;
        const readiness = clamp01((done ? 0.92 : currentScene ? 0.72 : 0.34) + completion / 260 - index * 0.025);
        return {
          id: `${sceneId}-objective-beat-${step.token}`,
          sceneId,
          token: step.token,
          label: step.label,
          shortLabel: step.shortLabel,
          anchorSceneId: step.sceneId,
          anchorSceneTitle: sceneFrom(manifestKit, step.sceneId).title,
          done,
          currentScene,
          slot: index,
          readiness: Number(readiness.toFixed(2)),
          drift: Number((0.18 + seededUnit(`${current.id}:beat`, index) * 0.72).toFixed(2)),
          palette: current.palette[index % current.palette.length]
        };
      });
    },
    snapshot(sceneId, state) {
      const beats = this.describe(sceneId, state);
      return { sceneId, beats: beats.length, done: beats.filter((beat) => beat.done).length, active: beats.filter((beat) => beat.currentScene && !beat.done).length };
    }
  };
}

export function createSceneClueThreadKit({ manifestKit, inventoryKit } = {}) {
  return {
    id: "n-peer-scene-clue-thread-kit",
    domain: "peer-scene-chronicle/clue-threads",
    describe(sceneId, state) {
      const scene = sceneFrom(manifestKit, sceneId);
      const exits = Object.entries(scene.exits);
      const source = exits.length ? exits : [["complete", { to: sceneId, label: "Resolve scene", requires: [] }]];
      return source.map(([exitId, exit], index) => {
        const missing = stableArray(inventoryKit?.missing?.(state, exit.requires ?? []) ?? []);
        const open = missing.length === 0;
        return {
          id: `${sceneId}-clue-thread-${exitId}`,
          sceneId,
          exitId,
          to: exit.to,
          label: exit.label,
          clue: open ? `path to ${exit.to}` : `needs ${missing.join(" + ")}`,
          open,
          missing,
          slot: index,
          arc: Number((0.18 + index * 0.19 + (open ? 0.3 : 0.06)).toFixed(2)),
          pressure: Number(clamp(0.16 + missing.length * 0.32 + pressureScore(state) / 180, 0.12, 0.94).toFixed(2)),
          weight: Number(clamp01(open ? 0.78 : 0.36 + missing.length * 0.18).toFixed(2))
        };
      });
    },
    snapshot(sceneId, state) {
      const threads = this.describe(sceneId, state);
      return { sceneId, threads: threads.length, open: threads.filter((thread) => thread.open).length, sealed: threads.filter((thread) => !thread.open).length };
    }
  };
}

export function createSceneInventoryConstellationKit() {
  return {
    id: "n-peer-scene-inventory-constellation-kit",
    domain: "peer-scene-chronicle/inventory-constellation",
    describe(sceneId, state) {
      const tokens = unique([...(state?.tokens ?? []), ...Object.keys(state?.flags ?? {})]);
      const source = tokens.length ? tokens : ["empty-pack"];
      const stars = source.slice(0, 10).map((token, index) => ({
        id: `${sceneId}-inventory-star-${token}`,
        sceneId,
        token,
        lit: token !== "empty-pack",
        x: Math.round(8 + seededUnit(`${sceneId}:inventory:x`, index) * 84),
        y: Math.round(14 + seededUnit(`${sceneId}:inventory:y`, index) * 66),
        radius: token === "empty-pack" ? 2 : 4 + (index % 3),
        label: token.replace(/[-_]/g, " "),
        weight: Number(clamp01(0.24 + index * 0.055 + completionForState(state) / 190).toFixed(2))
      }));
      return { sceneId, stars, tokenCount: tokens.length };
    },
    snapshot(sceneId, state) {
      const constellation = this.describe(sceneId, state);
      return { sceneId, stars: constellation.stars.length, tokens: constellation.tokenCount, lit: constellation.stars.filter((star) => star.lit).length };
    }
  };
}

export function createScenePressureWeatherKit() {
  return {
    id: "n-peer-scene-pressure-weather-kit",
    domain: "peer-scene-chronicle/pressure-weather",
    describe(sceneId, state) {
      const pressure = pressureScore(state);
      const blocked = stableArray(state?.blockedLedger).length;
      return Array.from({ length: 5 }, (_, index) => ({
        id: `${sceneId}-pressure-weather-${index}`,
        sceneId,
        band: index,
        pressure,
        blockedBias: blocked,
        x: Math.round(4 + index * 20 + seededUnit(`${sceneId}:weather:x`, index) * 8),
        y: Math.round(8 + seededUnit(`${sceneId}:weather:y`, index) * 62),
        spread: Number(clamp(0.18 + pressure / 140 + index * 0.08, 0.16, 0.96).toFixed(2)),
        severity: pressure > 70 ? "storm" : pressure > 34 ? "charged" : "clear",
        opacity: Number(clamp(0.14 + pressure / 210 + blocked * 0.025, 0.12, 0.78).toFixed(2))
      }));
    },
    snapshot(sceneId, state) {
      const weather = this.describe(sceneId, state);
      return { sceneId, fronts: weather.length, severity: weather[0]?.severity ?? "clear", pressure: pressureScore(state) };
    }
  };
}

export function createSceneContinuitySpliceKit() {
  return {
    id: "n-peer-scene-continuity-splice-kit",
    domain: "peer-scene-chronicle/continuity-splices",
    describe(sceneId, state) {
      const visited = unique(state?.visitedSceneIds ?? [sceneId]);
      const transitions = stableArray(state?.transitionLedger);
      const source = visited.length ? visited : [sceneId];
      return source.slice(0, 8).map((visitedSceneId, index) => ({
        id: `${sceneId}-continuity-splice-${visitedSceneId}-${index}`,
        sceneId,
        visitedSceneId,
        index,
        previous: transitions[index - 1]?.from ?? null,
        next: transitions[index]?.to ?? null,
        current: visitedSceneId === sceneId,
        slot: index,
        arc: Number((0.12 + index * 0.11).toFixed(2)),
        weight: Number(clamp01((visitedSceneId === sceneId ? 0.9 : 0.42) + index * 0.035).toFixed(2))
      }));
    },
    snapshot(sceneId, state) {
      const splices = this.describe(sceneId, state);
      return { sceneId, splices: splices.length, current: splices.filter((splice) => splice.current).length };
    }
  };
}

export function createSceneChoiceReadabilityKit({ actionKit } = {}) {
  return {
    id: "n-peer-scene-choice-readability-kit",
    domain: "peer-scene-chronicle/choice-readability",
    describe(sceneId, state) {
      const actions = stableArray(actionKit?.list?.(sceneId, state));
      const source = actions.length ? actions : [{ id: "observe", label: "Observe", done: false, blocked: false, missing: [] }];
      return source.slice(0, 6).map((action, index) => ({
        id: `${sceneId}-choice-readability-${action.id}`,
        sceneId,
        actionId: action.id,
        label: action.label,
        state: action.done ? "resolved" : action.blocked ? "locked" : "available",
        missing: stableArray(action.missing),
        slot: index,
        pulse: Number(clamp01(action.done ? 0.18 : action.blocked ? 0.46 : 0.88).toFixed(2)),
        priority: action.done ? 0 : action.blocked ? 1 : 2,
        glyph: action.done ? "✓" : action.blocked ? "×" : "•"
      }));
    },
    snapshot(sceneId, state) {
      const choices = this.describe(sceneId, state);
      return { sceneId, choices: choices.length, available: choices.filter((choice) => choice.state === "available").length, locked: choices.filter((choice) => choice.state === "locked").length };
    }
  };
}

export function createSceneChronicleRendererHandoffKit() {
  return {
    id: "n-peer-scene-chronicle-renderer-handoff-kit",
    domain: "peer-scene-chronicle/renderer-handoff",
    describe({ sceneId, objectiveBeats, clueThreads, inventoryConstellation, pressureWeather, continuitySplices, choiceReadability, baseDescriptorId = null }) {
      return {
        id: `${sceneId}-chronicle-renderer-handoff`,
        sceneId,
        baseDescriptorId,
        rendererOwns: ["placement", "style tokens", "event display"],
        rendererMustNotOwn: ["state mutation", "route solving", "inventory truth", "choice eligibility", "descriptor synthesis"],
        descriptors: {
          objectiveBeats,
          clueThreads,
          inventoryConstellation,
          pressureWeather,
          continuitySplices,
          choiceReadability
        },
        counts: {
          objectiveBeats: objectiveBeats.length,
          clueThreads: clueThreads.length,
          inventoryStars: inventoryConstellation.stars.length,
          pressureWeather: pressureWeather.length,
          continuitySplices: continuitySplices.length,
          choiceReadability: choiceReadability.length
        }
      };
    },
    snapshot(handoff) {
      return { sceneId: handoff.sceneId, ...handoff.counts };
    }
  };
}

export function createSceneChronicleDomainKit({ manifestKit, inventoryKit, actionKit } = {}) {
  const objectiveBeatKit = createSceneObjectiveBeatKit({ manifestKit });
  const clueThreadKit = createSceneClueThreadKit({ manifestKit, inventoryKit });
  const inventoryConstellationKit = createSceneInventoryConstellationKit();
  const pressureWeatherKit = createScenePressureWeatherKit();
  const continuitySpliceKit = createSceneContinuitySpliceKit();
  const choiceReadabilityKit = createSceneChoiceReadabilityKit({ actionKit });
  const rendererHandoffKit = createSceneChronicleRendererHandoffKit();
  return {
    id: "n-peer-scene-chronicle-domain-kit",
    domain: "peer-scene-chronicle-domain",
    kits: { objectiveBeatKit, clueThreadKit, inventoryConstellationKit, pressureWeatherKit, continuitySpliceKit, choiceReadabilityKit, rendererHandoffKit },
    describe(sceneId, state, context = {}) {
      const objectiveBeats = objectiveBeatKit.describe(sceneId, state);
      const clueThreads = clueThreadKit.describe(sceneId, state);
      const inventoryConstellation = inventoryConstellationKit.describe(sceneId, state);
      const pressureWeather = pressureWeatherKit.describe(sceneId, state);
      const continuitySplices = continuitySpliceKit.describe(sceneId, state);
      const choiceReadability = choiceReadabilityKit.describe(sceneId, state);
      return rendererHandoffKit.describe({
        sceneId,
        objectiveBeats,
        clueThreads,
        inventoryConstellation,
        pressureWeather,
        continuitySplices,
        choiceReadability,
        baseDescriptorId: context.baseHandoff?.id ?? context.atmospheric?.id ?? null
      });
    },
    snapshot(sceneId, state) {
      const handoff = this.describe(sceneId, state);
      return {
        kitCount: Object.keys(this.kits).length,
        sceneId,
        objective: objectiveBeatKit.snapshot(sceneId, state),
        clues: clueThreadKit.snapshot(sceneId, state),
        inventory: inventoryConstellationKit.snapshot(sceneId, state),
        weather: pressureWeatherKit.snapshot(sceneId, state),
        continuity: continuitySpliceKit.snapshot(sceneId, state),
        choices: choiceReadabilityKit.snapshot(sceneId, state),
        handoff: rendererHandoffKit.snapshot(handoff)
      };
    }
  };
}

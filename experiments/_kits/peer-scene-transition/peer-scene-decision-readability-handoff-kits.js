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
  return Boolean(state?.tokens?.includes(token) || state?.flags?.[token] || state?.inventory?.includes(token));
}

function hashText(value = "") {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededUnit(seed, index = 0) {
  const n = Math.sin((hashText(seed) + index * 131) * 12.9898) * 43758.5453;
  return n - Math.floor(n);
}

function sceneFrom(manifestKit, sceneId) {
  const scene = manifestKit?.get?.(sceneId);
  return {
    id: sceneId,
    title: scene?.title ?? sceneId,
    exits: scene?.exits ?? {},
    landmarks: stableArray(scene?.landmarks).length ? stableArray(scene.landmarks) : [sceneId, "threshold", "choice"],
    mood: scene?.mood ?? sceneId,
    palette: stableArray(scene?.palette).length ? stableArray(scene.palette) : ["#111827", "#e9b872", "#ffffff"]
  };
}

function pressureScore(state) {
  const pressure = state?.pressure?.score;
  if (Number.isFinite(pressure)) return clamp(pressure, 0, 100);
  return clamp(stableArray(state?.blockedLedger).length * 16 + stableArray(state?.transitionLedger).length * 6 + stableArray(state?.actionLedger).length * 4, 0, 100);
}

function completionForState(state) {
  const goals = ["has-lantern", "has-rope", "forest-lit", "bridge-repaired", "shrine-open"];
  return goals.filter((token) => hasToken(state, token)).length / goals.length;
}

function rendererBoundary(owner) {
  return {
    owner,
    rendererOwns: ["placement", "CSS class mapping", "draw order", "animation timing"],
    rendererMustNotOwn: ["state mutation", "inventory truth", "route solving", "action eligibility", "decision ranking", "browser input", "asset loading", "frame-loop ownership"]
  };
}

export const PEER_SCENE_DECISION_READABILITY_DOMAIN_TREE = Object.freeze({
  root: "peer-scene-decision-readability-domain",
  subdomains: [
    {
      id: "choice-intent-domain",
      subdomains: [
        { id: "action-likelihood-domain", kits: ["scene-action-likelihood-radar-kit"] },
        { id: "exit-choice-domain", kits: ["scene-exit-choice-scorecard-kit"] }
      ]
    },
    {
      id: "requirement-memory-domain",
      subdomains: [
        { id: "gate-requirement-domain", kits: ["scene-gate-requirement-ladder-kit"] },
        { id: "inventory-use-domain", kits: ["scene-inventory-use-echo-kit"] }
      ]
    },
    {
      id: "tempo-pressure-domain",
      subdomains: [
        { id: "pressure-release-domain", kits: ["scene-pressure-release-window-kit"] },
        { id: "narrative-thread-domain", kits: ["scene-narrative-thread-pin-kit"] }
      ]
    },
    {
      id: "renderer-handoff",
      kits: ["scene-decision-readability-renderer-handoff-kit"],
      contract: "renderer consumes descriptors only"
    }
  ],
  contract: "atomic decision readability descriptors only; no renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop ownership"
});

export function createSceneActionLikelihoodRadarKit({ actionKit } = {}) {
  return {
    id: "n-peer-scene-action-likelihood-radar-kit",
    domain: "peer-scene-decision-readability/action-likelihood",
    describe(sceneId, state) {
      const actions = stableArray(actionKit?.list?.(sceneId, state));
      const source = actions.length ? actions : [{ id: "observe", label: "Observe scene", done: false, blocked: false, missing: [] }];
      return source.slice(0, 6).map((action, index) => {
        const readiness = action.done ? 0.18 : action.blocked ? 0.32 : 0.86;
        return {
          id: `${sceneId}-action-likelihood-${action.id ?? index}`,
          sceneId,
          actionId: action.id ?? `action-${index}`,
          label: action.label ?? "Action",
          state: action.done ? "done" : action.blocked ? "blocked" : "ready",
          missing: stableArray(action.missing),
          slot: index,
          x: Math.round(14 + index * 13 + seededUnit(`${sceneId}:action:x`, index) * 9),
          y: Math.round(22 + seededUnit(`${sceneId}:action:y`, index) * 44),
          likelihood: Number(clamp01(readiness + completionForState(state) * 0.08).toFixed(2)),
          rendererBoundary: rendererBoundary("scene-action-likelihood-radar-kit")
        };
      });
    },
    snapshot(sceneId, state) {
      const radars = this.describe(sceneId, state);
      return { sceneId, radars: radars.length, ready: radars.filter((radar) => radar.state === "ready").length };
    }
  };
}

export function createSceneGateRequirementLadderKit({ manifestKit, inventoryKit } = {}) {
  return {
    id: "n-peer-scene-gate-requirement-ladder-kit",
    domain: "peer-scene-decision-readability/gate-requirements",
    describe(sceneId, state) {
      const scene = sceneFrom(manifestKit, sceneId);
      const exits = Object.entries(scene.exits);
      const source = exits.length ? exits : [["stay", { to: sceneId, label: "Stay", requires: [] }]];
      return source.slice(0, 6).map(([exitId, exit], index) => {
        const required = stableArray(exit.requires);
        const missing = stableArray(inventoryKit?.missing?.(state, required) ?? required.filter((token) => !hasToken(state, token)));
        const open = missing.length === 0;
        return {
          id: `${sceneId}-gate-requirement-${exitId}`,
          sceneId,
          exitId,
          to: exit.to ?? sceneId,
          label: exit.label ?? exitId,
          required,
          missing,
          open,
          rung: index,
          height: Number(clamp01(0.22 + required.length * 0.18 + missing.length * 0.22).toFixed(2)),
          arc: Number((0.12 + index * 0.12 + (open ? 0.3 : 0.04)).toFixed(2)),
          rendererBoundary: rendererBoundary("scene-gate-requirement-ladder-kit")
        };
      });
    },
    snapshot(sceneId, state) {
      const ladders = this.describe(sceneId, state);
      return { sceneId, ladders: ladders.length, open: ladders.filter((ladder) => ladder.open).length, blocked: ladders.filter((ladder) => !ladder.open).length };
    }
  };
}

export function createSceneInventoryUseEchoKit({ manifestKit } = {}) {
  return {
    id: "n-peer-scene-inventory-use-echo-kit",
    domain: "peer-scene-decision-readability/inventory-use",
    describe(sceneId, state) {
      const scene = sceneFrom(manifestKit, sceneId);
      const inventory = unique([...(state?.inventory ?? []), ...(state?.tokens ?? [])]);
      const source = inventory.length ? inventory : ["empty-hands"];
      return source.slice(0, 7).map((item, index) => {
        const token = String(item);
        const relevance = stableArray(Object.values(scene.exits)).some((exit) => stableArray(exit.requires).includes(token)) || token.includes(sceneId);
        return {
          id: `${sceneId}-inventory-use-${token}`,
          sceneId,
          token,
          label: token.replace(/[-_]/g, " "),
          relevance: relevance ? "route-key" : token === "empty-hands" ? "missing" : "context",
          x: Math.round(10 + index * 11 + seededUnit(`${sceneId}:inventory:x`, index) * 7),
          y: Math.round(12 + seededUnit(`${sceneId}:inventory:y`, index) * 55),
          weight: Number(clamp01((relevance ? 0.82 : 0.42) + index * 0.03).toFixed(2)),
          rendererBoundary: rendererBoundary("scene-inventory-use-echo-kit")
        };
      });
    },
    snapshot(sceneId, state) {
      const echoes = this.describe(sceneId, state);
      return { sceneId, echoes: echoes.length, routeKeys: echoes.filter((echo) => echo.relevance === "route-key").length };
    }
  };
}

export function createScenePressureReleaseWindowKit({ actionKit } = {}) {
  return {
    id: "n-peer-scene-pressure-release-window-kit",
    domain: "peer-scene-decision-readability/pressure-release",
    describe(sceneId, state) {
      const pressure = pressureScore(state);
      const actions = stableArray(actionKit?.list?.(sceneId, state));
      const readyActions = actions.filter((action) => !action.done && !action.blocked);
      const blocked = stableArray(state?.blockedLedger).length;
      const source = readyActions.length ? readyActions : actions.slice(0, 2).length ? actions.slice(0, 2) : [{ id: "breathe", label: "Breathe", blocked: false, done: false }];
      return source.slice(0, 5).map((action, index) => {
        const relief = clamp01((action.blocked ? 0.2 : 0.62) + (100 - pressure) / 260 - blocked * 0.025);
        return {
          id: `${sceneId}-pressure-release-${action.id ?? index}`,
          sceneId,
          actionId: action.id ?? `release-${index}`,
          label: action.label ?? "Release pressure",
          pressure,
          relief: Number(relief.toFixed(2)),
          urgency: Number(clamp01(pressure / 100 + index * 0.08).toFixed(2)),
          slot: index,
          rendererBoundary: rendererBoundary("scene-pressure-release-window-kit")
        };
      });
    },
    snapshot(sceneId, state) {
      const windows = this.describe(sceneId, state);
      return { sceneId, windows: windows.length, bestRelief: windows.reduce((max, window) => Math.max(max, window.relief), 0) };
    }
  };
}

export function createSceneNarrativeThreadPinKit({ manifestKit } = {}) {
  return {
    id: "n-peer-scene-narrative-thread-pin-kit",
    domain: "peer-scene-decision-readability/narrative-thread",
    describe(sceneId, state) {
      const scenes = stableArray(manifestKit?.list?.());
      const visited = new Set(stableArray(state?.visitedSceneIds));
      const currentIndex = Math.max(0, scenes.findIndex((scene) => scene.id === sceneId));
      const source = scenes.length ? scenes : [sceneFrom(manifestKit, sceneId)];
      return source.slice(0, 8).map((scene, index) => ({
        id: `${sceneId}-narrative-thread-${scene.id ?? index}`,
        sceneId,
        targetSceneId: scene.id ?? sceneId,
        label: scene.title ?? scene.id ?? sceneId,
        current: (scene.id ?? sceneId) === sceneId,
        visited: visited.has(scene.id),
        orderDelta: Math.abs(index - currentIndex),
        slot: index,
        weight: Number(clamp01((visited.has(scene.id) ? 0.72 : 0.26) + ((scene.id ?? sceneId) === sceneId ? 0.22 : 0) - Math.abs(index - currentIndex) * 0.04).toFixed(2)),
        rendererBoundary: rendererBoundary("scene-narrative-thread-pin-kit")
      }));
    },
    snapshot(sceneId, state) {
      const pins = this.describe(sceneId, state);
      return { sceneId, pins: pins.length, visited: pins.filter((pin) => pin.visited).length };
    }
  };
}

export function createSceneExitChoiceScorecardKit({ manifestKit, inventoryKit } = {}) {
  return {
    id: "n-peer-scene-exit-choice-scorecard-kit",
    domain: "peer-scene-decision-readability/exit-choice-scorecard",
    describe(sceneId, state) {
      const scene = sceneFrom(manifestKit, sceneId);
      const exits = Object.entries(scene.exits);
      const source = exits.length ? exits : [["wait", { to: sceneId, label: "Hold scene", requires: [] }]];
      const pressure = pressureScore(state);
      return source.slice(0, 6).map(([exitId, exit], index) => {
        const missing = stableArray(inventoryKit?.missing?.(state, exit.requires ?? []) ?? []);
        const open = missing.length === 0;
        const seenTarget = stableArray(state?.visitedSceneIds).includes(exit.to);
        const score = clamp01((open ? 0.7 : 0.18) + (seenTarget ? 0.08 : 0.18) - pressure / 320 + index * 0.02);
        return {
          id: `${sceneId}-exit-choice-${exitId}`,
          sceneId,
          exitId,
          to: exit.to ?? sceneId,
          label: exit.label ?? exitId,
          open,
          missing,
          seenTarget,
          score: Number(score.toFixed(2)),
          slot: index,
          arc: Number((0.18 + index * 0.14 + score * 0.18).toFixed(2)),
          rendererBoundary: rendererBoundary("scene-exit-choice-scorecard-kit")
        };
      });
    },
    snapshot(sceneId, state) {
      const choices = this.describe(sceneId, state);
      return { sceneId, choices: choices.length, bestScore: choices.reduce((max, choice) => Math.max(max, choice.score), 0) };
    }
  };
}

export function createSceneDecisionReadabilityRendererHandoffKit() {
  return {
    id: "n-peer-scene-decision-readability-renderer-handoff-kit",
    domain: "peer-scene-decision-readability/renderer-handoff",
    describe({ sceneId, actionLikelihood, gateRequirements, inventoryUseEchoes, pressureReleaseWindows, narrativeThreadPins, exitChoiceScorecards, baseDescriptorId = null }) {
      return {
        id: `${sceneId}-decision-readability-renderer-handoff`,
        sceneId,
        domainTree: PEER_SCENE_DECISION_READABILITY_DOMAIN_TREE,
        baseDescriptorId,
        rendererBoundary: rendererBoundary("scene-decision-readability-renderer-handoff-kit"),
        descriptors: { actionLikelihood, gateRequirements, inventoryUseEchoes, pressureReleaseWindows, narrativeThreadPins, exitChoiceScorecards },
        counts: {
          actionLikelihood: actionLikelihood.length,
          gateRequirements: gateRequirements.length,
          inventoryUseEchoes: inventoryUseEchoes.length,
          pressureReleaseWindows: pressureReleaseWindows.length,
          narrativeThreadPins: narrativeThreadPins.length,
          exitChoiceScorecards: exitChoiceScorecards.length
        }
      };
    },
    snapshot(handoff) {
      return { sceneId: handoff.sceneId, ...handoff.counts };
    }
  };
}

export function createSceneDecisionReadabilityDomainKit({ manifestKit, inventoryKit, actionKit } = {}) {
  const actionLikelihoodRadarKit = createSceneActionLikelihoodRadarKit({ actionKit });
  const gateRequirementLadderKit = createSceneGateRequirementLadderKit({ manifestKit, inventoryKit });
  const inventoryUseEchoKit = createSceneInventoryUseEchoKit({ manifestKit });
  const pressureReleaseWindowKit = createScenePressureReleaseWindowKit({ actionKit });
  const narrativeThreadPinKit = createSceneNarrativeThreadPinKit({ manifestKit });
  const exitChoiceScorecardKit = createSceneExitChoiceScorecardKit({ manifestKit, inventoryKit });
  const rendererHandoffKit = createSceneDecisionReadabilityRendererHandoffKit();
  return {
    id: "n-peer-scene-decision-readability-domain-kit",
    domain: "peer-scene-decision-readability-domain",
    kits: { actionLikelihoodRadarKit, gateRequirementLadderKit, inventoryUseEchoKit, pressureReleaseWindowKit, narrativeThreadPinKit, exitChoiceScorecardKit, rendererHandoffKit },
    describe(sceneId, state, context = {}) {
      const actionLikelihood = actionLikelihoodRadarKit.describe(sceneId, state);
      const gateRequirements = gateRequirementLadderKit.describe(sceneId, state);
      const inventoryUseEchoes = inventoryUseEchoKit.describe(sceneId, state);
      const pressureReleaseWindows = pressureReleaseWindowKit.describe(sceneId, state);
      const narrativeThreadPins = narrativeThreadPinKit.describe(sceneId, state);
      const exitChoiceScorecards = exitChoiceScorecardKit.describe(sceneId, state);
      return rendererHandoffKit.describe({
        sceneId,
        actionLikelihood,
        gateRequirements,
        inventoryUseEchoes,
        pressureReleaseWindows,
        narrativeThreadPins,
        exitChoiceScorecards,
        baseDescriptorId: context.consequence?.id ?? context.chronicle?.id ?? context.atmospheric?.id ?? context.baseHandoff?.id ?? null
      });
    },
    snapshot(sceneId, state) {
      const handoff = this.describe(sceneId, state);
      return {
        kitCount: Object.keys(this.kits).length,
        sceneId,
        actions: actionLikelihoodRadarKit.snapshot(sceneId, state),
        gates: gateRequirementLadderKit.snapshot(sceneId, state),
        inventory: inventoryUseEchoKit.snapshot(sceneId, state),
        pressure: pressureReleaseWindowKit.snapshot(sceneId, state),
        narrative: narrativeThreadPinKit.snapshot(sceneId, state),
        exits: exitChoiceScorecardKit.snapshot(sceneId, state),
        handoff: rendererHandoffKit.snapshot(handoff)
      };
    }
  };
}

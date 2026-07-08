const DEFAULT_SCENE_KIND = "web-html-scene";

function stableArray(value) {
  return Array.isArray(value) ? [...value] : [];
}

function unique(value) {
  return [...new Set(stableArray(value).filter(Boolean))];
}

function hasToken(state, token) {
  return Boolean(state?.tokens?.includes(token) || state?.flags?.[token]);
}

function missingTokens(state, requirements = []) {
  return stableArray(requirements).filter((token) => !hasToken(state, token));
}

function clamp01(value) {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function hashText(value = "") {
  let hash = 0;
  for (const char of String(value)) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

function seededUnit(seed, index = 0) {
  const n = Math.sin((hashText(seed) + index * 101) * 12.9898) * 43758.5453;
  return n - Math.floor(n);
}

export function createSceneManifestKit(manifest = {}) {
  const scenes = Object.fromEntries(
    Object.entries(manifest).map(([id, scene]) => [
      id,
      {
        id,
        title: String(scene.title ?? id),
        copy: String(scene.copy ?? ""),
        kind: scene.kind ?? DEFAULT_SCENE_KIND,
        entry: scene.entry ?? `./${id}.html`,
        exits: scene.exits ?? {},
        mood: scene.mood ?? moodForScene(id),
        landmarks: stableArray(scene.landmarks),
        palette: scene.palette ?? paletteForScene(id)
      }
    ])
  );
  return {
    id: "n-peer-scene-manifest-kit",
    domain: "scene-manifest",
    list: () => Object.values(scenes),
    get: (id) => scenes[id] ?? null,
    ids: () => Object.keys(scenes),
    snapshot: () => ({ sceneCount: Object.keys(scenes).length, sceneIds: Object.keys(scenes) })
  };
}

export function createSceneStateKit({ storageKey = "nexus.peerSceneTransition.v3", initialSceneId = "camp" } = {}) {
  return {
    id: "n-peer-scene-state-kit",
    domain: "scene-state",
    fresh(sceneId = initialSceneId) {
      return {
        storageKey,
        currentSceneId: sceneId,
        previousSceneId: null,
        visitedSceneIds: [sceneId],
        inventory: [],
        tokens: [],
        flags: {},
        transitionLedger: [],
        blockedLedger: [],
        actionLedger: [],
        pressure: { score: 0, routeComplexity: 0, solvedScenes: 0 },
        log: ["Scene system booted."]
      };
    },
    normalize(state, sceneId = initialSceneId) {
      const next = { ...this.fresh(sceneId), ...(state ?? {}) };
      next.currentSceneId = sceneId;
      next.visitedSceneIds = unique([...(next.visitedSceneIds ?? []), sceneId]);
      next.inventory = unique(next.inventory);
      next.tokens = unique(next.tokens);
      next.flags = next.flags ?? {};
      next.transitionLedger = stableArray(next.transitionLedger);
      next.blockedLedger = stableArray(next.blockedLedger);
      next.actionLedger = stableArray(next.actionLedger);
      next.log = stableArray(next.log).slice(0, 12);
      return next;
    },
    snapshot(state) {
      return {
        currentScene: state.currentSceneId,
        previousScene: state.previousSceneId,
        visitedScenes: unique(state.visitedSceneIds),
        inventory: unique(state.inventory),
        tokens: unique(state.tokens),
        flags: { ...(state.flags ?? {}) },
        acceptedTransitions: stableArray(state.transitionLedger),
        blockedTransitions: stableArray(state.blockedLedger).slice(-6),
        actions: stableArray(state.actionLedger).slice(-8),
        pressure: state.pressure ?? {},
        latestLog: stableArray(state.log).slice(0, 6)
      };
    }
  };
}

export function createSceneInventoryKit() {
  return {
    id: "n-peer-scene-inventory-kit",
    domain: "scene-inventory",
    has: hasToken,
    give(state, token, label = token) {
      if (!state.tokens.includes(token)) state.tokens.push(token);
      if (!state.inventory.includes(label)) state.inventory.push(label);
      return { token, label, acquired: true };
    },
    flag(state, token) {
      state.flags[token] = true;
      return { token, flagged: true };
    },
    missing: missingTokens,
    snapshot(state) {
      return { inventory: unique(state.inventory), tokens: unique(state.tokens), flags: { ...(state.flags ?? {}) } };
    }
  };
}

export function createSceneActionKit({ inventoryKit = createSceneInventoryKit() } = {}) {
  const actionMap = {
    camp: [
      { id: "take-lantern", label: "Take lantern", token: "has-lantern", item: "Lantern", log: "Lantern acquired. Forest route can now validate." },
      { id: "pack-rope", label: "Pack bridge rope", token: "has-rope", item: "Bridge rope", log: "Rope packed for the old bridge puzzle." },
      { id: "read-road-map", label: "Read the ash-road map", flag: "roadMapRead", log: "The map marks forest, bridge, shrine, and return routes." }
    ],
    forest: [
      { id: "call-moths", label: "Call the moon moths", flag: "forestMoths", log: "Moon moths circle the lantern." },
      { id: "tune-lantern", label: "Tune the lantern glass", flag: "lanternTuned", requires: ["forestMoths"], blockedLabel: "Call moths first", log: "The lantern beam turns blue." },
      { id: "open-root-arch", label: "Open the root arch", token: "forest-lit", item: "Forest path lit", requires: ["lanternTuned"], blockedLabel: "Tune lantern first", log: "Forest puzzle solved. Shrine exit is valid." }
    ],
    bridge: [
      { id: "anchor-rope", label: "Anchor the bridge rope", flag: "bridgeRopeAnchored", requires: ["has-rope"], blockedLabel: "Pack rope at camp first", log: "Rope anchored to the stone post." },
      { id: "set-plank", label: "Set the fallen plank", flag: "bridgePlankSet", requires: ["bridgeRopeAnchored"], blockedLabel: "Anchor rope first", log: "The plank locks into place." },
      { id: "test-crossing", label: "Test the crossing", token: "bridge-repaired", item: "Bridge repaired", requires: ["bridgePlankSet"], blockedLabel: "Set plank first", log: "Bridge puzzle solved. Shrine exit is valid." }
    ],
    shrine: [
      { id: "place-lantern", label: "Place lantern on altar", flag: "shrineLanternPlaced", requires: ["has-lantern"], blockedLabel: "Lantern required", log: "The altar catches the lantern light." },
      { id: "trace-ledger", label: "Trace the route ledger", flag: "shrineRouteTraced", requires: ["shrineLanternPlaced"], blockedLabel: "Place lantern first", log: "The shrine reads your visited-scene ledger." },
      { id: "align-seal", label: "Align the scene seal", token: "shrine-open", item: "Shrine seal open", requires: ["shrineRouteTraced"], blockedLabel: "Trace route first", log: "Shrine puzzle solved. Ending exit is valid." }
    ],
    ending: [{ id: "reset", label: "Reset campaign snapshot", reset: true, log: "Campaign snapshot reset." }]
  };
  return {
    id: "n-peer-scene-action-kit",
    domain: "scene-actions",
    list(sceneId, state) {
      return stableArray(actionMap[sceneId]).map((action) => {
        const missing = inventoryKit.missing(state, action.requires ?? []);
        const done = Boolean((action.token && inventoryKit.has(state, action.token)) || (action.flag && state.flags[action.flag]));
        return { ...action, done, blocked: missing.length > 0, missing };
      });
    },
    apply(state, action) {
      if (!action || action.blocked || action.done) return { state, changed: false, reason: action?.blocked ? "blocked" : "noop" };
      if (action.reset) return { state, changed: true, reset: true, log: action.log };
      let outcome = null;
      if (action.token) outcome = inventoryKit.give(state, action.token, action.item ?? action.token);
      if (action.flag) outcome = inventoryKit.flag(state, action.flag);
      state.actionLedger.unshift({ sceneId: state.currentSceneId, actionId: action.id, outcome });
      state.actionLedger = state.actionLedger.slice(0, 12);
      return { state, changed: true, outcome, log: action.log };
    },
    snapshot(sceneId, state) {
      return { sceneId, actions: this.list(sceneId, state).map(({ id, label, done, blocked, missing }) => ({ id, label, done, blocked, missing })) };
    }
  };
}

export function createSceneTransitionKit({ inventoryKit = createSceneInventoryKit(), manifestKit } = {}) {
  return {
    id: "n-peer-scene-transition-kit",
    domain: "scene-transition",
    resolve(state, exitId) {
      const scene = manifestKit?.get(state.currentSceneId);
      const exit = scene?.exits?.[exitId];
      if (!exit) return { accepted: false, reason: "missing-exit", exitId };
      const missing = inventoryKit.missing(state, exit.requires ?? []);
      if (missing.length) return { accepted: false, reason: "requirements", from: state.currentSceneId, to: exit.to, exitId, missing, label: exit.label };
      return { accepted: true, from: state.currentSceneId, to: exit.to, exitId, label: exit.label };
    },
    apply(state, resolution) {
      if (!resolution?.accepted) {
        state.blockedLedger.push(resolution);
        return state;
      }
      state.previousSceneId = state.currentSceneId;
      state.currentSceneId = resolution.to;
      state.visitedSceneIds = unique([...state.visitedSceneIds, resolution.to]);
      state.transitionLedger.push({ from: resolution.from, to: resolution.to, exitId: resolution.exitId });
      return state;
    },
    targetEntry(sceneId) {
      const entry = manifestKit?.get(sceneId)?.entry ?? `./${sceneId}.html`;
      return entry === "./ending.html" ? "./final.html" : entry;
    },
    snapshot(state) {
      return { currentSceneId: state.currentSceneId, accepted: state.transitionLedger.length, blocked: state.blockedLedger.length };
    }
  };
}

export function createSceneRouteGraphKit({ manifestKit } = {}) {
  return {
    id: "n-peer-scene-route-graph-kit",
    domain: "scene-route-graph",
    describe(state) {
      const scenes = manifestKit?.list?.() ?? [];
      const visited = new Set(stableArray(state?.visitedSceneIds));
      const current = state?.currentSceneId;
      const nodes = scenes.map((scene, index) => ({
        id: scene.id,
        title: scene.title,
        mood: scene.mood,
        visited: visited.has(scene.id),
        current: scene.id === current,
        orbit: index,
        exitCount: Object.keys(scene.exits ?? {}).length
      }));
      const edges = scenes.flatMap((scene) =>
        Object.entries(scene.exits ?? {}).map(([exitId, exit]) => ({
          id: `${scene.id}:${exitId}:${exit.to}`,
          from: scene.id,
          to: exit.to,
          label: exit.label,
          requires: stableArray(exit.requires),
          gated: stableArray(exit.requires).some((token) => !hasToken(state, token))
        }))
      );
      return { nodes, edges, visitedCount: nodes.filter((node) => node.visited).length };
    },
    snapshot(state) {
      const graph = this.describe(state);
      return { nodes: graph.nodes.length, edges: graph.edges.length, visitedCount: graph.visitedCount };
    }
  };
}

export function createSceneGatePreviewKit({ manifestKit, inventoryKit = createSceneInventoryKit() } = {}) {
  return {
    id: "n-peer-scene-gate-preview-kit",
    domain: "scene-gate-preview",
    describe(sceneId, state) {
      const scene = manifestKit?.get(sceneId) ?? {};
      return Object.entries(scene.exits ?? {}).map(([exitId, exit], index) => {
        const missing = inventoryKit.missing(state, exit.requires ?? []);
        return {
          id: `${sceneId}-${exitId}-gate`,
          exitId,
          to: exit.to,
          label: exit.label,
          open: missing.length === 0,
          missing,
          intensity: missing.length === 0 ? 1 : 0.34,
          glyph: missing.length === 0 ? "open" : "sealed",
          slot: index
        };
      });
    },
    snapshot(sceneId, state) {
      const gates = this.describe(sceneId, state);
      return { sceneId, gates: gates.length, open: gates.filter((gate) => gate.open).length, sealed: gates.filter((gate) => !gate.open).length };
    }
  };
}

export function createScenePuzzleHintKit({ actionKit = createSceneActionKit(), inventoryKit = createSceneInventoryKit() } = {}) {
  return {
    id: "n-peer-scene-puzzle-hint-kit",
    domain: "scene-puzzle-hints",
    describe(sceneId, state) {
      return actionKit.list(sceneId, state).map((action, index) => ({
        id: `${sceneId}-${action.id}-hint`,
        actionId: action.id,
        label: action.label,
        state: action.done ? "done" : action.blocked ? "blocked" : "ready",
        missing: stableArray(action.missing),
        priority: action.done ? 0 : action.blocked ? 1 : 2,
        pulse: action.done ? 0.22 : action.blocked ? 0.42 : 0.86,
        ownedByInventory: Boolean(action.token && inventoryKit.has(state, action.token)),
        slot: index
      }));
    },
    next(sceneId, state) {
      return this.describe(sceneId, state).sort((a, b) => b.priority - a.priority || a.slot - b.slot)[0] ?? null;
    },
    snapshot(sceneId, state) {
      const hints = this.describe(sceneId, state);
      return { sceneId, hints: hints.length, ready: hints.filter((hint) => hint.state === "ready").length, blocked: hints.filter((hint) => hint.state === "blocked").length };
    }
  };
}

export function createSceneAmbientVariationKit() {
  return {
    id: "n-peer-scene-ambient-variation-kit",
    domain: "scene-ambient-variation",
    describe(sceneId, state) {
      const complexity = stableArray(state?.transitionLedger).length + stableArray(state?.actionLedger).length + stableArray(state?.blockedLedger).length;
      const palette = paletteForScene(sceneId);
      return Array.from({ length: 9 }, (_, index) => ({
        id: `${sceneId}-ambient-${index}`,
        layer: index % 3,
        x: Math.round(seededUnit(sceneId, index) * 100),
        y: Math.round(seededUnit(`${sceneId}:y`, index) * 78),
        scale: Number((0.45 + seededUnit(`${sceneId}:s`, index) * 1.2 + complexity * 0.015).toFixed(2)),
        drift: Number((0.18 + seededUnit(`${sceneId}:d`, index) * 0.82).toFixed(2)),
        color: palette[index % palette.length],
        active: index < 4 + Math.min(5, stableArray(state?.visitedSceneIds).length)
      }));
    },
    snapshot(sceneId, state) {
      const particles = this.describe(sceneId, state);
      return { sceneId, particles: particles.length, active: particles.filter((particle) => particle.active).length };
    }
  };
}

export function createSceneCompletionConstellationKit() {
  return {
    id: "n-peer-scene-completion-constellation-kit",
    domain: "scene-completion-constellation",
    describe(state) {
      const tokens = ["has-lantern", "has-rope", "forest-lit", "bridge-repaired", "shrine-open"];
      const stars = tokens.map((token, index) => ({
        id: `constellation-${token}`,
        token,
        lit: hasToken(state, token),
        x: 12 + index * 18,
        y: 18 + Math.round(seededUnit(token, index) * 48),
        radius: hasToken(state, token) ? 6 : 3,
        label: token.replace(/-/g, " ")
      }));
      const links = stars.slice(1).map((star, index) => ({
        id: `link-${index}-${star.id}`,
        from: stars[index].id,
        to: star.id,
        lit: stars[index].lit && star.lit
      }));
      return { stars, links, completion: completionForState(state) };
    },
    snapshot(state) {
      const constellation = this.describe(state);
      return { stars: constellation.stars.length, lit: constellation.stars.filter((star) => star.lit).length, completion: constellation.completion };
    }
  };
}

export function createSceneVisualDescriptorKit({ manifestKit } = {}) {
  return {
    id: "n-peer-scene-visual-descriptor-kit",
    domain: "scene-visual-descriptors",
    describe(sceneId, state) {
      const scene = manifestKit?.get(sceneId) ?? { id: sceneId, title: sceneId, palette: paletteForScene(sceneId), landmarks: [] };
      const completion = completionForState(state);
      return {
        sceneId,
        title: scene.title,
        mood: scene.mood ?? moodForScene(sceneId),
        palette: scene.palette ?? paletteForScene(sceneId),
        landmarks: scene.landmarks?.length ? scene.landmarks : landmarksForScene(sceneId),
        routeComplexity: state.transitionLedger.length + state.blockedLedger.length + state.actionLedger.length,
        completion,
        stageLayers: buildStageLayers(sceneId, completion)
      };
    },
    snapshot(sceneId, state) {
      const descriptor = this.describe(sceneId, state);
      return { sceneId, mood: descriptor.mood, completion: descriptor.completion, layers: descriptor.stageLayers.length };
    }
  };
}

export function createSceneRendererHandoffKit() {
  return {
    id: "n-peer-scene-renderer-handoff-kit",
    domain: "scene-renderer-handoff",
    describe({ sceneDescriptor, routeGraph, gatePreview, puzzleHints, ambientVariation, completionConstellation }) {
      return {
        id: `${sceneDescriptor.sceneId}-renderer-descriptor`,
        sceneId: sceneDescriptor.sceneId,
        rendererOwns: ["DOM insertion", "CSS variables", "button events", "page navigation"],
        rendererMustNotOwn: ["scene state", "gate requirements", "inventory tokens", "puzzle progression", "descriptor generation"],
        descriptors: {
          scene: sceneDescriptor,
          routeGraph,
          gatePreview,
          puzzleHints,
          ambientVariation,
          completionConstellation
        },
        descriptorCounts: {
          routeNodes: routeGraph.nodes.length,
          routeEdges: routeGraph.edges.length,
          gates: gatePreview.length,
          hints: puzzleHints.length,
          ambientParticles: ambientVariation.length,
          constellationStars: completionConstellation.stars.length
        }
      };
    },
    snapshot(handoff) {
      return { sceneId: handoff.sceneId, ...handoff.descriptorCounts };
    }
  };
}

export function createScenePressureKit() {
  return {
    id: "n-peer-scene-pressure-kit",
    domain: "scene-pressure",
    evaluate(state) {
      const solvedTokens = ["forest-lit", "bridge-repaired", "shrine-open"].filter((token) => hasToken(state, token)).length;
      const routeComplexity = state.transitionLedger.length + state.blockedLedger.length + state.actionLedger.length;
      const score = Math.min(100, solvedTokens * 24 + state.visitedSceneIds.length * 6 + Math.min(22, routeComplexity * 2));
      state.pressure = { score, routeComplexity, solvedScenes: solvedTokens };
      return state.pressure;
    },
    snapshot(state) {
      return this.evaluate(state);
    }
  };
}

export function createPeerSceneDomainKit({ manifestKit, inventoryKit, actionKit, visualKit } = {}) {
  const routeGraphKit = createSceneRouteGraphKit({ manifestKit });
  const gatePreviewKit = createSceneGatePreviewKit({ manifestKit, inventoryKit });
  const puzzleHintKit = createScenePuzzleHintKit({ actionKit, inventoryKit });
  const ambientVariationKit = createSceneAmbientVariationKit();
  const completionConstellationKit = createSceneCompletionConstellationKit();
  const rendererHandoffKit = createSceneRendererHandoffKit();
  return {
    id: "n-peer-scene-domain-kit",
    domain: "peer-scene-domain",
    kits: {
      routeGraphKit,
      gatePreviewKit,
      puzzleHintKit,
      ambientVariationKit,
      completionConstellationKit,
      rendererHandoffKit
    },
    describe(sceneId, state) {
      const sceneDescriptor = visualKit.describe(sceneId, state);
      const routeGraph = routeGraphKit.describe(state);
      const gatePreview = gatePreviewKit.describe(sceneId, state);
      const puzzleHints = puzzleHintKit.describe(sceneId, state);
      const ambientVariation = ambientVariationKit.describe(sceneId, state);
      const completionConstellation = completionConstellationKit.describe(state);
      return rendererHandoffKit.describe({ sceneDescriptor, routeGraph, gatePreview, puzzleHints, ambientVariation, completionConstellation });
    },
    snapshot(sceneId, state) {
      const handoff = this.describe(sceneId, state);
      return {
        kitCount: Object.keys(this.kits).length,
        sceneId,
        route: routeGraphKit.snapshot(state),
        gates: gatePreviewKit.snapshot(sceneId, state),
        hints: puzzleHintKit.snapshot(sceneId, state),
        ambient: ambientVariationKit.snapshot(sceneId, state),
        constellation: completionConstellationKit.snapshot(state),
        handoff: rendererHandoffKit.snapshot(handoff)
      };
    }
  };
}

function moodForScene(id) {
  return ({ camp: "warm-campfire", crossroads: "split-road", forest: "blue-lantern", bridge: "river-tension", shrine: "silent-gold", ending: "dawn-release" })[id] ?? "unknown";
}

function paletteForScene(id) {
  return ({
    camp: ["#28170d", "#f3a75d", "#ffe0aa"],
    crossroads: ["#151a25", "#8f9db8", "#f4d490"],
    forest: ["#06141b", "#42d6ff", "#8cffd2"],
    bridge: ["#111827", "#7fb0d8", "#d5b37a"],
    shrine: ["#170f24", "#e9c76f", "#fff0b7"],
    ending: ["#0f1c28", "#ffcf8a", "#f8fbff"]
  })[id] ?? ["#111827", "#f2c36b", "#ffffff"];
}

function landmarksForScene(id) {
  return ({
    camp: ["ember ring", "supply crates", "ash road"],
    crossroads: ["three standing stones", "split path", "old sign"],
    forest: ["moon moth column", "root arch", "blue lantern glass"],
    bridge: ["river gap", "fallen plank", "rope post"],
    shrine: ["altar", "route ledger seal", "silent door"],
    ending: ["dawn gate", "ledger constellation", "return road"]
  })[id] ?? ["scene marker"];
}

function completionForState(state) {
  const tokens = ["has-lantern", "has-rope", "forest-lit", "bridge-repaired", "shrine-open"];
  const count = tokens.filter((token) => hasToken(state, token)).length;
  return Math.round((count / tokens.length) * 100);
}

function buildStageLayers(sceneId, completion) {
  const base = landmarksForScene(sceneId);
  return base.map((label, index) => ({
    id: `${sceneId}-layer-${index}`,
    label,
    depth: index + 1,
    glow: clamp01(0.18 + completion / 140 + index * 0.08)
  }));
}

export function logSceneMessage(state, message) {
  state.log.unshift(message);
  state.log = state.log.slice(0, 12);
  return state;
}

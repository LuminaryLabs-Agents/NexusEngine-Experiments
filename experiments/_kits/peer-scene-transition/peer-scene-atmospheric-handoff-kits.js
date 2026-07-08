function stableArray(value) {
  return Array.isArray(value) ? [...value] : [];
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
  const n = Math.sin((hashText(seed) + index * 97) * 12.9898) * 43758.5453;
  return n - Math.floor(n);
}

function fallbackPalette(sceneId) {
  return ({
    camp: ["#28170d", "#f3a75d", "#ffe0aa"],
    crossroads: ["#151a25", "#8f9db8", "#f4d490"],
    forest: ["#06141b", "#42d6ff", "#8cffd2"],
    bridge: ["#111827", "#7fb0d8", "#d5b37a"],
    shrine: ["#170f24", "#e9c76f", "#fff0b7"],
    ending: ["#0f1c28", "#ffcf8a", "#f8fbff"]
  })[sceneId] ?? ["#111827", "#f2c36b", "#ffffff"];
}

function fallbackLandmarks(sceneId) {
  return ({
    camp: ["ember ring", "supply crates", "ash road"],
    crossroads: ["standing stones", "split path", "old sign"],
    forest: ["moon moth column", "root arch", "blue lantern glass"],
    bridge: ["river gap", "fallen plank", "rope post"],
    shrine: ["altar", "route ledger seal", "silent door"],
    ending: ["dawn gate", "ledger constellation", "return road"]
  })[sceneId] ?? ["scene marker"];
}

function sceneFrom(manifestKit, sceneId) {
  const scene = manifestKit?.get?.(sceneId);
  return {
    id: sceneId,
    title: scene?.title ?? sceneId,
    exits: scene?.exits ?? {},
    palette: scene?.palette ?? fallbackPalette(sceneId),
    landmarks: stableArray(scene?.landmarks).length ? stableArray(scene.landmarks) : fallbackLandmarks(sceneId),
    mood: scene?.mood ?? sceneId
  };
}

function routeComplexity(state) {
  return stableArray(state?.transitionLedger).length + stableArray(state?.actionLedger).length + stableArray(state?.blockedLedger).length;
}

function completionForState(state) {
  const tokens = ["has-lantern", "has-rope", "forest-lit", "bridge-repaired", "shrine-open"];
  const count = tokens.filter((token) => hasToken(state, token)).length;
  return Math.round((count / tokens.length) * 100);
}

function statePhase(state) {
  const completion = completionForState(state);
  if (completion >= 100) return "released";
  if (completion >= 60) return "converging";
  if (stableArray(state?.blockedLedger).length > 0) return "pressured";
  if (stableArray(state?.visitedSceneIds).length > 2) return "wandering";
  return "opening";
}

export function createSceneDepthFogBandKit({ manifestKit } = {}) {
  return {
    id: "n-peer-scene-depth-fog-band-kit",
    domain: "scene-depth-atmosphere/depth-fog-bands",
    describe(sceneId, state) {
      const scene = sceneFrom(manifestKit, sceneId);
      const completion = completionForState(state);
      const complexity = routeComplexity(state);
      return Array.from({ length: 6 }, (_, index) => {
        const depth = index + 1;
        const unit = seededUnit(`${sceneId}:fog`, index);
        return {
          id: `${sceneId}-depth-fog-${index}`,
          sceneId,
          depth,
          x: Math.round(unit * 92),
          y: Math.round(12 + index * 10 + seededUnit(`${sceneId}:fog:y`, index) * 7),
          width: Math.round(32 + seededUnit(`${sceneId}:fog:w`, index) * 42 + depth * 3),
          height: Math.round(14 + seededUnit(`${sceneId}:fog:h`, index) * 18),
          opacity: Number(clamp(0.12 + depth * 0.035 + complexity * 0.009 - completion * 0.0006, 0.1, 0.62).toFixed(3)),
          blur: Math.round(8 + depth * 4 + seededUnit(`${sceneId}:fog:b`, index) * 10),
          color: scene.palette[index % scene.palette.length],
          parallax: Number((0.08 + depth * 0.035).toFixed(3)),
          completionBias: completion
        };
      });
    },
    snapshot(sceneId, state) {
      const bands = this.describe(sceneId, state);
      return { sceneId, bands: bands.length, maxDepth: Math.max(...bands.map((band) => band.depth)), phase: statePhase(state) };
    }
  };
}

export function createSceneLightRayKit({ manifestKit } = {}) {
  return {
    id: "n-peer-scene-light-ray-kit",
    domain: "scene-depth-atmosphere/light-rays",
    describe(sceneId, state) {
      const scene = sceneFrom(manifestKit, sceneId);
      const completion = completionForState(state);
      const phase = statePhase(state);
      return Array.from({ length: 5 }, (_, index) => {
        const landmark = scene.landmarks[index % scene.landmarks.length];
        const solvedBoost = hasToken(state, "shrine-open") ? 0.24 : 0;
        return {
          id: `${sceneId}-light-ray-${index}`,
          sceneId,
          landmark,
          phase,
          x: Math.round(8 + index * 17 + seededUnit(`${sceneId}:ray:x`, index) * 8),
          y: Math.round(4 + seededUnit(`${sceneId}:ray:y`, index) * 18),
          angle: Math.round(-26 + seededUnit(`${sceneId}:ray:a`, index) * 52),
          length: Math.round(120 + seededUnit(`${sceneId}:ray:l`, index) * 170),
          width: Math.round(18 + seededUnit(`${sceneId}:ray:w`, index) * 36),
          intensity: Number(clamp(0.18 + completion * 0.004 + solvedBoost + index * 0.025, 0.12, 0.85).toFixed(3)),
          color: scene.palette[(index + 1) % scene.palette.length]
        };
      });
    },
    snapshot(sceneId, state) {
      const rays = this.describe(sceneId, state);
      return { sceneId, rays: rays.length, phase: statePhase(state), brightest: Math.max(...rays.map((ray) => ray.intensity)) };
    }
  };
}

export function createSceneRelicFocusKit({ actionKit } = {}) {
  return {
    id: "n-peer-scene-relic-focus-kit",
    domain: "scene-interaction-focus/relic-focus",
    describe(sceneId, state) {
      const actions = stableArray(actionKit?.list?.(sceneId, state));
      const focusActions = actions.length ? actions : [{ id: "scene-observe", label: "Observe scene", done: false, blocked: false, missing: [] }];
      return focusActions.slice(0, 4).map((action, index) => ({
        id: `${sceneId}-relic-focus-${action.id}`,
        sceneId,
        actionId: action.id,
        label: action.label,
        state: action.done ? "settled" : action.blocked ? "sealed" : "callable",
        missing: stableArray(action.missing),
        slot: index,
        ringCount: action.done ? 1 : action.blocked ? 3 : 2,
        pulse: Number((action.done ? 0.18 : action.blocked ? 0.42 : 0.86).toFixed(2)),
        focusWeight: Number(clamp01(0.34 + index * 0.12 + (action.blocked ? 0.1 : 0)).toFixed(2))
      }));
    },
    snapshot(sceneId, state) {
      const relics = this.describe(sceneId, state);
      return {
        sceneId,
        relics: relics.length,
        callable: relics.filter((relic) => relic.state === "callable").length,
        sealed: relics.filter((relic) => relic.state === "sealed").length,
        settled: relics.filter((relic) => relic.state === "settled").length
      };
    }
  };
}

export function createScenePathTensionKit({ manifestKit, inventoryKit } = {}) {
  return {
    id: "n-peer-scene-path-tension-kit",
    domain: "scene-navigation-pressure/path-tension",
    describe(sceneId, state) {
      const scene = sceneFrom(manifestKit, sceneId);
      const exits = Object.entries(scene.exits);
      const entries = exits.length ? exits : [["complete", { to: sceneId, label: "Scene complete", requires: [] }]];
      return entries.map(([exitId, exit], index) => {
        const missing = stableArray(inventoryKit?.missing?.(state, exit.requires ?? []));
        const open = missing.length === 0;
        return {
          id: `${sceneId}-path-tension-${exitId}`,
          sceneId,
          exitId,
          to: exit.to,
          label: exit.label,
          open,
          missing,
          slot: index,
          arc: Number((0.24 + index * 0.16 + (open ? 0.22 : 0)).toFixed(2)),
          pressure: Number(clamp(0.18 + missing.length * 0.34 + routeComplexity(state) * 0.025, 0.12, 0.95).toFixed(2)),
          requirementCount: stableArray(exit.requires).length
        };
      });
    },
    snapshot(sceneId, state) {
      const paths = this.describe(sceneId, state);
      return { sceneId, paths: paths.length, open: paths.filter((path) => path.open).length, sealed: paths.filter((path) => !path.open).length };
    }
  };
}

export function createSceneMemoryEchoKit() {
  return {
    id: "n-peer-scene-memory-echo-kit",
    domain: "scene-ledger-memory/memory-echoes",
    describe(sceneId, state) {
      const transitions = stableArray(state?.transitionLedger).map((entry) => ({ type: "transition", label: `${entry.from ?? "?"} to ${entry.to ?? "?"}` }));
      const actions = stableArray(state?.actionLedger).map((entry) => ({ type: "action", label: entry.actionId ?? "action" }));
      const blocked = stableArray(state?.blockedLedger).map((entry) => ({ type: "blocked", label: entry.label ?? entry.reason ?? "blocked" }));
      const logs = stableArray(state?.log).map((entry) => ({ type: "log", label: String(entry).slice(0, 54) }));
      const source = [...blocked, ...actions, ...transitions, ...logs];
      const echoes = source.length ? source : [{ type: "boot", label: "Scene system booted" }];
      return echoes.slice(0, 6).map((echo, index) => ({
        id: `${sceneId}-memory-echo-${index}`,
        sceneId,
        type: echo.type,
        label: echo.label,
        slot: index,
        age: index,
        weight: Number(clamp(0.95 - index * 0.12, 0.18, 0.95).toFixed(2)),
        drift: Number((seededUnit(`${sceneId}:echo`, index) * 0.72 + 0.16).toFixed(2))
      }));
    },
    snapshot(sceneId, state) {
      const echoes = this.describe(sceneId, state);
      return { sceneId, echoes: echoes.length, newestType: echoes[0]?.type ?? "none" };
    }
  };
}

export function createSceneAtmosphericHandoffKit({ manifestKit, actionKit, inventoryKit } = {}) {
  const depthFogBandKit = createSceneDepthFogBandKit({ manifestKit });
  const lightRayKit = createSceneLightRayKit({ manifestKit });
  const relicFocusKit = createSceneRelicFocusKit({ actionKit });
  const pathTensionKit = createScenePathTensionKit({ manifestKit, inventoryKit });
  const memoryEchoKit = createSceneMemoryEchoKit();
  return {
    id: "n-peer-scene-atmospheric-handoff-kit",
    domain: "scene-atmospheric-renderer-handoff",
    kits: { depthFogBandKit, lightRayKit, relicFocusKit, pathTensionKit, memoryEchoKit },
    describe(sceneId, state, baseHandoff = null) {
      const depthFogBands = depthFogBandKit.describe(sceneId, state);
      const lightRays = lightRayKit.describe(sceneId, state);
      const relicFocus = relicFocusKit.describe(sceneId, state);
      const pathTension = pathTensionKit.describe(sceneId, state);
      const memoryEchoes = memoryEchoKit.describe(sceneId, state);
      return {
        id: `${sceneId}-atmospheric-handoff`,
        sceneId,
        phase: statePhase(state),
        completion: completionForState(state),
        baseDescriptorId: baseHandoff?.id ?? null,
        rendererOwns: ["CSS variables", "DOM placement", "animation timing"],
        rendererMustNotOwn: ["scene state", "path requirements", "inventory tokens", "puzzle progression", "descriptor generation"],
        depthFogBands,
        lightRays,
        relicFocus,
        pathTension,
        memoryEchoes,
        counts: {
          depthFogBands: depthFogBands.length,
          lightRays: lightRays.length,
          relicFocus: relicFocus.length,
          pathTension: pathTension.length,
          memoryEchoes: memoryEchoes.length
        }
      };
    },
    snapshot(sceneId, state) {
      const descriptor = this.describe(sceneId, state);
      return { sceneId, phase: descriptor.phase, completion: descriptor.completion, kitCount: Object.keys(this.kits).length, ...descriptor.counts };
    }
  };
}

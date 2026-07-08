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

function normalizeScene(scene, fallbackId) {
  return {
    id: scene?.id ?? fallbackId,
    title: scene?.title ?? scene?.id ?? fallbackId,
    exits: scene?.exits ?? {},
    copy: scene?.copy ?? "",
    mood: scene?.mood ?? fallbackId,
    palette: stableArray(scene?.palette).length ? stableArray(scene.palette) : ["#111827", "#e9b872", "#ffffff"]
  };
}

function sceneFrom(manifestKit, sceneId) {
  return normalizeScene(manifestKit?.get?.(sceneId), sceneId);
}

function scenesFrom(manifestKit, sceneId) {
  const listed = stableArray(manifestKit?.list?.());
  if (listed.length) return listed.map((scene, index) => normalizeScene(scene, scene?.id ?? `scene-${index}`));
  return [sceneFrom(manifestKit, sceneId)];
}

function pressureScore(state) {
  const pressure = state?.pressure?.score;
  if (Number.isFinite(pressure)) return clamp(pressure, 0, 100);
  return clamp(stableArray(state?.blockedLedger).length * 16 + stableArray(state?.transitionLedger).length * 6 + stableArray(state?.actionLedger).length * 4, 0, 100);
}

function missingTokens(state, required, inventoryKit) {
  const tokens = stableArray(required);
  return stableArray(inventoryKit?.missing?.(state, tokens) ?? tokens.filter((token) => !hasToken(state, token)));
}

function routeRequirements(scene) {
  return unique(Object.values(scene.exits ?? {}).flatMap((exit) => stableArray(exit.requires)));
}

function goalsForStory() {
  return ["has-lantern", "has-rope", "forest-lit", "bridge-repaired", "shrine-open"];
}

function rendererBoundary(owner) {
  return {
    owner,
    rendererOwns: ["placement", "CSS class mapping", "draw order", "animation timing"],
    rendererMustNotOwn: ["state mutation", "inventory truth", "route solving", "action eligibility", "future forecasting", "browser input", "asset loading", "frame-loop ownership"]
  };
}

export const PEER_SCENE_ORACLE_READABILITY_DOMAIN_TREE = Object.freeze({
  root: "peer-scene-oracle-readability-domain",
  subdomains: [
    {
      id: "future-route-domain",
      subdomains: [
        { id: "objective-forecast-domain", kits: ["scene-objective-forecast-thread-kit"] },
        { id: "ending-readiness-domain", kits: ["scene-ending-readiness-crown-kit"] }
      ]
    },
    {
      id: "pressure-clock-domain",
      subdomains: [
        { id: "pressure-clock-ring-domain", kits: ["scene-pressure-clock-ring-kit"] },
        { id: "puzzle-debt-domain", kits: ["scene-puzzle-debt-stack-kit"] }
      ]
    },
    {
      id: "memory-resource-domain",
      subdomains: [
        { id: "resource-route-domain", kits: ["scene-resource-route-map-kit"] },
        { id: "memory-branch-domain", kits: ["scene-memory-branch-echo-kit"] }
      ]
    },
    {
      id: "renderer-handoff",
      kits: ["scene-oracle-renderer-handoff-kit"],
      contract: "renderer consumes descriptors only"
    }
  ],
  contract: "atomic oracle readability descriptors only; no renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop ownership"
});

export function createSceneObjectiveForecastThreadKit({ manifestKit, inventoryKit } = {}) {
  return {
    id: "n-peer-scene-objective-forecast-thread-kit",
    domain: "peer-scene-oracle-readability/objective-forecast",
    describe(sceneId, state) {
      const scenes = scenesFrom(manifestKit, sceneId);
      const visited = new Set(stableArray(state?.visitedSceneIds));
      const currentIndex = Math.max(0, scenes.findIndex((scene) => scene.id === sceneId));
      return scenes.slice(0, 8).map((scene, index) => {
        const required = routeRequirements(scene);
        const missing = missingTokens(state, required, inventoryKit);
        const distance = Math.abs(index - currentIndex);
        const readiness = clamp01((missing.length ? 0.26 : 0.72) + (visited.has(scene.id) ? 0.1 : 0) - distance * 0.04);
        return {
          id: `${sceneId}-objective-forecast-${scene.id}`,
          sceneId,
          targetSceneId: scene.id,
          label: scene.title,
          current: scene.id === sceneId,
          visited: visited.has(scene.id),
          required,
          missing,
          readiness: Number(readiness.toFixed(2)),
          slot: index,
          arc: Number((0.1 + index * 0.11 + readiness * 0.12).toFixed(2)),
          rendererBoundary: rendererBoundary("scene-objective-forecast-thread-kit")
        };
      });
    },
    snapshot(sceneId, state) {
      const threads = this.describe(sceneId, state);
      return { sceneId, threads: threads.length, ready: threads.filter((thread) => thread.missing.length === 0).length };
    }
  };
}

export function createScenePressureClockRingKit() {
  return {
    id: "n-peer-scene-pressure-clock-ring-kit",
    domain: "peer-scene-oracle-readability/pressure-clock",
    describe(sceneId, state) {
      const pressure = pressureScore(state);
      const blocked = stableArray(state?.blockedLedger).length;
      const actions = stableArray(state?.actionLedger).length;
      const transitions = stableArray(state?.transitionLedger).length;
      const phases = [
        ["pressure", pressure / 100],
        ["blocked", clamp01(blocked / 5)],
        ["actions", clamp01(actions / 6)],
        ["routes", clamp01(transitions / 6)]
      ];
      return phases.map(([phase, value], index) => ({
        id: `${sceneId}-pressure-clock-${phase}`,
        sceneId,
        phase,
        pressure,
        value: Number(clamp01(value).toFixed(2)),
        slot: index,
        urgency: Number(clamp01(pressure / 100 + index * 0.06).toFixed(2)),
        rendererBoundary: rendererBoundary("scene-pressure-clock-ring-kit")
      }));
    },
    snapshot(sceneId, state) {
      const rings = this.describe(sceneId, state);
      return { sceneId, rings: rings.length, pressure: pressureScore(state), maxUrgency: rings.reduce((max, ring) => Math.max(max, ring.urgency), 0) };
    }
  };
}

export function createSceneResourceRouteMapKit({ manifestKit } = {}) {
  return {
    id: "n-peer-scene-resource-route-map-kit",
    domain: "peer-scene-oracle-readability/resource-route",
    describe(sceneId, state) {
      const scenes = scenesFrom(manifestKit, sceneId);
      const routeTokens = unique(scenes.flatMap(routeRequirements));
      const owned = unique([...(state?.inventory ?? []), ...(state?.tokens ?? [])]);
      const source = routeTokens.length ? routeTokens : owned.length ? owned : ["empty-hands"];
      return source.slice(0, 8).map((token, index) => {
        const consumers = scenes.filter((scene) => routeRequirements(scene).includes(token)).map((scene) => scene.id);
        const ownedToken = hasToken(state, token);
        return {
          id: `${sceneId}-resource-route-${token}`,
          sceneId,
          token,
          label: String(token).replace(/[-_]/g, " "),
          owned: ownedToken,
          consumers,
          x: Math.round(12 + index * 10 + seededUnit(`${sceneId}:resource:x`, index) * 8),
          y: Math.round(10 + seededUnit(`${sceneId}:resource:y`, index) * 58),
          weight: Number(clamp01((ownedToken ? 0.78 : 0.28) + consumers.length * 0.08).toFixed(2)),
          rendererBoundary: rendererBoundary("scene-resource-route-map-kit")
        };
      });
    },
    snapshot(sceneId, state) {
      const maps = this.describe(sceneId, state);
      return { sceneId, maps: maps.length, owned: maps.filter((map) => map.owned).length, missing: maps.filter((map) => !map.owned).length };
    }
  };
}

export function createSceneMemoryBranchEchoKit({ manifestKit } = {}) {
  return {
    id: "n-peer-scene-memory-branch-echo-kit",
    domain: "peer-scene-oracle-readability/memory-branch",
    describe(sceneId, state) {
      const scenes = scenesFrom(manifestKit, sceneId);
      const visited = new Set(stableArray(state?.visitedSceneIds));
      const log = stableArray(state?.log);
      const source = scenes.length ? scenes : [{ id: sceneId, title: sceneId }];
      return source.slice(0, 8).map((scene, index) => {
        const seen = visited.has(scene.id);
        const logHit = log.some((entry) => String(entry).toLowerCase().includes(String(scene.id).toLowerCase()));
        return {
          id: `${sceneId}-memory-branch-${scene.id}`,
          sceneId,
          targetSceneId: scene.id,
          label: scene.title,
          current: scene.id === sceneId,
          seen,
          logHit,
          slot: index,
          weight: Number(clamp01((seen ? 0.66 : 0.22) + (logHit ? 0.2 : 0) + (scene.id === sceneId ? 0.12 : 0)).toFixed(2)),
          drift: Number((0.1 + index * 0.06 + seededUnit(`${sceneId}:memory`, index) * 0.12).toFixed(2)),
          rendererBoundary: rendererBoundary("scene-memory-branch-echo-kit")
        };
      });
    },
    snapshot(sceneId, state) {
      const echoes = this.describe(sceneId, state);
      return { sceneId, echoes: echoes.length, seen: echoes.filter((echo) => echo.seen).length };
    }
  };
}

export function createScenePuzzleDebtStackKit({ manifestKit, inventoryKit } = {}) {
  return {
    id: "n-peer-scene-puzzle-debt-stack-kit",
    domain: "peer-scene-oracle-readability/puzzle-debt",
    describe(sceneId, state) {
      const scenes = scenesFrom(manifestKit, sceneId);
      const debtTokens = unique([...goalsForStory(), ...scenes.flatMap(routeRequirements)]);
      const source = debtTokens.length ? debtTokens : ["route-complete"];
      return source.slice(0, 9).map((token, index) => {
        const missing = missingTokens(state, [token], inventoryKit).length > 0;
        return {
          id: `${sceneId}-puzzle-debt-${token}`,
          sceneId,
          token,
          label: String(token).replace(/[-_]/g, " "),
          missing,
          solved: !missing,
          slot: index,
          debt: Number(clamp01((missing ? 0.78 : 0.18) - index * 0.025).toFixed(2)),
          rendererBoundary: rendererBoundary("scene-puzzle-debt-stack-kit")
        };
      });
    },
    snapshot(sceneId, state) {
      const stacks = this.describe(sceneId, state);
      return { sceneId, stacks: stacks.length, missing: stacks.filter((stack) => stack.missing).length, solved: stacks.filter((stack) => stack.solved).length };
    }
  };
}

export function createSceneEndingReadinessCrownKit({ manifestKit, inventoryKit } = {}) {
  return {
    id: "n-peer-scene-ending-readiness-crown-kit",
    domain: "peer-scene-oracle-readability/ending-readiness",
    describe(sceneId, state) {
      const scenes = scenesFrom(manifestKit, sceneId);
      const ending = scenes.find((scene) => scene.id === "ending") ?? scenes.at(-1) ?? sceneFrom(manifestKit, sceneId);
      const goals = goalsForStory();
      const solvedGoals = goals.filter((token) => hasToken(state, token));
      const endingRequirements = routeRequirements(ending);
      const missing = unique([...missingTokens(state, goals, inventoryKit), ...missingTokens(state, endingRequirements, inventoryKit)]);
      const readiness = clamp01(solvedGoals.length / goals.length - missing.length * 0.045 + (sceneId === ending.id ? 0.18 : 0));
      return [
        {
          id: `${sceneId}-ending-readiness-crown`,
          sceneId,
          targetSceneId: ending.id,
          label: ending.title,
          goals,
          solvedGoals,
          missing,
          readiness: Number(readiness.toFixed(2)),
          complete: missing.length === 0 || sceneId === ending.id,
          slot: 0,
          pulse: Number(clamp01(0.2 + readiness * 0.8).toFixed(2)),
          rendererBoundary: rendererBoundary("scene-ending-readiness-crown-kit")
        }
      ];
    },
    snapshot(sceneId, state) {
      const [crown] = this.describe(sceneId, state);
      return { sceneId, crowns: 1, readiness: crown.readiness, missing: crown.missing.length, complete: crown.complete };
    }
  };
}

export function createSceneOracleRendererHandoffKit() {
  return {
    id: "n-peer-scene-oracle-renderer-handoff-kit",
    domain: "peer-scene-oracle-readability/renderer-handoff",
    describe({ sceneId, objectiveForecastThreads, pressureClockRings, resourceRouteMaps, memoryBranchEchoes, puzzleDebtStacks, endingReadinessCrowns, baseDescriptorId = null }) {
      return {
        id: `${sceneId}-oracle-readability-renderer-handoff`,
        sceneId,
        domainTree: PEER_SCENE_ORACLE_READABILITY_DOMAIN_TREE,
        baseDescriptorId,
        rendererBoundary: rendererBoundary("scene-oracle-renderer-handoff-kit"),
        descriptors: { objectiveForecastThreads, pressureClockRings, resourceRouteMaps, memoryBranchEchoes, puzzleDebtStacks, endingReadinessCrowns },
        counts: {
          objectiveForecastThreads: objectiveForecastThreads.length,
          pressureClockRings: pressureClockRings.length,
          resourceRouteMaps: resourceRouteMaps.length,
          memoryBranchEchoes: memoryBranchEchoes.length,
          puzzleDebtStacks: puzzleDebtStacks.length,
          endingReadinessCrowns: endingReadinessCrowns.length
        }
      };
    },
    snapshot(handoff) {
      return { sceneId: handoff.sceneId, ...handoff.counts };
    }
  };
}

export function createSceneOracleReadabilityDomainKit({ manifestKit, inventoryKit } = {}) {
  const objectiveForecastThreadKit = createSceneObjectiveForecastThreadKit({ manifestKit, inventoryKit });
  const pressureClockRingKit = createScenePressureClockRingKit();
  const resourceRouteMapKit = createSceneResourceRouteMapKit({ manifestKit });
  const memoryBranchEchoKit = createSceneMemoryBranchEchoKit({ manifestKit });
  const puzzleDebtStackKit = createScenePuzzleDebtStackKit({ manifestKit, inventoryKit });
  const endingReadinessCrownKit = createSceneEndingReadinessCrownKit({ manifestKit, inventoryKit });
  const rendererHandoffKit = createSceneOracleRendererHandoffKit();
  return {
    id: "n-peer-scene-oracle-readability-domain-kit",
    domain: "peer-scene-oracle-readability-domain",
    kits: { objectiveForecastThreadKit, pressureClockRingKit, resourceRouteMapKit, memoryBranchEchoKit, puzzleDebtStackKit, endingReadinessCrownKit, rendererHandoffKit },
    describe(sceneId, state, context = {}) {
      const objectiveForecastThreads = objectiveForecastThreadKit.describe(sceneId, state);
      const pressureClockRings = pressureClockRingKit.describe(sceneId, state);
      const resourceRouteMaps = resourceRouteMapKit.describe(sceneId, state);
      const memoryBranchEchoes = memoryBranchEchoKit.describe(sceneId, state);
      const puzzleDebtStacks = puzzleDebtStackKit.describe(sceneId, state);
      const endingReadinessCrowns = endingReadinessCrownKit.describe(sceneId, state);
      return rendererHandoffKit.describe({
        sceneId,
        objectiveForecastThreads,
        pressureClockRings,
        resourceRouteMaps,
        memoryBranchEchoes,
        puzzleDebtStacks,
        endingReadinessCrowns,
        baseDescriptorId: context.decisionReadability?.id ?? context.consequence?.id ?? context.chronicle?.id ?? context.baseHandoff?.id ?? null
      });
    },
    snapshot(sceneId, state) {
      const handoff = this.describe(sceneId, state);
      return {
        kitCount: Object.keys(this.kits).length,
        sceneId,
        forecast: objectiveForecastThreadKit.snapshot(sceneId, state),
        pressureClock: pressureClockRingKit.snapshot(sceneId, state),
        resourceRoute: resourceRouteMapKit.snapshot(sceneId, state),
        memory: memoryBranchEchoKit.snapshot(sceneId, state),
        puzzleDebt: puzzleDebtStackKit.snapshot(sceneId, state),
        ending: endingReadinessCrownKit.snapshot(sceneId, state),
        handoff: rendererHandoffKit.snapshot(handoff)
      };
    }
  };
}

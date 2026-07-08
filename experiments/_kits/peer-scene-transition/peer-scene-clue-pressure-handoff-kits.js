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
  return Boolean(stableArray(state?.tokens).includes(token) || stableArray(state?.inventory).includes(token) || state?.flags?.[token]);
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
  const n = Math.sin((hashText(seed) + index * 97) * 12.9898) * 43758.5453;
  return n - Math.floor(n);
}

function normalizeScene(scene, fallbackId) {
  return {
    id: scene?.id ?? fallbackId,
    title: scene?.title ?? scene?.id ?? fallbackId,
    copy: scene?.copy ?? "",
    exits: scene?.exits ?? {}
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
  return clamp(stableArray(state?.blockedLedger).length * 14 + stableArray(state?.actionLedger).length * 5 + stableArray(state?.transitionLedger).length * 4, 0, 100);
}

function sceneRequirements(scene) {
  return unique(Object.values(scene?.exits ?? {}).flatMap((exit) => stableArray(exit?.requires)));
}

function allRouteTokens(scenes) {
  return unique(scenes.flatMap(sceneRequirements));
}

function goalTokens() {
  return ["has-lantern", "has-rope", "forest-lit", "bridge-repaired", "shrine-open"];
}

function missingTokens(state, required, inventoryKit) {
  const tokens = stableArray(required);
  return stableArray(inventoryKit?.missing?.(state, tokens) ?? tokens.filter((token) => !hasToken(state, token)));
}

function rendererBoundary(owner) {
  return {
    owner,
    rendererOwns: ["placement", "draw order", "CSS class mapping", "animation timing"],
    rendererMustNotOwn: ["state mutation", "inventory truth", "clue truth", "route solving", "browser input", "asset loading", "frame-loop ownership"]
  };
}

export const PEER_SCENE_CLUE_PRESSURE_DOMAIN_TREE = Object.freeze({
  root: "peer-scene-clue-pressure-readiness-domain",
  subdomains: [
    {
      id: "investigation-readability-domain",
      subdomains: [
        { id: "clue-visibility-domain", kits: ["scene-clue-visibility-lantern-kit"] },
        { id: "suspect-thread-domain", kits: ["scene-suspect-thread-trace-kit"] }
      ]
    },
    {
      id: "pressure-and-noise-domain",
      subdomains: [
        { id: "objective-pressure-domain", kits: ["scene-objective-pressure-pip-kit"] },
        { id: "misdirection-fog-domain", kits: ["scene-misdirection-fog-bank-kit"] }
      ]
    },
    {
      id: "evidence-resolution-domain",
      subdomains: [
        { id: "evidence-gap-domain", kits: ["scene-evidence-gap-card-kit"] },
        { id: "resolution-route-domain", kits: ["scene-resolution-route-lock-kit"] }
      ]
    },
    {
      id: "renderer-handoff",
      kits: ["scene-clue-pressure-renderer-handoff-kit"],
      contract: "renderer consumes descriptors only"
    }
  ],
  contract: "atomic clue-pressure descriptors only; no renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop ownership"
});

export function createSceneClueVisibilityLanternKit({ manifestKit, inventoryKit } = {}) {
  return {
    id: "n-peer-scene-clue-visibility-lantern-kit",
    domain: "peer-scene-clue-pressure/clue-visibility",
    describe(sceneId, state) {
      const scenes = scenesFrom(manifestKit, sceneId);
      const tokens = unique([...allRouteTokens(scenes), ...goalTokens()]);
      return tokens.slice(0, 8).map((token, index) => {
        const owned = missingTokens(state, [token], inventoryKit).length === 0;
        const consumers = scenes.filter((scene) => sceneRequirements(scene).includes(token)).map((scene) => scene.id);
        const brightness = clamp01((owned ? 0.78 : 0.22) + consumers.length * 0.07 + seededUnit(`${sceneId}:lantern`, index) * 0.08);
        return {
          id: `${sceneId}-clue-lantern-${token}`,
          kind: "clue-visibility-lantern",
          sceneId,
          token,
          label: String(token).replace(/[-_]/g, " "),
          owned,
          consumers,
          brightness: Number(brightness.toFixed(2)),
          x: Math.round(12 + index * 10 + seededUnit(`${token}:x`, index) * 6),
          y: Math.round(16 + seededUnit(`${token}:y`, index) * 58),
          rendererBoundary: rendererBoundary("scene-clue-visibility-lantern-kit")
        };
      });
    },
    snapshot(sceneId, state) {
      const lanterns = this.describe(sceneId, state);
      return { sceneId, lanterns: lanterns.length, lit: lanterns.filter((lantern) => lantern.owned).length };
    }
  };
}

export function createSceneSuspectThreadTraceKit({ manifestKit } = {}) {
  return {
    id: "n-peer-scene-suspect-thread-trace-kit",
    domain: "peer-scene-clue-pressure/suspect-thread",
    describe(sceneId, state) {
      const scenes = scenesFrom(manifestKit, sceneId);
      const visited = new Set(stableArray(state?.visitedSceneIds ?? state?.visitedScenes));
      const currentIndex = Math.max(0, scenes.findIndex((scene) => scene.id === sceneId));
      return scenes.slice(0, 8).map((scene, index) => {
        const exits = Object.values(scene.exits ?? {});
        const openExits = exits.filter((exit) => !stableArray(exit.requires).length || stableArray(exit.requires).every((token) => hasToken(state, token))).length;
        const suspicion = clamp01((visited.has(scene.id) ? 0.35 : 0.62) + Math.abs(index - currentIndex) * 0.06 + (exits.length - openExits) * 0.12);
        return {
          id: `${sceneId}-suspect-thread-${scene.id}`,
          kind: "suspect-thread-trace",
          sceneId,
          targetSceneId: scene.id,
          label: scene.title,
          visited: visited.has(scene.id),
          openExits,
          sealedExits: Math.max(0, exits.length - openExits),
          suspicion: Number(suspicion.toFixed(2)),
          arc: Number((0.08 + index * 0.11 + suspicion * 0.13).toFixed(2)),
          slot: index,
          rendererBoundary: rendererBoundary("scene-suspect-thread-trace-kit")
        };
      });
    },
    snapshot(sceneId, state) {
      const traces = this.describe(sceneId, state);
      return { sceneId, traces: traces.length, highSuspicion: traces.filter((trace) => trace.suspicion > 0.62).length };
    }
  };
}

export function createSceneObjectivePressurePipKit({ manifestKit, inventoryKit } = {}) {
  return {
    id: "n-peer-scene-objective-pressure-pip-kit",
    domain: "peer-scene-clue-pressure/objective-pressure",
    describe(sceneId, state) {
      const scenes = scenesFrom(manifestKit, sceneId);
      const tokens = unique([...goalTokens(), ...sceneRequirements(sceneFrom(manifestKit, sceneId))]);
      const globalPressure = pressureScore(state) / 100;
      return tokens.slice(0, 8).map((token, index) => {
        const missing = missingTokens(state, [token], inventoryKit).length > 0;
        const downstream = scenes.filter((scene) => sceneRequirements(scene).includes(token)).length;
        const urgency = clamp01((missing ? 0.56 : 0.18) + downstream * 0.08 + globalPressure * 0.24);
        return {
          id: `${sceneId}-objective-pressure-${token}`,
          kind: "objective-pressure-pip",
          sceneId,
          token,
          label: String(token).replace(/[-_]/g, " "),
          missing,
          downstream,
          urgency: Number(urgency.toFixed(2)),
          slot: index,
          rendererBoundary: rendererBoundary("scene-objective-pressure-pip-kit")
        };
      });
    },
    snapshot(sceneId, state) {
      const pips = this.describe(sceneId, state);
      return { sceneId, pips: pips.length, missing: pips.filter((pip) => pip.missing).length };
    }
  };
}

export function createSceneMisdirectionFogBankKit({ manifestKit, inventoryKit } = {}) {
  return {
    id: "n-peer-scene-misdirection-fog-bank-kit",
    domain: "peer-scene-clue-pressure/misdirection-fog",
    describe(sceneId, state) {
      const scene = sceneFrom(manifestKit, sceneId);
      const exits = Object.entries(scene.exits ?? {});
      const blocked = stableArray(state?.blockedLedger ?? state?.blockedTransitions);
      const fogSources = exits.length ? exits : [["idle", { label: "idle doubt", requires: [] }]];
      return fogSources.slice(0, 6).map(([exitId, exit], index) => {
        const missing = missingTokens(state, stableArray(exit.requires), inventoryKit);
        const recentlyBlocked = blocked.some((entry) => String(entry?.exitId ?? entry?.label ?? entry).includes(exitId));
        const density = clamp01((missing.length ? 0.5 : 0.18) + (recentlyBlocked ? 0.22 : 0) + pressureScore(state) / 350);
        return {
          id: `${sceneId}-misdirection-fog-${exitId}`,
          kind: "misdirection-fog-bank",
          sceneId,
          exitId,
          label: exit.label ?? exitId,
          missing,
          recentlyBlocked,
          density: Number(density.toFixed(2)),
          x: Math.round(10 + index * 15 + seededUnit(`${sceneId}:fog:x`, index) * 8),
          y: Math.round(22 + seededUnit(`${sceneId}:fog:y`, index) * 46),
          width: Math.round(18 + density * 28),
          rendererBoundary: rendererBoundary("scene-misdirection-fog-bank-kit")
        };
      });
    },
    snapshot(sceneId, state) {
      const banks = this.describe(sceneId, state);
      return { sceneId, banks: banks.length, dense: banks.filter((bank) => bank.density > 0.55).length };
    }
  };
}

export function createSceneEvidenceGapCardKit({ manifestKit, inventoryKit } = {}) {
  return {
    id: "n-peer-scene-evidence-gap-card-kit",
    domain: "peer-scene-clue-pressure/evidence-gap",
    describe(sceneId, state) {
      const scenes = scenesFrom(manifestKit, sceneId);
      const tokens = unique([...goalTokens(), ...allRouteTokens(scenes)]);
      return tokens.slice(0, 8).map((token, index) => {
        const missing = missingTokens(state, [token], inventoryKit).length > 0;
        const consumers = scenes.filter((scene) => sceneRequirements(scene).includes(token));
        const gap = clamp01((missing ? 0.72 : 0.16) + consumers.length * 0.04 - (hasToken(state, token) ? 0.1 : 0));
        return {
          id: `${sceneId}-evidence-gap-${token}`,
          kind: "evidence-gap-card",
          sceneId,
          token,
          label: String(token).replace(/[-_]/g, " "),
          missing,
          consumers: consumers.map((scene) => scene.id),
          gap: Number(gap.toFixed(2)),
          severity: gap > 0.7 ? "critical" : gap > 0.42 ? "open" : "resolved",
          slot: index,
          rendererBoundary: rendererBoundary("scene-evidence-gap-card-kit")
        };
      });
    },
    snapshot(sceneId, state) {
      const cards = this.describe(sceneId, state);
      return { sceneId, cards: cards.length, critical: cards.filter((card) => card.severity === "critical").length };
    }
  };
}

export function createSceneResolutionRouteLockKit({ manifestKit, inventoryKit } = {}) {
  return {
    id: "n-peer-scene-resolution-route-lock-kit",
    domain: "peer-scene-clue-pressure/resolution-route",
    describe(sceneId, state) {
      const scene = sceneFrom(manifestKit, sceneId);
      const exits = Object.entries(scene.exits ?? {});
      const source = exits.length ? exits : [["settled", { to: sceneId, label: "hold scene", requires: [] }]];
      return source.slice(0, 6).map(([exitId, exit], index) => {
        const missing = missingTokens(state, stableArray(exit.requires), inventoryKit);
        const unlocked = missing.length === 0;
        const readiness = clamp01((unlocked ? 0.76 : 0.24) + stableArray(state?.transitionLedger).length * 0.04 - missing.length * 0.08);
        return {
          id: `${sceneId}-resolution-route-${exitId}`,
          kind: "resolution-route-lock",
          sceneId,
          exitId,
          targetSceneId: exit.to ?? sceneId,
          label: exit.label ?? exitId,
          missing,
          unlocked,
          readiness: Number(readiness.toFixed(2)),
          slot: index,
          rendererBoundary: rendererBoundary("scene-resolution-route-lock-kit")
        };
      });
    },
    snapshot(sceneId, state) {
      const locks = this.describe(sceneId, state);
      return { sceneId, locks: locks.length, unlocked: locks.filter((lock) => lock.unlocked).length };
    }
  };
}

export function createSceneCluePressureRendererHandoffKit() {
  return {
    id: "n-peer-scene-clue-pressure-renderer-handoff-kit",
    domain: "peer-scene-clue-pressure/renderer-handoff",
    describe(sceneId, descriptors) {
      const safeDescriptors = {
        clueVisibilityLanterns: stableArray(descriptors?.clueVisibilityLanterns),
        suspectThreadTraces: stableArray(descriptors?.suspectThreadTraces),
        objectivePressurePips: stableArray(descriptors?.objectivePressurePips),
        misdirectionFogBanks: stableArray(descriptors?.misdirectionFogBanks),
        evidenceGapCards: stableArray(descriptors?.evidenceGapCards),
        resolutionRouteLocks: stableArray(descriptors?.resolutionRouteLocks)
      };
      const counts = Object.fromEntries(Object.entries(safeDescriptors).map(([key, value]) => [key, value.length]));
      return {
        id: `${sceneId}-clue-pressure-renderer-handoff`,
        sceneId,
        consumes: "descriptors-only",
        descriptors: safeDescriptors,
        counts,
        rendererBoundary: rendererBoundary("scene-clue-pressure-renderer-handoff-kit")
      };
    },
    snapshot(sceneId, handoff) {
      return { sceneId, ...handoff.counts, consumes: handoff.consumes };
    }
  };
}

export function createSceneCluePressureReadinessDomainKit({ manifestKit, inventoryKit } = {}) {
  const clueVisibilityKit = createSceneClueVisibilityLanternKit({ manifestKit, inventoryKit });
  const suspectThreadKit = createSceneSuspectThreadTraceKit({ manifestKit });
  const objectivePressureKit = createSceneObjectivePressurePipKit({ manifestKit, inventoryKit });
  const misdirectionFogKit = createSceneMisdirectionFogBankKit({ manifestKit, inventoryKit });
  const evidenceGapKit = createSceneEvidenceGapCardKit({ manifestKit, inventoryKit });
  const resolutionRouteKit = createSceneResolutionRouteLockKit({ manifestKit, inventoryKit });
  const rendererHandoffKit = createSceneCluePressureRendererHandoffKit();
  const kitCount = 7;

  return {
    id: "n-peer-scene-clue-pressure-readiness-domain-kit",
    domain: "peer-scene-clue-pressure-readiness",
    tree: PEER_SCENE_CLUE_PRESSURE_DOMAIN_TREE,
    describe(sceneId, state = {}) {
      const descriptors = {
        clueVisibilityLanterns: clueVisibilityKit.describe(sceneId, state),
        suspectThreadTraces: suspectThreadKit.describe(sceneId, state),
        objectivePressurePips: objectivePressureKit.describe(sceneId, state),
        misdirectionFogBanks: misdirectionFogKit.describe(sceneId, state),
        evidenceGapCards: evidenceGapKit.describe(sceneId, state),
        resolutionRouteLocks: resolutionRouteKit.describe(sceneId, state)
      };
      const rendererHandoff = rendererHandoffKit.describe(sceneId, descriptors);
      const missingEvidence = descriptors.evidenceGapCards.filter((card) => card.missing).length;
      const openRoutes = descriptors.resolutionRouteLocks.filter((lock) => lock.unlocked).length;
      return {
        id: `${sceneId}-clue-pressure-readiness`,
        sceneId,
        kitCount,
        domainTree: PEER_SCENE_CLUE_PRESSURE_DOMAIN_TREE,
        descriptors,
        counts: rendererHandoff.counts,
        summary: {
          missingEvidence,
          openRoutes,
          clueVisibility: Number(clamp01((descriptors.clueVisibilityLanterns.filter((lantern) => lantern.owned).length + openRoutes) / Math.max(1, descriptors.clueVisibilityLanterns.length + descriptors.resolutionRouteLocks.length)).toFixed(2)),
          pressure: pressureScore(state)
        },
        rendererHandoff
      };
    },
    snapshot(sceneId, state = {}) {
      const described = this.describe(sceneId, state);
      return {
        sceneId,
        kitCount,
        clueVisibility: { lanterns: described.counts.clueVisibilityLanterns, lit: described.descriptors.clueVisibilityLanterns.filter((lantern) => lantern.owned).length },
        suspectThreads: { traces: described.counts.suspectThreadTraces, highSuspicion: described.descriptors.suspectThreadTraces.filter((trace) => trace.suspicion > 0.62).length },
        objectivePressure: { pips: described.counts.objectivePressurePips, missing: described.descriptors.objectivePressurePips.filter((pip) => pip.missing).length },
        misdirectionFog: { banks: described.counts.misdirectionFogBanks, dense: described.descriptors.misdirectionFogBanks.filter((bank) => bank.density > 0.55).length },
        evidenceGaps: { cards: described.counts.evidenceGapCards, critical: described.descriptors.evidenceGapCards.filter((card) => card.severity === "critical").length },
        resolutionRoutes: { locks: described.counts.resolutionRouteLocks, unlocked: described.descriptors.resolutionRouteLocks.filter((lock) => lock.unlocked).length },
        summary: described.summary
      };
    }
  };
}

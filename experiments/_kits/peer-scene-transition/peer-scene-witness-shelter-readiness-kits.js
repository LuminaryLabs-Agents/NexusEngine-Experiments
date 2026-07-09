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

function unique(value) {
  return [...new Set(stableArray(value).filter(Boolean))];
}

function tokenSet(state) {
  return new Set([
    ...stableArray(state?.tokens),
    ...stableArray(state?.inventory),
    ...Object.keys(state?.flags ?? {}).filter((key) => state.flags[key])
  ]);
}

function hasToken(state, token) {
  return tokenSet(state).has(token);
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
  const n = Math.sin((hashText(seed) + index * 101) * 12.9898) * 43758.5453;
  return n - Math.floor(n);
}

function sceneFrom(manifestKit, sceneId) {
  const scene = manifestKit?.get?.(sceneId);
  return {
    id: sceneId,
    title: scene?.title ?? sceneId,
    exits: scene?.exits ?? {},
    copy: scene?.copy ?? "",
    mood: scene?.mood ?? sceneId,
    landmarks: stableArray(scene?.landmarks).length ? stableArray(scene.landmarks) : ["witness", "shelter", "road"],
    palette: stableArray(scene?.palette).length ? stableArray(scene.palette) : ["#111827", "#facc15", "#f8fafc"]
  };
}

function sceneList(manifestKit, fallbackSceneId) {
  const list = stableArray(manifestKit?.list?.());
  if (list.length) return list;
  const scene = sceneFrom(manifestKit, fallbackSceneId);
  return [{ id: scene.id, title: scene.title, exits: scene.exits, mood: scene.mood }];
}

function missingTokens(state, requirements, inventoryKit) {
  const required = stableArray(requirements);
  if (inventoryKit?.missing) return stableArray(inventoryKit.missing(state, required));
  const tokens = tokenSet(state);
  return required.filter((token) => !tokens.has(token));
}

function pressureScore(state) {
  const score = state?.pressure?.score;
  if (Number.isFinite(score)) return clamp(score, 0, 100);
  return clamp(stableArray(state?.blockedLedger).length * 14 + stableArray(state?.transitionLedger).length * 8, 0, 100);
}

function routeCompletion(state) {
  const goals = ["has-lantern", "has-rope", "forest-lit", "bridge-repaired", "shrine-open"];
  return goals.filter((token) => hasToken(state, token)).length / goals.length;
}

function rendererBoundary(owner) {
  return {
    owner,
    contract: "renderer consumes descriptors only",
    rendererOwns: ["placement", "CSS class mapping", "draw order", "animation timing"],
    rendererMustNotOwn: ["state mutation", "inventory truth", "route solving", "action eligibility", "witness safety truth", "browser input", "asset loading", "frame-loop ownership"]
  };
}

export const PEER_SCENE_WITNESS_SHELTER_READINESS_DOMAIN_TREE = Object.freeze({
  root: "peer-scene-witness-shelter-readiness-domain",
  subdomains: [
    {
      id: "witness-care-domain",
      subdomains: [
        { id: "lost-witness-domain", kits: ["scene-lost-witness-trail-kit"] },
        { id: "shelter-hearth-domain", kits: ["scene-shelter-hearth-readiness-kit"] }
      ]
    },
    {
      id: "route-safety-domain",
      subdomains: [
        { id: "bridge-escort-domain", kits: ["scene-bridge-escort-rope-kit"] },
        { id: "forest-watch-domain", kits: ["scene-forest-watch-lantern-kit"] }
      ]
    },
    {
      id: "dawn-testimony-domain",
      subdomains: [
        { id: "evidence-bundle-domain", kits: ["scene-evidence-bundle-seal-kit"] },
        { id: "dawn-testimony-domain", kits: ["scene-dawn-testimony-queue-kit"] }
      ]
    },
    {
      id: "renderer-handoff",
      kits: ["scene-witness-shelter-renderer-handoff-kit"],
      contract: "renderer consumes descriptors only"
    }
  ],
  contract: "atomic witness shelter descriptors only; no renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop ownership"
});

export function createSceneLostWitnessTrailKit({ manifestKit } = {}) {
  return {
    id: "n-peer-scene-lost-witness-trail-kit",
    domain: "peer-scene-witness-shelter/lost-witness",
    describe(sceneId, state) {
      const scenes = sceneList(manifestKit, sceneId);
      const visited = new Set(stableArray(state?.visitedSceneIds));
      const pressure = pressureScore(state);
      const source = scenes.length > 1 ? scenes : [sceneFrom(manifestKit, sceneId)];
      return source.slice(0, 6).map((scene, index) => {
        const current = scene.id === sceneId;
        const seen = visited.has(scene.id) || current;
        const risk = clamp01((pressure / 100) * 0.45 + (seen ? 0.18 : 0.54) + index * 0.025);
        return {
          id: `${sceneId}-lost-witness-${scene.id ?? index}`,
          sceneId,
          targetSceneId: scene.id ?? sceneId,
          label: `${scene.title ?? scene.id ?? "Scene"} witness trail`,
          status: current ? "nearby" : seen ? "checked" : "unsearched",
          x: Math.round(8 + index * 14 + seededUnit(`${sceneId}:witness:x`, index) * 8),
          y: Math.round(16 + seededUnit(`${sceneId}:witness:y`, index) * 58),
          urgency: Number(risk.toFixed(2)),
          rendererBoundary: rendererBoundary("scene-lost-witness-trail-kit")
        };
      });
    },
    snapshot(sceneId, state) {
      const trails = this.describe(sceneId, state);
      return { sceneId, trails: trails.length, unsearched: trails.filter((trail) => trail.status === "unsearched").length };
    }
  };
}

export function createSceneShelterHearthReadinessKit({ actionKit } = {}) {
  return {
    id: "n-peer-scene-shelter-hearth-readiness-kit",
    domain: "peer-scene-witness-shelter/shelter-hearth",
    describe(sceneId, state) {
      const actions = stableArray(actionKit?.list?.(sceneId, state));
      const readyActions = actions.filter((action) => !action.done && !action.blocked);
      const completion = routeCompletion(state);
      const heatSources = ["ember", "blanket", "soup", "dry-floor"];
      return heatSources.slice(0, 4).map((source, index) => {
        const actionBoost = readyActions[index] ? 0.12 : 0;
        const readiness = clamp01(0.28 + completion * 0.38 + actionBoost - stableArray(state?.blockedLedger).length * 0.035 + index * 0.055);
        return {
          id: `${sceneId}-shelter-hearth-${source}`,
          sceneId,
          source,
          label: `${source.replace("-", " ")} shelter point`,
          status: readiness > 0.68 ? "warm" : readiness > 0.42 ? "watch" : "cold",
          warmth: Number(readiness.toFixed(2)),
          slot: index,
          rendererBoundary: rendererBoundary("scene-shelter-hearth-readiness-kit")
        };
      });
    },
    snapshot(sceneId, state) {
      const hearths = this.describe(sceneId, state);
      return { sceneId, hearths: hearths.length, warm: hearths.filter((hearth) => hearth.status === "warm").length };
    }
  };
}

export function createSceneBridgeEscortRopeKit({ manifestKit, inventoryKit } = {}) {
  return {
    id: "n-peer-scene-bridge-escort-rope-kit",
    domain: "peer-scene-witness-shelter/bridge-escort",
    describe(sceneId, state) {
      const scene = sceneFrom(manifestKit, sceneId);
      const entries = Object.entries(scene.exits);
      const source = entries.length ? entries : [["hold", { to: sceneId, label: "Hold position", requires: [] }]];
      return source.slice(0, 6).map(([exitId, exit], index) => {
        const missing = missingTokens(state, exit.requires, inventoryKit);
        const open = missing.length === 0;
        return {
          id: `${sceneId}-bridge-escort-${exitId}`,
          sceneId,
          exitId,
          to: exit.to ?? sceneId,
          label: exit.label ?? exitId,
          open,
          missing,
          ropeTension: Number(clamp01((open ? 0.76 : 0.32) + index * 0.035 - missing.length * 0.07).toFixed(2)),
          arc: Number((0.16 + index * 0.13 + (open ? 0.28 : 0.05)).toFixed(2)),
          slot: index,
          rendererBoundary: rendererBoundary("scene-bridge-escort-rope-kit")
        };
      });
    },
    snapshot(sceneId, state) {
      const ropes = this.describe(sceneId, state);
      return { sceneId, ropes: ropes.length, open: ropes.filter((rope) => rope.open).length };
    }
  };
}

export function createSceneForestWatchLanternKit({ manifestKit } = {}) {
  return {
    id: "n-peer-scene-forest-watch-lantern-kit",
    domain: "peer-scene-witness-shelter/forest-watch",
    describe(sceneId, state) {
      const scene = sceneFrom(manifestKit, sceneId);
      const landmarks = scene.landmarks.length ? scene.landmarks : ["north", "east", "south", "west"];
      const hasLantern = hasToken(state, "has-lantern");
      const forestLit = hasToken(state, "forest-lit");
      return landmarks.slice(0, 5).map((landmark, index) => {
        const clarity = clamp01((hasLantern ? 0.48 : 0.16) + (forestLit ? 0.28 : 0) + seededUnit(`${sceneId}:lantern`, index) * 0.26);
        return {
          id: `${sceneId}-forest-watch-${String(landmark).replace(/\s+/g, "-")}`,
          sceneId,
          landmark,
          label: `${landmark} watch lantern`,
          state: clarity > 0.68 ? "clear" : clarity > 0.38 ? "dim" : "blind",
          clarity: Number(clarity.toFixed(2)),
          x: Math.round(12 + index * 16 + seededUnit(`${sceneId}:lantern:x`, index) * 6),
          y: Math.round(18 + seededUnit(`${sceneId}:lantern:y`, index) * 50),
          rendererBoundary: rendererBoundary("scene-forest-watch-lantern-kit")
        };
      });
    },
    snapshot(sceneId, state) {
      const lanterns = this.describe(sceneId, state);
      return { sceneId, lanterns: lanterns.length, clear: lanterns.filter((lantern) => lantern.state === "clear").length };
    }
  };
}

export function createSceneEvidenceBundleSealKit() {
  return {
    id: "n-peer-scene-evidence-bundle-seal-kit",
    domain: "peer-scene-witness-shelter/evidence-bundle",
    describe(sceneId, state) {
      const tokens = unique([...stableArray(state?.tokens), ...stableArray(state?.inventory), ...Object.keys(state?.flags ?? {})]);
      const source = tokens.length ? tokens : ["missing-proof"];
      return source.slice(0, 7).map((token, index) => {
        const sealed = token !== "missing-proof" && (token.includes("has-") || token.includes("repaired") || token.includes("open") || token.includes("lit"));
        const value = clamp01((sealed ? 0.72 : 0.24) + index * 0.035 + routeCompletion(state) * 0.16);
        return {
          id: `${sceneId}-evidence-bundle-${token}`,
          sceneId,
          token,
          label: token.replace(/[-_]/g, " "),
          state: sealed ? "sealed" : "loose",
          value: Number(value.toFixed(2)),
          slot: index,
          rendererBoundary: rendererBoundary("scene-evidence-bundle-seal-kit")
        };
      });
    },
    snapshot(sceneId, state) {
      const bundles = this.describe(sceneId, state);
      return { sceneId, bundles: bundles.length, sealed: bundles.filter((bundle) => bundle.state === "sealed").length };
    }
  };
}

export function createSceneDawnTestimonyQueueKit({ manifestKit } = {}) {
  return {
    id: "n-peer-scene-dawn-testimony-queue-kit",
    domain: "peer-scene-witness-shelter/dawn-testimony",
    describe(sceneId, state) {
      const visited = stableArray(state?.visitedSceneIds);
      const transitions = stableArray(state?.transitionLedger);
      const actions = stableArray(state?.actionLedger);
      const scenes = sceneList(manifestKit, sceneId);
      const source = [
        ...visited.map((id) => ({ id, type: "visited" })),
        ...transitions.map((transition, index) => ({ id: transition.to ?? `transition-${index}`, type: "transition" })),
        ...actions.slice(0, 4).map((action, index) => ({ id: action.id ?? action.label ?? `action-${index}`, type: "action" }))
      ];
      const entries = source.length ? source : scenes.slice(0, 3).map((scene) => ({ id: scene.id, type: "unwritten" }));
      return entries.slice(0, 8).map((entry, index) => ({
        id: `${sceneId}-dawn-testimony-${entry.type}-${entry.id}`,
        sceneId,
        targetId: entry.id,
        type: entry.type,
        label: `${entry.type} ${String(entry.id).replace(/[-_]/g, " ")}`,
        readiness: Number(clamp01(0.24 + index * 0.06 + routeCompletion(state) * 0.45).toFixed(2)),
        slot: index,
        rendererBoundary: rendererBoundary("scene-dawn-testimony-queue-kit")
      }));
    },
    snapshot(sceneId, state) {
      const testimony = this.describe(sceneId, state);
      return { sceneId, testimony: testimony.length, ready: testimony.filter((entry) => entry.readiness > 0.55).length };
    }
  };
}

export function createSceneWitnessShelterRendererHandoffKit() {
  return {
    id: "n-peer-scene-witness-shelter-renderer-handoff-kit",
    domain: "peer-scene-witness-shelter/renderer-handoff",
    describe({ sceneId, lostWitnessTrails, shelterHearths, bridgeEscortRopes, forestWatchLanterns, evidenceBundleSeals, dawnTestimonyQueue, baseDescriptorId = "peer-scene-base" } = {}) {
      const descriptors = {
        lostWitnessTrails: stableArray(lostWitnessTrails),
        shelterHearths: stableArray(shelterHearths),
        bridgeEscortRopes: stableArray(bridgeEscortRopes),
        forestWatchLanterns: stableArray(forestWatchLanterns),
        evidenceBundleSeals: stableArray(evidenceBundleSeals),
        dawnTestimonyQueue: stableArray(dawnTestimonyQueue)
      };
      const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, value.length]));
      return {
        id: `${sceneId}-witness-shelter-readiness-handoff`,
        sceneId,
        baseDescriptorId,
        handoff: "renderer-consumes-descriptors-only",
        descriptors,
        counts,
        descriptorCount: Object.values(counts).reduce((sum, count) => sum + count, 0),
        rendererBoundary: rendererBoundary("scene-witness-shelter-renderer-handoff-kit")
      };
    },
    snapshot(payload = {}) {
      const handoff = this.describe(payload);
      return { sceneId: handoff.sceneId, descriptorCount: handoff.descriptorCount, counts: handoff.counts };
    }
  };
}

export function createSceneWitnessShelterReadinessDomainKit({ manifestKit, inventoryKit, actionKit } = {}) {
  const lostWitnessTrailKit = createSceneLostWitnessTrailKit({ manifestKit });
  const shelterHearthReadinessKit = createSceneShelterHearthReadinessKit({ actionKit });
  const bridgeEscortRopeKit = createSceneBridgeEscortRopeKit({ manifestKit, inventoryKit });
  const forestWatchLanternKit = createSceneForestWatchLanternKit({ manifestKit });
  const evidenceBundleSealKit = createSceneEvidenceBundleSealKit();
  const dawnTestimonyQueueKit = createSceneDawnTestimonyQueueKit({ manifestKit });
  const rendererHandoffKit = createSceneWitnessShelterRendererHandoffKit();

  return {
    id: "n-peer-scene-witness-shelter-readiness-domain-kit",
    domain: "peer-scene-witness-shelter",
    tree: PEER_SCENE_WITNESS_SHELTER_READINESS_DOMAIN_TREE,
    kits: {
      lostWitnessTrailKit,
      shelterHearthReadinessKit,
      bridgeEscortRopeKit,
      forestWatchLanternKit,
      evidenceBundleSealKit,
      dawnTestimonyQueueKit,
      rendererHandoffKit
    },
    describe(sceneId, state, context = {}) {
      const lostWitnessTrails = lostWitnessTrailKit.describe(sceneId, state);
      const shelterHearths = shelterHearthReadinessKit.describe(sceneId, state);
      const bridgeEscortRopes = bridgeEscortRopeKit.describe(sceneId, state);
      const forestWatchLanterns = forestWatchLanternKit.describe(sceneId, state);
      const evidenceBundleSeals = evidenceBundleSealKit.describe(sceneId, state);
      const dawnTestimonyQueue = dawnTestimonyQueueKit.describe(sceneId, state);
      return rendererHandoffKit.describe({
        sceneId,
        lostWitnessTrails,
        shelterHearths,
        bridgeEscortRopes,
        forestWatchLanterns,
        evidenceBundleSeals,
        dawnTestimonyQueue,
        baseDescriptorId: context?.baseHandoff?.id ?? "peer-scene-base"
      });
    },
    snapshot(sceneId, state) {
      const handoff = this.describe(sceneId, state);
      return {
        sceneId,
        domain: this.domain,
        tree: this.tree.root,
        descriptorCount: handoff.descriptorCount,
        counts: handoff.counts
      };
    }
  };
}

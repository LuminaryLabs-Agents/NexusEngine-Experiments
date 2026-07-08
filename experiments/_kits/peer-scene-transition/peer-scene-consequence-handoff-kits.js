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
  const n = Math.sin((hashText(seed) + index * 97) * 12.9898) * 43758.5453;
  return n - Math.floor(n);
}

function sceneFrom(manifestKit, sceneId) {
  const scene = manifestKit?.get?.(sceneId);
  return {
    id: sceneId,
    title: scene?.title ?? sceneId,
    exits: scene?.exits ?? {},
    actions: stableArray(scene?.actions),
    landmarks: stableArray(scene?.landmarks).length ? stableArray(scene.landmarks) : [sceneId, "threshold", "memory"],
    mood: scene?.mood ?? sceneId,
    palette: stableArray(scene?.palette).length ? stableArray(scene.palette) : ["#111827", "#e9b872", "#ffffff"]
  };
}

function pressureScore(state) {
  const pressure = state?.pressure?.score;
  if (Number.isFinite(pressure)) return clamp(pressure, 0, 100);
  return clamp(stableArray(state?.blockedLedger).length * 14 + stableArray(state?.transitionLedger).length * 8 + stableArray(state?.actionLedger).length * 5, 0, 100);
}

function completionForState(state) {
  const goals = ["has-lantern", "has-rope", "forest-lit", "bridge-repaired", "shrine-open"];
  return Math.round((goals.filter((token) => hasToken(state, token)).length / goals.length) * 100);
}

function rendererBoundary(owner) {
  return {
    owner,
    rendererOwns: ["placement", "CSS class mapping", "draw order", "animation timing"],
    rendererMustNotOwn: ["state mutation", "inventory truth", "route solving", "choice eligibility", "consequence synthesis", "browser input"]
  };
}

export const PEER_SCENE_CONSEQUENCE_DOMAIN_TREE = Object.freeze({
  root: "peer-scene-consequence-domain",
  subdomains: [
    {
      id: "cause-readability",
      subdomains: [
        { id: "cause-lens-domain", kits: ["scene-cause-lens-kit"] },
        { id: "ally-presence-domain", kits: ["scene-ally-presence-kit"] }
      ]
    },
    {
      id: "future-pressure",
      subdomains: [
        { id: "risk-delta-domain", kits: ["scene-risk-delta-kit"] },
        { id: "route-consequence-domain", kits: ["scene-route-consequence-kit"] },
        { id: "reward-preview-domain", kits: ["scene-reward-preview-kit"] }
      ]
    },
    {
      id: "renderer-handoff",
      kits: ["scene-consequence-renderer-handoff-kit"],
      contract: "renderer consumes descriptors only"
    }
  ],
  contract: "atomic consequence descriptors only; no DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop ownership"
});

export function createSceneCauseLensKit({ manifestKit } = {}) {
  return {
    id: "n-peer-scene-cause-lens-kit",
    domain: "peer-scene-consequence/cause-lens",
    describe(sceneId, state) {
      const scene = sceneFrom(manifestKit, sceneId);
      const actionLedger = stableArray(state?.actionLedger);
      const transitionLedger = stableArray(state?.transitionLedger);
      const source = [...actionLedger.slice(-3), ...transitionLedger.slice(-2)];
      const fallbacks = scene.landmarks.map((landmark, index) => ({ type: "landmark", label: landmark, sceneId, index }));
      return (source.length ? source : fallbacks).slice(0, 5).map((entry, index) => {
        const label = entry.label ?? entry.actionId ?? entry.to ?? entry.type ?? `cause-${index}`;
        return {
          id: `${sceneId}-cause-lens-${index}`,
          sceneId,
          label: String(label).replace(/[-_]/g, " "),
          sourceType: entry.type ?? (entry.to ? "transition" : "action"),
          slot: index,
          weight: Number(clamp01(0.34 + index * 0.09 + completionForState(state) / 240).toFixed(2)),
          drift: Number((0.1 + seededUnit(`${sceneId}:cause`, index) * 0.82).toFixed(2)),
          palette: scene.palette[index % scene.palette.length],
          rendererBoundary: rendererBoundary("scene-cause-lens-kit")
        };
      });
    },
    snapshot(sceneId, state) {
      const lenses = this.describe(sceneId, state);
      return { sceneId, lenses: lenses.length, maxWeight: lenses.reduce((max, lens) => Math.max(max, lens.weight), 0) };
    }
  };
}

export function createSceneRiskDeltaKit({ manifestKit, inventoryKit } = {}) {
  return {
    id: "n-peer-scene-risk-delta-kit",
    domain: "peer-scene-consequence/risk-delta",
    describe(sceneId, state) {
      const scene = sceneFrom(manifestKit, sceneId);
      const exits = Object.entries(scene.exits);
      const pressure = pressureScore(state);
      const blocked = stableArray(state?.blockedLedger).length;
      const source = exits.length ? exits : [["wait", { label: "Hold position", to: sceneId, requires: [] }]];
      return source.slice(0, 5).map(([exitId, exit], index) => {
        const missing = stableArray(inventoryKit?.missing?.(state, exit.requires ?? []) ?? []);
        const severity = clamp01(pressure / 100 + missing.length * 0.18 + blocked * 0.025);
        return {
          id: `${sceneId}-risk-delta-${exitId}`,
          sceneId,
          exitId,
          label: exit.label ?? exitId,
          to: exit.to ?? sceneId,
          missing,
          open: missing.length === 0,
          x: Math.round(8 + index * 19 + seededUnit(`${sceneId}:risk:x`, index) * 10),
          y: Math.round(14 + seededUnit(`${sceneId}:risk:y`, index) * 62),
          severity: Number(severity.toFixed(2)),
          band: index,
          rendererBoundary: rendererBoundary("scene-risk-delta-kit")
        };
      });
    },
    snapshot(sceneId, state) {
      const risks = this.describe(sceneId, state);
      return { sceneId, risks: risks.length, open: risks.filter((risk) => risk.open).length, sealed: risks.filter((risk) => !risk.open).length };
    }
  };
}

export function createSceneAllyPresenceKit() {
  return {
    id: "n-peer-scene-ally-presence-kit",
    domain: "peer-scene-consequence/ally-presence",
    describe(sceneId, state) {
      const tokens = unique([...(state?.tokens ?? []), ...(state?.inventory ?? []), ...Object.keys(state?.flags ?? {})]);
      const allies = [
        { token: "has-lantern", label: "Lantern memory", glyph: "lantern" },
        { token: "has-rope", label: "Rope promise", glyph: "rope" },
        { token: "forest-lit", label: "Lit trail", glyph: "forest" },
        { token: "bridge-repaired", label: "Bridge trust", glyph: "bridge" },
        { token: "shrine-open", label: "Shrine answer", glyph: "seal" }
      ];
      return allies.map((ally, index) => ({
        id: `${sceneId}-ally-presence-${ally.token}`,
        sceneId,
        token: ally.token,
        label: ally.label,
        glyph: ally.glyph,
        present: tokens.includes(ally.token),
        x: Math.round(12 + index * 17 + seededUnit(`${sceneId}:ally:x`, index) * 6),
        y: Math.round(16 + seededUnit(`${sceneId}:ally:y`, index) * 58),
        radius: 3 + (index % 3),
        weight: Number(clamp01((tokens.includes(ally.token) ? 0.88 : 0.22) + index * 0.02).toFixed(2)),
        rendererBoundary: rendererBoundary("scene-ally-presence-kit")
      }));
    },
    snapshot(sceneId, state) {
      const allies = this.describe(sceneId, state);
      return { sceneId, allies: allies.length, present: allies.filter((ally) => ally.present).length };
    }
  };
}

export function createSceneRouteConsequenceKit({ manifestKit, inventoryKit } = {}) {
  return {
    id: "n-peer-scene-route-consequence-kit",
    domain: "peer-scene-consequence/route-consequences",
    describe(sceneId, state) {
      const scene = sceneFrom(manifestKit, sceneId);
      const exits = Object.entries(scene.exits);
      const source = exits.length ? exits : [["stay", { label: "Stay here", to: sceneId, requires: [] }]];
      const completion = completionForState(state);
      return source.slice(0, 6).map(([exitId, exit], index) => {
        const missing = stableArray(inventoryKit?.missing?.(state, exit.requires ?? []) ?? []);
        const open = missing.length === 0;
        return {
          id: `${sceneId}-route-consequence-${exitId}`,
          sceneId,
          exitId,
          label: exit.label ?? exitId,
          to: exit.to ?? sceneId,
          open,
          missing,
          consequence: open ? `opens ${exit.to ?? sceneId}` : `delays ${missing.join(" + ")}`,
          slot: index,
          arc: Number((0.18 + index * 0.12 + (open ? 0.24 : 0.04)).toFixed(2)),
          weight: Number(clamp01((open ? 0.72 : 0.28) + completion / 220).toFixed(2)),
          rendererBoundary: rendererBoundary("scene-route-consequence-kit")
        };
      });
    },
    snapshot(sceneId, state) {
      const routes = this.describe(sceneId, state);
      return { sceneId, routes: routes.length, open: routes.filter((route) => route.open).length };
    }
  };
}

export function createSceneRewardPreviewKit({ actionKit } = {}) {
  return {
    id: "n-peer-scene-reward-preview-kit",
    domain: "peer-scene-consequence/reward-preview",
    describe(sceneId, state) {
      const actions = stableArray(actionKit?.list?.(sceneId, state));
      const source = actions.length ? actions : [{ id: "observe", label: "Observe", done: false, blocked: false, missing: [] }];
      return source.slice(0, 6).map((action, index) => ({
        id: `${sceneId}-reward-preview-${action.id ?? index}`,
        sceneId,
        actionId: action.id ?? `action-${index}`,
        label: action.label ?? "Action",
        state: action.done ? "claimed" : action.blocked ? "withheld" : "available",
        missing: stableArray(action.missing),
        glyph: action.done ? "✓" : action.blocked ? "×" : "+",
        slot: index,
        pulse: Number(clamp01(action.done ? 0.2 : action.blocked ? 0.44 : 0.86).toFixed(2)),
        value: Number(clamp01((action.blocked ? 0.32 : 0.76) + index * 0.03).toFixed(2)),
        rendererBoundary: rendererBoundary("scene-reward-preview-kit")
      }));
    },
    snapshot(sceneId, state) {
      const previews = this.describe(sceneId, state);
      return { sceneId, previews: previews.length, available: previews.filter((preview) => preview.state === "available").length, withheld: previews.filter((preview) => preview.state === "withheld").length };
    }
  };
}

export function createSceneConsequenceRendererHandoffKit() {
  return {
    id: "n-peer-scene-consequence-renderer-handoff-kit",
    domain: "peer-scene-consequence/renderer-handoff",
    describe({ sceneId, causeLens, riskDelta, allyPresence, routeConsequences, rewardPreview, baseDescriptorId = null }) {
      return {
        id: `${sceneId}-consequence-renderer-handoff`,
        sceneId,
        domainTree: PEER_SCENE_CONSEQUENCE_DOMAIN_TREE,
        baseDescriptorId,
        rendererBoundary: rendererBoundary("scene-consequence-renderer-handoff-kit"),
        descriptors: { causeLens, riskDelta, allyPresence, routeConsequences, rewardPreview },
        counts: {
          causeLens: causeLens.length,
          riskDelta: riskDelta.length,
          allyPresence: allyPresence.length,
          routeConsequences: routeConsequences.length,
          rewardPreview: rewardPreview.length
        }
      };
    },
    snapshot(handoff) {
      return { sceneId: handoff.sceneId, ...handoff.counts };
    }
  };
}

export function createSceneConsequenceDomainKit({ manifestKit, inventoryKit, actionKit } = {}) {
  const causeLensKit = createSceneCauseLensKit({ manifestKit });
  const riskDeltaKit = createSceneRiskDeltaKit({ manifestKit, inventoryKit });
  const allyPresenceKit = createSceneAllyPresenceKit();
  const routeConsequenceKit = createSceneRouteConsequenceKit({ manifestKit, inventoryKit });
  const rewardPreviewKit = createSceneRewardPreviewKit({ actionKit });
  const rendererHandoffKit = createSceneConsequenceRendererHandoffKit();
  return {
    id: "n-peer-scene-consequence-domain-kit",
    domain: "peer-scene-consequence-domain",
    kits: { causeLensKit, riskDeltaKit, allyPresenceKit, routeConsequenceKit, rewardPreviewKit, rendererHandoffKit },
    describe(sceneId, state, context = {}) {
      const causeLens = causeLensKit.describe(sceneId, state);
      const riskDelta = riskDeltaKit.describe(sceneId, state);
      const allyPresence = allyPresenceKit.describe(sceneId, state);
      const routeConsequences = routeConsequenceKit.describe(sceneId, state);
      const rewardPreview = rewardPreviewKit.describe(sceneId, state);
      return rendererHandoffKit.describe({
        sceneId,
        causeLens,
        riskDelta,
        allyPresence,
        routeConsequences,
        rewardPreview,
        baseDescriptorId: context.chronicle?.id ?? context.atmospheric?.id ?? context.baseHandoff?.id ?? null
      });
    },
    snapshot(sceneId, state) {
      const handoff = this.describe(sceneId, state);
      return {
        kitCount: Object.keys(this.kits).length,
        sceneId,
        cause: causeLensKit.snapshot(sceneId, state),
        risk: riskDeltaKit.snapshot(sceneId, state),
        allies: allyPresenceKit.snapshot(sceneId, state),
        routes: routeConsequenceKit.snapshot(sceneId, state),
        rewards: rewardPreviewKit.snapshot(sceneId, state),
        handoff: rendererHandoffKit.snapshot(handoff)
      };
    }
  };
}

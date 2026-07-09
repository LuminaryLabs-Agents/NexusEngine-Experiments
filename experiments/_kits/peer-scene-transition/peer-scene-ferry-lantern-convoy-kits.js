export const PEER_SCENE_FERRY_LANTERN_CONVOY_DOMAIN = Object.freeze({
  id: "peer-scene-ferry-lantern-convoy-readiness-domain",
  owns: [
    "sceneId",
    "visitedSceneCount",
    "lanternBuoyCoverage",
    "ferryDockIntegrity",
    "supplyCrateAccounting",
    "survivorRollCall",
    "convoyReadiness",
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
    "physics",
    "network"
  ],
  tree: `peer-scene-ferry-lantern-convoy-readiness-domain
├─ river-crossing-domain
│  ├─ ferry-dock-cleat-domain
│  │  └─ peer-scene-ferry-dock-cleat-kit
│  └─ lantern-buoy-chain-domain
│     └─ peer-scene-lantern-buoy-chain-kit
├─ convoy-supply-domain
│  ├─ cargo-tally-domain
│  │  ├─ crate-token-domain
│  │  │  └─ peer-scene-cargo-tally-token-kit
│  └─ scout-raft-domain
│     └─ peer-scene-scout-raft-route-kit
├─ passenger-handoff-domain
│  ├─ survivor-rollcall-domain
│  │  └─ peer-scene-survivor-rollcall-card-kit
│  └─ dawn-ferry-ledger-domain
│     └─ peer-scene-dawn-ferry-ledger-kit
└─ renderer-handoff
   └─ peer-scene-ferry-lantern-convoy-renderer-handoff-kit
      └─ renderer consumes descriptors only`
});

export const PEER_SCENE_FERRY_LANTERN_CONVOY_KITS = Object.freeze([
  "peer-scene-ferry-dock-cleat-kit",
  "peer-scene-lantern-buoy-chain-kit",
  "peer-scene-cargo-tally-token-kit",
  "peer-scene-scout-raft-route-kit",
  "peer-scene-survivor-rollcall-card-kit",
  "peer-scene-dawn-ferry-ledger-kit",
  "peer-scene-ferry-lantern-convoy-renderer-handoff-kit"
]);

const SCENE_ORDER = Object.freeze(["camp", "crossroads", "forest", "bridge", "shrine", "ending"]);
const SCENE_LABELS = Object.freeze({
  camp: "Ash Road Camp",
  crossroads: "Crossroads",
  forest: "Lantern Forest",
  bridge: "Old Bridge",
  shrine: "Silent Shrine",
  ending: "Dawn Ending"
});

function clamp(value, min, max) {
  const numeric = Number.isFinite(Number(value)) ? Number(value) : min;
  return Math.max(min, Math.min(max, numeric));
}

function clamp01(value) {
  return clamp(value, 0, 1);
}

function normalizeList(value) {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function normalizeState(input = {}) {
  const sceneId = String(input.sceneId ?? input.currentScene ?? input.currentSceneId ?? "camp");
  const currentScene = SCENE_ORDER.includes(sceneId) ? sceneId : "camp";
  const visited = normalizeList(input.visited ?? input.visitedScenes ?? input.visitedSceneIds);
  const inventory = normalizeList(input.inventory ?? input.items);
  const tokens = normalizeList(input.tokens ?? input.routeTokens);
  const actions = normalizeList(input.actions ?? input.completedActions ?? input.doneActions);
  const flags = input.flags && typeof input.flags === "object" ? Object.keys(input.flags).filter((key) => input.flags[key]) : [];
  const log = normalizeList(input.log ?? input.messages);
  const pressureSource = typeof input.pressure === "object" ? input.pressure?.score : input.pressure;
  const pressure = clamp(Number(input.pressureScore ?? input.hazardPressure ?? pressureSource ?? 0), 0, 100);
  const allTokens = [...inventory, ...tokens, ...actions, ...flags, ...log].map(String);
  return Object.freeze({
    sceneId: currentScene,
    visited: visited.length ? [...new Set(visited)] : [currentScene],
    inventory,
    tokens,
    actions,
    flags,
    log,
    allTokens,
    pressure,
    time: clamp(Number(input.time ?? input.tick ?? 0), 0, 9999),
    seed: String(input.seed ?? currentScene)
  });
}

function hasToken(state, token) {
  const needle = String(token).toLowerCase();
  return state.allTokens.some((item) => item.toLowerCase().includes(needle));
}

function makeDescriptor(kind, id, fields = {}) {
  return Object.freeze({ kind, id, ...fields });
}

function sceneIndex(sceneId) {
  return Math.max(0, SCENE_ORDER.indexOf(sceneId));
}

function readinessPhase(score) {
  if (score >= 86) return "dawn-convoy-ready";
  if (score >= 64) return "passengers-staged";
  if (score >= 38) return "lantern-route-forming";
  return "ferry-route-unprepared";
}

export function createPeerSceneFerryDockCleatKit() {
  return Object.freeze({
    id: "peer-scene-ferry-dock-cleat-kit",
    describe(input = {}) {
      const state = normalizeState(input);
      const index = sceneIndex(state.sceneId);
      const ropeReady = hasToken(state, "rope") || hasToken(state, "bridge") || hasToken(state, "plank");
      return SCENE_ORDER.slice(0, 5).map((scene, slot) => makeDescriptor("ferryDockCleat", `ferry-cleat-${scene}`, {
        scene,
        label: `${SCENE_LABELS[scene]} ferry cleat`,
        x: 10 + slot * 18,
        y: 72 - ((slot + index) % 3) * 8,
        knotCount: 2 + slot + (ropeReady ? 2 : 0),
        lashed: state.visited.includes(scene) || (ropeReady && slot <= index + 1),
        integrity: Number(clamp01(0.24 + (state.visited.includes(scene) ? 0.3 : 0) + (ropeReady ? 0.22 : 0) - state.pressure / 340).toFixed(3))
      }));
    }
  });
}

export function createPeerSceneLanternBuoyChainKit() {
  return Object.freeze({
    id: "peer-scene-lantern-buoy-chain-kit",
    describe(input = {}) {
      const state = normalizeState(input);
      const lanternReady = hasToken(state, "lantern") || hasToken(state, "forest-lit");
      return SCENE_ORDER.slice(0, -1).map((scene, slot) => makeDescriptor("lanternBuoyChain", `lantern-buoy-${scene}-${SCENE_ORDER[slot + 1]}`, {
        from: scene,
        to: SCENE_ORDER[slot + 1],
        label: `${SCENE_LABELS[scene]} to ${SCENE_LABELS[SCENE_ORDER[slot + 1]]} buoy chain`,
        buoyCount: 3 + slot + (lanternReady ? 2 : 0),
        lit: lanternReady && (state.visited.includes(scene) || state.visited.includes(SCENE_ORDER[slot + 1])),
        spacing: Number((1.1 + slot * 0.16 + (lanternReady ? 0.28 : 0)).toFixed(2)),
        driftRisk: Number(clamp01(0.72 - state.visited.length * 0.07 - (lanternReady ? 0.21 : 0) + state.pressure / 220).toFixed(3))
      }));
    }
  });
}

export function createPeerSceneCargoTallyTokenKit() {
  return Object.freeze({
    id: "peer-scene-cargo-tally-token-kit",
    describe(input = {}) {
      const state = normalizeState(input);
      const cargoTokens = ["lantern", "rope", "map", "seal", "bridge", "shrine", "forest"].filter((token) => hasToken(state, token));
      return SCENE_ORDER.slice(0, 5).map((scene, slot) => makeDescriptor("cargoTallyToken", `cargo-tally-${scene}`, {
        scene,
        label: `${SCENE_LABELS[scene]} cargo tally`,
        crateCount: 1 + slot + Math.min(4, cargoTokens.length),
        sealed: state.visited.includes(scene) && cargoTokens.length >= Math.min(2, slot + 1),
        manifestWeight: Number(clamp01(0.18 + cargoTokens.length * 0.09 + (state.visited.includes(scene) ? 0.25 : 0)).toFixed(3)),
        x: 16 + slot * 15,
        y: 22 + (slot % 2) * 12
      }));
    }
  });
}

export function createPeerSceneScoutRaftRouteKit() {
  return Object.freeze({
    id: "peer-scene-scout-raft-route-kit",
    describe(input = {}) {
      const state = normalizeState(input);
      const index = sceneIndex(state.sceneId);
      return SCENE_ORDER.slice(0, -1).map((scene, slot) => makeDescriptor("scoutRaftRoute", `scout-raft-${scene}-${SCENE_ORDER[slot + 1]}`, {
        from: scene,
        to: SCENE_ORDER[slot + 1],
        label: `${SCENE_LABELS[scene]} scout raft route`,
        scouted: slot < index || state.visited.includes(SCENE_ORDER[slot + 1]),
        current: slot === index,
        currentSpeed: Number(clamp01(0.3 + slot * 0.05 + state.pressure / 210).toFixed(3)),
        routeConfidence: Number(clamp01(0.22 + state.visited.length * 0.1 + (slot < index ? 0.18 : 0) - state.pressure / 330).toFixed(3))
      }));
    }
  });
}

export function createPeerSceneSurvivorRollcallCardKit() {
  return Object.freeze({
    id: "peer-scene-survivor-rollcall-card-kit",
    describe(input = {}) {
      const state = normalizeState(input);
      return SCENE_ORDER.slice(0, 5).map((scene, slot) => makeDescriptor("survivorRollcallCard", `survivor-rollcall-${scene}`, {
        scene,
        label: `${SCENE_LABELS[scene]} survivor roll call`,
        present: state.visited.includes(scene),
        passengerCount: 2 + slot + (state.visited.includes(scene) ? 2 : 0),
        priority: slot === sceneIndex(state.sceneId) ? "current" : state.visited.includes(scene) ? "cleared" : "missing",
        confidence: Number(clamp01(0.28 + (state.visited.includes(scene) ? 0.38 : 0) + state.actions.length * 0.03 - state.pressure / 360).toFixed(3))
      }));
    }
  });
}

export function createPeerSceneDawnFerryLedgerKit() {
  return Object.freeze({
    id: "peer-scene-dawn-ferry-ledger-kit",
    describe(input = {}, descriptors = {}) {
      const cleats = descriptors.ferryDockCleats?.filter((item) => item.lashed).length ?? 0;
      const buoys = descriptors.lanternBuoyChains?.filter((item) => item.lit).length ?? 0;
      const cargo = descriptors.cargoTallyTokens?.filter((item) => item.sealed).length ?? 0;
      const rafts = descriptors.scoutRaftRoutes?.filter((item) => item.scouted).length ?? 0;
      const rollcall = descriptors.survivorRollcallCards?.filter((item) => item.present).length ?? 0;
      const readiness = Math.round(clamp01((cleats + buoys + cargo + rafts + rollcall) / 25) * 100);
      return [makeDescriptor("dawnFerryLedger", "dawn-ferry-ledger", {
        label: "Dawn ferry convoy ledger",
        cleats,
        buoys,
        cargo,
        rafts,
        rollcall,
        readiness,
        phase: readinessPhase(readiness),
        missing: [
          cleats < 5 ? "lash ferry cleats" : null,
          buoys < 5 ? "light buoy chains" : null,
          cargo < 4 ? "seal cargo tallies" : null,
          rafts < 5 ? "scout raft routes" : null,
          rollcall < 5 ? "complete survivor roll call" : null
        ].filter(Boolean)
      })];
    }
  });
}

export function createPeerSceneFerryLanternConvoyRendererHandoffKit() {
  return Object.freeze({
    id: "peer-scene-ferry-lantern-convoy-renderer-handoff-kit",
    describe(input = {}, descriptors = {}) {
      const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : 0]));
      const flatDescriptors = Object.values(descriptors).flatMap((value) => Array.isArray(value) ? value : []);
      return Object.freeze({
        type: "peer-scene-ferry-lantern-convoy-renderer-handoff",
        passId: "ferry-lantern-convoy-readiness-renderer-handoff-pass",
        descriptorOnly: true,
        policy: "renderer-consumes-descriptors-only",
        descriptors,
        flatDescriptors,
        counts,
        ownership: {
          reusableLogic: "plain-input-to-plain-descriptor-output",
          renderer: "consume-only",
          exclusions: PEER_SCENE_FERRY_LANTERN_CONVOY_DOMAIN.excludes
        }
      });
    }
  });
}

export function createPeerSceneFerryLanternConvoyReadiness(input = {}) {
  return createPeerSceneFerryLanternConvoyDomainKit().describe(input);
}

export function createPeerSceneFerryLanternConvoyDomainKit() {
  const cleatKit = createPeerSceneFerryDockCleatKit();
  const buoyKit = createPeerSceneLanternBuoyChainKit();
  const cargoKit = createPeerSceneCargoTallyTokenKit();
  const raftKit = createPeerSceneScoutRaftRouteKit();
  const rollcallKit = createPeerSceneSurvivorRollcallCardKit();
  const ledgerKit = createPeerSceneDawnFerryLedgerKit();
  const handoffKit = createPeerSceneFerryLanternConvoyRendererHandoffKit();

  return Object.freeze({
    id: "peer-scene-ferry-lantern-convoy-readiness-domain-kit",
    tree: PEER_SCENE_FERRY_LANTERN_CONVOY_DOMAIN.tree,
    describe(input = {}) {
      const state = normalizeState(input);
      const descriptors = {
        ferryDockCleats: cleatKit.describe(state),
        lanternBuoyChains: buoyKit.describe(state),
        cargoTallyTokens: cargoKit.describe(state),
        scoutRaftRoutes: raftKit.describe(state),
        survivorRollcallCards: rollcallKit.describe(state)
      };
      descriptors.dawnFerryLedgers = ledgerKit.describe(state, descriptors);
      const rendererHandoff = handoffKit.describe(state, descriptors);
      const ledger = descriptors.dawnFerryLedgers[0];
      const crossingPressure = Math.round(clamp01((state.pressure + (100 - ledger.readiness) * 0.52) / 152) * 100);
      return Object.freeze({
        domainId: PEER_SCENE_FERRY_LANTERN_CONVOY_DOMAIN.id,
        domainTree: PEER_SCENE_FERRY_LANTERN_CONVOY_DOMAIN.tree,
        kits: PEER_SCENE_FERRY_LANTERN_CONVOY_KITS,
        ownershipExclusions: PEER_SCENE_FERRY_LANTERN_CONVOY_DOMAIN.excludes,
        sceneId: state.sceneId,
        readiness: ledger.readiness,
        crossingPressure,
        phase: ledger.phase,
        missing: ledger.missing,
        summary: Object.freeze({
          readinessScore: Number((ledger.readiness / 100).toFixed(3)),
          pressure: Number((crossingPressure / 100).toFixed(3)),
          missionState: ledger.phase
        }),
        descriptors,
        rendererHandoff
      });
    },
    snapshot(input = {}) {
      const readiness = this.describe(input);
      return Object.freeze({
        domainId: readiness.domainId,
        sceneId: readiness.sceneId,
        readiness: readiness.readiness,
        crossingPressure: readiness.crossingPressure,
        phase: readiness.phase,
        counts: readiness.rendererHandoff.counts
      });
    }
  });
}

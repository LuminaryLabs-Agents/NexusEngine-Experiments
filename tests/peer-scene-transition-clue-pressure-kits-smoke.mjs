import assert from "node:assert/strict";
import {
  PEER_SCENE_CLUE_PRESSURE_DOMAIN_TREE,
  createSceneCluePressureReadinessDomainKit
} from "../experiments/_kits/peer-scene-transition/peer-scene-clue-pressure-handoff-kits.js";

const scenes = {
  camp: { id: "camp", title: "Ash Road Camp", exits: { road: { to: "crossroads", label: "Walk to the crossroads" } } },
  crossroads: {
    id: "crossroads",
    title: "The Crossroads",
    exits: {
      forest: { to: "forest", label: "Enter the lantern forest", requires: ["has-lantern"] },
      bridge: { to: "bridge", label: "Take the old bridge" }
    }
  },
  forest: { id: "forest", title: "Lantern Forest", exits: { shrine: { to: "shrine", label: "Follow the lit root path", requires: ["forest-lit"] } } },
  bridge: { id: "bridge", title: "Old Bridge", exits: { shrine: { to: "shrine", label: "Cross toward the shrine", requires: ["bridge-repaired"] } } },
  shrine: { id: "shrine", title: "Silent Shrine", exits: { ending: { to: "ending", label: "Finish", requires: ["shrine-open"] } } },
  ending: { id: "ending", title: "Dawn Ending", exits: { camp: { to: "camp", label: "Restart" } } }
};

const manifestKit = {
  get(id) {
    return scenes[id] ? { ...scenes[id] } : null;
  },
  list() {
    return Object.values(scenes).map((scene) => ({ ...scene }));
  }
};

const inventoryKit = {
  missing(state, required = []) {
    const tokens = new Set([...(state?.tokens ?? []), ...(state?.inventory ?? [])]);
    const flags = state?.flags ?? {};
    return required.filter((token) => !tokens.has(token) && !flags[token]);
  }
};

const domain = createSceneCluePressureReadinessDomainKit({ manifestKit, inventoryKit });
const baseState = { visitedSceneIds: ["camp"], tokens: [], inventory: [], flags: {}, blockedLedger: [], actionLedger: [], transitionLedger: [] };

const camp = domain.describe("camp", baseState);
assert.equal(PEER_SCENE_CLUE_PRESSURE_DOMAIN_TREE.root, "peer-scene-clue-pressure-readiness-domain", "case 1: domain tree names clue pressure root");
assert.equal(camp.kitCount, 7, "case 2: composite domain exposes six atomic kits plus handoff");
assert.equal(camp.counts.clueVisibilityLanterns, 5, "case 3: camp sees five story clue tokens");
assert.equal(camp.counts.suspectThreadTraces, 6, "case 4: all scene traces are visible to the kit");
assert.equal(camp.counts.resolutionRouteLocks, 1, "case 5: camp has one route lock descriptor");

const withLantern = domain.describe("crossroads", { ...baseState, visitedSceneIds: ["camp", "crossroads"], tokens: ["has-lantern"] });
assert.ok(withLantern.descriptors.clueVisibilityLanterns.some((lantern) => lantern.token === "has-lantern" && lantern.owned), "case 6: owned lantern clue becomes lit");
assert.ok(withLantern.descriptors.resolutionRouteLocks.some((lock) => lock.exitId === "forest" && lock.unlocked), "case 7: forest route unlocks when clue token is present");

const withoutLantern = domain.describe("crossroads", { ...baseState, visitedSceneIds: ["camp", "crossroads"], blockedLedger: [{ exitId: "forest" }] });
assert.ok(withoutLantern.descriptors.resolutionRouteLocks.some((lock) => lock.exitId === "forest" && !lock.unlocked && lock.missing.includes("has-lantern")), "case 8: missing token keeps forest route locked");
assert.ok(withoutLantern.descriptors.misdirectionFogBanks.some((bank) => bank.exitId === "forest" && bank.density > 0.5), "case 9: blocked missing route creates dense misdirection fog");

const complete = domain.describe("shrine", { ...baseState, tokens: ["has-lantern", "has-rope", "forest-lit", "bridge-repaired", "shrine-open"], transitionLedger: ["camp", "crossroads", "forest", "shrine"] });
assert.ok(complete.summary.clueVisibility > camp.summary.clueVisibility, "case 10: complete state improves clue visibility summary");
assert.equal(complete.rendererHandoff.consumes, "descriptors-only", "renderer consumes descriptors only");
assert.doesNotThrow(() => JSON.parse(JSON.stringify(complete)), "domain output is JSON serializable");
for (const descriptorGroup of Object.values(complete.descriptors)) {
  for (const descriptor of descriptorGroup) {
    assert.ok(descriptor.rendererBoundary.rendererMustNotOwn.includes("state mutation"), "atomic descriptor blocks renderer state ownership");
    assert.ok(descriptor.rendererBoundary.rendererMustNotOwn.includes("frame-loop ownership"), "atomic descriptor blocks frame-loop ownership");
  }
}

console.log("peer scene clue pressure readiness kit smoke passed: 10 intake cases");

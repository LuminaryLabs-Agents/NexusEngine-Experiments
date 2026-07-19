import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createCavalryDiplomaticCommandReadinessDomainKit } from "../experiments/The Cavalry of Rome/src/cavalry-diplomatic-command-readiness-domain-kit.js";

const pass = readFileSync("experiments/The Cavalry of Rome/src/cavalry-diplomatic-command-readiness-pass.js", "utf8");
const kit = readFileSync("experiments/The Cavalry of Rome/src/cavalry-diplomatic-command-readiness-domain-kit.js", "utf8");
const experimentEntry = readFileSync("experiments/The Cavalry of Rome/index.html", "utf8");
const liveEntry = readFileSync("apps/the-cavalry-of-rome/index.html", "utf8");
const manifest = readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8");
const routedKitSmoke = readFileSync("tests/cavalry-battlefield-orders-domain-kits-smoke.mjs", "utf8");
const routedCdnSmoke = readFileSync("tests/cavalry-battlefield-orders-cdn-state-input-smoke.mjs", "utf8");

assert.ok(pass.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"), "diplomatic command pass should import NexusEngine main CDN");
assert.ok(!pass.includes("LuminaryLabs-Dev/NexusRealtime@main"), "changed diplomatic command pass should not import old NexusRealtime runtime CDN");
assert.ok(pass.includes("createCavalryDiplomaticCommandReadinessDomainKit"), "pass should import the diplomatic command domain kit");
assert.ok(pass.includes("getCavalryDiplomaticCommandReadiness"), "GameHost should expose diplomatic command state");
assert.ok(pass.includes("getDiplomaticCommandReadiness"), "GameHost should expose short diplomatic command accessor");
assert.ok(pass.includes("cavalryDiplomaticCommandReadiness"), "snapshot domain should include diplomatic command descriptors");
assert.ok(pass.includes("senateDecreeMandates"), "renderer should consume senate mandate descriptors");
assert.ok(pass.includes("provincePacificationBands"), "renderer should consume pacification descriptors");
assert.ok(pass.includes("rendererConsumes = \"descriptors-only\""), "presentation pass should mark descriptor-only consumption");
assert.ok(kit.includes("renderer consumes descriptors only"), "diplomatic command kit tree should document descriptor-only renderer handoff");
assert.ok(kit.includes("forbiddenOwnership"), "diplomatic command kit should document forbidden ownership boundaries");
assert.ok(experimentEntry.includes("cavalry-diplomatic-command-readiness-pass.js?v=campaign-036"), "experiment entry should load cache-busted diplomatic command pass");
assert.ok(liveEntry.includes("cavalry-diplomatic-command-readiness-pass.js?v=campaign-036"), "live entry should load cache-busted diplomatic command pass");
assert.ok(manifest.includes("cavalry-diplomatic-command-readiness-domain-kit"), "manifest should list the diplomatic command domain kit");
assert.ok(routedKitSmoke.includes("cavalry-diplomatic-command-readiness-domain-kits-smoke.mjs"), "existing Cavalry kit smoke should route new kit smoke");
assert.ok(routedCdnSmoke.includes("cavalry-diplomatic-command-readiness-cdn-state-input-smoke.mjs"), "existing Cavalry CDN smoke should route new CDN smoke");

const inputCases = Array.from({ length: 10 }, (_, i) => ({
  sizeId: "diplomacy-smoke",
  preset: { label: "Diplomacy Smoke", rivals: 3, worldW: 760, worldH: 480, actions: 4 },
  turn: i + 1,
  actions: i % 4,
  from: i % 2 ? "rome-a" : "rome-b",
  to: i % 3 ? "frontier-a" : "enemy-a",
  draft: { l: 1 + i, m: i % 3, h: i % 4 === 0 ? 1 : 0 },
  camera: { x: 250, y: 170, z: 1 + i * 0.05 },
  cells: [
    { id: "rome-a", x: 130 + i, y: 160, owner: "player", t: { l: 4 + i, m: 2, h: 1 }, n: ["frontier-a", "rome-b", "enemy-a"] },
    { id: "rome-b", x: 210, y: 210 + i, owner: "player", t: { l: 3, m: 1 + i % 2, h: 1 }, n: ["rome-a", "enemy-a", "frontier-a"] },
    { id: "frontier-a", x: 300, y: 185, owner: null, t: { l: 0, m: 0, h: 0 }, n: ["rome-a", "enemy-a"] },
    { id: "enemy-a", x: 390, y: 235, owner: "ai1", t: { l: 2, m: 2, h: i % 2 }, n: ["frontier-a", "rome-b", "rome-a"] },
    { id: "enemy-b", x: 470, y: 260, owner: "ai2", t: { l: 3, m: 1, h: i % 3 ? 1 : 0 }, n: ["enemy-a", "frontier-a"] }
  ]
}));

const domainKit = createCavalryDiplomaticCommandReadinessDomainKit();
for (const input of inputCases) {
  const described = domainKit.describe(input);
  assert.equal(described.source.route, "the-cavalry-of-rome", "diplomatic command domain source should identify the route");
  assert.ok(described.rendererHandoff.rendererConsumesDescriptorsOnly, "diplomatic command handoff should remain descriptor-only");
  assert.equal(described.rendererHandoff.counts.senateDecreeMandates, 2, "input should expose two senate mandate chips");
  assert.ok(described.rendererHandoff.counts.tributeObligationLedgers >= 1, "input should expose tribute ledgers");
  assert.ok(described.rendererHandoff.counts.allyLoyaltyBanners >= 1, "input should expose ally banners");
  assert.ok(described.rendererHandoff.counts.rebellionSparks >= 1, "input should expose rebellion sparks");
  assert.ok(described.rendererHandoff.counts.provincePacificationBands >= 1, "input should expose pacification bands");
  assert.equal(described.rendererHandoff.counts.triumphWindowStandards, 2, "input should expose two triumph standards");
  assert.doesNotThrow(() => JSON.stringify(described), "state/input smoke descriptors should be serializable");
}

console.log("Cavalry diplomatic command CDN/state/input smoke passed.");

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createFoglineBlackoutRecoveryReadinessDomainKit } from "../experiments/fogline-relay/src/fogline-blackout-recovery-kits.js";

const cdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const index = readFileSync("experiments/fogline-relay/index.html", "utf8");
const entry = readFileSync("experiments/fogline-relay/src/blackout-recovery-readiness-entry.js", "utf8");
const kitSource = readFileSync("experiments/fogline-relay/src/fogline-blackout-recovery-kits.js", "utf8");
const manifest = readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8");
const playwrightSmoke = readFileSync("tests/fogline-relay-playwright-state-input-smoke.mjs", "utf8");

assert.ok(index.includes("blackout-recovery-readiness-renderer-handoff-pass"), "Fogline route should advertise blackout recovery pass");
assert.ok(index.includes("blackout-recovery-readiness-entry.js?v=fogline-blackout-recovery-readiness-1"), "Fogline route should load cache-busted blackout entry");
assert.ok(entry.includes(cdn), "blackout entry should import NexusEngine main via CDN");
assert.equal(entry.includes("NexusRealtime@main"), false, "blackout entry should not import old NexusRealtime main CDN");
assert.ok(entry.includes("getFoglineBlackoutRecoveryReadiness"), "blackout entry should expose GameHost readiness accessor");
assert.ok(entry.includes("getRendererHandoff"), "blackout entry should compose renderer handoff");
assert.ok(kitSource.includes("renderer consumes descriptors only"), "kit should document descriptor-only renderer handoff");
assert.ok(kitSource.includes("frameLoop: \"excluded\""), "kit should exclude frame-loop ownership");
assert.ok(manifest.includes("fogline-blackout-recovery-readiness-domain-kit"), "manifest should register blackout recovery domain kit");
assert.ok(manifest.includes("blackout-recovery-readiness-renderer-handoff-pass"), "manifest should register blackout recovery status");
assert.ok(playwrightSmoke.includes("fogline-blackout-recovery-readiness-kits-smoke.mjs"), "playwright smoke should route kit validation");
assert.ok(playwrightSmoke.includes("fogline-blackout-recovery-cdn-state-input-smoke.mjs"), "playwright smoke should route CDN state validation");

const route = [
  { x: -10, z: -4 },
  { x: -4, z: 8 },
  { x: 1, z: 18 },
  { x: 8, z: 31 },
  { x: 14, z: 43 }
];

function makeState(index) {
  const scanBase = (index % 5) / 5;
  return {
    level: {
      route,
      spawn: route[0],
      gate: route.at(-1),
      relays: [
        { id: "a", x: -5, z: 7, scanProgress: Math.min(1, scanBase + 0.1) },
        { id: "b", x: 2, z: 20, scanProgress: Math.min(1, scanBase + 0.24), scanned: index % 2 === 0 },
        { id: "c", x: 9, z: 34, scanProgress: Math.min(1, scanBase + 0.39) }
      ],
      wraiths: [
        { id: "w1", x: -8, z: 13 + index, mode: index % 3 === 0 ? "chase" : "patrol" },
        { id: "w2", x: 6, z: 27, mode: index % 4 === 0 ? "chase" : "wander" }
      ]
    },
    route,
    game: {
      player: { x: -11 + index * 0.5, z: -3 + index * 1.1, yaw: index * 0.12 },
      gate: route.at(-1),
      stats: { elapsed: 30 + index * 33, timeBudget: 420, scanBursts: index },
      relays: [
        { id: "a", x: -5, z: 7, scanProgress: Math.min(1, scanBase + 0.1) },
        { id: "b", x: 2, z: 20, scanProgress: Math.min(1, scanBase + 0.24), scanned: index % 2 === 0 },
        { id: "c", x: 9, z: 34, scanProgress: Math.min(1, scanBase + 0.39) }
      ],
      wraiths: [
        { id: "w1", x: -8, z: 13 + index, mode: index % 3 === 0 ? "chase" : "patrol" },
        { id: "w2", x: 6, z: 27, mode: index % 4 === 0 ? "chase" : "wander" }
      ]
    }
  };
}

const domainKit = createFoglineBlackoutRecoveryReadinessDomainKit();
const cases = Array.from({ length: 10 }, (_, index) => ({ id: `cdn-state-${index + 1}`, input: makeState(index) }));

for (const entryCase of cases) {
  const before = domainKit.describe(entryCase.input);
  const moved = {
    ...entryCase.input,
    game: {
      ...entryCase.input.game,
      player: {
        ...entryCase.input.game.player,
        x: entryCase.input.game.player.x + 0.35,
        z: entryCase.input.game.player.z + 0.8,
        yaw: entryCase.input.game.player.yaw + 0.04
      },
      stats: {
        ...entryCase.input.game.stats,
        elapsed: entryCase.input.game.stats.elapsed + 1 / 30
      }
    }
  };
  const after = domainKit.describe(moved);
  assert.ok(after.rendererHandoff.descriptorCount >= 16, `${entryCase.id} should expose a dense blackout descriptor queue`);
  assert.equal(after.rendererHandoff.policy, "renderer-consumes-descriptors-only", `${entryCase.id} handoff should stay descriptor-only`);
  assert.ok(after.rendererHandoff.counts.fuseJunctions >= 3, `${entryCase.id} should count fuse junctions`);
  assert.ok(after.rendererHandoff.counts.relayRebootCoils >= 3, `${entryCase.id} should count relay reboot coils`);
  assert.ok(after.rendererHandoff.counts.lanternChainThreads >= 4, `${entryCase.id} should count lantern route threads`);
  assert.ok(after.drawOrder.some((descriptor) => descriptor.archetype === "fogline.blackout.dawn.switch.window"), `${entryCase.id} should include dawn switch window`);
  assert.notDeepEqual(after.generatorFuelCaches, before.generatorFuelCaches, `${entryCase.id} should react to state/input drift`);
}

console.log("Fogline blackout recovery CDN state/input smoke passed.");

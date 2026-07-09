import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createSignalBastionSupplyConvoyReadinessDomainKit } from "../games/signal-bastion/src/signal-bastion-supply-convoy-readiness-domain-kit.js";

const CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const route = await readFile(new URL("../games/signal-bastion/index.html", import.meta.url), "utf8");
const entry = await readFile(new URL("../games/signal-bastion/src/signal-bastion-supply-convoy-readiness-entry.js", import.meta.url), "utf8");
const kitSource = await readFile(new URL("../games/signal-bastion/src/signal-bastion-supply-convoy-readiness-domain-kit.js", import.meta.url), "utf8");

assert.ok(route.includes("supply-convoy-readiness-renderer-handoff-pass"), "route should advertise the supply convoy handoff pass");
assert.ok(route.includes("signal-bastion-supply-convoy-readiness-entry.js"), "route should load the supply convoy entry");
assert.ok(entry.includes(CDN), "changed entry should import NexusEngine main through CDN");
assert.equal(entry.includes("NexusRealtime@"), false, "changed entry must not import old NexusRealtime CDN");
assert.ok(entry.includes("getSignalBastionSupplyConvoyReadiness"), "GameHost should expose supply convoy readiness");
assert.equal(kitSource.includes("document."), false, "reusable kit must not touch DOM");
assert.equal(kitSource.includes("requestAnimationFrame"), false, "reusable kit must not own frame loop");
assert.equal(kitSource.includes("WebGL"), false, "reusable kit must not own WebGL");

const kit = createSignalBastionSupplyConvoyReadinessDomainKit();

function reduceState(state, input) {
  const next = structuredClone(state);
  if (input.type === "build") {
    next.structures.structures[`built-${input.index}`] = {
      id: `built-${input.index}`,
      x: 230 + input.index * 80,
      y: 360 - input.index * 30,
      z: 0,
      level: 1 + (input.index % 3),
      damage: 10 + input.index * 2
    };
    next.economy.wallet.credits = Math.max(0, next.economy.wallet.credits - 45);
  }
  if (input.type === "fund") next.economy.wallet.credits += input.amount;
  if (input.type === "damage") next.session.lives = Math.max(1, next.session.lives - input.amount);
  if (input.type === "wave") next.session.waveActive = input.active;
  return next;
}

let state = {
  map: {
    path: [
      { x: 80, y: 440, z: 0 },
      { x: 260, y: 345, z: 0 },
      { x: 510, y: 270, z: 0 },
      { x: 760, y: 165, z: 0 }
    ],
    vital: { x: 825, y: 135, z: 0 },
    slots: {
      a: { id: "a", x: 225, y: 365, z: 0 },
      b: { id: "b", x: 455, y: 285, z: 0 },
      c: { id: "c", x: 670, y: 220, z: 0 }
    }
  },
  structures: { structures: {} },
  agents: { active: {} },
  economy: { wallet: { credits: 150 } },
  session: { lives: 18, waveIndex: 0, waveActive: false },
  level: { waves: [{ spawnQueue: ["crawler", "runner", "runner"] }] }
};

const inputs = [
  { type: "fund", amount: 80 },
  { type: "build", index: 1 },
  { type: "wave", active: true },
  { type: "damage", amount: 3 },
  { type: "fund", amount: 60 },
  { type: "build", index: 2 },
  { type: "damage", amount: 2 },
  { type: "fund", amount: 140 },
  { type: "build", index: 3 },
  { type: "wave", active: false }
];

for (const [index, input] of inputs.entries()) {
  state = reduceState(state, input);
  const result = kit.describe({ rawSnapshot: state, activeBlueprint: index % 2 ? "snare" : "bolt" });
  assert.ok(result.summary.readiness >= 0 && result.summary.readiness <= 1, `case ${index} readiness should be bounded`);
  assert.ok(result.rendererHandoff.counts.forwardConvoyLanes >= 2, `case ${index} should keep convoy lanes visible`);
  assert.ok(result.rendererHandoff.counts.ammoCachePallets >= 3, `case ${index} should expose ammo pallets`);
  assert.ok(result.rendererHandoff.counts.repairCrewRoutes >= 1, `case ${index} should expose repair routes`);
  assert.equal(result.rendererHandoff.policy.rendererConsumesDescriptorsOnly, true, `case ${index} should preserve descriptor-only handoff`);
}

console.log("Signal Bastion supply convoy CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");

import assert from "node:assert/strict";
import fs from "node:fs";
import { createFoglineTideSirenEvacuationReadinessDomainKit } from "../experiments/fogline-relay/src/tide-siren-evacuation-readiness-kits.js";

const NEXUS_ENGINE_MAIN_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const html = fs.readFileSync("experiments/fogline-relay/index.html", "utf8");
const entry = fs.readFileSync("experiments/fogline-relay/src/tide-siren-evacuation-readiness-entry.js", "utf8");
const kits = fs.readFileSync("experiments/fogline-relay/src/tide-siren-evacuation-readiness-kits.js", "utf8");

assert.ok(html.includes("tide-siren-evacuation-readiness-renderer-handoff-pass"), "route advertises tide siren pass");
assert.ok(html.includes("tide-siren-evacuation-readiness-entry.js"), "route loads tide siren entry");
assert.ok(entry.includes(NEXUS_ENGINE_MAIN_CDN), "entry imports NexusEngine main CDN");
assert.ok(!entry.includes("NexusRealtime@"), "changed entry does not import old NexusRealtime CDN runtime");
assert.ok(entry.includes("getTideSirenEvacuationReadiness"), "entry exposes GameHost readiness accessor");
assert.ok(entry.includes("getFoglineTideSirenEvacuationReadiness"), "entry exposes fogline-specific accessor");
assert.ok(entry.includes("getRendererHandoff"), "entry composes renderer handoff");
assert.ok(kits.includes("rendererConsumes: \"serializable tide siren evacuation descriptors only\""), "kit declares descriptor-only renderer handoff");
for (const forbidden of ["document.", "window.", "requestAnimationFrame", "THREE.", "Audio(", "fetch("]) {
  assert.ok(!kits.includes(forbidden), `reusable kits avoid ${forbidden}`);
}

const domain = createFoglineTideSirenEvacuationReadinessDomainKit();
const states = [
  { input: { time: 0, game: { player: { z: 0 }, tidePressure: 0.2 } }, action: "start" },
  { input: { time: 1, game: { player: { z: 6 }, scanActive: true, tidePressure: 0.25 } }, action: "scan" },
  { input: { time: 2, game: { player: { z: 12 }, supplies: 1, tidePressure: 0.34 } }, action: "mark" },
  { input: { time: 3, game: { player: { z: 18 }, familiesMustered: 2, tidePressure: 0.42 } }, action: "muster" },
  { input: { time: 4, game: { player: { z: 24 }, supplies: 2, tidePressure: 0.5 } }, action: "rope" },
  { input: { time: 5, game: { player: { z: 30 }, fuelDrums: 2, tidePressure: 0.44 } }, action: "fuel" },
  { input: { time: 6, game: { player: { z: 34 }, rescued: 3, supplies: 3, scanActive: true } }, action: "escort" },
  { input: { time: 7, game: { player: { z: 38 }, inventory: { fuel: 4 }, tidePressure: 0.35 } }, action: "dock" },
  { input: { time: 8, game: { player: { z: 43 }, supplies: 4, rescued: 4, scanActive: true } }, action: "ready" },
  { input: { time: 9, game: { player: { z: 48 }, supplies: 5, fuelDrums: 4, rescued: 5, scanActive: true, tidePressure: 0.28 } }, action: "launch" }
];

let previous = -1;
for (const state of states) {
  const output = domain.describe(state.input);
  assert.ok(output.drawOrder.length === output.rendererHandoff.counts.total, `${state.action} descriptor count lines up`);
  assert.ok(output.rendererHandoff.counts.total >= 15, `${state.action} total descriptors`);
  assert.ok(output.readiness >= 0 && output.readiness <= 1, `${state.action} readiness bounded`);
  assert.ok(["warning", "muster", "launch"].includes(output.missionState), `${state.action} mission enum`);
  assert.ok(output.rendererHandoff.ownership.rendererMustNotOwn.includes("browser input"), `${state.action} renderer-neutral ownership`);
  previous = Math.max(previous, output.readiness);
}

const early = domain.describe(states[0].input);
const late = domain.describe(states.at(-1).input);
assert.ok(late.readiness > early.readiness, "launch state improves over start state");
console.log("Fogline tide siren evacuation CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");

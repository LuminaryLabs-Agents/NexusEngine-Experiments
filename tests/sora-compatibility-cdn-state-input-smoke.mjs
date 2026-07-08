import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createSoraCompatibilityDomainKit } from "../experiments/_kits/sora-the-infinite/sora-compatibility-domain-kits.js";

const routeHtml = readFileSync("experiments/sora-the-infinite/index.html", "utf8");
const routeRuntime = readFileSync("experiments/sora-the-infinite/sora-compatibility-gateway.js", "utf8");
const kitSource = readFileSync("experiments/_kits/sora-the-infinite/sora-compatibility-domain-kits.js", "utf8");

const nexusEngineCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const oldRuntimeCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime";

assert.ok(routeHtml.includes("sora-compatibility-gateway.js"), "route boots Sora compatibility gateway runtime");
assert.ok(routeHtml.includes("sora-compatibility-style.css"), "route includes gateway style");
assert.ok(!routeHtml.includes("http-equiv=\"refresh\""), "zero-frame redirect removed");
assert.ok(routeRuntime.includes(nexusEngineCdn), "gateway imports NexusEngine main CDN");
assert.ok(!routeRuntime.includes(oldRuntimeCdn), "changed route runtime does not import old NexusRealtime CDN");
assert.ok(routeRuntime.includes("globalThis.GameHost"), "gateway exposes GameHost");
assert.ok(routeRuntime.includes("getRendererHandoff"), "GameHost exposes renderer handoff");
assert.ok(kitSource.includes("createSoraCompatibilityDomainKit"), "domain kit factory exists");
assert.ok(kitSource.includes("renderer consumes descriptors only"), "renderer-neutral handoff contract present");

const kit = createSoraCompatibilityDomainKit({ targetPath: "../the-open-above/" });
const stateInputCases = [
  { tick: 1, readiness: 0.2, input: { thrust: 0, bank: 0, climb: 0 }, query: "", hash: "" },
  { tick: 2, readiness: 0.25, input: { thrust: 1, bank: -1, climb: 0 }, query: "?q=1", hash: "" },
  { tick: 3, readiness: 0.3, input: { thrust: 1, bank: 1, climb: 1 }, query: "", hash: "#one" },
  { tick: 4, readiness: 0.4, input: { thrust: 0.7, bank: -0.7, climb: -0.2, launch: true }, query: "?wind=2", hash: "#two" },
  { tick: 5, readiness: 0.5, input: { pointerActive: true, pointerX: 0, pointerY: 1 }, query: "", hash: "#edge" },
  { tick: 6, readiness: 0.6, input: { pointerActive: true, pointerX: 1, pointerY: 0 }, query: "?edge=1", hash: "" },
  { tick: 7, readiness: 0.7, input: { forward: 1, x: -0.5, y: 0.5 }, query: "?alias=preserve", hash: "#preserve" },
  { tick: 8, readiness: 0.8, input: { thrust: -1, bank: 0.5, climb: -0.5 }, query: "", hash: "" },
  { tick: 9, readiness: 0.9, input: { thrust: 1, bank: 0.5, climb: 0.5, launch: true }, query: "?launch=true", hash: "#gate" },
  { tick: 10, readiness: 1, input: { thrust: 1, bank: 0, climb: 0 }, query: "?ready=1", hash: "#go" }
];

for (const [index, input] of stateInputCases.entries()) {
  const described = kit.describe(input);
  assert.ok(described.continuityGate.href.startsWith("../the-open-above/"), `case ${index} target handoff href`);
  assert.equal(described.rendererHandoff.descriptorCounts.continuityGates, 3, `case ${index} continuity gate count`);
  assert.ok(described.rendererHandoff.descriptorCounts.coaching >= 3, `case ${index} input coaching count`);
  assert.ok(described.alias.continuityLabel.includes("sora-the-infinite"), `case ${index} alias continuity label`);
}

console.log(`Sora compatibility CDN/state/input smoke passed ${stateInputCases.length} intake cases.`);

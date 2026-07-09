import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createDomainManaRiftSpireStabilizationReadiness } from "../experiments/domain-mana-rift/domain-mana-rift-spire-stabilization-kits.js";

const route = readFileSync(new URL("../experiments/domain-mana-rift/index.html", import.meta.url), "utf8");
const entry = readFileSync(new URL("../experiments/domain-mana-rift/domain-mana-rift-spire-stabilization-entry.js", import.meta.url), "utf8");
const kitSource = readFileSync(new URL("../experiments/domain-mana-rift/domain-mana-rift-spire-stabilization-kits.js", import.meta.url), "utf8");
const cdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";

assert.ok(route.includes("spire-stabilization-readiness-renderer-handoff-pass"));
assert.ok(route.includes("domain-mana-rift-spire-stabilization-entry.js?v=domain-mana-rift-spire-stabilization-20260709"));
assert.ok(entry.includes(cdn));
assert.equal(entry.includes("LuminaryLabs-Dev/NexusRealtime@main"), false);
assert.ok(entry.includes("getDomainManaRiftSpireStabilizationReadiness"));
assert.ok(entry.includes("getRendererHandoff"));
assert.equal(kitSource.includes("document."), false);
assert.equal(kitSource.includes("window."), false);

const cases = Array.from({ length: 10 }, (_, index) => ({
  tick: index * 11,
  mana: 0.2 + index * 0.075,
  riftIntensity: 0.88 - index * 0.064,
  apprenticeCount: 2 + index,
  anchorCount: 1 + (index % 6),
  playerDistance: 15 - index
}));

let previousReadiness = -1;
for (const [index, input] of cases.entries()) {
  const readiness = createDomainManaRiftSpireStabilizationReadiness(input);
  assert.ok(readiness.rendererHandoff.totalDescriptors >= 22, `case ${index} descriptor floor`);
  assert.ok(readiness.metrics.pressure >= 0 && readiness.metrics.pressure <= 1, `case ${index} pressure bounded`);
  assert.ok(readiness.metrics.wardCoverage >= 0 && readiness.metrics.wardCoverage <= 1, `case ${index} ward bounded`);
  assert.ok(readiness.rendererHandoff.buckets.anchors.every((anchor) => anchor.kind === "mana-spire-anchor"), `case ${index} anchor kind`);
  previousReadiness = readiness.readiness;
}

const low = createDomainManaRiftSpireStabilizationReadiness(cases[0]);
const high = createDomainManaRiftSpireStabilizationReadiness(cases.at(-1));
assert.ok(high.readiness >= low.readiness, "improved mana/lower rift intensity should not reduce readiness");
assert.ok(previousReadiness >= 0);

console.log("Domain Mana Rift spire stabilization CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");

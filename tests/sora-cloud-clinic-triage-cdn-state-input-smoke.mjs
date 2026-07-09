import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createSoraCloudClinicTriageReadinessDomainKit } from "../experiments/sora-the-infinite/sora-cloud-clinic-triage-readiness-kits.js";

const cdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const route = readFileSync(new URL("../experiments/sora-the-infinite/index.html", import.meta.url), "utf8");
const entry = readFileSync(new URL("../experiments/sora-the-infinite/sora-cloud-clinic-triage-entry.js", import.meta.url), "utf8");
const kitSource = readFileSync(new URL("../experiments/sora-the-infinite/sora-cloud-clinic-triage-readiness-kits.js", import.meta.url), "utf8");

assert.ok(route.includes("cloud-clinic-triage-readiness-renderer-handoff-pass"), "route advertises cloud clinic pass");
assert.ok(route.includes("sora-cloud-clinic-triage-entry.js?v=cloud-clinic-triage-readiness-v1"), "route loads cache-busted cloud clinic entry");
assert.ok(entry.includes(cdn), "entry imports NexusEngine main CDN");
assert.equal(entry.includes("NexusRealtime@main"), false, "entry does not import old NexusRealtime CDN");
assert.ok(entry.includes("globalThis.GameHost"), "entry exposes GameHost surface");
assert.ok(entry.includes("getCloudClinicTriageReadiness"), "entry exposes cloud clinic readiness accessor");
assert.ok(entry.includes("getRendererHandoff"), "entry composes renderer handoff");

for (const forbidden of ["document.", "window.", "requestAnimationFrame", "THREE", "WebGL", "Audio(", "addEventListener", "localStorage"]) {
  assert.equal(kitSource.includes(forbidden), false, `reusable kit does not own ${forbidden}`);
}

const domainKit = createSoraCloudClinicTriageReadinessDomainKit();
let previousReadiness = -1;
for (let index = 0; index < 10; index += 1) {
  const readiness = index / 9;
  const output = domainKit.describe({
    tick: 60 + index * 17,
    readiness,
    stormRisk: 1 - readiness * 0.7,
    input: { bank: Math.sin(index) * 0.4, climb: readiness - 0.4, pointerX: readiness, pointerY: 1 - readiness / 2 },
    skyRescueReadiness: { rendererHandoff: { counts: { total: 12 + index } } },
    skyLighthouseReadiness: { rendererHandoff: { counts: { total: 10 + index } } },
    skyRookeryMigrationReadiness: { rendererHandoff: { counts: { total: 12 + index } } },
    starOrchardRescueReadiness: { rendererHandoff: { counts: { total: 12 + index } } },
    skyRadioBeaconReadiness: { rendererHandoff: { counts: { total: 18 + index } }, dawnRadioLedger: { stormRisk: 0.4 } }
  });
  assert.equal(output.rendererHandoff.counts.total, 25, `case ${index} descriptor count`);
  assert.ok(output.rendererHandoff.descriptors.cloudClinicLandingPads, `case ${index} landing pads exposed`);
  assert.ok(output.rendererHandoff.descriptors.dawnClinicLedger, `case ${index} ledger exposed`);
  assert.ok(output.readinessScore >= 0 && output.readinessScore <= 1, `case ${index} readiness bound`);
  if (index > 0) assert.ok(output.readinessScore >= previousReadiness - 0.35, `case ${index} no unstable readiness collapse`);
  previousReadiness = output.readinessScore;
}

console.log("Sora cloud clinic triage CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createFoglineLighthouseBatteryReadinessDomainKit } from "../experiments/fogline-relay/src/lighthouse-battery-readiness-kits.js";

const root = process.cwd();
const indexSource = await readFile(join(root, "experiments/fogline-relay/index.html"), "utf8");
const entrySource = await readFile(join(root, "experiments/fogline-relay/src/lighthouse-battery-readiness-entry.js"), "utf8");
const kitSource = await readFile(join(root, "experiments/fogline-relay/src/lighthouse-battery-readiness-kits.js"), "utf8");

assert.ok(indexSource.includes("lighthouse-battery-readiness-renderer-handoff-pass"), "route should advertise lighthouse battery upgrade");
assert.ok(indexSource.includes("lighthouse-battery-readiness-entry.js?v=fogline-lighthouse-battery-readiness-1"), "route should load lighthouse battery entry");
assert.ok(entrySource.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"), "entry should use NexusEngine main CDN");
assert.equal(entrySource.includes("NexusRealtime@main"), false, "entry should not import old NexusRealtime main CDN");
assert.equal(entrySource.includes("NexusRealtime@0.0.1"), false, "entry should not import old NexusRealtime 0.0.1 CDN");
assert.ok(entrySource.includes("getFoglineLighthouseBatteryReadiness"), "entry should expose GameHost readiness accessor");
for (const forbidden of ["document.querySelector", "requestAnimationFrame", "getContext(", "new Audio", "THREE."]) {
  assert.equal(kitSource.includes(forbidden), false, `reusable kit should not own browser/renderer primitive ${forbidden}`);
}

const kit = createFoglineLighthouseBatteryReadinessDomainKit();
for (let index = 0; index < 10; index += 1) {
  const state = {
    level: {
      bounds: { minX: -18, maxX: 18, minZ: -8, maxZ: 48 },
      route: [
        { id: "dock", x: -8, z: 2 + index },
        { id: "generator", x: -3, z: 10 + index },
        { id: "cache", x: 2, z: 18 + index },
        { id: "lens", x: 7, z: 29 + index },
        { id: "lighthouse", x: 0, z: 42 + index }
      ]
    },
    game: { player: { x: -4 + index, z: -6 + index * 5 }, scanActive: index % 2 === 1, supplies: index % 4 },
    time: index * 0.5
  };
  const outcome = kit.describe(state);
  assert.ok(outcome.rendererHandoff.counts.total >= 15, `case ${index} should produce rich descriptors`);
  assert.ok(outcome.drawOrder.some((descriptor) => descriptor.kind === "dawn-beam-ledger"), `case ${index} should include the handoff ledger`);
}
console.log("Fogline lighthouse battery CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");

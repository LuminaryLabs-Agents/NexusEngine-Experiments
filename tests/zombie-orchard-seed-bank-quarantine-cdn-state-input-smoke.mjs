import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createZombieOrchardSeedBankQuarantineReadinessDomainKit } from "../experiments/zombie-orchard/src/seed-bank-quarantine-readiness-kits.js";

const index = readFileSync("experiments/zombie-orchard/index.html", "utf8");
const entry = readFileSync("experiments/zombie-orchard/src/seed-bank-quarantine-readiness-entry.js", "utf8");
const kits = readFileSync("experiments/zombie-orchard/src/seed-bank-quarantine-readiness-kits.js", "utf8");

assert.ok(index.includes("seed-bank-quarantine-readiness-renderer-handoff-pass"));
assert.ok(index.includes("seed-bank-quarantine-readiness-entry.js?v=zombie-orchard-seed-bank-quarantine-20260709"));
assert.ok(entry.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"));
assert.ok(!entry.includes("LuminaryLabs-Dev/NexusRealtime@main/src/index.js"));
assert.ok(entry.includes("getZombieOrchardSeedBankQuarantineReadiness"));
assert.ok(entry.includes("getSeedBankQuarantineReadinessTree"));
assert.ok(entry.includes("seedBankQuarantineReadiness: readiness.rendererHandoff"));
assert.ok(kits.includes("renderer consumes descriptors only"));
assert.ok(kits.includes("zombie-orchard-heirloom-seed-cache-kit"));
assert.ok(kits.includes("zombie-orchard-dawn-seed-ledger-kit"));

for (const forbidden of ["document.", "window.", "requestAnimationFrame", "THREE.", "Audio(", "new Image("]) {
  assert.ok(!kits.includes(forbidden), `reusable kits must not own ${forbidden}`);
}

const domain = createZombieOrchardSeedBankQuarantineReadinessDomainKit({ seed: "cdn-state-input" });
const cases = Array.from({ length: 10 }, (_, index) => ({
  appleCount: index * 2,
  seedPouches: index,
  health01: Math.max(0.1, 1 - index * 0.07),
  stamina01: Math.max(0.18, 0.9 - index * 0.055),
  pressure01: Math.min(1, 0.1 + index * 0.09),
  infection01: Math.min(1, 0.04 + index * 0.08),
  roundNumber: index + 1,
  simulatedInput: {
    moveX: index % 3 - 1,
    sprint: index % 2 === 0,
    useGear: index % 4 === 0
  },
  visualDomains: {
    trees: Array.from({ length: 4 }, (_, tree) => ({ position: { x: tree * 5, y: 0, z: tree * 3 } })),
    lanes: Array.from({ length: 3 }, (_, lane) => ({ center: { x: lane * 6 - 3, y: 0, z: lane * -4 } })),
    apples: Array.from({ length: 4 }, (_, apple) => ({ position: { x: apple * 4, y: 0, z: apple * 2 } }))
  }
}));

for (const [index, intake] of cases.entries()) {
  const readiness = domain.compose(intake);
  assert.equal(readiness.rendererHandoff.descriptorPolicy, "renderer-consumes-descriptors-only");
  assert.ok(readiness.rendererHandoff.counts.total >= 17, `case ${index} has enough descriptors`);
  assert.ok(readiness.summary.seedViability >= 0 && readiness.summary.seedViability <= 1);
  assert.ok(readiness.summary.quarantineNeed >= 0 && readiness.summary.quarantineNeed <= 1);
  assert.ok(readiness.summary.replantReadiness >= 0 && readiness.summary.replantReadiness <= 1);
}

console.log("Zombie Orchard seed bank quarantine CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");

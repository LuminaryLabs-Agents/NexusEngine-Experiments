import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createFoglineRelayLevel } from "../experiments/fogline-relay/src/level.js";
import { createFoglineRadioRepairReadinessDomainKit } from "../experiments/fogline-relay/src/fogline-radio-repair-kits.js";

const NEXUS_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const OLD_RUNTIME_CDN = "LuminaryLabs-Dev/NexusRealtime@main";

const index = readFileSync("experiments/fogline-relay/index.html", "utf8");
const entry = readFileSync("experiments/fogline-relay/src/radio-repair-readiness-entry.js", "utf8");
const kit = readFileSync("experiments/fogline-relay/src/fogline-radio-repair-kits.js", "utf8");
const runChecks = readFileSync("scripts/run-checks.mjs", "utf8");
const manifest = readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8");
const level = createFoglineRelayLevel();
const domainKit = createFoglineRadioRepairReadinessDomainKit();

function makeGame(caseIndex) {
  const scanned = caseIndex % (level.relays.length + 1);
  return {
    player: { x: -5 + caseIndex, z: -2 + caseIndex * 4.2, yaw: caseIndex * 0.19 },
    relays: level.relays.map((relay, index) => ({
      ...relay,
      scanned: index < scanned,
      scanProgress: index < scanned ? 1 : index === scanned ? (caseIndex % 10) / 9 : 0
    })),
    gate: { ...level.gate, openProgress: scanned / Math.max(1, level.relays.length) },
    wraiths: level.wraiths,
    stats: { scanned, elapsed: caseIndex * 43, timeBudget: 420, scanActive: caseIndex % 2 === 0 },
    repairParts: { claimed: caseIndex > 5 ? [level.relays[1].id] : [] }
  };
}

const cases = [
  {
    label: "Radio repair entry pulls NexusEngine main CDN",
    check: () => assert.ok(entry.includes(NEXUS_CDN))
  },
  {
    label: "Radio repair changed files avoid old NexusRealtime main CDN",
    check: () => assert.ok(!entry.includes(OLD_RUNTIME_CDN) && !kit.includes(OLD_RUNTIME_CDN))
  },
  {
    label: "Route shell cache-busts radio repair readiness",
    check: () => assert.ok(index.includes("radio-repair-readiness-renderer-handoff-pass") && index.includes("fogline-radio-repair-readiness-1"))
  },
  {
    label: "GameHost receives radio repair accessors",
    check: () => assert.ok(entry.includes("getRadioRepairReadiness") && entry.includes("getFoglineRadioRepairReadiness") && entry.includes("getRendererHandoff"))
  },
  {
    label: "Overlay composes descriptor-only renderer handoff",
    check: () => assert.ok(entry.includes("renderer-consumes-descriptors-only") && entry.includes("radioRepairDescriptorCount"))
  },
  {
    label: "Radio repair kits stay renderer neutral",
    check: () => {
      for (const forbidden of ["document.", "querySelector", "requestAnimationFrame", "new THREE", "AudioContext", "fetch("]) {
        assert.ok(!kit.includes(forbidden), `radio repair kit should not include ${forbidden}`);
      }
    }
  },
  {
    label: "Radio repair descriptors map to existing renderer buckets",
    check: () => {
      for (const token of ["safePockets", "objectiveNeedles", "pressureVignettes", "routeThreads", "gateSigils"]) {
        assert.ok(kit.includes(token), `expected compatible bucket ${token}`);
      }
    }
  },
  {
    label: "Manifest records radio repair cutover",
    check: () => assert.ok(manifest.includes("fogline-radio-repair-readiness-domain-kit"))
  },
  {
    label: "Radio repair checks are wired",
    check: () => {
      assert.ok(runChecks.includes("tests/fogline-radio-repair-readiness-kits-smoke.mjs"));
      assert.ok(runChecks.includes("tests/fogline-radio-repair-cdn-state-input-smoke.mjs"));
    }
  },
  {
    label: "Radio repair domain handles ten state/input cases",
    check: () => {
      const outputs = Array.from({ length: 10 }, (_, caseIndex) => domainKit.describe({ level, route: level.route, game: makeGame(caseIndex) }));
      assert.equal(outputs.length, 10);
      for (const output of outputs) {
        assert.ok(output.repairPartCaches.length >= level.relays.length);
        assert.ok(output.antennaAlignmentArcs.length === level.relays.length);
        assert.ok(output.powerLoadBalancers.every((descriptor) => descriptor.load >= 0 && descriptor.load <= 1));
        assert.equal(output.rendererHandoff.policy, "renderer-consumes-descriptors-only");
        assert.equal(output.rendererHandoff.descriptorCount, output.drawOrder.length);
      }
    }
  }
];

for (const testCase of cases) testCase.check();

assert.equal(cases.length, 10, "Fogline radio repair CDN/state/input smoke should cover 10 validation cases");
console.log("Fogline radio repair CDN/state/input smoke passed with 10 validation cases.");

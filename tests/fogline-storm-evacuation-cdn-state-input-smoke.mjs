import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createFoglineRelayLevel } from "../experiments/fogline-relay/src/level.js";
import { createFoglineStormEvacuationReadinessDomainKit } from "../experiments/fogline-relay/src/fogline-storm-evacuation-kits.js";

const urls = readFileSync("experiments/fogline-relay/src/urls.js", "utf8");
const entry = readFileSync("experiments/fogline-relay/src/storm-evacuation-readiness-entry.js", "utf8");
const kit = readFileSync("experiments/fogline-relay/src/fogline-storm-evacuation-kits.js", "utf8");
const index = readFileSync("experiments/fogline-relay/index.html", "utf8");
const operatorCdnSmoke = readFileSync("tests/fogline-operator-rhythm-cdn-state-input-smoke.mjs", "utf8");
const operatorKitSmoke = readFileSync("tests/fogline-operator-rhythm-domain-kits-smoke.mjs", "utf8");
const manifest = readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8");

const NEXUS_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const OLD_RUNTIME_CDN = "LuminaryLabs-Dev/NexusRealtime@main";
const level = createFoglineRelayLevel();
const domainKit = createFoglineStormEvacuationReadinessDomainKit();

function makeInput(caseIndex) {
  const scanned = caseIndex % (level.relays.length + 1);
  return {
    level,
    route: level.route,
    game: {
      player: { x: -4 + caseIndex, z: -2 + caseIndex * 4.2, yaw: caseIndex * 0.2 },
      relays: level.relays.map((relay, index) => ({ ...relay, scanned: index < scanned, scanProgress: index < scanned ? 1 : index === scanned ? 0.5 : 0 })),
      gate: { ...level.gate, openProgress: scanned / Math.max(1, level.relays.length) },
      wraiths: level.wraiths.map((wraith, index) => ({ ...wraith, mode: index === caseIndex % level.wraiths.length ? "chase" : "patrol" })),
      stats: { scanned, elapsed: caseIndex * 35, timeBudget: 420 }
    }
  };
}

const cases = [
  {
    label: "Fogline base runtime uses NexusEngine main CDN",
    check: () => assert.ok(urls.includes(NEXUS_CDN))
  },
  {
    label: "Storm evacuation overlay imports NexusEngine main CDN",
    check: () => assert.ok(entry.includes(NEXUS_CDN))
  },
  {
    label: "Changed storm evacuation files avoid old NexusRealtime main CDN",
    check: () => assert.ok(!entry.includes(OLD_RUNTIME_CDN) && !kit.includes(OLD_RUNTIME_CDN))
  },
  {
    label: "Route shell loads storm evacuation overlay with cache busting",
    check: () => assert.ok(index.includes("storm-evacuation-readiness-renderer-handoff-pass") && index.includes("storm-evacuation-readiness-entry.js?v=fogline-storm-evacuation-readiness-1"))
  },
  {
    label: "Overlay patches GameHost storm evacuation accessors",
    check: () => assert.ok(entry.includes("getStormEvacuationReadiness") && entry.includes("getFoglineStormEvacuationReadiness"))
  },
  {
    label: "Overlay composes descriptor-only renderer handoff",
    check: () => assert.ok(entry.includes("stormEvacuationDescriptorCount") && entry.includes("renderer-consumes-descriptors-only"))
  },
  {
    label: "Storm evacuation kits stay renderer neutral",
    check: () => {
      for (const forbidden of ["document.", "querySelector", "requestAnimationFrame", "new THREE", "AudioContext", "fetch("]) {
        assert.ok(!kit.includes(forbidden), `storm evacuation kit should not include ${forbidden}`);
      }
    }
  },
  {
    label: "Storm evacuation descriptors map to existing renderer buckets",
    check: () => {
      for (const token of ["objectiveNeedles", "routeThreads", "safePockets", "pressureVignettes", "gateSigils", "scanCones"]) {
        assert.ok(kit.includes(token), `expected compatible bucket ${token}`);
      }
    }
  },
  {
    label: "Storm evacuation checks and manifest are wired through existing Fogline smokes",
    check: () => {
      assert.ok(operatorKitSmoke.includes("fogline-storm-evacuation-readiness-kits-smoke.mjs"));
      assert.ok(operatorCdnSmoke.includes("fogline-storm-evacuation-cdn-state-input-smoke.mjs"));
      assert.ok(manifest.includes("storm-evacuation-readiness-renderer-handoff-pass"));
      assert.ok(manifest.includes("fogline-storm-evacuation-readiness-domain-kit"));
    }
  },
  {
    label: "Ten simulated storm evacuation states produce descriptor handoffs",
    check: () => {
      for (let caseIndex = 0; caseIndex < 10; caseIndex += 1) {
        const domain = domainKit.describe(makeInput(caseIndex));
        assert.ok(domain.drawOrder.length >= 18, `case ${caseIndex} should emit rich storm evacuation descriptors`);
        assert.equal(domain.rendererHandoff.descriptorCount, domain.drawOrder.length);
        assert.equal(domain.thunderheadVectors.length, 3);
        assert.equal(domain.batteryCaches.length, level.relays.length);
        assert.ok(domain.extractionFlareWindows.every((descriptor) => descriptor.radius > 0));
      }
    }
  }
];

for (const testCase of cases) testCase.check();

assert.equal(cases.length, 10, "Fogline storm evacuation CDN/state/input smoke should cover 10 validation cases");
console.log("Fogline storm evacuation readiness CDN/state/input smoke passed with 10 validation cases.");

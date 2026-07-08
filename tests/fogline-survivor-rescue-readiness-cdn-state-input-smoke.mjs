import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createFoglineRelayLevel } from "../experiments/fogline-relay/src/level.js";
import { createFoglineSurvivorRescueReadinessDomainKit } from "../experiments/fogline-relay/src/fogline-survivor-rescue-kits.js";

const urls = readFileSync("experiments/fogline-relay/src/urls.js", "utf8");
const entry = readFileSync("experiments/fogline-relay/src/survivor-rescue-readiness-entry.js", "utf8");
const kit = readFileSync("experiments/fogline-relay/src/fogline-survivor-rescue-kits.js", "utf8");
const index = readFileSync("experiments/fogline-relay/index.html", "utf8");
const operatorCdnSmoke = readFileSync("tests/fogline-operator-rhythm-cdn-state-input-smoke.mjs", "utf8");
const operatorKitSmoke = readFileSync("tests/fogline-operator-rhythm-domain-kits-smoke.mjs", "utf8");
const manifest = readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8");

const NEXUS_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const OLD_RUNTIME_CDN = "LuminaryLabs-Dev/NexusRealtime@main";
const level = createFoglineRelayLevel();
const domainKit = createFoglineSurvivorRescueReadinessDomainKit();

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
      survivors: [
        { id: "survivor-relay-west", x: -10.2, z: 12.8, condition: caseIndex % 2 ? "injured" : "critical", rescued: caseIndex > 7 },
        { id: "survivor-canopy", x: 11.4, z: 16.6, condition: "injured", carried: caseIndex === 5 },
        { id: "survivor-gate", x: -2.8, z: 37.6, condition: "stable", rescued: caseIndex === 9 }
      ],
      stats: { scanned, elapsed: caseIndex * 29, timeBudget: 360 }
    }
  };
}

const cases = [
  {
    label: "Fogline base runtime uses NexusEngine main CDN",
    check: () => assert.ok(urls.includes(NEXUS_CDN))
  },
  {
    label: "Survivor rescue overlay imports NexusEngine main CDN",
    check: () => assert.ok(entry.includes(NEXUS_CDN))
  },
  {
    label: "Changed runtime files avoid old NexusRealtime main CDN",
    check: () => assert.ok(!entry.includes(OLD_RUNTIME_CDN) && !kit.includes(OLD_RUNTIME_CDN))
  },
  {
    label: "Route shell loads survivor rescue overlay with cache busting",
    check: () => assert.ok(index.includes("survivor-rescue-readiness-renderer-handoff-pass") && index.includes("survivor-rescue-readiness-entry.js?v=fogline-survivor-rescue-readiness-1"))
  },
  {
    label: "Overlay patches GameHost survivor rescue accessors",
    check: () => assert.ok(entry.includes("getSurvivorRescueReadiness") && entry.includes("getFoglineSurvivorRescueReadiness"))
  },
  {
    label: "Overlay composes descriptor-only renderer handoff",
    check: () => assert.ok(entry.includes("survivorRescueDescriptorCount") && entry.includes("renderer-consumes-descriptors-only"))
  },
  {
    label: "Survivor rescue kits stay renderer neutral",
    check: () => {
      for (const forbidden of ["document.", "querySelector", "requestAnimationFrame", "new THREE", "AudioContext", "fetch("]) {
        assert.ok(!kit.includes(forbidden), `survivor rescue kit should not include ${forbidden}`);
      }
    }
  },
  {
    label: "Survivor rescue descriptors map to existing renderer buckets",
    check: () => {
      for (const token of ["objectiveNeedles", "routeThreads", "safePockets", "pressureVignettes", "gateSigils"]) {
        assert.ok(kit.includes(token), `expected compatible bucket ${token}`);
      }
    }
  },
  {
    label: "Survivor rescue checks and manifest are wired through existing Fogline smokes",
    check: () => {
      assert.ok(operatorKitSmoke.includes("fogline-survivor-rescue-readiness-kits-smoke.mjs"));
      assert.ok(operatorCdnSmoke.includes("fogline-survivor-rescue-readiness-cdn-state-input-smoke.mjs"));
      assert.ok(manifest.includes("survivor-rescue-readiness-renderer-handoff-pass"));
      assert.ok(manifest.includes("fogline-survivor-rescue-readiness-domain-kit"));
    }
  },
  {
    label: "Ten simulated survivor rescue states produce descriptor handoffs",
    check: () => {
      for (let caseIndex = 0; caseIndex < 10; caseIndex += 1) {
        const domain = domainKit.describe(makeInput(caseIndex));
        assert.ok(domain.drawOrder.length >= 12, `case ${caseIndex} should emit rich survivor rescue descriptors`);
        assert.equal(domain.rendererHandoff.descriptorCount, domain.drawOrder.length);
        assert.ok(domain.survivorDistressLanterns.length === 3);
        assert.ok(domain.rescuePathRibbons.length === 2);
        assert.ok(domain.blackoutDeadlineRings.every((descriptor) => descriptor.blackout >= 0 && descriptor.blackout <= 1));
      }
    }
  }
];

for (const testCase of cases) testCase.check();

assert.equal(cases.length, 10, "Fogline survivor rescue CDN/state/input smoke should cover 10 validation cases");
console.log("Fogline survivor rescue readiness CDN/state/input smoke passed with 10 validation cases.");

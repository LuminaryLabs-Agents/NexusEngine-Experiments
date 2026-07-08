import assert from "node:assert/strict";
import "./fogline-survivor-rescue-readiness-cdn-state-input-smoke.mjs";
import "./fogline-storm-evacuation-cdn-state-input-smoke.mjs";
import { readFileSync } from "node:fs";

const urls = readFileSync("experiments/fogline-relay/src/urls.js", "utf8");
const session = readFileSync("experiments/fogline-relay/src/session.js", "utf8");
const main = readFileSync("experiments/fogline-relay/src/main.js", "utf8");
const kit = readFileSync("experiments/fogline-relay/src/fogline-operator-rhythm-kits.js", "utf8");
const index = readFileSync("experiments/fogline-relay/index.html", "utf8");
const runChecks = readFileSync("scripts/run-checks.mjs", "utf8");

const NEXUS_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const OLD_RUNTIME_CDN = "LuminaryLabs-Dev/NexusRealtime@main";

const cases = [
  {
    label: "Fogline runtime uses NexusEngine main CDN",
    check: () => assert.ok(urls.includes(NEXUS_CDN))
  },
  {
    label: "Fogline changed runtime avoids old NexusRealtime main CDN",
    check: () => assert.ok(!urls.includes(OLD_RUNTIME_CDN) && !session.includes(OLD_RUNTIME_CDN) && !main.includes(OLD_RUNTIME_CDN))
  },
  {
    label: "Session imports operator rhythm domain",
    check: () => assert.ok(session.includes("createFoglineOperatorRhythmDomain"))
  },
  {
    label: "Session exposes operator rhythm snapshot",
    check: () => assert.ok(session.includes("operatorRhythm") && session.includes("foglineOperatorRhythm"))
  },
  {
    label: "GameHost exposes operator rhythm and composed handoff",
    check: () => assert.ok(main.includes("getOperatorRhythm") && main.includes("getRendererHandoff"))
  },
  {
    label: "Renderer receives composed operator rhythm descriptor handoff",
    check: () => assert.ok(session.includes("operatorRhythmDescriptorCount") && session.includes("renderer-consumes-descriptors-only"))
  },
  {
    label: "Operator rhythm kits stay renderer neutral",
    check: () => {
      for (const forbidden of ["document.", "querySelector", "requestAnimationFrame", "new THREE", "AudioContext", "fetch("]) {
        assert.ok(!kit.includes(forbidden), `operator rhythm kit should not include ${forbidden}`);
      }
    }
  },
  {
    label: "Operator rhythm descriptors map to existing renderer buckets",
    check: () => {
      for (const token of ["scanCones", "relayAuras", "pressureVignettes", "safePockets", "routeThreads", "objectiveNeedles", "gateSigils"]) {
        assert.ok(kit.includes(token) || session.includes(token), `expected compatible bucket ${token}`);
      }
    }
  },
  {
    label: "Route shell cache-busts survivor and storm evacuation upgrades while preserving operator rhythm baseline",
    check: () => assert.ok(index.includes("fogline-survivor-rescue-readiness-1") && index.includes("storm-evacuation-readiness-renderer-handoff-pass"))
  },
  {
    label: "New operator rhythm checks are wired",
    check: () => {
      assert.ok(runChecks.includes("tests/fogline-operator-rhythm-domain-kits-smoke.mjs"));
      assert.ok(runChecks.includes("tests/fogline-operator-rhythm-cdn-state-input-smoke.mjs"));
    }
  }
];

for (const testCase of cases) testCase.check();

assert.equal(cases.length, 10, "Fogline operator rhythm CDN/state/input smoke should cover 10 validation cases");
console.log("Fogline operator rhythm CDN/state/input smoke passed with 10 validation cases.");

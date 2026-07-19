import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const urls = readFileSync("experiments/fogline-relay/src/urls.js", "utf8");
const session = readFileSync("experiments/fogline-relay/src/session.js", "utf8");
const main = readFileSync("experiments/fogline-relay/src/main.js", "utf8");
const kit = readFileSync("experiments/fogline-relay/src/fogline-signal-cartography-kits.js", "utf8");
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
    label: "Session imports signal cartography domain",
    check: () => assert.ok(session.includes("createFoglineSignalCartographyDomain"))
  },
  {
    label: "Session exposes signal cartography snapshot",
    check: () => assert.ok(session.includes("signalCartography") && session.includes("foglineSignalCartography"))
  },
  {
    label: "GameHost exposes cartography handoff",
    check: () => assert.ok(main.includes("getSignalCartography") && main.includes("getRendererHandoff"))
  },
  {
    label: "Renderer receives composed descriptor handoff",
    check: () => assert.ok(session.includes("fogline-composed-renderer-handoff") && session.includes("renderer-consumes-descriptors-only"))
  },
  {
    label: "Cartography kits stay renderer neutral",
    check: () => {
      for (const forbidden of ["document.", "querySelector", "requestAnimationFrame", "new THREE", "AudioContext", "fetch("]) {
        assert.ok(!kit.includes(forbidden), `cartography kit should not include ${forbidden}`);
      }
    }
  },
  {
    label: "Cartography descriptors map to existing renderer buckets",
    check: () => {
      for (const token of ["objectiveNeedles", "routeThreads", "scanCones", "gateSigils", "safePockets", "groundMottles"]) {
        assert.ok(kit.includes(token) || session.includes(token), `expected compatible bucket ${token}`);
      }
    }
  },
  {
    label: "Route keeps browser module boot",
    check: () => assert.ok(index.includes("./src/main.js") && !index.includes("attachNexusRealtimePageLoader"))
  },
  {
    label: "New cartography checks are wired",
    check: () => {
      assert.ok(runChecks.includes("tests/fogline-signal-cartography-domain-kits-smoke.mjs"));
      assert.ok(runChecks.includes("tests/fogline-signal-cartography-cdn-state-input-smoke.mjs"));
    }
  }
];

for (const testCase of cases) testCase.check();

assert.equal(cases.length, 10, "Fogline signal cartography CDN/state/input smoke should cover 10 validation cases");
console.log("Fogline signal cartography CDN/state/input smoke passed with 10 validation cases.");

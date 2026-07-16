import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const routeShell = readFileSync("experiments/next-ledge/index.html", "utf8");
const overlaySource = readFileSync("experiments/next-ledge/src/rescue-line-readiness-entry.js", "utf8");
const kitSource = readFileSync("experiments/next-ledge/src/rescue-line-readiness-kits.js", "utf8");
const anchorSmokeSource = readFileSync("tests/next-ledge-anchor-timing-cdn-state-input-smoke.mjs", "utf8");
const manifestSource = readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8");
const diagnosticsSource = readFileSync("experiments/next-ledge/src/advanced-diagnostics.js", "utf8");

const nexusEngineCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const oldRuntimeCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js";

assert.ok(overlaySource.includes(nexusEngineCdn), "rescue line overlay should import NexusEngine main through the CDN");
assert.doesNotMatch(overlaySource, new RegExp(oldRuntimeCdn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), "rescue line overlay must not import old NexusRealtime runtime CDN");
assert.match(routeShell, /rescue-line-readiness-renderer-handoff-pass/, "route shell should identify rescue line cutover");
assert.doesNotMatch(routeShell, /rescue-line-readiness-entry\.js/, "clean playable route should not auto-load rescue line overlay");
assert.match(diagnosticsSource, /"rescue-line": "Rescue line:/, "advanced disclosure should preserve rescue-line diagnostic context");
assert.match(overlaySource, /createNextLedgeRescueLineReadinessDomainKit/, "overlay should create the rescue line domain kit");
assert.match(overlaySource, /getRescueLineReadiness/, "GameHost should expose rescue line readiness");
assert.match(overlaySource, /getNextLedgeRescueLineReadiness/, "GameHost should expose route-specific rescue line readiness");
assert.match(overlaySource, /rescueLineReadiness/, "composed renderer handoff should include rescue line descriptors");
assert.match(overlaySource, /document\.documentElement\.dataset\.nextLedgeRescueLine/, "overlay should expose Playwright-readable CDN marker");
assert.match(anchorSmokeSource, /next-ledge-rescue-line-readiness-kits-smoke\.mjs/, "existing Next Ledge validation should route rescue line kit smoke");
assert.match(anchorSmokeSource, /next-ledge-rescue-line-readiness-cdn-state-input-smoke\.mjs/, "existing Next Ledge validation should route rescue line CDN smoke");
assert.match(manifestSource, /next-ledge-rescue-line-readiness-domain-kit/, "manifest should register rescue line domain kit");

for (const required of [
  "next-ledge-fall-recovery-net-kit",
  "next-ledge-tether-strain-pulse-kit",
  "next-ledge-rescue-anchor-triage-kit",
  "next-ledge-stamina-cache-hop-kit",
  "next-ledge-cargo-retention-warning-kit",
  "next-ledge-summit-extraction-beacon-kit",
  "next-ledge-rescue-line-renderer-handoff-kit",
  "next-ledge-rescue-line-readiness-domain-kit"
]) {
  assert.ok(kitSource.includes(required), `rescue line surface should include ${required}`);
}

const simulatedCases = [
  { name: "swinging safe", expected: /fallRecoveryNets/ },
  { name: "falling recovery", expected: /recoveryMode/ },
  { name: "tether strain", expected: /tetherStrainPulses/ },
  { name: "anchor triage", expected: /rescueAnchorTriages/ },
  { name: "rest cache", expected: /staminaCacheHops/ },
  { name: "cargo pressure", expected: /cargoRetentionWarnings/ },
  { name: "summit thread", expected: /summitExtractionBeacons/ },
  { name: "renderer handoff", expected: /next-ledge-rescue-line-readiness-renderer-handoff/ },
  { name: "GameHost handoff", expected: /host\.getRendererHandoff/ },
  { name: "visual overlay", expected: /drawRescueDescriptors/ }
];

for (const testCase of simulatedCases) {
  assert.match(`${kitSource}\n${overlaySource}`, testCase.expected, `${testCase.name} should be covered by rescue line state/input validation`);
}

const forbiddenKitOwnership = /from\s+["'].*three|document\.|window\.|addEventListener\(|requestAnimationFrame|AudioContext|WebGLRenderer|new\s+THREE|createRenderer\(/;
assert.doesNotMatch(kitSource, forbiddenKitOwnership, "rescue line kits must remain renderer-neutral");

console.log("Next Ledge rescue line CDN/state/input smoke passed.");

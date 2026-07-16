import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const domainManifest = JSON.parse(readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8"));
const replayManifest = JSON.parse(readFileSync("experiments/canonical-route-replay-manifest.json", "utf8"));
const sessionSource = readFileSync("experiments/next-ledge/src/session.js", "utf8");
const visualSessionSource = readFileSync("experiments/next-ledge/src/session-visual-upgrade.js", "utf8");
const cargoWrapperSource = readFileSync("experiments/next-ledge/src/session-cargo-extraction-upgrade.js", "utf8");

const route = domainManifest.canonicalRoutes.find((entry) => entry.id === "next-ledge");
assert.ok(route, "Next Ledge should stay manifest-owned as the traversal/cargo canonical route");
assert.equal(route.canonicalPath, "experiments/next-ledge/", "Next Ledge should keep its canonical base route");

for (const required of [
  "generic-route-cargo-extraction-kit"
]) {
  assert.ok(route.domainCutover.includes(required), `Next Ledge cutover should point at concrete ${required}`);
}

for (const stalePlaceholder of [
  "route-checkpoint-kit",
  "cargo-delivery-kit"
]) {
  assert.ok(
    !route.domainCutover.includes(stalePlaceholder),
    `Next Ledge cutover should not regress to stale placeholder ${stalePlaceholder}`
  );
}

assert.match(
  route.bridgeNeeded,
  /route-cargo/,
  "Next Ledge bridge note should record the executable route-cargo seam"
);
assert.match(
  route.bridgeNeeded,
  /browser wrapper consumes NexusEngine main CDN/,
  "Next Ledge bridge note should preserve the browser wrapper boundary"
);

const replay = replayManifest.canonicalRouteReplays.find((entry) => entry.canonicalId === "next-ledge");
assert.ok(replay, "Next Ledge should stay represented in the canonical route replay manifest");
assert.equal(replay.scenarioLane, "traversal-cargo-pressure", "Next Ledge should pressure the traversal/cargo lane");
assert.equal(replay.status, "planned-fixture", "Next Ledge should remain planned until cargo/resource/pressure replay is executable");
assert.ok(
  replay.protoKitReplayCoverage.some((entry) => entry.test === "tests/generic-route-progress-kit-smoke.test.mjs"),
  "Next Ledge replay metadata should point at the generic route-progress smoke"
);
assert.ok(
  replay.protoKitReplayCoverage.some((entry) => entry.test === "tests/generic-route-cargo-extraction-kit-smoke.test.mjs"),
  "Next Ledge replay metadata should point at the generic route-cargo-extraction smoke"
);

const nextLedgeSource = `${sessionSource}\n${visualSessionSource}\n${cargoWrapperSource}`;
assert.match(nextLedgeSource, /createGenericRouteProgressKit/, "Next Ledge should import the route-progress ProtoKit in the route host");
assert.match(nextLedgeSource, /engine\.n\?\.genericRouteProgress/, "Next Ledge should prefer the namespaced route-progress DSK surface");
assert.match(nextLedgeSource, /routeProgress: routeProgressFacade\(engine\)\?\.getState/, "Next Ledge snapshots should expose route-progress state through the domain snapshot");
assert.match(nextLedgeSource, /createGenericRouteCargoExtractionKit/, "Next Ledge should consume the cargo extraction composite in its playable wrapper");
for (const composedChild of ["generic-route-progress-kit", "generic-resource-loop-kit", "generic-pressure-loop-kit"]) {
  assert.ok(nextLedgeSource.includes(composedChild), `Next Ledge source should expose composed child ${composedChild}`);
}
assert.match(cargoWrapperSource, /routeCargoExtraction: cargoSnapshot/, "Next Ledge should expose composite cargo state through snapshots");

assert.ok(
  replay.missingExecutableFixtures.some((fixture) => /route-level deterministic replay/.test(fixture)),
  "Next Ledge should keep the remaining route-level replay gap explicit"
);
assert.ok(
  replay.localJsReductionOpportunity.some((opportunity) => /cargo|tether|pressure/.test(opportunity)),
  "Next Ledge should keep remaining local-JS reduction pressure explicit after route-progress consumption"
);

for (const forbiddenBrowserOwner of [
  "document.",
  "window.",
  "CanvasRenderingContext2D",
  "WebGLRenderingContext",
  "THREE."
]) {
  assert.doesNotMatch(
    sessionSource,
    new RegExp(forbiddenBrowserOwner.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    `Next Ledge session should not own browser/renderer APIs: ${forbiddenBrowserOwner}`
  );
}

console.log("Next Ledge route/cargo cutover smoke passed.");

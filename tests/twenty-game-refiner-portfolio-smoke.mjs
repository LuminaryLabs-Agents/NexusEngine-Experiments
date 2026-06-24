import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const portfolioPath = "experiments/twenty-game-refiner-portfolio.json";
const cutoverManifestPath = "experiments/domain-kit-cutover-manifest.json";

const portfolio = JSON.parse(readFileSync(portfolioPath, "utf8"));
const cutoverManifest = JSON.parse(readFileSync(cutoverManifestPath, "utf8"));

const allowedStatuses = new Set(["canonical-cutover", "fold-into-canonical", "seed-backlog", "harden-before-canonical"]);
const allowedLanes = new Set([
  "survey-pressure",
  "strategic-pressure-loop",
  "survival-ecology",
  "traversal-cargo-pressure",
  "aerial-open-traversal",
  "field-engineer-composition",
  "action-defense-extraction",
  "economy-social-workshop"
]);
const requiredSurfaces = ["resources", "events", "methods", "snapshots", "descriptors"];

assert.equal(portfolio.sourceManifest, cutoverManifestPath, "portfolio contract should extend the cutover manifest");
assert.equal(portfolio.targetCountGuidance?.target, 20, "portfolio contract keeps the twenty-game lens visible");
assert.equal(portfolio.targetCountGuidance?.brittleQuota, false, "twenty-game target must not be treated as a brittle quota");
assert.ok(portfolio.policy.includes("evaluation lens"), "policy should describe the target list as an evaluation lens");
assert.ok(portfolio.weakGameRule.includes("Do not preserve weak games"), "weak-game pruning rule should be explicit");
assert.ok(portfolio.decisionRule.includes("deterministic replay"), "promotion decision should preserve replay pressure");
assert.deepEqual(portfolio.dskSurfacesRequired, requiredSurfaces, "portfolio should keep the five DSK surfaces visible");

assert.ok(Array.isArray(portfolio.targetRoutes), "targetRoutes[] should be present");
assert.equal(portfolio.targetRoutes.length, 20, "the refiner target lens should enumerate exactly the remembered twenty names");

const canonicalById = new Map(cutoverManifest.canonicalRoutes.map((entry) => [entry.id, entry]));
const targetNames = new Set();
const targetOrdinals = new Set();
const canonicalCutoverIds = new Set();

for (const entry of portfolio.targetRoutes) {
  assert.ok(Number.isInteger(entry.targetOrdinal), `${entry.targetName ?? "unknown"} should have an integer ordinal`);
  assert.equal(entry.targetOrdinal >= 1 && entry.targetOrdinal <= 20, true, `${entry.targetName} ordinal should stay within the twenty-game lens`);
  assert.ok(!targetOrdinals.has(entry.targetOrdinal), `target ordinal ${entry.targetOrdinal} should be unique`);
  targetOrdinals.add(entry.targetOrdinal);

  assert.ok(typeof entry.targetName === "string" && entry.targetName.length > 2, "each target should have a name");
  assert.ok(!targetNames.has(entry.targetName), `${entry.targetName} should not be duplicated`);
  targetNames.add(entry.targetName);

  assert.ok(allowedStatuses.has(entry.status), `${entry.targetName} should use an allowed route decision status`);
  assert.ok(allowedLanes.has(entry.scenarioLane), `${entry.targetName} should use a known higher-level lane`);
  assert.ok(typeof entry.routeDecision === "string" && entry.routeDecision.length > 40, `${entry.targetName} should explain canonical/fold/backlog decision`);
  assert.ok(Array.isArray(entry.reusableDomainPressure) && entry.reusableDomainPressure.length > 0, `${entry.targetName} should list reusable domain pressure`);
  assert.deepEqual(entry.dskSurfaces, requiredSurfaces, `${entry.targetName} should keep resources/events/methods/snapshots/descriptors visible`);
  assert.ok(typeof entry.localJsPressure === "string" && entry.localJsPressure.length > 40, `${entry.targetName} should name local JavaScript reduction pressure`);
  assert.ok(typeof entry.rendererBoundary === "string" && entry.rendererBoundary.length > 30, `${entry.targetName} should state renderer-only boundary health`);
  assert.ok(Array.isArray(entry.smokeReplayGap) && entry.smokeReplayGap.length > 0, `${entry.targetName} should list smoke/replay gaps`);

  if (entry.status === "canonical-cutover") {
    assert.ok(entry.canonicalRouteId, `${entry.targetName} canonical target should point at a manifest route`);
    assert.ok(canonicalById.has(entry.canonicalRouteId), `${entry.targetName} canonical route should exist in the cutover manifest`);
    assert.ok(!canonicalCutoverIds.has(entry.canonicalRouteId), `${entry.canonicalRouteId} should not be duplicated as a canonical-cutover target`);
    canonicalCutoverIds.add(entry.canonicalRouteId);
  }

  if (entry.status === "seed-backlog") {
    assert.equal(entry.canonicalRouteId, null, `${entry.targetName} seed/backlog target should not silently become canonical`);
  }

  if (entry.status === "fold-into-canonical") {
    assert.ok(entry.canonicalRouteId && canonicalById.has(entry.canonicalRouteId), `${entry.targetName} fold target should name the canonical route it pressures`);
  }
}

for (let ordinal = 1; ordinal <= 20; ordinal += 1) {
  assert.ok(targetOrdinals.has(ordinal), `target ordinal ${ordinal} should be represented`);
}

assert.ok(Array.isArray(portfolio.manifestCanonicalRouteCoverage), "manifestCanonicalRouteCoverage[] should be present");
const coverageByCanonicalId = new Map(portfolio.manifestCanonicalRouteCoverage.map((entry) => [entry.canonicalId, entry]));
assert.equal(coverageByCanonicalId.size, canonicalById.size, "every manifest canonical route should have exactly one portfolio coverage entry");

for (const [canonicalId] of canonicalById) {
  const coverage = coverageByCanonicalId.get(canonicalId);
  assert.ok(coverage, `${canonicalId} should have portfolio coverage`);
  assert.ok(allowedLanes.has(coverage.scenarioLane), `${canonicalId} coverage should use a known lane`);
  assert.ok(typeof coverage.targetLens === "string" && coverage.targetLens.length > 2, `${canonicalId} should describe the target lens it satisfies or extends`);
  assert.ok(typeof coverage.portfolioDecision === "string" && coverage.portfolioDecision.length > 20, `${canonicalId} should explain portfolio decision`);
}

assert.ok(
  canonicalCutoverIds.size < portfolio.targetRoutes.length,
  "portfolio smoke should prove the twenty-name list is not promoted wholesale into canonical routes"
);

console.log("Twenty-game refiner portfolio smoke passed.");

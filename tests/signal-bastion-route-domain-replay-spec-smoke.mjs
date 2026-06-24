import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const specPath = "experiments/signal-bastion-route-domain-replay.json";
const replayManifestPath = "experiments/canonical-route-replay-manifest.json";
const laneContractsPath = "experiments/headless-lane-replay-contracts.json";
const bridgeSmokePath = "tests/signal-bastion-replay-bridge-smoke.mjs";
const executableSmokePath = "tests/signal-bastion-executable-route-replay-smoke.mjs";

const spec = JSON.parse(readFileSync(specPath, "utf8"));
const replayManifest = JSON.parse(readFileSync(replayManifestPath, "utf8"));
const laneContracts = JSON.parse(readFileSync(laneContractsPath, "utf8"));

const routeReplay = replayManifest.canonicalRouteReplays.find((entry) => entry.canonicalId === spec.canonicalId);
const lane = replayManifest.replayLanes.find((entry) => entry.id === spec.scenarioLane);
const contract = laneContracts.contracts.find((entry) => entry.id === spec.scenarioLane);

assert.equal(spec.version, 1, "Signal Bastion route-domain replay spec should be versioned");
assert.equal(spec.canonicalId, "signal-bastion", "spec should target Signal Bastion");
assert.equal(spec.canonicalPath, "games/signal-bastion/", "spec should target the canonical Signal Bastion route");
assert.equal(spec.sourceReplayManifest, replayManifestPath, "spec should extend the canonical replay manifest");
assert.equal(spec.sourceLaneContracts, laneContractsPath, "spec should extend the lane replay contracts");
assert.equal(spec.sourceBridgeSmoke, bridgeSmokePath, "spec should build on the existing bridge smoke");
assert.equal(spec.sourceExecutableSmoke, executableSmokePath, "spec should point at the executable route replay smoke");
assert.ok(existsSync(executableSmokePath), "executable route replay smoke should exist");
assert.match(spec.sourceSessionCommandSmoke ?? "", /generic-defense-session-command-kit-smoke\.test\.mjs/, "spec should cite the session-command ProtoKit smoke");
assert.equal(spec.sessionCommandBoundary?.kit, "createGenericDefenseSessionCommandKit", "spec should record the reusable session command kit");
assert.equal(spec.executionStatus, "executable-smoked-protokit-backed", "spec should mark the route replay as executable and ProtoKit-backed");
assert.ok(routeReplay, "Signal Bastion should still exist in the canonical replay manifest");
assert.ok(lane, "strategic-pressure-loop should still exist in the canonical replay manifest");
assert.ok(contract, "strategic-pressure-loop should still exist in the lane contracts");
assert.equal(spec.scenarioLane, routeReplay.scenarioLane, "spec lane should match the route replay lane");
assert.equal(lane.coverageStatus, "protokit-covered", "strategic-pressure-loop should remain ProtoKit-covered");
assert.equal(contract.executionStatus, "protokit-backed", "strategic-pressure-loop contract should remain ProtoKit-backed");
assert.deepEqual(spec.fixedTickPlan, contract.fixedTickPlan, "spec should use the checked strategic-pressure fixed-tick plan");
assert.ok(
  spec.executableReplayCoverage?.some((coverage) => coverage.test === executableSmokePath),
  "spec should list executable route replay coverage"
);

for (const exclusion of replayManifest.browserOwnershipExcluded) {
  assert.ok(spec.reusableKitOwnershipExcluded.includes(exclusion), `spec should keep ${exclusion} outside reusable kit ownership`);
}

for (const surface of ["resources", "events", "methods", "snapshots", "descriptors"]) {
  assert.ok(Array.isArray(spec.expectedAssertions?.[surface]), `spec should list expected ${surface}`);
  assert.ok(spec.expectedAssertions[surface].length > 0, `spec expected ${surface} should be non-empty`);
  for (const item of contract.assertions[surface]) {
    assert.ok(
      spec.expectedAssertions[surface].some((candidate) => candidate.includes(item) || item.includes(candidate)),
      `spec should preserve contract ${surface} item ${item}`
    );
  }
}

const boundaryIds = new Set(spec.protokitBoundaries.map((boundary) => boundary.id));
for (const id of ["map", "economyWallet", "buildPlacement", "waveAgentDirector", "combatResolver", "sessionFacade", "renderDescriptors"]) {
  assert.ok(boundaryIds.has(id), `spec should keep ${id} as an explicit generic-defense DSK boundary`);
}
for (const boundary of spec.protokitBoundaries) {
  assert.ok(boundary.exportName?.startsWith("createGenericDefense"), `${boundary.id} should name a generic-defense factory export`);
  for (const surface of ["resources", "events", "methods", "snapshots", "descriptors"]) {
    assert.ok(Array.isArray(boundary.surfaces?.[surface]), `${boundary.id} should expose ${surface} surface metadata`);
  }
  assert.ok(
    boundary.surfaces.methods.some((method) => method.startsWith("n.genericDefense.") || method === "defensePresentationStack.getSnapshot"),
    `${boundary.id} should expose a namespaced DSK method or presentation-stack descriptor bridge`
  );
}
assert.ok(
  spec.protokitBoundaries.find((boundary) => boundary.id === "renderDescriptors")?.surfaces.descriptors.length > 0,
  "render descriptor boundary should expose renderer-agnostic descriptors"
);

const replayMethods = new Set(spec.semanticReplayInputs.flatMap((input) => [input.method, input.bridgedMethod].filter(Boolean)));
for (const method of [
  "n.genericDefense.sessionFacade.setBlueprint",
  "n.genericDefense.sessionFacade.build",
  "n.genericDefense.sessionFacade.upgrade",
  "n.genericDefense.sessionFacade.startWave",
  "n.genericDefense.sessionFacade.sell",
  "n.genericDefense.sessionFacade.getSnapshot",
  "defensePresentationStack.getSnapshot"
]) {
  assert.ok(replayMethods.has(method), `spec should include semantic replay method ${method}`);
}
assert.ok(spec.deterministicDigest.fields.includes("render.descriptors"), "spec digest should include renderer-agnostic descriptors");
assert.ok(spec.remainingGap.includes("host convenience facades") && spec.remainingGap.includes("DSK aliases"), "spec should keep the remaining browser host/local-JS reduction gap explicit after DSK bridge migration");
assert.ok(spec.localJsReductionSignal.some((entry) => entry.includes("session command ProtoKit")), "spec should record the browser host session-command ProtoKit reduction");
assert.ok(spec.localJsReductionSignal.some((entry) => entry.includes("engine.n.genericDefense.sessionFacade")), "spec should record the browser host namespace reduction");

const boot = readFileSync("games/signal-bastion/src/boot.js", "utf8");
const input = readFileSync("games/signal-bastion/src/input-host.js", "utf8");
const renderer = readFileSync("games/signal-bastion/src/renderer-canvas.js", "utf8");

assert.match(boot, /generic-defense-aaa-dsk-bridge/, "boot should use the DSK bridge module, not the broad generic-defense facade URL");
assert.match(boot, /generic-defense-session-command-kit/, "boot should import the session-command ProtoKit for blueprint and sell commands");
assert.match(boot, /createGenericDefenseDskBundle/, "boot should compose generic-defense simulation from named ProtoKit DSK aliases");
assert.match(boot, /SIGNAL_BASTION_DEFENSE_DSK_BOUNDARY_IDS/, "boot should keep the browser DSK alias set explicit");
assert.doesNotMatch(boot, /\bcreateGenericDefenseKits\s*\(/, "boot should not compose the entire broad generic-defense compatibility facade");
assert.doesNotMatch(boot, /createGenericDefenseBuildKit\(/, "boot should not install the broad build compatibility facade");
assert.doesNotMatch(boot, /createGenericDefenseWaveKit\(/, "boot should not install the broad wave compatibility facade");
assert.match(boot, /createGenericDefensePresentationStackKits/, "boot should still compose presentation descriptors from ProtoKits");
assert.match(boot, /engine\.tick\(dt\)/, "boot should advance the route through runtime ticks");
assert.match(boot, /engine\.defensePresentationStack\?\.getSnapshot\?\.\(\)/, "boot should surface descriptor snapshots");
assert.match(boot, /getSignalBastionSessionFacade\(engine\)\?\.getSnapshot\?\.\(\)/, "boot should read namespaced DSK session snapshots");
assert.match(input, /engine\.placementProjector\?\.confirm\?\.\(/, "input host should bridge build placement into semantic methods");
assert.match(input, /sessionFacade\(\)\?\.setBlueprint\?\.\(/, "input host should bridge blueprint selection through the session-command DSK");
assert.match(input, /sessionFacade\(\)\?\.sell\?\.\(/, "input host should bridge sell through the session-command DSK");
assert.match(input, /sessionFacade\(\)\?\.startWave\?\.\(/, "input host should bridge wave start through the namespaced DSK session facade");
assert.match(input, /sessionFacade\(\)\?\.upgrade\?\.\(/, "input host should bridge upgrades through the namespaced DSK session facade");
assert.match(input, /sessionFacade\(\)\?\.getSnapshot\?\.\(\)/, "input host should read domain snapshots through the namespaced DSK session facade");
assert.doesNotMatch(input, /engine\.genericDefense\./, "input host should not call the broad genericDefense facade directly after namespace migration");
assert.doesNotMatch(input, /engine\.defenseBuild\?\./, "input host should not call the broad defenseBuild facade directly after session-command migration");
assert.match(renderer, /function draw\(presentation/, "renderer should draw from presentation snapshots");
assert.doesNotMatch(renderer, /createRealtimeGame|createGenericDefenseKits|engine\.tick|requestAnimationFrame|performance\.now/, "renderer should not own simulation or frame timing");

for (const source of [boot, input, renderer]) {
  assert.doesNotMatch(source, /Math\.random|Date\.now|crypto\.getRandomValues/, "route host sources should avoid replay-breaking local randomness");
}

console.log("Signal Bastion route-domain replay spec smoke passed.");

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const spec = JSON.parse(readFileSync("experiments/signal-bastion-route-domain-replay.json", "utf8"));
const inputHost = readFileSync("games/signal-bastion/src/input-host.js", "utf8");
const hostFacadeGuard = readFileSync("tests/signal-bastion-host-facade-guard-smoke.mjs", "utf8");

assert.equal(spec.canonicalId, "signal-bastion", "placement namespace guard is scoped to Signal Bastion");
assert.equal(spec.scenarioLane, "strategic-pressure-loop", "placement namespace guard should stay on the strategic-pressure lane");
assert.equal(spec.executionStatus, "executable-smoked-protokit-backed", "placement namespace guard should build on the existing executable route replay");
assert.match(
  spec.sourcePlacementNamespaceSmoke ?? "",
  /generic-defense-placement-projector-namespace-smoke\.test\.mjs/,
  "spec should point at the ProtoKits placement-projector namespace smoke as the reusable source of truth"
);
assert.match(
  spec.sourceSessionCommandSmoke ?? "",
  /generic-defense-session-command-kit-smoke\.test\.mjs/,
  "spec should point at the ProtoKits session-command smoke as the reusable source of truth for blueprint/sell commands"
);

const placementInput = spec.semanticReplayInputs.find((entry) => entry.method === "placementProjector.confirm");
assert.ok(placementInput, "route-domain replay spec should include placementProjector.confirm as the placement bridge");
assert.equal(
  placementInput.bridgedMethod,
  "n.genericDefense.sessionFacade.build",
  "placement confirmation should bridge into the namespaced generic-defense session facade"
);
assert.ok(
  spec.expectedAssertions.methods.includes("n.genericDefense.sessionFacade.build"),
  "expected route replay methods should include the namespaced build method"
);
assert.ok(
  spec.expectedAssertions.methods.includes("n.genericDefense.sessionFacade.setBlueprint"),
  "expected route replay methods should include the reusable namespaced blueprint command"
);
assert.ok(
  spec.expectedAssertions.methods.includes("n.genericDefense.sessionFacade.sell"),
  "expected route replay methods should include the reusable namespaced sell command"
);

const reductionNotes = (spec.localJsReductionSignal ?? []).join("\n");
assert.match(
  reductionNotes,
  /placement projector.*engine\.n\.genericDefense\.sessionFacade/s,
  "local JS reduction notes should record that placement projection now resolves through the DSK namespace"
);
assert.match(
  reductionNotes,
  /session command ProtoKit/s,
  "local JS reduction notes should record that blueprint and sell commands now come from a reusable ProtoKit"
);

assert.ok(
  inputHost.includes("engine.placementProjector?.confirm?.({ commandId: `place:${activeBlueprint}:${engine.clock.frame}` });"),
  "input host should keep browser placement as a semantic projector confirmation, not a direct build mutation"
);
assert.ok(
  inputHost.includes("sessionFacade()?.setBlueprint?.(activeBlueprint"),
  "setBlueprint should now route through the namespaced session command boundary"
);
assert.ok(
  inputHost.includes("sessionFacade()?.sell?.(selected.selectedId"),
  "sell should now route through the namespaced session command boundary"
);
assert.doesNotMatch(
  inputHost,
  /engine\.defenseBuild\?\.build\?\.\(/,
  "input host should not call the defenseBuild compatibility build facade directly"
);
assert.doesNotMatch(
  inputHost,
  /engine\.defenseBuild\?\.setBlueprint\?\.\(/,
  "input host should not call the defenseBuild compatibility blueprint facade directly"
);
assert.doesNotMatch(
  inputHost,
  /engine\.defenseBuild\?\.sell\?\.\(/,
  "input host should not call the defenseBuild compatibility sell facade directly"
);
assert.doesNotMatch(
  inputHost,
  /engine\.genericDefense(?:\?\.|\.)build/,
  "input host should not call the legacy genericDefense build facade directly"
);

assert.match(
  hostFacadeGuard,
  /engine\.placementProjector\?\.confirm\?\.\(/,
  "host facade guard should continue treating placementProjector.confirm as the semantic bridge"
);
assert.match(
  hostFacadeGuard,
  /sessionFacade\(\)\?\.setBlueprint\?\.\(/,
  "host facade guard should require the namespaced blueprint command bridge"
);
assert.match(
  hostFacadeGuard,
  /sessionFacade\(\)\?\.sell\?\.\(/,
  "host facade guard should require the namespaced sell command bridge"
);
assert.doesNotMatch(
  hostFacadeGuard,
  /engine\.defenseBuild\?\.build\?\.\(/,
  "host facade guard should not allow a direct compatibility build facade to become the placement bridge"
);

console.log("Signal Bastion placement namespace contract smoke passed.");

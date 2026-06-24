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

const reductionNotes = (spec.localJsReductionSignal ?? []).join("\n");
assert.match(
  reductionNotes,
  /placement projector.*engine\.n\.genericDefense\.sessionFacade/s,
  "local JS reduction notes should record that placement projection now resolves through the DSK namespace"
);

assert.ok(
  inputHost.includes("engine.placementProjector?.confirm?.({ commandId: `place:${activeBlueprint}:${engine.clock.frame}` });"),
  "input host should keep browser placement as a semantic projector confirmation, not a direct build mutation"
);
assert.doesNotMatch(
  inputHost,
  /engine\.defenseBuild\?\.build\?\.\(/,
  "input host should not call the defenseBuild compatibility build facade directly"
);
assert.doesNotMatch(
  inputHost,
  /engine\.genericDefense\??\.build\?*\.\(/,
  "input host should not call the legacy genericDefense build facade directly"
);
assert.ok(
  inputHost.includes("engine.defenseBuild?.setBlueprint?.(activeBlueprint)"),
  "setBlueprint remains an explicit browser convenience seam for UI affordance compatibility"
);
assert.ok(
  inputHost.includes("engine.defenseBuild?.sell?.("),
  "sell remains an explicit browser convenience seam until a namespaced sell bridge exists"
);

assert.match(
  hostFacadeGuard,
  /engine\.placementProjector\?\.confirm\?\.\(/,
  "host facade guard should continue treating placementProjector.confirm as the semantic bridge"
);
assert.doesNotMatch(
  hostFacadeGuard,
  /engine\.defenseBuild\?\.build\?\.\(/,
  "host facade guard should not allow a direct compatibility build facade to become the placement bridge"
);

console.log("Signal Bastion placement namespace contract smoke passed.");

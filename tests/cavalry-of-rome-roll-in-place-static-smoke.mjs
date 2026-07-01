import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const rollController = readFileSync("experiments/The Cavalry of Rome/src/hex-roll-controller-pass.js", "utf8");
const actionUi = readFileSync("experiments/The Cavalry of Rome/src/hex-action-ui-pass.js", "utf8");
const endpoint = readFileSync("apps/the-cavalry-of-rome/index.html", "utf8");
const experimentEntry = readFileSync("experiments/The Cavalry of Rome/index.html", "utf8");

assert.ok(rollController.includes("roll-in-place-tactical-controller"), "roll controller should document its style");
assert.ok(rollController.includes("rollActionPointsInPlace"), "roll controller should expose rollActionPointsInPlace");
assert.ok(rollController.includes("showDice([a, b], \"actionPoints\")"), "roll-in-place should show 2d6 board dice");
assert.ok(rollController.includes("state.actionPoints = a + b"), "roll-in-place should update action points from 2d6");
assert.ok(rollController.includes("host.rollActionPointsInPlace = rollActionPointsInPlace"), "GameHost should expose roll-in-place");
assert.ok(rollController.includes("canRollInPlace"), "tactical snapshot should expose roll availability");
assert.ok(rollController.includes("event.key === \"0\""), "0 hotkey should roll AP in place");
assert.ok(rollController.includes("crypto.getRandomValues"), "roll controller should use crypto randomness when available");

assert.ok(actionUi.includes("rollAp"), "action UI should include Roll AP action");
assert.ok(actionUi.includes("Roll AP"), "action UI should label Roll AP card");
assert.ok(actionUi.includes("2d6 in place"), "Roll AP card should explain in-place 2d6 roll");
assert.ok(actionUi.includes("GameHost?.rollActionPointsInPlace"), "Roll AP card should call GameHost roll-in-place");
assert.ok(actionUi.includes("card.disabled = action.id === \"rollAp\""), "Roll AP disable behavior should differ from maneuver cards");
assert.ok(actionUi.includes("ROLL"), "Roll AP card should render ROLL cost text");

assert.ok(endpoint.includes("hex-roll-controller-pass.js"), "live endpoint should load roll controller");
assert.ok(experimentEntry.includes("hex-roll-controller-pass.js"), "experiment entry should load roll controller");

console.log("Cavalry roll-in-place static smoke passed.");

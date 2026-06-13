import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync("games/next-ledge-grapple/src/game.js", "utf8");
const html = readFileSync("games/next-ledge-grapple/index.html", "utf8");

assert.match(html, /<canvas id="game"/);
assert.match(source, /ACTION_INPUT_KIT_URLS/);
assert.match(source, /createActionSubscriptions/);
assert.match(source, /engine\.actionInput\.key/);
assert.match(source, /engine\.eventSurface\(engine\.actionInput\.events\.AxisChanged/);
assert.match(source, /engine\.nextLedgeGrapple\.swingAxis/);
assert.match(source, /window\.GameHost/);

console.log("Next Ledge Grapple static smoke passed.");

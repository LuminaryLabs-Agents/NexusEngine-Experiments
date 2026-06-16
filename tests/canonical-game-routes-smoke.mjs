import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const rootIndex = readFileSync("index.html", "utf8");
const manifest = JSON.parse(readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8"));

assert.ok(rootIndex.includes("./games/rogue-lite-hellscape-siege/"), "root gallery should link the base Hellscape route");
assert.ok(!rootIndex.includes("./games/rogue-lite-hellscape-siege-v2/"), "root gallery should not link the legacy V2 route");
assert.ok(!/Play V2|>V2<|Rogue-Lite Hellscape Siege V2|rogue-lite-hellscape-siege-v2/.test(rootIndex), "root gallery should not advertise or link a V2 route");
assert.ok(rootIndex.includes('class="gallery-row"'), "root gallery should use a one-row horizontal gallery");
assert.ok(rootIndex.includes('class="game-tile featured"'), "root gallery should show one larger featured game tile");
assert.ok(!rootIndex.includes("data-filter"), "root gallery should not use filter buttons");
assert.ok(rootIndex.includes("Open repo"), "root top bar should include one repo button");

for (const entry of manifest.canonicalRoutes) {
  assert.ok(entry.id, "manifest entries need ids");
  assert.ok(entry.canonicalPath, `${entry.id} should declare a canonical path`);
  assert.ok(!/-v[0-9]+\/?$/.test(entry.canonicalPath), `${entry.id} canonical path should not be versioned`);
  assert.ok(Array.isArray(entry.domainCutover), `${entry.id} should list domain kit cutover targets`);
  assert.ok(entry.bridgeNeeded, `${entry.id} should list bridge/preset ownership`);
}

const baseIndex = readFileSync("games/rogue-lite-hellscape-siege/index.html", "utf8");
assert.ok(baseIndex.includes('src="./src/main.js"'), "base Hellscape route should own its entrypoint");
assert.ok(baseIndex.includes('id="game"'), "base Hellscape route should use the unified canvas id");

const baseMain = readFileSync("games/rogue-lite-hellscape-siege/src/main.js", "utf8");
assert.ok(baseMain.includes("makeGame") || baseMain.includes("createRealtimeGame"), "base Hellscape entrypoint should own the kit-shaped runtime composition");
assert.ok(!baseMain.includes("rogue-lite-hellscape-siege-v2"), "base Hellscape should not import the legacy V2 route");
assert.equal(existsSync("games/rogue-lite-hellscape-siege-v2/index.html"), false, "legacy V2 folder should not keep a playable index");

console.log("Canonical game route smoke passed.");

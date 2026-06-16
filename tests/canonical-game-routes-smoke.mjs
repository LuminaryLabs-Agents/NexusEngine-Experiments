import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { games, galleryConfig } from "../experiments/_shared/nexus-gallery-data.js";

const rootIndex = readFileSync("index.html", "utf8");
const manifest = JSON.parse(readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8"));

assert.ok(rootIndex.includes('id="app"'), "root index should keep only the app mount");
assert.ok(rootIndex.includes("nexus-experiments-shell.js"), "root index should load the data-driven gallery shell");
assert.ok(rootIndex.includes("./games/rogue-lite-hellscape-siege/"), "root noscript fallback should link the base Hellscape route");
assert.ok(!rootIndex.includes("./games/rogue-lite-hellscape-siege-v2/"), "root gallery should not link the legacy V2 route");
assert.ok(!/Play V2|>V2<|Rogue-Lite Hellscape Siege V2|rogue-lite-hellscape-siege-v2/.test(rootIndex), "root gallery should not advertise or link a V2 route");
assert.ok(!rootIndex.includes("gallery-wrap"), "root index should not keep the old gallery wrapper");
assert.ok(!rootIndex.includes("shader-bg"), "root index should not keep inline shader canvas markup");
assert.ok(!rootIndex.includes("data-filter"), "root gallery should not use filter buttons");

assert.equal(galleryConfig.title, "Experiments", "gallery config should expose the product title");
assert.ok(galleryConfig.repoUrl.includes("NexusRealtime-Experiments"), "gallery config should expose the repo URL");
assert.ok(games.length >= 5, "gallery data should list every visible route");
assert.equal(games.filter((game) => game.featured).length, 1, "gallery should have exactly one featured route");

for (const game of games) {
  assert.ok(game.id, "gallery games need ids");
  assert.ok(game.title, `${game.id} should have a title`);
  assert.ok(game.route, `${game.id} should have a route`);
  assert.ok(!/-v[0-9]+\/?$/.test(game.route), `${game.id} route should not be versioned`);
  assert.ok(Array.isArray(game.tags) && game.tags.length > 0, `${game.id} should have tags`);
  assert.ok(game.description, `${game.id} should have a description`);
  const routePath = game.route.replace(/^\.\//, "");
  assert.ok(existsSync(`${routePath}index.html`), `${game.id} route should have index.html`);
}

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

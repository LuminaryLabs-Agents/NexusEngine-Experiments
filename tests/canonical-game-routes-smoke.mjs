import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { apps, games, tabs, galleryConfig } from "../experiments/_shared/nexus-gallery-data.js";

const rootIndex = readFileSync("index.html", "utf8");
const shell = readFileSync("experiments/_shared/nexus-experiments-shell.js", "utf8");
const manifest = JSON.parse(readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8"));

assert.ok(rootIndex.includes('id="app"'), "root index should keep only the app mount");
assert.ok(rootIndex.includes("nexus-experiments-shell.js"), "root index should load the data-driven launcher shell");
assert.ok(rootIndex.includes("./games/rogue-lite-hellscape-siege/") || rootIndex.includes("./apps/rogue-lite-hellscape-siege/"), "root noscript fallback should link the base Hellscape route when generated");
assert.ok(!rootIndex.includes("./games/rogue-lite-hellscape-siege-v2/"), "root gallery should not link the legacy V2 route");
assert.ok(!/Play V2|>V2<|Rogue-Lite Hellscape Siege V2|rogue-lite-hellscape-siege-v2/.test(rootIndex), "root gallery should not advertise or link a V2 route");
assert.ok(!rootIndex.includes("gallery-wrap"), "root index should not keep the old gallery wrapper");
assert.ok(!rootIndex.includes("shader-bg"), "root index should not keep inline shader canvas markup");
assert.ok(!rootIndex.includes("data-filter"), "root launcher should not use legacy filter buttons");

assert.ok(shell.includes("nexus-command-bar"), "shell should expose one compact command bar");
assert.ok(shell.includes("nexus-tabs"), "shell should expose application type tabs");
assert.ok(shell.includes("nexus-search-input"), "shell should include a search input");
assert.ok(shell.includes("nexus-route-list"), "shell should render a flat selectable route list");
assert.ok(shell.includes("nexus-route-row"), "shell should render selectable route rows");
assert.ok(shell.includes("nexus-route-accent"), "shell should render a small route accent");
assert.ok(shell.includes("ArrowDown"), "shell should support keyboard selection");
assert.ok(shell.includes("ArrowUp"), "shell should support keyboard selection");
assert.ok(shell.includes("openSelected"), "shell should support opening the selected row");
assert.ok(!shell.includes("nexus-gallery-grid"), "flat shell should not keep the card grid");
assert.ok(!shell.includes("nexus-app-card"), "flat shell should not keep app cards");
assert.ok(!shell.includes("nexus-app-art"), "flat shell should not keep large art panels");
assert.ok(!shell.includes("nexus-card-shader"), "flat shell should not render card shader canvases");
assert.ok(!shell.includes("attachNexusCardShaders"), "flat shell should not import per-card shaders");
assert.ok(!shell.includes("startNexusGalleryShader"), "flat shell should not depend on WebGL background rendering");
assert.ok(!shell.includes("data-launch-selected"), "flat shell should not keep selected launch button");
assert.ok(!shell.includes("nexus-gallery-row"), "flat shell should not keep the horizontal carousel row");
assert.ok(!shell.includes("nexus-scroll-button"), "flat shell should not keep carousel arrow buttons");
assert.ok(!shell.includes("getNearestTile"), "flat shell should not compute selected cards from scroll position");
assert.ok(!shell.includes("centerTile"), "flat shell should not center selected cards");
assert.ok(!shell.includes("--selected-scale"), "flat shell should not expose selected-card scale CSS");

assert.equal(galleryConfig.title, "NexusRealtime Applications", "gallery config should expose the product title");
assert.ok(galleryConfig.repoUrl.includes("NexusRealtime-Experiments"), "gallery config should expose the repo URL");
assert.ok(Array.isArray(tabs) && tabs.length >= 2, "gallery data should expose tab metadata");
assert.equal(tabs[0].id, "experiments", "first tab should be Experiments");
assert.ok(apps.length > 21, "gallery data should expose generated experiments and application routes, not only the old 21-card list");
assert.equal(games, apps, "legacy games export should alias apps during migration");
assert.ok(apps.some((app) => app.id === "high-fidelity-meadow"), "gallery should include the High Fidelity Meadow rendering route");
assert.ok(apps.some((app) => app.route.startsWith("./apps/")), "gallery should include promoted application routes under apps/");
assert.equal(apps.filter((app) => app.featured).length, 1, "gallery should have exactly one initial featured route");

const galleryData = readFileSync("experiments/_shared/nexus-gallery-data.js", "utf8");
assert.ok(!galleryData.includes("aaaBatchGalleryGames"), "main launcher should not spread the full AAA batch registry by name");
assert.ok(galleryData.includes("export const apps"), "gallery data should expose apps as the primary route collection");

const seenRoutes = new Set();
const seenIds = new Set();
for (const app of apps) {
  assert.ok(app.id, "gallery apps need ids");
  assert.ok(app.title, `${app.id} should have a title`);
  assert.ok(app.route, `${app.id} should have a route`);
  assert.ok(app.kind, `${app.id} should have a kind`);
  assert.ok(app.subtype, `${app.id} should have a subtype`);
  assert.ok(app.tab, `${app.id} should have a tab`);
  assert.ok(!/-v[0-9]+\/?$/.test(app.route), `${app.id} route should not be versioned`);
  assert.ok(Array.isArray(app.tags) && app.tags.length > 0, `${app.id} should have tags`);
  assert.ok(app.description, `${app.id} should have a description`);
  assert.ok(!seenIds.has(app.id), `${app.id} should not duplicate a gallery id`);
  assert.ok(!seenRoutes.has(app.route), `${app.id} should not duplicate a gallery route`);
  seenIds.add(app.id);
  seenRoutes.add(app.route);
  const routePath = app.route.replace(/^\.\//, "");
  assert.ok(existsSync(`${routePath}index.html`), `${app.id} route should have index.html`);
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

console.log("Canonical flat application route smoke passed.");

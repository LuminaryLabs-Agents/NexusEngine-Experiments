import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { games } from "../experiments/_shared/nexus-gallery-data.js";

const roots = ["experiments", "games"];
const ignore = new Set(["_shared", "aaa-batch", "assets"]);

function discoverRoutes() {
  const routes = [];
  for (const root of roots) {
    if (!existsSync(root)) continue;
    for (const entry of readdirSync(root, { withFileTypes: true })) {
      if (!entry.isDirectory() || ignore.has(entry.name) || entry.name.startsWith(".")) continue;
      const indexPath = join(root, entry.name, "index.html");
      if (!existsSync(indexPath)) continue;
      routes.push(`./${root}/${entry.name}/`);
    }
  }
  return routes.sort();
}

const actualRoutes = discoverRoutes();
const galleryRoutes = games.map((game) => game.route).sort();

assert.ok(actualRoutes.length > 21, `expected more than 21 discoverable routes, found ${actualRoutes.length}`);
assert.deepEqual(galleryRoutes, actualRoutes, "gallery data must include every real experiment/game route and no missing route");

for (const game of games) {
  assert.ok(game.id, "gallery item is missing id");
  assert.ok(game.title, `${game.id} is missing title`);
  assert.ok(game.description, `${game.id} is missing description`);
  assert.ok(Array.isArray(game.tags), `${game.id} tags must be an array`);
  assert.ok(existsSync(join(game.route.replace(/^\.\//, ""), "index.html")), `${game.id} points at a missing route ${game.route}`);
}

const onnx = games.find((game) => game.id === "onnx-agent-lab");
assert.ok(onnx, "onnx-agent-lab must remain listed");
assert.match(onnx.title, /ONNX Companion Workshop|ONNX Agent/i);
assert.doesNotMatch(onnx.description, /distilgpt2/i, "ONNX gallery description must not describe the old distilgpt2 chat shell");
assert.doesNotMatch(readFileSync("index.html", "utf8"), /tropical-island-scene-20260619/, "index shell cache buster must not be stale");

console.log(`gallery-coverage-smoke.mjs passed with ${actualRoutes.length} routes`);

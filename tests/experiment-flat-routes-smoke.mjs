import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { aaaBatchGames, aaaBatchGalleryGames } from "../experiments/aaa-batch/host/game-registry.js";
import { games } from "../experiments/_shared/nexus-gallery-data.js";

const root = process.cwd();
const galleryRoutes = games.map((game) => game.route);
const aaaRoutes = aaaBatchGalleryGames.map((game) => game.route);

assert.ok(aaaBatchGames.length > 20, `AAA registry should remain uncapped, got ${aaaBatchGames.length}`);
assert.ok(galleryRoutes.every((route) => !route.includes("/aaa-batch/")), "Gallery routes should not expose /aaa-batch/ URLs");
assert.ok(aaaRoutes.every((route) => !route.includes("/aaa-batch/")), "AAA gallery routes should flatten to experiments/<slug>/");

for (const game of aaaBatchGames) {
  assert.equal(game.route, `./experiments/${game.id}/`, `${game.id} runtime route should be flat`);
  assert.equal(game.routePath, `./experiments/${game.id}/`, `${game.id} routePath should be flat`);
  assert.ok(existsSync(join(root, "experiments", game.id, "index.html")), `${game.id} should have experiments/<slug>/index.html`);
}

const registry = readFileSync(join(root, "experiments", "aaa-batch", "host", "game-registry.js"), "utf8");
assert.equal(registry.includes("/aaa-batch/${game.id}"), false, "Registry should not generate public /aaa-batch/ routes");

console.log(`Flat experiment route smoke passed for ${aaaBatchGames.length} AAA registry routes.`);

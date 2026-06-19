import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { aaaBatchGames } from "../experiments/aaa-batch/host/game-registry.js";
import { games } from "../experiments/_shared/nexus-gallery-data.js";

const root = process.cwd();
const galleryRoutes = games.map((game) => game.route);
const aaaGalleryGames = games.filter((game) => game.id.startsWith("aaa-"));

assert.ok(aaaBatchGames.length > 20, `AAA registry should remain uncapped, got ${aaaBatchGames.length}`);
assert.ok(galleryRoutes.every((route) => !route.includes("/aaa-batch/")), "Gallery routes should not expose /aaa-batch/ URLs");
assert.ok(aaaGalleryGames.length > 20, `Gallery should include generated AAA routes, got ${aaaGalleryGames.length}`);

for (const game of aaaBatchGames) {
  const indexPath = join(root, "experiments", game.id, "index.html");
  assert.ok(existsSync(indexPath), `${game.id} should have generated experiments/<slug>/index.html`);
  const html = readFileSync(indexPath, "utf8");
  assert.ok(html.includes(`data-game-id="${game.id}"`), `${game.id} flat wrapper should declare its game id`);
  assert.ok(html.includes("startFlatAaaExperimentRoute"), `${game.id} flat wrapper should use the shared flat route helper`);
}

console.log(`Flat experiment route smoke passed for ${aaaBatchGames.length} generated AAA registry routes.`);

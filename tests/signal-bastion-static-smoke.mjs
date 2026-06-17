import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const requiredFiles = [
  "games/signal-bastion/index.html",
  "games/signal-bastion/src/boot.js",
  "games/signal-bastion/src/input-host.js",
  "games/signal-bastion/src/renderer-canvas.js",
  "games/signal-bastion/presets/default.js"
];

for (const file of requiredFiles) {
  assert.ok(existsSync(file), `${file} exists`);
}

const index = readFileSync("games/signal-bastion/index.html", "utf8");
assert.match(index, /src\/boot\.js\?v=aaa-dsk-phase/);

const boot = readFileSync("games/signal-bastion/src/boot.js", "utf8");
assert.match(boot, /generic-defense-aaa-kits/);
assert.match(boot, /createGenericDefenseKits/);
assert.match(boot, /GameHost/);

const input = readFileSync("games/signal-bastion/src/input-host.js", "utf8");
assert.match(input, /defenseBuild/);
assert.match(input, /defenseWaves/);

const renderer = readFileSync("games/signal-bastion/src/renderer-canvas.js", "utf8");
assert.match(renderer, /draw\(snapshot/);
assert.doesNotMatch(renderer, /createRealtimeGame/);

const preset = readFileSync("games/signal-bastion/presets/default.js", "utf8");
assert.match(preset, /signalBastionDefaultPreset/);
assert.match(preset, /waves/);

console.log("signal-bastion static smoke passed");

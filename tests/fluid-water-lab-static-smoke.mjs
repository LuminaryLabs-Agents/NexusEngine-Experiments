import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const htmlPath = join(root, "experiments", "fluid-water-lab", "index.html");
const mainPath = join(root, "experiments", "fluid-water-lab", "src", "main.js");

assert.ok(existsSync(htmlPath), "fluid-water-lab should expose index.html");
assert.ok(existsSync(mainPath), "fluid-water-lab should expose src/main.js");

const html = readFileSync(htmlPath, "utf8");
const main = readFileSync(mainPath, "utf8");

assert.match(html, /<main\b/i, "experiment should use a semantic main host");
assert.match(html, /<canvas\b/i, "experiment should include a canvas host");
assert.match(main, /window\.GameHost/, "experiment should expose GameHost for state-first debugging");

for (const kit of [
  "fluid-field-kit",
  "fluid-motion-kit",
  "fluid-shading-kit",
  "fluid-effects-kit",
  "water-data-kit",
  "water-stream-kit",
  "water-surface-kit",
  "water-mesh-kit",
  "water-shading-kit",
  "water-physics-kit",
  "water-behavior-kit",
  "water-effects-kit",
  "water-audio-kit",
  "water-mode-kit"
]) {
  assert.ok(main.includes(`/protokits/${kit}/index.js`), `main.js should import ${kit}`);
}

console.log("Fluid Water Lab static smoke passed.");

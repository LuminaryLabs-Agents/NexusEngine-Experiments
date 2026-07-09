import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createZombieOrchardAntiserumWellhouseReadinessDomainKit } from "../experiments/zombie-orchard/src/antiserum-wellhouse-readiness-kits.js";

const indexHtml = readFileSync(new URL("../experiments/zombie-orchard/index.html", import.meta.url), "utf8");
const entrySource = readFileSync(new URL("../experiments/zombie-orchard/src/antiserum-wellhouse-readiness-entry.js", import.meta.url), "utf8");
const kitSource = readFileSync(new URL("../experiments/zombie-orchard/src/antiserum-wellhouse-readiness-kits.js", import.meta.url), "utf8");

assert.ok(indexHtml.includes("antiserum-wellhouse-readiness-renderer-handoff-pass"));
assert.ok(indexHtml.includes("antiserum-wellhouse-readiness-entry.js"));
assert.ok(entrySource.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"));
assert.ok(!entrySource.includes("NexusRealtime@"));
assert.ok(entrySource.includes("getZombieOrchardAntiserumWellhouseReadiness"));
assert.ok(entrySource.includes("getRendererHandoff"));
assert.ok(!/document\.|window\.|globalThis\.|setTimeout|requestAnimationFrame|canvas|getContext|addEventListener/.test(kitSource), "reusable kit source stays renderer/input/browser neutral");

const domain = createZombieOrchardAntiserumWellhouseReadinessDomainKit({ seed: "antiserum-cdn-smoke" });
const scores = [];
for (let index = 0; index < 10; index += 1) {
  const result = domain.compose({
    seed: `antiserum-cdn-case-${index}`,
    action: ["boot", "forage", "distill", "triage", "sample", "brew", "load", "courier", "ledger", "distribute"][index],
    appleCount: index + 3,
    herbBundles: index + 1,
    vials: index,
    waterUnits: 1 + index,
    health01: 0.72,
    stamina01: Math.min(1, 0.44 + index * 0.06),
    pressure01: Math.max(0.12, 0.62 - index * 0.04),
    infection01: Math.max(0.08, 0.58 - index * 0.035),
    survivors: Array.from({ length: 2 + (index % 3) }, (_, survivorIndex) => ({ position: { x: survivorIndex * 3, y: 0, z: index + survivorIndex } })),
    monsters: Array.from({ length: Math.max(1, 6 - Math.floor(index / 2)) }, (_, monsterIndex) => ({ position: { x: -monsterIndex * 2, y: 0, z: monsterIndex * 3 } })),
    simulatedInput: { dodge: index % 2 === 1 }
  });
  scores.push(result.summary.readinessScore);
  assert.equal(result.rendererHandoff.descriptorPolicy, "renderer-consumes-descriptors-only", `descriptor-only for step ${index}`);
  assert.ok(result.rendererHandoff.counts.total >= 17, `descriptor count for step ${index}`);
  assert.ok(result.summary.topPriority.length > 6, `top priority for step ${index}`);
}

assert.ok(scores.at(-1) > scores[0], "state/input progression improves antiserum wellhouse readiness");
console.log("Zombie Orchard antiserum wellhouse CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");

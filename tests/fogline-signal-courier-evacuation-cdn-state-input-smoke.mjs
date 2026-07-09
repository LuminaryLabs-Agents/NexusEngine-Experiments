import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createFoglineSignalCourierEvacuationReadinessDomainKit } from "../experiments/fogline-relay/src/fogline-signal-courier-evacuation-readiness-kits.js";

const root = process.cwd();
const routePath = path.join(root, "experiments/fogline-relay/index.html");
const entryPath = path.join(root, "experiments/fogline-relay/src/fogline-signal-courier-evacuation-readiness-entry.js");
const kitPath = path.join(root, "experiments/fogline-relay/src/fogline-signal-courier-evacuation-readiness-kits.js");
const routeHtml = fs.readFileSync(routePath, "utf8");
const entrySource = fs.readFileSync(entryPath, "utf8");
const kitSource = fs.readFileSync(kitPath, "utf8");
const requiredCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";

assert.ok(routeHtml.includes("signal-courier-evacuation-readiness-renderer-handoff-pass"), "route advertises signal courier pass");
assert.ok(routeHtml.includes("fogline-signal-courier-evacuation-readiness-entry.js?v=fogline-signal-courier-evacuation-readiness-1"), "route loads cache-busted entry");
assert.ok(entrySource.includes(requiredCdn), "entry pulls NexusEngine main CDN");
assert.ok(!entrySource.includes("NexusRealtime@"), "changed entry does not import old NexusRealtime runtime");
assert.ok(!routeHtml.includes("nexus-realtime-page-loader"), "changed route no longer imports old NexusRealtime page loader");
for (const forbidden of ["createElement(", "querySelector(", "requestAnimationFrame", "new THREE", "getContext(\"webgl", "Audio(", "addEventListener("]) {
  assert.ok(!kitSource.includes(forbidden), `reusable kit excludes ${forbidden}`);
}

const kit = createFoglineSignalCourierEvacuationReadinessDomainKit();
const host = {
  state: { level: { bounds: { minZ: -8, maxZ: 62 } }, game: { player: { z: -8 }, fogPressure: 0.7 } },
  getState() { return this.state; },
  getRendererHandoff() { return { id: "base", descriptors: [{ id: "base-fog" }], descriptorCount: 1, counts: { base: 1 } }; }
};
function applyInput(input) {
  host.state = {
    ...host.state,
    game: {
      ...host.state.game,
      player: { ...host.state.game.player, z: Number(host.state.game.player.z ?? 0) + Number(input.forward ?? 0) * 7, scan: Boolean(input.scan) },
      scans: Number(host.state.game.scans ?? 0) + (input.scan ? 1 : 0),
      deliveredNotes: Number(host.state.game.deliveredNotes ?? 0) + (input.deliver ? 1 : 0),
      markedRoutes: Number(host.state.game.markedRoutes ?? 0) + (input.mark ? 1 : 0),
      stretcherCaches: Number(host.state.game.stretcherCaches ?? 0) + (input.cache ? 1 : 0),
      escorts: Number(host.state.game.escorts ?? 0) + (input.escort ? 1 : 0),
      focus: input.focus ?? host.state.game.focus
    }
  };
  return kit.describe({ level: host.state.level, game: host.state.game, time: input.time ?? 0 });
}

const cases = [
  { forward: 0, time: 0 },
  { forward: 1, scan: true, mark: true, time: 1 },
  { forward: 1, deliver: true, focus: "courier", time: 2 },
  { forward: 1, cache: true, time: 3 },
  { forward: 1, escort: true, scan: true, time: 4 },
  { forward: 1, deliver: true, mark: true, time: 5 },
  { forward: 1, cache: true, escort: true, time: 6 },
  { forward: 1, deliver: true, scan: true, time: 7 },
  { forward: 1, mark: true, escort: true, time: 8 },
  { forward: 1, deliver: true, cache: true, escort: true, focus: "courier", time: 9 }
];

let previous = 0;
for (const input of cases) {
  const result = applyInput(input);
  assert.ok(result.rendererHandoff.descriptorCount >= 15, "descriptor handoff is populated");
  assert.ok(result.readiness >= 0 && result.readiness <= 1, "readiness bounded under input");
  previous = Math.max(previous, result.readiness);
}
const finalReadiness = kit.describe({ level: host.state.level, game: host.state.game, time: 10 }).readiness;
assert.ok(finalReadiness >= previous - 0.2, "state/input loop remains stable");
console.log("Fogline signal courier evacuation CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.");

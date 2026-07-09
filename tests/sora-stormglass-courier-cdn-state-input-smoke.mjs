import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createSoraStormglassCourierReadinessDomainKit } from "../experiments/_kits/sora-the-infinite/sora-stormglass-courier-domain-kits.js";

const CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const routeSource = await readFile(new URL("../experiments/sora-the-infinite/stormglass-courier.html", import.meta.url), "utf8");
const entrySource = await readFile(new URL("../experiments/sora-the-infinite/sora-stormglass-courier-entry.js", import.meta.url), "utf8");
const kitSource = await readFile(new URL("../experiments/_kits/sora-the-infinite/sora-stormglass-courier-domain-kits.js", import.meta.url), "utf8");

assert.match(routeSource, /stormglass-courier-readiness-renderer-handoff-pass/);
assert.match(routeSource, /sora-stormglass-courier-entry\.js/);
assert.ok(entrySource.includes(CDN), "entry must pull NexusEngine main CDN");
assert.equal(entrySource.includes("NexusRealtime@"), false, "changed entry must not import old NexusRealtime");
for (const method of ["getState", "applyInput", "tick", "restart", "getStormglassCourierReadiness", "getRendererHandoff"]) {
  assert.ok(entrySource.includes(method), `GameHost must expose ${method}`);
}
for (const forbiddenToken of ["document.", "window.", "requestAnimationFrame", "canvas.getContext", "THREE."]) {
  assert.equal(kitSource.includes(forbiddenToken), false, `kit source must not own ${forbiddenToken}`);
}

let cdnValidation = "source-wiring-only";
let tempDirectory = null;
try {
  const response = await fetch(CDN, { signal: AbortSignal.timeout(5000) });
  assert.ok(response.ok, `NexusEngine CDN responded ${response.status}`);
  const source = await response.text();
  assert.ok(source.length > 100, "NexusEngine CDN module has source content");
  tempDirectory = await mkdtemp(join(tmpdir(), "nexus-engine-cdn-"));
  const localModule = join(tempDirectory, "nexus-engine-main.mjs");
  await writeFile(localModule, source, "utf8");
  const runtime = await import(`file://${localModule}`);
  assert.ok(Object.keys(runtime).length > 0, "local CDN module exposes exports");
  cdnValidation = "downloaded-to-local-mjs-and-imported";
} catch (error) {
  assert.match(String(error?.message ?? error), /fetch|network|ENOTFOUND|EAI_AGAIN|responded|module|package|import|resolve|timeout|aborted/i);
} finally {
  if (tempDirectory) await rm(tempDirectory, { recursive: true, force: true });
}

const domain = createSoraStormglassCourierReadinessDomainKit();
let state = domain.createInitialState(741);
const actions = [
  { pitch: 1, dt: 1 / 60 },
  { pitch: -1, dt: 1 / 60 },
  { bank: -1, dt: 1 / 60 },
  { bank: 1, dt: 1 / 60 },
  { boost: true, dt: 1 / 60 },
  { brake: true, dt: 1 / 60 },
  { pitch: 0.5, bank: -0.5, dt: 1 / 30 },
  { pitch: -0.5, bank: 0.5, dt: 1 / 30 },
  { boost: true, pitch: 1, dt: 1 / 60 },
  { brake: true, pitch: -1, dt: 1 / 60 }
];
for (const action of actions) {
  state = domain.step({ state, input: action, dt: action.dt });
  const snapshot = domain.describe(state);
  assert.ok(snapshot.readiness >= 0 && snapshot.readiness <= 1);
  assert.ok(snapshot.summary.cargoIntegrity >= 0 && snapshot.summary.cargoIntegrity <= 1);
  assert.equal(snapshot.rendererHandoff.contract, "renderer consumes descriptors only");
}

const buoys = domain.describe(state).rendererHandoff.descriptors.signalBuoys;
for (const buoy of buoys) {
  state = domain.step({ state: { ...state, x: buoy.x, y: buoy.y, vx: 0.08, vy: 0 }, input: { brake: true }, dt: 1 / 240 });
}
state = domain.step({
  state: { ...state, x: 0.9, y: 0.68, vx: 0.07, vy: 0, collectedBuoyIds: buoys.map((buoy) => buoy.id) },
  input: { brake: true },
  dt: 1 / 240
});
const completed = domain.describe(state);
assert.equal(completed.summary.tunedSignals, 3);
assert.equal(completed.summary.delivered, true);
assert.equal(completed.phase, "delivered");
assert.ok(completed.rendererHandoff.descriptors.dawnCourierLedger[0].delivered);

console.log(`Sora stormglass courier CDN/state/input smoke passed 10 simulated cases; CDN validation: ${cdnValidation}.`);

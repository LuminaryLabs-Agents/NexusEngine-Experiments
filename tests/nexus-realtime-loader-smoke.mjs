import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  NexusRealtimeLoader,
  createNexusRealtimeBootTracker,
  loadNexusRealtimeExperiment
} from "../experiments/_shared/nexus-realtime-loader.js";

const tracker = createNexusRealtimeBootTracker({
  label: "Smoke Loader",
  steps: ["page", "nexus", "game", "start", "ready"]
});

await tracker.track("page", "Preparing page", async () => true);
await tracker.track("nexus", "Loading NexusRealtime", async () => ({ ok: true }));
const snapshot = tracker.snapshot();
assert.equal(snapshot.completed, 2, "tracker should count completed steps");
assert.ok(snapshot.elapsedMs >= 0, "tracker should report elapsed time");

const calls = [];
const host = await loadNexusRealtimeExperiment({
  title: "Smoke Experiment",
  nexusUrl: "nexus:mock",
  gameUrl: "game:mock",
  hideOverlay: true,
  globalObject: {},
  overlay: {
    attach() {},
    update() {},
    hide() {},
    fail(error) { throw error; }
  },
  importModule: async (url) => {
    calls.push(url);
    if (url === "nexus:mock") return { createRealtimeGame: () => ({}) };
    if (url === "game:mock") return {
      start: async ({ NexusRealtime, tracker: bootTracker }) => ({
        engine: NexusRealtime.createRealtimeGame(),
        boot: bootTracker.snapshot()
      })
    };
    throw new Error(`unexpected import ${url}`);
  }
});

assert.deepEqual(calls, ["nexus:mock", "game:mock"], "loader should import runtime then game");
assert.ok(host.engine, "loader should return a GameHost-like host");
assert.equal(typeof host.getBootState, "function", "host should expose boot state");
assert.equal(NexusRealtimeLoader.loadExperiment, loadNexusRealtimeExperiment, "namespace export should expose loader");

for (const route of [
  "experiments/next-ledge/index.html",
  "experiments/fogline-relay/index.html",
  "experiments/the-open-above/index.html",
  "experiments/zombie-orchard/index.html",
  "games/rogue-lite-hellscape-siege/index.html"
]) {
  const html = readFileSync(route, "utf8");
  const usesPageLoader = html.includes("nexus-realtime-page-loader.js");
  if (usesPageLoader) {
    assert.ok(html.includes("attachNexusRealtimePageLoader"), `${route} should attach Nexus Realtime Loader`);
  } else {
    assert.match(html, /<script[^>]+type=["']module["'][^>]+src=/, `${route} should expose a direct module entry when it does not use the shared loader`);
  }
}

const legacySoraHtml = readFileSync("experiments/sora-the-infinite/index.html", "utf8");
assert.ok(legacySoraHtml.includes("../the-open-above/"), "legacy Sora route should redirect to The Open Above");

console.log("Nexus Realtime Loader smoke passed.");

import "./fogline-blackout-recovery-readiness-kits-smoke.mjs";
import "./fogline-blackout-recovery-cdn-state-input-smoke.mjs";
import "./fogline-ridge-ambulance-readiness-kits-smoke.mjs";
import "./fogline-ridge-ambulance-cdn-state-input-smoke.mjs";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const mime = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"]
]);

function safePath(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split("?")[0])).replace(/^\.\.(\/|\\|$)/, "");
  return join(root, clean === "/" ? "index.html" : clean);
}

const urlsSource = await readFile(join(root, "experiments/fogline-relay/src/urls.js"), "utf8");
assert.ok(urlsSource.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"));
assert.ok(!urlsSource.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@0.0.1/src/index.js"));

const sessionSource = await readFile(join(root, "experiments/fogline-relay/src/session.js"), "utf8");
assert.ok(sessionSource.includes("createFoglineVisualFractalDomain"));
assert.ok(sessionSource.includes("foglineVisualFractal"));

const indexSource = await readFile(join(root, "experiments/fogline-relay/index.html"), "utf8");
assert.ok(indexSource.includes("blackout-recovery-readiness-renderer-handoff-pass"), "route should advertise blackout recovery upgrade");
assert.ok(indexSource.includes("blackout-recovery-readiness-entry.js?v=fogline-blackout-recovery-readiness-1"), "route should load blackout recovery entry");
assert.ok(indexSource.includes("ridge-ambulance-readiness-renderer-handoff-pass"), "route should advertise ridge ambulance upgrade");
assert.ok(indexSource.includes("ridge-ambulance-readiness-entry.js?v=fogline-ridge-ambulance-readiness-1"), "route should load ridge ambulance entry");

const blackoutEntrySource = await readFile(join(root, "experiments/fogline-relay/src/blackout-recovery-readiness-entry.js"), "utf8");
assert.ok(blackoutEntrySource.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"), "blackout entry should use NexusEngine main CDN");
assert.equal(blackoutEntrySource.includes("NexusRealtime@main"), false, "blackout entry should not import old NexusRealtime runtime CDN");
assert.ok(blackoutEntrySource.includes("getFoglineBlackoutRecoveryReadiness"), "blackout entry should expose GameHost readiness accessor");

const ridgeAmbulanceEntrySource = await readFile(join(root, "experiments/fogline-relay/src/ridge-ambulance-readiness-entry.js"), "utf8");
assert.ok(ridgeAmbulanceEntrySource.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"), "ridge ambulance entry should use NexusEngine main CDN");
assert.equal(ridgeAmbulanceEntrySource.includes("NexusRealtime@main"), false, "ridge ambulance entry should not import old NexusRealtime runtime CDN");
assert.ok(ridgeAmbulanceEntrySource.includes("getFoglineRidgeAmbulanceReadiness"), "ridge ambulance entry should expose GameHost readiness accessor");

const mainSource = await readFile(join(root, "experiments/fogline-relay/src/main.js"), "utf8");
assert.ok(mainSource.includes("getRendererHandoff"), "GameHost should expose renderer handoff descriptors");

const server = createServer(async (request, response) => {
  try {
    const filePath = safePath(request.url ?? "/");
    const body = await readFile(filePath);
    response.writeHead(200, { "content-type": mime.get(extname(filePath)) ?? "application/octet-stream" });
    response.end(body);
  } catch {
    response.writeHead(404, { "content-type": "text/plain" });
    response.end("not found");
  }
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();
const baseUrl = `http://127.0.0.1:${port}`;
let browser;

try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`${baseUrl}/experiments/fogline-relay/`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Boolean(globalThis.GameHost?.getState), null, { timeout: 15000 });
  await page.waitForFunction(() => Boolean(globalThis.GameHost?.getFoglineRidgeAmbulanceReadiness), null, { timeout: 15000 });
  await page.keyboard.press("KeyW");
  await page.keyboard.press("KeyE");
  await page.keyboard.press("ArrowRight");

  const state = await page.evaluate(() => {
    globalThis.GameHost.loop.stop();
    globalThis.GameHost.engine.foglineRelay.input({ moveX: 0.15, moveZ: 1, turn: 0.04, pitch: -0.01, scan: true });
    globalThis.GameHost.session.prepareFrame();
    globalThis.GameHost.engine.tick(1 / 30);
    return {
      snapshot: globalThis.GameHost.session.snapshot(),
      handoff: globalThis.GameHost.getRendererHandoff(),
      ridgeAmbulance: globalThis.GameHost.getFoglineRidgeAmbulanceReadiness()
    };
  });

  const snapshot = state.snapshot;
  assert.ok(snapshot.game?.player, "Fogline state should expose player state");
  assert.ok(snapshot.game.player.z > -4, "direct input should move player forward from spawn");
  assert.ok(snapshot.visualFractal, "snapshot should expose visual fractal descriptors");
  assert.ok(snapshot.domain?.foglineVisualFractal, "domain snapshot should expose visual fractal descriptors");
  assert.ok(Array.isArray(snapshot.visualFractal.routeThreads));
  assert.ok(Array.isArray(snapshot.visualFractal.groundMottles));
  assert.ok(Array.isArray(snapshot.visualFractal.relayAuras));
  assert.ok(Array.isArray(snapshot.visualFractal.wraithEchoes));
  assert.ok(Array.isArray(snapshot.visualFractal.gateSigils));
  assert.ok(Array.isArray(snapshot.visualFractal.canopyShafts));
  assert.ok(Array.isArray(snapshot.visualFractal.scanCones));
  assert.ok(Array.isArray(snapshot.visualFractal.objectiveNeedles));
  assert.ok(Array.isArray(snapshot.visualFractal.memoryBreadcrumbs));
  assert.ok(Array.isArray(snapshot.visualFractal.pressureVignettes));
  assert.ok(Array.isArray(snapshot.visualFractal.safePockets));
  assert.ok(snapshot.visualFractal.rendererHandoff?.policy === "renderer-consumes-descriptors-only");
  assert.equal(state.ridgeAmbulance?.rendererHandoff?.policy, "renderer-consumes-descriptors-only", "ridge ambulance should expose descriptor-only handoff");
  assert.ok(state.ridgeAmbulance?.drawOrder?.length > 0, "ridge ambulance should emit descriptors");
  assert.ok(state.handoff?.ridgeAmbulanceDescriptorCount >= state.ridgeAmbulance.drawOrder.length, "GameHost handoff should compose ridge ambulance descriptors");
  assert.ok(state.handoff?.descriptorCount >= snapshot.visualFractal.drawOrder.length, "GameHost handoff should mirror descriptor queue");
  assert.ok(snapshot.visualFractal.drawOrder.length >= 40, "descriptor handoff should contain a rich render queue");
  assert.ok(snapshot.visualFractal.drawOrder.every((entry) => entry.id && entry.archetype && entry.position), "each descriptor should be renderer-consumable");
  console.log("Fogline Relay NexusEngine CDN-backed Playwright state input smoke passed");
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

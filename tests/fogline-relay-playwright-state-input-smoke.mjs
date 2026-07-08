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
  await page.keyboard.press("KeyW");
  await page.keyboard.press("KeyE");
  await page.keyboard.press("ArrowRight");

  const state = await page.evaluate(() => {
    globalThis.GameHost.loop.stop();
    globalThis.GameHost.engine.foglineRelay.input({ moveX: 0.15, moveZ: 1, turn: 0.04, pitch: -0.01, scan: true });
    globalThis.GameHost.session.prepareFrame();
    globalThis.GameHost.engine.tick(1 / 30);
    return globalThis.GameHost.session.snapshot();
  });

  assert.ok(state.game?.player, "Fogline state should expose player state");
  assert.ok(state.game.player.z > -4, "direct input should move player forward from spawn");
  assert.ok(state.visualFractal, "snapshot should expose visual fractal descriptors");
  assert.ok(state.domain?.foglineVisualFractal, "domain snapshot should expose visual fractal descriptors");
  assert.ok(Array.isArray(state.visualFractal.routeThreads));
  assert.ok(Array.isArray(state.visualFractal.groundMottles));
  assert.ok(Array.isArray(state.visualFractal.relayAuras));
  assert.ok(Array.isArray(state.visualFractal.wraithEchoes));
  assert.ok(Array.isArray(state.visualFractal.gateSigils));
  assert.ok(Array.isArray(state.visualFractal.canopyShafts));
  assert.ok(state.visualFractal.drawOrder.length >= 30, "descriptor handoff should contain a rich render queue");
  assert.ok(state.visualFractal.drawOrder.every((entry) => entry.id && entry.archetype && entry.position), "each descriptor should be renderer-consumable");
  console.log("Fogline Relay NexusEngine CDN-backed Playwright state input smoke passed");
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

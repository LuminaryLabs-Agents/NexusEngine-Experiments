import "./zombie-orchard-cure-crafting-readiness-kits-smoke.mjs";
import "./zombie-orchard-cure-crafting-cdn-state-input-smoke.mjs";
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

const kitStackSource = await readFile(join(root, "experiments/zombie-orchard/src/kit-stack.js"), "utf8");
assert.ok(kitStackSource.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"));
assert.ok(!kitStackSource.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js"));
assert.ok(kitStackSource.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.1/protokits/generic-survival-domain-kits/index.js"));

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
  await page.goto(`${baseUrl}/experiments/zombie-orchard/`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Boolean(globalThis.GameHost?.getState), null, { timeout: 15000 });
  await page.waitForFunction(() => Boolean(globalThis.GameHost?.getZombieOrchardCureCraftingReadiness), null, { timeout: 15000 });
  await page.keyboard.press("KeyW");
  await page.keyboard.press("KeyE");
  await page.keyboard.press("KeyJ");
  await page.keyboard.press("Digit1");
  const state = await page.evaluate(() => {
    globalThis.GameHost.tick(1 / 30, {
      moveX: 0.25,
      moveZ: -1,
      sprint: true,
      dash: false,
      interact: true,
      useGear: true,
      swapSlot: 0
    });
    return {
      state: globalThis.GameHost.getState(),
      cure: globalThis.GameHost.getZombieOrchardCureCraftingReadiness(),
      handoff: globalThis.GameHost.getRendererHandoff(),
      marker: document.documentElement.dataset.zombieCureCraftingReadiness
    };
  });

  assert.ok(state.state.player?.position);
  assert.ok(state.state.visualDomains?.lighting);
  assert.ok(state.state.visualDomains?.ground);
  assert.ok(Array.isArray(state.state.visualDomains?.ground?.furrows));
  assert.ok(Array.isArray(state.state.visualDomains?.ground?.leafPatches));
  assert.ok(Array.isArray(state.state.visualDomains?.ground?.mudPatches));
  assert.ok(Array.isArray(state.state.visualDomains?.trees));
  assert.ok(Array.isArray(state.state.visualDomains?.lanes));
  assert.ok(Array.isArray(state.state.visualDomains?.fogRibbons));
  assert.ok(Array.isArray(state.state.visualDomains?.hauntZones));
  assert.ok(Array.isArray(state.state.visualDomains?.pickups));
  assert.ok(Array.isArray(state.state.visualDomains?.apples));
  assert.ok(Array.isArray(state.state.visualDomains?.threats));
  assert.ok(state.state.visualDomains?.combatCue?.playerRing);
  assert.ok(state.state.visualDomains.lighting.fogDensity > 0);
  assert.ok(state.state.stamina01 >= 0 && state.state.stamina01 <= 1);
  assert.equal(state.marker, "active");
  assert.ok(Array.isArray(state.cure.rendererHandoff.descriptors.infectedRootSamples));
  assert.ok(Array.isArray(state.cure.rendererHandoff.descriptors.antidotePressQueues));
  assert.ok(Array.isArray(state.cure.rendererHandoff.descriptors.sapDistillerNodes));
  assert.ok(Array.isArray(state.cure.rendererHandoff.descriptors.barricadeGraftPlans));
  assert.ok(Array.isArray(state.cure.rendererHandoff.descriptors.survivorSignalGlyphs));
  assert.ok(Array.isArray(state.cure.rendererHandoff.descriptors.dawnCureRitualWindows));
  assert.ok(state.handoff.cureCraftingDescriptorCount >= 6);
  console.log("zombie orchard NexusEngine CDN-backed Playwright state input smoke passed");
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

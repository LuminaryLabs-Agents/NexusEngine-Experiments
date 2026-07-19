import "./zombie-orchard-cure-crafting-readiness-kits-smoke.mjs";
import "./zombie-orchard-cure-crafting-cdn-state-input-smoke.mjs";
import "./zombie-orchard-safehouse-evacuation-readiness-kits-smoke.mjs";
import "./zombie-orchard-safehouse-evacuation-cdn-state-input-smoke.mjs";
import "./zombie-orchard-well-restoration-readiness-kits-smoke.mjs";
import "./zombie-orchard-well-restoration-cdn-state-input-smoke.mjs";
import "./zombie-orchard-seed-bank-quarantine-readiness-kits-smoke.mjs";
import "./zombie-orchard-seed-bank-quarantine-cdn-state-input-smoke.mjs";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const CORE_CDN_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const SURVIVAL_KITS_CDN_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.1/protokits/generic-survival-domain-kits/index.js";
const ZOMBIE_KITS_CDN_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusEngine-ProtoKits@zombie-orchard-protokits/protokits/zombie-orchard/index.js";
const mime = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"]
]);

function safePath(urlPath) {
  const pathname = decodeURIComponent(urlPath.split("?")[0]);
  const clean = normalize(pathname).replace(/^\.\.(\/|\\|$)/, "").replace(/^[/\\]+/, "");
  const filePath = join(root, clean || "index.html");
  return pathname.endsWith("/") ? join(filePath, "index.html") : filePath;
}

const kitStackSource = await readFile(join(root, "experiments/zombie-orchard/src/kit-stack.js"), "utf8");
assert.ok(kitStackSource.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"));
assert.ok(!kitStackSource.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js"));
assert.ok(kitStackSource.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.1/protokits/generic-survival-domain-kits/index.js"));

const server = createServer(async (request, response) => {
  try {
    const filePath = safePath(request.url ?? "/");
    const contentType = mime.get(extname(filePath)) ?? "application/octet-stream";
    let body = await readFile(filePath);
    if (contentType.startsWith("text/") || contentType.includes("javascript")) {
      body = body
        .toString("utf8")
        .replaceAll(CORE_CDN_URL, "/node_modules/nexusrealtime/src/index.js")
        .replaceAll(SURVIVAL_KITS_CDN_URL, "/node_modules/@luminarylabs/nexusrealtime-protokits/protokits/generic-survival-domain-kits/index.js")
        .replaceAll(ZOMBIE_KITS_CDN_URL, "/node_modules/@luminarylabs/nexusrealtime-protokits/protokits/zombie-orchard/index.js");
    }
    response.writeHead(200, { "content-type": contentType });
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
  const browserErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => browserErrors.push(`pageerror: ${error.message}`));
  page.on("response", (response) => {
    if (response.status() >= 400) browserErrors.push(`http ${response.status()}: ${response.url()}`);
  });
  await page.goto(`${baseUrl}/experiments/zombie-orchard/`, { waitUntil: "domcontentloaded" });
  try {
    await page.waitForFunction(() => Boolean(globalThis.GameHost?.getState), null, { timeout: 15000 });
  } catch (error) {
    throw new Error(`Zombie Orchard did not initialize: ${browserErrors.join(" | ") || error.message}`);
  }
  try {
    await page.waitForFunction(() => Boolean(globalThis.GameHost?.getZombieOrchardCureCraftingReadiness), null, { timeout: 15000 });
    await page.waitForFunction(() => Boolean(globalThis.GameHost?.getZombieOrchardSafehouseEvacuationReadiness), null, { timeout: 15000 });
    await page.waitForFunction(() => Boolean(globalThis.GameHost?.getZombieOrchardWellRestorationReadiness), null, { timeout: 15000 });
    await page.waitForFunction(() => Boolean(globalThis.GameHost?.getZombieOrchardSeedBankQuarantineReadiness), null, { timeout: 15000 });
  } catch (error) {
    const accessors = await page.evaluate(() => Object.keys(globalThis.GameHost ?? {}).filter((key) => key.includes("Readiness")));
    throw new Error(`Zombie Orchard readiness overlays did not initialize (${accessors.join(", ") || "none"}): ${browserErrors.join(" | ") || error.message}`);
  }
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
      safehouse: globalThis.GameHost.getZombieOrchardSafehouseEvacuationReadiness(),
      well: globalThis.GameHost.getZombieOrchardWellRestorationReadiness(),
      seedBank: globalThis.GameHost.getZombieOrchardSeedBankQuarantineReadiness(),
      handoff: globalThis.GameHost.getRendererHandoff(),
      marker: document.documentElement.dataset.zombieCureCraftingReadiness,
      safehouseMarker: document.documentElement.dataset.zombieSafehouseEvacuationReadiness,
      wellMarker: document.documentElement.dataset.zombieWellRestorationReadiness,
      seedBankMarker: document.documentElement.dataset.zombieSeedBankQuarantineReadiness
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
  assert.equal(state.safehouseMarker, "active");
  assert.equal(state.wellMarker, "active");
  assert.equal(state.seedBankMarker, "active");
  assert.ok(Array.isArray(state.cure.rendererHandoff.descriptors.infectedRootSamples));
  assert.ok(Array.isArray(state.cure.rendererHandoff.descriptors.antidotePressQueues));
  assert.ok(Array.isArray(state.cure.rendererHandoff.descriptors.sapDistillerNodes));
  assert.ok(Array.isArray(state.cure.rendererHandoff.descriptors.barricadeGraftPlans));
  assert.ok(Array.isArray(state.cure.rendererHandoff.descriptors.survivorSignalGlyphs));
  assert.ok(Array.isArray(state.cure.rendererHandoff.descriptors.dawnCureRitualWindows));
  assert.ok(Array.isArray(state.safehouse.rendererHandoff.descriptors.safehouseBeacons));
  assert.ok(Array.isArray(state.safehouse.rendererHandoff.descriptors.laneClearances));
  assert.ok(Array.isArray(state.safehouse.rendererHandoff.descriptors.barricadeReinforcements));
  assert.ok(Array.isArray(state.safehouse.rendererHandoff.descriptors.antidoteRunners));
  assert.ok(Array.isArray(state.safehouse.rendererHandoff.descriptors.dawnWagonRallies));
  assert.ok(Array.isArray(state.safehouse.rendererHandoff.descriptors.radioTowerSignals));
  assert.ok(Array.isArray(state.well.rendererHandoff.descriptors.wellPumpRepairs));
  assert.ok(Array.isArray(state.well.rendererHandoff.descriptors.bucketBrigadeRoutes));
  assert.ok(Array.isArray(state.well.rendererHandoff.descriptors.disinfectantStills));
  assert.ok(Array.isArray(state.well.rendererHandoff.descriptors.wellBarricadeLanterns));
  assert.ok(Array.isArray(state.well.rendererHandoff.descriptors.sprinklerMistGrids));
  assert.ok(Array.isArray(state.well.rendererHandoff.descriptors.dawnWaterRationLedgers));
  assert.ok(Array.isArray(state.seedBank.rendererHandoff.descriptors.heirloomSeedCaches));
  assert.ok(Array.isArray(state.seedBank.rendererHandoff.descriptors.graftScionRacks));
  assert.ok(Array.isArray(state.seedBank.rendererHandoff.descriptors.sporeFenceLanterns));
  assert.ok(Array.isArray(state.seedBank.rendererHandoff.descriptors.compostBurnPits));
  assert.ok(Array.isArray(state.seedBank.rendererHandoff.descriptors.rowReplantCharters));
  assert.ok(Array.isArray(state.seedBank.rendererHandoff.descriptors.dawnSeedLedgers));
  assert.ok(state.handoff.cureCraftingDescriptorCount >= 6);
  assert.ok(state.handoff.safehouseEvacuationDescriptorCount >= 14);
  assert.ok(state.handoff.wellRestorationDescriptorCount >= 15);
  assert.ok(state.handoff.seedBankQuarantineDescriptorCount >= 17);
  console.log("zombie orchard NexusEngine CDN-backed Playwright state input smoke passed");
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

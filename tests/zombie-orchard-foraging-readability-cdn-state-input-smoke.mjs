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
const sessionSource = await readFile(join(root, "experiments/zombie-orchard/src/session.js"), "utf8");
const kitSource = await readFile(join(root, "experiments/zombie-orchard/src/foraging-readability-kits.js"), "utf8");
const canvasSource = await readFile(join(root, "experiments/zombie-orchard/src/canvas-view.js"), "utf8");
const bootstrapSource = await readFile(join(root, "experiments/zombie-orchard/src/bootstrap.js"), "utf8");

assert.ok(kitStackSource.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"));
assert.ok(!kitStackSource.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js"));
assert.ok(sessionSource.includes("createZombieOrchardForagingReadabilityDomainKit"));
assert.ok(sessionSource.includes("zombieOrchardForagingReadability"));
assert.ok(sessionSource.includes("zombie-orchard-composed-renderer-handoff"));
assert.ok(kitSource.includes("renderer-consumes-descriptors-only"));
assert.ok(kitSource.includes("forbiddenOwners"));
assert.ok(canvasSource.includes("foragingReadability?.rendererHandoff?.descriptors"));
assert.ok(canvasSource.includes("safeHarvestPockets"));
assert.ok(canvasSource.includes("gearChoiceArcs"));
assert.ok(bootstrapSource.includes("getForagingReadability"));
assert.ok(bootstrapSource.includes("getRendererHandoff"));

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
  await page.goto(`${baseUrl}/experiments/zombie-orchard/`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Boolean(globalThis.GameHost?.getForagingReadability && globalThis.GameHost?.getRendererHandoff), null, { timeout: 15000 });

  const stateCases = Array.from({ length: 10 }, (_, index) => ({
    moveX: index % 2 ? 0.65 : -0.32,
    moveZ: index % 3 ? -0.8 : 0.45,
    sprint: index % 2 === 0,
    dash: index === 5,
    interact: index % 4 === 0,
    useGear: index % 3 === 0,
    nextRound: index === 2 || index === 7,
    swapSlot: index % 5 === 0 ? 0 : null
  }));

  const results = await page.evaluate((cases) => cases.map((input, index) => {
    const state = globalThis.GameHost.tick(1 / 30, input);
    const handoff = globalThis.GameHost.getRendererHandoff();
    const foraging = globalThis.GameHost.getForagingReadability();
    return {
      index,
      player: state.player,
      domain: state.domain,
      handoff,
      foraging,
      visualForaging: state.visualDomains?.foragingReadability,
      visualGround: state.visualDomains?.ground,
      visualPickups: state.visualDomains?.pickups,
      stamina01: state.stamina01,
      health01: state.health01
    };
  }), stateCases);

  assert.equal(results.length, 10);
  for (const result of results) {
    assert.ok(result.player?.position);
    assert.ok(result.domain?.zombieOrchardForagingReadability);
    assert.ok(result.visualForaging?.rendererHandoff);
    assert.equal(result.handoff?.policy, "renderer-consumes-descriptors-only");
    assert.ok(Array.isArray(result.handoff?.descriptors?.appleRarityHeat));
    assert.ok(Array.isArray(result.handoff?.descriptors?.gearChoiceArcs));
    assert.ok(Array.isArray(result.handoff?.descriptors?.harvestStreakTrails));
    assert.ok(Array.isArray(result.handoff?.descriptors?.safeHarvestPockets));
    assert.ok(Array.isArray(result.handoff?.descriptors?.rowMemoryBreadcrumbs));
    assert.ok(Array.isArray(result.handoff?.descriptors?.bossOmenBranches));
    assert.ok(result.handoff.descriptorCounts.harvestStreakTrails >= 2);
    assert.ok(result.foraging.rendererHandoff.ownership.forbiddenOwners.includes("renderer"));
    assert.ok(result.foraging.rendererHandoff.ownership.forbiddenOwners.includes("dom"));
    assert.ok(result.stamina01 >= 0 && result.stamina01 <= 1);
    assert.ok(result.health01 >= 0 && result.health01 <= 1);
    assert.ok(Array.isArray(result.visualGround?.leafPatches));
    assert.ok(Array.isArray(result.visualGround?.mudPatches));
    assert.ok(Array.isArray(result.visualPickups));
  }

  console.log("zombie orchard foraging readability CDN state-input smoke passed");
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

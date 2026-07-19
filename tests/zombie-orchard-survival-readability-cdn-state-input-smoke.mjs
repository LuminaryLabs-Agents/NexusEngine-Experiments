import "./zombie-orchard-foraging-readability-cdn-state-input-smoke.mjs";
import "./zombie-orchard-horde-pathing-cdn-state-input-smoke.mjs";
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
const kitSource = await readFile(join(root, "experiments/zombie-orchard/src/survival-readability-kits.js"), "utf8");
const canvasSource = await readFile(join(root, "experiments/zombie-orchard/src/canvas-view.js"), "utf8");
const bootstrapSource = await readFile(join(root, "experiments/zombie-orchard/src/bootstrap.js"), "utf8");
const hordeEntrySource = await readFile(join(root, "experiments/zombie-orchard/src/horde-pathing-readiness-entry.js"), "utf8");

assert.ok(kitStackSource.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"));
assert.ok(!kitStackSource.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js"));
assert.ok(sessionSource.includes("createZombieOrchardSurvivalReadabilityDomainKit"));
assert.ok(sessionSource.includes("domain: {"));
assert.ok(sessionSource.includes("zombieOrchardSurvivalReadability"));
assert.ok(kitSource.includes("renderer-consumes-descriptors-only"));
assert.ok(kitSource.includes("forbiddenOwners"));
assert.ok(canvasSource.includes("survivalReadability?.rendererHandoff?.descriptors"));
assert.ok(bootstrapSource.includes("getRendererHandoff"));
assert.ok(hordeEntrySource.includes("getHordePathingReadiness"));
assert.ok(hordeEntrySource.includes("zombie-orchard-composed-horde-pathing-renderer-handoff"));

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
  await page.waitForFunction(() => Boolean(
    globalThis.GameHost?.tick
    && globalThis.GameHost?.getRendererHandoff
    && globalThis.GameHost?.getSurvivalReadability
    && globalThis.GameHost?.getHordePathingReadiness
  ), null, { timeout: 15000 });

  const stateCases = Array.from({ length: 10 }, (_, index) => ({
    moveX: index % 2 ? 0.5 : -0.25,
    moveZ: index % 3 ? -1 : 0.5,
    sprint: index % 2 === 0,
    dash: index === 6,
    interact: index % 4 === 0,
    useGear: index % 3 === 0,
    nextRound: index === 2 || index === 7,
    swapSlot: index % 5 === 0 ? 0 : null
  }));

  const results = await page.evaluate((cases) => cases.map((input, index) => {
    const state = globalThis.GameHost.tick(1 / 30, input);
    const handoff = globalThis.GameHost.getRendererHandoff();
    const readability = globalThis.GameHost.getSurvivalReadability();
    const hordePathing = globalThis.GameHost.getHordePathingReadiness();
    return {
      index,
      player: state.player,
      domain: state.domain,
      handoff,
      readability,
      hordePathing,
      visualReadability: state.visualDomains?.survivalReadability,
      stamina01: state.stamina01,
      health01: state.health01
    };
  }), stateCases);

  assert.equal(results.length, 10);
  for (const result of results) {
    assert.ok(result.player?.position);
    assert.ok(result.domain?.zombieOrchardSurvivalReadability);
    assert.ok(result.visualReadability?.rendererHandoff);
    assert.equal(result.handoff?.policy, "renderer-consumes-descriptors-only");
    assert.ok(Array.isArray(result.handoff?.descriptors?.threatGradients));
    assert.ok(Array.isArray(result.handoff?.descriptors?.resourceRoutes));
    assert.ok(Array.isArray(result.handoff?.descriptors?.staminaBreath));
    assert.ok(Array.isArray(result.handoff?.descriptors?.roundPressureBands));
    assert.ok(Array.isArray(result.handoff?.descriptors?.escapeLanes));
    assert.ok(Array.isArray(result.handoff?.descriptors?.meleeWindows));
    assert.ok(Array.isArray(result.handoff?.descriptors?.spawnLaneForecasts));
    assert.ok(Array.isArray(result.handoff?.descriptors?.chokeRowPriorities));
    assert.ok(Array.isArray(result.handoff?.descriptors?.panicRetreatThreads));
    assert.equal(result.handoff.descriptorCounts.staminaBreath, 1);
    assert.equal(result.handoff.descriptorCounts.roundPressureBands, 1);
    assert.equal(result.hordePathing.rendererHandoff.policy, "renderer-consumes-descriptors-only");
    assert.ok(result.hordePathing.summary.descriptorCount >= 6);
    assert.ok(result.readability.rendererHandoff.ownership.forbiddenOwners.includes("renderer"));
    assert.ok(result.readability.rendererHandoff.ownership.forbiddenOwners.includes("browser-input"));
    assert.ok(result.stamina01 >= 0 && result.stamina01 <= 1);
    assert.ok(result.health01 >= 0 && result.health01 <= 1);
  }

  console.log("zombie orchard survival readability CDN state-input smoke passed plus foraging and horde pathing imports");
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

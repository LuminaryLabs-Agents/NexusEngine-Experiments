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
const sessionSource = await readFile(join(root, "experiments/zombie-orchard/src/session.js"), "utf8");
const kitSource = await readFile(join(root, "experiments/zombie-orchard/src/survival-readability-kits.js"), "utf8");
const canvasSource = await readFile(join(root, "experiments/zombie-orchard/src/canvas-view.js"), "utf8");
const bootstrapSource = await readFile(join(root, "experiments/zombie-orchard/src/bootstrap.js"), "utf8");

assert.ok(kitStackSource.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"));
assert.ok(!kitStackSource.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js"));
assert.ok(sessionSource.includes("createZombieOrchardSurvivalReadabilityDomainKit"));
assert.ok(sessionSource.includes("domain: { zombieOrchardSurvivalReadability: survivalReadability }"));
assert.ok(kitSource.includes("renderer-consumes-descriptors-only"));
assert.ok(kitSource.includes("forbiddenOwners"));
assert.ok(canvasSource.includes("survivalReadability?.rendererHandoff?.descriptors"));
assert.ok(bootstrapSource.includes("getRendererHandoff"));

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
  await page.waitForFunction(() => Boolean(globalThis.GameHost?.getRendererHandoff), null, { timeout: 15000 });

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
    return {
      index,
      player: state.player,
      domain: state.domain,
      handoff,
      readability,
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
    assert.equal(result.handoff.descriptorCounts.staminaBreath, 1);
    assert.equal(result.handoff.descriptorCounts.roundPressureBands, 1);
    assert.ok(result.handoff.ownership.forbiddenOwners.includes("renderer"));
    assert.ok(result.handoff.ownership.forbiddenOwners.includes("browser-input"));
    assert.ok(result.stamina01 >= 0 && result.stamina01 <= 1);
    assert.ok(result.health01 >= 0 && result.health01 <= 1);
  }

  console.log("zombie orchard survival readability CDN state-input smoke passed");
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

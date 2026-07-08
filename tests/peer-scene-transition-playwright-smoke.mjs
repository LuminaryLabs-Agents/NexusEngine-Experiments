import "./peer-scene-transition-oracle-readability-handoff-smoke.mjs";
import "./peer-scene-transition-oracle-readability-cdn-state-input-smoke.mjs";
import "./peer-scene-transition-clue-pressure-kits-smoke.mjs";
import "./peer-scene-transition-clue-pressure-cdn-state-input-smoke.mjs";
import "./peer-scene-evidence-ritual-readiness-kits-smoke.mjs";
import "./peer-scene-evidence-ritual-cdn-state-input-smoke.mjs";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const nexusEngineCdn = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
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

const source = await readFile(join(root, "experiments/peer-scene-transition/shared/scene-demo.js"), "utf8");
const oracleEntry = await readFile(join(root, "experiments/peer-scene-transition/shared/scene-oracle-readability-entry.js"), "utf8");
const clueEntry = await readFile(join(root, "experiments/peer-scene-transition/shared/scene-clue-pressure-readiness-entry.js"), "utf8");
const evidenceEntry = await readFile(join(root, "experiments/peer-scene-transition/shared/scene-evidence-ritual-readiness-entry.js"), "utf8");
assert.ok(source.includes(nexusEngineCdn), "changed experiment pulls NexusEngine main via CDN");
assert.ok(source.includes("createSceneAtmosphericHandoffKit"), "changed experiment wires the atmospheric descriptor handoff");
assert.ok(!source.includes("NexusRealtime"), "changed peer scene browser host avoids old NexusRealtime import");
assert.ok(oracleEntry.includes(nexusEngineCdn), "oracle readability entry pulls NexusEngine main via CDN");
assert.ok(oracleEntry.includes("createSceneOracleReadabilityDomainKit"), "oracle readability entry wires the descriptor kit");
assert.ok(!oracleEntry.includes("LuminaryLabs-Dev/NexusRealtime@main/src/index.js"), "oracle readability entry avoids old runtime CDN");
assert.ok(clueEntry.includes(nexusEngineCdn), "clue pressure entry pulls NexusEngine main via CDN");
assert.ok(clueEntry.includes("createSceneCluePressureReadinessDomainKit"), "clue pressure entry wires the descriptor kit");
assert.ok(!clueEntry.includes("LuminaryLabs-Dev/NexusRealtime@main/src/index.js"), "clue pressure entry avoids old runtime CDN");
assert.ok(evidenceEntry.includes(nexusEngineCdn), "evidence ritual entry pulls NexusEngine main via CDN");
assert.ok(evidenceEntry.includes("createSceneEvidenceRitualReadinessDomainKit"), "evidence ritual entry wires the descriptor kit");
assert.ok(!evidenceEntry.includes("LuminaryLabs-Dev/NexusRealtime@main/src/index.js"), "evidence ritual entry avoids old runtime CDN");

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
  await page.goto(`${baseUrl}/experiments/peer-scene-transition/camp.html`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => Boolean(globalThis.GameHost?.getOracleReadabilityDomain && globalThis.GameHost?.getCluePressureReadinessDomain && globalThis.GameHost?.getEvidenceRitualReadinessDomain));
  assert.equal(await page.evaluate(() => globalThis.GameHost.nexusEngineCdn), nexusEngineCdn);
  assert.ok(await page.evaluate(() => globalThis.GameHost.nexusEngineExportCount >= 0));
  assert.equal(await page.evaluate(() => globalThis.GameHost.evidenceRitualNexusEngineCdn), nexusEngineCdn);
  let state = await page.evaluate(() => globalThis.GameHost.getState());
  assert.equal(state.currentScene, "camp");
  let handoff = await page.evaluate(() => globalThis.GameHost.getRendererHandoff());
  let atmosphere = await page.evaluate(() => globalThis.GameHost.getAtmosphericHandoff());
  let oracle = await page.evaluate(() => globalThis.GameHost.getOracleReadabilityDomain());
  let cluePressure = await page.evaluate(() => globalThis.GameHost.getCluePressureReadinessDomain());
  let evidenceRitual = await page.evaluate(() => globalThis.GameHost.getEvidenceRitualReadinessDomain());
  assert.equal(handoff.routeNodes, 6);
  assert.equal(handoff.ambientParticles, 9);
  assert.equal(handoff.constellationStars, 5);
  assert.equal(handoff.depthFogBands, 6);
  assert.equal(handoff.lightRays, 5);
  assert.ok(handoff.oracleReadability.objectiveForecastThreads >= 1);
  assert.equal(handoff.oracleReadability.pressureClockRings, 4);
  assert.ok(handoff.cluePressureReadiness.clueVisibilityLanterns >= 5);
  assert.ok(handoff.cluePressureReadiness.resolutionRouteLocks >= 1);
  assert.equal(handoff.evidenceRitualReadiness.witnessStatementWebs, 6);
  assert.equal(handoff.evidenceRitualReadiness.ritualSequenceRunes, 6);
  assert.equal(handoff.evidenceRitualReadiness.verdictDoorReadiness, 1);
  assert.equal(atmosphere.kitCount, 5);
  assert.equal(atmosphere.depthFogBands, 6);
  assert.equal(oracle.kitCount, 7);
  assert.equal(oracle.pressureClock.rings, 4);
  assert.equal(cluePressure.kitCount, 7);
  assert.ok(cluePressure.clueVisibility.lanterns >= 5);
  assert.equal(evidenceRitual.kitCount, 8);
  assert.equal(evidenceRitual.witnessStatementWebs, 6);
  assert.equal(evidenceRitual.doubtPressureDials, 4);
  assert.ok(evidenceRitual.verdictReadiness >= 0);
  assert.equal(await page.evaluate(() => document.body.dataset.sceneAtmosphere), "opening");
  assert.equal(await page.evaluate(() => document.body.dataset.sceneOracle), "enabled");
  assert.equal(await page.evaluate(() => document.body.dataset.sceneCluePressure), "enabled");
  assert.equal(await page.evaluate(() => document.body.dataset.sceneEvidenceRitual), "enabled");
  await page.getByRole("button", { name: /Take lantern/i }).click();
  await page.getByRole("button", { name: /Pack bridge rope/i }).click();
  await page.getByRole("button", { name: /Walk to the crossroads/i }).click();
  await page.waitForURL(/crossroads\.html$/);
  await page.waitForFunction(() => Boolean(globalThis.GameHost?.getOracleReadabilityDomain && globalThis.GameHost?.getCluePressureReadinessDomain && globalThis.GameHost?.getEvidenceRitualReadinessDomain));
  await page.getByRole("button", { name: /Enter the lantern forest/i }).click();
  await page.waitForURL(/forest\.html$/);
  await page.waitForFunction(() => Boolean(globalThis.GameHost?.getOracleReadabilityDomain && globalThis.GameHost?.getCluePressureReadinessDomain && globalThis.GameHost?.getEvidenceRitualReadinessDomain));
  state = await page.evaluate(() => globalThis.GameHost.getState());
  const domain = await page.evaluate(() => globalThis.GameHost.getPeerSceneDomain());
  atmosphere = await page.evaluate(() => globalThis.GameHost.getAtmosphericHandoff());
  oracle = await page.evaluate(() => globalThis.GameHost.getOracleReadabilityDomain());
  cluePressure = await page.evaluate(() => globalThis.GameHost.getCluePressureReadinessDomain());
  evidenceRitual = await page.evaluate(() => globalThis.GameHost.getEvidenceRitualReadinessDomain());
  handoff = await page.evaluate(() => globalThis.GameHost.getRendererHandoff());
  const mood = await page.evaluate(() => document.body.dataset.sceneMood);
  assert.equal(state.currentScene, "forest");
  assert.ok(state.inventory.includes("Lantern"));
  assert.ok(state.inventory.includes("Bridge rope"));
  assert.ok(state.visitedScenes.includes("crossroads"));
  assert.equal(domain.sceneId, "forest");
  assert.equal(domain.route.nodes, 6);
  assert.ok(domain.gates.gates >= 1);
  assert.equal(atmosphere.sceneId, "forest");
  assert.equal(atmosphere.lightRays, 5);
  assert.equal(atmosphere.pathTension, 2);
  assert.equal(oracle.sceneId, "forest");
  assert.ok(oracle.forecast.threads >= 1);
  assert.ok(oracle.puzzleDebt.missing >= 1);
  assert.equal(cluePressure.sceneId, "forest");
  assert.ok(cluePressure.objectivePressure.pips >= 5);
  assert.ok(cluePressure.evidenceGaps.cards >= 5);
  assert.equal(evidenceRitual.sceneId, "forest");
  assert.equal(evidenceRitual.witnessStatementWebs, 6);
  assert.equal(evidenceRitual.ritualSequenceRunes, 6);
  assert.equal(evidenceRitual.verdictDoorReadiness, 1);
  assert.equal(handoff.endingReadinessCrowns, 1);
  assert.ok(handoff.cluePressureReadiness.evidenceGapCards >= 5);
  assert.equal(handoff.evidenceRitualReadiness.doubtPressureDials, 4);
  assert.ok(mood !== "");
  console.log("peer scene transition NexusEngine CDN/state-input smoke passed: 55 intake cases");
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

import "./open-above-flight-route-readability-kits-smoke.mjs";
import "./open-above-flight-route-readability-cdn-state-input-smoke.mjs";
import "./open-above-aerial-courier-readiness-domain-kits-smoke.mjs";
import "./open-above-aerial-courier-cdn-state-input-smoke.mjs";
import "./open-above-storm-shelter-readiness-kits-smoke.mjs";
import "./open-above-storm-shelter-cdn-state-input-smoke.mjs";
import "./open-above-alpine-clinic-readiness-kits-smoke.mjs";
import "./open-above-alpine-clinic-cdn-state-input-smoke.mjs";
import "./open-above-ridge-clinic-readiness-kits-smoke.mjs";
import "./open-above-ridge-clinic-cdn-state-input-smoke.mjs";

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

const config = await readFile(join(root, "experiments/the-open-above/open-above.config.js"), "utf8");
assert.ok(config.includes("https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js"));
assert.ok(config.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"));
assert.ok(!config.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js"));
assert.ok(config.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.1/protokits"));

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
let browser;

try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/experiments/the-open-above/`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Boolean(globalThis.GameHost?.getState && globalThis.GameHost?.getVisualDomains && globalThis.GameHost?.getFlightRouteReadability && globalThis.GameHost?.getAerialCourierReadiness && globalThis.GameHost?.getStormShelterReadiness && globalThis.GameHost?.getAlpineClinicReadiness && globalThis.GameHost?.getRidgeClinicReadiness), null, { timeout: 20000 });
  const state = await page.evaluate(() => {
    globalThis.GameHost.stop();
    globalThis.GameHost.setInput({ pitch: 0.2, bank: -0.4, boost: true });
    globalThis.GameHost.tick(1 / 30, { pitch: 0.2, bank: -0.4, boost: true });
    const currentState = globalThis.GameHost.getState();
    return {
      state: currentState,
      route: globalThis.GameHost.getFlightRouteReadability(),
      courier: globalThis.GameHost.getAerialCourierReadiness(),
      shelter: globalThis.GameHost.getStormShelterReadiness(),
      clinic: globalThis.GameHost.getAlpineClinicReadiness(),
      ridgeClinic: globalThis.GameHost.getRidgeClinicReadiness(),
      handoff: globalThis.GameHost.getRendererHandoff(),
      routeOverlay: document.querySelector("#open-above-flight-route-readability-overlay")?.dataset ?? {},
      courierOverlay: document.querySelector("#open-above-aerial-courier-overlay")?.dataset ?? {},
      shelterOverlay: document.querySelector("#open-above-storm-shelter-overlay")?.dataset ?? {},
      clinicOverlay: document.querySelector("#open-above-alpine-clinic-overlay")?.dataset ?? {},
      ridgeClinicOverlay: document.querySelector("#open-above-ridge-clinic-overlay")?.dataset ?? {}
    };
  });
  assert.ok(state.state.validation?.booted);
  assert.ok(state.state.visualDomains?.mood);
  assert.ok(Array.isArray(state.state.visualDomains?.cloudStrata));
  assert.ok(Array.isArray(state.state.visualDomains?.speedRibbons));
  assert.ok(Array.isArray(state.state.visualDomains?.thermals));
  assert.equal(state.state.visualDomains.contrails.length, 2);
  assert.ok(state.state.input.boost);
  assert.ok(state.route?.summary?.descriptorCount >= 20);
  assert.equal(state.route.rendererHandoff.contract, "renderer-consumes-descriptors-only");
  assert.ok(state.courier?.summary?.descriptorCount >= 24);
  assert.equal(state.courier.rendererHandoff.contract, "renderer-consumes-descriptors-only");
  assert.ok(state.shelter?.summary?.descriptorCount >= 25);
  assert.equal(state.shelter.rendererHandoff.contract, "renderer-consumes-descriptors-only");
  assert.ok(state.clinic?.summary?.descriptorCount >= 24);
  assert.equal(state.clinic.rendererHandoff.contract, "renderer-consumes-descriptors-only");
  assert.ok(state.ridgeClinic?.summary?.descriptorCount >= 21);
  assert.equal(state.ridgeClinic.rendererHandoff.contract, "renderer-consumes-descriptors-only");
  assert.ok(state.handoff?.counts?.openAboveFlightRoute >= 20);
  assert.ok(state.handoff?.counts?.openAboveAerialCourier >= 24);
  assert.ok(state.handoff?.counts?.openAboveStormShelter >= 25);
  assert.ok(state.handoff?.counts?.openAboveAlpineClinic >= 24);
  assert.ok(state.handoff?.counts?.openAboveRidgeClinic >= 21);
  assert.equal(state.routeOverlay.rendererConsumes, "descriptors-only");
  assert.equal(state.courierOverlay.rendererConsumes, "descriptors-only");
  assert.equal(state.shelterOverlay.rendererConsumes, "descriptors-only");
  assert.equal(state.clinicOverlay.rendererConsumes, "descriptors-only");
  assert.equal(state.ridgeClinicOverlay.rendererConsumes, "descriptors-only");
  console.log("The Open Above CDN-backed Playwright state input smoke passed.");
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

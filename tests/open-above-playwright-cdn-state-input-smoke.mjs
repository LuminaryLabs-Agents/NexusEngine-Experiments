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
assert.ok(config.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js"));
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
  await page.waitForFunction(() => Boolean(globalThis.GameHost?.getState && globalThis.GameHost?.getVisualDomains), null, { timeout: 20000 });
  const state = await page.evaluate(() => {
    globalThis.GameHost.stop();
    globalThis.GameHost.setInput({ pitch: 0.2, bank: -0.4, boost: true });
    globalThis.GameHost.tick(1 / 30, { pitch: 0.2, bank: -0.4, boost: true });
    return globalThis.GameHost.getState();
  });
  assert.ok(state.validation?.booted);
  assert.ok(state.visualDomains?.mood);
  assert.ok(Array.isArray(state.visualDomains?.cloudStrata));
  assert.ok(Array.isArray(state.visualDomains?.speedRibbons));
  assert.ok(Array.isArray(state.visualDomains?.thermals));
  assert.equal(state.visualDomains.contrails.length, 2);
  assert.ok(state.input.boost);
  console.log("The Open Above CDN-backed Playwright state input smoke passed.");
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

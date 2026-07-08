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
  await page.getByRole("button", { name: /Take lantern/i }).click();
  await page.getByRole("button", { name: /Pack bridge rope/i }).click();
  await page.getByRole("button", { name: /Walk to the crossroads/i }).click();
  await page.waitForURL(/crossroads\.html$/);
  await page.getByRole("button", { name: /Enter the lantern forest/i }).click();
  await page.waitForURL(/forest\.html$/);
  const state = await page.evaluate(() => globalThis.GameHost.getState());
  const mood = await page.evaluate(() => document.body.dataset.sceneMood);
  assert.equal(state.currentScene, "forest");
  assert.ok(state.inventory.includes("Lantern"));
  assert.ok(state.inventory.includes("Bridge rope"));
  assert.ok(state.visitedScenes.includes("crossroads"));
  assert.ok(mood !== "");
  console.log("peer scene transition playwright smoke passed");
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

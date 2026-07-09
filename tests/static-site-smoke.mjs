import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, normalize, relative } from "node:path";

const root = process.cwd();
const sourceRoots = ["experiments", "games"].filter((dir) => existsSync(join(root, dir)));
const jsFiles = [];
const htmlFiles = [];
const warnings = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if ([".git", "node_modules", "dist", "build", "coverage"].includes(entry)) continue;
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path);
    else if (entry.endsWith(".js") || entry.endsWith(".mjs")) jsFiles.push(path);
    else if (entry.endsWith(".html")) htmlFiles.push(path);
  }
}

for (const dir of sourceRoots) walk(join(root, dir));

function localPath(baseFile, href) {
  if (!href || href.startsWith("http:") || href.startsWith("https:") || href.startsWith("//") || href.startsWith("#") || href.startsWith("data:")) return null;
  const noHash = href.split("#")[0].split("?")[0];
  if (!noHash) return null;
  return normalize(join(dirname(baseFile), noHash));
}

for (const htmlFile of htmlFiles) {
  const html = readFileSync(htmlFile, "utf8");
  const label = relative(root, htmlFile);
  if (!/<main\b/i.test(html)) warnings.push(`${label} has no semantic <main>; legacy shells are allowed but should be improved.`);
  if (!/<script\b/i.test(html)) warnings.push(`${label} has no script tag; check whether it is meant to be playable.`);

  const refs = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/gi)].map((match) => match[1]);
  for (const ref of refs) {
    const path = localPath(htmlFile, ref);
    if (!path) continue;
    const exists = existsSync(path) || existsSync(join(path, "index.html"));
    assert.ok(exists, `${label} references missing local path ${ref}`);
  }
}

const rootIndex = join(root, "index.html");
if (existsSync(rootIndex)) {
  const html = readFileSync(rootIndex, "utf8");
  const links = [...html.matchAll(/href=["']\.\/(experiments|games)\/([^"'#?]+)\/?["']/gi)];
  assert.ok(links.length > 0, "root index should link to at least one experiment or game");
  for (const [, kind, name] of links) {
    const indexPath = join(root, kind, name, "index.html");
    assert.ok(existsSync(indexPath), `root gallery link ./${kind}/${name}/ should have index.html`);
  }
}

const tinyDiffusionHtml = join(root, "experiments/tiny-diffusion-lab/index.html");
if (existsSync(tinyDiffusionHtml)) {
  const html = readFileSync(tinyDiffusionHtml, "utf8");
  const js = readFileSync(join(root, "experiments/tiny-diffusion-lab/main.js"), "utf8");
  const metadata = JSON.parse(readFileSync(join(root, "experiments/tiny-diffusion-lab/experiment.json"), "utf8"));
  assert.ok(html.includes("Tiny Diffusion Lab"), "Tiny Diffusion Lab title should render in HTML");
  assert.ok(html.includes("./main.js?v=tiny-diffusion-lab-1"), "Tiny Diffusion Lab should load its local browser host");
  assert.ok(js.includes("https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js"), "Tiny Diffusion Lab should consume Nexus Engine main CDN");
  assert.ok(js.includes("createNexusDiffusionKits"), "Tiny Diffusion Lab should install the diffusion module");
  assert.ok(js.includes("engine.n.diffusion.prepare()"), "Tiny Diffusion Lab should prepare through engine.n.diffusion");
  assert.ok(js.includes("engine.n.diffusion.train"), "Tiny Diffusion Lab should train through engine.n.diffusion");
  assert.ok(js.includes("engine.n.diffusion.sample"), "Tiny Diffusion Lab should sample through engine.n.diffusion");
  assert.equal(metadata.id, "tiny-diffusion-lab");
  assert.ok(metadata.kitStack.includes("createNexusDiffusionKits"), "Tiny Diffusion Lab metadata should record diffusion kit consumption");
}

for (const warning of warnings) console.warn(`[static smoke warning] ${warning}`);
console.log(`Static site smoke checked ${htmlFiles.length} HTML files and ${jsFiles.length} JS modules.`);

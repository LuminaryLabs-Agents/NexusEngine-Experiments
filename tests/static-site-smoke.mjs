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

for (const warning of warnings) console.warn(`[static smoke warning] ${warning}`);
console.log(`Static site smoke checked ${htmlFiles.length} HTML files and ${jsFiles.length} JS modules.`);

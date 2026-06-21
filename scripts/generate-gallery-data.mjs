import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, posix } from "node:path";

const ROOT = process.cwd();
const DATA_PATH = join(ROOT, "experiments/_shared/nexus-gallery-data.js");
const INDEX_PATH = join(ROOT, "index.html");
const SEARCH_ROOTS = [
  { dir: "experiments", kind: "experiment", playLabel: "Play experiment" },
  { dir: "games", kind: "game", playLabel: "Play game" }
];
const IGNORE = new Set(["_shared", "aaa-batch", "assets"]);

const CURATED = {
  "the-open-above-harness": {
    title: "The Open Above V2",
    featured: true,
    visual: "sora",
    playLabel: "Play harness",
    tags: [{ label: "Flight", tone: "gold" }, { label: "Traversal", tone: "green" }, { label: "3D", tone: "blue" }],
    description: "Clean high-fidelity free-flight harness for assisted bird carving, camera-relative sky, terrain patches, scatter, flocking, and validation-first composition."
  },
  "high-fidelity-meadow": {
    visual: "sora",
    tags: [{ label: "WebGL", tone: "gold" }, { label: "Procedural", tone: "green" }, { label: "DSK Cutover", tone: "blue" }],
    description: "Experiment-owned procedural WebGL meadow scene composed from terrain, wind, vegetation, creature, fur, sky, VFX, and visual-target domains."
  },
  "fogline-relay": {
    visual: "fogline",
    tags: [{ label: "First Person", tone: "gold" }, { label: "Scan", tone: "green" }, { label: "Fog", tone: "blue" }],
    description: "First-person survey-pressure loop for scan targets, fog zones, timed pressure, hazard state, and renderer-only visual buckets."
  },
  "living-agent-lab": {
    visual: "fogline",
    tags: [{ label: "Agent Kit", tone: "gold" }, { label: "Dry Run", tone: "green" }, { label: "No LLM", tone: "blue" }],
    description: "Deterministic dry-run agent slice for memory, harness proposals, validation traces, and in-world dialogue without live model calls."
  },
  "onnx-agent-lab": {
    title: "ONNX Companion Workshop",
    visual: "sora",
    tags: [{ label: "ONNX", tone: "gold" }, { label: "Workshop", tone: "green" }, { label: "Three.js", tone: "blue" }],
    description: "Walkable Three.js ONNX companion workshop where physical objects can be clicked, reviewed, questioned, and returned to their spawn positions."
  },
  "signal-bastion": {
    visual: "hell",
    tags: [{ label: "Tower Defense", tone: "gold" }, { label: "2.5D Cel", tone: "green" }, { label: "Tactics", tone: "blue" }],
    description: "2.5D cel-style defense game with gameplay-only HUD, tower placement, upgrades, range rings, and AAA content pass."
  },
  "rogue-lite-hellscape-siege": {
    visual: "hell",
    tags: [{ label: "Action RPG", tone: "gold" }, { label: "Base Siege", tone: "green" }, { label: "Harvest", tone: "red" }],
    description: "Unified high-fidelity base route for realm portals, inventory, harvesting, building, wave-defense, FX, and renderer-only presentation loop."
  }
};

function titleCase(slug) {
  return slug.split("-").filter(Boolean).map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ");
}

function getTitleFromHtml(html, slug) {
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, "").trim();
  return title && !/^NexusRealtime/i.test(title) ? title : h1 || titleCase(slug);
}

function getDescriptionFromHtml(html, slug, title) {
  const meta = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)?.[1]?.trim();
  const paragraph = html.match(/<p[^>]*>([\s\S]{20,240}?)<\/p>/i)?.[1]?.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  return meta || paragraph || `Playable NexusRealtime route for ${title || titleCase(slug)}.`;
}

function visualFor(slug, title) {
  const text = `${slug} ${title}`.toLowerCase();
  if (/hell|ember|anvil|siege|verdict|forge/.test(text)) return "hell";
  if (/fog|signal|relay|core|underwater|echo/.test(text)) return "fogline";
  if (/zombie|orchid|mech|harvest/.test(text)) return "zombie";
  if (/ledge|mirror|prism|lock/.test(text)) return "next";
  return "sora";
}

function tagsFor(slug, kind) {
  const words = slug.split("-").filter(Boolean);
  const first = words[0] ? words[0][0].toUpperCase() + words[0].slice(1) : kind;
  const second = words[1] ? words[1][0].toUpperCase() + words[1].slice(1) : "Realtime";
  return [{ label: kind === "game" ? "Game" : "Experiment", tone: "gold" }, { label: first, tone: "green" }, { label: second, tone: "blue" }];
}

function routeExists(route) {
  return existsSync(join(ROOT, route.replace(/^\.\//, ""), "index.html"));
}

function discoverRoutes() {
  const routes = [];
  for (const root of SEARCH_ROOTS) {
    const absRoot = join(ROOT, root.dir);
    if (!existsSync(absRoot)) continue;
    for (const entry of readdirSync(absRoot, { withFileTypes: true })) {
      if (!entry.isDirectory() || IGNORE.has(entry.name) || entry.name.startsWith(".")) continue;
      const indexPath = join(absRoot, entry.name, "index.html");
      if (!existsSync(indexPath)) continue;
      const html = readFileSync(indexPath, "utf8");
      const id = entry.name;
      const route = `./${posix.join(root.dir, id)}/`;
      const curated = CURATED[id] ?? {};
      const title = curated.title ?? getTitleFromHtml(html, id);
      const game = {
        id,
        title,
        route,
        kind: curated.kind ?? root.kind,
        featured: Boolean(curated.featured),
        visual: curated.visual ?? visualFor(id, title),
        playLabel: curated.playLabel ?? root.playLabel,
        tags: curated.tags ?? tagsFor(id, root.kind),
        description: curated.description ?? getDescriptionFromHtml(html, id, title)
      };
      if (!routeExists(game.route)) throw new Error(`Generated missing route: ${game.route}`);
      routes.push(game);
    }
  }
  routes.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (a.kind !== b.kind) return a.kind === "experiment" ? -1 : 1;
    return a.title.localeCompare(b.title);
  });
  if (routes.length > 0 && !routes.some((route) => route.featured)) routes[0].featured = true;
  return routes;
}

function jsString(value) {
  return JSON.stringify(value, null, 2)
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function writeGalleryData(routes) {
  const content = `// Auto-generated by scripts/generate-gallery-data.mjs.\n// Do not hand-curate this file; add real experiments/games with index.html or update the generator metadata.\n\nexport const galleryConfig = Object.freeze({\n  title: "Experiments",\n  subtitle: "NexusRealtime playable routes",\n  repoUrl: "https://github.com/LuminaryLabs-Agents/NexusRealtime-Experiments",\n  hint: "Drag, swipe, wheel, double-click, or use arrows to browse."\n});\n\nexport const games = Object.freeze(${jsString(routes)});\n\nexport function getFeaturedGame() {\n  return games.find((game) => game.featured) ?? games[0] ?? null;\n}\n\nexport function getGameById(id) {\n  return games.find((game) => game.id === id) ?? null;\n}\n`;
  writeFileSync(DATA_PATH, content);
}

function updateIndex(routes) {
  if (!existsSync(INDEX_PATH)) return;
  const index = readFileSync(INDEX_PATH, "utf8");
  const links = routes.map((route) => `      <p><a href="${route.route.replace(/^\.\//, "./")}">Play ${escapeHtml(route.title)}</a></p>`).join("\n");
  const noscript = `  <noscript>\n    <section class="nexus-noscript">\n      <h1>NexusRealtime Experiments</h1>\n      <p>JavaScript is required for the interactive carousel. All generated main-branch routes are listed below.</p>\n${links}\n    </section>\n  </noscript>`;
  const version = `main-gallery-${routes.length}`;
  let next = index.replace(/  <noscript>[\s\S]*?  <\/noscript>/, noscript);
  next = next.replace(/nexus-experiments-shell\.js\?v=[^"']+/, `nexus-experiments-shell.js?v=${version}`);
  writeFileSync(INDEX_PATH, next);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const routes = discoverRoutes();
writeGalleryData(routes);
updateIndex(routes);
console.log(`Generated gallery data for ${routes.length} routes.`);

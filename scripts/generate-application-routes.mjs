import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { aaaBatchGames } from "../experiments/aaa-batch/host/game-registry.js";

const root = process.cwd();

function titleFor(app) {
  return `${app.title} — NexusRealtime`;
}

function htmlFor(app) {
  const safeTitle = titleFor(app).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  const safeId = app.id.replace(/[^a-z0-9-]/gi, "");
  const safeLabel = app.title.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="description" content="Generated NexusRealtime application route for ${safeLabel}." />
  <title>${safeTitle}</title>
</head>
<body data-app-id="${safeId}">
  <main id="app" aria-label="${safeLabel} application">
    <canvas id="game" role="application"></canvas>
    <aside id="hud" aria-label="Application HUD">
      <h1 id="title">${safeLabel}</h1>
      <p id="status">Loading…</p>
      <p id="readout"></p>
    </aside>
    <pre id="err" role="alert" hidden></pre>
  </main>
  <script type="module">
    import { startGeneratedApplicationRoute } from "../_shared/generated-app-route.js";
    startGeneratedApplicationRoute("${safeId}");
  </script>
</body>
</html>
`;
}

for (const app of aaaBatchGames) {
  const dir = join(root, "apps", app.id);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), htmlFor(app));
}

console.log(`Generated ${aaaBatchGames.length} promoted application route wrappers.`);

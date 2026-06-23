import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { apps } from "../experiments/_shared/nexus-gallery-data.js";

const manifestPath = "experiments/domain-kit-cutover-manifest.json";
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

function normalizeRoute(route) {
  return route.replace(/^\.\//, "").replace(/\/?$/, "/");
}

assert.equal(
  manifest.policy,
  "one canonical base route per experiment or game",
  "domain cutover manifest should keep the one canonical base route policy"
);
assert.ok(Array.isArray(manifest.canonicalRoutes), "manifest should expose canonicalRoutes[]");
assert.ok(manifest.canonicalRoutes.length > 0, "manifest should list at least one canonical route");

const galleryById = new Map(apps.map((app) => [app.id, app]));
const galleryRoutes = new Set(apps.map((app) => normalizeRoute(app.route)));
const canonicalIds = new Set();

for (const entry of manifest.canonicalRoutes) {
  assert.ok(entry.id, "canonical entries need ids");
  assert.ok(!canonicalIds.has(entry.id), `${entry.id} should not duplicate a manifest id`);
  canonicalIds.add(entry.id);

  assert.ok(entry.canonicalPath, `${entry.id} should declare a canonical path`);
  assert.ok(!/-v[0-9]+\/?$/.test(entry.canonicalPath), `${entry.id} canonical path should not be versioned`);
  assert.ok(existsSync(`${entry.canonicalPath}index.html`), `${entry.id} canonical path should have index.html`);

  assert.ok(
    Array.isArray(entry.domainCutover) && entry.domainCutover.length > 0,
    `${entry.id} should list non-empty domain cutover ownership`
  );
  assert.ok(
    entry.domainCutover.every((domain) => typeof domain === "string" && domain.trim().length > 0),
    `${entry.id} should only list named domain cutover entries`
  );
  assert.ok(
    typeof entry.bridgeNeeded === "string" && entry.bridgeNeeded.trim().length > 0,
    `${entry.id} should record bridge or preset ownership`
  );

  const canonicalRoute = normalizeRoute(`./${entry.canonicalPath}`);
  assert.ok(galleryRoutes.has(canonicalRoute), `${entry.id} should be discoverable through generated gallery routes`);

  const galleryEntry = galleryById.get(entry.id);
  assert.ok(galleryEntry, `${entry.id} should keep a matching gallery id`);
  assert.equal(
    normalizeRoute(galleryEntry.route),
    canonicalRoute,
    `${entry.id} gallery route should point at the manifest canonical path`
  );
}

assert.ok(
  apps.length > manifest.canonicalRoutes.length,
  "generated gallery may include seed/backlog routes, but the canonical manifest must stay explicit"
);

const knownSeedOrBacklogIds = [
  "tideglass-salvage",
  "skyrig-suture",
  "starwell-cartographer",
  "clockwork-verdict"
];

for (const seedId of knownSeedOrBacklogIds) {
  if (galleryById.has(seedId)) {
    assert.ok(!canonicalIds.has(seedId), `${seedId} should remain seed/backlog until promoted through the manifest`);
  }
}

console.log("Domain cutover manifest smoke passed.");

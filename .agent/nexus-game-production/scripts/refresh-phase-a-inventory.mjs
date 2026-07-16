import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const experimentsRoot = path.resolve(scriptDir, "../../..");
const productionRoot = path.resolve(scriptDir, "..");
const protoKitsRoot = path.resolve(experimentsRoot, "../NexusEngine-ProtoKits");
const coreRoot = path.resolve(experimentsRoot, "../NexusEngine");
const pipelineStatePath = path.join(productionRoot, "pipeline-state.json");
const markdownPath = path.join(productionRoot, "existing-kit-inventory.md");
const jsonPath = path.join(productionRoot, "existing-inventory-baseline.json");
const kitCatalogPath = path.join(productionRoot, "kit-catalog.json");
const checkOnly = process.argv.includes("--check");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function directories(root) {
  return fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function walkFiles(root) {
  const result = [];
  const visit = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name === ".git" || entry.name === "node_modules") continue;
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) visit(absolute);
      else if (entry.isFile()) result.push(absolute);
    }
  };
  visit(root);
  return result.sort((a, b) => a.localeCompare(b));
}

function git(repo, args) {
  return execFileSync("git", ["-C", repo, ...args], { encoding: "utf8" }).trim();
}

function lines(value) {
  return value.split(/\r?\n/).filter(Boolean);
}

function normalizeKitName(name) {
  let value = name.toLowerCase().replace(/^n-/, "").replace(/^generic-/, "");
  const suffix = /-(domain-service-kit|domain-kit|service-kit|dsk|kits|bundle|domain|core|kit)$/;
  while (suffix.test(value)) value = value.replace(suffix, "");
  return value;
}

function inspectProtoKit(name) {
  const root = path.join(protoKitsRoot, "protokits", name);
  const files = walkFiles(root);
  const relativeFiles = files.map((file) => path.relative(root, file));
  const sourceFiles = files.filter((file) => /\.(js|mjs|cjs|ts)$/.test(file));
  const source = sourceFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");
  const manifests = ["kit.manifest.json", "kit.json", "manifest.json"]
    .filter((file) => fs.existsSync(path.join(root, file)));
  let manifestValid = true;
  for (const manifest of manifests) {
    try {
      readJson(path.join(root, manifest));
    } catch {
      manifestValid = false;
    }
  }

  const boundarySignals = [];
  if (/\b(document|window|HTMLCanvasElement|WebGL|THREE\.|requestAnimationFrame|localStorage)\b/.test(source)) {
    boundarySignals.push("renderer/browser");
  }
  if (/\bfetch\s*\(/.test(source)) boundarySignals.push("network");
  if (/Math\.random\s*\(/.test(source)) boundarySignals.push("unseeded-random");
  if (/Date\.now\s*\(/.test(source)) boundarySignals.push("wall-clock");
  if (/(bridge|adapter|renderer|host)/.test(name)) boundarySignals.push("adapter/host-name");
  if (/(bundle|suite|gameplay|game-|kits$)/.test(name)) boundarySignals.push("composite-name");

  return {
    name,
    path: `protokits/${name}`,
    hasEntrypoint: ["index.js", "index.mjs", "index.ts"].some((file) => fs.existsSync(path.join(root, file))),
    hasReadme: fs.existsSync(path.join(root, "README.md")),
    manifests,
    manifestValid,
    hasTests: relativeFiles.some((file) => /(^|\/)(tests?\/|.*(?:test|smoke)\.)/i.test(file)),
    sourceFileCount: sourceFiles.length,
    boundarySignals: [...new Set(boundarySignals)].sort()
  };
}

function inspectRouteFolder(base, name) {
  const root = path.join(base, name);
  const files = walkFiles(root);
  return {
    name,
    fileCount: files.length,
    javascriptFileCount: files.filter((file) => /\.(js|mjs|ts)$/.test(file)).length,
    htmlFileCount: files.filter((file) => /\.html$/.test(file)).length,
    hasReadme: files.some((file) => path.basename(file) === "README.md")
  };
}

function markdownEscape(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}

function writeOrCheck(file, expected) {
  if (checkOnly) {
    if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== expected) {
      throw new Error(`Inventory artifact is stale: ${file}`);
    }
    return;
  }
  fs.writeFileSync(file, expected);
}

const pipelineState = readJson(pipelineStatePath);
const productionKitNames = new Set((readJson(kitCatalogPath).implementedKits ?? []).map((entry) => entry.name));
const protoKitNames = directories(path.join(protoKitsRoot, "protokits")).filter((name) => !productionKitNames.has(name));
const protoKits = protoKitNames.map(inspectProtoKit);
const duplicateGroups = new Map();
for (const kit of protoKits) {
  const key = normalizeKitName(kit.name);
  if (!duplicateGroups.has(key)) duplicateGroups.set(key, []);
  duplicateGroups.get(key).push(kit.name);
}
const normalizedDuplicateClusters = [...duplicateGroups.entries()]
  .filter(([, names]) => names.length > 1)
  .map(([normalizedName, names]) => ({ normalizedName, names: names.sort() }))
  .sort((left, right) => right.names.length - left.names.length || left.normalizedName.localeCompare(right.normalizedName));

const experimentFolderNames = directories(path.join(experimentsRoot, "experiments"));
const flatAaaRoutes = [];
const otherExperimentFolders = [];
for (const name of experimentFolderNames) {
  const indexPath = path.join(experimentsRoot, "experiments", name, "index.html");
  if (fs.existsSync(indexPath) && fs.readFileSync(indexPath, "utf8").includes("startFlatAaaExperimentRoute")) {
    flatAaaRoutes.push(name);
  } else {
    otherExperimentFolders.push(inspectRouteFolder(path.join(experimentsRoot, "experiments"), name));
  }
}
const games = directories(path.join(experimentsRoot, "games"))
  .map((name) => inspectRouteFolder(path.join(experimentsRoot, "games"), name));

const coreCommit = pipelineState.synchronizedStartingCommits.coreRemoteDefault;
const coreTree = lines(git(coreRoot, ["ls-tree", "-r", "--name-only", coreCommit, "--", "src/core-kits", "src/core-domains"]));
const coreKitDomainDocs = coreTree.filter((file) => /^src\/core-kits\/[^/]+\/core-domain\.md$/.test(file));
const standaloneCoreDomainDocs = coreTree.filter((file) =>
  /^src\/core-domains\/[^/]+\/core-domain\.md$/.test(file) || file === "src/core-domains/core-world-domain/README.md"
);
const coreKitExports = lines(git(coreRoot, ["show", `${coreCommit}:src/core-kits/index.js`]))
  .filter((line) => line.startsWith("export *"));
const coreDomainExports = lines(git(coreRoot, ["show", `${coreCommit}:src/core-domains/index.js`]))
  .filter((line) => line.startsWith("export *"));

const stats = {
  protoKitFolders: protoKits.length,
  protoKitEntrypoints: protoKits.filter((kit) => kit.hasEntrypoint).length,
  protoKitReadmes: protoKits.filter((kit) => kit.hasReadme).length,
  protoKitMachineContracts: protoKits.filter((kit) => kit.manifests.length > 0).length,
  protoKitLocalTests: protoKits.filter((kit) => kit.hasTests).length,
  invalidProtoKitManifests: protoKits.filter((kit) => !kit.manifestValid).length,
  rendererOrBrowserSignalFolders: protoKits.filter((kit) => kit.boundarySignals.includes("renderer/browser")).length,
  unseededRandomSignalFolders: protoKits.filter((kit) => kit.boundarySignals.includes("unseeded-random")).length,
  wallClockSignalFolders: protoKits.filter((kit) => kit.boundarySignals.includes("wall-clock")).length,
  normalizedDuplicateClusters: normalizedDuplicateClusters.length,
  flatAaaRoutes: flatAaaRoutes.length,
  otherExperimentFolders: otherExperimentFolders.length,
  existingGames: games.length,
  naturalLanguageCoreDomainDocuments: coreKitDomainDocs.length + standaloneCoreDomainDocs.length,
  exportedCoreDomainCompositions: coreDomainExports.length,
  exportedCoreCapabilityKits: coreKitExports.length - 3
};

const baseline = {
  schemaVersion: 1,
  capturedAt: pipelineState.inventoryCapturedAt,
  sourceCommits: {
    coreRemoteDefault: coreCommit,
    protoKits: pipelineState.synchronizedStartingCommits.protokits,
    experiments: pipelineState.synchronizedStartingCommits.experiments
  },
  stats,
  core: {
    coreKitDomainDocs,
    standaloneCoreDomainDocs,
    coreDomainExportCount: coreDomainExports.length,
    coreCapabilityKitExportCount: coreKitExports.length - 3
  },
  protoKits,
  normalizedDuplicateClusters,
  experiments: {
    flatAaaRoutes,
    otherExperimentFolders
  },
  games
};

const markdown = [
  "# Existing ProtoKit Inventory",
  "",
  "Status: Phase A baseline complete",
  `Captured: ${pipelineState.inventoryCapturedAt}`,
  `ProtoKits commit: \`${pipelineState.synchronizedStartingCommits.protokits}\``,
  "",
  "## Summary",
  "",
  `- ${stats.protoKitFolders} top-level ProtoKit folders; ${stats.protoKitEntrypoints} expose a top-level entrypoint.`,
  `- ${stats.protoKitReadmes} have a top-level README; ${stats.protoKitMachineContracts} have a top-level machine contract; ${stats.protoKitLocalTests} have local test evidence.`,
  `- ${stats.normalizedDuplicateClusters} normalized-name clusters require duplicate or alias review.`,
  `- ${stats.rendererOrBrowserSignalFolders} folders contain renderer/browser tokens; ${stats.unseededRandomSignalFolders} contain unseeded-random tokens; ${stats.wallClockSignalFolders} contain wall-clock tokens. These are audit signals, not automatic verdicts.`,
  "- All entries predate this production pipeline and count as zero new mission kits.",
  "",
  "## Inventory Limits",
  "",
  "This is discovery evidence, not catalog acceptance. Folder names and static tokens cannot prove purpose, ownership, exclusions, idempotency, state, events, methods, snapshot behavior, or first experiment proof. Phase B must perform that natural-language audit before accepting any adjacent new definition.",
  "",
  "## Normalized Duplicate And Alias Risks",
  "",
  "| Normalized boundary | Existing folders |",
  "| --- | --- |",
  ...normalizedDuplicateClusters.map((cluster) => `| \`${markdownEscape(cluster.normalizedName)}\` | ${cluster.names.map((name) => `\`${markdownEscape(name)}\``).join(", ")} |`),
  "",
  "## Full Top-Level Inventory",
  "",
  "| Folder | Entry | README | Contract | Tests | Boundary signals |",
  "| --- | ---: | ---: | --- | ---: | --- |",
  ...protoKits.map((kit) => `| \`${markdownEscape(kit.path)}\` | ${kit.hasEntrypoint ? "yes" : "no"} | ${kit.hasReadme ? "yes" : "no"} | ${kit.manifests.length ? kit.manifests.map((file) => `\`${markdownEscape(file)}\``).join(", ") : "none"} | ${kit.hasTests ? "yes" : "no"} | ${kit.boundarySignals.length ? kit.boundarySignals.map(markdownEscape).join(", ") : "none"} |`),
  "",
  "## Mission Counting Decision",
  "",
  "No existing folder is relabeled as one of the 100 new ProtoKits. New catalog entries must be genuinely new responsibilities, pass Core and inventory duplicate checks, and satisfy the complete kit-map contract before implementation.",
  ""
].join("\n");

writeOrCheck(jsonPath, `${JSON.stringify(baseline, null, 2)}\n`);
writeOrCheck(markdownPath, markdown);

console.log(checkOnly ? "Phase A inventory artifacts are current." : "Phase A inventory artifacts refreshed.");
console.log(JSON.stringify(stats));

const round = (value, places = 3) => Number(Number(value).toFixed(places));
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));
const count = (items, key) => items.filter((item) => item[key]).length;
const forbiddenOwnership = ["renderer ownership", "DOM ownership", "browser input ownership", "Three.js ownership", "WebGL ownership", "audio ownership", "asset loading ownership", "frame-loop ownership"];

function safeInput(input = {}) {
  return { thrust: clamp(input.thrust ?? input.forward ?? 0, -1, 1), bank: clamp(input.bank ?? input.x ?? 0, -1, 1), climb: clamp(input.climb ?? input.y ?? 0, -1, 1), launch: Boolean(input.launch), pointerActive: Boolean(input.pointerActive), pointerX: clamp(input.pointerX ?? 0.5, 0, 1), pointerY: clamp(input.pointerY ?? 0.5, 0, 1) };
}
function summary(input, name) { return input[name]?.summary ?? {}; }
function readiness(input) { return clamp(input.readiness ?? input.routePreview?.readiness ?? 0, 0, 1); }

export const SORA_SKY_LIGHTHOUSE_READINESS_DOMAIN_TREE = `sora-sky-lighthouse-readiness-domain
├─ beacon-calibration-domain
│  ├─ cloud-lens-domain
│  │  └─ sora-cloud-lens-focus-kit
│  └─ star-prism-domain
│     └─ sora-star-prism-alignment-kit
├─ refuge-approach-domain
│  ├─ wind-buoy-domain
│  │  └─ sora-wind-buoy-chain-kit
│  └─ storm-lantern-domain
│     └─ sora-storm-lantern-warning-kit
├─ handoff-runway-domain
│  ├─ refuge-runway-domain
│  │  └─ sora-refuge-runway-mark-kit
│  └─ dawn-keeper-domain
│     └─ sora-dawn-keeper-log-kit
└─ renderer-handoff
   └─ sora-sky-lighthouse-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export function createSoraCloudLensFocusKit(options = {}) {
  const lensCount = Math.floor(clamp(options.lensCount ?? 4, 3, 6));
  return { id: "sora-cloud-lens-focus-kit", describe(input = {}) {
    const control = safeInput(input); const r = readiness(input); const heard = clamp((summary(input, "skyRescueReadiness").heardRescueBeacons ?? 0) / 4); const tick = Number(input.tick ?? 0);
    const lenses = Array.from({ length: lensCount }, (_, index) => { const phase = tick * 0.014 + index * 0.8; const focus = clamp(r * 0.34 + heard * 0.26 + Math.max(0, control.thrust) * 0.14 + Math.max(0, control.climb) * 0.16 - Math.abs(control.bank) * 0.1 + Math.sin(phase) * 0.04); return { id: `cloud-lens-${index}`, kind: "cloud-lens-focus", index, x: round(16 + index * 68 / Math.max(1, lensCount - 1), 2), y: round(26 + Math.cos(phase) * 8 + index * 5, 2), radius: round(8 + focus * 20, 2), focus: round(focus), focused: focus >= 0.58, label: focus >= 0.78 ? "clear cloud lens" : focus >= 0.58 ? "nearly focused cloud lens" : "blurred cloud lens" }; });
    return { kind: "cloud-lens-focuses", lenses };
  } };
}

export function createSoraStarPrismAlignmentKit(options = {}) {
  const prismCount = Math.floor(clamp(options.prismCount ?? 4, 3, 6));
  return { id: "sora-star-prism-alignment-kit", describe(input = {}) {
    const control = safeInput(input); const r = readiness(input); const vows = clamp((summary(input, "skyNegotiationReadiness").sealedReturnVows ?? 0) / 4); const anchors = clamp((summary(input, "flightplanReadability").linkedReturnAnchors ?? 0) / 4);
    const prisms = Array.from({ length: prismCount }, (_, index) => { const t = prismCount <= 1 ? 0.5 : index / (prismCount - 1); const desired = (t * 2 - 1) * 0.7; const alignment = clamp(r * 0.26 + vows * 0.22 + anchors * 0.18 + (1 - Math.abs(control.bank - desired) * 0.45) * 0.24 + Math.max(0, control.thrust) * 0.1); return { id: `star-prism-${index}`, kind: "star-prism-alignment", index, x: round(18 + t * 64, 2), y: round(18 + (index % 2) * 10, 2), beam: round(16 + alignment * 48, 2), alignment: round(alignment), aligned: alignment >= 0.6, label: alignment >= 0.8 ? "locked star prism" : alignment >= 0.6 ? "usable star prism" : "misaligned star prism" }; });
    return { kind: "star-prism-alignments", prisms };
  } };
}

export function createSoraWindBuoyChainKit(options = {}) {
  const buoyCount = Math.floor(clamp(options.buoyCount ?? 5, 4, 7));
  return { id: "sora-wind-buoy-chain-kit", describe(input = {}) {
    const control = safeInput(input); const r = readiness(input); const gusts = clamp((summary(input, "skyRescueReadiness").openGustCorridors ?? 0) / 4); const jets = clamp((summary(input, "skyNegotiationReadiness").usableJetstreams ?? 0) / 6);
    const buoys = Array.from({ length: buoyCount }, (_, index) => { const t = buoyCount <= 1 ? 0.5 : index / (buoyCount - 1); const chain = clamp(r * 0.22 + gusts * 0.24 + jets * 0.2 + Math.max(0, control.thrust) * 0.14 + (1 - Math.abs(control.climb) * 0.35) * 0.2 - index * 0.015); return { id: `wind-buoy-${index}`, kind: "wind-buoy-chain", index, x: round(12 + t * 76, 2), y: round(48 + Math.sin(index * 1.1) * 12, 2), slack: round(1 - chain), chain: round(chain), connected: chain >= 0.55, label: chain >= 0.75 ? "taut wind buoy" : chain >= 0.55 ? "catchable wind buoy" : "loose wind buoy" }; });
    return { kind: "wind-buoy-chains", buoys };
  } };
}

export function createSoraStormLanternWarningKit(options = {}) {
  const lanternCount = Math.floor(clamp(options.lanternCount ?? 4, 3, 6));
  return { id: "sora-storm-lantern-warning-kit", describe(input = {}) {
    const control = safeInput(input); const r = readiness(input); const storms = clamp((summary(input, "skyNegotiationReadiness").activeStormShelves ?? 0) / 4); const avoidable = clamp((summary(input, "skyRescueReadiness").avoidableShadowSqualls ?? 0) / 4); const tick = Number(input.tick ?? 0);
    const lanterns = Array.from({ length: lanternCount }, (_, index) => { const phase = tick * 0.021 + index * 1.2; const warning = clamp(0.18 + storms * 0.36 + Math.abs(control.bank) * 0.1 + Math.max(0, -control.climb) * 0.12 - r * 0.14 - avoidable * 0.12 + Math.sin(phase) * 0.06); return { id: `storm-lantern-${index}`, kind: "storm-lantern-warning", index, x: round(20 + index * 60 / Math.max(1, lanternCount - 1), 2), y: round(66 + Math.cos(phase) * 8, 2), pulse: round(warning), warning: round(warning), quiet: warning < 0.58, label: warning >= 0.72 ? "urgent storm lantern" : warning >= 0.58 ? "watch storm lantern" : "quiet storm lantern" }; });
    return { kind: "storm-lantern-warnings", lanterns };
  } };
}

export function createSoraRefugeRunwayMarkKit(options = {}) {
  const markCount = Math.floor(clamp(options.markCount ?? 3, 2, 5));
  return { id: "sora-refuge-runway-mark-kit", describe(input = {}) {
    const control = safeInput(input); const r = readiness(input); const lenses = input.cloudLensFocuses?.lenses ?? []; const buoys = input.windBuoyChains?.buoys ?? []; const lensScore = clamp(count(lenses, "focused") / Math.max(1, lenses.length)); const buoyScore = clamp(count(buoys, "connected") / Math.max(1, buoys.length)); const landing = clamp((summary(input, "microflightTrialReadiness").openLandingRunways ?? 0) / 3);
    const marks = Array.from({ length: markCount }, (_, index) => { const t = markCount <= 1 ? 0.5 : index / (markCount - 1); const approach = clamp(r * 0.24 + buoyScore * 0.24 + lensScore * 0.2 + landing * 0.18 + Math.max(0, control.climb) * 0.08 + (control.launch ? 0.06 : 0)); return { id: `refuge-runway-${index}`, kind: "refuge-runway-mark", index, x: round(24 + t * 52, 2), y: round(84 - approach * 28, 2), length: round(22 + approach * 40, 2), approach: round(approach), open: approach >= 0.62, label: approach >= 0.82 ? "lit refuge runway" : approach >= 0.62 ? "partial refuge runway" : "dark refuge runway" }; });
    return { kind: "refuge-runway-marks", marks };
  } };
}

export function createSoraDawnKeeperLogKit(options = {}) {
  const logCount = Math.floor(clamp(options.logCount ?? 3, 2, 5));
  return { id: "sora-dawn-keeper-log-kit", describe(input = {}) {
    const control = safeInput(input); const r = readiness(input); const prisms = input.starPrismAlignments?.prisms ?? []; const runways = input.refugeRunwayMarks?.marks ?? []; const prismScore = clamp(count(prisms, "aligned") / Math.max(1, prisms.length)); const runwayScore = clamp(count(runways, "open") / Math.max(1, runways.length)); const convoy = clamp((summary(input, "skyRescueReadiness").readyDawnConvoys ?? 0) / 3);
    const logs = Array.from({ length: logCount }, (_, index) => { const closure = clamp(r * 0.25 + prismScore * 0.22 + runwayScore * 0.24 + convoy * 0.2 + (control.launch ? 0.07 : 0) + index * 0.02); return { id: `dawn-keeper-log-${index}`, kind: "dawn-keeper-log", index, x: round(30 + index * 40 / Math.max(1, logCount - 1), 2), y: round(92 - closure * 24, 2), closure: round(closure), sealed: closure >= 0.66, label: closure >= 0.84 ? "sealed dawn keeper log" : closure >= 0.66 ? "signed dawn keeper log" : "open dawn keeper log" }; });
    return { kind: "dawn-keeper-logs", logs };
  } };
}

export function createSoraSkyLighthouseRendererHandoffKit() {
  return { id: "sora-sky-lighthouse-renderer-handoff-kit", describe(input = {}) {
    const descriptors = { cloudLensFocuses: input.cloudLensFocuses ?? { lenses: [] }, starPrismAlignments: input.starPrismAlignments ?? { prisms: [] }, windBuoyChains: input.windBuoyChains ?? { buoys: [] }, stormLanternWarnings: input.stormLanternWarnings ?? { lanterns: [] }, refugeRunwayMarks: input.refugeRunwayMarks ?? { marks: [] }, dawnKeeperLogs: input.dawnKeeperLogs ?? { logs: [] } };
    const descriptorCounts = { cloudLenses: descriptors.cloudLensFocuses.lenses.length, starPrisms: descriptors.starPrismAlignments.prisms.length, windBuoys: descriptors.windBuoyChains.buoys.length, stormLanterns: descriptors.stormLanternWarnings.lanterns.length, refugeRunways: descriptors.refugeRunwayMarks.marks.length, dawnKeeperLogs: descriptors.dawnKeeperLogs.logs.length };
    return { kind: "sora-sky-lighthouse-renderer-handoff", contract: "renderer consumes descriptors only", descriptors, descriptorCounts, forbiddenOwnership };
  } };
}

export function createSoraSkyLighthouseReadinessDomainKit(options = {}) {
  const lensKit = createSoraCloudLensFocusKit(options), prismKit = createSoraStarPrismAlignmentKit(options), buoyKit = createSoraWindBuoyChainKit(options), lanternKit = createSoraStormLanternWarningKit(options), runwayKit = createSoraRefugeRunwayMarkKit(options), logKit = createSoraDawnKeeperLogKit(options), rendererHandoffKit = createSoraSkyLighthouseRendererHandoffKit(options);
  const kits = [lensKit, prismKit, buoyKit, lanternKit, runwayKit, logKit, rendererHandoffKit];
  return { id: "sora-sky-lighthouse-readiness-domain-kit", tree: SORA_SKY_LIGHTHOUSE_READINESS_DOMAIN_TREE, kits: kits.map((kit) => kit.id), describe(input = {}) {
    const cloudLensFocuses = lensKit.describe(input); const starPrismAlignments = prismKit.describe(input); const windBuoyChains = buoyKit.describe(input); const stormLanternWarnings = lanternKit.describe(input); const refugeRunwayMarks = runwayKit.describe({ ...input, cloudLensFocuses, windBuoyChains }); const dawnKeeperLogs = logKit.describe({ ...input, starPrismAlignments, refugeRunwayMarks });
    const rendererHandoff = rendererHandoffKit.describe({ cloudLensFocuses, starPrismAlignments, windBuoyChains, stormLanternWarnings, refugeRunwayMarks, dawnKeeperLogs });
    const summary = { focusedCloudLenses: count(cloudLensFocuses.lenses, "focused"), alignedStarPrisms: count(starPrismAlignments.prisms, "aligned"), connectedWindBuoys: count(windBuoyChains.buoys, "connected"), quietStormLanterns: count(stormLanternWarnings.lanterns, "quiet"), openRefugeRunways: count(refugeRunwayMarks.marks, "open"), sealedDawnKeeperLogs: count(dawnKeeperLogs.logs, "sealed"), descriptorCount: Object.values(rendererHandoff.descriptorCounts).reduce((sum, itemCount) => sum + itemCount, 0) };
    return { kind: "sora-sky-lighthouse-readiness-domain", cloudLensFocuses, starPrismAlignments, windBuoyChains, stormLanternWarnings, refugeRunwayMarks, dawnKeeperLogs, rendererHandoff, summary };
  } };
}

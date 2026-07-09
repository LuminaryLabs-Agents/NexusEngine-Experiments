const arr = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, n(value, min)));
const c01 = (value) => clamp(value, 0, 1);
const r = (value, digits = 3) => Number(n(value).toFixed(digits));
const camPos = (camera = {}) => Array.isArray(camera.position)
  ? { x: n(camera.position[0]), y: n(camera.position[1]), z: n(camera.position[2]) }
  : { x: n(camera.position?.x), y: n(camera.position?.y), z: n(camera.position?.z) };
const pos = (sample = {}, fallback = {}) => ({
  x: r(n(sample.x, fallback.x)),
  y: r(n(sample.height, sample.y ?? fallback.y), 1),
  z: r(n(sample.z, fallback.z))
});
const distance2d = (a = {}, b = {}) => Math.hypot(n(a.x) - n(b.x), n(a.z) - n(b.z));
const slopeRisk = (sample = {}) => c01(n(sample.slope, 16) / 48);
const elevation = (sample = {}) => n(sample.height, sample.y ?? 900);
const snowpack = (sample = {}) => c01(n(sample.material?.materialWeights?.snow, 0.08) * 0.68 + Math.max(0, elevation(sample) - 950) / 2100 * 0.32);
const ridgeExposure = (sample = {}, time = 0) => c01(slopeRisk(sample) * 0.42 + snowpack(sample) * 0.28 + Math.abs(Math.sin(n(sample.x) * 0.0013 + n(time) * 0.19)) * 0.3);
const visibilityScore = (sample = {}, time = 0) => c01(0.74 - ridgeExposure(sample, time) * 0.34 + Math.abs(Math.cos(n(sample.z) * 0.0011 + n(time) * 0.23)) * 0.2);
const stableTraverse = (sample = {}) => c01((1 - slopeRisk(sample)) * 0.48 + (1 - snowpack(sample)) * 0.16 + c01(n(sample.landform?.confidence, 0.55)) * 0.22 + c01(n(sample.material?.vegetationMask, sample.climate?.vegetationPotential ?? 0.22)) * 0.14);
const contract = (owner) => ({
  owner,
  rendererConsumes: "terrain glacier beacon rescue descriptors only",
  rendererMustOwn: ["presentation placement", "draw order", "color application", "view interpolation", "camera-relative projection"],
  rendererMustNotOwn: ["rescue truth", "terrain sampling", "browser input", "flight physics", "asset loading", "audio", "frame loop", "Three.js", "WebGL", "physics", "storage"]
});

export const TERRAIN_GLACIER_BEACON_RESCUE_READINESS_DOMAIN_TREE = Object.freeze({
  root: "terrain-glacier-beacon-rescue-readiness-domain",
  subdomains: [
    { id: "whiteout-navigation-domain", subdomains: [{ id: "moraine-cairn-domain", kits: ["terrain-moraine-cairn-beacon-kit"] }, { id: "signal-smoke-domain", kits: ["terrain-whiteout-signal-smoke-kit"] }] },
    { id: "traverse-stability-domain", subdomains: [{ id: "ice-bridge-flag-domain", kits: ["terrain-ice-bridge-flag-kit"] }, { id: "crevasse-rope-domain", subdomains: [{ id: "rope-tension-domain", kits: ["terrain-crevasse-rope-rake-kit"] }] }] },
    { id: "rescue-handoff-domain", subdomains: [{ id: "rescue-sled-cache-domain", kits: ["terrain-rescue-sled-cache-kit"] }, { id: "dawn-beacon-ledger-domain", kits: ["terrain-dawn-beacon-ledger-kit"] }] },
    { id: "renderer-handoff", kits: ["terrain-glacier-beacon-rescue-renderer-handoff-kit"], contract: "renderer consumes descriptors only" }
  ],
  contract: "renderer consumes terrain glacier beacon rescue descriptors only; no DOM, browser input, Three.js, WebGL, audio, asset loading, physics, storage, or frame-loop ownership"
});

export function createTerrainMoraineCairnBeaconKit({ maxCairns = 6 } = {}) {
  return { id: "terrain-moraine-cairn-beacon-kit", domain: "terrain-glacier-beacon-rescue-readiness/whiteout-navigation-domain/moraine-cairn-domain", describe(input = {}) {
    const cam = camPos(input.camera);
    return arr(input.samples).map((sample, index) => {
      const p = pos(sample, cam);
      const visibility = visibilityScore(sample, input.time);
      const anchoring = c01(stableTraverse(sample) * 0.48 + (1 - ridgeExposure(sample, input.time)) * 0.22 + c01(distance2d(p, cam) / 2500) * 0.12 + 0.18);
      return { id: `glacier-moraine-cairn-${sample.tag ?? index}`, kind: "glacier-moraine-cairn", label: sample.tag ?? `cairn-${index}`, position: { ...p, y: r(p.y + 18, 1) }, visibility: r(visibility), anchoring: r(anchoring), stackStones: Math.max(3, Math.round(4 + anchoring * 9)), status: anchoring > 0.66 && visibility > 0.54 ? "beacon-ready" : visibility > 0.38 ? "needs-stacking" : "lost-in-spindrift", rendererContract: contract("terrain-moraine-cairn-beacon-kit") };
    }).sort((a, b) => (b.anchoring + b.visibility) - (a.anchoring + a.visibility)).slice(0, maxCairns);
  }, snapshot(input) { const cairns = this.describe(input); return { cairns: cairns.length, ready: cairns.filter((entry) => entry.status === "beacon-ready").length }; } };
}

export function createTerrainWhiteoutSignalSmokeKit({ maxSignals = 5 } = {}) {
  return { id: "terrain-whiteout-signal-smoke-kit", domain: "terrain-glacier-beacon-rescue-readiness/whiteout-navigation-domain/signal-smoke-domain", describe(input = {}) {
    return arr(input.samples).map((sample, index) => {
      const p = pos(sample);
      const windBreak = c01((1 - ridgeExposure(sample, input.time)) * 0.48 + stableTraverse(sample) * 0.22 + c01(n(sample.material?.materialWeights?.soil, 0.22)) * 0.12 + 0.18);
      const plumeVisibility = c01(visibilityScore(sample, input.time) * 0.56 + windBreak * 0.32 + Math.abs(Math.sin(index + n(input.time) * 0.31)) * 0.12);
      return { id: `glacier-whiteout-smoke-${sample.tag ?? index}`, kind: "glacier-whiteout-signal-smoke", position: { ...p, y: r(p.y + 42, 1) }, plumeVisibility: r(plumeVisibility), windBreak: r(windBreak), smokePulses: Math.max(2, Math.round(3 + plumeVisibility * 8)), status: plumeVisibility > 0.66 ? "visible-column" : plumeVisibility > 0.42 ? "low-smoke" : "whiteout-swallowed", rendererContract: contract("terrain-whiteout-signal-smoke-kit") };
    }).sort((a, b) => b.plumeVisibility - a.plumeVisibility).slice(0, maxSignals);
  }, snapshot(input) { const signals = this.describe(input); return { signals: signals.length, visible: signals.filter((entry) => entry.status === "visible-column").length }; } };
}

export function createTerrainIceBridgeFlagKit({ maxFlags = 6 } = {}) {
  return { id: "terrain-ice-bridge-flag-kit", domain: "terrain-glacier-beacon-rescue-readiness/traverse-stability-domain/ice-bridge-flag-domain", describe(input = {}) {
    return arr(input.samples).map((sample, index) => {
      const p = pos(sample);
      const bridgeScore = c01(stableTraverse(sample) * 0.44 + snowpack(sample) * 0.18 + (1 - ridgeExposure(sample, input.time)) * 0.24 + c01(n(sample.hydrology?.flow?.wetnessIndex, 0.16)) * 0.14);
      return { id: `glacier-ice-bridge-flag-${sample.tag ?? index}`, kind: "glacier-ice-bridge-flag", position: { ...p, y: r(p.y + 12, 1) }, bridgeScore: r(bridgeScore), flagCount: Math.max(2, Math.round(2 + bridgeScore * 7)), spanMeters: r(34 + bridgeScore * 110, 1), status: bridgeScore > 0.68 ? "flagged-crossing" : bridgeScore > 0.43 ? "probe-first" : "unsafe-span", rendererContract: contract("terrain-ice-bridge-flag-kit") };
    }).sort((a, b) => b.bridgeScore - a.bridgeScore).slice(0, maxFlags);
  }, snapshot(input) { const flags = this.describe(input); return { flags: flags.length, safe: flags.filter((entry) => entry.status === "flagged-crossing").length }; } };
}

export function createTerrainCrevasseRopeRakeKit({ maxRopes = 5 } = {}) {
  return { id: "terrain-crevasse-rope-rake-kit", domain: "terrain-glacier-beacon-rescue-readiness/traverse-stability-domain/crevasse-rope-domain/rope-tension-domain", describe(input = {}) {
    const flags = createTerrainIceBridgeFlagKit({ maxFlags: maxRopes + 2 }).describe(input);
    return flags.slice(0, maxRopes).map((flag, index) => {
      const target = flags[index + 1] ?? flags[0] ?? flag;
      const lengthMeters = distance2d(flag.position, target.position);
      const tension = c01((flag.bridgeScore + (target.bridgeScore ?? flag.bridgeScore)) * 0.42 + (1 - c01(lengthMeters / 4200)) * 0.22 + 0.12);
      return { id: `glacier-crevasse-rope-${index}`, kind: "glacier-crevasse-rope-rake", from: flag.position, to: target.position, lengthMeters: r(lengthMeters, 1), tension: r(tension), knots: Math.max(3, Math.round(lengthMeters / 190)), status: tension > 0.66 ? "taut-route" : tension > 0.42 ? "slack-watch" : "rope-gap", rendererContract: contract("terrain-crevasse-rope-rake-kit") };
    });
  }, snapshot(input) { const ropes = this.describe(input); return { ropes: ropes.length, taut: ropes.filter((entry) => entry.status === "taut-route").length }; } };
}

export function createTerrainRescueSledCacheKit({ maxCaches = 4 } = {}) {
  return { id: "terrain-rescue-sled-cache-kit", domain: "terrain-glacier-beacon-rescue-readiness/rescue-handoff-domain/rescue-sled-cache-domain", describe(input = {}) {
    return arr(input.samples).map((sample, index) => {
      const p = pos(sample);
      const cacheScore = c01(stableTraverse(sample) * 0.38 + visibilityScore(sample, input.time) * 0.24 + (1 - slopeRisk(sample)) * 0.18 + c01(distance2d(p, camPos(input.camera)) / 3000) * 0.08 + 0.12);
      return { id: `glacier-rescue-sled-cache-${sample.tag ?? index}`, kind: "glacier-rescue-sled-cache", position: { ...p, y: r(p.y + 8, 1) }, cacheScore: r(cacheScore), blankets: Math.max(1, Math.round(1 + cacheScore * 6)), sledCapacity: Math.max(1, Math.round(1 + cacheScore * 3)), status: cacheScore > 0.66 ? "staged" : cacheScore > 0.42 ? "needs-cover" : "bury-risk", rendererContract: contract("terrain-rescue-sled-cache-kit") };
    }).sort((a, b) => b.cacheScore - a.cacheScore).slice(0, maxCaches);
  }, snapshot(input) { const caches = this.describe(input); return { caches: caches.length, staged: caches.filter((entry) => entry.status === "staged").length }; } };
}

export function createTerrainDawnBeaconLedgerKit() {
  return { id: "terrain-dawn-beacon-ledger-kit", domain: "terrain-glacier-beacon-rescue-readiness/rescue-handoff-domain/dawn-beacon-ledger-domain", describe(input = {}) {
    const cairns = createTerrainMoraineCairnBeaconKit().describe(input);
    const smokes = createTerrainWhiteoutSignalSmokeKit().describe(input);
    const flags = createTerrainIceBridgeFlagKit().describe(input);
    const ropes = createTerrainCrevasseRopeRakeKit().describe(input);
    const caches = createTerrainRescueSledCacheKit().describe(input);
    const readyCairns = cairns.filter((entry) => entry.status === "beacon-ready").length;
    const visibleSignals = smokes.filter((entry) => entry.status === "visible-column").length;
    const safeFlags = flags.filter((entry) => entry.status === "flagged-crossing").length;
    const tautRopes = ropes.filter((entry) => entry.status === "taut-route").length;
    const stagedCaches = caches.filter((entry) => entry.status === "staged").length;
    const readiness = c01(0.06 + readyCairns * 0.1 + visibleSignals * 0.1 + safeFlags * 0.09 + tautRopes * 0.1 + stagedCaches * 0.12);
    const whiteoutRisk = c01(1 - readiness + arr(input.samples).reduce((sum, sample) => sum + ridgeExposure(sample, input.time), 0) / Math.max(1, arr(input.samples).length) * 0.18);
    return [{ id: "glacier-dawn-beacon-ledger", kind: "glacier-dawn-beacon-ledger", readiness: r(readiness), whiteoutRisk: r(whiteoutRisk), readyCairns, visibleSignals, safeFlags, tautRopes, stagedCaches, totalDescriptors: cairns.length + smokes.length + flags.length + ropes.length + caches.length + 1, status: readiness > 0.72 ? "route-secure" : readiness > 0.45 ? "flagged-approach" : "lost-in-whiteout", rendererContract: contract("terrain-dawn-beacon-ledger-kit") }];
  }, snapshot(input) { return this.describe(input)[0]; } };
}

export function createTerrainGlacierBeaconRescueRendererHandoffKit() {
  return { id: "terrain-glacier-beacon-rescue-renderer-handoff-kit", domain: "terrain-glacier-beacon-rescue-readiness/renderer-handoff", describe(input = {}) {
    const descriptors = {
      moraineCairns: createTerrainMoraineCairnBeaconKit().describe(input),
      signalSmokes: createTerrainWhiteoutSignalSmokeKit().describe(input),
      iceBridgeFlags: createTerrainIceBridgeFlagKit().describe(input),
      crevasseRopes: createTerrainCrevasseRopeRakeKit().describe(input),
      rescueSledCaches: createTerrainRescueSledCacheKit().describe(input),
      dawnBeaconLedgers: createTerrainDawnBeaconLedgerKit().describe(input)
    };
    const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, value.length]));
    counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
    return { id: "terrain-glacier-beacon-rescue-renderer-handoff", kind: "renderer-handoff", descriptors, counts, rendererConsumesDescriptorsOnly: true, rendererContract: contract("terrain-glacier-beacon-rescue-renderer-handoff-kit") };
  } };
}

export function createTerrainGlacierBeaconRescueReadinessDomainKit() {
  const handoffKit = createTerrainGlacierBeaconRescueRendererHandoffKit();
  return { id: "terrain-glacier-beacon-rescue-readiness-domain-kit", domain: TERRAIN_GLACIER_BEACON_RESCUE_READINESS_DOMAIN_TREE.root, tree: TERRAIN_GLACIER_BEACON_RESCUE_READINESS_DOMAIN_TREE, domainTree: TERRAIN_GLACIER_BEACON_RESCUE_READINESS_DOMAIN_TREE, describe(input = {}) {
    const rendererHandoff = handoffKit.describe(input);
    const ledger = rendererHandoff.descriptors.dawnBeaconLedgers[0] ?? createTerrainDawnBeaconLedgerKit().describe(input)[0];
    return { id: "terrain-glacier-beacon-rescue-readiness", kind: "terrain-glacier-beacon-rescue-readiness", domain: this.domain, domainTree: this.domainTree, ...rendererHandoff.descriptors, summary: { readiness: ledger.readiness, whiteoutRisk: ledger.whiteoutRisk, status: ledger.status, totalDescriptors: rendererHandoff.counts.total }, rendererHandoff, rendererConsumesDescriptorsOnly: true };
  }, snapshot(input) { const described = this.describe(input); return { readiness: described.summary.readiness, whiteoutRisk: described.summary.whiteoutRisk, status: described.summary.status, descriptors: described.summary.totalDescriptors }; } };
}

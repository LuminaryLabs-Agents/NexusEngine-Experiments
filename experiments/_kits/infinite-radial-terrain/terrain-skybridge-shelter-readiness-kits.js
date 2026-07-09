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
const dist = (a = {}, b = {}) => Math.hypot(n(a.x) - n(b.x), n(a.z) - n(b.z));
const altitude = (sample = {}) => c01((n(sample.height, sample.y) - 620) / 2300);
const ridge = (sample = {}) => c01(n(sample.landform?.terrainRuggedness, 0.32) * 0.58 + altitude(sample) * 0.3 + c01(n(sample.slope, 14) / 48) * 0.12);
const cold = (sample = {}) => c01((5 - n(sample.climate?.temperatureC, 6)) / 22 + c01(sample.material?.materialWeights?.snow) * 0.24 + altitude(sample) * 0.28);
const visibility = (sample = {}, time = 0) => c01(0.78 - cold(sample) * 0.22 - ridge(sample) * 0.16 + c01(sample.landform?.confidence ?? 0.48) * 0.18 + Math.sin(n(time) * 0.41 + n(sample.x) * 0.0006) * 0.05);
const crevasse = (sample = {}, time = 0) => c01(ridge(sample) * 0.38 + cold(sample) * 0.28 + c01(n(sample.slope, 12) / 45) * 0.22 + Math.abs(Math.sin(n(time) * 0.72 + n(sample.z) * 0.0005)) * 0.12);
const contract = (owner) => ({
  owner,
  rendererConsumes: "terrain skybridge shelter descriptors only",
  rendererMustOwn: ["DOM placement", "Canvas/Three draw order", "color application", "view interpolation"],
  rendererMustNotOwn: ["shelter truth", "terrain sampling", "browser input", "flight physics", "asset loading", "audio", "frame loop", "Three.js", "WebGL", "physics"]
});

export const TERRAIN_SKYBRIDGE_SHELTER_READINESS_DOMAIN_TREE = Object.freeze({
  root: "terrain-skybridge-shelter-readiness-domain",
  subdomains: [
    { id: "bridge-routing-domain", subdomains: [{ id: "ridge-anchor-domain", kits: ["terrain-skybridge-ridge-anchor-kit"] }, { id: "span-cable-domain", kits: ["terrain-skybridge-span-cable-kit"] }] },
    { id: "shelter-safety-domain", subdomains: [{ id: "heat-tent-domain", kits: ["terrain-skybridge-heat-tent-kit"] }, { id: "crevasse-warning-domain", kits: ["terrain-skybridge-crevasse-warning-kit"] }] },
    { id: "rescue-handoff-domain", subdomains: [{ id: "beacon-mirror-domain", kits: ["terrain-skybridge-beacon-mirror-kit"] }, { id: "shelter-ledger-domain", kits: ["terrain-skybridge-shelter-ledger-kit"] }] },
    { id: "renderer-handoff", kits: ["terrain-skybridge-shelter-renderer-handoff-kit"], contract: "renderer consumes descriptors only" }
  ],
  contract: "renderer consumes terrain skybridge shelter descriptors only; no DOM, browser input, Three.js, WebGL, audio, asset loading, physics, or frame-loop ownership"
});

export function createTerrainSkybridgeRidgeAnchorKit({ maxAnchors = 5 } = {}) {
  return { id: "terrain-skybridge-ridge-anchor-kit", domain: "terrain-skybridge-shelter-readiness/bridge-routing-domain/ridge-anchor-domain", describe(input = {}) {
    const cam = camPos(input.camera);
    return arr(input.samples).map((sample, index) => {
      const p = pos(sample, cam);
      const anchorConfidence = c01(ridge(sample) * 0.36 + visibility(sample, input.time) * 0.34 + c01(sample.landform?.confidence ?? 0.5) * 0.18 + (1 - c01(dist(p, cam) / 7600)) * 0.12);
      return { id: `skybridge-ridge-anchor-${sample.tag ?? index}`, kind: "skybridge-ridge-anchor", label: sample.tag ?? `anchor-${index}`, position: { ...p, y: r(p.y + 36, 1) }, anchorConfidence: r(anchorConfidence), loadRating: Math.max(1, Math.round(anchorConfidence * 8)), status: anchorConfidence > 0.68 ? "bolt-ready" : anchorConfidence > 0.42 ? "needs-picket" : "unsafe-ridge", rendererContract: contract("terrain-skybridge-ridge-anchor-kit") };
    }).sort((a, b) => b.anchorConfidence - a.anchorConfidence).slice(0, maxAnchors);
  }, snapshot(input) { const anchors = this.describe(input); return { anchors: anchors.length, ready: anchors.filter((anchor) => anchor.status === "bolt-ready").length }; } };
}

export function createTerrainSkybridgeSpanCableKit({ maxSpans = 4 } = {}) {
  return { id: "terrain-skybridge-span-cable-kit", domain: "terrain-skybridge-shelter-readiness/bridge-routing-domain/span-cable-domain", describe(input = {}) {
    const anchors = createTerrainSkybridgeRidgeAnchorKit({ maxAnchors: maxSpans + 1 }).describe(input);
    return anchors.slice(0, maxSpans).map((anchor, index) => {
      const next = anchors[index + 1] ?? anchors[0] ?? anchor;
      const spanLengthMeters = dist(anchor.position, next.position);
      const sag = c01(spanLengthMeters / 4800 + (1 - anchor.anchorConfidence) * 0.32 + (1 - (next.anchorConfidence ?? anchor.anchorConfidence)) * 0.18);
      return { id: `skybridge-span-cable-${index}`, kind: "skybridge-span-cable", from: anchor.position, to: next.position, spanLengthMeters: r(spanLengthMeters, 1), sag: r(sag), cableCount: sag < 0.35 ? 2 : sag < 0.62 ? 3 : 5, status: sag < 0.35 ? "open-span" : sag < 0.62 ? "rope-team" : "do-not-cross", rendererContract: contract("terrain-skybridge-span-cable-kit") };
    });
  }, snapshot(input) { const spans = this.describe(input); return { spans: spans.length, open: spans.filter((span) => span.status === "open-span").length }; } };
}

export function createTerrainSkybridgeHeatTentKit({ maxTents = 4 } = {}) {
  return { id: "terrain-skybridge-heat-tent-kit", domain: "terrain-skybridge-shelter-readiness/shelter-safety-domain/heat-tent-domain", describe(input = {}) {
    return arr(input.samples).map((sample, index) => {
      const p = pos(sample);
      const heatNeed = c01(cold(sample) * 0.48 + crevasse(sample, input.time) * 0.18 + (1 - visibility(sample, input.time)) * 0.2 + index * 0.018);
      const fuelConfidence = c01(0.78 - heatNeed * 0.34 + c01(sample.climate?.vegetationPotential ?? sample.material?.vegetationMask ?? 0.2) * 0.22);
      return { id: `skybridge-heat-tent-${sample.tag ?? index}`, kind: "skybridge-heat-tent", center: { ...p, y: r(p.y + 22, 1) }, radiusMeters: r(85 + heatNeed * 180, 1), heatNeed: r(heatNeed), fuelConfidence: r(fuelConfidence), status: fuelConfidence > 0.66 ? "warm" : fuelConfidence > 0.42 ? "ration-fuel" : "hypothermia-risk", rendererContract: contract("terrain-skybridge-heat-tent-kit") };
    }).sort((a, b) => b.heatNeed - a.heatNeed).slice(0, maxTents);
  }, snapshot(input) { const tents = this.describe(input); return { tents: tents.length, warm: tents.filter((tent) => tent.status === "warm").length }; } };
}

export function createTerrainSkybridgeCrevasseWarningKit({ maxWarnings = 5 } = {}) {
  return { id: "terrain-skybridge-crevasse-warning-kit", domain: "terrain-skybridge-shelter-readiness/shelter-safety-domain/crevasse-warning-domain", describe(input = {}) {
    return arr(input.samples).map((sample, index) => {
      const p = pos(sample);
      const risk = crevasse(sample, input.time);
      return { id: `skybridge-crevasse-warning-${sample.tag ?? index}`, kind: "skybridge-crevasse-warning", center: { ...p, y: r(p.y + 8, 1) }, radiusMeters: r(70 + risk * 260, 1), risk: r(risk), picketSpacingMeters: Math.max(12, Math.round(46 - risk * 28)), status: risk > 0.7 ? "closed" : risk > 0.44 ? "marked" : "clear", rendererContract: contract("terrain-skybridge-crevasse-warning-kit") };
    }).sort((a, b) => b.risk - a.risk).slice(0, maxWarnings);
  }, snapshot(input) { const warnings = this.describe(input); return { warnings: warnings.length, closed: warnings.filter((warning) => warning.status === "closed").length }; } };
}

export function createTerrainSkybridgeBeaconMirrorKit({ maxMirrors = 4 } = {}) {
  return { id: "terrain-skybridge-beacon-mirror-kit", domain: "terrain-skybridge-shelter-readiness/rescue-handoff-domain/beacon-mirror-domain", describe(input = {}) {
    const cam = camPos(input.camera);
    return arr(input.samples).map((sample, index) => {
      const p = pos(sample, cam);
      const mirrorSignal = c01(visibility(sample, input.time) * 0.46 + altitude(sample) * 0.22 + (1 - c01(dist(p, cam) / 8200)) * 0.18 + Math.max(0, Math.sin(n(input.time) * 0.31 + index)) * 0.14);
      return { id: `skybridge-beacon-mirror-${sample.tag ?? index}`, kind: "skybridge-beacon-mirror", position: { ...p, y: r(p.y + 145, 1) }, mirrorSignal: r(mirrorSignal), flashesPerMinute: Math.max(2, Math.round(4 + mirrorSignal * 12)), status: mirrorSignal > 0.68 ? "seen" : mirrorSignal > 0.42 ? "relay-needed" : "lost-in-glare", rendererContract: contract("terrain-skybridge-beacon-mirror-kit") };
    }).sort((a, b) => b.mirrorSignal - a.mirrorSignal).slice(0, maxMirrors);
  }, snapshot(input) { const mirrors = this.describe(input); return { mirrors: mirrors.length, seen: mirrors.filter((mirror) => mirror.status === "seen").length }; } };
}

export function createTerrainSkybridgeShelterLedgerKit() {
  return { id: "terrain-skybridge-shelter-ledger-kit", domain: "terrain-skybridge-shelter-readiness/rescue-handoff-domain/shelter-ledger-domain", describe(input = {}) {
    const anchors = createTerrainSkybridgeRidgeAnchorKit().describe(input);
    const spans = createTerrainSkybridgeSpanCableKit().describe(input);
    const tents = createTerrainSkybridgeHeatTentKit().describe(input);
    const warnings = createTerrainSkybridgeCrevasseWarningKit().describe(input);
    const mirrors = createTerrainSkybridgeBeaconMirrorKit().describe(input);
    const anchorReady = anchors.filter((anchor) => anchor.status === "bolt-ready").length;
    const openSpans = spans.filter((span) => span.status === "open-span").length;
    const warmTents = tents.filter((tent) => tent.status === "warm").length;
    const closedWarnings = warnings.filter((warning) => warning.status === "closed").length;
    const seenMirrors = mirrors.filter((mirror) => mirror.status === "seen").length;
    const readiness = c01(anchorReady * 0.1 + openSpans * 0.13 + warmTents * 0.08 + seenMirrors * 0.1 + 0.22 - closedWarnings * 0.07);
    const exposure = c01(1 - readiness + closedWarnings * 0.08 + cold(input.terrainSample ?? arr(input.samples)[0] ?? {}) * 0.18);
    return [{ id: "skybridge-shelter-ledger", kind: "skybridge-shelter-ledger", readiness: r(readiness), exposure: r(exposure), anchorReady, openSpans, warmTents, closedWarnings, seenMirrors, status: readiness > 0.68 ? "shelter-open" : readiness > 0.42 ? "guided-crossing" : "hold-at-ridge", rendererContract: contract("terrain-skybridge-shelter-ledger-kit") }];
  }, snapshot(input) { return this.describe(input)[0]; } };
}

export function createTerrainSkybridgeShelterRendererHandoffKit() {
  return { id: "terrain-skybridge-shelter-renderer-handoff-kit", domain: "terrain-skybridge-shelter-readiness/renderer-handoff", describe(input = {}) {
    const descriptors = {
      ridgeAnchors: createTerrainSkybridgeRidgeAnchorKit().describe(input),
      spanCables: createTerrainSkybridgeSpanCableKit().describe(input),
      heatTents: createTerrainSkybridgeHeatTentKit().describe(input),
      crevasseWarnings: createTerrainSkybridgeCrevasseWarningKit().describe(input),
      beaconMirrors: createTerrainSkybridgeBeaconMirrorKit().describe(input),
      shelterLedgers: createTerrainSkybridgeShelterLedgerKit().describe(input)
    };
    const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, value.length]));
    counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
    return { id: "terrain-skybridge-shelter-renderer-handoff", kind: "renderer-handoff", descriptors, counts, rendererConsumesDescriptorsOnly: true, rendererContract: contract("terrain-skybridge-shelter-renderer-handoff-kit") };
  } };
}

export function createTerrainSkybridgeShelterReadinessDomainKit() {
  const handoffKit = createTerrainSkybridgeShelterRendererHandoffKit();
  return { id: "terrain-skybridge-shelter-readiness-domain-kit", domain: TERRAIN_SKYBRIDGE_SHELTER_READINESS_DOMAIN_TREE.root, tree: TERRAIN_SKYBRIDGE_SHELTER_READINESS_DOMAIN_TREE, domainTree: TERRAIN_SKYBRIDGE_SHELTER_READINESS_DOMAIN_TREE, describe(input = {}) {
    const rendererHandoff = handoffKit.describe(input);
    const ledger = rendererHandoff.descriptors.shelterLedgers[0];
    const missionState = ledger.status === "shelter-open" ? "open" : ledger.status === "guided-crossing" ? "guide" : "hold";
    return {
      id: "terrain-skybridge-shelter-readiness",
      domain: TERRAIN_SKYBRIDGE_SHELTER_READINESS_DOMAIN_TREE.root,
      kind: "domain-readiness",
      domainTree: TERRAIN_SKYBRIDGE_SHELTER_READINESS_DOMAIN_TREE,
      ridgeAnchors: rendererHandoff.descriptors.ridgeAnchors,
      spanCables: rendererHandoff.descriptors.spanCables,
      heatTents: rendererHandoff.descriptors.heatTents,
      crevasseWarnings: rendererHandoff.descriptors.crevasseWarnings,
      beaconMirrors: rendererHandoff.descriptors.beaconMirrors,
      shelterLedgers: rendererHandoff.descriptors.shelterLedgers,
      readiness: ledger.readiness,
      exposure: ledger.exposure,
      missionState,
      rendererHandoff,
      summary: { readiness: ledger.readiness, exposure: ledger.exposure, missionState, descriptorCount: rendererHandoff.counts.total, status: ledger.status }
    };
  }, snapshot(input) { const described = this.describe(input); return { ...described.summary, handoffBuckets: Object.keys(described.rendererHandoff.descriptors) }; } };
}

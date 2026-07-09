const stableArray = (value) => Array.isArray(value) ? [...value] : [];
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const clamp01 = (value) => clamp(value, 0, 1);
const round = (value, digits = 3) => Number((Number(value) || 0).toFixed(digits));
const dist = (a = {}, b = {}) => Math.hypot(Number(a.x ?? 0) - Number(b.x ?? 0), Number(a.z ?? a.y ?? 0) - Number(b.z ?? b.y ?? 0));

function pos(entry = {}, fallback = {}) {
  const source = entry.transform ?? entry.position ?? entry;
  return { x: Number(source.x ?? fallback.x ?? 0), z: Number(source.z ?? source.y ?? fallback.z ?? fallback.y ?? 0) };
}
function objectById(level = {}, id) { return stableArray(level.sceneRecipe?.objects).find((entry) => entry.id === id) ?? null; }
function nearest(items, target) { return stableArray(items).map((entry) => ({ entry, distance: dist(pos(entry), target) })).sort((a, b) => a.distance - b.distance)[0]?.entry ?? null; }
function progressScore(input = {}) {
  const session = input.session ?? {};
  const facts = new Set(stableArray(session.completedFacts));
  const scanCount = [...facts].filter((fact) => String(fact).startsWith("scan.")).length;
  return clamp01(scanCount * 0.11 + (facts.has("build.signal-mast.01") ? 0.18 : 0) + (facts.has("pressure.wave.01.survived") ? 0.16 : 0) + (facts.has("lock.gate.01") ? 0.16 : 0) + (facts.has("cargo.delivered.01") ? 0.2 : 0) + (session.gateUnlocked ? 0.08 : 0));
}
function surgePressure(input = {}) {
  const session = input.session ?? {};
  const elapsed = Number(input.elapsed ?? session.elapsed ?? 0);
  const pressure = session.phase === "pressure" ? 0.74 : 0.36;
  const tide = 0.5 + Math.sin(elapsed * 0.19) * 0.22;
  const spore = Number(session.player?.sporeLoad ?? 0) * 0.18;
  return clamp01(pressure + tide * 0.22 + spore - progressScore(input) * 0.18);
}
function ownership(owner) {
  return { owner, rendererConsumes: "serializable storm surge relay descriptors only", rendererMustOwn: ["DOM", "browser input", "Three.js", "WebGL", "audio", "asset loading", "frame loop", "draw order", "camera interpolation"], rendererMustNotOwn: ["storm surge readiness scoring", "evacuation routing", "objective truth", "session mutation", "collision", "resources", "checkpoint state"] };
}
function descriptorCounts(descriptors = {}) { return Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : value ? 1 : 0])); }

export const SIGNAL_ISLES_STORM_SURGE_RELAY_READINESS_DOMAIN_TREE = Object.freeze({
  root: "signal-isles-storm-surge-relay-readiness-domain",
  subdomains: [
    { id: "surge-detection-domain", subdomains: [{ id: "tide-gauge-domain", kits: ["signal-isles-tide-gauge-beacon-kit"] }, { id: "breakwater-brace-domain", kits: ["signal-isles-breakwater-brace-node-kit"] }] },
    { id: "relay-stabilization-domain", subdomains: [{ id: "skiff-anchor-domain", kits: ["signal-isles-skiff-anchor-buoy-kit"] }, { id: "flare-mast-domain", kits: ["signal-isles-flare-mast-ping-kit"] }] },
    { id: "evacuation-accounting-domain", subdomains: [{ id: "raft-transfer-domain", subdomains: [{ id: "raft-lane-domain", kits: ["signal-isles-evacuation-raft-lane-kit"] }, { id: "surge-manifest-domain", kits: ["signal-isles-surge-manifest-ledger-kit"] }] }] },
    { id: "renderer-handoff", kits: ["signal-isles-storm-surge-relay-renderer-handoff-kit"], contract: "renderer consumes descriptors only" }
  ],
  contract: "renderer consumes storm surge relay descriptors only; no DOM, browser input, Three.js, WebGL, audio, asset loading, physics, or frame-loop ownership"
});

export function createSignalIslesTideGaugeBeaconKit() {
  return { id: "n-signal-isles-tide-gauge-beacon-kit", domain: "signal-isles-storm-surge-relay-readiness/tide-gauge", describe(input = {}) {
    const pressure = surgePressure(input), level = input.level ?? {}, sites = stableArray(level.scanSites).slice(0, 3);
    return sites.map((site, index) => { const p = pos(site); const completed = stableArray(input.kitStates?.scanSurvey?.completedTargetIds).includes(site.id); const phase = pressure > 0.66 && !completed ? "rising" : completed ? "mapped" : "watch"; return { id: `tide-gauge-${site.id ?? index}`, kind: "storm-surge-tide-gauge", x: round(p.x + (index - 1) * 0.85), z: round(p.z - 1.1 - index * 0.24), radius: round(1.1 + pressure * 1.4), pressure: round(pressure), phase, active: true, color: phase === "rising" ? "#ffcf7a" : "#6df3ff", rendererContract: ownership("signal-isles-tide-gauge-beacon-kit") }; });
  }, snapshot(input) { const gauges = this.describe(input); return { gauges: gauges.length, rising: gauges.filter((gauge) => gauge.phase === "rising").length }; } };
}
export function createSignalIslesBreakwaterBraceNodeKit() {
  return { id: "n-signal-isles-breakwater-brace-node-kit", domain: "signal-isles-storm-surge-relay-readiness/breakwater-brace", describe(input = {}) {
    const level = input.level ?? {}, progress = progressScore(input), pressure = surgePressure(input), sites = [...stableArray(level.buildSites), ...stableArray(level.gates)].slice(0, 4);
    return sites.map((site, index) => { const p = pos(site); const braced = stableArray(input.session?.placedStructureIds).includes(site.structureId ?? site.id) || Boolean(input.session?.gateUnlocked && String(site.id).includes("gate")); const integrity = clamp01((braced ? 0.78 : 0.32) + progress * 0.22 - pressure * 0.18 + index * 0.025); return { id: `breakwater-brace-${site.structureId ?? site.id ?? index}`, kind: "storm-surge-breakwater-brace", x: round(p.x), z: round(p.z), radius: round(0.9 + integrity * 0.9), integrity: round(integrity), braced, active: true, color: braced ? "#8fffb5" : "#ff8f70", rendererContract: ownership("signal-isles-breakwater-brace-node-kit") }; });
  }, snapshot(input) { const braces = this.describe(input); return { braces: braces.length, braced: braces.filter((brace) => brace.braced).length }; } };
}
export function createSignalIslesSkiffAnchorBuoyKit() {
  return { id: "n-signal-isles-skiff-anchor-buoy-kit", domain: "signal-isles-storm-surge-relay-readiness/skiff-anchor-buoy", describe(input = {}) {
    const level = input.level ?? {}, progress = progressScore(input), pressure = surgePressure(input), sources = [...stableArray(level.resourceNodes), ...stableArray(level.cargo)].slice(0, 4);
    return sources.map((source, index) => { const p = pos(source); const secured = stableArray(input.session?.harvestedNodeIds).includes(source.id) || input.session?.cargoCarriedId === source.id || stableArray(input.session?.completedFacts).includes("cargo.delivered.01"); const hold = clamp01((secured ? 0.72 : 0.34) + progress * 0.18 - pressure * 0.12); return { id: `skiff-anchor-${source.id ?? index}`, kind: "storm-surge-skiff-anchor-buoy", x: round(p.x + Math.sin(index) * 0.72), z: round(p.z + Math.cos(index) * 0.72), radius: round(0.5 + hold * 0.8), hold: round(hold), secured, active: true, color: secured ? "#8fffb5" : "#ffd36d", rendererContract: ownership("signal-isles-skiff-anchor-buoy-kit") }; });
  }, snapshot(input) { const buoys = this.describe(input); return { buoys: buoys.length, secured: buoys.filter((buoy) => buoy.secured).length }; } };
}
export function createSignalIslesFlareMastPingKit() {
  return { id: "n-signal-isles-flare-mast-ping-kit", domain: "signal-isles-storm-surge-relay-readiness/flare-mast-ping", describe(input = {}) {
    const level = input.level ?? {}, progress = progressScore(input), pressure = surgePressure(input), mast = stableArray(level.buildSites)[0] ?? { x: 0, z: 0, id: "fallback-mast" }, beacon = objectById(level, "final-beacon")?.transform ?? { x: 0, z: 0, id: "final-beacon" };
    return [mast, beacon].map((entry, index) => { const p = pos(entry); const ready = index === 0 ? stableArray(input.session?.placedStructureIds).includes("signal-mast-01") : stableArray(input.session?.completedFacts).includes("cargo.delivered.01"); const charge = clamp01((ready ? 0.66 : 0.26) + progress * 0.24 + pressure * 0.09); return { id: index === 0 ? "flare-mast-signal-mast-01" : "flare-mast-final-beacon", kind: "storm-surge-flare-mast-ping", x: round(p.x), z: round(p.z), radius: round(1.2 + charge * 1.7), charge: round(charge), ready, active: true, color: ready ? "#8fffb5" : "#ffcf7a", rendererContract: ownership("signal-isles-flare-mast-ping-kit") }; });
  }, snapshot(input) { const pings = this.describe(input); return { pings: pings.length, ready: pings.filter((ping) => ping.ready).length }; } };
}
export function createSignalIslesEvacuationRaftLaneKit() {
  return { id: "n-signal-isles-evacuation-raft-lane-kit", domain: "signal-isles-storm-surge-relay-readiness/evacuation-raft-lane", describe(input = {}) {
    const level = input.level ?? {}, progress = progressScore(input), pressure = surgePressure(input), destination = objectById(level, "final-beacon")?.transform ?? stableArray(level.gates)[0] ?? { x: 0, z: 0 }, starts = [...stableArray(level.scanSites).slice(0, 2), ...stableArray(level.resourceNodes).slice(0, 1), ...stableArray(level.cargo).slice(0, 1)];
    return starts.map((start, index) => { const from = pos(start); const nearestGate = nearest(level.gates, from) ?? destination; const waypoint = pos(nearestGate); const to = index % 2 === 0 ? waypoint : pos(destination); const strength = clamp01(0.28 + progress * 0.42 + (1 - pressure) * 0.18 + index * 0.04); return { id: `evacuation-raft-lane-${start.id ?? index}`, kind: "storm-surge-evacuation-raft-lane", from: { x: round(from.x), z: round(from.z) }, to: { x: round(to.x), z: round(to.z) }, strength: round(strength), active: true, color: strength > 0.62 ? "#8fffb5" : "#6df3ff", rendererContract: ownership("signal-isles-evacuation-raft-lane-kit") }; });
  }, snapshot(input) { const lanes = this.describe(input); return { lanes: lanes.length, strong: lanes.filter((lane) => lane.strength > 0.62).length }; } };
}
export function createSignalIslesSurgeManifestLedgerKit() {
  return { id: "n-signal-isles-surge-manifest-ledger-kit", domain: "signal-isles-storm-surge-relay-readiness/surge-manifest-ledger", describe(input = {}) {
    const level = input.level ?? {}, progress = progressScore(input), pressure = surgePressure(input), exit = objectById(level, "final-beacon")?.transform ?? stableArray(level.gates)[0] ?? { x: 0, z: 0 }, p = pos(exit), waitingFacts = stableArray(input.sequence?.waitingFor), readiness = clamp01(progress * 0.78 + (1 - pressure) * 0.16 + (waitingFacts.length === 0 ? 0.12 : 0));
    return [{ id: "storm-surge-manifest-ledger", kind: "storm-surge-manifest-ledger", x: round(p.x + 1.2), z: round(p.z - 1.2), radius: round(1.15 + readiness * 1.65), readiness: round(readiness), waitingFor: waitingFacts, active: true, phase: readiness > 0.72 ? "launch" : pressure > 0.64 ? "hold" : "stage", color: readiness > 0.72 ? "#8fffb5" : pressure > 0.64 ? "#ff8f70" : "#ffd36d", rendererContract: ownership("signal-isles-surge-manifest-ledger-kit") }];
  }, snapshot(input) { const [ledger] = this.describe(input); return { readiness: ledger?.readiness ?? 0, phase: ledger?.phase ?? "unknown" }; } };
}
export function createSignalIslesStormSurgeRelayRendererHandoffKit() {
  return { id: "n-signal-isles-storm-surge-relay-renderer-handoff-kit", domain: "signal-isles-storm-surge-relay-readiness/renderer-handoff", describe(descriptors = {}) { const counts = descriptorCounts(descriptors); return { id: "signal-isles-storm-surge-relay-renderer-handoff", kind: "renderer-handoff", contract: ownership("signal-isles-storm-surge-relay-renderer-handoff-kit"), descriptors, counts: { ...counts, total: Object.values(counts).reduce((sum, count) => sum + count, 0) } }; } };
}
export function createSignalIslesStormSurgeRelayReadinessDomainKit() {
  const tideGaugeBeaconKit = createSignalIslesTideGaugeBeaconKit(); const breakwaterBraceNodeKit = createSignalIslesBreakwaterBraceNodeKit(); const skiffAnchorBuoyKit = createSignalIslesSkiffAnchorBuoyKit(); const flareMastPingKit = createSignalIslesFlareMastPingKit(); const evacuationRaftLaneKit = createSignalIslesEvacuationRaftLaneKit(); const surgeManifestLedgerKit = createSignalIslesSurgeManifestLedgerKit(); const rendererHandoffKit = createSignalIslesStormSurgeRelayRendererHandoffKit();
  return { id: "n-signal-isles-storm-surge-relay-readiness-domain-kit", domain: "signal-isles-storm-surge-relay-readiness", tree: SIGNAL_ISLES_STORM_SURGE_RELAY_READINESS_DOMAIN_TREE, describe(input = {}) { const tideGaugeBeacons = tideGaugeBeaconKit.describe(input); const breakwaterBraceNodes = breakwaterBraceNodeKit.describe(input); const skiffAnchorBuoys = skiffAnchorBuoyKit.describe(input); const flareMastPings = flareMastPingKit.describe(input); const evacuationRaftLanes = evacuationRaftLaneKit.describe(input); const surgeManifestLedgers = surgeManifestLedgerKit.describe(input); const pressure = surgePressure(input); const progress = progressScore(input); const descriptors = { tideGaugeBeacons, breakwaterBraceNodes, skiffAnchorBuoys, flareMastPings, evacuationRaftLanes, surgeManifestLedgers }; const rendererHandoff = rendererHandoffKit.describe(descriptors); return { id: "signal-isles-storm-surge-relay-readiness", domain: "signal-isles-storm-surge-relay-readiness-domain", tree: SIGNAL_ISLES_STORM_SURGE_RELAY_READINESS_DOMAIN_TREE, pressure: round(pressure), readiness: round(progress * 0.72 + (1 - pressure) * 0.18 + (surgeManifestLedgers[0]?.readiness ?? 0) * 0.1), missionState: surgeManifestLedgers[0]?.phase ?? "stage", ...descriptors, rendererHandoff, rendererContract: ownership("signal-isles-storm-surge-relay-readiness-domain-kit") }; }, snapshot(input) { const state = this.describe(input); return { readiness: state.readiness, pressure: state.pressure, descriptors: state.rendererHandoff.counts.total, missionState: state.missionState }; } };
}
export default createSignalIslesStormSurgeRelayReadinessDomainKit;

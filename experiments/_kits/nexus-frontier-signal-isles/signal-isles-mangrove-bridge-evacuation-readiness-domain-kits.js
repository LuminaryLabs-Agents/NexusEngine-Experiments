const arr = (v) => Array.isArray(v) ? [...v] : [];
const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, Number(v) || 0));
const r = (v, d = 3) => Number((Number(v) || 0).toFixed(d));
const point = (v = {}, fallback = {}) => {
  const s = v.transform ?? v.position ?? v;
  return { x: Number(s.x ?? fallback.x ?? 0), z: Number(s.z ?? s.y ?? fallback.z ?? fallback.y ?? 0) };
};
const facts = (input = {}) => new Set(arr(input.session?.completedFacts));
const list = (level = {}, key, fallback) => arr(level[key]).length ? arr(level[key]) : fallback;

function progress(input = {}) {
  const f = facts(input);
  return clamp(
    arr(input.kitStates?.scanSurvey?.completedTargetIds).length * 0.052 +
    arr(input.session?.harvestedNodeIds).length * 0.072 +
    arr(input.session?.placedStructureIds).length * 0.1 +
    (f.has("scan.mangrove.bridge") ? 0.16 : 0) +
    (f.has("build.root.bridge.01") ? 0.18 : 0) +
    (f.has("tie.plank.causeway") ? 0.14 : 0) +
    (f.has("mark.safe.channel") ? 0.13 : 0) +
    (f.has("cargo.delivered.01") ? 0.12 : 0) +
    (input.session?.gateUnlocked ? 0.08 : 0)
  );
}

function tideRisk(input = {}) {
  const elapsed = Number(input.elapsed ?? input.session?.elapsed ?? 0);
  const tide = Number(input.session?.tidePressure ?? input.objective?.tidePressure ?? 0.38);
  const storm = Number(input.session?.stormPressure ?? input.objective?.stormPressure ?? 0.26);
  const pulse = (0.5 + Math.sin(elapsed * 0.08 + 1.3) * 0.5) * 0.16;
  return clamp(0.22 + tide * 0.44 + storm * 0.22 + pulse - progress(input) * 0.28);
}

function clarity(input = {}) {
  const elapsed = Number(input.elapsed ?? input.session?.elapsed ?? 0);
  const daylight = 0.5 + Math.sin(elapsed * 0.04 + 0.55) * 0.5;
  return clamp(0.38 + daylight * 0.22 + progress(input) * 0.28 - tideRisk(input) * 0.18 + Number(input.environment?.visibilityBonus ?? 0));
}

function ownership(owner) {
  return {
    owner,
    rendererConsumesDescriptorsOnly: true,
    rendererConsumes: "serializable mangrove bridge evacuation readiness descriptors only",
    excludes: ["renderer", "DOM", "browser input", "Three.js", "WebGL", "audio", "asset loading", "physics", "frame loop", "storage", "network"],
    rendererMustOwn: ["draw order", "camera projection", "canvas overlays", "input events", "frame scheduling"],
    rendererMustNotOwn: ["evacuation scoring", "bridge truth", "tide truth", "session mutation", "resource accounting", "route progression"]
  };
}

const count = (descriptors = {}) => Object.fromEntries(Object.entries(descriptors).map(([k, v]) => [k, Array.isArray(v) ? v.length : v ? 1 : 0]));

export const SIGNAL_ISLES_MANGROVE_BRIDGE_EVACUATION_READINESS_DOMAIN_TREE = Object.freeze({
  root: "signal-isles-mangrove-bridge-evacuation-readiness-domain",
  subdomains: [
    { id: "crossing-stability-domain", subdomains: [
      { id: "mangrove-root-bridge-domain", kits: ["signal-isles-mangrove-root-bridge-kit"] },
      { id: "plank-causeway-domain", kits: ["signal-isles-plank-causeway-kit"] }
    ] },
    { id: "tide-route-domain", subdomains: [
      { id: "tide-pole-gauge-domain", kits: ["signal-isles-tide-pole-gauge-kit"] },
      { id: "rescue-skiff-flag-domain", subdomains: [{ id: "channel-mark-domain", kits: ["signal-isles-rescue-skiff-flag-kit"] }] }
    ] },
    { id: "lantern-handoff-domain", subdomains: [
      { id: "crab-lantern-guide-domain", kits: ["signal-isles-crab-lantern-guide-kit"] },
      { id: "dusk-bridge-ledger-domain", kits: ["signal-isles-dusk-bridge-ledger-kit"] }
    ] },
    { id: "renderer-handoff", kits: ["signal-isles-mangrove-bridge-evacuation-renderer-handoff-kit"], contract: "renderer consumes descriptors only" }
  ],
  contract: "renderer consumes mangrove bridge evacuation descriptors only; no DOM, browser input, Three.js, WebGL, audio, asset loading, physics, storage, network, or frame-loop ownership"
});

export const SIGNAL_ISLES_MANGROVE_BRIDGE_EVACUATION_KITS = Object.freeze([
  "signal-isles-mangrove-root-bridge-kit",
  "signal-isles-plank-causeway-kit",
  "signal-isles-tide-pole-gauge-kit",
  "signal-isles-rescue-skiff-flag-kit",
  "signal-isles-crab-lantern-guide-kit",
  "signal-isles-dusk-bridge-ledger-kit",
  "signal-isles-mangrove-bridge-evacuation-renderer-handoff-kit",
  "signal-isles-mangrove-bridge-evacuation-readiness-domain-kit"
]);

function rootBridges(input) {
  const level = input.level ?? {};
  const placed = new Set(arr(input.session?.placedStructureIds));
  return list(level, "buildSites", [{ id: "root-bridge-north", structureId: "root-bridge-01", x: -5.5, z: 3.4 }, { id: "root-bridge-south", structureId: "root-bridge-02", x: 4.8, z: -2.8 }]).slice(0, 5).map((site, i) => {
    const p = point(site); const woven = placed.has(site.structureId ?? site.id) || facts(input).has("build.root.bridge.01") || progress(input) > 0.72;
    const stability = clamp((woven ? 0.52 : 0.2) + progress(input) * 0.3 + (1 - tideRisk(input)) * 0.16 - i * 0.018);
    return { id: `mangrove-root-bridge-${site.structureId ?? site.id ?? i}`, kind: "signal-isles-mangrove-root-bridge", x: r(p.x), z: r(p.z), woven, stability: r(stability), slipRisk: r(1 - stability * 0.76), radius: r(0.75 + stability * 1.55), active: true, color: woven ? "#9fffe0" : "#73e4ff", rendererContract: ownership("signal-isles-mangrove-root-bridge-kit") };
  });
}

function causeways(input) {
  const level = input.level ?? {}; const harvested = new Set(arr(input.session?.harvestedNodeIds));
  return [...list(level, "resourceNodes", [{ id: "driftwood-cache-a", x: -6.2, z: -3.5 }, { id: "driftwood-cache-b", x: 5.2, z: 3.6 }]), ...list(level, "buildSites", [])].slice(0, 6).map((node, i) => {
    const p = point(node); const lashed = harvested.has(node.id) || facts(input).has("tie.plank.causeway") || i % 4 === 0;
    const load = clamp((lashed ? 0.48 : 0.18) + progress(input) * 0.36 + clarity(input) * 0.1 - i * 0.01);
    return { id: `plank-causeway-${node.id ?? i}`, kind: "signal-isles-plank-causeway", x: r(p.x + 0.35), z: r(p.z - 0.25), lashed, load: r(load), span: r(0.9 + load * 1.8), active: true, color: lashed ? "#ffe7a2" : "#ffcf73", rendererContract: ownership("signal-isles-plank-causeway-kit") };
  });
}

function tideGauges(input) {
  const level = input.level ?? {}; const completed = new Set(arr(input.kitStates?.scanSurvey?.completedTargetIds)); const risk = tideRisk(input);
  return list(level, "scanSites", [{ id: "tide-pole-east", x: -7.2, z: 0.8 }, { id: "tide-pole-west", x: 6.4, z: -1.2 }, { id: "mudflat-depth", x: 0.8, z: 6.3 }]).slice(0, 5).map((site, i) => {
    const p = point(site); const scanned = completed.has(site.id) || facts(input).has(`scan.${site.id}`) || facts(input).has("scan.mangrove.bridge");
    const levelBand = risk > 0.7 ? "flood" : risk > 0.48 ? "rising" : "fordable";
    return { id: `tide-pole-gauge-${site.id ?? i}`, kind: "signal-isles-tide-pole-gauge", x: r(p.x), z: r(p.z), scanned, tide: r(clamp(risk + i * 0.025 - (scanned ? 0.08 : 0))), levelBand, height: r(0.8 + risk * 1.9), active: true, color: levelBand === "flood" ? "#ff7f77" : levelBand === "rising" ? "#ffcf73" : "#9fffe0", rendererContract: ownership("signal-isles-tide-pole-gauge-kit") };
  });
}

function skiffFlags(input) {
  const level = input.level ?? {};
  return [...list(level, "gates", [{ id: "safe-skiff-channel", x: 7.5, z: 2.1 }]), ...list(level, "cargo", [{ id: "flag-bundle", x: -2.5, z: -6.1 }])].slice(0, 5).map((flag, i) => {
    const p = point(flag); const marked = facts(input).has("mark.safe.channel") || facts(input).has("cargo.delivered.01") || input.session?.cargoCarriedId === flag.id || progress(input) > 0.64;
    const visibility = clamp((marked ? 0.55 : 0.22) + clarity(input) * 0.34 + i * 0.02);
    return { id: `rescue-skiff-flag-${flag.id ?? i}`, kind: "signal-isles-rescue-skiff-flag", x: r(p.x - 0.45), z: r(p.z + 0.4), marked, visibility: r(visibility), flutter: r(0.45 + tideRisk(input) * 0.55), active: true, color: marked ? "#9fffe0" : "#73e4ff", rendererContract: ownership("signal-isles-rescue-skiff-flag-kit") };
  });
}

function lanterns(input) {
  const level = input.level ?? {};
  const fallback = [{ id: "lantern-crab-a", x: -3.5, z: 4.9 }, { id: "lantern-crab-b", x: 2.4, z: -5.4 }, { id: "lantern-crab-c", x: 6.1, z: 0.1 }];
  const src = [...arr(level.resourceNodes), ...arr(level.scanSites), ...arr(level.gates)];
  return (src.length ? src : fallback).slice(0, 6).map((pnt, i) => {
    const p = point(pnt); const lit = progress(input) > 0.45 || facts(input).has("mark.safe.channel") || i % 2 === 0;
    const cadence = clamp((lit ? 0.5 : 0.22) + clarity(input) * 0.26 - tideRisk(input) * 0.1 + i * 0.018);
    return { id: `crab-lantern-guide-${pnt.id ?? i}`, kind: "signal-isles-crab-lantern-guide", x: r(p.x + Math.sin(i) * 0.6), z: r(p.z + Math.cos(i) * 0.6), lit, cadence: r(cadence), glow: r(0.4 + cadence * 1.6), active: true, color: lit ? "#ffe7a2" : "#73e4ff", rendererContract: ownership("signal-isles-crab-lantern-guide-kit") };
  });
}

function ledger(input) {
  const level = input.level ?? {}; const exit = level.sceneRecipe?.objects?.find?.((entry) => entry.id === "final-beacon")?.transform ?? list(level, "gates", [{ x: 0, z: 0 }])[0];
  const p = point(exit); const readiness = clamp(progress(input) * 0.68 + clarity(input) * 0.18 + (1 - tideRisk(input)) * 0.14);
  const phase = readiness > 0.74 ? "evacuation-open" : tideRisk(input) > 0.66 ? "tide-risk" : "bridge-lashing";
  const blockers = [progress(input) < 0.36 ? "weave root bridge" : null, tideRisk(input) > 0.58 ? "drop tide poles" : null, clarity(input) < 0.52 ? "light crab lanterns" : null].filter(Boolean);
  return [{ id: "dusk-bridge-ledger", kind: "signal-isles-dusk-bridge-ledger", x: r(p.x), z: r(p.z), readiness: r(readiness), tideRisk: r(tideRisk(input)), phase, blockers, active: true, color: phase === "evacuation-open" ? "#9fffe0" : phase === "tide-risk" ? "#ff7f77" : "#ffe7a2", rendererContract: ownership("signal-isles-dusk-bridge-ledger-kit") }];
}

export function createSignalIslesMangroveBridgeEvacuationReadinessDomainKit() {
  return {
    id: "signal-isles-mangrove-bridge-evacuation-readiness-domain-kit",
    domain: SIGNAL_ISLES_MANGROVE_BRIDGE_EVACUATION_READINESS_DOMAIN_TREE.root,
    tree: SIGNAL_ISLES_MANGROVE_BRIDGE_EVACUATION_READINESS_DOMAIN_TREE,
    kits: SIGNAL_ISLES_MANGROVE_BRIDGE_EVACUATION_KITS,
    describe(input = {}) {
      const descriptors = { mangroveRootBridges: rootBridges(input), plankCauseways: causeways(input), tidePoleGauges: tideGauges(input), rescueSkiffFlags: skiffFlags(input), crabLanternGuides: lanterns(input), duskBridgeLedgers: ledger(input) };
      const readiness = descriptors.duskBridgeLedgers[0]?.readiness ?? clamp(progress(input));
      const risk = tideRisk(input); const missionState = readiness > 0.74 ? "evacuation-open" : risk > 0.66 ? "tide-risk" : "bridge-lashing";
      const counts = count(descriptors); counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
      const summary = { readiness: r(readiness), tideRisk: r(risk), routeClarity: r(clarity(input)), missionState, bridgeProgress: r(progress(input)), descriptorFamilies: Object.keys(descriptors).length };
      const rendererHandoff = { id: "signal-isles-mangrove-bridge-evacuation-renderer-handoff", version: "1.0.0", descriptors, counts, summary, ownership: ownership("signal-isles-mangrove-bridge-evacuation-renderer-handoff-kit") };
      return { id: "signal-isles-mangrove-bridge-evacuation-readiness", domain: SIGNAL_ISLES_MANGROVE_BRIDGE_EVACUATION_READINESS_DOMAIN_TREE.root, tree: SIGNAL_ISLES_MANGROVE_BRIDGE_EVACUATION_READINESS_DOMAIN_TREE, kits: SIGNAL_ISLES_MANGROVE_BRIDGE_EVACUATION_KITS, ...summary, descriptors, rendererHandoff, ownership: ownership("signal-isles-mangrove-bridge-evacuation-readiness-domain-kit") };
    }
  };
}

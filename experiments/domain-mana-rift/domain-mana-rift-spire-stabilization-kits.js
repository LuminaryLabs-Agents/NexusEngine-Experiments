export const DOMAIN_MANA_RIFT_SPIRE_STABILIZATION_TREE = `domain-mana-rift-spire-stabilization-readiness-domain
├─ rift-forecast-domain
│  ├─ pulse-forecast-domain
│  │  └─ domain-mana-rift-pulse-forecast-kit
│  └─ pressure-vent-domain
│     └─ domain-mana-rift-pressure-vent-kit
├─ spire-stabilization-domain
│  ├─ spire-anchor-domain
│  │  └─ domain-mana-rift-spire-anchor-kit
│  └─ conduit-thread-domain
│     └─ domain-mana-rift-conduit-thread-kit
├─ evacuation-handoff-domain
│  ├─ ward-circle-domain
│  │  └─ domain-mana-rift-ward-circle-kit
│  └─ apprentice-ledger-domain
│     └─ domain-mana-rift-apprentice-ledger-kit
└─ renderer-handoff
   └─ domain-mana-rift-spire-stabilization-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export const DOMAIN_MANA_RIFT_SPIRE_STABILIZATION_KITS = [
  "domain-mana-rift-pulse-forecast-kit", "domain-mana-rift-pressure-vent-kit",
  "domain-mana-rift-spire-anchor-kit", "domain-mana-rift-conduit-thread-kit",
  "domain-mana-rift-ward-circle-kit", "domain-mana-rift-apprentice-ledger-kit",
  "domain-mana-rift-spire-stabilization-renderer-handoff-kit",
  "domain-mana-rift-spire-stabilization-readiness-domain-kit"
];

export const DOMAIN_MANA_RIFT_SPIRE_STABILIZATION_OWNERSHIP = Object.freeze({
  owns: ["rift pulse forecasts", "pressure vent descriptors", "spire anchor descriptors", "mana conduit descriptors", "ward descriptors", "apprentice evacuation descriptors", "descriptor-only renderer handoff"],
  forbidden: ["renderer", "DOM", "browser input", "Three.js", "WebGL", "audio", "asset loading", "physics", "frame loop"]
});

const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const round = (value, places = 3) => Number(num(value).toFixed(places));
const point = (index, total, radius, phase = 0, y = 0) => {
  const angle = phase + Math.PI * 2 * index / Math.max(1, total);
  return { x: round(Math.cos(angle) * radius), y: round(y), z: round(Math.sin(angle) * radius), angle: round(angle) };
};
const stateOf = (input = {}) => ({
  tick: Math.max(0, Math.floor(num(input.tick, 0))),
  mana: round(clamp01(num(input.mana, 0.62)), 2),
  riftIntensity: round(clamp01(num(input.riftIntensity, 0.52)), 2),
  apprenticeCount: Math.max(0, Math.floor(num(input.apprenticeCount, 5))),
  anchorCount: Math.max(0, Math.floor(num(input.anchorCount, 3))),
  playerDistance: round(Math.max(0, num(input.playerDistance, 9)), 2)
});

export function createDomainManaRiftPulseForecastKit(input = {}) {
  const s = stateOf(input); const phase = (s.tick % 96) / 96 * Math.PI * 2;
  return { kit: "domain-mana-rift-pulse-forecast-kit", cadence: s.riftIntensity > 0.72 ? "surging" : s.riftIntensity > 0.42 ? "unstable" : "steady", pressure: round(clamp01(s.riftIntensity * 0.82 + (1 - s.mana) * 0.18), 2), descriptors: Array.from({ length: 6 }, (_, i) => ({ id: `rift-pulse-${i}`, kind: "rift-pulse-forecast", arrivalSeconds: round(0.75 + i * 0.62 + s.riftIntensity * 0.9, 2), hazard: round(clamp01(s.riftIntensity * 0.72 + i * 0.035), 2), position: point(i, 6, 4.5 + s.riftIntensity * 5.5, phase, 0.15 + i * 0.05) })) };
}

export function createDomainManaRiftPressureVentKit(input = {}) {
  const s = stateOf(input); const pressure = clamp01(s.riftIntensity * 0.85 + Math.max(0, 0.45 - s.mana) * 0.4);
  return { kit: "domain-mana-rift-pressure-vent-kit", pressure: round(pressure, 2), descriptors: Array.from({ length: 4 }, (_, i) => ({ id: `pressure-vent-${i}`, kind: "rift-pressure-vent", pressure: round(clamp01(pressure + i * 0.04), 2), releasePriority: i === 0 || pressure > 0.72 ? "open-first" : "hold", position: point(i, 4, 6.8 + i * 0.85, Math.PI / 4, 0.28) })) };
}

export function createDomainManaRiftSpireAnchorKit(input = {}) {
  const s = stateOf(input); const count = Math.max(3, Math.min(7, s.anchorCount + 2)); const stability = clamp01(s.mana * 0.68 + (1 - s.riftIntensity) * 0.32);
  return { kit: "domain-mana-rift-spire-anchor-kit", stability: round(stability, 2), descriptors: Array.from({ length: count }, (_, i) => ({ id: `spire-anchor-${i}`, kind: "mana-spire-anchor", charge: round(clamp01(stability - i * 0.025 + 0.08), 2), status: stability > 0.72 ? "locked" : stability > 0.42 ? "tuning" : "weak", position: point(i, count, 3.2 + s.mana * 2.5, Math.PI / 6, 0.6) })) };
}

export function createDomainManaRiftConduitThreadKit(input = {}) {
  const s = stateOf(input); const flow = clamp01(s.mana * 0.75 + (1 - s.riftIntensity) * 0.25);
  return { kit: "domain-mana-rift-conduit-thread-kit", flow: round(flow, 2), descriptors: Array.from({ length: 5 }, (_, i) => ({ id: `conduit-thread-${i}`, kind: "mana-conduit-thread", flow: round(clamp01(flow - Math.abs(2 - i) * 0.035), 2), bend: round(Math.sin((s.tick + i * 11) * 0.08) * 0.35, 2), start: point(i, 5, 2.1, 0, 0.35), end: point(i, 5, 8.6, Math.PI / 5, 0.18) })) };
}

export function createDomainManaRiftWardCircleKit(input = {}) {
  const s = stateOf(input); const coverage = clamp01(0.35 + s.mana * 0.42 + Math.max(0, 10 - s.playerDistance) * 0.018);
  return { kit: "domain-mana-rift-ward-circle-kit", coverage: round(coverage, 2), descriptors: Array.from({ length: 3 }, (_, i) => ({ id: `ward-circle-${i}`, kind: "ward-circle-calibration", radius: round(5.5 + i * 2.4 + s.mana * 1.1, 2), coverage: round(clamp01(coverage - i * 0.055), 2), glyphCount: 8 + i * 4, status: coverage > 0.68 ? "sealed" : coverage > 0.44 ? "flickering" : "thin" })) };
}

export function createDomainManaRiftApprenticeLedgerKit(input = {}) {
  const s = stateOf(input); const safeSlots = Math.max(0, Math.round(s.apprenticeCount * clamp01(s.mana * 0.7 + (1 - s.riftIntensity) * 0.3))); const count = Math.max(1, Math.min(8, s.apprenticeCount));
  return { kit: "domain-mana-rift-apprentice-ledger-kit", evacuationReadiness: round(clamp01(safeSlots / Math.max(1, s.apprenticeCount)), 2), safeSlots, descriptors: Array.from({ length: count }, (_, i) => ({ id: `apprentice-${i}`, kind: "apprentice-evacuation-ledger", role: i % 3 === 0 ? "runebook" : i % 3 === 1 ? "ward-bearer" : "runner", evacStatus: i < safeSlots ? "cleared" : s.riftIntensity > 0.72 ? "urgent" : "waiting", rallyPosition: point(i, count, 10.5, Math.PI / 8, 0.05) })) };
}

export function createDomainManaRiftSpireStabilizationRendererHandoffKit(parts = {}) {
  const buckets = { pulses: parts.pulses?.descriptors ?? [], vents: parts.vents?.descriptors ?? [], anchors: parts.anchors?.descriptors ?? [], conduits: parts.conduits?.descriptors ?? [], wards: parts.wards?.descriptors ?? [], ledger: parts.ledger?.descriptors ?? [] };
  const counts = Object.fromEntries(Object.entries(buckets).map(([key, value]) => [key, value.length]));
  return { kit: "domain-mana-rift-spire-stabilization-renderer-handoff-kit", rendererConsumesDescriptorsOnly: true, buckets, counts, totalDescriptors: Object.values(counts).reduce((sum, value) => sum + value, 0) };
}

export function createDomainManaRiftSpireStabilizationReadiness(input = {}) {
  const s = stateOf(input); const pulses = createDomainManaRiftPulseForecastKit(s); const vents = createDomainManaRiftPressureVentKit(s); const anchors = createDomainManaRiftSpireAnchorKit(s); const conduits = createDomainManaRiftConduitThreadKit(s); const wards = createDomainManaRiftWardCircleKit(s); const ledger = createDomainManaRiftApprenticeLedgerKit(s);
  const readiness = clamp01(anchors.stability * 0.24 + conduits.flow * 0.18 + wards.coverage * 0.22 + ledger.evacuationReadiness * 0.2 + (1 - vents.pressure) * 0.16);
  const rendererHandoff = createDomainManaRiftSpireStabilizationRendererHandoffKit({ pulses, vents, anchors, conduits, wards, ledger });
  return { domain: "domain-mana-rift-spire-stabilization-readiness-domain", kit: "domain-mana-rift-spire-stabilization-readiness-domain-kit", tree: DOMAIN_MANA_RIFT_SPIRE_STABILIZATION_TREE, kits: DOMAIN_MANA_RIFT_SPIRE_STABILIZATION_KITS, ownership: DOMAIN_MANA_RIFT_SPIRE_STABILIZATION_OWNERSHIP, inputSignature: s, missionState: readiness > 0.72 ? "stabilized" : readiness > 0.46 ? "recoverable" : "critical", readiness: round(readiness, 2), descriptors: { pulses: pulses.descriptors, vents: vents.descriptors, anchors: anchors.descriptors, conduits: conduits.descriptors, wards: wards.descriptors, ledger: ledger.descriptors }, metrics: { pressure: vents.pressure, stability: anchors.stability, flow: conduits.flow, wardCoverage: wards.coverage, evacuationReadiness: ledger.evacuationReadiness }, rendererHandoff };
}

const SIGNAL_BASTION_FIELD_HOSPITAL_TREE = `signal-bastion-field-hospital-readiness-domain
├─ casualty-stabilization-domain
│  ├─ triage-lantern-domain
│  │  └─ bastion-triage-lantern-queue-kit
│  └─ med-supply-cache-domain
│     └─ bastion-med-supply-cache-kit
├─ stretcher-transfer-domain
│  ├─ stretcher-relay-domain
│  │  └─ bastion-stretcher-relay-thread-kit
│  └─ healing-ward-domain
│     └─ bastion-healing-ward-glyph-kit
├─ extraction-accounting-domain
│  ├─ ambulance-gate-domain
│  │  └─ bastion-ambulance-gate-band-kit
│  └─ casualty-ledger-domain
│     └─ bastion-casualty-ledger-band-kit
└─ renderer-handoff
   └─ bastion-field-hospital-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

const COLORS = Object.freeze({ triage: "#ffe36d", supply: "#6bf0b8", stretcher: "#f7a8ff", ward: "#8bd3ff", danger: "#ff7a5c", ledger: "#ffb86b" });
const SIGNAL_BASTION_FIELD_HOSPITAL_HANDOFF_POLICY = Object.freeze({ rendererConsumesDescriptorsOnly: true, noDomOwnership: true, noInputOwnership: true, noFrameLoopOwnership: true, noThreeOwnership: true, noWebglOwnership: true, noAudioOwnership: true, noAssetLoadingOwnership: true, noPhysicsOwnership: true });

const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, num(value, min)));
const arr = (value) => Array.isArray(value) ? value : value && typeof value === "object" ? Object.values(value) : [];
const point = (value = {}) => ({ x: num(value.x), y: num(value.y), z: num(value.z) });
const mid = (a = {}, b = {}) => ({ x: (num(a.x) + num(b.x)) / 2, y: (num(a.y) + num(b.y)) / 2, z: (num(a.z) + num(b.z)) / 2 });
const lerp = (a = {}, b = {}, t = 0.5) => ({ x: num(a.x) + (num(b.x) - num(a.x)) * clamp(t), y: num(a.y) + (num(b.y) - num(a.y)) * clamp(t), z: num(a.z) + (num(b.z) - num(a.z)) * clamp(t) });
const dist = (a = {}, b = {}) => Math.hypot(num(a.x) - num(b.x), num(a.y) - num(b.y));
const id = (prefix, parts = []) => [prefix, ...parts].map((part) => String(part).replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-|-$/g, "")).filter(Boolean).join(":");

function raw(input = {}) { return input.presentation?.rawSnapshot ?? input.rawSnapshot ?? input; }
function mapOf(state) { return state.map ?? state.level?.map ?? {}; }
function pathOf(state) { const path = arr(mapOf(state).path).map(point); return path.length >= 2 ? path : [{ x: 80, y: 440, z: 0 }, { x: 250, y: 330, z: 0 }, { x: 520, y: 280, z: 0 }, { x: 780, y: 160, z: 0 }]; }
function vitalOf(state) { return point(mapOf(state).vital ?? state.vital ?? { x: 820, y: 135, z: 0 }); }
function slotsOf(state) { const slots = arr(mapOf(state).slots).map((slot, index) => ({ ...point(slot), id: slot.id ?? slot.key ?? `medical-slot-${index}` })); return slots.length ? slots : [{ id: "triage-a", x: 235, y: 360, z: 0 }, { id: "supply-b", x: 455, y: 270, z: 0 }, { id: "ward-c", x: 675, y: 210, z: 0 }]; }
function structuresOf(state) { return arr(state.structures?.structures ?? state.structures ?? state.towers).filter(Boolean).map((item, index) => ({ ...item, id: item.id ?? `tower-${index}`, ...point(item), range: num(item.range, 135), level: num(item.level, 1) })); }
function agentsOf(state) { return arr(state.agents?.active ?? state.agents ?? state.enemies).filter(Boolean).map((item, index) => ({ ...item, id: item.id ?? `enemy-${index}`, ...point(item), speed: num(item.speed, 1), boss: Boolean(item.boss) })); }
function creditsOf(state) { return num(state.economy?.wallet?.credits ?? state.wallet?.credits ?? state.economy?.credits); }
function livesOf(state) { return num(state.session?.lives ?? state.lives ?? 20, 20); }
function waveOf(state) { const index = num(state.session?.waveIndex ?? state.wave?.index ?? state.waveIndex); const wave = state.level?.waves?.[index] ?? state.wave ?? {}; return { active: Boolean(state.session?.waveActive ?? state.wave?.active), queue: arr(wave.spawnQueue ?? wave.queue ?? wave.enemies) }; }
function pressureNear(source, agents, radius = 240) { return agents.reduce((total, agent) => total + (1 - clamp(dist(source, agent) / radius)) * (agent.boss ? 1.8 : 1) * num(agent.speed, 1), 0); }
function nearest(source, path) { return path.reduce((best, candidate) => dist(source, candidate) < dist(source, best) ? candidate : best, path[0] ?? { x: 0, y: 0, z: 0 }); }

export function createBastionTriageLanternQueueKit() {
  return { id: "bastion-triage-lantern-queue-kit", kind: "descriptor-kit", describe(input = {}) {
    const state = raw(input), path = pathOf(state), vital = vitalOf(state), agents = agentsOf(state), lives = livesOf(state);
    const ribbons = slotsOf(state).slice(0, 5).map((slot, index) => {
      const pressure = clamp(pressureNear(slot, agents, 260) / 3);
      const from = lerp(nearest(slot, path), slot, 0.42), to = lerp(slot, vital, 0.56);
      const intensity = clamp(0.35 + pressure * 0.42 + (1 - clamp(lives / 20)) * 0.2 + index * 0.03);
      return { id: id("triage-lantern-queue", [slot.id, index]), kind: "economy-flow-ribbon", semanticKind: "triage-lantern-queue", from, mid: mid(from, to), to, width: 5 + intensity * 14, intensity, pressure, color: pressure > 0.52 ? COLORS.danger : COLORS.triage, label: pressure > 0.52 ? "contested triage" : "triage lantern" };
    });
    return { id: "bastion-triage-lantern-queue", kind: "economy-flow-ribbon-set", semanticKind: "triage-lantern-queues", ribbons, counts: { ribbons: ribbons.length } };
  } };
}

export function createBastionMedSupplyCacheKit() {
  return { id: "bastion-med-supply-cache-kit", kind: "descriptor-kit", describe(input = {}) {
    const state = raw(input), agents = agentsOf(state), credits = creditsOf(state);
    const cells = slotsOf(state).map((slot, index) => { const pressure = clamp(pressureNear(slot, agents, 240) / 3.4); const synergy = clamp(0.2 + clamp(credits / (220 + index * 80)) * 0.46 + (1 - pressure) * 0.24); return { id: id("med-supply-cache", [slot.id, index]), kind: "tower-synergy-cell", semanticKind: "med-supply-cache", center: point(slot), radius: 34 + synergy * 38, synergy, pressure, color: pressure > 0.58 ? COLORS.danger : COLORS.supply, label: pressure > 0.58 ? "cache threatened" : "supply cache" }; });
    return { id: "bastion-med-supply-caches", kind: "tower-synergy-cell-set", semanticKind: "med-supply-caches", cells, counts: { cells: cells.length } };
  } };
}

export function createBastionStretcherRelayThreadKit() {
  return { id: "bastion-stretcher-relay-thread-kit", kind: "descriptor-kit", describe(input = {}) {
    const state = raw(input), vital = vitalOf(state), agents = agentsOf(state), source = structuresOf(state).length ? structuresOf(state) : slotsOf(state);
    const threads = source.slice(0, 6).map((node, index) => { const from = point(node), to = lerp(from, vital, 0.68), danger = clamp(pressureNear(from, agents, 300) / 3.2 + index * 0.04); return { id: id("stretcher-relay", [node.id, index]), kind: "enemy-intent-thread", semanticKind: "stretcher-relay-thread", from, mid: mid(from, to), to, width: 1.5 + danger * 5, danger, color: danger > 0.55 ? COLORS.danger : COLORS.stretcher, label: danger > 0.55 ? "relay under fire" : "stretcher relay" }; });
    return { id: "bastion-stretcher-relay-threads", kind: "enemy-intent-thread-set", semanticKind: "stretcher-relay-threads", threads, counts: { threads: threads.length } };
  } };
}

export function createBastionHealingWardGlyphKit() {
  return { id: "bastion-healing-ward-glyph-kit", kind: "descriptor-kit", describe(input = {}) {
    const state = raw(input), vital = vitalOf(state), wave = waveOf(state), lives = livesOf(state), credits = creditsOf(state);
    const urgency = clamp((1 - clamp(lives / 20)) * 0.45 + (wave.active ? 0.3 : 0.1) + clamp(wave.queue.length / 12) * 0.25);
    const readiness = clamp(clamp(credits / 360) * 0.44 + (1 - urgency) * 0.34 + structuresOf(state).length * 0.045);
    const rings = Array.from({ length: 5 }, (_, index) => ({ id: id("healing-ward-ring", [index]), kind: "readiness-ring", semanticKind: "healing-ward-ring", center: { x: vital.x - 22 + index * 10, y: vital.y + 16 + index * 8, z: 4 + index }, radius: 30 + index * 13 + readiness * 10, opacity: 0.13 + readiness * 0.22, color: urgency > 0.62 ? COLORS.danger : COLORS.ward, readiness, urgency }));
    return { id: "bastion-healing-ward-glyph", kind: "wave-readiness-glyph", semanticKind: "healing-ward-glyph", missionState: readiness > 0.66 ? "ward-ready" : urgency > 0.58 ? "ward-critical" : "ward-forming", readiness, urgency, rings, counts: { rings: rings.length } };
  } };
}

export function createBastionAmbulanceGateBandKit() {
  return { id: "bastion-ambulance-gate-band-kit", kind: "descriptor-kit", describe(input = {}) {
    const state = raw(input), path = pathOf(state), agents = agentsOf(state), vital = vitalOf(state), exit = { x: vital.x + 72, y: vital.y + 64, z: 0 };
    const segments = path.map((node, index) => { const from = point(node), to = index === path.length - 1 ? exit : point(path[index + 1]), pressure = clamp(pressureNear(to, agents, 260) / 3.1); return { id: id("ambulance-gate-band", [index]), kind: "path-threat-segment", semanticKind: "ambulance-gate-band", from, to, width: 16 + pressure * 38, pressure, color: pressure > 0.6 ? COLORS.danger : COLORS.ward, label: pressure > 0.6 ? "gate jam" : "ambulance lane" }; });
    return { id: "bastion-ambulance-gate-bands", kind: "path-threat-gradient", semanticKind: "ambulance-gate-bands", segments, counts: { segments: segments.length } };
  } };
}

export function createBastionCasualtyLedgerBandKit() {
  return { id: "bastion-casualty-ledger-band-kit", kind: "descriptor-kit", describe(input = {}) {
    const state = raw(input), credits = creditsOf(state), pressure = clamp(agentsOf(state).length / 8 + (1 - clamp(livesOf(state) / 20)) * 0.35), structures = structuresOf(state);
    const options = ["Triage", "Supply", "Stretcher", "Ambulance"].map((label, index) => { const cost = [80, 130, 170, 240][index]; return { id: id("ledger", [label]), label, cost, color: [COLORS.triage, COLORS.supply, COLORS.stretcher, COLORS.danger][index], index, affordable: credits >= cost, selected: index === Math.min(3, Math.floor(pressure * 4)), urgency: pressure, coverage: clamp((credits / cost) * 0.55 + structures.length * 0.08) }; });
    return { id: "bastion-casualty-ledger-band", kind: "command-choice-band", semanticKind: "casualty-ledger-band", pressure, selected: options.find((option) => option.selected)?.id ?? "ledger:Triage", options, counts: { options: options.length } };
  } };
}

export function createBastionFieldHospitalRendererHandoffKit() {
  return { id: "bastion-field-hospital-renderer-handoff-kit", kind: "renderer-handoff-kit", describe(input = {}) {
    const descriptors = [input.triageLanternQueues, input.medSupplyCaches, input.stretcherRelayThreads, input.healingWardGlyph, input.ambulanceGateBands, input.casualtyLedgerBand].filter(Boolean);
    return { id: "signal-bastion-field-hospital-renderer-handoff", kind: "renderer-handoff", rendererNeutral: true, policy: SIGNAL_BASTION_FIELD_HOSPITAL_HANDOFF_POLICY, descriptors, counts: { descriptors: descriptors.length, triageLanternQueues: input.triageLanternQueues?.counts?.ribbons ?? 0, medSupplyCaches: input.medSupplyCaches?.counts?.cells ?? 0, stretcherRelayThreads: input.stretcherRelayThreads?.counts?.threads ?? 0, healingWardGlyphs: input.healingWardGlyph?.counts?.rings ?? 0, ambulanceGateBands: input.ambulanceGateBands?.counts?.segments ?? 0, casualtyLedgerBands: input.casualtyLedgerBand?.counts?.options ?? 0 } };
  } };
}

export function createSignalBastionFieldHospitalReadinessDomainKit() {
  const triageKit = createBastionTriageLanternQueueKit(), supplyKit = createBastionMedSupplyCacheKit(), stretcherKit = createBastionStretcherRelayThreadKit(), wardKit = createBastionHealingWardGlyphKit(), ambulanceKit = createBastionAmbulanceGateBandKit(), ledgerKit = createBastionCasualtyLedgerBandKit(), handoffKit = createBastionFieldHospitalRendererHandoffKit();
  return { id: "signal-bastion-field-hospital-readiness-domain-kit", kind: "domain-kit", rendererNeutral: true, tree: SIGNAL_BASTION_FIELD_HOSPITAL_TREE, policy: SIGNAL_BASTION_FIELD_HOSPITAL_HANDOFF_POLICY, kits: [triageKit.id, supplyKit.id, stretcherKit.id, wardKit.id, ambulanceKit.id, ledgerKit.id, handoffKit.id], describe(input = {}) {
    const triageLanternQueues = triageKit.describe(input), medSupplyCaches = supplyKit.describe(input), stretcherRelayThreads = stretcherKit.describe(input), healingWardGlyph = wardKit.describe(input), ambulanceGateBands = ambulanceKit.describe(input), casualtyLedgerBand = ledgerKit.describe(input);
    const rendererHandoff = handoffKit.describe({ triageLanternQueues, medSupplyCaches, stretcherRelayThreads, healingWardGlyph, ambulanceGateBands, casualtyLedgerBand });
    return { id: "signal-bastion-field-hospital-readiness", kind: "domain-readiness", rendererNeutral: true, tree: SIGNAL_BASTION_FIELD_HOSPITAL_TREE, policy: SIGNAL_BASTION_FIELD_HOSPITAL_HANDOFF_POLICY, triageLanternQueues, medSupplyCaches, stretcherRelayThreads, healingWardGlyph, ambulanceGateBands, casualtyLedgerBand, rendererHandoff, summary: { descriptorGroups: rendererHandoff.counts.descriptors, triageQueues: rendererHandoff.counts.triageLanternQueues, supplyCaches: rendererHandoff.counts.medSupplyCaches, stretcherThreads: rendererHandoff.counts.stretcherRelayThreads, ambulanceBands: rendererHandoff.counts.ambulanceGateBands, missionState: healingWardGlyph.missionState } };
  } };
}

export { SIGNAL_BASTION_FIELD_HOSPITAL_TREE, SIGNAL_BASTION_FIELD_HOSPITAL_HANDOFF_POLICY };

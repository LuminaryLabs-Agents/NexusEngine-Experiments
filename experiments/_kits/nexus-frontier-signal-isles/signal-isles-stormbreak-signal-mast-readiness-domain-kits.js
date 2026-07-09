const stableArray = (value) => Array.isArray(value) ? [...value] : [];
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const clamp01 = (value) => clamp(value, 0, 1);
const round = (value, digits = 3) => Number((Number(value) || 0).toFixed(digits));

function pos(entry = {}, fallback = {}) {
  const source = entry.transform ?? entry.position ?? entry;
  return { x: Number(source.x ?? fallback.x ?? 0), z: Number(source.z ?? source.y ?? fallback.z ?? fallback.y ?? 0) };
}

function facts(input = {}) {
  return new Set(stableArray(input.session?.completedFacts));
}

function levelList(level = {}, key, fallback = []) {
  return stableArray(level[key]).length ? stableArray(level[key]) : fallback;
}

function stormPressure(input = {}) {
  const elapsed = Number(input.elapsed ?? input.session?.elapsed ?? 0);
  const tide = Number(input.session?.tidePressure ?? input.objective?.tidePressure ?? 0.28);
  const storm = Number(input.session?.stormPressure ?? input.objective?.stormPressure ?? 0.36);
  const pulse = (0.5 + Math.sin(elapsed * 0.09 + 0.7) * 0.5) * 0.18;
  return clamp01(0.24 + storm * 0.46 + tide * 0.22 + pulse - signalProgress(input) * 0.24);
}

function signalProgress(input = {}) {
  const set = facts(input);
  const scanned = stableArray(input.kitStates?.scanSurvey?.completedTargetIds).length;
  const harvested = stableArray(input.session?.harvestedNodeIds).length;
  const built = stableArray(input.session?.placedStructureIds).length;
  return clamp01(
    scanned * 0.055 +
    harvested * 0.06 +
    built * 0.095 +
    (set.has("scan.signal.mast") ? 0.14 : 0) +
    (set.has("build.signal-mast.01") ? 0.18 : 0) +
    (set.has("ground.lightning.01") ? 0.18 : 0) +
    (set.has("relay.mirror.chain") ? 0.16 : 0) +
    (input.session?.gateUnlocked ? 0.09 : 0)
  );
}

function visibility(input = {}) {
  const elapsed = Number(input.elapsed ?? input.session?.elapsed ?? 0);
  const daylight = 0.5 + Math.sin(elapsed * 0.045 + 0.3) * 0.5;
  return clamp01(0.5 + daylight * 0.26 - stormPressure(input) * 0.32 + signalProgress(input) * 0.18 + Number(input.environment?.visibilityBonus ?? 0));
}

function ownership(owner) {
  return {
    owner,
    rendererConsumesDescriptorsOnly: true,
    rendererConsumes: "serializable stormbreak signal mast readiness descriptors only",
    excludes: ["renderer", "DOM", "browser input", "Three.js", "WebGL", "audio", "asset loading", "physics", "frame loop", "storage"],
    rendererMustOwn: ["draw order", "camera projection", "canvas overlays", "input events", "frame scheduling"],
    rendererMustNotOwn: ["stormbreak scoring", "signal truth", "mast objective truth", "session mutation", "resource accounting", "route progression"]
  };
}

function descriptorCounts(descriptors = {}) {
  return Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : value ? 1 : 0]));
}

export const SIGNAL_ISLES_STORMBREAK_SIGNAL_MAST_READINESS_DOMAIN_TREE = Object.freeze({
  root: "signal-isles-stormbreak-signal-mast-readiness-domain",
  subdomains: [
    {
      id: "mast-stability-domain",
      subdomains: [
        { id: "lightning-mast-domain", kits: ["signal-isles-lightning-mast-kit"] },
        { id: "guywire-anchor-domain", kits: ["signal-isles-guywire-anchor-kit"] }
      ]
    },
    {
      id: "weather-routing-domain",
      subdomains: [
        { id: "windsock-ribbon-domain", kits: ["signal-isles-windsock-ribbon-kit"] },
        { id: "copper-ground-rod-domain", subdomains: [{ id: "strike-diffusion-domain", kits: ["signal-isles-copper-ground-rod-kit"] }] }
      ]
    },
    {
      id: "relay-handoff-domain",
      subdomains: [
        { id: "mirror-chain-domain", kits: ["signal-isles-relay-mirror-chain-kit"] },
        { id: "dawn-signal-ledger-domain", kits: ["signal-isles-dawn-signal-ledger-kit"] }
      ]
    },
    { id: "renderer-handoff", kits: ["signal-isles-stormbreak-signal-mast-renderer-handoff-kit"], contract: "renderer consumes descriptors only" }
  ],
  contract: "renderer consumes stormbreak signal mast descriptors only; no DOM, browser input, Three.js, WebGL, audio, asset loading, physics, storage, or frame-loop ownership"
});

export const SIGNAL_ISLES_STORMBREAK_SIGNAL_MAST_KITS = Object.freeze([
  "signal-isles-lightning-mast-kit",
  "signal-isles-guywire-anchor-kit",
  "signal-isles-windsock-ribbon-kit",
  "signal-isles-copper-ground-rod-kit",
  "signal-isles-relay-mirror-chain-kit",
  "signal-isles-dawn-signal-ledger-kit",
  "signal-isles-stormbreak-signal-mast-renderer-handoff-kit",
  "signal-isles-stormbreak-signal-mast-readiness-domain-kit"
]);

export function createSignalIslesLightningMastKit() {
  return {
    id: "signal-isles-lightning-mast-kit",
    domain: "signal-isles-stormbreak-signal-mast-readiness/lightning-mast",
    describe(input = {}) {
      const level = input.level ?? {};
      const buildSites = levelList(level, "buildSites", [{ id: "mast-pad-north", structureId: "signal-mast-01", x: -4, z: 2 }, { id: "mast-pad-south", structureId: "signal-mast-02", x: 5, z: -3 }]);
      const placed = new Set(stableArray(input.session?.placedStructureIds));
      const progress = signalProgress(input);
      return buildSites.slice(0, 5).map((site, index) => {
        const p = pos(site);
        const raised = placed.has(site.structureId ?? site.id) || facts(input).has("build.signal-mast.01");
        const stability = clamp01((raised ? 0.54 : 0.2) + progress * 0.28 + (1 - stormPressure(input)) * 0.18 - index * 0.015);
        return { id: `lightning-mast-${site.structureId ?? site.id ?? index}`, kind: "signal-isles-lightning-mast", x: round(p.x), z: round(p.z), raised, stability: round(stability), strikeRisk: round(1 - stability * 0.72), radius: round(0.8 + stability * 1.4), active: true, color: raised ? "#ffe7a2" : "#73e4ff", rendererContract: ownership("signal-isles-lightning-mast-kit") };
      });
    }
  };
}

export function createSignalIslesGuywireAnchorKit() {
  return {
    id: "signal-isles-guywire-anchor-kit",
    domain: "signal-isles-stormbreak-signal-mast-readiness/guywire-anchor",
    describe(input = {}) {
      const level = input.level ?? {};
      const anchors = [...levelList(level, "resourceNodes", [{ id: "basalt-anchor-a", x: -6, z: 4 }, { id: "basalt-anchor-b", x: 6, z: -4 }]), ...levelList(level, "buildSites", [])].slice(0, 6);
      const harvested = new Set(stableArray(input.session?.harvestedNodeIds));
      return anchors.map((anchor, index) => {
        const p = pos(anchor);
        const tied = harvested.has(anchor.id) || facts(input).has("build.signal-mast.01") || index % 3 === 0;
        const tension = clamp01((tied ? 0.5 : 0.16) + signalProgress(input) * 0.34 + index * 0.018);
        const angle = round((index / Math.max(1, anchors.length)) * Math.PI * 2);
        return { id: `guywire-anchor-${anchor.id ?? index}`, kind: "signal-isles-guywire-anchor", x: round(p.x + Math.cos(angle) * 0.55), z: round(p.z + Math.sin(angle) * 0.55), tied, tension: round(tension), radius: round(0.45 + tension * 0.9), active: true, color: tied ? "#9fffe0" : "#ffcf73", rendererContract: ownership("signal-isles-guywire-anchor-kit") };
      });
    }
  };
}

export function createSignalIslesWindsockRibbonKit() {
  return {
    id: "signal-isles-windsock-ribbon-kit",
    domain: "signal-isles-stormbreak-signal-mast-readiness/windsock-ribbon",
    describe(input = {}) {
      const level = input.level ?? {};
      const scanSites = levelList(level, "scanSites", [{ id: "wind-notch-east", x: -7, z: -2 }, { id: "wind-notch-west", x: 7, z: 3 }]);
      const pressure = stormPressure(input);
      return scanSites.slice(0, 5).map((site, index) => {
        const p = pos(site);
        const scanned = facts(input).has(`scan.${site.id}`) || facts(input).has("scan.signal.mast") || stableArray(input.kitStates?.scanSurvey?.completedTargetIds).includes(site.id);
        const shear = clamp01(pressure + (scanned ? -0.12 : 0.12) + index * 0.035);
        const band = shear > 0.7 ? "red" : shear > 0.45 ? "amber" : "clear";
        return { id: `windsock-ribbon-${site.id ?? index}`, kind: "signal-isles-windsock-ribbon", x: round(p.x), z: round(p.z), scanned, shear: round(shear), band, length: round(0.9 + shear * 2.2), active: true, color: band === "red" ? "#ff7f77" : band === "amber" ? "#ffcf73" : "#9fffe0", rendererContract: ownership("signal-isles-windsock-ribbon-kit") };
      });
    }
  };
}

export function createSignalIslesCopperGroundRodKit() {
  return {
    id: "signal-isles-copper-ground-rod-kit",
    domain: "signal-isles-stormbreak-signal-mast-readiness/copper-ground-rod",
    describe(input = {}) {
      const level = input.level ?? {};
      const sources = [...levelList(level, "cargo", [{ id: "copper-rod-cargo", x: 8, z: 3 }]), ...levelList(level, "resourceNodes", [])].slice(0, 5);
      return sources.map((source, index) => {
        const p = pos(source);
        const grounded = facts(input).has("ground.lightning.01") || input.session?.cargoCarriedId === source.id || facts(input).has("cargo.delivered.01");
        const conductivity = clamp01((grounded ? 0.58 : 0.2) + signalProgress(input) * 0.28 + visibility(input) * 0.14);
        return { id: `copper-ground-rod-${source.id ?? index}`, kind: "signal-isles-copper-ground-rod", x: round(p.x - 0.4), z: round(p.z + 0.5), grounded, conductivity: round(conductivity), radius: round(0.45 + conductivity), active: true, color: grounded ? "#ffe7a2" : "#73e4ff", rendererContract: ownership("signal-isles-copper-ground-rod-kit") };
      });
    }
  };
}

export function createSignalIslesRelayMirrorChainKit() {
  return {
    id: "signal-isles-relay-mirror-chain-kit",
    domain: "signal-isles-stormbreak-signal-mast-readiness/relay-mirror-chain",
    describe(input = {}) {
      const level = input.level ?? {};
      const gates = levelList(level, "gates", [{ id: "signal-gate", x: 5, z: 1 }]);
      const beacon = level.sceneRecipe?.objects?.find?.((entry) => entry.id === "final-beacon")?.transform ?? { x: 10, z: 0 };
      const points = [...gates, beacon].filter(Boolean).slice(0, 5);
      return points.map((point, index) => {
        const p = pos(point);
        const aligned = facts(input).has("relay.mirror.chain") || signalProgress(input) > 0.62;
        const clarity = clamp01((aligned ? 0.56 : 0.22) + visibility(input) * 0.3 + index * 0.026);
        return { id: `relay-mirror-chain-${point.id ?? index}`, kind: "signal-isles-relay-mirror-chain", x: round(p.x + 0.7), z: round(p.z - 0.65), aligned, clarity: round(clarity), radius: round(0.6 + clarity * 1.2), active: true, color: aligned ? "#9fffe0" : "#73e4ff", rendererContract: ownership("signal-isles-relay-mirror-chain-kit") };
      });
    }
  };
}

export function createSignalIslesDawnSignalLedgerKit() {
  return {
    id: "signal-isles-dawn-signal-ledger-kit",
    domain: "signal-isles-stormbreak-signal-mast-readiness/dawn-signal-ledger",
    describe(input = {}) {
      const level = input.level ?? {};
      const exit = level.sceneRecipe?.objects?.find?.((entry) => entry.id === "final-beacon")?.transform ?? levelList(level, "gates", [{ x: 0, z: 0 }])[0];
      const p = pos(exit);
      const readiness = clamp01(signalProgress(input) * 0.68 + visibility(input) * 0.18 + (1 - stormPressure(input)) * 0.14);
      const phase = readiness > 0.74 ? "broadcast" : stormPressure(input) > 0.64 ? "stormbreak-risk" : "rigging";
      const blockers = [
        signalProgress(input) < 0.4 ? "raise signal mast" : null,
        stormPressure(input) > 0.68 ? "wait for stormbreak window" : null,
        visibility(input) < 0.42 ? "align relay mirrors" : null
      ].filter(Boolean);
      return [{ id: "signal-isles-dawn-signal-ledger", kind: "signal-isles-dawn-signal-ledger", x: round(p.x + 1.7), z: round(p.z - 1.45), readiness: round(readiness), phase, blockerCount: blockers.length, blockers, stormPressure: round(stormPressure(input)), visibility: round(visibility(input)), active: true, radius: round(1 + readiness * 1.45), color: phase === "broadcast" ? "#9fffe0" : phase === "stormbreak-risk" ? "#ff7f77" : "#ffe7a2", rendererContract: ownership("signal-isles-dawn-signal-ledger-kit") }];
    }
  };
}

export function createSignalIslesStormbreakSignalMastRendererHandoffKit() {
  return {
    id: "signal-isles-stormbreak-signal-mast-renderer-handoff-kit",
    domain: "signal-isles-stormbreak-signal-mast-readiness/renderer-handoff",
    describe(descriptors = {}) {
      const counts = descriptorCounts(descriptors);
      return {
        id: "signal-isles-stormbreak-signal-mast-renderer-handoff",
        rendererConsumes: "serializable stormbreak signal mast descriptors only",
        descriptors,
        counts: { ...counts, total: Object.values(counts).reduce((sum, value) => sum + value, 0) },
        ownership: ownership("signal-isles-stormbreak-signal-mast-renderer-handoff-kit")
      };
    }
  };
}

export function createSignalIslesStormbreakSignalMastReadinessDomainKit() {
  const kits = {
    lightningMasts: createSignalIslesLightningMastKit(),
    guywireAnchors: createSignalIslesGuywireAnchorKit(),
    windsockRibbons: createSignalIslesWindsockRibbonKit(),
    copperGroundRods: createSignalIslesCopperGroundRodKit(),
    relayMirrorChains: createSignalIslesRelayMirrorChainKit(),
    dawnSignalLedgers: createSignalIslesDawnSignalLedgerKit(),
    rendererHandoff: createSignalIslesStormbreakSignalMastRendererHandoffKit()
  };
  return {
    id: "signal-isles-stormbreak-signal-mast-readiness-domain-kit",
    domain: SIGNAL_ISLES_STORMBREAK_SIGNAL_MAST_READINESS_DOMAIN_TREE.root,
    tree: SIGNAL_ISLES_STORMBREAK_SIGNAL_MAST_READINESS_DOMAIN_TREE,
    kits: SIGNAL_ISLES_STORMBREAK_SIGNAL_MAST_KITS,
    forbiddenOwnership: ownership("signal-isles-stormbreak-signal-mast-readiness-domain-kit").excludes,
    describe(input = {}) {
      const descriptors = {
        lightningMasts: kits.lightningMasts.describe(input),
        guywireAnchors: kits.guywireAnchors.describe(input),
        windsockRibbons: kits.windsockRibbons.describe(input),
        copperGroundRods: kits.copperGroundRods.describe(input),
        relayMirrorChains: kits.relayMirrorChains.describe(input),
        dawnSignalLedgers: kits.dawnSignalLedgers.describe(input)
      };
      const rendererHandoff = kits.rendererHandoff.describe(descriptors);
      const readiness = clamp01(signalProgress(input) * 0.64 + visibility(input) * 0.18 + (1 - stormPressure(input)) * 0.18);
      const missionState = readiness > 0.74 ? "broadcast" : stormPressure(input) > 0.64 ? "stormbreak-risk" : "rigging";
      return {
        id: "signal-isles-stormbreak-signal-mast-readiness",
        domain: SIGNAL_ISLES_STORMBREAK_SIGNAL_MAST_READINESS_DOMAIN_TREE.root,
        readiness: round(readiness),
        visibility: round(visibility(input)),
        stormPressure: round(stormPressure(input)),
        signalProgress: round(signalProgress(input)),
        missionState,
        descriptors,
        rendererHandoff,
        drawOrder: Object.values(descriptors).flat(),
        ownership: ownership("signal-isles-stormbreak-signal-mast-readiness-domain-kit")
      };
    }
  };
}

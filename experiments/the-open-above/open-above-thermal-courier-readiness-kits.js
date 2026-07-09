const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, n(value)));
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const hashText = (text = "") => {
  let hash = 2166136261;
  for (const char of String(text)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};
const wave01 = (seed, index = 0, salt = 0) => ((hashText(`${seed}:${index}:${salt}`) % 10000) / 10000);
const body = (snapshot = {}) => snapshot.body ?? {};
const input = (snapshot = {}) => snapshot.input ?? {};
const position = (snapshot = {}) => body(snapshot).position ?? {};
const totalCount = (groups = {}) => Object.values(groups).reduce((sum, value) => sum + (Array.isArray(value) ? value.length : 0), 0);
const avg = (items = [], key = "readiness") => {
  const safe = Array.isArray(items) ? items : [];
  if (!safe.length) return 0;
  return safe.reduce((sum, item) => sum + clamp(item?.[key]), 0) / safe.length;
};

export const OPEN_ABOVE_THERMAL_COURIER_READINESS_TREE = `open-above-thermal-courier-rescue-readiness-domain
├─ thermal-route-domain
│  ├─ lantern-ring-domain
│  │  └─ open-above-thermal-lantern-ring-kit
│  └─ draft-ribbon-domain
│     └─ open-above-draft-ribbon-lane-kit
├─ basket-cargo-domain
│  ├─ sling-cargo-domain
│  │  └─ open-above-basket-sling-cargo-kit
│  └─ anchor-buoy-domain
│     └─ open-above-landing-anchor-buoy-kit
├─ rescue-signal-domain
│  ├─ signal-mirror-domain
│  │  └─ open-above-cliff-signal-mirror-kit
│  └─ dawn-flight-ledger-domain
│     └─ open-above-dawn-flight-ledger-kit
└─ renderer-handoff
   └─ open-above-thermal-courier-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export const OPEN_ABOVE_THERMAL_COURIER_ATOMIC_KITS = Object.freeze([
  "open-above-thermal-lantern-ring-kit",
  "open-above-draft-ribbon-lane-kit",
  "open-above-basket-sling-cargo-kit",
  "open-above-landing-anchor-buoy-kit",
  "open-above-cliff-signal-mirror-kit",
  "open-above-dawn-flight-ledger-kit",
  "open-above-thermal-courier-renderer-handoff-kit"
]);

export const OPEN_ABOVE_THERMAL_COURIER_OWNERSHIP_BOUNDARY = Object.freeze({
  renderer: "excluded",
  dom: "excluded",
  browserInput: "excluded",
  three: "excluded",
  webgl: "excluded",
  audio: "excluded",
  assetLoading: "excluded",
  frameLoop: "excluded",
  physics: "excluded",
  storage: "excluded"
});

export function createOpenAboveThermalLanternRingKit(options = {}) {
  const seed = options.seed ?? "open-above-thermal-lantern-ring";
  const rings = Math.max(4, Math.floor(n(options.rings, 5)));
  return {
    id: "open-above-thermal-lantern-ring-kit",
    domain: "open-above.thermal-courier.thermal-route.lantern-ring",
    describe(snapshot = {}) {
      const b = body(snapshot);
      const altitude01 = clamp(n(b.altitude, n(position(snapshot).y, 220)) / 720);
      const clearance01 = clamp(n(b.clearance, 150) / 360);
      const speed01 = clamp(n(b.speed, 0) / n(options.maxSpeed, 170));
      const frameBand = Math.floor(n(snapshot.frame) / 80);
      return Array.from({ length: rings }, (_, index) => {
        const thermalStrength = clamp(0.24 + (1 - Math.abs(clearance01 - 0.48)) * 0.34 + speed01 * 0.16 + wave01(seed, index, frameBand) * 0.18);
        return {
          id: `thermal-lantern-ring:${index}`,
          domain: "open-above.thermal-courier.thermal-route.lantern-ring.marker",
          kind: "thermal-lantern-ring",
          x01: clamp(0.18 + index * (0.64 / Math.max(1, rings - 1)) + (wave01(seed, index, 2) - 0.5) * 0.05),
          y01: clamp(0.34 + Math.sin(index * 0.75 + altitude01) * 0.09 - thermalStrength * 0.08),
          radius01: clamp(0.036 + thermalStrength * 0.052, 0.036, 0.104),
          thermalStrength,
          readiness: thermalStrength,
          cue: thermalStrength > 0.66 ? "thermal lift marked" : thermalStrength > 0.42 ? "lantern ring weak" : "thermal ring fading",
          opacity: clamp(0.16 + thermalStrength * 0.58)
        };
      });
    }
  };
}

export function createOpenAboveDraftRibbonLaneKit(options = {}) {
  const seed = options.seed ?? "open-above-draft-ribbon-lane";
  const lanes = Math.max(4, Math.floor(n(options.lanes, 6)));
  return {
    id: "open-above-draft-ribbon-lane-kit",
    domain: "open-above.thermal-courier.thermal-route.draft-ribbon",
    describe(snapshot = {}) {
      const b = body(snapshot);
      const inp = input(snapshot);
      const rollRisk = clamp(Math.abs(n(b.rotation?.roll, 0)) * 0.86);
      const pitchRisk = clamp(Math.abs(n(b.rotation?.pitch, 0)) * 0.72);
      const activeControl = inp.bankLeft || inp.bankRight || inp.pitchUp || inp.pitchDown ? 0.08 : 0;
      return Array.from({ length: lanes }, (_, index) => {
        const laneStability = clamp(0.72 - rollRisk * 0.32 - pitchRisk * 0.2 + activeControl + wave01(seed, index, Math.floor(n(snapshot.elapsed) * 2)) * 0.16);
        return {
          id: `draft-ribbon-lane:${index}`,
          domain: "open-above.thermal-courier.thermal-route.draft-ribbon.lane",
          kind: "draft-ribbon-lane",
          x01: clamp(0.5 + (index - (lanes - 1) / 2) * 0.062),
          y01: clamp(0.2 + index * 0.094),
          length01: clamp(0.12 + laneStability * 0.28, 0.12, 0.42),
          laneStability,
          readiness: laneStability,
          cue: laneStability > 0.68 ? "hold draft ribbon" : laneStability > 0.44 ? "soften bank" : "draft unstable",
          opacity: clamp(0.12 + laneStability * 0.6 - index * 0.01)
        };
      });
    }
  };
}

export function createOpenAboveBasketSlingCargoKit(options = {}) {
  const seed = options.seed ?? "open-above-basket-sling-cargo";
  const cargos = Math.max(3, Math.floor(n(options.cargos, 4)));
  return {
    id: "open-above-basket-sling-cargo-kit",
    domain: "open-above.thermal-courier.basket-cargo.sling-cargo",
    describe(snapshot = {}) {
      const b = body(snapshot);
      const clearance01 = clamp(n(b.clearance, 140) / 340);
      const sinkDebt = clamp(Math.abs(Math.min(0, n(b.stability?.sinkRate, n(b.velocity?.y, 0)))) / 62);
      const speed01 = clamp(n(b.speed, 0) / n(options.maxSpeed, 170));
      return Array.from({ length: cargos }, (_, index) => {
        const cargoRisk = clamp(0.2 + sinkDebt * 0.24 + speed01 * 0.18 + (1 - clearance01) * 0.18 + wave01(seed, index, Math.floor(n(snapshot.frame) / 120)) * 0.2);
        const tieDownReadiness = clamp(1 - cargoRisk * 0.62 + wave01(seed, index, 5) * 0.12);
        return {
          id: `basket-sling-cargo:${index}`,
          domain: "open-above.thermal-courier.basket-cargo.sling-cargo.bundle",
          kind: "basket-sling-cargo",
          x01: clamp(0.22 + index * (0.56 / Math.max(1, cargos - 1))),
          y01: clamp(0.72 - tieDownReadiness * 0.16 + (wave01(seed, index, 8) - 0.5) * 0.035),
          radius01: clamp(0.032 + cargoRisk * 0.05, 0.032, 0.092),
          cargoRisk,
          readiness: tieDownReadiness,
          cue: tieDownReadiness > 0.7 ? "sling secured" : tieDownReadiness > 0.45 ? "tighten sling" : "cargo at risk",
          opacity: clamp(0.15 + cargoRisk * 0.5)
        };
      });
    }
  };
}

export function createOpenAboveLandingAnchorBuoyKit(options = {}) {
  const seed = options.seed ?? "open-above-landing-anchor-buoy";
  const buoys = Math.max(3, Math.floor(n(options.buoys, 4)));
  return {
    id: "open-above-landing-anchor-buoy-kit",
    domain: "open-above.thermal-courier.basket-cargo.anchor-buoy",
    describe(snapshot = {}) {
      const b = body(snapshot);
      const clearance01 = clamp(n(b.clearance, 150) / 300);
      const speed01 = clamp(n(b.speed, 0) / n(options.maxSpeed, 170));
      const rollStable = clamp(1 - Math.abs(n(b.rotation?.roll, 0)) * 0.92);
      return Array.from({ length: buoys }, (_, index) => {
        const anchorReadiness = clamp(0.18 + (1 - Math.abs(clearance01 - 0.34)) * 0.36 + (1 - speed01) * 0.22 + rollStable * 0.18 + wave01(seed, index, 6) * 0.06);
        return {
          id: `landing-anchor-buoy:${index}`,
          domain: "open-above.thermal-courier.basket-cargo.anchor-buoy.marker",
          kind: "landing-anchor-buoy",
          x01: clamp(0.26 + index * (0.48 / Math.max(1, buoys - 1)) + (wave01(seed, index, 7) - 0.5) * 0.045),
          y01: clamp(0.58 + index * 0.04 - anchorReadiness * 0.08),
          radius01: clamp(0.044 + anchorReadiness * 0.056, 0.044, 0.112),
          readiness: anchorReadiness,
          cue: anchorReadiness > 0.68 ? "anchor buoy viable" : anchorReadiness > 0.42 ? "approach slower" : "anchor too risky",
          opacity: clamp(0.12 + anchorReadiness * 0.62)
        };
      });
    }
  };
}

export function createOpenAboveCliffSignalMirrorKit(options = {}) {
  const mirrors = Math.max(4, Math.floor(n(options.mirrors, 5)));
  return {
    id: "open-above-cliff-signal-mirror-kit",
    domain: "open-above.thermal-courier.rescue-signal.signal-mirror",
    describe(snapshot = {}) {
      const p = position(snapshot);
      const distance = Math.hypot(n(p.x), n(p.z));
      const bearing = Math.atan2(-n(p.x), -n(p.z));
      const yaw = n(body(snapshot).rotation?.yaw, 0);
      const alignment = clamp((Math.cos(bearing - yaw) + 1) / 2);
      const distance01 = clamp(distance / 2100);
      return Array.from({ length: mirrors }, (_, index) => {
        const mirrorReadiness = clamp(0.18 + alignment * 0.44 + (1 - distance01) * 0.22 + Math.cos(index * 0.5 + bearing) * 0.04);
        return {
          id: `cliff-signal-mirror:${index}`,
          domain: "open-above.thermal-courier.rescue-signal.signal-mirror.glint",
          kind: "cliff-signal-mirror",
          x01: clamp(0.5 + Math.sin(bearing + index * 0.18) * 0.2 + (index - (mirrors - 1) / 2) * 0.018),
          y01: clamp(0.82 - index * 0.052 - mirrorReadiness * 0.06),
          readiness: mirrorReadiness,
          alignment,
          distance: Math.round(distance),
          cue: mirrorReadiness > 0.68 ? "mirror caught" : mirrorReadiness > 0.44 ? "turn into glint" : "signal lost",
          opacity: clamp(0.13 + mirrorReadiness * 0.58)
        };
      });
    }
  };
}

export function createOpenAboveDawnFlightLedgerKit(options = {}) {
  const seed = options.seed ?? "open-above-dawn-flight-ledger";
  const slots = Math.max(4, Math.floor(n(options.slots, 5)));
  return {
    id: "open-above-dawn-flight-ledger-kit",
    domain: "open-above.thermal-courier.rescue-signal.dawn-flight-ledger",
    describe(snapshot = {}, summary = {}) {
      const basePressure = clamp(0.16 + (1 - clamp(summary.readiness, 0, 1)) * 0.5 + clamp(summary.risk, 0, 1) * 0.24);
      return Array.from({ length: slots }, (_, index) => {
        const urgency = clamp(basePressure + wave01(seed, index, Math.floor(n(snapshot.elapsed) / 4)) * 0.2 + index * 0.024);
        const ready = clamp(1 - urgency * 0.7);
        return {
          id: `dawn-flight-ledger:${index}`,
          domain: "open-above.thermal-courier.rescue-signal.dawn-flight-ledger.slot",
          kind: "dawn-flight-ledger",
          x01: clamp(0.14 + index * (0.72 / Math.max(1, slots - 1))),
          y01: clamp(0.91 - urgency * 0.1),
          radius01: clamp(0.024 + urgency * 0.038, 0.024, 0.07),
          urgency,
          readiness: ready,
          cue: urgency > 0.68 ? "commit rescue leg" : urgency > 0.42 ? "watch dawn slot" : "ledger steady",
          opacity: clamp(0.12 + urgency * 0.56)
        };
      });
    }
  };
}

export function createOpenAboveThermalCourierRendererHandoffKit() {
  return {
    id: "open-above-thermal-courier-renderer-handoff-kit",
    domain: "open-above.thermal-courier.renderer-handoff",
    compose(groups = {}, summary = {}) {
      const descriptors = {
        thermalLanternRings: clone(groups.thermalLanternRings ?? []),
        draftRibbonLanes: clone(groups.draftRibbonLanes ?? []),
        basketSlingCargos: clone(groups.basketSlingCargos ?? []),
        landingAnchorBuoys: clone(groups.landingAnchorBuoys ?? []),
        cliffSignalMirrors: clone(groups.cliffSignalMirrors ?? []),
        dawnFlightLedgers: clone(groups.dawnFlightLedgers ?? [])
      };
      return {
        id: "open-above-thermal-courier-renderer-handoff",
        contract: "renderer-consumes-descriptors-only",
        descriptors,
        counts: {
          thermalLanternRings: descriptors.thermalLanternRings.length,
          draftRibbonLanes: descriptors.draftRibbonLanes.length,
          basketSlingCargos: descriptors.basketSlingCargos.length,
          landingAnchorBuoys: descriptors.landingAnchorBuoys.length,
          cliffSignalMirrors: descriptors.cliffSignalMirrors.length,
          dawnFlightLedgers: descriptors.dawnFlightLedgers.length,
          total: totalCount(descriptors)
        },
        summary: clone(summary)
      };
    }
  };
}

export function createOpenAboveThermalCourierRescueReadinessDomainKit(options = {}) {
  const thermalLanternRing = createOpenAboveThermalLanternRingKit(options.thermalLanternRing);
  const draftRibbonLane = createOpenAboveDraftRibbonLaneKit(options.draftRibbonLane);
  const basketSlingCargo = createOpenAboveBasketSlingCargoKit(options.basketSlingCargo);
  const landingAnchorBuoy = createOpenAboveLandingAnchorBuoyKit(options.landingAnchorBuoy);
  const cliffSignalMirror = createOpenAboveCliffSignalMirrorKit(options.cliffSignalMirror);
  const dawnFlightLedger = createOpenAboveDawnFlightLedgerKit(options.dawnFlightLedger);
  const rendererHandoff = createOpenAboveThermalCourierRendererHandoffKit();
  return {
    id: "open-above-thermal-courier-rescue-readiness-domain-kit",
    tree: OPEN_ABOVE_THERMAL_COURIER_READINESS_TREE,
    atomicKits: OPEN_ABOVE_THERMAL_COURIER_ATOMIC_KITS,
    ownershipBoundary: OPEN_ABOVE_THERMAL_COURIER_OWNERSHIP_BOUNDARY,
    kits: {
      thermalLanternRing,
      draftRibbonLane,
      basketSlingCargo,
      landingAnchorBuoy,
      cliffSignalMirror,
      dawnFlightLedger,
      rendererHandoff
    },
    compose(snapshot = {}) {
      const groups = {
        thermalLanternRings: thermalLanternRing.describe(snapshot),
        draftRibbonLanes: draftRibbonLane.describe(snapshot),
        basketSlingCargos: basketSlingCargo.describe(snapshot),
        landingAnchorBuoys: landingAnchorBuoy.describe(snapshot),
        cliffSignalMirrors: cliffSignalMirror.describe(snapshot)
      };
      const risk = clamp(
        avg(groups.basketSlingCargos, "cargoRisk") * 0.28 +
        (1 - avg(groups.draftRibbonLanes, "laneStability")) * 0.24 +
        (1 - avg(groups.landingAnchorBuoys, "readiness")) * 0.22 +
        (1 - avg(groups.cliffSignalMirrors, "readiness")) * 0.16 +
        (1 - avg(groups.thermalLanternRings, "thermalStrength")) * 0.1
      );
      const readiness = clamp(
        avg(groups.thermalLanternRings, "thermalStrength") * 0.2 +
        avg(groups.draftRibbonLanes, "laneStability") * 0.2 +
        avg(groups.basketSlingCargos, "readiness") * 0.18 +
        avg(groups.landingAnchorBuoys, "readiness") * 0.2 +
        avg(groups.cliffSignalMirrors, "readiness") * 0.22
      );
      const summary = {
        readiness,
        risk,
        status: readiness > 0.72 ? "rescue-courier-ready" : readiness > 0.48 ? "stabilize-approach" : "recover-thermal-route",
        cue: readiness > 0.72 ? "commit to dawn courier handoff" : readiness > 0.48 ? "thread the draft ribbons" : "find lift before cargo drop"
      };
      groups.dawnFlightLedgers = dawnFlightLedger.describe(snapshot, summary);
      const rendererHandoffSnapshot = rendererHandoff.compose(groups, summary);
      return {
        id: "open-above-thermal-courier-rescue-readiness",
        domain: "open-above.thermal-courier",
        tree: OPEN_ABOVE_THERMAL_COURIER_READINESS_TREE,
        ownershipBoundary: OPEN_ABOVE_THERMAL_COURIER_OWNERSHIP_BOUNDARY,
        groups,
        summary,
        rendererHandoff: rendererHandoffSnapshot
      };
    }
  };
}

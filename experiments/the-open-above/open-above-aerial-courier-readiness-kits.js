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
const count = (items) => Array.isArray(items) ? items.length : 0;
const totalCount = (groups = {}) => Object.values(groups).reduce((sum, value) => sum + count(value), 0);

export const OPEN_ABOVE_AERIAL_COURIER_READINESS_TREE = `open-above-aerial-courier-readiness-domain
├─ courier-contract-domain
│  ├─ pouch-target-domain
│  │  └─ open-above-courier-pouch-target-kit
│  └─ ribbon-checkpoint-domain
│     └─ open-above-ribbon-checkpoint-kit
├─ passenger-safety-domain
│  ├─ comfort-stability-domain
│  │  └─ open-above-comfort-stability-meter-kit
│  └─ storm-shear-domain
│     └─ open-above-storm-shear-warning-kit
├─ landing-contract-domain
│  ├─ meadow-drop-zone-domain
│  │  └─ open-above-meadow-drop-zone-kit
│  └─ return-dock-domain
│     └─ open-above-return-dock-beacon-kit
└─ renderer-handoff
   └─ open-above-aerial-courier-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export function createOpenAboveCourierPouchTargetKit(options = {}) {
  const seed = options.seed ?? "open-above-courier-pouch-targets";
  const targets = Math.max(3, Math.floor(n(options.targets, 5)));
  return {
    id: "open-above-courier-pouch-target-kit",
    domain: "open-above.aerial-courier.contract.pouch-target",
    describe(snapshot = {}) {
      const b = body(snapshot);
      const speed01 = clamp(n(b.speed, 0) / n(options.maxSpeed, 160));
      const clearance01 = clamp(n(b.clearance, 180) / 360);
      const frameBand = Math.floor(n(snapshot.frame) / 90);
      return Array.from({ length: targets }, (_, index) => {
        const urgency = clamp(0.18 + wave01(seed, index, frameBand) * 0.48 + (1 - clearance01) * 0.18 + speed01 * 0.12);
        return {
          id: `courier-pouch-target:${index}`,
          domain: "open-above.aerial-courier.contract.pouch-target.marker",
          kind: "courier-pouch-target",
          x01: clamp(0.16 + index * (0.68 / Math.max(1, targets - 1)) + (wave01(seed, index, 3) - 0.5) * 0.06),
          y01: clamp(0.24 + wave01(seed, index, 5) * 0.5 - clearance01 * 0.08),
          radius01: clamp(0.025 + urgency * 0.045, 0.025, 0.085),
          urgency,
          priority: urgency > 0.66 ? "rush" : urgency > 0.4 ? "steady" : "optional",
          opacity: clamp(0.16 + urgency * 0.58)
        };
      });
    }
  };
}

export function createOpenAboveRibbonCheckpointKit(options = {}) {
  const seed = options.seed ?? "open-above-ribbon-checkpoints";
  const checkpoints = Math.max(4, Math.floor(n(options.checkpoints, 7)));
  return {
    id: "open-above-ribbon-checkpoint-kit",
    domain: "open-above.aerial-courier.contract.ribbon-checkpoint",
    describe(snapshot = {}) {
      const b = body(snapshot);
      const carve = clamp(n(b.carve?.turnStrength, 0));
      const bank = Math.abs(n(b.rotation?.roll, 0));
      const flow = clamp(0.2 + carve * 0.38 + bank * 0.32);
      return Array.from({ length: checkpoints }, (_, index) => ({
        id: `ribbon-checkpoint:${index}`,
        domain: "open-above.aerial-courier.contract.ribbon-checkpoint.ring",
        kind: "ribbon-checkpoint",
        x01: clamp(0.5 + Math.sin(index * 0.92 + n(snapshot.frame) * 0.018) * (0.18 + flow * 0.08)),
        y01: clamp(0.18 + index * (0.56 / Math.max(1, checkpoints - 1)) + (wave01(seed, index, 2) - 0.5) * 0.035),
        radius01: clamp(0.022 + flow * 0.044 + index * 0.0015, 0.022, 0.078),
        flowScore: flow,
        nextAction: input(snapshot).boost && index < 2 ? "hold boost" : flow > 0.56 ? "thread turn" : "center line",
        opacity: clamp(0.18 + flow * 0.5 - index * 0.015)
      }));
    }
  };
}

export function createOpenAboveComfortStabilityMeterKit(options = {}) {
  return {
    id: "open-above-comfort-stability-meter-kit",
    domain: "open-above.aerial-courier.passenger-safety.comfort-stability",
    describe(snapshot = {}) {
      const b = body(snapshot);
      const bank = Math.abs(n(b.rotation?.roll, 0));
      const pitch = Math.abs(n(b.rotation?.pitch, 0));
      const sink = Math.abs(Math.min(0, n(b.stability?.sinkRate, 0)));
      const turbulence = clamp(bank * 0.48 + pitch * 0.32 + sink * 0.006);
      const comfort = clamp(1 - turbulence);
      return [{
        id: "comfort-stability-meter:primary",
        domain: "open-above.aerial-courier.passenger-safety.comfort-stability.meter",
        kind: "comfort-stability-meter",
        x01: 0.09,
        y01: 0.18,
        comfort,
        turbulence,
        advice: comfort < 0.34 ? "level wings" : comfort < 0.62 ? "smooth bank" : "comfortable",
        opacity: clamp(0.22 + turbulence * 0.5)
      }];
    }
  };
}

export function createOpenAboveStormShearWarningKit(options = {}) {
  const seed = options.seed ?? "open-above-storm-shear";
  const bands = Math.max(3, Math.floor(n(options.bands, 5)));
  return {
    id: "open-above-storm-shear-warning-kit",
    domain: "open-above.aerial-courier.passenger-safety.storm-shear",
    describe(snapshot = {}) {
      const b = body(snapshot);
      const speed01 = clamp(n(b.speed, 0) / n(options.maxSpeed, 160));
      const sink = clamp(Math.abs(Math.min(0, n(b.stability?.sinkRate, 0))) / 70);
      return Array.from({ length: bands }, (_, index) => {
        const shear = clamp(0.12 + wave01(seed, index, Math.floor(n(snapshot.frame) / 110)) * 0.42 + sink * 0.28 + speed01 * 0.12);
        return {
          id: `storm-shear-warning:${index}`,
          domain: "open-above.aerial-courier.passenger-safety.storm-shear.band",
          kind: "storm-shear-warning",
          side: index % 2 === 0 ? "left" : "right",
          x01: index % 2 === 0 ? clamp(0.1 + index * 0.045) : clamp(0.9 - index * 0.045),
          y01: clamp(0.28 + index * 0.115),
          length01: clamp(0.18 + shear * 0.36, 0.18, 0.62),
          shear,
          warning: shear > 0.62 ? "avoid" : shear > 0.38 ? "watch" : "clear",
          opacity: clamp(0.08 + shear * 0.58)
        };
      });
    }
  };
}

export function createOpenAboveMeadowDropZoneKit(options = {}) {
  const seed = options.seed ?? "open-above-meadow-drop-zones";
  const zones = Math.max(2, Math.floor(n(options.zones, 4)));
  return {
    id: "open-above-meadow-drop-zone-kit",
    domain: "open-above.aerial-courier.landing-contract.meadow-drop-zone",
    describe(snapshot = {}) {
      const b = body(snapshot);
      const speed01 = clamp(n(b.speed, 0) / n(options.maxSpeed, 160));
      const clearance01 = clamp(n(b.clearance, 180) / 320);
      const dropReadinessBase = clamp((1 - speed01) * 0.42 + (1 - Math.abs(clearance01 - 0.42)) * 0.44 + (input(snapshot).pitchDown ? 0.1 : 0));
      return Array.from({ length: zones }, (_, index) => {
        const readiness = clamp(dropReadinessBase + (wave01(seed, index, 4) - 0.5) * 0.14);
        return {
          id: `meadow-drop-zone:${index}`,
          domain: "open-above.aerial-courier.landing-contract.meadow-drop-zone.circle",
          kind: "meadow-drop-zone",
          x01: clamp(0.24 + index * (0.52 / Math.max(1, zones - 1)) + (wave01(seed, index, 2) - 0.5) * 0.07),
          y01: clamp(0.76 - readiness * 0.18 + index * 0.02),
          radius01: clamp(0.038 + readiness * 0.072, 0.038, 0.13),
          readiness,
          label: readiness > 0.66 ? "drop now" : readiness > 0.38 ? "line up" : "too unstable",
          opacity: clamp(0.12 + readiness * 0.56)
        };
      });
    }
  };
}

export function createOpenAboveReturnDockBeaconKit(options = {}) {
  const segments = Math.max(4, Math.floor(n(options.segments, 6)));
  return {
    id: "open-above-return-dock-beacon-kit",
    domain: "open-above.aerial-courier.landing-contract.return-dock",
    describe(snapshot = {}) {
      const p = position(snapshot);
      const distance = Math.hypot(n(p.x), n(p.z));
      const bearing = Math.atan2(-n(p.x), -n(p.z));
      const yaw = n(body(snapshot).rotation?.yaw, 0);
      const alignment = clamp((Math.cos(bearing - yaw) + 1) / 2);
      return Array.from({ length: segments }, (_, index) => ({
        id: `return-dock-beacon:${index}`,
        domain: "open-above.aerial-courier.landing-contract.return-dock.beacon",
        kind: "return-dock-beacon",
        x01: clamp(0.5 + Math.sin(bearing) * 0.16 + (index - (segments - 1) / 2) * 0.032),
        y01: clamp(0.14 + index * 0.09),
        alignment,
        distance: Math.round(distance),
        advice: alignment > 0.7 ? "dock aligned" : "turn to dock",
        opacity: clamp(0.14 + alignment * 0.45 - index * 0.012)
      }));
    }
  };
}

export function createOpenAboveAerialCourierRendererHandoffKit() {
  return {
    id: "open-above-aerial-courier-renderer-handoff-kit",
    domain: "open-above.aerial-courier.renderer-handoff",
    compose(groups = {}) {
      const descriptors = {
        courierPouchTargets: clone(groups.courierPouchTargets ?? []),
        ribbonCheckpoints: clone(groups.ribbonCheckpoints ?? []),
        comfortStabilityMeters: clone(groups.comfortStabilityMeters ?? []),
        stormShearWarnings: clone(groups.stormShearWarnings ?? []),
        meadowDropZones: clone(groups.meadowDropZones ?? []),
        returnDockBeacons: clone(groups.returnDockBeacons ?? [])
      };
      return {
        id: "open-above-aerial-courier-renderer-handoff",
        contract: "renderer-consumes-descriptors-only",
        rendererOwns: ["DOM overlay placement", "CSS styling", "presentation timing"],
        rendererDoesNotOwn: ["courier scoring", "passenger safety truth", "flight physics", "browser input", "asset loading", "frame-loop ownership"],
        descriptors,
        flatDescriptors: Object.values(descriptors).flat(),
        counts: {
          courierPouchTargets: count(descriptors.courierPouchTargets),
          ribbonCheckpoints: count(descriptors.ribbonCheckpoints),
          comfortStabilityMeters: count(descriptors.comfortStabilityMeters),
          stormShearWarnings: count(descriptors.stormShearWarnings),
          meadowDropZones: count(descriptors.meadowDropZones),
          returnDockBeacons: count(descriptors.returnDockBeacons),
          total: totalCount(descriptors)
        }
      };
    }
  };
}

export function createOpenAboveAerialCourierReadinessDomainKit(options = {}) {
  const pouchTargets = options.pouchTargets ?? createOpenAboveCourierPouchTargetKit(options.pouches);
  const ribbonCheckpoints = options.ribbonCheckpoints ?? createOpenAboveRibbonCheckpointKit(options.checkpoints);
  const comfortStability = options.comfortStability ?? createOpenAboveComfortStabilityMeterKit(options.comfort);
  const stormShear = options.stormShear ?? createOpenAboveStormShearWarningKit(options.storm);
  const meadowDrops = options.meadowDrops ?? createOpenAboveMeadowDropZoneKit(options.drops);
  const returnDock = options.returnDock ?? createOpenAboveReturnDockBeaconKit(options.dock);
  const handoff = options.handoff ?? createOpenAboveAerialCourierRendererHandoffKit(options.handoffOptions);
  return {
    id: "open-above-aerial-courier-readiness-domain-kit",
    domain: "open-above.aerial-courier-readiness",
    tree: OPEN_ABOVE_AERIAL_COURIER_READINESS_TREE,
    compose(snapshot = {}) {
      const groups = {
        courierPouchTargets: pouchTargets.describe(snapshot),
        ribbonCheckpoints: ribbonCheckpoints.describe(snapshot),
        comfortStabilityMeters: comfortStability.describe(snapshot),
        stormShearWarnings: stormShear.describe(snapshot),
        meadowDropZones: meadowDrops.describe(snapshot),
        returnDockBeacons: returnDock.describe(snapshot)
      };
      const rendererHandoff = handoff.compose(groups);
      return {
        id: "open-above-aerial-courier-readiness",
        version: "2026-07-08-aerial-courier-readiness",
        tree: OPEN_ABOVE_AERIAL_COURIER_READINESS_TREE,
        groups,
        rendererHandoff,
        summary: {
          descriptorCount: rendererHandoff.counts.total,
          rushDeliveries: groups.courierPouchTargets.filter((target) => target.priority === "rush").length,
          stableComfort: groups.comfortStabilityMeters[0]?.comfort ?? 0,
          avoidShears: groups.stormShearWarnings.filter((warning) => warning.warning === "avoid").length,
          viableDropZones: groups.meadowDropZones.filter((zone) => zone.readiness > 0.5).length
        }
      };
    }
  };
}

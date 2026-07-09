export const FOGLINE_FIELD_CLINIC_DOMAIN_TREE = `fogline-field-clinic-readiness-domain
├─ patient-triage-domain
│  ├─ triage-beacon-domain
│  │  └─ fogline-triage-beacon-kit
│  └─ oxygen-cache-domain
│     └─ fogline-oxygen-cache-kit
├─ safe-transfer-domain
│  ├─ stretcher-lane-domain
│  │  └─ fogline-stretcher-lane-kit
│  └─ medic-shelter-domain
│     └─ fogline-medic-shelter-pocket-kit
├─ extraction-clinic-domain
│  ├─ ambulance-route-domain
│  │  └─ fogline-ambulance-route-signal-kit
│  └─ dawn-clinic-domain
│     └─ fogline-dawn-clinic-ledger-kit
└─ renderer-handoff
   └─ fogline-field-clinic-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export const FOGLINE_FIELD_CLINIC_KIT_NAMES = Object.freeze([
  "fogline-triage-beacon-kit",
  "fogline-oxygen-cache-kit",
  "fogline-stretcher-lane-kit",
  "fogline-medic-shelter-pocket-kit",
  "fogline-ambulance-route-signal-kit",
  "fogline-dawn-clinic-ledger-kit",
  "fogline-field-clinic-renderer-handoff-kit",
  "fogline-field-clinic-readiness-domain-kit"
]);

const BUCKET_ARCHETYPES = Object.freeze({
  routeThreads: "fogline.route.thread",
  relayAuras: "fogline.relay.aura",
  scanCones: "fogline.scan.cone",
  objectiveNeedles: "fogline.objective.needle",
  gateSigils: "fogline.gate.sigil",
  safePockets: "fogline.safe.pocket",
  pressureVignettes: "fogline.pressure.vignette"
});

function clamp01(value) {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function safeNumber(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function pointOf(value = {}, fallback = {}) {
  return {
    x: safeNumber(value.x, safeNumber(fallback.x, 0)),
    z: safeNumber(value.z, safeNumber(fallback.z, 0))
  };
}

function midpoint(a = {}, b = {}) {
  return {
    x: (safeNumber(a.x) + safeNumber(b.x)) * 0.5,
    z: (safeNumber(a.z) + safeNumber(b.z)) * 0.5
  };
}

function distance(a = {}, b = {}) {
  const ax = safeNumber(a.x);
  const az = safeNumber(a.z);
  const bx = safeNumber(b.x);
  const bz = safeNumber(b.z);
  return Math.hypot(bx - ax, bz - az);
}

function yawBetween(a = {}, b = {}) {
  return Math.atan2(safeNumber(b.x) - safeNumber(a.x), safeNumber(b.z) - safeNumber(a.z));
}

function scanProgress(relay = {}) {
  if (relay.scanned) return 1;
  return clamp01(safeNumber(relay.scanProgress, 0));
}

function fieldClinicPressure(game = {}, level = {}) {
  const relays = game.relays ?? level.relays ?? [];
  const scanned = relays.reduce((total, relay) => total + scanProgress(relay), 0);
  const scanRatio = clamp01(scanned / Math.max(1, relays.length));
  const elapsed = safeNumber(game.stats?.elapsed, 0);
  const budget = Math.max(1, safeNumber(game.stats?.timeBudget, 420));
  const timePressure = clamp01(elapsed / budget);
  const wraiths = game.wraiths ?? level.wraiths ?? [];
  const chasePressure = clamp01(wraiths.filter((wraith) => wraith.mode === "chase").length / Math.max(1, wraiths.length));
  const scanBursts = clamp01(safeNumber(game.stats?.scanBursts, 0) / 9);
  return clamp01(0.18 + (1 - scanRatio) * 0.32 + timePressure * 0.2 + chasePressure * 0.2 + scanBursts * 0.1);
}

function descriptor({ id, archetype, bucket, position, yaw = 0, radius = 1, width = 1, length = 1, opacity = 0.1, color = "#bafcff", extra = {} }) {
  return {
    id,
    archetype,
    originalArchetype: archetype,
    compatibleBucket: bucket,
    compatibleArchetype: BUCKET_ARCHETYPES[bucket] ?? archetype,
    position: pointOf(position),
    yaw: safeNumber(yaw),
    radius: Math.max(0.1, safeNumber(radius, 1)),
    width: Math.max(0.1, safeNumber(width, 1)),
    length: Math.max(0.1, safeNumber(length, 1)),
    opacity: clamp01(opacity),
    color,
    ...extra
  };
}

export function createFoglineTriageBeaconKit() {
  return {
    id: "fogline-triage-beacon-kit",
    describe(input = {}) {
      const level = input.level ?? {};
      const route = input.route ?? level.route ?? [];
      const game = input.game ?? {};
      const relays = game.relays ?? level.relays ?? [];
      const player = game.player ?? level.spawn ?? route[0] ?? {};
      const pressure = fieldClinicPressure(game, level);
      const sources = relays.length ? relays : [route[Math.floor(route.length * 0.35)] ?? player];
      return sources.slice(0, 5).map((relay, index) => {
        const progress = scanProgress(relay);
        const triageRisk = clamp01(pressure + (1 - progress) * 0.32 + index * 0.035);
        return descriptor({
          id: `field-clinic-triage-beacon-${relay.id ?? index}`,
          archetype: "fogline.field.clinic.triage.beacon",
          bucket: "objectiveNeedles",
          position: { x: safeNumber(relay.x) + (index % 2 === 0 ? -1.5 : 1.5), z: safeNumber(relay.z) + 1.2 },
          yaw: yawBetween(player, relay),
          radius: 1.35 + triageRisk * 3.1,
          width: 0.32 + triageRisk * 0.52,
          opacity: 0.08 + triageRisk * 0.18,
          color: triageRisk > 0.7 ? "#ff8c9d" : "#ffd38a",
          extra: { triageRisk, patientOrder: index + 1, stable: triageRisk < 0.78 }
        });
      });
    }
  };
}

export function createFoglineOxygenCacheKit() {
  return {
    id: "fogline-oxygen-cache-kit",
    describe(input = {}) {
      const level = input.level ?? {};
      const route = input.route ?? level.route ?? [];
      const game = input.game ?? {};
      const player = game.player ?? level.spawn ?? route[0] ?? {};
      const gate = game.gate ?? level.gate ?? route[route.length - 1] ?? {};
      const pressure = fieldClinicPressure(game, level);
      const checkpoints = [
        route[Math.floor(route.length * 0.18)] ?? player,
        route[Math.floor(route.length * 0.52)] ?? midpoint(player, gate),
        route[Math.floor(route.length * 0.82)] ?? gate
      ];
      return checkpoints.map((point, index) => {
        const oxygen = clamp01(0.88 - pressure * 0.4 - index * 0.055 + safeNumber(game.stats?.scanned, 0) * 0.04);
        return descriptor({
          id: `field-clinic-oxygen-cache-${index + 1}`,
          archetype: "fogline.field.clinic.oxygen.cache",
          bucket: "safePockets",
          position: { x: safeNumber(point.x) + (index - 1) * 2.2, z: safeNumber(point.z) - 1.6 },
          yaw: yawBetween(player, gate),
          radius: 1.4 + oxygen * 2.9,
          width: 0.3 + oxygen * 0.48,
          opacity: 0.07 + oxygen * 0.13,
          color: oxygen > 0.5 ? "#adfff4" : "#ffa879",
          extra: { oxygen, cacheIndex: index + 1, refillReady: oxygen > 0.38 }
        });
      });
    }
  };
}

export function createFoglineStretcherLaneKit() {
  return {
    id: "fogline-stretcher-lane-kit",
    describe(input = {}) {
      const level = input.level ?? {};
      const route = input.route ?? level.route ?? [];
      const game = input.game ?? {};
      const pressure = fieldClinicPressure(game, level);
      return route.slice(0, -1).map((point, index) => {
        const next = route[index + 1];
        const segmentLength = distance(point, next);
        const laneClearance = clamp01(1 - pressure * 0.38 - index * 0.018 + scanProgress((game.relays ?? [])[index % Math.max(1, (game.relays ?? []).length)] ?? {}) * 0.12);
        return descriptor({
          id: `field-clinic-stretcher-lane-${index + 1}`,
          archetype: "fogline.field.clinic.stretcher.lane",
          bucket: "routeThreads",
          position: midpoint(point, next),
          yaw: yawBetween(point, next),
          length: segmentLength,
          width: 0.42 + (1 - laneClearance) * 0.7,
          opacity: 0.06 + pressure * 0.11,
          color: laneClearance > 0.58 ? "#c6ffab" : "#ffcb75",
          extra: { laneClearance, segmentLength, litterBearers: Math.max(2, Math.round(segmentLength / 4)) }
        });
      });
    }
  };
}

export function createFoglineMedicShelterPocketKit() {
  return {
    id: "fogline-medic-shelter-pocket-kit",
    describe(input = {}) {
      const level = input.level ?? {};
      const route = input.route ?? level.route ?? [];
      const game = input.game ?? {};
      const relays = game.relays ?? level.relays ?? [];
      const pressure = fieldClinicPressure(game, level);
      const fallback = [
        route[Math.floor(route.length * 0.28)] ?? level.spawn ?? {},
        route[Math.floor(route.length * 0.66)] ?? level.gate ?? {}
      ];
      const sources = relays.length ? relays.filter((_, index) => index % 2 === 0) : fallback;
      return sources.slice(0, 4).map((source, index) => {
        const shelterScore = clamp01(0.76 - pressure * 0.31 + scanProgress(source) * 0.25 - index * 0.04);
        return descriptor({
          id: `field-clinic-medic-shelter-${source.id ?? index}`,
          archetype: "fogline.field.clinic.medic.shelter.pocket",
          bucket: "safePockets",
          position: { x: safeNumber(source.x) - 2.4, z: safeNumber(source.z) + 2.1 },
          yaw: index * 0.5,
          radius: 1.7 + shelterScore * 3.5,
          width: 0.34 + shelterScore * 0.5,
          opacity: 0.06 + shelterScore * 0.14,
          color: shelterScore > 0.55 ? "#b9ffca" : "#ffad8a",
          extra: { shelterScore, cotCount: 2 + index, sterile: shelterScore > 0.46 }
        });
      });
    }
  };
}

export function createFoglineAmbulanceRouteSignalKit() {
  return {
    id: "fogline-ambulance-route-signal-kit",
    describe(input = {}) {
      const level = input.level ?? {};
      const route = input.route ?? level.route ?? [];
      const game = input.game ?? {};
      const gate = game.gate ?? level.gate ?? route[route.length - 1] ?? {};
      const player = game.player ?? level.spawn ?? route[0] ?? {};
      const pressure = fieldClinicPressure(game, level);
      const relays = game.relays ?? level.relays ?? [];
      const routeConfidence = clamp01(relays.reduce((sum, relay) => sum + scanProgress(relay), 0) / Math.max(1, relays.length));
      return [
        descriptor({
          id: "field-clinic-ambulance-route-final",
          archetype: "fogline.field.clinic.ambulance.route.signal",
          bucket: "gateSigils",
          position: gate,
          yaw: yawBetween(player, gate),
          radius: 2.3 + routeConfidence * 4.8,
          width: 0.46 + routeConfidence * 0.56,
          opacity: 0.09 + routeConfidence * 0.16,
          color: routeConfidence > 0.7 ? "#eaff94" : "#ff9f8d",
          extra: { routeConfidence, ambulanceEtaSeconds: Math.round(95 - routeConfidence * 54 + pressure * 22) }
        }),
        descriptor({
          id: "field-clinic-ambulance-fog-cut",
          archetype: "fogline.field.clinic.ambulance.fog.cut",
          bucket: "scanCones",
          position: midpoint(player, gate),
          yaw: yawBetween(player, gate),
          radius: 1.8 + pressure * 2.6,
          length: 6 + distance(player, gate) * 0.32,
          width: 0.38 + pressure * 0.52,
          opacity: 0.07 + pressure * 0.14,
          color: "#a9d4ff",
          extra: { pressure, sirenQuiet: pressure < 0.74 }
        })
      ];
    }
  };
}

export function createFoglineDawnClinicLedgerKit() {
  return {
    id: "fogline-dawn-clinic-ledger-kit",
    describe(input = {}) {
      const level = input.level ?? {};
      const game = input.game ?? {};
      const gate = game.gate ?? level.gate ?? {};
      const relays = game.relays ?? level.relays ?? [];
      const readiness = clamp01(relays.reduce((sum, relay) => sum + scanProgress(relay), 0) / Math.max(1, relays.length));
      const pressure = fieldClinicPressure(game, level);
      return [
        descriptor({
          id: "field-clinic-dawn-ledger",
          archetype: "fogline.field.clinic.dawn.ledger",
          bucket: "relayAuras",
          position: { x: safeNumber(gate.x) + 3.4, z: safeNumber(gate.z) - 2.2 },
          radius: 1.7 + readiness * 3.2,
          width: 0.34 + readiness * 0.46,
          opacity: 0.08 + readiness * 0.14,
          color: readiness > 0.66 ? "#fff2a3" : "#ffc07a",
          extra: {
            readiness,
            patientsCleared: Math.max(0, Math.round(readiness * 8 - pressure * 2)),
            needsEscort: pressure > 0.58
          }
        }),
        descriptor({
          id: "field-clinic-pressure-vitals",
          archetype: "fogline.field.clinic.pressure.vitals",
          bucket: "pressureVignettes",
          position: gate,
          radius: 2.4 + pressure * 5.4,
          width: 0.38 + pressure * 0.62,
          opacity: 0.05 + pressure * 0.16,
          color: pressure > 0.72 ? "#ff7f99" : "#c9bfff",
          extra: { pressure, vitalsStable: pressure < 0.68 }
        })
      ];
    }
  };
}

export function createFoglineFieldClinicRendererHandoffKit() {
  return {
    id: "fogline-field-clinic-renderer-handoff-kit",
    describe(domain = {}) {
      const descriptors = domain.drawOrder ?? [];
      return {
        id: "fogline-field-clinic-renderer-handoff",
        archetype: "fogline.field.clinic.renderer.handoff",
        policy: "renderer-consumes-descriptors-only",
        descriptorCount: descriptors.length,
        descriptors,
        counts: {
          triageBeacons: domain.triageBeacons?.length ?? 0,
          oxygenCaches: domain.oxygenCaches?.length ?? 0,
          stretcherLanes: domain.stretcherLanes?.length ?? 0,
          medicShelterPockets: domain.medicShelterPockets?.length ?? 0,
          ambulanceRouteSignals: domain.ambulanceRouteSignals?.length ?? 0,
          dawnClinicLedger: domain.dawnClinicLedger?.length ?? 0
        },
        ownership: {
          renderer: "consume-only",
          dom: "excluded",
          browserInput: "excluded",
          three: "excluded",
          webgl: "excluded",
          audio: "excluded",
          assets: "excluded",
          frameLoop: "excluded",
          physics: "excluded"
        }
      };
    }
  };
}

export function createFoglineFieldClinicReadinessDomainKit() {
  const triageBeaconKit = createFoglineTriageBeaconKit();
  const oxygenCacheKit = createFoglineOxygenCacheKit();
  const stretcherLaneKit = createFoglineStretcherLaneKit();
  const medicShelterPocketKit = createFoglineMedicShelterPocketKit();
  const ambulanceRouteSignalKit = createFoglineAmbulanceRouteSignalKit();
  const dawnClinicLedgerKit = createFoglineDawnClinicLedgerKit();
  const rendererHandoffKit = createFoglineFieldClinicRendererHandoffKit();
  return {
    id: "fogline-field-clinic-readiness-domain-kit",
    tree: FOGLINE_FIELD_CLINIC_DOMAIN_TREE,
    kitNames: FOGLINE_FIELD_CLINIC_KIT_NAMES,
    describe(input = {}) {
      const triageBeacons = triageBeaconKit.describe(input);
      const oxygenCaches = oxygenCacheKit.describe(input);
      const stretcherLanes = stretcherLaneKit.describe(input);
      const medicShelterPockets = medicShelterPocketKit.describe(input);
      const ambulanceRouteSignals = ambulanceRouteSignalKit.describe(input);
      const dawnClinicLedger = dawnClinicLedgerKit.describe(input);
      const drawOrder = [
        ...stretcherLanes,
        ...oxygenCaches,
        ...medicShelterPockets,
        ...ambulanceRouteSignals,
        ...triageBeacons,
        ...dawnClinicLedger
      ];
      const domain = {
        id: "fogline-field-clinic-readiness-domain",
        archetype: "fogline.field.clinic.readiness.domain",
        tree: FOGLINE_FIELD_CLINIC_DOMAIN_TREE,
        triageBeacons,
        oxygenCaches,
        stretcherLanes,
        medicShelterPockets,
        ambulanceRouteSignals,
        dawnClinicLedger,
        drawOrder
      };
      return {
        ...domain,
        rendererHandoff: rendererHandoffKit.describe(domain)
      };
    }
  };
}

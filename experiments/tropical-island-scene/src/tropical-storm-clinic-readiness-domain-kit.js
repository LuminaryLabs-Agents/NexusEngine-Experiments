const round = (value, places = 4) => Number(Number.isFinite(Number(value)) ? Number(value).toFixed(places) : 0);
const scalarFrom = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp01 = (value) => Math.max(0, Math.min(1, scalarFrom(value, 0)));
const safeArray = (value) => Array.isArray(value) ? value : [];
const hash01 = (seed, salt = 0) => {
  const x = Math.sin((Number(seed) + 1) * 23.173 + salt * 37.719) * 43758.5453;
  return x - Math.floor(x);
};
const positionFrom = (entry = {}, fallback = {}) => ({
  x: scalarFrom(entry.position?.x ?? entry.x, fallback.x ?? 0),
  y: scalarFrom(entry.position?.y ?? entry.y, fallback.y ?? 0),
  z: scalarFrom(entry.position?.z ?? entry.z, fallback.z ?? 0)
});
const projectIsland = (position = {}, orbit = 0, scale = 1) => {
  const c = Math.cos(orbit);
  const s = Math.sin(orbit);
  const x = scalarFrom(position.x, 0) * c - scalarFrom(position.z, 0) * s;
  const z = scalarFrom(position.x, 0) * s + scalarFrom(position.z, 0) * c;
  const y = scalarFrom(position.y, 0);
  return { x: round((x / 46) * scale), y: round((-0.08 + y / 18 - z / 112) * scale), depth: round(z) };
};
const rendererContract = (owner) => ({
  owner,
  renderer: "presentation-only",
  reusableKits: "plain-input-to-plain-descriptor-output",
  rendererConsumes: "serializable tropical storm clinic readiness descriptors only",
  rendererMustNotOwn: ["clinic truth", "triage state", "browser input", "DOM", "Three.js", "WebGL", "audio", "asset loading", "frame loop", "physics"]
});

export const TROPICAL_STORM_CLINIC_READINESS_DOMAIN_TREE = `tropical-storm-clinic-readiness-domain
├─ patient-triage-domain
│  ├─ snorkeler-triage-domain
│  │  └─ tropical-injured-snorkeler-triage-buoy-kit
│  └─ freshwater-cistern-domain
│     └─ tropical-freshwater-cistern-purity-kit
├─ clinic-shelter-domain
│  ├─ tent-shade-domain
│  │  └─ tropical-clinic-tent-shade-kit
│  └─ raft-stretcher-domain
│     └─ tropical-raft-stretcher-lane-kit
├─ recovery-handoff-domain
│  ├─ fever-herb-domain
│  │  └─ tropical-fever-herb-garden-kit
│  └─ evacuation-canoe-domain
│     └─ tropical-dawn-evacuation-canoe-kit
└─ renderer-handoff
   └─ tropical-storm-clinic-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export function createTropicalInjuredSnorkelerTriageBuoyKit(options = {}) {
  const id = "tropical-injured-snorkeler-triage-buoy-kit";
  const count = Math.max(3, Math.min(6, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const orbit = scalarFrom(input.orbit ?? input.camera?.angle, 0);
      const swimmers = safeArray(input.fish ?? input.floatProps ?? input.coconuts).slice(0, count);
      const fallbacks = Array.from({ length: count }, (_, index) => ({ id: `triage-${index}`, x: -16 + index * 11, y: 0.8, z: 18 - index * 5 }));
      return (swimmers.length ? swimmers : fallbacks).slice(0, count).map((entry, index) => {
        const p = projectIsland(positionFrom(entry, fallbacks[index]), orbit, 1.02);
        const urgency = clamp01(0.38 + hash01(index, 3) * 0.24 + Math.sin(time * 0.24 + index * 0.77) * 0.18 + Math.max(0, -p.y) * 0.22);
        return {
          id: `${id}-${entry.id ?? index}`,
          kind: "tropical-injured-snorkeler-triage-buoy",
          position: { x: p.x, y: round(p.y - 0.02) },
          radius: round(0.028 + urgency * 0.038),
          triageUrgency: round(urgency),
          bandageEtaSeconds: round(18 + index * 8 - urgency * 9, 1),
          opacity: round(0.14 + urgency * 0.36),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalFreshwaterCisternPurityKit(options = {}) {
  const id = "tropical-freshwater-cistern-purity-kit";
  const count = Math.max(2, Math.min(5, Math.floor(options.count ?? 3)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const tidePressure = scalarFrom(input.tideSalvageReadiness?.rendererHandoff?.counts?.tideSurgeWindows, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = index / Math.max(1, count - 1);
        const purity = clamp01(0.72 - tidePressure * 0.018 - hash01(index, 8) * 0.14 + Math.cos(time * 0.18 + index) * 0.16);
        return {
          id: `${id}-${index}`,
          kind: "tropical-freshwater-cistern-purity",
          position: { x: round(-0.46 + lane * 0.92), y: round(0.22 + Math.sin(time * 0.09 + index) * 0.025) },
          radius: round(0.032 + (1 - purity) * 0.044),
          purityScore: round(purity),
          boilNotice: purity < 0.55,
          refillLiters: Math.max(8, Math.round(20 + purity * 52)),
          opacity: round(0.12 + (1 - purity) * 0.36),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalClinicTentShadeKit(options = {}) {
  const id = "tropical-clinic-tent-shade-kit";
  const count = Math.max(3, Math.min(6, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const weatherFronts = scalarFrom(input.weatherShelterReadability?.rendererHandoff?.counts?.stormFronts, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = (index - (count - 1) / 2) / Math.max(1, count - 1);
        const coverage = clamp01(0.42 + (1 - Math.abs(lane)) * 0.26 + Math.sin(time * 0.17 + index) * 0.18 - weatherFronts * 0.01);
        return {
          id: `${id}-${index}`,
          kind: "tropical-clinic-tent-shade",
          center: { x: round(lane * 0.78), y: round(0.04 + Math.cos(time * 0.08 + index) * 0.03) },
          radius: { x: round(0.055 + coverage * 0.075), y: round(0.022 + coverage * 0.036) },
          shadeCoverage: round(coverage),
          patientCapacity: Math.max(2, Math.round(2 + coverage * 7)),
          opacity: round(0.12 + coverage * 0.3),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalRaftStretcherLaneKit(options = {}) {
  const id = "tropical-raft-stretcher-lane-kit";
  const count = Math.max(3, Math.min(6, Math.floor(options.count ?? 4)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const orbit = scalarFrom(input.orbit ?? input.camera?.angle, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = (index - (count - 1) / 2) / Math.max(1, count - 1);
        const steadiness = clamp01(0.45 + Math.cos(time * 0.2 + index) * 0.21 + (1 - Math.abs(lane)) * 0.22);
        return {
          id: `${id}-${index}`,
          kind: "tropical-raft-stretcher-lane",
          start: { x: round(lane * 0.78), y: round(-0.42 + Math.sin(orbit + index) * 0.024) },
          end: { x: round(lane * 0.28), y: round(0.16 + Math.cos(orbit + index) * 0.025) },
          laneSteadiness: round(steadiness),
          stretcherLoad: Math.max(1, Math.round(1 + steadiness * 3)),
          width: round(0.007 + steadiness * 0.01),
          opacity: round(0.13 + steadiness * 0.33),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalFeverHerbGardenKit(options = {}) {
  const id = "tropical-fever-herb-garden-kit";
  const count = Math.max(4, Math.min(7, Math.floor(options.count ?? 5)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = (index - (count - 1) / 2) / Math.max(1, count - 1);
        const potency = clamp01(0.34 + hash01(index, 15) * 0.24 + Math.sin(time * 0.26 + index * 0.63) * 0.2 + (1 - Math.abs(lane)) * 0.18);
        return {
          id: `${id}-${index}`,
          kind: "tropical-fever-herb-garden",
          position: { x: round(lane * 0.68), y: round(0.3 + Math.sin(index + time * 0.1) * 0.032) },
          radius: round(0.018 + potency * 0.03),
          herbPotency: round(potency),
          dosesReady: Math.max(1, Math.round(1 + potency * 5)),
          opacity: round(0.14 + potency * 0.34),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalDawnEvacuationCanoeKit(options = {}) {
  const id = "tropical-dawn-evacuation-canoe-kit";
  const count = Math.max(2, Math.min(5, Math.floor(options.count ?? 3)));
  return {
    id,
    describe(input = {}) {
      const time = scalarFrom(input.time, 0);
      const rescuePressure = scalarFrom(input.reefRescueReadiness?.rendererHandoff?.counts?.extractionPierBeacons, 0);
      return Array.from({ length: count }, (_, index) => {
        const lane = index / Math.max(1, count - 1);
        const readiness = clamp01(0.46 + Math.sin(time * 0.16 + index * 0.9) * 0.22 + rescuePressure * 0.015 + (index === 1 ? 0.12 : 0));
        return {
          id: `${id}-${index}`,
          kind: "tropical-dawn-evacuation-canoe",
          position: { x: round(-0.42 + lane * 0.84), y: round(-0.24 + Math.cos(time * 0.1 + index) * 0.026) },
          radius: round(0.036 + readiness * 0.036),
          departureReadiness: round(readiness),
          seatsOpen: Math.max(1, Math.round(2 + readiness * 5)),
          departureSeconds: round(44 + index * 11 - readiness * 16, 1),
          opacity: round(0.15 + readiness * 0.34),
          rendererContract: rendererContract(id)
        };
      });
    }
  };
}

export function createTropicalStormClinicRendererHandoffKit() {
  const id = "tropical-storm-clinic-renderer-handoff-kit";
  return {
    id,
    describe({ triageBuoys = [], cisternPurityMarkers = [], clinicTentShades = [], raftStretcherLanes = [], feverHerbGardens = [], evacuationCanoeWindows = [] } = {}) {
      const descriptors = { triageBuoys, cisternPurityMarkers, clinicTentShades, raftStretcherLanes, feverHerbGardens, evacuationCanoeWindows };
      const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, safeArray(value).length]));
      counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
      return {
        id,
        kind: "renderer-handoff",
        domainTree: TROPICAL_STORM_CLINIC_READINESS_DOMAIN_TREE,
        contract: "renderer-consumes-descriptors-only",
        ownership: rendererContract(id),
        counts,
        descriptors
      };
    }
  };
}

export function createTropicalStormClinicReadinessDomainKit(options = {}) {
  const triageKit = createTropicalInjuredSnorkelerTriageBuoyKit(options.triageBuoys);
  const cisternKit = createTropicalFreshwaterCisternPurityKit(options.cisternPurityMarkers);
  const tentKit = createTropicalClinicTentShadeKit(options.clinicTentShades);
  const stretcherKit = createTropicalRaftStretcherLaneKit(options.raftStretcherLanes);
  const herbKit = createTropicalFeverHerbGardenKit(options.feverHerbGardens);
  const canoeKit = createTropicalDawnEvacuationCanoeKit(options.evacuationCanoeWindows);
  const handoffKit = createTropicalStormClinicRendererHandoffKit();
  const id = "tropical-storm-clinic-readiness-domain-kit";
  return {
    id,
    domainTree: TROPICAL_STORM_CLINIC_READINESS_DOMAIN_TREE,
    kits: [triageKit, cisternKit, tentKit, stretcherKit, herbKit, canoeKit, handoffKit],
    describe(input = {}) {
      const triageBuoys = triageKit.describe(input);
      const cisternPurityMarkers = cisternKit.describe(input);
      const clinicTentShades = tentKit.describe(input);
      const raftStretcherLanes = stretcherKit.describe(input);
      const feverHerbGardens = herbKit.describe(input);
      const evacuationCanoeWindows = canoeKit.describe(input);
      const rendererHandoff = handoffKit.describe({ triageBuoys, cisternPurityMarkers, clinicTentShades, raftStretcherLanes, feverHerbGardens, evacuationCanoeWindows });
      return {
        id,
        kind: "tropical-storm-clinic-readiness-domain",
        engine: options.engine ?? "NexusEngine main CDN",
        domainTree: TROPICAL_STORM_CLINIC_READINESS_DOMAIN_TREE,
        subdomains: {
          patientTriage: { kits: [triageKit.id, cisternKit.id], descriptors: { triageBuoys, cisternPurityMarkers } },
          clinicShelter: { kits: [tentKit.id, stretcherKit.id], descriptors: { clinicTentShades, raftStretcherLanes } },
          recoveryHandoff: { kits: [herbKit.id, canoeKit.id], descriptors: { feverHerbGardens, evacuationCanoeWindows } }
        },
        rendererHandoff
      };
    }
  };
}

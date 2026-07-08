const round = (value, places = 3) => Number(Number(value).toFixed(places));
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));

function hashString(input = "sora") {
  let hash = 2166136261;
  const text = String(input || "sora");
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function normalizedSeed(seed = "sora") {
  const hash = hashString(seed);
  return {
    hash,
    phase: round((hash % 997) / 997),
    band: hash % 7,
    drift: round(((hash % 173) - 86) / 86)
  };
}

function safeInput(input = {}) {
  return {
    thrust: clamp(input.thrust ?? input.forward ?? 0, -1, 1),
    bank: clamp(input.bank ?? input.x ?? 0, -1, 1),
    climb: clamp(input.climb ?? input.y ?? 0, -1, 1),
    launch: Boolean(input.launch),
    pointerActive: Boolean(input.pointerActive),
    pointerX: clamp(input.pointerX ?? 0.5, 0, 1),
    pointerY: clamp(input.pointerY ?? 0.5, 0, 1)
  };
}

export const SORA_ROUTE_PREVIEW_DOMAIN_TREE = `sora-route-preview-domain
├─ flight-readability
│  ├─ wind-shear-forecast-domain
│  │  └─ sora-wind-shear-forecast-kit
│  └─ altitude-envelope-domain
│     └─ sora-altitude-envelope-kit
├─ route-memory
│  ├─ waypoint-ribbon-domain
│  │  └─ sora-waypoint-ribbon-kit
│  └─ handoff-packet-domain
│     └─ sora-handoff-packet-kit
└─ renderer-handoff
   └─ sora-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export function createSoraAliasProvenanceKit(options = {}) {
  const routeId = options.routeId ?? "sora-the-infinite";
  const targetRouteId = options.targetRouteId ?? "the-open-above";
  const targetPath = options.targetPath ?? "../the-open-above/";
  return {
    id: "sora-alias-provenance-kit",
    describe(input = {}) {
      const query = String(input.query ?? "");
      const hash = normalizedSeed(`${routeId}:${targetRouteId}:${query}`);
      return {
        kind: "alias-provenance",
        routeId,
        targetRouteId,
        targetPath,
        queryPreserved: Boolean(query),
        hash: hash.hash,
        continuityLabel: `${routeId} -> ${targetRouteId}`,
        reason: "legacy Sora route is preserved as an authored compatibility gateway instead of a zero-frame redirect"
      };
    }
  };
}

export function createSoraLaunchVectorKit(options = {}) {
  const laneCount = clamp(options.laneCount ?? 6, 3, 9);
  return {
    id: "sora-launch-vector-kit",
    describe(input = {}) {
      const tick = clamp(input.tick ?? 0, 0, 1000000);
      const readiness = clamp(input.readiness ?? 0, 0, 1);
      const control = safeInput(input.input);
      const seed = normalizedSeed(`${tick}:${readiness}:${control.bank}:${control.climb}`);
      const lanes = Array.from({ length: laneCount }, (_, index) => {
        const offset = index - (laneCount - 1) / 2;
        const wind = Math.sin((tick * 0.025) + index + seed.phase * Math.PI * 2);
        return {
          id: `launch-vector-${index}`,
          slot: index,
          bearingDeg: round(offset * 11 + control.bank * 18 + wind * 3, 2),
          climbDeg: round(8 + readiness * 18 + control.climb * 10 - Math.abs(offset) * 0.9, 2),
          lift: round(0.35 + readiness * 0.55 + Math.max(0, control.thrust) * 0.2 - Math.abs(offset) * 0.035, 3),
          drift: round(seed.drift * 0.2 + wind * 0.12, 3),
          active: Math.abs(offset) <= 1.5 || readiness > 0.72
        };
      });
      return {
        kind: "launch-vector-field",
        readiness: round(readiness),
        centerline: round(control.bank * 22, 2),
        lanes
      };
    }
  };
}

export function createSoraSkyMemoryBandKit(options = {}) {
  const bandCount = clamp(options.bandCount ?? 8, 4, 12);
  return {
    id: "sora-sky-memory-band-kit",
    describe(input = {}) {
      const tick = clamp(input.tick ?? 0, 0, 1000000);
      const seed = normalizedSeed(input.seed ?? "sora-sky");
      const energy = clamp(input.energy ?? 0.5, 0, 1);
      const bands = Array.from({ length: bandCount }, (_, index) => {
        const phase = seed.phase + index * 0.137 + tick * 0.003;
        return {
          id: `sky-memory-band-${index}`,
          depth: index,
          x: round(((Math.sin(phase * 6.283) + 1) * 0.5) * 100, 2),
          y: round(10 + index * 7 + Math.cos(phase * 3.7) * 3, 2),
          width: round(34 + index * 5 + energy * 18, 2),
          opacity: round(0.16 + energy * 0.35 - index * 0.009, 3),
          hue: round(196 + index * 9 + energy * 22, 2),
          travelNote: index % 2 === 0 ? "open-sky-memory" : "alias-continuity-memory"
        };
      });
      return {
        kind: "sky-memory-bands",
        energy: round(energy),
        bands
      };
    }
  };
}

export function createSoraWindShearForecastKit(options = {}) {
  const cellCount = clamp(options.cellCount ?? 7, 4, 10);
  return {
    id: "sora-wind-shear-forecast-kit",
    describe(input = {}) {
      const tick = clamp(input.tick ?? 0, 0, 1000000);
      const readiness = clamp(input.readiness ?? 0, 0, 1);
      const control = safeInput(input.input);
      const seed = normalizedSeed(`${input.seed ?? "sora-wind"}:${control.bank}:${control.climb}`);
      const cells = Array.from({ length: cellCount }, (_, index) => {
        const phase = seed.phase * Math.PI * 2 + tick * 0.018 + index * 0.91;
        const crosswind = Math.sin(phase) * 0.5 + control.bank * 0.5;
        const lift = Math.cos(phase * 0.7) * 0.35 + readiness * 0.65 + Math.max(0, control.thrust) * 0.18;
        return {
          id: `wind-shear-cell-${index}`,
          kind: "wind-shear-cell",
          x: round(12 + index * (76 / Math.max(1, cellCount - 1)) + crosswind * 4, 2),
          y: round(18 + ((index % 3) * 13) + Math.sin(phase * 0.53) * 3, 2),
          width: round(18 + readiness * 18 + Math.abs(crosswind) * 8, 2),
          strength: round(clamp((lift + 0.3) / 1.4, 0, 1)),
          drift: round(crosswind),
          label: crosswind < -0.25 ? "left shear" : crosswind > 0.25 ? "right shear" : "stable lift"
        };
      });
      return {
        kind: "wind-shear-forecast",
        readiness: round(readiness),
        cells
      };
    }
  };
}

export function createSoraWaypointRibbonKit(options = {}) {
  const waypointCount = clamp(options.waypointCount ?? 5, 3, 8);
  return {
    id: "sora-waypoint-ribbon-kit",
    describe(input = {}) {
      const readiness = clamp(input.readiness ?? 0, 0, 1);
      const query = String(input.query ?? "");
      const hash = String(input.hash ?? "");
      const seed = normalizedSeed(`${query}:${hash}:waypoints`);
      const waypoints = Array.from({ length: waypointCount }, (_, index) => {
        const progress = waypointCount <= 1 ? 1 : index / (waypointCount - 1);
        const wave = Math.sin(seed.phase * Math.PI * 2 + progress * Math.PI * 1.4);
        return {
          id: `sora-waypoint-${index}`,
          kind: "route-waypoint",
          label: index === 0 ? "alias" : index === waypointCount - 1 ? "open-above" : `sky-${index}`,
          x: round(18 + progress * 64 + wave * 5, 2),
          y: round(76 - progress * 48 + Math.cos(seed.phase + index) * 4, 2),
          radius: round(6 + readiness * 8 + index * 0.7, 2),
          open: readiness >= progress * 0.72,
          progress: round(progress)
        };
      });
      return {
        kind: "waypoint-ribbon",
        preservedQuery: Boolean(query),
        preservedHash: Boolean(hash),
        waypoints
      };
    }
  };
}

export function createSoraHandoffPacketKit(options = {}) {
  const targetRouteId = options.targetRouteId ?? "the-open-above";
  return {
    id: "sora-handoff-packet-kit",
    describe(input = {}) {
      const readiness = clamp(input.readiness ?? 0, 0, 1);
      const query = String(input.query ?? "");
      const hash = String(input.hash ?? "");
      const control = safeInput(input.input);
      const packets = [
        { id: "packet-alias", label: "alias route id", ready: true, value: "sora-the-infinite" },
        { id: "packet-target", label: "target route", ready: true, value: targetRouteId },
        { id: "packet-url-state", label: "query/hash state", ready: Boolean(query || hash), value: `${query}${hash}` || "empty" },
        { id: "packet-flight-state", label: "flight readiness", ready: readiness >= 0.58, value: String(round(readiness)) },
        { id: "packet-control-state", label: "control vector", ready: Math.abs(control.bank) > 0.1 || Math.abs(control.climb) > 0.1 || control.thrust > 0.1, value: `${round(control.bank)},${round(control.climb)},${round(control.thrust)}` }
      ];
      return {
        kind: "handoff-packets",
        packetCount: packets.length,
        packets
      };
    }
  };
}

export function createSoraAltitudeEnvelopeKit(options = {}) {
  const bandCount = clamp(options.bandCount ?? 6, 4, 9);
  return {
    id: "sora-altitude-envelope-kit",
    describe(input = {}) {
      const readiness = clamp(input.readiness ?? 0, 0, 1);
      const control = safeInput(input.input);
      const bands = Array.from({ length: bandCount }, (_, index) => {
        const level = index / Math.max(1, bandCount - 1);
        const active = readiness + Math.max(0, control.climb) * 0.18 >= level * 0.84;
        return {
          id: `altitude-envelope-${index}`,
          kind: "altitude-envelope-band",
          level: round(level),
          y: round(82 - level * 58, 2),
          opacity: round((active ? 0.18 : 0.06) + readiness * 0.14),
          liftGate: round(level * 0.84),
          active
        };
      });
      return {
        kind: "altitude-envelope",
        climb: round(control.climb),
        bands
      };
    }
  };
}

export function createSoraContinuityGateKit(options = {}) {
  const targetPath = options.targetPath ?? "../the-open-above/";
  return {
    id: "sora-continuity-gate-kit",
    describe(input = {}) {
      const readiness = clamp(input.readiness ?? 0, 0, 1);
      const query = String(input.query ?? "");
      const hash = String(input.hash ?? "");
      const href = `${targetPath}${query}${hash}`;
      return {
        kind: "continuity-gate",
        href,
        label: readiness >= 0.9 ? "Launch now" : "Prime route",
        target: "the-open-above",
        readiness: round(readiness),
        open: readiness >= 0.58,
        preserved: {
          query: Boolean(query),
          hash: Boolean(hash),
          routeIdentity: true
        },
        gates: [
          { id: "route-alias", label: "Alias preserved", open: true, weight: 1 },
          { id: "state-handoff", label: "State handoff ready", open: readiness >= 0.32, weight: round(readiness) },
          { id: "flight-gate", label: "Flight scene target", open: readiness >= 0.58, weight: round(readiness * 0.85 + 0.15) }
        ]
      };
    }
  };
}

export function createSoraInputCoachingKit() {
  return {
    id: "sora-input-coaching-kit",
    describe(input = {}) {
      const control = safeInput(input.input);
      const readiness = clamp(input.readiness ?? 0, 0, 1);
      const coaching = [];
      if (Math.abs(control.bank) < 0.15) coaching.push({ id: "bank", label: "A/D or drag sideways to bank", active: true });
      else coaching.push({ id: "bank", label: control.bank < 0 ? "Left bank engaged" : "Right bank engaged", active: true });
      if (control.thrust <= 0.2) coaching.push({ id: "thrust", label: "Hold W or press Space to build lift", active: readiness < 0.9 });
      else coaching.push({ id: "thrust", label: "Lift building", active: true });
      coaching.push({ id: "launch", label: readiness >= 0.58 ? "Enter The Open Above when ready" : "Prime the route gate", active: readiness >= 0.58 });
      return {
        kind: "input-coaching",
        pointerActive: control.pointerActive,
        pointer: { x: round(control.pointerX), y: round(control.pointerY) },
        coaching
      };
    }
  };
}

export function createSoraRendererHandoffKit() {
  return {
    id: "sora-renderer-handoff-kit",
    describe(input = {}) {
      const descriptors = {
        alias: input.alias,
        launchVectors: input.launchVectors,
        skyMemoryBands: input.skyMemoryBands,
        windShearForecast: input.windShearForecast,
        waypointRibbon: input.waypointRibbon,
        handoffPackets: input.handoffPackets,
        altitudeEnvelope: input.altitudeEnvelope,
        continuityGate: input.continuityGate,
        inputCoaching: input.inputCoaching
      };
      return {
        kind: "sora-renderer-handoff",
        contract: "renderer consumes descriptors only",
        forbiddenOwnership: ["DOM input ownership", "WebGL ownership", "audio ownership", "asset loading ownership", "frame-loop ownership"],
        descriptors,
        descriptorCounts: {
          launchVectors: descriptors.launchVectors?.lanes?.length ?? 0,
          skyMemoryBands: descriptors.skyMemoryBands?.bands?.length ?? 0,
          windShearCells: descriptors.windShearForecast?.cells?.length ?? 0,
          waypoints: descriptors.waypointRibbon?.waypoints?.length ?? 0,
          handoffPackets: descriptors.handoffPackets?.packets?.length ?? 0,
          altitudeBands: descriptors.altitudeEnvelope?.bands?.length ?? 0,
          continuityGates: descriptors.continuityGate?.gates?.length ?? 0,
          coaching: descriptors.inputCoaching?.coaching?.length ?? 0
        }
      };
    }
  };
}

export function createSoraCompatibilityDomainKit(options = {}) {
  const aliasKit = createSoraAliasProvenanceKit(options);
  const launchVectorKit = createSoraLaunchVectorKit(options);
  const skyMemoryBandKit = createSoraSkyMemoryBandKit(options);
  const windShearForecastKit = createSoraWindShearForecastKit(options);
  const waypointRibbonKit = createSoraWaypointRibbonKit(options);
  const handoffPacketKit = createSoraHandoffPacketKit(options);
  const altitudeEnvelopeKit = createSoraAltitudeEnvelopeKit(options);
  const continuityGateKit = createSoraContinuityGateKit(options);
  const inputCoachingKit = createSoraInputCoachingKit(options);
  const rendererHandoffKit = createSoraRendererHandoffKit(options);

  return {
    id: "sora-compatibility-domain-kit",
    kits: [
      aliasKit.id,
      launchVectorKit.id,
      skyMemoryBandKit.id,
      windShearForecastKit.id,
      waypointRibbonKit.id,
      handoffPacketKit.id,
      altitudeEnvelopeKit.id,
      continuityGateKit.id,
      inputCoachingKit.id,
      rendererHandoffKit.id
    ],
    domainTree: SORA_ROUTE_PREVIEW_DOMAIN_TREE,
    describe(input = {}) {
      const tick = clamp(input.tick ?? 0, 0, 1000000);
      const control = safeInput(input.input);
      const baseReadiness = clamp(input.readiness ?? 0, 0, 1);
      const readiness = clamp(baseReadiness + Math.max(0, control.thrust) * 0.025 + (control.launch ? 0.08 : 0), 0, 1);
      const query = String(input.query ?? "");
      const hash = String(input.hash ?? "");
      const alias = aliasKit.describe({ query });
      const previewSeed = `${alias.hash}:${query}:${hash}:${tick}`;
      const launchVectors = launchVectorKit.describe({ tick, readiness, input: control });
      const skyMemoryBands = skyMemoryBandKit.describe({ tick, energy: readiness, seed: `${alias.hash}:${query}:${hash}` });
      const windShearForecast = windShearForecastKit.describe({ tick, readiness, input: control, seed: previewSeed });
      const waypointRibbon = waypointRibbonKit.describe({ readiness, query, hash });
      const handoffPackets = handoffPacketKit.describe({ readiness, query, hash, input: control });
      const altitudeEnvelope = altitudeEnvelopeKit.describe({ readiness, input: control });
      const continuityGate = continuityGateKit.describe({ readiness, query, hash });
      const inputCoaching = inputCoachingKit.describe({ input: control, readiness });
      const rendererHandoff = rendererHandoffKit.describe({
        alias,
        launchVectors,
        skyMemoryBands,
        windShearForecast,
        waypointRibbon,
        handoffPackets,
        altitudeEnvelope,
        continuityGate,
        inputCoaching
      });
      return {
        kind: "sora-compatibility-domain",
        routeId: "sora-the-infinite",
        targetRouteId: "the-open-above",
        readiness: round(readiness),
        alias,
        launchVectors,
        skyMemoryBands,
        windShearForecast,
        waypointRibbon,
        handoffPackets,
        altitudeEnvelope,
        continuityGate,
        inputCoaching,
        rendererHandoff
      };
    },
    snapshot(input = {}) {
      const described = this.describe(input);
      return {
        routeId: described.routeId,
        targetRouteId: described.targetRouteId,
        readiness: described.readiness,
        descriptorCounts: described.rendererHandoff.descriptorCounts,
        href: described.continuityGate.href,
        preview: {
          windShearCells: described.windShearForecast.cells.length,
          waypoints: described.waypointRibbon.waypoints.length,
          handoffPackets: described.handoffPackets.packets.length,
          altitudeBands: described.altitudeEnvelope.bands.length
        }
      };
    }
  };
}

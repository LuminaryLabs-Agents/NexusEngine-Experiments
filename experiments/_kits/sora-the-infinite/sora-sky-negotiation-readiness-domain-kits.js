const round = (value, places = 3) => Number(Number(value).toFixed(places));
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));

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

function flightplanSummary(input = {}) {
  return input.flightplanReadability?.summary ?? {};
}

function driftWarningPressure(input = {}) {
  const warnings = input.launchRehearsal?.driftWarnings?.warnings ?? [];
  return clamp(warnings.reduce((sum, warning) => sum + Number(warning.severity ?? 0), 0) / Math.max(1, warnings.length), 0, 1);
}

function routeWindAverage(input = {}) {
  const cells = input.routePreview?.windShearForecast?.cells ?? [];
  return clamp(cells.reduce((sum, cell) => sum + Math.abs(Number(cell.drift ?? 0)), 0) / Math.max(1, cells.length), 0, 1);
}

export const SORA_SKY_NEGOTIATION_READINESS_DOMAIN_TREE = `sora-sky-negotiation-readiness-domain
├─ weather-negotiation-domain
│  ├─ jetstream-braid-domain
│  │  └─ sora-jetstream-braid-kit
│  └─ storm-shelf-domain
│     └─ sora-storm-shelf-warning-kit
├─ glide-pacing-domain
│  ├─ thermal-ladder-domain
│  │  └─ sora-thermal-ladder-choice-kit
│  └─ glide-pocket-domain
│     └─ sora-glide-safe-pocket-kit
├─ continuity-assurance-domain
│  ├─ handoff-confidence-domain
│  │  └─ sora-handoff-confidence-rail-kit
│  └─ return-vow-domain
│     └─ sora-return-vow-thread-kit
└─ renderer-handoff
   └─ sora-sky-negotiation-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export function createSoraJetstreamBraidKit(options = {}) {
  const braidCount = clamp(options.braidCount ?? 6, 4, 9);
  return {
    id: "sora-jetstream-braid-kit",
    describe(input = {}) {
      const tick = clamp(input.tick ?? 0, 0, 1000000);
      const readiness = clamp(input.readiness ?? 0, 0, 1);
      const control = safeInput(input.input);
      const wind = routeWindAverage(input);
      const braids = Array.from({ length: braidCount }, (_, index) => {
        const t = braidCount <= 1 ? 0.5 : index / (braidCount - 1);
        const phase = tick * 0.011 + index * 0.71 + control.bank * 0.65;
        const favor = clamp(0.22 + readiness * 0.34 + (1 - Math.abs(t - 0.5) * 2) * 0.28 + Math.sin(phase) * 0.12 - wind * 0.16, 0, 1);
        return {
          id: `jetstream-braid-${index}`,
          kind: "jetstream-braid",
          x: round(12 + t * 76 + Math.sin(phase) * 4, 2),
          y: round(14 + index % 3 * 11 + Math.cos(phase) * 5, 2),
          width: round(12 + favor * 34, 2),
          drift: round((t - 0.5) * 0.72 + control.bank * 0.2 + Math.sin(phase) * 0.1, 3),
          favor: round(favor),
          usable: favor >= 0.52,
          label: favor >= 0.68 ? "friendly jetstream braid" : favor >= 0.52 ? "usable braid" : "crosswind braid"
        };
      });
      return { kind: "jetstream-braids", braids };
    }
  };
}

export function createSoraStormShelfWarningKit(options = {}) {
  const shelfCount = clamp(options.shelfCount ?? 4, 3, 6);
  return {
    id: "sora-storm-shelf-warning-kit",
    describe(input = {}) {
      const tick = clamp(input.tick ?? 0, 0, 1000000);
      const readiness = clamp(input.readiness ?? 0, 0, 1);
      const control = safeInput(input.input);
      const warningPressure = driftWarningPressure(input);
      const shelves = Array.from({ length: shelfCount }, (_, index) => {
        const t = shelfCount <= 1 ? 0.5 : index / (shelfCount - 1);
        const severity = clamp(warningPressure * 0.48 + Math.abs(control.bank) * 0.16 + Math.max(0, -control.climb) * 0.18 + (1 - readiness) * 0.16 + Math.sin(tick * 0.01 + index) * 0.08, 0, 1);
        return {
          id: `storm-shelf-${index}`,
          kind: "storm-shelf-warning",
          x: round(18 + t * 64, 2),
          y: round(28 + severity * 24 + index * 3, 2),
          span: round(18 + severity * 44, 2),
          severity: round(severity),
          active: severity >= 0.44,
          label: severity >= 0.66 ? "hard storm shelf" : severity >= 0.44 ? "watch shelf" : "thin shelf"
        };
      });
      return { kind: "storm-shelf-warnings", shelves };
    }
  };
}

export function createSoraThermalLadderChoiceKit(options = {}) {
  const rungCount = clamp(options.rungCount ?? 6, 4, 8);
  return {
    id: "sora-thermal-ladder-choice-kit",
    describe(input = {}) {
      const readiness = clamp(input.readiness ?? 0, 0, 1);
      const control = safeInput(input.input);
      const thermals = input.launchRehearsal?.thermalSlots?.slots ?? [];
      const summary = flightplanSummary(input);
      const activeVectors = clamp((summary.activeVectors ?? 0) / 7, 0, 1);
      const rungs = Array.from({ length: rungCount }, (_, index) => {
        const thermal = thermals[index % Math.max(1, thermals.length)]?.lift ?? 0.32;
        const climbFit = clamp(1 - Math.abs(control.climb - index / Math.max(1, rungCount - 1)), 0, 1);
        const score = clamp(readiness * 0.32 + thermal * 0.34 + climbFit * 0.2 + activeVectors * 0.14, 0, 1);
        return {
          id: `thermal-ladder-rung-${index}`,
          kind: "thermal-ladder-rung",
          index,
          x: round(26 + index * 7.8 + control.bank * 3, 2),
          y: round(76 - index * 8.2, 2),
          lift: round(thermal),
          score: round(score),
          chosen: score >= 0.64,
          label: score >= 0.72 ? "primary lift rung" : score >= 0.64 ? "safe lift rung" : "weak lift rung"
        };
      });
      return { kind: "thermal-ladder-choices", rungs };
    }
  };
}

export function createSoraGlideSafePocketKit(options = {}) {
  const pocketCount = clamp(options.pocketCount ?? 5, 3, 7);
  return {
    id: "sora-glide-safe-pocket-kit",
    describe(input = {}) {
      const readiness = clamp(input.readiness ?? 0, 0, 1);
      const control = safeInput(input.input);
      const summary = flightplanSummary(input);
      const clearSky = clamp((summary.clearCloudSlits ?? 0) / 6, 0, 1);
      const pockets = Array.from({ length: pocketCount }, (_, index) => {
        const t = pocketCount <= 1 ? 0.5 : index / (pocketCount - 1);
        const safety = clamp(readiness * 0.28 + clearSky * 0.32 + (1 - Math.abs(control.bank - (t - 0.5) * 1.2)) * 0.22 + Math.max(0, control.thrust) * 0.18, 0, 1);
        return {
          id: `glide-safe-pocket-${index}`,
          kind: "glide-safe-pocket",
          x: round(17 + t * 66, 2),
          y: round(62 - safety * 18 + index % 2 * 5, 2),
          radius: round(16 + safety * 36, 2),
          safety: round(safety),
          open: safety >= 0.58,
          label: safety >= 0.72 ? "deep safe glide" : safety >= 0.58 ? "usable glide pocket" : "thin pocket"
        };
      });
      return { kind: "glide-safe-pockets", pockets };
    }
  };
}

export function createSoraHandoffConfidenceRailKit() {
  return {
    id: "sora-handoff-confidence-rail-kit",
    describe(input = {}) {
      const readiness = clamp(input.readiness ?? 0, 0, 1);
      const summary = flightplanSummary(input);
      const continuity = input.routePreview?.continuityGate?.open ? 1 : 0.4;
      const launchWindow = clamp(summary.launchWindowValue ?? 0, 0, 1);
      const railIds = ["route", "lift", "window", "return", "commit"];
      const rails = railIds.map((id, index) => {
        const confidence = clamp(readiness * 0.35 + launchWindow * 0.24 + continuity * 0.2 + index * 0.055 + (summary.linkedReturnAnchors ?? 0) * 0.035, 0, 1);
        return {
          id: `handoff-confidence-${id}`,
          kind: "handoff-confidence-rail",
          index,
          label: id,
          confidence: round(confidence),
          ready: confidence >= 0.62
        };
      });
      return { kind: "handoff-confidence-rails", rails };
    }
  };
}

export function createSoraReturnVowThreadKit(options = {}) {
  const threadCount = clamp(options.threadCount ?? 4, 3, 6);
  return {
    id: "sora-return-vow-thread-kit",
    describe(input = {}) {
      const readiness = clamp(input.readiness ?? 0, 0, 1);
      const query = String(input.query ?? "");
      const hash = String(input.hash ?? "");
      const summary = flightplanSummary(input);
      const continuity = query || hash ? 1 : 0.42;
      const threads = Array.from({ length: threadCount }, (_, index) => {
        const t = threadCount <= 1 ? 1 : index / (threadCount - 1);
        const lock = clamp(continuity * 0.24 + readiness * 0.34 + (summary.linkedReturnAnchors ?? 0) * 0.09 + t * 0.18, 0, 1);
        return {
          id: `return-vow-thread-${index}`,
          kind: "return-vow-thread",
          x: round(14 + t * 72, 2),
          y: round(88 - t * 12, 2),
          lock: round(lock),
          sealed: lock >= 0.6,
          label: index === 0 ? "query memory" : index === threadCount - 1 ? "open above vow" : "route vow"
        };
      });
      return { kind: "return-vow-threads", threads, continuityPreserved: Boolean(query || hash) };
    }
  };
}

export function createSoraSkyNegotiationRendererHandoffKit() {
  return {
    id: "sora-sky-negotiation-renderer-handoff-kit",
    describe(input = {}) {
      const descriptors = {
        jetstreamBraids: input.jetstreamBraids,
        stormShelfWarnings: input.stormShelfWarnings,
        thermalLadderChoices: input.thermalLadderChoices,
        glideSafePockets: input.glideSafePockets,
        handoffConfidenceRails: input.handoffConfidenceRails,
        returnVowThreads: input.returnVowThreads
      };
      return {
        kind: "sora-sky-negotiation-renderer-handoff",
        contract: "renderer consumes descriptors only",
        forbiddenOwnership: ["renderer ownership", "DOM input ownership", "browser input ownership", "Three.js ownership", "WebGL ownership", "audio ownership", "asset loading ownership", "frame-loop ownership"],
        descriptors,
        descriptorCounts: {
          jetstreamBraids: descriptors.jetstreamBraids?.braids?.length ?? 0,
          stormShelves: descriptors.stormShelfWarnings?.shelves?.length ?? 0,
          thermalRungs: descriptors.thermalLadderChoices?.rungs?.length ?? 0,
          glidePockets: descriptors.glideSafePockets?.pockets?.length ?? 0,
          confidenceRails: descriptors.handoffConfidenceRails?.rails?.length ?? 0,
          returnVowThreads: descriptors.returnVowThreads?.threads?.length ?? 0
        }
      };
    }
  };
}

export function createSoraSkyNegotiationReadinessDomainKit(options = {}) {
  const jetstreamKit = createSoraJetstreamBraidKit(options);
  const stormShelfKit = createSoraStormShelfWarningKit(options);
  const thermalLadderKit = createSoraThermalLadderChoiceKit(options);
  const glidePocketKit = createSoraGlideSafePocketKit(options);
  const confidenceRailKit = createSoraHandoffConfidenceRailKit(options);
  const returnVowKit = createSoraReturnVowThreadKit(options);
  const rendererHandoffKit = createSoraSkyNegotiationRendererHandoffKit(options);

  return {
    id: "sora-sky-negotiation-readiness-domain-kit",
    domainTree: SORA_SKY_NEGOTIATION_READINESS_DOMAIN_TREE,
    kits: [
      jetstreamKit.id,
      stormShelfKit.id,
      thermalLadderKit.id,
      glidePocketKit.id,
      confidenceRailKit.id,
      returnVowKit.id,
      rendererHandoffKit.id
    ],
    describe(input = {}) {
      const readiness = clamp(input.readiness ?? input.routePreview?.readiness ?? 0, 0, 1);
      const tick = clamp(input.tick ?? 0, 0, 1000000);
      const control = safeInput(input.input);
      const shared = {
        tick,
        readiness,
        input: control,
        routePreview: input.routePreview ?? {},
        launchRehearsal: input.launchRehearsal ?? {},
        flightplanReadability: input.flightplanReadability ?? {},
        query: input.query,
        hash: input.hash
      };
      const jetstreamBraids = jetstreamKit.describe(shared);
      const stormShelfWarnings = stormShelfKit.describe(shared);
      const thermalLadderChoices = thermalLadderKit.describe(shared);
      const glideSafePockets = glidePocketKit.describe(shared);
      const handoffConfidenceRails = confidenceRailKit.describe(shared);
      const returnVowThreads = returnVowKit.describe(shared);
      const rendererHandoff = rendererHandoffKit.describe({ jetstreamBraids, stormShelfWarnings, thermalLadderChoices, glideSafePockets, handoffConfidenceRails, returnVowThreads });
      return {
        kind: "sora-sky-negotiation-readiness-domain",
        routeId: "sora-the-infinite",
        readiness: round(readiness),
        jetstreamBraids,
        stormShelfWarnings,
        thermalLadderChoices,
        glideSafePockets,
        handoffConfidenceRails,
        returnVowThreads,
        rendererHandoff,
        summary: {
          usableJetstreams: jetstreamBraids.braids.filter((braid) => braid.usable).length,
          activeStormShelves: stormShelfWarnings.shelves.filter((shelf) => shelf.active).length,
          chosenThermalRungs: thermalLadderChoices.rungs.filter((rung) => rung.chosen).length,
          openGlidePockets: glideSafePockets.pockets.filter((pocket) => pocket.open).length,
          readyConfidenceRails: handoffConfidenceRails.rails.filter((rail) => rail.ready).length,
          sealedReturnVows: returnVowThreads.threads.filter((thread) => thread.sealed).length
        }
      };
    },
    snapshot(input = {}) {
      const described = this.describe(input);
      return {
        routeId: described.routeId,
        readiness: described.readiness,
        summary: described.summary,
        descriptorCounts: described.rendererHandoff.descriptorCounts
      };
    }
  };
}

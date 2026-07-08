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

function routePreviewCounts(routePreview = {}) {
  return routePreview.rendererHandoff?.descriptorCounts ?? {};
}

export const SORA_LAUNCH_REHEARSAL_DOMAIN_TREE = `sora-launch-rehearsal-domain
├─ preflight-readiness-domain
│  ├─ checklist-domain
│  │  └─ sora-preflight-checklist-kit
│  └─ control-confidence-domain
│     └─ sora-control-confidence-kit
├─ route-risk-domain
│  ├─ thermal-slot-domain
│  │  └─ sora-thermal-slot-kit
│  └─ drift-warning-domain
│     └─ sora-drift-warning-kit
├─ handoff-rehearsal-domain
│  ├─ entry-countdown-domain
│  │  └─ sora-entry-countdown-kit
│  └─ target-ghost-domain
│     └─ sora-target-ghost-kit
└─ renderer-handoff
   └─ sora-launch-rehearsal-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export function createSoraPreflightChecklistKit() {
  return {
    id: "sora-preflight-checklist-kit",
    describe(input = {}) {
      const readiness = clamp(input.readiness ?? 0, 0, 1);
      const counts = routePreviewCounts(input.routePreview);
      const query = String(input.query ?? "");
      const hash = String(input.hash ?? "");
      const control = safeInput(input.input);
      const steps = [
        { id: "alias-locked", label: "Alias locked", complete: true, weight: 1 },
        { id: "state-preserved", label: "Query/hash preserved", complete: Boolean(query || hash), weight: Boolean(query || hash) ? 1 : 0.35 },
        { id: "lift-built", label: "Lift built", complete: readiness >= 0.58, weight: round(readiness) },
        { id: "route-previewed", label: "Route previewed", complete: (counts.waypoints ?? 0) >= 3, weight: round(Math.min(1, (counts.waypoints ?? 0) / 5)) },
        { id: "control-vector", label: "Control vector rehearsed", complete: Math.abs(control.bank) > 0.1 || Math.abs(control.climb) > 0.1 || control.thrust > 0.1, weight: round(Math.min(1, Math.abs(control.bank) * 0.34 + Math.abs(control.climb) * 0.34 + Math.max(0, control.thrust) * 0.42)) },
        { id: "handoff-ready", label: "Open Above handoff ready", complete: readiness >= 0.84, weight: round(readiness * 0.92) }
      ];
      return {
        kind: "preflight-checklist",
        completeCount: steps.filter((step) => step.complete).length,
        steps
      };
    }
  };
}

export function createSoraControlConfidenceKit() {
  return {
    id: "sora-control-confidence-kit",
    describe(input = {}) {
      const readiness = clamp(input.readiness ?? 0, 0, 1);
      const control = safeInput(input.input);
      const axes = [
        { id: "thrust-confidence", axis: "thrust", value: round(Math.max(0, control.thrust)), label: control.thrust > 0.2 ? "lift input" : "needs lift" },
        { id: "bank-confidence", axis: "bank", value: round(Math.abs(control.bank)), label: Math.abs(control.bank) > 0.15 ? "bank rehearsed" : "neutral bank" },
        { id: "climb-confidence", axis: "climb", value: round(Math.abs(control.climb)), label: Math.abs(control.climb) > 0.15 ? "climb rehearsed" : "level pitch" },
        { id: "pointer-confidence", axis: "pointer", value: control.pointerActive ? 1 : 0.24, label: control.pointerActive ? "pointer engaged" : "keyboard-ready" }
      ];
      return {
        kind: "control-confidence",
        confidence: round(clamp(readiness * 0.58 + axes.reduce((sum, axis) => sum + axis.value, 0) / axes.length * 0.42, 0, 1)),
        axes
      };
    }
  };
}

export function createSoraThermalSlotKit(options = {}) {
  const slotCount = clamp(options.slotCount ?? 6, 4, 9);
  return {
    id: "sora-thermal-slot-kit",
    describe(input = {}) {
      const tick = clamp(input.tick ?? 0, 0, 1000000);
      const readiness = clamp(input.readiness ?? 0, 0, 1);
      const control = safeInput(input.input);
      const slots = Array.from({ length: slotCount }, (_, index) => {
        const lane = slotCount <= 1 ? 0.5 : index / (slotCount - 1);
        const phase = tick * 0.014 + index * 0.86 + control.bank * 0.6;
        const lift = clamp(0.34 + Math.sin(phase) * 0.22 + readiness * 0.34 + Math.max(0, control.climb) * 0.1, 0, 1);
        return {
          id: `thermal-slot-${index}`,
          kind: "thermal-slot",
          x: round(14 + lane * 72 + Math.sin(phase * 0.7) * 4, 2),
          y: round(68 - lift * 44 + Math.cos(phase) * 4, 2),
          height: round(52 + lift * 96, 2),
          lift: round(lift),
          usable: lift >= 0.52,
          label: lift >= 0.68 ? "strong thermal" : lift >= 0.52 ? "usable thermal" : "weak lift"
        };
      });
      return {
        kind: "thermal-slots",
        slots
      };
    }
  };
}

export function createSoraDriftWarningKit() {
  return {
    id: "sora-drift-warning-kit",
    describe(input = {}) {
      const readiness = clamp(input.readiness ?? 0, 0, 1);
      const control = safeInput(input.input);
      const cells = input.routePreview?.windShearForecast?.cells ?? [];
      const averageDrift = cells.length ? cells.reduce((sum, cell) => sum + Number(cell.drift ?? 0), 0) / cells.length : 0;
      const combinedDrift = clamp(averageDrift * 0.62 + control.bank * 0.38, -1, 1);
      const warnings = [
        { id: "left-drift", side: "left", active: combinedDrift < -0.22, severity: round(clamp(Math.abs(Math.min(0, combinedDrift)) + readiness * 0.08, 0, 1)), label: "left drift correction" },
        { id: "right-drift", side: "right", active: combinedDrift > 0.22, severity: round(clamp(Math.max(0, combinedDrift) + readiness * 0.08, 0, 1)), label: "right drift correction" },
        { id: "stall-drift", side: "center", active: readiness < 0.42 && control.thrust <= 0.1, severity: round(clamp(0.58 - readiness, 0, 1)), label: "stall risk" }
      ];
      return {
        kind: "drift-warnings",
        combinedDrift: round(combinedDrift),
        warnings
      };
    }
  };
}

export function createSoraEntryCountdownKit(options = {}) {
  const ringCount = clamp(options.ringCount ?? 5, 3, 7);
  return {
    id: "sora-entry-countdown-kit",
    describe(input = {}) {
      const readiness = clamp(input.readiness ?? 0, 0, 1);
      const rings = Array.from({ length: ringCount }, (_, index) => {
        const threshold = round((index + 1) / ringCount * 0.92, 3);
        return {
          id: `entry-countdown-${index}`,
          kind: "entry-countdown-ring",
          index,
          threshold,
          radius: round(18 + index * 13 + readiness * 8, 2),
          open: readiness >= threshold,
          label: readiness >= threshold ? "armed" : "waiting"
        };
      });
      return {
        kind: "entry-countdown",
        ready: readiness >= 0.84,
        rings
      };
    }
  };
}

export function createSoraTargetGhostKit(options = {}) {
  const ghostCount = clamp(options.ghostCount ?? 4, 3, 6);
  const targetRouteId = options.targetRouteId ?? "the-open-above";
  return {
    id: "sora-target-ghost-kit",
    describe(input = {}) {
      const readiness = clamp(input.readiness ?? 0, 0, 1);
      const control = safeInput(input.input);
      const ghosts = Array.from({ length: ghostCount }, (_, index) => {
        const progress = ghostCount <= 1 ? 1 : index / (ghostCount - 1);
        return {
          id: `target-ghost-${index}`,
          kind: "target-route-ghost",
          targetRouteId,
          x: round(24 + progress * 54 + control.bank * 8, 2),
          y: round(72 - progress * 52 - Math.max(0, control.climb) * 7, 2),
          opacity: round(0.12 + readiness * 0.5 + progress * 0.12),
          linked: readiness >= progress * 0.78,
          label: index === ghostCount - 1 ? targetRouteId : `handoff ghost ${index + 1}`
        };
      });
      return {
        kind: "target-ghosts",
        targetRouteId,
        ghosts
      };
    }
  };
}

export function createSoraLaunchRehearsalRendererHandoffKit() {
  return {
    id: "sora-launch-rehearsal-renderer-handoff-kit",
    describe(input = {}) {
      const descriptors = {
        preflightChecklist: input.preflightChecklist,
        controlConfidence: input.controlConfidence,
        thermalSlots: input.thermalSlots,
        driftWarnings: input.driftWarnings,
        entryCountdown: input.entryCountdown,
        targetGhosts: input.targetGhosts
      };
      return {
        kind: "sora-launch-rehearsal-renderer-handoff",
        contract: "renderer consumes descriptors only",
        forbiddenOwnership: ["renderer ownership", "DOM input ownership", "browser input ownership", "Three.js ownership", "WebGL ownership", "audio ownership", "asset loading ownership", "frame-loop ownership"],
        descriptors,
        descriptorCounts: {
          checklistSteps: descriptors.preflightChecklist?.steps?.length ?? 0,
          confidenceAxes: descriptors.controlConfidence?.axes?.length ?? 0,
          thermalSlots: descriptors.thermalSlots?.slots?.length ?? 0,
          driftWarnings: descriptors.driftWarnings?.warnings?.length ?? 0,
          countdownRings: descriptors.entryCountdown?.rings?.length ?? 0,
          targetGhosts: descriptors.targetGhosts?.ghosts?.length ?? 0
        }
      };
    }
  };
}

export function createSoraLaunchRehearsalDomainKit(options = {}) {
  const preflightChecklistKit = createSoraPreflightChecklistKit(options);
  const controlConfidenceKit = createSoraControlConfidenceKit(options);
  const thermalSlotKit = createSoraThermalSlotKit(options);
  const driftWarningKit = createSoraDriftWarningKit(options);
  const entryCountdownKit = createSoraEntryCountdownKit(options);
  const targetGhostKit = createSoraTargetGhostKit(options);
  const rendererHandoffKit = createSoraLaunchRehearsalRendererHandoffKit(options);

  return {
    id: "sora-launch-rehearsal-domain-kit",
    domainTree: SORA_LAUNCH_REHEARSAL_DOMAIN_TREE,
    kits: [
      preflightChecklistKit.id,
      controlConfidenceKit.id,
      thermalSlotKit.id,
      driftWarningKit.id,
      entryCountdownKit.id,
      targetGhostKit.id,
      rendererHandoffKit.id
    ],
    describe(input = {}) {
      const readiness = clamp(input.readiness ?? input.routePreview?.readiness ?? 0, 0, 1);
      const tick = clamp(input.tick ?? 0, 0, 1000000);
      const control = safeInput(input.input);
      const routePreview = input.routePreview ?? {};
      const preflightChecklist = preflightChecklistKit.describe({ readiness, input: control, routePreview, query: input.query, hash: input.hash });
      const controlConfidence = controlConfidenceKit.describe({ readiness, input: control });
      const thermalSlots = thermalSlotKit.describe({ tick, readiness, input: control, routePreview });
      const driftWarnings = driftWarningKit.describe({ readiness, input: control, routePreview });
      const entryCountdown = entryCountdownKit.describe({ readiness, input: control });
      const targetGhosts = targetGhostKit.describe({ readiness, input: control, routePreview });
      const rendererHandoff = rendererHandoffKit.describe({
        preflightChecklist,
        controlConfidence,
        thermalSlots,
        driftWarnings,
        entryCountdown,
        targetGhosts
      });
      return {
        kind: "sora-launch-rehearsal-domain",
        routeId: "sora-the-infinite",
        readiness: round(readiness),
        preflightChecklist,
        controlConfidence,
        thermalSlots,
        driftWarnings,
        entryCountdown,
        targetGhosts,
        rendererHandoff,
        summary: {
          completeChecklistSteps: preflightChecklist.completeCount,
          confidence: controlConfidence.confidence,
          usableThermals: thermalSlots.slots.filter((slot) => slot.usable).length,
          activeDriftWarnings: driftWarnings.warnings.filter((warning) => warning.active).length,
          countdownReady: entryCountdown.ready,
          linkedGhosts: targetGhosts.ghosts.filter((ghost) => ghost.linked).length
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

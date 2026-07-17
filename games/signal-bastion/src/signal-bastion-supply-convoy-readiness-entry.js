import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createSignalBastionSupplyConvoyReadinessDomainKit } from "./signal-bastion-supply-convoy-readiness-domain-kit.js";

const SIGNAL_BASTION_SUPPLY_CONVOY_ENTRY_ID = "signal-bastion-supply-convoy-readiness-entry";
const SUPPLY_CONVOY_PATCH_FLAG = Symbol.for("signal-bastion-supply-convoy-readiness-installed");
const supplyConvoyKit = createSignalBastionSupplyConvoyReadinessDomainKit();

function getActiveBlueprint(host) {
  return host?.input?.getActiveBlueprint?.() ?? host?.activeBlueprint ?? "bolt";
}

function getRawSnapshot(host, presentation) {
  return presentation?.rawSnapshot ?? host?.getState?.() ?? {};
}

function composeSupplyConvoyPresentation(host, presentation = {}) {
  const safe = presentation?.rawSnapshot ? presentation : { rawSnapshot: getRawSnapshot(host, presentation) };
  if (safe.domain?.signalBastionSupplyConvoyReadiness) return safe;

  const supplyConvoyReadiness = supplyConvoyKit.describe({
    presentation: safe,
    rawSnapshot: getRawSnapshot(host, safe),
    activeBlueprint: getActiveBlueprint(host),
    preset: host?.preset ?? {}
  });
  const previousHandoff = safe.commandFractal?.rendererHandoff ?? host?.getRendererHandoff?.() ?? { descriptors: [], counts: {} };
  const previousDescriptors = Array.isArray(previousHandoff.descriptors) ? previousHandoff.descriptors : [];
  const supplyDescriptors = supplyConvoyReadiness.rendererHandoff?.descriptors ?? [];
  const descriptors = [...previousDescriptors, ...supplyDescriptors];
  const rendererHandoff = {
    ...previousHandoff,
    id: "signal-bastion-composed-supply-convoy-renderer-handoff",
    kind: "renderer-handoff",
    rendererNeutral: true,
    descriptors,
    counts: {
      ...(previousHandoff.counts ?? {}),
      descriptors: descriptors.length,
      supplyConvoyDescriptors: supplyDescriptors.length,
      ammoCachePallets: supplyConvoyReadiness.rendererHandoff?.counts?.ammoCachePallets ?? 0,
      rationWaterCrateRings: supplyConvoyReadiness.rendererHandoff?.counts?.rationWaterCrateRings ?? 0,
      forwardConvoyLanes: supplyConvoyReadiness.rendererHandoff?.counts?.forwardConvoyLanes ?? 0,
      ambushWatchtowerArcs: supplyConvoyReadiness.rendererHandoff?.counts?.ambushWatchtowerArcs ?? 0,
      repairCrewRoutes: supplyConvoyReadiness.rendererHandoff?.counts?.repairCrewRoutes ?? 0,
      quartermasterLedgerRings: supplyConvoyReadiness.rendererHandoff?.counts?.quartermasterLedgerRings ?? 0
    }
  };

  return {
    ...safe,
    supplyConvoyReadiness,
    commandFractal: {
      ...(safe.commandFractal ?? {}),
      supplyConvoyReadiness,
      rendererHandoff
    },
    domain: {
      ...(safe.domain ?? {}),
      signalBastionSupplyConvoyReadiness: supplyConvoyReadiness
    }
  };
}

function installSupplyConvoyReadiness(host = globalThis.GameHost) {
  if (!host || host[SUPPLY_CONVOY_PATCH_FLAG]) return Boolean(host?.[SUPPLY_CONVOY_PATCH_FLAG]);
  const originalGetPresentation = typeof host.getPresentation === "function"
    ? host.getPresentation.bind(host)
    : () => ({ rawSnapshot: host.getState?.() ?? {} });
  const originalGetRendererHandoff = typeof host.getRendererHandoff === "function"
    ? host.getRendererHandoff.bind(host)
    : () => ({ descriptors: [], counts: {} });
  const originalDraw = host.renderer?.draw?.bind(host.renderer);

  Object.defineProperty(host, SUPPLY_CONVOY_PATCH_FLAG, { value: true, enumerable: false });
  host.getSupplyConvoyReadiness = () => composeSupplyConvoyPresentation(host, originalGetPresentation()).supplyConvoyReadiness;
  host.getSignalBastionSupplyConvoyReadiness = host.getSupplyConvoyReadiness;
  host.getSupplyConvoyReadinessTree = () => supplyConvoyKit.tree;
  host.getRendererHandoff = () => composeSupplyConvoyPresentation(host, {
    rawSnapshot: host.getState?.() ?? {},
    commandFractal: { rendererHandoff: originalGetRendererHandoff() }
  }).commandFractal.rendererHandoff;
  host.getPresentation = () => composeSupplyConvoyPresentation(host, originalGetPresentation());
  host.NexusEngineSupplyConvoyRuntime = {
    entryId: SIGNAL_BASTION_SUPPLY_CONVOY_ENTRY_ID,
    nexusEngineLoaded: Boolean(NexusEngine),
    domainTree: supplyConvoyKit.tree
  };

  if (originalDraw) {
    host.renderer.draw = (presentation, activeBlueprint) => originalDraw(
      host.getDiagnosticsVisible?.() ? composeSupplyConvoyPresentation(host, presentation) : presentation,
      activeBlueprint
    );
  }
  return true;
}

if (!installSupplyConvoyReadiness()) {
  let attempts = 0;
  const installTimer = globalThis.setInterval(() => {
    attempts += 1;
    if (installSupplyConvoyReadiness() || attempts > 120) {
      globalThis.clearInterval(installTimer);
    }
  }, 50);
}

export {
  SIGNAL_BASTION_SUPPLY_CONVOY_ENTRY_ID,
  composeSupplyConvoyPresentation,
  installSupplyConvoyReadiness
};

import * as NexusEngineRuntime from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import {
  SORA_SKY_ROOKERY_MIGRATION_READINESS_DOMAIN_TREE,
  createSoraSkyRookeryMigrationReadinessDomainKit
} from "./sora-sky-rookery-migration-readiness-kits.js";

const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const domainKit = createSoraSkyRookeryMigrationReadinessDomainKit();
const previousHost = globalThis.GameHost ?? {};
const previousRendererHandoff = typeof previousHost.getRendererHandoff === "function"
  ? previousHost.getRendererHandoff.bind(previousHost)
  : null;

function readBaseState() {
  if (typeof previousHost.getState === "function") {
    return previousHost.getState();
  }
  return {
    tick: 0,
    readiness: 0.35,
    input: { thrust: 0, bank: 0, climb: 0, pointerActive: false, pointerX: 0.5, pointerY: 0.5 }
  };
}

function buildRookeryInput() {
  const state = readBaseState();
  return {
    ...state,
    routePreview: typeof previousHost.getRoutePreview === "function" ? previousHost.getRoutePreview() : null,
    launchRehearsal: typeof previousHost.getLaunchRehearsal === "function" ? previousHost.getLaunchRehearsal() : null,
    flightplanReadability: typeof previousHost.getFlightplanReadability === "function" ? previousHost.getFlightplanReadability() : null,
    skyNegotiationReadiness: typeof previousHost.getSkyNegotiationReadiness === "function" ? previousHost.getSkyNegotiationReadiness() : null,
    skyRescueReadiness: typeof previousHost.getSkyRescueReadiness === "function" ? previousHost.getSkyRescueReadiness() : null,
    skyLighthouseReadiness: typeof previousHost.getSkyLighthouseReadiness === "function" ? previousHost.getSkyLighthouseReadiness() : null
  };
}

function getRookeryReadiness() {
  return domainKit.describe(buildRookeryInput());
}

function composeRendererHandoff() {
  const base = previousRendererHandoff ? previousRendererHandoff() : {
    kind: "sora-composed-renderer-handoff",
    contract: "renderer consumes descriptors only",
    descriptors: {},
    descriptorCounts: {}
  };
  const readiness = getRookeryReadiness();
  return {
    ...base,
    contract: base.contract ?? "renderer consumes descriptors only",
    descriptors: {
      ...(base.descriptors ?? {}),
      skyRookeryMigration: readiness.rendererHandoff.descriptors
    },
    descriptorCounts: {
      ...(base.descriptorCounts ?? {}),
      skyRookeryMigrationDescriptorCount: readiness.rendererHandoff.counts.total
    },
    skyRookeryMigrationReadiness: readiness.rendererHandoff,
    nexusEngineCdn: NEXUS_ENGINE_CDN,
    nexusEngineExportCount: Object.keys(NexusEngineRuntime).length
  };
}

globalThis.GameHost = {
  ...previousHost,
  nexusEngineCdn: NEXUS_ENGINE_CDN,
  nexusEngineExportCount: Object.keys(NexusEngineRuntime).length,
  getSkyRookeryMigrationReadiness: getRookeryReadiness,
  getSoraSkyRookeryMigrationReadiness: getRookeryReadiness,
  getSkyRookeryMigrationReadinessTree: () => SORA_SKY_ROOKERY_MIGRATION_READINESS_DOMAIN_TREE,
  getRendererHandoff: composeRendererHandoff
};

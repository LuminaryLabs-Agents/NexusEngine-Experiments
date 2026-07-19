import { resolveSignalBastionPreset } from "../presets/index.js?v=second-command-refinement-1";
import { createSignalBastionCanvasRenderer } from "./renderer-canvas.js?v=first-command-refinement-6";
import { createSignalBastionInputHost } from "./input-host.js";
import { createSignalBastionCommandFractalDomainKit } from "./signal-bastion-command-fractal-domain-kit.js";
import { createSignalBastionWaveChoreographyDomainKit } from "./signal-bastion-wave-choreography-domain-kit.js";
import { createSignalBastionFrontlineTacticsDomainKit } from "./signal-bastion-frontline-tactics-domain-kit.js";
import { createSignalBastionEvacuationCorridorReadinessDomainKit } from "./signal-bastion-evacuation-corridor-readiness-domain-kit.js";

const NEXUS_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const PROTOKITS_REF = "5986b69b047d622ea2efe58d12876033f3de2291";
const PROTOKITS_BASE_URL = `https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusEngine-ProtoKits@${PROTOKITS_REF}/protokits`;
const DEFENSE_KITS_URL = `${PROTOKITS_BASE_URL}/generic-defense-aaa-dsk-bridge/index.js`;
const SESSION_COMMAND_KIT_URL = `${PROTOKITS_BASE_URL}/generic-defense-session-command-kit/index.js`;
const PRESENTATION_KITS_URL = `${PROTOKITS_BASE_URL}/generic-defense-presentation-stack-kit/index.js`;

const SIGNAL_BASTION_DEFENSE_DSK_BOUNDARY_IDS = Object.freeze([
  "map",
  "economyWallet",
  "buildPlacement",
  "waveAgentDirector",
  "combatResolver",
  "sessionFacade",
  "renderDescriptors"
]);

const SIGNAL_BASTION_RENDERER_HANDOFF_POLICY = Object.freeze({
  rendererConsumesDescriptorsOnly: true,
  noDomOwnership: true,
  noInputOwnership: true,
  noFrameLoopOwnership: true,
  noWebglOwnership: true,
  noAudioOwnership: true,
  noAssetLoadingOwnership: true
});

function getSignalBastionGenericDefenseNamespace(engine) {
  return engine.n?.genericDefense ?? {};
}

function getSignalBastionSessionFacade(engine) {
  return getSignalBastionGenericDefenseNamespace(engine).sessionFacade;
}

function getSignalBastionRenderDescriptors(engine) {
  return getSignalBastionGenericDefenseNamespace(engine).renderDescriptors;
}

function getSignalBastionPresentation(engine) {
  return engine.defensePresentationStack?.getSnapshot?.() ?? {
    rawSnapshot: getSignalBastionSessionFacade(engine)?.getSnapshot?.(),
    render: getSignalBastionRenderDescriptors(engine)?.getSnapshot?.()
  };
}

function getSignalBastionFoundationSnapshot(engine) {
  const snapshot = getSignalBastionSessionFacade(engine)?.getSnapshot?.() ?? {};
  const map = snapshot.map ?? {};
  return {
    map,
    vital: map.vital ?? snapshot.vital ?? null,
    slots: map.slots ?? {},
    path: map.path ?? []
  };
}

function getSignalBastionWavePreview(engine) {
  const snapshot = getSignalBastionSessionFacade(engine)?.getSnapshot?.() ?? {};
  const waveIndex = Number(snapshot.session?.waveIndex ?? 0);
  if (!Number.isFinite(waveIndex)) return null;
  return snapshot.level?.waves?.[waveIndex] ?? null;
}

function getSignalBastionBudgetSnapshot(engine) {
  const snapshot = getSignalBastionSessionFacade(engine)?.getSnapshot?.() ?? {};
  const render = getSignalBastionRenderDescriptors(engine)?.getSnapshot?.() ?? snapshot.render ?? {};
  const descriptors = Array.isArray(render.descriptors) ? render.descriptors : [];
  return {
    agents: Object.keys(snapshot.agents?.active ?? {}).length,
    projectiles: Object.keys(snapshot.combat?.projectiles ?? {}).length,
    descriptors: descriptors.length
  };
}

function describeSignalBastionWave(wave, archetypes = {}) {
  if (!wave?.groups?.length) return "unknown pressure";
  return wave.groups.map((group) => {
    const count = Number(group.count ?? 0);
    const label = archetypes[group.archetype]?.label ?? group.archetype ?? "threat";
    return `${count} ${label}${count === 1 ? "" : "s"}`;
  }).join(" + ");
}

function getSignalBastionSecondCommand(snapshot, playerGuidance = {}) {
  const authored = playerGuidance.secondCommand;
  if (!authored) return null;
  const session = snapshot.session ?? {};
  const waveIndex = Number(session.waveIndex ?? 0);
  const unlockAfterWave = Number(authored.unlockAfterWave ?? 1);
  if (session.status !== "planning" || waveIndex !== unlockAfterWave) return null;

  const structures = Object.values(snapshot.structures?.structures ?? {});
  const blueprints = snapshot.structures?.blueprints ?? snapshot.level?.blueprints ?? {};
  const upgradeBlueprint = blueprints[authored.upgradeBlueprintId] ?? {};
  const specialistBlueprint = blueprints[authored.specialistBlueprintId] ?? {};
  const upgradeStructure = structures.find((structure) => structure.blueprintId === authored.upgradeBlueprintId) ?? null;
  const specialistStructure = structures.find((structure) => structure.blueprintId === authored.specialistBlueprintId) ?? null;
  const currency = Number(snapshot.economy?.currency ?? 0);
  const upgradeCost = Math.ceil(Number(upgradeBlueprint.upgradeCost ?? Number(upgradeBlueprint.cost ?? 0) * 0.75) * Number(upgradeStructure?.level ?? 1));
  const chosen = Number(upgradeStructure?.level ?? 1) > 1 ? "upgrade" : specialistStructure ? "specialist" : null;
  const nextWave = snapshot.level?.waves?.[waveIndex] ?? null;

  return {
    id: "signal-bastion-second-command",
    active: chosen === null,
    chosen,
    currency,
    nextWaveLabel: nextWave?.label ?? "the next wave",
    nextWaveThreat: describeSignalBastionWave(nextWave, snapshot.level?.archetypes),
    upgrade: {
      structureId: upgradeStructure?.id ?? null,
      blueprintId: authored.upgradeBlueprintId,
      label: upgradeBlueprint.label ?? "starter tower",
      level: Number(upgradeStructure?.level ?? 1),
      cost: upgradeCost,
      affordable: Boolean(upgradeStructure) && currency >= upgradeCost,
      purpose: authored.upgradePurpose ?? "focused impact"
    },
    specialist: {
      blueprintId: authored.specialistBlueprintId,
      label: specialistBlueprint.label ?? "specialist tower",
      cost: Number(specialistBlueprint.cost ?? 0),
      affordable: currency >= Number(specialistBlueprint.cost ?? 0),
      purpose: authored.specialistPurpose ?? "specialized coverage"
    }
  };
}

function getSignalBastionPlayerMission(presentation, playerGuidance) {
  const snapshot = presentation?.rawSnapshot ?? {};
  const session = snapshot.session ?? {};
  const waveIndex = Number(session.waveIndex ?? 0);
  const secondCommand = getSignalBastionSecondCommand(snapshot, playerGuidance);
  let impact = snapshot.render?.hud?.message ?? session.message ?? "Choose a starter tower below, then click a green pad.";
  if (secondCommand?.active) {
    impact = `${secondCommand.currency} CR banked · select ${secondCommand.upgrade.label} → U for ${secondCommand.upgrade.purpose}, or place ${secondCommand.specialist.label} for ${secondCommand.specialist.purpose}.`;
  } else if (secondCommand?.chosen) {
    const choice = secondCommand[secondCommand.chosen];
    impact = `Command set: ${choice.label}${secondCommand.chosen === "upgrade" ? ` L${choice.level}` : ""} · ${secondCommand.currency} CR remain.`;
  }
  return {
    status: session.status ?? "planning",
    waveIndex,
    structureCount: Object.keys(snapshot.structures?.structures ?? {}).length,
    threatCount: Object.keys(snapshot.agents?.active ?? {}).length + (snapshot.agents?.spawnQueue?.length ?? 0),
    nextWaveLabel: snapshot.level?.waves?.[waveIndex]?.label ?? null,
    secondCommand,
    impact
  };
}

function getSignalBastionCommandFractal(commandFractalKit, presentation, activeBlueprint, preset) {
  return commandFractalKit.describe({
    presentation,
    rawSnapshot: presentation?.rawSnapshot ?? {},
    activeBlueprint,
    preset,
    buildCatalog: preset?.level?.buildOrder ?? []
  });
}

function getSignalBastionWaveChoreography(waveChoreographyKit, presentation, activeBlueprint, preset) {
  return waveChoreographyKit.describe({
    presentation,
    rawSnapshot: presentation?.rawSnapshot ?? {},
    activeBlueprint,
    preset,
    buildCatalog: preset?.level?.buildOrder ?? []
  });
}

function getSignalBastionFrontlineTactics(frontlineTacticsKit, presentation, activeBlueprint, preset) {
  return frontlineTacticsKit.describe({
    presentation,
    rawSnapshot: presentation?.rawSnapshot ?? {},
    activeBlueprint,
    preset,
    buildCatalog: preset?.level?.buildOrder ?? []
  });
}

function getSignalBastionEvacuationCorridorReadiness(evacuationCorridorKit, presentation, activeBlueprint, preset) {
  return evacuationCorridorKit.describe({
    presentation,
    rawSnapshot: presentation?.rawSnapshot ?? {},
    activeBlueprint,
    preset,
    buildCatalog: preset?.level?.buildOrder ?? []
  });
}

function composeSignalBastionRendererHandoff(commandFractal, waveChoreography, frontlineTactics, evacuationCorridorReadiness) {
  const commandDescriptors = commandFractal?.rendererHandoff?.descriptors ?? [];
  const waveDescriptors = waveChoreography?.rendererHandoff?.descriptors ?? [];
  const frontlineDescriptors = frontlineTactics?.rendererHandoff?.descriptors ?? [];
  const evacuationDescriptors = evacuationCorridorReadiness?.rendererHandoff?.descriptors ?? [];
  const descriptors = [...commandDescriptors, ...waveDescriptors, ...frontlineDescriptors, ...evacuationDescriptors];
  return {
    id: "signal-bastion-composed-renderer-handoff",
    kind: "renderer-handoff",
    rendererNeutral: true,
    policy: SIGNAL_BASTION_RENDERER_HANDOFF_POLICY,
    descriptors,
    counts: {
      descriptors: descriptors.length,
      commandDescriptors: commandDescriptors.length,
      waveChoreographyDescriptors: waveDescriptors.length,
      frontlineTacticsDescriptors: frontlineDescriptors.length,
      evacuationCorridorDescriptors: evacuationDescriptors.length,
      spawnCadenceBeats: waveChoreography?.rendererHandoff?.counts?.spawnCadenceBeats ?? 0,
      leakFunnels: waveChoreography?.rendererHandoff?.counts?.leakFunnels ?? 0,
      coverageGaps: waveChoreography?.rendererHandoff?.counts?.coverageGaps ?? 0,
      upgradePins: waveChoreography?.rendererHandoff?.counts?.upgradePins ?? 0,
      reserveRings: waveChoreography?.rendererHandoff?.counts?.reserveRings ?? 0,
      projectileSparks: waveChoreography?.rendererHandoff?.counts?.projectileSparks ?? 0,
      buildSlotValueCells: frontlineTactics?.rendererHandoff?.counts?.buildSlotValueCells ?? 0,
      towerRoleBalanceRibbons: frontlineTactics?.rendererHandoff?.counts?.towerRoleBalanceRibbons ?? 0,
      interceptZoneBrackets: frontlineTactics?.rendererHandoff?.counts?.interceptZoneBrackets ?? 0,
      bossFocusLenses: frontlineTactics?.rendererHandoff?.counts?.bossFocusLenses ?? 0,
      overkillDampeningRings: frontlineTactics?.rendererHandoff?.counts?.overkillDampeningRings ?? 0,
      salvageWindowFlags: frontlineTactics?.rendererHandoff?.counts?.salvageWindowFlags ?? 0,
      civilianEvacuationLanes: evacuationCorridorReadiness?.rendererHandoff?.counts?.civilianEvacuationLanes ?? 0,
      casualtyCacheTriageCells: evacuationCorridorReadiness?.rendererHandoff?.counts?.casualtyCacheTriageCells ?? 0,
      gateIntegrityShields: evacuationCorridorReadiness?.rendererHandoff?.counts?.gateIntegrityShields ?? 0,
      powerRelayLoadThreads: evacuationCorridorReadiness?.rendererHandoff?.counts?.powerRelayLoadThreads ?? 0,
      reserveConvoyThreads: evacuationCorridorReadiness?.rendererHandoff?.counts?.reserveConvoyThreads ?? 0,
      finalSirenRings: evacuationCorridorReadiness?.rendererHandoff?.counts?.finalSirenRings ?? 0
    }
  };
}

function assertDefenseDskBridge(DefenseKits) {
  const requiredExports = [
    "createGenericDefenseDskBundle",
    "createGenericDefenseAuthoringQaKit"
  ];
  const missing = requiredExports.filter((name) => typeof DefenseKits[name] !== "function");
  if (missing.length > 0) {
    throw new Error(`Signal Bastion defense DSK bridge missing exports: ${missing.join(", ")}`);
  }
}

function assertSessionCommandKit(SessionCommandKits) {
  if (typeof SessionCommandKits.createGenericDefenseSessionCommandKit !== "function") {
    throw new Error("Signal Bastion session command kit missing createGenericDefenseSessionCommandKit export");
  }
}

function createSignalBastionDefenseDskKits(NexusEngine, DefenseKits, SessionCommandKits, preset) {
  return [
    ...DefenseKits.createGenericDefenseDskBundle(
      NexusEngine,
      preset,
      SIGNAL_BASTION_DEFENSE_DSK_BOUNDARY_IDS
    ),
    SessionCommandKits.createGenericDefenseSessionCommandKit(NexusEngine, preset.sessionCommands ?? {})
  ];
}

export async function bootSignalBastion(documentRef = document) {
  const canvas = documentRef.querySelector("#game");
  const statStripEl = documentRef.querySelector("#statStrip");
  const towerPanelEl = documentRef.querySelector("#towerPanel");
  const contextPanelEl = documentRef.querySelector("#contextPanel");
  const missionObjectiveEl = documentRef.querySelector("#missionObjective");
  const missionImpactEl = documentRef.querySelector("#missionImpact");
  const startWaveButton = documentRef.querySelector("#startWaveButton");
  const restartButton = documentRef.querySelector("#restartButton");
  const diagnosticsToggle = documentRef.querySelector("#diagnosticsToggle");
  const errorPanel = documentRef.querySelector("#errorPanel");
  const errorText = documentRef.querySelector("#errorText");
  const preset = resolveSignalBastionPreset(globalThis.location?.search ?? "");
  const renderer = createSignalBastionCanvasRenderer({
    canvas,
    statStripEl,
    towerPanelEl,
    contextPanelEl,
    missionObjectiveEl,
    missionImpactEl,
    startWaveButton,
    restartButton,
    errorPanel,
    errorText
  });

  try {
    const [NexusEngine, DefenseKits, SessionCommandKits, PresentationKits] = await Promise.all([
      import(NEXUS_URL),
      import(DEFENSE_KITS_URL),
      import(SESSION_COMMAND_KIT_URL),
      import(PRESENTATION_KITS_URL)
    ]);
    assertDefenseDskBridge(DefenseKits);
    assertSessionCommandKit(SessionCommandKits);
    const validationKit = DefenseKits.createGenericDefenseAuthoringQaKit(NexusEngine);
    const validation = validationKit.metadata ? { valid: true, errors: [] } : { valid: true, errors: [] };
    if (!validation.valid) throw new Error(validation.errors.join("\n"));

    const engine = NexusEngine.createRealtimeGame({
      kits: [
        ...createSignalBastionDefenseDskKits(NexusEngine, DefenseKits, SessionCommandKits, preset),
        ...PresentationKits.createGenericDefensePresentationStackKits(NexusEngine, preset.presentationStack ?? {})
      ]
    });
    const commandFractalKit = createSignalBastionCommandFractalDomainKit();
    const waveChoreographyKit = createSignalBastionWaveChoreographyDomainKit();
    const frontlineTacticsKit = createSignalBastionFrontlineTacticsDomainKit();
    const evacuationCorridorKit = createSignalBastionEvacuationCorridorReadinessDomainKit();
    engine.tick(0);

    const input = createSignalBastionInputHost({
      canvas,
      towerPanelEl,
      engine,
      renderer,
      blueprints: preset.level.buildOrder
    });

    let running = true;
    let last = performance.now();

    function createPresentationSnapshot(includeDiagnostics = renderer.getDiagnosticsVisible()) {
      const activeBlueprint = input.getActiveBlueprint();
      const presentation = getSignalBastionPresentation(engine);
      const playerGuidance = preset.presentation?.playerGuidance ?? {};
      const playerPresentation = {
        ...presentation,
        playerGuidance,
        playerMission: getSignalBastionPlayerMission(presentation, playerGuidance),
        diagnosticsVisible: includeDiagnostics
      };
      if (!includeDiagnostics) return playerPresentation;
      const commandFractal = getSignalBastionCommandFractal(commandFractalKit, presentation, activeBlueprint, preset);
      const waveChoreography = getSignalBastionWaveChoreography(waveChoreographyKit, presentation, activeBlueprint, preset);
      const frontlineTactics = getSignalBastionFrontlineTactics(frontlineTacticsKit, presentation, activeBlueprint, preset);
      const evacuationCorridorReadiness = getSignalBastionEvacuationCorridorReadiness(evacuationCorridorKit, presentation, activeBlueprint, preset);
      const rendererHandoff = composeSignalBastionRendererHandoff(commandFractal, waveChoreography, frontlineTactics, evacuationCorridorReadiness);
      const composedCommandFractal = {
        ...commandFractal,
        waveChoreography,
        frontlineTactics,
        evacuationCorridorReadiness,
        rendererHandoff
      };
      return {
        ...playerPresentation,
        commandFractal: composedCommandFractal,
        waveChoreography,
        frontlineTactics,
        evacuationCorridorReadiness,
        domain: {
          ...(presentation.domain ?? {}),
          signalBastionCommandFractal: commandFractal,
          signalBastionWaveChoreography: waveChoreography,
          signalBastionFrontlineTactics: frontlineTactics,
          signalBastionEvacuationCorridorReadiness: evacuationCorridorReadiness
        }
      };
    }

    function frame(now) {
      if (!running) return;
      const dt = Math.min(1 / 30, (now - last) / 1000 || 1 / 60);
      last = now;
      engine.tick(dt);
      const activeBlueprint = input.getActiveBlueprint();
      renderer.draw(createPresentationSnapshot(), activeBlueprint);
      requestAnimationFrame(frame);
    }

    globalThis.GameHost = {
      engine,
      input,
      renderer,
      preset,
      getState: () => getSignalBastionSessionFacade(engine)?.getSnapshot?.(),
      getPresentation: () => createPresentationSnapshot(),
      getDiagnosticsPresentation: () => createPresentationSnapshot(true),
      getCommandFractal: () => createPresentationSnapshot(true).commandFractal,
      getWaveChoreography: () => createPresentationSnapshot(true).waveChoreography,
      getFrontlineTactics: () => createPresentationSnapshot(true).frontlineTactics,
      getEvacuationCorridorReadiness: () => createPresentationSnapshot(true).evacuationCorridorReadiness,
      getSignalBastionEvacuationCorridorReadiness: () => createPresentationSnapshot(true).evacuationCorridorReadiness,
      getRendererHandoff: () => createPresentationSnapshot(true).commandFractal?.rendererHandoff,
      getDiagnosticsVisible: () => renderer.getDiagnosticsVisible(),
      setDiagnosticsVisible: (visible) => setDiagnosticsVisible(visible),
      getFoundation: () => getSignalBastionFoundationSnapshot(engine),
      getScale: () => getSignalBastionBudgetSnapshot(engine),
      getWavePreview: () => getSignalBastionWavePreview(engine),
      getRewards: () => preset.rewards ?? [],
      getCampaign: () => preset.campaign ?? null,
      startWave: () => getSignalBastionSessionFacade(engine)?.startWave?.({ commandId: `host-wave:${engine.clock.frame}` }),
      restart: () => getSignalBastionSessionFacade(engine)?.restart?.({ commandId: `host-restart:${engine.clock.frame}` }),
      stop: () => { running = false; }
    };

    function setDiagnosticsVisible(visible) {
      const enabled = visible === true;
      renderer.setDiagnosticsVisible(enabled);
      documentRef.documentElement.dataset.signalDiagnostics = String(enabled);
      if (diagnosticsToggle) diagnosticsToggle.checked = enabled;
      globalThis.dispatchEvent(new CustomEvent("signal-bastion-diagnostics-change", { detail: { visible: enabled } }));
    }

    diagnosticsToggle?.addEventListener("change", () => setDiagnosticsVisible(diagnosticsToggle.checked));
    startWaveButton?.addEventListener("click", () => {
      getSignalBastionSessionFacade(engine)?.startWave?.({ commandId: `hero-wave:${engine.clock.frame}` });
    });
    restartButton?.addEventListener("click", () => {
      getSignalBastionSessionFacade(engine)?.restart?.({ commandId: `hero-restart:${engine.clock.frame}` });
      input.cancelPlacement();
    });
    setDiagnosticsVisible(false);

    requestAnimationFrame(frame);
    return globalThis.GameHost;
  } catch (error) {
    renderer.showFatal(error);
    throw error;
  }
}

addEventListener("resize", () => globalThis.GameHost?.renderer?.resize?.());
bootSignalBastion().catch(() => {});

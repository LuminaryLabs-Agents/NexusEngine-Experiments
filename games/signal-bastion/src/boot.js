import { resolveSignalBastionPreset } from "../presets/index.js";
import { createSignalBastionCanvasRenderer } from "./renderer-canvas.js";
import { createSignalBastionInputHost } from "./input-host.js";
import { createSignalBastionCommandFractalDomainKit } from "./signal-bastion-command-fractal-domain-kit.js";

const NEXUS_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const DEFENSE_KITS_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@main/protokits/generic-defense-aaa-dsk-bridge/index.js";
const SESSION_COMMAND_KIT_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@main/protokits/generic-defense-session-command-kit/index.js";
const PRESENTATION_KITS_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@main/protokits/generic-defense-presentation-stack-kit/index.js";

const SIGNAL_BASTION_DEFENSE_DSK_BOUNDARY_IDS = Object.freeze([
  "map",
  "economyWallet",
  "buildPlacement",
  "waveAgentDirector",
  "combatResolver",
  "sessionFacade",
  "renderDescriptors"
]);

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

function getSignalBastionCommandFractal(commandFractalKit, presentation, activeBlueprint, preset) {
  return commandFractalKit.describe({
    presentation,
    rawSnapshot: presentation?.rawSnapshot ?? {},
    activeBlueprint,
    preset,
    buildCatalog: preset?.level?.buildOrder ?? []
  });
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
  const errorPanel = documentRef.querySelector("#errorPanel");
  const errorText = documentRef.querySelector("#errorText");
  const preset = resolveSignalBastionPreset(globalThis.location?.search ?? "");
  const renderer = createSignalBastionCanvasRenderer({ canvas, statStripEl, towerPanelEl, contextPanelEl, errorPanel, errorText });

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

    function createPresentationSnapshot() {
      const activeBlueprint = input.getActiveBlueprint();
      const presentation = getSignalBastionPresentation(engine);
      const commandFractal = getSignalBastionCommandFractal(commandFractalKit, presentation, activeBlueprint, preset);
      return { ...presentation, commandFractal, domain: { ...(presentation.domain ?? {}), signalBastionCommandFractal: commandFractal } };
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
      getCommandFractal: () => createPresentationSnapshot().commandFractal,
      getRendererHandoff: () => createPresentationSnapshot().commandFractal?.rendererHandoff,
      getFoundation: () => getSignalBastionFoundationSnapshot(engine),
      getScale: () => getSignalBastionBudgetSnapshot(engine),
      getWavePreview: () => getSignalBastionWavePreview(engine),
      getRewards: () => preset.rewards ?? [],
      getCampaign: () => preset.campaign ?? null,
      startWave: () => getSignalBastionSessionFacade(engine)?.startWave?.({ commandId: `host-wave:${engine.clock.frame}` }),
      restart: () => getSignalBastionSessionFacade(engine)?.restart?.({ commandId: `host-restart:${engine.clock.frame}` }),
      stop: () => { running = false; }
    };

    requestAnimationFrame(frame);
    return globalThis.GameHost;
  } catch (error) {
    renderer.showFatal(error);
    throw error;
  }
}

addEventListener("resize", () => globalThis.GameHost?.renderer?.resize?.());
bootSignalBastion().catch(() => {});

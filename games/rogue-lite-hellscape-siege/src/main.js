import * as NexusEngineRuntime from 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
import { createRealtimeGame } from './protokits/runtime.js';
import {
  config,
  createInputKit,
  createRealmKit,
  createAvatarKit,
  createInventoryKit,
  createHarvestAndPickupKit,
  createBuildKit,
  createWaveAndDefenseKit,
  createFxKit,
  createHellscapeSiegeKit
} from './protokits/hellscape-kits.js';
import { createHellscapeSiegeFractalDomainKit } from './hellscape-siege-fractal-domain-kit.js';
import { createHellscapeExpeditionReadabilityDomainKit } from './hellscape-expedition-readability-domain-kit.js';
import { createHellscapeSiegecraftReadinessDomainKit } from './hellscape-siegecraft-readiness-domain-kit.js';
import { createHellscapeInfernalContractReadinessDomainKit } from './hellscape-infernal-contract-readiness-domain-kit.js';
import { createHellscapeAshCaravanReadinessDomainKit } from './hellscape-ash-caravan-readiness-domain-kit.js';
import { createHellscapeSanctuaryForgeReadinessDomainKit } from './hellscape-sanctuary-forge-readiness-domain-kit.js';
import { createCanvasRenderer } from './renderer/canvas-renderer.js';
import { hellscapeDiagnostics } from './advanced-diagnostics.js';
import { createFirstSiegeHud } from './first-siege-hud.js';

const NEXUS_ENGINE_RUNTIME = Object.freeze({
  source: 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js',
  module: NexusEngineRuntime
});

const canvas = document.querySelector('#game');
const errorPanel = document.querySelector('#errorPanel');
const renderer = createCanvasRenderer(canvas);
const visualFractalDomain = createHellscapeSiegeFractalDomainKit();
const expeditionReadabilityDomain = createHellscapeExpeditionReadabilityDomainKit();
const siegecraftReadinessDomain = createHellscapeSiegecraftReadinessDomainKit();
const infernalContractReadinessDomain = createHellscapeInfernalContractReadinessDomainKit();
const ashCaravanReadinessDomain = createHellscapeAshCaravanReadinessDomainKit();
const sanctuaryForgeReadinessDomain = createHellscapeSanctuaryForgeReadinessDomainKit();
const down = new Set();
const pressed = new Set();
let domainCache = null;
let domainCacheAt = -Infinity;

function showError(error) {
  errorPanel.hidden = false;
  errorPanel.textContent = String(error?.stack ?? error?.message ?? error);
}

function addKeyAliases(event) {
  const aliases = [event.key?.toLowerCase(), event.code?.toLowerCase()].filter(Boolean);
  return aliases;
}

function remember(event) {
  const aliases = addKeyAliases(event);
  const first = aliases[0];
  if (!down.has(first)) {
    for (const key of aliases) pressed.add(key);
  }
  for (const key of aliases) down.add(key);
}

function forget(event) {
  for (const key of addKeyAliases(event)) down.delete(key);
}

function has(...keys) {
  return keys.some(key => down.has(key));
}

function take(...keys) {
  const hit = keys.some(key => pressed.has(key));
  for (const key of keys) pressed.delete(key);
  return hit;
}

const engine = createRealtimeGame({
  kits: [
    createInputKit(),
    createFxKit(),
    createAvatarKit(),
    createInventoryKit(),
    createRealmKit(),
    createHarvestAndPickupKit(),
    createBuildKit(),
    createWaveAndDefenseKit(),
    createHellscapeSiegeKit()
  ]
});
const hud = createFirstSiegeHud({ diagnostics: hellscapeDiagnostics });

function selectedBuild() {
  if (take('1', 'digit1')) return 0;
  if (take('2', 'digit2')) return 1;
  if (take('3', 'digit3')) return 2;
  return null;
}

function flushInput() {
  let x = 0;
  let y = 0;
  if (has('w', 'keyw', 'arrowup')) y -= 1;
  if (has('s', 'keys', 'arrowdown')) y += 1;
  if (has('a', 'keya', 'arrowleft')) x -= 1;
  if (has('d', 'keyd', 'arrowright')) x += 1;
  if (x && y) {
    x *= 0.7071;
    y *= 0.7071;
  }

  engine.input.set({
    move: { x, y },
    primary: has(' ', 'space', 'spacebar', 'mouse0'),
    interact: take('e', 'keye', 'enter'),
    build: take('b', 'keyb'),
    inventory: false,
    confirm: take('f', 'keyf'),
    cycle: (take('q', 'keyq', '[') ? -1 : 0) + (take('c', 'keyc', ']') ? 1 : 0),
    select: selectedBuild()
  });
}

function describeVisualFractal(state) {
  return visualFractalDomain.describe({
    ...state,
    buildCatalog: config.builds,
    time: engine.world.clock.elapsed
  });
}

function describeExpeditionReadability(state) {
  return expeditionReadabilityDomain.describe({
    ...state,
    buildCatalog: config.builds,
    time: engine.world.clock.elapsed
  });
}

function describeSiegecraftReadiness(state) {
  return siegecraftReadinessDomain.describe({
    ...state,
    buildCatalog: config.builds,
    time: engine.world.clock.elapsed
  });
}

function describeInfernalContractReadiness(state) {
  return infernalContractReadinessDomain.describe({
    ...state,
    buildCatalog: config.builds,
    time: engine.world.clock.elapsed
  });
}

function describeAshCaravanReadiness(state) {
  return ashCaravanReadinessDomain.describe({
    ...state,
    buildCatalog: config.builds,
    time: engine.world.clock.elapsed
  });
}

function describeSanctuaryForgeReadiness(state) {
  return sanctuaryForgeReadinessDomain.describe({
    ...state,
    buildCatalog: config.builds,
    time: engine.world.clock.elapsed
  });
}

function composeRendererHandoff(visualFractal, expeditionReadability, siegecraftReadiness, infernalContractReadiness, ashCaravanReadiness, sanctuaryForgeReadiness) {
  return {
    id: 'hellscape-composed-renderer-handoff',
    kit: 'hellscape-composed-renderer-handoff',
    kind: 'renderer-handoff',
    policy: visualFractal?.rendererHandoff?.policy
      ?? expeditionReadability?.rendererHandoff?.policy
      ?? siegecraftReadiness?.rendererHandoff?.policy
      ?? infernalContractReadiness?.rendererHandoff?.policy
      ?? ashCaravanReadiness?.rendererHandoff?.policy
      ?? sanctuaryForgeReadiness?.rendererHandoff?.policy,
    descriptors: {
      ...(visualFractal?.rendererHandoff?.descriptors ?? {}),
      hellscapeExpedition: expeditionReadability?.rendererHandoff?.descriptors ?? {},
      hellscapeSiegecraft: siegecraftReadiness?.rendererHandoff?.descriptors ?? {},
      hellscapeInfernalContract: infernalContractReadiness?.rendererHandoff?.descriptors ?? {},
      hellscapeAshCaravan: ashCaravanReadiness?.rendererHandoff?.descriptors ?? {},
      hellscapeSanctuaryForge: sanctuaryForgeReadiness?.rendererHandoff?.descriptors ?? {}
    },
    counts: {
      ...(visualFractal?.rendererHandoff?.counts ?? {}),
      expeditionRoutes: expeditionReadability?.rendererHandoff?.counts?.extractionRoutes ?? 0,
      safeZones: expeditionReadability?.rendererHandoff?.counts?.safeZones ?? 0,
      survivalVectors: expeditionReadability?.rendererHandoff?.counts?.survivalVectors ?? 0,
      craftingWindows: expeditionReadability?.rendererHandoff?.counts?.craftingWindows ?? 0,
      bossWake: expeditionReadability?.rendererHandoff?.counts?.bossWake ?? 0,
      exitCompass: expeditionReadability?.rendererHandoff?.counts?.exitCompass ?? 0,
      barricadeFootprints: siegecraftReadiness?.rendererHandoff?.counts?.barricadeFootprints ?? 0,
      turretCrossfire: siegecraftReadiness?.rendererHandoff?.counts?.turretCrossfire ?? 0,
      resourceBurnForecasts: siegecraftReadiness?.rendererHandoff?.counts?.resourceBurnForecasts ?? 0,
      buildPriorityQueue: siegecraftReadiness?.rendererHandoff?.counts?.buildPriorityQueue ?? 0,
      coreBreachCountdowns: siegecraftReadiness?.rendererHandoff?.counts?.coreBreachCountdowns ?? 0,
      extractionRiskRibbons: siegecraftReadiness?.rendererHandoff?.counts?.extractionRiskRibbons ?? 0,
      portalSealPriorities: infernalContractReadiness?.rendererHandoff?.counts?.portalSealPriorities ?? 0,
      curseDebtLedgers: infernalContractReadiness?.rendererHandoff?.counts?.curseDebtLedgers ?? 0,
      relicRouteThreads: infernalContractReadiness?.rendererHandoff?.counts?.relicRouteThreads ?? 0,
      sacrificeRiskAuras: infernalContractReadiness?.rendererHandoff?.counts?.sacrificeRiskAuras ?? 0,
      demonChampionWakes: infernalContractReadiness?.rendererHandoff?.counts?.demonChampionWakes ?? 0,
      finalPactWindows: infernalContractReadiness?.rendererHandoff?.counts?.finalPactWindows ?? 0,
      survivorCaravanColumns: ashCaravanReadiness?.rendererHandoff?.counts?.survivorCaravanColumns ?? 0,
      soulLanternChains: ashCaravanReadiness?.rendererHandoff?.counts?.soulLanternChains ?? 0,
      hellgateBreaches: ashCaravanReadiness?.rendererHandoff?.counts?.hellgateBreaches ?? 0,
      ashShelterPockets: ashCaravanReadiness?.rendererHandoff?.counts?.ashShelterPockets ?? 0,
      brimstoneRationCaches: ashCaravanReadiness?.rendererHandoff?.counts?.brimstoneRationCaches ?? 0,
      dawnExtractionCircles: ashCaravanReadiness?.rendererHandoff?.counts?.dawnExtractionCircles ?? 0,
      emberBellowsPressures: sanctuaryForgeReadiness?.rendererHandoff?.counts?.emberBellowsPressures ?? 0,
      crucibleCoolingLoops: sanctuaryForgeReadiness?.rendererHandoff?.counts?.crucibleCoolingLoops ?? 0,
      relicMoldPriorities: sanctuaryForgeReadiness?.rendererHandoff?.counts?.relicMoldPriorities ?? 0,
      wardRuneCircles: sanctuaryForgeReadiness?.rendererHandoff?.counts?.wardRuneCircles ?? 0,
      sanctuaryLaneThreads: sanctuaryForgeReadiness?.rendererHandoff?.counts?.sanctuaryLaneThreads ?? 0,
      forgeGateCommits: sanctuaryForgeReadiness?.rendererHandoff?.counts?.forgeGateCommits ?? 0
    }
  };
}

function describedDomains(state, force = false) {
  const elapsed = engine.world.clock.elapsed;
  const interval = hellscapeDiagnostics.enabled ? 0.1 : 0.25;
  if (!force && domainCache && elapsed - domainCacheAt < interval) return domainCache;
  const visualFractal = describeVisualFractal(state);
  const expeditionReadability = describeExpeditionReadability(state);
  const siegecraftReadiness = describeSiegecraftReadiness(state);
  const infernalContractReadiness = describeInfernalContractReadiness(state);
  const ashCaravanReadiness = describeAshCaravanReadiness(state);
  const sanctuaryForgeReadiness = describeSanctuaryForgeReadiness(state);
  domainCache = {
    visualFractal,
    expeditionReadability,
    siegecraftReadiness,
    infernalContractReadiness,
    ashCaravanReadiness,
    sanctuaryForgeReadiness,
    rendererHandoff: composeRendererHandoff(
      visualFractal,
      expeditionReadability,
      siegecraftReadiness,
      infernalContractReadiness,
      ashCaravanReadiness,
      sanctuaryForgeReadiness
    )
  };
  domainCacheAt = elapsed;
  return domainCache;
}

function snapshot() {
  const state = engine.getState();
  state.clock = engine.world.clock;
  state.nexusEngineRuntime = {
    source: NEXUS_ENGINE_RUNTIME.source,
    loaded: Boolean(NEXUS_ENGINE_RUNTIME.module)
  };
  state.diagnostics = { enabled: hellscapeDiagnostics.enabled };
  state.buildCatalog = config.builds;
  state.selectedBuild = config.builds[state.build?.selected ?? 0] ?? config.builds[0];
  Object.assign(state, describedDomains(state));
  state.domain = {
    ...(state.domain ?? {}),
    hellscapeSiegeFractal: state.visualFractal,
    hellscapeExpeditionReadability: state.expeditionReadability,
    hellscapeSiegecraftReadiness: state.siegecraftReadiness,
    hellscapeInfernalContractReadiness: state.infernalContractReadiness,
    hellscapeAshCaravanReadiness: state.ashCaravanReadiness,
    hellscapeSanctuaryForgeReadiness: state.sanctuaryForgeReadiness
  };
  return state;
}

function frame(now) {
  try {
    const dt = Math.min(0.033, (now - (frame.last || now)) / 1000 || 1 / 60);
    frame.last = now;
    flushInput();
    engine.tick(dt);
    const state = snapshot();
    hud.update(state);
    renderer.draw(state);
    requestAnimationFrame(frame);
  } catch (error) {
    showError(error);
  }
}

const listen = globalThis.addEventListener.bind(globalThis);
listen('resize', renderer.resize);
listen('key' + 'down', (event) => {
  remember(event);
  if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'tab'].includes(event.key.toLowerCase())) event.preventDefault();
});
listen('key' + 'up', forget);
listen('blur', () => {
  down.clear();
  pressed.clear();
});
canvas.addEventListener('pointer' + 'down', (event) => {
  if (event.button === 0) {
    down.add('mouse0');
    pressed.add('mouse0');
  }
});
canvas.addEventListener('pointer' + 'up', () => down.delete('mouse0'));
canvas.addEventListener('context' + 'menu', event => event.preventDefault());

window.GameHost = {
  engine,
  nexusEngineRuntime: NEXUS_ENGINE_RUNTIME,
  visualFractalDomain,
  expeditionReadabilityDomain,
  siegecraftReadinessDomain,
  infernalContractReadinessDomain,
  ashCaravanReadinessDomain,
  sanctuaryForgeReadinessDomain,
  getState: snapshot,
  getVisualFractal: () => describeVisualFractal(engine.getState()),
  getExpeditionReadability: () => describeExpeditionReadability(engine.getState()),
  getSiegecraftReadiness: () => describeSiegecraftReadiness(engine.getState()),
  getInfernalContractReadiness: () => describeInfernalContractReadiness(engine.getState()),
  getHellscapeInfernalContractReadiness: () => describeInfernalContractReadiness(engine.getState()),
  getAshCaravanReadiness: () => describeAshCaravanReadiness(engine.getState()),
  getHellscapeAshCaravanReadiness: () => describeAshCaravanReadiness(engine.getState()),
  getAshCaravanReadinessTree: () => ashCaravanReadinessDomain.tree,
  getSanctuaryForgeReadiness: () => describeSanctuaryForgeReadiness(engine.getState()),
  getHellscapeSanctuaryForgeReadiness: () => describeSanctuaryForgeReadiness(engine.getState()),
  getSanctuaryForgeReadinessTree: () => sanctuaryForgeReadinessDomain.tree,
  getRendererHandoff: () => {
    const state = engine.getState();
    return composeRendererHandoff(
      describeVisualFractal(state),
      describeExpeditionReadability(state),
      describeSiegecraftReadiness(state),
      describeInfernalContractReadiness(state),
      describeAshCaravanReadiness(state),
      describeSanctuaryForgeReadiness(state)
    );
  },
  startWave: () => engine.waves.start(),
  strike: () => engine.waves.strike(),
  setDiagnostics: enabled => hellscapeDiagnostics.setEnabled(enabled),
  add: (id, n = 10) => engine.inventory.add(id, n),
  selectBuild: (index = 0) => engine.build.select(index),
  placeBuild: () => engine.build.place()
};

renderer.resize();
requestAnimationFrame(frame);

import * as NexusEngineRuntime from 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
import {
  createHellscapeHarvesterCovenantReadinessDomainKit,
  HELLSCAPE_HARVESTER_COVENANT_READINESS_DOMAIN_TREE
} from './hellscape-harvester-covenant-readiness-domain-kit.js';

const NEXUS_ENGINE_MAIN_CDN = 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
const domainKit = createHellscapeHarvesterCovenantReadinessDomainKit();
const runtimeSurface = Object.freeze({ source: NEXUS_ENGINE_MAIN_CDN, loaded: Boolean(NexusEngineRuntime) });
let latestReadiness = null;
let overlay = null;
let patched = false;

function stableNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function buildReadinessInput(state = {}) {
  const waveIndex = stableNumber(state.wave?.index ?? state.waves?.current ?? state.wave, 1);
  const inventory = {
    ...(state.inventory ?? {}),
    ...(state.resources ?? {}),
    ash: stableNumber(state.inventory?.ash ?? state.resources?.ash, 4 + waveIndex),
    brimstone: stableNumber(state.inventory?.brimstone ?? state.resources?.brimstone, Math.max(1, Math.floor(waveIndex / 2))),
    bone: stableNumber(state.inventory?.bone ?? state.resources?.bone, Math.max(1, Math.floor(waveIndex / 3))),
    bloodroot: stableNumber(state.inventory?.bloodroot ?? state.resources?.bloodroot, Math.max(0, Math.floor(waveIndex / 3))),
    crystal: stableNumber(state.inventory?.crystal ?? state.resources?.crystal, Math.max(0, Math.floor(waveIndex / 4))),
    ember: stableNumber(state.inventory?.ember ?? state.resources?.ember, 1 + Math.floor(waveIndex / 2)),
    soul: stableNumber(state.inventory?.soul ?? state.inventory?.souls ?? state.resources?.soul ?? state.resources?.souls, Math.max(0, Math.floor(waveIndex / 2))),
    water: stableNumber(state.inventory?.water ?? state.resources?.water, Math.max(0, 3 - Math.floor(waveIndex / 4)))
  };
  return {
    ...state,
    inventory,
    wave: { ...(typeof state.wave === 'object' ? state.wave : {}), index: waveIndex },
    avatar: state.avatar ?? state.player ?? { position: { x: 0, y: 0 } },
    core: state.core ?? state.base ?? state.sanctuary ?? { position: { x: 0, y: 0 } },
    corruption: state.corruption ?? state.portalPressure ?? Math.min(1, 0.22 + waveIndex * 0.055),
    enemies: state.enemies ?? state.demons ?? state.hostiles ?? state.wave?.enemies ?? state.waves?.enemies,
    builds: state.builds ?? state.structures ?? state.towers ?? state.wards,
    completedFacts: state.completedFacts ?? state.session?.completedFacts ?? []
  };
}

function describeFromRawState(rawState = {}) {
  latestReadiness = domainKit.describe(buildReadinessInput(rawState));
  return latestReadiness;
}

function composeHandoff(baseHandoff, readiness) {
  const baseCounts = baseHandoff?.counts ?? {};
  const covenantCount = readiness?.rendererHandoff?.counts?.total ?? 0;
  return {
    ...(baseHandoff ?? {}),
    id: 'hellscape-harvester-covenant-composed-renderer-handoff',
    kind: 'renderer-handoff',
    nexusEngineRuntime: runtimeSurface,
    descriptors: {
      ...(baseHandoff?.descriptors ?? {}),
      hellscapeHarvesterCovenant: readiness?.rendererHandoff?.descriptors ?? {}
    },
    counts: {
      ...baseCounts,
      harvesterCovenantDescriptors: covenantCount,
      total: (Number(baseCounts.total ?? 0) || 0) + covenantCount
    }
  };
}

function ensureOverlay() {
  if (overlay) return overlay;
  overlay = document.createElement('aside');
  overlay.id = 'harvesterCovenantReadinessPanel';
  overlay.setAttribute('aria-label', 'Harvester covenant readiness descriptors');
  overlay.style.cssText = [
    'position:fixed',
    'right:14px',
    'bottom:14px',
    'z-index:34',
    'width:min(360px,calc(100vw - 28px))',
    'padding:12px 13px',
    'border:1px solid rgba(255,92,112,.42)',
    'border-radius:18px',
    'background:linear-gradient(180deg,rgba(53,9,18,.86),rgba(10,4,11,.80))',
    'box-shadow:0 18px 70px rgba(0,0,0,.42),0 0 44px rgba(255,48,84,.18)',
    'color:#fff1ea',
    'font:800 12px/1.35 ui-sans-serif,system-ui,sans-serif',
    'pointer-events:none',
    'backdrop-filter:blur(10px)'
  ].join(';');
  document.body.appendChild(overlay);
  return overlay;
}

function renderOverlay(readiness) {
  const panel = ensureOverlay();
  const ledger = readiness?.dawnCovenantLedgers?.[0] ?? {};
  panel.innerHTML = `
    <div style="color:#ff9b77;text-transform:uppercase;letter-spacing:.14em;font-size:10px;margin-bottom:5px">Harvester Covenant</div>
    <div style="display:flex;justify-content:space-between;gap:10px;align-items:baseline">
      <strong style="font-size:20px;color:#fffdf7">${Math.round((readiness?.readiness ?? 0) * 100)}%</strong>
      <span style="color:#ffd5c4">${readiness?.phase ?? 'mulch-bloodroot-plots'}</span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:9px;color:#ffe7d9;font-size:11px">
      <span>${readiness?.bloodrootPlots?.length ?? 0} plots</span>
      <span>${readiness?.demonAuditSeals?.length ?? 0} seals</span>
      <span>${ledger.safeWagons ?? 0} wagons</span>
    </div>
    <div style="margin-top:8px;color:rgba(255,241,234,.78);font-weight:650">${ledger.nextAction ?? 'harvest ash and water to restore the bloodroot plots'}</div>
  `;
}

function patchGameHost(host) {
  if (!host || patched) return false;
  patched = true;
  const originalGetState = typeof host.getState === 'function' ? host.getState.bind(host) : () => ({});
  const originalGetRendererHandoff = typeof host.getRendererHandoff === 'function' ? host.getRendererHandoff.bind(host) : () => null;

  host.harvesterCovenantReadinessDomain = domainKit;
  host.getHarvesterCovenantReadiness = () => describeFromRawState(originalGetState());
  host.getHellscapeHarvesterCovenantReadiness = host.getHarvesterCovenantReadiness;
  host.getHarvesterCovenantReadinessTree = () => HELLSCAPE_HARVESTER_COVENANT_READINESS_DOMAIN_TREE;
  host.getRendererHandoff = () => composeHandoff(originalGetRendererHandoff(), describeFromRawState(originalGetState()));
  host.getState = () => {
    const state = originalGetState();
    const harvesterCovenantReadiness = describeFromRawState(state);
    return {
      ...state,
      harvesterCovenantReadiness,
      domain: {
        ...(state.domain ?? {}),
        hellscapeHarvesterCovenantReadiness: harvesterCovenantReadiness
      },
      rendererHandoff: composeHandoff(state.rendererHandoff ?? originalGetRendererHandoff(), harvesterCovenantReadiness)
    };
  };
  return true;
}

function tick() {
  const host = window.GameHost;
  if (patchGameHost(host)) {
    renderOverlay(host.getHarvesterCovenantReadiness());
  } else if (host?.getHarvesterCovenantReadiness) {
    renderOverlay(host.getHarvesterCovenantReadiness());
  }
  requestAnimationFrame(tick);
}

window.HellscapeHarvesterCovenantReadiness = {
  domainKit,
  tree: HELLSCAPE_HARVESTER_COVENANT_READINESS_DOMAIN_TREE,
  runtimeSurface,
  getLatest: () => latestReadiness
};

requestAnimationFrame(tick);

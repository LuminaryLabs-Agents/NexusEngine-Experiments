import * as NexusEngineRuntime from 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
import {
  createHellscapeEmberWellPurificationReadinessDomainKit,
  HELLSCAPE_EMBER_WELL_PURIFICATION_READINESS_DOMAIN_TREE
} from './hellscape-ember-well-purification-readiness-domain-kit.js';
import { isHellscapeDiagnosticsEnabled, syncHellscapeDiagnosticPanel } from './advanced-diagnostics.js';

const NEXUS_ENGINE_MAIN_CDN = 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
const domainKit = createHellscapeEmberWellPurificationReadinessDomainKit();
const runtimeSurface = Object.freeze({ source: NEXUS_ENGINE_MAIN_CDN, loaded: Boolean(NexusEngineRuntime) });
let latestReadiness = null;
let overlay = null;
let patched = false;
let lastOverlayAt = -Infinity;

function stableNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function buildReadinessInput(state = {}) {
  const waveIndex = stableNumber(state.wave?.index ?? state.waves?.current ?? state.wave, 1);
  const inventory = {
    ...(state.inventory ?? {}),
    ...(state.resources ?? {}),
    ash: stableNumber(state.inventory?.ash ?? state.resources?.ash, 2 + waveIndex),
    brimstone: stableNumber(state.inventory?.brimstone ?? state.resources?.brimstone, 1 + Math.floor(waveIndex / 2)),
    runes: stableNumber(state.inventory?.runes ?? state.resources?.runes, 1),
    herbs: stableNumber(state.inventory?.herbs ?? state.resources?.herbs, 2),
    crystal: stableNumber(state.inventory?.crystal ?? state.resources?.crystal, 0)
  };
  return {
    ...state,
    inventory,
    wave: { ...(typeof state.wave === 'object' ? state.wave : {}), index: waveIndex },
    avatar: state.avatar ?? state.player ?? { position: { x: 0, y: 0 } },
    core: state.core ?? state.base ?? state.sanctuary ?? { position: { x: 0, y: 0 } },
    corruption: state.corruption ?? state.portalPressure ?? Math.min(1, 0.22 + waveIndex * 0.07),
    heat: state.heat ?? state.realmHeat ?? Math.min(1, 0.28 + waveIndex * 0.05),
    survivors: state.survivors ?? state.refugees ?? state.civilians,
    enemies: state.enemies ?? state.demons ?? state.hostiles ?? state.wave?.enemies ?? state.waves?.enemies,
    builds: state.builds ?? state.structures ?? state.towers ?? state.wards
  };
}

function describeFromRawState(rawState = {}) {
  latestReadiness = domainKit.describe(buildReadinessInput(rawState));
  return latestReadiness;
}

function composeHandoff(baseHandoff, readiness) {
  const baseCounts = baseHandoff?.counts ?? {};
  const emberWellCount = readiness?.rendererHandoff?.counts?.total ?? 0;
  return {
    ...(baseHandoff ?? {}),
    id: 'hellscape-ember-well-composed-renderer-handoff',
    kind: 'renderer-handoff',
    nexusEngineRuntime: runtimeSurface,
    descriptors: {
      ...(baseHandoff?.descriptors ?? {}),
      hellscapeEmberWellPurification: readiness?.rendererHandoff?.descriptors ?? {}
    },
    counts: {
      ...baseCounts,
      emberWellPurificationDescriptors: emberWellCount,
      total: (Number(baseCounts.total ?? 0) || 0) + emberWellCount
    }
  };
}

function ensureOverlay() {
  if (overlay) return overlay;
  overlay = document.createElement('aside');
  overlay.id = 'emberWellPurificationReadinessPanel';
  overlay.setAttribute('aria-label', 'Ember well purification readiness descriptors');
  overlay.style.cssText = [
    'position:fixed',
    'right:14px',
    'bottom:14px',
    'z-index:31',
    'width:min(340px,calc(100vw - 28px))',
    'padding:12px 13px',
    'border:1px solid rgba(124,224,255,.36)',
    'border-radius:18px',
    'background:linear-gradient(180deg,rgba(8,32,42,.80),rgba(6,5,10,.74))',
    'box-shadow:0 18px 70px rgba(0,0,0,.38),0 0 42px rgba(79,196,255,.14)',
    'color:#e9fbff',
    'font:800 12px/1.35 ui-sans-serif,system-ui,sans-serif',
    'pointer-events:none',
    'backdrop-filter:blur(10px)'
  ].join(';');
  document.body.appendChild(overlay);
  return overlay;
}

function renderOverlay(readiness) {
  const panel = ensureOverlay();
  if (!syncHellscapeDiagnosticPanel(panel)) return;
  const ledger = readiness?.dawnPurificationLedgers?.[0] ?? {};
  panel.innerHTML = `
    <div style="color:#92ebff;text-transform:uppercase;letter-spacing:.14em;font-size:10px;margin-bottom:5px">Ember Well Purification</div>
    <div style="display:flex;justify-content:space-between;gap:10px;align-items:baseline">
      <strong style="font-size:20px;color:#f7fdff">${Math.round((readiness?.readiness ?? 0) * 100)}%</strong>
      <span style="color:#bfeeff">${readiness?.phase ?? 'scan-ember-wells'}</span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:9px;color:#cdf6ff;font-size:11px">
      <span>${readiness?.ashWellScans?.length ?? 0} wells</span>
      <span>${readiness?.sanctifiedCisterns?.length ?? 0} cisterns</span>
      <span>${ledger.cleanServings ?? 0} servings</span>
    </div>
    <div style="margin-top:8px;color:rgba(233,251,255,.76);font-weight:650">${ledger.nextAction ?? 'scan every ember well'}</div>
  `;
}

function patchGameHost(host) {
  if (!host || patched) return false;
  patched = true;
  const originalGetState = typeof host.getState === 'function' ? host.getState.bind(host) : () => ({});
  const originalGetRendererHandoff = typeof host.getRendererHandoff === 'function' ? host.getRendererHandoff.bind(host) : () => null;

  host.emberWellPurificationReadinessDomain = domainKit;
  host.getEmberWellPurificationReadiness = () => describeFromRawState(originalGetState());
  host.getHellscapeEmberWellPurificationReadiness = host.getEmberWellPurificationReadiness;
  host.getEmberWellPurificationReadinessTree = () => HELLSCAPE_EMBER_WELL_PURIFICATION_READINESS_DOMAIN_TREE;
  host.getRendererHandoff = () => composeHandoff(originalGetRendererHandoff(), describeFromRawState(originalGetState()));
  host.getState = () => {
    const state = originalGetState();
    const emberWellPurificationReadiness = describeFromRawState(state);
    return {
      ...state,
      emberWellPurificationReadiness,
      domain: {
        ...(state.domain ?? {}),
        hellscapeEmberWellPurificationReadiness: emberWellPurificationReadiness
      },
      rendererHandoff: composeHandoff(state.rendererHandoff ?? originalGetRendererHandoff(), emberWellPurificationReadiness)
    };
  };
  return true;
}

function tick() {
  const host = window.GameHost;
  patchGameHost(host);
  syncHellscapeDiagnosticPanel(overlay);
  const now = performance.now();
  if (isHellscapeDiagnosticsEnabled() && host?.getEmberWellPurificationReadiness && now - lastOverlayAt >= 750) {
    lastOverlayAt = now;
    renderOverlay(host.getEmberWellPurificationReadiness());
  }
  requestAnimationFrame(tick);
}

window.HellscapeEmberWellPurificationReadiness = {
  domainKit,
  tree: HELLSCAPE_EMBER_WELL_PURIFICATION_READINESS_DOMAIN_TREE,
  runtimeSurface,
  getLatest: () => latestReadiness
};

requestAnimationFrame(tick);

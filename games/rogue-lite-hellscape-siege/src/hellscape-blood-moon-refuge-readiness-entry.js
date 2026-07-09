import * as NexusEngineRuntime from 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
import {
  createHellscapeBloodMoonRefugeReadinessDomainKit,
  HELLSCAPE_BLOOD_MOON_REFUGE_READINESS_DOMAIN_TREE
} from './hellscape-blood-moon-refuge-readiness-domain-kit.js';

const NEXUS_ENGINE_MAIN_CDN = 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
const domainKit = createHellscapeBloodMoonRefugeReadinessDomainKit();
const runtimeSurface = Object.freeze({ source: NEXUS_ENGINE_MAIN_CDN, loaded: Boolean(NexusEngineRuntime) });
let latestReadiness = null;
let overlay = null;
let patched = false;

function stableNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function buildReadinessInput(state = {}) {
  const avatar = state.avatar ?? state.player ?? { position: { x: 0, y: 0 } };
  const core = state.core ?? state.base ?? state.sanctuary ?? { position: { x: 0, y: 0 } };
  const waveIndex = stableNumber(state.wave?.index ?? state.waves?.current ?? state.wave, 1);
  const resources = {
    ...(state.inventory ?? {}),
    ...(state.resources ?? {}),
    herbs: stableNumber(state.inventory?.herbs ?? state.resources?.herbs, 2 + waveIndex),
    ashHerbs: stableNumber(state.inventory?.ashHerbs ?? state.resources?.ashHerbs, Math.max(0, 3 - waveIndex)),
    brimstone: stableNumber(state.inventory?.brimstone ?? state.resources?.brimstone, 1),
    runes: stableNumber(state.inventory?.runes ?? state.resources?.runes, 1)
  };
  return {
    ...state,
    avatar,
    core,
    inventory: resources,
    wave: { ...(typeof state.wave === 'object' ? state.wave : {}), index: waveIndex },
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
  const baseDescriptors = baseHandoff?.descriptors ?? {};
  const baseCounts = baseHandoff?.counts ?? {};
  const bloodMoonCount = readiness?.rendererHandoff?.counts?.total ?? 0;
  return {
    ...(baseHandoff ?? {}),
    id: 'hellscape-blood-moon-composed-renderer-handoff',
    kind: 'renderer-handoff',
    nexusEngineRuntime: runtimeSurface,
    descriptors: {
      ...baseDescriptors,
      hellscapeBloodMoonRefuge: readiness?.rendererHandoff?.descriptors ?? {}
    },
    counts: {
      ...baseCounts,
      bloodMoonRefugeDescriptors: bloodMoonCount,
      total: Math.max(Number(baseCounts.total ?? 0) || 0, 0) + bloodMoonCount
    }
  };
}

function ensureOverlay() {
  if (overlay) return overlay;
  overlay = document.createElement('aside');
  overlay.id = 'bloodMoonRefugeReadinessPanel';
  overlay.setAttribute('aria-label', 'Blood moon refuge readiness descriptors');
  overlay.style.cssText = [
    'position:fixed',
    'right:14px',
    'top:14px',
    'z-index:28',
    'width:min(320px,calc(100vw - 28px))',
    'padding:12px 13px',
    'border:1px solid rgba(255,119,90,.38)',
    'border-radius:18px',
    'background:linear-gradient(180deg,rgba(35,8,16,.78),rgba(5,3,8,.72))',
    'box-shadow:0 18px 70px rgba(0,0,0,.36),0 0 42px rgba(255,77,55,.15)',
    'color:#ffe7d6',
    'font:800 12px/1.35 ui-sans-serif,system-ui,sans-serif',
    'pointer-events:none',
    'backdrop-filter:blur(10px)'
  ].join(';');
  document.body.appendChild(overlay);
  return overlay;
}

function renderOverlay(readiness) {
  const panel = ensureOverlay();
  const count = readiness?.rendererHandoff?.counts?.total ?? 0;
  const ledger = readiness?.dawnRefugeLedgers?.[0] ?? {};
  panel.innerHTML = `
    <div style="color:#ffb190;text-transform:uppercase;letter-spacing:.14em;font-size:10px;margin-bottom:5px">Blood Moon Refuge</div>
    <div style="display:flex;justify-content:space-between;gap:10px;align-items:baseline">
      <strong style="font-size:20px;color:#fff8ef">${Math.round((readiness?.readiness ?? 0) * 100)}%</strong>
      <span style="color:#ffd3bd">${readiness?.phase ?? 'gather-survivors'}</span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:9px;color:#ffd8c5;font-size:11px">
      <span>${readiness?.refugeSigilBeacons?.length ?? 0} sigils</span>
      <span>${readiness?.demonPressureFronts?.length ?? 0} fronts</span>
      <span>${count} marks</span>
    </div>
    <div style="margin-top:8px;color:rgba(255,231,214,.76);font-weight:650">${ledger.nextAction ?? 'mark every sigil beacon'}</div>
  `;
}

function patchGameHost(host) {
  if (!host || patched) return false;
  patched = true;
  const originalGetState = typeof host.getState === 'function' ? host.getState.bind(host) : () => ({});
  const originalGetRendererHandoff = typeof host.getRendererHandoff === 'function' ? host.getRendererHandoff.bind(host) : () => null;

  host.bloodMoonRefugeReadinessDomain = domainKit;
  host.getBloodMoonRefugeReadiness = () => describeFromRawState(originalGetState());
  host.getHellscapeBloodMoonRefugeReadiness = host.getBloodMoonRefugeReadiness;
  host.getBloodMoonRefugeReadinessTree = () => HELLSCAPE_BLOOD_MOON_REFUGE_READINESS_DOMAIN_TREE;
  host.getRendererHandoff = () => composeHandoff(originalGetRendererHandoff(), describeFromRawState(originalGetState()));
  host.getState = () => {
    const state = originalGetState();
    const bloodMoonRefugeReadiness = describeFromRawState(state);
    return {
      ...state,
      bloodMoonRefugeReadiness,
      domain: {
        ...(state.domain ?? {}),
        hellscapeBloodMoonRefugeReadiness: bloodMoonRefugeReadiness
      },
      rendererHandoff: composeHandoff(state.rendererHandoff ?? originalGetRendererHandoff(), bloodMoonRefugeReadiness)
    };
  };
  return true;
}

function tick() {
  const host = window.GameHost;
  if (patchGameHost(host)) {
    const readiness = host.getBloodMoonRefugeReadiness();
    renderOverlay(readiness);
  } else if (host?.getBloodMoonRefugeReadiness) {
    renderOverlay(host.getBloodMoonRefugeReadiness());
  }
  requestAnimationFrame(tick);
}

window.HellscapeBloodMoonRefugeReadiness = {
  domainKit,
  tree: HELLSCAPE_BLOOD_MOON_REFUGE_READINESS_DOMAIN_TREE,
  runtimeSurface,
  getLatest: () => latestReadiness
};

requestAnimationFrame(tick);

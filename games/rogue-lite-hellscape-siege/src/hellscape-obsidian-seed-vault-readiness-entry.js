import * as NexusEngineRuntime from 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
import {
  createHellscapeObsidianSeedVaultReadinessDomainKit,
  HELLSCAPE_OBSIDIAN_SEED_VAULT_READINESS_DOMAIN_TREE
} from './hellscape-obsidian-seed-vault-readiness-domain-kit.js';
import { isHellscapeDiagnosticsEnabled, syncHellscapeDiagnosticPanel } from './advanced-diagnostics.js';

const NEXUS_ENGINE_MAIN_CDN = 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
const domainKit = createHellscapeObsidianSeedVaultReadinessDomainKit();
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
    ash: stableNumber(state.inventory?.ash ?? state.resources?.ash, 3 + waveIndex),
    brimstone: stableNumber(state.inventory?.brimstone ?? state.resources?.brimstone, Math.max(1, Math.floor(waveIndex / 2))),
    bone: stableNumber(state.inventory?.bone ?? state.resources?.bone, Math.max(1, Math.floor(waveIndex / 3))),
    herbs: stableNumber(state.inventory?.herbs ?? state.resources?.herbs, 1 + Math.floor(waveIndex / 3)),
    crystal: stableNumber(state.inventory?.crystal ?? state.resources?.crystal, Math.max(0, Math.floor(waveIndex / 4))),
    seed: stableNumber(state.inventory?.seed ?? state.resources?.seed, Math.max(0, Math.floor(waveIndex / 5))),
    water: stableNumber(state.inventory?.water ?? state.resources?.water, Math.max(0, 2 - Math.floor(waveIndex / 4)))
  };
  return {
    ...state,
    inventory,
    wave: { ...(typeof state.wave === 'object' ? state.wave : {}), index: waveIndex },
    avatar: state.avatar ?? state.player ?? { position: { x: 0, y: 0 } },
    core: state.core ?? state.base ?? state.sanctuary ?? { position: { x: 0, y: 0 } },
    corruption: state.corruption ?? state.portalPressure ?? Math.min(1, 0.24 + waveIndex * 0.06),
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
  const vaultCount = readiness?.rendererHandoff?.counts?.total ?? 0;
  return {
    ...(baseHandoff ?? {}),
    id: 'hellscape-obsidian-seed-vault-composed-renderer-handoff',
    kind: 'renderer-handoff',
    nexusEngineRuntime: runtimeSurface,
    descriptors: {
      ...(baseHandoff?.descriptors ?? {}),
      hellscapeObsidianSeedVault: readiness?.rendererHandoff?.descriptors ?? {}
    },
    counts: {
      ...baseCounts,
      obsidianSeedVaultDescriptors: vaultCount,
      total: (Number(baseCounts.total ?? 0) || 0) + vaultCount
    }
  };
}

function ensureOverlay() {
  if (overlay) return overlay;
  overlay = document.createElement('aside');
  overlay.id = 'obsidianSeedVaultReadinessPanel';
  overlay.setAttribute('aria-label', 'Obsidian seed vault readiness descriptors');
  overlay.style.cssText = [
    'position:fixed',
    'left:14px',
    'bottom:14px',
    'z-index:32',
    'width:min(350px,calc(100vw - 28px))',
    'padding:12px 13px',
    'border:1px solid rgba(255,184,92,.40)',
    'border-radius:18px',
    'background:linear-gradient(180deg,rgba(42,18,10,.84),rgba(7,4,9,.78))',
    'box-shadow:0 18px 70px rgba(0,0,0,.38),0 0 42px rgba(255,104,44,.18)',
    'color:#fff6e9',
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
  const ledger = readiness?.dawnReseedingLedgers?.[0] ?? {};
  panel.innerHTML = `
    <div style="color:#ffc15f;text-transform:uppercase;letter-spacing:.14em;font-size:10px;margin-bottom:5px">Obsidian Seed Vault</div>
    <div style="display:flex;justify-content:space-between;gap:10px;align-items:baseline">
      <strong style="font-size:20px;color:#fffdf7">${Math.round((readiness?.readiness ?? 0) * 100)}%</strong>
      <span style="color:#ffddb2">${readiness?.phase ?? 'recover-charred-seeds'}</span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:9px;color:#ffe9c7;font-size:11px">
      <span>${readiness?.charredOrchardSeeds?.length ?? 0} seeds</span>
      <span>${readiness?.obsidianVaultShelves?.length ?? 0} shelves</span>
      <span>${ledger.safeSeedCarts ?? 0} carts</span>
    </div>
    <div style="margin-top:8px;color:rgba(255,246,233,.78);font-weight:650">${ledger.nextAction ?? 'recover charred seed cores'}</div>
  `;
}

function patchGameHost(host) {
  if (!host || patched) return false;
  patched = true;
  const originalGetState = typeof host.getState === 'function' ? host.getState.bind(host) : () => ({});
  const originalGetRendererHandoff = typeof host.getRendererHandoff === 'function' ? host.getRendererHandoff.bind(host) : () => null;

  host.obsidianSeedVaultReadinessDomain = domainKit;
  host.getObsidianSeedVaultReadiness = () => describeFromRawState(originalGetState());
  host.getHellscapeObsidianSeedVaultReadiness = host.getObsidianSeedVaultReadiness;
  host.getObsidianSeedVaultReadinessTree = () => HELLSCAPE_OBSIDIAN_SEED_VAULT_READINESS_DOMAIN_TREE;
  host.getRendererHandoff = () => composeHandoff(originalGetRendererHandoff(), describeFromRawState(originalGetState()));
  host.getState = () => {
    const state = originalGetState();
    const obsidianSeedVaultReadiness = describeFromRawState(state);
    return {
      ...state,
      obsidianSeedVaultReadiness,
      domain: {
        ...(state.domain ?? {}),
        hellscapeObsidianSeedVaultReadiness: obsidianSeedVaultReadiness
      },
      rendererHandoff: composeHandoff(state.rendererHandoff ?? originalGetRendererHandoff(), obsidianSeedVaultReadiness)
    };
  };
  return true;
}

function tick() {
  const host = window.GameHost;
  patchGameHost(host);
  syncHellscapeDiagnosticPanel(overlay);
  const now = performance.now();
  if (isHellscapeDiagnosticsEnabled() && host?.getObsidianSeedVaultReadiness && now - lastOverlayAt >= 750) {
    lastOverlayAt = now;
    renderOverlay(host.getObsidianSeedVaultReadiness());
  }
  requestAnimationFrame(tick);
}

window.HellscapeObsidianSeedVaultReadiness = {
  domainKit,
  tree: HELLSCAPE_OBSIDIAN_SEED_VAULT_READINESS_DOMAIN_TREE,
  runtimeSurface,
  getLatest: () => latestReadiness
};

requestAnimationFrame(tick);

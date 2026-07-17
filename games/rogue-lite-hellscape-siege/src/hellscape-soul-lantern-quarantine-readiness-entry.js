import * as NexusEngineRuntime from 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
import { createHellscapeSoulLanternQuarantineReadinessDomainKit } from './hellscape-soul-lantern-quarantine-readiness-domain-kit.js';
import { isHellscapeDiagnosticsEnabled, syncHellscapeDiagnosticPanel } from './advanced-diagnostics.js';

const NEXUS_ENGINE_CDN = 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
const PASS_ID = 'soul-lantern-quarantine-readiness-renderer-handoff-pass';
const PANEL_ID = 'hellscape-soul-lantern-quarantine-panel';
const STYLE_ID = 'hellscape-soul-lantern-quarantine-style';
const domainKit = createHellscapeSoulLanternQuarantineReadinessDomainKit();
let installed = false;

function escapeHtml(value) {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    #${PANEL_ID}{position:fixed;left:16px;bottom:16px;z-index:12;width:min(410px,calc(100vw - 32px));padding:13px 14px;border:1px solid rgba(255,188,83,.28);border-radius:18px;color:#ffeec8;background:linear-gradient(180deg,rgba(40,10,7,.86),rgba(8,3,6,.78));box-shadow:0 22px 80px rgba(0,0,0,.46),inset 0 0 0 1px rgba(255,255,255,.06);backdrop-filter:blur(14px);pointer-events:none}
    #${PANEL_ID} h2{margin:0 0 8px;font-size:.78rem;letter-spacing:.11em;text-transform:uppercase;color:#ffd071}
    #${PANEL_ID} .q-strip{height:8px;border-radius:999px;overflow:hidden;background:rgba(255,255,255,.11);box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)}
    #${PANEL_ID} .q-strip i{display:block;height:100%;width:calc(var(--q,0)*1%);border-radius:inherit;background:linear-gradient(90deg,#fe704c,#ffd66f,#93ffb5)}
    #${PANEL_ID} .q-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:9px}
    #${PANEL_ID} .q-card{min-width:0;border:1px solid rgba(255,255,255,.12);border-radius:13px;padding:8px;background:rgba(0,0,0,.2)}
    #${PANEL_ID} .q-card strong{display:block;color:#ffba69;font-size:.64rem;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    #${PANEL_ID} .q-card span{display:block;margin-top:4px;color:#fff7d5;font-size:1.2rem;font-weight:950;line-height:1}
    #${PANEL_ID} .q-card small{display:block;margin-top:4px;color:#d7aa91;font-size:.67rem;line-height:1.25}
    #${PANEL_ID} .q-missing{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}
    #${PANEL_ID} .q-missing b{border:1px solid rgba(255,255,255,.13);border-radius:999px;padding:4px 7px;background:rgba(255,80,42,.12);color:#ffe2c1;font-size:.66rem;text-transform:uppercase;letter-spacing:.04em}
  `;
  document.head.append(style);
}

function stateForDomain() {
  const host = globalThis.GameHost;
  const snapshot = typeof host?.getState === 'function' ? host.getState() : {};
  return {
    ...snapshot,
    inventory: snapshot?.inventory ?? {},
    wave: snapshot?.wave ?? snapshot?.waves?.index ?? snapshot?.waves?.current ?? 0,
    coreHealth: snapshot?.coreHealth ?? snapshot?.baseHealth ?? snapshot?.core?.health ?? 100,
    maxCoreHealth: snapshot?.maxCoreHealth ?? snapshot?.baseMaxHealth ?? snapshot?.core?.maxHealth ?? 100,
    time: snapshot?.clock?.elapsed ?? snapshot?.time ?? 0
  };
}

function ensurePanel() {
  let panel = document.getElementById(PANEL_ID);
  if (!panel) {
    panel = document.createElement('section');
    panel.id = PANEL_ID;
    panel.setAttribute('aria-label', 'Soul lantern quarantine readiness');
    document.querySelector('#app')?.append(panel);
  }
  return panel;
}

function renderPanel(readiness) {
  const panel = ensurePanel();
  if (!syncHellscapeDiagnosticPanel(panel)) return;
  const counts = readiness.rendererHandoff.counts;
  const missing = readiness.missing.length ? readiness.missing.map((item) => `<b>${escapeHtml(item)}</b>`).join('') : '<b>dusk quarantine lit</b>';
  panel.innerHTML = `
    <h2>Soul lantern quarantine</h2>
    <div class="q-strip" style="--q:${readiness.readiness}"><i></i></div>
    <div class="q-grid">
      <div class="q-card"><strong>Readiness</strong><span>${readiness.readiness}%</span><small>${escapeHtml(readiness.phase)}</small></div>
      <div class="q-card"><strong>Pressure</strong><span>${readiness.contaminationPressure}%</span><small>plague breach risk</small></div>
      <div class="q-card"><strong>Descriptors</strong><span>${readiness.rendererHandoff.flatDescriptors.length}</span><small>${Object.keys(counts).length} families</small></div>
    </div>
    <div class="q-missing">${missing}</div>
  `;
}

function install() {
  if (installed) return;
  const host = globalThis.GameHost;
  if (!host || typeof host.getState !== 'function') {
    globalThis.setTimeout(install, 40);
    return;
  }
  installed = true;
  injectStyles();
  const priorHandoff = typeof host.getRendererHandoff === 'function' ? host.getRendererHandoff.bind(host) : null;
  host.nexusEngineCdn = host.nexusEngineCdn || NEXUS_ENGINE_CDN;
  host.nexusEngineSoulLanternQuarantineExports = Object.keys(NexusEngineRuntime).slice(0, 12);
  host.soulLanternQuarantineDomain = domainKit;
  host.getHellscapeSoulLanternQuarantineReadiness = () => domainKit.describe(stateForDomain());
  host.getSoulLanternQuarantineReadiness = host.getHellscapeSoulLanternQuarantineReadiness;
  host.getSoulLanternQuarantineReadinessTree = () => domainKit.tree;
  host.getRendererHandoff = () => {
    const previous = priorHandoff ? priorHandoff() : {};
    const soulLanternQuarantine = domainKit.describe(stateForDomain()).rendererHandoff;
    return { ...previous, soulLanternQuarantine, soulLanternQuarantineCounts: soulLanternQuarantine.counts };
  };
  document.body?.setAttribute('data-soul-lantern-quarantine-pass', PASS_ID);
  document.querySelector('#app')?.setAttribute('data-soul-lantern-quarantine-pass', PASS_ID);
  globalThis.setInterval(() => {
    const panel = document.getElementById(PANEL_ID);
    syncHellscapeDiagnosticPanel(panel);
    if (!isHellscapeDiagnosticsEnabled()) return;
    injectStyles();
    renderPanel(domainKit.describe(stateForDomain()));
  }, 750);
}

install();

import * as NexusEngineRuntime from 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
import { createThirdPersonWayfindingCacheReadinessDomainKit } from '../kits/third-person-wayfinding-cache-readiness-domain-kit.js';

const NEXUS_ENGINE_CDN = 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
const wayfindingCacheDomainKit = createThirdPersonWayfindingCacheReadinessDomainKit();
let overlay;
let style;
let cacheInputState = { discoveredCaches: 0, carriedMedkits: 0 };

function ensureOverlay() {
  if (!style) {
    style = document.createElement('style');
    style.dataset.thirdPersonWayfindingCache = 'true';
    style.textContent = `.wayfinding-cache-overlay{position:fixed;inset:0;z-index:1;pointer-events:none;overflow:hidden;font-family:Inter,system-ui,sans-serif;color:white}.chalk-arrow,.safe-step,.medkit-cache,.rubble-silhouette,.ribbon-line{position:absolute;left:var(--x);top:var(--z);transform:translate(-50%,-50%)}.chalk-arrow{width:calc(22px + var(--l)*20px);height:8px;border-radius:999px;background:rgba(248,236,186,calc(.26 + var(--l)*.56));box-shadow:0 0 calc(10px + var(--l)*24px) rgba(255,235,170,.28);transform:translate(-50%,-50%) rotate(var(--h))}.chalk-arrow::after{content:"";position:absolute;right:-8px;top:-5px;border-left:12px solid rgba(248,236,186,calc(.32 + var(--l)*.56));border-top:9px solid transparent;border-bottom:9px solid transparent}.ribbon-line{width:calc(66px + var(--d)*2px);height:calc(16px + var(--t)*18px);border-top:3px dashed rgba(255,108,158,calc(.24 + var(--t)*.62));border-radius:999px 999px 0 0;filter:drop-shadow(0 0 12px rgba(255,94,160,.28));transform:translate(-50%,-72%) rotate(-8deg)}.rubble-silhouette{width:calc(22px + var(--w)*8px);height:calc(14px + var(--d)*7px);border-radius:8px 14px 7px 12px;background:rgba(128,108,92,calc(.22 + var(--h)*.32));border:1px solid rgba(255,205,150,calc(.14 + var(--h)*.38));box-shadow:0 0 calc(12px + var(--h)*28px) rgba(255,150,88,.22)}.safe-step{width:calc(12px + var(--t)*18px);height:calc(8px + var(--t)*12px);border-radius:999px;background:rgba(122,255,198,calc(.16 + var(--t)*.38));box-shadow:0 0 calc(8px + var(--t)*24px) rgba(98,255,196,.28)}.medkit-cache{width:calc(20px + var(--s)*24px);height:calc(16px + var(--a)*18px);border-radius:8px;border:1px solid rgba(255,255,255,.24);background:linear-gradient(180deg,rgba(255,255,255,calc(.16 + var(--s)*.2)),rgba(230,65,85,calc(.28 + var(--s)*.32)));box-shadow:0 0 calc(12px + var(--s)*30px) rgba(255,90,110,.26)}.medkit-cache::after{content:"+";position:absolute;inset:0;display:grid;place-items:center;font-weight:900;color:rgba(255,255,255,.86)}.wayfinding-stack{position:fixed;left:22px;bottom:22px;display:flex;flex-direction:column;gap:8px;z-index:3;align-items:flex-start}.wayfinding-summary,.wayfinding-chip{border:1px solid rgba(255,255,255,.2);border-radius:14px;padding:7px 11px;background:rgba(4,8,18,.76);backdrop-filter:blur(10px);font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.wayfinding-summary{color:#fff0bc}.wayfinding-chip.cache-route-secured{border-color:rgba(112,255,202,.64);color:#d8fff1}.wayfinding-chip.cache-route-forming{border-color:rgba(255,218,118,.66);color:#ffe8aa}.wayfinding-chip.cache-route-at-risk{border-color:rgba(255,112,132,.68);color:#ffc8d0}@media(max-width:780px){.wayfinding-cache-overlay{display:none}}`;
    document.head.append(style);
  }
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'wayfinding-cache-overlay';
    overlay.dataset.domain = 'third-person-wayfinding-cache-readiness-domain';
    overlay.dataset.rendererConsumes = 'descriptors-only';
    document.body.append(overlay);
  }
  return overlay;
}

function readControllerSnapshot() {
  const base = globalThis.__thirdPersonFollowThrough ?? {
    targetPosition: [0, 0, 8],
    cameraPosition: [0, 3.2, 15],
    actorForwardWorld: [0, 0, -1],
    movementWishWorld: [0, 0, 0],
    colliderCount: 6,
    grounded: true,
    staminaRatio: 1,
    frame: 0
  };
  return {
    ...base,
    discoveredCaches: Number(base.discoveredCaches ?? cacheInputState.discoveredCaches),
    carriedMedkits: Number(base.carriedMedkits ?? cacheInputState.carriedMedkits)
  };
}

function applyWayfindingCacheInput(input = {}) {
  const action = String(input.action ?? input.type ?? '').toLowerCase();
  if (action === 'discover-cache') {
    cacheInputState = { ...cacheInputState, discoveredCaches: Math.min(4, cacheInputState.discoveredCaches + 1) };
  }
  if (action === 'collect-medkit') {
    cacheInputState = { ...cacheInputState, carriedMedkits: Math.min(4, cacheInputState.carriedMedkits + 1) };
  }
  if (action === 'reset-wayfinding') {
    cacheInputState = { discoveredCaches: 0, carriedMedkits: 0 };
  }
  return wayfindingCacheDomainKit.snapshot(readControllerSnapshot());
}

function screen(position, axis) {
  const value = axis === 'x' ? Number(position?.x ?? 0) : Number(position?.z ?? 0);
  return Math.max(3, Math.min(97, 50 + value * 1.85));
}

function renderWayfindingCache(description) {
  const target = ensureOverlay();
  const d = description.rendererHandoff.descriptors;
  const s = description.summary;
  target.innerHTML = `
    ${d.chalkArrowMarks.map((arrow) => `<i class="chalk-arrow ${arrow.state}" title="${arrow.state}" style="--x:${screen(arrow.position, 'x')}%;--z:${screen(arrow.position, 'z')}%;--l:${arrow.legibility};--h:${arrow.heading}rad"></i>`).join('')}
    ${d.rescueRibbonLines.map((ribbon) => `<i class="ribbon-line ${ribbon.state}" title="${ribbon.label}" style="--x:${screen(ribbon.end, 'x')}%;--z:${screen(ribbon.end, 'z')}%;--d:${Math.min(34, ribbon.distance)};--t:${ribbon.tension}"></i>`).join('')}
    ${d.rubbleSilhouettes.map((rubble) => `<i class="rubble-silhouette ${rubble.state}" title="${rubble.label}" style="--x:${screen(rubble.center, 'x')}%;--z:${screen(rubble.center, 'z')}%;--w:${rubble.width};--d:${rubble.depth};--h:${rubble.hazard}"></i>`).join('')}
    ${d.safeStepTiles.map((tile) => `<i class="safe-step ${tile.state}" title="${tile.state}" style="--x:${screen(tile.position, 'x')}%;--z:${screen(tile.position, 'z')}%;--t:${tile.trust}"></i>`).join('')}
    ${d.medkitCacheCrates.map((cache) => `<i class="medkit-cache ${cache.state}" title="${cache.label}" style="--x:${screen(cache.position, 'x')}%;--z:${screen(cache.position, 'z')}%;--s:${cache.stock};--a:${cache.access}"></i>`).join('')}
    <div class="wayfinding-stack"><b class="wayfinding-summary">WAYFINDING ${Math.round(s.readiness * 100)}% · PRESSURE ${Math.round(s.routePressure * 100)}% · CACHE ${Math.round(s.cacheCoverage * 100)}%</b>${d.dawnWayfindingLedgers.map((ledger) => `<b class="wayfinding-chip ${ledger.state}">${ledger.state.replaceAll('-', ' ')} · MEDKITS ${ledger.carriedMedkits}</b>`).join('')}</div>`;
}

function composeRendererHandoff(baseHandoff = {}, cacheHandoff) {
  return {
    id: 'third-person-follow-through-wayfinding-cache-composed-renderer-handoff',
    policy: 'renderer-consumes-descriptors-only',
    domains: [...(baseHandoff.domains ?? []), 'third-person-wayfinding-cache-readiness-domain'],
    counts: { ...(baseHandoff.counts ?? {}), wayfindingCache: cacheHandoff.counts },
    descriptors: { ...(baseHandoff.descriptors ?? {}), wayfindingCache: cacheHandoff.descriptors }
  };
}

function describeCurrent() {
  const controllerSnapshot = readControllerSnapshot();
  const wayfindingDescription = wayfindingCacheDomainKit.describe(controllerSnapshot);
  return { controllerSnapshot, wayfindingDescription, rendererHandoff: wayfindingDescription.rendererHandoff };
}

function installGameHost(current) {
  const host = globalThis.GameHost ?? {};
  const candidate = host.getRendererHandoff;
  const baseGetter = candidate && candidate.__thirdPersonWayfindingCacheMerged !== true ? candidate.bind(host) : null;
  host.getWayfindingCacheReadiness = () => wayfindingCacheDomainKit.snapshot(readControllerSnapshot());
  host.getThirdPersonWayfindingCacheReadiness = () => wayfindingCacheDomainKit.snapshot(readControllerSnapshot());
  host.getWayfindingCacheReadinessTree = () => wayfindingCacheDomainKit.tree;
  host.applyWayfindingCacheInput = applyWayfindingCacheInput;
  const mergedGetter = () => {
    const base = baseGetter ? baseGetter() : (globalThis.__thirdPersonArenaFractal?.rendererHandoff ?? {});
    const next = wayfindingCacheDomainKit.describe(readControllerSnapshot()).rendererHandoff;
    return composeRendererHandoff(base, next);
  };
  mergedGetter.__thirdPersonWayfindingCacheMerged = true;
  host.getRendererHandoff = mergedGetter;
  globalThis.GameHost = host;
  globalThis.__thirdPersonWayfindingCacheReadiness = {
    nexusEngineCdn: NEXUS_ENGINE_CDN,
    nexusEngineExportCount: Object.keys(NexusEngineRuntime).length,
    domainId: wayfindingCacheDomainKit.id,
    controllerSnapshot: current.controllerSnapshot,
    counts: current.wayfindingDescription.counts,
    summary: current.wayfindingDescription.summary,
    rendererHandoff: current.rendererHandoff,
    applyInput: applyWayfindingCacheInput,
    getState: () => wayfindingCacheDomainKit.snapshot(readControllerSnapshot()),
    describe: () => wayfindingCacheDomainKit.describe(readControllerSnapshot())
  };
  document.body.dataset.thirdPersonWayfindingCache = 'ready';
}

function tickWayfindingCache() {
  const current = describeCurrent();
  renderWayfindingCache(current.wayfindingDescription);
  installGameHost(current);
  requestAnimationFrame(tickWayfindingCache);
}

requestAnimationFrame(tickWayfindingCache);

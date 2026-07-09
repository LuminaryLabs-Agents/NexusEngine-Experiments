import * as NexusEngineRuntime from 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
import { createThirdPersonMedevacReadinessDomainKit } from '../kits/third-person-medevac-readiness-domain-kit.js';

const NEXUS_ENGINE_CDN = 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
const medevacDomainKit = createThirdPersonMedevacReadinessDomainKit();
let overlay;
let style;

function ensureOverlay() {
  if (!style) {
    style = document.createElement('style');
    style.dataset.thirdPersonMedevac = 'true';
    style.textContent = `
      .medevac-overlay{position:fixed;inset:0;z-index:1;pointer-events:none;overflow:hidden;font-family:Inter,system-ui,sans-serif;color:white}.casualty-beacon{position:absolute;left:var(--x);top:var(--z);width:var(--r);height:var(--r);border-radius:999px;border:1px solid rgba(255,255,255,var(--o));background:rgba(255,90,110,calc(var(--o)*.12));box-shadow:0 0 calc(18px + var(--u)*22px) rgba(255,95,110,.42);transform:translate(-50%,-50%)}.casualty-beacon.stable{background:rgba(95,180,255,calc(var(--o)*.08));box-shadow:0 0 22px rgba(95,180,255,.22)}.casualty-beacon.critical{border-color:rgba(255,110,90,.92)}.vital-ribbon{position:absolute;left:var(--x);top:var(--z);width:58px;height:7px;border-radius:999px;background:linear-gradient(90deg,rgba(108,255,190,var(--p)),rgba(255,255,255,.12));opacity:calc(.22 + var(--p)*.62);transform:translate(-50%,-50%) rotate(-8deg)}.cover-corridor{position:absolute;left:var(--x);top:var(--z);width:var(--w);height:44px;border-radius:999px;border:1px solid rgba(108,255,190,var(--o));background:rgba(32,120,110,calc(var(--o)*.12));transform:translate(-50%,-50%) rotate(10deg)}.cover-corridor.exposed{border-color:rgba(255,130,130,var(--o));background:rgba(255,90,120,calc(var(--o)*.06))}.signal-flare{position:absolute;left:var(--x);top:var(--z);width:8px;height:calc(34px + var(--s)*38px);border-radius:999px;background:linear-gradient(0deg,rgba(255,255,255,.08),rgba(255,220,120,var(--s)));box-shadow:0 0 calc(12px + var(--s)*26px) rgba(255,220,120,.48);opacity:calc(.2 + var(--s)*.66);transform:translate(-50%,-100%)}.stretcher-pickup{position:absolute;left:var(--x);top:var(--z);width:76px;height:28px;border-radius:999px;border:2px solid rgba(180,220,255,var(--o));background:rgba(10,16,28,.64);transform:translate(-50%,-50%)}.stretcher-pickup.ready{border-color:rgba(108,255,190,var(--o));box-shadow:0 0 28px rgba(108,255,190,.34)}.medevac-stack{position:fixed;right:22px;bottom:22px;display:flex;flex-direction:column;gap:8px;z-index:3}.medevac-chip,.medevac-summary{border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:7px 11px;background:rgba(4,8,18,.76);backdrop-filter:blur(10px);font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.medevac-summary{border-radius:14px;color:#e5f4ff}.medevac-chip.go{border-color:rgba(105,255,186,.58);color:#d9ffee}.medevac-chip.hold{border-color:rgba(255,220,120,.72);color:#ffe8aa}.medevac-chip.delay{border-color:rgba(255,105,130,.72);color:#ffc5ce}@media(max-width:780px){.medevac-overlay{display:none}}`;
    document.head.append(style);
  }
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'medevac-overlay';
    overlay.dataset.domain = 'third-person-medevac-readiness-domain';
    overlay.dataset.rendererConsumes = 'descriptors-only';
    document.body.append(overlay);
  }
  return overlay;
}

function readControllerSnapshot() {
  return globalThis.__thirdPersonFollowThrough ?? {
    targetPosition: [0, 0, 8],
    cameraPosition: [0, 3.2, 15],
    actorForwardWorld: [0, 0, -1],
    movementWishWorld: [0, 0, 0],
    colliderCount: 6,
    grounded: true,
    staminaRatio: 1
  };
}

function worldToScreenPercent(position, axis) {
  const value = axis === 'x' ? Number(position?.x ?? 0) : Number(position?.z ?? 0);
  return Math.max(3, Math.min(97, 50 + value * 1.85));
}

function renderMedevac(description) {
  const target = ensureOverlay();
  const descriptors = description.rendererHandoff.descriptors;
  const summary = description.summary;
  target.innerHTML = `
    <div class="casualty-beacons">${descriptors.casualtyBeacons.map((beacon) => `<i class="casualty-beacon ${beacon.state}" title="${beacon.label}" style="--x:${worldToScreenPercent(beacon.position, 'x')}%;--z:${worldToScreenPercent(beacon.position, 'z')}%;--r:${28 + beacon.urgency * 34}px;--u:${beacon.urgency};--o:${beacon.opacity}"></i>`).join('')}</div>
    <div class="vital-ribbons">${descriptors.vitalSignRibbons.map((ribbon) => `<i class="vital-ribbon ${ribbon.state}" title="${ribbon.casualtyId}" style="--x:${worldToScreenPercent(ribbon.position, 'x')}%;--z:${worldToScreenPercent(ribbon.position, 'z')}%;--p:${ribbon.stabilization}"></i>`).join('')}</div>
    <div class="cover-corridors">${descriptors.coverCorridors.map((corridor) => `<i class="cover-corridor ${corridor.state}" title="${corridor.label}" style="--x:${worldToScreenPercent(corridor.center, 'x')}%;--z:${worldToScreenPercent(corridor.center, 'z')}%;--w:${corridor.width * 15}px;--o:${corridor.opacity}"></i>`).join('')}</div>
    <div class="signal-flares">${descriptors.signalFlares.map((flare) => `<i class="signal-flare ${flare.state}" title="${flare.casualtyId}" style="--x:${worldToScreenPercent(flare.origin, 'x')}%;--z:${worldToScreenPercent(flare.origin, 'z')}%;--s:${flare.signal}"></i>`).join('')}</div>
    <div class="stretcher-pickups">${descriptors.stretcherPickups.map((pickup) => `<i class="stretcher-pickup ${pickup.state}" title="${pickup.label}" style="--x:${worldToScreenPercent(pickup.center, 'x')}%;--z:${worldToScreenPercent(pickup.center, 'z')}%;--o:${pickup.opacity}"></i>`).join('')}</div>
    <div class="medevac-stack"><b class="medevac-summary">MEDEVAC CRITICAL ${summary.criticalCasualties} · READY ${summary.readyPickups} · EVAC ${Math.round(summary.evacuationReadiness * 100)}%</b>${descriptors.evacuationTimers.map((timer) => `<b class="medevac-chip ${timer.state}">EVAC ${timer.state} · ${timer.seconds}s</b>`).join('')}</div>`;
}

function composeRendererHandoff(baseHandoff = {}, medevacHandoff) {
  return {
    id: 'third-person-follow-through-medevac-composed-renderer-handoff',
    policy: 'renderer-consumes-descriptors-only',
    domains: [...(baseHandoff.domains ?? []), 'third-person-medevac-readiness-domain'],
    counts: { ...(baseHandoff.counts ?? {}), medevac: medevacHandoff.counts },
    descriptors: { ...(baseHandoff.descriptors ?? {}), medevac: medevacHandoff.descriptors }
  };
}

function describeCurrent() {
  const controllerSnapshot = readControllerSnapshot();
  const medevacDescription = medevacDomainKit.describe(controllerSnapshot);
  return { controllerSnapshot, medevacDescription, rendererHandoff: medevacDescription.rendererHandoff };
}

function installGameHost(current) {
  const host = globalThis.GameHost ?? {};
  const candidate = host.getRendererHandoff;
  const baseGetter = candidate && candidate.__thirdPersonMedevacMerged !== true ? candidate.bind(host) : null;
  host.getMedevacReadiness = () => medevacDomainKit.snapshot(readControllerSnapshot());
  host.getThirdPersonMedevacReadiness = () => medevacDomainKit.snapshot(readControllerSnapshot());
  host.getMedevacReadinessTree = () => medevacDomainKit.tree;
  const mergedGetter = () => {
    const base = baseGetter ? baseGetter() : (globalThis.__thirdPersonArenaFractal?.rendererHandoff ?? {});
    const next = medevacDomainKit.describe(readControllerSnapshot()).rendererHandoff;
    return composeRendererHandoff(base, next);
  };
  mergedGetter.__thirdPersonMedevacMerged = true;
  host.getRendererHandoff = mergedGetter;
  globalThis.GameHost = host;
  globalThis.__thirdPersonMedevacReadiness = {
    nexusEngineCdn: NEXUS_ENGINE_CDN,
    nexusEngineExportCount: Object.keys(NexusEngineRuntime).length,
    domainId: medevacDomainKit.id,
    controllerSnapshot: current.controllerSnapshot,
    counts: current.medevacDescription.counts,
    summary: current.medevacDescription.summary,
    rendererHandoff: composeRendererHandoff(globalThis.GameHost.getRendererHandoff?.() ?? {}, current.rendererHandoff),
    medevacRendererHandoff: current.rendererHandoff,
    getState: () => medevacDomainKit.snapshot(readControllerSnapshot()),
    describe: () => medevacDomainKit.describe(readControllerSnapshot())
  };
  document.body.dataset.thirdPersonMedevac = 'ready';
}

function tickMedevac() {
  const current = describeCurrent();
  renderMedevac(current.medevacDescription);
  installGameHost(current);
  requestAnimationFrame(tickMedevac);
}

requestAnimationFrame(tickMedevac);

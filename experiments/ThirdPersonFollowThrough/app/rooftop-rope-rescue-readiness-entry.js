import * as NexusEngineRuntime from 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
import { createThirdPersonRooftopRopeRescueReadinessDomainKit } from '../kits/third-person-rooftop-rope-rescue-readiness-domain-kit.js';

const NEXUS_ENGINE_CDN = 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
const rooftopRopeRescueDomainKit = createThirdPersonRooftopRopeRescueReadinessDomainKit();
let overlay;
let style;
let ropeInputState = { securedAnchors: 0, bridgedSpans: 0, triagedStretchers: 0 };

function ensureOverlay() {
  if (!style) {
    style = document.createElement('style');
    style.dataset.thirdPersonRooftopRopeRescue = 'true';
    style.textContent = `.rooftop-rope-rescue-overlay{position:fixed;inset:0;z-index:1;pointer-events:none;overflow:hidden;font-family:Inter,system-ui,sans-serif;color:white}.roof-anchor,.rope-span,.stretcher-marker,.triage-tarp,.wind-sock{position:absolute;left:var(--x);top:var(--z);transform:translate(-50%,-50%)}.roof-anchor{width:calc(14px + var(--i)*24px);height:calc(14px + var(--i)*24px);border-radius:999px;border:2px solid rgba(154,229,255,calc(.28 + var(--i)*.58));box-shadow:0 0 calc(14px + var(--i)*30px) rgba(88,209,255,.32);background:rgba(20,80,120,.16)}.rope-span{width:calc(64px + var(--t)*90px);height:calc(10px + var(--s)*24px);border-top:3px dashed rgba(255,238,156,calc(.22 + var(--t)*.6));border-radius:999px 999px 0 0;filter:drop-shadow(0 0 16px rgba(255,220,110,.24));transform:translate(-50%,-50%) rotate(var(--r))}.stretcher-marker{width:calc(20px + var(--c)*24px);height:8px;border-radius:999px;background:rgba(255,125,156,calc(.22 + var(--c)*.54));box-shadow:0 0 calc(10px + var(--c)*24px) rgba(255,104,150,.28);transform:translate(-50%,-50%) rotate(var(--h))}.triage-tarp{width:calc(30px + var(--a)*34px);height:calc(16px + var(--l)*18px);border-radius:12px;background:linear-gradient(90deg,rgba(68,255,201,calc(.18 + var(--a)*.35)),rgba(40,110,255,calc(.12 + var(--a)*.24)));border:1px solid rgba(210,255,240,.24);box-shadow:0 0 calc(12px + var(--a)*22px) rgba(64,255,210,.24)}.wind-sock{width:calc(28px + var(--g)*28px);height:10px;border-radius:999px 2px 2px 999px;background:rgba(255,185,83,calc(.22 + var(--g)*.54));box-shadow:0 0 calc(10px + var(--g)*22px) rgba(255,188,75,.25);transform:translate(-50%,-50%) rotate(var(--lean))}.rooftop-rescue-stack{position:fixed;right:22px;bottom:22px;display:flex;flex-direction:column;gap:8px;z-index:3;align-items:flex-end}.rooftop-rescue-summary,.rooftop-rescue-chip{border:1px solid rgba(255,255,255,.2);border-radius:14px;padding:7px 11px;background:rgba(4,8,18,.78);backdrop-filter:blur(10px);font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.rooftop-rescue-summary{color:#dff7ff}.rooftop-rescue-chip.rooftop-rescue-secured{border-color:rgba(104,255,210,.66);color:#dbfff4}.rooftop-rescue-chip.rooftop-rescue-forming{border-color:rgba(255,223,118,.66);color:#ffe8ad}.rooftop-rescue-chip.rooftop-rescue-at-risk{border-color:rgba(255,112,142,.68);color:#ffc9d2}@media(max-width:780px){.rooftop-rope-rescue-overlay{display:none}}`;
    document.head.append(style);
  }
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'rooftop-rope-rescue-overlay';
    overlay.dataset.domain = 'third-person-rooftop-rope-rescue-readiness-domain';
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
    securedAnchors: Number(base.securedAnchors ?? ropeInputState.securedAnchors),
    bridgedSpans: Number(base.bridgedSpans ?? ropeInputState.bridgedSpans),
    triagedStretchers: Number(base.triagedStretchers ?? ropeInputState.triagedStretchers)
  };
}

function applyRooftopRopeRescueInput(input = {}) {
  const action = String(input.action ?? input.type ?? '').toLowerCase();
  if (action === 'secure-anchor') {
    ropeInputState = { ...ropeInputState, securedAnchors: Math.min(4, ropeInputState.securedAnchors + 1) };
  }
  if (action === 'bridge-span') {
    ropeInputState = { ...ropeInputState, bridgedSpans: Math.min(3, ropeInputState.bridgedSpans + 1) };
  }
  if (action === 'triage-stretcher') {
    ropeInputState = { ...ropeInputState, triagedStretchers: Math.min(3, ropeInputState.triagedStretchers + 1) };
  }
  if (action === 'reset-rooftop-rope-rescue') {
    ropeInputState = { securedAnchors: 0, bridgedSpans: 0, triagedStretchers: 0 };
  }
  return rooftopRopeRescueDomainKit.snapshot(readControllerSnapshot());
}

function screen(position, axis) {
  const value = axis === 'x' ? Number(position?.x ?? 0) : Number(position?.z ?? 0);
  return Math.max(3, Math.min(97, 50 + value * 1.85));
}

function renderRooftopRopeRescue(description) {
  const target = ensureOverlay();
  const d = description.rendererHandoff.descriptors;
  const s = description.summary;
  target.innerHTML = `
    ${d.anchorBoltClusters.map((anchor) => `<i class="roof-anchor ${anchor.state}" title="${anchor.label}" style="--x:${screen(anchor.position, 'x')}%;--z:${screen(anchor.position, 'z')}%;--i:${anchor.integrity}"></i>`).join('')}
    ${d.ropeBridgeSpans.map((span) => `<i class="rope-span ${span.state}" title="${span.state}" style="--x:${screen({ x: (span.start.x + span.end.x) / 2 }, 'x')}%;--z:${screen({ z: (span.start.z + span.end.z) / 2 }, 'z')}%;--t:${span.tension};--s:${span.sag};--r:${Math.atan2(span.end.z - span.start.z, span.end.x - span.start.x)}rad"></i>`).join('')}
    ${d.stretcherRouteMarkers.map((marker) => `<i class="stretcher-marker ${marker.state}" title="${marker.state}" style="--x:${screen(marker.position, 'x')}%;--z:${screen(marker.position, 'z')}%;--c:${marker.clarity};--h:${marker.index * 0.22}rad"></i>`).join('')}
    ${d.triageTarps.map((tarp) => `<i class="triage-tarp ${tarp.state}" title="${tarp.label}" style="--x:${screen(tarp.position, 'x')}%;--z:${screen(tarp.position, 'z')}%;--a:${tarp.access};--l:${tarp.load}"></i>`).join('')}
    ${d.windSockHazards.map((sock) => `<i class="wind-sock ${sock.state}" title="${sock.state}" style="--x:${screen(sock.position, 'x')}%;--z:${screen(sock.position, 'z')}%;--g:${sock.gust};--lean:${sock.lean}rad"></i>`).join('')}
    <div class="rooftop-rescue-stack"><b class="rooftop-rescue-summary">ROOFTOP ROPE ${Math.round(s.readiness * 100)}% · FALL ${Math.round(s.fallRisk * 100)}%</b>${d.duskEvacuationLedgers.map((ledger) => `<b class="rooftop-rescue-chip ${ledger.state}">${ledger.state.replaceAll('-', ' ')} · A${ledger.securedAnchors}/S${ledger.bridgedSpans}/T${ledger.triagedStretchers}</b>`).join('')}</div>`;
}

function composeRendererHandoff(baseHandoff = {}, rescueHandoff) {
  return {
    id: 'third-person-follow-through-rooftop-rope-rescue-composed-renderer-handoff',
    policy: 'renderer-consumes-descriptors-only',
    domains: [...(baseHandoff.domains ?? []), 'third-person-rooftop-rope-rescue-readiness-domain'],
    counts: { ...(baseHandoff.counts ?? {}), rooftopRopeRescue: rescueHandoff.counts },
    descriptors: { ...(baseHandoff.descriptors ?? {}), rooftopRopeRescue: rescueHandoff.descriptors }
  };
}

function describeCurrent() {
  const controllerSnapshot = readControllerSnapshot();
  const rooftopRopeDescription = rooftopRopeRescueDomainKit.describe(controllerSnapshot);
  return { controllerSnapshot, rooftopRopeDescription, rendererHandoff: rooftopRopeDescription.rendererHandoff };
}

function installGameHost(current) {
  const host = globalThis.GameHost ?? {};
  const candidate = host.getRendererHandoff;
  const baseGetter = candidate && candidate.__thirdPersonRooftopRopeRescueMerged !== true ? candidate.bind(host) : null;
  host.getRooftopRopeRescueReadiness = () => rooftopRopeRescueDomainKit.snapshot(readControllerSnapshot());
  host.getThirdPersonRooftopRopeRescueReadiness = () => rooftopRopeRescueDomainKit.snapshot(readControllerSnapshot());
  host.getRooftopRopeRescueReadinessTree = () => rooftopRopeRescueDomainKit.tree;
  host.applyRooftopRopeRescueInput = applyRooftopRopeRescueInput;
  const mergedGetter = () => {
    const base = baseGetter ? baseGetter() : (globalThis.__thirdPersonArenaFractal?.rendererHandoff ?? {});
    const next = rooftopRopeRescueDomainKit.describe(readControllerSnapshot()).rendererHandoff;
    return composeRendererHandoff(base, next);
  };
  mergedGetter.__thirdPersonRooftopRopeRescueMerged = true;
  host.getRendererHandoff = mergedGetter;
  globalThis.GameHost = host;
  globalThis.__thirdPersonRooftopRopeRescueReadiness = {
    nexusEngineCdn: NEXUS_ENGINE_CDN,
    nexusEngineExportCount: Object.keys(NexusEngineRuntime).length,
    domainId: rooftopRopeRescueDomainKit.id,
    controllerSnapshot: current.controllerSnapshot,
    counts: current.rooftopRopeDescription.counts,
    summary: current.rooftopRopeDescription.summary,
    rendererHandoff: current.rendererHandoff,
    applyInput: applyRooftopRopeRescueInput,
    getState: () => rooftopRopeRescueDomainKit.snapshot(readControllerSnapshot()),
    describe: () => rooftopRopeRescueDomainKit.describe(readControllerSnapshot())
  };
  document.body.dataset.thirdPersonRooftopRopeRescue = 'ready';
}

function tickRooftopRopeRescue() {
  const current = describeCurrent();
  renderRooftopRopeRescue(current.rooftopRopeDescription);
  installGameHost(current);
  requestAnimationFrame(tickRooftopRopeRescue);
}

requestAnimationFrame(tickRooftopRopeRescue);

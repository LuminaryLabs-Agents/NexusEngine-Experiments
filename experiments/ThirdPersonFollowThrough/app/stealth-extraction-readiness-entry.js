import * as NexusEngineRuntime from 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
import { createThirdPersonStealthExtractionReadinessDomainKit } from '../kits/third-person-stealth-extraction-readiness-domain-kit.js';

const NEXUS_ENGINE_CDN = 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
const stealthExtractionDomainKit = createThirdPersonStealthExtractionReadinessDomainKit();
let overlay;
let style;

function ensureOverlay() {
  if (!style) {
    style = document.createElement('style');
    style.dataset.thirdPersonStealthExtraction = 'true';
    style.textContent = `
      .stealth-extraction-overlay{position:fixed;inset:0;z-index:1;pointer-events:none;overflow:hidden;font-family:Inter,system-ui,sans-serif;color:white}.patrol-cone{position:absolute;left:var(--x);top:var(--z);width:var(--r);height:var(--r);clip-path:polygon(50% 50%,0 0,100% 0);border-radius:50%;background:rgba(255,70,92,calc(var(--o)*.16));border:1px solid rgba(255,120,130,var(--o));box-shadow:0 0 28px rgba(255,90,120,.24);transform:translate(-50%,-50%) rotate(var(--yaw))}.patrol-cone.clear{background:rgba(120,180,255,calc(var(--o)*.08));border-color:rgba(120,180,255,var(--o))}.patrol-cone.watched{background:rgba(255,205,90,calc(var(--o)*.14));border-color:rgba(255,205,90,var(--o))}.noise-pulse{position:absolute;left:var(--x);top:var(--z);width:var(--d);height:var(--d);border-radius:999px;border:1px dashed rgba(255,255,255,var(--o));background:rgba(255,255,255,calc(var(--o)*.035));transform:translate(-50%,-50%) rotateX(65deg)}.noise-pulse.loud{border-color:rgba(255,100,126,var(--o));background:rgba(255,100,126,calc(var(--o)*.07))}.cover-shadow{position:absolute;left:var(--x);top:var(--z);width:var(--d);height:var(--d);border-radius:999px;border:1px solid rgba(50,255,170,var(--o));background:rgba(18,90,82,calc(var(--o)*.18));box-shadow:0 0 28px rgba(50,255,170,.16);transform:translate(-50%,-50%) rotateX(66deg)}.cover-shadow.thin{border-color:rgba(180,225,255,var(--o));background:rgba(78,130,180,calc(var(--o)*.12))}.cover-shadow.exposed{border-style:dashed;border-color:rgba(255,130,130,var(--o));background:rgba(255,90,120,calc(var(--o)*.07))}.extract-crumb{position:absolute;left:var(--x);top:var(--z);min-width:54px;padding:5px 8px;border-radius:999px;border:1px solid rgba(180,220,255,var(--o));background:rgba(10,16,28,.72);font-size:10px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;opacity:var(--o);transform:translate(-50%,-50%)}.extract-crumb.next{border-color:rgba(255,235,130,.9);box-shadow:0 0 22px rgba(255,220,120,.38)}.extract-crumb.collected{border-color:rgba(90,255,175,.38);color:#c8ffea}.extract-badge{position:absolute;left:var(--x);top:var(--z);width:96px;height:96px;border-radius:999px;border:2px solid rgba(255,255,255,var(--o));background:radial-gradient(circle,rgba(255,255,255,calc(var(--o)*.18)),rgba(80,170,255,calc(var(--o)*.06)) 58%,transparent 60%);box-shadow:0 0 34px rgba(255,255,255,.28);transform:translate(-50%,-50%)}.extract-badge.commit{border-color:rgba(108,255,190,var(--o));box-shadow:0 0 42px rgba(108,255,190,.48)}.extract-badge.hold{border-color:rgba(255,110,130,var(--o))}.stealth-stack{position:fixed;left:22px;bottom:22px;display:flex;flex-direction:column;gap:8px;z-index:3}.stamina-chip,.stealth-summary{border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:7px 11px;background:rgba(4,8,18,.76);backdrop-filter:blur(10px);font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.stamina-chip.spent{border-color:rgba(255,105,130,.72);color:#ffc5ce}.stamina-chip.warning{border-color:rgba(255,220,120,.72);color:#ffe8aa}.stamina-chip.ready{border-color:rgba(105,255,186,.5);color:#d9ffee}.stealth-summary{border-radius:14px;color:#dfefff}@media(max-width:780px){.stealth-extraction-overlay{display:none}}`;
    document.head.append(style);
  }
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'stealth-extraction-overlay';
    overlay.dataset.domain = 'third-person-stealth-extraction-readiness-domain';
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

function renderStealthExtraction(description) {
  const target = ensureOverlay();
  const descriptors = description.rendererHandoff.descriptors;
  const summary = description.summary;
  target.innerHTML = `
    <div class="patrol-cones">
      ${descriptors.patrolSightCones.map((cone) => `<i class="patrol-cone ${cone.state}" title="${cone.patrolId}" style="--x:${worldToScreenPercent(cone.origin, 'x')}%;--z:${worldToScreenPercent(cone.origin, 'z')}%;--r:${cone.radius * 12}px;--yaw:${cone.yawDeg}deg;--o:${cone.opacity}"></i>`).join('')}
    </div>
    <div class="noise-traces">
      ${descriptors.noiseTracePulses.map((pulse) => `<i class="noise-pulse ${pulse.state}" title="noise ${pulse.noise}" style="--x:${worldToScreenPercent(pulse.center, 'x')}%;--z:${worldToScreenPercent(pulse.center, 'z')}%;--d:${pulse.radius * 11}px;--o:${pulse.opacity}"></i>`).join('')}
    </div>
    <div class="cover-shadows">
      ${descriptors.coverIslandShadows.map((cover) => `<i class="cover-shadow ${cover.state}" title="${cover.coverId}" style="--x:${worldToScreenPercent(cover.center, 'x')}%;--z:${worldToScreenPercent(cover.center, 'z')}%;--d:${cover.radius * 12}px;--o:${cover.opacity}"></i>`).join('')}
    </div>
    <div class="extract-crumbs">
      ${descriptors.extractionBreadcrumbs.map((crumb) => `<b class="extract-crumb ${crumb.state}" style="--x:${worldToScreenPercent(crumb.position, 'x')}%;--z:${worldToScreenPercent(crumb.position, 'z')}%;--o:${crumb.opacity}">${crumb.label}</b>`).join('')}
    </div>
    <div class="extract-badges">
      ${descriptors.extractionCommitBadges.map((badge) => `<i class="extract-badge ${badge.state}" title="extract ${badge.state}" style="--x:${worldToScreenPercent(badge.center, 'x')}%;--z:${worldToScreenPercent(badge.center, 'z')}%;--o:${badge.opacity}"></i>`).join('')}
    </div>
    <div class="stealth-stack">
      <b class="stealth-summary">STEALTH ${summary.alertState} · NEXT ${summary.nextBreadcrumb} · EXTRACT ${Math.round(summary.extractionReadiness * 100)}%</b>
      ${descriptors.staminaDebtMeters.map((meter) => `<b class="stamina-chip ${meter.state}">STAMINA ${meter.index + 1}/5 · ${meter.state}</b>`).join('')}
    </div>`;
}

function composeRendererHandoff(baseHandoff = {}, stealthHandoff) {
  return {
    id: 'third-person-follow-through-stealth-extraction-composed-renderer-handoff',
    policy: 'renderer-consumes-descriptors-only',
    domains: [...(baseHandoff.domains ?? []), 'third-person-stealth-extraction-readiness-domain'],
    counts: { ...(baseHandoff.counts ?? {}), stealthExtraction: stealthHandoff.counts },
    descriptors: { ...(baseHandoff.descriptors ?? {}), stealthExtraction: stealthHandoff.descriptors }
  };
}

function describeCurrent() {
  const controllerSnapshot = readControllerSnapshot();
  const stealthExtractionDescription = stealthExtractionDomainKit.describe(controllerSnapshot);
  return { controllerSnapshot, stealthExtractionDescription, rendererHandoff: stealthExtractionDescription.rendererHandoff };
}

function installGameHost(current) {
  const host = globalThis.GameHost ?? {};
  const candidate = host.getRendererHandoff;
  const baseGetter = candidate && candidate.__thirdPersonStealthExtractionMerged !== true ? candidate.bind(host) : null;
  host.getStealthExtractionReadiness = () => stealthExtractionDomainKit.snapshot(readControllerSnapshot());
  host.getThirdPersonStealthExtractionReadiness = () => stealthExtractionDomainKit.snapshot(readControllerSnapshot());
  const mergedGetter = () => {
    const base = baseGetter ? baseGetter() : (globalThis.__thirdPersonArenaFractal?.rendererHandoff ?? {});
    const next = stealthExtractionDomainKit.describe(readControllerSnapshot()).rendererHandoff;
    return composeRendererHandoff(base, next);
  };
  mergedGetter.__thirdPersonStealthExtractionMerged = true;
  host.getRendererHandoff = mergedGetter;
  globalThis.GameHost = host;
  globalThis.__thirdPersonStealthExtraction = {
    nexusEngineCdn: NEXUS_ENGINE_CDN,
    nexusEngineExportCount: Object.keys(NexusEngineRuntime).length,
    domainId: stealthExtractionDomainKit.id,
    controllerSnapshot: current.controllerSnapshot,
    counts: current.stealthExtractionDescription.counts,
    summary: current.stealthExtractionDescription.summary,
    rendererHandoff: composeRendererHandoff(globalThis.GameHost.getRendererHandoff?.() ?? {}, current.rendererHandoff),
    stealthRendererHandoff: current.rendererHandoff,
    getState: () => stealthExtractionDomainKit.snapshot(readControllerSnapshot()),
    describe: () => stealthExtractionDomainKit.describe(readControllerSnapshot())
  };
  document.body.dataset.thirdPersonStealthExtraction = 'ready';
}

function tickStealthExtraction() {
  const current = describeCurrent();
  renderStealthExtraction(current.stealthExtractionDescription);
  installGameHost(current);
  requestAnimationFrame(tickStealthExtraction);
}

requestAnimationFrame(tickStealthExtraction);

import * as NexusEngineRuntime from 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
import { createThirdPersonTraversalCourseReadinessDomainKit } from '../kits/third-person-traversal-course-readiness-domain-kit.js';

const NEXUS_ENGINE_CDN = 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
const traversalCourseDomainKit = createThirdPersonTraversalCourseReadinessDomainKit();
let overlay;
let style;

function ensureOverlay() {
  if (!style) {
    style = document.createElement('style');
    style.dataset.thirdPersonTraversalCourse = 'true';
    style.textContent = `
      .traversal-course-overlay{position:fixed;inset:0;z-index:1;pointer-events:none;overflow:hidden;font-family:Inter,system-ui,sans-serif;color:white}.course-gate{position:absolute;left:var(--x);top:var(--z);width:calc(30px + var(--c)*32px);height:calc(46px + var(--d)*24px);border:2px solid rgba(140,210,255,var(--o));border-radius:16px 16px 6px 6px;background:rgba(30,110,190,calc(var(--o)*.12));box-shadow:0 0 calc(14px + var(--c)*28px) rgba(80,180,255,.35);transform:translate(-50%,-75%)}.course-gate.locked-on{border-color:rgba(120,255,190,var(--o));background:rgba(80,255,190,calc(var(--o)*.1))}.footstep-ribbon{position:absolute;left:var(--x);top:var(--z);width:calc(72px + var(--t)*86px);height:9px;border-radius:999px;background:repeating-linear-gradient(90deg,rgba(255,255,255,calc(.22 + var(--t)*.44)) 0 10px,transparent 10px 18px);opacity:calc(.18 + var(--t)*.6);transform:translate(-50%,-50%) rotate(-12deg);box-shadow:0 0 18px rgba(255,255,255,.16)}.balance-wobble{position:absolute;left:var(--x);top:var(--z);width:calc(62px + var(--l)*8px);height:20px;border-radius:999px;border:1px solid rgba(255,220,110,var(--o));background:rgba(255,185,70,calc(var(--w)*.12));transform:translate(-50%,-50%) rotate(8deg)}.balance-wobble.unstable{border-color:rgba(255,105,125,var(--o));box-shadow:0 0 24px rgba(255,95,125,.34)}.vault-arc{position:absolute;left:var(--x);top:var(--z);width:calc(34px + var(--r)*16px);height:calc(20px + var(--r)*12px);border-top:3px solid rgba(210,170,255,var(--l));border-radius:999px 999px 0 0;transform:translate(-50%,-100%)}.recovery-pad{position:absolute;left:var(--x);top:var(--z);width:calc(var(--r)*18px);height:calc(var(--r)*18px);border-radius:999px;border:1px solid rgba(120,255,200,var(--c));background:radial-gradient(circle,rgba(120,255,200,calc(var(--c)*.16)),transparent 68%);transform:translate(-50%,-50%)}.course-stack{position:fixed;left:22px;bottom:22px;display:flex;flex-direction:column;gap:8px;z-index:3}.course-chip,.course-summary{border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:7px 11px;background:rgba(4,8,18,.76);backdrop-filter:blur(10px);font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.course-summary{border-radius:14px;color:#eef8ff}.course-chip.course-clear{border-color:rgba(105,255,186,.58);color:#d9ffee}.course-chip.coach-ready{border-color:rgba(255,220,120,.72);color:#ffe8aa}.course-chip.needs-routing{border-color:rgba(255,105,130,.72);color:#ffc5ce}@media(max-width:780px){.traversal-course-overlay{display:none}}`;
    document.head.append(style);
  }
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'traversal-course-overlay';
    overlay.dataset.domain = 'third-person-traversal-course-readiness-domain';
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
    staminaRatio: 1,
    frame: 0
  };
}

function worldToScreenPercent(position, axis) {
  const value = axis === 'x' ? Number(position?.x ?? 0) : Number(position?.z ?? 0);
  return Math.max(3, Math.min(97, 50 + value * 1.85));
}

function renderTraversalCourse(description) {
  const target = ensureOverlay();
  const descriptors = description.rendererHandoff.descriptors;
  const summary = description.summary;
  target.innerHTML = `
    <div class="course-gates">${descriptors.checkpointGates.map((gate) => `<i class="course-gate ${gate.state}" title="${gate.label}" style="--x:${worldToScreenPercent(gate.position, 'x')}%;--z:${worldToScreenPercent(gate.position, 'z')}%;--c:${gate.clarity};--d:${gate.difficulty};--o:${gate.opacity}"></i>`).join('')}</div>
    <div class="footstep-ribbons">${descriptors.ghostFootstepRibbons.map((ribbon) => `<i class="footstep-ribbon ${ribbon.state}" title="${ribbon.fromCheckpointId} to ${ribbon.toCheckpointId}" style="--x:${worldToScreenPercent(ribbon.center, 'x')}%;--z:${worldToScreenPercent(ribbon.center, 'z')}%;--t:${ribbon.tempo}"></i>`).join('')}</div>
    <div class="balance-wobbles">${descriptors.balanceBeamWobbles.map((beam) => `<i class="balance-wobble ${beam.state}" title="${beam.label}" style="--x:${worldToScreenPercent(beam.center, 'x')}%;--z:${worldToScreenPercent(beam.center, 'z')}%;--w:${beam.wobble};--l:${beam.length};--o:${beam.opacity}"></i>`).join('')}</div>
    <div class="vault-arcs">${descriptors.vaultTargetArcs.map((arc) => `<i class="vault-arc ${arc.state}" title="${arc.checkpointId}" style="--x:${worldToScreenPercent(arc.apex, 'x')}%;--z:${worldToScreenPercent(arc.apex, 'z')}%;--r:${arc.radius};--l:${arc.launch}"></i>`).join('')}</div>
    <div class="recovery-pads">${descriptors.breathRecoveryPads.map((pad) => `<i class="recovery-pad ${pad.state}" title="${pad.label}" style="--x:${worldToScreenPercent(pad.center, 'x')}%;--z:${worldToScreenPercent(pad.center, 'z')}%;--r:${pad.radius};--c:${pad.recovery}"></i>`).join('')}</div>
    <div class="course-stack"><b class="course-summary">COURSE ${Math.round(summary.courseReadiness * 100)}% · BALANCE ${Math.round((1 - summary.balanceRisk) * 100)}% · RECOVERY ${Math.round(summary.bestRecovery * 100)}%</b>${descriptors.coachLedgers.map((ledger) => `<b class="course-chip ${ledger.state}">${ledger.state.replaceAll('-', ' ')} · ${Math.round(ledger.routeVisibility * 100)}% visible</b>`).join('')}</div>`;
}

function composeRendererHandoff(baseHandoff = {}, courseHandoff) {
  return {
    id: 'third-person-follow-through-traversal-course-composed-renderer-handoff',
    policy: 'renderer-consumes-descriptors-only',
    domains: [...(baseHandoff.domains ?? []), 'third-person-traversal-course-readiness-domain'],
    counts: { ...(baseHandoff.counts ?? {}), traversalCourse: courseHandoff.counts },
    descriptors: { ...(baseHandoff.descriptors ?? {}), traversalCourse: courseHandoff.descriptors }
  };
}

function describeCurrent() {
  const controllerSnapshot = readControllerSnapshot();
  const traversalDescription = traversalCourseDomainKit.describe(controllerSnapshot);
  return { controllerSnapshot, traversalDescription, rendererHandoff: traversalDescription.rendererHandoff };
}

function installGameHost(current) {
  const host = globalThis.GameHost ?? {};
  const candidate = host.getRendererHandoff;
  const baseGetter = candidate && candidate.__thirdPersonTraversalCourseMerged !== true ? candidate.bind(host) : null;
  host.getTraversalCourseReadiness = () => traversalCourseDomainKit.snapshot(readControllerSnapshot());
  host.getThirdPersonTraversalCourseReadiness = () => traversalCourseDomainKit.snapshot(readControllerSnapshot());
  host.getTraversalCourseReadinessTree = () => traversalCourseDomainKit.tree;
  const mergedGetter = () => {
    const base = baseGetter ? baseGetter() : (globalThis.__thirdPersonArenaFractal?.rendererHandoff ?? {});
    const next = traversalCourseDomainKit.describe(readControllerSnapshot()).rendererHandoff;
    return composeRendererHandoff(base, next);
  };
  mergedGetter.__thirdPersonTraversalCourseMerged = true;
  host.getRendererHandoff = mergedGetter;
  globalThis.GameHost = host;
  globalThis.__thirdPersonTraversalCourseReadiness = {
    nexusEngineCdn: NEXUS_ENGINE_CDN,
    nexusEngineExportCount: Object.keys(NexusEngineRuntime).length,
    domainId: traversalCourseDomainKit.id,
    controllerSnapshot: current.controllerSnapshot,
    counts: current.traversalDescription.counts,
    summary: current.traversalDescription.summary,
    rendererHandoff: current.rendererHandoff,
    getState: () => traversalCourseDomainKit.snapshot(readControllerSnapshot()),
    describe: () => traversalCourseDomainKit.describe(readControllerSnapshot())
  };
  document.body.dataset.thirdPersonTraversalCourse = 'ready';
}

function tickTraversalCourse() {
  const current = describeCurrent();
  renderTraversalCourse(current.traversalDescription);
  installGameHost(current);
  requestAnimationFrame(tickTraversalCourse);
}

requestAnimationFrame(tickTraversalCourse);

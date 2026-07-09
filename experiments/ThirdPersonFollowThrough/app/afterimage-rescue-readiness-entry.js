import * as NexusEngineRuntime from 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
import { createThirdPersonAfterimageRescueReadinessDomainKit } from '../kits/third-person-afterimage-rescue-readiness-domain-kit.js';

const NEXUS_ENGINE_CDN = 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
const afterimageRescueDomainKit = createThirdPersonAfterimageRescueReadinessDomainKit();
let overlay;
let style;

function ensureOverlay() {
  if (!style) {
    style = document.createElement('style');
    style.dataset.thirdPersonAfterimageRescue = 'true';
    style.textContent = `.afterimage-rescue-overlay{position:fixed;inset:0;z-index:1;pointer-events:none;overflow:hidden;font-family:Inter,system-ui,sans-serif;color:white}.afterimage-echo,.landing-dust,.rescue-flare,.rope-swing,.signal-drone{position:absolute;left:var(--x);top:var(--z);transform:translate(-50%,-50%)}.afterimage-echo{width:calc(22px + var(--s)*24px);height:calc(34px + var(--s)*28px);border-radius:999px 999px 14px 14px;border:1px solid rgba(154,220,255,var(--c));background:linear-gradient(180deg,rgba(113,201,255,calc(var(--c)*.22)),rgba(92,130,255,calc(var(--c)*.08)));box-shadow:0 0 calc(10px + var(--c)*28px) rgba(92,180,255,.28);opacity:calc(.18 + var(--c)*.7);transform:translate(-50%,-78%)}.landing-dust{width:calc(18px + var(--r)*16px);height:calc(10px + var(--r)*10px);border-radius:999px;background:rgba(240,216,166,calc(var(--d)*.25));box-shadow:0 0 calc(10px + var(--d)*20px) rgba(245,208,128,.26)}.rescue-flare{width:calc(16px + var(--v)*30px);height:calc(16px + var(--v)*30px);border-radius:999px;border:2px solid rgba(255,116,86,var(--v));background:radial-gradient(circle,rgba(255,211,130,calc(var(--v)*.38)),rgba(255,82,70,calc(var(--v)*.12)) 56%,transparent 70%);box-shadow:0 0 calc(20px + var(--v)*38px) rgba(255,95,70,.36)}.rescue-flare.visible-flare{border-color:rgba(255,232,146,var(--v))}.rope-swing{width:calc(60px + var(--span)*8px);height:calc(32px + var(--t)*30px);border-top:3px solid rgba(210,170,255,calc(.22 + var(--t)*.62));border-radius:999px 999px 0 0;transform:translate(-50%,-90%) rotate(-7deg);filter:drop-shadow(0 0 12px rgba(170,130,255,.28))}.signal-drone{width:calc(18px + var(--lock)*28px);height:calc(18px + var(--lock)*28px);border-radius:12px;border:1px solid rgba(126,255,213,calc(.3 + var(--lock)*.5));background:rgba(78,255,202,calc(.08 + var(--lock)*.12));box-shadow:0 0 calc(18px + var(--rotor)*32px) rgba(88,255,211,.34);transform:translate(-50%,-50%) rotate(45deg)}.afterimage-stack{position:fixed;right:22px;bottom:22px;display:flex;flex-direction:column;gap:8px;z-index:3;align-items:flex-end}.afterimage-summary,.afterimage-chip{border:1px solid rgba(255,255,255,.2);border-radius:14px;padding:7px 11px;background:rgba(4,8,18,.76);backdrop-filter:blur(10px);font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.afterimage-summary{color:#eaf9ff}.afterimage-chip.extraction-ready{border-color:rgba(112,255,202,.64);color:#d8fff1}.afterimage-chip.route-forming{border-color:rgba(255,218,118,.66);color:#ffe8aa}.afterimage-chip.needs-readable-motion{border-color:rgba(255,112,132,.68);color:#ffc8d0}@media(max-width:780px){.afterimage-rescue-overlay{display:none}}`;
    document.head.append(style);
  }
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'afterimage-rescue-overlay';
    overlay.dataset.domain = 'third-person-afterimage-rescue-readiness-domain';
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

function screen(position, axis) {
  const value = axis === 'x' ? Number(position?.x ?? 0) : Number(position?.z ?? 0);
  return Math.max(3, Math.min(97, 50 + value * 1.85));
}

function renderAfterimageRescue(description) {
  const target = ensureOverlay();
  const d = description.rendererHandoff.descriptors;
  const s = description.summary;
  target.innerHTML = `
    ${d.afterimageTraces.map((trace) => `<i class="afterimage-echo ${trace.state}" title="${trace.state}" style="--x:${screen(trace.position, 'x')}%;--z:${screen(trace.position, 'z')}%;--s:${trace.scale};--c:${trace.clarity}"></i>`).join('')}
    ${d.landingDustPuffs.map((puff) => `<i class="landing-dust ${puff.state}" title="${puff.state}" style="--x:${screen(puff.center, 'x')}%;--z:${screen(puff.center, 'z')}%;--r:${puff.radius};--d:${puff.density}"></i>`).join('')}
    ${d.rescueFlareWaypoints.map((flare) => `<i class="rescue-flare ${flare.state}" title="${flare.label}" style="--x:${screen(flare.position, 'x')}%;--z:${screen(flare.position, 'z')}%;--v:${flare.visibility}"></i>`).join('')}
    ${d.ropeSwingArcs.map((arc) => `<i class="rope-swing ${arc.state}" title="${arc.label}" style="--x:${screen(arc.center, 'x')}%;--z:${screen(arc.center, 'z')}%;--span:${arc.span};--t:${arc.tension}"></i>`).join('')}
    ${d.signalDrones.map((drone) => `<i class="signal-drone ${drone.state}" title="${drone.label}" style="--x:${screen(drone.position, 'x')}%;--z:${screen(drone.position, 'z')}%;--lock:${drone.lock};--rotor:${drone.rotorPulse}"></i>`).join('')}
    <div class="afterimage-stack"><b class="afterimage-summary">AFTERIMAGE ${Math.round(s.motionClarity * 100)}% · RESCUE ${Math.round(s.rescueReadiness * 100)}% · FATIGUE ${Math.round(s.fatigueRisk * 100)}%</b>${d.dawnRunLedgers.map((ledger) => `<b class="afterimage-chip ${ledger.state}">${ledger.state.replaceAll('-', ' ')} · DRONES ${Math.round(ledger.droneLock * 100)}%</b>`).join('')}</div>`;
}

function composeRendererHandoff(baseHandoff = {}, rescueHandoff) {
  return {
    id: 'third-person-follow-through-afterimage-rescue-composed-renderer-handoff',
    policy: 'renderer-consumes-descriptors-only',
    domains: [...(baseHandoff.domains ?? []), 'third-person-afterimage-rescue-readiness-domain'],
    counts: { ...(baseHandoff.counts ?? {}), afterimageRescue: rescueHandoff.counts },
    descriptors: { ...(baseHandoff.descriptors ?? {}), afterimageRescue: rescueHandoff.descriptors }
  };
}

function describeCurrent() {
  const controllerSnapshot = readControllerSnapshot();
  const afterimageDescription = afterimageRescueDomainKit.describe(controllerSnapshot);
  return { controllerSnapshot, afterimageDescription, rendererHandoff: afterimageDescription.rendererHandoff };
}

function installGameHost(current) {
  const host = globalThis.GameHost ?? {};
  const candidate = host.getRendererHandoff;
  const baseGetter = candidate && candidate.__thirdPersonAfterimageRescueMerged !== true ? candidate.bind(host) : null;
  host.getAfterimageRescueReadiness = () => afterimageRescueDomainKit.snapshot(readControllerSnapshot());
  host.getThirdPersonAfterimageRescueReadiness = () => afterimageRescueDomainKit.snapshot(readControllerSnapshot());
  host.getAfterimageRescueReadinessTree = () => afterimageRescueDomainKit.tree;
  const mergedGetter = () => {
    const base = baseGetter ? baseGetter() : (globalThis.__thirdPersonArenaFractal?.rendererHandoff ?? {});
    const next = afterimageRescueDomainKit.describe(readControllerSnapshot()).rendererHandoff;
    return composeRendererHandoff(base, next);
  };
  mergedGetter.__thirdPersonAfterimageRescueMerged = true;
  host.getRendererHandoff = mergedGetter;
  globalThis.GameHost = host;
  globalThis.__thirdPersonAfterimageRescueReadiness = {
    nexusEngineCdn: NEXUS_ENGINE_CDN,
    nexusEngineExportCount: Object.keys(NexusEngineRuntime).length,
    domainId: afterimageRescueDomainKit.id,
    controllerSnapshot: current.controllerSnapshot,
    counts: current.afterimageDescription.counts,
    summary: current.afterimageDescription.summary,
    rendererHandoff: current.rendererHandoff,
    getState: () => afterimageRescueDomainKit.snapshot(readControllerSnapshot()),
    describe: () => afterimageRescueDomainKit.describe(readControllerSnapshot())
  };
  document.body.dataset.thirdPersonAfterimageRescue = 'ready';
}

function tickAfterimageRescue() {
  const current = describeCurrent();
  renderAfterimageRescue(current.afterimageDescription);
  installGameHost(current);
  requestAnimationFrame(tickAfterimageRescue);
}

requestAnimationFrame(tickAfterimageRescue);

import * as NexusEngineRuntime from 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
import { createThirdPersonNavigationChallengeReadinessDomainKit } from '../kits/third-person-navigation-challenge-readiness-domain-kit.js';

const NEXUS_ENGINE_CDN = 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
const navigationChallengeDomainKit = createThirdPersonNavigationChallengeReadinessDomainKit();
let overlay;
let style;

function ensureOverlay() {
  if (!style) {
    style = document.createElement('style');
    style.dataset.thirdPersonNavigationChallenge = 'true';
    style.textContent = `
      .navigation-challenge-overlay{position:fixed;inset:0;z-index:1;pointer-events:none;overflow:hidden;font-family:Inter,system-ui,sans-serif;color:#fff}.nav-checkpoint{position:absolute;left:var(--x);top:var(--z);width:var(--d);height:var(--d);border-radius:999px;border:2px solid rgba(128,255,218,var(--o));background:rgba(58,255,181,calc(var(--o)*.08));box-shadow:0 0 24px rgba(60,255,170,.32);transform:translate(-50%,-50%) rotateX(66deg)}.nav-checkpoint.complete{border-color:rgba(255,255,255,.22);background:rgba(255,255,255,.04)}.nav-checkpoint.next{border-color:rgba(255,230,126,.88);background:rgba(255,220,90,.14);box-shadow:0 0 34px rgba(255,220,90,.48)}.turn-wedge{position:absolute;left:var(--x);top:var(--z);width:72px;height:36px;border-radius:8px 999px 999px 8px;clip-path:polygon(0 50%,100% 0,100% 100%);border:1px solid rgba(124,199,255,var(--o));background:rgba(53,153,255,calc(var(--o)*.12));box-shadow:0 0 18px rgba(77,166,255,.3);transform:translate(-50%,-50%) rotate(var(--yaw))}.turn-wedge.misaligned{border-color:rgba(255,88,116,var(--o));background:rgba(255,88,116,calc(var(--o)*.13))}.turn-wedge.negotiating{border-color:rgba(255,214,112,var(--o));background:rgba(255,214,112,calc(var(--o)*.13))}.vault-window{position:absolute;left:var(--x);top:var(--z);width:var(--d);height:calc(var(--d)*.42);border-radius:999px;border:1px solid rgba(220,238,255,var(--o));box-shadow:0 0 20px rgba(220,238,255,.34);transform:translate(-50%,-50%) rotateX(62deg)}.vault-window.available,.vault-window.airborne-rise{border-color:rgba(132,255,194,var(--o));background:rgba(132,255,194,calc(var(--o)*.1))}.vault-window.airborne-fall{border-color:rgba(255,155,106,var(--o));background:rgba(255,155,106,calc(var(--o)*.1))}.recovery-pocket{position:absolute;left:var(--x);top:var(--z);width:var(--d);height:var(--d);border-radius:999px;border:1px dashed rgba(171,235,255,var(--o));background:rgba(92,190,255,calc(var(--o)*.07));transform:translate(-50%,-50%) rotateX(66deg)}.recovery-pocket.safe{border-style:solid;border-color:rgba(88,255,182,var(--o));background:rgba(88,255,182,calc(var(--o)*.1))}.recovery-pocket.thin{border-color:rgba(255,120,120,var(--o));background:rgba(255,120,120,calc(var(--o)*.08))}.finish-beacon{position:absolute;left:var(--x);top:var(--z);width:88px;height:88px;border-radius:999px;border:2px solid rgba(255,255,255,var(--o));background:radial-gradient(circle,rgba(255,255,255,calc(var(--o)*.2)),rgba(90,180,255,calc(var(--o)*.06)) 58%,transparent 60%);box-shadow:0 0 34px rgba(255,255,255,.36);transform:translate(-50%,-50%)}.finish-beacon.commit{border-color:rgba(110,255,190,var(--o));box-shadow:0 0 42px rgba(110,255,190,.5)}.finish-beacon.prepare{border-color:rgba(255,225,126,var(--o))}.nav-score-stack{position:fixed;right:22px;bottom:22px;display:flex;flex-direction:column;gap:8px;align-items:flex-end}.sync-meter{min-width:186px;border:1px solid rgba(255,255,255,.22);border-radius:999px;padding:7px 11px;background:rgba(6,10,20,.72);backdrop-filter:blur(10px);font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;opacity:var(--o)}.sync-meter.synced{border-color:rgba(92,255,190,.76);color:#cdffec}.sync-meter.recovering{border-color:rgba(255,220,112,.76);color:#ffe7a0}.sync-meter.split{border-color:rgba(255,104,130,.82);color:#ffc8d0}.nav-summary{border:1px solid rgba(255,255,255,.2);border-radius:14px;padding:9px 12px;background:rgba(3,8,18,.78);font-size:12px;font-weight:800;color:#dfefff;box-shadow:inset 0 1px rgba(255,255,255,.11)}@media(max-width:780px){.navigation-challenge-overlay{display:none}}`;
    document.head.append(style);
  }
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'navigation-challenge-overlay';
    overlay.dataset.domain = 'third-person-navigation-challenge-readiness-domain';
    overlay.dataset.rendererConsumes = 'descriptors-only';
    document.body.append(overlay);
  }
  return overlay;
}

function readControllerSnapshot() {
  return globalThis.__thirdPersonFollowThrough ?? {
    targetPosition: [0, 0, 8],
    cameraPosition: [0, 3.2, 15],
    cameraPivotWorld: [0, 1.45, 8],
    headWorld: [0, 1.6, 8],
    lookAheadWorld: [0, 1.6, 5.6],
    movementBasisForwardWorld: [0, 0, -1],
    actorForwardWorld: [0, 0, -1],
    cameraForwardWorld: [0, 0, -1],
    movementWishWorld: [0, 0, 0],
    colliderCount: 6,
    grounded: true,
    debugVisible: true
  };
}

function worldToScreenPercent(position, axis) {
  const value = axis === 'x' ? Number(position?.x ?? 0) : Number(position?.z ?? 0);
  return Math.max(3, Math.min(97, 50 + value * 1.85));
}

function renderNavigationChallenge(description) {
  const target = ensureOverlay();
  const descriptors = description.rendererHandoff.descriptors;
  const summary = description.summary;
  target.innerHTML = `
    <div class="nav-checkpoints">
      ${descriptors.checkpointThreads.map((thread) => `<i class="nav-checkpoint ${thread.state}" title="${thread.label}" style="--x:${worldToScreenPercent(thread.position, 'x')}%;--z:${worldToScreenPercent(thread.position, 'z')}%;--d:${thread.radius * 14}px;--o:${thread.opacity}"></i>`).join('')}
    </div>
    <div class="turn-wedges">
      ${descriptors.turnCommitmentWedges.map((wedge) => `<i class="turn-wedge ${wedge.state}" title="${wedge.checkpointId}" style="--x:${worldToScreenPercent(wedge.anchor, 'x')}%;--z:${worldToScreenPercent(wedge.anchor, 'z')}%;--yaw:${wedge.targetYawDeg}deg;--o:${wedge.opacity}"></i>`).join('')}
    </div>
    <div class="vault-windows">
      ${descriptors.vaultWindowArcs.map((arc) => `<i class="vault-window ${arc.state}" title="${arc.label}" style="--x:${worldToScreenPercent(arc.center, 'x')}%;--z:${worldToScreenPercent(arc.center, 'z')}%;--d:${arc.radius * 13}px;--o:${arc.opacity}"></i>`).join('')}
    </div>
    <div class="recovery-pockets">
      ${descriptors.recoveryPockets.map((pocket) => `<i class="recovery-pocket ${pocket.state}" title="${pocket.pocketId}" style="--x:${worldToScreenPercent(pocket.center, 'x')}%;--z:${worldToScreenPercent(pocket.center, 'z')}%;--d:${pocket.radius * 13}px;--o:${pocket.opacity}"></i>`).join('')}
    </div>
    <div class="finish-beacons">
      ${descriptors.finishCommitmentBeacons.map((beacon) => `<i class="finish-beacon ${beacon.state}" title="finish ${beacon.state}" style="--x:${worldToScreenPercent(beacon.center, 'x')}%;--z:${worldToScreenPercent(beacon.center, 'z')}%;--o:${beacon.opacity}"></i>`).join('')}
    </div>
    <div class="nav-score-stack">
      <b class="nav-summary">NEXT ${summary.nextCheckpoint} · FINISH ${Math.round(summary.finishReadiness * 100)}%</b>
      ${descriptors.cameraActorSyncMeters.map((meter) => `<b class="sync-meter ${meter.state}" style="--o:${meter.opacity}">SYNC ${meter.index + 1}/5 · ${meter.state}</b>`).join('')}
    </div>`;
}

function composeRendererHandoff(baseHandoff = {}, navigationHandoff) {
  return {
    id: 'third-person-follow-through-navigation-composed-renderer-handoff',
    policy: 'renderer-consumes-descriptors-only',
    domains: [...(baseHandoff.domains ?? []), 'third-person-navigation-challenge-readiness-domain'],
    counts: { ...(baseHandoff.counts ?? {}), navigationChallenge: navigationHandoff.counts },
    descriptors: { ...(baseHandoff.descriptors ?? {}), navigationChallenge: navigationHandoff.descriptors }
  };
}

function describeCurrent() {
  const controllerSnapshot = readControllerSnapshot();
  const navigationChallengeDescription = navigationChallengeDomainKit.describe(controllerSnapshot);
  return { controllerSnapshot, navigationChallengeDescription, rendererHandoff: navigationChallengeDescription.rendererHandoff };
}

function installGameHost(current) {
  const host = globalThis.GameHost ?? {};
  const candidate = host.getRendererHandoff;
  const baseGetter = candidate && candidate.__thirdPersonNavigationChallengeMerged !== true ? candidate.bind(host) : null;
  host.getNavigationChallengeReadiness = () => navigationChallengeDomainKit.snapshot(readControllerSnapshot());
  host.getThirdPersonNavigationChallengeReadiness = () => navigationChallengeDomainKit.snapshot(readControllerSnapshot());
  const mergedGetter = () => {
    const base = baseGetter ? baseGetter() : (globalThis.__thirdPersonArenaFractal?.rendererHandoff ?? {});
    const next = navigationChallengeDomainKit.describe(readControllerSnapshot()).rendererHandoff;
    return composeRendererHandoff(base, next);
  };
  mergedGetter.__thirdPersonNavigationChallengeMerged = true;
  host.getRendererHandoff = mergedGetter;
  globalThis.GameHost = host;
  globalThis.__thirdPersonNavigationChallenge = {
    nexusEngineCdn: NEXUS_ENGINE_CDN,
    nexusEngineExportCount: Object.keys(NexusEngineRuntime).length,
    domainId: navigationChallengeDomainKit.id,
    controllerSnapshot: current.controllerSnapshot,
    counts: current.navigationChallengeDescription.counts,
    summary: current.navigationChallengeDescription.summary,
    rendererHandoff: composeRendererHandoff(globalThis.__thirdPersonArenaFractal?.rendererHandoff ?? {}, current.rendererHandoff),
    navigationRendererHandoff: current.rendererHandoff,
    getState: () => navigationChallengeDomainKit.snapshot(readControllerSnapshot()),
    describe: () => navigationChallengeDomainKit.describe(readControllerSnapshot())
  };
}

function tickNavigationChallenge() {
  const current = describeCurrent();
  renderNavigationChallenge(current.navigationChallengeDescription);
  installGameHost(current);
  requestAnimationFrame(tickNavigationChallenge);
}

requestAnimationFrame(tickNavigationChallenge);

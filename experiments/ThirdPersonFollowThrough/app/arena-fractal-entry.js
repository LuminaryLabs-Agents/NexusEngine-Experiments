import * as NexusEngineRuntime from 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
import '../app.js?v=arena-fractal-v1';
import { createThirdPersonArenaFractalDomainKit } from '../kits/third-person-arena-fractal-domain-kit.js';

const NEXUS_ENGINE_CDN = 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
const arenaFractalDomainKit = createThirdPersonArenaFractalDomainKit();
let overlay;
let style;

function ensureOverlay() {
  if (!style) {
    style = document.createElement('style');
    style.dataset.thirdPersonArenaFractal = 'true';
    style.textContent = `
      .arena-fractal-overlay{position:fixed;inset:0;pointer-events:none;z-index:1;overflow:hidden;font-family:Inter,system-ui,sans-serif;color:white}.arena-band{position:absolute;left:var(--x);top:var(--z);width:var(--d);height:var(--d);border:1px solid rgba(120,210,255,var(--o));border-radius:999px;transform:translate(-50%,-50%) rotateX(66deg);box-shadow:0 0 22px rgba(120,210,255,.2);opacity:var(--o)}.movement-trail{position:absolute;left:var(--x);top:var(--z);width:calc(24px * var(--s));height:calc(12px * var(--s));border-radius:999px;background:rgba(80,255,150,var(--o));box-shadow:0 0 18px rgba(80,255,150,.45);transform:translate(-50%,-50%) rotate(var(--yaw))}.camera-arc{position:absolute;right:calc(18px + var(--i) * 12px);bottom:calc(122px + var(--i) * 18px);width:calc(80px + var(--i) * 22px);height:calc(80px + var(--i) * 22px);border-radius:999px;border:2px solid rgba(54,162,255,var(--o));border-left-color:transparent;border-bottom-color:transparent;filter:drop-shadow(0 0 10px rgba(54,162,255,.3));transform:rotate(calc(var(--side) * 24deg))}.camera-arc.engaged{border-top-color:#fff;border-right-color:#28a4ff}.collider-halo{position:absolute;left:var(--x);top:var(--z);width:var(--d);height:var(--d);border-radius:999px;transform:translate(-50%,-50%) rotateX(66deg);border:1px solid rgba(255,194,80,.28);background:rgba(255,194,80,calc(var(--risk) * .08));box-shadow:0 0 calc(16px + var(--risk) * 34px) rgba(255,132,48,.32)}.collider-halo.near{border-color:rgba(255,80,80,.75);background:rgba(255,80,80,.1)}.rig-bead{position:absolute;left:var(--x);top:var(--y);width:calc(10px + var(--i) * 4px);height:calc(10px + var(--i) * 4px);border-radius:999px;background:#ffffffdd;box-shadow:0 0 16px #ffffff88;transform:translate(-50%,-50%)}.cue-stack{position:fixed;left:24px;bottom:22px;display:flex;flex-wrap:wrap;gap:8px;max-width:min(620px,calc(100vw - 48px))}.cue-chip{border:1px solid rgba(255,255,255,.22);border-radius:999px;padding:7px 10px;background:rgba(4,9,18,.72);backdrop-filter:blur(10px);box-shadow:inset 0 1px rgba(255,255,255,.12);font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;opacity:var(--o)}.cue-chip.handoff{border-color:rgba(40,164,255,.72);color:#bde3ff}.cue-chip.airborne{border-color:rgba(255,255,255,.72);color:#fff}.cue-chip.collision{border-color:rgba(255,194,80,.65);color:#ffe3a2}.cue-chip.idle{color:#cfe0ff}@media(max-width:780px){.arena-fractal-overlay{display:none}}`;
    document.head.append(style);
  }
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'arena-fractal-overlay';
    overlay.dataset.domain = 'third-person-arena-fractal-domain';
    document.body.append(overlay);
  }
  return overlay;
}

function worldToScreenPercent(position, axis) {
  const value = axis === 'x' ? Number(position?.x ?? 0) : Number(position?.z ?? 0);
  return Math.max(3, Math.min(97, 50 + value * 1.85));
}

function headToScreenPercent(position, axis) {
  const value = axis === 'x' ? Number(position?.x ?? 0) : Number(position?.y ?? 1.6);
  return axis === 'x' ? Math.max(5, Math.min(95, 50 + value * 2.3)) : Math.max(14, Math.min(78, 58 - value * 12));
}

function renderArenaFractal(description) {
  const target = ensureOverlay();
  const descriptors = description.rendererHandoff.descriptors;
  target.innerHTML = `
    <div class="arena-bands">
      ${descriptors.surfaceBands.map((band) => `<i class="arena-band" style="--x:${worldToScreenPercent(band.center, 'x')}%;--z:${worldToScreenPercent(band.center, 'z')}%;--d:${band.radius * 16}px;--o:${band.opacity}"></i>`).join('')}
    </div>
    <div class="movement-trails">
      ${descriptors.movementTrails.map((trail) => `<i class="movement-trail" style="--x:${worldToScreenPercent(trail.position, 'x')}%;--z:${worldToScreenPercent(trail.position, 'z')}%;--s:${trail.scale};--o:${trail.opacity};--yaw:${trail.movementYawDeg}deg"></i>`).join('')}
    </div>
    <div class="camera-arcs">
      ${descriptors.cameraHandoffArcs.map((arc) => `<i class="camera-arc ${arc.engaged ? 'engaged' : ''}" style="--i:${arc.index};--o:${arc.opacity};--side:${arc.side === 'left' ? -1 : 1}"></i>`).join('')}
    </div>
    <div class="collider-halos">
      ${descriptors.colliderHalos.map((halo) => `<i class="collider-halo ${halo.state}" title="${halo.obstacleId}" style="--x:${worldToScreenPercent(halo.position, 'x')}%;--z:${worldToScreenPercent(halo.position, 'z')}%;--d:${halo.radius * 13}px;--risk:${halo.risk}"></i>`).join('')}
    </div>
    <div class="rig-spine">
      ${descriptors.rigMetricSpine.map((bead) => `<i class="rig-bead" style="--x:${headToScreenPercent(bead.position, 'x')}%;--y:${headToScreenPercent(bead.position, 'y')}%;--i:${bead.index}"></i>`).join('')}
    </div>
    <div class="cue-stack">
      ${descriptors.trainingCues.map((cue) => `<b class="cue-chip ${cue.state}" style="--o:${cue.opacity}">${cue.label}</b>`).join('')}
    </div>`;
}

function readControllerSnapshot() {
  return globalThis.__thirdPersonFollowThrough ?? {
    targetPosition: [0, 0, 8],
    cameraPosition: [0, 3.2, 15],
    headWorld: [0, 1.6, 8],
    movementBasisForwardWorld: [0, 0, -1],
    actorForwardWorld: [0, 0, -1],
    movementWishWorld: [0, 0, 0],
    colliderCount: 6,
    grounded: true,
    debugVisible: true
  };
}

function tickArenaFractal() {
  const controllerSnapshot = readControllerSnapshot();
  const description = arenaFractalDomainKit.describe(controllerSnapshot);
  renderArenaFractal(description);
  globalThis.__thirdPersonArenaFractal = {
    nexusEngineCdn: NEXUS_ENGINE_CDN,
    nexusEngineExportCount: Object.keys(NexusEngineRuntime).length,
    domainId: arenaFractalDomainKit.id,
    controllerSnapshot,
    counts: description.counts,
    rendererHandoff: description.rendererHandoff,
    getState: () => arenaFractalDomainKit.snapshot(readControllerSnapshot()),
    describe: () => arenaFractalDomainKit.describe(readControllerSnapshot())
  };
  requestAnimationFrame(tickArenaFractal);
}

requestAnimationFrame(tickArenaFractal);

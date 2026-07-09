import 'https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js';
import { createZombieOrchardCiderMillRefugeReadinessDomainKit } from './cider-mill-refuge-readiness-kits.js';

const PASS_ID = 'cider-mill-refuge-readiness-renderer-handoff-pass';
const domain = createZombieOrchardCiderMillRefugeReadinessDomainKit({ seed: 'zombie-orchard-cider-mill-refuge' });
const runtime = { latest: null, frame: 0 };
function readHostState() { try { return globalThis.GameHost?.getState?.() ?? {}; } catch { return {}; } }
function createLayer() {
  const old = document.querySelector('[data-zombie-cider-mill-refuge]');
  if (old) return old;
  const root = document.createElement('section');
  root.dataset.zombieCiderMillRefuge = PASS_ID;
  root.style.cssText = 'position:fixed;left:18px;bottom:42px;z-index:18;width:min(440px,calc(100vw - 36px));padding:14px 16px;border:1px solid rgba(255,185,92,.34);border-radius:18px;background:linear-gradient(180deg,rgba(31,17,10,.84),rgba(12,7,5,.76));box-shadow:0 20px 60px rgba(0,0,0,.45);backdrop-filter:blur(14px);color:#fff7e6;font:12px/1.4 system-ui,sans-serif;pointer-events:none';
  root.innerHTML = `<div style='display:flex;justify-content:space-between;gap:12px;align-items:start'><div><div style='font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#ffbf6e;opacity:.94'>Cider Mill Refuge</div><div data-cider-mill-priority style='font-size:18px;font-weight:950;margin-top:2px;color:#fff'>stock refuge wagons</div></div><div data-cider-mill-score style='font-size:25px;font-weight:950;color:#ffbf6e'>0%</div></div><canvas width='380' height='130' data-cider-mill-map style='display:block;width:100%;height:130px;margin:10px 0 8px;border-radius:14px;background:radial-gradient(circle at 50% 50%,rgba(255,183,92,.17),rgba(90,46,18,.24) 58%,rgba(0,0,0,.30))'></canvas><div data-cider-mill-grid style='display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px'></div>`;
  document.body.append(root);
  return root;
}
function metric(item) { return item.state.output ?? item.state.rationReadiness ?? item.state.lit ?? item.state.integrity ?? item.state.loadingReadiness ?? (1 - item.state.orchardPressure) ?? 0.45; }
function color(item) { return item.kind.includes('press') ? 'rgba(255,187,92,.94)' : item.kind.includes('cellar') ? 'rgba(215,171,112,.88)' : item.kind.includes('lantern') ? 'rgba(255,225,116,.94)' : item.kind.includes('sawbuck') ? 'rgba(255,128,82,.88)' : item.kind.includes('wagon') ? 'rgba(166,255,190,.88)' : 'rgba(255,255,255,.90)'; }
function draw(canvas, readiness) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(255,191,110,.17)';
  ctx.lineWidth = 1;
  for (let ring = 0; ring < 5; ring += 1) { ctx.beginPath(); ctx.ellipse(w / 2, h / 2, 34 + ring * 29, 13 + ring * 11, 0, 0, Math.PI * 2); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,240,205,.95)'; ctx.fillRect(w / 2 - 5, h / 2 - 5, 10, 10);
  for (const item of readiness.rendererHandoff.flatDescriptors) {
    const x = w / 2 + (item.position.x / 96) * w * 0.45;
    const y = h / 2 + (item.position.z / 96) * h * 0.58;
    const r = 3 + metric(item) * 7;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = color(item); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.32)'; ctx.stroke();
  }
}
function render(readiness) {
  const root = createLayer();
  root.querySelector('[data-cider-mill-priority]').textContent = `${readiness.summary.topPriority} · ${readiness.summary.missionState}`;
  root.querySelector('[data-cider-mill-score]').textContent = `${Math.round(readiness.summary.readinessScore * 100)}%`;
  const rows = [['presses', readiness.rendererHandoff.counts.ciderPresses], ['cellars', readiness.rendererHandoff.counts.rootCellarCaches], ['lanterns', readiness.rendererHandoff.counts.millLanternRoutes], ['sawbucks', readiness.rendererHandoff.counts.sawbuckBarricades], ['wagons', readiness.rendererHandoff.counts.refugeeWagons], ['ledger', readiness.rendererHandoff.counts.dawnRefugeLedgers]];
  root.querySelector('[data-cider-mill-grid]').innerHTML = rows.map(([label, value]) => `<div style='border:1px solid rgba(255,191,110,.16);border-radius:10px;padding:7px 8px;background:rgba(255,191,110,.08)'><strong style='font-size:14px;color:#fff'>${value}</strong><span style='margin-left:5px;opacity:.78'>${label}</span></div>`).join('');
  draw(root.querySelector('[data-cider-mill-map]'), readiness);
  document.documentElement.dataset.zombieCiderMillRefugeReadiness = 'active';
  document.body.dataset.zombieCiderMillRefugeReadiness = PASS_ID;
}
function evaluate() { runtime.frame += 1; runtime.latest = domain.compose({ seed: `zombie-orchard-cider-mill-${runtime.frame}`, ...readHostState() }); render(runtime.latest); return runtime.latest; }
function patchGameHost() {
  const old = globalThis.GameHost ?? {};
  if (old.__zombieCiderMillRefugePatched) return;
  const oldHandoff = typeof old.getRendererHandoff === 'function' ? old.getRendererHandoff.bind(old) : () => ({});
  globalThis.GameHost = { ...old, __zombieCiderMillRefugePatched: true, getCiderMillRefugeReadinessDomain: () => domain, getCiderMillRefugeReadiness: () => runtime.latest ?? evaluate(), getZombieOrchardCiderMillRefugeReadiness: () => runtime.latest ?? evaluate(), getCiderMillRefugeReadinessTree: () => domain.domainTree, getRendererHandoff: () => { const base = oldHandoff() ?? {}; const readiness = runtime.latest ?? evaluate(); return { ...base, ciderMillRefugeReadiness: readiness.rendererHandoff, ciderMillRefugeDescriptorCount: readiness.rendererHandoff.counts.total }; } };
}
function step() { patchGameHost(); if (globalThis.GameHost?.getState) evaluate(); }
step();
window.setInterval(step, 2400);

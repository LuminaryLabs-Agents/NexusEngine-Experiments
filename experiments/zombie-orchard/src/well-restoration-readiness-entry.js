import "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createZombieOrchardWellRestorationReadinessDomainKit } from "./well-restoration-readiness-kits.js";

const PASS_ID = "well-restoration-readiness-renderer-handoff-pass";
const domain = createZombieOrchardWellRestorationReadinessDomainKit({ seed: "zombie-orchard-well-restoration" });
const hostState = { latest: null, frame: 0 };

function readHostState() {
  try {
    return globalThis.GameHost?.getState?.() ?? {};
  } catch {
    return {};
  }
}

function createLayer() {
  const existing = document.querySelector("[data-zombie-well-restoration]");
  if (existing) return existing;
  const root = document.createElement("section");
  root.dataset.zombieWellRestoration = PASS_ID;
  root.style.cssText = "position:fixed;left:18px;bottom:18px;z-index:13;width:min(400px,calc(100vw - 36px));padding:14px 16px;border:1px solid rgba(147,218,255,.28);border-radius:18px;background:rgba(5,13,16,.78);box-shadow:0 20px 54px rgba(0,0,0,.38);backdrop-filter:blur(14px);color:#eafaff;font:12px/1.4 system-ui,sans-serif;pointer-events:none";
  root.innerHTML = `
    <div style="display:flex;justify-content:space-between;gap:12px;align-items:start">
      <div>
        <div style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#9ee7ff;opacity:.88">Well Restoration</div>
        <div data-well-priority style="font-size:18px;font-weight:900;margin-top:2px;color:#fff">priming pump</div>
      </div>
      <div data-well-count style="font-weight:950;font-size:24px;color:#9ee7ff">0</div>
    </div>
    <canvas width="360" height="132" data-well-map style="display:block;width:100%;height:132px;margin:10px 0 8px;border-radius:14px;background:radial-gradient(circle at 50% 50%,rgba(122,214,255,.18),rgba(42,105,146,.18) 52%,rgba(0,0,0,.22))"></canvas>
    <div data-well-grid style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px"></div>
  `;
  document.body.append(root);
  return root;
}

function metric(item) {
  return item.state.repairUrgency ?? item.state.routeHeat ?? item.state.contaminationLoad ?? item.state.breachPressure ?? item.state.mistCoverage ?? item.state.rationReadiness ?? 0.45;
}

function drawMap(canvas, readiness) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(170,235,255,.18)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    ctx.ellipse(width / 2, height / 2, 30 + i * 31, 13 + i * 12, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(186,241,255,.9)";
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, 5, 0, Math.PI * 2);
  ctx.fill();
  for (const item of readiness.rendererHandoff.flatDescriptors) {
    const x = width / 2 + (item.position.x / 90) * width * 0.44;
    const y = height / 2 + (item.position.z / 90) * height * 0.54;
    const radius = 3 + metric(item) * 7;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = item.kind.includes("pump") ? "rgba(141,230,255,.92)" : item.kind.includes("bucket") ? "rgba(188,245,216,.88)" : item.kind.includes("still") ? "rgba(255,238,155,.9)" : item.kind.includes("lantern") ? "rgba(255,134,119,.86)" : item.kind.includes("mist") ? "rgba(142,198,255,.88)" : "rgba(255,255,255,.86)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.35)";
    ctx.stroke();
  }
}

function render(readiness) {
  const root = createLayer();
  root.querySelector("[data-well-priority]").textContent = `${readiness.summary.topPriority} ${(readiness.summary.restorationNeed * 100).toFixed(0)}%`;
  root.querySelector("[data-well-count]").textContent = readiness.rendererHandoff.counts.total;
  const rows = [
    ["pumps", readiness.rendererHandoff.counts.wellPumpRepairs],
    ["buckets", readiness.rendererHandoff.counts.bucketBrigadeRoutes],
    ["stills", readiness.rendererHandoff.counts.disinfectantStills],
    ["lanterns", readiness.rendererHandoff.counts.wellBarricadeLanterns],
    ["mist", readiness.rendererHandoff.counts.sprinklerMistGrids],
    ["rations", readiness.rendererHandoff.counts.dawnWaterRationLedgers]
  ];
  root.querySelector("[data-well-grid]").innerHTML = rows.map(([label, value]) => `<div style="border:1px solid rgba(158,231,255,.16);border-radius:10px;padding:7px 8px;background:rgba(122,214,255,.08)"><strong style="font-size:14px;color:#fff">${value}</strong><span style="margin-left:5px;opacity:.78">${label}</span></div>`).join("");
  drawMap(root.querySelector("[data-well-map]"), readiness);
  document.documentElement.dataset.zombieWellRestorationReadiness = "active";
  document.body.dataset.zombieWellRestorationReadiness = PASS_ID;
}

function evaluate() {
  hostState.frame += 1;
  const state = readHostState();
  hostState.latest = domain.compose({ seed: `zombie-orchard-well-${hostState.frame}`, ...state });
  render(hostState.latest);
  return hostState.latest;
}

function patchGameHost() {
  const previousHost = globalThis.GameHost ?? {};
  if (previousHost.__zombieWellRestorationPatched) return;
  const previousRendererHandoff = typeof previousHost.getRendererHandoff === "function" ? previousHost.getRendererHandoff.bind(previousHost) : () => ({});
  globalThis.GameHost = {
    ...previousHost,
    __zombieWellRestorationPatched: true,
    getWellRestorationReadinessDomain: () => domain,
    getWellRestorationReadiness: () => hostState.latest ?? evaluate(),
    getZombieOrchardWellRestorationReadiness: () => hostState.latest ?? evaluate(),
    getWellRestorationReadinessTree: () => domain.domainTree,
    getRendererHandoff: () => {
      const base = previousRendererHandoff() ?? {};
      const readiness = hostState.latest ?? evaluate();
      return {
        ...base,
        wellRestorationReadiness: readiness.rendererHandoff,
        wellRestorationDescriptorCount: readiness.rendererHandoff.counts.total
      };
    }
  };
}

function step() {
  patchGameHost();
  if (globalThis.GameHost?.getState) evaluate();
}

step();
window.setInterval(step, 2800);

import "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createZombieOrchardSafehouseEvacuationReadinessDomainKit } from "./safehouse-evacuation-readiness-kits.js";

const PASS_ID = "safehouse-evacuation-readiness-renderer-handoff-pass";
const domain = createZombieOrchardSafehouseEvacuationReadinessDomainKit({ seed: "zombie-orchard-safehouse-evacuation" });
const hostState = { latest: null, frame: 0 };

function readHostState() {
  try {
    return globalThis.GameHost?.getState?.() ?? {};
  } catch {
    return {};
  }
}

function createLayer() {
  const existing = document.querySelector("[data-zombie-safehouse-evacuation]");
  if (existing) return existing;
  const root = document.createElement("section");
  root.dataset.zombieSafehouseEvacuation = PASS_ID;
  root.style.cssText = "position:fixed;right:18px;bottom:18px;z-index:12;width:min(390px,calc(100vw - 36px));padding:14px 16px;border:1px solid rgba(255,224,170,.28);border-radius:18px;background:rgba(12,11,8,.76);box-shadow:0 20px 54px rgba(0,0,0,.36);backdrop-filter:blur(14px);color:#fff8e8;font:12px/1.4 system-ui,sans-serif;pointer-events:none";
  root.innerHTML = `
    <div style="display:flex;justify-content:space-between;gap:12px;align-items:start">
      <div>
        <div style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#ffd99a;opacity:.86">Safehouse Evacuation</div>
        <div data-safehouse-priority style="font-size:18px;font-weight:900;margin-top:2px;color:#fff">preparing barns</div>
      </div>
      <div data-safehouse-count style="font-weight:950;font-size:24px;color:#ffd99a">0</div>
    </div>
    <canvas width="350" height="132" data-safehouse-map style="display:block;width:100%;height:132px;margin:10px 0 8px;border-radius:14px;background:radial-gradient(circle at 50% 50%,rgba(255,207,124,.16),rgba(158,35,30,.16) 56%,rgba(0,0,0,.2))"></canvas>
    <div data-safehouse-grid style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px"></div>
  `;
  document.body.append(root);
  return root;
}

function metric(item) {
  return item.state.urgency ?? item.state.blockage ?? item.state.reinforcementNeed ?? item.state.routeExposure ?? item.state.harnessReadiness ?? item.state.signalStrength ?? 0.45;
}

function drawMap(canvas, readiness) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(255,232,186,.18)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i += 1) {
    ctx.beginPath();
    ctx.ellipse(width / 2, height / 2, 26 + i * 29, 12 + i * 13, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(255,255,255,.86)";
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, 5, 0, Math.PI * 2);
  ctx.fill();
  for (const item of readiness.rendererHandoff.flatDescriptors) {
    const x = width / 2 + (item.position.x / 90) * width * 0.44;
    const y = height / 2 + (item.position.z / 90) * height * 0.54;
    const radius = 3 + metric(item) * 7;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = item.kind.includes("safehouse") ? "rgba(255,224,137,.92)" : item.kind.includes("lane") ? "rgba(168,235,166,.86)" : item.kind.includes("barricade") ? "rgba(255,116,101,.88)" : item.kind.includes("antidote") ? "rgba(118,223,210,.9)" : item.kind.includes("wagon") ? "rgba(255,178,89,.9)" : "rgba(166,193,255,.88)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.38)";
    ctx.stroke();
  }
}

function render(readiness) {
  const root = createLayer();
  root.querySelector("[data-safehouse-priority]").textContent = `${readiness.summary.topPriority} ${(readiness.summary.evacuationNeed * 100).toFixed(0)}%`;
  root.querySelector("[data-safehouse-count]").textContent = readiness.rendererHandoff.counts.total;
  const rows = [
    ["beacons", readiness.rendererHandoff.counts.safehouseBeacons],
    ["lanes", readiness.rendererHandoff.counts.laneClearances],
    ["walls", readiness.rendererHandoff.counts.barricadeReinforcements],
    ["runners", readiness.rendererHandoff.counts.antidoteRunners],
    ["wagons", readiness.rendererHandoff.counts.dawnWagonRallies],
    ["radio", readiness.rendererHandoff.counts.radioTowerSignals]
  ];
  root.querySelector("[data-safehouse-grid]").innerHTML = rows.map(([label, value]) => `<div style="border:1px solid rgba(255,224,170,.15);border-radius:10px;padding:7px 8px;background:rgba(255,224,170,.08)"><strong style="font-size:14px;color:#fff">${value}</strong><span style="margin-left:5px;opacity:.78">${label}</span></div>`).join("");
  drawMap(root.querySelector("[data-safehouse-map]"), readiness);
  document.documentElement.dataset.zombieSafehouseEvacuationReadiness = "active";
  document.body.dataset.zombieSafehouseEvacuationReadiness = PASS_ID;
}

function evaluate() {
  hostState.frame += 1;
  const state = readHostState();
  hostState.latest = domain.compose({ seed: `zombie-orchard-safehouse-${hostState.frame}`, ...state });
  render(hostState.latest);
  return hostState.latest;
}

function patchGameHost() {
  const previousHost = globalThis.GameHost ?? {};
  if (previousHost.__zombieSafehouseEvacuationPatched) return;
  const previousRendererHandoff = typeof previousHost.getRendererHandoff === "function" ? previousHost.getRendererHandoff.bind(previousHost) : () => ({});
  globalThis.GameHost = {
    ...previousHost,
    __zombieSafehouseEvacuationPatched: true,
    getSafehouseEvacuationReadinessDomain: () => domain,
    getSafehouseEvacuationReadiness: () => hostState.latest ?? evaluate(),
    getZombieOrchardSafehouseEvacuationReadiness: () => hostState.latest ?? evaluate(),
    getSafehouseEvacuationReadinessTree: () => domain.domainTree,
    getRendererHandoff: () => {
      const base = previousRendererHandoff() ?? {};
      const readiness = hostState.latest ?? evaluate();
      return {
        ...base,
        safehouseEvacuationReadiness: readiness.rendererHandoff,
        safehouseEvacuationDescriptorCount: readiness.rendererHandoff.counts.total
      };
    }
  };
}

function step() {
  patchGameHost();
  if (globalThis.GameHost?.getState) evaluate();
}

step();
window.setInterval(step, 2600);

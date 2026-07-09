import "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createZombieOrchardAntiserumWellhouseReadinessDomainKit } from "./antiserum-wellhouse-readiness-kits.js";

const PASS_ID = "antiserum-wellhouse-readiness-renderer-handoff-pass";
const domain = createZombieOrchardAntiserumWellhouseReadinessDomainKit({ seed: "zombie-orchard-antiserum-wellhouse" });
const hostState = { latest: null, frame: 0 };

function readHostState() {
  try {
    return globalThis.GameHost?.getState?.() ?? {};
  } catch {
    return {};
  }
}

function createLayer() {
  const existing = document.querySelector("[data-zombie-antiserum-wellhouse]");
  if (existing) return existing;
  const root = document.createElement("section");
  root.dataset.zombieAntiserumWellhouse = PASS_ID;
  root.style.cssText = "position:fixed;right:18px;top:18px;z-index:15;width:min(420px,calc(100vw - 36px));padding:14px 16px;border:1px solid rgba(156,255,196,.28);border-radius:18px;background:rgba(6,18,12,.78);box-shadow:0 20px 54px rgba(0,0,0,.42);backdrop-filter:blur(14px);color:#efffee;font:12px/1.4 system-ui,sans-serif;pointer-events:none";
  root.innerHTML = `
    <div style="display:flex;justify-content:space-between;gap:12px;align-items:start">
      <div>
        <div style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#9cffc4;opacity:.92">Antiserum Wellhouse</div>
        <div data-antiserum-priority style="font-size:18px;font-weight:900;margin-top:2px;color:#fff">gather reagents</div>
      </div>
      <div data-antiserum-score style="font-weight:950;font-size:24px;color:#9cffc4">0%</div>
    </div>
    <canvas width="360" height="128" data-antiserum-map style="display:block;width:100%;height:128px;margin:10px 0 8px;border-radius:14px;background:radial-gradient(circle at 45% 50%,rgba(156,255,196,.17),rgba(29,89,58,.22) 54%,rgba(0,0,0,.26))"></canvas>
    <div data-antiserum-grid style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px"></div>
  `;
  document.body.append(root);
  return root;
}

function metric(item) {
  return item.state.potency ?? item.state.distillatePurity ?? item.state.biteSeverity ?? item.state.sampleIntegrity ?? item.state.routeClarity ?? item.state.wellhouseIntegrity ?? 0.45;
}

function drawMap(canvas, readiness) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(156,255,196,.15)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i += 1) {
    ctx.beginPath();
    ctx.ellipse(width / 2, height / 2, 24 + i * 29, 10 + i * 10, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(228,255,236,.96)";
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, 5, 0, Math.PI * 2);
  ctx.fill();
  for (const item of readiness.rendererHandoff.flatDescriptors) {
    const x = width / 2 + (item.position.x / 96) * width * 0.44;
    const y = height / 2 + (item.position.z / 96) * height * 0.54;
    const radius = 3 + metric(item) * 7;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = item.kind.includes("mortar") ? "rgba(156,255,196,.9)" : item.kind.includes("still") ? "rgba(124,222,255,.86)" : item.kind.includes("triage") ? "rgba(255,146,132,.84)" : item.kind.includes("sample") ? "rgba(202,164,255,.84)" : item.kind.includes("raven") ? "rgba(255,236,142,.84)" : "rgba(255,255,255,.88)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.34)";
    ctx.stroke();
  }
}

function render(readiness) {
  const root = createLayer();
  root.querySelector("[data-antiserum-priority]").textContent = `${readiness.summary.topPriority} · ${readiness.summary.missionState}`;
  root.querySelector("[data-antiserum-score]").textContent = `${Math.round(readiness.summary.readinessScore * 100)}%`;
  const rows = [
    ["mortars", readiness.rendererHandoff.counts.herbalAntiserumMortars],
    ["stills", readiness.rendererHandoff.counts.moonwaterStills],
    ["cots", readiness.rendererHandoff.counts.biteTriageCots],
    ["samples", readiness.rendererHandoff.counts.bloodSampleFlags],
    ["ravens", readiness.rendererHandoff.counts.ravenCourierVials],
    ["ledger", readiness.rendererHandoff.counts.dawnAntiserumLedgers]
  ];
  root.querySelector("[data-antiserum-grid]").innerHTML = rows.map(([label, value]) => `<div style="border:1px solid rgba(156,255,196,.16);border-radius:10px;padding:7px 8px;background:rgba(156,255,196,.08)"><strong style="font-size:14px;color:#fff">${value}</strong><span style="margin-left:5px;opacity:.78">${label}</span></div>`).join("");
  drawMap(root.querySelector("[data-antiserum-map]"), readiness);
  document.documentElement.dataset.zombieAntiserumWellhouseReadiness = "active";
  document.body.dataset.zombieAntiserumWellhouseReadiness = PASS_ID;
}

function evaluate() {
  hostState.frame += 1;
  const state = readHostState();
  hostState.latest = domain.compose({ seed: `zombie-orchard-antiserum-${hostState.frame}`, ...state });
  render(hostState.latest);
  return hostState.latest;
}

function patchGameHost() {
  const previousHost = globalThis.GameHost ?? {};
  if (previousHost.__zombieAntiserumWellhousePatched) return;
  const previousRendererHandoff = typeof previousHost.getRendererHandoff === "function" ? previousHost.getRendererHandoff.bind(previousHost) : () => ({});
  globalThis.GameHost = {
    ...previousHost,
    __zombieAntiserumWellhousePatched: true,
    getAntiserumWellhouseReadinessDomain: () => domain,
    getAntiserumWellhouseReadiness: () => hostState.latest ?? evaluate(),
    getZombieOrchardAntiserumWellhouseReadiness: () => hostState.latest ?? evaluate(),
    getAntiserumWellhouseReadinessTree: () => domain.domainTree,
    getRendererHandoff: () => {
      const base = previousRendererHandoff() ?? {};
      const readiness = hostState.latest ?? evaluate();
      return {
        ...base,
        antiserumWellhouseReadiness: readiness.rendererHandoff,
        antiserumWellhouseDescriptorCount: readiness.rendererHandoff.counts.total
      };
    }
  };
}

function step() {
  patchGameHost();
  if (globalThis.GameHost?.getState) evaluate();
}

step();
window.setInterval(step, 2400);

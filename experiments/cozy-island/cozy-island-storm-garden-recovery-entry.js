import "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createCozyIslandStormGardenRecoveryReadinessDomainKit } from "./cozy-island-storm-garden-recovery-kits.js";

const PASS_ID = "storm-garden-recovery-readiness-renderer-handoff-pass";
const domain = createCozyIslandStormGardenRecoveryReadinessDomainKit({ seed: "cozy-island-storm-garden-recovery" });
const hostState = { latest: null, frame: 0 };

function clamp01(value) {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function sampleSnapshot() {
  const now = Date.now() * 0.001;
  return {
    seed: "cozy-island-storm-garden-recovery",
    stormDamage: clamp01(0.46 + Math.sin(now * 0.023 + 1.7) * 0.3),
    rainfall: clamp01(0.52 + Math.sin(now * 0.019 + 2.4) * 0.32),
    freshwater: clamp01(0.38 + Math.sin(now * 0.017 + 0.8) * 0.28),
    injuries: 2 + Math.round(clamp01(Math.sin(now * 0.015 + 1.2) * 0.5 + 0.5) * 6),
    herbCoverage: clamp01(0.42 + Math.sin(now * 0.021 + 0.5) * 0.3),
    coconutStock: 3 + Math.round(clamp01(Math.sin(now * 0.018 + 2.1) * 0.5 + 0.5) * 7),
    tide: clamp01(0.48 + Math.sin(now * 0.016 + 0.6) * 0.3),
    wind: { x: Math.cos(now * 0.027) * 0.44, y: 0, z: Math.sin(now * 0.025) * 0.36 },
    camp: { x: 6, y: 0.2, z: -8 },
    lagoonRadius: 56,
    beachRadius: 78
  };
}

function createLayer() {
  if (document.querySelector("[data-cozy-storm-garden-recovery]")) return document.querySelector("[data-cozy-storm-garden-recovery]");
  const root = document.createElement("section");
  root.dataset.cozyStormGardenRecovery = PASS_ID;
  root.style.cssText = "position:fixed;right:18px;bottom:18px;z-index:12;width:min(390px,calc(100vw - 36px));padding:14px 16px;border:1px solid rgba(255,255,255,.26);border-radius:20px;background:rgba(20,48,35,.76);backdrop-filter:blur(12px);box-shadow:0 18px 44px rgba(0,0,0,.24);color:#fff;font:12px/1.4 system-ui,sans-serif;pointer-events:none";
  root.innerHTML = `
    <div style="display:flex;justify-content:space-between;gap:12px;align-items:start">
      <div>
        <div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;opacity:.72">Storm Garden Recovery</div>
        <div data-storm-summary style="font-size:18px;font-weight:850;margin-top:2px">triaging island clinic</div>
      </div>
      <div data-storm-count style="font-weight:900;font-size:22px">0</div>
    </div>
    <canvas width="348" height="126" data-storm-canvas style="display:block;width:100%;height:126px;margin:10px 0 8px;border-radius:15px;background:radial-gradient(circle at 50% 20%,rgba(171,255,167,.20),rgba(255,255,255,.06) 58%,rgba(255,255,255,.02))"></canvas>
    <div data-storm-grid style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px"></div>
  `;
  document.body.append(root);
  return root;
}

function descriptorMetric(item) {
  return item.state.catchmentPriority ?? item.state.salinityDrop ?? item.state.healingYield ?? item.state.triagePriority ?? item.state.chimeStrength ?? item.state.readiness ?? 0.45;
}

function drawCanvas(canvas, readiness) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(255,255,255,.18)";
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2 + 10, 42 + i * 28, 14 + i * 11, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  readiness.rendererHandoff.descriptors.forEach((item, index) => {
    const px = w / 2 + (item.position.x / 96) * w * 0.44;
    const py = h / 2 + (item.position.z / 96) * h * 0.58;
    const size = 3.5 + descriptorMetric(item) * 7.2;
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fillStyle = item.kind.includes("cistern") ? "rgba(139,220,255,.94)" : item.kind.includes("filter") ? "rgba(255,225,154,.9)" : item.kind.includes("herb") ? "rgba(147,255,148,.9)" : item.kind.includes("splint") ? "rgba(255,194,128,.88)" : item.kind.includes("shell") ? "rgba(255,255,255,.86)" : "rgba(212,255,205,.95)";
    ctx.fill();
    if (index % 3 === 0) {
      ctx.strokeStyle = "rgba(255,255,255,.45)";
      ctx.stroke();
    }
  });
}

function render(readiness) {
  const root = createLayer();
  root.querySelector("[data-storm-summary]").textContent = `${readiness.summary.topConcern} need ${(readiness.summary.recoveryNeed * 100).toFixed(0)}%`;
  root.querySelector("[data-storm-count]").textContent = readiness.rendererHandoff.counts.total;
  const rows = [
    ["cisterns", readiness.rendererHandoff.counts.rainCisternGrids],
    ["filters", readiness.rendererHandoff.counts.coconutFilterBeds],
    ["herbs", readiness.rendererHandoff.counts.medicinalHerbNurseries],
    ["splints", readiness.rendererHandoff.counts.driftwoodSplintRacks],
    ["shells", readiness.rendererHandoff.counts.shellWindWarnings],
    ["ledger", readiness.rendererHandoff.counts.dawnClinicLedgers]
  ];
  root.querySelector("[data-storm-grid]").innerHTML = rows.map(([label, value]) => `<div style="border:1px solid rgba(255,255,255,.16);border-radius:10px;padding:7px 8px;background:rgba(255,255,255,.08)"><strong style="font-size:14px">${value}</strong><span style="margin-left:5px;opacity:.76">${label}</span></div>`).join("");
  drawCanvas(root.querySelector("[data-storm-canvas]"), readiness);
  document.body.dataset.cozyStormGardenRecoveryReadiness = PASS_ID;
}

function evaluate() {
  hostState.frame += 1;
  hostState.latest = domain.evaluate(sampleSnapshot());
  render(hostState.latest);
  return hostState.latest;
}

function patchGameHost() {
  const previousHost = window.GameHost ?? {};
  if (previousHost.__cozyStormGardenRecoveryPatched) return;
  const previousRendererHandoff = typeof previousHost.getRendererHandoff === "function" ? previousHost.getRendererHandoff.bind(previousHost) : () => ({});
  window.GameHost = {
    ...previousHost,
    __cozyStormGardenRecoveryPatched: true,
    getStormGardenRecoveryReadinessDomain: () => domain,
    getStormGardenRecoveryReadiness: () => hostState.latest ?? evaluate(),
    getCozyIslandStormGardenRecoveryReadiness: () => hostState.latest ?? evaluate(),
    getStormGardenRecoveryReadinessTree: () => domain.domainTree,
    getRendererHandoff: () => {
      const base = previousRendererHandoff() ?? {};
      const readiness = hostState.latest ?? evaluate();
      return {
        ...base,
        stormGardenRecoveryReadiness: readiness.rendererHandoff,
        stormGardenRecoveryDescriptorCount: readiness.rendererHandoff.counts.total
      };
    }
  };
}

patchGameHost();
evaluate();
window.setInterval(() => {
  patchGameHost();
  evaluate();
}, 3600);

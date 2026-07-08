import "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createCozyIslandTidepoolConservatoryReadinessDomainKit } from "./cozy-island-tidepool-conservatory-kits.js";

const PASS_ID = "tidepool-conservatory-readiness-renderer-handoff-pass";
const domain = createCozyIslandTidepoolConservatoryReadinessDomainKit({ seed: "cozy-island-tidepool-conservatory" });
const hostState = {
  latest: null,
  frame: 0
};

function clamp01(value) {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function sampleSnapshot() {
  const now = Date.now() * 0.001;
  return {
    seed: "cozy-island-tidepool-conservatory",
    tide: clamp01(0.42 + Math.sin(now * 0.044) * 0.24),
    stormRisk: clamp01(0.2 + Math.sin(now * 0.029 + 0.7) * 0.18),
    waterClarity: clamp01(0.62 + Math.sin(now * 0.035 + 1.3) * 0.2),
    coralHealth: clamp01(0.57 + Math.sin(now * 0.021 + 2.2) * 0.18),
    crabActivity: clamp01(0.5 + Math.sin(now * 0.055 + 0.4) * 0.28),
    shellSupply: clamp01(0.48 + Math.sin(now * 0.027 + 2.8) * 0.22),
    moonPhase: clamp01((Math.sin(now * 0.017) + 1) / 2),
    visitorPressure: clamp01(0.36 + Math.sin(now * 0.039 + 3.3) * 0.2),
    wind: { x: Math.cos(now * 0.045) * 0.35, y: 0, z: Math.sin(now * 0.048) * 0.31 },
    camp: { x: 6, y: 0.2, z: -8 },
    reefRadius: 92,
    lagoonRadius: 46
  };
}

function createLayer() {
  if (document.querySelector("[data-cozy-tidepool-conservatory]")) return document.querySelector("[data-cozy-tidepool-conservatory]");
  const root = document.createElement("section");
  root.dataset.cozyTidepoolConservatory = PASS_ID;
  root.style.cssText = "position:fixed;left:18px;bottom:18px;z-index:9;width:min(370px,calc(100vw - 36px));padding:14px 16px;border:1px solid rgba(255,255,255,.28);border-radius:20px;background:rgba(12,52,61,.7);backdrop-filter:blur(12px);box-shadow:0 18px 44px rgba(0,0,0,.22);color:#fff;font:12px/1.4 system-ui,sans-serif;pointer-events:none";
  root.innerHTML = `
    <div style="display:flex;justify-content:space-between;gap:12px;align-items:start">
      <div>
        <div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;opacity:.72">Tidepool Conservatory</div>
        <div data-tidepool-summary style="font-size:18px;font-weight:850;margin-top:2px">surveying reef</div>
      </div>
      <div data-tidepool-count style="font-weight:900;font-size:22px">0</div>
    </div>
    <canvas width="330" height="136" data-tidepool-canvas style="display:block;width:100%;height:136px;margin:10px 0 8px;border-radius:15px;background:radial-gradient(circle at 50% 100%,rgba(119,228,255,.22),rgba(255,255,255,.05) 58%,rgba(255,255,255,.02))"></canvas>
    <div data-tidepool-grid style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px"></div>
  `;
  document.body.append(root);
  return root;
}

function descriptorMetric(item) {
  return item.state.transplantPriority ?? item.state.visibility ?? item.state.crossingDensity ?? item.state.repairNeed ?? item.state.tideReadability ?? item.state.healthScore ?? 0.45;
}

function drawCanvas(canvas, readiness) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(255,255,255,.2)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2 + 20, 42 + i * 23, 18 + i * 10, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  const descriptors = readiness.rendererHandoff.descriptors;
  descriptors.forEach((item, index) => {
    const px = w / 2 + (item.position.x / 110) * w * 0.43;
    const py = h / 2 + (item.position.z / 110) * h * 0.58;
    const size = 3.5 + descriptorMetric(item) * 8;
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fillStyle = item.kind.includes("coral") ? "rgba(255,142,177,.9)" : item.kind.includes("specimen") ? "rgba(122,239,255,.88)" : item.kind.includes("crab") ? "rgba(255,194,113,.88)" : item.kind.includes("shell") ? "rgba(255,248,194,.88)" : item.kind.includes("moon") ? "rgba(198,211,255,.86)" : "rgba(151,255,191,.9)";
    ctx.fill();
    if (index < 10) {
      ctx.strokeStyle = "rgba(255,255,255,.42)";
      ctx.stroke();
    }
  });
}

function render(readiness) {
  const root = createLayer();
  root.querySelector("[data-tidepool-summary]").textContent = `${readiness.summary.topConcern} need ${(readiness.summary.stewardshipNeed * 100).toFixed(0)}%`;
  root.querySelector("[data-tidepool-count]").textContent = readiness.rendererHandoff.counts.total;
  const rows = [
    ["coral", readiness.rendererHandoff.counts.coralNurseryBeds],
    ["specimens", readiness.rendererHandoff.counts.tidepoolSpecimenTrails],
    ["crabs", readiness.rendererHandoff.counts.hermitCrabCrossings],
    ["shells", readiness.rendererHandoff.counts.shellMarkerMosaics],
    ["moon tide", readiness.rendererHandoff.counts.moonTideSurveys],
    ["ledger", readiness.rendererHandoff.counts.conservationLedgers]
  ];
  root.querySelector("[data-tidepool-grid]").innerHTML = rows.map(([label, value]) => `<div style="border:1px solid rgba(255,255,255,.16);border-radius:10px;padding:7px 8px;background:rgba(255,255,255,.08)"><strong style="font-size:14px">${value}</strong><span style="margin-left:5px;opacity:.76">${label}</span></div>`).join("");
  drawCanvas(root.querySelector("[data-tidepool-canvas]"), readiness);
  document.body.dataset.cozyTidepoolConservatoryReadiness = PASS_ID;
}

function evaluate() {
  hostState.frame += 1;
  hostState.latest = domain.evaluate(sampleSnapshot());
  render(hostState.latest);
  return hostState.latest;
}

function patchGameHost() {
  const previousHost = window.GameHost ?? {};
  if (previousHost.__cozyTidepoolConservatoryPatched) return;
  const previousRendererHandoff = typeof previousHost.getRendererHandoff === "function" ? previousHost.getRendererHandoff.bind(previousHost) : () => ({});
  window.GameHost = {
    ...previousHost,
    __cozyTidepoolConservatoryPatched: true,
    getTidepoolConservatoryReadinessDomain: () => domain,
    getTidepoolConservatoryReadiness: () => hostState.latest ?? evaluate(),
    getCozyIslandTidepoolConservatoryReadiness: () => hostState.latest ?? evaluate(),
    getRendererHandoff: () => {
      const base = previousRendererHandoff() ?? {};
      const readiness = hostState.latest ?? evaluate();
      return {
        ...base,
        tidepoolConservatoryReadiness: readiness.rendererHandoff,
        tidepoolConservatoryDescriptorCount: readiness.rendererHandoff.counts.total
      };
    }
  };
}

patchGameHost();
evaluate();
window.setInterval(() => {
  patchGameHost();
  evaluate();
}, 2800);

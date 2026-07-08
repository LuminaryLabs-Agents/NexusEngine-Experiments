import "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createCozyIslandSeaTurtleHatcheryReadinessDomainKit } from "./cozy-island-sea-turtle-hatchery-kits.js";

const PASS_ID = "sea-turtle-hatchery-readiness-renderer-handoff-pass";
const domain = createCozyIslandSeaTurtleHatcheryReadinessDomainKit({ seed: "cozy-island-sea-turtle-hatchery" });
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
    seed: "cozy-island-sea-turtle-hatchery",
    tide: clamp01(0.45 + Math.sin(now * 0.046) * 0.25),
    stormRisk: clamp01(0.18 + Math.sin(now * 0.027 + 1.2) * 0.18),
    sandHeat: clamp01(0.52 + Math.sin(now * 0.031 + 2.5) * 0.28),
    moonPhase: clamp01((Math.sin(now * 0.016 + 0.9) + 1) / 2),
    predatorPressure: clamp01(0.36 + Math.sin(now * 0.049 + 0.3) * 0.26),
    visitorPressure: clamp01(0.34 + Math.sin(now * 0.038 + 2.9) * 0.24),
    surfCalm: clamp01(0.64 + Math.sin(now * 0.033 + 1.7) * 0.2),
    volunteerCoverage: clamp01(0.54 + Math.sin(now * 0.041 + 2.2) * 0.24),
    wind: { x: Math.cos(now * 0.045) * 0.28, y: 0, z: Math.sin(now * 0.044) * 0.32 },
    camp: { x: 6, y: 0.2, z: -8 },
    beachRadius: 78,
    hatcheryRadius: 69
  };
}

function createLayer() {
  if (document.querySelector("[data-cozy-sea-turtle-hatchery]")) return document.querySelector("[data-cozy-sea-turtle-hatchery]");
  const root = document.createElement("section");
  root.dataset.cozySeaTurtleHatchery = PASS_ID;
  root.style.cssText = "position:fixed;right:18px;bottom:18px;z-index:10;width:min(370px,calc(100vw - 36px));padding:14px 16px;border:1px solid rgba(255,255,255,.28);border-radius:20px;background:rgba(39,33,54,.72);backdrop-filter:blur(12px);box-shadow:0 18px 44px rgba(0,0,0,.22);color:#fff;font:12px/1.4 system-ui,sans-serif;pointer-events:none";
  root.innerHTML = `
    <div style="display:flex;justify-content:space-between;gap:12px;align-items:start">
      <div>
        <div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;opacity:.72">Sea Turtle Hatchery</div>
        <div data-turtle-summary style="font-size:18px;font-weight:850;margin-top:2px">watching nests</div>
      </div>
      <div data-turtle-count style="font-weight:900;font-size:22px">0</div>
    </div>
    <canvas width="330" height="136" data-turtle-canvas style="display:block;width:100%;height:136px;margin:10px 0 8px;border-radius:15px;background:radial-gradient(circle at 50% 0%,rgba(226,219,255,.24),rgba(255,255,255,.05) 52%,rgba(255,255,255,.02))"></canvas>
    <div data-turtle-grid style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px"></div>
  `;
  document.body.append(root);
  return root;
}

function descriptorMetric(item) {
  return item.state.heatDrift ?? item.state.bufferPriority ?? item.state.moonGuidance ?? item.state.releaseReadiness ?? item.state.setupPriority ?? item.state.successScore ?? 0.45;
}

function drawCanvas(canvas, readiness) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(255,255,255,.2)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(w / 2, h + 6, 40 + i * 27, Math.PI * 1.08, Math.PI * 1.92);
    ctx.stroke();
  }
  const descriptors = readiness.rendererHandoff.descriptors;
  descriptors.forEach((item, index) => {
    const px = w / 2 + (item.position.x / 96) * w * 0.45;
    const py = h / 2 + (item.position.z / 96) * h * 0.58;
    const size = 3.5 + descriptorMetric(item) * 8;
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fillStyle = item.kind.includes("temperature") ? "rgba(255,181,115,.92)" : item.kind.includes("predator") ? "rgba(255,118,145,.88)" : item.kind.includes("moonlit") ? "rgba(219,225,255,.88)" : item.kind.includes("surf") ? "rgba(111,232,255,.88)" : item.kind.includes("rope") ? "rgba(255,242,158,.88)" : "rgba(155,255,193,.9)";
    ctx.fill();
    if (index < 10) {
      ctx.strokeStyle = "rgba(255,255,255,.42)";
      ctx.stroke();
    }
  });
}

function render(readiness) {
  const root = createLayer();
  root.querySelector("[data-turtle-summary]").textContent = `${readiness.summary.topConcern} need ${(readiness.summary.hatcheryNeed * 100).toFixed(0)}%`;
  root.querySelector("[data-turtle-count]").textContent = readiness.rendererHandoff.counts.total;
  const rows = [
    ["nests", readiness.rendererHandoff.counts.nestTemperatureBands],
    ["tracks", readiness.rendererHandoff.counts.predatorTrackBuffers],
    ["lanes", readiness.rendererHandoff.counts.moonlitHatchlingLanes],
    ["surf", readiness.rendererHandoff.counts.surfWindowTimings],
    ["rope", readiness.rendererHandoff.counts.volunteerRopeLines],
    ["ledger", readiness.rendererHandoff.counts.releaseLedgerStamps]
  ];
  root.querySelector("[data-turtle-grid]").innerHTML = rows.map(([label, value]) => `<div style="border:1px solid rgba(255,255,255,.16);border-radius:10px;padding:7px 8px;background:rgba(255,255,255,.08)"><strong style="font-size:14px">${value}</strong><span style="margin-left:5px;opacity:.76">${label}</span></div>`).join("");
  drawCanvas(root.querySelector("[data-turtle-canvas]"), readiness);
  document.body.dataset.cozySeaTurtleHatcheryReadiness = PASS_ID;
}

function evaluate() {
  hostState.frame += 1;
  hostState.latest = domain.evaluate(sampleSnapshot());
  render(hostState.latest);
  return hostState.latest;
}

function patchGameHost() {
  const previousHost = window.GameHost ?? {};
  if (previousHost.__cozySeaTurtleHatcheryPatched) return;
  const previousRendererHandoff = typeof previousHost.getRendererHandoff === "function" ? previousHost.getRendererHandoff.bind(previousHost) : () => ({});
  window.GameHost = {
    ...previousHost,
    __cozySeaTurtleHatcheryPatched: true,
    getSeaTurtleHatcheryReadinessDomain: () => domain,
    getSeaTurtleHatcheryReadiness: () => hostState.latest ?? evaluate(),
    getCozyIslandSeaTurtleHatcheryReadiness: () => hostState.latest ?? evaluate(),
    getRendererHandoff: () => {
      const base = previousRendererHandoff() ?? {};
      const readiness = hostState.latest ?? evaluate();
      return {
        ...base,
        seaTurtleHatcheryReadiness: readiness.rendererHandoff,
        seaTurtleHatcheryDescriptorCount: readiness.rendererHandoff.counts.total
      };
    }
  };
}

patchGameHost();
evaluate();
window.setInterval(() => {
  patchGameHost();
  evaluate();
}, 3200);

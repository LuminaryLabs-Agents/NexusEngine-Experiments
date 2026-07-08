import "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createCozyIslandCastawayComfortReadinessDomainKit } from "./cozy-island-castaway-comfort-kits.js";

const PASS_ID = "castaway-comfort-readiness-renderer-handoff-pass";
const domain = createCozyIslandCastawayComfortReadinessDomainKit({ seed: "cozy-island-castaway-comfort" });
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
    seed: "cozy-island-castaway-comfort",
    tide: clamp01(0.44 + Math.sin(now * 0.05) * 0.18),
    stormRisk: clamp01(0.22 + Math.sin(now * 0.031 + 1.5) * 0.16),
    hunger: clamp01(0.32 + Math.sin(now * 0.041 + 0.8) * 0.18),
    thirst: clamp01(0.5 + Math.sin(now * 0.037 + 2.1) * 0.18),
    timeOfDay: clamp01((Math.sin(now * 0.018) + 1) / 2),
    smokeStrength: clamp01(0.62 + Math.sin(now * 0.07) * 0.16),
    wind: { x: Math.cos(now * 0.06) * 0.48, y: 0, z: Math.sin(now * 0.052) * 0.34 },
    camp: { x: 6, y: 0.2, z: -8 },
    beachRadius: 78,
    clearingRadius: 16
  };
}

function createLayer() {
  if (document.querySelector("[data-cozy-castaway-comfort]")) return document.querySelector("[data-cozy-castaway-comfort]");
  const root = document.createElement("section");
  root.dataset.cozyCastawayComfort = PASS_ID;
  root.style.cssText = "position:fixed;right:18px;top:18px;z-index:8;width:min(360px,calc(100vw - 36px));padding:14px 16px;border:1px solid rgba(255,255,255,.28);border-radius:18px;background:rgba(19,42,45,.68);backdrop-filter:blur(10px);box-shadow:0 18px 44px rgba(0,0,0,.2);color:#fff;font:12px/1.4 system-ui,sans-serif;pointer-events:none";
  root.innerHTML = `
    <div style="display:flex;justify-content:space-between;gap:12px;align-items:start">
      <div>
        <div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;opacity:.72">Castaway Comfort</div>
        <div data-comfort-summary style="font-size:18px;font-weight:850;margin-top:2px">warming up</div>
      </div>
      <div data-comfort-count style="font-weight:900;font-size:22px">0</div>
    </div>
    <canvas width="320" height="130" data-comfort-canvas style="display:block;width:100%;height:130px;margin:10px 0 8px;border-radius:14px;background:linear-gradient(180deg,rgba(255,255,255,.14),rgba(255,255,255,.04))"></canvas>
    <div data-comfort-grid style="display:grid;grid-template-columns:1fr 1fr;gap:6px"></div>
  `;
  document.body.append(root);
  return root;
}

function drawCanvas(canvas, readiness) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = "rgba(255,255,255,.22)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(w / 2, h + 24, 34 + i * 24, Math.PI * 1.06, Math.PI * 1.94);
    ctx.stroke();
  }
  const descriptors = readiness.rendererHandoff.descriptors;
  descriptors.forEach((item, index) => {
    const px = w / 2 + (item.position.x / 92) * w * 0.42;
    const py = h / 2 + (item.position.z / 92) * h * 0.5;
    const size = 4 + (item.state.priority ?? item.state.cover ?? item.state.launchReadiness ?? item.state.visibility ?? 0.45) * 8;
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fillStyle = item.kind.includes("water") ? "rgba(127,220,255,.84)" : item.kind.includes("forage") ? "rgba(173,255,142,.84)" : item.kind.includes("signal") ? "rgba(255,201,105,.9)" : item.kind.includes("storm") ? "rgba(173,180,255,.8)" : item.kind.includes("canoe") ? "rgba(255,255,255,.82)" : "rgba(255,240,174,.84)";
    ctx.fill();
    if (index < 8) {
      ctx.strokeStyle = "rgba(255,255,255,.38)";
      ctx.stroke();
    }
  });
}

function render(readiness) {
  const root = createLayer();
  root.querySelector("[data-comfort-summary]").textContent = `${readiness.summary.topConcern} priority ${(readiness.summary.comfortNeed * 100).toFixed(0)}%`;
  root.querySelector("[data-comfort-count]").textContent = readiness.rendererHandoff.counts.total;
  const rows = [
    ["water", readiness.rendererHandoff.counts.freshWaterSprings],
    ["food", readiness.rendererHandoff.counts.forageCacheRings],
    ["shade", readiness.rendererHandoff.counts.shadeShelterCanopies],
    ["storm", readiness.rendererHandoff.counts.stormCoverPockets]
  ];
  root.querySelector("[data-comfort-grid]").innerHTML = rows.map(([label, value]) => `<div style="border:1px solid rgba(255,255,255,.16);border-radius:10px;padding:7px 8px;background:rgba(255,255,255,.08)"><strong style="font-size:14px">${value}</strong><span style="margin-left:6px;opacity:.76">${label}</span></div>`).join("");
  drawCanvas(root.querySelector("[data-comfort-canvas]"), readiness);
  document.body.dataset.cozyCastawayComfortReadiness = PASS_ID;
}

function evaluate() {
  hostState.frame += 1;
  hostState.latest = domain.evaluate(sampleSnapshot());
  render(hostState.latest);
  return hostState.latest;
}

function patchGameHost() {
  const previousHost = window.GameHost ?? {};
  if (previousHost.__cozyCastawayComfortPatched) return;
  const previousRendererHandoff = typeof previousHost.getRendererHandoff === "function" ? previousHost.getRendererHandoff.bind(previousHost) : () => ({});
  window.GameHost = {
    ...previousHost,
    __cozyCastawayComfortPatched: true,
    getCastawayComfortReadinessDomain: () => domain,
    getCastawayComfortReadiness: () => hostState.latest ?? evaluate(),
    getCozyIslandCastawayComfortReadiness: () => hostState.latest ?? evaluate(),
    getRendererHandoff: () => {
      const base = previousRendererHandoff() ?? {};
      const readiness = hostState.latest ?? evaluate();
      return {
        ...base,
        castawayComfortReadiness: readiness.rendererHandoff,
        castawayComfortDescriptorCount: readiness.rendererHandoff.counts.total
      };
    }
  };
}

patchGameHost();
evaluate();
window.setInterval(() => {
  patchGameHost();
  evaluate();
}, 2400);

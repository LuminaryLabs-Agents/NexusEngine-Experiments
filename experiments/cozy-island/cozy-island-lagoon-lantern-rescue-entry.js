import "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createCozyIslandLagoonLanternRescueReadinessDomainKit } from "./cozy-island-lagoon-lantern-rescue-kits.js";

const PASS_ID = "lagoon-lantern-rescue-readiness-renderer-handoff-pass";
const domain = createCozyIslandLagoonLanternRescueReadinessDomainKit({ seed: "cozy-island-lagoon-lantern-rescue" });
const hostState = { latest: null, frame: 0 };

function clamp01(value) {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function sampleSnapshot() {
  const now = Date.now() * 0.001;
  return {
    seed: "cozy-island-lagoon-lantern-rescue",
    tide: clamp01(0.42 + Math.sin(now * 0.034) * 0.26),
    moon: clamp01(0.5 + Math.sin(now * 0.018 + 1.1) * 0.38),
    fog: clamp01(0.34 + Math.sin(now * 0.024 + 2.2) * 0.28),
    rain: clamp01(0.22 + Math.sin(now * 0.021 + 0.7) * 0.2),
    hunger: clamp01(0.38 + Math.sin(now * 0.031 + 2.8) * 0.26),
    rescuedGuests: 3 + Math.round(clamp01(Math.sin(now * 0.017) * 0.5 + 0.5) * 4),
    volunteerCoverage: clamp01(0.54 + Math.sin(now * 0.029 + 1.9) * 0.24),
    waterClarity: clamp01(0.64 + Math.sin(now * 0.026 + 0.4) * 0.22),
    wind: { x: Math.cos(now * 0.041) * 0.32, y: 0, z: Math.sin(now * 0.039) * 0.28 },
    camp: { x: 6, y: 0.2, z: -8 },
    lagoonRadius: 56,
    beachRadius: 78
  };
}

function createLayer() {
  if (document.querySelector("[data-cozy-lagoon-lantern-rescue]")) return document.querySelector("[data-cozy-lagoon-lantern-rescue]");
  const root = document.createElement("section");
  root.dataset.cozyLagoonLanternRescue = PASS_ID;
  root.style.cssText = "position:fixed;left:18px;bottom:18px;z-index:11;width:min(390px,calc(100vw - 36px));padding:14px 16px;border:1px solid rgba(255,255,255,.26);border-radius:20px;background:rgba(10,31,48,.74);backdrop-filter:blur(12px);box-shadow:0 18px 44px rgba(0,0,0,.24);color:#fff;font:12px/1.4 system-ui,sans-serif;pointer-events:none";
  root.innerHTML = `
    <div style="display:flex;justify-content:space-between;gap:12px;align-items:start">
      <div>
        <div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;opacity:.72">Lagoon Lantern Rescue</div>
        <div data-lagoon-summary style="font-size:18px;font-weight:850;margin-top:2px">lighting pickup route</div>
      </div>
      <div data-lagoon-count style="font-weight:900;font-size:22px">0</div>
    </div>
    <canvas width="348" height="134" data-lagoon-canvas style="display:block;width:100%;height:134px;margin:10px 0 8px;border-radius:15px;background:radial-gradient(circle at 50% 15%,rgba(124,219,255,.22),rgba(255,255,255,.05) 58%,rgba(255,255,255,.02))"></canvas>
    <div data-lagoon-grid style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px"></div>
  `;
  document.body.append(root);
  return root;
}

function descriptorMetric(item) {
  return item.state.glowStrength ?? item.state.waypointClarity ?? item.state.lashUrgency ?? item.state.hungerRelief ?? item.state.launchPriority ?? item.state.pickupReadiness ?? 0.45;
}

function drawCanvas(canvas, readiness) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(255,255,255,.18)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2 + 12, 54 + i * 31, 18 + i * 13, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  const descriptors = readiness.rendererHandoff.descriptors;
  descriptors.forEach((item, index) => {
    const px = w / 2 + (item.position.x / 96) * w * 0.44;
    const py = h / 2 + (item.position.z / 96) * h * 0.58;
    const size = 3.5 + descriptorMetric(item) * 7.5;
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fillStyle = item.kind.includes("lantern-buoy") ? "rgba(255,230,128,.94)" : item.kind.includes("firefly") ? "rgba(176,255,156,.9)" : item.kind.includes("tarp") ? "rgba(111,220,255,.9)" : item.kind.includes("fish") ? "rgba(118,238,221,.88)" : item.kind.includes("kite") ? "rgba(255,161,223,.88)" : "rgba(255,255,255,.92)";
    ctx.fill();
    if (index % 2 === 0) {
      ctx.strokeStyle = "rgba(255,255,255,.42)";
      ctx.stroke();
    }
  });
}

function render(readiness) {
  const root = createLayer();
  root.querySelector("[data-lagoon-summary]").textContent = `${readiness.summary.topConcern} need ${(readiness.summary.rescueNeed * 100).toFixed(0)}%`;
  root.querySelector("[data-lagoon-count]").textContent = readiness.rendererHandoff.counts.total;
  const rows = [
    ["buoys", readiness.rendererHandoff.counts.lanternBuoyChains],
    ["jars", readiness.rendererHandoff.counts.fireflyJarWaypoints],
    ["tarps", readiness.rendererHandoff.counts.rainTarpAnchors],
    ["traps", readiness.rendererHandoff.counts.wovenFishTraps],
    ["kites", readiness.rendererHandoff.counts.signalKiteSpools],
    ["pickup", readiness.rendererHandoff.counts.outriggerPickupWindows]
  ];
  root.querySelector("[data-lagoon-grid]").innerHTML = rows.map(([label, value]) => `<div style="border:1px solid rgba(255,255,255,.16);border-radius:10px;padding:7px 8px;background:rgba(255,255,255,.08)"><strong style="font-size:14px">${value}</strong><span style="margin-left:5px;opacity:.76">${label}</span></div>`).join("");
  drawCanvas(root.querySelector("[data-lagoon-canvas]"), readiness);
  document.body.dataset.cozyLagoonLanternRescueReadiness = PASS_ID;
}

function evaluate() {
  hostState.frame += 1;
  hostState.latest = domain.evaluate(sampleSnapshot());
  render(hostState.latest);
  return hostState.latest;
}

function patchGameHost() {
  const previousHost = window.GameHost ?? {};
  if (previousHost.__cozyLagoonLanternRescuePatched) return;
  const previousRendererHandoff = typeof previousHost.getRendererHandoff === "function" ? previousHost.getRendererHandoff.bind(previousHost) : () => ({});
  window.GameHost = {
    ...previousHost,
    __cozyLagoonLanternRescuePatched: true,
    getLagoonLanternRescueReadinessDomain: () => domain,
    getLagoonLanternRescueReadiness: () => hostState.latest ?? evaluate(),
    getCozyIslandLagoonLanternRescueReadiness: () => hostState.latest ?? evaluate(),
    getLagoonLanternRescueReadinessTree: () => domain.domainTree,
    getRendererHandoff: () => {
      const base = previousRendererHandoff() ?? {};
      const readiness = hostState.latest ?? evaluate();
      return {
        ...base,
        lagoonLanternRescueReadiness: readiness.rendererHandoff,
        lagoonLanternRescueDescriptorCount: readiness.rendererHandoff.counts.total
      };
    }
  };
}

patchGameHost();
evaluate();
window.setInterval(() => {
  patchGameHost();
  evaluate();
}, 3400);

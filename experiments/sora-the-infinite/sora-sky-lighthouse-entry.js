import "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createSoraSkyLighthouseReadinessDomainKit } from "../_kits/sora-the-infinite/sora-sky-lighthouse-readiness-domain-kits.js";

const PASS_ID = "sky-lighthouse-readiness-renderer-handoff-pass";
const domain = createSoraSkyLighthouseReadinessDomainKit({ seed: "sora-sky-lighthouse" });
const hostState = { latest: null, frame: 0 };

function clamp01(value) {
  const number = Number(value);
  return Math.max(0, Math.min(1, Number.isFinite(number) ? number : 0));
}

function readHostDescription() {
  const host = window.GameHost;
  if (host && typeof host.describe === "function") {
    try { return host.describe(); } catch { return null; }
  }
  return null;
}

function sampleSnapshot() {
  const described = readHostDescription();
  const rawState = typeof window.GameHost?.getState === "function" ? window.GameHost.getState() : {};
  const now = Date.now() * 0.001;
  return {
    tick: Number(rawState.tick ?? hostState.frame),
    readiness: clamp01(described?.readiness ?? rawState.readiness ?? 0.34 + Math.sin(now * 0.025) * 0.18),
    input: rawState.input ?? { thrust: clamp01(0.4 + Math.sin(now * 0.04) * 0.35), bank: Math.sin(now * 0.033) * 0.7, climb: Math.cos(now * 0.03) * 0.55, launch: false, pointerActive: false, pointerX: 0.5, pointerY: 0.5 },
    routePreview: described,
    launchRehearsal: described?.launchRehearsal,
    flightplanReadability: described?.flightplanReadability,
    skyNegotiationReadiness: described?.skyNegotiationReadiness,
    preflightChallengeReadiness: described?.preflightChallengeReadiness ?? window.GameHost?.getPreflightChallengeReadiness?.(),
    microflightTrialReadiness: described?.microflightTrialReadiness ?? window.GameHost?.getMicroflightTrialReadiness?.(),
    skyRescueReadiness: described?.skyRescueReadiness ?? window.GameHost?.getSkyRescueReadiness?.()
  };
}

function createLayer() {
  const existing = document.querySelector("[data-sora-sky-lighthouse]");
  if (existing) return existing;
  const root = document.createElement("section");
  root.dataset.soraSkyLighthouse = PASS_ID;
  root.style.cssText = "position:fixed;left:18px;bottom:18px;z-index:12;width:min(390px,calc(100vw - 36px));padding:14px 16px;border:1px solid rgba(255,255,255,.28);border-radius:22px;background:rgba(16,21,46,.76);backdrop-filter:blur(14px);box-shadow:0 20px 54px rgba(0,0,0,.28);color:#fff;font:12px/1.42 system-ui,sans-serif;pointer-events:none";
  root.innerHTML = `
    <div style="display:flex;justify-content:space-between;gap:12px;align-items:start">
      <div><div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;opacity:.72">Sky Lighthouse</div><div data-lighthouse-summary style="font-size:18px;font-weight:850;margin-top:2px">calibrating beacons</div></div>
      <div data-lighthouse-count style="font-weight:900;font-size:22px">0</div>
    </div>
    <canvas width="350" height="138" data-lighthouse-canvas style="display:block;width:100%;height:138px;margin:10px 0 8px;border-radius:16px;background:radial-gradient(circle at 50% 0%,rgba(174,211,255,.28),rgba(255,255,255,.06) 54%,rgba(255,255,255,.02))"></canvas>
    <div data-lighthouse-grid style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px"></div>
  `;
  document.body.append(root);
  return root;
}

function descriptorMetric(item) {
  return item.focus ?? item.alignment ?? item.chain ?? item.approach ?? item.closure ?? (1 - (item.warning ?? 0.45));
}

function drawCanvas(canvas, readiness) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(255,255,255,.18)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(w / 2, h + 18, 46 + i * 28, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();
  }
  const d = readiness.rendererHandoff.descriptors;
  [d.cloudLensFocuses.lenses, d.starPrismAlignments.prisms, d.windBuoyChains.buoys, d.stormLanternWarnings.lanterns, d.refugeRunwayMarks.marks, d.dawnKeeperLogs.logs].flat().forEach((item, index) => {
    const metric = clamp01(descriptorMetric(item));
    ctx.beginPath();
    ctx.arc(((item.x ?? 50) / 100) * w, ((item.y ?? 50) / 100) * h, 3.5 + metric * 8, 0, Math.PI * 2);
    ctx.fillStyle = item.kind.includes("storm") ? "rgba(255,151,106,.9)" : item.kind.includes("runway") ? "rgba(151,255,207,.92)" : item.kind.includes("prism") ? "rgba(226,211,255,.92)" : item.kind.includes("buoy") ? "rgba(116,229,255,.92)" : item.kind.includes("dawn") ? "rgba(255,239,148,.92)" : "rgba(181,214,255,.92)";
    ctx.fill();
    if (index < 14) { ctx.strokeStyle = "rgba(255,255,255,.42)"; ctx.stroke(); }
  });
}

function render(readiness) {
  const root = createLayer();
  const summary = readiness.summary;
  root.querySelector("[data-lighthouse-summary]").textContent = `${summary.focusedCloudLenses} lenses / ${summary.openRefugeRunways} runways ready`;
  root.querySelector("[data-lighthouse-count]").textContent = summary.descriptorCount;
  const rows = [["lenses", readiness.rendererHandoff.descriptorCounts.cloudLenses], ["prisms", readiness.rendererHandoff.descriptorCounts.starPrisms], ["buoys", readiness.rendererHandoff.descriptorCounts.windBuoys], ["storms", readiness.rendererHandoff.descriptorCounts.stormLanterns], ["runways", readiness.rendererHandoff.descriptorCounts.refugeRunways], ["logs", readiness.rendererHandoff.descriptorCounts.dawnKeeperLogs]];
  root.querySelector("[data-lighthouse-grid]").innerHTML = rows.map(([label, value]) => `<div style="border:1px solid rgba(255,255,255,.16);border-radius:10px;padding:7px 8px;background:rgba(255,255,255,.08)"><strong style="font-size:14px">${value}</strong><span style="margin-left:5px;opacity:.76">${label}</span></div>`).join("");
  drawCanvas(root.querySelector("[data-lighthouse-canvas]"), readiness);
  document.body.dataset.soraSkyLighthouseReadiness = PASS_ID;
}

function evaluate() {
  hostState.frame += 1;
  hostState.latest = domain.describe(sampleSnapshot());
  render(hostState.latest);
  return hostState.latest;
}

function patchGameHost() {
  const previousHost = window.GameHost ?? {};
  if (previousHost.__soraSkyLighthousePatched) return;
  const previousRendererHandoff = typeof previousHost.getRendererHandoff === "function" ? previousHost.getRendererHandoff.bind(previousHost) : () => ({});
  window.GameHost = {
    ...previousHost,
    __soraSkyLighthousePatched: true,
    getSkyLighthouseReadinessDomain: () => domain,
    getSkyLighthouseReadiness: () => hostState.latest ?? evaluate(),
    getSoraSkyLighthouseReadiness: () => hostState.latest ?? evaluate(),
    getSkyLighthouseReadinessTree: () => domain.tree,
    getRendererHandoff: () => ({ ...previousRendererHandoff(), skyLighthouseReadiness: (hostState.latest ?? evaluate()).rendererHandoff, skyLighthouseDescriptorCount: (hostState.latest ?? evaluate()).summary.descriptorCount })
  };
}

patchGameHost();
evaluate();
window.setInterval(() => { patchGameHost(); evaluate(); }, 3000);

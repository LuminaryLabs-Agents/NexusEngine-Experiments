import "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createZombieOrchardSeedBankQuarantineReadinessDomainKit } from "./seed-bank-quarantine-readiness-kits.js";

const PASS_ID = "seed-bank-quarantine-readiness-renderer-handoff-pass";
const domain = createZombieOrchardSeedBankQuarantineReadinessDomainKit({ seed: "zombie-orchard-seed-bank-quarantine" });
const hostState = { latest: null, frame: 0 };

function readHostState() {
  try {
    return globalThis.GameHost?.getState?.() ?? {};
  } catch {
    return {};
  }
}

function createLayer() {
  const existing = document.querySelector("[data-zombie-seed-bank-quarantine]");
  if (existing) return existing;
  const root = document.createElement("section");
  root.dataset.zombieSeedBankQuarantine = PASS_ID;
  root.style.cssText = "position:fixed;right:18px;bottom:18px;z-index:14;width:min(420px,calc(100vw - 36px));padding:14px 16px;border:1px solid rgba(255,214,132,.28);border-radius:18px;background:rgba(18,12,7,.78);box-shadow:0 20px 54px rgba(0,0,0,.42);backdrop-filter:blur(14px);color:#fff7e7;font:12px/1.4 system-ui,sans-serif;pointer-events:none";
  root.innerHTML = `
    <div style="display:flex;justify-content:space-between;gap:12px;align-items:start">
      <div>
        <div style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#ffd684;opacity:.9">Seed Bank Quarantine</div>
        <div data-seed-bank-priority style="font-size:18px;font-weight:900;margin-top:2px;color:#fff">banking seeds</div>
      </div>
      <div data-seed-bank-count style="font-weight:950;font-size:24px;color:#ffd684">0</div>
    </div>
    <canvas width="360" height="132" data-seed-bank-map style="display:block;width:100%;height:132px;margin:10px 0 8px;border-radius:14px;background:radial-gradient(circle at 50% 50%,rgba(255,215,132,.17),rgba(92,44,22,.20) 54%,rgba(0,0,0,.24))"></canvas>
    <div data-seed-bank-grid style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px"></div>
  `;
  document.body.append(root);
  return root;
}

function metric(item) {
  return item.state.viability ?? item.state.graftReadiness ?? item.state.sporeLoad ?? item.state.ashHeat ?? item.state.replantReadiness ?? item.state.bankIntegrity ?? 0.45;
}

function drawMap(canvas, readiness) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(255,225,160,.16)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i += 1) {
    ctx.beginPath();
    ctx.ellipse(width / 2, height / 2, 26 + i * 27, 12 + i * 10, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(255,234,170,.96)";
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, 5, 0, Math.PI * 2);
  ctx.fill();

  for (const item of readiness.rendererHandoff.flatDescriptors) {
    const x = width / 2 + (item.position.x / 92) * width * 0.44;
    const y = height / 2 + (item.position.z / 92) * height * 0.54;
    const radius = 3 + metric(item) * 7;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = item.kind.includes("seed-cache") ? "rgba(255,231,133,.92)" : item.kind.includes("scion") ? "rgba(164,255,184,.86)" : item.kind.includes("spore") ? "rgba(255,121,107,.82)" : item.kind.includes("compost") ? "rgba(255,152,86,.82)" : item.kind.includes("replant") ? "rgba(126,230,166,.86)" : "rgba(255,255,255,.86)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.34)";
    ctx.stroke();
  }
}

function render(readiness) {
  const root = createLayer();
  root.querySelector("[data-seed-bank-priority]").textContent = `${readiness.summary.topPriority} ${(readiness.summary.seedViability * 100).toFixed(0)}%`;
  root.querySelector("[data-seed-bank-count]").textContent = readiness.rendererHandoff.counts.total;
  const rows = [
    ["seeds", readiness.rendererHandoff.counts.heirloomSeedCaches],
    ["scions", readiness.rendererHandoff.counts.graftScionRacks],
    ["fences", readiness.rendererHandoff.counts.sporeFenceLanterns],
    ["burn pits", readiness.rendererHandoff.counts.compostBurnPits],
    ["rows", readiness.rendererHandoff.counts.rowReplantCharters],
    ["ledger", readiness.rendererHandoff.counts.dawnSeedLedgers]
  ];
  root.querySelector("[data-seed-bank-grid]").innerHTML = rows.map(([label, value]) => `<div style="border:1px solid rgba(255,214,132,.16);border-radius:10px;padding:7px 8px;background:rgba(255,214,132,.08)"><strong style="font-size:14px;color:#fff">${value}</strong><span style="margin-left:5px;opacity:.78">${label}</span></div>`).join("");
  drawMap(root.querySelector("[data-seed-bank-map]"), readiness);
  document.documentElement.dataset.zombieSeedBankQuarantineReadiness = "active";
  document.body.dataset.zombieSeedBankQuarantineReadiness = PASS_ID;
}

function evaluate() {
  hostState.frame += 1;
  const state = readHostState();
  hostState.latest = domain.compose({ seed: `zombie-orchard-seed-bank-${hostState.frame}`, ...state });
  render(hostState.latest);
  return hostState.latest;
}

function patchGameHost() {
  const previousHost = globalThis.GameHost ?? {};
  if (previousHost.__zombieSeedBankQuarantinePatched) return;
  const previousRendererHandoff = typeof previousHost.getRendererHandoff === "function" ? previousHost.getRendererHandoff.bind(previousHost) : () => ({});
  globalThis.GameHost = {
    ...previousHost,
    __zombieSeedBankQuarantinePatched: true,
    getSeedBankQuarantineReadinessDomain: () => domain,
    getSeedBankQuarantineReadiness: () => hostState.latest ?? evaluate(),
    getZombieOrchardSeedBankQuarantineReadiness: () => hostState.latest ?? evaluate(),
    getSeedBankQuarantineReadinessTree: () => domain.domainTree,
    getRendererHandoff: () => {
      const base = previousRendererHandoff() ?? {};
      const readiness = hostState.latest ?? evaluate();
      return {
        ...base,
        seedBankQuarantineReadiness: readiness.rendererHandoff,
        seedBankQuarantineDescriptorCount: readiness.rendererHandoff.counts.total
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

import { createVrBoardBreakwaterLighthouseRescueReadinessDomainKit } from "../_kits/vr-platformer-board/vr-board-breakwater-lighthouse-rescue-readiness-kits.js";

const NEXUS_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const breakwaterKit = createVrBoardBreakwaterLighthouseRescueReadinessDomainKit();

let latestBreakwaterReadiness = null;
let runtimeSurface = { imported: false, factoryName: "unloaded" };
let patchedHost = null;
let panel = null;

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function getBaseState() {
  try {
    return window.GameHost?.getState?.() ?? {};
  } catch {
    return {};
  }
}

function describeBreakwater(state = getBaseState(), input = {}) {
  latestBreakwaterReadiness = breakwaterKit.describe({
    avatar: state.avatar,
    level: state.level,
    objects: state.objects,
    board: state.board,
    weather: state.weather,
    stormHarborReadiness: state.stormHarborReadiness ?? state.domain?.vrBoardStormHarborEvacuationReadiness,
    input,
    time: performance.now() / 1000
  });
  renderPanel(latestBreakwaterReadiness);
  return latestBreakwaterReadiness;
}

function installPanel() {
  if (panel || !document.body) return;
  const style = document.createElement("style");
  style.textContent = `
    #breakwaterLighthousePanel {
      position: fixed;
      right: 16px;
      bottom: 16px;
      width: min(360px, calc(100vw - 32px));
      padding: 12px 14px;
      border-radius: 16px;
      border: 1px solid rgba(178, 236, 255, .22);
      background: linear-gradient(180deg, rgba(4, 10, 22, .78), rgba(3, 7, 15, .86));
      color: rgba(236, 248, 255, .88);
      font: 12px/1.45 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      box-shadow: 0 0 34px rgba(99, 209, 255, .14), inset 0 0 0 1px rgba(255,255,255,.04);
      backdrop-filter: blur(14px);
      pointer-events: none;
    }
    #breakwaterLighthousePanel strong { display: block; color: #e8fbff; margin-bottom: 5px; letter-spacing: .04em; text-transform: uppercase; }
    #breakwaterLighthousePanel .meter { height: 7px; margin: 7px 0 4px; border-radius: 999px; background: rgba(255,255,255,.13); overflow: hidden; }
    #breakwaterLighthousePanel .meter span { display: block; height: 100%; width: var(--ready, 0%); background: linear-gradient(90deg, #79ffe0, #ffe08a); }
    #breakwaterLighthousePanel small { color: rgba(210,228,240,.68); }
  `;
  document.head.append(style);
  panel = document.createElement("aside");
  panel.id = "breakwaterLighthousePanel";
  panel.setAttribute("aria-label", "Breakwater lighthouse rescue readiness");
  panel.innerHTML = "<strong>Breakwater Lighthouse</strong><span>Waiting for board state…</span>";
  document.body.append(panel);
}

function renderPanel(readiness) {
  installPanel();
  if (!panel || !readiness) return;
  const ledger = readiness.dawnLighthouseLedger;
  const percent = Math.round(clamp(readiness.rescueReadiness) * 100);
  panel.innerHTML = `<strong>Breakwater Lighthouse</strong><span>${ledger.nextInstruction}</span><div class="meter" style="--ready:${percent}%"><span></span></div><small>${readiness.rendererHandoff.counts.total} descriptors · ${ledger.missionState} · tide ${Math.round(readiness.tideRisk * 100)}%</small>`;
}

function mergeRendererHandoff(base, breakwater) {
  if (!breakwater?.rendererHandoff) return base ?? null;
  if (!base) return { ...breakwater.rendererHandoff, id: "vr-board-breakwater-lighthouse-composed-renderer-handoff", breakwaterLighthouseRescueReadiness: breakwater.rendererHandoff };
  return {
    ...base,
    id: "vr-board-storm-harbor-breakwater-composed-renderer-handoff",
    breakwaterLighthouseRescueReadiness: breakwater.rendererHandoff,
    counts: {
      ...(base.counts ?? {}),
      breakwaterLighthouse: breakwater.rendererHandoff.counts.total,
      total: Number(base.counts?.total ?? 0) + breakwater.rendererHandoff.counts.total
    }
  };
}

function patchGameHost(host) {
  if (!host || patchedHost === host) return true;
  const originalGetState = host.getState?.bind(host);
  const originalTick = host.tick?.bind(host);
  const originalApplyInput = host.applyInput?.bind(host);
  const originalGetRendererHandoff = host.getRendererHandoff?.bind(host);

  host.getBreakwaterLighthouseRescueReadiness = () => latestBreakwaterReadiness ?? describeBreakwater(originalGetState?.() ?? {});
  host.getVrBoardBreakwaterLighthouseRescueReadiness = host.getBreakwaterLighthouseRescueReadiness;
  host.getBreakwaterLighthouseRescueReadinessTree = () => breakwaterKit.tree;
  host.applyBreakwaterLighthouseInput = (input = {}) => describeBreakwater(originalGetState?.() ?? {}, input);
  host.getState = () => {
    const state = originalGetState?.() ?? {};
    const breakwater = describeBreakwater(state);
    return {
      ...state,
      breakwaterLighthouseReadiness: breakwater,
      domain: {
        ...(state.domain ?? {}),
        vrBoardBreakwaterLighthouseRescueReadiness: breakwater
      },
      runtimeSurface: {
        ...(state.runtimeSurface ?? {}),
        breakwaterLighthouse: runtimeSurface
      }
    };
  };
  host.tick = (dt) => {
    const result = originalTick?.(dt);
    const state = result ?? originalGetState?.() ?? {};
    describeBreakwater(state);
    return result ?? host.getState();
  };
  host.applyInput = (input = {}) => {
    const result = originalApplyInput?.(input);
    const state = result ?? originalGetState?.() ?? {};
    describeBreakwater(state, input);
    return result ?? host.getState();
  };
  host.getRendererHandoff = () => mergeRendererHandoff(originalGetRendererHandoff?.(), latestBreakwaterReadiness ?? describeBreakwater(originalGetState?.() ?? {}));
  patchedHost = host;
  describeBreakwater(originalGetState?.() ?? {});
  return true;
}

async function boot() {
  const NexusEngine = await import(NEXUS_URL);
  const createEngine = NexusEngine.createRealtimeGame ?? NexusEngine.createRealtimeEngine ?? NexusEngine.createEngine;
  runtimeSurface = { imported: true, factoryName: typeof createEngine === "function" ? (createEngine.name || "createEngine") : "namespace-only" };
  installPanel();
  const timer = setInterval(() => {
    if (patchGameHost(window.GameHost)) clearInterval(timer);
  }, 80);
}

boot().catch((error) => {
  console.warn("Breakwater lighthouse rescue pass failed to boot", error);
});

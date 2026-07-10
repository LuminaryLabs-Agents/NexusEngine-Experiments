import { createVrBoardHarborCraneEvacuationReadinessDomainKit } from "../_kits/vr-platformer-board/vr-board-harbor-crane-evacuation-readiness-kits.js";

const NEXUS_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const harborCraneKit = createVrBoardHarborCraneEvacuationReadinessDomainKit();

let latestHarborCraneReadiness = null;
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

function describeHarborCrane(state = getBaseState(), input = {}) {
  latestHarborCraneReadiness = harborCraneKit.describe({
    avatar: state.avatar,
    level: state.level,
    objects: state.objects,
    board: state.board,
    weather: state.weather,
    stormHarborReadiness: state.stormHarborReadiness ?? state.domain?.vrBoardStormHarborEvacuationReadiness,
    breakwaterLighthouseReadiness: state.breakwaterLighthouseReadiness ?? state.domain?.vrBoardBreakwaterLighthouseRescueReadiness,
    input,
    time: performance.now() / 1000
  });
  renderPanel(latestHarborCraneReadiness);
  return latestHarborCraneReadiness;
}

function installPanel() {
  if (panel || !document.body) return;
  const style = document.createElement("style");
  style.textContent = `
    #harborCranePanel {
      position: fixed;
      right: 16px;
      top: 68px;
      width: min(360px, calc(100vw - 32px));
      padding: 12px 14px;
      border-radius: 16px;
      border: 1px solid rgba(255, 216, 139, .24);
      background: linear-gradient(180deg, rgba(16, 11, 5, .76), rgba(4, 8, 17, .86));
      color: rgba(250, 245, 232, .9);
      font: 12px/1.45 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      box-shadow: 0 0 34px rgba(255, 174, 92, .13), inset 0 0 0 1px rgba(255,255,255,.04);
      backdrop-filter: blur(14px);
      pointer-events: none;
    }
    #harborCranePanel strong { display: block; color: #fff1c8; margin-bottom: 5px; letter-spacing: .04em; text-transform: uppercase; }
    #harborCranePanel .meter { height: 7px; margin: 7px 0 4px; border-radius: 999px; background: rgba(255,255,255,.13); overflow: hidden; }
    #harborCranePanel .meter span { display: block; height: 100%; width: var(--ready, 0%); background: linear-gradient(90deg, #ffd26d, #7dfff0); }
    #harborCranePanel small { color: rgba(235,228,205,.68); }
  `;
  document.head.append(style);
  panel = document.createElement("aside");
  panel.id = "harborCranePanel";
  panel.setAttribute("aria-label", "Harbor crane evacuation readiness");
  panel.innerHTML = "<strong>Harbor Crane</strong><span>Waiting for board state…</span>";
  document.body.append(panel);
}

function renderPanel(readiness) {
  installPanel();
  if (!panel || !readiness) return;
  const ledger = readiness.dawnCraneLedger;
  const percent = Math.round(clamp(readiness.evacuationReadiness) * 100);
  panel.innerHTML = `<strong>Harbor Crane</strong><span>${ledger.nextInstruction}</span><div class="meter" style="--ready:${percent}%"><span></span></div><small>${readiness.rendererHandoff.counts.total} descriptors · ${ledger.missionState} · tide ${Math.round(readiness.tideRisk * 100)}%</small>`;
}

function mergeRendererHandoff(base, harborCrane) {
  if (!harborCrane?.rendererHandoff) return base ?? null;
  if (!base) return { ...harborCrane.rendererHandoff, id: "vr-board-harbor-crane-composed-renderer-handoff", harborCraneEvacuationReadiness: harborCrane.rendererHandoff };
  return {
    ...base,
    id: "vr-board-storm-harbor-crane-composed-renderer-handoff",
    harborCraneEvacuationReadiness: harborCrane.rendererHandoff,
    counts: {
      ...(base.counts ?? {}),
      harborCraneEvacuation: harborCrane.rendererHandoff.counts.total,
      total: Number(base.counts?.total ?? 0) + harborCrane.rendererHandoff.counts.total
    }
  };
}

function patchGameHost(host) {
  if (!host) return false;
  if (patchedHost === host) return true;
  const originalGetState = host.getState?.bind(host);
  const originalTick = host.tick?.bind(host);
  const originalApplyInput = host.applyInput?.bind(host);
  const originalGetRendererHandoff = host.getRendererHandoff?.bind(host);

  host.getHarborCraneEvacuationReadiness = () => latestHarborCraneReadiness ?? describeHarborCrane(originalGetState?.() ?? {});
  host.getVrBoardHarborCraneEvacuationReadiness = host.getHarborCraneEvacuationReadiness;
  host.getHarborCraneEvacuationReadinessTree = () => harborCraneKit.tree;
  host.applyHarborCraneInput = (input = {}) => describeHarborCrane(originalGetState?.() ?? {}, input);
  host.getState = () => {
    const state = originalGetState?.() ?? {};
    const harborCrane = describeHarborCrane(state);
    return {
      ...state,
      harborCraneEvacuationReadiness: harborCrane,
      domain: {
        ...(state.domain ?? {}),
        vrBoardHarborCraneEvacuationReadiness: harborCrane
      },
      runtimeSurface: {
        ...(state.runtimeSurface ?? {}),
        harborCraneEvacuation: runtimeSurface
      }
    };
  };
  host.tick = (dt) => {
    const result = originalTick?.(dt);
    const state = result ?? originalGetState?.() ?? {};
    describeHarborCrane(state);
    return result ?? host.getState();
  };
  host.applyInput = (input = {}) => {
    const result = originalApplyInput?.(input);
    const state = result ?? originalGetState?.() ?? {};
    describeHarborCrane(state, input);
    return result ?? host.getState();
  };
  host.getRendererHandoff = () => mergeRendererHandoff(originalGetRendererHandoff?.(), latestHarborCraneReadiness ?? describeHarborCrane(originalGetState?.() ?? {}));
  patchedHost = host;
  describeHarborCrane(originalGetState?.() ?? {});
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
  console.warn("Harbor crane evacuation pass failed to boot", error);
});

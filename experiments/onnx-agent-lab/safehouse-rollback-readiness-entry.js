import { createOnnxSafehouseRollbackReadinessDomainKit } from "../_kits/onnx-agent-lab/onnx-safehouse-rollback-readiness-kits.js";

const NEXUS_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const safehouseKit = createOnnxSafehouseRollbackReadinessDomainKit({ seed: 317 });

let latestSafehouseReadiness = null;
let runtimeSurface = { imported: false, factoryName: "unloaded" };
let patchedHost = null;
let panel = null;

function baseState() {
  try {
    return globalThis.GameHost?.getState?.() ?? {};
  } catch {
    return {};
  }
}

function describeSafehouse(state = baseState(), input = {}) {
  latestSafehouseReadiness = safehouseKit.describe({
    redTeamEvacuationReadiness: state.readiness ?? state.redTeamEvacuationReadiness,
    rollbackKeys: state.rollbackKeys,
    sealedEvidence: state.sealedEvidence,
    quarantinedModels: state.quarantinedModels,
    operatorRest: state.operatorRest,
    sandboxIntegrity: state.sandboxIntegrity,
    evacuationPressure: state.pressure ?? state.evacuationPressure,
    drillReadiness: state.readinessScore ?? state.readiness?.readinessScore,
    action: input.action ?? input.selectedAction ?? state.selectedAction,
    seed: state.seed ?? 317
  });
  renderSafehousePanel(latestSafehouseReadiness);
  return latestSafehouseReadiness;
}

function installPanel() {
  if (panel || !document.body) return;
  const style = document.createElement("style");
  style.textContent = `
    #safehouseRollbackPanel {
      position: fixed;
      right: 16px;
      bottom: 16px;
      width: min(380px, calc(100vw - 32px));
      z-index: 20;
      padding: 13px 14px;
      border: 1px solid rgba(157, 251, 255, .24);
      border-radius: 18px;
      background: linear-gradient(180deg, rgba(5, 12, 26, .86), rgba(5, 5, 10, .92));
      color: rgba(248, 239, 227, .92);
      font: 12px/1.45 Inter, ui-sans-serif, system-ui, sans-serif;
      box-shadow: 0 0 42px rgba(157, 251, 255, .12), inset 0 0 0 1px rgba(255,255,255,.035);
      backdrop-filter: blur(14px);
      pointer-events: none;
    }
    #safehouseRollbackPanel strong {
      display: block;
      margin-bottom: 6px;
      color: #9dfbff;
      letter-spacing: .1em;
      text-transform: uppercase;
    }
    #safehouseRollbackPanel .safehouse-meter {
      height: 8px;
      margin: 8px 0 5px;
      border-radius: 999px;
      overflow: hidden;
      background: rgba(255,255,255,.12);
    }
    #safehouseRollbackPanel .safehouse-meter span {
      display: block;
      height: 100%;
      width: var(--ready, 0%);
      background: linear-gradient(90deg, #ff9d9d, #ffd979, #9dfbff);
    }
    #safehouseRollbackPanel small { color: rgba(174, 185, 198, .78); }
  `;
  document.head.append(style);
  panel = document.createElement("aside");
  panel.id = "safehouseRollbackPanel";
  panel.setAttribute("aria-label", "ONNX safehouse rollback readiness");
  panel.innerHTML = "<strong>Safehouse Rollback</strong><span>Waiting for red-team state…</span>";
  document.body.append(panel);
}

function renderSafehousePanel(readiness) {
  installPanel();
  if (!panel || !readiness) return;
  const percent = Math.round(readiness.safehouseReadiness * 100);
  panel.innerHTML = `<strong>Safehouse Rollback</strong><span>${readiness.dawnLedger.nextInstruction}</span><div class="safehouse-meter" style="--ready:${percent}%"><span></span></div><small>${readiness.rendererHandoff.counts.total} descriptors · ${readiness.missionState} · pressure ${Math.round(readiness.rollbackPressure * 100)}%</small>`;
}

function mergeRendererHandoff(base, safehouse) {
  if (!safehouse?.rendererHandoff) return base ?? null;
  if (!base) {
    return {
      ...safehouse.rendererHandoff,
      id: "onnx-safehouse-rollback-composed-renderer-handoff",
      safehouseRollbackReadiness: safehouse.rendererHandoff
    };
  }
  return {
    ...base,
    safehouseRollbackReadiness: safehouse.rendererHandoff,
    onnxSafehouseRollbackDescriptorCount: safehouse.rendererHandoff.counts.total,
    counts: {
      ...(base.counts ?? {}),
      safehouseRollback: safehouse.rendererHandoff.counts.total,
      total: Number(base.counts?.total ?? 0) + safehouse.rendererHandoff.counts.total
    }
  };
}

function patchHost(host) {
  if (!host) return false;
  if (patchedHost === host) return true;
  const originalGetState = host.getState?.bind(host);
  const originalTick = host.tick?.bind(host);
  const originalApply = host.applyRedTeamEvacuationInput?.bind(host);
  const originalHandoff = host.getRendererHandoff?.bind(host);

  host.getSafehouseRollbackReadiness = () => latestSafehouseReadiness ?? describeSafehouse(originalGetState?.() ?? {});
  host.getOnnxSafehouseRollbackReadiness = host.getSafehouseRollbackReadiness;
  host.getSafehouseRollbackReadinessTree = () => safehouseKit.domainTree;
  host.applySafehouseRollbackInput = (input = {}) => describeSafehouse(originalGetState?.() ?? {}, input);
  host.getState = () => {
    const state = originalGetState?.() ?? {};
    const safehouse = describeSafehouse(state);
    return {
      ...state,
      safehouseRollbackReadiness: safehouse,
      runtimeSurface: {
        ...(state.runtimeSurface ?? {}),
        safehouseRollback: runtimeSurface
      }
    };
  };
  host.tick = (delta) => {
    const result = originalTick?.(delta);
    describeSafehouse(result ?? originalGetState?.() ?? {});
    return result ?? host.getState();
  };
  host.applyRedTeamEvacuationInput = (action) => {
    const result = originalApply?.(action);
    describeSafehouse(originalGetState?.() ?? result ?? {}, { action });
    return result ?? host.getState();
  };
  host.getRendererHandoff = () => mergeRendererHandoff(originalHandoff?.(), latestSafehouseReadiness ?? describeSafehouse(originalGetState?.() ?? {}));
  patchedHost = host;
  describeSafehouse(originalGetState?.() ?? {});
  return true;
}

async function boot() {
  const NexusEngine = await import(NEXUS_URL);
  const createEngine = NexusEngine.createRealtimeGame ?? NexusEngine.createRealtimeEngine ?? NexusEngine.createNexusRuntime ?? NexusEngine.createEngine;
  runtimeSurface = { imported: true, factoryName: typeof createEngine === "function" ? (createEngine.name || "createEngine") : "namespace-only" };
  installPanel();
  const timer = setInterval(() => {
    if (patchHost(globalThis.GameHost)) clearInterval(timer);
  }, 80);
}

boot().catch((error) => {
  console.warn("ONNX safehouse rollback readiness failed to boot", error);
});

import { createLivingAgentCanalBucketBrigadeReadinessDomainKit } from "./canal-bucket-brigade-readiness-kits.js";
import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";

const PASS_ID = "canal-bucket-brigade-readiness-renderer-handoff-pass";
const kit = createLivingAgentCanalBucketBrigadeReadinessDomainKit();
const runtimeSurface = Object.freeze({
  imported: true,
  factoryName: typeof NexusEngine?.createNexusEngine === "function" ? "createNexusEngine" : "module"
});

let latestReadiness = null;
let patchedHost = null;
let panel = null;

function safeClone(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function baseState() {
  try {
    return globalThis.GameHost?.getState?.() ?? {};
  } catch {
    return {};
  }
}

function describe(state = baseState()) {
  latestReadiness = kit.describe(state);
  renderPanel(latestReadiness);
  return latestReadiness;
}

function installPanel() {
  if (panel || !document.body) return;
  const style = document.createElement("style");
  style.textContent = `
    .canal-brigade-panel {
      position: fixed;
      right: 16px;
      bottom: 206px;
      width: min(340px, calc(100vw - 32px));
      z-index: 5;
      pointer-events: none;
      border: 1px solid rgba(111,213,255,.22);
      border-radius: 18px;
      padding: 12px 13px;
      background: linear-gradient(180deg, rgba(5,16,24,.8), rgba(4,8,14,.88));
      color: rgba(235,248,255,.9);
      box-shadow: 0 20px 60px rgba(0,0,0,.34), inset 0 0 0 1px rgba(255,255,255,.035);
      backdrop-filter: blur(16px);
      font: 12px/1.42 Inter, ui-sans-serif, system-ui, sans-serif;
    }
    .canal-brigade-panel strong {
      display: block;
      color: #6fd5ff;
      font-size: 11px;
      letter-spacing: .12em;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .canal-brigade-panel .bar {
      height: 7px;
      overflow: hidden;
      border-radius: 999px;
      margin: 8px 0 5px;
      background: rgba(255,255,255,.12);
    }
    .canal-brigade-panel .bar span {
      display: block;
      height: 100%;
      width: var(--ready, 0%);
      background: linear-gradient(90deg, #6fd5ff, #8ff0be, #ffd06e);
    }
    .canal-brigade-panel small { color: rgba(218,235,245,.68); }
    @media (max-width: 940px) { .canal-brigade-panel { display: none; } }
  `;
  document.head.append(style);
  panel = document.createElement("aside");
  panel.className = "canal-brigade-panel";
  panel.dataset.pass = PASS_ID;
  panel.setAttribute("aria-label", "Canal bucket brigade readiness");
  panel.innerHTML = "<strong>Canal Bucket Brigade</strong><span>Waiting for market state…</span>";
  document.body.append(panel);
}

function renderPanel(readiness) {
  installPanel();
  if (!panel || !readiness) return;
  const ledger = readiness.dawnBrigadeLedger;
  const percent = Math.round(readiness.readiness * 100);
  panel.innerHTML = `<strong>Canal Bucket Brigade</strong><span>${ledger.nextInstruction}</span><div class="bar" style="--ready:${percent}%"><span></span></div><small>${readiness.rendererHandoff.counts.total} descriptors · ${ledger.missionState} · smoke ${Math.round(readiness.smokeRisk * 100)}%</small>`;
}

function mergeHandoff(base, brigade) {
  if (!brigade?.rendererHandoff) return base ?? null;
  if (!base) {
    return {
      ...brigade.rendererHandoff,
      id: "living-agent-canal-bucket-brigade-composed-renderer-handoff",
      runtimeSurface,
      canalBucketBrigade: safeClone(brigade.rendererHandoff)
    };
  }
  return {
    ...base,
    id: "living-agent-market-fire-canal-bucket-brigade-composed-renderer-handoff",
    canalBucketBrigade: safeClone(brigade.rendererHandoff),
    descriptors: {
      ...(base.descriptors ?? {}),
      canalBucketBrigade: safeClone(brigade.rendererHandoff.descriptors)
    },
    counts: {
      ...(base.counts ?? {}),
      canalBucketBrigadeDescriptors: brigade.rendererHandoff.counts.total,
      total: Number(base.counts?.total ?? 0) + brigade.rendererHandoff.counts.total
    }
  };
}

function patchHost(host) {
  if (!host) return false;
  if (patchedHost === host) return true;
  const originalGetState = host.getState?.bind(host);
  const originalApplyInput = host.applyInput?.bind(host);
  const originalRestart = host.restart?.bind(host);
  const originalGetRendererHandoff = host.getRendererHandoff?.bind(host);

  host.getCanalBucketBrigadeReadiness = () => safeClone(latestReadiness ?? describe(originalGetState?.() ?? {}));
  host.getLivingAgentCanalBucketBrigadeReadiness = host.getCanalBucketBrigadeReadiness;
  host.getCanalBucketBrigadeReadinessTree = () => kit.tree;
  host.applyCanalBucketBrigadeInput = (input = {}) => describe({ ...(originalGetState?.() ?? {}), ...input });
  host.getState = () => {
    const state = originalGetState?.() ?? {};
    const canalBucketBrigadeReadiness = describe(state);
    return {
      ...state,
      canalBucketBrigadeReadiness: safeClone(canalBucketBrigadeReadiness),
      domain: {
        ...(state.domain ?? {}),
        livingAgentCanalBucketBrigadeReadiness: safeClone(canalBucketBrigadeReadiness)
      },
      runtimeSurface: {
        ...(state.runtimeSurface ?? {}),
        canalBucketBrigade: runtimeSurface
      }
    };
  };
  host.applyInput = (action, source) => {
    const result = originalApplyInput?.(action, source);
    describe(originalGetState?.() ?? {});
    return result;
  };
  host.restart = () => {
    const result = originalRestart?.();
    describe(originalGetState?.() ?? {});
    return result;
  };
  host.getRendererHandoff = () => mergeHandoff(originalGetRendererHandoff?.(), latestReadiness ?? describe(originalGetState?.() ?? {}));
  patchedHost = host;
  describe(originalGetState?.() ?? {});
  return true;
}

function boot() {
  installPanel();
  const timer = setInterval(() => {
    if (patchHost(globalThis.GameHost)) clearInterval(timer);
  }, 80);
}

boot();

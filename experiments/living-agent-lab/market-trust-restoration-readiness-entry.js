import {
  LIVING_AGENT_MARKET_TRUST_RESTORATION_DOMAIN_TREE,
  createLivingAgentMarketTrustRestorationReadinessDomainKit
} from "./market-trust-restoration-readiness-kits.js";
import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";

const PASS_ID = "living-agent-market-trust-restoration-readiness-pass";
const kit = createLivingAgentMarketTrustRestorationReadinessDomainKit();
const runtimeSurface = {
  imported: true,
  factoryName: typeof NexusEngine?.createNexusEngine === "function" ? "createNexusEngine" : "module"
};

function clone(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function getHost() {
  return globalThis.GameHost ?? null;
}

function computeReadiness() {
  const host = getHost();
  const world = host?.getState?.() ?? {};
  return kit.describe({ world, runtimeSurface, time: performance.now() / 1000 });
}

function flattenDescriptors(readiness) {
  const descriptors = readiness?.rendererHandoff?.descriptors ?? {};
  return Object.values(descriptors).flatMap((bucket) => Array.isArray(bucket) ? bucket : []);
}

function installStyles() {
  if (document.getElementById("market-trust-restoration-style")) return;
  const style = document.createElement("style");
  style.id = "market-trust-restoration-style";
  style.textContent = `
    .market-trust-panel {
      position: fixed;
      left: 14px;
      top: 96px;
      width: min(350px, calc(100vw - 28px));
      display: grid;
      gap: 8px;
      z-index: 5;
      padding: 12px;
      border: 1px solid rgba(141,242,189,.30);
      border-radius: 18px;
      background: rgba(4, 9, 8, .72);
      color: #f7f3df;
      box-shadow: 0 18px 60px rgba(0,0,0,.32);
      backdrop-filter: blur(16px);
      pointer-events: none;
      font: 12px Inter, ui-sans-serif, system-ui, sans-serif;
    }
    .market-trust-panel strong {
      color: #8df2bd;
      font-size: 11px;
      letter-spacing: .12em;
      text-transform: uppercase;
    }
    .market-trust-panel .market-trust-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 6px;
    }
    .market-trust-panel span {
      display: block;
      border: 1px solid rgba(255,227,109,.18);
      border-radius: 12px;
      padding: 7px;
      background: rgba(255,227,109,.055);
      color: rgba(247,243,223,.88);
    }
    .market-trust-marker {
      position: fixed;
      z-index: 4;
      width: 10px;
      height: 10px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,.76);
      background: #8df2bd;
      box-shadow: 0 0 20px rgba(141,242,189,.65);
      transform: translate(-50%, -50%);
      pointer-events: none;
    }
    .market-trust-marker[data-kind*="evidence"] { background: #ffe36d; box-shadow: 0 0 20px rgba(255,227,109,.62); }
    .market-trust-marker[data-kind*="permit"] { background: #83d8ff; box-shadow: 0 0 20px rgba(131,216,255,.62); }
    .market-trust-marker[data-kind*="crowd"] { width: 18px; height: 18px; background: transparent; border-color: rgba(255,227,109,.55); }
    @media (max-width: 760px) {
      .market-trust-panel { top: auto; bottom: 170px; }
    }
  `;
  document.head.append(style);
}

function installPanel() {
  installStyles();
  let panel = document.getElementById("marketTrustRestoration");
  if (!panel) {
    panel = document.createElement("aside");
    panel.id = "marketTrustRestoration";
    panel.className = "market-trust-panel";
    panel.setAttribute("aria-label", "Market trust restoration readiness descriptors");
    document.body.append(panel);
  }
  return panel;
}

function installMarkers() {
  let layer = document.getElementById("marketTrustMarkers");
  if (!layer) {
    layer = document.createElement("div");
    layer.id = "marketTrustMarkers";
    layer.setAttribute("aria-hidden", "true");
    document.body.append(layer);
  }
  return layer;
}

function renderReadiness(readiness) {
  const panel = installPanel();
  const handoff = readiness.rendererHandoff;
  panel.innerHTML = `
    <strong>Market trust restoration</strong>
    <div class="market-trust-grid">
      <span>phase<br><b>${readiness.phase}</b></span>
      <span>trust<br><b>${Math.round(readiness.trustScore * 100)}%</b></span>
      <span>descriptors<br><b>${handoff.counts.total}</b></span>
    </div>
    <span>next: <b>${readiness.recommendedAction}</b></span>
  `;

  const layer = installMarkers();
  const descriptors = flattenDescriptors(readiness).slice(0, 9);
  layer.replaceChildren(...descriptors.map((descriptor) => {
    const marker = document.createElement("i");
    marker.className = "market-trust-marker";
    marker.dataset.kind = descriptor.kind ?? "descriptor";
    const point = descriptor.from ?? descriptor.to ?? descriptor.points?.[0] ?? descriptor;
    marker.style.left = `${Number(point.x ?? 0)}px`;
    marker.style.top = `${Number(point.y ?? 0)}px`;
    marker.title = descriptor.label ?? descriptor.id ?? "trust descriptor";
    return marker;
  }));
}

function patchGameHost() {
  const host = getHost();
  if (!host || host.__marketTrustRestorationPatched) return false;

  const previousRendererHandoff = typeof host.getRendererHandoff === "function"
    ? host.getRendererHandoff.bind(host)
    : null;

  host.getLivingAgentMarketTrustRestorationReadiness = () => clone(computeReadiness());
  host.getMarketTrustRestorationReadiness = host.getLivingAgentMarketTrustRestorationReadiness;
  host.getMarketTrustRestorationReadinessTree = () => LIVING_AGENT_MARKET_TRUST_RESTORATION_DOMAIN_TREE;
  host.getRendererHandoff = () => {
    const base = previousRendererHandoff?.() ?? {};
    const readiness = computeReadiness();
    const marketTrust = readiness.rendererHandoff;
    return {
      ...base,
      id: "living-agent-composed-renderer-handoff",
      runtimeSurface,
      marketTrustRestoration: marketTrust,
      descriptors: {
        ...(base.descriptors ?? {}),
        marketTrustRestoration: marketTrust.descriptors
      },
      counts: {
        ...(base.counts ?? {}),
        marketTrustRestorationDescriptors: marketTrust.counts.total,
        total: (base.counts?.total ?? 0) + marketTrust.counts.total
      }
    };
  };
  host.__marketTrustRestorationPatched = true;
  document.body.dataset.marketTrustRestoration = PASS_ID;
  return true;
}

function frame() {
  if (patchGameHost()) {
    renderReadiness(computeReadiness());
  } else if (getHost()?.__marketTrustRestorationPatched) {
    renderReadiness(computeReadiness());
  }
  requestAnimationFrame(frame);
}

frame();

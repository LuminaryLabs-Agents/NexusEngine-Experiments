import { createLivingAgentMarketGuardianReadinessDomainKit } from "../kits/living-agent-market-guardian-readiness-domain-kit.js";

const NEXUS_ENGINE_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, n(value, min)));

let NexusEngine = null;
try {
  NexusEngine = await import(NEXUS_ENGINE_URL);
} catch (error) {
  console.warn("NexusEngine CDN unavailable; market guardian descriptors remain local", error);
}

const marketGuardianDomain = createLivingAgentMarketGuardianReadinessDomainKit();
const runtimeDescriptor = {
  source: NEXUS_ENGINE_URL,
  ok: Boolean(NexusEngine),
  exports: NexusEngine ? Object.keys(NexusEngine).slice(0, 24) : []
};

function currentActions(world = {}) {
  const actions = ["patrol market", "warn player", "question merchant"];
  if (world.apple?.stolen) actions.push("accuse player");
  if (!world.apple?.stolen && world.gate?.locked !== false) actions.push("unlock gate");
  return actions;
}

function visibleState(world = {}) {
  return [
    "The guard can see the player in the market.",
    `Apple stolen: ${Boolean(world.apple?.stolen)}.`,
    `Gate locked: ${world.gate?.locked !== false}.`,
    `Merchant mood: ${world.merchant?.mood ?? "neutral"}.`,
    `Guard mood: ${world.guard?.mood ?? "calm"}.`,
    `Recent facts: ${(world.facts ?? []).slice(0, 5).join("; ")}.`
  ].join(" ");
}

function buildMarketGuardianInput(state = {}) {
  const world = state.world ?? state;
  return {
    time: n(world.tick) / 60,
    world,
    model: world.model,
    vision: visibleState(world),
    actions: currentActions(world),
    lastChoice: world.lastChoice
  };
}

function makeOverlay() {
  const root = document.createElement("section");
  root.id = "living-agent-market-guardian-readiness";
  root.dataset.rendererConsumes = "descriptors-only";
  root.setAttribute("aria-label", "Living Agent market guardian readiness overlay");
  root.innerHTML = `
    <style>
      #living-agent-market-guardian-readiness{position:fixed;left:14px;top:68px;z-index:5;width:min(360px,calc(100vw - 28px));padding:12px 14px;border:1px solid rgba(255,227,109,.28);border-radius:18px;background:rgba(4,8,7,.74);color:#f7f3df;font:12px/1.35 Inter,ui-sans-serif,system-ui,sans-serif;box-shadow:0 18px 60px rgba(0,0,0,.34);pointer-events:none;-webkit-backdrop-filter:blur(16px) saturate(1.2);backdrop-filter:blur(16px) saturate(1.2)}
      #living-agent-market-guardian-readiness .title{font-weight:950;color:#ffe36d;letter-spacing:.06em;text-transform:uppercase;margin-bottom:7px}
      #living-agent-market-guardian-readiness .meter{height:8px;border-radius:999px;background:rgba(255,255,255,.1);overflow:hidden;margin:6px 0 10px}
      #living-agent-market-guardian-readiness .meter i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#83d8ff,#ffe36d,#8df2bd);width:0%}
      #living-agent-market-guardian-readiness .row{display:grid;grid-template-columns:1fr auto;gap:8px;padding:4px 0;border-top:1px solid rgba(255,255,255,.08)}
      #living-agent-market-guardian-readiness .muted{color:rgba(247,243,223,.62)}
      #living-agent-market-guardian-readiness .warn{color:#ffb285}
    </style>
    <div class="title">Market Guardian</div>
    <div class="meter"><i data-meter></i></div>
    <div data-rows></div>`;
  document.body.append(root);
  return root;
}

function renderOverlay(root, domain) {
  const rows = root.querySelector("[data-rows]");
  const meter = root.querySelector("[data-meter]");
  const handoff = domain?.rendererHandoff?.descriptors ?? {};
  const sightline = handoff.guardSightlines?.[0];
  const statement = handoff.witnessStatements?.[0];
  const threshold = handoff.accusationThresholds?.[0];
  const gate = handoff.gateDutyChecks?.[0];
  const readiness = clamp(domain?.summary?.readiness ?? 0.1);
  meter.style.width = `${Math.round(readiness * 100)}%`;
  rows.innerHTML = [
    ["Watch", sightline?.status ?? "mapping", sightline ? `${Math.round(sightline.visibility * 100)}%` : "--", sightline?.status === "blind-spot"],
    ["Witness", statement?.status ?? "quiet", statement ? `${Math.round(statement.credibility * 100)}%` : "--", statement?.status === "weak"],
    ["Choice", threshold?.recommendedAction ?? "observe", threshold ? `${Math.round(threshold.pressure * 100)}%` : "--", threshold?.status === "ready-to-accuse"],
    ["Gate", gate?.status ?? "hold", gate ? `${Math.round(gate.releaseConfidence * 100)}%` : "--", gate?.status === "hold-gate"]
  ].map(([label, value, stat, warn]) => `<div class="row"><span><span class="muted">${label}</span> <span class="${warn ? "warn" : ""}">${value}</span></span><strong>${stat}</strong></div>`).join("");
}

function composeHandoff(base, guardian) {
  const descriptors = { ...(base?.descriptors ?? {}), ...(guardian?.rendererHandoff?.descriptors ?? {}) };
  const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, Array.isArray(value) ? value.length : value ? 1 : 0]));
  counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  return {
    id: "living-agent-market-guardian-composed-handoff",
    rendererConsumes: "descriptors-only",
    descriptors,
    counts,
    baseHandoff: clone(base),
    marketGuardianHandoff: clone(guardian?.rendererHandoff),
    runtime: runtimeDescriptor
  };
}

function patchHost(host, overlay) {
  if (host.__livingAgentMarketGuardianPatched) return;
  const originalGetState = host.getState?.bind(host);
  const originalGetRendererHandoff = host.getRendererHandoff?.bind(host);
  let current = null;
  function update() {
    const state = originalGetState?.() ?? {};
    current = marketGuardianDomain.describe(buildMarketGuardianInput(state));
    renderOverlay(overlay, current);
    requestAnimationFrame(update);
  }
  host.marketGuardianReadinessDomain = marketGuardianDomain;
  host.getMarketGuardianReadiness = () => clone(current);
  host.getLivingAgentMarketGuardianReadiness = () => clone(current);
  host.getMarketGuardianReadinessTree = () => clone(marketGuardianDomain.domainTree);
  host.getRendererHandoff = () => composeHandoff(originalGetRendererHandoff?.(), current);
  host.getState = () => {
    const state = originalGetState?.() ?? {};
    return {
      ...state,
      marketGuardianReadiness: clone(current),
      domain: {
        ...(state.domain ?? {}),
        livingAgentMarketGuardian: clone(current)
      },
      rendererHandoff: composeHandoff(originalGetRendererHandoff?.(), current)
    };
  };
  host.__livingAgentMarketGuardianPatched = true;
  document.body.dataset.livingAgentMarketGuardianReadiness = "enabled";
  update();
}

function waitForHost() {
  const overlay = makeOverlay();
  const tick = () => {
    if (globalThis.GameHost?.getState) {
      patchHost(globalThis.GameHost, overlay);
      return;
    }
    requestAnimationFrame(tick);
  };
  tick();
}

waitForHost();

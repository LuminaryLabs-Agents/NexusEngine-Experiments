import * as NexusEngineRuntime from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import {
  PEER_SCENE_WITNESS_SHELTER_READINESS_DOMAIN_TREE,
  createSceneWitnessShelterReadinessDomainKit
} from "../../_kits/peer-scene-transition/peer-scene-witness-shelter-readiness-kits.js";

const NEXUS_ENGINE_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
const OLD_NEXUS_REALTIME_CDN = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js";

function stableArray(value) {
  return Array.isArray(value) ? [...value] : [];
}

function sceneId() {
  return document.querySelector("#app")?.dataset.scene ?? "camp";
}

function safeState(host) {
  try {
    return host?.getState?.() ?? {};
  } catch {
    return {};
  }
}

function createManifestKit(scenes) {
  return {
    get(id) {
      return scenes[id] ?? scenes.camp ?? {};
    },
    list() {
      return Object.entries(scenes).map(([id, scene]) => ({ id, ...scene }));
    }
  };
}

function createInventoryKit() {
  return {
    missing(state, requirements = []) {
      const tokens = new Set([
        ...stableArray(state?.tokens),
        ...stableArray(state?.inventory),
        ...Object.keys(state?.flags ?? {}).filter((key) => state.flags[key])
      ]);
      return stableArray(requirements).filter((requirement) => !tokens.has(requirement));
    }
  };
}

function createActionKit() {
  return {
    list(id, state) {
      const tokens = new Set([
        ...stableArray(state?.tokens),
        ...stableArray(state?.inventory),
        ...Object.keys(state?.flags ?? {}).filter((key) => state.flags[key])
      ]);
      const local = {
        camp: [
          { id: "check-camp-witnesses", label: "Check camp witnesses", blocked: false, done: tokens.has("camp-witness-safe"), missing: [] },
          { id: "warm-shelter", label: "Warm shelter hearth", blocked: false, done: tokens.has("shelter-warm"), missing: [] }
        ],
        crossroads: [
          { id: "tie-road-markers", label: "Tie road markers", blocked: !tokens.has("has-lantern"), done: tokens.has("road-marked"), missing: ["has-lantern"] }
        ],
        forest: [
          { id: "light-watch-posts", label: "Light watch posts", blocked: !tokens.has("has-lantern"), done: tokens.has("forest-lit"), missing: ["has-lantern"] }
        ],
        bridge: [
          { id: "escort-across-bridge", label: "Escort witnesses across bridge", blocked: !tokens.has("has-rope"), done: tokens.has("bridge-repaired"), missing: ["has-rope"] }
        ],
        shrine: [
          { id: "seal-testimony", label: "Seal dawn testimony", blocked: !tokens.has("shrine-open"), done: tokens.has("dawn-testimony-sealed"), missing: ["shrine-open"] }
        ]
      };
      return local[id] ?? [{ id: "survey-scene", label: "Survey scene", blocked: false, done: false, missing: [] }];
    }
  };
}

function ensurePanel() {
  let panel = document.querySelector("#witness-shelter-panel");
  if (!panel) {
    panel = document.createElement("section");
    panel.id = "witness-shelter-panel";
    panel.className = "panel witness-shelter-panel";
    document.querySelector("#app")?.append(panel);
  }
  return panel;
}

function installStyles() {
  if (document.querySelector("#witness-shelter-style")) return;
  const style = document.createElement("style");
  style.id = "witness-shelter-style";
  style.textContent = `
    .witness-shelter-panel .readiness-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(116px,1fr));gap:.55rem;margin-top:.65rem}
    .witness-shelter-panel b{display:block;border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:.42rem .56rem;background:rgba(255,255,255,.07);font-size:.78rem}
    .witness-shelter-panel .ready{box-shadow:0 0 18px rgba(255,214,128,.18)}
    .witness-shelter-panel .watch{opacity:.82}
    .witness-shelter-strip{display:flex;flex-wrap:wrap;gap:.35rem;margin-top:.6rem}
    .witness-shelter-strip span{font-size:.7rem;border-radius:999px;padding:.22rem .44rem;background:rgba(0,0,0,.25)}
    .witness-shelter-field{position:absolute;inset:0;pointer-events:none;z-index:9}
    .witness-shelter-field i{position:absolute;width:10px;height:10px;border-radius:999px;background:var(--scene-b,#ffd166);box-shadow:0 0 18px currentColor;opacity:.78;transform:translate(-50%,-50%)}
  `;
  document.head.append(style);
}

function renderStageMarkers(handoff) {
  const stage = document.querySelector("#scene-stage");
  if (!stage) return;
  let field = stage.querySelector(".witness-shelter-field");
  if (!field) {
    field = document.createElement("div");
    field.className = "witness-shelter-field";
    stage.append(field);
  }
  const lanterns = handoff.descriptors.forestWatchLanterns.slice(0, 5);
  const witnesses = handoff.descriptors.lostWitnessTrails.slice(0, 5);
  field.innerHTML = [
    ...lanterns.map((lantern) => `<i title="${lantern.label}" style="left:${lantern.x}%;top:${lantern.y}%;opacity:${0.35 + lantern.clarity * 0.55}"></i>`),
    ...witnesses.map((witness) => `<i title="${witness.label}" style="left:${witness.x}%;top:${witness.y}%;opacity:${0.3 + witness.urgency * 0.6};background:var(--scene-c,#f8fafc)"></i>`)
  ].join("");
}

function renderPanel(handoff) {
  installStyles();
  const panel = ensurePanel();
  const counts = handoff.counts;
  const warm = handoff.descriptors.shelterHearths.filter((hearth) => hearth.status === "warm").length;
  const openRopes = handoff.descriptors.bridgeEscortRopes.filter((rope) => rope.open).length;
  const sealed = handoff.descriptors.evidenceBundleSeals.filter((seal) => seal.state === "sealed").length;
  const testimony = handoff.descriptors.dawnTestimonyQueue.filter((entry) => entry.readiness > 0.55).length;
  panel.innerHTML = `
    <h2>Witness shelter readiness</h2>
    <p class="message good">Shelter loop: find witnesses, warm safe points, rope crossings, light watch posts, seal evidence, and queue dawn testimony.</p>
    <div class="readiness-grid">
      <b class="${counts.lostWitnessTrails ? "ready" : "watch"}">Witness trails ${counts.lostWitnessTrails}</b>
      <b class="${warm ? "ready" : "watch"}">Warm hearths ${warm}/${counts.shelterHearths}</b>
      <b class="${openRopes ? "ready" : "watch"}">Escort ropes ${openRopes}/${counts.bridgeEscortRopes}</b>
      <b class="${counts.forestWatchLanterns ? "ready" : "watch"}">Watch lanterns ${counts.forestWatchLanterns}</b>
      <b class="${sealed ? "ready" : "watch"}">Evidence seals ${sealed}/${counts.evidenceBundleSeals}</b>
      <b class="${testimony ? "ready" : "watch"}">Dawn testimony ${testimony}/${counts.dawnTestimonyQueue}</b>
    </div>
    <div class="witness-shelter-strip">
      ${handoff.descriptors.lostWitnessTrails.slice(0, 4).map((trail) => `<span>${trail.status}: ${trail.targetSceneId}</span>`).join("")}
      ${handoff.descriptors.bridgeEscortRopes.slice(0, 3).map((rope) => `<span>${rope.open ? "open" : "need"}: ${rope.to}</span>`).join("")}
    </div>
  `;
  renderStageMarkers(handoff);
}

async function install() {
  const scenes = await fetch("./scenes.json", { cache: "no-store" }).then((response) => response.json());
  const domainKit = createSceneWitnessShelterReadinessDomainKit({
    manifestKit: createManifestKit(scenes),
    inventoryKit: createInventoryKit(),
    actionKit: createActionKit()
  });

  const patch = () => {
    const host = globalThis.GameHost;
    if (!host || host.__witnessShelterReadinessPatched) return false;
    const originalGetRendererHandoff = host.getRendererHandoff?.bind(host);
    const describe = () => domainKit.describe(sceneId(), safeState(host), { baseHandoff: { id: "peer-scene-base" } });
    host.getWitnessShelterReadinessDomain = () => domainKit.snapshot(sceneId(), safeState(host));
    host.getWitnessShelterReadiness = () => describe();
    host.getPeerSceneWitnessShelterReadiness = () => describe();
    host.getWitnessShelterReadinessTree = () => PEER_SCENE_WITNESS_SHELTER_READINESS_DOMAIN_TREE;
    host.getRendererHandoff = () => {
      const base = originalGetRendererHandoff?.() ?? {};
      const witnessShelter = describe();
      return {
        ...base,
        witnessShelterReadiness: witnessShelter.counts,
        witnessShelterDescriptorCount: witnessShelter.descriptorCount
      };
    };
    host.witnessShelterReadinessCdn = NEXUS_ENGINE_CDN;
    host.witnessShelterReadinessExports = Object.keys(NexusEngineRuntime).slice(0, 12);
    host.__witnessShelterReadinessPatched = true;
    renderPanel(describe());
    return true;
  };

  if (!patch()) {
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (patch() || attempts > 40) clearInterval(timer);
    }, 50);
  }

  document.addEventListener("click", () => {
    queueMicrotask(() => {
      const host = globalThis.GameHost;
      if (host?.getWitnessShelterReadiness) renderPanel(host.getWitnessShelterReadiness());
    });
  }, true);

  globalThis.__peerSceneWitnessShelterReadiness = {
    cdn: NEXUS_ENGINE_CDN,
    oldRuntime: OLD_NEXUS_REALTIME_CDN,
    tree: PEER_SCENE_WITNESS_SHELTER_READINESS_DOMAIN_TREE.root
  };
}

install();

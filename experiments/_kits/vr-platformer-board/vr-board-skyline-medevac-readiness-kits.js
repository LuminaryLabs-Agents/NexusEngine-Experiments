function list(value) {
  return Array.isArray(value) ? value : [];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function clamp01(value) {
  return clamp(value, 0, 1);
}

function round(value) {
  return Number((Number(value) || 0).toFixed(3));
}

function midX(platform = {}) {
  return Number(platform.x ?? 0) + Number(platform.w ?? 1) * 0.5;
}

function topY(platform = {}) {
  return Number(platform.y ?? 0);
}

function avatarCenter(avatar = {}) {
  return {
    x: Number(avatar.position?.x ?? 0) + Number(avatar.size?.x ?? 0.48) * 0.5,
    y: Number(avatar.position?.y ?? 0) + Number(avatar.size?.y ?? 0.78) * 0.5
  };
}

function progressOf(avatar = {}, level = {}) {
  const start = Number(level.start?.x ?? 0);
  const exit = Number(level.exit?.x ?? 12);
  return clamp01((avatarCenter(avatar).x - start) / Math.max(1, exit - start));
}

function hazardPressure(x, level = {}) {
  const hazards = list(level.hazards);
  if (!hazards.length) return 0.12;
  const nearest = hazards.reduce((best, hazard) => Math.min(best, Math.abs(Number(hazard.x ?? 0) - x)), 99);
  return clamp01(0.12 + Math.max(0, 1.8 - nearest) * 0.34);
}

function remainingCollectibles(level = {}, objects = {}) {
  const collected = new Set(list(objects.collectedIds));
  return list(level.collectibles).filter((coin) => !collected.has(coin.id));
}

function contract(owner) {
  return {
    owner,
    rendererConsumes: "serializable skyline medevac descriptors only",
    rendererMustOwn: ["canvas drawing", "DOM placement", "view interpolation", "color application"],
    rendererMustNotOwn: ["simulation state", "XR input", "browser input", "collision", "platformer physics", "objective sequence", "asset loading", "audio", "frame loop", "Three.js", "WebGL"]
  };
}

export const VR_BOARD_SKYLINE_MEDEVAC_READINESS_DOMAIN_TREE = Object.freeze({
  root: "vr-board-skyline-medevac-readiness-domain",
  subdomains: [
    {
      id: "tether-routing-domain",
      subdomains: [
        { id: "anchor-pylon-domain", kits: ["vr-board-anchor-pylon-kit"] },
        { id: "harness-thread-domain", kits: ["vr-board-harness-thread-kit"] }
      ]
    },
    {
      id: "airborne-risk-domain",
      subdomains: [
        { id: "crosswind-ribbon-domain", kits: ["vr-board-crosswind-ribbon-kit"] },
        { id: "oxygen-canister-domain", kits: ["vr-board-oxygen-canister-kit"] }
      ]
    },
    {
      id: "evacuation-handoff-domain",
      subdomains: [
        { id: "medevac-pod-domain", kits: ["vr-board-medevac-pod-kit"] },
        { id: "evac-manifest-domain", kits: ["vr-board-evac-manifest-kit"] }
      ]
    },
    { id: "renderer-handoff", kits: ["vr-board-skyline-medevac-renderer-handoff-kit"], contract: "renderer consumes descriptors only" }
  ],
  contract: "renderer consumes skyline medevac descriptors only; no DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop ownership"
});

export function createVrBoardAnchorPylonKit() {
  return {
    id: "n-vr-board-anchor-pylon-kit",
    domain: "vr-board-skyline-medevac-readiness/anchor-pylon",
    describe(input = {}) {
      const progress = progressOf(input.avatar, input.level);
      return list(input.level?.platforms).map((platform, index) => {
        const x = midX(platform);
        const strain = hazardPressure(x, input.level);
        const charge = clamp01(0.42 + progress * 0.28 + Math.sin(Number(input.time) * 0.8 + index) * 0.06 - strain * 0.18);
        return { id: `anchor-pylon-${platform.id ?? index}`, kind: "anchor-pylon", platformId: platform.id ?? `platform-${index}`, x: round(x), y: round(topY(platform) + 0.95), charge: round(charge), strain: round(strain), status: charge > 0.62 ? "locked" : strain > 0.58 ? "strained" : "arming", rendererContract: contract("vr-board-anchor-pylon-kit") };
      });
    }
  };
}

export function createVrBoardHarnessThreadKit() {
  return {
    id: "n-vr-board-harness-thread-kit",
    domain: "vr-board-skyline-medevac-readiness/harness-thread",
    describe(input = {}) {
      const progress = progressOf(input.avatar, input.level);
      const collected = list(input.objects?.collectedIds).length;
      const platforms = list(input.level?.platforms);
      return platforms.slice(0, -1).map((platform, index) => {
        const next = platforms[index + 1];
        const risk = hazardPressure((midX(platform) + midX(next)) * 0.5, input.level);
        const slack = clamp01(0.34 + risk * 0.44 - progress * 0.14 - collected * 0.035);
        return { id: `harness-thread-${platform.id ?? index}-to-${next.id ?? index + 1}`, kind: "harness-thread", from: platform.id ?? `platform-${index}`, to: next.id ?? `platform-${index + 1}`, x1: round(midX(platform)), y1: round(topY(platform) + 0.78), x2: round(midX(next)), y2: round(topY(next) + 0.78), slack: round(slack), priority: round(clamp01(1 - slack * 0.62)), rendererContract: contract("vr-board-harness-thread-kit") };
      });
    }
  };
}

export function createVrBoardCrosswindRibbonKit() {
  return {
    id: "n-vr-board-crosswind-ribbon-kit",
    domain: "vr-board-skyline-medevac-readiness/crosswind-ribbon",
    describe(input = {}) {
      const headDrift = Math.abs(Number(input.xrPose?.head?.position?.x ?? 0));
      const progress = progressOf(input.avatar, input.level);
      return list(input.level?.hazards).map((hazard, index) => {
        const gust = clamp01(0.3 + Math.sin(Number(input.time) * 1.4 + index * 1.7) * 0.18 + progress * 0.24 + headDrift * 0.9);
        return { id: `crosswind-ribbon-${hazard.id ?? index}`, kind: "crosswind-ribbon", hazardId: hazard.id ?? `hazard-${index}`, x: round(Number(hazard.x ?? 0) + Number(hazard.w ?? 0.5) * 0.5), y: round(Number(hazard.y ?? 0) + 1.35), width: round(0.75 + gust * 0.8), gust: round(gust), phase: gust > 0.64 ? "hold" : "cross", rendererContract: contract("vr-board-crosswind-ribbon-kit") };
      });
    }
  };
}

export function createVrBoardOxygenCanisterKit() {
  return {
    id: "n-vr-board-oxygen-canister-kit",
    domain: "vr-board-skyline-medevac-readiness/oxygen-canister",
    describe(input = {}) {
      const missing = new Set(remainingCollectibles(input.level, input.objects).map((coin) => coin.id));
      return list(input.level?.collectibles).map((coin, index) => {
        const available = missing.has(coin.id);
        const pressure = clamp01((available ? 0.72 : 0.28) + Math.sin(Number(input.time) + index) * 0.04);
        return { id: `oxygen-canister-${coin.id ?? index}`, kind: "oxygen-canister", collectibleId: coin.id ?? `collectible-${index}`, x: round(Number(coin.x ?? 0) - 0.28), y: round(Number(coin.y ?? 0) + 0.32), pressure: round(pressure), available, cue: available ? "recover" : "secured", rendererContract: contract("vr-board-oxygen-canister-kit") };
      });
    }
  };
}

export function createVrBoardMedevacPodKit() {
  return {
    id: "n-vr-board-medevac-pod-kit",
    domain: "vr-board-skyline-medevac-readiness/medevac-pod",
    describe(input = {}) {
      const progress = progressOf(input.avatar, input.level);
      const ratio = list(input.objects?.collectedIds).length / Math.max(1, list(input.level?.collectibles).length);
      const readiness = clamp01(0.18 + progress * 0.44 + ratio * 0.38);
      const exit = input.level?.exit ?? {};
      return [{ id: `medevac-pod-${exit.id ?? "exit"}`, kind: "medevac-pod", x: round(Number(exit.x ?? 12) + Number(exit.w ?? 0.8) * 0.5), y: round(Number(exit.y ?? 2) + Number(exit.h ?? 1) * 0.72), readiness: round(readiness), phase: readiness > 0.78 ? "launch" : readiness > 0.45 ? "staging" : "waiting", rendererContract: contract("vr-board-medevac-pod-kit") }];
    }
  };
}

export function createVrBoardEvacManifestKit() {
  return {
    id: "n-vr-board-evac-manifest-kit",
    domain: "vr-board-skyline-medevac-readiness/evac-manifest",
    describe(input = {}) {
      const total = list(input.level?.collectibles).length;
      const secured = list(input.objects?.collectedIds).length;
      const progress = progressOf(input.avatar, input.level);
      const headDrift = Math.abs(Number(input.xrPose?.head?.position?.x ?? 0));
      const readiness = clamp01(0.16 + progress * 0.34 + secured / Math.max(1, total) * 0.42 - headDrift * 0.18);
      return { id: "skyline-medevac-manifest", kind: "evac-manifest", secured, remaining: Math.max(0, total - secured), readiness: round(readiness), phase: readiness > 0.82 ? "evacuate" : readiness > 0.52 ? "marshal" : "recover", nextInstruction: total - secured > 0 ? "recover oxygen canisters" : progress > 0.8 ? "hold medevac pod" : "advance along tether pylons", rendererContract: contract("vr-board-evac-manifest-kit") };
    }
  };
}

export function createVrBoardSkylineMedevacRendererHandoffKit() {
  return {
    id: "n-vr-board-skyline-medevac-renderer-handoff-kit",
    domain: "vr-board-skyline-medevac-readiness/renderer-handoff",
    describe(parts = {}) {
      const descriptors = {
        anchorPylons: list(parts.anchorPylons),
        harnessThreads: list(parts.harnessThreads),
        crosswindRibbons: list(parts.crosswindRibbons),
        oxygenCanisters: list(parts.oxygenCanisters),
        medevacPods: list(parts.medevacPods),
        evacManifest: parts.evacManifest ?? null
      };
      const counts = { anchorPylons: descriptors.anchorPylons.length, harnessThreads: descriptors.harnessThreads.length, crosswindRibbons: descriptors.crosswindRibbons.length, oxygenCanisters: descriptors.oxygenCanisters.length, medevacPods: descriptors.medevacPods.length, manifests: descriptors.evacManifest ? 1 : 0 };
      counts.total = Object.values(counts).reduce((sum, value) => sum + Number(value || 0), 0);
      return { id: "vr-board-skyline-medevac-renderer-handoff", kind: "renderer-handoff", descriptors, counts, rendererContract: contract("vr-board-skyline-medevac-renderer-handoff-kit") };
    }
  };
}

export function createVrBoardSkylineMedevacReadinessDomainKit() {
  const anchorPylonKit = createVrBoardAnchorPylonKit();
  const harnessThreadKit = createVrBoardHarnessThreadKit();
  const crosswindRibbonKit = createVrBoardCrosswindRibbonKit();
  const oxygenCanisterKit = createVrBoardOxygenCanisterKit();
  const medevacPodKit = createVrBoardMedevacPodKit();
  const evacManifestKit = createVrBoardEvacManifestKit();
  const rendererHandoffKit = createVrBoardSkylineMedevacRendererHandoffKit();
  return {
    id: "n-vr-board-skyline-medevac-readiness-domain-kit",
    domain: "vr-board-skyline-medevac-readiness",
    tree: VR_BOARD_SKYLINE_MEDEVAC_READINESS_DOMAIN_TREE,
    describe(input = {}) {
      const anchorPylons = anchorPylonKit.describe(input);
      const harnessThreads = harnessThreadKit.describe(input);
      const crosswindRibbons = crosswindRibbonKit.describe(input);
      const oxygenCanisters = oxygenCanisterKit.describe(input);
      const medevacPods = medevacPodKit.describe(input);
      const evacManifest = evacManifestKit.describe(input);
      const rendererHandoff = rendererHandoffKit.describe({ anchorPylons, harnessThreads, crosswindRibbons, oxygenCanisters, medevacPods, evacManifest });
      const holdRatio = crosswindRibbons.filter((ribbon) => ribbon.phase === "hold").length / Math.max(1, crosswindRibbons.length);
      const medevacReadiness = clamp01((evacManifest.readiness + (medevacPods[0]?.readiness ?? 0)) * 0.5 - holdRatio * 0.12);
      return { id: "vr-board-skyline-medevac-readiness", domain: "vr-board-skyline-medevac-readiness-domain", anchorPylons, harnessThreads, crosswindRibbons, oxygenCanisters, medevacPods, evacManifest, medevacReadiness: round(medevacReadiness), riskState: medevacReadiness > 0.78 ? "extract" : holdRatio > 0.45 ? "wind-hold" : evacManifest.phase, rendererHandoff, tree: VR_BOARD_SKYLINE_MEDEVAC_READINESS_DOMAIN_TREE, rendererContract: contract("vr-board-skyline-medevac-readiness-domain-kit") };
    },
    snapshot(input = {}) {
      const state = this.describe(input);
      return { medevacReadiness: state.medevacReadiness, riskState: state.riskState, totalDescriptors: state.rendererHandoff.counts.total, remaining: state.evacManifest.remaining };
    }
  };
}

const arr = (value) => Array.isArray(value) ? [...value] : [];
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number(value) || 0));
const r = (value, digits = 3) => Number((Number(value) || 0).toFixed(digits));

function routePoints(level = {}) {
  const route = arr(level.route ?? level.path ?? level.waypoints);
  if (route.length) return route.map((point, index) => ({ id: point.id ?? `route-${index}`, x: Number(point.x ?? point.position?.x ?? 0), z: Number(point.z ?? point.position?.z ?? index * 9) }));
  return [
    { id: "low-marsh-dock", x: -15, z: -5 },
    { id: "fog-lane-gate", x: -10, z: 6 },
    { id: "courier-copse", x: -5, z: 17 },
    { id: "ridge-semaphore", x: 2, z: 30 },
    { id: "medic-hollow", x: 8, z: 42 },
    { id: "safehouse-dawn", x: 3, z: 58 }
  ];
}

const pick = (points, index) => points[Math.min(points.length - 1, Math.max(0, index))] ?? { id: "fallback", x: 0, z: 0 };
function player(game = {}) {
  const p = game.player ?? game.avatar ?? {};
  return { z: Number(p.z ?? p.position?.z ?? 0), scan: Boolean(game.scanActive ?? game.scanning ?? p.scan), focus: String(game.focus ?? game.tool ?? p.tool ?? "scan") };
}
function progress(game = {}, level = {}) {
  const b = level.bounds ?? { minZ: -8, maxZ: 62 };
  return clamp((player(game).z - Number(b.minZ ?? -8)) / Math.max(1, Number(b.maxZ ?? 62) - Number(b.minZ ?? -8)));
}
function pressure(input = {}) {
  const game = input.game ?? {};
  return clamp(Number(game.fogPressure ?? game.visibilityPressure ?? game.hazardPressure ?? 0.54) + Number(game.tidePressure ?? game.floodPressure ?? 0.18) * 0.2 + Math.sin(Number(input.time ?? 0) * 0.43) * 0.035 + (player(game).scan ? -0.075 : 0));
}
function readiness(input = {}) {
  const game = input.game ?? {};
  return clamp(0.12 + Number(game.deliveredNotes ?? game.signalNotes ?? game.courierPackets ?? 0) * 0.085 + Number(game.markedRoutes ?? game.scanCount ?? game.scans ?? 0) * 0.052 + Number(game.escorts ?? game.survivorsEscorted ?? 0) * 0.07 + progress(game, input.level) * 0.42 + (player(game).focus === "courier" ? 0.08 : 0) + (player(game).scan ? 0.06 : 0) - pressure(input) * 0.1);
}
const contract = (owner) => ({ owner, rendererConsumes: "serializable signal courier descriptors only", rendererMustOwn: ["screen placement", "draw order", "color application"], rendererMustNotOwn: ["simulation state", "browser input", "DOM ownership", "collision", "asset loading", "sound", "timing loop", "Three.js runtime", "WebGL runtime", "network", "storage"] });

export const FOGLINE_SIGNAL_COURIER_EVACUATION_READINESS_DOMAIN_TREE = Object.freeze({
  root: "fogline-signal-courier-evacuation-readiness-domain",
  subdomains: [
    { id: "courier-routing-domain", subdomains: [{ id: "semaphore-post-domain", subdomains: [{ id: "lamp-shutter-domain", kits: ["fogline-semaphore-lamp-shutter-kit"] }, { id: "message-ribbon-domain", kits: ["fogline-message-ribbon-spool-kit"] }] }] },
    { id: "evacuation-corridor-domain", subdomains: [{ id: "chalk-arrow-domain", kits: ["fogline-chalk-arrow-marker-kit"] }, { id: "stretcher-run-domain", subdomains: [{ id: "stretcher-cache-domain", kits: ["fogline-stretcher-cache-kit"] }] }] },
    { id: "handoff-ledger-domain", subdomains: [{ id: "safehouse-token-domain", kits: ["fogline-safehouse-token-kit"] }, { id: "dawn-courier-ledger-domain", kits: ["fogline-dawn-courier-ledger-kit"] }] },
    { id: "renderer-handoff", kits: ["fogline-signal-courier-evacuation-renderer-handoff-kit"], contract: "renderer consumes descriptors only" }
  ],
  contract: "renderer consumes descriptors only; reusable kits do not own renderer, DOM, input, assets, audio, storage, physics, graphics runtime, or frame-loop ownership"
});

function descriptor(input, point, index, kind, bucket, metric, color) {
  return { id: `${kind}-${point.id}`, kind, compatibleBucket: bucket, position: { x: r(point.x + (index - 1) * 0.7), y: r(0.2 + metric * 1.5), z: r(point.z + index * 0.45) }, radius: r(0.55 + metric * 1.2), opacity: r(0.1 + metric * 0.32), strength: r(metric), color, rendererContract: contract(`fogline-${kind}-kit`) };
}
function kit(id, domain, indices, kind, bucket, metricFn, color) {
  return { id: `n-${id}`, domain, describe(input = {}) { const points = routePoints(input.level); return indices.map((index, slot) => descriptor(input, pick(points, index), slot, kind, bucket, clamp(metricFn(input, slot)), color)); } };
}
export const createFoglineSemaphoreLampShutterKit = () => kit("fogline-semaphore-lamp-shutter-kit", "fogline-signal-courier-evacuation/courier-routing/lamp-shutter", [1,3,5], "semaphore-lamp-shutter", "signalBeacons", (input, i) => 0.16 + readiness(input) * 0.44 + i * 0.08 - pressure(input) * 0.08, "#fff0a8");
export const createFoglineMessageRibbonSpoolKit = () => kit("fogline-message-ribbon-spool-kit", "fogline-signal-courier-evacuation/courier-routing/message-ribbon", [0,2,4], "message-ribbon-spool", "routeThreads", (input, i) => 0.2 + readiness(input) * 0.5 + Number(input.game?.courierPackets ?? 0) * 0.035 + i * 0.04, "#ffe7b0");
export const createFoglineChalkArrowMarkerKit = () => kit("fogline-chalk-arrow-marker-kit", "fogline-signal-courier-evacuation/evacuation-corridor/chalk-arrow", [1,2,3,4], "chalk-arrow-marker", "groundGlyphs", (input, i) => 0.18 + readiness(input) * 0.35 + Number(input.game?.scans ?? input.game?.scanCount ?? 0) * 0.045 + i * 0.025 - pressure(input) * 0.04, "#d8fff1");
export const createFoglineStretcherCacheKit = () => kit("fogline-stretcher-cache-kit", "fogline-signal-courier-evacuation/evacuation-corridor/stretcher-cache", [2,4], "stretcher-cache", "supplyCaches", (input, i) => 0.22 + Number(input.game?.stretcherCaches ?? input.game?.resources ?? 0) * 0.08 + readiness(input) * 0.36 - pressure(input) * 0.07 + i * 0.08, "#93ffb8");
export const createFoglineSafehouseTokenKit = () => kit("fogline-safehouse-token-kit", "fogline-signal-courier-evacuation/handoff-ledger/safehouse-token", [3,5], "safehouse-token", "handoffTokens", (input, i) => 0.18 + readiness(input) * 0.5 + Number(input.game?.survivorsEscorted ?? input.game?.escorts ?? 0) * 0.065 + i * 0.06, "#e7ff9a");

export function createFoglineDawnCourierLedgerKit() {
  return { id: "n-fogline-dawn-courier-ledger-kit", domain: "fogline-signal-courier-evacuation/handoff-ledger/dawn-courier-ledger", describe(input = {}, groups = {}) {
    const all = Object.values(groups).flatMap(arr);
    const avg = all.reduce((sum, item) => sum + Number(item.strength ?? 0), 0) / Math.max(1, all.length);
    const state = clamp(avg * 0.72 + readiness(input) * 0.35 - pressure(input) * 0.11);
    const safehouse = pick(routePoints(input.level), routePoints(input.level).length - 1);
    return [{ id: "dawn-courier-ledger-primary", kind: "dawn-courier-ledger", compatibleBucket: "summaryLedgers", position: { x: r(safehouse.x), y: 0.84, z: r(safehouse.z + 2.1) }, readiness: r(state), pressure: r(pressure(input)), missionState: state > 0.74 ? "evacuation-ready" : state > 0.52 ? "courier-chain-lit" : pressure(input) > 0.7 ? "fogbound" : "marking-corridor", descriptorSummary: Object.fromEntries(Object.entries(groups).map(([key, value]) => [key, arr(value).length])), radius: r(1 + state * 1.2), opacity: r(0.16 + state * 0.32), color: state > 0.7 ? "#c9ffba" : "#ffd580", rendererContract: contract("fogline-dawn-courier-ledger-kit") }];
  }};
}
export function createFoglineSignalCourierEvacuationRendererHandoffKit() {
  return { id: "n-fogline-signal-courier-evacuation-renderer-handoff-kit", domain: "fogline-signal-courier-evacuation/renderer-handoff", describe(groups = {}) {
    const drawOrder = ["messageRibbonSpools", "chalkArrowMarkers", "stretcherCaches", "semaphoreLampShutters", "safehouseTokens", "dawnCourierLedgers"].flatMap((key) => arr(groups[key]));
    return { id: "fogline-signal-courier-evacuation-renderer-handoff", archetype: "fogline.renderer.handoff.signal.courier.evacuation", policy: "renderer-consumes-descriptors-only", compatibleBuckets: ["signalBeacons", "routeThreads", "groundGlyphs", "supplyCaches", "handoffTokens", "summaryLedgers"], descriptorCount: drawOrder.length, counts: Object.fromEntries(Object.entries(groups).map(([key, value]) => [key, arr(value).length])), descriptors: drawOrder, drawOrder, ownership: { renderer: "consume-only", dom: "excluded", browserInput: "excluded", three: "excluded", webgl: "excluded", audio: "excluded", assets: "excluded", frameLoop: "excluded", physics: "excluded", storage: "excluded" } };
  }};
}
export function createFoglineSignalCourierEvacuationReadinessDomainKit() {
  const kits = [createFoglineSemaphoreLampShutterKit(), createFoglineMessageRibbonSpoolKit(), createFoglineChalkArrowMarkerKit(), createFoglineStretcherCacheKit(), createFoglineSafehouseTokenKit(), createFoglineDawnCourierLedgerKit(), createFoglineSignalCourierEvacuationRendererHandoffKit()];
  return { id: "n-fogline-signal-courier-evacuation-readiness-domain-kit", tree: FOGLINE_SIGNAL_COURIER_EVACUATION_READINESS_DOMAIN_TREE, kits, describe(input = {}) {
    const [lampKit, ribbonKit, arrowKit, stretcherKit, tokenKit, ledgerKit, handoffKit] = kits;
    const groups = { semaphoreLampShutters: lampKit.describe(input), messageRibbonSpools: ribbonKit.describe(input), chalkArrowMarkers: arrowKit.describe(input), stretcherCaches: stretcherKit.describe(input), safehouseTokens: tokenKit.describe(input) };
    groups.dawnCourierLedgers = ledgerKit.describe(input, groups);
    const rendererHandoff = handoffKit.describe(groups);
    return { id: "fogline-signal-courier-evacuation-readiness", version: 1, domain: "fogline-signal-courier-evacuation-readiness-domain", tree: this.tree, readiness: groups.dawnCourierLedgers[0]?.readiness ?? 0, pressure: groups.dawnCourierLedgers[0]?.pressure ?? 0, missionState: groups.dawnCourierLedgers[0]?.missionState ?? "marking-corridor", ...groups, rendererHandoff, drawOrder: rendererHandoff.drawOrder };
  }};
}

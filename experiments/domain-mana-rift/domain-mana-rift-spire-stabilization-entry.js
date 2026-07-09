import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import {
  DOMAIN_MANA_RIFT_SPIRE_STABILIZATION_TREE,
  createDomainManaRiftSpireStabilizationReadiness
} from "./domain-mana-rift-spire-stabilization-kits.js";

const PASS_ID = "domain-mana-rift-spire-stabilization-readiness";
const VERSION = "domain-mana-rift-spire-stabilization-20260709";

function readNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildInput(root) {
  const ambient = root.__domainManaRiftSpireState ?? {};
  const now = Date.now();
  const tick = readNumber(ambient.tick, Math.floor(now / 750) % 100000);
  return {
    tick,
    mana: readNumber(ambient.mana, 0.58 + Math.sin(tick * 0.09) * 0.17),
    riftIntensity: readNumber(ambient.riftIntensity, 0.54 + Math.cos(tick * 0.07) * 0.21),
    apprenticeCount: readNumber(ambient.apprenticeCount, 6),
    anchorCount: readNumber(ambient.anchorCount, 4),
    playerDistance: readNumber(ambient.playerDistance, 8 + Math.sin(tick * 0.04) * 4)
  };
}

function ensurePanel(documentRef) {
  let panel = documentRef.querySelector("[data-domain-mana-rift-spire-panel]");
  if (panel) return panel;
  panel = documentRef.createElement("aside");
  panel.dataset.domainManaRiftSpirePanel = "true";
  panel.setAttribute("aria-label", "Domain Mana Rift spire stabilization readiness");
  panel.style.cssText = [
    "position:fixed", "right:18px", "top:16px", "width:min(320px,calc(100vw - 36px))",
    "padding:12px 14px", "border:1px solid rgba(143,232,255,.42)", "border-radius:18px",
    "background:linear-gradient(180deg,rgba(7,8,27,.86),rgba(18,6,38,.72))", "color:#f3eeff",
    "font:12px/1.35 system-ui,sans-serif", "box-shadow:0 18px 48px rgba(0,0,0,.35)",
    "pointer-events:none", "z-index:6"
  ].join(";");
  documentRef.body.appendChild(panel);
  return panel;
}

function ensureMarkerLayer(documentRef) {
  let layer = documentRef.querySelector("[data-domain-mana-rift-spire-markers]");
  if (layer) return layer;
  layer = documentRef.createElement("div");
  layer.dataset.domainManaRiftSpireMarkers = "true";
  layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:5;overflow:hidden";
  documentRef.body.appendChild(layer);
  return layer;
}

function markerStyle(descriptor, index, total) {
  const angle = descriptor.position?.angle ?? descriptor.rallyPosition?.angle ?? (index / Math.max(1, total)) * Math.PI * 2;
  const radius = descriptor.kind === "ward-circle-calibration" ? 31 : descriptor.kind === "mana-conduit-thread" ? 24 : 18;
  const x = 50 + Math.cos(angle) * radius;
  const y = 52 + Math.sin(angle) * radius * 0.45;
  const color = descriptor.kind === "rift-pressure-vent" ? "#ff8fce" : descriptor.kind === "apprentice-evacuation-ledger" ? "#ffd66b" : descriptor.kind === "ward-circle-calibration" ? "#b8ffdf" : "#8fe8ff";
  const size = descriptor.kind === "ward-circle-calibration" ? 42 : descriptor.kind === "mana-conduit-thread" ? 34 : 18;
  return { x, y, color, size };
}

function renderOverlay(documentRef, readiness) {
  const panel = ensurePanel(documentRef);
  const buckets = readiness.rendererHandoff.buckets;
  panel.innerHTML = `
    <div style="letter-spacing:.08em;text-transform:uppercase;color:#8fe8ff;font-weight:800">Spire stabilization</div>
    <div style="font-size:22px;font-weight:900;margin-top:2px">${readiness.missionState} · ${Math.round(readiness.readiness * 100)}%</div>
    <div style="margin-top:8px;color:#d9ccff">Pressure ${Math.round(readiness.metrics.pressure * 100)} · ward ${Math.round(readiness.metrics.wardCoverage * 100)} · evac ${Math.round(readiness.metrics.evacuationReadiness * 100)}</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:10px">
      <span>pulses ${buckets.pulses.length}</span><span>vents ${buckets.vents.length}</span><span>anchors ${buckets.anchors.length}</span>
      <span>threads ${buckets.conduits.length}</span><span>wards ${buckets.wards.length}</span><span>ledger ${buckets.ledger.length}</span>
    </div>`;

  const layer = ensureMarkerLayer(documentRef);
  const flat = Object.values(buckets).flat();
  layer.innerHTML = flat.map((descriptor, index) => {
    const point = markerStyle(descriptor, index, flat.length);
    return `<i title="${descriptor.kind}" style="position:absolute;left:${point.x}%;top:${point.y}%;width:${point.size}px;height:${point.size}px;margin:${-point.size / 2}px 0 0 ${-point.size / 2}px;border:1px solid ${point.color};border-radius:999px;box-shadow:0 0 20px ${point.color};opacity:.62;transform:scale(${0.8 + readiness.readiness * 0.45})"></i>`;
  }).join("");
}

function install() {
  const root = globalThis.window ?? globalThis;
  const documentRef = root.document;
  if (!documentRef) return;
  const host = root.GameHost ?? {};
  const previousHandoff = typeof host.getRendererHandoff === "function" ? host.getRendererHandoff.bind(host) : () => ({ domains: {}, counts: {} });
  const compute = () => createDomainManaRiftSpireStabilizationReadiness(buildInput(root));

  host.getDomainManaRiftSpireStabilizationReadiness = compute;
  host.getRiftSpireStabilizationReadiness = compute;
  host.getDomainManaRiftSpireStabilizationTree = () => DOMAIN_MANA_RIFT_SPIRE_STABILIZATION_TREE;
  host.getNexusEngineCdnModule = () => NexusEngine;
  host.getRendererHandoff = () => {
    const base = previousHandoff() ?? {};
    const readiness = compute();
    return {
      ...base,
      domains: { ...(base.domains ?? {}), domainManaRiftSpireStabilization: readiness.rendererHandoff },
      counts: { ...(base.counts ?? {}), domainManaRiftSpireStabilization: readiness.rendererHandoff.totalDescriptors }
    };
  };

  root.GameHost = host;
  documentRef.body.dataset.nexusEngineCdn = "main";
  documentRef.body.dataset.domainManaRiftSpireStabilization = VERSION;
  const tick = () => {
    renderOverlay(documentRef, compute());
    root.requestAnimationFrame?.(tick);
  };
  tick();
}

install();
export { install, PASS_ID, VERSION };

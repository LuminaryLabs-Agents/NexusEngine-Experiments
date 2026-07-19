import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@a5882b47bd5a9284550bb3af1f0cd8580c62665e/src/index.js";
import { createNavigationKnowledgeDomainKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusEngine-ProtoKits@5986b69b047d622ea2efe58d12876033f3de2291/protokits/navigation-knowledge-domain-kit/index.js";
import { createRescueTriageDomainKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusEngine-ProtoKits@5986b69b047d622ea2efe58d12876033f3de2291/protokits/rescue-triage-domain-kit/index.js";
import { createStructuralSupportNetworkDomainKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusEngine-ProtoKits@5986b69b047d622ea2efe58d12876033f3de2291/protokits/structural-support-network-domain-kit/index.js";

const MAX_TURNS = 12;
const SITES = Object.freeze([
  { id: "north-pump", name: "North Pump", person: "Mara", x: .72, y: .22, severity: .76, decay: .02, treatment: "seal-bleed", effect: .58, threshold: .34, load: 2, hazard: "fast water", tone: "#ff7e85" },
  { id: "rail-shelter", name: "Rail Shelter", person: "Ivo", x: .82, y: .50, severity: .57, decay: .025, treatment: "warm-core", effect: .44, threshold: .34, load: 3, hazard: "debris pulse", tone: "#ffc76d" },
  { id: "marsh-clinic", name: "Marsh Clinic", person: "Sana", x: .69, y: .78, severity: .38, decay: .04, treatment: "splint-transfer", effect: .30, threshold: .45, load: 3, hazard: "rising channel", tone: "#8cf0b0" }
]);

const canvas = document.querySelector("#game");
const context = canvas.getContext("2d", { alpha: false });
const sitesRoot = document.querySelector("#sites");
const prompt = document.querySelector("#prompt");
const log = document.querySelector("#log");
const advancedBody = document.querySelector("#advancedBody");
const ending = document.querySelector("#ending");
const endingCard = ending.querySelector(".ending-card");
const errorPanel = document.querySelector("#error");
const frameSamples = [];
let longTasks = 0;
let previousFrame = performance.now();
let session;
let animationFrame = 0;

if ("PerformanceObserver" in window) {
  try {
    const observer = new PerformanceObserver((list) => { longTasks += list.getEntries().length; });
    observer.observe({ type: "longtask", buffered: true });
  } catch {}
}

function createEngine() {
  return NexusEngine.createEngine({
    kits: [
      createNavigationKnowledgeDomainKit(NexusEngine, { observers: [{ id: "dispatcher" }] }),
      createRescueTriageDomainKit(NexusEngine, {
        casualties: SITES.map((site) => ({
          id: site.id,
          severity: site.severity,
          deteriorationPerTick: site.decay,
          stabilizationThreshold: site.threshold,
          treatments: [{ id: site.treatment, effect: site.effect, durationTicks: 1 }]
        }))
      }),
      createStructuralSupportNetworkDomainKit(NexusEngine, {
        networks: [{
          id: "flood-causeway",
          nodes: [
            { id: "west-anchor", capacity: 20, anchor: true },
            { id: "field-brace", capacity: 12, active: false },
            { id: "east-span", capacity: 8 }
          ],
          edges: [
            { id: "anchor-brace", from: "west-anchor", to: "field-brace" },
            { id: "brace-span", from: "field-brace", to: "east-span" }
          ]
        }]
      })
    ]
  });
}

function makeSession() {
  return {
    engine: createEngine(),
    turn: 0,
    selectedId: SITES[0].id,
    ended: false,
    result: null,
    braceInstalled: false,
    messages: ["Select a site. Every successful command advances the storm."],
    actionCount: 0
  };
}

function selectedSite() { return SITES.find((site) => site.id === session.selectedId); }
function casualty(siteId) { return session.engine.n.rescueTriage.getState().casualties[siteId]; }
function routeFact(siteId) { return session.engine.n.navigationKnowledge.getKnownGraph("dispatcher")?.links.find((fact) => fact.id === `route:${siteId}`) ?? null; }
function margin() { return session.engine.n.structuralSupport.getMargin("flood-causeway", "east-span"); }
function evacuatedSites() { return SITES.filter((site) => casualty(site.id)?.outcome === "evacuated"); }
function bridgeLoad() { return evacuatedSites().reduce((sum, site) => sum + site.load, 0); }

function note(message) {
  session.messages.push(message);
  session.messages = session.messages.slice(-5);
  prompt.textContent = message;
  log.textContent = session.messages.slice(-2).join("  ·  ");
}

function commandId(action, siteId = "global") {
  session.actionCount += 1;
  return `${action}:${siteId}:${session.actionCount}`;
}

function resolveLostCasualties() {
  for (const site of SITES) {
    const state = casualty(site.id);
    if (!state.outcome && state.severity >= .98) {
      session.engine.n.rescueTriage.resolveOutcome({ casualtyId: site.id, outcome: "lost", commandId: commandId("lost", site.id) });
      endRun("lost", `${site.person} was overtaken before the team could stabilize the site.`);
      return true;
    }
  }
  return false;
}

function advanceTurn() {
  session.turn += 1;
  session.engine.n.navigationKnowledge.advance(1);
  session.engine.n.rescueTriage.advance(1);
  if (resolveLostCasualties()) return;
  if (session.turn > MAX_TURNS && !session.ended) endRun("lost", "The flood window closed before all three crossings were complete.");
}

function scout(site) {
  const version = (routeFact(site.id)?.version ?? 0) + 1;
  session.engine.n.navigationKnowledge.observe({
    observerId: "dispatcher",
    id: `route:${site.id}`,
    kind: "link",
    fromPlaceId: site.id,
    toPlaceId: "west-command",
    confidence: 1,
    decayPerTick: .18,
    staleBelow: .35,
    version,
    sourceId: "flood-drone",
    hazard: { label: site.hazard, crossingLoad: site.load },
    commandId: commandId("scout", site.id)
  });
  advanceTurn();
  if (!session.ended) note(`${site.name}: ${site.hazard} confirmed. Route confidence is fresh.`);
}

function stabilize(site) {
  const state = casualty(site.id);
  if (state.outcome) return note(`${site.person} already has a resolved outcome.`);
  if (state.stabilized) return note(`${site.person} is already stable and transport-ready.`);
  const treatment = state.treatments[site.treatment];
  if (treatment.status === "available") {
    session.engine.n.rescueTriage.assess({ casualtyId: site.id, commandId: commandId("assess", site.id) });
    session.engine.n.rescueTriage.beginTreatment({ casualtyId: site.id, treatmentId: site.treatment, commandId: commandId("begin-treatment", site.id) });
  }
  advanceTurn();
  if (session.ended) return;
  const after = casualty(site.id);
  if (after.treatments[site.treatment].status === "active") {
    session.engine.n.rescueTriage.completeTreatment({ casualtyId: site.id, treatmentId: site.treatment, commandId: commandId("complete-treatment", site.id) });
  }
  note(`${site.person} stabilized. ${site.load} load units will cross from ${site.name}.`);
}

function brace() {
  if (session.braceInstalled) return note("The field brace is already locked to the causeway.");
  session.engine.n.structuralSupport.setSupportState("flood-causeway", "field-brace", { active: true, commandId: commandId("brace") });
  session.braceInstalled = true;
  session.engine.n.structuralSupport.resolve(1);
  advanceTurn();
  if (!session.ended) note("Field brace locked. The east span can now carry 8 load units.");
}

function evacuate(site) {
  const state = casualty(site.id);
  const fact = routeFact(site.id);
  if (state.outcome) return note(`${site.person} already has a resolved outcome.`);
  if (!fact || fact.confidence < fact.staleBelow) return note(`${site.name} needs a fresh Scout report before crossing.`);
  if (!state.transportReady) return note(`${site.person} must be stabilized before transport.`);
  session.engine.n.rescueTriage.markTransported({ casualtyId: site.id, commandId: commandId("transport", site.id) });
  session.engine.n.rescueTriage.resolveOutcome({ casualtyId: site.id, outcome: "evacuated", commandId: commandId("evacuated", site.id) });
  const load = bridgeLoad();
  session.engine.n.structuralSupport.applyLoad({ networkId: "flood-causeway", nodeId: "east-span", load, commandId: commandId("load", site.id) });
  session.engine.n.structuralSupport.resolve(1);
  const bridge = margin();
  advanceTurn();
  if (bridge.failed) return endRun("lost", "The unbraced causeway failed under the evacuation load. Stabilization alone was not enough.");
  if (evacuatedSites().length === SITES.length) return endRun("won", "Fresh reports, stable casualties, and the braced span held through all three crossings.");
  if (!session.ended) note(`${site.person} crossed safely. Causeway margin: ${bridge.margin.toFixed(0)}.`);
}

function perform(action) {
  if (session.ended) return;
  const site = selectedSite();
  if (action === "scout") scout(site);
  if (action === "stabilize") stabilize(site);
  if (action === "brace") brace();
  if (action === "evacuate") evacuate(site);
  renderUi();
}

function endRun(result, copy) {
  session.ended = true;
  session.result = result;
  ending.hidden = false;
  endingCard.dataset.result = result;
  document.querySelector("#endingEyebrow").textContent = result === "won" ? "Flood window secured" : "Rescue line broken";
  document.querySelector("#endingTitle").textContent = result === "won" ? "All Three Across" : "Causeway Lost";
  document.querySelector("#endingCopy").textContent = copy;
  document.documentElement.dataset.result = result;
  note(copy);
}

function restart() {
  session = makeSession();
  ending.hidden = true;
  delete document.documentElement.dataset.result;
  note("Select a site. Every successful command advances the storm.");
  renderUi();
}

function selectSite(siteId) {
  if (!SITES.some((site) => site.id === siteId)) return;
  session.selectedId = siteId;
  note(`${selectedSite().name} selected. Scout, stabilize, brace, then evacuate.`);
  renderUi();
}

function severityTone(value, stabilized, outcome) {
  if (outcome === "evacuated" || stabilized) return "#8cf0b0";
  if (value >= .75) return "#ff6f79";
  if (value >= .4) return "#ffc76d";
  return "#80e5e4";
}

function renderSites() {
  sitesRoot.innerHTML = SITES.map((site) => {
    const state = casualty(site.id);
    const fact = routeFact(site.id);
    const confidence = fact ? Math.round(fact.confidence * 100) : 0;
    const severity = Math.round(state.severity * 100);
    const outcome = state.outcome === "evacuated" ? "Evacuated" : state.stabilized ? "Stable" : state.assessed ? state.category : "Unassessed";
    const route = !fact ? "Route unknown" : fact.confidence < fact.staleBelow ? "Report stale" : `${confidence}% route confidence`;
    return `<button class="site glass" data-site="${site.id}" aria-pressed="${site.id === session.selectedId}" style="--tone:${severityTone(state.severity,state.stabilized,state.outcome)}">
      <header><strong>${site.name}</strong><small>${outcome}</small></header>
      <p>${site.person} · ${route}<br>${site.load} crossing load · ${site.hazard}</p>
      <div class="meters" aria-hidden="true"><div class="mini" style="--value:${severity};--tone:${severityTone(state.severity,false,state.outcome)}"></div><div class="mini" style="--value:${confidence};--tone:#80e5e4"></div></div>
    </button>`;
  }).join("");
  for (const button of sitesRoot.querySelectorAll("[data-site]")) button.addEventListener("click", () => selectSite(button.dataset.site));
}

function renderUi() {
  renderSites();
  const bridge = margin();
  document.querySelector("#turnValue").textContent = `${session.turn} / ${MAX_TURNS}`;
  document.querySelector("#savedValue").textContent = `${evacuatedSites().length} / ${SITES.length}`;
  document.querySelector("#bridgeValue").textContent = bridge.failed ? "Failed" : session.braceInstalled ? `${bridge.margin.toFixed(0)} margin` : "Unbraced";
  document.documentElement.dataset.turn = String(session.turn);
  document.documentElement.dataset.selectedSite = session.selectedId;
  document.documentElement.dataset.saved = String(evacuatedSites().length);
  const state = getPublicState();
  advancedBody.textContent = [
    `Core ${state.baselines.core.slice(0,7)} · ProtoKits ${state.baselines.protokits.slice(0,7)}`,
    `Installed: ${state.installed.join(", ")}`,
    `Turn ${state.turn} · commands ${state.actionCount}`,
    `Causeway load ${state.bridge.load}/${state.bridge.capacity} · supported ${state.bridge.supported} · failed ${state.bridge.failed}`,
    ...state.sites.map((site) => `${site.id}: severity ${site.severity.toFixed(2)} · ${site.outcome ?? (site.stabilized ? "stable" : "active")} · route ${site.routeConfidence == null ? "unknown" : site.routeConfidence.toFixed(2)}`)
  ].join("\n");
}

function resize() {
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(innerWidth * ratio);
  canvas.height = Math.round(innerHeight * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function draw(time) {
  const w = innerWidth;
  const h = innerHeight;
  const gradient = context.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, "#07181e");
  gradient.addColorStop(.55, "#0a3039");
  gradient.addColorStop(1, "#041117");
  context.fillStyle = gradient;
  context.fillRect(0, 0, w, h);
  context.strokeStyle = "rgba(98,201,207,.11)";
  context.lineWidth = 1;
  for (let y = -20; y < h + 30; y += 28) {
    context.beginPath();
    for (let x = 0; x <= w; x += 30) {
      const wave = Math.sin(x * .012 + time * .0014 + y * .02) * 5;
      x === 0 ? context.moveTo(x, y + wave) : context.lineTo(x, y + wave);
    }
    context.stroke();
  }
  const command = { x: w * .42, y: h * .5 };
  const bridgeX = w * .58;
  context.strokeStyle = session?.braceInstalled ? "rgba(255,199,109,.9)" : "rgba(166,192,193,.42)";
  context.lineWidth = session?.braceInstalled ? 14 : 9;
  context.setLineDash(session?.braceInstalled ? [] : [18, 12]);
  context.beginPath();context.moveTo(command.x, command.y);context.lineTo(bridgeX, command.y);context.stroke();context.setLineDash([]);
  context.fillStyle = "rgba(7,30,34,.92)";context.beginPath();context.arc(command.x, command.y, 46, 0, Math.PI*2);context.fill();
  context.strokeStyle = "#80e5e4";context.lineWidth = 2;context.stroke();
  context.fillStyle = "#dffff9";context.font = "700 11px ui-monospace, monospace";context.textAlign = "center";context.fillText("COMMAND", command.x, command.y + 4);
  for (const site of SITES) {
    const x = w * site.x, y = h * site.y;
    const state = session ? casualty(site.id) : null;
    const fact = session ? routeFact(site.id) : null;
    const active = session?.selectedId === site.id;
    context.strokeStyle = fact && fact.confidence >= fact.staleBelow ? "rgba(128,229,228,.62)" : "rgba(128,229,228,.18)";
    context.lineWidth = active ? 4 : 2;
    context.beginPath();context.moveTo(bridgeX, command.y);context.lineTo(x, y);context.stroke();
    context.fillStyle = state?.outcome === "evacuated" ? "#8cf0b0" : severityTone(state?.severity ?? site.severity,state?.stabilized,state?.outcome);
    context.shadowColor = context.fillStyle;context.shadowBlur = active ? 24 : 10;context.beginPath();context.arc(x, y, active ? 18 : 13, 0, Math.PI*2);context.fill();context.shadowBlur = 0;
    context.fillStyle = "rgba(238,255,251,.82)";context.font = `${active ? 800 : 700} ${active ? 12 : 10}px ui-monospace, monospace`;context.fillText(site.name.toUpperCase(), x, y - 27);
  }
  context.globalAlpha = .65;
  context.fillStyle = "#b9ffff";
  for (let i=0;i<34;i+=1) {
    const x=(i*137 + time*.024)%w, y=(i*79 + time*.04)%h;
    context.fillRect(x,y,1.5,6);
  }
  context.globalAlpha = 1;
  const now = performance.now();
  const delta = now - previousFrame;
  previousFrame = now;
  if (delta < 250) { frameSamples.push(delta); if (frameSamples.length > 1200) frameSamples.shift(); }
  animationFrame = requestAnimationFrame(draw);
}

function getMetrics() {
  const sorted = [...frameSamples].sort((a,b)=>a-b);
  const average = frameSamples.length ? frameSamples.reduce((a,b)=>a+b,0)/frameSamples.length : 0;
  return {
    frames: frameSamples.length,
    averageFrameMs: Number(average.toFixed(3)),
    p95FrameMs: Number((sorted[Math.floor(sorted.length*.95)] ?? 0).toFixed(3)),
    fps: average ? Number((1000/average).toFixed(2)) : 0,
    domNodes: document.querySelectorAll("*").length,
    canvases: document.querySelectorAll("canvas").length,
    longTasks
  };
}

function getPublicState() {
  const bridge = margin();
  return {
    schema: "nexusengine.saturation-experiment/1",
    id: "SAT-001",
    turn: session.turn,
    selectedId: session.selectedId,
    ended: session.ended,
    result: session.result,
    actionCount: session.actionCount,
    installed: Object.keys(session.engine.n).sort(),
    baselines: { core: "a5882b47bd5a9284550bb3af1f0cd8580c62665e", protokits: "5986b69b047d622ea2efe58d12876033f3de2291" },
    bridge: { load: bridge.load, capacity: bridge.capacity, margin: bridge.margin, supported: bridge.supported, failed: bridge.failed, braceInstalled: session.braceInstalled },
    sites: SITES.map((site) => {
      const state = casualty(site.id); const fact = routeFact(site.id);
      return { id: site.id, severity: state.severity, stabilized: state.stabilized, transportReady: state.transportReady, outcome: state.outcome, routeConfidence: fact?.confidence ?? null, routeStale: fact ? fact.confidence < fact.staleBelow : null };
    }),
    domainSnapshots: {
      navigationKnowledge: session.engine.n.navigationKnowledge.getSnapshot(),
      rescueTriage: session.engine.n.rescueTriage.getSnapshot(),
      structuralSupport: session.engine.n.structuralSupport.getSnapshot()
    }
  };
}

for (const button of document.querySelectorAll("[data-action]")) button.addEventListener("click", () => perform(button.dataset.action));
document.querySelector("#restart").addEventListener("click", restart);
window.addEventListener("keydown", (event) => {
  if (event.repeat) return;
  if (event.key === "1") perform("scout");
  if (event.key === "2") perform("stabilize");
  if (event.key === "3") perform("brace");
  if (event.key === "4") perform("evacuate");
  if (event.key.toLowerCase() === "r") restart();
  if (["q","e"].includes(event.key.toLowerCase())) {
    const index = SITES.findIndex((site) => site.id === session.selectedId);
    const direction = event.key.toLowerCase() === "e" ? 1 : -1;
    selectSite(SITES[(index + direction + SITES.length) % SITES.length].id);
  }
});
window.addEventListener("resize", resize);
window.addEventListener("beforeunload", () => cancelAnimationFrame(animationFrame));

try {
  session = makeSession();
  resize();
  renderUi();
  animationFrame = requestAnimationFrame(draw);
  document.documentElement.dataset.ready = "true";
  window.__floodlineTriage = Object.freeze({
    getState: () => structuredClone(getPublicState()),
    getMetrics: () => ({ ...getMetrics() }),
    select: selectSite,
    act: perform,
    restart
  });
} catch (error) {
  errorPanel.hidden = false;
  errorPanel.textContent = `${error?.stack ?? error}`;
  document.documentElement.dataset.ready = "error";
  console.error(error);
}

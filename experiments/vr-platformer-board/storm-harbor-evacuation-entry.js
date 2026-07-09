import { createVrBoardStormHarborEvacuationReadinessDomainKit } from "../_kits/vr-platformer-board/vr-board-storm-harbor-evacuation-readiness-kits.js";

const NEXUS_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const objective = document.querySelector("#objective");
const controls = document.querySelector("#controls");
const hud = document.querySelector("#hud");
const errorPanel = document.querySelector("#errorPanel");
const stormHarborKit = createVrBoardStormHarborEvacuationReadinessDomainKit();

const level = {
  start: { x: 0, y: 1.08 },
  exit: { id: "skiff-launch-gate", x: 15.4, y: 4.62, w: 0.82, h: 1.2 },
  platforms: [
    { id: "storm-pier", x: -0.7, y: 1.08, w: 3.24, h: 0.28 },
    { id: "crane-footing", x: 3.05, y: 2.0, w: 1.82, h: 0.26 },
    { id: "flooded-dock", x: 5.78, y: 2.78, w: 2.2, h: 0.24 },
    { id: "cargo-net-cache", x: 8.82, y: 2.28, w: 1.92, h: 0.26 },
    { id: "skiff-berth", x: 11.72, y: 3.58, w: 2.42, h: 0.28 },
    { id: "launch-ramp", x: 14.65, y: 4.46, w: 1.72, h: 0.3 }
  ],
  collectibles: [
    { id: "flare-storm-pier", x: 2.18, y: 2.07, value: 1 },
    { id: "dry-net-crane", x: 4.18, y: 2.92, value: 1 },
    { id: "flare-flooded-dock", x: 6.83, y: 3.62, value: 1 },
    { id: "blanket-cache", x: 9.64, y: 3.12, value: 1 },
    { id: "skiff-rope", x: 12.92, y: 4.46, value: 1 }
  ],
  hazards: [
    { id: "surge-low-water", x: 4.8, y: 1.0, w: 0.88, h: 0.36 },
    { id: "swinging-crane-hook", x: 7.36, y: 2.58, w: 0.78, h: 0.4 },
    { id: "broken-dock-drop", x: 10.86, y: 1.05, w: 0.86, h: 0.36 }
  ]
};

const board = { sizeMeters: { x: 1.8, y: 1.0 }, mode: "storm-harbor-evacuation" };
const weather = { tideLevel: 0.54, wind: 0.38, rain: 0.52 };
const head = { position: { x: 0, y: 1.6, z: 0 }, forward: { x: 0, y: 0, z: -1 }, up: { x: 0, y: 1, z: 0 } };
const keys = new Set();
let avatar = makeAvatar();
let lastSafeAvatar = makeAvatar();
let objects = { collectedValue: 0, collectedIds: [] };
let latestInput = { moveAxis: 0, jumpPressed: false, restartPressed: false };
let latestStormHarborReadiness = null;
let runtimeSurface = { imported: false, factoryName: "unloaded" };
let dragging = false;
let lastPointer = null;
let last = performance.now();
let elapsed = 0;

addEventListener("keydown", (event) => keys.add(event.key.toLowerCase()));
addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));
addEventListener("blur", () => keys.clear());
canvas.addEventListener("pointerdown", (event) => { dragging = true; lastPointer = { x: event.clientX, y: event.clientY }; canvas.setPointerCapture?.(event.pointerId); });
canvas.addEventListener("pointerup", () => { dragging = false; lastPointer = null; });
canvas.addEventListener("pointermove", (event) => {
  if (!dragging || !lastPointer) return;
  const dx = event.clientX - lastPointer.x;
  const dy = event.clientY - lastPointer.y;
  lastPointer = { x: event.clientX, y: event.clientY };
  head.position.x = clamp(head.position.x + dx * 0.0012, -0.24, 0.24);
  head.position.y = clamp(head.position.y - dy * 0.0012, 1.35, 1.92);
});

function showFatal(error) {
  errorPanel.hidden = false;
  errorPanel.textContent = String(error?.stack ?? error?.message ?? error);
}

function resize() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.floor(innerWidth * dpr);
  canvas.height = Math.floor(innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
addEventListener("resize", resize);
resize();

function makeAvatar() {
  return { position: { x: 0.06, y: 1.86 }, velocity: { x: 0, y: 0 }, size: { x: 0.48, y: 0.78 }, grounded: false, mode: "alive", moveAxis: 0 };
}

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function resetAvatar() {
  avatar = { ...lastSafeAvatar, position: { ...lastSafeAvatar.position }, velocity: { x: 0, y: 0 }, grounded: false, mode: "alive" };
}

function updateAvatar(dt, input) {
  if (input.restartPressed) {
    avatar = makeAvatar();
    lastSafeAvatar = makeAvatar();
    objects = { collectedValue: 0, collectedIds: [] };
    weather.tideLevel = 0.54;
  }
  avatar.moveAxis = input.moveAxis;
  avatar.velocity.x = clamp(avatar.velocity.x + input.moveAxis * 16 * dt, -3.7, 3.7);
  avatar.velocity.x *= avatar.grounded ? 0.84 : 0.96;
  if (input.jumpPressed && avatar.grounded) {
    avatar.velocity.y = 7.0;
    avatar.grounded = false;
  }
  avatar.velocity.y -= (13.1 + weather.wind * 0.7) * dt;
  avatar.position.x += avatar.velocity.x * dt;
  avatar.position.y += avatar.velocity.y * dt;
  avatar.grounded = false;
  for (const platform of level.platforms) {
    const wasAbove = avatar.position.y - avatar.velocity.y * dt >= platform.y;
    const overlapsX = avatar.position.x + avatar.size.x > platform.x && avatar.position.x < platform.x + platform.w;
    if (avatar.velocity.y <= 0 && wasAbove && overlapsX && avatar.position.y <= platform.y + 0.05 && avatar.position.y > platform.y - 0.45) {
      avatar.position.y = platform.y;
      avatar.velocity.y = 0;
      avatar.grounded = true;
      lastSafeAvatar = { ...avatar, position: { ...avatar.position }, velocity: { ...avatar.velocity } };
    }
  }
  for (const cache of level.collectibles) {
    if (objects.collectedIds.includes(cache.id)) continue;
    const dx = Math.abs((avatar.position.x + avatar.size.x * 0.5) - cache.x);
    const dy = Math.abs((avatar.position.y + avatar.size.y * 0.5) - cache.y);
    if (dx < 0.52 && dy < 0.62) objects = { collectedValue: objects.collectedValue + (cache.value ?? 1), collectedIds: [...objects.collectedIds, cache.id] };
  }
  const hitHazard = level.hazards.some((hazard) => avatar.position.x < hazard.x + hazard.w && avatar.position.x + avatar.size.x > hazard.x && avatar.position.y < hazard.y + hazard.h && avatar.position.y + avatar.size.y > hazard.y);
  if (hitHazard || avatar.position.y < -1.4) {
    avatar.mode = "fallen";
    resetAvatar();
  }
}

function buildSnapshot(time) {
  const progress = clamp((avatar.position.x - level.start.x) / Math.max(1, level.exit.x - level.start.x), 0, 1);
  weather.tideLevel = clamp(0.5 + Math.sin(time * 0.42) * 0.08 + progress * 0.1, 0.3, 0.82);
  weather.wind = clamp(0.34 + Math.sin(time * 0.31 + 1.4) * 0.12, 0.16, 0.62);
  const camera = { position: { x: clamp(avatar.position.x - 3.2, -0.6, 13.4), y: Math.max(1.0, avatar.position.y - 1.55) } };
  const comfort = { warnings: Math.abs(head.position.x) > 0.18 ? ["head-drift"] : [] };
  latestStormHarborReadiness = stormHarborKit.describe({ avatar, level, objects, camera, board, comfort, weather, xrPose: { head }, input: latestInput, time });
  const sequence = { hint: latestStormHarborReadiness.dawnHarborLedger.nextInstruction };
  return { avatar, level, objects, camera, board, comfort, weather, sequence, xrPose: { head }, stormHarborReadiness: latestStormHarborReadiness, runtimeSurface };
}

function frame(now) {
  const dt = Math.min(1 / 30, (now - last) / 1000 || 1 / 60);
  last = now;
  elapsed += dt;
  latestInput = {
    moveAxis: (keys.has("d") || keys.has("arrowright") ? 1 : 0) - (keys.has("a") || keys.has("arrowleft") ? 1 : 0),
    jumpPressed: keys.has(" ") || keys.has("w") || keys.has("arrowup"),
    restartPressed: keys.has("r")
  };
  updateAvatar(dt, latestInput);
  const snapshot = buildSnapshot(elapsed);
  const ledger = snapshot.stormHarborReadiness.dawnHarborLedger;
  objective.textContent = ledger.nextInstruction;
  controls.textContent = `A/D move · Space jump · R reset · ${snapshot.stormHarborReadiness.rendererHandoff.counts.total} harbor descriptors`;
  hud.dataset.tone = ledger.missionState === "launch-skiff" ? "success" : snapshot.stormHarborReadiness.tideRisk > 0.62 ? "warning" : "neutral";
  drawBoard(snapshot);
  requestAnimationFrame(frame);
}

function drawBoard(snapshot) {
  const w = innerWidth;
  const h = innerHeight;
  ctx.clearRect(0, 0, w, h);
  const scale = Math.min(w * 0.76 / 340, h * 0.72 / 190);
  const cx = w * 0.5 - (snapshot.xrPose?.head?.position?.x ?? 0) * 180;
  const cy = h * 0.52 + (1.6 - (snapshot.xrPose?.head?.position?.y ?? 1.6)) * 120;
  drawStormGlow(cx, cy, 340 * scale, 190 * scale, snapshot.stormHarborReadiness);
  ctx.save();
  ctx.translate(cx - 170 * scale, cy - 95 * scale);
  ctx.scale(scale, scale);
  ctx.fillStyle = "rgba(5,9,18,.97)";
  roundRect(ctx, -8, -8, 356, 206, 14); ctx.fill();
  ctx.strokeStyle = "rgba(130,225,255,.55)"; ctx.stroke();
  ctx.save(); roundRect(ctx, 0, 0, 340, 190, 8); ctx.clip();
  ctx.fillStyle = "#0a1527"; ctx.fillRect(0, 0, 340, 190);
  ctx.fillStyle = "#13213b"; ctx.fillRect(0, 122, 340, 68);
  drawHarborWater(snapshot.weather, elapsed);
  const cameraX = snapshot.camera.position.x;
  const cameraY = snapshot.camera.position.y;
  drawStormHarbor(snapshot.stormHarborReadiness, cameraX, cameraY);
  drawLevel(snapshot.level, snapshot.objects, cameraX, cameraY);
  drawAvatar(snapshot.avatar, cameraX, cameraY);
  drawReadinessStrip(snapshot.stormHarborReadiness);
  ctx.restore();
  ctx.fillStyle = "rgba(255,255,255,.78)"; ctx.font = "5px ui-sans-serif";
  ctx.fillText(`board ${snapshot.board.sizeMeters.x}m · NexusEngine ${snapshot.runtimeSurface.factoryName} · harbor ${snapshot.stormHarborReadiness.evacuationReadiness}`, 4, 202);
  ctx.restore();
}

function drawStormGlow(cx, cy, bw, bh, harbor) {
  const readiness = harbor?.evacuationReadiness ?? 0.2;
  const risk = harbor?.tideRisk ?? 0.5;
  const gradient = ctx.createRadialGradient(cx, cy - bh * 0.8, 20, cx, cy, Math.max(bw, bh));
  gradient.addColorStop(0, `rgba(105, 230, 255, ${0.14 + readiness * 0.14})`);
  gradient.addColorStop(0.58, `rgba(255, 180, 94, ${0.08 + risk * 0.14})`);
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, innerWidth, innerHeight);
}

function drawHarborWater(weather, time) {
  ctx.fillStyle = `rgba(25, 74, 119, ${0.52 + weather.tideLevel * 0.2})`;
  ctx.fillRect(0, 130 - weather.tideLevel * 12, 340, 70 + weather.tideLevel * 12);
  ctx.strokeStyle = "rgba(133,232,255,.28)";
  for (let index = 0; index < 8; index += 1) {
    ctx.beginPath();
    const y = 133 + index * 7 - weather.tideLevel * 10;
    for (let x = 0; x <= 340; x += 12) {
      const waveY = y + Math.sin(x * 0.06 + time * 1.7 + index) * 1.6;
      if (x === 0) ctx.moveTo(x, waveY); else ctx.lineTo(x, waveY);
    }
    ctx.stroke();
  }
}

function drawStormHarbor(harbor, cameraX, cameraY) {
  const descriptors = harbor?.rendererHandoff?.descriptors ?? {};
  for (const gauge of descriptors.tideGauges ?? []) {
    const p = worldToScreen(gauge.x, gauge.y, cameraX, cameraY);
    ctx.strokeStyle = gauge.warning === "red" ? "rgba(255,91,105,.86)" : gauge.warning === "amber" ? "rgba(255,205,93,.86)" : "rgba(125,255,188,.72)";
    ctx.beginPath(); ctx.moveTo(p.x, p.y - 22); ctx.lineTo(p.x, p.y + 8); ctx.stroke();
    ctx.fillStyle = ctx.strokeStyle; ctx.fillRect(p.x - 3, p.y + 8 - gauge.tideLevel * 28, 6, gauge.tideLevel * 28);
  }
  for (const buoy of descriptors.flareBuoys ?? []) {
    const p = worldToScreen(buoy.x, buoy.y, cameraX, cameraY);
    ctx.fillStyle = buoy.available ? `rgba(255, 220, 112, ${0.45 + buoy.brightness * 0.45})` : "rgba(145,255,190,.24)";
    ctx.beginPath(); ctx.arc(p.x, p.y, 4.8 + buoy.brightness * 2, 0, Math.PI * 2); ctx.fill();
  }
  for (const cable of descriptors.craneCables ?? []) {
    const a = worldToScreen(cable.x1, cable.y1, cameraX, cameraY);
    const b = worldToScreen(cable.x2, cable.y2, cameraX, cameraY);
    ctx.strokeStyle = `rgba(152, 238, 255, ${0.2 + cable.priority * 0.42})`;
    ctx.setLineDash([5, 3]); ctx.beginPath(); ctx.moveTo(a.x, a.y - 10); ctx.lineTo((a.x + b.x) / 2, ((a.y + b.y) / 2) - 20 - cable.slack * 12); ctx.lineTo(b.x, b.y - 10); ctx.stroke(); ctx.setLineDash([]);
  }
  for (const net of descriptors.supplyNets ?? []) {
    const p = worldToScreen(net.x, net.y, cameraX, cameraY);
    ctx.strokeStyle = net.secured ? "rgba(125,255,188,.58)" : "rgba(255,255,255,.45)";
    roundRect(ctx, p.x - 6, p.y - 6, 12, 10, 3); ctx.stroke();
  }
  for (const skiff of descriptors.rescueSkiffs ?? []) {
    const p = worldToScreen(skiff.x, skiff.y, cameraX, cameraY);
    ctx.strokeStyle = skiff.phase === "launch" ? "rgba(157,255,122,.95)" : "rgba(255,255,255,.36)";
    ctx.beginPath(); ctx.ellipse(p.x, p.y, 16 + skiff.readiness * 8, 6, 0, 0, Math.PI * 2); ctx.stroke();
  }
}

function drawLevel(level, objects, cameraX, cameraY) {
  for (const platform of level.platforms) {
    const p = worldToScreen(platform.x, platform.y, cameraX, cameraY);
    ctx.fillStyle = platform.id.includes("dock") || platform.id.includes("pier") ? "rgba(163,126,83,.94)" : "rgba(127,167,255,.92)";
    roundRect(ctx, p.x, p.y - platform.h * 18, platform.w * 18, platform.h * 18, 2); ctx.fill();
  }
  for (const hazard of level.hazards) {
    const p = worldToScreen(hazard.x, hazard.y, cameraX, cameraY);
    ctx.fillStyle = "rgba(255,75,110,.86)"; ctx.fillRect(p.x, p.y - hazard.h * 18, hazard.w * 18, hazard.h * 18);
  }
  for (const cache of level.collectibles) {
    if (objects.collectedIds.includes(cache.id)) continue;
    const p = worldToScreen(cache.x, cache.y, cameraX, cameraY);
    ctx.fillStyle = "rgba(255,220,112,.95)"; ctx.beginPath(); ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2); ctx.fill();
  }
  const exit = level.exit;
  const e = worldToScreen(exit.x, exit.y, cameraX, cameraY);
  ctx.strokeStyle = "rgba(157,255,122,.92)"; ctx.lineWidth = 2; ctx.strokeRect(e.x, e.y - exit.h * 18, exit.w * 18, exit.h * 18);
}

function drawAvatar(currentAvatar, cameraX, cameraY) {
  const p = worldToScreen(currentAvatar.position.x, currentAvatar.position.y, cameraX, cameraY);
  ctx.fillStyle = currentAvatar.mode === "fallen" ? "#ff4b6e" : "#ffffff";
  roundRect(ctx, p.x, p.y - currentAvatar.size.y * 18, currentAvatar.size.x * 18, currentAvatar.size.y * 18, 3); ctx.fill();
}

function drawReadinessStrip(harbor) {
  const readiness = harbor.evacuationReadiness ?? 0;
  ctx.fillStyle = "rgba(0,0,0,.34)"; roundRect(ctx, 8, 8, 142, 12, 6); ctx.fill();
  ctx.fillStyle = harbor.tideRisk > 0.62 ? "#ffcf70" : "#78ffd6"; roundRect(ctx, 10, 10, 138 * readiness, 8, 4); ctx.fill();
}

function worldToScreen(x, y, cameraX, cameraY) { return { x: 164 + (x - cameraX) * 18, y: 124 - (y - cameraY) * 18 }; }
function roundRect(context, x, y, w, h, r) { context.beginPath(); context.moveTo(x + r, y); context.arcTo(x + w, y, x + w, y + h, r); context.arcTo(x + w, y + h, x, y + h, r); context.arcTo(x, y + h, x, y, r); context.arcTo(x, y, x + w, y, r); context.closePath(); }
function composedRendererHandoff() { const handoff = latestStormHarborReadiness?.rendererHandoff ?? null; return handoff ? { ...handoff, id: "vr-board-storm-harbor-composed-renderer-handoff", stormHarborEvacuationReadiness: handoff } : null; }

function applyStormHarborInput(input = {}) {
  latestInput = {
    moveAxis: clamp(input.moveAxis ?? latestInput.moveAxis ?? 0, -1, 1),
    jumpPressed: Boolean(input.jumpPressed),
    restartPressed: Boolean(input.restartPressed)
  };
  updateAvatar(1 / 30, latestInput);
  return buildSnapshot(elapsed);
}

function tick(dt = 1 / 60) {
  elapsed += clamp(dt, 0, 1 / 10);
  updateAvatar(clamp(dt, 0, 1 / 10), latestInput);
  return buildSnapshot(elapsed);
}

async function boot() {
  const NexusEngine = await import(NEXUS_URL);
  const createEngine = NexusEngine.createRealtimeGame ?? NexusEngine.createRealtimeEngine ?? NexusEngine.createEngine;
  runtimeSurface = { imported: true, factoryName: typeof createEngine === "function" ? (createEngine.name || "createEngine") : "namespace-only" };
  window.GameHost = {
    getState: () => ({ avatar, level, objects, board, weather, stormHarborReadiness: latestStormHarborReadiness, domain: { vrBoardStormHarborEvacuationReadiness: latestStormHarborReadiness }, runtimeSurface }),
    tick,
    applyInput: applyStormHarborInput,
    applyStormHarborInput,
    getStormHarborEvacuationReadiness: () => latestStormHarborReadiness,
    getVrBoardStormHarborEvacuationReadiness: () => latestStormHarborReadiness,
    getStormHarborEvacuationReadinessTree: () => stormHarborKit.tree,
    getRendererHandoff: () => composedRendererHandoff(),
    getBoardDomainSnapshot: () => stormHarborKit.snapshot({ avatar, level, objects, board, weather, xrPose: { head }, input: latestInput, time: elapsed }),
    reset: () => { avatar = makeAvatar(); lastSafeAvatar = makeAvatar(); objects = { collectedValue: 0, collectedIds: [] }; weather.tideLevel = 0.54; }
  };
  requestAnimationFrame(frame);
}

boot().catch(showFatal);

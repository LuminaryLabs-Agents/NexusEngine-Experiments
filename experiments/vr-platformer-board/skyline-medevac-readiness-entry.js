import { createVrBoardSkylineMedevacReadinessDomainKit } from "../_kits/vr-platformer-board/vr-board-skyline-medevac-readiness-kits.js";

const NEXUS_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const objective = document.querySelector("#objective");
const controls = document.querySelector("#controls");
const hud = document.querySelector("#hud");
const errorPanel = document.querySelector("#errorPanel");
const skylineMedevacKit = createVrBoardSkylineMedevacReadinessDomainKit();

const level = {
  start: { x: 0, y: 1.1 },
  exit: { id: "skyhook-exit", x: 15.3, y: 4.75, w: 0.78, h: 1.25 },
  platforms: [
    { id: "triage-deck", x: -0.6, y: 1.1, w: 3.1, h: 0.28 },
    { id: "pylon-low", x: 3.1, y: 2.1, w: 1.85, h: 0.26 },
    { id: "wind-gap", x: 5.9, y: 2.9, w: 2.25, h: 0.26 },
    { id: "oxygen-cache", x: 8.9, y: 2.25, w: 1.8, h: 0.26 },
    { id: "relay-summit", x: 11.7, y: 3.65, w: 2.35, h: 0.28 },
    { id: "skyhook-pad", x: 14.7, y: 4.55, w: 1.6, h: 0.3 }
  ],
  collectibles: [
    { id: "oxygen-launch", x: 2.25, y: 2.2, value: 1 },
    { id: "oxygen-wind-gap", x: 6.85, y: 3.88, value: 1 },
    { id: "oxygen-cache", x: 9.65, y: 3.15, value: 1 },
    { id: "oxygen-summit", x: 12.72, y: 4.62, value: 1 }
  ],
  hazards: [
    { id: "wind-shear-gap", x: 4.98, y: 1.05, w: 0.82, h: 0.36 },
    { id: "loose-cable", x: 7.48, y: 2.72, w: 0.74, h: 0.36 },
    { id: "open-drop", x: 10.82, y: 1.1, w: 0.84, h: 0.36 }
  ]
};

const board = { sizeMeters: { x: 1.8, y: 1.0 }, mode: "skyline-medevac" };
const head = { position: { x: 0, y: 1.6, z: 0 }, forward: { x: 0, y: 0, z: -1 }, up: { x: 0, y: 1, z: 0 } };
const keys = new Set();
let avatar = makeAvatar();
let lastSafeAvatar = makeAvatar();
let objects = { collectedValue: 0, collectedIds: [] };
let latestInput = { moveAxis: 0, jumpPressed: false, restartPressed: false };
let latestSkylineMedevacReadiness = null;
let runtimeSurface = { imported: false, factoryName: "unloaded" };
let dragging = false;
let lastPointer = null;
let last = performance.now();

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
  return { position: { x: 0.05, y: 2.0 }, velocity: { x: 0, y: 0 }, size: { x: 0.48, y: 0.78 }, grounded: false, mode: "alive", moveAxis: 0 };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function resetAvatar() {
  avatar = { ...lastSafeAvatar, position: { ...lastSafeAvatar.position }, velocity: { x: 0, y: 0 }, grounded: false, mode: "alive" };
}

function updateAvatar(dt, input) {
  if (input.restartPressed) { avatar = makeAvatar(); lastSafeAvatar = makeAvatar(); objects = { collectedValue: 0, collectedIds: [] }; }
  avatar.moveAxis = input.moveAxis;
  avatar.velocity.x = clamp(avatar.velocity.x + input.moveAxis * 16 * dt, -3.6, 3.6);
  avatar.velocity.x *= avatar.grounded ? 0.84 : 0.96;
  if (input.jumpPressed && avatar.grounded) { avatar.velocity.y = 6.9; avatar.grounded = false; }
  avatar.velocity.y -= 13.4 * dt;
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
  for (const coin of level.collectibles) {
    if (objects.collectedIds.includes(coin.id)) continue;
    const dx = Math.abs((avatar.position.x + avatar.size.x * 0.5) - coin.x);
    const dy = Math.abs((avatar.position.y + avatar.size.y * 0.5) - coin.y);
    if (dx < 0.5 && dy < 0.62) objects = { collectedValue: objects.collectedValue + (coin.value ?? 1), collectedIds: [...objects.collectedIds, coin.id] };
  }
  const hitHazard = level.hazards.some((hazard) => avatar.position.x < hazard.x + hazard.w && avatar.position.x + avatar.size.x > hazard.x && avatar.position.y < hazard.y + hazard.h && avatar.position.y + avatar.size.y > hazard.y);
  if (hitHazard || avatar.position.y < -1.4) { avatar.mode = "fallen"; resetAvatar(); }
}

function buildSnapshot(time) {
  const progress = clamp((avatar.position.x - level.start.x) / Math.max(1, level.exit.x - level.start.x), 0, 1);
  const camera = { position: { x: clamp(avatar.position.x - 3.2, -0.4, 13.2), y: Math.max(1, avatar.position.y - 1.5) } };
  const comfort = { warnings: Math.abs(head.position.x) > 0.18 ? ["head-drift"] : [] };
  const remaining = Math.max(0, level.collectibles.length - objects.collectedIds.length);
  const sequence = { hint: remaining > 0 ? "Recover oxygen canisters" : progress > 0.82 ? "Marshal the medevac pod" : "Lock the skyline tether" };
  latestSkylineMedevacReadiness = skylineMedevacKit.describe({ avatar, level, objects, camera, board, comfort, sequence, xrPose: { head }, input: latestInput, time });
  return { avatar, level, objects, camera, board, comfort, sequence, xrPose: { head }, skylineMedevacReadiness: latestSkylineMedevacReadiness, runtimeSurface };
}

function frame(now) {
  const dt = Math.min(1 / 30, (now - last) / 1000 || 1 / 60);
  last = now;
  latestInput = {
    moveAxis: (keys.has("d") || keys.has("arrowright") ? 1 : 0) - (keys.has("a") || keys.has("arrowleft") ? 1 : 0),
    jumpPressed: keys.has(" ") || keys.has("w") || keys.has("arrowup"),
    restartPressed: keys.has("r")
  };
  updateAvatar(dt, latestInput);
  const snapshot = buildSnapshot(now / 1000);
  const manifest = snapshot.skylineMedevacReadiness.evacManifest;
  objective.textContent = manifest.nextInstruction;
  controls.textContent = `A/D move · Space jump · R reset · ${snapshot.skylineMedevacReadiness.rendererHandoff.counts.total} medevac descriptors`;
  hud.dataset.tone = snapshot.skylineMedevacReadiness.riskState === "extract" ? "success" : snapshot.skylineMedevacReadiness.riskState === "wind-hold" ? "warning" : "neutral";
  drawBoard(snapshot);
  requestAnimationFrame(frame);
}

function drawBoard(snapshot) {
  const w = innerWidth;
  const h = innerHeight;
  ctx.clearRect(0, 0, w, h);
  const scale = Math.min(w * 0.74 / 340, h * 0.7 / 190);
  const cx = w * 0.5 - (snapshot.xrPose?.head?.position?.x ?? 0) * 180;
  const cy = h * 0.52 + (1.6 - (snapshot.xrPose?.head?.position?.y ?? 1.6)) * 120;
  drawRoomGlow(cx, cy, 340 * scale, 190 * scale, snapshot.skylineMedevacReadiness);
  ctx.save();
  ctx.translate(cx - 170 * scale, cy - 95 * scale);
  ctx.scale(scale, scale);
  ctx.fillStyle = "rgba(6,10,20,.96)";
  roundRect(ctx, -8, -8, 356, 206, 14); ctx.fill();
  ctx.strokeStyle = "rgba(150,220,255,.55)"; ctx.stroke();
  ctx.save(); roundRect(ctx, 0, 0, 340, 190, 8); ctx.clip();
  ctx.fillStyle = "#101b31"; ctx.fillRect(0, 0, 340, 190);
  ctx.fillStyle = "#172a4c"; ctx.fillRect(0, 124, 340, 66);
  const cameraX = snapshot.camera.position.x;
  const cameraY = snapshot.camera.position.y;
  drawSkylineMedevac(snapshot.skylineMedevacReadiness, cameraX, cameraY);
  drawLevel(snapshot.level, snapshot.objects, cameraX, cameraY);
  drawAvatar(snapshot.avatar, cameraX, cameraY);
  drawReadinessStrip(snapshot.skylineMedevacReadiness);
  ctx.restore();
  ctx.fillStyle = "rgba(255,255,255,.78)"; ctx.font = "5px ui-sans-serif";
  ctx.fillText(`board ${snapshot.board.sizeMeters.x}m · NexusEngine ${snapshot.runtimeSurface.factoryName} · medevac ${snapshot.skylineMedevacReadiness.medevacReadiness}`, 4, 202);
  ctx.restore();
}

function drawRoomGlow(cx, cy, bw, bh, medevac) {
  const readiness = medevac?.medevacReadiness ?? 0.2;
  const gradient = ctx.createRadialGradient(cx, cy - bh * 0.8, 20, cx, cy, Math.max(bw, bh));
  gradient.addColorStop(0, `rgba(105, 226, 255, ${0.2 + readiness * 0.16})`);
  gradient.addColorStop(0.55, `rgba(145, 105, 255, ${0.08 + readiness * 0.12})`);
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, innerWidth, innerHeight);
}

function drawSkylineMedevac(medevac, cameraX, cameraY) {
  const descriptors = medevac?.rendererHandoff?.descriptors ?? {};
  for (const ribbon of descriptors.crosswindRibbons ?? []) { const p = worldToScreen(ribbon.x, ribbon.y, cameraX, cameraY); ctx.strokeStyle = ribbon.phase === "hold" ? `rgba(255, 205, 93, ${0.28 + ribbon.gust * 0.34})` : `rgba(120, 235, 255, ${0.18 + ribbon.gust * 0.22})`; ctx.beginPath(); ctx.ellipse(p.x, p.y + 35, ribbon.width * 18, 10 + ribbon.gust * 10, 0, 0, Math.PI * 2); ctx.stroke(); }
  for (const thread of descriptors.harnessThreads ?? []) { const a = worldToScreen(thread.x1, thread.y1, cameraX, cameraY); const b = worldToScreen(thread.x2, thread.y2, cameraX, cameraY); ctx.strokeStyle = `rgba(142, 255, 222, ${0.2 + thread.priority * 0.42})`; ctx.setLineDash([5, 3]); ctx.beginPath(); ctx.moveTo(a.x, a.y - 12); ctx.lineTo((a.x + b.x) / 2, ((a.y + b.y) / 2) - 18 - thread.slack * 12); ctx.lineTo(b.x, b.y - 12); ctx.stroke(); ctx.setLineDash([]); }
  for (const pylon of descriptors.anchorPylons ?? []) { const p = worldToScreen(pylon.x, pylon.y, cameraX, cameraY); ctx.fillStyle = pylon.status === "locked" ? "rgba(150,255,190,.68)" : "rgba(255,218,116,.5)"; ctx.fillRect(p.x - 2, p.y - 22, 4, 22); ctx.beginPath(); ctx.arc(p.x, p.y - 24, 3 + pylon.charge * 4, 0, Math.PI * 2); ctx.fill(); }
  for (const canister of descriptors.oxygenCanisters ?? []) { const p = worldToScreen(canister.x, canister.y, cameraX, cameraY); ctx.fillStyle = canister.available ? "rgba(120,230,255,.7)" : "rgba(145,255,173,.32)"; roundRect(ctx, p.x - 4, p.y - 8, 8, 13, 3); ctx.fill(); }
  for (const pod of descriptors.medevacPods ?? []) { const p = worldToScreen(pod.x, pod.y, cameraX, cameraY); ctx.strokeStyle = pod.phase === "launch" ? "rgba(157,255,122,.95)" : "rgba(255,255,255,.34)"; ctx.beginPath(); ctx.arc(p.x + 8, p.y - 26, 9 + pod.readiness * 16, 0, Math.PI * 2); ctx.stroke(); }
}

function drawLevel(level, objects, cameraX, cameraY) {
  for (const platform of level.platforms) { const p = worldToScreen(platform.x, platform.y, cameraX, cameraY); ctx.fillStyle = "rgba(127,167,255,.92)"; roundRect(ctx, p.x, p.y - platform.h * 18, platform.w * 18, platform.h * 18, 2); ctx.fill(); }
  for (const hazard of level.hazards) { const p = worldToScreen(hazard.x, hazard.y, cameraX, cameraY); ctx.fillStyle = "rgba(255,75,110,.86)"; ctx.fillRect(p.x, p.y - hazard.h * 18, hazard.w * 18, hazard.h * 18); }
  for (const coin of level.collectibles) { if (objects.collectedIds.includes(coin.id)) continue; const p = worldToScreen(coin.x, coin.y, cameraX, cameraY); ctx.fillStyle = "rgba(120,230,255,.92)"; ctx.beginPath(); ctx.arc(p.x, p.y, 4.4, 0, Math.PI * 2); ctx.fill(); }
  const exit = level.exit; const e = worldToScreen(exit.x, exit.y, cameraX, cameraY); ctx.strokeStyle = "rgba(157,255,122,.92)"; ctx.lineWidth = 2; ctx.strokeRect(e.x, e.y - exit.h * 18, exit.w * 18, exit.h * 18);
}

function drawAvatar(avatar, cameraX, cameraY) { const p = worldToScreen(avatar.position.x, avatar.position.y, cameraX, cameraY); ctx.fillStyle = avatar.mode === "fallen" ? "#ff4b6e" : "#ffffff"; roundRect(ctx, p.x, p.y - avatar.size.y * 18, avatar.size.x * 18, avatar.size.y * 18, 3); ctx.fill(); }
function drawReadinessStrip(medevac) { const readiness = medevac.medevacReadiness ?? 0; ctx.fillStyle = "rgba(0,0,0,.34)"; roundRect(ctx, 8, 8, 136, 12, 6); ctx.fill(); ctx.fillStyle = medevac.riskState === "wind-hold" ? "#ffcf70" : "#78ffd6"; roundRect(ctx, 10, 10, 132 * readiness, 8, 4); ctx.fill(); }
function worldToScreen(x, y, cameraX, cameraY) { return { x: 164 + (x - cameraX) * 18, y: 124 - (y - cameraY) * 18 }; }
function roundRect(context, x, y, w, h, r) { context.beginPath(); context.moveTo(x + r, y); context.arcTo(x + w, y, x + w, y + h, r); context.arcTo(x + w, y + h, x, y + h, r); context.arcTo(x, y + h, x, y, r); context.arcTo(x, y, x + w, y, r); context.closePath(); }
function composedRendererHandoff() { const handoff = latestSkylineMedevacReadiness?.rendererHandoff ?? null; return handoff ? { ...handoff, id: "vr-board-skyline-medevac-composed-renderer-handoff", skylineMedevacReadiness: handoff } : null; }

async function boot() {
  const NexusEngine = await import(NEXUS_URL);
  const createEngine = NexusEngine.createRealtimeGame ?? NexusEngine.createRealtimeEngine ?? NexusEngine.createEngine;
  runtimeSurface = { imported: true, factoryName: typeof createEngine === "function" ? (createEngine.name || "createEngine") : "namespace-only" };
  window.GameHost = {
    getState: () => ({ avatar, level, objects, board, skylineMedevacReadiness: latestSkylineMedevacReadiness, domain: { vrBoardSkylineMedevacReadiness: latestSkylineMedevacReadiness }, runtimeSurface }),
    getSkylineMedevacReadiness: () => latestSkylineMedevacReadiness,
    getVrBoardSkylineMedevacReadiness: () => latestSkylineMedevacReadiness,
    getSkylineMedevacReadinessTree: () => skylineMedevacKit.tree,
    getRendererHandoff: () => composedRendererHandoff(),
    getBoardDomainSnapshot: () => skylineMedevacKit.snapshot({ avatar, level, objects, board, xrPose: { head }, input: latestInput, time: performance.now() / 1000 }),
    reset: () => { avatar = makeAvatar(); lastSafeAvatar = makeAvatar(); objects = { collectedValue: 0, collectedIds: [] }; }
  };
  requestAnimationFrame(frame);
}

boot().catch(showFatal);

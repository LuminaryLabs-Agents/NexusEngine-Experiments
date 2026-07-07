import { generateLayeredDrunkWalkLevel } from "./layered-level-generator.js";
import { STYLE, seededNoise } from "./stonewake-style-composition.js";

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const keys = new Set();
const pressed = new Set();
const mouse = { x: 0, y: 0 };
const ui = {
  start: document.querySelector("#start"),
  end: document.querySelector("#end"),
  endTitle: document.querySelector("#endTitle"),
  endCopy: document.querySelector("#endCopy"),
  endKicker: document.querySelector("#endKicker"),
  prompt: document.querySelector("#prompt"),
  water: document.querySelector("#waterText"),
  noise: document.querySelector("#noiseText"),
  plate: document.querySelector("#plateText"),
  gate: document.querySelector("#gateText")
};
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (min, max) => min + Math.random() * (max - min);
const rectHit = (a, b) => a.x + a.w > b.x && a.x < b.x + b.w && a.y + a.h > b.y && a.y < b.y + b.h;
let audioCtx = null;
let running = false;
let last = 0;
let level = null;
let s = null;

const generationRequest = {
  id: "stonewake-styled-main",
  seed: "stonewake-style-006",
  bounds: { width: 4200, height: 920, margin: 80 },
  targets: { focusPoints: 4, platforms: 20, recoveryPlatforms: 5, chains: 5, heavyBlocks: 1, weightedTriggers: 1, valves: 1, finishGates: 1, creatures: 1, waterZones: 1, torches: 12, wallMarks: 14, reactiveEffectAnchors: 50 },
  style: { routeWalk: "forward-wandering", verticality: 0.55, dangerBias: "lower-route", particleDensity: 0.9 },
  constraints: { maxJumpDistance: 185, maxJumpHeight: 125, minPlatformWidth: 110, minFocusSpacing: 520 }
};

function objectByType(type) { return level.objects.find((object) => object.type === type) ?? null; }
function makeState() {
  const player = objectByType("player");
  const block = objectByType("heavy-block");
  const creature = objectByType("sensory-creature");
  const water = level.hazards.find((hazard) => hazard.type === "rising-water");
  return {
    tick: 0, time: 0, status: "playing", jumpQueued: false,
    camera: { x: 0, y: 0, shake: 0 }, flash: 0, blueBloom: 0,
    player: { x: player.x, y: player.y, w: 24, h: 46, vx: 0, vy: 0, grounded: false, face: 1, sneak: false, climbing: false, coyote: 0, jumpBuffer: 0, lastLandVy: 0, weight: 1 },
    block: { x: block.x, y: block.y, w: 58, h: 54, vx: 0, vy: 0, grounded: false, lastLandVy: 0, weight: block.weight ?? 5 },
    creature: { x: creature.x, y: creature.y, w: 82, h: 32, vx: 28, state: "patrol", targetX: creature.x, patrol: creature.patrolBounds, listenTimer: 0, chaseTimer: 0, alert: 0 },
    water: { level: water.startLevel, speed: water.speed, acceleratedSpeed: water.acceleratedSpeed, wave: 0, splashGate: 0 },
    plate: { active: false, weight: 0 }, valve: { progress: 0, complete: false, glow: 0 }, gate: { state: "sealed", progress: 0, burstDone: false },
    acoustic: { signals: [], lastIntensity: 0 }, projectiles: [], particles: []
  };
}

function tone(freq = 120, gain = 0.04, dur = 0.12, type = "sine") {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = type; osc.frequency.setValueAtTime(freq, t); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g); g.connect(audioCtx.destination); osc.start(t); osc.stop(t + dur);
}

const Particles = {
  emit(kind, x, y, count = 12, opts = {}) {
    const colors = { dust:["#a3a9af", "#6f7781"], spark:["#ffd166", "#ff8c42"], mist:["rgba(124,225,255,.55)"], bubble:["rgba(180,242,255,.72)"], rune:[STYLE.palette.cyan, STYLE.palette.rune], sound:["rgba(210,245,255,.58)"], chip:["#a6b0ba"], alert:[STYLE.palette.danger], door:[STYLE.palette.cyan, "#fff"], foam:["rgba(222,252,255,.8)"], mote:["rgba(255,209,102,.7)"] }[kind] ?? ["#fff"];
    for (let index = 0; index < count; index += 1) {
      const angle = (opts.angle ?? rand(0, Math.PI * 2)) + rand(-(opts.spread ?? Math.PI * 2) / 2, (opts.spread ?? Math.PI * 2) / 2);
      const speed = rand(opts.minSpeed ?? 10, opts.maxSpeed ?? 120);
      s.particles.push({ kind, x: x + rand(-5, 5), y: y + rand(-5, 5), vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, ay: opts.ay ?? (kind === "bubble" ? -14 : kind === "mist" ? -8 : kind === "spark" || kind === "chip" ? 420 : 0), r: rand(opts.minR ?? 1.4, opts.maxR ?? 4.8), life: rand(opts.minLife ?? 0.45, opts.maxLife ?? 1.35), age: 0, color: colors[(Math.random() * colors.length) | 0] });
    }
  },
  update(dt) { s.particles = s.particles.filter((p) => { p.age += dt; p.vy += p.ay * dt; p.x += p.vx * dt; p.y += p.vy * dt; return p.age < p.life; }); },
  draw() {
    for (const p of s.particles) {
      const t = p.age / p.life;
      ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = 1 - t;
      if (p.kind === "sound" || p.kind === "alert") { ctx.strokeStyle = p.color; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(p.x, p.y, p.r + t * 48, 0, Math.PI * 2); ctx.stroke(); }
      else { const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * (p.kind === "mist" ? 5 : 2.2)); g.addColorStop(0, p.color); g.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (p.kind === "mist" ? 5 : 2.2), 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
  }
};

const Domain = {
  sound(x, y, intensity, source) { s.acoustic.signals.push({ x, y, r: 4, max: 70 + intensity * 130, speed: 230, intensity, source, hit: false }); s.acoustic.lastIntensity = Math.max(s.acoustic.lastIntensity, intensity); Particles.emit("sound", x, y, Math.ceil(10 + intensity * 16), { minSpeed: 0, maxSpeed: 18, minR: 5, maxR: 18 }); },
  throwPebble() { if (s.status !== "playing") return; const px = s.player.x + 12; const py = s.player.y + 23; const angle = Math.atan2(mouse.y - py, mouse.x - px); const power = clamp(Math.hypot(mouse.x - px, mouse.y - py) * 2.5, 170, 560); s.projectiles.push({ x: px, y: py, vx: Math.cos(angle) * power, vy: Math.sin(angle) * power, r: 4, bounces: 0, life: 4, trail: 0 }); tone(920, 0.035, 0.08, "triangle"); }
};

function collideBody(body, axis) {
  body.grounded = false;
  for (const platform of level.platforms) {
    if (!rectHit(body, platform)) continue;
    if (axis === "y") {
      if (body.vy > 0) { body.y = platform.y - body.h; body.lastLandVy = body.vy; body.vy = 0; body.grounded = true; }
      else if (body.vy < 0) { body.y = platform.y + platform.h; body.vy = 0; }
    } else { if (body.vx > 0) body.x = platform.x - body.w; if (body.vx < 0) body.x = platform.x + platform.w; body.vx = 0; }
  }
  const plate = objectByType("weighted-trigger");
  const plateRect = { x: plate.x - 46, y: plate.y, w: 92, h: 12 };
  if (rectHit(body, plateRect) && body.vy >= 0 && body.y + body.h < plateRect.y + 20) { body.y = plateRect.y - body.h; body.vy = 0; body.grounded = true; }
}
function stepBody(body, dt, gravity = 980) {
  body.vy += gravity * dt; body.x += body.vx * dt; collideBody(body, "x"); body.y += body.vy * dt; const was = body.grounded; collideBody(body, "y");
  if (!was && body.grounded && Math.abs(body.lastLandVy ?? 0) > 240) { Particles.emit("dust", body.x + body.w / 2, body.y + body.h, body === s.block ? 34 : 14, { angle: -Math.PI / 2, spread: Math.PI }); if (body === s.player && !s.player.sneak) Domain.sound(body.x + body.w / 2, body.y + body.h, 0.45, "landing"); }
  body.vx *= body.grounded ? 0.82 : 0.99;
}
function nearChain() { return level.objects.filter((o) => o.type === "chain").find((chain) => Math.abs((s.player.x + 12) - chain.x) < 24 && s.player.y + s.player.h > chain.y && s.player.y < chain.y + chain.h) ?? null; }

function updateProjectiles(dt) {
  s.projectiles = s.projectiles.filter((p) => {
    p.life -= dt; p.trail -= dt; p.vy += 980 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.trail <= 0) { p.trail = 0.04; Particles.emit("mote", p.x, p.y, 2, { minSpeed: 2, maxSpeed: 18, minLife: 0.15, maxLife: 0.36 }); }
    for (const platform of level.platforms) if (p.x > platform.x && p.x < platform.x + platform.w && p.y > platform.y && p.y < platform.y + platform.h) { p.y = platform.y - 4; p.vy *= -0.42; p.vx *= 0.48; p.bounces += 1; Particles.emit("chip", p.x, p.y, 22, { minSpeed: 35, maxSpeed: 190, angle: -Math.PI / 2, spread: Math.PI }); Domain.sound(p.x, p.y, 0.7 / Math.max(1, p.bounces), "pebble"); }
    if (p.y > s.water.level) { Particles.emit("bubble", p.x, s.water.level, 16, { angle: -Math.PI / 2, spread: Math.PI / 2 }); Domain.sound(p.x, s.water.level, 0.78, "splash"); return false; }
    return p.life > 0 && p.bounces < 4;
  });
}

function updateCreature(dt) {
  const c = s.creature;
  const center = { x: c.x + c.w / 2, y: c.y + c.h / 2 };
  s.acoustic.lastIntensity *= Math.pow(0.02, dt);
  s.acoustic.signals = s.acoustic.signals.filter((sig) => { sig.r += sig.speed * dt; if (!sig.hit && Math.hypot(sig.x - center.x, sig.y - center.y) < sig.r + 34) { sig.hit = true; c.targetX = sig.x; c.state = "listening"; c.listenTimer = 0.6; c.chaseTimer = sig.intensity > 1.05 ? 4 : 0; c.alert = Math.max(c.alert, sig.intensity > 1.05 ? 1 : 0.55); Particles.emit(sig.intensity > 1.05 ? "alert" : "sound", center.x, center.y, 20); } return sig.r < sig.max; });
  if (c.state === "listening") { c.vx *= 0.86; c.listenTimer -= dt; if (c.listenTimer <= 0) c.state = c.chaseTimer > 0 ? "chase" : "investigate"; }
  else if (c.state === "chase") { c.chaseTimer -= dt; c.vx = Math.sign(c.targetX - c.x) * 95; if (c.chaseTimer <= 0) c.state = "investigate"; }
  else if (c.state === "investigate") { c.vx = Math.sign(c.targetX - c.x) * 44; if (Math.abs(c.targetX - c.x) < 18) c.state = "patrol"; }
  else { if (c.x < c.patrol.x) c.vx = 28; if (c.x > c.patrol.x + c.patrol.w) c.vx = -28; }
  if (Math.abs((s.player.x + 12) - center.x) < 86 && Math.abs((s.player.y + 20) - center.y) < 65 && !s.player.sneak) Domain.sound(s.player.x, s.player.y, 1.2, "player-noise");
  c.x = clamp(c.x + c.vx * dt, c.patrol.x, c.patrol.x + c.patrol.w); c.alert = lerp(c.alert, c.state === "chase" ? 1 : c.state === "listening" || c.state === "investigate" ? 0.5 : 0.1, 0.08);
}

function update(dt) {
  if (s.status !== "playing") return;
  s.tick += 1; s.time += dt; s.flash = Math.max(0, s.flash - dt);
  const p = s.player; p.sneak = keys.has("ShiftLeft") || keys.has("ShiftRight"); p.jumpBuffer = Math.max(0, p.jumpBuffer - dt); p.coyote = p.grounded ? 0.11 : Math.max(0, p.coyote - dt);
  if (s.jumpQueued) { p.jumpBuffer = 0.11; s.jumpQueued = false; }
  const chain = nearChain(); p.climbing = Boolean(chain && (keys.has("KeyW") || keys.has("KeyS")));
  const maxSpeed = p.sneak ? STYLE.movement.sneakMaxSpeed : STYLE.movement.normalMaxSpeed;
  const accel = p.grounded ? STYLE.movement.groundAccel : STYLE.movement.airAccel;
  if (keys.has("KeyA") || keys.has("ArrowLeft")) { p.vx = Math.max(-maxSpeed, p.vx - accel * dt); p.face = -1; }
  else if (keys.has("KeyD") || keys.has("ArrowRight")) { p.vx = Math.min(maxSpeed, p.vx + accel * dt); p.face = 1; }
  else if (p.grounded) p.vx *= Math.pow(0.001, dt);
  if (p.climbing) { p.vy = (keys.has("KeyW") ? -130 : 0) + (keys.has("KeyS") ? 130 : 0); p.x = lerp(p.x, chain.x - p.w / 2, 0.16); }
  else if (p.jumpBuffer > 0 && p.coyote > 0) { p.vy = STYLE.movement.jumpVelocity; p.grounded = false; p.coyote = 0; p.jumpBuffer = 0; Particles.emit("dust", p.x + p.w / 2, p.y + p.h, 20, { angle: -Math.PI / 2, spread: Math.PI }); if (!p.sneak) Domain.sound(p.x + p.w / 2, p.y + p.h, 0.45, "jump"); }
  stepBody(p, dt, p.climbing ? 0 : 980); p.x = clamp(p.x, 42, level.bounds.width - 66);
  const blockNear = Math.abs((p.x + 12) - (s.block.x + s.block.w / 2)) < 62 && p.y + p.h > s.block.y + 6 && p.y < s.block.y + s.block.h;
  if (blockNear && Math.abs(p.vx) > 22) { s.block.vx += p.vx * 0.04; p.vx *= 0.56; if (s.tick % 7 === 0) { Particles.emit("spark", s.block.x + s.block.w / 2, s.block.y + s.block.h - 6, 5); Domain.sound(s.block.x + s.block.w / 2, s.block.y + s.block.h, 0.8, "scrape"); } }
  stepBody(s.block, dt);
  const plate = objectByType("weighted-trigger"); const valve = objectByType("valve"); const gate = objectByType("finish-gate");
  const onPlate = (body) => body.x + body.w / 2 > plate.x - 46 && body.x + body.w / 2 < plate.x + 46 && Math.abs(body.y + body.h - plate.y) < 18;
  const oldPlate = s.plate.active; s.plate.weight = (onPlate(s.block) ? s.block.weight : 0) + (onPlate(p) ? p.weight : 0); s.plate.active = s.plate.weight >= plate.requiredWeight;
  if (s.plate.active && !oldPlate) { s.flash = 0.22; s.camera.shake = 4; Particles.emit("rune", plate.x, plate.y - 8, 42); Domain.sound(plate.x, plate.y, 0.9, "plate"); }
  const nearValve = Math.hypot((p.x + 12) - valve.x, (p.y + 23) - valve.y) < 78; s.valve.glow = lerp(s.valve.glow, nearValve ? 1 : 0, 0.08);
  ui.prompt.textContent = nearValve && !s.valve.complete ? "Hold E to turn textured valve" : blockNear ? "Push textured block onto rune plate" : chain ? "W/S climb chain" : ""; ui.prompt.classList.toggle("show", Boolean(ui.prompt.textContent));
  if (nearValve && keys.has("KeyE") && !s.valve.complete) { s.valve.progress = clamp(s.valve.progress + dt * 0.48, 0, 1); if (s.tick % 8 === 0) { Particles.emit("rune", valve.x, valve.y, 12); Domain.sound(valve.x, valve.y, 0.72, "valve"); } if (s.valve.progress >= 1) { s.valve.complete = true; s.water.speed = s.water.acceleratedSpeed; Particles.emit("door", valve.x, valve.y, 70); tone(66, 0.12, 0.75, "sawtooth"); } }
  const met = s.plate.active && s.valve.complete; s.gate.progress = clamp(s.gate.progress + Math.sign((met ? 1 : 0) - s.gate.progress) * (met ? 0.4 : 0.6) * dt, 0, 1); s.gate.state = s.gate.progress >= 0.98 ? "open" : s.gate.progress > 0.02 ? "waking" : "sealed"; s.blueBloom = lerp(s.blueBloom, met ? 1 : 0, 0.04); if (s.gate.state === "waking" && s.tick % 6 === 0) Particles.emit("door", gate.x, gate.y, 8);
  updateProjectiles(dt); updateCreature(dt); s.water.level -= s.water.speed * dt; s.water.wave += dt * 2.6; if (s.tick % 6 === 0) { Particles.emit("mist", rand(60, level.bounds.width - 60), s.water.level - 3, 3); Particles.emit("foam", rand(60, level.bounds.width - 60), s.water.level, 2); }
  if (p.y + p.h > s.water.level && s.water.splashGate <= 0) { s.water.splashGate = 0.18; Particles.emit("bubble", p.x + 12, s.water.level, 20, { angle: -Math.PI / 2, spread: Math.PI / 2 }); Domain.sound(p.x + 12, s.water.level, 0.66, "water"); }
  s.water.splashGate = Math.max(0, s.water.splashGate - dt); if (p.y + p.h - 12 > s.water.level) return endRun("Depths Took You", "The blackwater closed around the route.", true); if (Math.hypot((p.x + 12) - (s.creature.x + 41), (p.y + 23) - (s.creature.y + 16)) < 34) return endRun("Depths Took You", "The blind creature caught your sound.", true); if (s.gate.state === "open" && p.x + p.w > gate.x) return endRun("Chamber Woken", "The styled generated path resolves into an open door.", false);
  Particles.update(dt); s.camera.x = lerp(s.camera.x, clamp(p.x - 640, 0, Math.max(0, level.bounds.width - 1280)), 0.08); s.camera.y = lerp(s.camera.y, clamp(p.y - 360, 0, Math.max(0, level.bounds.height - 720)), 0.08); s.camera.shake *= Math.pow(0.02, dt);
  ui.water.textContent = `Water: ${s.valve.complete ? "rerouted faster" : "styled blackwater rising"}`; ui.noise.textContent = `Acoustic signal: ${s.acoustic.lastIntensity > 0.95 ? "dangerous" : s.acoustic.lastIntensity > 0.35 ? "audible" : "quiet"}`; ui.plate.textContent = `Plate: ${s.plate.active ? "engaged" : "unweighted"}`; ui.gate.textContent = `Door: ${s.gate.state}`;
}
function endRun(title, copy, danger) { s.status = danger ? "failed" : "won"; ui.endTitle.textContent = title; ui.endCopy.textContent = copy; ui.endKicker.textContent = danger ? "Run Failed" : "Styled Route Complete"; ui.endTitle.classList.toggle("danger", danger); ui.end.classList.remove("hidden"); }

function glow(x, y, r, color, alpha = 1) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, color); g.addColorStop(1, "rgba(0,0,0,0)"); ctx.globalAlpha = alpha; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
function texturedRect(x, y, w, h, role, seed = 1) {
  const n = seededNoise(seed); ctx.fillStyle = role === "boundary" ? STYLE.palette.stoneDark : role === "floor" ? "#111b26" : STYLE.palette.stoneBase; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = `rgba(255,255,255,${0.025 + n * 0.025})`; for (let i = 0; i < Math.max(4, w / 28); i += 1) { const px = x + ((i * 37 + seed * 11) % Math.max(1, w)); const py = y + 5 + ((i * 17 + seed * 7) % Math.max(1, h - 8)); ctx.fillRect(px, py, Math.max(8, w * 0.04), 1); }
  ctx.strokeStyle = "rgba(133,230,255,.24)"; ctx.strokeRect(x, y, w, h); ctx.fillStyle = "rgba(87,221,255,.16)"; ctx.fillRect(x, y, w, 3); ctx.fillStyle = "rgba(0,0,0,.22)"; ctx.fillRect(x, y + h - 5, w, 5);
}
function drawActors() {
  const p = s.player; glow(p.x + 12, p.y + 24, 58, "rgba(255,215,140,.28)"); ctx.save(); ctx.translate(p.x + 12, p.y + 24); ctx.scale(p.face, 1); ctx.fillStyle = "#d8e8ef"; ctx.beginPath(); ctx.arc(0, -15, 7, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#263241"; ctx.beginPath(); ctx.moveTo(-9, -6); ctx.lineTo(9, -6); ctx.lineTo(13, 16); ctx.lineTo(-13, 16); ctx.closePath(); ctx.fill(); ctx.fillStyle = STYLE.palette.warm; ctx.beginPath(); ctx.arc(12, 2, 4, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#657789"; ctx.fillRect(-7, 16, 5, 12); ctx.fillRect(3, 16, 5, 12); ctx.restore();
  const c = s.creature; glow(c.x + c.w / 2, c.y + 8, 40 + c.alert * 90, c.state === "chase" ? "rgba(255,40,62,.55)" : "rgba(87,221,255,.36)"); ctx.fillStyle = "#04070b"; ctx.beginPath(); ctx.ellipse(c.x + c.w / 2, c.y + c.h / 2, 42, 16, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = c.state === "chase" ? STYLE.palette.danger : STYLE.palette.cyan; ctx.globalAlpha = 0.35 + c.alert * 0.55; ctx.beginPath(); ctx.moveTo(c.x + c.w - 12, c.y + 9); ctx.quadraticCurveTo(c.x + c.w + 32, c.y - 12, c.x + c.w + 62, c.y + 8); ctx.stroke(); ctx.globalAlpha = 1;
}
function draw() {
  ctx.clearRect(0, 0, 1280, 720); const shakeX = (Math.random() - 0.5) * s.camera.shake; const shakeY = (Math.random() - 0.5) * s.camera.shake; ctx.save(); ctx.translate(-s.camera.x + shakeX, -s.camera.y + shakeY);
  const bg = ctx.createLinearGradient(0, 0, 0, level.bounds.height); bg.addColorStop(0, "#142131"); bg.addColorStop(0.45, "#07101a"); bg.addColorStop(1, "#010306"); ctx.fillStyle = bg; ctx.fillRect(0, 0, level.bounds.width, level.bounds.height);
  for (const chamber of level.chambers) glow(chamber.center.x, chamber.center.y, Math.max(chamber.radiusX, chamber.radiusY), chamber.role === "finish" ? "rgba(87,221,255,.08)" : "rgba(255,255,255,.035)");
  for (let i = 0; i < level.bounds.width; i += 120) { ctx.strokeStyle = "rgba(180,210,220,.045)"; ctx.beginPath(); ctx.moveTo(i, 80 + Math.sin(i * 0.015) * 20); ctx.lineTo(i + 80, level.bounds.height - 80); ctx.stroke(); }
  for (const platform of level.platforms) texturedRect(platform.x, platform.y, platform.w, platform.h, platform.role, platform.x + platform.y);
  for (const chain of level.objects.filter((o) => o.type === "chain")) { ctx.strokeStyle = "rgba(176,218,230,.38)"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(chain.x, chain.y); ctx.lineTo(chain.x, chain.y + chain.h); ctx.stroke(); for (let y = chain.y; y < chain.y + chain.h; y += 20) ctx.strokeRect(chain.x - 8, y, 16, 11); }
  for (const torch of level.dressing.filter((item) => item.type === "torch")) glow(torch.x, torch.y, 82 + Math.sin(s.time * 7 + torch.x) * 8, "rgba(255,165,72,.22)");
  const plate = objectByType("weighted-trigger"); const valve = objectByType("valve"); const gate = objectByType("finish-gate"); glow(plate.x, plate.y, 70, s.plate.active ? "rgba(87,221,255,.45)" : "rgba(225,166,80,.35)"); ctx.fillStyle = s.plate.active ? STYLE.palette.cyan : STYLE.palette.warm; ctx.fillRect(plate.x - 46, plate.y, 92, 12); ctx.strokeStyle = STYLE.palette.rune; ctx.strokeRect(plate.x - 54, plate.y - 8, 108, 28);
  glow(valve.x, valve.y, 90, `rgba(87,221,255,${0.18 + s.valve.glow * 0.7})`); ctx.strokeStyle = s.valve.complete ? STYLE.palette.cyan : "#b8884c"; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(valve.x, valve.y, 28, 0, Math.PI * 2); ctx.stroke();
  const open = s.gate.progress * 148; glow(gate.x, gate.y + 70, 135, `rgba(87,221,255,${0.22 + s.blueBloom * 0.35})`); texturedRect(gate.x, gate.y - open, 40, 148, "door", 99); ctx.strokeStyle = s.gate.state === "sealed" ? "rgba(87,221,255,.38)" : STYLE.palette.cyan; ctx.strokeRect(gate.x, gate.y - open, 40, 148);
  texturedRect(s.block.x, s.block.y, s.block.w, s.block.h, "block", 44);
  for (const sig of s.acoustic.signals) { ctx.strokeStyle = `rgba(205,245,255,${Math.max(0.04, 0.42 - sig.r / sig.max * 0.36)})`; ctx.beginPath(); ctx.arc(sig.x, sig.y, sig.r, 0, Math.PI * 2); ctx.stroke(); }
  ctx.fillStyle = "#d8e1e8"; for (const p of s.projectiles) { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); }
  drawActors(); const y = s.water.level; const wg = ctx.createLinearGradient(0, y - 30, 0, level.bounds.height); wg.addColorStop(0, "rgba(40,145,200,.45)"); wg.addColorStop(1, "rgba(3,17,31,.92)"); ctx.fillStyle = wg; ctx.beginPath(); ctx.moveTo(0, y); for (let x = 0; x <= level.bounds.width; x += 14) ctx.lineTo(x, y + Math.sin(x * 0.02 + s.water.wave) * 5); ctx.lineTo(level.bounds.width, level.bounds.height); ctx.lineTo(0, level.bounds.height); ctx.closePath(); ctx.fill(); ctx.strokeStyle = "rgba(188,248,255,.68)"; ctx.stroke();
  Particles.draw(); const light = ctx.createRadialGradient(s.player.x + 12, s.player.y + 24, 18, s.player.x + 12, s.player.y + 24, 260); light.addColorStop(0, "rgba(255,224,160,.32)"); light.addColorStop(0.36, "rgba(255,214,126,.16)"); light.addColorStop(1, "rgba(0,0,0,0)"); ctx.globalCompositeOperation = "screen"; ctx.fillStyle = light; ctx.beginPath(); ctx.arc(s.player.x + 12, s.player.y + 24, 260, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = `rgba(87,221,255,${0.06 + s.blueBloom * 0.13})`; ctx.fillRect(s.camera.x, s.camera.y, 1280, 720); ctx.globalCompositeOperation = "source-over"; ctx.fillStyle = "rgba(0,0,0,.22)"; ctx.fillRect(s.camera.x, s.camera.y, 1280, 720); if (s.flash > 0) { ctx.fillStyle = `rgba(180,245,255,${s.flash})`; ctx.fillRect(s.camera.x, s.camera.y, 1280, 720); } ctx.restore();
}
function loop(time) { const dt = Math.min(0.033, (time - last) / 1000 || 0.016); last = time; update(dt); draw(); if (running) requestAnimationFrame(loop); }
function restart() { level = generateLayeredDrunkWalkLevel(generationRequest); s = makeState(); ui.end.classList.add("hidden"); running = true; last = performance.now(); requestAnimationFrame(loop); }
document.querySelector("#startBtn").addEventListener("click", (event) => { event.currentTarget.blur(); audioCtx ||= new (window.AudioContext || window.webkitAudioContext)(); ui.start.classList.add("hidden"); restart(); });
document.querySelector("#againBtn").addEventListener("click", (event) => { event.currentTarget.blur(); restart(); });
addEventListener("keydown", (event) => { if (event.code === "Space") { event.preventDefault(); if (!event.repeat && s?.status === "playing") s.jumpQueued = true; return; } keys.add(event.code); if (event.code === "KeyR") restart(); });
addEventListener("keyup", (event) => { if (event.code === "Space") { event.preventDefault(); return; } keys.delete(event.code); });
canvas.addEventListener("mousemove", (event) => { const rect = canvas.getBoundingClientRect(); mouse.x = (event.clientX - rect.left) * 1280 / rect.width + (s?.camera.x ?? 0); mouse.y = (event.clientY - rect.top) * 720 / rect.height + (s?.camera.y ?? 0); });
canvas.addEventListener("mousedown", () => Domain.throwPebble());
level = generateLayeredDrunkWalkLevel(generationRequest); s = makeState(); window.GameHost = { getState: () => JSON.parse(JSON.stringify(s)), getLevel: () => JSON.parse(JSON.stringify(level)), regenerate: restart, style: STYLE, Domain, Particles }; draw();

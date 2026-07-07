import { generateLayeredDrunkWalkLevel } from "./layered-level-generator.js";

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const keys = new Set();
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

const request = {
  id: "stonewake-generated-main",
  seed: "stonewake-main-004",
  bounds: { width: 4200, height: 920, margin: 80 },
  targets: {
    focusPoints: 4,
    platforms: 18,
    recoveryPlatforms: 4,
    chains: 5,
    heavyBlocks: 1,
    weightedTriggers: 1,
    valves: 1,
    finishGates: 1,
    creatures: 1,
    waterZones: 1,
    torches: 10,
    wallMarks: 12,
    reactiveEffectAnchors: 40
  },
  style: { routeWalk: "forward-wandering", verticality: 0.55, dangerBias: "lower-route", particleDensity: 0.9 },
  constraints: { maxJumpDistance: 190, maxJumpHeight: 125, minPlatformWidth: 100, minFocusSpacing: 520 }
};

function tone(freq = 120, gain = 0.04, dur = 0.12, type = "sine") {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g);
  g.connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + dur);
}

function objectByType(type) {
  return level.objects.find((object) => object.type === type) ?? null;
}

function makeState() {
  const player = objectByType("player");
  const block = objectByType("heavy-block");
  const creature = objectByType("sensory-creature");
  const water = level.hazards.find((hazard) => hazard.type === "rising-water");
  return {
    tick: 0,
    time: 0,
    status: "playing",
    reason: "",
    flash: 0,
    blueBloom: 0,
    camera: { x: 0, y: 0, shake: 0 },
    player: { id: "player", x: player.x, y: player.y, w: 24, h: 46, vx: 0, vy: 0, grounded: false, wasGrounded: false, face: 1, sneak: false, climbing: false, coyote: 0, jumpBuffer: 0, weight: 1, wet: 0, lastLandVy: 0 },
    block: { id: "block", x: block.x, y: block.y, w: 58, h: 54, vx: 0, vy: 0, grounded: false, weight: block.weight ?? 5, lastLandVy: 0 },
    creature: { id: "lurker", x: creature.x, y: creature.y, w: 82, h: 32, vx: 34, state: "patrol", targetX: creature.x, patrol: creature.patrolBounds, listenTimer: 0, chaseTimer: 0, alert: 0 },
    water: { level: water.startLevel, speed: water.speed, acceleratedSpeed: water.acceleratedSpeed, wave: 0, splashGate: 0 },
    plate: { active: false, weight: 0 },
    valve: { progress: 0, complete: false, glow: 0 },
    gate: { state: "sealed", progress: 0, burstDone: false },
    acoustic: { signals: [], lastIntensity: 0 },
    projectiles: [],
    particles: [],
    ambient: Array.from({ length: 180 }, (_, index) => ({ x: (index * 173) % level.bounds.width, y: (index * 97) % level.bounds.height, r: rand(0.5, 2.2), a: rand(0.08, 0.28), drift: rand(0.2, 1.1) }))
  };
}

const ParticleKits = {
  emit(kind, x, y, count = 12, opts = {}) {
    const palette = {
      dust: ["#9ca3af", "#6b7280", "#d1d5db"], spark: ["#ffd166", "#ff8c42", "#fff3b0"], mist: ["rgba(124,225,255,.55)", "rgba(200,248,255,.38)"], bubble: ["rgba(157,236,255,.72)", "rgba(232,252,255,.58)"], rune: ["#57ddff", "#c8fbff", "#79f2ff"], sound: ["rgba(210,245,255,.58)", "rgba(97,221,255,.45)"], mote: ["rgba(255,204,104,.75)", "rgba(255,236,180,.45)"], chip: ["#a6b0ba", "#6f7b87"], alert: ["rgba(255,60,80,.8)", "rgba(255,135,120,.55)"], door: ["#57ddff", "#ffffff", "#6ee7ff"], shimmer: ["rgba(120,230,255,.56)", "rgba(255,255,255,.35)"], foam: ["rgba(222,252,255,.8)", "rgba(106,222,255,.42)"]
    }[kind] ?? ["#fff"];
    for (let i = 0; i < count; i += 1) {
      const angle = opts.angle ?? rand(0, Math.PI * 2);
      const spread = opts.spread ?? Math.PI * 2;
      const a = angle + rand(-spread / 2, spread / 2);
      const speed = rand(opts.minSpeed ?? 10, opts.maxSpeed ?? 120);
      s.particles.push({ kind, x: x + rand(-4, 4), y: y + rand(-4, 4), vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, ay: opts.ay ?? (kind === "bubble" ? -14 : kind === "mist" ? -8 : kind === "spark" || kind === "chip" ? 420 : 0), r: rand(opts.minR ?? 1.2, opts.maxR ?? 4.5), life: rand(opts.minLife ?? 0.45, opts.maxLife ?? 1.4), age: 0, color: palette[(Math.random() * palette.length) | 0], blend: opts.blend ?? "screen" });
    }
  },
  update(dt) {
    s.particles = s.particles.filter((p) => {
      p.age += dt;
      p.vy += p.ay * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      return p.age < p.life;
    });
  },
  draw() {
    for (const p of s.particles) {
      const t = p.age / p.life;
      ctx.save();
      ctx.globalCompositeOperation = p.blend;
      ctx.globalAlpha = Math.max(0, 1 - t);
      if (p.kind === "sound" || p.kind === "alert") {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = Math.max(1, p.r * (1 - t));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + t * 44, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.kind === "shimmer" || p.kind === "foam") {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(p.x - p.r * 4, p.y + Math.sin(s.time * 9 + p.x) * 2);
        ctx.lineTo(p.x + p.r * 4, p.y + Math.cos(s.time * 8 + p.y) * 2);
        ctx.stroke();
      } else {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * (p.kind === "mist" ? 5 : 2.2));
        g.addColorStop(0, p.color);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (p.kind === "mist" ? 5 : 2.2), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }
};

const DomainKits = {
  acousticSignal: {
    emit(x, y, intensity, sourceId) {
      s.acoustic.signals.push({ x, y, r: 4, max: 70 + intensity * 130, speed: 230, intensity, sourceId, hit: false });
      s.acoustic.lastIntensity = Math.max(s.acoustic.lastIntensity, intensity);
      ParticleKits.emit("sound", x, y, Math.ceil(10 + intensity * 16), { minSpeed: 0, maxSpeed: 20, minR: 5, maxR: 18, minLife: 0.55, maxLife: 1.0 });
    },
    update(dt) {
      s.acoustic.lastIntensity *= Math.pow(0.02, dt);
      const c = { x: s.creature.x + s.creature.w / 2, y: s.creature.y + s.creature.h / 2 };
      s.acoustic.signals = s.acoustic.signals.filter((sig) => {
        sig.r += sig.speed * dt;
        if (!sig.hit && Math.hypot(sig.x - c.x, sig.y - c.y) < sig.r + 34) { sig.hit = true; DomainKits.sensoryAgent.hear(sig); }
        return sig.r < sig.max;
      });
    }
  },
  sensoryAgent: {
    hear(sig) {
      if (s.creature.state === "chase" && sig.intensity < 0.95) return;
      s.creature.targetX = sig.x;
      s.creature.state = "listening";
      s.creature.listenTimer = 0.6;
      s.creature.chaseTimer = sig.intensity > 1.05 ? 4.2 : 0;
      s.creature.alert = Math.max(s.creature.alert, sig.intensity > 1.05 ? 1 : 0.55);
      ParticleKits.emit(sig.intensity > 1.05 ? "alert" : "sound", s.creature.x + s.creature.w / 2, s.creature.y + 8, 22, { minSpeed: 25, maxSpeed: 135 });
      tone(sig.intensity > 1.05 ? 92 : 180, 0.06, 0.18, "sawtooth");
    },
    update(dt) {
      const c = s.creature;
      if (c.state === "listening") { c.vx *= 0.86; c.listenTimer -= dt; if (c.listenTimer <= 0) c.state = c.chaseTimer > 0 ? "chase" : "investigate"; }
      else if (c.state === "chase") { c.chaseTimer -= dt; c.vx = Math.sign(c.targetX - c.x) * 120; if (c.chaseTimer <= 0) c.state = "investigate"; }
      else if (c.state === "investigate") { c.vx = Math.sign(c.targetX - c.x) * 52; if (Math.abs(c.targetX - c.x) < 18) c.state = "patrol"; }
      else { if (c.x < c.patrol.x) c.vx = 34; if (c.x > c.patrol.x + c.patrol.w) c.vx = -34; }
      if (Math.abs((s.player.x + 12) - (c.x + c.w / 2)) < 92 && Math.abs((s.player.y + 20) - (c.y + 8)) < 70 && !s.player.sneak) this.hear({ x: s.player.x, y: s.player.y, intensity: 1.35 });
      c.x += c.vx * dt;
      c.x = clamp(c.x, c.patrol.x, c.patrol.x + c.patrol.w);
      c.alert = lerp(c.alert, c.state === "chase" ? 1 : c.state === "listening" || c.state === "investigate" ? 0.55 : 0.12, 0.08);
    }
  },
  projectileLite: {
    throw() {
      if (s.status !== "playing") return;
      const px = s.player.x + s.player.w / 2;
      const py = s.player.y + s.player.h / 2;
      const angle = Math.atan2(mouse.y - py, mouse.x - px);
      const power = clamp(Math.hypot(mouse.x - px, mouse.y - py) * 2.5, 180, 590);
      s.projectiles.push({ x: px, y: py, vx: Math.cos(angle) * power, vy: Math.sin(angle) * power, r: 4, bounces: 0, life: 4, trail: 0 });
      tone(920, 0.035, 0.08, "triangle");
    },
    update(dt) {
      s.projectiles = s.projectiles.filter((p) => {
        p.life -= dt; p.trail -= dt; p.vy += 980 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.trail <= 0) { p.trail = 0.035; ParticleKits.emit("mote", p.x, p.y, 2, { minSpeed: 2, maxSpeed: 20 }); }
        for (const platform of level.platforms) if (p.x > platform.x && p.x < platform.x + platform.w && p.y > platform.y && p.y < platform.y + platform.h) {
          p.y = platform.y - 4; p.vy *= -0.42; p.vx *= 0.48; p.bounces += 1;
          ParticleKits.emit("chip", p.x, p.y, 26, { minSpeed: 40, maxSpeed: 210, angle: -Math.PI / 2, spread: Math.PI });
          DomainKits.acousticSignal.emit(p.x, p.y, 0.75 / Math.max(1, p.bounces), "pebble");
        }
        if (p.y > s.water.level) { ParticleKits.emit("bubble", p.x, s.water.level, 18, { angle: -Math.PI / 2, spread: Math.PI / 2 }); DomainKits.acousticSignal.emit(p.x, s.water.level, 0.88, "splash"); return false; }
        return p.life > 0 && p.bounces < 4;
      });
    }
  }
};

function collideBody(body, axis) {
  body.grounded = false;
  for (const platform of level.platforms) {
    if (!rectHit(body, platform)) continue;
    if (axis === "y") {
      if (body.vy > 0) { body.y = platform.y - body.h; body.lastLandVy = body.vy; body.vy = 0; body.grounded = true; }
      else if (body.vy < 0) { body.y = platform.y + platform.h; body.vy = 0; }
    } else {
      if (body.vx > 0) body.x = platform.x - body.w;
      if (body.vx < 0) body.x = platform.x + platform.w;
      body.vx = 0;
    }
  }
  const plate = level.objects.find((object) => object.type === "weighted-trigger");
  const plateRect = { x: plate.x - 45, y: plate.y, w: 92, h: 12 };
  if (rectHit(body, plateRect) && body.vy >= 0 && body.y + body.h < plateRect.y + 20) { body.y = plateRect.y - body.h; body.vy = 0; body.grounded = true; }
}

function stepBody(body, dt, gravity = 980) {
  body.vy += gravity * dt;
  body.x += body.vx * dt; collideBody(body, "x");
  body.y += body.vy * dt; const wasGrounded = body.grounded; collideBody(body, "y");
  if (!wasGrounded && body.grounded && Math.abs(body.lastLandVy ?? 0) > 240) { ParticleKits.emit("dust", body.x + body.w / 2, body.y + body.h, body === s.block ? 40 : 18, { angle: -Math.PI / 2, spread: Math.PI }); if (body === s.player && !s.player.sneak) DomainKits.acousticSignal.emit(body.x + body.w / 2, body.y + body.h, 0.55, "landing"); }
  body.vx *= body.grounded ? 0.84 : 0.985;
}

function nearChain() {
  return level.objects.filter((object) => object.type === "chain").find((chain) => Math.abs((s.player.x + s.player.w / 2) - chain.x) < 24 && s.player.y + s.player.h > chain.y && s.player.y < chain.y + chain.h) ?? null;
}

function update(dt) {
  if (s.status !== "playing") return;
  s.tick += 1; s.time += dt; s.flash = Math.max(0, s.flash - dt);
  const p = s.player; p.sneak = keys.has("ShiftLeft") || keys.has("ShiftRight"); p.jumpBuffer = Math.max(0, p.jumpBuffer - dt); p.coyote = p.grounded ? 0.11 : Math.max(0, p.coyote - dt); if (keys.has("Space") || keys.has("KeyW")) p.jumpBuffer = Math.max(p.jumpBuffer, 0.09);
  const chain = nearChain(); p.climbing = Boolean(chain && (keys.has("KeyW") || keys.has("KeyS")));
  const maxSpeed = p.sneak ? 96 : 185; const accel = p.grounded ? 2450 : 1600;
  if (keys.has("KeyA") || keys.has("ArrowLeft")) { p.vx = Math.max(-maxSpeed, p.vx - accel * dt); p.face = -1; } else if (keys.has("KeyD") || keys.has("ArrowRight")) { p.vx = Math.min(maxSpeed, p.vx + accel * dt); p.face = 1; } else if (p.grounded) p.vx *= Math.pow(0.001, dt);
  if (p.climbing) { p.vy = (keys.has("KeyW") ? -145 : 0) + (keys.has("KeyS") ? 145 : 0); p.x = lerp(p.x, chain.x - p.w / 2, 0.16); }
  else if (p.jumpBuffer > 0 && p.coyote > 0) { p.vy = -410; p.grounded = false; p.coyote = 0; p.jumpBuffer = 0; ParticleKits.emit("dust", p.x + p.w / 2, p.y + p.h, 22, { angle: -Math.PI / 2, spread: Math.PI }); if (!p.sneak) DomainKits.acousticSignal.emit(p.x + p.w / 2, p.y + p.h, 0.5, "jump"); }
  stepBody(p, dt, p.climbing ? 0 : 980);
  p.x = clamp(p.x, 42, level.bounds.width - 42 - p.w);
  const blockNear = Math.abs((p.x + p.w / 2) - (s.block.x + s.block.w / 2)) < 62 && p.y + p.h > s.block.y + 6 && p.y < s.block.y + s.block.h;
  if (blockNear && Math.abs(p.vx) > 25) { s.block.vx += p.vx * 0.045; p.vx *= 0.54; if (s.tick % 5 === 0) { ParticleKits.emit("spark", s.block.x + s.block.w / 2, s.block.y + s.block.h - 6, 5); DomainKits.acousticSignal.emit(s.block.x + s.block.w / 2, s.block.y + s.block.h, 0.95, "stone-scrape"); } }
  stepBody(s.block, dt);
  const plate = level.objects.find((object) => object.type === "weighted-trigger");
  const valve = level.objects.find((object) => object.type === "valve");
  const gate = level.objects.find((object) => object.type === "finish-gate");
  const onPlate = (body) => body.x + body.w / 2 > plate.x - 46 && body.x + body.w / 2 < plate.x + 46 && Math.abs(body.y + body.h - plate.y) < 18;
  const oldPlate = s.plate.active; s.plate.weight = (onPlate(s.block) ? s.block.weight : 0) + (onPlate(p) ? p.weight : 0); s.plate.active = s.plate.weight >= plate.requiredWeight;
  if (s.plate.active && !oldPlate) { s.flash = 0.28; s.camera.shake = 5; ParticleKits.emit("rune", plate.x, plate.y - 8, 46); DomainKits.acousticSignal.emit(plate.x, plate.y, 0.95, "plate"); }
  const nearValve = Math.hypot((p.x + p.w / 2) - valve.x, (p.y + p.h / 2) - valve.y) < 78; s.valve.glow = lerp(s.valve.glow, nearValve ? 1 : 0, 0.08);
  ui.prompt.textContent = nearValve && !s.valve.complete ? "Hold E to turn generated valve" : blockNear ? "Push generated block onto generated plate" : chain ? "W/S climb generated chain" : ""; ui.prompt.classList.toggle("show", Boolean(ui.prompt.textContent));
  if (nearValve && keys.has("KeyE") && !s.valve.complete) { s.valve.progress = clamp(s.valve.progress + dt * 0.52, 0, 1); if (s.tick % 7 === 0) { ParticleKits.emit("rune", valve.x, valve.y, 12); DomainKits.acousticSignal.emit(valve.x, valve.y, 0.78, "valve"); } if (s.valve.progress >= 1) { s.valve.complete = true; s.water.speed = s.water.acceleratedSpeed; ParticleKits.emit("door", valve.x, valve.y, 70); tone(66, 0.13, 0.9, "sawtooth"); } }
  const met = s.plate.active && s.valve.complete; s.gate.progress = clamp(s.gate.progress + Math.sign((met ? 1 : 0) - s.gate.progress) * (met ? 0.42 : 0.65) * dt, 0, 1); s.gate.state = s.gate.progress >= 0.98 ? "open" : s.gate.progress > 0.02 ? "waking" : "sealed"; s.blueBloom = lerp(s.blueBloom, met ? 1 : 0, 0.04); if (s.gate.state === "waking" && s.tick % 6 === 0) ParticleKits.emit("door", gate.x, gate.y, 8);
  DomainKits.projectileLite.update(dt); DomainKits.acousticSignal.update(dt); DomainKits.sensoryAgent.update(dt);
  s.water.level -= s.water.speed * dt; s.water.wave += dt * 2.6; if (s.tick % 6 === 0) { ParticleKits.emit("mist", rand(60, level.bounds.width - 60), s.water.level - 3, 3); ParticleKits.emit("shimmer", rand(60, level.bounds.width - 60), s.water.level, 2); }
  if (p.y + p.h > s.water.level && s.water.splashGate <= 0) { s.water.splashGate = 0.18; ParticleKits.emit("bubble", p.x + p.w / 2, s.water.level, 20, { angle: -Math.PI / 2, spread: Math.PI / 2 }); DomainKits.acousticSignal.emit(p.x + p.w / 2, s.water.level, 0.72, "water-splash"); }
  s.water.splashGate = Math.max(0, s.water.splashGate - dt);
  if (p.y + p.h - 12 > s.water.level) return endRun("Depths Took You", "The generated water route closed around you.", true);
  if (Math.hypot((p.x + p.w / 2) - (s.creature.x + s.creature.w / 2), (p.y + p.h / 2) - (s.creature.y + s.creature.h / 2)) < 34) return endRun("Depths Took You", "The generated lower-route creature caught your sound.", true);
  if (s.gate.state === "open" && p.x + p.w > gate.x) return endRun("Chamber Woken", "The generated focus path resolves into an open door.", false);
  ParticleKits.update(dt);
  const targetX = clamp(p.x - 640, 0, Math.max(0, level.bounds.width - 1280)); const targetY = clamp(p.y - 360, 0, Math.max(0, level.bounds.height - 720)); s.camera.x = lerp(s.camera.x, targetX, 0.08); s.camera.y = lerp(s.camera.y, targetY, 0.08); s.camera.shake *= Math.pow(0.02, dt);
  ui.water.textContent = `Water: ${s.valve.complete ? "rerouted faster" : "generated rising"}`; ui.noise.textContent = `Acoustic signal: ${s.acoustic.lastIntensity > 0.95 ? "dangerous" : s.acoustic.lastIntensity > 0.35 ? "audible" : "quiet"}`; ui.plate.textContent = `Plate: ${s.plate.active ? "engaged" : "unweighted"}`; ui.gate.textContent = `Door: ${s.gate.state}`;
}

function endRun(title, copy, danger) { s.status = danger ? "failed" : "won"; ui.endTitle.textContent = title; ui.endCopy.textContent = copy; ui.endKicker.textContent = danger ? "Run Failed" : "Generated Route Complete"; ui.endTitle.classList.toggle("danger", danger); ui.end.classList.remove("hidden"); }

function glow(x, y, r, color, alpha = 1) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, color); g.addColorStop(1, "rgba(0,0,0,0)"); ctx.globalAlpha = alpha; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }

function draw() {
  ctx.clearRect(0, 0, 1280, 720); const shakeX = (Math.random() - 0.5) * s.camera.shake; const shakeY = (Math.random() - 0.5) * s.camera.shake; ctx.save(); ctx.translate(-s.camera.x + shakeX, -s.camera.y + shakeY);
  const bg = ctx.createLinearGradient(0, 0, 0, level.bounds.height); bg.addColorStop(0, "#152131"); bg.addColorStop(0.4, "#081019"); bg.addColorStop(1, "#020406"); ctx.fillStyle = bg; ctx.fillRect(0, 0, level.bounds.width, level.bounds.height);
  for (const chamber of level.chambers) { glow(chamber.center.x, chamber.center.y, Math.max(chamber.radiusX, chamber.radiusY), chamber.role === "finish" ? "rgba(87,221,255,.08)" : "rgba(255,255,255,.035)"); }
  for (const mark of level.dressing.filter((item) => item.type === "watermark")) { ctx.strokeStyle = "rgba(87,221,255,.14)"; ctx.setLineDash([8, 12]); ctx.beginPath(); ctx.moveTo(mark.x - 80, mark.y); ctx.lineTo(mark.x + 80, mark.y); ctx.stroke(); ctx.setLineDash([]); }
  for (const platform of level.platforms) { ctx.fillStyle = platform.role === "boundary" ? "#101822" : "#172130"; ctx.fillRect(platform.x, platform.y, platform.w, platform.h); ctx.strokeStyle = platform.edge ? "rgba(133,230,255,.28)" : "rgba(255,255,255,.08)"; ctx.strokeRect(platform.x, platform.y, platform.w, platform.h); if (platform.edge) { ctx.fillStyle = "rgba(87,221,255,.18)"; ctx.fillRect(platform.x, platform.y, platform.w, 3); } }
  for (const chain of level.objects.filter((object) => object.type === "chain")) { ctx.strokeStyle = "rgba(176,218,230,.36)"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(chain.x, chain.y); ctx.lineTo(chain.x, chain.y + chain.h); ctx.stroke(); }
  for (const torch of level.dressing.filter((item) => item.type === "torch")) glow(torch.x, torch.y, 80 + Math.sin(s.time * 7 + torch.x) * 8, "rgba(255,165,72,.2)");
  const plate = level.objects.find((object) => object.type === "weighted-trigger"); const valve = level.objects.find((object) => object.type === "valve"); const gate = level.objects.find((object) => object.type === "finish-gate"); glow(plate.x, plate.y, 70, s.plate.active ? "rgba(87,221,255,.45)" : "rgba(225,166,80,.35)"); ctx.fillStyle = s.plate.active ? "#57ddff" : "#e1a650"; ctx.fillRect(plate.x - 46, plate.y, 92, 12); glow(valve.x, valve.y, 90, `rgba(87,221,255,${0.18 + s.valve.glow * 0.7})`); ctx.strokeStyle = s.valve.complete ? "#57ddff" : "#c58a42"; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(valve.x, valve.y, 28, 0, Math.PI * 2); ctx.stroke(); const open = s.gate.progress * 148; glow(gate.x, gate.y + 70, 130, `rgba(87,221,255,${0.22 + s.blueBloom * 0.35})`); ctx.fillStyle = "#101a27"; ctx.fillRect(gate.x, gate.y - open, 32, 148); ctx.strokeStyle = s.gate.state === "sealed" ? "rgba(87,221,255,.34)" : "#57ddff"; ctx.strokeRect(gate.x, gate.y - open, 32, 148);
  ctx.fillStyle = "#283545"; ctx.fillRect(s.block.x, s.block.y, s.block.w, s.block.h); ctx.strokeStyle = "rgba(205,230,245,.48)"; ctx.strokeRect(s.block.x, s.block.y, s.block.w, s.block.h);
  for (const sig of s.acoustic.signals) { ctx.strokeStyle = `rgba(205,245,255,${Math.max(0.04, 0.42 - sig.r / sig.max * 0.36)})`; ctx.beginPath(); ctx.arc(sig.x, sig.y, sig.r, 0, Math.PI * 2); ctx.stroke(); }
  ctx.fillStyle = "#d8e1e8"; for (const p of s.projectiles) { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); }
  const player = s.player; glow(player.x + 12, player.y + 24, 55, "rgba(255,215,140,.28)"); ctx.fillStyle = "#edf7fb"; ctx.beginPath(); ctx.arc(player.x + 12, player.y + 9, 7, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(player.x + 5, player.y + 16, 14, 22); ctx.fillStyle = "#607083"; ctx.fillRect(player.x + 6, player.y + 38, 5, 12); ctx.fillRect(player.x + 15, player.y + 38, 5, 12);
  const c = s.creature; glow(c.x + c.w / 2, c.y + 8, 40 + c.alert * 90, c.state === "chase" ? "rgba(255,40,62,.55)" : "rgba(87,221,255,.36)"); ctx.fillStyle = "#05080c"; ctx.beginPath(); ctx.ellipse(c.x + c.w / 2, c.y + c.h / 2, 40, 16, 0, 0, Math.PI * 2); ctx.fill();
  const y = s.water.level; const waterGradient = ctx.createLinearGradient(0, y - 30, 0, level.bounds.height); waterGradient.addColorStop(0, "rgba(50,160,210,.42)"); waterGradient.addColorStop(1, "rgba(5,18,32,.86)"); ctx.fillStyle = waterGradient; ctx.beginPath(); ctx.moveTo(0, y); for (let x = 0; x <= level.bounds.width; x += 14) ctx.lineTo(x, y + Math.sin(x * 0.02 + s.water.wave) * 5); ctx.lineTo(level.bounds.width, level.bounds.height); ctx.lineTo(0, level.bounds.height); ctx.closePath(); ctx.fill(); ctx.strokeStyle = "rgba(188,248,255,.68)"; ctx.stroke(); ParticleKits.draw();
  const light = ctx.createRadialGradient(player.x + 12, player.y + 24, 18, player.x + 12, player.y + 24, 260); light.addColorStop(0, "rgba(255,224,160,.32)"); light.addColorStop(0.36, "rgba(255,214,126,.16)"); light.addColorStop(1, "rgba(0,0,0,0)"); ctx.globalCompositeOperation = "screen"; ctx.fillStyle = light; ctx.beginPath(); ctx.arc(player.x + 12, player.y + 24, 260, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = `rgba(87,221,255,${0.06 + s.blueBloom * 0.13})`; ctx.fillRect(s.camera.x, s.camera.y, 1280, 720); ctx.globalCompositeOperation = "source-over"; ctx.fillStyle = "rgba(0,0,0,.2)"; ctx.fillRect(s.camera.x, s.camera.y, 1280, 720); if (s.flash > 0) { ctx.fillStyle = `rgba(180,245,255,${s.flash})`; ctx.fillRect(s.camera.x, s.camera.y, 1280, 720); } ctx.restore();
}

function loop(time) { const dt = Math.min(0.033, (time - last) / 1000 || 0.016); last = time; update(dt); draw(); if (running) requestAnimationFrame(loop); }
function restart() { level = generateLayeredDrunkWalkLevel(request); s = makeState(); ui.end.classList.add("hidden"); running = true; last = performance.now(); requestAnimationFrame(loop); }
document.querySelector("#startBtn").addEventListener("click", () => { audioCtx ||= new (window.AudioContext || window.webkitAudioContext)(); ui.start.classList.add("hidden"); restart(); });
document.querySelector("#againBtn").addEventListener("click", restart);
addEventListener("keydown", (event) => { keys.add(event.code); if (event.code === "KeyR") restart(); });
addEventListener("keyup", (event) => keys.delete(event.code));
canvas.addEventListener("mousemove", (event) => { const rect = canvas.getBoundingClientRect(); mouse.x = (event.clientX - rect.left) * 1280 / rect.width + (s?.camera.x ?? 0); mouse.y = (event.clientY - rect.top) * 720 / rect.height + (s?.camera.y ?? 0); });
canvas.addEventListener("mousedown", () => DomainKits.projectileLite.throw());
level = generateLayeredDrunkWalkLevel(request); s = makeState(); window.GameHost = { getState: () => JSON.parse(JSON.stringify(s)), getLevel: () => JSON.parse(JSON.stringify(level)), regenerate: restart, request, ParticleKits, DomainKits }; draw();

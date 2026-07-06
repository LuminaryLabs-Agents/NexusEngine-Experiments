const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const W = 1280;
const H = 720;
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
let audioCtx = null;
let running = false;
let last = 0;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (a, b, t) => a + (b - a) * t;
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const rand = (min, max) => min + Math.random() * (max - min);
const rectHit = (a, b) => a.x + a.w > b.x && a.x < b.x + b.w && a.y + a.h > b.y && a.y < b.y + b.h;

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

const level = {
  platforms: [
    { id: "left-wall", x: 0, y: 0, w: 42, h: 720, edge: false },
    { id: "right-wall", x: 1238, y: 0, w: 42, h: 720, edge: false },
    { id: "floor", x: 42, y: 680, w: 1196, h: 48, edge: true },
    { id: "start", x: 64, y: 174, w: 295, h: 34, edge: true },
    { id: "soft-step-a", x: 360, y: 260, w: 185, h: 28, edge: true },
    { id: "safe-high-a", x: 560, y: 348, w: 285, h: 32, edge: true },
    { id: "block-run", x: 675, y: 598, w: 365, h: 34, edge: true },
    { id: "low-risk", x: 440, y: 520, w: 170, h: 30, edge: true },
    { id: "valve", x: 898, y: 242, w: 340, h: 34, edge: true },
    { id: "exit", x: 1040, y: 498, w: 198, h: 182, edge: true },
    { id: "return-step", x: 866, y: 438, w: 150, h: 28, edge: true }
  ],
  chains: [
    { id: "center-chain", x: 475, y: 260, h: 270 },
    { id: "valve-chain", x: 990, y: 242, h: 260 }
  ],
  waterMarks: [600, 560, 520, 480, 440],
  plate: { id: "plate", x: 902, y: 590, w: 92, h: 12, requiredWeight: 4 },
  valve: { id: "valve", x: 1082, y: 204, r: 28 },
  door: { id: "door", x: 1210, y: 350, w: 32, h: 148 },
  torches: [
    { x: 126, y: 136 }, { x: 505, y: 228 }, { x: 732, y: 318 }, { x: 958, y: 210 }, { x: 1135, y: 465 }
  ]
};

function initialState() {
  return {
    tick: 0,
    time: 0,
    status: "playing",
    reason: "",
    flash: 0,
    blueBloom: 0,
    cameraPull: 0,
    camera: { x: 0, y: 0, shake: 0 },
    player: { id: "player", x: 112, y: 118, w: 24, h: 46, vx: 0, vy: 0, grounded: false, wasGrounded: false, face: 1, sneak: false, climbing: false, coyote: 0, jumpBuffer: 0, weight: 1, wet: 0, lastLandVy: 0 },
    block: { id: "block", x: 762, y: 540, w: 58, h: 54, vx: 0, vy: 0, grounded: false, weight: 5, lastHitX: 0 },
    creature: { id: "lurker", x: 560, y: 648, w: 82, h: 32, vx: 0.45, state: "patrol", targetX: 560, listenTimer: 0, chaseTimer: 0, alert: 0, warning: 0 },
    water: { level: 684, speed: 3.5, wave: 0, splashGate: 0 },
    plate: { active: false, weight: 0 },
    valve: { progress: 0, complete: false, glow: 0 },
    gate: { state: "sealed", progress: 0, burstDone: false },
    acoustic: { signals: [], lastIntensity: 0 },
    projectiles: [],
    particles: [],
    ambient: Array.from({ length: 120 }, (_, i) => ({ x: (i * 173) % W, y: (i * 97) % H, r: rand(0.5, 2.2), a: rand(0.08, 0.32), drift: rand(0.2, 1.1) }))
  };
}
let s = initialState();

const ParticleKits = {
  emit(kind, x, y, count = 12, opts = {}) {
    const palette = {
      dust: ["#9ca3af", "#6b7280", "#d1d5db"],
      spark: ["#ffd166", "#ff8c42", "#fff3b0"],
      mist: ["rgba(124,225,255,.55)", "rgba(200,248,255,.38)"],
      bubble: ["rgba(157,236,255,.72)", "rgba(232,252,255,.58)"],
      rune: ["#57ddff", "#c8fbff", "#79f2ff"],
      sound: ["rgba(210,245,255,.58)", "rgba(97,221,255,.45)"],
      mote: ["rgba(255,204,104,.75)", "rgba(255,236,180,.45)"],
      chip: ["#a6b0ba", "#6f7b87"],
      alert: ["rgba(255,60,80,.8)", "rgba(255,135,120,.55)"],
      door: ["#57ddff", "#ffffff", "#6ee7ff"],
      shimmer: ["rgba(120,230,255,.56)", "rgba(255,255,255,.35)"],
      foam: ["rgba(222,252,255,.8)", "rgba(106,222,255,.42)"],
      shadow: ["rgba(0,0,0,.35)"]
    }[kind] ?? ["#fff"];
    const blend = opts.blend ?? (kind === "shadow" ? "multiply" : "screen");
    for (let i = 0; i < count; i++) {
      const angle = opts.angle ?? rand(0, Math.PI * 2);
      const spread = opts.spread ?? Math.PI * 2;
      const a = angle + rand(-spread / 2, spread / 2);
      const speed = rand(opts.minSpeed ?? 10, opts.maxSpeed ?? 120);
      s.particles.push({
        kind,
        x: x + rand(-(opts.spawnW ?? 4), opts.spawnW ?? 4),
        y: y + rand(-(opts.spawnH ?? 4), opts.spawnH ?? 4),
        vx: Math.cos(a) * speed + (opts.vx ?? 0),
        vy: Math.sin(a) * speed + (opts.vy ?? 0),
        ax: opts.ax ?? 0,
        ay: opts.ay ?? (kind === "bubble" ? -12 : kind === "mist" ? -8 : kind === "spark" || kind === "chip" ? 420 : 0),
        r: rand(opts.minR ?? 1.2, opts.maxR ?? 4.5),
        life: rand(opts.minLife ?? 0.45, opts.maxLife ?? 1.4),
        age: 0,
        color: palette[(Math.random() * palette.length) | 0],
        blend
      });
    }
  },
  update(dt) {
    s.particles = s.particles.filter((p) => {
      p.age += dt;
      p.vx += p.ax * dt;
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
      const creatureCenter = { x: s.creature.x + s.creature.w / 2, y: s.creature.y + s.creature.h / 2 };
      s.acoustic.signals = s.acoustic.signals.filter((sig) => {
        sig.r += sig.speed * dt;
        if (!sig.hit && Math.hypot(sig.x - creatureCenter.x, sig.y - creatureCenter.y) < sig.r + 34) {
          sig.hit = true;
          DomainKits.sensoryAgent.hear(sig);
        }
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
      s.creature.warning = Math.max(s.creature.warning, 0.45);
      ParticleKits.emit(sig.intensity > 1.05 ? "alert" : "sound", s.creature.x + s.creature.w / 2, s.creature.y + 8, 22, { minSpeed: 25, maxSpeed: 135, minLife: 0.55, maxLife: 1.05 });
      tone(sig.intensity > 1.05 ? 92 : 180, 0.06, 0.18, "sawtooth");
    },
    update(dt) {
      const c = s.creature;
      c.warning = Math.max(0, c.warning - dt);
      if (c.state === "listening") {
        c.vx *= 0.86;
        c.listenTimer -= dt;
        if (c.listenTimer <= 0) c.state = c.chaseTimer > 0 ? "chase" : "investigate";
      } else if (c.state === "chase") {
        c.chaseTimer -= dt;
        c.vx = Math.sign(c.targetX - c.x) * 120;
        if (c.chaseTimer <= 0) c.state = "investigate";
      } else if (c.state === "investigate") {
        c.vx = Math.sign(c.targetX - c.x) * 52;
        if (Math.abs(c.targetX - c.x) < 18) c.state = "patrol";
      } else {
        if (c.x < 485) c.vx = 34;
        if (c.x > 1110) c.vx = -34;
      }
      if (Math.abs((s.player.x + 12) - (c.x + c.w / 2)) < 92 && Math.abs((s.player.y + 20) - (c.y + 8)) < 70 && !s.player.sneak) {
        this.hear({ x: s.player.x, y: s.player.y, intensity: 1.35 });
      }
      c.x += c.vx * dt;
      c.x = clamp(c.x, 470, 1130);
      const targetAlert = c.state === "chase" ? 1 : c.state === "listening" || c.state === "investigate" ? 0.55 : 0.12;
      c.alert = lerp(c.alert, targetAlert, 0.08);
      if (c.state === "listening" && s.tick % 4 === 0) ParticleKits.emit("alert", c.x + c.w / 2, c.y + 8, 4, { minSpeed: 10, maxSpeed: 60, minLife: 0.3, maxLife: 0.65 });
    }
  },
  weightedTrigger: {
    update() {
      const p = level.plate;
      let weight = 0;
      const foot = (body) => ({ x: body.x + body.w / 2, y: body.y + body.h });
      const onPlate = (f) => f.x > p.x && f.x < p.x + p.w && Math.abs(f.y - p.y) < 18;
      if (onPlate(foot(s.block))) weight += s.block.weight;
      if (onPlate(foot(s.player))) weight += s.player.weight;
      const old = s.plate.active;
      s.plate.weight = weight;
      s.plate.active = weight >= p.requiredWeight;
      if (s.plate.active && !old) {
        s.flash = 0.28;
        s.camera.shake = Math.max(s.camera.shake, 5);
        ParticleKits.emit("dust", p.x + p.w / 2, p.y, 46, { minSpeed: 18, maxSpeed: 140, minLife: 0.4, maxLife: 1.3, angle: -Math.PI / 2, spread: Math.PI });
        ParticleKits.emit("rune", p.x + p.w / 2, p.y - 6, 40, { minSpeed: 40, maxSpeed: 170, minLife: 0.45, maxLife: 1.0 });
        DomainKits.acousticSignal.emit(p.x + p.w / 2, p.y, 0.95, "pressure-plate");
        tone(78, 0.09, 0.28, "triangle");
      }
    }
  },
  conditionGate: {
    update(dt) {
      const met = s.plate.active && s.valve.complete;
      const target = met ? 1 : 0;
      const rate = met ? 0.42 : 0.65;
      s.gate.progress = clamp(s.gate.progress + Math.sign(target - s.gate.progress) * rate * dt, 0, 1);
      s.gate.state = s.gate.progress >= 0.98 ? "open" : s.gate.progress > 0.02 ? "waking" : "sealed";
      s.blueBloom = lerp(s.blueBloom, met ? 1 : 0, 0.04);
      if (s.gate.state === "waking") {
        s.camera.shake = Math.max(s.camera.shake, 1.6);
        s.cameraPull = Math.max(s.cameraPull, 0.25);
        if (s.tick % 6 === 0) ParticleKits.emit("door", level.door.x + 10, level.door.y + 70 - s.gate.progress * level.door.h, 8, { minSpeed: 20, maxSpeed: 150, minLife: 0.7, maxLife: 1.6 });
        if (!s.gate.burstDone && s.gate.progress > 0.2) {
          s.gate.burstDone = true;
          ParticleKits.emit("door", level.door.x, level.door.y + 80, 120, { minSpeed: 40, maxSpeed: 240, minLife: 0.9, maxLife: 2.2 });
          tone(62, 0.14, 0.8, "sawtooth");
        }
      }
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
      ParticleKits.emit("spark", px, py, 8, { minSpeed: 20, maxSpeed: 90, minLife: 0.25, maxLife: 0.55 });
      tone(920, 0.035, 0.08, "triangle");
    },
    update(dt) {
      s.projectiles = s.projectiles.filter((p) => {
        p.life -= dt;
        p.trail -= dt;
        p.vy += 980 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.trail <= 0) {
          p.trail = 0.035;
          ParticleKits.emit("mote", p.x, p.y, 2, { minSpeed: 2, maxSpeed: 20, minLife: 0.15, maxLife: 0.4, minR: 0.8, maxR: 2.2 });
        }
        for (const platform of level.platforms) {
          if (p.x > platform.x && p.x < platform.x + platform.w && p.y > platform.y && p.y < platform.y + platform.h) {
            p.y = platform.y - 4;
            p.vy *= -0.42;
            p.vx *= 0.48;
            p.bounces += 1;
            ParticleKits.emit("chip", p.x, p.y, 26, { minSpeed: 40, maxSpeed: 210, minLife: 0.3, maxLife: 0.8, angle: -Math.PI / 2, spread: Math.PI });
            DomainKits.acousticSignal.emit(p.x, p.y, 0.75 / Math.max(1, p.bounces), "pebble");
            tone(420 + Math.random() * 150, 0.035, 0.07, "triangle");
          }
        }
        if (p.y > s.water.level) {
          ParticleKits.emit("bubble", p.x, s.water.level, 18, { minSpeed: 20, maxSpeed: 90, minLife: 0.9, maxLife: 2.0, angle: -Math.PI / 2, spread: Math.PI / 2 });
          ParticleKits.emit("foam", p.x, s.water.level, 24, { minSpeed: 10, maxSpeed: 70, minLife: 0.4, maxLife: 1.1 });
          DomainKits.acousticSignal.emit(p.x, s.water.level, 0.88, "splash");
          return false;
        }
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
      if (body.vy > 0) {
        body.y = platform.y - body.h;
        body.lastLandVy = body.vy;
        body.vy = 0;
        body.grounded = true;
      } else if (body.vy < 0) {
        body.y = platform.y + platform.h;
        body.vy = 0;
      }
    } else if (axis === "x") {
      if (body.vx > 0) {
        body.x = platform.x - body.w;
        if (body === s.block && Math.abs(body.vx) > 80) ParticleKits.emit("chip", body.x + body.w, body.y + body.h / 2, 14, { minSpeed: 40, maxSpeed: 180 });
      } else if (body.vx < 0) {
        body.x = platform.x + platform.w;
        if (body === s.block && Math.abs(body.vx) > 80) ParticleKits.emit("chip", body.x, body.y + body.h / 2, 14, { minSpeed: 40, maxSpeed: 180 });
      }
      body.vx = 0;
    }
  }
  const plate = { x: level.plate.x, y: level.plate.y, w: level.plate.w, h: 12 };
  if (rectHit(body, plate) && body.vy >= 0 && body.y + body.h < plate.y + 20) {
    body.y = plate.y - body.h;
    body.vy = 0;
    body.grounded = true;
  }
}

function stepBody(body, dt, gravity = 980) {
  body.vy += gravity * dt;
  body.x += body.vx * dt;
  collideBody(body, "x");
  body.y += body.vy * dt;
  const wasGrounded = body.grounded;
  collideBody(body, "y");
  if (!wasGrounded && body.grounded && Math.abs(body.lastLandVy ?? 0) > 240) {
    ParticleKits.emit("dust", body.x + body.w / 2, body.y + body.h, body === s.block ? 40 : 18, { minSpeed: 22, maxSpeed: body === s.block ? 170 : 90, angle: -Math.PI / 2, spread: Math.PI });
    if (body === s.player && !s.player.sneak) DomainKits.acousticSignal.emit(body.x + body.w / 2, body.y + body.h, 0.55, "landing");
  }
  body.vx *= body.grounded ? 0.84 : 0.985;
}

function nearChain() {
  const p = s.player;
  return level.chains.find((chain) => Math.abs((p.x + p.w / 2) - chain.x) < 24 && p.y + p.h > chain.y && p.y < chain.y + chain.h) ?? null;
}

function update(dt) {
  if (s.status !== "playing") return;
  s.tick += 1;
  s.time += dt;
  s.flash = Math.max(0, s.flash - dt);
  s.cameraPull = Math.max(0, s.cameraPull - dt * 0.3);
  const p = s.player;
  p.wasGrounded = p.grounded;
  p.sneak = keys.has("ShiftLeft") || keys.has("ShiftRight");
  p.jumpBuffer = Math.max(0, p.jumpBuffer - dt);
  p.coyote = p.grounded ? 0.11 : Math.max(0, p.coyote - dt);
  if (keys.has("Space") || keys.has("KeyW")) p.jumpBuffer = Math.max(p.jumpBuffer, 0.09);
  const chain = nearChain();
  p.climbing = Boolean(chain && (keys.has("KeyW") || keys.has("KeyS")));
  const accel = p.grounded ? 2450 : 1600;
  const maxSpeed = p.sneak ? 96 : 185;
  const left = keys.has("KeyA") || keys.has("ArrowLeft");
  const right = keys.has("KeyD") || keys.has("ArrowRight");
  if (left) { p.vx = Math.max(-maxSpeed, p.vx - accel * dt); p.face = -1; }
  else if (right) { p.vx = Math.min(maxSpeed, p.vx + accel * dt); p.face = 1; }
  else if (p.grounded) p.vx *= Math.pow(0.001, dt);
  if (p.climbing) {
    p.vy = (keys.has("KeyW") ? -145 : 0) + (keys.has("KeyS") ? 145 : 0);
    p.x = lerp(p.x, chain.x - p.w / 2, 0.16);
    if (s.tick % 12 === 0) ParticleKits.emit("dust", chain.x, p.y + p.h / 2, 4, { minSpeed: 8, maxSpeed: 30 });
  } else if (p.jumpBuffer > 0 && p.coyote > 0) {
    p.vy = -410;
    p.grounded = false;
    p.coyote = 0;
    p.jumpBuffer = 0;
    ParticleKits.emit("dust", p.x + p.w / 2, p.y + p.h, 22, { minSpeed: 22, maxSpeed: 115, angle: -Math.PI / 2, spread: Math.PI });
    ParticleKits.emit("mote", p.x + p.w / 2, p.y + 12, 10, { minSpeed: 8, maxSpeed: 55, minLife: 0.35, maxLife: 0.9 });
    if (!p.sneak) DomainKits.acousticSignal.emit(p.x + p.w / 2, p.y + p.h, 0.5, "jump");
  }
  const oldX = p.x;
  stepBody(p, dt, p.climbing ? 0 : 980);
  p.x = clamp(p.x, 42, W - 42 - p.w);
  const blockNear = Math.abs((p.x + p.w / 2) - (s.block.x + s.block.w / 2)) < 62 && p.y + p.h > s.block.y + 6 && p.y < s.block.y + s.block.h;
  if (blockNear && Math.abs(p.vx) > 25) {
    s.block.vx += p.vx * 0.045;
    p.vx *= 0.54;
    if (s.tick % 5 === 0) {
      ParticleKits.emit("spark", s.block.x + (p.face > 0 ? 0 : s.block.w), s.block.y + s.block.h - 6, 5, { minSpeed: 22, maxSpeed: 100, angle: Math.PI, spread: Math.PI });
      ParticleKits.emit("dust", s.block.x + s.block.w / 2, s.block.y + s.block.h, 7, { minSpeed: 18, maxSpeed: 90 });
      DomainKits.acousticSignal.emit(s.block.x + s.block.w / 2, s.block.y + s.block.h, 0.95, "stone-scrape");
    }
  }
  stepBody(s.block, dt);
  const valveDist = Math.hypot((p.x + p.w / 2) - level.valve.x, (p.y + p.h / 2) - level.valve.y);
  const nearValve = valveDist < 72;
  s.valve.glow = lerp(s.valve.glow, nearValve ? 1 : 0, 0.08);
  ui.prompt.textContent = nearValve && !s.valve.complete ? "Hold E to turn the glowing valve" : blockNear ? "Push the heavy stone onto the glowing plate" : chain ? "W/S climb chain" : "";
  ui.prompt.classList.toggle("show", Boolean(ui.prompt.textContent));
  if (nearValve && keys.has("KeyE") && !s.valve.complete) {
    s.valve.progress = clamp(s.valve.progress + dt * 0.52, 0, 1);
    if (s.tick % 7 === 0) {
      ParticleKits.emit("rune", level.valve.x, level.valve.y, 12, { minSpeed: 25, maxSpeed: 140 });
      DomainKits.acousticSignal.emit(level.valve.x, level.valve.y, 0.78, "valve-turn");
      tone(92 + s.valve.progress * 90, 0.035, 0.08, "triangle");
    }
    if (s.valve.progress >= 1) {
      s.valve.complete = true;
      s.water.speed = 7.2;
      ParticleKits.emit("door", 646, 430, 70, { minSpeed: 35, maxSpeed: 200, minLife: 0.7, maxLife: 1.8 });
      tone(66, 0.13, 0.9, "sawtooth");
    }
  }
  DomainKits.weightedTrigger.update();
  DomainKits.conditionGate.update(dt);
  DomainKits.projectileLite.update(dt);
  DomainKits.acousticSignal.update(dt);
  DomainKits.sensoryAgent.update(dt);
  s.water.level -= s.water.speed * dt;
  s.water.wave += dt * 2.6;
  if (s.tick % 6 === 0) {
    ParticleKits.emit("mist", rand(60, 1220), s.water.level - 3, 3, { minSpeed: 4, maxSpeed: 25, minLife: 1.1, maxLife: 2.3, angle: -Math.PI / 2, spread: Math.PI });
    ParticleKits.emit("shimmer", rand(60, 1220), s.water.level + rand(-2, 2), 2, { minSpeed: 2, maxSpeed: 12, minLife: 0.4, maxLife: 1.0 });
  }
  if (p.y + p.h > s.water.level && s.water.splashGate <= 0) {
    s.water.splashGate = 0.18;
    p.wet = 1;
    ParticleKits.emit("bubble", p.x + p.w / 2, s.water.level, 20, { minSpeed: 22, maxSpeed: 90, angle: -Math.PI / 2, spread: Math.PI / 2, minLife: 0.8, maxLife: 2.0 });
    ParticleKits.emit("foam", p.x + p.w / 2, s.water.level, 22, { minSpeed: 8, maxSpeed: 80, minLife: 0.35, maxLife: 1.1 });
    DomainKits.acousticSignal.emit(p.x + p.w / 2, s.water.level, 0.72, "water-splash");
  }
  s.water.splashGate = Math.max(0, s.water.splashGate - dt);
  p.wet = Math.max(0, p.wet - dt * 0.2);
  if (p.y + p.h - 12 > s.water.level) return fail("The black water swallowed the route before you reached the door.");
  if (Math.hypot((p.x + p.w / 2) - (s.creature.x + s.creature.w / 2), (p.y + p.h / 2) - (s.creature.y + s.creature.h / 2)) < 34) return fail("The listening creature found your rhythm in the dark.");
  if (s.gate.state === "open" && p.x + p.w > level.door.x) return win();
  ParticleKits.update(dt);
  const targetX = s.gate.state === "waking" ? lerp(p.x, level.door.x - 280, s.cameraPull) : p.x;
  s.camera.x += clamp((targetX - W / 2) * 0.1, -58, 58) * 0.04 - s.camera.x * 0.035;
  s.camera.y += clamp((p.y - H / 2) * 0.1, -42, 42) * 0.04 - s.camera.y * 0.035;
  s.camera.shake *= Math.pow(0.02, dt);
  ui.water.textContent = `Water: ${s.valve.complete ? "rerouted and faster" : "rising"}`;
  ui.noise.textContent = `Acoustic signal: ${s.acoustic.lastIntensity > 0.95 ? "dangerous" : s.acoustic.lastIntensity > 0.35 ? "audible" : "quiet"}`;
  ui.plate.textContent = `Plate: ${s.plate.active ? "engaged" : "unweighted"}`;
  ui.gate.textContent = `Door: ${s.gate.state}`;
}

function fail(reason) {
  s.status = "failed";
  s.reason = reason;
  ParticleKits.emit("bubble", s.player.x + s.player.w / 2, s.water.level, 80, { minSpeed: 20, maxSpeed: 150, minLife: 1.0, maxLife: 3.0, angle: -Math.PI / 2, spread: Math.PI / 1.5 });
  showEnd("Depths Took You", reason, true);
}

function win() {
  s.status = "won";
  ParticleKits.emit("door", level.door.x, level.door.y + 80, 180, { minSpeed: 30, maxSpeed: 270, minLife: 1.0, maxLife: 2.8 });
  showEnd("Chamber Woken", "Blue light spills through the old stone. The route is simple now: breathe, climb, and go deeper.", false);
}

function showEnd(title, copy, danger) {
  ui.endTitle.textContent = title;
  ui.endCopy.textContent = copy;
  ui.endKicker.textContent = danger ? "Run Failed" : "Route Complete";
  ui.endTitle.classList.toggle("danger", danger);
  ui.end.classList.remove("hidden");
}

function drawBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#152131");
  g.addColorStop(0.38, "#081019");
  g.addColorStop(1, "#020406");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(255,255,255,.025)";
  for (const a of s.ambient) {
    a.y -= a.drift * 0.08;
    if (a.y < -4) a.y = H + 4;
    ctx.globalAlpha = a.a;
    ctx.beginPath();
    ctx.arc(a.x + Math.sin(s.time * a.drift + a.y) * 6, a.y, a.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "rgba(87,221,255,.06)";
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.arc(650, 380, 155, 0, Math.PI * 2);
  ctx.stroke();
}

function drawPlatforms() {
  for (const p of level.platforms) {
    ctx.fillStyle = "#172130";
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.strokeStyle = p.edge ? "rgba(133,230,255,.28)" : "rgba(255,255,255,.08)";
    ctx.lineWidth = p.edge ? 2.5 : 1.5;
    ctx.strokeRect(p.x, p.y, p.w, p.h);
    if (p.edge) {
      ctx.fillStyle = "rgba(87,221,255,.18)";
      ctx.fillRect(p.x, p.y, p.w, 3);
    }
  }
  for (const y of level.waterMarks) {
    ctx.strokeStyle = "rgba(87,221,255,.16)";
    ctx.setLineDash([8, 12]);
    ctx.beginPath();
    ctx.moveTo(54, y);
    ctx.lineTo(1224, y);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.strokeStyle = "rgba(176,218,230,.35)";
  ctx.lineWidth = 5;
  for (const chain of level.chains) {
    ctx.beginPath();
    ctx.moveTo(chain.x, chain.y);
    ctx.lineTo(chain.x, chain.y + chain.h);
    ctx.stroke();
    for (let y = chain.y; y < chain.y + chain.h; y += 22) {
      ctx.strokeStyle = "rgba(87,221,255,.18)";
      ctx.strokeRect(chain.x - 8, y, 16, 12);
    }
  }
}

function glow(x, y, r, color, alpha = 1) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawMachines() {
  const pulse = 0.5 + Math.sin(s.time * 4) * 0.5;
  glow(level.plate.x + level.plate.w / 2, level.plate.y, 60, s.plate.active ? "rgba(87,221,255,.45)" : "rgba(225,166,80,.35)");
  ctx.fillStyle = s.plate.active ? "#57ddff" : "#e1a650";
  ctx.fillRect(level.plate.x, level.plate.y + (s.plate.active ? 5 : 0), level.plate.w, level.plate.h);
  ctx.strokeStyle = `rgba(200,250,255,${0.35 + pulse * 0.45})`;
  ctx.strokeRect(level.plate.x - 8, level.plate.y - 8, level.plate.w + 16, level.plate.h + 16);
  const valveGlow = 0.18 + s.valve.glow * 0.65 + (s.valve.complete ? 0.5 : 0);
  glow(level.valve.x, level.valve.y, 92, `rgba(87,221,255,${valveGlow})`);
  ctx.save();
  ctx.translate(level.valve.x, level.valve.y);
  ctx.rotate(s.valve.progress * Math.PI * 2 + Math.sin(s.time * 2) * 0.04);
  ctx.strokeStyle = s.valve.complete ? "#57ddff" : "#c58a42";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(0, 0, level.valve.r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-31, 0);
  ctx.lineTo(31, 0);
  ctx.moveTo(0, -31);
  ctx.lineTo(0, 31);
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.translate(646, 430);
  ctx.rotate(s.valve.progress * 12 + s.time * (s.valve.complete ? 1.8 : 0.25));
  ctx.strokeStyle = s.valve.complete ? "rgba(87,221,255,.76)" : "rgba(90,104,122,.55)";
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.arc(0, 0, 48, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 8; i++) {
    ctx.rotate(Math.PI / 4);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -48);
    ctx.stroke();
  }
  ctx.restore();
  glow(level.door.x, level.door.y + 76, 120 + s.blueBloom * 90, `rgba(87,221,255,${0.2 + s.blueBloom * 0.35})`);
  const open = s.gate.progress * level.door.h;
  ctx.fillStyle = "#101a27";
  ctx.fillRect(level.door.x, level.door.y - open, level.door.w, level.door.h);
  ctx.strokeStyle = s.gate.state === "sealed" ? "rgba(87,221,255,.34)" : "#57ddff";
  ctx.lineWidth = 4;
  ctx.strokeRect(level.door.x, level.door.y - open, level.door.w, level.door.h);
  ctx.strokeStyle = `rgba(87,221,255,${0.28 + pulse * 0.42 + s.blueBloom * 0.35})`;
  ctx.beginPath();
  ctx.moveTo(level.door.x + 8, level.door.y + 18 - open);
  ctx.lineTo(level.door.x + 24, level.door.y + 46 - open);
  ctx.lineTo(level.door.x + 8, level.door.y + 72 - open);
  ctx.lineTo(level.door.x + 24, level.door.y + 108 - open);
  ctx.stroke();
  ctx.fillStyle = "#283545";
  ctx.fillRect(s.block.x, s.block.y, s.block.w, s.block.h);
  ctx.strokeStyle = "rgba(205,230,245,.48)";
  ctx.lineWidth = 3;
  ctx.strokeRect(s.block.x, s.block.y, s.block.w, s.block.h);
}

function drawActors() {
  const p = s.player;
  glow(p.x + p.w / 2, p.y + p.h / 2, 50, `rgba(255,215,140,${0.2 + p.wet * 0.08})`);
  ctx.save();
  ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
  ctx.scale(p.face, 1);
  if (p.sneak) ctx.scale(1, 0.88);
  ctx.fillStyle = p.wet > 0 ? "#d8f3ff" : "#edf7fb";
  ctx.beginPath();
  ctx.arc(0, -14, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-7, -7, 14, 22);
  ctx.fillStyle = "#607083";
  ctx.fillRect(-6, 14, 5, 12);
  ctx.fillRect(2, 14, 5, 12);
  const swing = Math.sin(s.time * 8) * Math.min(0.3, Math.abs(p.vx) / 400);
  ctx.save();
  ctx.translate(10, 2);
  ctx.rotate(swing);
  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.arc(0, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.restore();
  if (s.tick % 9 === 0) ParticleKits.emit("mote", p.x + p.w / 2 + p.face * 8, p.y + 24, 2, { minSpeed: 2, maxSpeed: 18, minLife: 0.8, maxLife: 1.8 });
  const c = s.creature;
  glow(c.x + c.w / 2, c.y + 8, 38 + c.alert * 82, c.state === "chase" ? "rgba(255,40,62,.55)" : "rgba(87,221,255,.36)");
  ctx.save();
  ctx.translate(c.x + c.w / 2, c.y + c.h / 2);
  if (c.vx < 0) ctx.scale(-1, 1);
  ctx.fillStyle = "#05080c";
  ctx.beginPath();
  ctx.ellipse(0, 0, 40, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = c.state === "chase" ? "#ff4f5f" : "#57ddff";
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.45 + c.alert * 0.55;
  const wave = Math.sin(s.time * 8) * 7;
  ctx.beginPath();
  ctx.moveTo(28, -4);
  ctx.quadraticCurveTo(52, -20 + wave, 68, -8);
  ctx.moveTo(28, 7);
  ctx.quadraticCurveTo(54, 22 - wave, 68, 12);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawProjectilesAndSignals() {
  for (const sig of s.acoustic.signals) {
    ctx.strokeStyle = `rgba(205,245,255,${Math.max(0.04, 0.42 - sig.r / sig.max * 0.36)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sig.x, sig.y, sig.r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = "#d8e1e8";
  for (const p of s.projectiles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawWater() {
  const y = s.water.level;
  const g = ctx.createLinearGradient(0, y - 30, 0, H);
  g.addColorStop(0, "rgba(50,160,210,.42)");
  g.addColorStop(1, "rgba(5,18,32,.86)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, y);
  for (let x = 0; x <= W; x += 14) ctx.lineTo(x, y + Math.sin(x * 0.02 + s.water.wave) * 5 + Math.sin(x * 0.007 - s.time * 3) * 2);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(188,248,255,.68)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, y);
  for (let x = 0; x <= W; x += 14) ctx.lineTo(x, y + Math.sin(x * 0.02 + s.water.wave) * 5);
  ctx.stroke();
}

function drawLighting() {
  ctx.save();
  const px = s.player.x + s.player.w / 2;
  const py = s.player.y + s.player.h / 2;
  for (const platform of level.platforms.filter((p) => p.edge)) {
    const dx = platform.x + platform.w / 2 - px;
    const dy = platform.y + platform.h / 2 - py;
    ctx.fillStyle = "rgba(0,0,0,.16)";
    ctx.fillRect(platform.x + dx * 0.022, platform.y + dy * 0.022 + 8, platform.w, platform.h);
  }
  for (const t of level.torches) glow(t.x, t.y, 80 + Math.sin(s.time * 7 + t.x) * 8, "rgba(255,165,72,.22)");
  const light = ctx.createRadialGradient(px, py, 18, px, py, 250);
  light.addColorStop(0, "rgba(255,224,160,.32)");
  light.addColorStop(0.36, "rgba(255,214,126,.16)");
  light.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = light;
  ctx.globalCompositeOperation = "screen";
  ctx.beginPath();
  ctx.arc(px, py, 250, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(87,221,255,${0.06 + s.blueBloom * 0.13})`;
  ctx.fillRect(s.camera.x, s.camera.y, W, H);
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "rgba(0,0,0,.22)";
  ctx.fillRect(s.camera.x, s.camera.y, W, H);
  if (s.flash > 0) {
    ctx.fillStyle = `rgba(180,245,255,${s.flash})`;
    ctx.fillRect(s.camera.x, s.camera.y, W, H);
  }
  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  const shakeX = (Math.random() - 0.5) * s.camera.shake;
  const shakeY = (Math.random() - 0.5) * s.camera.shake;
  ctx.save();
  ctx.translate(-s.camera.x + shakeX, -s.camera.y + shakeY);
  drawBackground();
  drawPlatforms();
  drawMachines();
  drawProjectilesAndSignals();
  drawActors();
  drawWater();
  ParticleKits.draw();
  drawLighting();
  ctx.restore();
}

function loop(t) {
  const dt = Math.min(0.033, (t - last) / 1000 || 0.016);
  last = t;
  update(dt);
  draw();
  if (running) requestAnimationFrame(loop);
}

function restart() {
  s = initialState();
  ui.end.classList.add("hidden");
  running = true;
  last = performance.now();
  for (let i = 0; i < 90; i++) ParticleKits.emit("mist", rand(80, 1200), rand(500, 670), 1, { minSpeed: 1, maxSpeed: 20, minLife: 1.4, maxLife: 3.4 });
  requestAnimationFrame(loop);
}

document.querySelector("#startBtn").addEventListener("click", () => {
  audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
  ui.start.classList.add("hidden");
  restart();
});
document.querySelector("#againBtn").addEventListener("click", restart);
addEventListener("keydown", (event) => {
  keys.add(event.code);
  if (event.code === "KeyR") restart();
});
addEventListener("keyup", (event) => keys.delete(event.code));
canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = (event.clientX - rect.left) * W / rect.width + s.camera.x;
  mouse.y = (event.clientY - rect.top) * H / rect.height + s.camera.y;
});
canvas.addEventListener("mousedown", () => DomainKits.projectileLite.throw());
window.GameHost = { getState: () => JSON.parse(JSON.stringify(s)), restart, ParticleKits, DomainKits };
draw();

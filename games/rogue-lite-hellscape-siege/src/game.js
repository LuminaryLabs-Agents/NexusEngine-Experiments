const canvas = document.querySelector('#gameCanvas');
const ctx = canvas.getContext('2d');
const topHud = document.querySelector('#topHud');
const bottomHud = document.querySelector('#bottomHud');
const errorPanel = document.querySelector('#errorPanel');

const TAU = Math.PI * 2;
const keys = new Set();
const state = {
  mode: 'lobby',
  time: 0,
  camera: { x: 0, y: 0, zoom: 1, shake: 0 },
  player: { x: 0, y: 180, hp: 100, maxHp: 100, speed: 245, swing: 0 },
  core: { x: 0, y: -60, hp: 300, maxHp: 300 },
  portals: [
    { x: -350, y: -150, id: 'grove', label: 'GROVE', color: '#10b981' },
    { x: 0, y: -320, id: 'crystal', label: 'CRYSTAL', color: '#a855f7' },
    { x: 350, y: -150, id: 'ashes', label: 'ASHES', color: '#f97316' }
  ],
  resources: [],
  drops: [],
  enemies: [],
  structures: [],
  particles: [],
  lasers: [],
  inventoryOpen: false,
  buildOpen: false,
  selectedBuild: 0,
  inv: { wood: 0, berry: 0, spore: 0, crystal: 0, energy: 0, obsidian: 0, ember: 0, sulfur: 0 },
  wave: 0,
  waveActive: false,
  spawnQueue: [],
  spawnTimer: 0,
  prompt: 'ENTER A PORTAL TO GATHER MATERIALS. RETURN TO START A SIEGE.'
};

const builds = [
  { id: 'wall', name: 'SPIKE WALL', cost: { wood: 5, obsidian: 3 }, hp: 180, range: 0 },
  { id: 'turret', name: 'SENTRY', cost: { wood: 2, crystal: 5, energy: 3 }, hp: 100, range: 310 },
  { id: 'pylon', name: 'REGEN', cost: { spore: 6, sulfur: 3, energy: 2 }, hp: 100, range: 160 }
];

const resourceTables = {
  grove: [
    { id: 'oak', name: 'OAK', item: 'wood', color: '#22543d', hp: 85, size: 32 },
    { id: 'berry', name: 'BERRY', item: 'berry', color: '#ef4444', hp: 35, size: 20 },
    { id: 'spore', name: 'SPORE', item: 'spore', color: '#38bdf8', hp: 40, size: 18 }
  ],
  crystal: [
    { id: 'geode', name: 'GEODE', item: 'crystal', color: '#a855f7', hp: 95, size: 28 },
    { id: 'pillar', name: 'PILLAR', item: 'energy', color: '#e9d5ff', hp: 70, size: 24 }
  ],
  ashes: [
    { id: 'spire', name: 'SPIRE', item: 'obsidian', color: '#4b5563', hp: 95, size: 30 },
    { id: 'ember', name: 'FIREBLOOM', item: 'ember', color: '#f97316', hp: 45, size: 20 },
    { id: 'sulfur', name: 'SULFUR', item: 'sulfur', color: '#facc15', hp: 35, size: 18 }
  ]
};

const palette = {
  lobby: { ground: '#120404', line: '#ef4444', glow: '#ff3300' },
  grove: { ground: '#052312', line: '#10b981', glow: '#10b981' },
  crystal: { ground: '#120b24', line: '#a855f7', glow: '#a855f7' },
  ashes: { ground: '#1e0f0a', line: '#f97316', glow: '#f97316' }
};

function showError(error) {
  errorPanel.hidden = false;
  errorPanel.textContent = String(error?.stack ?? error?.message ?? error);
}

function resize() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.floor(innerWidth * dpr);
  canvas.height = Math.floor(innerHeight * dpr);
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function rand(a, b) { return a + Math.random() * (b - a); }
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function angleTo(a, b) { return Math.atan2(b.y - a.y, b.x - a.x); }

function emit(x, y, color, count = 10, speed = 160) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * TAU;
    const s = rand(speed * 0.25, speed);
    state.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand(0.25, 0.8), max: 0.8, color, size: rand(2, 5) });
  }
}

function resetLobby() {
  state.mode = 'lobby';
  state.resources.length = 0;
  state.drops.length = 0;
  state.enemies.length = 0;
  state.player.x = 0;
  state.player.y = 180;
  state.prompt = 'DEFEND THE CORE. ENTER PORTALS TO GATHER. SPACE AT CORE STARTS WAVE.';
}

function enterWorld(id) {
  state.mode = id;
  state.resources.length = 0;
  state.drops.length = 0;
  state.enemies.length = 0;
  state.player.x = 0;
  state.player.y = 0;
  state.prompt = 'HARVEST RESOURCES WITH SPACE. RETURN THROUGH THE BEACON.';
  const table = resourceTables[id];
  for (let i = 0; i < 38; i++) {
    const t = table[Math.floor(Math.random() * table.length)];
    const a = Math.random() * TAU;
    const r = rand(220, 850);
    state.resources.push({ ...t, x: Math.cos(a) * r, y: Math.sin(a) * r, hp: t.hp, maxHp: t.hp, bob: Math.random() * TAU });
  }
  emit(0, 0, palette[id].glow, 80, 380);
  state.camera.shake = 14;
}

function startWave() {
  if (state.waveActive || state.mode !== 'lobby') return;
  state.wave += 1;
  state.waveActive = true;
  state.spawnQueue = [];
  for (let i = 0; i < 4 + state.wave * 3; i++) state.spawnQueue.push('crawler');
  for (let i = 0; i < Math.floor(state.wave * 1.5); i++) state.spawnQueue.push('brute');
  state.spawnQueue.sort(() => Math.random() - 0.5);
  state.prompt = `SIEGE WAVE ${state.wave}: HOLD THE CORE.`;
  emit(0, -60, '#ff3300', 90, 420);
  state.camera.shake = 15;
}

function spawnEnemy(type) {
  const a = Math.random() * TAU;
  const r = 720;
  state.enemies.push({
    type,
    x: Math.cos(a) * r,
    y: Math.sin(a) * r,
    hp: type === 'brute' ? 120 : 42,
    maxHp: type === 'brute' ? 120 : 42,
    speed: type === 'brute' ? 54 : 118,
    dmg: type === 'brute' ? 25 : 8,
    cd: 0,
    size: type === 'brute' ? 28 : 17
  });
}

function addDrop(x, y, item, color) {
  state.drops.push({ x, y, item, color, vx: rand(-60, 60), vy: rand(-120, -40), life: 0.4 });
}

function inventoryTotal() {
  return Object.values(state.inv).reduce((a, b) => a + b, 0);
}

function canAfford(cost) {
  return Object.entries(cost).every(([k, v]) => (state.inv[k] || 0) >= v);
}

function spend(cost) {
  for (const [k, v] of Object.entries(cost)) state.inv[k] -= v;
}

function placeBuild() {
  if (state.mode !== 'lobby') return;
  const bp = builds[state.selectedBuild];
  if (!canAfford(bp.cost)) {
    state.prompt = 'INSUFFICIENT MATERIALS.';
    state.camera.shake = 5;
    return;
  }
  spend(bp.cost);
  state.structures.push({
    kind: bp.id,
    name: bp.name,
    x: state.player.x,
    y: state.player.y + 58,
    hp: bp.hp,
    maxHp: bp.hp,
    range: bp.range,
    cd: 0
  });
  state.buildOpen = false;
  state.prompt = `${bp.name} DEPLOYED.`;
  emit(state.player.x, state.player.y + 40, '#ffcc66', 40, 260);
}

function updateInput(dt) {
  let x = 0, y = 0;
  if (keys.has('w') || keys.has('arrowup')) y -= 1;
  if (keys.has('s') || keys.has('arrowdown')) y += 1;
  if (keys.has('a') || keys.has('arrowleft')) x -= 1;
  if (keys.has('d') || keys.has('arrowright')) x += 1;
  if (x && y) { x *= 0.7071; y *= 0.7071; }
  state.player.x = clamp(state.player.x + x * state.player.speed * dt, -940, 940);
  state.player.y = clamp(state.player.y + y * state.player.speed * dt, -940, 940);
  state.player.swing += (x || y ? 12 : 4) * dt;

  if (keys.has('i')) { keys.delete('i'); state.inventoryOpen = !state.inventoryOpen; }
  if (keys.has('b')) { keys.delete('b'); if (state.mode === 'lobby') state.buildOpen = !state.buildOpen; }
  if (keys.has('q')) { keys.delete('q'); state.selectedBuild = (state.selectedBuild + builds.length - 1) % builds.length; }
  if (keys.has('e')) { keys.delete('e'); state.selectedBuild = (state.selectedBuild + 1) % builds.length; }
  if (keys.has('f') || keys.has('enter')) { keys.delete('f'); keys.delete('enter'); if (state.buildOpen) placeBuild(); }
}

function updateWorld(dt) {
  if (state.mode === 'lobby') {
    for (const p of state.portals) if (dist(state.player, p) < 46) enterWorld(p.id);
    if (dist(state.player, state.core) < 95 && (keys.has(' ') || keys.has('spacebar'))) {
      keys.delete(' '); keys.delete('spacebar'); startWave();
    }
  } else if (Math.hypot(state.player.x, state.player.y + 350) < 55) {
    resetLobby();
    emit(0, -350, '#00f5ff', 80, 360);
  }

  if (keys.has(' ') || keys.has('spacebar')) {
    const candidates = [...state.resources, ...state.enemies];
    let target = null;
    let best = 86;
    for (const c of candidates) {
      const d = dist(state.player, c);
      if (d < best) { best = d; target = c; }
    }
    if (target) {
      state.player.swing += dt * 25;
      target.hp -= 48 * dt;
      emit(target.x, target.y, target.color || '#ff3300', 1, 70);
      if (target.hp <= 0) {
        if (state.resources.includes(target)) {
          state.resources.splice(state.resources.indexOf(target), 1);
          for (let i = 0; i < 3; i++) addDrop(target.x, target.y, target.item, target.color);
        } else {
          state.enemies.splice(state.enemies.indexOf(target), 1);
          addDrop(target.x, target.y, target.type === 'brute' ? 'ember' : 'sulfur', '#f97316');
        }
        emit(target.x, target.y, target.color || '#ff3300', 24, 240);
      }
    }
  }

  for (const d of [...state.drops]) {
    d.life -= dt;
    d.vy += 520 * dt;
    d.x += d.vx * dt;
    d.y += d.vy * dt;
    if (d.life < 0) {
      const a = angleTo(d, state.player);
      const dd = dist(d, state.player);
      d.x += Math.cos(a) * 520 * dt;
      d.y += Math.sin(a) * 520 * dt;
      if (dd < 24) {
        state.inv[d.item] = (state.inv[d.item] || 0) + 1;
        state.drops.splice(state.drops.indexOf(d), 1);
        emit(d.x, d.y, d.color, 8, 120);
      }
    }
  }
}

function updateSiege(dt) {
  if (state.mode !== 'lobby') return;
  if (state.waveActive && state.spawnQueue.length) {
    state.spawnTimer += dt;
    if (state.spawnTimer > Math.max(0.55, 2.2 - state.wave * 0.12)) {
      state.spawnTimer = 0;
      spawnEnemy(state.spawnQueue.pop());
    }
  }

  const targets = [state.player, state.core, ...state.structures.filter(s => s.hp > 0)];
  for (const e of [...state.enemies]) {
    e.cd -= dt;
    let target = targets[0], best = Infinity;
    for (const t of targets) {
      const d = dist(e, t);
      if (d < best) { best = d; target = t; }
    }
    const a = angleTo(e, target);
    if (best > 36) {
      e.x += Math.cos(a) * e.speed * dt;
      e.y += Math.sin(a) * e.speed * dt;
    } else if (e.cd <= 0) {
      e.cd = e.type === 'brute' ? 2.2 : 1.0;
      target.hp -= e.dmg;
      state.camera.shake = Math.max(state.camera.shake, 4);
      emit(target.x, target.y, '#ef4444', 8, 160);
    }
  }

  for (const s of state.structures) {
    s.cd -= dt;
    if (s.kind === 'turret' && s.cd <= 0) {
      let target = null, best = s.range;
      for (const e of state.enemies) {
        const d = dist(s, e);
        if (d < best) { best = d; target = e; }
      }
      if (target) {
        s.cd = 0.68;
        target.hp -= 16;
        state.lasers.push({ x1: s.x, y1: s.y - 28, x2: target.x, y2: target.y, life: 0.12 });
        if (target.hp <= 0) {
          state.enemies.splice(state.enemies.indexOf(target), 1);
          emit(target.x, target.y, '#f97316', 18, 220);
        }
      }
    }
    if (s.kind === 'pylon' && s.cd <= 0) {
      s.cd = 1.8;
      for (const t of [state.player, state.core, ...state.structures]) {
        if (dist(s, t) < 160) t.hp = Math.min(t.maxHp, t.hp + 12);
      }
      emit(s.x, s.y, '#10b981', 18, 140);
    }
  }

  state.structures = state.structures.filter(s => s.hp > 0);
  if (state.core.hp <= 0 || state.player.hp <= 0) {
    state.prompt = 'CORE FAILURE. MATERIALS LOST. REBOOTING LOBBY.';
    for (const k of Object.keys(state.inv)) state.inv[k] = 0;
    state.core.hp = state.core.maxHp;
    state.player.hp = state.player.maxHp;
    state.waveActive = false;
    state.spawnQueue.length = 0;
    resetLobby();
  }
  if (state.waveActive && !state.spawnQueue.length && !state.enemies.length) {
    state.waveActive = false;
    state.prompt = `WAVE ${state.wave} CLEARED. GATHER AND REBUILD.`;
    for (let i = 0; i < 4; i++) addDrop(0, 0, 'energy', '#e9d5ff');
  }
}

function updateFx(dt) {
  for (const p of [...state.particles]) {
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 70 * dt;
    if (p.life <= 0) state.particles.splice(state.particles.indexOf(p), 1);
  }
  for (const l of [...state.lasers]) {
    l.life -= dt;
    if (l.life <= 0) state.lasers.splice(state.lasers.indexOf(l), 1);
  }
  state.camera.x += (state.player.x - state.camera.x) * 0.08;
  state.camera.y += (state.player.y - state.camera.y) * 0.08;
  state.camera.shake *= 0.88;
}

function drawHealth(x, y, w, pct, color = '#00f5ff') {
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(x - w / 2, y, w, 4);
  ctx.fillStyle = color;
  ctx.fillRect(x - w / 2, y, w * clamp(pct, 0, 1), 4);
}

function drawWorld() {
  const pal = palette[state.mode];
  ctx.fillStyle = pal.ground;
  ctx.fillRect(-1200, -1200, 2400, 2400);
  ctx.strokeStyle = pal.line + '33';
  ctx.lineWidth = 1;
  for (let r = 160; r < 1100; r += 160) {
    ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke();
  }
  if (state.mode === 'lobby') {
    for (let i = 0; i < 20; i++) {
      const a = i * 2.399;
      const r = 180 + (i * 59) % 760;
      ctx.fillStyle = i % 2 ? '#4a0c02' : '#7c1d08';
      ctx.beginPath(); ctx.ellipse(Math.cos(a) * r, Math.sin(a) * r, 60, 18, a, 0, TAU); ctx.fill();
    }
  }
}

function drawPortal(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.shadowBlur = 24;
  ctx.shadowColor = p.color;
  ctx.strokeStyle = p.color;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(0, 0, 28, 48, 0, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, 0, 15, 28, 0, 0, TAU); ctx.stroke();
  ctx.fillStyle = p.color;
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(p.label, 0, -62);
  ctx.restore();
}

function drawCore() {
  ctx.save();
  ctx.translate(state.core.x, state.core.y);
  ctx.shadowBlur = 24;
  ctx.shadowColor = '#38bdf8';
  ctx.fillStyle = '#020617';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -58); ctx.lineTo(42, 44); ctx.lineTo(-42, 44); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath(); ctx.arc(0, 4, 12, 0, TAU); ctx.fill();
  drawHealth(0, 62, 76, state.core.hp / state.core.maxHp);
  ctx.restore();
}

function drawPlayer() {
  const p = state.player;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath(); ctx.ellipse(0, 16, 18 + inventoryTotal() * 0.08, 7, 0, 0, TAU); ctx.fill();
  ctx.shadowBlur = 15;
  ctx.shadowColor = '#00f5ff';
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(-13, -18, 26, 38, 7); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -28, 11, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.save();
  ctx.translate(15, -5);
  ctx.rotate(Math.sin(p.swing) * 0.8);
  ctx.strokeStyle = '#eaf6ff';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(22, -14); ctx.stroke();
  ctx.restore();
  drawHealth(0, -48, 40, p.hp / p.maxHp);
  ctx.restore();
}

function drawEntity(e) {
  ctx.save();
  ctx.translate(e.x, e.y);
  const color = e.color || (e.type === 'brute' ? '#f97316' : '#ef4444');
  ctx.shadowBlur = 12;
  ctx.shadowColor = color;
  ctx.fillStyle = color;
  ctx.strokeStyle = '#090202';
  ctx.lineWidth = 2;
  if (e.maxHp) drawHealth(0, -e.size - 18, e.size * 2, e.hp / e.maxHp, color);
  if (e.kind) {
    ctx.fillStyle = e.kind === 'turret' ? '#0f172a' : e.kind === 'pylon' ? '#022c22' : '#334155';
    ctx.strokeStyle = e.kind === 'pylon' ? '#10b981' : '#38bdf8';
    ctx.beginPath(); ctx.roundRect(-22, -30, 44, 54, 8); ctx.fill(); ctx.stroke();
    if (e.kind === 'wall') { ctx.beginPath(); ctx.moveTo(-30, 24); ctx.lineTo(-15, -30); ctx.lineTo(0, 24); ctx.lineTo(15, -30); ctx.lineTo(30, 24); ctx.stroke(); }
  } else if (e.type) {
    ctx.fillRect(-e.size, -e.size, e.size * 2, e.size * 2);
    ctx.fillStyle = '#ffff77';
    ctx.fillRect(-e.size * 0.45, -e.size * 0.35, 5, 5);
    ctx.fillRect(e.size * 0.25, -e.size * 0.35, 5, 5);
  } else {
    ctx.beginPath(); ctx.arc(0, 0, e.size, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffffff66';
    ctx.beginPath(); ctx.arc(-e.size * 0.35, -e.size * 0.35, e.size * 0.22, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

function drawDrop(d) {
  ctx.save();
  ctx.translate(d.x, d.y);
  ctx.shadowBlur = 10;
  ctx.shadowColor = d.color;
  ctx.fillStyle = d.color;
  ctx.beginPath(); ctx.arc(0, 0, 7, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffffff88';
  ctx.beginPath(); ctx.moveTo(-3, -2); ctx.lineTo(4, -2); ctx.lineTo(0, 5); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawPanels() {
  const p = state.player;
  if (state.inventoryOpen) {
    ctx.save();
    ctx.translate(p.x - 180, p.y - 132);
    panel(-86, -56, 172, 214, '#00f5ff');
    ctx.fillStyle = '#00f5ff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center'; ctx.fillText('NEXUS INVENTORY', 0, -34);
    let y = -10;
    for (const [k, v] of Object.entries(state.inv)) {
      ctx.fillStyle = '#eaf6ff'; ctx.textAlign = 'left'; ctx.fillText(k.toUpperCase(), -62, y);
      ctx.textAlign = 'right'; ctx.fillText(String(v).padStart(2, '0'), 62, y);
      y += 20;
    }
    ctx.restore();
  }
  if (state.buildOpen) {
    const bp = builds[state.selectedBuild];
    ctx.save();
    ctx.translate(p.x, p.y - 112);
    panel(-112, -58, 224, 134, '#ff553c');
    ctx.fillStyle = '#ffcc66'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center'; ctx.fillText('BUILD BLUEPRINT', 0, -35);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px monospace'; ctx.fillText(`<< ${bp.name} >>`, 0, -8);
    ctx.fillStyle = canAfford(bp.cost) ? '#10b981' : '#ef4444'; ctx.font = '10px monospace';
    ctx.fillText(Object.entries(bp.cost).map(([k,v]) => `${v} ${k}`).join(' · ').toUpperCase(), 0, 18);
    ctx.fillStyle = '#94a3b8'; ctx.fillText('Q/E CYCLE · F PLACE', 0, 48);
    ctx.restore();
  }
}

function panel(x, y, w, h, color) {
  ctx.save();
  ctx.shadowBlur = 18;
  ctx.shadowColor = color;
  ctx.fillStyle = 'rgba(5, 8, 14, 0.88)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 10); ctx.fill(); ctx.stroke();
  ctx.restore();
}

function draw() {
  const sx = (Math.random() - 0.5) * state.camera.shake;
  const sy = (Math.random() - 0.5) * state.camera.shake;
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  ctx.save();
  ctx.translate(innerWidth / 2 + sx, innerHeight / 2 + sy);
  ctx.scale(state.camera.zoom, state.camera.zoom);
  ctx.translate(-state.camera.x, -state.camera.y);
  drawWorld();
  if (state.mode === 'lobby') {
    drawCore();
    for (const p of state.portals) drawPortal(p);
  } else {
    drawPortal({ x: 0, y: -350, label: 'BASE', color: '#00f5ff' });
  }
  const drawable = [...state.resources, ...state.structures, ...state.enemies, state.player].sort((a,b) => (a.y || 0) - (b.y || 0));
  for (const e of drawable) e === state.player ? drawPlayer() : drawEntity(e);
  for (const d of state.drops) drawDrop(d);
  for (const l of state.lasers) {
    ctx.strokeStyle = `rgba(0,255,255,${l.life / 0.12})`; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(l.x1, l.y1); ctx.lineTo(l.x2, l.y2); ctx.stroke();
  }
  for (const p of state.particles) {
    ctx.globalAlpha = clamp(p.life / p.max, 0, 1);
    ctx.fillStyle = p.color; ctx.shadowBlur = 8; ctx.shadowColor = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
    ctx.globalAlpha = 1;
  }
  drawPanels();
  ctx.fillStyle = '#ffffff99'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
  ctx.fillText(state.prompt, state.player.x, state.player.y - 62);
  ctx.restore();
}

function updateHud() {
  const inv = Object.entries(state.inv).filter(([,v]) => v).map(([k,v]) => `${k}:${v}`).join(' ');
  topHud.textContent = `MODE ${state.mode.toUpperCase()} · WAVE ${state.wave}${state.waveActive ? ' ACTIVE' : ''} · CORE ${Math.ceil(state.core.hp)}/${state.core.maxHp}`;
  bottomHud.textContent = state.mode === 'lobby'
    ? `WASD MOVE · SPACE CORE/WIELD · B BUILD · I INV${inv ? ' · ' + inv.toUpperCase() : ''}`
    : `WASD MOVE · HOLD SPACE HARVEST · RETURN TO BASE BEACON · I INV${inv ? ' · ' + inv.toUpperCase() : ''}`;
}

function frame(now) {
  try {
    const dt = Math.min(0.033, (now - (frame.last || now)) / 1000 || 1/60);
    frame.last = now;
    state.time += dt;
    updateInput(dt);
    updateWorld(dt);
    updateSiege(dt);
    updateFx(dt);
    updateHud();
    draw();
    requestAnimationFrame(frame);
  } catch (error) {
    showError(error);
  }
}

addEventListener('resize', resize);
addEventListener('keydown', e => { keys.add(e.key.toLowerCase()); if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase())) e.preventDefault(); });
addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));
addEventListener('blur', () => keys.clear());

window.GameHost = { state, resetLobby, enterWorld, startWave, getState: () => state };
resize();
requestAnimationFrame(frame);

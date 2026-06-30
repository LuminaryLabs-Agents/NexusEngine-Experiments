const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const statusEl = document.querySelector("#status");
const readoutEl = document.querySelector("#readout");
const commandBar = document.querySelector("#commandBar");

const troopTypes = {
  light: { label: "Light", speed: 1.25, strike: 0.72, guard: 0.64, fatigue: 0.72, color: "#f2d98a" },
  medium: { label: "Medium", speed: 1.0, strike: 0.95, guard: 0.94, fatigue: 0.92, color: "#d1974d" },
  heavy: { label: "Heavy", speed: 0.72, strike: 1.3, guard: 1.18, fatigue: 1.18, color: "#a94b34" }
};

const terrain = {
  road: { label: "Road", move: 1.25, fatigue: 0.84, light: 1.0, medium: 1.05, heavy: 1.06 },
  plain: { label: "Plain", move: 1.0, fatigue: 0.94, light: 1.0, medium: 1.0, heavy: 1.08 },
  hill: { label: "Hill", move: 0.82, fatigue: 1.14, light: 1.08, medium: 1.08, heavy: 0.92 },
  forest: { label: "Forest", move: 0.72, fatigue: 1.2, light: 1.2, medium: 1.0, heavy: 0.72 },
  marsh: { label: "Marsh", move: 0.58, fatigue: 1.34, light: 1.1, medium: 0.82, heavy: 0.56 },
  mountain: { label: "Mountain", move: 0.52, fatigue: 1.42, light: 1.15, medium: 0.88, heavy: 0.64 }
};

const locations = [
  { id: "roma", name: "Roma", x: 0.44, y: 0.58, terrain: "road", note: "Muster point and supply center." },
  { id: "veii", name: "Veii Ridge", x: 0.36, y: 0.47, terrain: "hill", enemy: "Etruscan Ridge Screen", note: "Broken high ground favors screens and measured advances." },
  { id: "capua", name: "Capua Road", x: 0.53, y: 0.72, terrain: "road", note: "Fast road south with lower march fatigue." },
  { id: "beneventum", name: "Beneventum Ford", x: 0.56, y: 0.64, terrain: "marsh", enemy: "Ford Ambush", note: "Mud punishes heavy charges." },
  { id: "samnium", name: "Samnium Pass", x: 0.64, y: 0.61, terrain: "mountain", enemy: "Samnite Pass Guard", note: "A narrow pass where cohesion matters." },
  { id: "ariminum", name: "Ariminum Coast", x: 0.62, y: 0.39, terrain: "forest", enemy: "Gallic Woods Raid", note: "Woods reward light troops and disrupt heavy lines." },
  { id: "tarentum", name: "Tarentum Plain", x: 0.69, y: 0.83, terrain: "plain", enemy: "Greek Field Line", note: "Open ground rewards a timed decisive charge." }
];

const links = [["roma", "veii"], ["roma", "capua"], ["roma", "beneventum"], ["veii", "ariminum"], ["ariminum", "samnium"], ["capua", "beneventum"], ["beneventum", "samnium"], ["capua", "tarentum"], ["samnium", "tarentum"]];
const commands = ["Advance", "Hold", "Wheel Left", "Wheel Right", "Charge", "Skirmish", "Fall Back", "Regroup"];
const byId = new Map(locations.map((location) => [location.id, location]));
const neighbors = links.reduce((map, [a, b]) => {
  (map[a] ??= []).push(b);
  (map[b] ??= []).push(a);
  return map;
}, {});

const state = {
  mode: "campaign",
  selected: "roma",
  moving: null,
  cleared: new Set(),
  army: { location: "roma", morale: 76, supplies: 88, troops: { light: 120, medium: 170, heavy: 95 } },
  battle: null,
  selectedUnit: "medium",
  log: ["Legions assembled at Roma. Click a linked location to march."]
};

let last = performance.now();
let width = 1;
let height = 1;
let ratio = 1;

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function loc(id) { return byId.get(id); }
function point(location) { return { x: location.x * width, y: location.y * height }; }
function log(message) { state.log.unshift(message); state.log.length = Math.min(6, state.log.length); }
function total(units) { return units.reduce((sum, unit) => sum + unit.strength, 0); }
function avg(units, key) { const strength = total(units); return units.reduce((sum, unit) => sum + unit[key] * unit.strength, 0) / Math.max(1, strength); }

function resize() {
  ratio = Math.max(1, Math.min(2, devicePixelRatio || 1));
  width = Math.floor(canvas.clientWidth * ratio);
  height = Math.floor(canvas.clientHeight * ratio);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}

function makeUnit(side, type, strength, lane) {
  return { side, type, strength, max: strength, lane, morale: side === "rome" ? 72 : 64, fatigue: 10, cohesion: 78, momentum: 0, order: "Hold", cooldown: 0 };
}

function startBattle(location) {
  const enemyMix = location.terrain === "mountain" ? { light: 80, medium: 180, heavy: 70 }
    : location.terrain === "forest" ? { light: 130, medium: 160, heavy: 50 }
    : location.terrain === "plain" ? { light: 70, medium: 140, heavy: 130 }
    : { light: 120, medium: 110, heavy: 65 };
  state.mode = "battle";
  state.selectedUnit = "medium";
  state.battle = {
    name: location.enemy,
    locationId: location.id,
    terrain: location.terrain,
    time: 0,
    result: null,
    rome: Object.entries(state.army.troops).map(([type, strength], index) => makeUnit("rome", type, strength, index)).filter((unit) => unit.strength > 0),
    enemy: Object.entries(enemyMix).map(([type, strength], index) => makeUnit("enemy", type, strength, index))
  };
  log(`${location.enemy}: issue posture orders to break morale and cohesion.`);
}

function commandUnit(commandName) {
  if (state.mode !== "battle" || !state.battle) return;
  const unit = state.battle.rome.find((candidate) => candidate.type === state.selectedUnit && candidate.strength > 0);
  if (!unit || unit.cooldown > 0) return;
  const t = troopTypes[unit.type];
  const ground = terrain[state.battle.terrain];
  const effects = {
    "Advance": [5, -3, 10],
    "Hold": [-2, 4, -4],
    "Wheel Left": [3, -1, 4],
    "Wheel Right": [3, -1, 4],
    "Charge": [12, -10, 28],
    "Skirmish": [4, -2, unit.type === "light" ? 12 : 4],
    "Fall Back": [2, 3, -12],
    "Regroup": [-8, 9, -16]
  }[commandName];
  unit.order = commandName;
  unit.fatigue = clamp(unit.fatigue + effects[0] * t.fatigue * ground.fatigue, 0, 100);
  unit.cohesion = clamp(unit.cohesion + effects[1], 0, 100);
  unit.momentum = clamp(unit.momentum + effects[2] * t.speed * ground.move, -40, 100);
  unit.cooldown = 1.1;
  log(`${t.label} cohort: ${commandName}.`);
}

function pressure(unit, defending = false) {
  const t = troopTypes[unit.type];
  const ground = terrain[state.battle.terrain];
  const fatigue = 1 - clamp(unit.fatigue / 150, 0, 0.7);
  const cohesion = clamp(unit.cohesion / 80, 0.35, 1.32);
  const strength = clamp(unit.strength / unit.max, 0.18, 1);
  let intent = defending ? t.guard : t.strike;
  if (unit.order === "Hold") intent *= defending ? 1.28 : 0.78;
  if (unit.order === "Charge") intent *= defending ? 0.72 : 1.38 + unit.momentum / 260;
  if (unit.order === "Skirmish") intent *= unit.type === "light" ? 1.22 : 0.84;
  if (unit.order === "Regroup") intent *= 0.42;
  if (unit.order === "Fall Back") intent *= defending ? 1.08 : 0.48;
  if (unit.order.startsWith("Wheel")) intent *= unit.type === "medium" ? 0.92 : 0.78;
  return intent * ground[unit.type] * fatigue * cohesion * strength;
}

function tickBattle(dt) {
  const battle = state.battle;
  battle.time += dt;
  for (const unit of [...battle.rome, ...battle.enemy]) {
    unit.cooldown = Math.max(0, unit.cooldown - dt);
    unit.fatigue = clamp(unit.fatigue + dt * troopTypes[unit.type].fatigue * terrain[battle.terrain].fatigue * 0.55, 0, 100);
    unit.momentum = unit.momentum > 0 ? clamp(unit.momentum - 6 * dt, 0, 100) : clamp(unit.momentum + 5 * dt, -40, 0);
    if (unit.order === "Hold") unit.cohesion = clamp(unit.cohesion + dt * 1.2, 0, 100);
    if (unit.order === "Regroup") unit.cohesion = clamp(unit.cohesion + dt * 3.5, 0, 100);
  }
  for (const unit of battle.enemy) {
    if (unit.cooldown <= 0) {
      unit.order = unit.type === "light" ? "Skirmish" : Math.floor(battle.time + unit.lane) % 5 === 0 ? "Charge" : "Advance";
      unit.cooldown = 1.6;
    }
  }
  for (const attacker of [...battle.rome, ...battle.enemy]) {
    const defenders = attacker.side === "rome" ? battle.enemy : battle.rome;
    const defender = defenders.find((unit) => unit.lane === attacker.lane && unit.strength > 0) ?? defenders.find((unit) => unit.strength > 0);
    if (!defender || attacker.strength <= 0) continue;
    const loss = Math.max(0.04, pressure(attacker) - pressure(defender, true) * 0.54) * dt * 2.15;
    defender.strength = clamp(defender.strength - loss, 0, defender.max);
    defender.cohesion = clamp(defender.cohesion - loss * (attacker.order === "Charge" ? 0.8 : 0.46), 0, 100);
    defender.morale = clamp(defender.morale - loss * (attacker.order === "Charge" ? 0.42 : 0.24), 0, 100);
  }
  const romanMorale = avg(battle.rome, "morale");
  const enemyMorale = avg(battle.enemy, "morale");
  if (total(battle.enemy) < 55 || enemyMorale < 18) finishBattle(true);
  if (total(battle.rome) < 70 || romanMorale < 16) finishBattle(false);
}

function finishBattle(victory) {
  const battle = state.battle;
  battle.result = victory ? "victory" : "defeat";
  state.mode = "campaign";
  state.army.troops = Object.fromEntries(battle.rome.map((unit) => [unit.type, Math.max(0, Math.round(unit.strength))]));
  state.army.morale = clamp(state.army.morale + (victory ? 8 : -12), 0, 100);
  if (victory) state.cleared.add(battle.locationId);
  log(victory ? `${battle.name} broken. Rome holds the field.` : `${battle.name} forces a withdrawal.`);
}

function tick(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (state.mode === "campaign" && state.moving) {
    const target = loc(state.moving.to);
    state.moving.progress = clamp(state.moving.progress + dt * 0.34 * terrain[target.terrain].move, 0, 1);
    if (state.moving.progress >= 1) {
      state.army.location = state.moving.to;
      state.army.supplies = clamp(state.army.supplies - terrain[target.terrain].fatigue * 4, 0, 100);
      state.moving = null;
      log(`Arrived at ${target.name}.`);
      if (target.enemy && !state.cleared.has(target.id)) startBattle(target);
    }
  }
  if (state.mode === "battle" && state.battle && !state.battle.result) tickBattle(dt);
  draw();
  updateHud();
  requestAnimationFrame(tick);
}

function drawText(text, x, y, align = "left", size = 13) {
  ctx.save();
  ctx.font = `750 ${size}px Inter, system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff6e3";
  ctx.shadowColor = "rgba(0,0,0,.8)";
  ctx.shadowBlur = 10;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawCampaign() {
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, "#25351f");
  grad.addColorStop(0.45, "#59411f");
  grad.addColorStop(1, "#181c18");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 0.2;
  for (let i = 0; i < 70; i += 1) {
    ctx.beginPath();
    ctx.arc(((i * 97) % 1000) / 1000 * width, ((i * 53) % 1000) / 1000 * height, 38 + (i % 8) * 18, 0, Math.PI * 2);
    ctx.fillStyle = i % 3 === 0 ? "#b49b58" : "#2f4c2e";
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.lineCap = "round";
  for (const [a, b] of links) {
    const p = point(loc(a));
    const q = point(loc(b));
    const live = neighbors[state.army.location].includes(a) || neighbors[state.army.location].includes(b);
    ctx.strokeStyle = live ? "rgba(246,208,120,.56)" : "rgba(255,230,180,.2)";
    ctx.lineWidth = live ? 5 : 3;
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
  }
  for (const location of locations) {
    const p = point(location);
    const current = location.id === state.army.location;
    const selected = location.id === state.selected;
    const reachable = neighbors[state.army.location].includes(location.id);
    ctx.beginPath();
    ctx.arc(p.x, p.y, current ? 16 : selected ? 14 : reachable ? 12 : 9, 0, Math.PI * 2);
    ctx.fillStyle = current ? "#fff4c0" : selected ? "#f6d078" : state.cleared.has(location.id) ? "#9fd39b" : location.enemy ? "#c6684a" : "#c9d7ff";
    ctx.fill(); ctx.strokeStyle = selected ? "#fffaf0" : "rgba(0,0,0,.6)"; ctx.lineWidth = selected ? 3 : 1.5; ctx.stroke();
    drawText(location.name, p.x + 18, p.y, "left", selected ? 14 : 12);
  }
  const armyPoint = state.moving ? { x: (1 - state.moving.progress) * point(loc(state.moving.from)).x + state.moving.progress * point(loc(state.moving.to)).x, y: (1 - state.moving.progress) * point(loc(state.moving.from)).y + state.moving.progress * point(loc(state.moving.to)).y } : point(loc(state.army.location));
  ctx.save(); ctx.translate(armyPoint.x, armyPoint.y - 25); ctx.fillStyle = "#efe5c8"; ctx.fillRect(-2, -20, 4, 33); ctx.fillStyle = "#9d2f1d"; ctx.beginPath(); ctx.moveTo(2, -20); ctx.lineTo(26, -13); ctx.lineTo(2, -6); ctx.fill(); ctx.fillStyle = "#f7cf75"; ctx.beginPath(); ctx.arc(0, 13, 9, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}

function drawUnit(unit, x, y, selected) {
  const t = troopTypes[unit.type];
  ctx.fillStyle = selected ? "rgba(255,244,192,.28)" : unit.side === "rome" ? "rgba(42,24,14,.84)" : "rgba(34,17,13,.82)";
  ctx.strokeStyle = selected ? "#fff4c0" : unit.side === "rome" ? "rgba(246,208,120,.42)" : "rgba(255,155,122,.42)";
  ctx.lineWidth = selected ? 3 : 1.5;
  ctx.beginPath(); ctx.roundRect(x, y, 240, 88, 16); ctx.fill(); ctx.stroke();
  ctx.fillStyle = t.color; ctx.fillRect(x + 12, y + 34, 216 * clamp(unit.strength / unit.max, 0, 1), 8);
  ctx.fillStyle = "#e9ca83"; ctx.fillRect(x + 12, y + 48, 216 * clamp(unit.morale / 100, 0, 1), 5);
  ctx.fillStyle = "#a9d194"; ctx.fillRect(x + 12, y + 58, 216 * clamp(unit.cohesion / 100, 0, 1), 5);
  drawText(t.label, x + 12, y + 17, "left", 14);
  drawText(`${Math.round(unit.strength)} men`, x + 228, y + 17, "right", 12);
  drawText(`${unit.order} · fatigue ${Math.round(unit.fatigue)}`, x + 12, y + 74, "left", 12);
}

function drawBattle() {
  const battle = state.battle;
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, "#241e16"); grad.addColorStop(0.55, "#443621"); grad.addColorStop(1, "#16110c");
  ctx.fillStyle = grad; ctx.fillRect(0, 0, width, height);
  drawText(`${battle.name} · ${terrain[battle.terrain].label}`, width / 2, 44, "center", 22);
  drawText("Original formation tactics: posture, morale, cohesion, fatigue, terrain pressure", width / 2, 74, "center", 13);
  battle.rome.forEach((unit) => drawUnit(unit, width * 0.13, height * 0.34 + unit.lane * 108, state.selectedUnit === unit.type));
  battle.enemy.forEach((unit) => drawUnit(unit, width - width * 0.13 - 240, height * 0.34 + unit.lane * 108, false));
  drawText(`Rome ${Math.round(total(battle.rome))} · morale ${Math.round(avg(battle.rome, "morale"))}`, width * 0.13, height - 60, "left", 14);
  drawText(`Enemy ${Math.round(total(battle.enemy))} · morale ${Math.round(avg(battle.enemy, "morale"))}`, width * 0.87, height - 60, "right", 14);
}

function draw() { resize(); ctx.clearRect(0, 0, width, height); state.mode === "battle" ? drawBattle() : drawCampaign(); }

function updateHud() {
  commandBar.hidden = state.mode !== "battle";
  if (state.mode === "battle") {
    const unit = state.battle.rome.find((item) => item.type === state.selectedUnit);
    statusEl.textContent = `${state.battle.name}: select a Roman formation and issue posture orders.`;
    readoutEl.textContent = `${troopTypes[state.selectedUnit].label}: ${unit.order}, strength ${Math.round(unit.strength)}, morale ${Math.round(unit.morale)}, cohesion ${Math.round(unit.cohesion)}. ${state.log[0]}`;
    for (const button of commandBar.querySelectorAll("button")) button.disabled = !unit || unit.cooldown > 0;
    return;
  }
  const selected = loc(state.selected);
  const move = state.moving ? `Marching to ${loc(state.moving.to).name}: ${Math.round(state.moving.progress * 100)}%.` : `At ${loc(state.army.location).name}.`;
  statusEl.textContent = `${move} Army L ${state.army.troops.light} · M ${state.army.troops.medium} · H ${state.army.troops.heavy}. Morale ${Math.round(state.army.morale)} · Supplies ${Math.round(state.army.supplies)}.`;
  readoutEl.textContent = `${selected.name} · ${terrain[selected.terrain].label}${selected.enemy && !state.cleared.has(selected.id) ? " · hostile" : ""}. ${selected.note} ${state.log[0]}`;
}

function hitLocation(x, y) {
  let best = null; let bestDistance = Infinity;
  for (const location of locations) {
    const p = point(location); const distance = Math.hypot(p.x - x, p.y - y);
    if (distance < bestDistance) { best = location; bestDistance = distance; }
  }
  return bestDistance <= 34 ? best : null;
}

canvas.addEventListener("pointerdown", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) * ratio;
  const y = (event.clientY - rect.top) * ratio;
  if (state.mode === "battle") {
    for (const unit of state.battle.rome) {
      const ux = width * 0.13;
      const uy = height * 0.34 + unit.lane * 108;
      if (x >= ux && x <= ux + 240 && y >= uy && y <= uy + 88) state.selectedUnit = unit.type;
    }
    return;
  }
  const target = hitLocation(x, y);
  if (!target) return;
  state.selected = target.id;
  if (!state.moving && target.id !== state.army.location && neighbors[state.army.location].includes(target.id)) {
    state.moving = { from: state.army.location, to: target.id, progress: 0 };
    log(`Marching from ${loc(state.army.location).name} to ${target.name}.`);
  }
});

for (const command of commands) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = command;
  button.addEventListener("click", () => commandUnit(command));
  commandBar.append(button);
}

window.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "r") location.reload();
});

window.GameHost = {
  title: "The Cavalry of Rome",
  getSnapshot: () => ({ mode: state.mode, army: state.army, selected: state.selected, moving: state.moving, battle: state.battle, log: state.log }),
  issueCommand: commandUnit
};

resize();
updateHud();
requestAnimationFrame(tick);

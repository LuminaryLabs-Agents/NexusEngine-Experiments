const ROLL_CONTROLLER_STYLE = "roll-in-place-tactical-controller";
const HEX_GRID = Object.freeze({ cols: 11, rows: 9 });
const HEX_Y_SCALE = 0.72;
const SQRT3 = Math.sqrt(3);
const TAU = Math.PI * 2;
const CLASS_COLORS = Object.freeze({ light: "#3fad4f", medium: "#2f70d1", heavy: "#b93026" });
const BAND_COLORS = Object.freeze({ rome: "#c8231f", etruscan: "#d6aa3c", samnite: "#f0e6cf", greek: "#7a54bd", gallic: "#111318" });
const TERRAIN = Object.freeze({ grass: "grass", water: "water", hill: "hill", fence: "fence" });

const MANEUVERS = Object.freeze({
  advanceLeft: { id: "advanceLeft", label: "Advance Left", cost: 1, kind: "advance", section: "left" },
  advanceCenter: { id: "advanceCenter", label: "Advance Center", cost: 1, kind: "advance", section: "center" },
  advanceRight: { id: "advanceRight", label: "Advance Right", cost: 1, kind: "advance", section: "right" },
  lineBrigade: { id: "lineBrigade", label: "Line Brigade", cost: 2, kind: "lineBrigade" },
  heavyBrigade: { id: "heavyBrigade", label: "Heavy Brigade", cost: 3, kind: "heavyBrigade" },
  berserk: { id: "berserk", label: "Berserk", cost: 4, kind: "berserk" },
  scout: { id: "scout", label: "Scout", cost: 4, kind: "scout" }
});

const KEY_TO_MANEUVER = Object.freeze({ "1": "advanceLeft", "2": "advanceCenter", "3": "advanceRight", "4": "lineBrigade", "5": "heavyBrigade", "6": "berserk", "7": "scout" });

const state = {
  initialized: false,
  regionId: null,
  turn: 1,
  actionPoints: 0,
  activeManeuver: null,
  phase: "idle",
  remainingMoves: 0,
  selectedUnitId: null,
  selectedGroupIds: new Set(),
  movedUnitIds: new Set(),
  reachable: [],
  attackTargets: [],
  hoveredHexId: null,
  hoveredUnitId: null,
  lastAttack: null,
  dice: { faces: [], reason: "", startedAt: 0, duration: 1350, active: false }
};

let canvas = null;
let ctx = null;
let cachedField = null;
let cachedRegionId = null;
let patchAttempts = 0;

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));

function randomUint32() {
  if (globalThis.crypto?.getRandomValues) {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return buffer[0];
  }
  return Math.floor(Math.random() * 0x100000000);
}

function rollDie() {
  const max = 0xffffffff - (0xffffffff % 6);
  let value = randomUint32();
  while (value >= max) value = randomUint32();
  return (value % 6) + 1;
}

function showDice(faces, reason) {
  state.dice = { faces, reason, startedAt: performance.now(), duration: reason === "actionPoints" ? 1750 : 1250, active: true };
}

function rollActionPointsInPlace() {
  if (state.activeManeuver) return false;
  const a = rollDie();
  const b = rollDie();
  state.actionPoints = a + b;
  state.phase = "idle";
  state.selectedUnitId = null;
  state.reachable = [];
  state.attackTargets = [];
  showDice([a, b], "actionPoints");
  return { faces: [a, b], total: state.actionPoints };
}

function enemyBandForRegion(regionId = "") {
  if (regionId.includes("etruria")) return BAND_COLORS.etruscan;
  if (regionId.includes("samnium")) return BAND_COLORS.samnite;
  if (regionId.includes("graecia") || regionId.includes("campania")) return BAND_COLORS.greek;
  if (regionId.includes("cisalpine")) return BAND_COLORS.gallic;
  return "#d6aa3c";
}

function createUnit(id, army, troopType, col, row, facing = "north", bandColor = BAND_COLORS.rome) {
  return { id, army, troopType, col, row, facing, bandColor, bodyColor: CLASS_COLORS[troopType] };
}

function fallbackUnits(regionId) {
  const enemyBand = enemyBandForRegion(regionId);
  return [
    createUnit("rome-medium-fl", "rome", "medium", 2, 6), createUnit("rome-light-c1", "rome", "light", 4, 6), createUnit("rome-light-c2", "rome", "light", 5, 6), createUnit("rome-light-c3", "rome", "light", 6, 6), createUnit("rome-medium-fr", "rome", "medium", 8, 6),
    createUnit("rome-medium-l", "rome", "medium", 3, 7), createUnit("rome-light-r", "rome", "light", 5, 7), createUnit("rome-medium-r", "rome", "medium", 7, 7), createUnit("rome-heavy-bl", "rome", "heavy", 2, 8), createUnit("rome-heavy-bc", "rome", "heavy", 5, 8), createUnit("rome-heavy-br", "rome", "heavy", 8, 8), createUnit("rome-light-reserve", "rome", "light", 5, 5),
    createUnit("enemy-light-l", "enemy", "light", 3, 2, "south", enemyBand), createUnit("enemy-medium-l", "enemy", "medium", 4, 2, "south", enemyBand), createUnit("enemy-medium-c", "enemy", "medium", 5, 2, "south", enemyBand), createUnit("enemy-medium-r", "enemy", "medium", 6, 2, "south", enemyBand), createUnit("enemy-light-r", "enemy", "light", 7, 2, "south", enemyBand), createUnit("enemy-light-screen-l", "enemy", "light", 4, 1, "south", enemyBand), createUnit("enemy-light-screen-r", "enemy", "light", 6, 1, "south", enemyBand), createUnit("enemy-heavy-l", "enemy", "heavy", 3, 3, "south", enemyBand), createUnit("enemy-heavy-r", "enemy", "heavy", 7, 3, "south", enemyBand), createUnit("enemy-medium-reserve", "enemy", "medium", 5, 3, "south", enemyBand)
  ];
}

function terrainForFallback(col, row) {
  const value = Math.sin(col * 12.7 + row * 45.3) * 43758.5453;
  const f = value - Math.floor(value);
  if (f > 0.88 && row > 1 && row < 7) return TERRAIN.water;
  if (f > 0.68) return TERRAIN.hill;
  if ((row === 3 || row === 5) && f > 0.42 && f < 0.6) return TERRAIN.fence;
  return TERRAIN.grass;
}

function fallbackTiles() {
  const tiles = [];
  for (let row = 0; row < HEX_GRID.rows; row += 1) {
    for (let col = 0; col < HEX_GRID.cols; col += 1) tiles.push({ id: `h-${col}-${row}`, col, row, terrainType: terrainForFallback(col, row) });
  }
  return tiles;
}

function getField(snapshot = {}) {
  const direct = globalThis.GameHost?.getHexBattlefieldSnapshot?.();
  if (direct?.units?.length && direct?.tiles?.length) return direct;
  const regionId = snapshot.selectedRegionId ?? snapshot.hoveredRegionId ?? "latium";
  if (!cachedField || cachedRegionId !== regionId) {
    cachedField = { id: `roll-controller-${regionId}`, regionId, units: fallbackUnits(regionId), tiles: fallbackTiles(), cols: HEX_GRID.cols, rows: HEX_GRID.rows };
    cachedRegionId = regionId;
  }
  return cachedField;
}

function ensureCanvas() {
  if (canvas) return canvas;
  canvas = document.createElement("canvas");
  canvas.id = "cavalry-roll-controller-canvas";
  Object.assign(canvas.style, { position: "fixed", inset: "0", width: "100%", height: "100%", zIndex: "12", pointerEvents: "none", display: "none" });
  document.querySelector("#app")?.append(canvas);
  ctx = canvas.getContext("2d");
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerdown", onPointerDown);
  return canvas;
}

function resize() {
  ensureCanvas();
  const ratio = Math.max(1, Math.min(2, devicePixelRatio || 1));
  const w = Math.max(1, Math.floor(canvas.clientWidth * ratio));
  const h = Math.max(1, Math.floor(canvas.clientHeight * ratio));
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  return { w, h, ratio };
}

function boardMetrics(size) {
  const usableW = size.w * 0.88;
  const usableH = size.h * 0.80;
  const rByW = usableW / (SQRT3 * (HEX_GRID.cols + 0.5));
  const rByH = usableH / (HEX_Y_SCALE * (1.5 * (HEX_GRID.rows - 1) + 2));
  const r = Math.min(rByW, rByH);
  const boardW = SQRT3 * r * (HEX_GRID.cols + 0.5);
  const boardH = HEX_Y_SCALE * r * (1.5 * (HEX_GRID.rows - 1) + 2);
  return { r, originX: (size.w - boardW) * 0.5 + SQRT3 * r * 0.5, originY: size.h * 0.06 + Math.max(0, usableH - boardH) * 0.08, yScale: HEX_Y_SCALE };
}

function projectHex(col, row, size) {
  const m = boardMetrics(size);
  return { x: m.originX + SQRT3 * m.r * (col + (row % 2 ? 0.5 : 0)), y: m.originY + m.yScale * m.r * (1 + row * 1.5), r: m.r, yScale: m.yScale };
}

function nearestHex(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const size = { w: canvas.width, h: canvas.height };
  const x = (clientX - rect.left) * (canvas.width / Math.max(1, rect.width));
  const y = (clientY - rect.top) * (canvas.height / Math.max(1, rect.height));
  let best = null;
  let bestD = Infinity;
  for (let row = 0; row < HEX_GRID.rows; row += 1) {
    for (let col = 0; col < HEX_GRID.cols; col += 1) {
      const p = projectHex(col, row, size);
      const d = Math.hypot((x - p.x), (y - p.y) / p.yScale) / Math.max(1, p.r);
      if (d < bestD) { best = { col, row, id: `h-${col}-${row}` }; bestD = d; }
    }
  }
  return bestD < 0.94 ? best : null;
}

function tileAt(field, col, row) { return field.tiles?.find((tile) => tile.col === col && tile.row === row) ?? null; }
function unitAt(field, col, row) { return field.units?.find((unit) => unit.col === col && unit.row === row && !unit.routed) ?? null; }
function unitById(field, id) { return field.units?.find((unit) => unit.id === id) ?? null; }
function isRomeUnit(unit) { return unit?.army === "rome" && !unit.routed; }
function isWater(tile) { return tile?.terrainType === TERRAIN.water || tile?.label === TERRAIN.water; }
function isStopTerrain(tile) { return tile?.terrainType === TERRAIN.hill || tile?.terrainType === TERRAIN.fence || tile?.label === TERRAIN.hill || tile?.label === TERRAIN.fence; }
function inBounds(col, row) { return col >= 0 && col < HEX_GRID.cols && row >= 0 && row < HEX_GRID.rows; }
function sectionForCol(col) { if (col <= 3) return "left"; if (col >= 7) return "right"; return "center"; }
function isOccupied(field, col, row) { return Boolean(unitAt(field, col, row)); }

function neighbors(col, row) {
  const odd = row % 2 === 1;
  const dirs = odd ? [[1, 0], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1]] : [[1, 0], [1, 1], [0, 1], [-1, 0], [0, -1], [1, -1]];
  return dirs.map(([dc, dr]) => ({ col: col + dc, row: row + dr })).filter((hex) => inBounds(hex.col, hex.row));
}

function maxMoveFor(unit, maneuver) {
  if (maneuver?.kind === "scout") return 3;
  if (maneuver?.kind === "berserk") return 2;
  return unit?.troopType === "light" ? 2 : 1;
}

function reachableHexes(field, unit, maxSteps) {
  const seen = new Set([`${unit.col},${unit.row}`]);
  const queue = [{ col: unit.col, row: unit.row, steps: 0 }];
  const result = [];
  while (queue.length) {
    const current = queue.shift();
    const currentTile = tileAt(field, current.col, current.row);
    if (current.steps >= maxSteps || (current.steps > 0 && isStopTerrain(currentTile))) continue;
    for (const next of neighbors(current.col, current.row)) {
      const key = `${next.col},${next.row}`;
      if (seen.has(key)) continue;
      const tile = tileAt(field, next.col, next.row);
      if (!tile || isWater(tile) || isOccupied(field, next.col, next.row)) continue;
      const entry = { ...next, id: `h-${next.col}-${next.row}`, steps: current.steps + 1 };
      seen.add(key);
      result.push(entry);
      queue.push(entry);
    }
  }
  return result;
}

function adjacentEnemies(field, unit) {
  return neighbors(unit.col, unit.row).map((hex) => unitAt(field, hex.col, hex.row)).filter((target) => target?.army === "enemy" && !target.routed);
}

function connectedLineGroup(field, seedUnit) {
  const group = [];
  const seen = new Set();
  const queue = [seedUnit];
  while (queue.length && group.length < 7) {
    const unit = queue.shift();
    if (!isRomeUnit(unit) || seen.has(unit.id)) continue;
    seen.add(unit.id);
    group.push(unit);
    for (const hex of neighbors(unit.col, unit.row)) {
      const adjacent = unitAt(field, hex.col, hex.row);
      if (isRomeUnit(adjacent) && !seen.has(adjacent.id)) queue.push(adjacent);
    }
  }
  return group;
}

function resetForRegion(regionId) {
  state.initialized = true;
  state.regionId = regionId;
  state.turn = 1;
  state.activeManeuver = null;
  state.phase = "idle";
  state.remainingMoves = 0;
  state.selectedUnitId = null;
  state.selectedGroupIds = new Set();
  state.movedUnitIds = new Set();
  state.reachable = [];
  state.attackTargets = [];
  rollActionPointsInPlace();
}

function eligibleUnits(field) {
  const m = state.activeManeuver;
  if (!m) return field.units.filter(isRomeUnit);
  if (m.kind === "advance") return field.units.filter((u) => isRomeUnit(u) && sectionForCol(u.col) === m.section && !state.movedUnitIds.has(u.id));
  if (m.kind === "heavyBrigade") return field.units.filter((u) => isRomeUnit(u) && u.troopType === "heavy" && !state.movedUnitIds.has(u.id));
  if (m.kind === "lineBrigade") return field.units.filter((u) => isRomeUnit(u) && (state.selectedGroupIds.size ? state.selectedGroupIds.has(u.id) : true) && !state.movedUnitIds.has(u.id));
  return field.units.filter((u) => isRomeUnit(u) && !state.movedUnitIds.has(u.id));
}

function startManeuver(id, field = getField(globalThis.GameHost?.getSnapshot?.() ?? {})) {
  const maneuver = MANEUVERS[id];
  if (!maneuver || !field || state.activeManeuver || state.actionPoints < maneuver.cost) return false;
  state.actionPoints -= maneuver.cost;
  state.activeManeuver = maneuver;
  state.phase = maneuver.kind === "lineBrigade" ? "pickLine" : "pickUnit";
  state.remainingMoves = maneuver.kind === "advance" ? rollDie() : 1;
  state.selectedUnitId = null;
  state.selectedGroupIds = maneuver.kind === "heavyBrigade" ? new Set(field.units.filter((u) => isRomeUnit(u) && u.troopType === "heavy").map((u) => u.id)) : new Set();
  state.movedUnitIds = new Set();
  state.reachable = [];
  state.attackTargets = [];
  if (maneuver.kind === "advance") showDice([state.remainingMoves], maneuver.id);
  return true;
}

function completeManeuver() {
  state.activeManeuver = null;
  state.phase = "idle";
  state.remainingMoves = 0;
  state.selectedUnitId = null;
  state.selectedGroupIds = new Set();
  state.movedUnitIds = new Set();
  state.reachable = [];
  state.attackTargets = [];
  state.turn += 1;
  if ((state.turn - 1) % 3 === 0) rollActionPointsInPlace();
}

function cancelSelectionOnly() {
  state.phase = state.activeManeuver ? (state.activeManeuver.kind === "lineBrigade" && !state.selectedGroupIds.size ? "pickLine" : "pickUnit") : "idle";
  state.selectedUnitId = null;
  state.reachable = [];
  state.attackTargets = [];
}

function selectUnit(field, unit) {
  if (!isRomeUnit(unit)) return false;
  if (!state.activeManeuver) return false;
  if (state.activeManeuver.kind === "lineBrigade" && !state.selectedGroupIds.size) state.selectedGroupIds = new Set(connectedLineGroup(field, unit).map((u) => u.id));
  if (!eligibleUnits(field).some((u) => u.id === unit.id)) return false;
  state.selectedUnitId = unit.id;
  state.phase = "move";
  state.reachable = reachableHexes(field, unit, maxMoveFor(unit, state.activeManeuver));
  state.attackTargets = [];
  return true;
}

function moveSelected(field, target) {
  const unit = unitById(field, state.selectedUnitId);
  if (!unit || !state.reachable.some((hex) => hex.col === target.col && hex.row === target.row)) return false;
  unit.col = target.col;
  unit.row = target.row;
  state.movedUnitIds.add(unit.id);
  state.reachable = [];
  if (state.activeManeuver?.kind === "berserk") {
    const targets = adjacentEnemies(field, unit);
    if (targets.length) {
      state.phase = "attack";
      state.attackTargets = targets.map((enemy) => ({ id: enemy.id, col: enemy.col, row: enemy.row }));
      return true;
    }
  }
  if (isStopTerrain(tileAt(field, target.col, target.row))) { completeManeuver(); return true; }
  if (state.activeManeuver?.kind === "advance") {
    state.remainingMoves -= 1;
    if (state.remainingMoves <= 0) completeManeuver(); else cancelSelectionOnly();
    return true;
  }
  if (state.activeManeuver?.kind === "scout" || !eligibleUnits(field).length) completeManeuver(); else cancelSelectionOnly();
  return true;
}

function attackTarget(field, unit) {
  if (!unit || unit.army !== "enemy" || !state.attackTargets.some((target) => target.id === unit.id)) return false;
  unit.disrupted = true;
  state.lastAttack = { attackerId: state.selectedUnitId, targetId: unit.id, turn: state.turn };
  completeManeuver();
  return true;
}

function onPointerMove(event) {
  const snapshot = globalThis.GameHost?.getSnapshot?.() ?? {};
  if (snapshot.mode !== "battlefield") return;
  const field = getField(snapshot);
  const hex = nearestHex(event.clientX, event.clientY);
  const unit = hex ? unitAt(field, hex.col, hex.row) : null;
  state.hoveredHexId = hex?.id ?? null;
  state.hoveredUnitId = unit?.army === "rome" ? unit.id : null;
}

function onPointerDown(event) {
  const snapshot = globalThis.GameHost?.getSnapshot?.() ?? {};
  if (snapshot.mode !== "battlefield") return;
  const field = getField(snapshot);
  const hex = nearestHex(event.clientX, event.clientY);
  if (!hex) return;
  const unit = unitAt(field, hex.col, hex.row);
  if (state.phase === "attack" && unit?.army === "enemy") { attackTarget(field, unit); return; }
  if (state.selectedUnitId && state.reachable.some((target) => target.col === hex.col && target.row === hex.row)) { moveSelected(field, hex); return; }
  if (unit?.army === "rome") selectUnit(field, unit);
}

function squadLayout(unit) {
  if (unit.troopType === "heavy") return [[-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [-1.5, 1], [-0.5, 1], [0.5, 1], [1.5, 1]];
  if (unit.troopType === "medium") return [[-1.5, 0], [-0.5, 0], [0.5, 0], [1.5, 0], [-1, 1], [0, 1], [1, 1]];
  return [[-1, 0], [0, 0], [1, 0], [-0.5, 1], [0.5, 1]];
}

function drawDirectionalShadow(x, y, s, yScale) {
  ctx.fillStyle = "rgba(0,0,0,0.20)";
  ctx.beginPath();
  ctx.moveTo(x - s * 0.22, y + s * 0.35 * yScale);
  ctx.lineTo(x + s * 0.12, y + s * 0.42 * yScale);
  ctx.lineTo(x + s * 0.76, y + s * 0.20 * yScale);
  ctx.lineTo(x + s * 0.42, y + s * 0.10 * yScale);
  ctx.closePath();
  ctx.fill();
}

function drawLowPolySoldier(x, y, s, unit, yScale, index) {
  drawDirectionalShadow(x, y, s, yScale);
  const armor = unit.troopType === "heavy" ? "#b9af93" : unit.troopType === "medium" ? "#878d96" : "#7a6b59";
  const shieldW = unit.troopType === "heavy" ? s * 0.30 : unit.troopType === "medium" ? s * 0.24 : s * 0.18;
  const shieldH = unit.troopType === "heavy" ? s * 0.42 : unit.troopType === "medium" ? s * 0.34 : s * 0.24;
  ctx.save();
  if (unit.troopType !== "light" || index % 2 === 0) {
    ctx.strokeStyle = "#7b5a33";
    ctx.lineWidth = Math.max(1, s * 0.08);
    ctx.beginPath(); ctx.moveTo(x + s * 0.28, y - s * 0.02); ctx.lineTo(x + s * 0.34, y - s); ctx.stroke();
  }
  ctx.fillStyle = "#493225";
  for (const side of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + side * s * 0.15, y + s * 0.36 * yScale); ctx.lineTo(x + side * s * 0.04, y + s * 0.02 * yScale); ctx.lineTo(x - side * s * 0.03, y + s * 0.36 * yScale); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = unit.bodyColor;
  ctx.beginPath(); ctx.moveTo(x - s * 0.25, y - s * 0.02); ctx.lineTo(x + s * 0.25, y - s * 0.02); ctx.lineTo(x + s * 0.17, y - s * 0.50); ctx.lineTo(x - s * 0.17, y - s * 0.50); ctx.closePath(); ctx.fill();
  ctx.fillStyle = unit.bandColor; ctx.fillRect(x - s * 0.23, y - s * 0.28, s * 0.46, s * 0.10);
  ctx.fillStyle = armor;
  ctx.beginPath(); ctx.moveTo(x - s * 0.28, y - s * 0.08); ctx.lineTo(x - s * 0.28 - shieldW * 0.44, y - shieldH * 0.15); ctx.lineTo(x - s * 0.28 - shieldW * 0.36, y - shieldH * 0.88); ctx.lineTo(x - s * 0.14, y - shieldH); ctx.lineTo(x - s * 0.02, y - shieldH * 0.82); ctx.lineTo(x - s * 0.06, y - s * 0.06); ctx.closePath(); ctx.fill();
  ctx.fillStyle = unit.bandColor; ctx.fillRect(x - s * 0.28, y - shieldH * 0.68, shieldW * 0.50, s * 0.06);
  ctx.fillStyle = "#d2b38a"; ctx.beginPath(); ctx.arc(x, y - s * 0.64, s * 0.12, 0, TAU); ctx.fill();
  ctx.fillStyle = armor; ctx.beginPath(); ctx.moveTo(x - s * 0.16, y - s * 0.68); ctx.lineTo(x + s * 0.16, y - s * 0.68); ctx.lineTo(x + s * 0.10, y - s * 0.84); ctx.lineTo(x - s * 0.10, y - s * 0.84); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawSquad(unit, size) {
  const p = projectHex(unit.col, unit.row, size);
  const layout = squadLayout(unit);
  const selected = state.selectedUnitId === unit.id;
  const hovered = state.hoveredUnitId === unit.id;
  const scale = p.r * (unit.troopType === "heavy" ? 0.23 : unit.troopType === "medium" ? 0.20 : 0.18);
  const lift = selected ? -p.r * 0.06 : hovered ? -p.r * 0.028 : 0;
  ctx.save();
  ctx.filter = selected ? "brightness(1.16) saturate(1.08)" : hovered ? "brightness(1.06)" : "none";
  for (let i = 0; i < layout.length; i += 1) {
    const [lx, ly] = layout[i];
    const x = p.x + lx * scale * 1.62;
    const y = p.y + ly * scale * p.yScale * 1.70 - scale * 0.20 + lift;
    drawLowPolySoldier(x, y, scale, unit, p.yScale, i);
    if (i === Math.floor(layout.length / 2) && (selected || hovered)) drawPennant(x + scale * 0.46, y - scale * 0.10, scale, unit, selected);
  }
  ctx.restore();
}

function drawPennant(x, y, s, unit, selected) {
  ctx.save(); ctx.globalAlpha = selected ? 0.95 : 0.68; ctx.strokeStyle = unit.bandColor; ctx.lineWidth = Math.max(1, s * 0.10); ctx.beginPath(); ctx.moveTo(x, y - s * 1.35); ctx.lineTo(x, y - s * 2.10); ctx.stroke(); ctx.fillStyle = unit.bandColor; ctx.beginPath(); ctx.moveTo(x, y - s * 2.08); ctx.lineTo(x + s * 0.55, y - s * 1.92); ctx.lineTo(x, y - s * 1.76); ctx.closePath(); ctx.fill(); ctx.restore();
}

function drawHexPath(p, scale = 0.94) {
  ctx.beginPath();
  for (let i = 0; i < 6; i += 1) {
    const a = Math.PI / 6 + i * TAU / 6;
    const x = p.x + Math.cos(a) * p.r * scale;
    const y = p.y + Math.sin(a) * p.r * p.yScale * scale;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawHighlights(field, size) {
  for (const unit of eligibleUnits(field)) { const p = projectHex(unit.col, unit.row, size); drawHexPath(p, 0.96); ctx.strokeStyle = "rgba(246,211,112,.74)"; ctx.lineWidth = Math.max(2, p.r * 0.035); ctx.stroke(); }
  for (const hex of state.reachable) { const p = projectHex(hex.col, hex.row, size); drawHexPath(p, 0.92); ctx.fillStyle = "rgba(86,211,122,.24)"; ctx.fill(); ctx.strokeStyle = "rgba(126,244,154,.86)"; ctx.lineWidth = 2; ctx.stroke(); }
  for (const target of state.attackTargets) { const p = projectHex(target.col, target.row, size); drawHexPath(p, 0.92); ctx.fillStyle = "rgba(214,58,49,.30)"; ctx.fill(); ctx.strokeStyle = "rgba(255,95,72,.92)"; ctx.lineWidth = 3; ctx.stroke(); }
}

function drawDice(size) {
  if (!state.dice.active) return;
  const age = performance.now() - state.dice.startedAt;
  const alpha = clamp(1 - age / state.dice.duration, 0, 1);
  if (alpha <= 0) { state.dice.active = false; return; }
  ctx.save(); ctx.globalAlpha = alpha;
  state.dice.faces.forEach((face, i) => {
    const s = Math.min(size.w, size.h) * 0.080;
    const x = size.w * (state.dice.faces.length === 1 ? 0.50 : i === 0 ? 0.43 : 0.57);
    const y = size.h * 0.42;
    const g = ctx.createLinearGradient(x - s, y - s, x + s, y + s);
    g.addColorStop(0, "#e16443"); g.addColorStop(0.55, "#a52218"); g.addColorStop(1, "#43100d");
    ctx.fillStyle = g; ctx.strokeStyle = "rgba(255,220,142,.88)"; ctx.lineWidth = Math.max(2, s * 0.05); ctx.beginPath(); ctx.roundRect(x - s, y - s, s * 2, s * 2, s * 0.22); ctx.fill(); ctx.stroke(); drawPips(x, y, s, face);
  });
  ctx.restore();
}

function drawPips(x, y, s, face) {
  const spots = { 1:[[0,0]], 2:[[-.34,-.34],[.34,.34]], 3:[[-.34,-.34],[0,0],[.34,.34]], 4:[[-.34,-.34],[.34,.34],[-.34,.34],[.34,-.34]], 5:[[-.34,-.34],[.34,.34],[-.34,.34],[.34,-.34],[0,0]], 6:[[-.34,-.34],[.34,.34],[-.34,.34],[.34,-.34],[-.34,0],[.34,0]] }[face] ?? [];
  ctx.fillStyle = "#1a0b08"; for (const [dx, dy] of spots) { ctx.beginPath(); ctx.arc(x + dx * s, y + dy * s, s * 0.075, 0, TAU); ctx.fill(); }
}

function hideOlderLayers() { for (const id of ["#cavalry-hex-gameplay-canvas", "#cavalry-webgl-dice-canvas", "#cavalry-hex-squad-canvas", "#cavalry-hex-unit-canvas"]) { const node = document.querySelector(id); if (node) { node.style.opacity = "0"; node.style.pointerEvents = "none"; } } }

function frame() {
  ensureCanvas(); hideOlderLayers();
  const snapshot = globalThis.GameHost?.getSnapshot?.() ?? {};
  const active = snapshot.mode === "battlefield";
  canvas.style.display = active ? "block" : "none";
  canvas.style.pointerEvents = active ? "auto" : "none";
  if (active) {
    const field = getField(snapshot);
    if (!state.initialized || state.regionId !== field.regionId) resetForRegion(field.regionId ?? "latium");
    const size = resize(); ctx.clearRect(0, 0, size.w, size.h); drawHighlights(field, size); field.units.filter((u) => !u.routed).sort((a,b) => a.row - b.row || a.col - b.col).forEach((u) => drawSquad(u, size)); drawDice(size);
  }
  requestAnimationFrame(frame);
}

function handleKey(event) {
  const snapshot = globalThis.GameHost?.getSnapshot?.() ?? {};
  if (snapshot.mode !== "battlefield") return;
  if (event.key === "0" || event.key.toLowerCase() === "r") { event.preventDefault(); rollActionPointsInPlace(); return; }
  const id = KEY_TO_MANEUVER[event.key];
  if (id) { event.preventDefault(); startManeuver(id, getField(snapshot)); }
  if (event.key === "Escape") { event.preventDefault(); cancelSelectionOnly(); }
}

function patchGameHost() {
  const host = globalThis.GameHost;
  if (!host || host.__cavalryRollControllerPatched) return false;
  const originalSnapshot = typeof host.getSnapshot === "function" ? host.getSnapshot.bind(host) : () => ({});
  host.getSnapshot = () => {
    const snapshot = originalSnapshot() ?? {};
    return { ...snapshot, tacticalGameplay: getTacticalSnapshot() };
  };
  host.getTacticalGameplaySnapshot = getTacticalSnapshot;
  host.startManeuver = (id) => startManeuver(id, getField(originalSnapshot() ?? {}));
  host.rollActionPointsInPlace = rollActionPointsInPlace;
  host.__cavalryRollControllerPatched = true;
  return true;
}

function getTacticalSnapshot() {
  return { style: ROLL_CONTROLLER_STYLE, turn: state.turn, actionPoints: state.actionPoints, activeManeuver: state.activeManeuver?.id ?? null, phase: state.phase, remainingMoves: state.remainingMoves, selectedUnitId: state.selectedUnitId, hoveredUnitId: state.hoveredUnitId, hoveredHexId: state.hoveredHexId, reachable: state.reachable.map((h) => ({ col: h.col, row: h.row, steps: h.steps })), attackTargets: state.attackTargets, lastAttack: state.lastAttack, dice: { faces: state.dice.faces, reason: state.dice.reason, active: state.dice.active }, canRollInPlace: !state.activeManeuver, maneuvers: Object.values(MANEUVERS).map(({ id, label, cost, kind, section }) => ({ id, label, cost, kind, section })) };
}

function boot() {
  globalThis.CavalryRollController = { style: ROLL_CONTROLLER_STYLE, rollActionPointsInPlace, startManeuver, getState: getTacticalSnapshot };
  window.addEventListener("keydown", handleKey);
  const timer = setInterval(() => { if (patchGameHost()) clearInterval(timer); patchAttempts += 1; if (patchAttempts > 240) clearInterval(timer); }, 100);
  ensureCanvas(); requestAnimationFrame(frame);
}

boot();

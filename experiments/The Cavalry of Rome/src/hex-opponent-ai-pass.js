const AI_CONTROLLER_STYLE = "rag-onnx-opponent-counterplay-controller";
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

const enemyPolicy = {
  requested: "rag-onnx-enemy-policy",
  modelUrl: "./models/cavalry-enemy-policy.onnx",
  runtime: "rag-memory-fallback",
  status: "onnx-runtime-or-model-not-loaded",
  memory: [
    "Counter advances by sliding toward the active third.",
    "Prefer flanks when Rome leaves a weak side.",
    "Use hills and fences as anchors, but avoid water.",
    "Sometimes make a non-optimal lateral move so the opponent feels human."
  ],
  recentTurns: []
};

const state = {
  initialized: false,
  regionId: null,
  turn: 1,
  side: "player",
  actionPoints: 0,
  activeManeuver: null,
  phase: "idle",
  remainingMoves: 0,
  selectedUnitId: null,
  selectedGroupIds: new Set(),
  originalLineIds: new Set(),
  movedUnitIds: new Set(),
  reachable: [],
  attackTargets: [],
  hoveredHexId: null,
  hoveredUnitId: null,
  lastPlayerManeuver: null,
  lastEnemyPlan: null,
  enemyIntent: [],
  lastAttack: null,
  dice: { faces: [], reason: "", startedAt: 0, duration: 3000, active: false }
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

function random01() { return randomUint32() / 0x100000000; }

function rollDie() {
  const range = 0x100000000;
  const limit = range - (range % 6);
  let value = randomUint32();
  while (value >= limit) value = randomUint32();
  return (value % 6) + 1;
}

function showDice(faces, reason) {
  state.dice = { faces, reason, startedAt: performance.now(), duration: reason === "actionPoints" ? 3200 : 2600, active: true };
}

function rollActionPointsInPlace() {
  if (state.activeManeuver || state.side !== "player") return false;
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
function createUnit(id, army, troopType, col, row, facing = "north", bandColor = BAND_COLORS.rome) { return { id, army, troopType, col, row, facing, bandColor, bodyColor: CLASS_COLORS[troopType] }; }
function fallbackUnits(regionId) {
  const enemyBand = enemyBandForRegion(regionId);
  return [
    createUnit("rome-medium-fl", "rome", "medium", 2, 6), createUnit("rome-light-c1", "rome", "light", 4, 6), createUnit("rome-light-c2", "rome", "light", 5, 6), createUnit("rome-light-c3", "rome", "light", 6, 6), createUnit("rome-medium-fr", "rome", "medium", 8, 6), createUnit("rome-medium-l", "rome", "medium", 3, 7), createUnit("rome-light-r", "rome", "light", 5, 7), createUnit("rome-medium-r", "rome", "medium", 7, 7), createUnit("rome-heavy-bl", "rome", "heavy", 2, 8), createUnit("rome-heavy-bc", "rome", "heavy", 5, 8), createUnit("rome-heavy-br", "rome", "heavy", 8, 8), createUnit("rome-light-reserve", "rome", "light", 5, 5),
    createUnit("enemy-light-l", "enemy", "light", 3, 2, "south", enemyBand), createUnit("enemy-medium-l", "enemy", "medium", 4, 2, "south", enemyBand), createUnit("enemy-medium-c", "enemy", "medium", 5, 2, "south", enemyBand), createUnit("enemy-medium-r", "enemy", "medium", 6, 2, "south", enemyBand), createUnit("enemy-light-r", "enemy", "light", 7, 2, "south", enemyBand), createUnit("enemy-light-screen-l", "enemy", "light", 4, 1, "south", enemyBand), createUnit("enemy-light-screen-r", "enemy", "light", 6, 1, "south", enemyBand), createUnit("enemy-heavy-l", "enemy", "heavy", 3, 3, "south", enemyBand), createUnit("enemy-heavy-r", "enemy", "heavy", 7, 3, "south", enemyBand), createUnit("enemy-medium-reserve", "enemy", "medium", 5, 3, "south", enemyBand)
  ];
}
function terrainForFallback(col, row) { const n = Math.sin(col * 12.7 + row * 45.3) * 43758.5453; const f = n - Math.floor(n); if (f > 0.88 && row > 1 && row < 7) return TERRAIN.water; if (f > 0.68) return TERRAIN.hill; if ((row === 3 || row === 5) && f > 0.42 && f < 0.6) return TERRAIN.fence; return TERRAIN.grass; }
function fallbackTiles() { const tiles = []; for (let row = 0; row < HEX_GRID.rows; row += 1) for (let col = 0; col < HEX_GRID.cols; col += 1) tiles.push({ id: `h-${col}-${row}`, col, row, terrainType: terrainForFallback(col, row) }); return tiles; }
function getField(snapshot = {}) {
  const direct = globalThis.GameHost?.getHexBattlefieldSnapshot?.();
  if (direct?.units?.length && direct?.tiles?.length) return direct;
  const regionId = snapshot.selectedRegionId ?? snapshot.hoveredRegionId ?? "latium";
  if (!cachedField || cachedRegionId !== regionId) { cachedField = { id: `opponent-ai-${regionId}`, regionId, units: fallbackUnits(regionId), tiles: fallbackTiles(), cols: HEX_GRID.cols, rows: HEX_GRID.rows }; cachedRegionId = regionId; }
  return cachedField;
}

function ensureCanvas() {
  if (canvas) return canvas;
  canvas = document.createElement("canvas");
  canvas.id = "cavalry-opponent-ai-canvas";
  Object.assign(canvas.style, { position: "fixed", inset: "0", width: "100%", height: "100%", zIndex: "14", pointerEvents: "none", display: "none" });
  document.querySelector("#app")?.append(canvas);
  ctx = canvas.getContext("2d");
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerdown", onPointerDown);
  return canvas;
}
function resize() { ensureCanvas(); const ratio = Math.max(1, Math.min(2, devicePixelRatio || 1)); const w = Math.max(1, Math.floor(canvas.clientWidth * ratio)); const h = Math.max(1, Math.floor(canvas.clientHeight * ratio)); if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; } return { w, h, ratio }; }
function boardMetrics(size) { const usableW = size.w * 0.88; const usableH = size.h * 0.80; const rByW = usableW / (SQRT3 * (HEX_GRID.cols + 0.5)); const rByH = usableH / (HEX_Y_SCALE * (1.5 * (HEX_GRID.rows - 1) + 2)); const r = Math.min(rByW, rByH); const boardW = SQRT3 * r * (HEX_GRID.cols + 0.5); const boardH = HEX_Y_SCALE * r * (1.5 * (HEX_GRID.rows - 1) + 2); return { r, originX: (size.w - boardW) * 0.5 + SQRT3 * r * 0.5, originY: size.h * 0.06 + Math.max(0, usableH - boardH) * 0.08, yScale: HEX_Y_SCALE }; }
function projectHex(col, row, size) { const m = boardMetrics(size); return { x: m.originX + SQRT3 * m.r * (col + (row % 2 ? 0.5 : 0)), y: m.originY + m.yScale * m.r * (1 + row * 1.5), r: m.r, yScale: m.yScale }; }
function nearestHex(clientX, clientY) { const rect = canvas.getBoundingClientRect(); const size = { w: canvas.width, h: canvas.height }; const x = (clientX - rect.left) * (canvas.width / Math.max(1, rect.width)); const y = (clientY - rect.top) * (canvas.height / Math.max(1, rect.height)); let best = null; let bestD = Infinity; for (let row = 0; row < HEX_GRID.rows; row += 1) for (let col = 0; col < HEX_GRID.cols; col += 1) { const p = projectHex(col, row, size); const d = Math.hypot((x - p.x), (y - p.y) / p.yScale) / Math.max(1, p.r); if (d < bestD) { best = { col, row, id: `h-${col}-${row}` }; bestD = d; } } return bestD < 0.94 ? best : null; }
function tileAt(field, col, row) { return field.tiles?.find((tile) => tile.col === col && tile.row === row) ?? null; }
function unitAt(field, col, row) { return field.units?.find((unit) => unit.col === col && unit.row === row && !unit.routed) ?? null; }
function unitById(field, id) { return field.units?.find((unit) => unit.id === id) ?? null; }
function isRomeUnit(unit) { return unit?.army === "rome" && !unit.routed; }
function isEnemyUnit(unit) { return unit?.army === "enemy" && !unit.routed; }
function isWater(tile) { return tile?.terrainType === TERRAIN.water || tile?.label === TERRAIN.water; }
function isStopTerrain(tile) { return tile?.terrainType === TERRAIN.hill || tile?.terrainType === TERRAIN.fence || tile?.label === TERRAIN.hill || tile?.label === TERRAIN.fence; }
function inBounds(col, row) { return col >= 0 && col < HEX_GRID.cols && row >= 0 && row < HEX_GRID.rows; }
function sectionForCol(col) { if (col <= 3) return "left"; if (col >= 7) return "right"; return "center"; }
function isOccupied(field, col, row) { return Boolean(unitAt(field, col, row)); }
function neighbors(col, row) { const odd = row % 2 === 1; const dirs = odd ? [[1,0],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1]] : [[1,0],[1,1],[0,1],[-1,0],[0,-1],[1,-1]]; return dirs.map(([dc, dr]) => ({ col: col + dc, row: row + dr })).filter((hex) => inBounds(hex.col, hex.row)); }
function distance(a, b) { let frontier = [{ col: a.col, row: a.row, d: 0 }]; const seen = new Set([`${a.col},${a.row}`]); while (frontier.length) { const n = frontier.shift(); if (n.col === b.col && n.row === b.row) return n.d; for (const next of neighbors(n.col, n.row)) { const key = `${next.col},${next.row}`; if (!seen.has(key)) { seen.add(key); frontier.push({ ...next, d: n.d + 1 }); } } } return 99; }
function reachableHexes(field, unit, maxSteps) { const seen = new Set([`${unit.col},${unit.row}`]); const queue = [{ col: unit.col, row: unit.row, steps: 0 }]; const result = []; while (queue.length) { const current = queue.shift(); const currentTile = tileAt(field, current.col, current.row); if (current.steps >= maxSteps || (current.steps > 0 && isStopTerrain(currentTile))) continue; for (const next of neighbors(current.col, current.row)) { const key = `${next.col},${next.row}`; if (seen.has(key)) continue; const tile = tileAt(field, next.col, next.row); if (!tile || isWater(tile) || isOccupied(field, next.col, next.row)) continue; const entry = { ...next, id: `h-${next.col}-${next.row}`, steps: current.steps + 1 }; seen.add(key); result.push(entry); queue.push(entry); } } return result; }
function adjacentEnemies(field, unit) { return neighbors(unit.col, unit.row).map((hex) => unitAt(field, hex.col, hex.row)).filter((target) => target && target.army !== unit.army && !target.routed); }
function maxMoveFor(unit, maneuver) { if (maneuver?.kind === "scout") return 3; if (maneuver?.kind === "berserk") return 2; return unit?.troopType === "light" ? 2 : 1; }
function connectedLineGroup(field, seedUnit) { const group = []; const seen = new Set(); const queue = [seedUnit]; while (queue.length && group.length < 8) { const unit = queue.shift(); if (!isRomeUnit(unit) || seen.has(unit.id)) continue; seen.add(unit.id); group.push(unit); for (const hex of neighbors(unit.col, unit.row)) { const adjacent = unitAt(field, hex.col, hex.row); if (isRomeUnit(adjacent) && !seen.has(adjacent.id)) queue.push(adjacent); } } return group; }
function resetForRegion(regionId) { state.initialized = true; state.regionId = regionId; state.turn = 1; state.side = "player"; state.activeManeuver = null; state.phase = "idle"; state.remainingMoves = 0; state.selectedUnitId = null; state.selectedGroupIds = new Set(); state.originalLineIds = new Set(); state.movedUnitIds = new Set(); state.reachable = []; state.attackTargets = []; rollActionPointsInPlace(); }
function eligibleUnits(field) { const m = state.activeManeuver; if (!m) return field.units.filter(isRomeUnit); if (m.kind === "advance") return field.units.filter((u) => isRomeUnit(u) && sectionForCol(u.col) === m.section && !state.movedUnitIds.has(u.id)); if (m.kind === "heavyBrigade") return field.units.filter((u) => isRomeUnit(u) && u.troopType === "heavy" && !state.movedUnitIds.has(u.id)); if (m.kind === "lineBrigade") return field.units.filter((u) => isRomeUnit(u) && state.originalLineIds.has(u.id) && !state.movedUnitIds.has(u.id)); return field.units.filter((u) => isRomeUnit(u) && !state.movedUnitIds.has(u.id)); }

function startManeuver(id, field = getField(globalThis.GameHost?.getSnapshot?.() ?? {})) {
  const maneuver = MANEUVERS[id];
  if (!maneuver || !field || state.activeManeuver || state.side !== "player" || state.actionPoints < maneuver.cost) return false;
  state.actionPoints -= maneuver.cost;
  state.activeManeuver = maneuver;
  state.phase = maneuver.kind === "lineBrigade" ? "pickLine" : "pickUnit";
  state.selectedUnitId = null;
  state.movedUnitIds = new Set();
  state.reachable = [];
  state.attackTargets = [];
  state.originalLineIds = new Set();
  if (maneuver.kind === "advance") state.remainingMoves = field.units.filter((u) => isRomeUnit(u) && sectionForCol(u.col) === maneuver.section).length;
  else state.remainingMoves = 1;
  if (maneuver.kind === "heavyBrigade") state.selectedGroupIds = new Set(field.units.filter((u) => isRomeUnit(u) && u.troopType === "heavy").map((u) => u.id)); else state.selectedGroupIds = new Set();
  return true;
}
function cancelSelectionOnly() { state.phase = state.activeManeuver ? (state.activeManeuver.kind === "lineBrigade" && !state.originalLineIds.size ? "pickLine" : "pickUnit") : "idle"; state.selectedUnitId = null; state.reachable = []; state.attackTargets = []; }
function selectUnit(field, unit) { if (!isRomeUnit(unit) || !state.activeManeuver) return false; if (state.activeManeuver.kind === "lineBrigade" && !state.originalLineIds.size) { const original = connectedLineGroup(field, unit); state.originalLineIds = new Set(original.map((u) => u.id)); state.selectedGroupIds = new Set(state.originalLineIds); } if (!eligibleUnits(field).some((u) => u.id === unit.id)) return false; state.selectedUnitId = unit.id; state.phase = "move"; state.reachable = reachableHexes(field, unit, maxMoveFor(unit, state.activeManeuver)); state.attackTargets = []; return true; }
function completePlayerManeuver(field) { const last = state.activeManeuver?.id ?? null; state.lastPlayerManeuver = last; state.activeManeuver = null; state.phase = "enemyTurn"; state.selectedUnitId = null; state.selectedGroupIds = new Set(); state.originalLineIds = new Set(); state.movedUnitIds = new Set(); state.reachable = []; state.attackTargets = []; state.turn += 1; setTimeout(() => runEnemyTurn(field, last), 260); }
function moveSelected(field, target) { const unit = unitById(field, state.selectedUnitId); if (!unit || !state.reachable.some((h) => h.col === target.col && h.row === target.row)) return false; unit.col = target.col; unit.row = target.row; state.movedUnitIds.add(unit.id); state.reachable = []; if (state.activeManeuver?.kind === "berserk") { const targets = adjacentEnemies(field, unit).filter(isEnemyUnit); if (targets.length) { state.phase = "attack"; state.attackTargets = targets.map((e) => ({ id: e.id, col: e.col, row: e.row })); return true; } } if (isStopTerrain(tileAt(field, target.col, target.row))) { completePlayerManeuver(field); return true; } if (state.activeManeuver?.kind === "advance") { state.remainingMoves = eligibleUnits(field).length; if (state.remainingMoves <= 0) completePlayerManeuver(field); else cancelSelectionOnly(); return true; } if (state.activeManeuver?.kind === "scout") completePlayerManeuver(field); else if (!eligibleUnits(field).length) completePlayerManeuver(field); else cancelSelectionOnly(); return true; }
function attackTarget(field, unit) { if (!isEnemyUnit(unit) || !state.attackTargets.some((t) => t.id === unit.id)) return false; unit.disrupted = true; state.lastAttack = { attackerId: state.selectedUnitId, targetId: unit.id, turn: state.turn }; completePlayerManeuver(field); return true; }

function retrieveTacticalMemory(field, lastManeuver) { const leftPressure = field.units.filter((u) => isRomeUnit(u) && sectionForCol(u.col) === "left").length; const rightPressure = field.units.filter((u) => isRomeUnit(u) && sectionForCol(u.col) === "right").length; const centerPressure = field.units.filter((u) => isRomeUnit(u) && sectionForCol(u.col) === "center").length; return { lastManeuver, pressure: { left: leftPressure, center: centerPressure, right: rightPressure }, memory: enemyPolicy.memory.slice(-4) }; }
function scoreEnemyMove(field, unit, hex, memory) { const tile = tileAt(field, hex.col, hex.row); if (!tile || isWater(tile) || isOccupied(field, hex.col, hex.row)) return -999; const rome = field.units.filter(isRomeUnit); const closest = Math.min(...rome.map((r) => distance(hex, r))); const flankBias = memory.lastManeuver?.includes("Left") || memory.lastManeuver === "advanceLeft" ? (sectionForCol(hex.col) === "left" ? 1.3 : 0) : memory.lastManeuver === "advanceRight" ? (sectionForCol(hex.col) === "right" ? 1.3 : 0) : (sectionForCol(hex.col) === "center" ? 0.4 : 0); const terrainBonus = isStopTerrain(tile) ? 0.45 : 0; const unpredictability = (random01() - 0.5) * 1.8; return (8 - closest) * 0.9 + flankBias + terrainBonus + unpredictability; }
function chooseEnemyMove(field, unit, memory) { const steps = unit.troopType === "light" ? 2 : 1; const options = reachableHexes(field, unit, steps); if (!options.length) return null; return options.map((hex) => ({ hex, score: scoreEnemyMove(field, unit, hex, memory) })).sort((a, b) => b.score - a.score)[0]?.hex ?? null; }
function applyEnemyAttack(field, unit) { const targets = adjacentEnemies(field, unit).filter(isRomeUnit); if (!targets.length) return null; const target = targets[Math.floor(random01() * targets.length)]; target.disrupted = true; return { attackerId: unit.id, targetId: target.id, col: target.col, row: target.row }; }
async function runEnemyTurn(field, lastManeuver) { state.side = "enemy"; state.phase = "enemyTurn"; const memory = retrieveTacticalMemory(field, lastManeuver); const enemies = field.units.filter(isEnemyUnit).sort(() => random01() - 0.5); const count = clamp(2 + Math.floor(random01() * 3), 1, 4); const moves = []; for (const unit of enemies.slice(0, count)) { const to = chooseEnemyMove(field, unit, memory); if (!to) continue; const from = { col: unit.col, row: unit.row }; unit.col = to.col; unit.row = to.row; const attack = applyEnemyAttack(field, unit); moves.push({ unitId: unit.id, from, to, attack }); } enemyPolicy.recentTurns.push({ turn: state.turn, lastManeuver, moves, memory }); if (enemyPolicy.recentTurns.length > 12) enemyPolicy.recentTurns.shift(); state.lastEnemyPlan = { policy: enemyPolicy.runtime, moves, retrieved: memory.memory }; state.enemyIntent = moves.map((m) => ({ id: m.unitId, col: m.to.col, row: m.to.row, startedAt: performance.now() })); setTimeout(() => { state.side = "player"; state.phase = "idle"; if ((state.turn - 1) % 3 === 0) rollActionPointsInPlace(); }, 700); }

function onPointerMove(event) { const snapshot = globalThis.GameHost?.getSnapshot?.() ?? {}; if (snapshot.mode !== "battlefield" || state.side !== "player") return; const field = getField(snapshot); const hex = nearestHex(event.clientX, event.clientY); const unit = hex ? unitAt(field, hex.col, hex.row) : null; state.hoveredHexId = hex?.id ?? null; state.hoveredUnitId = unit?.army === "rome" ? unit.id : null; }
function onPointerDown(event) { const snapshot = globalThis.GameHost?.getSnapshot?.() ?? {}; if (snapshot.mode !== "battlefield" || state.side !== "player") return; const field = getField(snapshot); const hex = nearestHex(event.clientX, event.clientY); if (!hex) return; const unit = unitAt(field, hex.col, hex.row); if (state.phase === "attack" && isEnemyUnit(unit)) { attackTarget(field, unit); return; } if (state.selectedUnitId && state.reachable.some((h) => h.col === hex.col && h.row === hex.row)) { moveSelected(field, hex); return; } if (isRomeUnit(unit)) selectUnit(field, unit); }

function squadLayout(unit) { if (unit.troopType === "heavy") return [[-2,0],[-1,0],[0,0],[1,0],[2,0],[-1.5,1],[-.5,1],[.5,1],[1.5,1]]; if (unit.troopType === "medium") return [[-1.5,0],[-.5,0],[.5,0],[1.5,0],[-1,1],[0,1],[1,1]]; return [[-1,0],[0,0],[1,0],[-.5,1],[.5,1]]; }
function drawDirectionalShadow(x, y, s, yScale) { ctx.fillStyle = "rgba(0,0,0,0.20)"; ctx.beginPath(); ctx.moveTo(x - s*.22, y + s*.35*yScale); ctx.lineTo(x+s*.12, y+s*.42*yScale); ctx.lineTo(x+s*.76, y+s*.20*yScale); ctx.lineTo(x+s*.42, y+s*.10*yScale); ctx.closePath(); ctx.fill(); }
function drawSoldier(x, y, s, unit, yScale, index) { drawDirectionalShadow(x,y,s,yScale); const armor = unit.troopType === "heavy" ? "#b9af93" : unit.troopType === "medium" ? "#878d96" : "#7a6b59"; ctx.save(); if (unit.troopType !== "light" || index % 2 === 0) { ctx.strokeStyle="#7b5a33"; ctx.lineWidth=Math.max(1,s*.08); ctx.beginPath(); ctx.moveTo(x+s*.28,y-s*.02); ctx.lineTo(x+s*.34,y-s); ctx.stroke(); } ctx.fillStyle="#493225"; for (const side of [-1,1]) { ctx.beginPath(); ctx.moveTo(x+side*s*.15,y+s*.36*yScale); ctx.lineTo(x+side*s*.04,y+s*.02*yScale); ctx.lineTo(x-side*s*.03,y+s*.36*yScale); ctx.closePath(); ctx.fill(); } ctx.fillStyle=unit.bodyColor; ctx.beginPath(); ctx.moveTo(x-s*.25,y-s*.02); ctx.lineTo(x+s*.25,y-s*.02); ctx.lineTo(x+s*.17,y-s*.50); ctx.lineTo(x-s*.17,y-s*.50); ctx.closePath(); ctx.fill(); ctx.fillStyle=unit.bandColor; ctx.fillRect(x-s*.23,y-s*.28,s*.46,s*.10); ctx.fillStyle=armor; ctx.beginPath(); ctx.moveTo(x-s*.28,y-s*.08); ctx.lineTo(x-s*.42,y-s*.20); ctx.lineTo(x-s*.36,y-s*.44); ctx.lineTo(x-s*.07,y-s*.36); ctx.lineTo(x-s*.06,y-s*.06); ctx.closePath(); ctx.fill(); ctx.fillStyle=unit.bandColor; ctx.fillRect(x-s*.30,y-s*.30,s*.22,s*.055); ctx.fillStyle="#d2b38a"; ctx.beginPath(); ctx.arc(x,y-s*.64,s*.12,0,TAU); ctx.fill(); ctx.fillStyle=armor; ctx.beginPath(); ctx.moveTo(x-s*.16,y-s*.68); ctx.lineTo(x+s*.16,y-s*.68); ctx.lineTo(x+s*.10,y-s*.84); ctx.lineTo(x-s*.10,y-s*.84); ctx.closePath(); ctx.fill(); ctx.restore(); }
function drawSquad(unit, size) { const p=projectHex(unit.col,unit.row,size); const layout=squadLayout(unit); const selected=state.selectedUnitId===unit.id; const hovered=state.hoveredUnitId===unit.id; const scale=p.r*(unit.troopType==="heavy"?.23:unit.troopType==="medium"?.20:.18); const lift=selected?-p.r*.06:hovered?-p.r*.028:0; ctx.save(); ctx.filter=selected?"brightness(1.16) saturate(1.08)":hovered?"brightness(1.06)":"none"; layout.forEach(([lx,ly],i)=>drawSoldier(p.x+lx*scale*1.62,p.y+ly*scale*p.yScale*1.70-scale*.20+lift,scale,unit,p.yScale,i)); ctx.restore(); }
function drawHexPath(p, scale=.94) { ctx.beginPath(); for (let i=0;i<6;i+=1){ const a=Math.PI/6+i*TAU/6; const x=p.x+Math.cos(a)*p.r*scale; const y=p.y+Math.sin(a)*p.r*p.yScale*scale; if(i===0)ctx.moveTo(x,y); else ctx.lineTo(x,y);} ctx.closePath(); }
function drawHighlights(field,size){ eligibleUnits(field).forEach((u)=>{ const p=projectHex(u.col,u.row,size); drawHexPath(p,.96); ctx.strokeStyle="rgba(246,211,112,.72)"; ctx.lineWidth=Math.max(2,p.r*.035); ctx.stroke();}); state.reachable.forEach((h)=>{const p=projectHex(h.col,h.row,size); drawHexPath(p,.92); ctx.fillStyle="rgba(86,211,122,.24)"; ctx.fill(); ctx.strokeStyle="rgba(126,244,154,.86)"; ctx.lineWidth=2; ctx.stroke();}); state.attackTargets.forEach((h)=>{const p=projectHex(h.col,h.row,size); drawHexPath(p,.92); ctx.fillStyle="rgba(214,58,49,.30)"; ctx.fill(); ctx.strokeStyle="rgba(255,95,72,.92)"; ctx.lineWidth=3; ctx.stroke();}); state.enemyIntent.forEach((h)=>{const p=projectHex(h.col,h.row,size); drawHexPath(p,.90); ctx.fillStyle="rgba(255,94,54,.22)"; ctx.fill(); ctx.strokeStyle="rgba(255,130,70,.70)"; ctx.lineWidth=2; ctx.stroke();}); }
function drawDice(size){ if(!state.dice.active)return; const age=performance.now()-state.dice.startedAt; const t=clamp(age/state.dice.duration,0,1); const alpha=1-t; if(alpha<=0){state.dice.active=false;return;} ctx.save(); ctx.globalAlpha=alpha; state.dice.faces.forEach((face,i)=>{ const s=Math.min(size.w,size.h)*.082; const baseX=size.w*(state.dice.faces.length===1?.50:i===0?.40:.60); const travel=Math.sin(t*Math.PI)*size.w*.18*(i===0?-1:1); const bounce=Math.abs(Math.sin(t*TAU*4+i))*s*.42*(1-t); const x=baseX+travel; const y=size.h*(.40+.12*t)-bounce; const spin=t<.82?((face+Math.floor(t*34+i*2))%6)+1:face; ctx.save(); ctx.translate(x,y); ctx.rotate((t*TAU*2.5+i*.7)*(i===0?1:-1)); const g=ctx.createLinearGradient(-s,-s,s,s); g.addColorStop(0,"#f0834f"); g.addColorStop(.5,"#a52218"); g.addColorStop(1,"#360b08"); ctx.fillStyle=g; ctx.strokeStyle="rgba(255,224,150,.90)"; ctx.lineWidth=Math.max(2,s*.05); ctx.beginPath(); ctx.roundRect(-s,-s,s*2,s*2,s*.22); ctx.fill(); ctx.stroke(); drawPips(0,0,s,spin); ctx.restore();}); ctx.restore(); }
function drawPips(x,y,s,face){ const spots={1:[[0,0]],2:[[-.34,-.34],[.34,.34]],3:[[-.34,-.34],[0,0],[.34,.34]],4:[[-.34,-.34],[.34,.34],[-.34,.34],[.34,-.34]],5:[[-.34,-.34],[.34,.34],[-.34,.34],[.34,-.34],[0,0]],6:[[-.34,-.34],[.34,.34],[-.34,.34],[.34,-.34],[-.34,0],[.34,0]]}[face]||[]; ctx.fillStyle="#170806"; spots.forEach(([dx,dy])=>{ctx.beginPath();ctx.arc(x+dx*s,y+dy*s,s*.075,0,TAU);ctx.fill();}); }
function hideOlderLayers(){ ["#cavalry-roll-controller-canvas","#cavalry-hex-gameplay-canvas","#cavalry-webgl-dice-canvas","#cavalry-hex-squad-canvas","#cavalry-hex-unit-canvas"].forEach((id)=>{const n=document.querySelector(id); if(n){n.style.opacity="0"; n.style.pointerEvents="none";}}); }
function frame(){ ensureCanvas(); hideOlderLayers(); const snapshot=globalThis.GameHost?.getSnapshot?.()??{}; const active=snapshot.mode==="battlefield"; canvas.style.display=active?"block":"none"; canvas.style.pointerEvents=active?"auto":"none"; if(active){ const field=getField(snapshot); if(!state.initialized||state.regionId!==field.regionId) resetForRegion(field.regionId??"latium"); const size=resize(); ctx.clearRect(0,0,size.w,size.h); drawHighlights(field,size); field.units.filter((u)=>!u.routed).sort((a,b)=>a.row-b.row||a.col-b.col).forEach((u)=>drawSquad(u,size)); drawDice(size);} requestAnimationFrame(frame); }
function handleKey(event){ const snapshot=globalThis.GameHost?.getSnapshot?.()??{}; if(snapshot.mode!=="battlefield")return; if(event.key==="0"||event.key.toLowerCase()==="r"){event.preventDefault();rollActionPointsInPlace();return;} const id=KEY_TO_MANEUVER[event.key]; if(id){event.preventDefault();startManeuver(id,getField(snapshot));} if(event.key==="Escape"){event.preventDefault();cancelSelectionOnly();} }
function getTacticalSnapshot(){ return { style:AI_CONTROLLER_STYLE, turn:state.turn, side:state.side, actionPoints:state.actionPoints, activeManeuver:state.activeManeuver?.id??null, phase:state.phase, remainingMoves:state.remainingMoves, selectedUnitId:state.selectedUnitId, hoveredUnitId:state.hoveredUnitId, hoveredHexId:state.hoveredHexId, reachable:state.reachable.map((h)=>({col:h.col,row:h.row,steps:h.steps})), attackTargets:state.attackTargets, dice:{faces:state.dice.faces,reason:state.dice.reason,active:state.dice.active}, canRollInPlace:!state.activeManeuver&&state.side==="player", enemyPolicy:{requested:enemyPolicy.requested,runtime:enemyPolicy.runtime,status:enemyPolicy.status,recentTurns:enemyPolicy.recentTurns.slice(-3)}, lastEnemyPlan:state.lastEnemyPlan, maneuvers:Object.values(MANEUVERS).map(({id,label,cost,kind,section})=>({id,label,cost,kind,section}))}; }
function patchGameHost(){ const host=globalThis.GameHost; if(!host||host.__cavalryOpponentAiPatched)return false; const originalSnapshot=typeof host.getSnapshot==="function"?host.getSnapshot.bind(host):()=>({}); host.getSnapshot=()=>({...originalSnapshot(),tacticalGameplay:getTacticalSnapshot()}); host.getTacticalGameplaySnapshot=getTacticalSnapshot; host.startManeuver=(id)=>startManeuver(id,getField(originalSnapshot()??{})); host.rollActionPointsInPlace=rollActionPointsInPlace; host.__cavalryOpponentAiPatched=true; return true; }
function boot(){ globalThis.CavalryOpponentAi={ style:AI_CONTROLLER_STYLE, enemyPolicy, rollActionPointsInPlace, startManeuver, getState:getTacticalSnapshot }; window.addEventListener("keydown",handleKey); const timer=setInterval(()=>{if(patchGameHost())clearInterval(timer); patchAttempts+=1; if(patchAttempts>240)clearInterval(timer);},100); ensureCanvas(); requestAnimationFrame(frame); }
boot();

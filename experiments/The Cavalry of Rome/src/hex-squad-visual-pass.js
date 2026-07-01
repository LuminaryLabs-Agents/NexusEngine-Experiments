const SQUAD_VISUAL_STYLE = "low-poly-mini-squads-no-token-rings";
const HEX_GRID = Object.freeze({ cols: 11, rows: 9 });
const CLASS_COLORS = Object.freeze({ light: "#3fad4f", medium: "#2f70d1", heavy: "#b93026" });
const BAND_COLORS = Object.freeze({ rome: "#c8231f", etruscan: "#d6aa3c", samnite: "#f0e6cf", greek: "#7a54bd", gallic: "#111318" });
const TAU = Math.PI * 2;
const SQRT3 = Math.sqrt(3);
const HEX_Y_SCALE = 0.72;

let squadCanvas = null;
let squadCtx = null;
let localBattlefield = null;
let lastRegionId = null;
let hoveredUnitId = null;
let selectedUnitId = null;
let hoveredHexId = null;
let lastPatchAttempts = 0;

function hashNoise(x, y, salt = 0) {
  const value = Math.sin(x * 127.1 + y * 311.7 + salt * 74.7) * 43758.5453123;
  return value - Math.floor(value);
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

function fallbackBattleUnits(regionId) {
  const enemyBand = enemyBandForRegion(regionId);
  return [
    createUnit("rome-medium-fl", "rome", "medium", 2, 6, "north"),
    createUnit("rome-light-c1", "rome", "light", 4, 6, "north"),
    createUnit("rome-light-c2", "rome", "light", 5, 6, "north"),
    createUnit("rome-light-c3", "rome", "light", 6, 6, "north"),
    createUnit("rome-medium-fr", "rome", "medium", 8, 6, "north"),
    createUnit("rome-medium-l", "rome", "medium", 3, 7, "north"),
    createUnit("rome-light-r", "rome", "light", 5, 7, "north"),
    createUnit("rome-medium-r", "rome", "medium", 7, 7, "north"),
    createUnit("rome-heavy-bl", "rome", "heavy", 2, 8, "north"),
    createUnit("rome-heavy-bc", "rome", "heavy", 5, 8, "north"),
    createUnit("rome-heavy-br", "rome", "heavy", 8, 8, "north"),
    createUnit("rome-light-reserve", "rome", "light", 5, 5, "north"),
    createUnit("enemy-light-l", "enemy", "light", 3, 2, "south", enemyBand),
    createUnit("enemy-medium-l", "enemy", "medium", 4, 2, "south", enemyBand),
    createUnit("enemy-medium-c", "enemy", "medium", 5, 2, "south", enemyBand),
    createUnit("enemy-medium-r", "enemy", "medium", 6, 2, "south", enemyBand),
    createUnit("enemy-light-r", "enemy", "light", 7, 2, "south", enemyBand),
    createUnit("enemy-light-screen-l", "enemy", "light", 4, 1, "south", enemyBand),
    createUnit("enemy-light-screen-r", "enemy", "light", 6, 1, "south", enemyBand),
    createUnit("enemy-heavy-l", "enemy", "heavy", 3, 3, "south", enemyBand),
    createUnit("enemy-heavy-r", "enemy", "heavy", 7, 3, "south", enemyBand),
    createUnit("enemy-medium-reserve", "enemy", "medium", 5, 3, "south", enemyBand)
  ];
}

function getBattlefield(snapshot = {}) {
  const direct = globalThis.GameHost?.getHexBattlefieldSnapshot?.();
  if (direct?.units?.length) return direct;
  const regionId = snapshot.selectedRegionId ?? snapshot.hoveredRegionId ?? "latium";
  if (!localBattlefield || lastRegionId !== regionId) {
    localBattlefield = { id: `hex-squad-fallback-${regionId}`, regionId, cols: HEX_GRID.cols, rows: HEX_GRID.rows, units: fallbackBattleUnits(regionId) };
    lastRegionId = regionId;
  }
  return localBattlefield;
}

function ensureSquadCanvas() {
  if (squadCanvas) return squadCanvas;
  squadCanvas = document.createElement("canvas");
  squadCanvas.id = "cavalry-hex-squad-canvas";
  Object.assign(squadCanvas.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    zIndex: "7",
    pointerEvents: "none",
    display: "none"
  });
  document.querySelector("#app")?.append(squadCanvas);
  squadCtx = squadCanvas.getContext("2d");
  squadCanvas.addEventListener("pointermove", onPointerMove);
  squadCanvas.addEventListener("pointerdown", onPointerDown);
  return squadCanvas;
}

function resize() {
  ensureSquadCanvas();
  const ratio = Math.max(1, Math.min(2, devicePixelRatio || 1));
  const w = Math.max(1, Math.floor(squadCanvas.clientWidth * ratio));
  const h = Math.max(1, Math.floor(squadCanvas.clientHeight * ratio));
  if (squadCanvas.width !== w || squadCanvas.height !== h) {
    squadCanvas.width = w;
    squadCanvas.height = h;
  }
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
  return {
    r,
    originX: (size.w - boardW) * 0.5 + SQRT3 * r * 0.5,
    originY: size.h * 0.06 + Math.max(0, usableH - boardH) * 0.08,
    yScale: HEX_Y_SCALE
  };
}

function projectHex(col, row, size) {
  const metrics = boardMetrics(size);
  return {
    x: metrics.originX + SQRT3 * metrics.r * (col + (row % 2 ? 0.5 : 0)),
    y: metrics.originY + metrics.yScale * metrics.r * (1 + row * 1.5),
    r: metrics.r,
    yScale: metrics.yScale
  };
}

function nearestHex(clientX, clientY) {
  const rect = squadCanvas.getBoundingClientRect();
  const size = { w: squadCanvas.width, h: squadCanvas.height };
  const x = (clientX - rect.left) * (squadCanvas.width / Math.max(1, rect.width));
  const y = (clientY - rect.top) * (squadCanvas.height / Math.max(1, rect.height));
  let best = null;
  let bestD = Infinity;
  for (let row = 0; row < HEX_GRID.rows; row += 1) {
    for (let col = 0; col < HEX_GRID.cols; col += 1) {
      const p = projectHex(col, row, size);
      const d = Math.hypot((x - p.x), (y - p.y) / p.yScale) / Math.max(1, p.r);
      if (d < bestD) {
        best = { col, row, id: `h-${col}-${row}` };
        bestD = d;
      }
    }
  }
  return bestD < 0.94 ? best : null;
}

function unitAt(field, col, row) {
  return field?.units?.find((unit) => unit.col === col && unit.row === row) ?? null;
}

function onPointerMove(event) {
  const snapshot = globalThis.GameHost?.getSnapshot?.() ?? {};
  if (snapshot.mode !== "battlefield") return;
  const field = getBattlefield(snapshot);
  const hex = nearestHex(event.clientX, event.clientY);
  hoveredHexId = hex?.id ?? null;
  const unit = hex ? unitAt(field, hex.col, hex.row) : null;
  hoveredUnitId = unit?.army === "rome" ? unit.id : null;
}

function onPointerDown(event) {
  const snapshot = globalThis.GameHost?.getSnapshot?.() ?? {};
  if (snapshot.mode !== "battlefield") return;
  const field = getBattlefield(snapshot);
  const hex = nearestHex(event.clientX, event.clientY);
  if (!hex) return;
  const unit = unitAt(field, hex.col, hex.row);
  selectedUnitId = unit?.army === "rome" ? unit.id : null;
}

function squadLayout(unit) {
  if (unit.troopType === "heavy") {
    return [[-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [-1.5, 1], [-0.5, 1], [0.5, 1], [1.5, 1]];
  }
  if (unit.troopType === "medium") {
    return [[-1.5, 0], [-0.5, 0], [0.5, 0], [1.5, 0], [-1, 1], [0, 1], [1, 1]];
  }
  return [[-1, 0], [0, 0], [1, 0], [-0.5, 1], [0.5, 1]];
}

function drawSquadShadow(p, unit, state) {
  const width = p.r * (unit.troopType === "heavy" ? 0.96 : unit.troopType === "medium" ? 0.82 : 0.70);
  const depth = p.r * p.yScale * (unit.troopType === "heavy" ? 0.26 : 0.22);
  squadCtx.save();
  squadCtx.globalAlpha = state.selected ? 0.34 : state.hovered ? 0.28 : 0.22;
  squadCtx.fillStyle = "#000000";
  squadCtx.beginPath();
  squadCtx.ellipse(p.x, p.y + p.r * p.yScale * 0.34, width, depth, 0, 0, TAU);
  squadCtx.fill();
  squadCtx.restore();
}

function drawSelectionPennant(x, y, s, unit, state) {
  if (!state.selected && !state.hovered) return;
  squadCtx.save();
  squadCtx.globalAlpha = state.selected ? 0.92 : 0.68;
  squadCtx.strokeStyle = unit.bandColor;
  squadCtx.lineWidth = Math.max(1, s * 0.10);
  squadCtx.beginPath();
  squadCtx.moveTo(x, y - s * 1.35);
  squadCtx.lineTo(x, y - s * 2.10);
  squadCtx.stroke();
  squadCtx.fillStyle = unit.bandColor;
  squadCtx.beginPath();
  squadCtx.moveTo(x, y - s * 2.08);
  squadCtx.lineTo(x + s * 0.55, y - s * 1.92);
  squadCtx.lineTo(x, y - s * 1.76);
  squadCtx.closePath();
  squadCtx.fill();
  squadCtx.restore();
}

function drawUnitSquad(unit, size) {
  const p = projectHex(unit.col, unit.row, size);
  const selectable = unit.army === "rome";
  const state = {
    hovered: selectable && hoveredUnitId === unit.id,
    selected: selectable && selectedUnitId === unit.id
  };
  drawSquadShadow(p, unit, state);
  const layout = squadLayout(unit);
  const scale = p.r * (unit.troopType === "heavy" ? 0.23 : unit.troopType === "medium" ? 0.20 : 0.18);
  const spacingX = scale * (unit.troopType === "heavy" ? 1.55 : 1.65);
  const spacingY = scale * p.yScale * 1.70;
  const lift = state.selected ? -p.r * 0.060 : state.hovered ? -p.r * 0.028 : 0;
  const leaderIndex = Math.floor(layout.length / 2);

  squadCtx.save();
  squadCtx.filter = state.selected ? "brightness(1.16) saturate(1.08)" : state.hovered ? "brightness(1.06)" : "none";
  for (let i = 0; i < layout.length; i += 1) {
    const [lx, ly] = layout[i];
    const rowDepth = ly * 0.10 * p.r * p.yScale;
    const x = p.x + lx * spacingX;
    const y = p.y + ly * spacingY - scale * 0.20 + rowDepth + lift;
    drawLowPolySoldier(x, y, scale, unit, p.yScale, i, layout.length, state);
    if (i === leaderIndex) drawSelectionPennant(x + scale * 0.46, y - scale * 0.10, scale, unit, state);
  }
  squadCtx.restore();
}

function drawLowPolySoldier(x, y, s, unit, yScale, index, total, state) {
  const body = unit.bodyColor;
  const band = unit.bandColor;
  const skin = "#d2b38a";
  const armor = unit.troopType === "heavy" ? "#b9af93" : unit.troopType === "medium" ? "#878d96" : "#7a6b59";
  const leather = "#493225";
  const weapon = "#7b5a33";
  const isHeavy = unit.troopType === "heavy";
  const isMedium = unit.troopType === "medium";
  const shieldW = isHeavy ? s * 0.30 : isMedium ? s * 0.24 : s * 0.18;
  const shieldH = isHeavy ? s * 0.42 : isMedium ? s * 0.34 : s * 0.24;
  const spear = isHeavy || isMedium || index % 2 === 0;
  const cape = isHeavy && index % 2 === 1;
  const frontBias = index < Math.ceil(total / 2) ? 1 : 0;

  squadCtx.save();
  squadCtx.fillStyle = "rgba(0,0,0,0.18)";
  squadCtx.beginPath();
  squadCtx.ellipse(x, y + s * 0.42 * yScale, s * 0.24, s * 0.10 * yScale, 0, 0, TAU);
  squadCtx.fill();

  if (spear) {
    squadCtx.strokeStyle = weapon;
    squadCtx.lineWidth = Math.max(1, s * 0.08);
    squadCtx.beginPath();
    squadCtx.moveTo(x + s * 0.28, y - s * 0.02);
    squadCtx.lineTo(x + s * 0.34, y - s * (1.00 + frontBias * 0.10));
    squadCtx.stroke();
    squadCtx.fillStyle = "#cbb88b";
    squadCtx.beginPath();
    squadCtx.moveTo(x + s * 0.34, y - s * (1.00 + frontBias * 0.10));
    squadCtx.lineTo(x + s * 0.43, y - s * (0.86 + frontBias * 0.10));
    squadCtx.lineTo(x + s * 0.29, y - s * (0.88 + frontBias * 0.10));
    squadCtx.closePath();
    squadCtx.fill();
  }

  squadCtx.fillStyle = leather;
  squadCtx.beginPath();
  squadCtx.moveTo(x - s * 0.15, y + s * 0.36 * yScale);
  squadCtx.lineTo(x - s * 0.04, y + s * 0.02 * yScale);
  squadCtx.lineTo(x + s * 0.03, y + s * 0.36 * yScale);
  squadCtx.closePath();
  squadCtx.fill();
  squadCtx.beginPath();
  squadCtx.moveTo(x + s * 0.15, y + s * 0.36 * yScale);
  squadCtx.lineTo(x + s * 0.04, y + s * 0.02 * yScale);
  squadCtx.lineTo(x - s * 0.03, y + s * 0.36 * yScale);
  squadCtx.closePath();
  squadCtx.fill();

  if (cape) {
    squadCtx.fillStyle = "rgba(90,18,15,0.65)";
    squadCtx.beginPath();
    squadCtx.moveTo(x - s * 0.12, y - s * 0.08);
    squadCtx.lineTo(x + s * 0.22, y + s * 0.16);
    squadCtx.lineTo(x + s * 0.10, y + s * 0.34);
    squadCtx.lineTo(x - s * 0.18, y + s * 0.10);
    squadCtx.closePath();
    squadCtx.fill();
  }

  squadCtx.fillStyle = body;
  squadCtx.beginPath();
  squadCtx.moveTo(x - s * 0.25, y - s * 0.02);
  squadCtx.lineTo(x + s * 0.25, y - s * 0.02);
  squadCtx.lineTo(x + s * 0.17, y - s * 0.50);
  squadCtx.lineTo(x - s * 0.17, y - s * 0.50);
  squadCtx.closePath();
  squadCtx.fill();

  squadCtx.fillStyle = band;
  squadCtx.fillRect(x - s * 0.23, y - s * 0.28, s * 0.46, s * 0.10);

  squadCtx.fillStyle = armor;
  squadCtx.beginPath();
  squadCtx.moveTo(x - s * 0.28, y - s * 0.08);
  squadCtx.lineTo(x - s * 0.28 - shieldW * 0.44, y - shieldH * 0.15);
  squadCtx.lineTo(x - s * 0.28 - shieldW * 0.36, y - shieldH * 0.88);
  squadCtx.lineTo(x - s * 0.14, y - shieldH);
  squadCtx.lineTo(x - s * 0.02, y - shieldH * 0.82);
  squadCtx.lineTo(x - s * 0.06, y - s * 0.06);
  squadCtx.closePath();
  squadCtx.fill();

  squadCtx.fillStyle = band;
  squadCtx.fillRect(x - s * 0.28, y - shieldH * 0.68, shieldW * 0.50, s * 0.06);

  squadCtx.fillStyle = skin;
  squadCtx.beginPath();
  squadCtx.arc(x, y - s * 0.64, s * 0.12, 0, TAU);
  squadCtx.fill();

  squadCtx.fillStyle = armor;
  squadCtx.beginPath();
  squadCtx.moveTo(x - s * 0.16, y - s * 0.68);
  squadCtx.lineTo(x + s * 0.16, y - s * 0.68);
  squadCtx.lineTo(x + s * 0.10, y - s * 0.84);
  squadCtx.lineTo(x - s * 0.10, y - s * 0.84);
  squadCtx.closePath();
  squadCtx.fill();

  if (isHeavy) {
    squadCtx.fillStyle = band;
    squadCtx.beginPath();
    squadCtx.moveTo(x, y - s * 0.86);
    squadCtx.lineTo(x + s * 0.06, y - s * 1.02);
    squadCtx.lineTo(x - s * 0.06, y - s * 1.02);
    squadCtx.closePath();
    squadCtx.fill();
  }
  squadCtx.restore();
}

function hideOldUnitCanvas() {
  const old = document.querySelector("#cavalry-hex-unit-canvas");
  if (!old) return;
  old.style.opacity = "0";
  old.style.pointerEvents = "none";
}

function patchGameHost() {
  const host = globalThis.GameHost;
  if (!host || host.__cavalrySquadVisualPatched) return false;
  const originalSnapshot = typeof host.getSnapshot === "function" ? host.getSnapshot.bind(host) : () => ({});
  host.getSnapshot = () => {
    const snapshot = originalSnapshot() ?? {};
    return {
      ...snapshot,
      squadVisuals: {
        style: SQUAD_VISUAL_STYLE,
        selectedUnitId,
        hoveredUnitId,
        hoveredHexId,
        selectableArmy: "rome",
        tokenRingsRemoved: true,
        classColors: CLASS_COLORS,
        armyBandColors: BAND_COLORS
      }
    };
  };
  host.__cavalrySquadVisualPatched = true;
  return true;
}

function drawFrame() {
  ensureSquadCanvas();
  hideOldUnitCanvas();
  const snapshot = globalThis.GameHost?.getSnapshot?.() ?? {};
  const active = snapshot.mode === "battlefield";
  squadCanvas.style.display = active ? "block" : "none";
  squadCanvas.style.pointerEvents = active ? "auto" : "none";
  if (active) {
    const size = resize();
    const field = getBattlefield(snapshot);
    squadCtx.clearRect(0, 0, size.w, size.h);
    field.units.sort((a, b) => a.row - b.row || a.col - b.col).forEach((unit) => drawUnitSquad(unit, size));
  }
  requestAnimationFrame(drawFrame);
}

function boot() {
  window.CavalryHexSquadVisuals = {
    style: SQUAD_VISUAL_STYLE,
    squadLayout,
    selectableArmy: "rome",
    tokenRingsRemoved: true
  };
  const patchTimer = setInterval(() => {
    if (patchGameHost()) clearInterval(patchTimer);
    lastPatchAttempts += 1;
    if (lastPatchAttempts > 240) clearInterval(patchTimer);
  }, 100);
  ensureSquadCanvas();
  requestAnimationFrame(drawFrame);
}

boot();

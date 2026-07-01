const HEX_STYLE = "rome-perspective-hex-battlefield-no-ui";
const HEX_VISUAL_DETAIL_STYLE = "layered-painted-hex-interiors-rimlit-terrain-features";
const HEX_GRID = Object.freeze({ cols: 11, rows: 9 });
const CLASS_COLORS = Object.freeze({ light: "#3fad4f", medium: "#2f70d1", heavy: "#b93026" });
const BAND_COLORS = Object.freeze({ rome: "#c8231f", etruscan: "#d6aa3c", samnite: "#f0e6cf", greek: "#7a54bd", gallic: "#111318" });
const TERRAIN_TYPES = Object.freeze({ grass: "grass", water: "water", hill: "hill", fence: "fence" });
const UNIT_COUNTS = Object.freeze({ rome: { light: 5, medium: 4, heavy: 3 }, enemy: { light: 4, medium: 4, heavy: 2 } });
const TAU = Math.PI * 2;
const SQRT3 = Math.sqrt(3);
const HEX_Y_SCALE = 0.72;

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (a, b, value) => {
  const t = clamp((value - a) / Math.max(0.0001, b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

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

function terrainForHex(col, row, regionId = "") {
  const n = hashNoise(col, row, regionId.length + 19);
  const ridge = Math.abs(row - (3 + Math.sin(col * 0.7 + regionId.length) * 1.5));
  const riverCenter = 5 + Math.sin((row + regionId.length) * 0.8) * 1.2;
  if ((regionId.includes("campania") || regionId.includes("graecia")) && Math.abs(col - riverCenter) < 0.7 && row > 1 && row < HEX_GRID.rows - 1) return TERRAIN_TYPES.water;
  if (regionId.includes("samnium") && ridge < 0.85 && n > 0.28) return TERRAIN_TYPES.hill;
  if (regionId.includes("cisalpine") && (n > 0.76 || ridge < 0.55)) return TERRAIN_TYPES.hill;
  if (n > 0.86 && row > 1 && row < HEX_GRID.rows - 2) return TERRAIN_TYPES.water;
  if (n > 0.68 && n <= 0.86) return TERRAIN_TYPES.hill;
  if ((row === 3 || row === 5) && n > 0.42 && n < 0.60) return TERRAIN_TYPES.fence;
  return TERRAIN_TYPES.grass;
}

function tileStats(type) {
  if (type === TERRAIN_TYPES.water) return { movementCost: 3, defense: 0, blocksCharge: true, label: "water" };
  if (type === TERRAIN_TYPES.hill) return { movementCost: 2, defense: 1, blocksCharge: false, label: "hill" };
  if (type === TERRAIN_TYPES.fence) return { movementCost: 2, defense: 1, blocksCharge: true, label: "fence" };
  return { movementCost: 1, defense: 0, blocksCharge: false, label: "grass" };
}

function createHexBattlefield(regionId = "latium") {
  const tiles = [];
  for (let row = 0; row < HEX_GRID.rows; row += 1) {
    for (let col = 0; col < HEX_GRID.cols; col += 1) {
      const terrainType = terrainForHex(col, row, regionId);
      tiles.push({
        id: `h-${col}-${row}`,
        q: col,
        r: row,
        col,
        row,
        terrainType,
        height: terrainType === TERRAIN_TYPES.hill ? 1 : 0,
        visualVariant: hashNoise(col, row, 77),
        ...tileStats(terrainType)
      });
    }
  }
  return { id: `hex-battlefield-${regionId}`, regionId, cols: HEX_GRID.cols, rows: HEX_GRID.rows, tiles, units: createBattleUnits(regionId) };
}

function createUnit(id, army, troopType, col, row, facing = "north", bandColor = BAND_COLORS.rome) {
  return { id, army, troopType, col, row, facing, bandColor, bodyColor: CLASS_COLORS[troopType], strengthLabel: troopType, selected: false };
}

function createBattleUnits(regionId) {
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

let canvas = null;
let ctx = null;
let battlefield = null;
let selectedUnitId = null;
let hoveredHexId = null;
let hoveredUnitId = null;
let lastRegionId = null;

function ensureCanvas() {
  if (canvas) return canvas;
  canvas = document.createElement("canvas");
  canvas.id = "cavalry-hex-battlefield-canvas";
  Object.assign(canvas.style, { position: "fixed", inset: "0", width: "100%", height: "100%", zIndex: "4", pointerEvents: "none", display: "none", background: "#11130d" });
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

function battlefieldForSnapshot(snapshot = {}) {
  const regionId = snapshot.selectedRegionId ?? snapshot.hoveredRegionId ?? "latium";
  if (!battlefield || lastRegionId !== regionId) {
    battlefield = createHexBattlefield(regionId);
    lastRegionId = regionId;
    selectedUnitId = null;
    hoveredHexId = null;
    hoveredUnitId = null;
  }
  return battlefield;
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
    yScale: metrics.yScale,
    perspective: 1
  };
}

function hexPath(ctx, x, y, r, yScale = HEX_Y_SCALE) {
  ctx.beginPath();
  for (let i = 0; i < 6; i += 1) {
    const angle = Math.PI / 6 + i * TAU / 6;
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r * yScale;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function tilePalette(tile) {
  if (tile.terrainType === TERRAIN_TYPES.water) return { top: "#2d6573", mid: "#234f5d", low: "#163443", accent: "rgba(150,212,218,.58)", shadow: "rgba(0,24,34,.28)" };
  if (tile.terrainType === TERRAIN_TYPES.hill) return { top: "#8a824e", mid: "#67633a", low: "#46492b", accent: "rgba(231,211,139,.42)", shadow: "rgba(34,26,14,.26)" };
  if (tile.terrainType === TERRAIN_TYPES.fence) return { top: "#526f39", mid: "#3d5c31", low: "#2b4328", accent: "rgba(158,111,59,.74)", shadow: "rgba(24,19,10,.28)" };
  return { top: "#3e7738", mid: "#2e5e31", low: "#203f25", accent: "rgba(139,172,82,.46)", shadow: "rgba(12,30,14,.22)" };
}

function drawHexRimLighting(p, tile, hot) {
  hexPath(ctx, p.x, p.y + p.r * p.yScale * 0.06, p.r * 0.988, p.yScale);
  ctx.strokeStyle = "rgba(0,0,0,.34)";
  ctx.lineWidth = Math.max(2, p.r * 0.040);
  ctx.stroke();
  hexPath(ctx, p.x, p.y, p.r * 0.972, p.yScale);
  ctx.strokeStyle = hot ? "rgba(255,236,164,.92)" : tile.terrainType === TERRAIN_TYPES.water ? "rgba(154,209,210,.36)" : "rgba(238,218,148,.30)";
  ctx.lineWidth = hot ? Math.max(2.5, p.r * 0.050) : Math.max(1.2, p.r * 0.024);
  ctx.stroke();
  hexPath(ctx, p.x, p.y - p.r * p.yScale * 0.012, p.r * 0.90, p.yScale);
  ctx.strokeStyle = "rgba(255,244,190,.10)";
  ctx.lineWidth = Math.max(1, p.r * 0.018);
  ctx.stroke();
}

function drawTileBase(tile, p, hot) {
  const palette = tilePalette(tile);
  const gradient = ctx.createLinearGradient(p.x - p.r * 0.6, p.y - p.r * p.yScale, p.x + p.r * 0.45, p.y + p.r * p.yScale);
  gradient.addColorStop(0, palette.top);
  gradient.addColorStop(0.56, palette.mid);
  gradient.addColorStop(1, palette.low);
  hexPath(ctx, p.x, p.y, p.r * 0.985, p.yScale);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.save();
  hexPath(ctx, p.x, p.y, p.r * 0.93, p.yScale);
  ctx.clip();
  drawTileMaterialDetail(tile, p, palette);
  ctx.restore();
  drawHexRimLighting(p, tile, hot);
}

function drawTileMaterialDetail(tile, p, palette) {
  const seed = tile.col * 41 + tile.row * 97 + tile.visualVariant * 1000;
  if (tile.terrainType === TERRAIN_TYPES.water) {
    drawWaterMaterial(tile, p, palette, seed);
    return;
  }
  if (tile.terrainType === TERRAIN_TYPES.hill) {
    drawHillMaterial(tile, p, palette, seed);
    return;
  }
  if (tile.terrainType === TERRAIN_TYPES.fence) {
    drawGrassMaterial(tile, p, palette, seed, 0.8);
    drawFenceFeature(p, tile);
    return;
  }
  drawGrassMaterial(tile, p, palette, seed, 1);
}

function materialPoint(p, seed, i, radiusScale = 0.78) {
  const a = hashNoise(seed, i, 17) * TAU;
  const d = Math.sqrt(hashNoise(seed, i, 23)) * p.r * radiusScale;
  return { x: p.x + Math.cos(a) * d, y: p.y + Math.sin(a) * d * p.yScale, a, d };
}

function drawGrassMaterial(tile, p, palette, seed, density = 1) {
  ctx.save();
  ctx.globalAlpha = 0.58;
  const tuftCount = Math.floor(12 * density);
  for (let i = 0; i < tuftCount; i += 1) {
    const pt = materialPoint(p, seed, i, 0.72);
    const length = p.r * (0.06 + hashNoise(seed, i, 31) * 0.085);
    const angle = pt.a + 0.8 + hashNoise(seed, i, 43) * 0.7;
    ctx.strokeStyle = i % 4 === 0 ? "rgba(157,185,85,.44)" : "rgba(96,143,65,.42)";
    ctx.lineWidth = Math.max(0.7, p.r * 0.010);
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
    ctx.quadraticCurveTo(pt.x + Math.cos(angle) * length * 0.45, pt.y - length * p.yScale * 0.4, pt.x + Math.cos(angle) * length, pt.y - length * p.yScale);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.30;
  for (let i = 0; i < 5; i += 1) {
    const pt = materialPoint(p, seed + 17, i, 0.60);
    ctx.fillStyle = i % 2 ? "rgba(84,126,58,.34)" : "rgba(57,98,50,.34)";
    ctx.beginPath();
    ctx.ellipse(pt.x, pt.y, p.r * (0.09 + hashNoise(seed, i, 61) * 0.11), p.r * p.yScale * 0.026, pt.a, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function drawWaterMaterial(tile, p, palette, seed) {
  ctx.save();
  const pool = ctx.createRadialGradient(p.x - p.r * 0.20, p.y - p.r * p.yScale * 0.16, p.r * 0.08, p.x, p.y, p.r * 0.88);
  pool.addColorStop(0, "rgba(97,157,165,.44)");
  pool.addColorStop(0.7, "rgba(35,78,91,.24)");
  pool.addColorStop(1, "rgba(9,27,38,.38)");
  hexPath(ctx, p.x, p.y, p.r * 0.87, p.yScale);
  ctx.fillStyle = pool;
  ctx.fill();
  ctx.strokeStyle = "rgba(164,222,222,.42)";
  ctx.lineWidth = Math.max(1.0, p.r * 0.018);
  for (let i = 0; i < 5; i += 1) {
    const y = p.y + (i - 2) * p.r * p.yScale * 0.16;
    ctx.beginPath();
    ctx.ellipse(p.x + (hashNoise(seed, i, 71) - 0.5) * p.r * 0.22, y, p.r * (0.26 + i * 0.035), p.r * p.yScale * 0.036, hashNoise(seed, i, 73) * 0.18, 0, TAU);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(210,232,205,.18)";
  ctx.lineWidth = Math.max(1.2, p.r * 0.020);
  hexPath(ctx, p.x, p.y, p.r * 0.76, p.yScale);
  ctx.stroke();
  ctx.restore();
}

function drawHillMaterial(tile, p, palette, seed) {
  ctx.save();
  for (let i = 0; i < 4; i += 1) {
    ctx.fillStyle = i % 2 ? "rgba(109,101,55,.34)" : "rgba(153,139,77,.28)";
    ctx.beginPath();
    ctx.ellipse(p.x + (i - 1.5) * p.r * 0.08, p.y - i * p.r * p.yScale * 0.035, p.r * (0.50 - i * 0.055), p.r * p.yScale * (0.18 - i * 0.018), -0.18, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(228,207,135,.20)";
    ctx.lineWidth = Math.max(0.9, p.r * 0.012);
    ctx.stroke();
  }
  for (let i = 0; i < 8; i += 1) {
    const pt = materialPoint(p, seed + 33, i, 0.66);
    ctx.fillStyle = "rgba(68,65,47,.38)";
    ctx.beginPath();
    ctx.ellipse(pt.x, pt.y, p.r * (0.018 + hashNoise(seed, i, 81) * 0.022), p.r * p.yScale * 0.014, pt.a, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function drawTile(tile, size) {
  const p = projectHex(tile.col, tile.row, size);
  const hot = hoveredHexId === tile.id;
  drawTileBase(tile, p, hot);
  if (tile.terrainType === TERRAIN_TYPES.hill) drawHillFeature(p, tile);
  if (tile.terrainType === TERRAIN_TYPES.water) drawWaterFeature(p, tile);
  if (tile.terrainType === TERRAIN_TYPES.fence) drawFenceFeature(p, tile, true);
  if (tile.terrainType === TERRAIN_TYPES.grass) drawGrassFeature(p, tile);
}

function drawGrassFeature(p, tile) {
  ctx.save();
  ctx.globalAlpha = 0.38;
  ctx.strokeStyle = "rgba(146,173,82,.60)";
  ctx.lineWidth = Math.max(0.8, p.r * 0.010);
  for (let i = 0; i < 5; i += 1) {
    const a = hashNoise(tile.col + i, tile.row, 23) * TAU;
    const radius = p.r * (0.16 + hashNoise(tile.row, tile.col + i, 24) * 0.32);
    const x = p.x + Math.cos(a) * radius;
    const y = p.y + Math.sin(a) * radius * p.yScale;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a + 0.9) * p.r * 0.050, y - p.r * p.yScale * 0.13);
    ctx.stroke();
  }
  ctx.restore();
}

function drawWaterFeature(p) {
  ctx.save();
  ctx.globalAlpha = 0.42;
  ctx.strokeStyle = "rgba(174,224,225,.58)";
  ctx.lineWidth = Math.max(1, p.r * 0.018);
  for (let i = 0; i < 2; i += 1) {
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + (i - 0.5) * p.r * p.yScale * 0.24, p.r * 0.52, p.r * p.yScale * 0.045, 0.1 * i, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();
}

function drawHillFeature(p) {
  ctx.save();
  ctx.globalAlpha = 0.46;
  ctx.strokeStyle = "rgba(54,46,25,.30)";
  ctx.lineWidth = Math.max(2, p.r * 0.030);
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + p.r * p.yScale * 0.18, p.r * 0.54, p.r * p.yScale * 0.16, -0.12, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

function drawFenceFeature(p, tile, detailOnly = false) {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,.32)";
  ctx.shadowBlur = p.r * 0.035;
  ctx.strokeStyle = "rgba(144,94,45,.88)";
  ctx.lineWidth = Math.max(2.2, p.r * 0.030);
  const tilt = hashNoise(tile?.col ?? 0, tile?.row ?? 0, 91) > 0.5 ? 0.10 : -0.10;
  const y0 = p.y + p.r * p.yScale * (detailOnly ? 0.02 : 0.04);
  ctx.beginPath();
  ctx.moveTo(p.x - p.r * 0.50, y0 + p.r * p.yScale * tilt);
  ctx.lineTo(p.x + p.r * 0.50, y0 - p.r * p.yScale * tilt);
  ctx.stroke();
  ctx.strokeStyle = "rgba(96,58,31,.88)";
  ctx.lineWidth = Math.max(1.6, p.r * 0.022);
  for (let i = -2; i <= 2; i += 1) {
    const x = p.x + i * p.r * 0.22;
    ctx.beginPath();
    ctx.moveTo(x, p.y - p.r * p.yScale * 0.20);
    ctx.lineTo(x + p.r * 0.020, p.y + p.r * p.yScale * 0.15);
    ctx.stroke();
  }
  ctx.restore();
}

function unitAt(col, row) {
  return battlefield?.units.find((unit) => unit.col === col && unit.row === row) ?? null;
}

function drawUnit(unit, size) {
  const p = projectHex(unit.col, unit.row, size);
  const selectable = unit.army === "rome";
  const selected = selectable && selectedUnitId === unit.id;
  const hovered = selectable && hoveredUnitId === unit.id;
  const baseR = p.r * 0.42;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,.55)";
  ctx.shadowBlur = p.r * 0.18;
  ctx.fillStyle = "rgba(13,11,8,.58)";
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + baseR * 0.42 * p.yScale, baseR * 1.08, baseR * 0.42 * p.yScale, 0, 0, TAU);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = selected ? "rgba(255,235,155,.62)" : hovered ? "rgba(255,235,155,.34)" : "rgba(30,23,16,.82)";
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + baseR * 0.20 * p.yScale, baseR * 0.98, baseR * 0.46 * p.yScale, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,225,145,.20)";
  ctx.lineWidth = Math.max(1, p.r * 0.018);
  ctx.stroke();

  const cluster = unit.troopType === "heavy" ? 5 : unit.troopType === "medium" ? 4 : 3;
  for (let i = 0; i < cluster; i += 1) {
    const offset = (i - (cluster - 1) / 2) * baseR * 0.28;
    const soldierX = p.x + offset;
    const soldierY = p.y - baseR * 0.18 * p.yScale + Math.abs(i - 2) * baseR * 0.04 * p.yScale;
    drawMiniSoldier(soldierX, soldierY, baseR * (unit.troopType === "heavy" ? 0.42 : 0.36), unit, p.yScale);
  }

  ctx.lineWidth = Math.max(3, p.r * 0.055);
  ctx.strokeStyle = unit.bandColor;
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + baseR * 0.20 * p.yScale, baseR * 0.98, baseR * 0.46 * p.yScale, 0, 0, TAU);
  ctx.stroke();
  if (unit.army === "rome" && unit.troopType === "heavy") {
    ctx.strokeStyle = "#6e0d0c";
    ctx.lineWidth = Math.max(1, p.r * 0.025);
    ctx.stroke();
  }
  ctx.restore();
}

function drawMiniSoldier(x, y, s, unit, yScale) {
  ctx.fillStyle = unit.bodyColor;
  ctx.beginPath();
  ctx.roundRect(x - s * 0.30, y - s * 0.18 * yScale, s * 0.60, s * 0.70 * yScale, s * 0.12);
  ctx.fill();
  ctx.fillStyle = unit.bandColor;
  ctx.fillRect(x - s * 0.31, y + s * 0.02 * yScale, s * 0.62, s * 0.12 * yScale);
  ctx.fillStyle = "#d2b38a";
  ctx.beginPath();
  ctx.arc(x, y - s * 0.30 * yScale, s * 0.20, 0, TAU);
  ctx.fill();
  ctx.fillStyle = unit.troopType === "heavy" ? "#c7b073" : "#6b6d6d";
  ctx.beginPath();
  ctx.ellipse(x, y - s * 0.42 * yScale, s * 0.24, s * 0.12 * yScale, 0, 0, TAU);
  ctx.fill();
}

function drawBackground(size) {
  const gradient = ctx.createLinearGradient(0, 0, 0, size.h);
  gradient.addColorStop(0, "#172018");
  gradient.addColorStop(0.48, "#303d25");
  gradient.addColorStop(1, "#17110b");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size.w, size.h);
  ctx.globalAlpha = 0.18;
  for (let i = 0; i < 80; i += 1) {
    const x = hashNoise(i, 2, 19) * size.w;
    const y = hashNoise(i, 4, 23) * size.h;
    const r = size.w * (0.02 + hashNoise(i, 7, 29) * 0.08);
    ctx.fillStyle = i % 5 === 0 ? "#182f2f" : "#566331";
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.22, hashNoise(i, 9, 31) * TAU, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawBattlefield(snapshot) {
  const size = resize();
  const field = battlefieldForSnapshot(snapshot);
  drawBackground(size);
  field.tiles.sort((a, b) => a.row - b.row).forEach((tile) => drawTile(tile, size));
  field.units.sort((a, b) => a.row - b.row || a.col - b.col).forEach((unit) => drawUnit(unit, size));
  ctx.save();
  ctx.globalAlpha = 0.24;
  ctx.fillStyle = "#6a1713";
  ctx.beginPath();
  ctx.moveTo(size.w * 0.18, size.h * 0.95);
  ctx.lineTo(size.w * 0.82, size.h * 0.95);
  ctx.lineTo(size.w * 0.64, size.h * 0.88);
  ctx.lineTo(size.w * 0.36, size.h * 0.88);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function nearestHex(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const size = { w: canvas.width, h: canvas.height };
  const x = (clientX - rect.left) * (canvas.width / Math.max(1, rect.width));
  const y = (clientY - rect.top) * (canvas.height / Math.max(1, rect.height));
  let best = null;
  let bestD = Infinity;
  for (const tile of battlefield?.tiles ?? []) {
    const p = projectHex(tile.col, tile.row, size);
    const d = Math.hypot((x - p.x), (y - p.y) / p.yScale) / Math.max(1, p.r);
    if (d < bestD) { best = tile; bestD = d; }
  }
  return bestD < 0.94 ? best : null;
}

function onPointerMove(event) {
  const tile = nearestHex(event.clientX, event.clientY);
  hoveredHexId = tile?.id ?? null;
  const unit = tile ? unitAt(tile.col, tile.row) : null;
  hoveredUnitId = unit?.army === "rome" ? unit.id : null;
}

function onPointerDown(event) {
  const tile = nearestHex(event.clientX, event.clientY);
  if (!tile) return;
  const unit = unitAt(tile.col, tile.row);
  selectedUnitId = unit?.army === "rome" ? unit.id : null;
}

function patchGameHost() {
  const host = globalThis.GameHost;
  if (!host || host.__cavalryHexPatched) return false;
  const originalSnapshot = typeof host.getSnapshot === "function" ? host.getSnapshot.bind(host) : () => ({});
  host.getSnapshot = () => {
    const snapshot = originalSnapshot() ?? {};
    return {
      ...snapshot,
      tacticalHex: battlefield ? {
        id: battlefield.id,
        style: HEX_STYLE,
        visualDetailStyle: HEX_VISUAL_DETAIL_STYLE,
        grid: { cols: battlefield.cols, rows: battlefield.rows, alignment: "fixed-pointy-offset", yScale: HEX_Y_SCALE },
        terrainTypes: Object.keys(TERRAIN_TYPES),
        unitCounts: UNIT_COUNTS,
        selectedUnitId,
        hoveredHexId,
        hoveredUnitId,
        selectableArmy: "rome",
        active: snapshot.mode === "battlefield"
      } : null
    };
  };
  host.getHexBattlefieldSnapshot = () => battlefield ? { ...battlefield, selectedUnitId, hoveredHexId, hoveredUnitId, selectableArmy: "rome", visualDetailStyle: HEX_VISUAL_DETAIL_STYLE } : null;
  host.__cavalryHexPatched = true;
  return true;
}

function frame() {
  ensureCanvas();
  const snapshot = globalThis.GameHost?.getSnapshot?.() ?? {};
  const active = snapshot.mode === "battlefield";
  window.CavalryHexBattlefieldActive = active;
  canvas.style.display = active ? "block" : "none";
  canvas.style.pointerEvents = active ? "auto" : "none";
  if (active) drawBattlefield(snapshot);
  requestAnimationFrame(frame);
}

function boot() {
  window.CavalryHexBattlefield = { createHexBattlefield, createBattleUnits, terrainForHex, style: HEX_STYLE, visualDetailStyle: HEX_VISUAL_DETAIL_STYLE, unitCounts: UNIT_COUNTS };
  const patchTimer = setInterval(() => {
    if (patchGameHost()) clearInterval(patchTimer);
  }, 100);
  ensureCanvas();
  requestAnimationFrame(frame);
}

boot();

const HEX_STYLE = "rome-perspective-hex-battlefield-no-ui";
const HEX_VISUAL_DETAIL_STYLE = "webgl2-shaded-layered-hex-interiors";
const HEX_GRID = Object.freeze({ cols: 11, rows: 9 });
const CLASS_COLORS = Object.freeze({ light: "#3fad4f", medium: "#2f70d1", heavy: "#b93026" });
const BAND_COLORS = Object.freeze({ rome: "#c8231f", etruscan: "#d6aa3c", samnite: "#f0e6cf", greek: "#7a54bd", gallic: "#111318" });
const TERRAIN_TYPES = Object.freeze({ grass: "grass", water: "water", hill: "hill", fence: "fence" });
const UNIT_COUNTS = Object.freeze({ rome: { light: 5, medium: 4, heavy: 3 }, enemy: { light: 4, medium: 4, heavy: 2 } });
const TAU = Math.PI * 2;
const SQRT3 = Math.sqrt(3);
const HEX_Y_SCALE = 0.72;
const VERTEX_STRIDE = 9;

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
  if (type === TERRAIN_TYPES.water) return { movementCost: 3, defense: 0, blocksCharge: true, label: "water", terrainId: 1 };
  if (type === TERRAIN_TYPES.hill) return { movementCost: 2, defense: 1, blocksCharge: false, label: "hill", terrainId: 2 };
  if (type === TERRAIN_TYPES.fence) return { movementCost: 2, defense: 1, blocksCharge: true, label: "fence", terrainId: 3 };
  return { movementCost: 1, defense: 0, blocksCharge: false, label: "grass", terrainId: 0 };
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

let glCanvas = null;
let unitCanvas = null;
let unitCtx = null;
let gl = null;
let glProgram = null;
let glBuffer = null;
let battlefield = null;
let selectedUnitId = null;
let hoveredHexId = null;
let hoveredUnitId = null;
let lastRegionId = null;

function ensureCanvases() {
  if (glCanvas && unitCanvas) return;
  glCanvas = document.createElement("canvas");
  glCanvas.id = "cavalry-hex-webgl-canvas";
  Object.assign(glCanvas.style, { position: "fixed", inset: "0", width: "100%", height: "100%", zIndex: "4", pointerEvents: "none", display: "none", background: "#11130d" });
  unitCanvas = document.createElement("canvas");
  unitCanvas.id = "cavalry-hex-unit-canvas";
  Object.assign(unitCanvas.style, { position: "fixed", inset: "0", width: "100%", height: "100%", zIndex: "5", pointerEvents: "none", display: "none" });
  document.querySelector("#app")?.append(glCanvas, unitCanvas);
  unitCtx = unitCanvas.getContext("2d");
  unitCanvas.addEventListener("pointermove", onPointerMove);
  unitCanvas.addEventListener("pointerdown", onPointerDown);
  gl = glCanvas.getContext("webgl2", { antialias: true, alpha: false, depth: false, stencil: false, premultipliedAlpha: false });
  if (gl) initWebGl();
}

function compileShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) || "Hex shader compile failed");
  }
  return shader;
}

function initWebGl() {
  const vertex = compileShader(gl.VERTEX_SHADER, `#version 300 es
    precision highp float;
    in vec2 a_position;
    in vec2 a_center;
    in vec2 a_local;
    in float a_terrain;
    in float a_variant;
    in float a_hot;
    uniform vec2 u_resolution;
    out vec2 v_local;
    out vec2 v_centerLocal;
    out float v_terrain;
    out float v_variant;
    out float v_hot;
    void main() {
      vec2 zeroToOne = a_position / u_resolution;
      vec2 clip = zeroToOne * 2.0 - 1.0;
      gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
      v_local = a_local;
      v_centerLocal = (a_position - a_center) / max(u_resolution.y, 1.0);
      v_terrain = a_terrain;
      v_variant = a_variant;
      v_hot = a_hot;
    }
  `);
  const fragment = compileShader(gl.FRAGMENT_SHADER, `#version 300 es
    precision highp float;
    in vec2 v_local;
    in vec2 v_centerLocal;
    in float v_terrain;
    in float v_variant;
    in float v_hot;
    out vec4 outColor;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }

    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 5; i++) {
        v += noise(p) * a;
        p *= 2.03;
        a *= 0.52;
      }
      return v;
    }

    float hexEdge(vec2 p) {
      vec2 q = abs(p);
      return max(q.y, q.x * 0.866025 + q.y * 0.5);
    }

    float lineMask(float value, float width) {
      return 1.0 - smoothstep(width, width * 1.7, abs(value));
    }

    vec3 terrainBase(float terrain, vec2 uv, float n) {
      if (terrain < 0.5) {
        return mix(vec3(0.13, 0.30, 0.15), vec3(0.28, 0.50, 0.22), uv.y * 0.45 + n * 0.34);
      }
      if (terrain < 1.5) {
        return mix(vec3(0.07, 0.21, 0.27), vec3(0.22, 0.48, 0.55), uv.y * 0.32 + n * 0.26);
      }
      if (terrain < 2.5) {
        return mix(vec3(0.27, 0.27, 0.16), vec3(0.58, 0.53, 0.31), uv.y * 0.42 + n * 0.28);
      }
      return mix(vec3(0.15, 0.30, 0.14), vec3(0.34, 0.47, 0.24), uv.y * 0.40 + n * 0.30);
    }

    void main() {
      vec2 p = v_local;
      float edge = hexEdge(p);
      float interior = smoothstep(1.04, 0.96, edge);
      float rim = smoothstep(0.78, 1.02, edge);
      float bevel = smoothstep(0.62, 1.02, edge) * 0.22;
      vec2 uv = p * 0.5 + 0.5;
      float n = fbm(p * 5.5 + v_variant * 19.7);
      float fine = fbm(p * 18.0 + v_variant * 41.3);
      vec3 color = terrainBase(v_terrain, uv, n);

      if (v_terrain < 0.5) {
        float blades = smoothstep(0.68, 0.98, noise(p * vec2(32.0, 18.0) + v_variant));
        float strokes = lineMask(sin((p.x * 10.0 + p.y * 5.0 + v_variant * 6.28)), 0.16);
        color += vec3(0.08, 0.15, 0.03) * blades * 0.25;
        color += vec3(0.10, 0.16, 0.04) * strokes * 0.16;
        color = mix(color, vec3(0.08, 0.22, 0.10), fine * 0.20);
      } else if (v_terrain < 1.5) {
        float ripple = sin((p.y + v_variant) * 31.0 + sin(p.x * 9.0) * 2.5) * 0.5 + 0.5;
        float glint = smoothstep(0.72, 0.96, ripple) * smoothstep(-0.25, 0.65, p.y);
        color += vec3(0.14, 0.30, 0.30) * glint * 0.45;
        color = mix(color, vec3(0.03, 0.14, 0.20), rim * 0.28);
      } else if (v_terrain < 2.5) {
        float contour1 = lineMask(length(p * vec2(1.0, 1.35)) - 0.25, 0.025);
        float contour2 = lineMask(length(p * vec2(1.05, 1.2)) - 0.48, 0.023);
        float rock = smoothstep(0.68, 0.92, noise(p * 13.0 + v_variant * 3.0));
        color += vec3(0.20, 0.17, 0.10) * (contour1 + contour2) * 0.18;
        color = mix(color, vec3(0.33, 0.31, 0.24), rock * 0.28);
      } else {
        float rail = lineMask(p.y + p.x * 0.10, 0.030);
        float post = lineMask(fract((p.x + 0.53) * 4.8) - 0.5, 0.09) * smoothstep(0.34, 0.08, abs(p.y + p.x * 0.10));
        color += vec3(0.25, 0.13, 0.05) * rail * 0.65;
        color += vec3(0.30, 0.16, 0.07) * post * 0.55;
        color = mix(color, vec3(0.11, 0.25, 0.12), fine * 0.16);
      }

      vec3 light = vec3(0.18, 0.14, 0.08) * (1.0 - uv.y) + vec3(0.12, 0.10, 0.06) * (1.0 - uv.x);
      color += light;
      color *= 1.0 - bevel;
      color = mix(color, vec3(0.98, 0.82, 0.42), v_hot * smoothstep(0.72, 1.02, edge) * 0.42);
      color = mix(color, vec3(0.02, 0.025, 0.018), rim * 0.16);
      outColor = vec4(color, interior);
    }
  `);
  glProgram = gl.createProgram();
  gl.attachShader(glProgram, vertex);
  gl.attachShader(glProgram, fragment);
  gl.linkProgram(glProgram);
  if (!gl.getProgramParameter(glProgram, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(glProgram) || "Hex shader link failed");
  }
  glBuffer = gl.createBuffer();
}

function resize() {
  ensureCanvases();
  const ratio = Math.max(1, Math.min(2, devicePixelRatio || 1));
  const w = Math.max(1, Math.floor(unitCanvas.clientWidth * ratio));
  const h = Math.max(1, Math.floor(unitCanvas.clientHeight * ratio));
  for (const canvas of [glCanvas, unitCanvas]) {
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  }
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
  return { r, originX: (size.w - boardW) * 0.5 + SQRT3 * r * 0.5, originY: size.h * 0.06 + Math.max(0, usableH - boardH) * 0.08, yScale: HEX_Y_SCALE };
}

function projectHex(col, row, size) {
  const metrics = boardMetrics(size);
  return { x: metrics.originX + SQRT3 * metrics.r * (col + (row % 2 ? 0.5 : 0)), y: metrics.originY + metrics.yScale * metrics.r * (1 + row * 1.5), r: metrics.r, yScale: metrics.yScale, perspective: 1 };
}

function hexVertexLocal(i) {
  const angle = Math.PI / 6 + i * TAU / 6;
  return { x: Math.cos(angle), y: Math.sin(angle) };
}

function pushGlVertex(vertices, px, py, cx, cy, lx, ly, terrain, variant, hot) {
  vertices.push(px, py, cx, cy, lx, ly, terrain, variant, hot);
}

function appendHexTriangles(vertices, tile, p) {
  const hot = hoveredHexId === tile.id ? 1 : 0;
  const terrain = tile.terrainId;
  const variant = tile.visualVariant;
  for (let i = 0; i < 6; i += 1) {
    const a = hexVertexLocal(i);
    const b = hexVertexLocal((i + 1) % 6);
    pushGlVertex(vertices, p.x, p.y, p.x, p.y, 0, 0, terrain, variant, hot);
    pushGlVertex(vertices, p.x + a.x * p.r, p.y + a.y * p.r * p.yScale, p.x, p.y, a.x, a.y, terrain, variant, hot);
    pushGlVertex(vertices, p.x + b.x * p.r, p.y + b.y * p.r * p.yScale, p.x, p.y, b.x, b.y, terrain, variant, hot);
  }
}

function renderHexTilesWebGl(field, size) {
  if (!gl || !glProgram) return false;
  const vertices = [];
  for (const tile of field.tiles) appendHexTriangles(vertices, tile, projectHex(tile.col, tile.row, size));
  const data = new Float32Array(vertices);
  gl.viewport(0, 0, size.w, size.h);
  gl.clearColor(0.065, 0.085, 0.055, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(glProgram);
  gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
  const stride = VERTEX_STRIDE * 4;
  const attrs = [
    ["a_position", 2, 0], ["a_center", 2, 2], ["a_local", 2, 4], ["a_terrain", 1, 6], ["a_variant", 1, 7], ["a_hot", 1, 8]
  ];
  for (const [name, sizeAttr, offset] of attrs) {
    const location = gl.getAttribLocation(glProgram, name);
    if (location < 0) continue;
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, sizeAttr, gl.FLOAT, false, stride, offset * 4);
  }
  const resolution = gl.getUniformLocation(glProgram, "u_resolution");
  gl.uniform2f(resolution, size.w, size.h);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.drawArrays(gl.TRIANGLES, 0, data.length / VERTEX_STRIDE);
  return true;
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
  if (tile.terrainType === TERRAIN_TYPES.water) return { top: "#2d6573", mid: "#234f5d", low: "#163443" };
  if (tile.terrainType === TERRAIN_TYPES.hill) return { top: "#8a824e", mid: "#67633a", low: "#46492b" };
  if (tile.terrainType === TERRAIN_TYPES.fence) return { top: "#526f39", mid: "#3d5c31", low: "#2b4328" };
  return { top: "#3e7738", mid: "#2e5e31", low: "#203f25" };
}

function draw2DTileFallback(tile, size) {
  const p = projectHex(tile.col, tile.row, size);
  const palette = tilePalette(tile);
  const gradient = unitCtx.createLinearGradient(p.x - p.r * 0.6, p.y - p.r * p.yScale, p.x + p.r * 0.45, p.y + p.r * p.yScale);
  gradient.addColorStop(0, palette.top); gradient.addColorStop(0.56, palette.mid); gradient.addColorStop(1, palette.low);
  hexPath(unitCtx, p.x, p.y, p.r * 0.985, p.yScale);
  unitCtx.fillStyle = gradient;
  unitCtx.fill();
  unitCtx.strokeStyle = hoveredHexId === tile.id ? "rgba(255,236,164,.92)" : "rgba(238,218,148,.30)";
  unitCtx.lineWidth = hoveredHexId === tile.id ? Math.max(2.5, p.r * 0.050) : Math.max(1.2, p.r * 0.024);
  unitCtx.stroke();
}

function drawFallbackTiles(field, size) {
  for (const tile of field.tiles) draw2DTileFallback(tile, size);
}

function unitAt(col, row) { return battlefield?.units.find((unit) => unit.col === col && unit.row === row) ?? null; }

function drawUnit(unit, size) {
  const p = projectHex(unit.col, unit.row, size);
  const selectable = unit.army === "rome";
  const selected = selectable && selectedUnitId === unit.id;
  const hovered = selectable && hoveredUnitId === unit.id;
  const baseR = p.r * 0.42;
  unitCtx.save();
  unitCtx.shadowColor = "rgba(0,0,0,.55)";
  unitCtx.shadowBlur = p.r * 0.18;
  unitCtx.fillStyle = "rgba(13,11,8,.58)";
  unitCtx.beginPath();
  unitCtx.ellipse(p.x, p.y + baseR * 0.42 * p.yScale, baseR * 1.08, baseR * 0.42 * p.yScale, 0, 0, TAU);
  unitCtx.fill();

  unitCtx.shadowBlur = 0;
  unitCtx.fillStyle = selected ? "rgba(255,235,155,.62)" : hovered ? "rgba(255,235,155,.34)" : "rgba(30,23,16,.82)";
  unitCtx.beginPath();
  unitCtx.ellipse(p.x, p.y + baseR * 0.20 * p.yScale, baseR * 0.98, baseR * 0.46 * p.yScale, 0, 0, TAU);
  unitCtx.fill();
  unitCtx.strokeStyle = "rgba(255,225,145,.20)";
  unitCtx.lineWidth = Math.max(1, p.r * 0.018);
  unitCtx.stroke();

  const cluster = unit.troopType === "heavy" ? 5 : unit.troopType === "medium" ? 4 : 3;
  for (let i = 0; i < cluster; i += 1) {
    const offset = (i - (cluster - 1) / 2) * baseR * 0.28;
    const soldierX = p.x + offset;
    const soldierY = p.y - baseR * 0.18 * p.yScale + Math.abs(i - 2) * baseR * 0.04 * p.yScale;
    drawMiniSoldier(soldierX, soldierY, baseR * (unit.troopType === "heavy" ? 0.42 : 0.36), unit, p.yScale);
  }

  unitCtx.lineWidth = Math.max(3, p.r * 0.055);
  unitCtx.strokeStyle = unit.bandColor;
  unitCtx.beginPath();
  unitCtx.ellipse(p.x, p.y + baseR * 0.20 * p.yScale, baseR * 0.98, baseR * 0.46 * p.yScale, 0, 0, TAU);
  unitCtx.stroke();
  if (unit.army === "rome" && unit.troopType === "heavy") {
    unitCtx.strokeStyle = "#6e0d0c";
    unitCtx.lineWidth = Math.max(1, p.r * 0.025);
    unitCtx.stroke();
  }
  unitCtx.restore();
}

function drawMiniSoldier(x, y, s, unit, yScale) {
  unitCtx.fillStyle = unit.bodyColor;
  unitCtx.beginPath();
  unitCtx.roundRect(x - s * 0.30, y - s * 0.18 * yScale, s * 0.60, s * 0.70 * yScale, s * 0.12);
  unitCtx.fill();
  unitCtx.fillStyle = unit.bandColor;
  unitCtx.fillRect(x - s * 0.31, y + s * 0.02 * yScale, s * 0.62, s * 0.12 * yScale);
  unitCtx.fillStyle = "#d2b38a";
  unitCtx.beginPath();
  unitCtx.arc(x, y - s * 0.30 * yScale, s * 0.20, 0, TAU);
  unitCtx.fill();
  unitCtx.fillStyle = unit.troopType === "heavy" ? "#c7b073" : "#6b6d6d";
  unitCtx.beginPath();
  unitCtx.ellipse(x, y - s * 0.42 * yScale, s * 0.24, s * 0.12 * yScale, 0, 0, TAU);
  unitCtx.fill();
}

function drawUnitsAndFallback(field, size, didUseWebGl) {
  unitCtx.clearRect(0, 0, size.w, size.h);
  if (!didUseWebGl) {
    unitCtx.fillStyle = "#11130d";
    unitCtx.fillRect(0, 0, size.w, size.h);
    drawFallbackTiles(field, size);
  }
  field.units.sort((a, b) => a.row - b.row || a.col - b.col).forEach((unit) => drawUnit(unit, size));
  unitCtx.save();
  unitCtx.globalAlpha = 0.20;
  unitCtx.fillStyle = "#6a1713";
  unitCtx.beginPath();
  unitCtx.moveTo(size.w * 0.18, size.h * 0.95);
  unitCtx.lineTo(size.w * 0.82, size.h * 0.95);
  unitCtx.lineTo(size.w * 0.64, size.h * 0.88);
  unitCtx.lineTo(size.w * 0.36, size.h * 0.88);
  unitCtx.closePath();
  unitCtx.fill();
  unitCtx.restore();
}

function drawBattlefield(snapshot) {
  const size = resize();
  const field = battlefieldForSnapshot(snapshot);
  const didUseWebGl = renderHexTilesWebGl(field, size);
  drawUnitsAndFallback(field, size, didUseWebGl);
}

function nearestHex(clientX, clientY) {
  const rect = unitCanvas.getBoundingClientRect();
  const size = { w: unitCanvas.width, h: unitCanvas.height };
  const x = (clientX - rect.left) * (unitCanvas.width / Math.max(1, rect.width));
  const y = (clientY - rect.top) * (unitCanvas.height / Math.max(1, rect.height));
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
        renderer: gl ? "webgl2-shaded-tiles" : "canvas2d-fallback-tiles",
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
  host.getHexBattlefieldSnapshot = () => battlefield ? { ...battlefield, selectedUnitId, hoveredHexId, hoveredUnitId, selectableArmy: "rome", visualDetailStyle: HEX_VISUAL_DETAIL_STYLE, renderer: gl ? "webgl2-shaded-tiles" : "canvas2d-fallback-tiles" } : null;
  host.__cavalryHexPatched = true;
  return true;
}

function frame() {
  ensureCanvases();
  const snapshot = globalThis.GameHost?.getSnapshot?.() ?? {};
  const active = snapshot.mode === "battlefield";
  window.CavalryHexBattlefieldActive = active;
  glCanvas.style.display = active ? "block" : "none";
  unitCanvas.style.display = active ? "block" : "none";
  unitCanvas.style.pointerEvents = active ? "auto" : "none";
  if (active) drawBattlefield(snapshot);
  requestAnimationFrame(frame);
}

function boot() {
  window.CavalryHexBattlefield = { createHexBattlefield, createBattleUnits, terrainForHex, style: HEX_STYLE, visualDetailStyle: HEX_VISUAL_DETAIL_STYLE, unitCounts: UNIT_COUNTS };
  const patchTimer = setInterval(() => {
    if (patchGameHost()) clearInterval(patchTimer);
  }, 100);
  ensureCanvases();
  requestAnimationFrame(frame);
}

boot();

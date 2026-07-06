const canvas = document.querySelector("#game");
const hud = document.querySelector("#hud");
const ctx = canvas.getContext("2d");

const state = {
  t: 0,
  camera: { x: 0, z: 0, zoom: 1 },
  keys: new Set(),
  clouds: Array.from({ length: 20 }, (_, i) => ({
    x: Math.cos(i * 2.17) * 520,
    y: 55 + (i % 3) * 54,
    scale: 0.75 + (i % 5) * 0.18,
    speed: 4 + (i % 4) * 1.7,
    layer: i % 3
  }))
};

function resize() {
  canvas.width = Math.floor(innerWidth * devicePixelRatio);
  canvas.height = Math.floor(innerHeight * devicePixelRatio);
  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
addEventListener("resize", resize);
resize();

addEventListener("keydown", event => state.keys.add(event.code));
addEventListener("keyup", event => state.keys.delete(event.code));
addEventListener("blur", () => state.keys.clear());
canvas.addEventListener("wheel", event => {
  event.preventDefault();
  state.camera.zoom = Math.max(0.65, Math.min(1.8, state.camera.zoom + event.deltaY * -0.001));
}, { passive: false });

function islandHeight(x, z) {
  const d = Math.hypot(x, z) / 310;
  const coast = 1 + Math.sin(Math.atan2(z, x) * 5) * 0.09 + Math.cos(Math.atan2(z, x) * 9) * 0.05;
  const n = Math.max(0, 1 - d / coast);
  return Math.pow(n, 0.72) * 78 + Math.sin(x * 0.025) * Math.sin(z * 0.018) * 5 * n;
}

function masks(x, z) {
  const h = islandHeight(x, z);
  const d = Math.hypot(x, z);
  return {
    h,
    water: d > 330,
    beach: d > 260 && d <= 330,
    grass: d <= 260 && h < 55,
    rock: h >= 55
  };
}

function worldToScreen(x, z, h = 0) {
  const cx = innerWidth / 2;
  const cy = innerHeight * 0.58;
  const zoom = state.camera.zoom;
  const sx = cx + (x - state.camera.x) * zoom;
  const sy = cy + (z - state.camera.z) * 0.48 * zoom - h * 1.1 * zoom;
  return { x: sx, y: sy };
}

function fillEllipse(x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawCloud(c) {
  c.x += c.speed * 0.016;
  if (c.x > 820) c.x = -820;
  const alpha = [0.45, 0.34, 0.24][c.layer];
  ctx.globalAlpha = alpha;
  const y = c.y + Math.sin(state.t * 0.4 + c.x * 0.01) * 4;
  fillEllipse(c.x + innerWidth / 2, y, 68 * c.scale, 18 * c.scale, "#fff8e8");
  fillEllipse(c.x + innerWidth / 2 - 34 * c.scale, y + 7, 40 * c.scale, 15 * c.scale, "#fff8e8");
  fillEllipse(c.x + innerWidth / 2 + 40 * c.scale, y + 5, 50 * c.scale, 17 * c.scale, "#fff8e8");
  ctx.globalAlpha = 1;
}

function drawIsland() {
  for (let z = 390; z >= -390; z -= 10) {
    for (let x = -420; x <= 420; x += 10) {
      const m = masks(x, z);
      if (m.water) continue;
      const p = worldToScreen(x, z, m.h);
      const color = m.beach ? "#e6c98c" : m.rock ? "#807d70" : "#4f8d4d";
      ctx.fillStyle = color;
      ctx.fillRect(p.x - 5 * state.camera.zoom, p.y - 3 * state.camera.zoom, 10 * state.camera.zoom, 7 * state.camera.zoom);
    }
  }
}

function drawObjects() {
  const props = [
    [130, 180, "palm"], [-140, 180, "palm"], [55, 95, "palm"], [-90, 40, "rock"], [180, -20, "rock"], [-210, -40, "driftwood"], [235, 130, "reef"], [-260, 110, "reef"]
  ];
  for (const [x, z, kind] of props) {
    const h = islandHeight(x, z);
    const p = worldToScreen(x, z, h);
    if (kind === "palm") {
      ctx.strokeStyle = "#7b5534";
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + 5, p.y - 34); ctx.stroke();
      ctx.fillStyle = "#2f8f52";
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.ellipse(p.x + Math.cos(i) * 18, p.y - 38 + Math.sin(i) * 8, 23, 7, i, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      fillEllipse(p.x, p.y, kind === "reef" ? 12 : 16, kind === "reef" ? 6 : 10, kind === "reef" ? "#e48c74" : "#77766b");
    }
  }
}

function step(dt) {
  state.t += dt;
  const speed = 150 * dt;
  if (state.keys.has("KeyW")) state.camera.z -= speed;
  if (state.keys.has("KeyS")) state.camera.z += speed;
  if (state.keys.has("KeyA")) state.camera.x -= speed;
  if (state.keys.has("KeyD")) state.camera.x += speed;
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  step(dt);
  const g = ctx.createLinearGradient(0, 0, 0, innerHeight);
  g.addColorStop(0, "#f4c99e");
  g.addColorStop(0.45, "#f8dec2");
  g.addColorStop(1, "#2d9aaa");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, innerWidth, innerHeight);
  for (const cloud of state.clouds) drawCloud(cloud);
  fillEllipse(innerWidth / 2 - state.camera.x * state.camera.zoom, innerHeight * 0.58 - state.camera.z * 0.48 * state.camera.zoom, 760 * state.camera.zoom, 260 * state.camera.zoom, "rgba(38, 160, 174, .46)");
  drawIsland();
  drawObjects();
  hud.innerHTML = "<strong>Cozy Island</strong><br>WASD drift · wheel zoom<br>ocean island landform + water plane + 3 cloud layers · renderer-only host";
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

globalThis.CozyIsland = { state, sampleHeight: islandHeight, sampleMasks: masks };

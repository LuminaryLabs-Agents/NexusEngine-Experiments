import { clamp, forwardFromYaw, rightFromYaw } from "./math.js";

function hexToRgb(hex, fallback = [127, 220, 255]) {
  const clean = String(hex ?? "").replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(clean)) return fallback;
  return [parseInt(clean.slice(0, 2), 16), parseInt(clean.slice(2, 4), 16), parseInt(clean.slice(4, 6), 16)];
}

function rgba(hex, alpha, fallback) {
  const [r, g, b] = hexToRgb(hex, fallback);
  return `rgba(${r},${g},${b},${alpha})`;
}

function resize(canvas, ctx) {
  const ratio = Math.min(devicePixelRatio || 1, 2);
  const width = Math.max(320, innerWidth);
  const height = Math.max(240, innerHeight);
  const nextWidth = Math.floor(width * ratio);
  const nextHeight = Math.floor(height * ratio);
  if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
    canvas.width = nextWidth;
    canvas.height = nextHeight;
  }
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { width, height };
}

function material(snapshot, id) {
  return snapshot.visual?.materials?.byId?.[id] ?? { albedo: "#8ca0a0", emissive: null, alpha: 1 };
}

function createProjector(size, player) {
  const focal = Math.min(size.width, size.height) * 0.82;
  const fwd = forwardFromYaw(player.yaw);
  const right = rightFromYaw(player.yaw);
  return (point, height = 0) => {
    const dx = Number(point?.x ?? 0) - player.x;
    const dz = Number(point?.z ?? point?.y ?? 0) - player.z;
    const x = dx * right.x + dz * right.z;
    const z = dx * fwd.x + dz * fwd.z;
    if (z <= 0.25) return null;
    const scale = focal / z;
    return { x: size.width / 2 + x * scale, y: size.height * 0.58 - height * scale, scale, z, alpha: clamp(1 - z / 58, 0.05, 1) };
  };
}

function drawBackdrop(ctx, size, snapshot) {
  const atmo = snapshot.visual?.fog?.atmosphere ?? {};
  const sky = ctx.createLinearGradient(0, 0, 0, size.height * 0.64);
  sky.addColorStop(0, atmo.zenith ?? "#07111a");
  sky.addColorStop(0.6, atmo.horizon ?? "#172b37");
  sky.addColorStop(1, atmo.fogColor ?? "#102333");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, size.width, size.height * 0.62);
  const ground = ctx.createLinearGradient(0, size.height * 0.56, 0, size.height);
  ground.addColorStop(0, "#121d17");
  ground.addColorStop(1, "#050807");
  ctx.fillStyle = ground;
  ctx.fillRect(0, size.height * 0.58, size.width, size.height * 0.42);
}

function dynamicObject(snapshot, object) {
  const game = snapshot.game;
  const relay = game.relays.find((entry) => entry.id === object.id);
  if (relay) return { ...object, position: { x: relay.x, z: relay.z }, relay };
  if (object.id === game.gate.id) return { ...object, position: { x: game.gate.x, z: game.gate.z }, gate: game.gate };
  const wraith = game.wraiths.find((entry) => entry.id === object.id);
  if (wraith) return { ...object, position: { x: wraith.x, z: wraith.z }, wraith };
  return object;
}

function drawVolumetric(ctx, snapshot, project) {
  for (const light of snapshot.visual?.volumetric?.lights ?? []) {
    const p = project(light.position, 1.4);
    if (!p) continue;
    const radius = clamp((light.radius ?? 4) * p.scale, 18, 260);
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
    g.addColorStop(0, rgba(light.color, 0.2 * p.alpha * light.intensity, [126, 232, 255]));
    g.addColorStop(0.36, rgba(light.color, 0.07 * p.alpha * light.intensity, [126, 232, 255]));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGroundFractals(ctx, snapshot, project) {
  for (const mottle of snapshot.visualFractal?.groundMottles ?? []) {
    const p = project(mottle.position, 0.02);
    if (!p) continue;
    ctx.fillStyle = rgba(mottle.color, mottle.opacity * p.alpha, [157, 234, 255]);
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, clamp(mottle.radius * p.scale, 4, 90), clamp(mottle.radius * 0.34 * p.scale, 2, 26), mottle.rotation ?? 0, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const breadcrumb of snapshot.visualFractal?.memoryBreadcrumbs ?? []) {
    const p = project(breadcrumb.position, 0.035);
    if (!p) continue;
    ctx.fillStyle = rgba(breadcrumb.color, breadcrumb.opacity * p.alpha, [157, 234, 255]);
    ctx.beginPath();
    ctx.arc(p.x, p.y, clamp(breadcrumb.radius * p.scale, 3, 18), 0, Math.PI * 2);
    ctx.fill();
  }
  for (const pocket of snapshot.visualFractal?.safePockets ?? []) {
    const p = project(pocket.position, 0.04);
    if (!p) continue;
    ctx.strokeStyle = rgba(pocket.color, pocket.opacity * p.alpha, [186, 252, 255]);
    ctx.lineWidth = Math.max(1, p.scale * 0.012);
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, clamp(pocket.radius * p.scale, 8, 180), clamp(pocket.radius * 0.34 * p.scale, 4, 60), 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (const thread of snapshot.visualFractal?.routeThreads ?? []) {
    const p = project(thread.position, 0.03);
    if (!p) continue;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(thread.yaw ?? 0);
    ctx.fillStyle = rgba(thread.color, thread.opacity * p.alpha, [119, 243, 255]);
    ctx.fillRect(-clamp(thread.width * p.scale, 2, 36) / 2, -clamp(thread.length * p.scale, 16, 360) / 2, clamp(thread.width * p.scale, 2, 36), clamp(thread.length * p.scale, 16, 360));
    ctx.restore();
  }
}

function drawScanCone(ctx, cone, project) {
  const p = project(cone.position, 0.12);
  if (!p) return;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(cone.yaw ?? 0);
  ctx.fillStyle = rgba(cone.color, cone.opacity * p.alpha, [186, 252, 255]);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, clamp(cone.length * p.scale, 30, 280), -cone.angle, cone.angle);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawSignalFractals(ctx, snapshot, project) {
  for (const cone of snapshot.visualFractal?.scanCones ?? []) drawScanCone(ctx, cone, project);
  for (const shaft of snapshot.visualFractal?.canopyShafts ?? []) {
    const p = project(shaft.position, shaft.height * 0.45);
    if (!p) continue;
    const radius = clamp(shaft.radius * p.scale, 18, 220);
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
    g.addColorStop(0, rgba(shaft.color, shaft.opacity * p.alpha, [157, 234, 255]));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, radius * 0.72, radius * 1.9, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const needle of snapshot.visualFractal?.objectiveNeedles ?? []) {
    const p = project(needle.position, needle.height ?? 2.4);
    if (!p) continue;
    ctx.strokeStyle = rgba(needle.color, needle.opacity * p.alpha, [119, 243, 255]);
    ctx.lineWidth = Math.max(2, p.scale * 0.022);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x, p.y - clamp((needle.height ?? 3) * p.scale, 18, 150));
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(p.x, p.y, clamp(needle.radius * p.scale, 10, 160), 0, Math.PI * 2);
    ctx.stroke();
  }
  for (const sigil of snapshot.visualFractal?.gateSigils ?? []) {
    const p = project(sigil.position, 0.08);
    if (!p) continue;
    ctx.strokeStyle = rgba(sigil.color, sigil.opacity * p.alpha, [186, 252, 255]);
    ctx.lineWidth = Math.max(1, p.scale * 0.018);
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, clamp(sigil.radius * p.scale, 8, 190), clamp(sigil.radius * 0.32 * p.scale, 4, 62), sigil.rotation ?? 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (const aura of snapshot.visualFractal?.relayAuras ?? []) {
    const p = project(aura.position, 0.1);
    if (!p) continue;
    ctx.strokeStyle = rgba(aura.color, aura.opacity * p.alpha, [119, 243, 255]);
    ctx.lineWidth = Math.max(2, p.scale * 0.025);
    ctx.beginPath();
    ctx.arc(p.x, p.y, clamp(aura.radius * p.scale, 8, 150), 0, Math.PI * 2);
    ctx.stroke();
  }
  for (const pressure of snapshot.visualFractal?.pressureVignettes ?? []) {
    const p = project(pressure.position, 1.1);
    if (!p) continue;
    const radius = clamp(pressure.radius * p.scale, 32, 280);
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(0.58, rgba(pressure.color, pressure.opacity * 0.28 * p.alpha, [255, 80, 104]));
    g.addColorStop(1, rgba(pressure.color, pressure.opacity * p.alpha, [255, 80, 104]));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const echo of snapshot.visualFractal?.wraithEchoes ?? []) {
    const p = project(echo.position, 1.2);
    if (!p) continue;
    const radius = clamp(echo.radius * p.scale, 14, 210);
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
    g.addColorStop(0, rgba(echo.color, echo.opacity * p.alpha, [255, 80, 104]));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, radius * 0.58, radius, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawRelay(ctx, p, mat, relay) {
  const h = clamp(2.2 * p.scale, 24, 160);
  const w = Math.max(8, h * 0.18);
  const color = relay?.scanned ? "#bafcff" : mat.emissive ?? "#77f3ff";
  ctx.fillStyle = `rgba(18,35,38,${0.82 * p.alpha})`;
  ctx.fillRect(p.x - w / 2, p.y - h, w, h);
  ctx.fillStyle = rgba(color, 0.92 * p.alpha, [126, 232, 255]);
  ctx.beginPath();
  ctx.arc(p.x, p.y - h * 0.86, Math.max(5, w * 0.85), 0, Math.PI * 2);
  ctx.fill();
  if (relay?.scanProgress > 0 && !relay.scanned) {
    ctx.strokeStyle = rgba(color, 0.9 * p.alpha, [126, 232, 255]);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(p.x, p.y - h * 0.86, h * 0.22, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * relay.scanProgress);
    ctx.stroke();
  }
}

function drawGate(ctx, p, gate) {
  const h = clamp(3.6 * p.scale, 42, 260);
  const w = h * 0.75;
  const alpha = 0.42 + (gate?.openProgress ?? 0) * 0.48;
  ctx.strokeStyle = `rgba(120,252,255,${alpha * p.alpha})`;
  ctx.lineWidth = Math.max(3, h * 0.045);
  ctx.beginPath();
  ctx.moveTo(p.x - w / 2, p.y);
  ctx.lineTo(p.x - w / 2, p.y - h * 0.72);
  ctx.quadraticCurveTo(p.x, p.y - h, p.x + w / 2, p.y - h * 0.72);
  ctx.lineTo(p.x + w / 2, p.y);
  ctx.stroke();
}

function drawWraith(ctx, p, wraith) {
  const h = clamp(2.6 * p.scale, 26, 190);
  const w = h * 0.48;
  const danger = wraith?.mode === "chase" ? 1 : 0.45;
  const g = ctx.createRadialGradient(p.x, p.y - h * 0.5, 0, p.x, p.y - h * 0.5, w);
  g.addColorStop(0, `rgba(255,80,104,${0.42 * danger * p.alpha})`);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(p.x, p.y - h * 0.5, w, h * 0.62, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawTree(ctx, p, object, mat) {
  const h = clamp(2.8 * p.scale * Number(object.transform?.scale ?? object.metadata?.scale ?? 1), 18, 220);
  const w = Math.max(3, h * 0.18);
  ctx.fillStyle = `rgba(15,22,14,${0.48 * p.alpha})`;
  ctx.fillRect(p.x - w / 2, p.y - h, w, h);
  ctx.fillStyle = rgba(mat.albedo ?? "#1e3a23", 0.28 * p.alpha, [30, 58, 35]);
  ctx.beginPath();
  ctx.ellipse(p.x, p.y - h * 0.82, h * 0.18, h * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawObject(ctx, snapshot, project, raw) {
  const object = dynamicObject(snapshot, raw);
  if (object.layer === "terrain" || object.archetype === "fog-volume") return;
  const p = project(object.position ?? object.transform, 0);
  if (!p) return;
  const mat = material(snapshot, object.materialId);
  if (object.archetype === "relay") return drawRelay(ctx, p, mat, object.relay);
  if (object.archetype === "gate") return drawGate(ctx, p, object.gate);
  if (object.archetype === "wraith") return drawWraith(ctx, p, object.wraith);
  if (["trunk", "fern", "glow-plant", "tree", "scatter"].includes(object.archetype)) return drawTree(ctx, p, object, mat);
  ctx.fillStyle = rgba(mat.albedo ?? "#819299", 0.55 * p.alpha, [129, 146, 153]);
  ctx.beginPath();
  ctx.arc(p.x, p.y - p.scale * 0.5, clamp(p.scale, 6, 60), 0, Math.PI * 2);
  ctx.fill();
}

function drawCompass(ctx, snapshot, project) {
  const game = snapshot.game;
  const target = game.relays.find((relay) => !relay.scanned) ?? (!game.gate.entered ? game.gate : null);
  const p = target ? project(target, 1.4) : null;
  if (!p) return;
  ctx.strokeStyle = target.id?.startsWith?.("relay") ? "rgba(126,232,255,0.72)" : "rgba(186,252,255,0.82)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(p.x, p.y, Math.max(12, p.scale * 0.45), 0, Math.PI * 2);
  ctx.stroke();
}

function drawFog(ctx, size, snapshot) {
  const atmo = snapshot.visual?.fog?.atmosphere ?? {};
  ctx.fillStyle = rgba(atmo.fogColor ?? "#102333", clamp(Number(atmo.haze ?? 0.045) * 4.4, 0.12, 0.38), [16, 35, 51]);
  ctx.fillRect(0, 0, size.width, size.height);
  for (let i = 0; i < 9; i += 1) {
    ctx.fillStyle = `rgba(150,200,215,${0.028 + i * 0.006})`;
    ctx.fillRect(0, size.height * (0.2 + i * 0.085), size.width, 18 + i * 3);
  }
}

export function createCanvasRenderer(canvas) {
  const ctx = canvas.getContext("2d");
  return {
    draw(snapshot) {
      const size = resize(canvas, ctx);
      const project = createProjector(size, snapshot.game.player);
      ctx.clearRect(0, 0, size.width, size.height);
      drawBackdrop(ctx, size, snapshot);
      drawGroundFractals(ctx, snapshot, project);
      drawVolumetric(ctx, snapshot, project);
      drawSignalFractals(ctx, snapshot, project);
      for (const object of snapshot.visual?.layers?.drawOrder ?? []) drawObject(ctx, snapshot, project, object);
      drawCompass(ctx, snapshot, project);
      drawFog(ctx, size, snapshot);
      if (snapshot.game.mode === "failed") {
        ctx.fillStyle = "rgba(120,0,20,0.28)";
        ctx.fillRect(0, 0, size.width, size.height);
      }
      if (snapshot.game.mode === "complete") {
        ctx.fillStyle = "rgba(126,232,255,0.08)";
        ctx.fillRect(0, 0, size.width, size.height);
      }
    }
  };
}

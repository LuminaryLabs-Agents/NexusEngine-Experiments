const TAU = Math.PI * 2;
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));

function rgba(hex, alpha = 1) {
  const value = String(hex || '#ffffff').replace('#', '');
  const ok = /^[0-9a-f]{6}$/i.test(value);
  const r = ok ? parseInt(value.slice(0, 2), 16) : 255;
  const g = ok ? parseInt(value.slice(2, 4), 16) : 255;
  const b = ok ? parseInt(value.slice(4, 6), 16) : 255;
  return `rgba(${r},${g},${b},${clamp(alpha, 0, 1)})`;
}

function circle(ctx, x, y, radius, color, alpha = 0.8) {
  ctx.save();
  ctx.shadowBlur = 16;
  ctx.shadowColor = color;
  ctx.fillStyle = rgba(color, alpha);
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function ring(ctx, center, radius, color, alpha = 0.16, lineWidth = 1) {
  ctx.save();
  ctx.strokeStyle = rgba(color, alpha);
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.arc(center?.x || 0, center?.y || 0, radius || 0, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

function line(ctx, from, to, color, alpha = 0.18, lineWidth = 1.5) {
  ctx.save();
  ctx.strokeStyle = rgba(color, alpha);
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(from?.x || 0, from?.y || 0);
  ctx.lineTo(to?.x || 0, to?.y || 0);
  ctx.stroke();
  ctx.restore();
}

function health(ctx, entity, radius, color) {
  if (!entity.maxHp) return;
  const pct = clamp(entity.hp / entity.maxHp, 0, 1);
  ctx.save();
  ctx.strokeStyle = rgba(color, 0.2 + pct * 0.7);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(entity.x || 0, entity.y || 0, radius, -Math.PI / 2, -Math.PI / 2 + TAU * pct);
  ctx.stroke();
  ctx.restore();
}

function drawHellscapeFractal(ctx, visualFractal) {
  const descriptors = visualFractal?.rendererHandoff?.descriptors ?? {};
  const pressure = descriptors.realmPressure;
  if (pressure) {
    for (const pressureRing of pressure.rings || []) {
      ring(ctx, pressure.center, pressureRing.radius, pressure.color, pressureRing.alpha, 1.2 + pressure.pressure * 1.8);
    }
  }

  const defense = descriptors.coreDefense;
  if (defense) {
    for (const coreRing of defense.coreRings || []) {
      ring(ctx, defense.core, coreRing.radius, coreRing.color, coreRing.alpha, 1.1);
    }
    for (const coverage of defense.coverage || []) {
      ring(ctx, coverage.center, coverage.radius, coverage.color, coverage.alpha, coverage.kind === 'turret' ? 1.5 : 1);
    }
  }

  const threat = descriptors.threatLanes;
  if (threat?.spawnRing) {
    ring(ctx, threat.spawnRing.center, threat.spawnRing.radius, threat.spawnRing.color, threat.spawnRing.alpha, threat.waveActive ? 2 : 1);
  }
  for (const lane of threat?.lanes || []) {
    line(ctx, lane.from, lane.to, lane.color, lane.enemyType === 'brute' ? 0.28 : 0.18, lane.enemyType === 'brute' ? 2.4 : 1.4);
  }

  for (const route of descriptors.resourceRoutes || []) {
    line(ctx, route.from, route.to, route.color, route.kind === 'drop-route-thread' ? 0.26 : 0.13, route.kind === 'drop-route-thread' ? 2 : 1);
  }

  for (const beacon of descriptors.portalBeacons || []) {
    ring(ctx, beacon.center, beacon.interactionRadius, beacon.color, 0.2 + beacon.risk * 0.18, 1.6);
    ring(ctx, beacon.center, beacon.interactionRadius + 18 + beacon.risk * 12, beacon.color, 0.08 + beacon.risk * 0.12, 1);
  }

  const affordance = descriptors.buildAffordances;
  if (affordance) {
    for (const option of affordance.options || []) {
      const theta = (option.selected ? -Math.PI / 2 : Math.PI / 2) + (Number(option.radius) || 54) * 0.001;
      const center = {
        x: affordance.anchor.x + Math.cos(theta) * (56 + option.radius * 0.12),
        y: affordance.anchor.y + Math.sin(theta) * (56 + option.radius * 0.12)
      };
      ring(ctx, center, option.selected ? 18 : 12, option.color, option.canAfford ? option.alpha : 0.06, option.selected ? 2 : 1);
    }
  }
}

function resizeCanvas(canvas, ctx) {
  const dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
  const width = Math.max(320, globalThis.innerWidth || 960);
  const height = Math.max(240, globalThis.innerHeight || 540);
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export function createCanvasRenderer(canvas) {
  const ctx = canvas['get' + 'Context']('2d');
  function resize() { resizeCanvas(canvas, ctx); }
  function draw(state) {
    const width = globalThis.innerWidth || 960;
    const height = globalThis.innerHeight || 540;
    const cam = state.camera || { x: 0, y: 0 };
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = state.realm?.id === 'lobby' ? '#120404' : '#06111a';
    ctx.fillRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2 - cam.x, height / 2 - cam.y);
    ctx.strokeStyle = state.wave?.active ? 'rgba(255,51,0,.32)' : 'rgba(87,199,255,.18)';
    ctx.lineWidth = 1.2;
    for (let r = 160; r < 1160; r += 160) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, TAU);
      ctx.stroke();
    }
    drawHellscapeFractal(ctx, state.visualFractal);
    if (state.realm?.id === 'lobby') {
      const coreColor = state.wave?.active ? '#ff3300' : '#38bdf8';
      circle(ctx, state.core.x, state.core.y, 46, coreColor, 0.72);
      health(ctx, state.core, 58, coreColor);
      for (const portal of state.portals || []) {
        circle(ctx, portal.x, portal.y, 30, portal.color, 0.42);
        ctx.fillStyle = portal.color;
        ctx.font = 'bold 10px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(portal.label, portal.x, portal.y - 48);
      }
    } else {
      circle(ctx, 0, -350, 30, '#00f5ff', 0.55);
      ctx.fillStyle = '#00f5ff';
      ctx.font = 'bold 10px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('BASE', 0, -398);
    }
    for (const resource of state.resources || []) {
      circle(ctx, resource.x, resource.y, resource.size || 16, resource.color || '#ffffff', 0.55);
      health(ctx, resource, (resource.size || 16) + 12, resource.color || '#ffffff');
    }
    for (const structure of state.structures || []) {
      const color = structure.color || (structure.kind === 'pylon' ? '#10b981' : structure.kind === 'turret' ? '#38bdf8' : '#94a3b8');
      circle(ctx, structure.x, structure.y, 24, color, 0.64);
      health(ctx, structure, 36, color);
    }
    for (const enemy of state.enemies || []) {
      const color = enemy.type === 'brute' ? '#f97316' : '#ef4444';
      circle(ctx, enemy.x, enemy.y, enemy.size || 18, color, 0.72);
      health(ctx, enemy, (enemy.size || 18) + 12, color);
    }
    circle(ctx, state.player.x, state.player.y, 18, state.player.hurt > 0 ? '#ff553c' : '#00f5ff', 0.9);
    health(ctx, state.player, 34, state.player.hurt > 0 ? '#ff553c' : '#00f5ff');
    for (const drop of state.drops || []) circle(ctx, drop.x, drop.y, 7, drop.color || '#ffffff', 0.9);
    for (const beam of state.fx?.beams || []) {
      ctx.strokeStyle = 'rgba(0,255,255,.75)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(beam.x1, beam.y1);
      ctx.lineTo(beam.x2, beam.y2);
      ctx.stroke();
    }
    for (const particle of state.fx?.particles || []) {
      ctx.fillStyle = particle.color || '#ffffff';
      ctx.fillRect(particle.x, particle.y, particle.size || 3, particle.size || 3);
    }
    ctx.restore();
  }
  return { resize, draw };
}

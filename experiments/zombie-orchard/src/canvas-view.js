const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const appleColor = (r) => r === "legendary" ? "#d36bff" : r === "rare" ? "#ffe06b" : r === "cursed" ? "#ad57ff" : "#df3f38";
const monsterColor = (m) => m.boss ? "#ff365f" : m.elite ? "#f0d27b" : m.archetypeId === "runner-zombie" ? "#a4f080" : "#87a45f";

function resize(canvas) {
  const dpr = Math.min(2, devicePixelRatio || 1);
  const w = Math.max(320, Math.floor(canvas.clientWidth * dpr));
  const h = Math.max(240, Math.floor(canvas.clientHeight * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  return { w, h };
}

export function createCanvasView(canvas) {
  const ctx = canvas.getContext("2d");
  let cam = { x: 0, z: 20, zoom: 8.4 };
  const p = (q, s) => ({ x: s.w / 2 + (n(q?.x) - cam.x) * cam.zoom, y: s.h / 2 + (n(q?.z ?? q?.y) - cam.z) * cam.zoom });
  const label = (t, x, y) => { ctx.save(); ctx.font = "700 12px system-ui"; ctx.textAlign = "center"; ctx.lineWidth = 4; ctx.strokeStyle = "#000a"; ctx.strokeText(t, x, y); ctx.fillStyle = "#fff0d0"; ctx.fillText(t, x, y); ctx.restore(); };
  function dot(point, s, color, radius, text) { const q = p(point, s); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(q.x, q.y, radius, 0, Math.PI * 2); ctx.fill(); if (text) label(text, q.x, q.y - 16); return q; }
  function descriptorRect(desc, s, color = desc.color, opacity = desc.opacity) {
    const q = p(desc.center ?? desc.position, s);
    ctx.save();
    ctx.translate(q.x, q.y);
    ctx.rotate(n(desc.rotation));
    ctx.globalAlpha = n(opacity, 0.12);
    ctx.fillStyle = color ?? "#fff";
    ctx.fillRect(-n(desc.width, 1) * cam.zoom / 2, -n(desc.length, 1) * cam.zoom / 2, n(desc.width, 1) * cam.zoom, n(desc.length, 1) * cam.zoom);
    ctx.restore();
  }
  function strokeCircle(desc, s, fallbackColor = "#fff", fallbackOpacity = 0.2) {
    const q = p(desc.position ?? desc.center, s);
    ctx.save();
    ctx.strokeStyle = desc.color ?? fallbackColor;
    ctx.globalAlpha = n(desc.opacity, fallbackOpacity);
    ctx.lineWidth = Math.max(1, n(desc.thickness, 1.6));
    ctx.beginPath();
    ctx.arc(q.x, q.y, n(desc.radius, 2) * cam.zoom, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  function strokeRoute(desc, s) {
    const from = p(desc.from, s);
    const to = p(desc.to, s);
    ctx.save();
    ctx.strokeStyle = desc.color ?? "#fff0b8";
    ctx.globalAlpha = n(desc.opacity, 0.2);
    ctx.lineWidth = Math.max(1, n(desc.width, 1));
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }
  return { render(snapshot = {}) {
    const s = resize(canvas);
    const player = snapshot.player ?? { position: { x: 0, z: 0 } };
    const visual = snapshot.visualDomains ?? {};
    const handoffDescriptors = snapshot.rendererHandoff?.descriptors ?? {};
    const readability = {
      ...(visual.survivalReadability?.rendererHandoff?.descriptors ?? snapshot.survivalReadability?.rendererHandoff?.descriptors ?? {}),
      ...(visual.foragingReadability?.rendererHandoff?.descriptors ?? snapshot.foragingReadability?.rendererHandoff?.descriptors ?? {}),
      ...handoffDescriptors
    };
    cam.x += (n(player.position?.x) - cam.x) * 0.09;
    cam.z += (n(player.position?.z, 20) - cam.z) * 0.09;
    cam.zoom = clamp(cam.zoom + ((snapshot.cameraZoom ?? 8.4) - cam.zoom) * 0.04, 4, 13);
    const grad = ctx.createRadialGradient(s.w / 2, s.h * 0.42, 0, s.w / 2, s.h / 2, Math.max(s.w, s.h) * 0.72);
    grad.addColorStop(0, "#252b12");
    grad.addColorStop(0.58, "#101407");
    grad.addColorStop(1, "#040403");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, s.w, s.h);
    const orchard = snapshot.orchard ?? {};
    const halfW = n(orchard.width, 76) / 2, halfD = n(orchard.depth, 104) / 2;
    ctx.strokeStyle = "#a8774baa";
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 5]);
    const corner = p({ x: -halfW, z: -halfD }, s);
    ctx.strokeRect(corner.x, corner.y, n(orchard.width, 76) * cam.zoom, n(orchard.depth, 104) * cam.zoom);
    ctx.setLineDash([]);
    for (const band of readability.roundPressureBands ?? []) strokeCircle(band, s, "#8061ff", 0.1);
    for (const lane of readability.escapeLanes ?? []) descriptorRect(lane, s, lane.color ?? "#8fd56b", lane.opacity ?? 0.12);
    for (const pocket of readability.safeHarvestPockets ?? []) descriptorRect(pocket, s, pocket.color ?? "#8fd56b", pocket.opacity ?? 0.12);
    for (const row of readability.rowMemoryBreadcrumbs ?? []) descriptorRect(row, s, row.color ?? "#b98a45", row.opacity ?? 0.08);
    for (const furrow of visual.ground?.furrows ?? []) descriptorRect(furrow, s, furrow.color ?? "#261c10", furrow.opacity ?? 0.16);
    for (const mud of visual.ground?.mudPatches ?? []) descriptorRect(mud, s, mud.color ?? "#2b2118", mud.opacity ?? 0.12);
    for (const leaf of visual.ground?.leafPatches ?? []) descriptorRect(leaf, s, leaf.color ?? "#7b4a1f", leaf.opacity ?? 0.14);
    for (const lane of visual.lanes ?? []) descriptorRect(lane, s, "#d0a25b", lane.opacity ?? 0.08);
    for (const route of readability.resourceRoutes ?? []) strokeRoute(route, s);
    for (const arc of readability.gearChoiceArcs ?? []) strokeRoute(arc, s);
    for (const ribbon of visual.fogRibbons ?? []) { const q = p(ribbon.center, s); ctx.fillStyle = ribbon.color ?? "#7786a2"; ctx.globalAlpha = n(ribbon.opacity, 0.12); ctx.beginPath(); ctx.ellipse(q.x, q.y, n(ribbon.width, 4) * cam.zoom, n(ribbon.length, 60) * cam.zoom * .32, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
    if (!(visual.fogRibbons ?? []).length) for (const lane of orchard.fogLanes ?? []) { const q = p(lane.center, s); ctx.fillStyle = "rgba(151,163,190,.16)"; ctx.beginPath(); ctx.ellipse(q.x, q.y, n(lane.width, 4) * cam.zoom, n(lane.length, 60) * cam.zoom * .32, 0, 0, Math.PI * 2); ctx.fill(); }
    for (const zone of visual.hauntZones ?? []) { const q = p(zone.position, s); ctx.strokeStyle = zone.color ?? (zone.active ? "#ff335b88" : "#8043a044"); ctx.globalAlpha = n(zone.opacity, 0.18); ctx.beginPath(); ctx.arc(q.x, q.y, n(zone.radius, 7) * cam.zoom, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
    if (!(visual.hauntZones ?? []).length) for (const zone of orchard.hauntedZones ?? []) { const q = p(zone.position, s); ctx.strokeStyle = zone.id === orchard.haunting?.activeZoneId ? "#ff335b88" : "#8043a044"; ctx.beginPath(); ctx.arc(q.x, q.y, n(zone.radius, 7) * cam.zoom, 0, Math.PI * 2); ctx.stroke(); }
    for (const b of orchard.barnLandmarks ?? []) { const q = p(b.position, s); ctx.fillStyle = b.kind === "shed" ? "#503724dd" : "#5c231edd"; ctx.fillRect(q.x - n(b.size?.x, 8) * cam.zoom / 2, q.y - n(b.size?.z, 7) * cam.zoom / 2, n(b.size?.x, 8) * cam.zoom, n(b.size?.z, 7) * cam.zoom); label(b.kind, q.x, q.y - 18); }
    for (const row of orchard.treeRows ?? []) for (const tree of row.trees ?? []) { const q = p(tree.position, s); ctx.fillStyle = "#142810b8"; ctx.beginPath(); ctx.arc(q.x, q.y, n(tree.canopyRadius, 2.8) * cam.zoom, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#3b2615"; ctx.beginPath(); ctx.arc(q.x, q.y, Math.max(2, n(tree.radius, .7) * cam.zoom), 0, Math.PI * 2); ctx.fill(); }
    for (const beacon of visual.pickups ?? []) { const q = p(beacon.position, s); ctx.strokeStyle = beacon.color ?? "#ffd168"; ctx.globalAlpha = n(beacon.opacity, 0.32); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(q.x, q.y, n(beacon.ringScale, 1) * 12, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
    for (const w of snapshot.weapons?.pickups ?? []) if (w.active !== false) { const q = dot(w.position, s, "#261e15", 7, snapshot.nearestWeapon?.id === w.id ? "E" : ""); ctx.strokeStyle = "#ffd168"; ctx.strokeRect(q.x - 7, q.y - 7, 14, 14); }
    for (const a of orchard.activeApples ?? []) dot(a.position, s, appleColor(a.rarity), snapshot.nearestApple?.id === a.id ? 7 : 5, snapshot.nearestApple?.id === a.id ? "E" : "");
    for (const heat of readability.appleRarityHeat ?? []) strokeCircle(heat, s, heat.color ?? "#ffe06b", heat.opacity ?? 0.18);
    for (const trail of readability.harvestStreakTrails ?? []) strokeCircle(trail, s, trail.color ?? "#b6d66f", trail.opacity ?? 0.08);
    for (const omen of readability.bossOmenBranches ?? []) strokeCircle(omen, s, omen.color ?? "#ff365f", omen.opacity ?? 0.2);
    for (const threat of readability.threatGradients ?? []) strokeCircle(threat, s, threat.color ?? "#b6d66f", threat.opacity ?? 0.18);
    for (const m of snapshot.monsters ?? []) dot(m.position, s, monsterColor(m), m.boss ? 15 : m.elite ? 10 : 7, m.boss ? "KEEPER" : "");
    const cue = visual.combatCue ?? {};
    if (cue.playerRing) { const q = p(cue.playerRing.position, s); ctx.strokeStyle = cue.playerRing.color ?? "#fff0b8"; ctx.globalAlpha = n(cue.playerRing.opacity, 0.08); ctx.beginPath(); ctx.arc(q.x, q.y, n(cue.playerRing.radius, 3) * cam.zoom, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
    if (cue.targetLock) { const q = p(cue.targetLock.position, s); ctx.strokeStyle = cue.targetLock.color ?? "#fff0b8"; ctx.globalAlpha = n(cue.targetLock.opacity, 0.46); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(q.x, q.y, (cue.targetLock.boss ? 18 : cue.targetLock.elite ? 13 : 10), 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
    for (const window of readability.meleeWindows ?? []) strokeCircle(window, s, window.color ?? "#fff0b8", window.opacity ?? 0.15);
    const pq = dot(player.position, s, snapshot.danger ? "#fff2b0" : "#f8e9ba", 9, "");
    const f = player.facing ?? { x: 0, z: -1 };
    ctx.strokeStyle = "#fff5dc";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(pq.x, pq.y);
    ctx.lineTo(pq.x + f.x * 16, pq.y + f.z * 16);
    ctx.stroke();
    for (const breath of readability.staminaBreath ?? []) strokeCircle(breath, s, breath.color ?? "#fff0b8", breath.opacity ?? 0.12);
    if (snapshot.paused || snapshot.gameOver) { ctx.fillStyle = "#0008"; ctx.fillRect(0, 0, s.w, s.h); ctx.font = "700 42px system-ui"; ctx.textAlign = "center"; ctx.fillStyle = "#fff0d0"; ctx.fillText(snapshot.gameOver ? "THE ORCHARD CLAIMED YOU" : "PAUSED", s.w / 2, s.h / 2); }
    return snapshot;
  } };
}

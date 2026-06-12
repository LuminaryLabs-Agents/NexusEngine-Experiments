const pct = (v) => Math.round(Math.max(0, Math.min(1, Number(v) || 0)) * 100) + "%";
function drawHud(s, hud, message) {
  hud.round.textContent = s.round?.status === "active" ? String(s.round.round) : String(s.round?.status ?? "idle");
  hud.score.textContent = String(Math.round(s.score ?? 0));
  hud.apples.textContent = String(s.appleCount ?? 0);
  hud.weapon.textContent = s.weaponLabel ?? "empty";
  hud.health.textContent = pct(s.health01);
  hud.stamina.textContent = pct(s.stamina01);
  hud.pressure.textContent = pct(s.horde?.pressure ?? 0);
  message.textContent = s.message || "Survive the orchard.";
}

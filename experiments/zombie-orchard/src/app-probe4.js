let last = performance.now();
function frame(now, game, input, view, drawHud) {
  const dt = Math.min(1 / 20, (now - last) / 1000 || 1 / 60);
  last = now;
  const snap = game.update(dt, input.read());
  view.render(snap);
  drawHud(snap);
  requestAnimationFrame((next) => frame(next, game, input, view, drawHud));
}

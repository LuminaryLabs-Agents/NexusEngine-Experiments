export function startLoop(game, input, view, onFrame = () => {}) {
  let last = performance.now();
  function step() {
    const now = performance.now();
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    const snap = game.update(dt, input.read());
    view.render(snap);
    onFrame(snap);
  }
  return setInterval(step, 16);
}

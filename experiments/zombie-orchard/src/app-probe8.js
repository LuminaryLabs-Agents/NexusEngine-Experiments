function step(game, input, view, dt) {
  const snap = game.update(dt, input.read());
  view.render(snap);
  return snap;
}
export { step };

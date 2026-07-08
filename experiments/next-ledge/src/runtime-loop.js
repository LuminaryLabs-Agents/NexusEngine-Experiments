export function startLoop({ session, input, renderer, hud, synth }) {
  let last = performance.now();
  let running = true;
  let lastSnapshot = session.snapshot();

  function tick(dt, command = {}) {
    lastSnapshot = session.update(dt, command);
    renderer.draw(lastSnapshot);
    hud.draw(lastSnapshot);
    synth?.update?.(lastSnapshot, command);
    return lastSnapshot;
  }

  function rendererHandoff() {
    const snapshot = session.snapshot();
    const domain = snapshot.domain ?? {};
    const handoffs = [
      domain.routeCargoVisual?.rendererHandoff,
      domain.traversalReadability?.rendererHandoff,
      domain.anchorTimingReadability?.rendererHandoff
    ].filter(Boolean);
    const descriptors = handoffs.flatMap((handoff) => Array.isArray(handoff.descriptors) ? handoff.descriptors : []);
    return {
      id: "next-ledge-composed-renderer-handoff",
      kind: "renderer-handoff",
      descriptorCount: descriptors.length,
      handoffCount: handoffs.length,
      descriptors,
      rendererContract: "renderer consumes descriptors only; route, cargo, traversal, anchor timing, browser input, and frame-loop truth stay outside renderer presentation"
    };
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min(1 / 30, (now - last) / 1000 || 1 / 60);
    last = now;
    const command = input.read(renderer, lastSnapshot);
    tick(dt, command);
    requestAnimationFrame(frame);
  }

  window.GameHost = {
    engine: session.engine,
    session,
    renderer,
    getState: () => session.snapshot(),
    getTraversalReadability: () => session.snapshot().domain?.traversalReadability,
    getAnchorTimingReadability: () => session.snapshot().domain?.anchorTimingReadability,
    getRendererHandoff: rendererHandoff,
    tick: (dt = 1 / 60, command = {}) => tick(dt, command),
    restart: () => session.restart(),
    advanceSector: () => session.advanceSector(),
    stop() { running = false; },
    start() { if (running) return; running = true; last = performance.now(); requestAnimationFrame(frame); }
  };

  tick(0, {});
  requestAnimationFrame(frame);
}

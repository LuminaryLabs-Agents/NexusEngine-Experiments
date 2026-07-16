export function createInputController({ canvas, leftPad, rightPad, pauseButton, restartButton, advanceButton }) {
  const keys = new Set();
  const pointer = { x: innerWidth / 2, y: innerHeight / 2, active: false };
  const queued = { action: false, restart: false, advanceSector: false, pause: false, userGesture: false };
  const pads = { left: false, right: false };

  const lowerKey = (event) => String(event.key ?? "").toLowerCase();
  const updatePointer = (event) => { pointer.x = event.clientX ?? pointer.x; pointer.y = event.clientY ?? pointer.y; pointer.active = true; };
  const queueAction = (event) => { updatePointer(event); queued.action = true; queued.userGesture = true; };

  canvas.addEventListener("pointermove", updatePointer);
  canvas.addEventListener("pointerdown", (event) => { canvas.setPointerCapture?.(event.pointerId); queueAction(event); });

  addEventListener("keydown", (event) => {
    const key = lowerKey(event);
    keys.add(key);
    if (key === " " || event.code === "Space") { event.preventDefault(); queued.action = true; queued.userGesture = true; }
    if (key === "r") queued.restart = true;
    if (key === "n") queued.advanceSector = true;
    if (key === "p") queued.pause = true;
  });

  addEventListener("keyup", (event) => keys.delete(lowerKey(event)));
  addEventListener("blur", () => { keys.clear(); pads.left = false; pads.right = false; });

  function bindPad(node, side) {
    if (!node) return;
    const on = (event) => { event.preventDefault(); event.stopPropagation(); pads[side] = true; queued.userGesture = true; };
    const off = (event) => { event.preventDefault(); event.stopPropagation(); pads[side] = false; };
    node.addEventListener("pointerdown", on);
    node.addEventListener("pointerup", off);
    node.addEventListener("pointercancel", off);
    node.addEventListener("pointerleave", off);
  }

  bindPad(leftPad, "left");
  bindPad(rightPad, "right");

  function bindButton(node, key) {
    if (!node) return;
    node.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      queued[key] = true;
      queued.userGesture = true;
    });
  }

  bindButton(pauseButton, "pause");
  bindButton(restartButton, "restart");
  bindButton(advanceButton, "advanceSector");

  function read(renderer, snapshot) {
    const axis = (keys.has("d") || keys.has("arrowright") || pads.right ? 1 : 0) - (keys.has("a") || keys.has("arrowleft") || pads.left ? 1 : 0);
    const aimWorld = pointer.active && renderer?.screenToWorld ? renderer.screenToWorld(pointer.x, pointer.y, snapshot) : null;
    const result = { axis, aimWorld, action: queued.action, restart: queued.restart, advanceSector: queued.advanceSector, pause: queued.pause, userGesture: queued.userGesture };
    queued.action = false;
    queued.restart = false;
    queued.advanceSector = false;
    queued.pause = false;
    queued.userGesture = false;
    return result;
  }

  return { read };
}

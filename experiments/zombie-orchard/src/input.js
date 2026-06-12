const moves = new Map([["KeyW", { z: -1 }], ["ArrowUp", { z: -1 }], ["KeyS", { z: 1 }], ["ArrowDown", { z: 1 }], ["KeyA", { x: -1 }], ["ArrowLeft", { x: -1 }], ["KeyD", { x: 1 }], ["ArrowRight", { x: 1 }]]);
const codes = new Set([...moves.keys(), "ShiftLeft", "ShiftRight", "Space", "KeyE", "KeyJ", "KeyR", "KeyP", "Digit1", "Digit2", "Digit3"]);
function norm(x, z) { const l = Math.hypot(x, z); return l ? { x: x / l, z: z / l } : { x: 0, z: 0 }; }
export function createInputController(target = globalThis) {
  const keys = new Set(); const pressed = new Set(); let pointerUse = false;
  const down = (e) => { if (codes.has(e.code)) e.preventDefault?.(); if (!keys.has(e.code)) pressed.add(e.code); keys.add(e.code); };
  const up = (e) => keys.delete(e.code);
  const pointer = (e) => { pointerUse = true; e.preventDefault?.(); };
  target.addEventListener?.("keydown", down); target.addEventListener?.("keyup", up); target.addEventListener?.("pointerdown", pointer);
  return { read() { let x = 0, z = 0; for (const [code, v] of moves) if (keys.has(code)) { x += v.x ?? 0; z += v.z ?? 0; } const m = norm(x, z); const out = { moveX: m.x, moveZ: m.z, sprint: keys.has("ShiftLeft") || keys.has("ShiftRight"), dash: pressed.has("Space"), interact: pressed.has("KeyE"), useGear: pressed.has("KeyJ") || pointerUse, nextRound: pressed.has("KeyR"), pause: pressed.has("KeyP"), swapSlot: pressed.has("Digit1") ? 0 : pressed.has("Digit2") ? 1 : pressed.has("Digit3") ? 2 : null }; pressed.clear(); pointerUse = false; return out; }, destroy() { target.removeEventListener?.("keydown", down); target.removeEventListener?.("keyup", up); target.removeEventListener?.("pointerdown", pointer); } };
}

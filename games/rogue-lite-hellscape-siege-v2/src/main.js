import { createRealtimeGame } from './protokits/runtime.js';
import { createInputKit, createRealmKit, createAvatarKit, createInventoryKit, createHarvestAndPickupKit, createBuildKit, createWaveAndDefenseKit, createFxKit, createHellscapeSiegeKit } from './protokits/hellscape-kits.js';
import { createCanvasRenderer } from './renderer/canvas-renderer.js';

const canvas = document.querySelector('#game');
const errorPanel = document.querySelector('#errorPanel');
const renderer = createCanvasRenderer(canvas, {
  top: document.querySelector('#topHud'),
  bottom: document.querySelector('#bottomHud')
});
const keys = new Set();

function showError(error) {
  errorPanel.hidden = false;
  errorPanel.textContent = String(error?.stack ?? error?.message ?? error);
}

const engine = createRealtimeGame({
  kits: [
    createInputKit(),
    createFxKit(),
    createAvatarKit(),
    createInventoryKit(),
    createRealmKit(),
    createHarvestAndPickupKit(),
    createBuildKit(),
    createWaveAndDefenseKit(),
    createHellscapeSiegeKit()
  ]
});

function take(key) {
  if (keys.has(key)) {
    keys.delete(key);
    return true;
  }
  return false;
}

function flushInput() {
  let x = 0;
  let y = 0;
  if (keys.has('w') || keys.has('arrowup')) y -= 1;
  if (keys.has('s') || keys.has('arrowdown')) y += 1;
  if (keys.has('a') || keys.has('arrowleft')) x -= 1;
  if (keys.has('d') || keys.has('arrowright')) x += 1;
  if (x && y) { x *= 0.7071; y *= 0.7071; }

  engine.input.set({
    move: { x, y },
    primary: keys.has(' ') || keys.has('spacebar'),
    interact: take('e'),
    build: take('b'),
    inventory: take('i') || take('tab'),
    confirm: take('f') || take('enter'),
    cycle: (take('q') ? -1 : 0) + (take('r') ? 1 : 0)
  });
}

function frame(now) {
  try {
    const dt = Math.min(0.033, (now - (frame.last || now)) / 1000 || 1 / 60);
    frame.last = now;
    flushInput();
    engine.tick(dt);
    renderer.draw(engine.getState());
    requestAnimationFrame(frame);
  } catch (error) {
    showError(error);
  }
}

addEventListener('resize', renderer.resize);
addEventListener('keydown', (event) => {
  keys.add(event.key.toLowerCase());
  if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'tab'].includes(event.key.toLowerCase())) event.preventDefault();
});
addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));
addEventListener('blur', () => keys.clear());

window.GameHost = {
  engine,
  getState: () => engine.getState(),
  startWave: () => engine.waves.start(),
  add: (id, n = 10) => engine.inventory.add(id, n)
};

renderer.resize();
requestAnimationFrame(frame);

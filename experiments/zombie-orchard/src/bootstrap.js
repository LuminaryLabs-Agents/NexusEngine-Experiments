import { createCanvasView } from "./canvas-view.js";
import { createHud } from "./hud.js";
import { createInputController } from "./input.js";
import { createZombieOrchardSession } from "./session.js";
import { startLoop } from "./runtime-loop.js";

const game = createZombieOrchardSession();
const input = createInputController(window);
const view = createCanvasView(document.querySelector("#orchard-canvas"));
const hud = createHud();
const loop = startLoop(game, input, view, hud);

globalThis.GameHost = {
  game,
  engine: game.engine,
  input,
  view,
  hud,
  loop,
  getState: game.snapshot,
  tick: game.update
};

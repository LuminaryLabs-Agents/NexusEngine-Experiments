import { createCanvasRenderer } from "./renderer.js";
import { createThreeRenderer } from "./three-renderer.js";
import { createFoglineRelaySession } from "./session.js";
import { createHud } from "./hud.js";
import { createInputAdapter } from "./input-adapter.js";
import { startLoop } from "./runtime-loop.js";

const canvas = document.querySelector("#game");
const errorPanel = document.querySelector("#errorPanel");
const errorText = document.querySelector("#errorText");

function showFatal(error) {
  errorPanel.hidden = false;
  errorText.textContent = String(error && error.stack ? error.stack : error);
}

async function createPreferredRenderer(canvasElement) {
  try {
    const renderer = await createThreeRenderer(canvasElement);
    console.info("Fogline Relay renderer: Three/WebGL");
    return renderer;
  } catch (error) {
    console.warn("Fogline Relay Three renderer failed; falling back to Canvas 2D.", error);
    return createCanvasRenderer(canvasElement);
  }
}

async function boot() {
  const session = await createFoglineRelaySession();
  const input = createInputAdapter({ canvas });
  const renderer = await createPreferredRenderer(canvas);
  const hud = createHud(document);
  const loop = startLoop(session, input, renderer, hud);
  globalThis.GameHost = {
    session,
    engine: session.engine,
    input,
    renderer,
    loop,
    getState: session.snapshot,
    getSignalCartography: () => session.snapshot().signalCartography,
    getOperatorRhythm: () => session.snapshot().operatorRhythm,
    getRendererHandoff: () => session.snapshot().rendererHandoff,
    tick: loop.tick,
    stop: loop.stop,
    start: loop.start
  };
}

boot().catch(showFatal);

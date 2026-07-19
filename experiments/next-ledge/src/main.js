const errorPanel = document.querySelector("#errorPanel");

function showFatal(error) {
  errorPanel.hidden = false;
  errorPanel.textContent = String(error?.stack ?? error?.message ?? error);
  console.error(error);
}

async function boot() {
  const [sessionModule, rendererModule, inputModule, hudModule, loopModule, synthModule] = await Promise.all([
    import("./session-cargo-extraction-upgrade.js?v=score-restore-pulse-3"),
    import("./renderer-three-fidelity.js?v=score-restore-pulse-3"),
    import("./input.js"),
    import("./hud.js?v=score-restore-pulse-3"),
    import("./runtime-loop.js?v=counterwind-crescendo-1"),
    import("./synth.js?v=score-restore-pulse-3")
  ]);

  const canvas = document.querySelector("#game");
  const session = sessionModule.createNextLedgeSession();
  const renderer = rendererModule.createThreeRenderer({ canvas });
  const input = inputModule.createInputController({
    canvas,
    leftPad: document.querySelector("#leftPad"),
    rightPad: document.querySelector("#rightPad"),
    pauseButton: document.querySelector("#pauseButton"),
    restartButton: document.querySelector("#restartButton"),
    advanceButton: document.querySelector("#advanceButton")
  });
  const hud = hudModule.createHud({
    status: document.querySelector("#status"),
    readout: document.querySelector("#readout"),
    statusCopy: document.querySelector("#statusCopy"),
    objective: document.querySelector("#objective"),
    sectorLabel: document.querySelector("#sectorLabel"),
    actionPrompt: document.querySelector("#actionPrompt"),
    staminaValue: document.querySelector("#staminaValue"),
    staminaMeter: document.querySelector("#staminaMeter"),
    cargoValue: document.querySelector("#cargoValue"),
    cargoMeter: document.querySelector("#cargoMeter"),
    pressureValue: document.querySelector("#pressureValue"),
    pressureMeter: document.querySelector("#pressureMeter"),
    completionPanel: document.querySelector("#completionPanel"),
    completionEyebrow: document.querySelector("#completionEyebrow"),
    completionTitle: document.querySelector("#completionTitle"),
    completionCopy: document.querySelector("#completionCopy")
  });
  const synth = synthModule.createCinematicSynth();

  loopModule.startLoop({ session, input, renderer, hud, synth });
}

boot().catch(showFatal);

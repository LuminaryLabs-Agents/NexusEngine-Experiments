const pct = (value, max = 100) => `${Math.round(Math.max(0, value) / Math.max(1, max) * 100)}%`;
const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

function cargoState(snapshot) {
  const state = snapshot.domain?.routeCargoExtraction?.cargo;
  return state?.resourcesById?.["anchor-signal-cargo"] ?? state?.resources?.find?.((item) => item.id === "anchor-signal-cargo") ?? null;
}

function pressureState(snapshot) {
  const state = snapshot.domain?.routeCargoExtraction?.pressure;
  return state?.channelsById?.["fall-pressure"] ?? state?.channels?.find?.((item) => item.id === "fall-pressure") ?? null;
}

function promptFor(snapshot) {
  const transition = snapshot.sectorTransition;
  if (transition?.active) {
    if (transition.phase === "broadcast") return { text: "Broadcasting recovered signal…", tone: "success" };
    if (transition.phase === "handshake") return { text: `Sector ${transition.targetSector} handshake · wind reversing`, tone: "success" };
    return { text: "Counterwind opening · read the cyan zig-zag", tone: "ready" };
  }
  if (snapshot.paused) return { text: "P — Resume climb", tone: "ready" };
  if (snapshot.mode === "dead") return { text: "R — Retry from the anchor line", tone: "danger" };
  if (snapshot.mode === "won") return { text: "N — Carry the relay into the next sector", tone: "success" };
  if (snapshot.mode === "falling") return { text: "Aim + space / click — Fire grapple", tone: "danger" };
  if (snapshot.mode === "launched") return { text: "Guide the line · Click to retract", tone: "ready" };
  if (snapshot.mode === "retracting") return { text: "Steer while the line resets", tone: "danger" };
  if (snapshot.mode === "reeling") return { text: "Latch incoming · Click to cut line", tone: "success" };
  const speed = Math.hypot(number(snapshot.player?.vx), number(snapshot.player?.vy));
  return speed >= 1.7
    ? { text: "Space / click — Release now", tone: "ready" }
    : { text: "A / D — Build momentum", tone: "neutral" };
}

function setMeter(node, value) {
  node?.style?.setProperty("--value", String(Math.max(0, Math.min(100, value))));
}

function playerStatus(snapshot) {
  const status = String(snapshot.status ?? "");
  if (!status || status.startsWith("SYS_STATUS")) return "Build flow, release at speed, and fire toward the next cyan anchor.";
  return status;
}

export function createHud(nodes = {}) {
  const { status, readout, statusCopy, objective, sectorLabel, actionPrompt, staminaValue, staminaMeter, cargoValue, cargoMeter, pressureValue, pressureMeter, completionPanel, completionEyebrow, completionTitle, completionCopy } = nodes;
  let lastStatus = "";
  let lastReadout = "";
  return {
    draw(snapshot) {
      if (!snapshot) return;
      const statusText = `${String(snapshot.mode ?? "unknown").toUpperCase()} · ${snapshot.status ?? ""}`;
      const readoutText = `Sector ${snapshot.sector} · Stamina ${pct(snapshot.stamina, snapshot.constants?.maxStamina)} · Height ${Math.max(0, snapshot.maxHeight ?? 0)}m`;
      const cargo = cargoState(snapshot);
      const pressure = pressureState(snapshot);
      const staminaPercent = Math.round(number(snapshot.stamina) / Math.max(1, number(snapshot.constants?.maxStamina, 100)) * 100);
      const cargoAmount = number(cargo?.value);
      const cargoMax = Math.max(1, number(cargo?.max, 1));
      const pressurePercent = Math.round(number(pressure?.value) / Math.max(1, number(pressure?.max, 100)) * 100);
      const prompt = promptFor(snapshot);
      if (status && statusText !== lastStatus) {
        status.textContent = statusText;
        lastStatus = statusText;
      }
      if (readout && readoutText !== lastReadout) {
        readout.textContent = readoutText;
        lastReadout = readoutText;
      }
      if (statusCopy) statusCopy.textContent = playerStatus(snapshot);
      const transition = snapshot.sectorTransition;
      if (objective) objective.textContent = transition?.active
        ? transition.phase === "opening"
          ? "Read the four-anchor counterwind zig-zag, then carry the new signal line upward."
          : `Carry the restored relay into sector ${transition.targetSector}. The wind field will reverse during handoff.`
        : snapshot.completed
          ? "Signal delivered. The summit relay is broadcasting through the storm."
        : cargoAmount > 0
          ? `Carry ${cargoAmount} recovered signal unit${cargoAmount === 1 ? "" : "s"} to the summit. Rest anchors restore stamina and reduce pressure.`
          : "Carry the recovered anchor signal to the summit. Rest anchors restore stamina and bleed off fall pressure.";
      if (sectorLabel) sectorLabel.textContent = String(snapshot.sector ?? 1);
      if (actionPrompt) {
        actionPrompt.textContent = prompt.text;
        actionPrompt.dataset.tone = prompt.tone;
      }
      if (staminaValue) staminaValue.textContent = `${Math.max(0, staminaPercent)}%`;
      if (cargoValue) cargoValue.textContent = snapshot.completed ? "DELIVERED" : `${cargoAmount} / ${cargoMax}`;
      if (pressureValue) pressureValue.textContent = `${Math.max(0, pressurePercent)}%`;
      setMeter(staminaMeter, staminaPercent);
      setMeter(cargoMeter, cargoAmount / cargoMax * 100);
      setMeter(pressureMeter, pressurePercent);
      if (completionPanel) {
        completionPanel.hidden = !snapshot.completed && !transition?.active;
        completionPanel.dataset.phase = transition?.active ? transition.phase : "complete";
      }
      if (completionEyebrow) completionEyebrow.textContent = transition?.active
        ? transition.phase === "opening" ? `Sector ${snapshot.sector} · Counterwind online` : `Sector ${transition.sourceSector} → ${transition.targetSector}`
        : "Signal delivered · Stormline restored";
      if (completionTitle) completionTitle.textContent = transition?.active
        ? transition.phase === "broadcast" ? "Broadcasting Relay" : transition.phase === "handshake" ? "Route Handshake" : "Wind Reversed"
        : "Summit Relay Online";
      if (completionCopy) completionCopy.textContent = transition?.active
        ? transition.phase === "broadcast"
          ? "The recovered signal is leaving the summit array. Hold the line while the next route answers."
          : transition.phase === "handshake"
            ? `Sector ${transition.targetSector} accepted the relay. Rebuilding the anchor field against the incoming gust.`
            : transition.windDirection < 0
              ? "The wind now drives left. Load the right side, then release through the cyan counterwind gate."
              : "The wind now drives right. Load the left side, then release through the cyan counterwind gate."
        : "The recovered anchor signal is broadcasting through the storm. The next sector is ready when you are.";
      document.documentElement.dataset.mode = String(snapshot.mode ?? "unknown");
      document.documentElement.dataset.signal = snapshot.completed ? "delivered" : "carrying";
      document.documentElement.dataset.transition = transition?.active ? transition.phase : "idle";
    }
  };
}

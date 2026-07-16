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
  if (snapshot.paused) return { text: "P — Resume climb", tone: "ready" };
  if (snapshot.mode === "dead") return { text: "R — Retry from the anchor line", tone: "danger" };
  if (snapshot.mode === "won") return { text: "N — Ascend to the next sector", tone: "success" };
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
  const { status, readout, statusCopy, objective, sectorLabel, actionPrompt, staminaValue, staminaMeter, cargoValue, cargoMeter, pressureValue, pressureMeter } = nodes;
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
      if (objective) objective.textContent = snapshot.completed
        ? "Summit signal delivered. Continue upward when ready."
        : cargoAmount > 0
          ? `Carry ${cargoAmount} recovered signal unit${cargoAmount === 1 ? "" : "s"} to the summit. Rest anchors restore stamina and reduce pressure.`
          : "Carry the recovered anchor signal to the summit. Rest anchors restore stamina and bleed off fall pressure.";
      if (sectorLabel) sectorLabel.textContent = String(snapshot.sector ?? 1);
      if (actionPrompt) {
        actionPrompt.textContent = prompt.text;
        actionPrompt.dataset.tone = prompt.tone;
      }
      if (staminaValue) staminaValue.textContent = `${Math.max(0, staminaPercent)}%`;
      if (cargoValue) cargoValue.textContent = `${cargoAmount} / ${cargoMax}`;
      if (pressureValue) pressureValue.textContent = `${Math.max(0, pressurePercent)}%`;
      setMeter(staminaMeter, staminaPercent);
      setMeter(cargoMeter, cargoAmount / cargoMax * 100);
      setMeter(pressureMeter, pressurePercent);
      document.documentElement.dataset.mode = String(snapshot.mode ?? "unknown");
    }
  };
}

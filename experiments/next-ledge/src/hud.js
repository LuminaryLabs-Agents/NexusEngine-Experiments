const pct = (value, max = 100) => `${Math.round(Math.max(0, value) / Math.max(1, max) * 100)}%`;

export function createHud({ status, readout }) {
  let lastStatus = "";
  let lastReadout = "";
  return {
    draw(snapshot) {
      if (!snapshot) return;
      const mode = String(snapshot.mode ?? "unknown").toUpperCase();
      const statusText = `${mode} · ${snapshot.status ?? ""}`;
      const readoutText = [
        `Sector <strong>${snapshot.sector}</strong>`,
        `Stamina <strong>${pct(snapshot.stamina, snapshot.constants?.maxStamina)}</strong>`,
        `Height <strong>${Math.max(0, snapshot.maxHeight ?? 0)}m</strong>`,
        `Controls <strong>Click/Space release-fire · A/D swing · R restart · N sector</strong>`
      ].join(" · ");
      if (statusText !== lastStatus) {
        status.textContent = statusText;
        status.style.color = snapshot.mode === "dead" ? "var(--danger)" : snapshot.mode === "won" ? "var(--amber)" : "var(--cyan)";
        lastStatus = statusText;
      }
      if (readoutText !== lastReadout) {
        readout.innerHTML = readoutText;
        lastReadout = readoutText;
      }
    }
  };
}

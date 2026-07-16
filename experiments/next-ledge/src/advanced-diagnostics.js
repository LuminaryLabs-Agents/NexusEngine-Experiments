const status = document.querySelector("#diagnosticsStatus");
const picker = document.querySelector("#diagnosticSelect");
const loadButton = document.querySelector("#loadDiagnosticButton");

const diagnosticDescriptions = {
  "rescue-line": "Rescue line: tether strain, recovery nets, anchor triage, and cargo retention.",
  "summit-bivouac": "Summit bivouac: shelter windows, rest-anchor access, and exposure pressure.",
  "ravine-evacuation": "Ravine evacuation: casualty routing, extraction readiness, and fall-risk handoff.",
  "glacier-supply": "Glacier supply: cache priority, supply continuity, and route carrying pressure.",
  "avalanche-beacon": "Avalanche beacon: search coverage, beacon confidence, and rescue timing.",
  "weather-station": "Weather station: repair sequence, storm exposure, and summit delivery state.",
  "drone-relay": "Drone relay: signal coverage, relay placement, and cargo synchronization.",
  "stretcher-relay": "Stretcher relay: transfer windows, team readiness, and ridge stability."
};

function explainSelectedDiagnostic() {
  const id = String(picker?.value ?? "rescue-line");
  if (status) status.textContent = diagnosticDescriptions[id] ?? "Diagnostic focus unavailable.";
}

loadButton?.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  explainSelectedDiagnostic();
});

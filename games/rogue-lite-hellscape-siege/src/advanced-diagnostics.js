export const hellscapeDiagnostics = {
  enabled: false,
  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    document.body?.classList.toggle('hellscape-diagnostics-open', this.enabled);
    return this.enabled;
  }
};

export function isHellscapeDiagnosticsEnabled() {
  return hellscapeDiagnostics.enabled;
}

export function syncHellscapeDiagnosticPanel(panel) {
  if (panel) panel.hidden = !hellscapeDiagnostics.enabled;
  return hellscapeDiagnostics.enabled;
}

globalThis.HellscapeAdvancedDiagnostics = hellscapeDiagnostics;

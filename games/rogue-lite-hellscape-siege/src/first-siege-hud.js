function text(element, value) {
  const next = String(value ?? '');
  if (element && element.textContent !== next) element.textContent = next;
}

function phaseFor(state) {
  if (state.realm?.id !== 'lobby') return 'harvest';
  if (state.wave?.active) return 'defend';
  if ((state.wave?.n ?? 0) > 0 && state.realm?.prompt?.startsWith('WAVE')) return 'recover';
  if (!(state.structures?.length > 0)) return 'build';
  return 'start';
}

function objectiveFor(state, phase) {
  if (state.realm?.prompt?.startsWith('CORE FAILURE')) return 'Core breached. Starter stock restored—rebuild and retry.';
  if (phase === 'harvest') return state.context?.text || 'Harvest materials, then return to the cyan Base beacon and press E.';
  if (phase === 'defend') {
    const active = state.enemies?.length ?? 0;
    const incoming = state.wave?.queue?.length ?? 0;
    return active ? `Close on ${active} red threat${active === 1 ? '' : 's'} and hold Space to strike. ${incoming} incoming.` : 'Hold the Ember Core. The next threat is entering the siege ring.';
  }
  if (phase === 'recover') return `Siege ${state.wave.n} secured. Enter Grove for wood or Ashes for obsidian, then return to fortify.`;
  if (phase === 'build') return 'Build your free starter Spike Wall now. It is already selected.';
  if ((state.wave?.n ?? 0) > 0) return `Siege ${state.wave.n} cleared. Gather or fortify, then press E at the core.`;
  return 'Move to the blue Ember Core and press E to begin Siege 1.';
}

export function createFirstSiegeHud({ diagnostics }) {
  const objective = document.querySelector('#heroObjective');
  const coreStatus = document.querySelector('#coreStatus');
  const waveStatus = document.querySelector('#waveStatus');
  const playerStatus = document.querySelector('#playerStatus');
  const buildAction = document.querySelector('#buildAction');
  const interactAction = document.querySelector('#interactAction');
  const primaryAction = document.querySelector('#primaryAction');
  const primaryActionLabel = document.querySelector('#primaryActionLabel');
  const impactToast = document.querySelector('#impactToast');
  const toggle = document.querySelector('#diagnosticsToggle');

  toggle?.addEventListener('change', () => diagnostics.setEnabled(toggle.checked));

  return {
    update(state) {
      const phase = phaseFor(state);
      const combat = state.combat ?? {};
      const active = state.enemies?.length ?? 0;
      const incoming = state.wave?.queue?.length ?? 0;
      text(objective, objectiveFor(state, phase));
      text(coreStatus, `CORE ${Math.max(0, Math.ceil(state.core?.hp ?? 0))}`);
      text(playerStatus, `WARDEN ${Math.max(0, Math.ceil(state.player?.hp ?? 0))}`);
      const waveNumber = state.wave?.n ?? 0;
      const cleared = (combat.clears ?? 0) >= waveNumber;
      text(waveStatus, state.wave?.active
        ? `WAVE ${waveNumber} · ${active} ACTIVE · ${incoming} INCOMING`
        : (waveNumber ? `WAVE ${waveNumber} ${cleared ? 'SECURED' : 'BREACHED'}` : 'WAVE READY'));
      buildAction?.setAttribute('data-active', String(phase === 'build'));
      interactAction?.setAttribute('data-active', String(phase === 'start'));
      primaryAction?.setAttribute('data-active', String(phase === 'defend' || phase === 'harvest'));
      text(primaryActionLabel, phase === 'harvest' ? 'HARVEST' : 'STRIKE');
      text(impactToast, combat.lastImpact ?? '');
      impactToast?.setAttribute('data-visible', String((combat.impact ?? 0) > 0));
    }
  };
}

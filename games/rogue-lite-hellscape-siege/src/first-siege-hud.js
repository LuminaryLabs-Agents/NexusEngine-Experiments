function text(element, value) {
  const next = String(value ?? '');
  if (element && element.textContent !== next) element.textContent = next;
}

function phaseFor(state) {
  if (state.realm?.id !== 'lobby') return 'harvest';
  if (state.wave?.active) return 'defend';
  if (state.sentryChoice?.overcharge?.eligible) return 'overcharge';
  if (state.sentryChoice?.eligible) return 'sentry';
  if (state.fortification?.eligible) return 'fortify';
  if ((state.wave?.n ?? 0) > 0 && (state.combat?.clears ?? 0) >= state.wave.n && !state.structures?.some(structure => structure.kind === 'wall')) return 'rebuild';
  if ((state.wave?.n ?? 0) > 0 && state.realm?.prompt?.startsWith('WAVE')) return 'recover';
  if (!(state.structures?.length > 0)) return 'build';
  return 'start';
}

function sentryProgress(state) {
  const choice = state.sentryChoice;
  if (!choice) return '';
  const crystal = choice.materials?.crystal ?? 0;
  const energy = choice.materials?.energy ?? 0;
  return `${Math.min(crystal, choice.cost.crystal)}/${choice.cost.crystal} crystal · ${Math.min(energy, choice.cost.energy)}/${choice.cost.energy} energy`;
}

function recipeProgress(state) {
  const fortification = state.fortification;
  if (!fortification) return '';
  const wood = fortification.materials?.wood ?? 0;
  const obsidian = fortification.materials?.obsidian ?? 0;
  return `${Math.min(wood, fortification.cost.wood)}/${fortification.cost.wood} wood · ${Math.min(obsidian, fortification.cost.obsidian)}/${fortification.cost.obsidian} obsidian`;
}

function objectiveFor(state, phase) {
  const fortification = state.fortification;
  const sentryChoice = state.sentryChoice;
  const recipe = recipeProgress(state);
  const sentryRecipe = sentryProgress(state);
  if (state.realm?.prompt?.startsWith('CORE FAILURE')) {
    const wall = state.structures?.find(structure => structure.fortificationId === fortification?.id);
    if (fortification?.completed && wall) return `Core rekindled. Emberplate survived at ${Math.ceil(wall.hp)}/${wall.maxHp} HP—press E at the core to retry Siege ${state.wave.n}.`;
    return `Core breached. Starter stock restored—rebuild and retry Siege ${state.wave.n}.`;
  }
  if (phase === 'harvest') {
    const action = state.context?.text || 'Harvest, then return to the cyan Base beacon and press E.';
    if (sentryChoice?.eligible) return `${action} Crystal Sentry: ${sentryRecipe}.`;
    return fortification?.eligible ? `${action} Emberplate: ${recipe}.` : action;
  }
  if (phase === 'defend') {
    const active = state.enemies?.length ?? 0;
    const incoming = state.wave?.queue?.length ?? 0;
    return active ? `Close on ${active} red threat${active === 1 ? '' : 's'} and hold Space to strike. ${incoming} incoming.` : 'Hold the Ember Core. The next threat is entering the siege ring.';
  }
  if (phase === 'fortify') {
    if (fortification.ready) return `Emberplate ready: ${recipe}. Press B to forge the surviving Spike Wall.`;
    const needsWood = (fortification.missing?.wood ?? 0) > 0;
    const needsObsidian = (fortification.missing?.obsidian ?? 0) > 0;
    const route = needsWood && needsObsidian ? 'Enter Grove and Ashes.' : needsWood ? 'Enter Grove for wood.' : 'Enter Ashes for obsidian.';
    return `Forge Emberplate: ${recipe}. ${route}`;
  }
  if (phase === 'sentry') {
    if (sentryChoice.ready) return `Crystal Sentry ready: ${sentryRecipe}. Press B to deploy it beside the Ember Core.`;
    return `Emberplate survived Siege ${state.wave.n}. Crystal Sentry: ${sentryRecipe}. Enter Crystal for crystal and energy.`;
  }
  if (phase === 'overcharge') {
    const surge = sentryChoice.overcharge;
    if (surge.ready) return `Crystal overflow banked: ${surge.materials.crystal}/${surge.cost.crystal} crystal. Press B to arm ${surge.shots} fast, heavy Sentry shots for Siege ${surge.targetWave}.`;
    return `Crystal Surge needs ${surge.cost.crystal} crystal before Siege ${surge.targetWave}.`;
  }
  if (phase === 'rebuild') {
    const canRebuild = !Object.keys(fortification?.missing ?? {}).length;
    return canRebuild
      ? `Siege ${state.wave.n} secured, but Emberplate fell. Starter wall ready: ${recipe}. Press B to rebuild.`
      : `Siege ${state.wave.n} secured, but Emberplate fell. Rebuild stock: ${recipe}. Enter Grove and Ashes.`;
  }
  if (phase === 'recover') return `Siege ${state.wave.n} secured. Enter Grove for wood or Ashes for obsidian, then return to fortify.`;
  if (phase === 'build') return 'Build your free starter Spike Wall now. It is already selected.';
  if (sentryChoice?.overcharge?.completed && sentryChoice.overcharge.remainingShots > 0) return `Crystal Surge armed · ${sentryChoice.overcharge.remainingShots} heavy shots. Press E at the core for Siege ${sentryChoice.overcharge.targetWave}.`;
  if (sentryChoice?.completed) return `Crystal Sentry online · ${sentryChoice.range} range. Press E at the core for Siege ${state.wave.n + 1}.`;
  if (fortification?.completed) return `Emberplate Wall ${state.structures?.find(item => item.fortificationId)?.maxHp ?? 300} HP · ${fortification.guardPercent}% guard. Press E at the core for Siege ${state.wave.n + 1}.`;
  if ((state.wave?.n ?? 0) > 0) return `Siege ${state.wave.n} cleared. Gather or fortify, then press E at the core.`;
  return 'Move to the blue Ember Core and press E to begin Siege 1.';
}

export function createFirstSiegeHud({ diagnostics }) {
  const objective = document.querySelector('#heroObjective');
  const coreStatus = document.querySelector('#coreStatus');
  const waveStatus = document.querySelector('#waveStatus');
  const playerStatus = document.querySelector('#playerStatus');
  const buildAction = document.querySelector('#buildAction');
  const buildActionLabel = document.querySelector('#buildActionLabel');
  const interactAction = document.querySelector('#interactAction');
  const interactActionLabel = document.querySelector('#interactActionLabel');
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
      buildAction?.setAttribute('data-active', String(phase === 'build' || (phase === 'rebuild' && !Object.keys(state.fortification?.missing ?? {}).length) || (phase === 'fortify' && state.fortification?.ready) || (phase === 'sentry' && state.sentryChoice?.ready) || (phase === 'overcharge' && state.sentryChoice?.overcharge?.ready)));
      interactAction?.setAttribute('data-active', String(phase === 'start' || (phase === 'sentry' && !state.sentryChoice?.ready)));
      primaryAction?.setAttribute('data-active', String(phase === 'defend' || phase === 'harvest'));
      text(buildActionLabel, phase === 'rebuild' ? (!Object.keys(state.fortification?.missing ?? {}).length ? 'REBUILD WALL' : 'REBUILD STOCK') : (phase === 'overcharge' ? (state.sentryChoice?.overcharge?.ready ? 'OVERCHARGE' : 'SHARD NEEDED') : (phase === 'sentry' ? (state.sentryChoice?.ready ? 'DEPLOY SENTRY' : 'SENTRY RECIPE') : (phase === 'fortify' ? (state.fortification?.ready ? 'FORGE WALL' : 'RECIPE') : (state.sentryChoice?.overcharge?.remainingShots > 0 ? 'SURGE ARMED' : (state.sentryChoice?.completed ? 'SENTRY ONLINE' : (state.fortification?.completed ? 'WALL FORGED' : 'BUILD WALL')))))));
      text(interactActionLabel, phase === 'harvest' ? 'RETURN AT BASE' : (phase === 'sentry' ? 'ENTER CRYSTAL' : (phase === 'fortify' || phase === 'rebuild' ? 'ENTER REALM' : 'START AT CORE')));
      text(primaryActionLabel, phase === 'harvest' ? 'HARVEST' : 'STRIKE');
      text(impactToast, combat.lastImpact ?? '');
      impactToast?.setAttribute('data-visible', String((combat.impact ?? 0) > 0));
    }
  };
}

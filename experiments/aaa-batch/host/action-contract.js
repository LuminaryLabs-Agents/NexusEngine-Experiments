export function baseAction(action) {
  return String(action).split(":")[0];
}

export function normalizeSmokeActions(manifest) {
  return Object.freeze((manifest.smokeActions ?? manifest.smoke ?? []).map(String).filter(Boolean));
}

export function normalizeControls(manifest) {
  return String(manifest.controls ?? "").split(",").map((entry) => entry.trim()).filter(Boolean);
}

export function createActionContract(manifest) {
  const smokeActions = normalizeSmokeActions(manifest);
  const commonActions = [
    "switchLane",
    "vertical",
    "jump",
    "recover",
    "scan",
    "burst",
    "selectWard",
    "fireTether",
    "blink",
    "placeAnchor",
    "recallAnchor"
  ];
  const actions = [
    ...(manifest.actions ?? smokeActions.map((action) => ({
      id: baseAction(action),
      label: baseAction(action),
      input: action,
      requiresMode: "active",
      tags: ["smoke"]
    }))),
    ...commonActions.map((id) => ({ id, label: id, input: id, requiresMode: "active", tags: ["common"] }))
  ];
  const actionsById = new Map(actions.map((action) => [action.id, action]));

  return {
    smokeActions,
    controls: normalizeControls(manifest),
    actions: Object.freeze(actions),
    validateAction(actionId, payload = {}, state = {}) {
      const normalizedId = baseAction(actionId);
      const action = actionsById.get(normalizedId);
      if (!action) {
        return { ok: false, actionId: normalizedId, payload, rejectionReason: `unknown action: ${normalizedId}` };
      }
      if (action.requiresMode && state.mode !== action.requiresMode) {
        return { ok: false, actionId: normalizedId, payload, rejectionReason: `requires mode: ${action.requiresMode}` };
      }
      if (action.requiresNotCompleted && state.completed) {
        return { ok: false, actionId: normalizedId, payload, rejectionReason: "already completed" };
      }
      if (action.requiresNotFailed && state.failed) {
        return { ok: false, actionId: normalizedId, payload, rejectionReason: "already failed" };
      }
      return { ok: true, actionId: normalizedId, payload, rejectionReason: null };
    }
  };
}

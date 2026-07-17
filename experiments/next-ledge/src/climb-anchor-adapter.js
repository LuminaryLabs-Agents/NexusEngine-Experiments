function chunksFor(summitY, h = 600) {
  const total = Math.ceil((summitY + 500) / h) + 1;
  return Array.from({ length: total }, (_, i) => {
    const y = i * h - 300;
    return {
      id: `chunk-${i}`,
      y,
      h,
      scaffold: {
        leftX: -170,
        rightX: 170,
        braces: [
          { x: 0, y: y + h * 0.22, rotation: 0.25 },
          { x: 0, y: y + h * 0.75, rotation: -0.25 }
        ],
        cables: [-110, 0, 110].map((x, cableIndex) => ({ id: `cable-${i}-${cableIndex}`, x, phase: i * 0.37 + cableIndex }))
      }
    };
  });
}

function choiceBeatLedge(source, beat, choiceId, defaultStaminaRestore = 45) {
  const type = beat.type ?? source.type;
  return {
    ...source,
    id: beat.id ?? source.id,
    x: Number(beat.x ?? source.x),
    y: Number(beat.y ?? source.y),
    r: Number(beat.radius ?? source.r),
    type,
    label: beat.label ?? source.label,
    staminaRestore: type === "rest" ? Number(beat.staminaRestore ?? source.staminaRestore ?? defaultStaminaRestore) : 0,
    tags: [...new Set([...(source.tags ?? []), ...(beat.tags ?? []), type])],
    metadata: {
      ...(source.metadata ?? {}),
      routeChoiceId: choiceId,
      routeChoiceRole: beat.role,
      routeChoicePressureDelta: Number(beat.pressureDelta ?? 0),
      routeChoiceCargoBonus: Number(beat.cargoBonus ?? 0),
      routeChoiceGustIntensity: Number(beat.gustIntensity ?? 0),
      routeChoicePressureRecovery: Number(beat.pressureRecovery ?? 0),
      routeChoiceVentPulseCount: Number(beat.ventPulseCount ?? 0),
      routeChoiceVentStartProgress: Number(beat.ventStartProgress ?? 0),
      routeChoiceVentStatus: beat.ventStatus ?? null,
      routeChoiceConfirmationFrames: Number(beat.confirmationFrames ?? 0),
      routeChoiceConfirmationSafePrompt: beat.confirmationSafePrompt ?? null,
      routeChoiceConfirmationShortcutPrompt: beat.confirmationShortcutPrompt ?? null,
      routeChoiceConfirmationSafeObjective: beat.confirmationSafeObjective ?? null,
      routeChoiceConfirmationShortcutObjective: beat.confirmationShortcutObjective ?? null,
      routeChoiceProtectedFailFloorBonus: Number(beat.protectedFailFloorBonus ?? 0),
      routeChoiceProtectedAimAssistBonus: Number(beat.protectedAimAssistBonus ?? 0),
      routeChoiceLaunchSpeedMultiplier: Number(beat.launchSpeedMultiplier ?? 1),
      routeChoiceLaunchLiftBonus: Number(beat.launchLiftBonus ?? 0),
      routeChoiceAimAssistBonus: Number(beat.aimAssistBonus ?? 0),
      routeChoiceAimAssistMinBuildAngle: Number(beat.aimAssistMinBuildAngle ?? 0),
      routeChoiceAimAssistLeadX: Number(beat.aimAssistLeadX ?? 0),
      routeChoiceAimAssistLeadY: Number(beat.aimAssistLeadY ?? 0),
      routeChoiceShortcutCarryAimAssistBonus: Number(beat.shortcutCarryAimAssistBonus ?? 0),
      routeChoiceShortcutCarryAimAssistMinBuildAngle: Number(beat.shortcutCarryAimAssistMinBuildAngle ?? 0),
      routeChoiceShortcutCarryMinDirectedSpeed: Number(beat.shortcutCarryMinDirectedSpeed ?? 0),
      routeChoiceShortcutCarryWindowStatus: beat.shortcutCarryWindowStatus ?? null,
      routeChoiceShortcutLandingStatus: beat.shortcutLandingStatus ?? null,
      routeChoicePayoffCameraZoomBonus: Number(beat.cameraZoomBonus ?? 0),
      routeChoiceCargoRequired: Number(beat.cargoRequired ?? 0),
      routeChoiceScoreMetric: beat.scoreMetric ?? null,
      routeChoiceScoreMultiplier: Number(beat.scoreMultiplier ?? 100),
      routeChoiceGenericRejoinFailFloorBonus: Number(beat.rejoinFailFloorBonus ?? 0),
      routeChoiceGenericRejoinAimAssistBonus: Number(beat.rejoinAimAssistBonus ?? 0),
      routeChoiceGenericRejoinCameraZoomBonus: Number(beat.rejoinCameraZoomBonus ?? 0),
      routeChoiceStatus: beat.status ?? null,
      routeChoiceResolvedStatus: beat.resolvedStatus ?? null,
      routeChoiceSafeStatus: beat.safeStatus ?? null,
      routeChoiceShortcutStatus: beat.shortcutStatus ?? null,
      routeChoiceResolvedSafeStatus: beat.resolvedSafeStatus ?? null,
      routeChoiceResolvedShortcutStatus: beat.resolvedShortcutStatus ?? null,
      routeChoiceRejoinSafeStatus: beat.rejoinSafeStatus ?? null,
      routeChoiceRejoinShortcutStatus: beat.rejoinShortcutStatus ?? null,
      routeChoiceRejoinResolvedStatus: beat.rejoinResolvedStatus ?? null,
      authoredRouteBeat: true
    }
  };
}

export function adaptProjectedRouteToClimbRoute(projectedRoute, climb = {}) {
  const anchors = projectedRoute?.anchors ?? [];
  const summitY = Number(climb.summitY ?? anchors.at(-1)?.position?.y ?? 2200);
  const ledges = anchors.map((anchor, index) => {
    const isStart = anchor.tags?.includes(climb.startTag ?? "start") || index === 0;
    const isSummit = anchor.tags?.includes(climb.endTag ?? "end") || index === anchors.length - 1;
    const isRest = !isStart && !isSummit && anchor.tags?.includes(climb.restTag ?? "rest");
    const type = isSummit ? "summit" : isRest ? "rest" : "normal";
    return {
      id: isStart ? "anchor-0" : isSummit ? "summit" : anchor.id,
      sourceAnchorId: anchor.id,
      index,
      x: Number(anchor.position?.x ?? 0),
      y: Number(anchor.position?.y ?? 0),
      z: Number(anchor.position?.z ?? 0),
      r: isStart ? Number(climb.startRadius ?? 9) : isSummit ? Number(climb.summitRadius ?? 14) : isRest ? Number(climb.restRadius ?? 7) : Number(climb.normalRadius ?? anchor.radius ?? 5),
      type,
      label: isStart ? "Base anchor" : isSummit ? "Summit anchor" : isRest ? `Restore node ${index}` : `Anchor node ${index}`,
      staminaRestore: isRest ? Number(climb.staminaRestore ?? 45) : 0,
      tags: anchor.tags ?? [],
      metadata: anchor.metadata ?? {}
    };
  });
  const opening = climb.openingPattern;
  const openingBeats = Array.isArray(opening?.beats) ? opening.beats : [];
  for (const [order, beat] of openingBeats.entries()) {
    const index = Math.max(1, Math.min(ledges.length - 2, Math.floor(Number(beat.index ?? order + 1))));
    const source = ledges[index];
    if (!source) continue;
    const type = beat.type ?? source.type;
    ledges[index] = {
      ...source,
      id: beat.id ?? source.id,
      x: Number(beat.x ?? source.x),
      y: Number(beat.y ?? source.y),
      r: Number(beat.radius ?? source.r),
      type,
      label: beat.label ?? source.label,
      staminaRestore: type === "rest" ? Number(beat.staminaRestore ?? source.staminaRestore ?? climb.staminaRestore ?? 45) : 0,
      tags: [...new Set([...(source.tags ?? []), ...(beat.tags ?? []), type])],
      metadata: {
        ...(source.metadata ?? {}),
        openingPatternId: opening.id ?? "counterwind-opening",
        openingRole: beat.role ?? `opening-beat-${order}`,
        openingOrder: order,
        windDirection: Number(opening.windDirection ?? 1),
        openingGustIntensity: Number(beat.gustIntensity ?? 0),
        openingPressureDelta: Number(beat.pressureDelta ?? 0),
        openingPressureRecovery: Number(beat.pressureRecovery ?? 0),
        openingStatus: beat.status ?? null,
        authoredRouteBeat: true
      }
    };
  }
  const postRestChoice = climb.postRestChoice;
  const choiceBranchBeats = [postRestChoice?.safe, postRestChoice?.shortcut, postRestChoice?.rejoin].filter(Boolean);
  const postRejoinBeat = postRestChoice?.postRejoin ?? null;
  const payoffBeats = [postRestChoice?.payoff?.safe, postRestChoice?.payoff?.shortcut].filter(Boolean);
  const convergenceBeat = postRestChoice?.convergence ?? null;
  let genericRejoinAnchorId = null;
  for (const beat of [...choiceBranchBeats, postRejoinBeat, ...payoffBeats].filter(Boolean)) {
    const index = Math.max(1, Math.min(ledges.length - 2, Math.floor(Number(beat.index ?? 1))));
    const source = ledges[index];
    if (!source) continue;
    ledges[index] = choiceBeatLedge(source, beat, postRestChoice.id ?? "post-rest-signal-fork", climb.staminaRestore);
  }
  if (convergenceBeat) {
    const index = Math.max(1, Math.min(ledges.length - 1, Math.floor(Number(convergenceBeat.index ?? 1))));
    const source = ledges[index];
    if (source) {
      ledges.splice(index, 0, choiceBeatLedge(source, convergenceBeat, postRestChoice.id ?? "post-rest-signal-fork", climb.staminaRestore));
      ledges.forEach((ledge, ledgeIndex) => { ledge.index = ledgeIndex; });
      genericRejoinAnchorId = ledges[index + 1]?.id ?? null;
    }
  }
  const crest = climb.masteryCrest;
  const crestBeats = Array.isArray(crest?.beats) ? crest.beats : [];
  const lastIndex = ledges.length - 1;
  for (const [order, beat] of crestBeats.entries()) {
    const index = Math.max(0, lastIndex - Math.max(0, Math.floor(Number(beat.fromSummit ?? 0))));
    const source = ledges[index];
    if (!source) continue;
    const type = beat.type ?? source.type;
    ledges[index] = {
      ...source,
      id: beat.id ?? source.id,
      x: Number(beat.x ?? source.x),
      y: summitY + Number(beat.yOffset ?? source.y - summitY),
      r: Number(beat.radius ?? source.r),
      type,
      label: beat.label ?? source.label,
      staminaRestore: type === "rest" ? Number(beat.staminaRestore ?? source.staminaRestore ?? climb.staminaRestore ?? 45) : 0,
      tags: [...new Set([...(source.tags ?? []), ...(beat.tags ?? []), type])],
      metadata: {
        ...(source.metadata ?? {}),
        masteryCrestId: crest.id ?? "summit-mastery-crest",
        masteryRole: beat.role ?? `crest-beat-${order}`,
        masteryOrder: order,
        authoredRouteBeat: true
      }
    };
  }
  return {
    id: climb.routeId ?? projectedRoute?.id ?? "next-ledge-route",
    seed: projectedRoute?.seed,
    sector: Number(climb.sector ?? 1),
    summitY,
    ledges,
    chunks: chunksFor(summitY),
    route: ledges.map((ledge) => ledge.id),
    openingPattern: openingBeats.length ? {
      id: opening.id ?? "counterwind-opening",
      label: opening.label ?? "Counterwind opening",
      windDirection: Number(opening.windDirection ?? 1),
      baseStrength: Number(opening.baseStrength ?? 0.007),
      peakStrength: Number(opening.peakStrength ?? 0.024),
      response: Number(opening.response ?? 0.18),
      approach: { ...(opening.approach ?? {}) },
      beatIds: openingBeats.map((beat) => beat.id).filter(Boolean),
      endIndex: Math.min(ledges.length - 1, openingBeats.length)
    } : null,
    postRestChoice: choiceBranchBeats.length === 3 ? {
      id: postRestChoice.id ?? "post-rest-signal-fork",
      label: postRestChoice.label ?? "Signal fork",
      status: postRestChoice.status ?? "Signal fork open.",
      prompt: postRestChoice.prompt ?? "Choose a route.",
      restAnchorId: postRestChoice.restAnchorId ?? openingBeats.at(-1)?.id ?? null,
      safeAnchorId: postRestChoice.safe.id,
      shortcutAnchorId: postRestChoice.shortcut.id,
      rejoinAnchorId: postRestChoice.rejoin.id,
      postRejoinAnchorId: postRejoinBeat?.id ?? null,
      payoffSafeAnchorId: postRestChoice?.payoff?.safe?.id ?? null,
      payoffShortcutAnchorId: postRestChoice?.payoff?.shortcut?.id ?? null,
      convergenceAnchorId: convergenceBeat?.id ?? null,
      genericRejoinAnchorId,
      safe: { ...postRestChoice.safe },
      shortcut: { ...postRestChoice.shortcut },
      rejoin: { ...postRestChoice.rejoin },
      postRejoin: postRejoinBeat ? { ...postRejoinBeat } : null,
      payoff: payoffBeats.length === 2 ? {
        safe: { ...postRestChoice.payoff.safe },
        shortcut: { ...postRestChoice.payoff.shortcut }
      } : null,
      convergence: convergenceBeat ? { ...convergenceBeat } : null
    } : null,
    masteryCrest: crestBeats.length ? {
      id: crest.id ?? "summit-mastery-crest",
      beatIds: crestBeats.map((beat) => beat.id).filter(Boolean),
      startIndex: Math.max(0, ledges.length - crestBeats.length),
      summitId: ledges.at(-1)?.id ?? "summit"
    } : null,
    sourceRoute: projectedRoute
  };
}

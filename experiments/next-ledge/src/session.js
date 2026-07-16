import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createGenericAnchorDescriptorKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusEngine-ProtoKits@04d34f049f58ae359cf71d43466c429dac2a6d08/protokits/generic-anchor-descriptor-kit/index.js";
import { createGenericModeProjectedRoute, createProjectedRoute } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusEngine-ProtoKits@04d34f049f58ae359cf71d43466c429dac2a6d08/protokits/generic-mode-projected-route/index.js";
import { createGenericRouteProgressKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusEngine-ProtoKits@04d34f049f58ae359cf71d43466c429dac2a6d08/protokits/generic-route-progress-kit/index.js";
import { createGenericTetherTraversalDomainKits, createGenericTetherTraversalPreset } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusEngine-ProtoKits@04d34f049f58ae359cf71d43466c429dac2a6d08/protokits/generic-tether-traversal-domain-kits/index.js";
import { createNextLedgeClimbPreset } from "./climb-preset.js?v=post-rejoin-consequence-1";
import { adaptProjectedRouteToClimbRoute } from "./climb-anchor-adapter.js?v=post-rejoin-consequence-1";
import { createClimbActionAdapter } from "./climb-action-adapter.js";

const clamp = (v, a, b) => Math.max(a, Math.min(b, Number.isFinite(Number(v)) ? Number(v) : a));
const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const d2 = (a, b) => Math.hypot(n(a.x) - n(b.x), n(a.y) - n(b.y));
const copy = (v) => typeof structuredClone === "function" ? structuredClone(v) : JSON.parse(JSON.stringify(v));

const PLAYER_UPGRADE_PRESET = Object.freeze({
  routePacing: { summitPerSectorY: 760, sampleSpacingY: 118, minAnchors: 16, jitterX: 158, jitterY: 34, restEvery: 4, maxEdgeDistance: 202 },
  tetherMotion: { ropeLength: 56, maxCableLength: 184, swingInputTorque: 0.0064, angularDamping: 0.993, maxAngularSpeed: 0.15, inputDrainPerFrame: 0.034, idleDrainPerFrame: 0.006, reelPull: 0.82, reelShortenRate: 2.7, airControl: 0.16, lockMaxAngle: 1.2, lockMaxAngularSpeed: 0.12 },
  cableLaunch: { projectileSpeed: 11.8, liftBoost: 0.58, latchRadius: 15, sweepRadius: 11, aimAssistRadius: 36, aimAssistDistance: 205, aimAssistStrength: 0.82, maxProbeTicks: 92, launchStaminaCost: 2 },
  traversalVitals: { maxStamina: 120, restRestore: 66, criticalStamina: 22, lowStaminaCue: 0.22 },
  traversalRecovery: { scaffoldBoundary: 184, failFloorDistance: 320 },
  traversalCamera: { z: 244, leadY: 78, swingFollow: 0.052, fallFollow: 0.108, anticipationY: 28 },
  traversalCue: { swingHint: "Build flow, then release at speed.", fallHint: "Aim at the cyan anchor and fire.", restHint: "Recovery anchor locked. Stamina restored.", summitHint: "Summit delivery beam locked." },
  traversalFeedback: { trailMax: 52, sparksOnLatch: 22, cameraImpulseLatch: 0.22, cameraImpulseFail: 0.42 }
});

function segmentDistance(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const len = dx * dx + dy * dy;
  if (!len) return Math.hypot(px - ax, py - ay);
  const t = clamp(((px - ax) * dx + (py - ay) * dy) / len, 0, 1);
  return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
}

function ropeNodes(start, end, count, wind = 0, slack = 0) {
  return Array.from({ length: count }, (_, i) => {
    const t = i / Math.max(1, count - 1);
    const sag = Math.sin(Math.PI * t) * slack;
    const sway = Math.sin(t * Math.PI * 2) * wind * Math.sin(Math.PI * t);
    return { x: start.x + (end.x - start.x) * t + sway, y: start.y + (end.y - start.y) * t - sag, z: 1 };
  });
}

function addEvent(state, type, payload = {}) {
  state.recentEvents.push({ ...payload, type, at: state.frame });
  if (state.recentEvents.length > 16) state.recentEvents.shift();
}

function flattenDomainPreset(domainPreset = {}) {
  return Object.fromEntries(Object.values(domainPreset).flatMap((entry = {}) => Object.entries(entry.settings ?? {})));
}

function createDomainPreset(options = {}) {
  const overrides = { ...PLAYER_UPGRADE_PRESET, ...(options.domain ?? options.traversal ?? {}) };
  return createGenericTetherTraversalPreset(overrides);
}

function settingsFromEngine(engine, fallback = {}) {
  return {
    ...fallback,
    ...(engine.routePacing?.getSettings?.() ?? {}),
    ...(engine.tetherMotion?.getSettings?.() ?? {}),
    ...(engine.cableLaunch?.getSettings?.() ?? {}),
    ...(engine.traversalVitals?.getSettings?.() ?? {}),
    ...(engine.traversalRecovery?.getSettings?.() ?? {}),
    ...(engine.traversalCamera?.getSettings?.() ?? {}),
    ...(engine.traversalCue?.getSettings?.() ?? {}),
    ...(engine.traversalFeedback?.getSettings?.() ?? {})
  };
}

function createInitialWind(route, sector, tuning) {
  const fallback = (sector - 1) * n(tuning.windPerSector, 0.004);
  const opening = route.openingPattern;
  const intensity = opening ? n(opening.approach?.gustIntensity, 0.38) : 0;
  const base = opening ? n(opening.baseStrength, 0.007) : fallback;
  const peak = opening ? Math.max(base, n(opening.peakStrength, 0.024)) : base;
  const strength = base + (peak - base) * intensity;
  return {
    strength,
    targetStrength: strength,
    intensity,
    phase: opening ? "approach" : "steady",
    resolved: false,
    direction: n(opening?.windDirection, sector % 2 === 0 ? -1 : 1),
    offset: 0
  };
}

function createInitialRouteChoice(route) {
  const choice = route?.postRestChoice;
  if (!choice) return null;
  return {
    id: choice.id,
    label: choice.label,
    status: "approaching",
    selectedRole: null,
    selectedAnchorId: null,
    unselectedAnchorId: null,
    restAnchorId: choice.restAnchorId,
    safeAnchorId: choice.safeAnchorId,
    shortcutAnchorId: choice.shortcutAnchorId,
    rejoinAnchorId: choice.rejoinAnchorId,
    postRejoinAnchorId: choice.postRejoinAnchorId,
    pressureDelta: 0,
    cargoBonus: 0,
    protectedGrapplesRemaining: 0,
    ventRequired: false
  };
}

function aimFrom(state, payload = {}) {
  if (Number.isFinite(Number(payload.x)) || Number.isFinite(Number(payload.y))) {
    const dx = n(payload.x, state.player.x) - state.player.x;
    const dy = n(payload.y, state.player.y + 1) - state.player.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: dx / len, y: dy / len, worldX: n(payload.x), worldY: n(payload.y) };
  }
  const dx = n(payload.dx, state.aim.x);
  const dy = n(payload.dy, state.aim.y);
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len, worldX: state.player.x + dx * 150, worldY: state.player.y + dy * 150 };
}

function createProjectedClimbRoute(options = {}) {
  const preset = createNextLedgeClimbPreset(options);
  const projectedRoute = createProjectedRoute(preset.routeProjection);
  const route = adaptProjectedRouteToClimbRoute(projectedRoute, { ...preset.climb, sector: preset.sector });
  return { preset, projectedRoute, route };
}

function createRouteProgressRoute(state) {
  const ledges = state.route?.ledges ?? [];
  return {
    id: state.route?.id ?? state.levelId ?? `next-ledge-sector-${state.sector}`,
    label: state.route?.label ?? `Next Ledge Sector ${state.sector}`,
    checkpoints: ledges.map((ledge, index) => ({
      id: ledge.id,
      label: ledge.label ?? ledge.id,
      objective: ledge.type === "summit" ? "Reach the summit anchor." : ledge.type === "rest" ? "Secure a restore anchor." : "Secure climb anchor.",
      order: index,
      required: ledge.type === "summit" || index === 0,
      position: { x: n(ledge.x), y: n(ledge.y), z: 1 },
      radius: n(ledge.r, 8),
      tags: ["next-ledge", "climb-anchor", ledge.type].filter(Boolean),
      descriptor: { kind: "climb-anchor", anchorType: ledge.type ?? "anchor" },
      metadata: { sector: state.sector, source: "next-ledge", masteryRole: ledge.metadata?.masteryRole ?? null }
    }))
  };
}

function routeProgressFacade(engine) {
  return engine.n?.genericRouteProgress ?? engine.genericRouteProgress;
}

function syncRouteProgressRoute(engine, state, reason = "next-ledge-route-sync") {
  const facade = routeProgressFacade(engine);
  if (!facade) return null;
  facade.setRoute?.(createRouteProgressRoute(state), { reason });
  if (state.currentAnchorId) {
    facade.complete?.(state.currentAnchorId, {
      allowOutOfOrder: true,
      actorId: "next-ledge-climber",
      commandId: `${reason}:${state.currentAnchorId}`
    });
  }
  return facade.getState?.() ?? null;
}

function syncRouteProgressEvents(engine, state, beforeEvents) {
  const facade = routeProgressFacade(engine);
  if (!facade) return;
  const synced = new Set();
  for (const evt of state.recentEvents.filter((event) => !beforeEvents.has(event))) {
    const checkpointId = evt.targetId;
    if (!checkpointId || synced.has(checkpointId)) continue;
    if (!["anchor-locked", "restored", "summit-reached", "route-choice-skipped"].includes(evt.type)) continue;
    facade.enter?.(checkpointId, {
      actorId: "next-ledge-climber",
      commandId: `frame-${state.frame}:enter:${checkpointId}`
    });
    facade.complete?.(checkpointId, {
      allowOutOfOrder: true,
      actorId: "next-ledge-climber",
      commandId: `frame-${state.frame}:complete:${checkpointId}`
    });
    synced.add(checkpointId);
  }
}

function createInitialState(options = {}, status = "SYS_STATUS: ACTIVE") {
  const domainPreset = options.domainPreset ?? createDomainPreset(options);
  const tuning = { ...flattenDomainPreset(domainPreset), ...(options.settings ?? {}) };
  const sector = Math.max(1, Math.floor(n(options.sector, 1)));
  const { preset, projectedRoute, route } = createProjectedClimbRoute({ ...options, ...tuning, routePacing: tuning, sector });
  const ropeLength = n(options.ropeLength, tuning.ropeLength ?? 52);
  const maxCable = n(options.maxCableLength, tuning.maxCableLength ?? 168);
  const maxStamina = n(options.staminaMax, tuning.maxStamina ?? 115);
  const nodeCount = Math.max(4, Math.floor(n(options.ropeNodeCount, 12)));
  const start = route.ledges[0] ?? { id: "start", x: 0, y: 0, r: 8, label: "Start" };
  const player = { x: start.x, y: start.y - ropeLength, z: 1, vx: 0, vy: 0, angle: 0, aVel: 0, scaleX: 1, scaleY: 1, scaleZ: 1, rotationX: 0, rotationY: 0 };
  return {
    version: "next-ledge-generic-traversal-domain-0.3.0",
    levelId: route.id,
    frame: 0,
    sector,
    mode: "swinging",
    alive: true,
    completed: false,
    paused: false,
    status,
    tuning,
    preset,
    projectedRoute,
    route,
    currentAnchorId: start.id,
    lastLedgeId: start.id,
    anchorLedge: start,
    constants: { gravity: n(options.gravityBase, tuning.gravityBase ?? 0.049) + sector * n(options.gravityPerSector, tuning.gravityPerSector ?? 0.0022), ropeLength, maxCableLength: maxCable, maxStamina, scaffoldBoundary: n(options.scaffoldBoundary, tuning.scaffoldBoundary ?? 176), ropeNodeCount: nodeCount },
    stamina: maxStamina,
    maxHeight: 0,
    wind: createInitialWind(route, sector, tuning),
    routeChoice: createInitialRouteChoice(route),
    sectorTransition: {
      active: false,
      phase: "idle",
      elapsed: 0,
      totalElapsed: 0,
      sourceSector: sector,
      targetSector: sector,
      windDirection: n(route.openingPattern?.windDirection, sector % 2 === 0 ? -1 : 1),
      label: route.openingPattern?.label ?? null
    },
    aim: { x: 0, y: 1, worldX: 0, worldY: maxCable },
    input: { axis: 0 },
    player,
    probe: { x: player.x, y: player.y, z: 1, vx: 0, vy: 0, ticks: 0, visible: false },
    rope: { visible: true, start, end: player, nodes: ropeNodes(start, player, nodeCount, 0, tuning.ropeSlack ?? 7), targetLength: ropeLength },
    reeling: { ropeLength, anchorId: null },
    camera: { x: 0, y: player.y + 40, z: n(tuning.z, 232), targetY: player.y + n(tuning.leadY, 68), trauma: 0 },
    reach: { x: player.x, y: player.y, r: maxCable },
    trajectory: [],
    effects: { sparks: [], trail: [] },
    enabledTargetIds: [],
    hoveredId: null,
    aimAssistTargetId: null,
    stats: { launches: 0, latches: 0, releases: 0, wallBounces: 0, rests: 0, falls: 0, sectorsCleared: sector - 1, rejected: 0, assistedShots: 0 },
    recentEvents: []
  };
}

function ledgeMap(state) {
  return Object.fromEntries((state.route?.ledges ?? []).map((ledge) => [ledge.id, ledge]));
}

function openingWindStage(state) {
  const opening = state.route?.openingPattern;
  if (!opening) return null;
  const choice = state.routeChoice;
  if (choice?.status === "open") {
    return { phase: "choice-open", intensity: 0.12, resolved: true };
  }
  if (choice?.status === "committed" && state.currentAnchorId !== choice.rejoinAnchorId) {
    return {
      phase: choice.selectedRole === "pressure-shortcut" ? "signal-shortcut" : "shelter-ascent",
      intensity: choice.selectedRole === "pressure-shortcut" ? 0.88 : 0.14,
      resolved: choice.selectedRole !== "pressure-shortcut"
    };
  }
  if (choice?.status === "consequence-active") {
    return {
      phase: choice.selectedRole === "pressure-shortcut" ? "retained-pressure" : "protected-grapple",
      intensity: choice.selectedRole === "pressure-shortcut" ? 0.72 : 0.1,
      resolved: choice.selectedRole !== "pressure-shortcut"
    };
  }
  const ledges = state.route?.ledges ?? [];
  const currentIndex = ledges.findIndex((ledge) => ledge.id === state.currentAnchorId);
  if (currentIndex <= 0) {
    return {
      phase: "approach",
      intensity: n(opening.approach?.gustIntensity, 0.38),
      resolved: false
    };
  }
  const current = ledges[currentIndex];
  if (current?.metadata?.openingPatternId === opening.id) {
    return {
      phase: current.metadata.openingRole ?? "opening",
      intensity: n(current.metadata.openingGustIntensity, 0.5),
      resolved: current.metadata.openingRole === "opening-rest"
    };
  }
  return { phase: "post-opening", intensity: 0, resolved: false };
}

function updateOpeningWind(state, dt) {
  const stage = openingWindStage(state);
  const opening = state.route?.openingPattern;
  const fallback = (state.sector - 1) * n(state.tuning?.windPerSector, 0.004);
  const base = opening ? n(opening.baseStrength, Math.max(0.007, fallback)) : fallback;
  const peak = opening ? Math.max(base, n(opening.peakStrength, 0.024)) : base;
  const intensity = clamp(n(stage?.intensity, 0), 0, 1);
  const target = opening ? base + (peak - base) * intensity : fallback;
  const response = opening ? n(opening.response, 0.18) : 1;
  state.wind.targetStrength = target;
  state.wind.strength += (target - state.wind.strength) * clamp(response * dt * 60, 0, 1);
  state.wind.intensity = intensity;
  state.wind.phase = stage?.phase ?? "steady";
  state.wind.resolved = Boolean(stage?.resolved);
}

function enabledTargets(state) {
  if (!state.alive || state.completed) return [];
  const choice = state.routeChoice;
  return (state.route?.ledges ?? [])
    .filter((ledge) => ledge.id !== state.lastLedgeId && d2(ledge, state.player) <= state.constants.maxCableLength + ledge.r)
    .filter((ledge) => {
      if (!choice) return true;
      if (choice.status === "open") return [choice.safeAnchorId, choice.shortcutAnchorId].includes(ledge.id);
      if (choice.status === "committed" && state.currentAnchorId !== choice.rejoinAnchorId) return ledge.id === choice.rejoinAnchorId;
      if (choice.status === "committed" && ledge.id === choice.unselectedAnchorId) return false;
      if (choice.status === "consequence-active") return ledge.id === choice.postRejoinAnchorId;
      return true;
    })
    .map((ledge) => ledge.id);
}

function prepareRouteChoiceLock(state, ledge) {
  const choice = state.routeChoice;
  const role = ledge.metadata?.routeChoiceRole;
  if (!choice || !["safe-recovery", "pressure-shortcut"].includes(role) || ["committed", "rejoined"].includes(choice.status)) return null;
  const unselectedAnchorId = role === "safe-recovery" ? choice.shortcutAnchorId : choice.safeAnchorId;
  choice.status = "committed";
  choice.selectedRole = role;
  choice.selectedAnchorId = ledge.id;
  choice.unselectedAnchorId = unselectedAnchorId;
  choice.pressureDelta = n(ledge.metadata?.routeChoicePressureDelta, 0);
  choice.cargoBonus = n(ledge.metadata?.routeChoiceCargoBonus, 0);
  addEvent(state, "route-choice-skipped", { targetId: unselectedAnchorId, routeChoiceId: choice.id, selectedRole: role });
  return {
    targetId: ledge.id,
    routeChoiceId: choice.id,
    selectedRole: role,
    pressureDelta: choice.pressureDelta,
    cargoBonus: choice.cargoBonus,
    gustIntensity: n(ledge.metadata?.routeChoiceGustIntensity, 0),
    status: ledge.metadata?.routeChoiceStatus
  };
}

function protectedRecoveryWindow(state) {
  const choice = state.routeChoice;
  if (choice?.status !== "consequence-active" || choice.selectedRole !== "safe-recovery" || choice.protectedGrapplesRemaining <= 0) return null;
  const target = ledgeMap(state)[choice.postRejoinAnchorId];
  return target ? {
    targetId: target.id,
    failFloorBonus: n(target.metadata?.routeChoiceProtectedFailFloorBonus, 0),
    aimAssistBonus: n(target.metadata?.routeChoiceProtectedAimAssistBonus, 0)
  } : null;
}

function setRope(state, a, b, slack = 8) {
  state.rope = { ...state.rope, start: { x: a.x, y: a.y, z: 1 }, end: { x: b.x, y: b.y, z: 1 }, nodes: ropeNodes(a, b, state.constants.ropeNodeCount, state.wind.strength * n(state.wind.direction, 1) * n(state.tuning.windCoupling, 14), slack), targetLength: d2(a, b) + slack };
}

function assistedAim(state) {
  const cfg = state.tuning ?? {};
  const maxDistance = n(cfg.aimAssistDistance, 185);
  const recoveryWindow = protectedRecoveryWindow(state);
  const assistRadius = n(cfg.aimAssistRadius, 28) + n(recoveryWindow?.aimAssistBonus, 0);
  const strength = clamp(n(cfg.aimAssistStrength, 0.72) + (recoveryWindow ? 0.14 : 0), 0, 1);
  let best = null;
  for (const id of enabledTargets(state)) {
    const ledge = ledgeMap(state)[id];
    if (!ledge) continue;
    const dx = ledge.x - state.player.x;
    const dy = ledge.y - state.player.y;
    const along = dx * state.aim.x + dy * state.aim.y;
    if (along < 8 || along > maxDistance) continue;
    const miss = Math.abs(dx * state.aim.y - dy * state.aim.x) / Math.max(1, Math.hypot(state.aim.x, state.aim.y));
    if (miss <= assistRadius + n(ledge.r, 0)) {
      const score = miss + along * 0.012;
      if (!best || score < best.score) best = { ledge, score };
    }
  }
  state.aimAssistTargetId = best?.ledge?.id ?? null;
  if (!best) return state.aim;
  const dx = best.ledge.x - state.player.x;
  const dy = best.ledge.y - state.player.y;
  const len = Math.hypot(dx, dy) || 1;
  const blended = { x: state.aim.x * (1 - strength) + dx / len * strength, y: state.aim.y * (1 - strength) + dy / len * strength };
  const bLen = Math.hypot(blended.x, blended.y) || 1;
  state.stats.assistedShots += 1;
  addEvent(state, "aim-assisted", { targetId: best.ledge.id });
  return { x: blended.x / bLen, y: blended.y / bLen, worldX: best.ledge.x, worldY: best.ledge.y };
}

function release(state) {
  state.mode = "falling";
  state.rope.visible = false;
  state.probe.visible = false;
  state.stats.releases += 1;
  state.status = state.tuning.fallHint ?? "Tether released. Aim and fire before falling out of frame.";
  addEvent(state, "released", { x: state.player.x, y: state.player.y });
}

function launch(state) {
  if (state.stamina <= 0) return;
  const aim = assistedAim(state);
  state.aim = { ...state.aim, ...aim };
  const speed = n(state.tuning.projectileSpeed, 10.8);
  state.mode = "launched";
  state.lastLedgeId = state.currentAnchorId;
  state.probe = { x: state.player.x + state.aim.x * n(state.tuning.launchOffset, 9), y: state.player.y + state.aim.y * n(state.tuning.launchOffset, 9), z: 1, vx: state.aim.x * speed, vy: state.aim.y * speed + speed * n(state.tuning.liftBoost, 0.52), ticks: 0, visible: true };
  state.rope.visible = true;
  state.stamina = clamp(state.stamina - n(state.tuning.launchStaminaCost, 3), 0, state.constants.maxStamina);
  state.stats.launches += 1;
  state.status = state.aimAssistTargetId ? "Grapple magnetized to viable anchor." : "Grapple fired. Cable sweep can latch nearby anchors.";
  addEvent(state, "grapple-fired", { x: state.probe.x, y: state.probe.y, targetId: state.aimAssistTargetId });
}

function grab(state, ledge) {
  state.mode = "reeling";
  state.anchorLedge = ledge;
  state.reeling = { anchorId: ledge.id, ropeLength: d2(ledge, state.player) + 24 };
  state.probe.visible = false;
  state.rope.visible = true;
  state.stats.latches += 1;
  state.camera.trauma = Math.max(state.camera.trauma ?? 0, n(state.tuning.cameraImpulseLatch, 0.16));
  state.status = `Latched ${ledge.label}. Winch pulling to swing radius.`;
  addEvent(state, "grapple-latched", { targetId: ledge.id, ledgeType: ledge.type });
}

function lock(state, ledge) {
  state.currentAnchorId = ledge.id;
  state.lastLedgeId = ledge.id;
  state.anchorLedge = ledge;
  state.player.angle = clamp(
    Math.atan2(state.player.x - ledge.x, ledge.y - state.player.y || 0.001),
    -n(state.tuning.lockMaxAngle, 1.2),
    n(state.tuning.lockMaxAngle, 1.2)
  );
  state.player.aVel = clamp(
    (state.player.vx >= 0 ? 1 : -1) * (Math.hypot(state.player.vx, state.player.vy) / state.constants.ropeLength) * 0.72,
    -n(state.tuning.lockMaxAngularSpeed, 0.12),
    n(state.tuning.lockMaxAngularSpeed, 0.12)
  );
  state.player.vx = 0;
  state.player.vy = 0;
  state.aimAssistTargetId = null;
  const choiceCommit = prepareRouteChoiceLock(state, ledge);
  addEvent(state, "anchor-locked", { targetId: ledge.id, ledgeType: ledge.type, masteryRole: ledge.metadata?.masteryRole, openingRole: ledge.metadata?.openingRole });
  if (ledge.type === "summit") {
    state.mode = "won";
    state.completed = true;
    state.status = "Signal delivered. Summit relay online.";
    addEvent(state, "summit-reached", { sector: state.sector, targetId: ledge.id });
  } else {
    state.mode = "swinging";
    if (ledge.type === "rest") {
      state.stamina = clamp(state.stamina + n(ledge.staminaRestore, n(state.tuning.restRestore, 58)), 0, state.constants.maxStamina);
      state.stats.rests += 1;
      state.status = ledge.metadata?.openingRole === "opening-rest"
        ? ledge.metadata.openingStatus
        : ledge.metadata?.masteryRole === "crest-rest"
        ? "Stormbreak rest secured. Build a clean arc for the commit perch."
        : state.tuning.restHint ?? "Restore unit synchronized. Stamina replenished.";
      addEvent(state, "restored", { targetId: ledge.id });
      if (ledge.metadata?.openingRole === "opening-rest") {
        state.camera.trauma = Math.max(state.camera.trauma ?? 0, 0.14);
        addEvent(state, "counterwind-recovered", {
          targetId: ledge.id,
          pressureRecovery: n(ledge.metadata.openingPressureRecovery, 100),
          gustIntensity: n(ledge.metadata.openingGustIntensity, 0.08)
        });
        if (state.routeChoice) {
          state.routeChoice.status = "open";
          state.status = state.route?.postRestChoice?.status ?? "Choose a route beyond Counterwind Rest.";
          addEvent(state, "post-rest-route-choice-opened", {
            targetId: ledge.id,
            routeChoiceId: state.routeChoice.id,
            safeAnchorId: state.routeChoice.safeAnchorId,
            shortcutAnchorId: state.routeChoice.shortcutAnchorId
          });
        }
      }
    } else {
      const masteryCopy = {
        "crest-commit": "Commit perch locked. Swing left and release into the crosswind catch.",
        "crest-catch": "Crosswind caught. Reverse the arc toward the relay crown.",
        "crest-handoff": "Relay crown secured. One final line carries the signal home."
      };
      state.status = ledge.metadata?.openingStatus ?? masteryCopy[ledge.metadata?.masteryRole] ?? state.tuning.swingHint ?? `Swinging from ${ledge.label}. Release when your arc feels right.`;
      if (ledge.metadata?.openingRole) {
        addEvent(state, "counterwind-pressure-surged", {
          targetId: ledge.id,
          openingRole: ledge.metadata.openingRole,
          pressureDelta: n(ledge.metadata.openingPressureDelta, 0),
          gustIntensity: n(ledge.metadata.openingGustIntensity, 0)
        });
      }
    }
  }
  if (choiceCommit) {
    state.camera.trauma = Math.max(state.camera.trauma ?? 0, choiceCommit.selectedRole === "pressure-shortcut" ? 0.24 : 0.12);
    state.status = choiceCommit.status ?? state.status;
    addEvent(state, "post-rest-route-choice-committed", choiceCommit);
  } else if (state.routeChoice?.status === "committed" && ledge.id === state.routeChoice.rejoinAnchorId) {
    state.routeChoice.status = "consequence-active";
    state.routeChoice.protectedGrapplesRemaining = state.routeChoice.selectedRole === "safe-recovery" ? 1 : 0;
    state.routeChoice.ventRequired = state.routeChoice.selectedRole === "pressure-shortcut";
    const postRejoin = ledgeMap(state)[state.routeChoice.postRejoinAnchorId];
    state.status = state.routeChoice.selectedRole === "pressure-shortcut"
      ? postRejoin?.metadata?.routeChoiceShortcutStatus ?? "Signal pressure retained. Reach the restore unit to vent."
      : postRejoin?.metadata?.routeChoiceSafeStatus ?? "Shelter line banked. One protected grapple is ready.";
    addEvent(state, "post-rest-route-choice-rejoined", {
      targetId: ledge.id,
      routeChoiceId: state.routeChoice.id,
      selectedRole: state.routeChoice.selectedRole,
      postRejoinAnchorId: state.routeChoice.postRejoinAnchorId,
      protectedGrapplesRemaining: state.routeChoice.protectedGrapplesRemaining,
      ventRequired: state.routeChoice.ventRequired
    });
  } else if (state.routeChoice?.status === "consequence-active" && ledge.id === state.routeChoice.postRejoinAnchorId) {
    const role = state.routeChoice.selectedRole;
    state.routeChoice.status = "resolved";
    state.routeChoice.protectedGrapplesRemaining = 0;
    state.routeChoice.ventRequired = false;
    if (role === "pressure-shortcut") {
      state.status = ledge.metadata?.routeChoiceResolvedShortcutStatus ?? "Retained pressure vented. Stormlock Restore secured.";
      addEvent(state, "post-rejoin-pressure-vented", {
        targetId: ledge.id,
        routeChoiceId: state.routeChoice.id,
        selectedRole: role,
        pressureRecovery: n(ledge.metadata?.routeChoicePressureRecovery, 100)
      });
    } else {
      state.status = ledge.metadata?.routeChoiceResolvedSafeStatus ?? "Protected grapple confirmed. Stormlock Restore secured.";
      addEvent(state, "post-rejoin-protected-grapple-consumed", {
        targetId: ledge.id,
        routeChoiceId: state.routeChoice.id,
        selectedRole: role
      });
    }
  }
}

function fail(state, reason) {
  if (state.mode === "dead") return;
  state.mode = "dead";
  state.alive = false;
  state.rope.visible = false;
  state.probe.visible = false;
  state.stats.falls += 1;
  state.camera.trauma = Math.max(state.camera.trauma ?? 0, n(state.tuning.cameraImpulseFail, 0.38));
  state.status = reason;
  addEvent(state, "failed", { reason });
}

function command(state) {
  if (["dead", "won"].includes(state.mode)) return;
  if (state.mode === "swinging" || state.mode === "reeling") release(state);
  else if (state.mode === "falling") launch(state);
  else if (state.mode === "launched") { state.mode = "retracting"; state.status = "Grapple retracting."; }
}

function stepSwing(state, dt) {
  const ledge = ledgeMap(state)[state.currentAnchorId] ?? state.route.ledges[0];
  const axis = clamp(state.input.axis, -1, 1);
  const ropeLength = state.constants.ropeLength;
  let acc = -(state.constants.gravity / ropeLength) * Math.sin(state.player.angle) + axis * n(state.tuning.swingInputTorque, 0.0049);
  acc += state.wind.strength * n(state.wind.direction, 1) * Math.sin(state.wind.offset) * Math.cos(state.player.angle) / ropeLength;
  const maxAngularSpeed = n(state.tuning.maxAngularSpeed, 0.15);
  state.player.aVel = clamp((state.player.aVel + acc) * n(state.tuning.angularDamping, 0.9915), -maxAngularSpeed, maxAngularSpeed);
  state.player.angle = Math.atan2(Math.sin(state.player.angle + state.player.aVel), Math.cos(state.player.angle + state.player.aVel));
  state.player.x = ledge.x + Math.sin(state.player.angle) * ropeLength;
  state.player.y = ledge.y - Math.cos(state.player.angle) * ropeLength;
  state.player.vx = state.player.aVel * ropeLength * Math.cos(state.player.angle);
  state.player.vy = state.player.aVel * ropeLength * Math.sin(state.player.angle);
  const drain = Math.abs(axis) ? n(state.tuning.inputDrainPerFrame, 0.046) : n(state.tuning.idleDrainPerFrame, 0.011);
  state.stamina = clamp(state.stamina - drain * (1 + state.sector * 0.12) * dt * 60, 0, state.constants.maxStamina);
  state.rope.visible = true;
  setRope(state, ledge, state.player, n(state.tuning.ropeSlack, 7));
  if (state.stamina <= 0) release(state);
}

function fallPlayer(state, dt, drag = true) {
  const wind = state.wind.strength * n(state.wind.direction, 1) * Math.sin(state.wind.offset);
  state.player.vx += wind * 0.15 * dt * 60;
  state.player.vx += clamp(state.input.axis, -1, 1) * n(state.tuning.airControl, 0.12) * dt * 60;
  state.player.vy -= state.constants.gravity * dt * 60;
  if (drag) { state.player.vx *= Math.pow(0.96, dt * 60); state.player.vy *= Math.pow(0.96, dt * 60); }
  state.player.x += state.player.vx * dt * 60;
  state.player.y += state.player.vy * dt * 60;
}

function stepLaunched(state, dt) {
  fallPlayer(state, dt, false);
  state.probe.ticks += 1;
  state.probe.vy -= state.constants.gravity * 1.75 * dt * 60;
  state.probe.x += state.probe.vx * dt * 60;
  state.probe.y += state.probe.vy * dt * 60;
  const gap = d2(state.player, state.probe);
  if (gap > state.constants.maxCableLength) {
    const r = state.constants.maxCableLength / gap;
    state.probe.x = state.player.x + (state.probe.x - state.player.x) * r;
    state.probe.y = state.player.y + (state.probe.y - state.player.y) * r;
  }
  setRope(state, state.player, state.probe, n(state.tuning.launchSlack, 12));
  const assistedTarget = state.aimAssistTargetId ? ledgeMap(state)[state.aimAssistTargetId] : null;
  const latchCandidates = assistedTarget ? [assistedTarget] : state.route.ledges;
  for (const ledge of latchCandidates) {
    if (ledge.id === state.lastLedgeId) continue;
    if (d2(ledge, state.probe) <= ledge.r + n(state.tuning.latchRadius, 12) || segmentDistance(ledge.x, ledge.y, state.player.x, state.player.y, state.probe.x, state.probe.y) <= ledge.r + n(state.tuning.sweepRadius, 8)) return grab(state, ledge);
  }
  if (state.probe.ticks > n(state.tuning.maxProbeTicks, 86)) state.mode = "retracting";
}

function stepRetracting(state, dt) {
  fallPlayer(state, dt);
  const gap = d2(state.player, state.probe);
  if (gap < 10) { state.mode = "falling"; state.probe.visible = false; state.rope.visible = false; return; }
  const s = n(state.tuning.retractSpeed, 18) * dt * 60;
  state.probe.x += (state.player.x - state.probe.x) / gap * s;
  state.probe.y += (state.player.y - state.probe.y) / gap * s;
  state.probe.visible = true;
  state.rope.visible = true;
  setRope(state, state.player, state.probe, n(state.tuning.retractSlack, 10));
}

function stepReeling(state, dt) {
  const anchor = state.anchorLedge ?? ledgeMap(state)[state.reeling.anchorId];
  const gap = d2(anchor, state.player) || 0.001;
  state.reeling.ropeLength = Math.max(state.constants.ropeLength, state.reeling.ropeLength - n(state.tuning.reelShortenRate, 2.2) * dt * 60);
  if (gap <= state.constants.ropeLength && state.reeling.ropeLength <= state.constants.ropeLength) return lock(state, anchor);
  if (gap > state.reeling.ropeLength) {
    state.player.vx += (anchor.x - state.player.x) / gap * n(state.tuning.reelPull, 0.72) * dt * 60;
    state.player.vy += (anchor.y - state.player.y) / gap * n(state.tuning.reelPull, 0.72) * dt * 60;
  }
  state.player.vy -= state.constants.gravity * n(state.tuning.reelGravityScale, 0.32) * dt * 60;
  state.player.vx *= Math.pow(n(state.tuning.reelDamping, 0.958), dt * 60);
  state.player.vy *= Math.pow(n(state.tuning.reelDamping, 0.958), dt * 60);
  state.player.x += state.player.vx * dt * 60;
  state.player.y += state.player.vy * dt * 60;
  setRope(state, anchor, state.player, Math.max(0, state.reeling.ropeLength - gap));
  state.stamina = clamp(state.stamina - 0.068 * dt * 60, 0, state.constants.maxStamina);
  if (state.stamina <= 0) release(state);
}

function updateDerived(state) {
  state.player.scaleX = clamp(1 + Math.abs(state.player.vx) * 0.038, 0.35, 2);
  state.player.scaleY = clamp(1 + Math.abs(state.player.vy) * 0.038, 0.35, 2);
  state.player.rotationX += 0.035;
  state.player.rotationY += state.player.vx * 0.04;
  const follow = ["falling", "retracting", "launched"].includes(state.mode) ? n(state.tuning.fallFollow, 0.094) : n(state.tuning.swingFollow, 0.046);
  state.camera.targetY = state.player.y + n(state.tuning.leadY, 68) + Math.max(0, state.player.vy) * 0.7;
  state.camera.y += (state.camera.targetY - state.camera.y) * follow;
  state.camera.z += (n(state.tuning.z, 232) - state.camera.z) * 0.04;
  state.camera.trauma *= n(state.tuning.traumaDecay, 0.88);
  state.reach = { x: state.player.x, y: state.player.y, r: state.constants.maxCableLength };
  state.maxHeight = Math.max(state.maxHeight, Math.round(state.player.y / 10));
  state.enabledTargetIds = enabledTargets(state);
  state.trajectory = ["falling", "retracting"].includes(state.mode) ? Array.from({ length: 38 }, (_, i) => {
    let x = state.player.x, y = state.player.y, vx = state.player.vx, vy = state.player.vy;
    for (let s = 0; s < i; s += 1) { vy -= state.constants.gravity; vx *= 0.96; vy *= 0.96; x += vx; y += vy; }
    return { x, y, z: 1 };
  }) : [];
  const trailMax = Math.max(8, Math.floor(n(state.tuning.trailMax, 44)));
  state.effects.trail.push({ x: state.player.x, y: state.player.y, z: 1 });
  state.effects.trail = state.effects.trail.slice(-trailMax);
}

function stepState(state, dt) {
  if (!state.paused && !["dead", "won"].includes(state.mode)) {
    state.frame += 1;
    state.wind.offset += (0.045 + n(state.wind.intensity, 0) * 0.035) * dt * 60;
    if (!["swinging", "falling", "retracting"].includes(state.mode)) state.input.axis = 0;
    if (state.mode === "swinging") stepSwing(state, dt);
    else if (state.mode === "falling") fallPlayer(state, dt);
    else if (state.mode === "launched") stepLaunched(state, dt);
    else if (state.mode === "retracting") stepRetracting(state, dt);
    else if (state.mode === "reeling") stepReeling(state, dt);
    updateOpeningWind(state, dt);
    if (state.player.x < -state.constants.scaffoldBoundary || state.player.x > state.constants.scaffoldBoundary) {
      state.player.x = clamp(state.player.x, -state.constants.scaffoldBoundary, state.constants.scaffoldBoundary);
      state.player.vx = -state.player.vx * n(state.tuning.wallBounce, 0.62);
      state.stats.wallBounces += 1;
      addEvent(state, "wall-bounced", { x: state.player.x, y: state.player.y });
      if (["swinging", "reeling"].includes(state.mode)) release(state);
    }
    const safeAnchorY = n(ledgeMap(state)[state.currentAnchorId]?.y, 0);
    const recoveryWindow = protectedRecoveryWindow(state);
    const failFloorDistance = n(state.tuning.failFloorDistance, 520) + n(recoveryWindow?.failFloorBonus, 0);
    if (["falling", "retracting"].includes(state.mode) && state.player.y < safeAnchorY - failFloorDistance) fail(state, "Host aborted. Anchor connection lost below sector floor.");
  }
  updateDerived(state);
}

function masteryCrestSnapshot(state) {
  const beats = (state.route?.ledges ?? []).filter((ledge) => ledge.metadata?.masteryCrestId);
  const currentIndex = beats.findIndex((ledge) => ledge.id === state.currentAnchorId);
  const approaching = currentIndex < 0 && beats.length > 0;
  return {
    id: state.route?.masteryCrest?.id ?? "summit-signal-mastery-crest",
    status: state.completed ? "signal-delivered" : approaching ? "approaching" : "active",
    active: !state.completed && currentIndex >= 0,
    currentBeat: currentIndex >= 0 ? copy(beats[currentIndex]) : null,
    nextBeat: copy(beats[Math.max(0, currentIndex + 1)] ?? null),
    progress: state.completed ? 1 : currentIndex < 0 ? 0 : clamp((currentIndex + 1) / Math.max(1, beats.length), 0, 1),
    beatIds: beats.map((ledge) => ledge.id),
    remainingBeatIds: state.completed ? [] : beats.slice(Math.max(0, currentIndex + 1)).map((ledge) => ledge.id)
  };
}

function domainSnapshot(engine, state) {
  return {
    projectedRoute: engine.projectedRoute?.getState?.(),
    anchors: engine.anchorDescriptors?.getState?.(),
    objective: engine.objectiveFlow?.getState?.(),
    routeProgress: routeProgressFacade(engine)?.getState?.(),
    routePacing: engine.routePacing?.getState?.(),
    tetherMotion: engine.tetherMotion?.getState?.(),
    cableLaunch: engine.cableLaunch?.getState?.(),
    vitals: engine.traversalVitals?.getState?.(),
    recovery: engine.traversalRecovery?.getState?.(),
    camera: engine.traversalCamera?.getState?.(),
    cues: engine.traversalCue?.getState?.(),
    feedback: engine.traversalFeedback?.getState?.(),
    masteryCrest: masteryCrestSnapshot(state)
  };
}

export function createNextLedgeSession(options = {}) {
  const domainPreset = createDomainPreset(options);
  let state = createInitialState({ ...options, domainPreset });
  const level = { id: "next-ledge-projected-route-experiment", sceneRecipe: { id: "next-ledge-projected-route-scene", objects: [] }, steps: state.preset.objective.steps };
  const engine = NexusEngine.createRealtimeGame({
    kits: [
      ...createGenericTetherTraversalDomainKits(NexusEngine, domainPreset),
      NexusEngine.createRenderDescriptorKit({ ...level, id: "next-ledge-render-descriptor-kit" }),
      NexusEngine.createObjectiveFlowKit({ id: "next-ledge-objective-flow-kit", objectiveDataset: state.preset.objective }),
      createGenericAnchorDescriptorKit(NexusEngine, { kitId: "next-ledge-anchor-descriptor-kit", anchors: state.projectedRoute.anchors }),
      createGenericModeProjectedRoute(NexusEngine, { ...state.preset.routeProjection, kitId: "next-ledge-projected-route-kit" }),
      createGenericRouteProgressKit(NexusEngine, { kitId: "next-ledge-route-progress-kit", ...createRouteProgressRoute(state) })
    ],
    renderer: typeof NexusEngine.createRenderer === "function" ? NexusEngine.createRenderer("headless") : undefined
  });

  function refreshTuning() {
    state.tuning = settingsFromEngine(engine, state.tuning);
    state.constants.maxCableLength = n(state.tuning.maxCableLength, state.constants.maxCableLength);
    state.constants.maxStamina = n(state.tuning.maxStamina, state.constants.maxStamina);
    state.constants.ropeLength = n(state.tuning.ropeLength, state.constants.ropeLength);
    state.constants.scaffoldBoundary = n(state.tuning.scaffoldBoundary, state.constants.scaffoldBoundary);
  }

  function syncGeneratedRoute() {
    engine.anchorDescriptors?.setAnchors?.(state.projectedRoute.anchors, { reason: "generic-traversal-domain-sync" });
    engine.projectedRoute?.rebuild?.(state.preset.routeProjection, { reason: "generic-traversal-domain-sync" });
    engine.tick(0);
    refreshTuning();
    syncRouteProgressRoute(engine, state, "generic-traversal-domain-sync");
  }

  function restart(message = state.tuning?.restartMessage ?? "Host resynced. Sector restarted.") {
    state = createInitialState({ ...options, sector: state.sector, domainPreset, settings: settingsFromEngine(engine, {}) }, message);
    engine.objectiveFlow?.reset?.();
    syncGeneratedRoute();
    return snapshot();
  }

  function openingStatus(next = state) {
    if (next.route?.openingPattern?.approach?.status) return next.route.openingPattern.approach.status;
    const direction = n(next.wind?.direction, 1);
    return direction < 0
      ? "Counterwind online. Load right, then release left through the reversed opening."
      : "Counterwind online. Load left, then release right through the reversed opening.";
  }

  function beginSectorTransition(targetSector = state.sector + 1) {
    if (state.sectorTransition?.active) return snapshot();
    if (!state.completed || state.mode !== "won") {
      state.status = "Restore the summit relay before requesting the next sector.";
      state.stats.rejected += 1;
      addEvent(state, "sector-transition-rejected", { sector: state.sector, reason: "summit-incomplete" });
      return snapshot();
    }
    const transition = state.preset?.transition ?? {};
    state.mode = "transitioning";
    state.status = "Broadcasting recovered signal across the stormline.";
    state.sectorTransition = {
      active: true,
      phase: "broadcast",
      elapsed: 0,
      totalElapsed: 0,
      sourceSector: state.sector,
      targetSector: Math.max(state.sector + 1, Math.floor(n(targetSector, state.sector + 1))),
      windDirection: n(transition.targetWindDirection, state.sector % 2 === 0 ? 1 : -1),
      label: "Broadcasting summit relay"
    };
    addEvent(state, "sector-broadcast-started", { sector: state.sector, targetSector: state.sectorTransition.targetSector });
    return snapshot();
  }

  function stepSectorTransition(dt) {
    const transition = state.sectorTransition;
    if (!transition?.active) return false;
    const delta = clamp(n(dt, 1 / 60), 0, 1 / 30);
    state.frame += 1;
    transition.elapsed += delta;
    transition.totalElapsed += delta;
    const config = state.preset?.transition ?? {};
    if (transition.phase === "broadcast" && transition.elapsed >= n(config.broadcastDuration, 0.72)) {
      transition.phase = "handshake";
      transition.elapsed = 0;
      transition.label = "Route handshake accepted";
      state.status = `Sector ${transition.targetSector} answered. Reversing the wind field.`;
      addEvent(state, "sector-handshake-accepted", { sector: state.sector, targetSector: transition.targetSector });
    } else if (transition.phase === "handshake" && transition.elapsed >= n(config.handshakeDuration, 0.78)) {
      const previousStats = copy(state.stats);
      const targetSector = transition.targetSector;
      const totalElapsed = transition.totalElapsed;
      state = createInitialState({ ...options, sector: targetSector, domainPreset, settings: settingsFromEngine(engine, {}) });
      state.stats = { ...state.stats, sectorsCleared: Math.max(previousStats.sectorsCleared + 1, targetSector - 1) };
      state.sectorTransition = {
        active: true,
        phase: "opening",
        elapsed: 0,
        totalElapsed,
        sourceSector: targetSector - 1,
        targetSector,
        windDirection: n(state.wind?.direction, transition.windDirection),
        label: state.route?.openingPattern?.label ?? "Counterwind opening"
      };
      state.status = openingStatus(state);
      engine.objectiveFlow?.reset?.();
      syncGeneratedRoute();
      addEvent(state, "sector-opening-revealed", { sector: targetSector, windDirection: state.sectorTransition.windDirection });
    } else if (transition.phase === "opening" && transition.elapsed >= n(config.openingDuration, 1.08)) {
      transition.active = false;
      transition.phase = "complete";
      transition.label = state.route?.openingPattern?.label ?? "Counterwind ready";
      state.status = openingStatus(state);
      addEvent(state, "sector-transition-complete", { sector: state.sector, windDirection: state.wind.direction });
    }
    updateDerived(state);
    return true;
  }

  function advanceSector(sector = state.sector + 1) {
    state = createInitialState({ ...options, sector, domainPreset, settings: settingsFromEngine(engine, {}) }, state.tuning?.nextSectorMessage ?? "Ascending next sector. New anchor field generated.");
    if (state.route?.openingPattern) state.status = openingStatus(state);
    engine.objectiveFlow?.reset?.();
    syncGeneratedRoute();
    addEvent(state, "sector-advanced", { sector: state.sector });
    return snapshot();
  }

  function applyInput(raw = {}) {
    const input = createClimbActionAdapter(raw);
    if (input.restart) restart();
    if (input.advanceSector) beginSectorTransition();
    if (input.pause) state.paused = !state.paused;
    if (input.aimWorld) state.aim = { ...state.aim, ...aimFrom(state, input.aimWorld) };
    else if (input.aimVector) state.aim = { ...state.aim, ...aimFrom(state, input.aimVector) };
    state.input.axis = ["swinging", "falling", "retracting"].includes(state.mode) ? clamp(input.axis, -1, 1) : 0;
    if (input.action) command(state);
  }

  function syncObjective(beforeEvents) {
    const events = state.recentEvents.filter((event) => !beforeEvents.has(event));
    for (const evt of events) {
      if (evt.type === "restored") engine.objectiveFlow?.action?.("rest", { targetId: evt.targetId });
      if (evt.type === "summit-reached") engine.objectiveFlow?.action?.("summit", { sector: evt.sector });
    }
  }

  function update(dt, input = {}) {
    const beforeEvents = new Set(state.recentEvents);
    refreshTuning();
    applyInput(input);
    if (!stepSectorTransition(dt)) stepState(state, clamp(n(dt, 1 / 60), 0, 1 / 30));
    engine.tick(dt);
    syncObjective(beforeEvents);
    syncRouteProgressEvents(engine, state, beforeEvents);
    return snapshot();
  }

  function snapshot() { return { ...copy(state), domain: domainSnapshot(engine, state) }; }

  engine.nextLedge = {
    getState: () => snapshot(),
    getSnapshot: () => snapshot(),
    restart,
    advanceSector,
    beginSectorTransition,
    swingAxis(axis = 0) { state.input.axis = state.mode === "swinging" ? clamp(axis, -1, 1) : 0; return snapshot(); },
    setAimWorld(x = 0, y = 1) { state.aim = { ...state.aim, ...aimFrom(state, { x, y }) }; return snapshot(); },
    setAimVector(dx = 0, dy = 1) { state.aim = { ...state.aim, ...aimFrom(state, { dx, dy }) }; return snapshot(); },
    action() { command(state); return snapshot(); }
  };

  syncGeneratedRoute();
  return { engine, NexusEngine, level, update, snapshot, restart, advanceSector, beginSectorTransition };
}

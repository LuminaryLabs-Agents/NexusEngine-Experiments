const ARENA_POLISH_STYLE = 'cavalry-arena-polish-svg-icons-webgl-lighting-013';
const HEX = Object.freeze({ cols: 11, rows: 9, y: 0.72 });
const SQRT3 = Math.sqrt(3);
const TAU = Math.PI * 2;
const actions = [
  ['rollAp', 'Roll AP', 0, 'dice', '2d6'],
  ['advanceLeft', 'Advance Left', 1, 'advanceLeft', 'Left wing'],
  ['advanceCenter', 'Advance Center', 1, 'advanceCenter', 'Center'],
  ['advanceRight', 'Advance Right', 1, 'advanceRight', 'Right wing'],
  ['lineBrigade', 'Line Brigade', 2, 'line', 'Adjacent line'],
  ['heavyBrigade', 'Heavy Brigade', 3, 'heavy', 'Heavy units'],
  ['berserk', 'Berserk', 4, 'berserk', 'Move + attack'],
  ['scout', 'Scout', 4, 'scout', 'Move 3'],
  ['passTurn', 'Pass Turn', 0, 'pass', 'End turn']
].map(([id, label, cost, icon, detail]) => ({ id, label, cost, icon, detail }));
const icons = {
  dice: `<svg viewBox='0 0 24 24'><rect x='4' y='4' width='16' height='16' rx='4'/><circle cx='9' cy='9' r='1.2'/><circle cx='15' cy='15' r='1.2'/><circle cx='15' cy='9' r='1.2'/><circle cx='9' cy='15' r='1.2'/></svg>`,
  attack: `<svg viewBox='0 0 24 24'><path d='M5 19 19 5'/><path d='m14 5 5 5'/><path d='m8 16-3 3'/><path d='m9 7 8 8'/></svg>`,
  advanceLeft: `<svg viewBox='0 0 24 24'><path d='M19 5 6 18'/><path d='M7 9v8h8'/></svg>`,
  advanceCenter: `<svg viewBox='0 0 24 24'><path d='M12 20V5'/><path d='m6 11 6-6 6 6'/></svg>`,
  advanceRight: `<svg viewBox='0 0 24 24'><path d='m5 5 13 13'/><path d='M9 18h8v-8'/></svg>`,
  line: `<svg viewBox='0 0 24 24'><path d='M4 8h16'/><path d='M4 12h16'/><path d='M4 16h16'/></svg>`,
  heavy: `<svg viewBox='0 0 24 24'><path d='M12 3 20 7v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4Z'/><path d='M8 12h8'/></svg>`,
  berserk: `<svg viewBox='0 0 24 24'><path d='M12 3 9 9l-5 2 5 2 3 8 3-8 5-2-5-2-3-6Z'/></svg>`,
  scout: `<svg viewBox='0 0 24 24'><path d='M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z'/><circle cx='12' cy='12' r='3'/></svg>`,
  pass: `<svg viewBox='0 0 24 24'><path d='M5 12h12'/><path d='m13 7 5 5-5 5'/><path d='M5 5v14'/></svg>`,
  concede: `<svg viewBox='0 0 24 24'><path d='M5 3v18'/><path d='M5 5h12l-2 4 2 4H5'/></svg>`
};
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, Number.isFinite(Number(v)) ? Number(v) : a));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => 1 - Math.pow(1 - clamp(t), 3);
const now = () => performance.now();
const anims = () => globalThis.CavalryUniversalAnimations ?? globalThis.UniversalAnimations;
let root;
let apEl;
let phaseEl;
let attackButton;
let concedeButton;
let lightCanvas;
let gl;
let glProgram;
let glBuffer;
let unitCanvas;
let unitCtx;
let lastVisible = false;
let lastTurn = null;
let rollSpent = false;
let lastCombatSignature = '';
const buttons = new Map();
const positions = new Map();
const bursts = [];
function tactical() { return globalThis.GameHost?.getTacticalGameplaySnapshot?.() ?? globalThis.GameHost?.getSnapshot?.()?.tacticalGameplay ?? null; }
function field() { return globalThis.GameHost?.getHexBattlefieldSnapshot?.() ?? null; }
function installStyle() {
  if (document.querySelector('#cavalry-arena-polish-style')) return;
  const style = document.createElement('style');
  style.id = 'cavalry-arena-polish-style';
  style.textContent = `
    #cavalry-action-ui{display:none!important;opacity:0!important;pointer-events:none!important}
    #cavalry-hex-squad-canvas,#cavalry-hex-unit-canvas{opacity:0!important;pointer-events:none!important}
    #cavalry-arena-polish-ui{position:fixed;inset:0;display:none;z-index:34;pointer-events:none;color:#fff6e3;font-family:Inter,ui-sans-serif,system-ui,sans-serif;text-shadow:0 1px 8px #000}
    #cavalry-arena-polish-ui[data-visible='true']{display:block}
    .cap-bottom{position:absolute;left:max(14px,env(safe-area-inset-left));bottom:max(12px,env(safe-area-inset-bottom));display:flex;gap:10px;pointer-events:auto}
    .cap-grid{position:absolute;left:max(14px,env(safe-area-inset-left));top:max(14px,env(safe-area-inset-top));display:grid;grid-template-columns:repeat(3,54px);gap:9px;pointer-events:auto}
    .cap-topright{position:absolute;right:max(14px,env(safe-area-inset-right));top:max(14px,env(safe-area-inset-top));pointer-events:auto}
    .cap-ap,.cap-attack,.cap-icon,.cap-concede{border:1px solid rgba(255,220,150,.24);background:linear-gradient(145deg,rgba(38,25,13,.92),rgba(14,11,8,.84));box-shadow:0 16px 50px rgba(0,0,0,.38),inset 0 1px 0 rgba(255,255,255,.08);-webkit-backdrop-filter:blur(16px) saturate(1.25);backdrop-filter:blur(16px) saturate(1.25);border-radius:14px;color:#fff6e3;transition:transform .12s ease,border-color .12s ease,opacity .12s ease,filter .12s ease}
    .cap-ap{width:128px;min-height:94px;display:grid;grid-template-rows:auto 1fr auto;padding:12px 14px}.cap-label,.cap-kicker{color:rgba(255,234,190,.72);font-size:10px;font-weight:850;letter-spacing:.13em;text-transform:uppercase}.cap-num{align-self:center;color:#ffe19a;font-size:38px;font-weight:950;line-height:.95}.cap-phase{font-size:11px;font-weight:760;color:rgba(255,246,227,.8);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:104px}
    .cap-attack{position:relative;width:172px;min-height:94px;padding:11px 13px;text-align:left;cursor:pointer;background:linear-gradient(145deg,rgba(72,28,20,.94),rgba(18,12,9,.86));border-color:rgba(255,108,84,.4)}.cap-attack i{position:absolute;right:12px;top:12px;width:30px;height:30px;color:#ffd179}.cap-title{display:block;margin-top:22px;font-size:17px;font-weight:950}.cap-detail{font-size:11px;color:rgba(255,235,198,.66);font-weight:720}.cap-cost{position:absolute;left:13px;bottom:9px;color:#ffe19a;font-size:11px;font-weight:950}
    .cap-icon,.cap-concede{position:relative;width:54px;height:54px;display:grid;place-items:center;cursor:pointer}.cap-icon svg,.cap-concede svg,.cap-attack svg{width:27px;height:27px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}.cap-attack svg{width:100%;height:100%}.cap-sup{position:absolute;right:5px;top:3px;min-width:17px;height:17px;border-radius:99px;display:grid;place-items:center;background:rgba(255,232,178,.18);border:1px solid rgba(255,232,178,.22);color:#ffe19a;font-size:10px;font-weight:950}.cap-icon:after{content:attr(aria-label);position:absolute;left:0;top:62px;padding:7px 9px;border-radius:10px;background:rgba(15,10,7,.92);border:1px solid rgba(255,220,150,.22);font-size:11px;font-weight:800;white-space:nowrap;opacity:0;transform:translateY(-3px);transition:.12s;pointer-events:none}.cap-icon:hover:after,.cap-icon:focus-visible:after{opacity:1;transform:none}.cap-icon:hover:not(:disabled),.cap-attack:hover:not(:disabled),.cap-concede:hover:not(:disabled){transform:translateY(-3px);border-color:rgba(255,222,142,.65)}.cap-icon[data-active='true'],.cap-attack[data-active='true']{border-color:rgba(255,218,116,.92);box-shadow:0 18px 58px rgba(0,0,0,.45),0 0 0 2px rgba(255,205,82,.18)}button:disabled{opacity:.36;filter:grayscale(.55);cursor:not-allowed}.cap-icon[data-spent='true']{opacity:.34;filter:grayscale(.9) saturate(.45)}.cap-icon[data-kind='dice']{background:linear-gradient(145deg,rgba(28,37,54,.92),rgba(15,16,20,.84));border-color:rgba(128,203,255,.3)}.cap-icon[data-kind='advance'] svg{color:#c7f4b4}.cap-icon[data-kind='brigade'] svg{color:#ffd98f}.cap-icon[data-kind='single'] svg{color:#ffb08a}.cap-icon[data-kind='turn'] svg{color:#d6e6ff}`;
  document.head.append(style);
}
function ensureUi() {
  if (root) return;
  installStyle();
  root = document.createElement('section');
  root.id = 'cavalry-arena-polish-ui';
  root.dataset.visible = 'false';
  root.innerHTML = `<div class='cap-grid' id='cap-grid'></div><div class='cap-topright'><button class='cap-concede' id='cap-concede' type='button' aria-label='Concede'>${icons.concede}</button></div><div class='cap-bottom'><div class='cap-ap'><div class='cap-label'>Action Points</div><div class='cap-num' id='cap-ap'>0</div><div class='cap-phase' id='cap-phase'>Battlefield</div></div><button class='cap-attack' id='cap-attack' type='button' aria-label='Attack, costs 1 AP'><span class='cap-kicker'>Combat</span><i>${icons.attack}</i><span class='cap-title'>Attack</span><span class='cap-detail'>2d6 vs target</span><span class='cap-cost'>1 AP</span></button></div>`;
  document.body.append(root);
  apEl = root.querySelector('#cap-ap');
  phaseEl = root.querySelector('#cap-phase');
  attackButton = root.querySelector('#cap-attack');
  concedeButton = root.querySelector('#cap-concede');
  attackButton.addEventListener('click', () => startAction('attack'));
  concedeButton.addEventListener('click', () => globalThis.GameHost?.concedeBattle?.());
  const grid = root.querySelector('#cap-grid');
  for (const action of actions) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'cap-icon';
    button.dataset.kind = action.id.includes('Brigade') ? 'brigade' : action.id.startsWith('advance') ? 'advance' : action.id === 'rollAp' ? 'dice' : action.id === 'passTurn' ? 'turn' : 'single';
    button.title = `${action.label}${action.cost ? ` · ${action.cost} AP` : ''} — ${action.detail}`;
    button.setAttribute('aria-label', `${action.label}${action.cost ? `, costs ${action.cost} AP` : ''}`);
    button.innerHTML = `${icons[action.icon]}<span class='cap-sup'>${action.cost}</span>`;
    button.addEventListener('click', () => startAction(action.id));
    buttons.set(action.id, button);
    grid.append(button);
  }
}
function startAction(id) {
  const state = tactical();
  const button = buttons.get(id) ?? (id === 'attack' ? attackButton : null);
  if (button?.disabled || state?.side !== 'player' || state?.turnTransitionPending || state?.actionResolving) return;
  if (id === 'passTurn') { globalThis.GameHost?.passTurn?.(); return; }
  if (id === 'rollAp') {
    if (rollSpent || !state?.canRollInPlace) return;
    const result = globalThis.GameHost?.rollActionPointsInPlace?.();
    if (result !== false && result != null) rollSpent = true;
    return;
  }
  const result = globalThis.GameHost?.startManeuver?.(id);
  if (result === false || result == null) button?.animate?.([{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }], { duration: 180 });
}
function phaseLabel(state) {
  if (!state) return 'Battlefield';
  if (state.gameOver) return state.gameOver.winner === 'rome' ? 'Victory' : 'Defeat';
  if (state.actionResolving) return 'Resolving';
  if (state.turnTransitionPending || state.side === 'transition') return 'Transition';
  if (state.side === 'enemy') return `Enemy AP ${state.enemyActionPoints ?? 0}`;
  if (state.activeManeuver) {
    const action = actions.find((entry) => entry.id === state.activeManeuver) ?? { label: state.activeManeuver };
    return `${action.label}${state.remainingMoves > 0 ? ` · ${state.remainingMoves}` : ''}`;
  }
  return `Turn ${state.turn ?? 1}`;
}
function drawUi() {
  ensureUi();
  const page = globalThis.GameHost?.getSnapshot?.() ?? {};
  const state = tactical();
  const visible = page.mode === 'battlefield';
  if (visible !== lastVisible) { root.dataset.visible = visible ? 'true' : 'false'; lastVisible = visible; }
  if (!visible) return;
  if (state?.turn !== lastTurn) { lastTurn = state?.turn; rollSpent = !state?.canRollInPlace; }
  if (state?.side !== 'player') rollSpent = true;
  apEl.textContent = String(state?.side === 'enemy' ? Number(state?.enemyActionPoints ?? 0) : Number(state?.actionPoints ?? 0));
  phaseEl.textContent = phaseLabel(state);
  const locked = state?.side !== 'player' || Boolean(state?.turnTransitionPending) || Boolean(state?.actionResolving) || Boolean(state?.gameOver);
  concedeButton.disabled = Boolean(state?.gameOver);
  for (const action of actions) {
    const button = buttons.get(action.id);
    const active = state?.activeManeuver === action.id;
    const rollLocked = action.id === 'rollAp' && (rollSpent || Boolean(state?.activeManeuver) || !state?.canRollInPlace);
    button.dataset.active = active ? 'true' : 'false';
    button.dataset.spent = rollLocked ? 'true' : 'false';
    button.disabled = locked || (action.id === 'rollAp' ? rollLocked : action.id === 'passTurn' ? Boolean(state?.activeManeuver) : Boolean(state?.activeManeuver && !active) || Number(state?.actionPoints ?? 0) < action.cost);
  }
  const attackActive = state?.activeManeuver === 'attack';
  attackButton.dataset.active = attackActive ? 'true' : 'false';
  attackButton.disabled = locked || Boolean(state?.activeManeuver && !attackActive) || Number(state?.actionPoints ?? 0) < 1;
}
function compileShader(context, type, source) {
  const shader = context.createShader(type);
  context.shaderSource(shader, source);
  context.compileShader(shader);
  if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) throw new Error(context.getShaderInfoLog(shader) || 'shader compile failed');
  return shader;
}
function ensureLight() {
  if (lightCanvas) return;
  lightCanvas = document.createElement('canvas');
  lightCanvas.id = 'cavalry-arena-light-webgl';
  Object.assign(lightCanvas.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', zIndex: '6', pointerEvents: 'none', mixBlendMode: 'screen', display: 'none' });
  document.querySelector('#app')?.append(lightCanvas);
  try {
    gl = lightCanvas.getContext('webgl2', { alpha: true, depth: false, stencil: false });
    const vertex = compileShader(gl, gl.VERTEX_SHADER, `#version 300 es
      in vec2 p; out vec2 uv; void main(){ uv=p*.5+.5; gl_Position=vec4(p,0,1); }`);
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, `#version 300 es
      precision highp float; in vec2 uv; uniform float t; out vec4 o;
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}float n(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);} 
      void main(){float sun=max(0.,1.-distance(uv,vec2(.34,.18))*1.8);float center=1.-smoothstep(.2,.78,distance(uv,vec2(.5,.46)));float fog=n(uv*4.+vec2(t*.035,-t*.018));float wave=sin(uv.x*16.+uv.y*9.+t*1.2)*.5+.5;vec3 col=vec3(1,.72,.34)*sun*.16+vec3(.38,.62,.35)*center*.06+vec3(.16,.38,.42)*fog*.035+vec3(.12,.30,.34)*wave*.018;o=vec4(col,.16*center+.10*sun+.05*fog);}`);
    glProgram = gl.createProgram();
    gl.attachShader(glProgram, vertex);
    gl.attachShader(glProgram, fragment);
    gl.linkProgram(glProgram);
    glBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  } catch (error) {
    console.warn('Cavalry arena light overlay unavailable', error);
    gl = null;
  }
}
function drawLight(active) {
  ensureLight();
  if (!lightCanvas) return;
  lightCanvas.style.display = active ? 'block' : 'none';
  if (!active || !gl) return;
  const ratio = Math.max(1, Math.min(2, devicePixelRatio || 1));
  const width = Math.max(1, Math.floor(lightCanvas.clientWidth * ratio));
  const height = Math.max(1, Math.floor(lightCanvas.clientHeight * ratio));
  if (lightCanvas.width !== width || lightCanvas.height !== height) { lightCanvas.width = width; lightCanvas.height = height; }
  gl.viewport(0, 0, width, height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(glProgram);
  const location = gl.getAttribLocation(glProgram, 'p');
  gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
  gl.uniform1f(gl.getUniformLocation(glProgram, 't'), now() / 1000);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}
function boardMetrics(size) {
  const usableW = size.w * 0.88;
  const usableH = size.h * 0.80;
  const r = Math.min(usableW / (SQRT3 * (HEX.cols + 0.5)), usableH / (HEX.y * (1.5 * (HEX.rows - 1) + 2)));
  const boardW = SQRT3 * r * (HEX.cols + 0.5);
  const boardH = HEX.y * r * (1.5 * (HEX.rows - 1) + 2);
  return { r, originX: (size.w - boardW) * 0.5 + SQRT3 * r * 0.5, originY: size.h * 0.06 + Math.max(0, usableH - boardH) * 0.08, yScale: HEX.y };
}
function projectHex(col, row, size) {
  const m = boardMetrics(size);
  return { x: m.originX + SQRT3 * m.r * (col + (row % 2 ? 0.5 : 0)), y: m.originY + m.yScale * m.r * (1 + row * 1.5), r: m.r, yScale: m.yScale };
}
function ensureUnits() {
  if (unitCanvas) return;
  unitCanvas = document.createElement('canvas');
  unitCanvas.id = 'cavalry-polish-units-canvas';
  Object.assign(unitCanvas.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', zIndex: '16', pointerEvents: 'none', display: 'none' });
  document.querySelector('#app')?.append(unitCanvas);
  unitCtx = unitCanvas.getContext('2d');
}
function unitSize() {
  ensureUnits();
  const ratio = Math.max(1, Math.min(2, devicePixelRatio || 1));
  const width = Math.max(1, Math.floor(unitCanvas.clientWidth * ratio));
  const height = Math.max(1, Math.floor(unitCanvas.clientHeight * ratio));
  if (unitCanvas.width !== width || unitCanvas.height !== height) { unitCanvas.width = width; unitCanvas.height = height; }
  return { w: width, h: height };
}
function animationName(id, kind) { return `cap:${kind}:${id}`; }
function syncMove(unit) {
  const old = positions.get(unit.id);
  if (!old) { positions.set(unit.id, { col: unit.col, row: unit.row }); return; }
  if (old.col !== unit.col || old.row !== unit.row) {
    anims()?.play?.(animationName(unit.id, 'move'), { from: old, to: { col: unit.col, row: unit.row }, duration: 520, easing: 'easeInOutCubic' });
    positions.set(unit.id, { col: unit.col, row: unit.row });
  }
}
function visualHex(unit) {
  syncMove(unit);
  const move = anims()?.sample?.(animationName(unit.id, 'move'));
  if (move?.from && move?.to) {
    const t = move.eased ?? ease(move.progress ?? 1);
    return { col: lerp(move.from.col, move.to.col, t), row: lerp(move.from.row, move.to.row, t) };
  }
  return { col: unit.col, row: unit.row };
}
function syncCombat(state, battlefield) {
  const combat = state?.lastCombat;
  if (!combat?.attackerId || !combat?.defenderId) return;
  const signature = `${combat.turn}:${combat.attackerId}:${combat.defenderId}:${combat.attackerTotal}:${combat.defenderTotal}:${combat.damage}`;
  if (signature === lastCombatSignature) return;
  lastCombatSignature = signature;
  const attacker = battlefield.units.find((unit) => unit.id === combat.attackerId);
  const defender = battlefield.units.find((unit) => unit.id === combat.defenderId);
  if (!attacker || !defender) return;
  const from = { col: attacker.col, row: attacker.row };
  const to = { col: defender.col, row: defender.row };
  anims()?.play?.(animationName(attacker.id, 'lunge'), { from, to, duration: 560, easing: 'settle' });
  anims()?.play?.(animationName(defender.id, 'recoil'), { from, to, duration: 560, easing: 'easeOutCubic' });
  bursts.push({ startedAt: now(), duration: 560, to });
}
function combatOffset(unit, point, size) {
  const lunge = anims()?.sample?.(animationName(unit.id, 'lunge'));
  if (lunge?.from && lunge?.to) {
    const a = projectHex(lunge.from.col, lunge.from.row, size);
    const b = projectHex(lunge.to.col, lunge.to.row, size);
    const w = Math.sin((lunge.progress ?? 0) * Math.PI);
    return { ...point, x: point.x + (b.x - a.x) * 0.13 * w, y: point.y + (b.y - a.y) * 0.13 * w };
  }
  const recoil = anims()?.sample?.(animationName(unit.id, 'recoil'));
  if (recoil?.from && recoil?.to) {
    const a = projectHex(recoil.from.col, recoil.from.row, size);
    const b = projectHex(recoil.to.col, recoil.to.row, size);
    const w = Math.sin((recoil.progress ?? 0) * Math.PI);
    return { ...point, x: point.x + (a.x - b.x) * 0.08 * w, y: point.y + (a.y - b.y) * 0.08 * w };
  }
  return point;
}
function layout(unit) {
  if (unit.troopType === 'heavy') return [[-2,0],[-1,0],[0,0],[1,0],[2,0],[-1.5,1],[-0.5,1],[0.5,1],[1.5,1]];
  if (unit.troopType === 'medium') return [[-1.5,0],[-0.5,0],[0.5,0],[1.5,0],[-1,1],[0,1],[1,1]];
  return [[-1,0],[0,0],[1,0],[-0.5,1],[0.5,1]];
}
function drawSoldier(x, y, s, unit, yScale, index, stride, idle) {
  const body = unit.bodyColor ?? (unit.troopType === 'heavy' ? '#b93026' : unit.troopType === 'medium' ? '#2f70d1' : '#3fad4f');
  const band = unit.bandColor ?? (unit.army === 'rome' ? '#c8231f' : '#d6aa3c');
  const armor = unit.troopType === 'heavy' ? '#b9af93' : unit.troopType === 'medium' ? '#878d96' : '#7a6b59';
  unitCtx.save();
  unitCtx.fillStyle = 'rgba(0,0,0,.18)';
  unitCtx.beginPath();
  unitCtx.ellipse(x, y + s * 0.42 * yScale, s * 0.25, s * 0.1 * yScale, 0, 0, TAU);
  unitCtx.fill();
  unitCtx.strokeStyle = '#7b5a33';
  unitCtx.lineWidth = Math.max(1, s * 0.08);
  unitCtx.beginPath();
  unitCtx.moveTo(x + s * 0.25, y);
  unitCtx.lineTo(x + s * (0.35 + Math.sin(idle) * 0.08), y - s * (0.95 + Math.abs(stride) * 0.12));
  unitCtx.stroke();
  unitCtx.fillStyle = '#493225';
  unitCtx.beginPath();
  unitCtx.moveTo(x - s * 0.15, y + s * 0.36 * yScale);
  unitCtx.lineTo(x - s * (0.04 + stride * 0.05), y + s * 0.02 * yScale);
  unitCtx.lineTo(x + s * 0.03, y + s * 0.36 * yScale);
  unitCtx.fill();
  unitCtx.beginPath();
  unitCtx.moveTo(x + s * 0.15, y + s * 0.36 * yScale);
  unitCtx.lineTo(x + s * (0.04 + stride * 0.05), y + s * 0.02 * yScale);
  unitCtx.lineTo(x - s * 0.03, y + s * 0.36 * yScale);
  unitCtx.fill();
  unitCtx.fillStyle = body;
  unitCtx.beginPath();
  unitCtx.moveTo(x - s * 0.25, y - s * 0.02);
  unitCtx.lineTo(x + s * 0.25, y - s * 0.02);
  unitCtx.lineTo(x + s * 0.17, y - s * 0.50);
  unitCtx.lineTo(x - s * 0.17, y - s * 0.50);
  unitCtx.closePath();
  unitCtx.fill();
  unitCtx.fillStyle = band;
  unitCtx.fillRect(x - s * 0.23, y - s * 0.28, s * 0.46, s * 0.10);
  unitCtx.fillStyle = armor;
  unitCtx.beginPath();
  unitCtx.moveTo(x - s * 0.28, y - s * 0.08);
  unitCtx.lineTo(x - s * 0.44, y - s * 0.42);
  unitCtx.lineTo(x - s * 0.12, y - s * 0.48);
  unitCtx.closePath();
  unitCtx.fill();
  unitCtx.fillStyle = '#d2b38a';
  unitCtx.beginPath();
  unitCtx.arc(x, y - s * 0.64 + Math.sin(idle) * s * 0.015, s * 0.12, 0, TAU);
  unitCtx.fill();
  unitCtx.fillStyle = armor;
  unitCtx.fillRect(x - s * 0.14, y - s * 0.78, s * 0.28, s * 0.12);
  unitCtx.restore();
}
function drawUnit(unit, size) {
  if (unit.routed || Number(unit.strength ?? 1) <= 0) return;
  const hex = visualHex(unit);
  let point = combatOffset(unit, projectHex(hex.col, hex.row, size), size);
  const rows = layout(unit);
  const scale = point.r * (unit.troopType === 'heavy' ? 0.23 : unit.troopType === 'medium' ? 0.20 : 0.18);
  const spacingX = scale * (unit.troopType === 'heavy' ? 1.55 : 1.65);
  const spacingY = scale * point.yScale * 1.7;
  const move = anims()?.sample?.(animationName(unit.id, 'move'));
  const stride = move ? Math.sin((move.progress ?? 0) * Math.PI * 6) : 0;
  const selected = tactical()?.selectedUnitId === unit.id;
  const phase = (unit.id.length * 0.73 + unit.col * 0.31 + unit.row * 0.47) % TAU;
  const time = now() / 1000;
  unitCtx.save();
  unitCtx.fillStyle = 'rgba(0,0,0,.24)';
  unitCtx.beginPath();
  unitCtx.ellipse(point.x, point.y + point.r * point.yScale * 0.34, point.r * (unit.troopType === 'heavy' ? 0.96 : 0.78), point.r * point.yScale * 0.22, 0, 0, TAU);
  unitCtx.fill();
  if (selected) {
    unitCtx.strokeStyle = 'rgba(255,225,125,.85)';
    unitCtx.lineWidth = Math.max(2, point.r * 0.035);
    unitCtx.beginPath();
    unitCtx.ellipse(point.x, point.y + point.r * point.yScale * 0.22, point.r * 0.55, point.r * point.yScale * 0.24, 0, 0, TAU);
    unitCtx.stroke();
  }
  for (let i = 0; i < rows.length; i += 1) {
    const [lx, ly] = rows[i];
    const idle = time * 2.4 + phase + i * 0.72;
    const bob = (Math.sin(idle) * 0.045 + stride * 0.14) * scale;
    const sway = Math.sin(time * 1.8 + phase + i) * scale * 0.035;
    drawSoldier(point.x + lx * spacingX + sway, point.y + ly * spacingY - scale * 0.2 + ly * 0.1 * point.r * point.yScale - bob, scale, unit, point.yScale, i, stride, idle);
  }
  unitCtx.restore();
}
function drawBursts(size) {
  const time = now();
  for (let i = bursts.length - 1; i >= 0; i -= 1) {
    const burst = bursts[i];
    const point = projectHex(burst.to.col, burst.to.row, size);
    const progress = clamp((time - burst.startedAt) / burst.duration);
    const alpha = Math.sin(progress * Math.PI);
    if (progress >= 1) { bursts.splice(i, 1); continue; }
    unitCtx.save();
    unitCtx.globalAlpha = alpha;
    unitCtx.strokeStyle = 'rgba(255,224,127,.95)';
    unitCtx.lineWidth = Math.max(2, point.r * 0.035);
    unitCtx.beginPath();
    unitCtx.arc(point.x, point.y - point.r * 0.08, point.r * (0.22 + progress * 0.36), 0, TAU);
    unitCtx.stroke();
    unitCtx.restore();
  }
}
function drawUnits(active) {
  ensureUnits();
  unitCanvas.style.display = active ? 'block' : 'none';
  if (!active) return;
  const size = unitSize();
  const battlefield = field();
  const state = tactical();
  unitCtx.clearRect(0, 0, size.w, size.h);
  if (!battlefield?.units?.length) return;
  syncCombat(state, battlefield);
  battlefield.units.slice().sort((a, b) => a.row - b.row || a.col - b.col).forEach((unit) => drawUnit(unit, size));
  drawBursts(size);
}
window.addEventListener('keydown', (event) => {
  if (/^[0-9]$/.test(event.key)) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}, true);
function frame() {
  const page = globalThis.GameHost?.getSnapshot?.() ?? {};
  const active = page.mode === 'battlefield';
  drawUi();
  drawLight(active);
  drawUnits(active);
  requestAnimationFrame(frame);
}
function boot() {
  installStyle();
  ensureUi();
  ensureLight();
  ensureUnits();
  globalThis.CavalryArenaPolish = { style: ARENA_POLISH_STYLE, svgIconSet: 'custom-lucide-inspired', webglLightingOverlay: true, animatedIdle: true, animatedMovement: true, animatedAttack: true };
  requestAnimationFrame(frame);
}
boot();

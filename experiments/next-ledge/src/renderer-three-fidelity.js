import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { createDiegeticEffects, describeReleaseCueSurge, updateDiegeticPlayerSignals } from "./diegetic-effects.js?v=score-carry-release-1";
import { describeActiveSwingReleaseCue, describeWindglassRejoinRebound, describeWindglassScoreSettle } from "./climb-anchor-adapter.js?v=score-carry-release-1";

const matFor = (m, type, hover, routeChoiceRole = null) => hover
  ? m.hover
  : routeChoiceRole === "route-convergence"
    ? m.windglass
  : ["pressure-shortcut", "shortcut-payoff"].includes(routeChoiceRole)
    ? m.shortcutChoice
    : ["safe-recovery", "safe-payoff"].includes(routeChoiceRole)
      ? m.safeChoice
      : type === "rest"
        ? m.rest
        : type === "summit"
          ? m.summit
          : m.ledge;
const num = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const smoothstep = (v) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};
const lerpPoint = (from, to, progress, z = 24) => ({
  x: num(from?.x) + (num(to?.x) - num(from?.x)) * progress,
  y: num(from?.y) + (num(to?.y) - num(from?.y)) * progress,
  z
});

function confirmationHandoffProgress(snapshot, stormlock) {
  if (snapshot.routeChoice?.status !== "confirmation-active" || !snapshot.routeChoice?.payoffTargetId) return 0;
  const handoffFrames = Math.max(2, Math.floor(num(stormlock?.metadata?.routeChoiceConfirmationHandoffFrames, 12)));
  const remainingFrames = Math.max(1, Math.floor(num(snapshot.routeChoice.confirmationEndsAtFrame, snapshot.frame + handoffFrames) - num(snapshot.frame)));
  return smoothstep((handoffFrames - remainingFrames) / Math.max(1, handoffFrames - 1));
}

function payoffGrappleSurge(snapshot, payoffTarget) {
  const frames = Math.max(0, Math.floor(num(payoffTarget?.metadata?.routeChoicePayoffGrappleSurgeFrames, 0)));
  if (snapshot.routeChoice?.status !== "payoff-active" || !frames || payoffTarget?.id !== snapshot.routeChoice?.payoffTargetId) return null;
  const recentEvents = snapshot.recentEvents ?? [];
  let fired = null;
  for (let index = recentEvents.length - 1; index >= 0; index -= 1) {
    const event = recentEvents[index];
    if (event.type === "grapple-fired" && event.targetId === payoffTarget.id) { fired = event; break; }
  }
  const age = fired ? num(snapshot.frame) - num(fired.at) : frames + 1;
  if (age < 0 || age > frames) return null;
  return {
    color: Math.max(0, Math.floor(num(payoffTarget.metadata.routeChoicePayoffGrappleSurgeColor, snapshot.routeChoice?.selectedRole === "pressure-shortcut" ? 0xffb83d : 0x3dffa3))),
    strength: smoothstep(1 - age / Math.max(1, frames))
  };
}

function dispose(root, { materials = false } = {}) {
  root.traverse?.((child) => {
    child.geometry?.dispose?.();
    if (!materials && !child.userData?.ownsMaterial) return;
    const owned = Array.isArray(child.material) ? child.material : [child.material];
    owned.filter(Boolean).forEach((entry) => entry.dispose?.());
  });
}

function cliffGeometry(h, id) {
  const geo = new THREE.PlaneGeometry(650, h, 18, 18);
  const pos = geo.attributes.position;
  const seed = Array.from(String(id)).reduce((s, c) => s + c.charCodeAt(0), 0);
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i), y = pos.getY(i);
    const ridge = Math.sin(x * 0.014 + seed) * Math.cos(y * 0.012) * 54;
    const carved = (1 - Math.min(1, Math.abs(x) / 325)) * 52;
    pos.setZ(i, ridge - carved - 56 + Math.sin(y * 0.028 + seed) * 8);
  }
  geo.computeVertexNormals();
  return geo;
}

function makeLineMaterial(color, opacity = 0.5) {
  return new THREE.LineBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false });
}

function aimEndpoint(snapshot) {
  const p = snapshot.player ?? { x: 0, y: 0, z: 1 };
  const max = Math.max(32, num(snapshot.constants?.maxCableLength, 150));
  let tx = num(snapshot.aim?.worldX, p.x + num(snapshot.aim?.x, 0) * max);
  let ty = num(snapshot.aim?.worldY, p.y + num(snapshot.aim?.y, 1) * max);
  let dx = tx - p.x;
  let dy = ty - p.y;
  let len = Math.hypot(dx, dy);
  if (len < 0.001) {
    dx = num(snapshot.aim?.x, 0) || 0;
    dy = num(snapshot.aim?.y, 1) || 1;
    len = Math.hypot(dx, dy) || 1;
    tx = p.x + dx / len * max;
    ty = p.y + dy / len * max;
    len = max;
  }
  if (len > max) {
    const r = max / len;
    tx = p.x + dx * r;
    ty = p.y + dy * r;
    dx = tx - p.x;
    dy = ty - p.y;
    len = max;
  }
  return { start: { x: p.x, y: p.y, z: (p.z ?? 1) + 2.25 }, end: { x: tx, y: ty, z: 3 }, dx, dy, len, angle: Math.atan2(dy, dx) };
}

function colorForStyle(styleId = "") {
  styleId = String(styleId ?? "");
  if (styleId.includes("summit")) return 0xffd65a;
  if (styleId.includes("danger")) return 0xff3858;
  if (styleId.includes("cloud")) return 0xbfeaff;
  if (styleId.includes("foreground")) return 0x03070b;
  return 0x77e8ff;
}

function material(color, opacity, additive = false) {
  return new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending });
}

function ellipseGeometry(width, height, segments = 48) {
  const geo = new THREE.CircleGeometry(1, segments);
  geo.scale(width, height, 1);
  return geo;
}

function layerZ(layerId = "") {
  if (layerId === "sky") return -310;
  if (layerId.includes("cloud")) return -230;
  if (layerId.includes("distant")) return -185;
  if (layerId.includes("mid")) return -118;
  if (layerId.includes("foreground")) return 44;
  return -40;
}

export function createThreeRenderer({ canvas }) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x03070b, 0.0036);
  const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 1, 5000);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setClearColor(0x010305, 1);

  const m = {
    rock: new THREE.MeshStandardMaterial({ color: 0x050a12, roughness: 0.95, metalness: 0.05, flatShading: false }),
    metal: new THREE.MeshStandardMaterial({ color: 0x0c111a, roughness: 0.65, metalness: 0.88, flatShading: true }),
    ledge: new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 2.2, roughness: 0.1 }),
    rest: new THREE.MeshStandardMaterial({ color: 0x3dffa3, emissive: 0x3dffa3, emissiveIntensity: 2.4, roughness: 0.1 }),
    summit: new THREE.MeshStandardMaterial({ color: 0xffd65a, emissive: 0xffd65a, emissiveIntensity: 3.4, roughness: 0.1 }),
    safeChoice: new THREE.MeshStandardMaterial({ color: 0x66ffc4, emissive: 0x3dffa3, emissiveIntensity: 3.1, roughness: 0.08 }),
    shortcutChoice: new THREE.MeshStandardMaterial({ color: 0xffb83d, emissive: 0xff7b2f, emissiveIntensity: 3.3, roughness: 0.08 }),
    windglass: new THREE.MeshStandardMaterial({ color: 0xe4fbff, emissive: 0x77e8ff, emissiveIntensity: 3.8, roughness: 0.04, metalness: 0.28 }),
    hover: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 4.3, roughness: 0.1 }),
    player: new THREE.MeshStandardMaterial({ color: 0xffb83d, emissive: 0xffb83d, emissiveIntensity: 1.55, roughness: 0.05, transparent: true, opacity: 0.97 }),
    probe: new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 3.2, roughness: 0.1 }),
    reach: material(0x00f0ff, 0.06, true),
    stamina: material(0xffb83d, 0.75, true),
    danger: material(0xff3858, 0.4, true),
    beacon: material(0x3dffa3, 0.36, true),
    summitBeam: material(0xffd65a, 0.16, true),
    aimHead: material(0xffffff, 0.96, true),
    aimEnd: material(0x00f0ff, 0.88, true),
    aimCore: material(0xffb83d, 0.72, true),
    aimParticle: new THREE.PointsMaterial({ color: 0xfff3bd, size: 3.2, transparent: true, opacity: 0.82, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true })
  };

  scene.add(new THREE.AmbientLight(0x0a1122, 0.8));
  const moon = new THREE.DirectionalLight(0xbfeaff, 1.2);
  moon.position.set(-120, 240, 180);
  scene.add(moon);
  const spot = new THREE.SpotLight(0x00f0ff, 4.2, 720);
  spot.angle = Math.PI / 3;
  spot.penumbra = 0.74;
  scene.add(spot, spot.target);
  const modeLight = new THREE.PointLight(0xffb83d, 2.5, 240);
  const dangerLight = new THREE.PointLight(0xff3558, 0, 280);
  scene.add(modeLight, dangerLight);

  const parallaxBack = new THREE.Group();
  const world = new THREE.Group();
  const ledges = new THREE.Group();
  const beacons = new THREE.Group();
  const parallaxFront = new THREE.Group();
  scene.add(parallaxBack, world, ledges, beacons, parallaxFront);

  const player = new THREE.Mesh(new THREE.SphereGeometry(6.5, 32, 32), m.player);
  const staminaHalo = new THREE.Mesh(new THREE.TorusGeometry(10, 0.65, 8, 64), m.stamina);
  const dangerHalo = new THREE.Mesh(new THREE.TorusGeometry(15, 0.28, 8, 64), m.danger);
  const probe = new THREE.Mesh(new THREE.OctahedronGeometry(3.8, 0), m.probe);
  const rope = new THREE.Line(new THREE.BufferGeometry(), makeLineMaterial(0x00f0ff, 0.9));
  const routeLine = new THREE.Line(new THREE.BufferGeometry(), makeLineMaterial(0x133a4a, 0.42));
  const safeChoiceLine = new THREE.Line(new THREE.BufferGeometry(), makeLineMaterial(0x3dffa3, 0.5));
  const shortcutChoiceLine = new THREE.Line(new THREE.BufferGeometry(), makeLineMaterial(0xffb83d, 0.52));
  const consequenceLine = new THREE.Line(new THREE.BufferGeometry(), makeLineMaterial(0x3dffa3, 0.62));
  safeChoiceLine.visible = false;
  shortcutChoiceLine.visible = false;
  consequenceLine.visible = false;
  const traj = new THREE.Line(new THREE.BufferGeometry(), makeLineMaterial(0xffb83d, 0.42));
  const aim = new THREE.Line(new THREE.BufferGeometry(), makeLineMaterial(0xfff3bd, 0.86));
  const reach = new THREE.Mesh(new THREE.RingGeometry(148.8, 150, 64), m.reach);
  const aimHead = new THREE.Mesh(new THREE.ConeGeometry(5.2, 16, 24), m.aimHead);
  const aimEnd = new THREE.Mesh(new THREE.TorusGeometry(9.5, 0.9, 8, 64), m.aimEnd);
  const aimCore = new THREE.Mesh(new THREE.SphereGeometry(2.8, 12, 12), m.aimCore);
  const aimParticleCount = 48;
  const aimParticlePositions = new Float32Array(aimParticleCount * 3);
  const aimParticleGeometry = new THREE.BufferGeometry();
  aimParticleGeometry.setAttribute("position", new THREE.BufferAttribute(aimParticlePositions, 3));
  const aimParticles = new THREE.Points(aimParticleGeometry, m.aimParticle);
  const windSegmentCount = 18;
  const windPositions = new Float32Array(windSegmentCount * 2 * 3);
  const windGeometry = new THREE.BufferGeometry();
  windGeometry.setAttribute("position", new THREE.BufferAttribute(windPositions, 3));
  const windMaterial = makeLineMaterial(0x77e8ff, 0.38);
  const counterwindField = new THREE.LineSegments(windGeometry, windMaterial);
  counterwindField.frustumCulled = false;
  counterwindField.visible = false;
  const summitCelebration = new THREE.Group();
  const celebrationRings = [
    new THREE.Mesh(new THREE.TorusGeometry(32, 1.4, 10, 72), material(0xffd65a, 0.76, true)),
    new THREE.Mesh(new THREE.TorusGeometry(51, 0.8, 8, 72), material(0xfff3bd, 0.48, true)),
    new THREE.Mesh(new THREE.TorusGeometry(72, 0.45, 8, 72), material(0x3dffa3, 0.34, true))
  ];
  celebrationRings.forEach((ring, index) => { ring.position.z = 8 + index * 2; summitCelebration.add(ring); });
  const summitLight = new THREE.PointLight(0xffd65a, 0, 720);
  summitLight.position.z = 38;
  summitCelebration.add(summitLight);
  summitCelebration.visible = false;
  scene.add(routeLine, safeChoiceLine, shortcutChoiceLine, consequenceLine, player, staminaHalo, dangerHalo, probe, rope, traj, aim, reach, aimHead, aimEnd, aimCore, aimParticles, counterwindField, summitCelebration);

  const diegeticEffects = createDiegeticEffects({ scene });
  let routeKey = "";
  let parallaxKey = "";
  let viewportWidth = 0;
  let viewportHeight = 0;
  let viewportPixelRatio = 0;
  let presentedCameraY = null;
  let presentedCameraZ = null;
  let lastEffectTime = performance.now() / 1000;
  let payoffSurgeApplied = false;
  let windglassSettleApplied = false;
  const ledgeMap = new Map();
  const parallaxGroups = new Map();

  function resize() {
    const nextWidth = innerWidth;
    const nextHeight = innerHeight;
    const nextPixelRatio = Math.min(devicePixelRatio || 1, 2);
    if (viewportWidth === nextWidth && viewportHeight === nextHeight && viewportPixelRatio === nextPixelRatio) return;
    viewportWidth = nextWidth;
    viewportHeight = nextHeight;
    viewportPixelRatio = nextPixelRatio;
    renderer.setPixelRatio(nextPixelRatio);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight, false);
  }
  addEventListener("resize", resize);
  resize();

  function setLine(line, points = []) {
    line.visible = points.length > 0;
    const required = Math.max(1, points.length);
    const attribute = line.geometry.getAttribute("position");
    if (!attribute || attribute.count < required) {
      line.geometry.dispose?.();
      line.geometry = new THREE.BufferGeometry();
      line.geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(required * 3), 3));
    }
    const positions = line.geometry.getAttribute("position");
    points.forEach((p, i) => { positions.setXYZ(i, p.x, p.y, p.z ?? 1); });
    positions.needsUpdate = true;
    line.geometry.setDrawRange(0, points.length);
  }

  function addCloud(group, layer, i) {
    const cloud = new THREE.Group();
    const c = colorForStyle(layer.styleId);
    for (let p = 0; p < 4; p += 1) {
      const blob = new THREE.Mesh(ellipseGeometry(52 + p * 18, 13 + p * 5, 42), material(c, 0.10 + p * 0.025, true));
      blob.position.set(p * 32 - 42, Math.sin(i + p) * 18, 0);
      cloud.add(blob);
    }
    cloud.position.set((i - 2) * 260, i % 2 ? 170 : -120, layerZ(layer.id));
    cloud.userData = { baseX: cloud.position.x, baseY: cloud.position.y, drift: 0.7 + i * 0.11 };
    group.add(cloud);
  }

  function addCliffBand(group, layer, i) {
    const shard = new THREE.Mesh(new THREE.PlaneGeometry(160 + i * 24, 520 + (i % 2) * 160, 4, 8), material(0x07111a, layer.id.includes("distant") ? 0.25 : 0.42, false));
    const pos = shard.geometry.attributes.position;
    for (let p = 0; p < pos.count; p += 1) pos.setZ(p, Math.sin(pos.getY(p) * 0.017 + i) * 14);
    shard.position.set(i % 2 ? -315 : 315, i * 220 - 420, layerZ(layer.id));
    shard.rotation.z = (i % 2 ? -1 : 1) * 0.08;
    group.add(shard);
  }

  function addForeground(group, layer, i) {
    const vine = new THREE.Mesh(new THREE.PlaneGeometry(24 + (i % 3) * 10, 560, 2, 8), material(0x010204, 0.34, false));
    vine.position.set((i - 2) * 170, i % 2 ? 80 : -120, layerZ(layer.id));
    vine.rotation.z = Math.sin(i) * 0.18;
    group.add(vine);
  }

  function rebuildParallax(snapshot) {
    dispose(parallaxBack, { materials: true });
    dispose(parallaxFront, { materials: true });
    parallaxBack.clear();
    parallaxFront.clear();
    parallaxGroups.clear();
    const layers = snapshot.domain?.parallax?.layers ?? [];
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(5200, 3200), material(0x07111a, 0.96, false));
    sky.position.set(0, 0, -340);
    parallaxBack.add(sky);
    for (const layer of layers) {
      const group = new THREE.Group();
      group.userData = { layerId: layer.id, baseZ: layerZ(layer.id) };
      const parent = layer.id.includes("foreground") ? parallaxFront : parallaxBack;
      parent.add(group);
      parallaxGroups.set(layer.id, group);
      if (layer.id.includes("cloud")) for (let i = 0; i < 7; i += 1) addCloud(group, layer, i);
      else if (layer.id.includes("cliff")) for (let i = 0; i < 7; i += 1) addCliffBand(group, layer, i);
      else if (layer.id.includes("foreground")) for (let i = 0; i < 7; i += 1) addForeground(group, layer, i);
    }
  }

  function updateParallax(snapshot, time, releaseSurge) {
    const parallax = snapshot.domain?.parallax;
    if (!parallax) return;
    const key = `${snapshot.levelId}:${snapshot.sector}:${parallax.profileId}:${parallax.layers?.length ?? 0}`;
    if (key !== parallaxKey) { parallaxKey = key; rebuildParallax(snapshot); }
    for (const layer of parallax.layers ?? []) {
      const group = parallaxGroups.get(layer.id);
      if (!group) continue;
      const off = layer.offset ?? {};
      group.position.set(num(off.x) * 0.42, (snapshot.camera?.y ?? 0) + num(off.y) * 0.35, 0);
      group.children.forEach((child, i) => {
        child.position.x = (child.userData.baseX ?? child.position.x) + Math.sin(time * (child.userData.drift ?? 0.4) + i) * 8;
        child.position.y = (child.userData.baseY ?? child.position.y) + Math.cos(time * 0.37 + i) * 4;
      });
    }
    const styles = snapshot.domain?.renderStyles;
    const danger = snapshot.mode === "falling" || snapshot.mode === "launched" || snapshot.mode === "retracting";
    const releaseStyle = String(releaseSurge?.style ?? "");
    const releasePalette = releaseStyle.includes("cyan")
      ? { fog: 0x071d2b, clear: 0x01070a }
      : releaseStyle.includes("mint")
        ? { fog: 0x09251b, clear: 0x020a07 }
        : { fog: 0x251407, clear: 0x0a0502 };
    scene.fog.color.setHex(releaseSurge ? releasePalette.fog : danger ? 0x250910 : snapshot.completed ? 0x2a2412 : 0x07111a);
    scene.fog.density = releaseSurge ? 0.0046 : danger ? 0.0055 : snapshot.completed ? 0.0044 : 0.0036;
    renderer.setClearColor(releaseSurge ? releasePalette.clear : snapshot.completed ? 0x130f04 : danger ? 0x080205 : 0x010305, 1);
    parallaxBack.visible = Boolean(styles || parallax.layers?.length);
  }

  function updateAimGuide(snapshot, time) {
    const active = Boolean(snapshot.alive && !snapshot.completed && !["dead", "won"].includes(snapshot.mode));
    const data = aimEndpoint(snapshot);
    const modeBoost = ["falling", "retracting", "launched"].includes(snapshot.mode) ? 1 : 0.72;
    const pulse = 0.5 + 0.5 * Math.sin(time * 9);
    setLine(aim, active ? [data.start, data.end] : []);
    aim.visible = active;
    aim.material.opacity = active ? 0.46 + modeBoost * 0.34 + pulse * 0.08 : 0;
    aimHead.visible = active;
    aimEnd.visible = active;
    aimCore.visible = active;
    aimParticles.visible = active;
    if (!active) return;
    aimHead.position.set(data.end.x, data.end.y, data.end.z + 1.2);
    aimHead.rotation.set(0, 0, data.angle - Math.PI / 2);
    aimHead.scale.setScalar(1 + pulse * 0.22);
    aimEnd.position.set(data.end.x, data.end.y, data.end.z);
    aimEnd.rotation.z += 0.045 + pulse * 0.01;
    aimEnd.scale.setScalar(0.86 + pulse * 0.18 + modeBoost * 0.12);
    aimEnd.material.opacity = 0.55 + pulse * 0.25;
    aimCore.position.set(data.end.x, data.end.y, data.end.z);
    aimCore.scale.setScalar(0.7 + pulse * 0.32);
    const px = -data.dy / Math.max(1, data.len);
    const py = data.dx / Math.max(1, data.len);
    for (let i = 0; i < aimParticleCount; i += 1) {
      const t = ((i / aimParticleCount) + time * (0.9 + modeBoost * 0.7)) % 1;
      const burst = Math.sin(t * Math.PI);
      const wave = Math.sin(time * 16 + i * 1.91) * (2.5 + burst * 7.5);
      aimParticlePositions[i * 3] = data.start.x + data.dx * t + px * wave;
      aimParticlePositions[i * 3 + 1] = data.start.y + data.dy * t + py * wave;
      aimParticlePositions[i * 3 + 2] = 4 + burst * 4.5;
    }
    aimParticleGeometry.attributes.position.needsUpdate = true;
    aimParticles.material.opacity = 0.35 + modeBoost * 0.42 + pulse * 0.16;
  }

  function updateCounterwindField(snapshot, time) {
    const opening = snapshot.route?.openingPattern;
    const ledges = snapshot.route?.ledges ?? [];
    const currentIndex = Math.max(0, ledges.findIndex((ledge) => ledge.id === snapshot.currentAnchorId));
    const choice = snapshot.routeChoice;
    const shortcutActive = ["committed", "consequence-active", "confirmation-active", "payoff-active", "convergence-active"].includes(choice?.status) && choice.selectedRole === "pressure-shortcut";
    const visible = Boolean(opening && (snapshot.sectorTransition?.phase === "opening" || currentIndex <= num(opening.endIndex, 4) || choice?.status === "open" || shortcutActive));
    counterwindField.visible = visible;
    if (!visible) return;
    const direction = num(snapshot.wind?.direction, opening.windDirection ?? -1) < 0 ? -1 : 1;
    const intensity = clamp01(num(snapshot.wind?.intensity, 0.38));
    const recentEvents = snapshot.recentEvents ?? [];
    let recoveryEvent = null;
    for (let index = recentEvents.length - 1; index >= 0; index -= 1) {
      if (recentEvents[index].type === "counterwind-recovered") { recoveryEvent = recentEvents[index]; break; }
    }
    const recoveryPulse = recoveryEvent ? clamp01(1 - Math.max(0, num(snapshot.frame) - num(recoveryEvent.at)) / 90) : 0;
    const centerY = num(snapshot.camera?.y, snapshot.player?.y);
    const span = 118 + intensity * 92;
    const speed = 72 + intensity * 118;
    for (let i = 0; i < windSegmentCount; i += 1) {
      const band = ((i * 47 + time * speed) % 620) - 310;
      const phase = time * (2.4 + intensity * 2.8) + i * 1.73;
      const startX = -direction * (206 + Math.sin(phase) * (20 + intensity * 18));
      const startY = centerY + band + Math.sin(phase * 1.4) * (10 + intensity * 16);
      const endX = startX + direction * (span + (i % 4) * 14);
      const endY = startY + Math.cos(phase) * (12 + intensity * 24);
      const offset = i * 6;
      windPositions[offset] = startX;
      windPositions[offset + 1] = startY;
      windPositions[offset + 2] = 18 + (i % 3) * 5;
      windPositions[offset + 3] = endX;
      windPositions[offset + 4] = endY;
      windPositions[offset + 5] = 18 + (i % 3) * 5;
    }
    windGeometry.attributes.position.needsUpdate = true;
    windMaterial.color.setHex(shortcutActive ? 0xffb83d : recoveryPulse > 0 ? 0x3dffa3 : 0x77e8ff);
    windMaterial.opacity = 0.18 + intensity * 0.42 + (0.5 + 0.5 * Math.sin(time * (4.4 + intensity * 3.6))) * 0.14 + recoveryPulse * 0.24;
  }

  function rebuild(snapshot) {
    routeKey = `${snapshot.levelId}:${snapshot.sector}:${snapshot.route?.ledges?.length ?? 0}`;
    dispose(world); dispose(ledges); dispose(beacons); world.clear(); ledges.clear(); beacons.clear(); ledgeMap.clear();
    for (const chunk of snapshot.route?.chunks ?? []) {
      const cliff = new THREE.Mesh(cliffGeometry(chunk.h, chunk.id), m.rock);
      cliff.position.set(0, chunk.y + chunk.h / 2, -15);
      world.add(cliff);
      for (const x of [chunk.scaffold?.leftX ?? -170, chunk.scaffold?.rightX ?? 170]) {
        const girder = new THREE.Mesh(new THREE.BoxGeometry(8, chunk.h + 20, 8), m.metal);
        girder.position.set(x, chunk.y + chunk.h / 2, -10);
        world.add(girder);
      }
      for (const brace of chunk.scaffold?.braces ?? []) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(320, 3, 3), m.metal);
        mesh.position.set(brace.x, brace.y, -12);
        mesh.rotation.z = brace.rotation;
        world.add(mesh);
      }
    }
    const choice = snapshot.route?.postRestChoice;
    const choiceTargetIds = new Set([choice?.safeAnchorId, choice?.shortcutAnchorId, choice?.payoffSafeAnchorId, choice?.payoffShortcutAnchorId, choice?.convergenceAnchorId].filter(Boolean));
    const routePoints = [];
    for (const l of snapshot.route?.ledges ?? []) {
      const g = new THREE.Group();
      g.position.set(l.x, l.y, 0);
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(l.r * 1.55, l.r * 1.55, 3.5, 6), m.metal);
      plate.rotation.x = Math.PI / 2;
      const choiceRole = l.metadata?.routeChoiceRole ?? null;
      const core = new THREE.Mesh(new THREE.SphereGeometry(l.r, 14, 14), matFor(m, l.type, false, choiceRole));
      core.position.z = 1.5;
      const haloMaterial = matFor(m, l.type, false, choiceRole).clone();
      haloMaterial.transparent = true;
      haloMaterial.opacity = l.type === "normal" ? 0.18 : 0.42;
      haloMaterial.blending = THREE.AdditiveBlending;
      haloMaterial.depthWrite = false;
      const halo = new THREE.Mesh(new THREE.TorusGeometry(l.r * 2.25, 0.35, 8, 48), haloMaterial);
      halo.userData.ownsMaterial = true;
      g.add(plate, core, halo);
      g.userData = { id: l.id, type: l.type, choiceRole, core, halo };
      ledges.add(g);
      ledgeMap.set(l.id, g);
      if (!choiceTargetIds.has(l.id)) routePoints.push({ x: l.x, y: l.y, z: -0.5 });
      if (l.type === "summit" || choiceRole === "route-convergence" || (l.type === "rest" && (!choiceRole || choiceRole === "post-rejoin-restore"))) {
        const height = l.type === "summit" ? 420 : choiceRole === "route-convergence" ? 150 : 120;
        const beamMaterial = ["post-rejoin-restore", "route-convergence"].includes(choiceRole) ? m.beacon.clone() : l.type === "summit" ? m.summitBeam : m.beacon;
        if (choiceRole === "route-convergence") beamMaterial.color.setHex(0x77e8ff);
        const beam = new THREE.Mesh(new THREE.CylinderGeometry(l.type === "summit" ? 7 : choiceRole === "route-convergence" ? 5.5 : 4, l.type === "summit" ? 1.8 : 0.8, height, 18, 1, true), beamMaterial);
        beam.position.set(l.x, l.y + height / 2, -2);
        beam.userData = { id: l.id, sourceY: l.y, type: l.type, choiceRole };
        if (["post-rejoin-restore", "route-convergence"].includes(choiceRole)) beam.userData.ownsMaterial = true;
        beacons.add(beam);
      }
    }
    setLine(routeLine, routePoints);
    if (choice) {
      const byId = Object.fromEntries((snapshot.route?.ledges ?? []).map((ledge) => [ledge.id, ledge]));
      const rest = byId[choice.restAnchorId];
      const safe = byId[choice.safeAnchorId];
      const shortcut = byId[choice.shortcutAnchorId];
      const rejoin = byId[choice.rejoinAnchorId];
      const postRejoin = byId[choice.postRejoinAnchorId];
      const convergence = byId[choice.convergenceAnchorId];
      setLine(safeChoiceLine, [rest, safe, rejoin].filter(Boolean).map(({ x, y }) => ({ x, y, z: 0 })));
      setLine(shortcutChoiceLine, [rest, shortcut, rejoin].filter(Boolean).map(({ x, y }) => ({ x, y, z: 0 })));
      setLine(consequenceLine, [rejoin, postRejoin, convergence].filter(Boolean).map(({ x, y }) => ({ x, y, z: 24 })));
    } else {
      setLine(safeChoiceLine, []);
      setLine(shortcutChoiceLine, []);
      setLine(consequenceLine, []);
    }
    const summit = snapshot.route?.ledges?.find((ledge) => ledge.type === "summit");
    if (summit) summitCelebration.position.set(summit.x, summit.y, 12);
  }

  function draw(snapshot) {
    if (!snapshot) return;
    resize();
    const time = performance.now() / 1000;
    const key = `${snapshot.levelId}:${snapshot.sector}:${snapshot.route?.ledges?.length ?? 0}`;
    if (key !== routeKey) {
      rebuild(snapshot);
      if (snapshot.sectorTransition?.phase === "opening") {
        presentedCameraY = snapshot.camera?.y ?? 0;
        presentedCameraZ = snapshot.camera?.z ?? 244;
      }
    }
    const trauma = clamp01(snapshot.camera?.trauma ?? 0);
    const summit = snapshot.route?.ledges?.find((ledge) => ledge.type === "summit");
    const openingReveal = snapshot.sectorTransition?.phase === "opening";
    const windglassRebound = describeWindglassRejoinRebound(snapshot);
    const swingReleaseCue = describeActiveSwingReleaseCue(snapshot);
    const choiceFraming = ["open", "consequence-active", "confirmation-active", "payoff-active", "convergence-active", "rejoin-active"].includes(snapshot.routeChoice?.status) || Boolean(windglassRebound) || Boolean(swingReleaseCue);
    const choiceRest = snapshot.route?.ledges?.find((ledge) => ledge.id === snapshot.routeChoice?.restAnchorId);
    const choiceRejoin = snapshot.route?.ledges?.find((ledge) => ledge.id === snapshot.routeChoice?.rejoinAnchorId);
    const postRejoin = snapshot.route?.ledges?.find((ledge) => ledge.id === snapshot.routeChoice?.postRejoinAnchorId);
    const payoffTarget = snapshot.route?.ledges?.find((ledge) => ledge.id === snapshot.routeChoice?.payoffTargetId);
    const convergenceTarget = snapshot.route?.ledges?.find((ledge) => ledge.id === snapshot.routeChoice?.convergenceAnchorId);
    const genericRejoinTarget = snapshot.route?.ledges?.find((ledge) => ledge.id === snapshot.routeChoice?.genericRejoinAnchorId);
    const genericRejoinIndex = snapshot.route?.ledges?.findIndex((ledge) => ledge.id === snapshot.routeChoice?.genericRejoinAnchorId) ?? -1;
    const reboundNextTarget = genericRejoinIndex >= 0 ? snapshot.route?.ledges?.[genericRejoinIndex + 1] : null;
    const confirmationHandoff = confirmationHandoffProgress(snapshot, postRejoin);
    const payoffSurge = payoffGrappleSurge(snapshot, payoffTarget);
    const releaseSurge = describeReleaseCueSurge(snapshot);
    const windglassSettle = describeWindglassScoreSettle(snapshot);
    const payoffCameraZoomBonus = num(payoffTarget?.metadata?.routeChoicePayoffCameraZoomBonus, 0);
    const rejoinCameraZoomBonus = num(convergenceTarget?.metadata?.routeChoiceGenericRejoinCameraZoomBonus, 0);
    const choiceCameraY = (windglassRebound || swingReleaseCue) && genericRejoinTarget
      ? (genericRejoinTarget.y + num(reboundNextTarget?.y, genericRejoinTarget.y + 110)) * 0.5
      : snapshot.routeChoice?.status === "rejoin-active" && genericRejoinTarget
      ? (num(snapshot.player?.y, convergenceTarget?.y) + genericRejoinTarget.y) * 0.5
      : snapshot.routeChoice?.status === "convergence-active" && payoffTarget && convergenceTarget
      ? (payoffTarget.y + convergenceTarget.y) * 0.5
      : snapshot.routeChoice?.status === "payoff-active" && payoffTarget
      ? (num(snapshot.player?.y, postRejoin?.y) + payoffTarget.y) * 0.5
      : snapshot.routeChoice?.status === "confirmation-active" && postRejoin
      ? num(postRejoin.y) + (((num(postRejoin.y) + num(payoffTarget?.y, postRejoin.y)) * 0.5) - num(postRejoin.y)) * confirmationHandoff
      : snapshot.routeChoice?.status === "consequence-active" && choiceRejoin && postRejoin
      ? (choiceRejoin.y + postRejoin.y) * 0.5
      : choiceRest && choiceRejoin ? (choiceRest.y + choiceRejoin.y) * 0.5 : snapshot.camera?.y ?? 0;
    const targetCameraY = openingReveal ? 242 : choiceFraming ? choiceCameraY : snapshot.completed && summit ? summit.y - 42 : snapshot.camera?.y ?? 0;
    const targetCameraZ = openingReveal ? 500 : choiceFraming ? 340 + (snapshot.routeChoice?.status === "payoff-active" ? payoffCameraZoomBonus : snapshot.routeChoice?.status === "confirmation-active" ? payoffCameraZoomBonus * confirmationHandoff : snapshot.routeChoice?.status === "rejoin-active" ? rejoinCameraZoomBonus : windglassRebound ? 32 : swingReleaseCue ? 48 : 0) : snapshot.completed ? Math.max(272, snapshot.camera?.z ?? 210) : snapshot.camera?.z ?? 210;
    presentedCameraY = presentedCameraY == null ? targetCameraY : presentedCameraY + (targetCameraY - presentedCameraY) * (snapshot.completed ? 0.065 : 0.24);
    presentedCameraZ = presentedCameraZ == null ? targetCameraZ : presentedCameraZ + (targetCameraZ - presentedCameraZ) * 0.08;
    camera.position.set((snapshot.camera?.x ?? 0) + Math.sin(time * 53) * trauma * 8, presentedCameraY + Math.cos(time * 47) * trauma * 6, presentedCameraZ);
    camera.lookAt(0, presentedCameraY, 0);
    updateParallax(snapshot, time, releaseSurge);
    updateCounterwindField(snapshot, time);
    const choice = snapshot.routeChoice;
    const currentIndex = (snapshot.route?.ledges ?? []).findIndex((ledge) => ledge.id === snapshot.currentAnchorId);
    const choiceVisible = Boolean(choice && ["open", "committed"].includes(choice.status) && currentIndex >= Math.max(0, num(snapshot.route?.openingPattern?.endIndex, 4) - 1));
    safeChoiceLine.visible = choiceVisible;
    shortcutChoiceLine.visible = choiceVisible;
    if (choiceVisible) {
      safeChoiceLine.material.opacity = choice.status === "committed" && choice.selectedRole !== "safe-recovery" ? 0.08 : 0.56;
      shortcutChoiceLine.material.opacity = choice.status === "committed" && choice.selectedRole !== "pressure-shortcut" ? 0.08 : 0.58;
    }
    consequenceLine.visible = ["consequence-active", "payoff-active", "convergence-active", "rejoin-active"].includes(choice?.status) || confirmationHandoff > 0 || Boolean(swingReleaseCue);
    if (consequenceLine.visible) {
      const routeLedges = snapshot.route?.ledges ?? [];
      const anchor = (id) => routeLedges.find((ledge) => ledge.id === id);
      const points = choice.status === "resolved" && swingReleaseCue
        ? [anchor(choice.genericRejoinAnchorId), anchor(swingReleaseCue.targetId)]
        : choice.status === "confirmation-active"
        ? [anchor(choice.postRejoinAnchorId), lerpPoint(anchor(choice.postRejoinAnchorId), anchor(choice.payoffTargetId), confirmationHandoff)]
        : choice.status === "rejoin-active"
        ? [anchor(choice.convergenceAnchorId), anchor(choice.genericRejoinAnchorId)]
        : choice.status === "convergence-active"
        ? [anchor(choice.payoffTargetId), anchor(choice.convergenceAnchorId)]
        : choice.status === "payoff-active"
        ? [anchor(choice.postRejoinAnchorId), anchor(choice.payoffTargetId)]
        : [anchor(choice.rejoinAnchorId), anchor(choice.postRejoinAnchorId)];
      setLine(consequenceLine, points.filter(Boolean).map(({ x, y }) => ({ x, y, z: 24 })));
      consequenceLine.material.color.setHex(swingReleaseCue?.color ?? windglassSettle?.color ?? (choice.status === "rejoin-active" ? 0x77e8ff : choice.selectedRole === "pressure-shortcut" ? 0xffb83d : 0x3dffa3));
      const ventProgress = choice.status === "consequence-active" && choice.selectedRole === "pressure-shortcut" ? clamp01(num(choice.ventProgress, 0)) : 0;
      consequenceLine.material.opacity = choice.status === "confirmation-active"
        ? 0.34 + confirmationHandoff * 0.5 + (0.5 + 0.5 * Math.sin(time * 9)) * 0.08
        : 0.56 + (0.5 + 0.5 * Math.sin(time * 7.5)) * 0.24 - ventProgress * 0.28;
    }

    const staminaPct = Math.max(0, Math.min(1, (snapshot.stamina ?? 0) / Math.max(1, snapshot.constants?.maxStamina ?? 100)));
    for (const [id, g] of ledgeMap) {
      const unselected = ["committed", "consequence-active", "confirmation-active", "payoff-active", "convergence-active", "rejoin-active", "resolved"].includes(choice?.status) && id === choice.unselectedAnchorId;
      const payoffAnchor = [choice?.payoffSafeAnchorId, choice?.payoffShortcutAnchorId].includes(id);
      const payoffTargetPreview = choice?.status === "confirmation-active" && confirmationHandoff > 0 && id === choice.payoffTargetId;
      const inactivePayoff = payoffAnchor && !(payoffTargetPreview || (["payoff-active", "convergence-active", "rejoin-active", "resolved"].includes(choice?.status) && id === choice?.payoffTargetId));
      const convergenceAnchor = id === choice?.convergenceAnchorId;
      const inactiveConvergence = convergenceAnchor && !["convergence-active", "rejoin-active", "resolved"].includes(choice?.status);
      const selected = id === choice?.selectedAnchorId;
      const carryTarget = choice?.status === "committed" && id === choice.rejoinAnchorId;
      const consequenceTarget = choice?.status === "consequence-active" && id === choice.postRejoinAnchorId;
      const confirmationTarget = choice?.status === "confirmation-active" && id === choice.postRejoinAnchorId;
      const payoffTargetActive = choice?.status === "payoff-active" && id === choice.payoffTargetId;
      const convergenceTargetActive = choice?.status === "convergence-active" && convergenceAnchor;
      const rejoinTargetActive = choice?.status === "rejoin-active" && id === choice.genericRejoinAnchorId;
      const rejoinReboundTarget = Boolean(windglassRebound) && id === choice?.genericRejoinAnchorId;
      const scoreCarryTarget = Boolean(swingReleaseCue) && id === swingReleaseCue.targetId;
      g.visible = !unselected && !inactivePayoff && !inactiveConvergence;
      const hot = id === snapshot.hoveredId || snapshot.enabledTargetIds?.includes(id) || id === snapshot.aimAssistTargetId || selected || consequenceTarget || confirmationTarget || payoffTargetPreview || payoffTargetActive || convergenceTargetActive || rejoinTargetActive || rejoinReboundTarget || scoreCarryTarget;
      const pulse = 1 + Math.sin(time * 6 + (g.position.y || 0) * 0.01) * 0.045;
      g.scale.setScalar((scoreCarryTarget ? 1.42 : rejoinReboundTarget ? 1.34 + windglassRebound.strength * 0.32 : rejoinTargetActive ? 1.48 : carryTarget ? 1.34 : confirmationTarget ? 1.24 : payoffTargetPreview ? 0.28 + confirmationHandoff * 0.84 : id === snapshot.hoveredId || id === snapshot.aimAssistTargetId ? 1.3 : hot ? 1.12 : 1) * pulse);
      g.userData.core.material = scoreCarryTarget
        ? choice.selectedRole === "pressure-shortcut" ? m.shortcutChoice : m.safeChoice
        : convergenceTargetActive || rejoinTargetActive || rejoinReboundTarget
        ? m.windglass
        : carryTarget || consequenceTarget || confirmationTarget || payoffTargetPreview || payoffTargetActive
        ? choice.selectedRole === "pressure-shortcut" ? m.shortcutChoice : m.safeChoice
        : matFor(m, g.userData.type, id === snapshot.hoveredId || id === snapshot.aimAssistTargetId, g.userData.choiceRole);
      g.userData.halo.visible = hot || g.userData.type !== "normal" || Boolean(g.userData.choiceRole && choice?.status === "open");
      g.userData.halo.material.opacity = payoffTargetPreview
        ? 0.08 + confirmationHandoff * 0.34
        : g.userData.type === "normal" ? (hot ? 0.22 + staminaPct * 0.18 : 0.05) : 0.32 + Math.sin(time * 4) * 0.08;
      g.userData.halo.rotation.z += 0.012;
    }
    for (const beam of beacons.children) {
      beam.visible = !(["committed", "consequence-active", "confirmation-active", "payoff-active", "convergence-active", "rejoin-active", "resolved"].includes(choice?.status) && beam.userData.id === choice.unselectedAnchorId);
      const consequenceBeam = beam.userData.id === choice?.postRejoinAnchorId;
      const windglassBeam = beam.userData.id === choice?.convergenceAnchorId;
      if (consequenceBeam) {
        beam.visible = ["consequence-active", "confirmation-active", "resolved"].includes(choice?.status);
        beam.material.color.setHex(choice?.selectedRole === "pressure-shortcut" ? 0xffb83d : 0x3dffa3);
      }
      if (windglassBeam) {
        beam.visible = ["convergence-active", "rejoin-active", "resolved"].includes(choice?.status);
        if (windglassSettle) beam.material.color.setHex(windglassSettle.color);
        else if (windglassSettleApplied) beam.material.color.setHex(0x3dffa3);
      }
      beam.material.opacity = beam.userData.type === "summit"
        ? (snapshot.completed ? 0.58 : 0.14) + Math.sin(time * (snapshot.completed ? 5.2 : 2.2)) * (snapshot.completed ? 0.16 : 0.04)
        : windglassBeam ? 0.46 + Math.sin(time * 8.5) * 0.18
        : consequenceBeam ? (choice?.status === "confirmation-active" ? 0.82 : 0.38 + Math.sin(time * 6.5) * 0.14 + clamp01(num(choice?.ventProgress, 0)) * 0.28) : 0.18 + Math.sin(time * 4.5 + beam.userData.sourceY) * 0.1;
      beam.rotation.y += beam.userData.type === "summit" ? 0.003 : 0.009;
    }
    summitCelebration.visible = Boolean(summit && (snapshot.completed || ["broadcast", "handshake"].includes(snapshot.sectorTransition?.phase)));
    if (summitCelebration.visible) {
      const pulse = 0.5 + 0.5 * Math.sin(time * 5.5);
      celebrationRings.forEach((ring, index) => {
        const phase = time * (index % 2 ? -0.52 : 0.68) + index * 0.7;
        ring.rotation.set(Math.sin(phase) * 0.32, Math.cos(phase * 0.8) * 0.26, phase);
        ring.scale.setScalar(0.88 + index * 0.12 + pulse * (0.16 + index * 0.035));
        ring.material.opacity = 0.28 + pulse * (0.42 - index * 0.08);
      });
      summitLight.intensity = 5.5 + pulse * 4.5;
    } else {
      summitLight.intensity = 0;
    }

    player.position.set(snapshot.player.x, snapshot.player.y, snapshot.player.z ?? 1);
    if (windglassSettle) {
      player.scale.set(
        (snapshot.player.scaleX ?? 1) * (1 + (windglassSettle.scaleX - 1) * windglassSettle.strength),
        (snapshot.player.scaleY ?? 1) * (1 + (windglassSettle.scaleY - 1) * windglassSettle.strength),
        snapshot.player.scaleZ ?? 1
      );
    } else player.scale.set(snapshot.player.scaleX ?? 1, snapshot.player.scaleY ?? 1, snapshot.player.scaleZ ?? 1);
    player.rotation.x = snapshot.player.rotationX ?? 0;
    player.rotation.y = snapshot.player.rotationY ?? 0;
    if (windglassSettle) {
      m.windglass.color.setHex(windglassSettle.color);
      m.windglass.emissive.setHex(windglassSettle.color);
      m.windglass.emissiveIntensity = 3.8 + windglassSettle.strength * 2.5;
      windglassSettleApplied = true;
    } else if (windglassSettleApplied) {
      m.windglass.color.setHex(0xe4fbff);
      m.windglass.emissive.setHex(0x77e8ff);
      m.windglass.emissiveIntensity = 3.8;
      windglassSettleApplied = false;
    }
    updateDiegeticPlayerSignals({ snapshot, playerMaterial: m.player, staminaHalo, dangerHalo, modeLight, dangerLight, releaseSurge, swingReleaseCue, windglassSettle, windglassRebound });

    probe.visible = Boolean(snapshot.probe?.visible);
    probe.position.set(snapshot.probe?.x ?? 0, snapshot.probe?.y ?? 0, snapshot.probe?.z ?? 1);
    setLine(rope, snapshot.rope?.visible ? snapshot.rope.nodes : []);
    if (payoffSurge) {
      rope.material.color.setHex(payoffSurge.color);
      rope.material.opacity = 0.9 + payoffSurge.strength * 0.1;
      m.probe.color.setHex(payoffSurge.color);
      m.probe.emissive.setHex(payoffSurge.color);
      m.probe.emissiveIntensity = 3.2 + payoffSurge.strength * 2.4;
      payoffSurgeApplied = true;
    } else if (payoffSurgeApplied) {
      rope.material.color.setHex(0x00f0ff);
      rope.material.opacity = 0.9;
      m.probe.color.setHex(0x00f0ff);
      m.probe.emissive.setHex(0x00f0ff);
      m.probe.emissiveIntensity = 3.2;
      payoffSurgeApplied = false;
    }
    setLine(traj, snapshot.trajectory ?? []);
    updateAimGuide(snapshot, time);
    reach.position.set(snapshot.reach?.x ?? snapshot.player.x, snapshot.reach?.y ?? snapshot.player.y, -1);
    reach.visible = snapshot.mode === "falling" || snapshot.mode === "retracting";
    reach.material.opacity = reach.visible ? 0.05 + Math.sin(time * 3) * 0.02 : 0;
    spot.position.set(snapshot.player.x, snapshot.player.y + 115, 100);
    spot.target.position.set(snapshot.player.x, snapshot.player.y, -10);
    const effectDt = Math.max(0, Math.min(0.1, time - lastEffectTime));
    lastEffectTime = time;
    diegeticEffects.update(snapshot, effectDt);
    renderer.render(scene, camera);
  }

  function screenToWorld(clientX, clientY, snapshot) {
    if (snapshot?.camera) {
      const cameraY = presentedCameraY ?? snapshot.camera.y ?? 0;
      const cameraZ = presentedCameraZ ?? snapshot.camera.z ?? 210;
      camera.position.set(snapshot.camera.x ?? 0, cameraY, cameraZ);
      camera.lookAt(0, cameraY, 0);
      camera.updateMatrixWorld();
    }
    const ndc = new THREE.Vector2(clientX / innerWidth * 2 - 1, -(clientY / innerHeight) * 2 + 1);
    const vec = new THREE.Vector3(ndc.x, ndc.y, 0.5).unproject(camera);
    const dir = vec.sub(camera.position).normalize();
    const hit = camera.position.clone().add(dir.multiplyScalar(-camera.position.z / (dir.z || 0.0001)));
    return Number.isFinite(hit.x) && Number.isFinite(hit.y) ? { x: hit.x, y: hit.y } : null;
  }

  function getMetrics() {
    let sceneNodes = 0;
    scene.traverse(() => { sceneNodes += 1; });
    return {
      sceneNodes,
      ledgeEntities: ledgeMap.size,
      drawCalls: renderer.info.render.calls,
      triangles: renderer.info.render.triangles,
      points: renderer.info.render.points,
      lines: renderer.info.render.lines,
      geometries: renderer.info.memory.geometries,
      textures: renderer.info.memory.textures,
      dynamicLineCapacities: {
        rope: rope.geometry.getAttribute("position")?.count ?? 0,
        trajectory: traj.geometry.getAttribute("position")?.count ?? 0,
        aim: aim.geometry.getAttribute("position")?.count ?? 0,
        route: routeLine.geometry.getAttribute("position")?.count ?? 0,
        safeChoice: safeChoiceLine.geometry.getAttribute("position")?.count ?? 0,
        shortcutChoice: shortcutChoiceLine.geometry.getAttribute("position")?.count ?? 0,
        consequence: consequenceLine.geometry.getAttribute("position")?.count ?? 0
      }
    };
  }

  return { draw, screenToWorld, getMetrics };
}

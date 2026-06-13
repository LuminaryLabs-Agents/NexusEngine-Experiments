const NEXUS_URLS = [
  "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js",
  "../../../NexusRealtime/src/index.js"
];
const GRAPPLE_KIT_URLS = [
  "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@main/protokits/next-ledge-grapple-kit/index.js",
  "../../../NexusRealtime-ProtoKits/protokits/next-ledge-grapple-kit/index.js"
];
const ACTION_INPUT_KIT_URLS = [
  "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@main/protokits/action-input-kit/index.js",
  "../../../NexusRealtime-ProtoKits/protokits/action-input-kit/index.js"
];
const THREE_URLS = ["https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"];

async function importFirst(urls, label) {
  let lastError = null;
  for (const url of urls) {
    try { return await import(url); } catch (error) { lastError = error; }
  }
  throw new Error(`Could not import ${label}: ${lastError?.message ?? lastError}`);
}

function showFatal(error) {
  const panel = document.querySelector("#errorPanel");
  panel.hidden = false;
  panel.textContent = String(error?.stack ?? error?.message ?? error);
}

function createHud() {
  const top = document.querySelector("#topHud");
  return {
    draw(snapshot) {
      top.textContent = `NEXT LEDGE · ${snapshot.mode} · SECTOR ${snapshot.sector} · ${Math.round(snapshot.stamina)}% · ${snapshot.height}M`;
    }
  };
}

function recordDisposers(engine, surfaces) {
  return surfaces.filter(Boolean).map((surface) => () => engine.unregisterSurface?.(surface));
}

function createActionSubscriptions(engine) {
  const surfaces = [];
  const axisSurface = engine.eventSurface(engine.actionInput.events.AxisChanged, { label: "next-ledge-axis" });
  axisSurface.subscribe((batch) => {
    for (const record of batch) engine.nextLedgeGrapple.swingAxis(record.payload?.axis?.x ?? 0);
  });
  surfaces.push(axisSurface);

  const aimSurface = engine.eventSurface(engine.actionInput.events.AimChanged, { label: "next-ledge-aim" });
  aimSurface.subscribe((batch) => {
    for (const record of batch) {
      const aim = record.payload?.aim;
      if (aim) engine.nextLedgeGrapple.setAimVector(aim.x, aim.y);
    }
  });
  surfaces.push(aimSurface);

  const pressedSurface = engine.eventSurface(engine.actionInput.events.ActionPressed, { label: "next-ledge-pressed" });
  pressedSurface.subscribe((batch) => {
    for (const record of batch) {
      const action = record.payload?.action;
      if (action === "primary") engine.nextLedgeGrapple.action();
      if (action === "restart") engine.nextLedgeGrapple.restart();
      if (action === "debugAdvance") engine.nextLedgeGrapple.advanceSector();
    }
  });
  surfaces.push(pressedSurface);

  const clearedSurface = engine.eventSurface(engine.actionInput.events.Cleared, { label: "next-ledge-clear" });
  clearedSurface.subscribe(() => engine.nextLedgeGrapple.swingAxis(0));
  surfaces.push(clearedSurface);

  return { dispose: recordDisposers(engine, surfaces) };
}

function createInput({ canvas, engine, camera, THREE }) {
  const mouse = new THREE.Vector2(0, 0);
  const world = new THREE.Vector3();

  function updateAim(clientX, clientY) {
    mouse.x = (clientX / innerWidth) * 2 - 1;
    mouse.y = -(clientY / innerHeight) * 2 + 1;
    world.set(mouse.x, mouse.y, 0.5).unproject(camera);
    const dir = world.sub(camera.position).normalize();
    const distance = -camera.position.z / (dir.z || 0.0001);
    const point = camera.position.clone().add(dir.multiplyScalar(distance));
    const snapshot = engine.nextLedgeGrapple.getSnapshot();
    engine.actionInput.aim(point.x - snapshot.player.x, point.y - snapshot.player.y, { source: "pointer" });
  }

  addEventListener("keydown", (event) => {
    const key = event.code === "Space" ? "space" : event.key.toLowerCase();
    if (key === "space") event.preventDefault();
    engine.actionInput.key(key, true, { source: "keyboard" });
  });
  addEventListener("keyup", (event) => {
    const key = event.code === "Space" ? "space" : event.key.toLowerCase();
    engine.actionInput.key(key, false, { source: "keyboard" });
  });
  addEventListener("blur", () => engine.actionInput.clear({ source: "blur" }));

  canvas.addEventListener("mousemove", (event) => updateAim(event.clientX, event.clientY));
  canvas.addEventListener("mousedown", (event) => {
    updateAim(event.clientX, event.clientY);
    engine.actionInput.press("primary", { source: "pointer" });
  });
  addEventListener("mouseup", () => engine.actionInput.release("primary", { source: "pointer" }));
  canvas.addEventListener("touchstart", (event) => {
    const touch = event.touches[0];
    if (!touch) return;
    updateAim(touch.clientX, touch.clientY);
    engine.actionInput.press("primary", { source: "touch" });
  }, { passive: true });
  addEventListener("touchend", () => engine.actionInput.release("primary", { source: "touch" }), { passive: true });

  return {
    flush() {}
  };
}

function createRenderer({ canvas, THREE }) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x03070b, 0.0035);
  const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 1, 1000);
  camera.position.z = 210;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));

  scene.add(new THREE.AmbientLight(0x0a1122, 0.65));
  const spot = new THREE.SpotLight(0x00f0ff, 3.2, 500);
  spot.angle = Math.PI / 3;
  spot.penumbra = 0.7;
  scene.add(spot, spot.target);
  const lightA = new THREE.PointLight(0x00f0ff, 1.8, 130);
  const lightB = new THREE.PointLight(0x3dffa3, 1.8, 130);
  scene.add(lightA, lightB);

  const mats = {
    cliff: new THREE.MeshStandardMaterial({ color: 0x050a12, roughness: 0.95, metalness: 0.05, flatShading: true }),
    metal: new THREE.MeshStandardMaterial({ color: 0x0c111a, roughness: 0.65, metalness: 0.88, flatShading: true }),
    player: new THREE.MeshStandardMaterial({ color: 0xffb83d, emissive: 0xffb83d, emissiveIntensity: 1.2, roughness: 0.05 }),
    probe: new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 2.5, roughness: 0.1 }),
    rope: new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.85 }),
    aim: new THREE.LineBasicMaterial({ color: 0xffb83d, transparent: true, opacity: 0.35 }),
    reach: new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.04, side: THREE.DoubleSide })
  };

  const player = new THREE.Mesh(new THREE.SphereGeometry(6.5, 32, 32), mats.player);
  const probe = new THREE.Mesh(new THREE.OctahedronGeometry(3.6, 0), mats.probe);
  const rope = new THREE.Line(new THREE.BufferGeometry(), mats.rope);
  const aim = new THREE.Line(new THREE.BufferGeometry(), mats.aim);
  const reach = new THREE.Mesh(new THREE.RingGeometry(148.8, 150, 64), mats.reach);
  const ledgeRoot = new THREE.Group();
  const env = new THREE.Group();
  scene.add(env, ledgeRoot, player, probe, rope, aim, reach);

  let ledgeKey = "";

  function resize() {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  }
  addEventListener("resize", resize);
  resize();

  function colorFor(type) {
    if (type === "rest") return 0x3dffa3;
    if (type === "summit") return 0xffd65a;
    return 0x00f0ff;
  }

  function rebuildLedges(ledges) {
    ledgeRoot.clear();
    for (const ledge of ledges) {
      const group = new THREE.Group();
      group.position.set(ledge.x, ledge.y, 0);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(ledge.r * 1.55, ledge.r * 1.55, 3.5, 6), mats.metal);
      base.rotation.x = Math.PI / 2;
      const core = new THREE.Mesh(new THREE.SphereGeometry(ledge.r, 10, 10), new THREE.MeshStandardMaterial({ color: colorFor(ledge.type), emissive: colorFor(ledge.type), emissiveIntensity: 2, roughness: 0.1 }));
      core.position.z = 2;
      group.add(base, core);
      ledgeRoot.add(group);
    }
  }

  function rebuildEnvironment(snapshot) {
    env.clear();
    const chunks = Math.ceil((snapshot.ledges.at(-1)?.y ?? 2600) / 600) + 2;
    for (let i = 0; i < chunks; i += 1) {
      const y = i * 600 - 300;
      const wall = new THREE.Mesh(new THREE.PlaneGeometry(650, 600, 12, 12), mats.cliff);
      wall.position.set(0, y + 300, -18);
      env.add(wall);
      for (const x of [-170, 170]) {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(8, 620, 8), mats.metal);
        beam.position.set(x, y + 300, -8);
        env.add(beam);
      }
    }
  }

  function setLine(line, points) {
    line.geometry.dispose();
    line.geometry = new THREE.BufferGeometry().setFromPoints(points.map((p) => new THREE.Vector3(p.x, p.y, p.z ?? 1)));
  }

  function draw(snapshot) {
    const key = `${snapshot.sector}:${snapshot.ledges.length}:${snapshot.ledges.at(-1)?.y}`;
    if (key !== ledgeKey) {
      ledgeKey = key;
      rebuildLedges(snapshot.ledges);
      rebuildEnvironment(snapshot);
    }

    camera.position.y += (snapshot.camera.y - camera.position.y) * 0.055;
    camera.position.x += (snapshot.camera.x - camera.position.x) * 0.045;
    player.position.set(snapshot.player.x, snapshot.player.y, 2);
    const stretchX = 1 + Math.abs(snapshot.player.vx) * 0.006;
    const stretchY = Number(snapshot.player.squash ?? 1) + Math.abs(snapshot.player.vy) * 0.004;
    player.scale.set(stretchX, stretchY, 1);
    player.rotation.y += snapshot.player.vx * 0.002;
    player.rotation.x += 0.03;

    probe.visible = snapshot.probe.visible;
    if (probe.visible) probe.position.set(snapshot.probe.x, snapshot.probe.y, 2);
    reach.position.set(snapshot.player.x, snapshot.player.y, -1);

    rope.visible = snapshot.rope.visible;
    if (rope.visible) setLine(rope, snapshot.rope.points);
    const aimEnd = { x: snapshot.player.x + snapshot.aim.x * snapshot.reachRadius, y: snapshot.player.y + snapshot.aim.y * snapshot.reachRadius, z: 1 };
    setLine(aim, [snapshot.player, aimEnd]);
    aim.visible = snapshot.mode === "falling" || snapshot.mode === "retracting";

    spot.position.set(snapshot.player.x, snapshot.player.y + 115, 100);
    spot.target.position.set(snapshot.player.x, snapshot.player.y, -10);
    const nearby = snapshot.ledges.filter((l) => Math.abs(l.y - snapshot.player.y) < 240).slice(0, 2);
    if (nearby[0]) lightA.position.set(nearby[0].x, nearby[0].y, 20);
    if (nearby[1]) lightB.position.set(nearby[1].x, nearby[1].y, 20);
    renderer.render(scene, camera);
  }

  return { camera, draw };
}

async function boot() {
  const canvas = document.querySelector("#game");
  const [NexusRealtime, GrappleKit, ActionInputKit, THREE] = await Promise.all([
    importFirst(NEXUS_URLS, "NexusRealtime"),
    importFirst(GRAPPLE_KIT_URLS, "Next Ledge Grapple ProtoKit"),
    importFirst(ACTION_INPUT_KIT_URLS, "Action Input ProtoKit"),
    importFirst(THREE_URLS, "Three.js")
  ]);

  const level = GrappleKit.createDefaultNextLedgeGrappleLevel({ seed: "games-next-ledge-grapple" });
  const engine = NexusRealtime.createRealtimeGame({
    kits: [
      ActionInputKit.createActionInputKit(NexusRealtime, { context: "next-ledge-grapple" }),
      GrappleKit.createNextLedgeGrappleKit(NexusRealtime, { level, seed: level.seed })
    ]
  });
  const renderer = createRenderer({ canvas, THREE });
  const hud = createHud();
  const input = createInput({ canvas, engine, camera: renderer.camera, THREE });
  const actions = createActionSubscriptions(engine);

  let last = performance.now();
  let running = true;

  function tick(dt) {
    input.flush();
    engine.tick(dt);
    const snapshot = engine.nextLedgeGrapple.getSnapshot();
    renderer.draw(snapshot);
    hud.draw(snapshot);
    return snapshot;
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min(1 / 30, (now - last) / 1000 || 1 / 60);
    last = now;
    tick(dt);
    requestAnimationFrame(frame);
  }

  window.GameHost = {
    engine,
    renderer,
    input,
    actions,
    getState: () => engine.nextLedgeGrapple.getState(),
    getInput: () => engine.actionInput.getState(),
    getSnapshot: () => engine.nextLedgeGrapple.getSnapshot(),
    tick,
    stop: () => { running = false; },
    start: () => { if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); } }
  };

  requestAnimationFrame(frame);
}

boot().catch(showFatal);

import { OPEN_ABOVE_V2_CONFIG as CONFIG } from "./open-above-v2.config.js";

const params = new URLSearchParams(location.search);
const canvas = document.querySelector("#game");
const hud = document.querySelector("#hud");
const errorPanel = document.querySelector("#error");

const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min, max) => Math.max(min, Math.min(max, n(value, min)));
const mix = (a, b, t) => n(a) + (n(b) - n(a)) * clamp(t, 0, 1);
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

function fail(error) {
  errorPanel.hidden = false;
  errorPanel.textContent = String(error?.stack || error?.message || error);
  hud.innerHTML = "<strong>The Open Above</strong><br>Radial terrain error. See panel.";
}

function hexToRgb(hex, fallback = [0.70, 0.82, 0.92]) {
  const raw = String(hex || "").replace("#", "");
  if (raw.length !== 6) return fallback;
  return [parseInt(raw.slice(0, 2), 16) / 255, parseInt(raw.slice(2, 4), 16) / 255, parseInt(raw.slice(4, 6), 16) / 255];
}

function colorFromSample(sample, skyRgb) {
  const heightBlend = clamp((sample.height + 80) / 360, 0, 1);
  const grass = [0.20, 0.42, 0.20];
  const ridge = [0.48, 0.50, 0.43];
  const snow = [0.82, 0.88, 0.82];
  const river = [0.33, 0.58, 0.68];
  let base = heightBlend > 0.72 ? snow : [mix(grass[0], ridge[0], heightBlend), mix(grass[1], ridge[1], heightBlend), mix(grass[2], ridge[2], heightBlend)];
  base = sample.river > 0.62 ? river : base;
  const fog = clamp((sample.distance - 620) / 2200, 0, 0.88);
  return [mix(base[0], skyRgb[0], fog), mix(base[1], skyRgb[1], fog), mix(base[2], skyRgb[2], fog)];
}

function terrainSample(x, z, center = { x: 0, z: 0 }) {
  const distance = Math.hypot(x - n(center.x), z - n(center.z));
  const ridge = Math.sin(x * 0.0048) * 92 + Math.cos(z * 0.0042) * 88;
  const fold = Math.sin((x + z) * 0.009) * 34 + Math.cos((x - z) * 0.012) * 24;
  const valley = -Math.max(0, 1 - Math.abs(Math.sin((x * 0.006) + (z * 0.003))) * 4) * 42;
  const river = Math.max(0, 1 - Math.abs(Math.sin(x * 0.008 + z * 0.0025)) * 10);
  const height = ridge + fold + valley - river * 32;
  return { x, z, distance, height, river };
}

function createRadialTerrainDomain(config = {}) {
  const bands = config.bands ?? [
    { id: "core", innerRadius: 0, outerRadius: 90, radialSegments: 44, angularSegments: 112, lod: 0 },
    { id: "near", innerRadius: 90, outerRadius: 280, radialSegments: 44, angularSegments: 112, lod: 1 },
    { id: "mid", innerRadius: 280, outerRadius: 860, radialSegments: 34, angularSegments: 112, lod: 2 },
    { id: "far", innerRadius: 860, outerRadius: 2500, radialSegments: 24, angularSegments: 112, lod: 3 }
  ];
  const originSnap = n(config.originSnap, 48);
  const state = {
    id: "open-above-radial-terrain-domain",
    mode: "camera-relative-radial-bands",
    focus: { x: 0, y: 0, z: 0 },
    origin: { x: 0, z: 0 },
    originSnap,
    version: 0,
    bands: clone(bands),
    vertexBudget: 0,
    lastOriginShift: null
  };

  function computeOrigin(focus) {
    return {
      x: Math.round(n(focus.x) / originSnap) * originSnap,
      z: Math.round(n(focus.z) / originSnap) * originSnap
    };
  }

  function refreshBudget() {
    state.vertexBudget = state.bands.reduce((sum, band) => sum + (n(band.radialSegments) + 1) * (n(band.angularSegments) + 1), 0);
  }

  function descriptors() {
    return {
      id: state.id,
      focus: clone(state.focus),
      origin: clone(state.origin),
      originMode: "camera-relative",
      bands: state.bands.map((band) => ({
        id: band.id,
        innerRadius: band.innerRadius,
        outerRadius: band.outerRadius,
        radialSegments: band.radialSegments,
        angularSegments: band.angularSegments,
        lod: band.lod,
        heightSampler: "openAbove.radialHeightfield.v1",
        materialSampler: "openAbove.radialMaterial.v1"
      })),
      vertexBudget: state.vertexBudget,
      version: state.version
    };
  }

  refreshBudget();

  return {
    setFocus(focus = {}) {
      const nextFocus = { x: n(focus.x), y: n(focus.y), z: n(focus.z) };
      const nextOrigin = computeOrigin(nextFocus);
      const changed = nextOrigin.x !== state.origin.x || nextOrigin.z !== state.origin.z;
      state.focus = nextFocus;
      if (changed) {
        state.lastOriginShift = { from: clone(state.origin), to: clone(nextOrigin) };
        state.origin = nextOrigin;
        state.version += 1;
      }
      return this.getState();
    },
    getState() { return clone(state); },
    getDescriptors: descriptors,
    reset() {
      state.focus = { x: 0, y: 0, z: 0 };
      state.origin = { x: 0, z: 0 };
      state.version += 1;
      state.lastOriginShift = null;
      return this.getState();
    }
  };
}

function createBandGeometry(THREE, descriptor, band, skyRgb) {
  const radialSegments = Math.max(2, Math.floor(n(band.radialSegments, 16)));
  const angularSegments = Math.max(12, Math.floor(n(band.angularSegments, 64)));
  const positions = new Float32Array((radialSegments + 1) * (angularSegments + 1) * 3);
  const colors = new Float32Array((radialSegments + 1) * (angularSegments + 1) * 3);
  const indices = [];
  const center = descriptor.origin;
  let cursor = 0;

  for (let r = 0; r <= radialSegments; r += 1) {
    const t = r / radialSegments;
    const radius = mix(band.innerRadius, band.outerRadius, t);
    for (let a = 0; a <= angularSegments; a += 1) {
      const angle = a / angularSegments * Math.PI * 2;
      const x = center.x + Math.cos(angle) * radius;
      const z = center.z + Math.sin(angle) * radius;
      const sample = terrainSample(x, z, descriptor.focus);
      const color = colorFromSample(sample, skyRgb);
      positions[cursor * 3] = x;
      positions[cursor * 3 + 1] = sample.height;
      positions[cursor * 3 + 2] = z;
      colors[cursor * 3] = color[0];
      colors[cursor * 3 + 1] = color[1];
      colors[cursor * 3 + 2] = color[2];
      cursor += 1;
    }
  }

  for (let r = 0; r < radialSegments; r += 1) {
    for (let a = 0; a < angularSegments; a += 1) {
      const row = angularSegments + 1;
      const i = r * row + a;
      indices.push(i, i + row, i + 1, i + 1, i + row, i + row + 1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

function createBird(THREE) {
  const root = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.66 });
  const wingMat = new THREE.MeshStandardMaterial({ color: 0xdce7ea, roughness: 0.74 });
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.92, 4.2, 10), bodyMat);
  body.geometry.rotateX(Math.PI / 2);
  root.add(body);
  const leftWing = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.06, 0.82), wingMat);
  leftWing.position.set(-2.28, 0, -0.12);
  const rightWing = leftWing.clone();
  rightWing.position.x = 2.28;
  const tail = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.06, 1.2), wingMat);
  tail.position.set(0, -0.04, 1.7);
  root.add(leftWing, rightWing, tail);
  root.userData = { leftWing, rightWing, tail };
  return root;
}

async function boot() {
  const THREE = await import(params.get("three") || CONFIG.runtime.threeUrl);
  const skyRgb = hexToRgb(CONFIG.sky.sky.horizon);
  const radialTerrain = createRadialTerrainDomain({ originSnap: 64 });
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, CONFIG.quality.pixelRatioMax));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = CONFIG.lighting.exposure;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(CONFIG.sky.sky.horizon);
  scene.fog = new THREE.FogExp2(CONFIG.sky.atmosphere?.fogColor ?? "#ccefff", 0.00082);
  const camera = new THREE.PerspectiveCamera(CONFIG.camera.baseFov, innerWidth / innerHeight, 0.1, 6200);
  const sun = new THREE.DirectionalLight(0xffefba, 3.5);
  sun.position.set(-260, 420, 240);
  scene.add(new THREE.HemisphereLight(0xbdeaff, 0x233b24, 0.86), sun);

  const terrainMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.98, metalness: 0.01, flatShading: false });
  const bird = createBird(THREE);
  scene.add(bird);
  const terrainMeshes = new Map();
  let lastDescriptorVersion = -1;
  let radialDescriptors = radialTerrain.getDescriptors();

  const flight = {
    position: { x: 0, y: 260, z: 0 },
    velocity: { x: 0, y: 0, z: -110 },
    yaw: 0,
    pitch: -0.035,
    roll: 0,
    speed: 112
  };
  const keys = new Set();
  let frame = 0;
  let elapsed = 0;

  function syncRadialTerrain() {
    radialTerrain.setFocus(flight.position);
    radialDescriptors = radialTerrain.getDescriptors();
    if (radialDescriptors.version === lastDescriptorVersion) return;
    lastDescriptorVersion = radialDescriptors.version;
    const live = new Set();
    for (const band of radialDescriptors.bands) {
      live.add(band.id);
      const previous = terrainMeshes.get(band.id);
      if (previous) {
        scene.remove(previous);
        previous.geometry.dispose();
      }
      const mesh = new THREE.Mesh(createBandGeometry(THREE, radialDescriptors, band, skyRgb), terrainMat);
      mesh.receiveShadow = true;
      scene.add(mesh);
      terrainMeshes.set(band.id, mesh);
    }
    for (const [id, mesh] of terrainMeshes) {
      if (!live.has(id)) {
        scene.remove(mesh);
        mesh.geometry.dispose();
        terrainMeshes.delete(id);
      }
    }
  }

  function groundHeight(x, z) {
    return terrainSample(x, z, radialDescriptors.focus).height;
  }

  function tick(dt) {
    const pitchInput = (keys.has("KeyW") || keys.has("ArrowUp") ? 1 : 0) - (keys.has("KeyS") || keys.has("ArrowDown") ? 1 : 0);
    const bankInput = (keys.has("KeyA") || keys.has("ArrowLeft") ? 1 : 0) - (keys.has("KeyD") || keys.has("ArrowRight") ? 1 : 0);
    const boosting = keys.has("Space");
    flight.pitch = clamp(flight.pitch + pitchInput * dt * 0.52, -0.52, 0.42);
    flight.yaw += -bankInput * dt * 0.82;
    flight.roll = mix(flight.roll, bankInput * 0.72, 1 - Math.pow(0.001, dt));
    flight.speed = mix(flight.speed, boosting ? 176 : 112, 1 - Math.pow(0.002, dt));
    const cp = Math.cos(flight.pitch);
    const forward = { x: -Math.sin(flight.yaw) * cp, y: Math.sin(flight.pitch), z: -Math.cos(flight.yaw) * cp };
    flight.velocity = { x: forward.x * flight.speed, y: forward.y * flight.speed, z: forward.z * flight.speed };
    flight.position.x += flight.velocity.x * dt;
    flight.position.y += flight.velocity.y * dt;
    flight.position.z += flight.velocity.z * dt;
    const floor = groundHeight(flight.position.x, flight.position.z) + 95;
    if (flight.position.y < floor) flight.position.y = mix(flight.position.y, floor, 0.16);
  }

  function draw() {
    syncRadialTerrain();
    const t = elapsed;
    bird.position.set(flight.position.x, flight.position.y, flight.position.z);
    bird.rotation.set(flight.pitch, flight.yaw, flight.roll, "YXZ");
    const flap = Math.sin(t * 8.2) * (0.18 + clamp((flight.speed - 100) / 180, 0, 0.26));
    bird.userData.leftWing.rotation.z = -flap - flight.roll * 0.38;
    bird.userData.rightWing.rotation.z = flap + flight.roll * 0.38;
    bird.userData.tail.rotation.x = -flight.pitch * 0.32;

    const behind = { x: Math.sin(flight.yaw) * 52, z: Math.cos(flight.yaw) * 52 };
    const camY = flight.position.y + 26 + clamp(-flight.pitch, 0, 1) * 26;
    camera.position.lerp(new THREE.Vector3(flight.position.x + behind.x, camY, flight.position.z + behind.z), 0.08);
    camera.lookAt(flight.position.x, flight.position.y - 6, flight.position.z - 36);
    camera.fov = mix(camera.fov, CONFIG.camera.baseFov + clamp((flight.speed - 112) / 100, 0, 1) * 10, 0.05);
    camera.updateProjectionMatrix();

    const clearance = flight.position.y - groundHeight(flight.position.x, flight.position.z);
    hud.innerHTML = `<strong>Open Above · radial terrain V1</strong><br>Speed ${Math.round(flight.speed)} · Clearance ${Math.round(clearance)} · Bands ${radialDescriptors.bands.length} · Vertices ${radialDescriptors.vertexBudget.toLocaleString()} · Origin ${radialDescriptors.origin.x},${radialDescriptors.origin.z}`;
    renderer.render(scene, camera);
  }

  function loop(now) {
    const dt = Math.min(0.04, n((now - (loop.last ?? now)) / 1000, 1 / 60));
    loop.last = now;
    elapsed += dt;
    frame += 1;
    tick(dt);
    draw();
    requestAnimationFrame(loop);
  }

  addEventListener("keydown", (event) => {
    keys.add(event.code);
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) event.preventDefault();
    if (event.code === "Backquote") console.log(window.GameHost.getState());
  });
  addEventListener("keyup", (event) => keys.delete(event.code));
  addEventListener("blur", () => keys.clear());
  addEventListener("resize", () => {
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, CONFIG.quality.pixelRatioMax));
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  });

  window.GameHost = {
    mode: "open-above-radial-terrain-v1",
    radialTerrain,
    renderer,
    scene,
    camera,
    getState: () => ({
      frame,
      elapsed,
      flight: clone(flight),
      radialTerrain: radialTerrain.getState(),
      descriptors: radialTerrain.getDescriptors(),
      validation: {
        booted: true,
        radialTerrainDescriptors: radialTerrain.getDescriptors().bands.length === 4,
        cameraRelativeOrigin: true,
        rendererConsumesDescriptors: true,
        webgpuDeferred: true
      }
    }),
    getValidationState() { return clone(this.getState().validation); }
  };
  window.GameHostV2 = window.GameHost;
  syncRadialTerrain();
  draw();
  requestAnimationFrame(loop);
}

boot().catch(fail);

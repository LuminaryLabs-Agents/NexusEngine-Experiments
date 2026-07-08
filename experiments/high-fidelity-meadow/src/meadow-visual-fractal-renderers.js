import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

function rgb(color = [1, 1, 1]) {
  return new THREE.Color(color[0] ?? 1, color[1] ?? 1, color[2] ?? 1);
}

function makeDisc(radius, color, opacity) {
  const geometry = new THREE.CircleGeometry(Math.max(0.1, radius), 32);
  geometry.rotateX(-Math.PI / 2);
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending
  });
  return new THREE.Mesh(geometry, material);
}

function makeSoftPlane(width, height, color, opacity) {
  const geometry = new THREE.PlaneGeometry(Math.max(0.1, width), Math.max(0.1, height), 1, 1);
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });
  return new THREE.Mesh(geometry, material);
}

function addGrassPatches(group, grassPatches = {}) {
  const layer = new THREE.Group();
  layer.name = "meadow.visual.grassPatches";
  for (const patch of grassPatches.patches ?? []) {
    const disc = makeDisc(patch.radius, rgb(patch.color), 0.08 + patch.density * 0.12);
    disc.name = patch.id;
    disc.position.set(patch.x, patch.y + 0.01, patch.z);
    disc.scale.set(1.0, 1.0, patch.shape === "tall-tuft" ? 0.62 : 0.82);
    disc.rotation.z = patch.windPhase;
    disc.userData = { descriptor: patch, baseOpacity: disc.material.opacity };
    layer.add(disc);
  }
  group.add(layer);
}

function addFlowerDrifts(group, flowerDrifts = {}) {
  const layer = new THREE.Group();
  layer.name = "meadow.visual.flowerDrifts";
  for (const drift of flowerDrifts.drifts ?? []) {
    const disc = makeDisc(drift.radius, rgb(drift.color), 0.16);
    disc.name = drift.id;
    disc.position.set(drift.x, drift.y + drift.lift, drift.z);
    disc.scale.set(1.25, 1.0, 0.72);
    disc.rotation.z = drift.phase;
    disc.userData = { descriptor: drift, baseOpacity: disc.material.opacity };
    layer.add(disc);
  }
  group.add(layer);
}

function addGrazingTrails(group, grazingTrails = {}) {
  const layer = new THREE.Group();
  layer.name = "meadow.visual.grazingTrails";
  const material = new THREE.LineBasicMaterial({ color: 0x2d3d1f, transparent: true, opacity: 0.42 });
  for (const trail of grazingTrails.trails ?? []) {
    const points = [new THREE.Vector3(trail.from.x, trail.from.y, trail.from.z), new THREE.Vector3(trail.to.x, trail.to.y, trail.to.z)];
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material.clone());
    line.name = trail.id;
    line.userData = { descriptor: trail, baseOpacity: 0.28 + trail.pressure * 0.4 };
    line.material.opacity = line.userData.baseOpacity;
    layer.add(line);
  }
  group.add(layer);
}

function addLightShafts(group, lightShafts = {}) {
  const layer = new THREE.Group();
  layer.name = "meadow.visual.lightShafts";
  for (const shaft of lightShafts.shafts ?? []) {
    const plane = makeSoftPlane(shaft.radius, shaft.height, new THREE.Color(1.0, 0.78 + shaft.warmth * 0.16, 0.42 + shaft.warmth * 0.16), shaft.opacity);
    plane.name = shaft.id;
    plane.position.set(shaft.x, shaft.y + shaft.height * 0.28, shaft.z);
    plane.rotation.set(-0.18, shaft.phase, 0.04);
    plane.userData = { descriptor: shaft, baseOpacity: shaft.opacity };
    layer.add(plane);
  }
  group.add(layer);
}

function addAtmosphericParallax(group, atmosphericParallax = {}) {
  const layer = new THREE.Group();
  layer.name = "meadow.visual.atmosphericParallax";
  for (const mist of atmosphericParallax.layers ?? []) {
    const disc = makeDisc(mist.radius, rgb(mist.tint), mist.opacity);
    disc.name = mist.id;
    disc.position.set(0, mist.y, -mist.radius * 0.18);
    disc.scale.set(1.2, 1.0, 0.38);
    disc.userData = { descriptor: mist, baseOpacity: mist.opacity };
    layer.add(disc);
  }
  group.add(layer);
}

function addDepthStrata(group, depthStrata = {}) {
  const layer = new THREE.Group();
  layer.name = "meadow.visual.depthStrata";
  for (const band of depthStrata.bands ?? []) {
    const ring = new THREE.RingGeometry(Math.max(0.1, band.radius * 0.94), Math.max(0.2, band.radius), 72, 1);
    ring.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(ring, new THREE.MeshBasicMaterial({ color: new THREE.Color(0.36 + band.colorBias, 0.42 + band.colorBias * 0.4, 0.22), transparent: true, opacity: 0.035 + band.haze * 0.08, depthWrite: false, side: THREE.DoubleSide }));
    mesh.name = `meadow.depth.${band.id}`;
    mesh.position.y = band.y + 0.025;
    mesh.userData = { descriptor: band, baseOpacity: mesh.material.opacity };
    layer.add(mesh);
  }
  group.add(layer);
}

export function createMeadowVisualFractalLayers(visualFractal = {}) {
  const group = new THREE.Group();
  group.name = "meadow.visualFractal.layers";
  const descriptors = visualFractal.descriptors ?? {};
  addDepthStrata(group, descriptors.depthStrata);
  addGrassPatches(group, descriptors.grassPatches);
  addFlowerDrifts(group, descriptors.flowerDrifts);
  addGrazingTrails(group, descriptors.grazingTrails);
  addLightShafts(group, descriptors.lightShafts);
  addAtmosphericParallax(group, descriptors.atmosphericParallax);
  group.userData = {
    source: "meadow-visual-fractal-domain-kit",
    rendererContract: visualFractal.rendererHandoff?.contract ?? "descriptors-only",
    counts: visualFractal.descriptorCounts ?? {}
  };
  return group;
}

export function updateMeadowVisualFractalLayers(group, cycle = {}, time = 0) {
  if (!group) return;
  const warm = Number(cycle.light?.warmRim ?? 0.3);
  const day = Number(cycle.light?.dayAmount ?? 0.6);
  group.traverse((node) => {
    if (!node.material || !node.userData) return;
    const base = Number(node.userData.baseOpacity ?? node.material.opacity ?? 0.1);
    const pulse = Math.sin(time * 0.35 + Number(node.userData.descriptor?.phase ?? node.userData.descriptor?.pulse ?? 0)) * 0.08;
    if (node.name.includes("lightShaft")) node.material.opacity = Math.max(0.01, base * (0.72 + warm * 0.9 + pulse));
    else if (node.name.includes("mistLayer")) node.material.opacity = Math.max(0.008, base * (1.18 - day * 0.45 + pulse));
    else node.material.opacity = Math.max(0.01, base * (0.92 + warm * 0.16 + pulse));
  });
}

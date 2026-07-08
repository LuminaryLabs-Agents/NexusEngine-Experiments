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

function makeLine(points, color, opacity) {
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material);
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

function addPollinatorRoutes(group, pollinatorRoutes = {}) {
  const layer = new THREE.Group();
  layer.name = "meadow.ecology.pollinatorRoutes";
  for (const route of pollinatorRoutes.routes ?? []) {
    const points = [new THREE.Vector3(route.from.x, route.from.y, route.from.z), new THREE.Vector3((route.from.x + route.to.x) * 0.5, Math.max(route.from.y, route.to.y) + 0.7 + route.arc, (route.from.z + route.to.z) * 0.5), new THREE.Vector3(route.to.x, route.to.y, route.to.z)];
    const line = makeLine(points, 0xffdf74, 0.12 + route.density * 0.26);
    line.name = route.id;
    line.userData = { descriptor: route, baseOpacity: line.material.opacity };
    layer.add(line);
  }
  group.add(layer);
}

function addShepherdPaths(group, shepherdPaths = {}) {
  const layer = new THREE.Group();
  layer.name = "meadow.ecology.shepherdPaths";
  for (const path of shepherdPaths.paths ?? []) {
    const line = makeLine((path.points ?? []).map((point) => new THREE.Vector3(point.x, point.y + 0.03, point.z)), 0x6b5d31, 0.22 + path.urgency * 0.24);
    line.name = path.id;
    line.userData = { descriptor: path, baseOpacity: line.material.opacity };
    layer.add(line);
  }
  group.add(layer);
}

function addRestSpots(group, restSpots = {}) {
  const layer = new THREE.Group();
  layer.name = "meadow.ecology.restSpots";
  for (const spot of restSpots.spots ?? []) {
    const disc = makeDisc(spot.radius, new THREE.Color(0.32, 0.45 + spot.calm * 0.12, 0.22), 0.08 + spot.calm * 0.1);
    disc.name = spot.id;
    disc.position.set(spot.x, spot.y + 0.012, spot.z);
    disc.scale.set(1.2, 1, 0.62);
    disc.rotation.z = spot.phase;
    disc.userData = { descriptor: spot, baseOpacity: disc.material.opacity };
    layer.add(disc);
  }
  group.add(layer);
}

function addWindLanes(group, windLanes = {}) {
  const layer = new THREE.Group();
  layer.name = "meadow.ecology.windLanes";
  for (const lane of windLanes.lanes ?? []) {
    const line = makeLine([new THREE.Vector3(lane.from.x, lane.from.y, lane.from.z), new THREE.Vector3(lane.to.x, lane.to.y, lane.to.z)], 0xcbe9b2, 0.07 + lane.speed * 0.16);
    line.name = lane.id;
    line.userData = { descriptor: lane, baseOpacity: line.material.opacity };
    layer.add(line);
  }
  group.add(layer);
}

function addSeasonalBloomQueue(group, seasonalBloomQueue = {}) {
  const layer = new THREE.Group();
  layer.name = "meadow.ecology.seasonalBloomQueue";
  for (const bloom of seasonalBloomQueue.blooms ?? []) {
    const ring = new THREE.RingGeometry(Math.max(0.05, bloom.radius * 0.72), Math.max(0.1, bloom.radius), 28, 1);
    ring.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(ring, new THREE.MeshBasicMaterial({ color: rgb(bloom.color), transparent: true, opacity: 0.12 + bloom.openness * 0.18, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
    mesh.name = bloom.id;
    mesh.position.set(bloom.x, bloom.y + 0.02, bloom.z);
    mesh.userData = { descriptor: bloom, baseOpacity: mesh.material.opacity };
    layer.add(mesh);
  }
  group.add(layer);
}

function addAttentionBeacons(group, attentionBeacons = {}) {
  const layer = new THREE.Group();
  layer.name = "meadow.ecology.attentionBeacons";
  for (const beacon of attentionBeacons.beacons ?? []) {
    const plane = makeSoftPlane(beacon.radius * 0.42, beacon.radius * 1.6, new THREE.Color(1.0, 0.86, 0.52), 0.055 + beacon.priority * 0.06);
    plane.name = beacon.id;
    plane.position.set(beacon.x, beacon.y + beacon.radius * 0.5, beacon.z);
    plane.rotation.set(0, beacon.phase * Math.PI * 2, 0);
    plane.userData = { descriptor: beacon, baseOpacity: plane.material.opacity };
    layer.add(plane);
  }
  group.add(layer);
}

function addGrazingRouteScores(group, grazingRouteScores = {}) {
  const layer = new THREE.Group();
  layer.name = "meadow.pasture.grazingRouteScores";
  for (const route of grazingRouteScores.routes ?? []) {
    const mid = new THREE.Vector3((route.from.x + route.to.x) * 0.5, Math.max(route.from.y, route.to.y) + 0.18 + route.score * 0.42, (route.from.z + route.to.z) * 0.5);
    const line = makeLine([new THREE.Vector3(route.from.x, route.from.y + 0.04, route.from.z), mid, new THREE.Vector3(route.to.x, route.to.y + 0.04, route.to.z)], 0xe0d36b, 0.12 + route.score * 0.28);
    line.name = route.id;
    line.userData = { descriptor: route, baseOpacity: line.material.opacity };
    layer.add(line);
  }
  group.add(layer);
}

function addForagePatchPriorities(group, foragePatchPriorities = {}) {
  const layer = new THREE.Group();
  layer.name = "meadow.pasture.foragePatchPriorities";
  for (const patch of foragePatchPriorities.patches ?? []) {
    const disc = makeDisc(patch.radius, rgb(patch.color), 0.07 + patch.priority * 0.14);
    disc.name = patch.id;
    disc.position.set(patch.x, patch.y + 0.018, patch.z);
    disc.scale.set(1.28, 1.0, 0.64);
    disc.rotation.z = patch.phase * Math.PI * 2;
    disc.userData = { descriptor: patch, baseOpacity: disc.material.opacity };
    layer.add(disc);
  }
  group.add(layer);
}

function addSheepComfortArcs(group, sheepComfortArcs = {}) {
  const layer = new THREE.Group();
  layer.name = "meadow.pasture.sheepComfortArcs";
  for (const arc of sheepComfortArcs.arcs ?? []) {
    const ring = new THREE.RingGeometry(Math.max(0.08, arc.radius * 0.82), Math.max(0.12, arc.radius), 36, 1);
    ring.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(ring, new THREE.MeshBasicMaterial({ color: new THREE.Color(0.82, 0.9, 0.58), transparent: true, opacity: 0.045 + arc.comfort * 0.075, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
    mesh.name = arc.id;
    mesh.position.set(arc.x, arc.y + 0.018, arc.z);
    mesh.rotation.z = (arc.yawStart + arc.yawEnd) * 0.5;
    mesh.userData = { descriptor: arc, baseOpacity: mesh.material.opacity };
    layer.add(mesh);
  }
  group.add(layer);
}

function addWaterTroughThreads(group, waterTroughThreads = {}) {
  const layer = new THREE.Group();
  layer.name = "meadow.pasture.waterTroughThreads";
  for (const thread of waterTroughThreads.threads ?? []) {
    const line = makeLine([new THREE.Vector3(thread.from.x, thread.from.y + 0.05, thread.from.z), new THREE.Vector3(thread.to.x, thread.to.y + 0.05, thread.to.z)], 0x96d5d9, 0.08 + thread.urgency * 0.22);
    line.name = thread.id;
    line.userData = { descriptor: thread, baseOpacity: line.material.opacity };
    layer.add(line);
  }
  group.add(layer);
}

function addGateReturnCues(group, gateReturnCues = {}) {
  const layer = new THREE.Group();
  layer.name = "meadow.pasture.gateReturnCues";
  for (const cue of gateReturnCues.cues ?? []) {
    const plane = makeSoftPlane(cue.radius * 0.4, cue.radius * 1.35, new THREE.Color(0.98, 0.78, 0.44), 0.052 + cue.priority * 0.085);
    plane.name = cue.id;
    plane.position.set(cue.x, cue.y + cue.radius * 0.36, cue.z);
    plane.rotation.set(0, cue.phase * Math.PI * 2, 0);
    plane.userData = { descriptor: cue, baseOpacity: plane.material.opacity };
    layer.add(plane);
  }
  group.add(layer);
}

function addWeatherShelterBands(group, weatherShelterBands = {}) {
  const layer = new THREE.Group();
  layer.name = "meadow.pasture.weatherShelterBands";
  for (const band of weatherShelterBands.bands ?? []) {
    const ring = new THREE.RingGeometry(Math.max(0.1, band.radius * 0.74), Math.max(0.18, band.radius), 54, 1);
    ring.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(ring, new THREE.MeshBasicMaterial({ color: new THREE.Color(0.54, 0.66, 0.42), transparent: true, opacity: 0.035 + band.shelter * 0.08 + band.pressure * 0.035, depthWrite: false, side: THREE.DoubleSide }));
    mesh.name = band.id;
    mesh.position.set(band.x, band.y + 0.02, band.z);
    mesh.rotation.z = band.phase * Math.PI * 2;
    mesh.userData = { descriptor: band, baseOpacity: mesh.material.opacity };
    layer.add(mesh);
  }
  group.add(layer);
}

export function createMeadowVisualFractalLayers(visualFractal = {}, ecologyReadability = {}, pastureRouteReadability = {}) {
  const group = new THREE.Group();
  group.name = "meadow.visualFractal.layers";
  const descriptors = visualFractal.descriptors ?? {};
  const ecologyDescriptors = ecologyReadability.descriptors ?? {};
  const pastureDescriptors = pastureRouteReadability.descriptors ?? {};
  addDepthStrata(group, descriptors.depthStrata);
  addGrassPatches(group, descriptors.grassPatches);
  addFlowerDrifts(group, descriptors.flowerDrifts);
  addGrazingTrails(group, descriptors.grazingTrails);
  addLightShafts(group, descriptors.lightShafts);
  addAtmosphericParallax(group, descriptors.atmosphericParallax);
  addPollinatorRoutes(group, ecologyDescriptors.pollinatorRoutes);
  addShepherdPaths(group, ecologyDescriptors.shepherdPaths);
  addRestSpots(group, ecologyDescriptors.restSpots);
  addWindLanes(group, ecologyDescriptors.windLanes);
  addSeasonalBloomQueue(group, ecologyDescriptors.seasonalBloomQueue);
  addAttentionBeacons(group, ecologyDescriptors.attentionBeacons);
  addGrazingRouteScores(group, pastureDescriptors.grazingRouteScores);
  addForagePatchPriorities(group, pastureDescriptors.foragePatchPriorities);
  addSheepComfortArcs(group, pastureDescriptors.sheepComfortArcs);
  addWaterTroughThreads(group, pastureDescriptors.waterTroughThreads);
  addGateReturnCues(group, pastureDescriptors.gateReturnCues);
  addWeatherShelterBands(group, pastureDescriptors.weatherShelterBands);
  group.userData = {
    source: "meadow-visual-fractal-ecology-and-pasture-route-readability-domain-kits",
    rendererContract: pastureRouteReadability.rendererHandoff?.contract ?? ecologyReadability.rendererHandoff?.contract ?? visualFractal.rendererHandoff?.contract ?? "descriptors-only",
    counts: {
      visualFractal: visualFractal.descriptorCounts ?? {},
      ecologyReadability: ecologyReadability.descriptorCounts ?? {},
      pastureRouteReadability: pastureRouteReadability.descriptorCounts ?? {}
    }
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
    else if (node.name.includes("pollinatorRoute")) node.material.opacity = Math.max(0.01, base * (0.82 + day * 0.34 + pulse));
    else if (node.name.includes("windLane")) node.material.opacity = Math.max(0.008, base * (0.85 + warm * 0.22 + pulse));
    else if (node.name.includes("attentionBeacon")) node.material.opacity = Math.max(0.01, base * (0.9 + warm * 0.38 + pulse));
    else if (node.name.includes("pasture")) node.material.opacity = Math.max(0.01, base * (0.88 + warm * 0.24 + pulse));
    else node.material.opacity = Math.max(0.01, base * (0.92 + warm * 0.16 + pulse));
  });
}

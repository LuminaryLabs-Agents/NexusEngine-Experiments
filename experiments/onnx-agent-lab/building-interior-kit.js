export function createBuildingInteriorKit(THREE, helpers) {
  const { addMesh, boxGeo, tubeGeo, gearGeo, planeGeo, materials } = helpers;

  const navBounds = { minX: -5.85, maxX: 5.85, minZ: -6.35, maxZ: 4.85 };
  const obstacles = [
    { x: -3.05, z: -1.2, w: 2.35, d: 1.35, label: "left workbench" },
    { x: 2.95, z: -1.35, w: 2.35, d: 1.35, label: "right workbench" },
    { x: -3.95, z: 2.45, w: 1.1, d: 1.8, label: "lumber shelf" },
    { x: 3.85, z: 2.15, w: 1.15, d: 2.1, label: "tool shelf" },
    { x: 0, z: -4.75, w: 2.25, d: 1.2, label: "back cabinet" },
    { x: 0, z: .35, w: 1.15, d: 1.15, label: "central table" }
  ];

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  function sign(text, color = "#d9c08a") {
    const canvas = document.createElement("canvas");
    canvas.width = 512; canvas.height = 192;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(16, 13, 9, .88)"; roundRect(ctx, 14, 14, 484, 164, 28); ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = "#f4ead0"; ctx.font = "800 36px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const words = text.split(" "), lines = []; let line = "";
    for (const word of words) { const next = `${line} ${word}`.trim(); if (next.length > 18 && line) { lines.push(line); line = word; } else line = next; }
    if (line) lines.push(line);
    lines.slice(0, 3).forEach((item, index) => ctx.fillText(item, 256, 70 + index * 43));
    const texture = new THREE.CanvasTexture(canvas); texture.anisotropy = 8;
    return new THREE.Mesh(planeGeo(1.55, .58), new THREE.MeshBasicMaterial({ map: texture, transparent: true }));
  }

  function addWall(parent, x, y, z, w, h, d, material = materials.wall) { return addMesh(parent, boxGeo(w, h, d), material, { x, y, z }); }

  function addShelf(parent, x, z, rot = 0, kind = "tools") {
    const shelf = new THREE.Group(); shelf.position.set(x, 0, z); shelf.rotation.y = rot; parent.add(shelf);
    addMesh(shelf, boxGeo(1.18, 1.9, .22), materials.darkWood, { y: .95 });
    for (const y of [.42, .9, 1.38]) addMesh(shelf, boxGeo(1.28, .07, .35), materials.wood, { y });
    for (let i = 0; i < 7; i++) {
      const mat = kind === "lumber" ? materials.wood : i % 3 === 0 ? materials.paper : i % 3 === 1 ? materials.brass : materials.metal;
      addMesh(shelf, boxGeo(.08, .34 + (i % 2) * .1, .16), mat, { x: -.48 + i * .16, y: .58, z: .03 });
    }
    return shelf;
  }

  function addWorkbench(parent, x, z, rot = 0) {
    const bench = new THREE.Group(); bench.position.set(x, 0, z); bench.rotation.y = rot; parent.add(bench);
    addMesh(bench, boxGeo(2.35, .14, 1.12), materials.wood, { y: .82 });
    for (const sx of [-.98, .98]) for (const sz of [-.42, .42]) addMesh(bench, boxGeo(.12, .82, .12), materials.darkWood, { x: sx, y: .39, z: sz });
    addMesh(bench, boxGeo(1.8, .08, .15), materials.darkWood, { y: 1.06, z: -.49 });
    addMesh(bench, boxGeo(.36, .22, .3), materials.metal, { x: -.66, y: 1.02, z: -.16 });
    addMesh(bench, tubeGeo(.58, .035), materials.brass, { x: .28, y: 1.02, z: .26 }, { z: .45 });
    addMesh(bench, gearGeo(16, .13, .23, .055), materials.metal, { x: .74, y: 1.05, z: -.08 }, { x: Math.PI / 2 });
    return bench;
  }

  function addBackCabinet(parent, x, z) {
    const cabinet = new THREE.Group(); cabinet.position.set(x, 0, z); parent.add(cabinet);
    addMesh(cabinet, boxGeo(2.25, 1.2, .42), materials.darkWood, { y: .6 });
    addMesh(cabinet, boxGeo(1.95, .08, .5), materials.wood, { y: 1.24 });
    addMesh(cabinet, boxGeo(.72, .36, .06), materials.paper, { x: -.5, y: .92, z: .25 });
    addMesh(cabinet, boxGeo(.72, .36, .06), materials.paper, { x: .5, y: .92, z: .25 });
    return cabinet;
  }

  function addCentralTable(parent) {
    const table = new THREE.Group(); parent.add(table);
    addMesh(table, boxGeo(1.35, .12, 1.15), materials.wood, { y: .78, z: .35 });
    for (const x of [-.52, .52]) for (const z of [-.05, .76]) addMesh(table, boxGeo(.12, .75, .12), materials.darkWood, { x, y: .38, z });
    addMesh(table, boxGeo(.76, .06, .52), materials.paper, { y: .88, z: .35 });
    addMesh(table, tubeGeo(.48, .018), materials.metal, { x: .35, y: .94, z: .16 }, { z: Math.PI / 2 });
    return table;
  }

  function addFloorGrid(parent) {
    for (let x = -5.5; x <= 5.5; x += 1) addMesh(parent, boxGeo(.025, .012, 11.4), materials.floorTrim, { x, y: .016, z: -.75 });
    for (let z = -6.1; z <= 4.65; z += 1) addMesh(parent, boxGeo(11.9, .012, .025), materials.floorTrim, { y: .018, z });
  }

  function build(scene) {
    const root = new THREE.Group(); root.name = "BuildingInteriorKitRoot"; scene.add(root);
    scene.background = new THREE.Color(0x090908); scene.fog = new THREE.Fog(0x090908, 9.5, 19);
    const hemi = new THREE.HemisphereLight(0xd8d2b6, 0x1f170f, 1.55); root.add(hemi);
    const sun = new THREE.DirectionalLight(0xffdfac, 2.05); sun.position.set(-4.5, 7, 3.5); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); root.add(sun);
    addMesh(root, boxGeo(12.4, .12, 11.8), materials.floor, { y: -.06, z: -.75 }); addFloorGrid(root);
    addWall(root, 0, 1.55, -6.7, 12.5, 3.1, .18); addWall(root, -6.2, 1.55, -.75, .18, 3.1, 11.9); addWall(root, 6.2, 1.55, -.75, .18, 3.1, 11.9);
    addWall(root, -3.9, 1.55, 5.15, 4.6, 3.1, .18); addWall(root, 3.9, 1.55, 5.15, 4.6, 3.1, .18);
    addWall(root, -2.7, 1.55, -2.55, 3.2, 3.1, .16, materials.partition); addWall(root, 2.7, 1.55, -2.55, 3.2, 3.1, .16, materials.partition); addWall(root, 0, 2.75, -2.55, 1.6, .72, .16, materials.partition);
    addMesh(root, boxGeo(12.2, .1, .16), materials.trim, { y: 1.02, z: -6.55 }); addMesh(root, boxGeo(.16, .1, 11.5), materials.trim, { x: -6.05, y: 1.02, z: -.8 }); addMesh(root, boxGeo(.16, .1, 11.5), materials.trim, { x: 6.05, y: 1.02, z: -.8 });
    for (const x of [-4.7, -1.55, 1.55, 4.7]) { const lamp = new THREE.PointLight(0xffd997, 1.35, 4.2); lamp.position.set(x, 2.45, -4.95); root.add(lamp); addMesh(root, boxGeo(.42, .08, .42), materials.goldGlow, { x, y: 2.33, z: -4.95 }); }
    addWorkbench(root, -3.05, -1.2, .05); addWorkbench(root, 2.95, -1.35, -.08); addShelf(root, -4.05, 2.45, Math.PI / 2, "lumber"); addShelf(root, 4.05, 2.15, -Math.PI / 2, "tools"); addBackCabinet(root, 0, -4.75); addCentralTable(root);
    const title = sign("Workshop Assistant"); title.position.set(-2.05, 2.05, -6.58); root.add(title);
    const inspect = sign("Click a tool to inspect", "#83dcff"); inspect.position.set(2.05, 2.05, -6.58); root.add(inspect);
    return { root, navBounds, obstacles };
  }

  function constrainPlayer(position, previous) {
    position.x = Math.max(navBounds.minX, Math.min(navBounds.maxX, position.x)); position.z = Math.max(navBounds.minZ, Math.min(navBounds.maxZ, position.z));
    for (const obstacle of obstacles) {
      const insideX = Math.abs(position.x - obstacle.x) < obstacle.w * .5 + .28;
      const insideZ = Math.abs(position.z - obstacle.z) < obstacle.d * .5 + .28;
      if (!insideX || !insideZ) continue;
      if (previous) { position.x = previous.x; position.z = previous.z; }
      else { const dx = position.x - obstacle.x, dz = position.z - obstacle.z; if (Math.abs(dx / obstacle.w) > Math.abs(dz / obstacle.d)) position.x = obstacle.x + Math.sign(dx || 1) * (obstacle.w * .5 + .28); else position.z = obstacle.z + Math.sign(dz || 1) * (obstacle.d * .5 + .28); }
    }
    position.y = 1.58; return position;
  }

  function describeRoom(position) {
    if (position.z < -3.05) return "You are by the rear cabinet and notes wall.";
    if (position.x < -2.1) return "You are in the left workbench area with cutting and fastening tools.";
    if (position.x > 2.1) return "You are in the right workbench area with measuring, holding, and finishing tools.";
    if (position.z > 2.1) return "You are near shelves for lumber, storage, and spare parts.";
    return "You are in the central workshop. Click a tool to inspect it.";
  }

  return { id: "building-interior-kit", label: "Building Interior Kit", build, constrainPlayer, describeRoom, navBounds, obstacles };
}

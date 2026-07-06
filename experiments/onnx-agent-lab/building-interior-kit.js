export function createBuildingInteriorKit(THREE, helpers) {
  const { addMesh, boxGeo, tubeGeo, gearGeo, helixGeo, planeGeo, materials } = helpers;

  const navBounds = {
    minX: -5.85,
    maxX: 5.85,
    minZ: -6.35,
    maxZ: 4.85,
  };

  const obstacles = [
    { x: -3.05, z: -1.2, w: 2.1, d: 1.3, label: "left workbench" },
    { x: 2.95, z: -1.35, w: 2.1, d: 1.35, label: "right instrument bench" },
    { x: -3.95, z: 2.45, w: 1.1, d: 1.8, label: "archive shelf" },
    { x: 3.85, z: 2.15, w: 1.15, d: 2.1, label: "parts shelf" },
    { x: 0, z: -4.75, w: 2.25, d: 1.2, label: "context console" },
    { x: 0, z: .35, w: 1.15, d: 1.15, label: "central table" },
  ];

  const proceduralObjects = [
    { id: "interior-archive-notes", label: "Archive Notes", kind: "document stack", position: { x: -4.15, y: 1.45, z: 2.05 }, context: "A stack of project notes. It summarizes which ONNX objects have stable graph roles and which ones are just physical metaphors." },
    { id: "interior-pipe-loop", label: "Pipe Loop", kind: "routing pipe", position: { x: 4.05, y: 1.25, z: 1.25 }, context: "A small routing loop. It represents how tensor outputs can be carried forward without exposing raw agent logs in the scene." },
    { id: "interior-console-core", label: "Context Console", kind: "console", position: { x: 0, y: 1.2, z: -4.38 }, context: "The console is the quiet agent surface. It answers about the current room, selected prop, and ONNX workflow without showing internal logs." },
    { id: "interior-spool-a", label: "Cable Spool", kind: "cable spool", position: { x: -1.95, y: .32, z: 3.75 }, context: "A cable spool for graph wiring. In this lab it stands for explicit data paths between selected tools." },
    { id: "interior-spool-b", label: "Signal Coil", kind: "signal coil", position: { x: 1.95, y: .32, z: 3.65 }, context: "A signal coil. It marks a reusable input/output loop for future agent or ONNX domains." },
    { id: "interior-cup", label: "Workbench Cup", kind: "small prop", position: { x: -3.55, y: 1.1, z: -1.5 }, context: "A tiny environmental prop. It exists to make the room feel inhabited instead of looking like a raw debug scene." },
    { id: "interior-box-a", label: "Parts Box", kind: "parts box", position: { x: 3.2, y: 1.05, z: -.85 }, context: "A parts box containing small reusable pieces for procedural kit composition." },
    { id: "interior-meter", label: "Wall Meter", kind: "meter", position: { x: -5.75, y: 1.75, z: -.55 }, context: "A wall meter. It gives contextual information about signal flow without rendering the agent's internal trace." },
    { id: "interior-map", label: "Room Map", kind: "map", position: { x: 5.74, y: 1.7, z: -.35 }, context: "A small room map showing the playable floor plan and the two side work areas." },
    { id: "interior-tool-tray", label: "Tool Tray", kind: "tray", position: { x: .05, y: .86, z: .35 }, context: "The central tray groups selected objects. Use it as the physical context anchor for the assistant answer." },
  ];

  function plaque(text, color = "#d9c08a") {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 192;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(16, 13, 9, .9)";
    roundRect(ctx, 14, 14, 484, 164, 28);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.fillStyle = "#f4ead0";
    ctx.font = "800 34px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const words = text.split(" ");
    const lines = [];
    let line = "";
    for (const word of words) {
      const candidate = `${line} ${word}`.trim();
      if (candidate.length > 20 && line) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    if (line) lines.push(line);
    lines.slice(0, 3).forEach((l, i) => ctx.fillText(l, 256, 72 + i * 42));
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 8;
    return new THREE.Mesh(planeGeo(1.55, .58), new THREE.MeshBasicMaterial({ map: texture, transparent: true }));
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function addWall(parent, x, y, z, w, h, d, material = materials.wall) {
    return addMesh(parent, boxGeo(w, h, d), material, { x, y, z });
  }

  function addShelf(parent, x, z, rot = 0) {
    const shelf = new THREE.Group();
    shelf.position.set(x, 0, z);
    shelf.rotation.y = rot;
    parent.add(shelf);
    addMesh(shelf, boxGeo(1.18, 1.9, .22), materials.darkWood, { y: .95 });
    for (const y of [.42, .9, 1.38]) addMesh(shelf, boxGeo(1.28, .07, .35), materials.wood, { y });
    for (let i = 0; i < 7; i++) {
      const px = -.48 + i * .16;
      const colorMat = i % 3 === 0 ? materials.paper : i % 3 === 1 ? materials.brass : materials.metal;
      addMesh(shelf, boxGeo(.08, .34 + (i % 2) * .1, .16), colorMat, { x: px, y: .58, z: .03 });
    }
    return shelf;
  }

  function addWorkbench(parent, x, z, rot = 0) {
    const bench = new THREE.Group();
    bench.position.set(x, 0, z);
    bench.rotation.y = rot;
    parent.add(bench);
    addMesh(bench, boxGeo(2.3, .14, 1.12), materials.wood, { y: .82 });
    for (const sx of [-.95, .95]) for (const sz of [-.42, .42]) addMesh(bench, boxGeo(.12, .82, .12), materials.darkWood, { x: sx, y: .39, z: sz });
    addMesh(bench, boxGeo(.42, .28, .35), materials.metal, { x: -.55, y: 1.02, z: -.18 });
    addMesh(bench, tubeGeo(.58, .035), materials.brass, { x: .26, y: 1.02, z: .26 }, { z: .45 });
    addMesh(bench, gearGeo(16, .13, .23, .055), materials.metal, { x: .73, y: 1.05, z: -.08 }, { x: Math.PI / 2 });
    return bench;
  }

  function addConsole(parent, x, z) {
    const c = new THREE.Group();
    c.position.set(x, 0, z);
    parent.add(c);
    addMesh(c, boxGeo(2.2, .78, .66), materials.darkWood, { y: .4 });
    addMesh(c, boxGeo(1.65, .62, .08), materials.glass, { y: 1.03, z: .25 }, { x: -.25 });
    addMesh(c, boxGeo(.42, .08, .22), materials.greenGlow, { x: -.52, y: .84, z: -.22 });
    addMesh(c, boxGeo(.42, .08, .22), materials.blueGlow, { x: 0, y: .84, z: -.22 });
    addMesh(c, boxGeo(.42, .08, .22), materials.goldGlow, { x: .52, y: .84, z: -.22 });
    const sign = plaque("Context answers only");
    sign.position.set(0, 1.78, .3);
    sign.rotation.x = -.22;
    c.add(sign);
    return c;
  }

  function addCentralTable(parent) {
    const t = new THREE.Group();
    parent.add(t);
    addMesh(t, boxGeo(1.35, .12, 1.15), materials.wood, { y: .78, z: .35 });
    addMesh(t, boxGeo(.12, .75, .12), materials.darkWood, { x: -.52, y: .38, z: -.05 });
    addMesh(t, boxGeo(.12, .75, .12), materials.darkWood, { x: .52, y: .38, z: -.05 });
    addMesh(t, boxGeo(.12, .75, .12), materials.darkWood, { x: -.52, y: .38, z: .76 });
    addMesh(t, boxGeo(.12, .75, .12), materials.darkWood, { x: .52, y: .38, z: .76 });
    addMesh(t, boxGeo(.76, .06, .52), materials.paper, { y: .88, z: .35 });
    addMesh(t, helixGeo(6, .11, .034, .018, 96), materials.blueGlow, { x: .36, y: .95, z: .25 }, { z: Math.PI / 2 });
    return t;
  }

  function addProceduralObjectMesh(parent, item) {
    const g = new THREE.Group();
    g.position.set(item.position.x, item.position.y, item.position.z);
    g.userData.contextObjectId = item.id;
    g.userData.contextObject = item;

    if (item.kind === "document stack") {
      for (let i = 0; i < 4; i++) addMesh(g, boxGeo(.55, .025, .36), materials.paper, { y: i * .035, z: i * .015 }, { y: (i - 2) * .04 });
    } else if (item.kind === "routing pipe") {
      addMesh(g, tubeGeo(.68, .035), materials.metal, {}, { z: Math.PI / 2 });
      addMesh(g, gearGeo(12, .09, .16, .035), materials.brass, { x: -.36 }, { z: Math.PI / 2 });
      addMesh(g, gearGeo(12, .09, .16, .035), materials.brass, { x: .36 }, { z: Math.PI / 2 });
    } else if (item.kind === "console") {
      addMesh(g, boxGeo(.62, .36, .18), materials.glass, {}, { x: -.15 });
      addMesh(g, boxGeo(.5, .04, .2), materials.blueGlow, { y: .23 });
    } else if (item.kind.includes("spool") || item.kind.includes("coil")) {
      addMesh(g, gearGeo(22, .22, .34, .16), materials.rubber, {}, { x: Math.PI / 2 });
      addMesh(g, tubeGeo(.42, .04), materials.metal, {}, { z: Math.PI / 2 });
    } else if (item.kind === "small prop") {
      addMesh(g, tubeGeo(.28, .09), materials.brass, {}, { z: Math.PI / 2 });
      addMesh(g, boxGeo(.18, .04, .18), materials.paper, { y: .16 });
    } else if (item.kind === "parts box") {
      addMesh(g, boxGeo(.5, .26, .38), materials.darkWood);
      addMesh(g, boxGeo(.46, .04, .34), materials.metal, { y: .17 });
    } else if (item.kind === "meter") {
      addMesh(g, boxGeo(.08, .44, .44), materials.paper);
      addMesh(g, tubeGeo(.28, .01), materials.redGlow, { x: -.045 }, { z: .55 });
    } else if (item.kind === "map") {
      addMesh(g, boxGeo(.08, .46, .6), materials.paper);
      addMesh(g, boxGeo(.09, .08, .16), materials.blueGlow, { y: -.07, z: .08 });
      addMesh(g, boxGeo(.09, .08, .16), materials.goldGlow, { y: .11, z: -.1 });
    } else {
      addMesh(g, boxGeo(.62, .08, .38), materials.darkWood);
      addMesh(g, boxGeo(.48, .035, .28), materials.metal, { y: .07 });
    }

    g.traverse((node) => {
      if (node.isMesh) {
        node.userData.contextObjectId = item.id;
        node.userData.contextObject = item;
      }
    });
    parent.add(g);
    return g;
  }

  function build(scene) {
    const root = new THREE.Group();
    root.name = "BuildingInteriorKitRoot";
    scene.add(root);

    scene.background = new THREE.Color(0x090908);
    scene.fog = new THREE.Fog(0x090908, 8.5, 18);

    const hemi = new THREE.HemisphereLight(0xd8d2b6, 0x1f170f, 1.55);
    root.add(hemi);
    const sun = new THREE.DirectionalLight(0xffdfac, 2.1);
    sun.position.set(-4.5, 7, 3.5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    root.add(sun);

    const floor = addMesh(root, boxGeo(12.4, .12, 11.8), materials.floor, { y: -.06, z: -.75 });
    floor.name = "walkable floor";
    addMesh(root, boxGeo(12.4, .1, 11.8), materials.floorTrim, { y: .01, z: -.75 }, {}, { x: 1, y: 1, z: 1 });

    addWall(root, 0, 1.55, -6.7, 12.5, 3.1, .18);
    addWall(root, -6.2, 1.55, -.75, .18, 3.1, 11.9);
    addWall(root, 6.2, 1.55, -.75, .18, 3.1, 11.9);
    addWall(root, -3.9, 1.55, 5.15, 4.6, 3.1, .18);
    addWall(root, 3.9, 1.55, 5.15, 4.6, 3.1, .18);
    addWall(root, -2.7, 1.55, -2.55, 3.2, 3.1, .16, materials.partition);
    addWall(root, 2.7, 1.55, -2.55, 3.2, 3.1, .16, materials.partition);
    addWall(root, 0, 2.75, -2.55, 1.6, .72, .16, materials.partition);

    addMesh(root, boxGeo(12.2, .1, .16), materials.trim, { y: 1.02, z: -6.55 });
    addMesh(root, boxGeo(.16, .1, 11.5), materials.trim, { x: -6.05, y: 1.02, z: -.8 });
    addMesh(root, boxGeo(.16, .1, 11.5), materials.trim, { x: 6.05, y: 1.02, z: -.8 });

    for (const x of [-4.7, -1.55, 1.55, 4.7]) {
      const lamp = new THREE.PointLight(0xffd997, 1.35, 4.2);
      lamp.position.set(x, 2.45, -4.95);
      root.add(lamp);
      addMesh(root, boxGeo(.42, .08, .42), materials.goldGlow, { x, y: 2.33, z: -4.95 });
    }
    const blueLamp = new THREE.PointLight(0x83dcff, 1.2, 4.4);
    blueLamp.position.set(0, 1.7, -4.4);
    root.add(blueLamp);

    addWorkbench(root, -3.05, -1.2, .05);
    addWorkbench(root, 2.95, -1.35, -.08);
    addShelf(root, -4.05, 2.45, Math.PI / 2);
    addShelf(root, 4.05, 2.15, -Math.PI / 2);
    addConsole(root, 0, -4.75);
    addCentralTable(root);

    const plaqueA = plaque("Building Interior Kit");
    plaqueA.position.set(-2.05, 2.05, -6.58);
    root.add(plaqueA);
    const plaqueB = plaque("Click props for context", "#83dcff");
    plaqueB.position.set(2.05, 2.05, -6.58);
    root.add(plaqueB);

    const propMeshes = proceduralObjects.map((item) => addProceduralObjectMesh(root, item));
    return { root, propMeshes, proceduralObjects, navBounds, obstacles };
  }

  function constrainPlayer(position, previous) {
    position.x = Math.max(navBounds.minX, Math.min(navBounds.maxX, position.x));
    position.z = Math.max(navBounds.minZ, Math.min(navBounds.maxZ, position.z));

    for (const o of obstacles) {
      const insideX = Math.abs(position.x - o.x) < o.w * .5 + .28;
      const insideZ = Math.abs(position.z - o.z) < o.d * .5 + .28;
      if (!insideX || !insideZ) continue;
      if (previous) {
        position.x = previous.x;
        position.z = previous.z;
      } else {
        const dx = position.x - o.x;
        const dz = position.z - o.z;
        if (Math.abs(dx / o.w) > Math.abs(dz / o.d)) position.x = o.x + Math.sign(dx || 1) * (o.w * .5 + .28);
        else position.z = o.z + Math.sign(dz || 1) * (o.d * .5 + .28);
      }
    }
    position.y = 1.58;
    return position;
  }

  function describeRoom(position) {
    if (position.z < -3.05) return "You are in the rear context bay. The console can answer about selected props and ONNX workflow state without showing agent logs.";
    if (position.x < -2.1) return "You are in the left work area. This side is set up for physical tools, notes, and graph-building metaphors.";
    if (position.x > 2.1) return "You are in the right instrument area. This side is set up for meters, routing props, and small procedural objects.";
    if (position.z > 2.1) return "You are near the archive shelves and spare signal parts.";
    return "You are in the central walkable interior. Click an object to get contextual information.";
  }

  function getContextAnswer({ selectedObject, cameraPosition }) {
    if (selectedObject?.context) return selectedObject.context;
    if (selectedObject?.label) return `${selectedObject.label} is available as a physical scene object. The contextual assistant can explain how it fits the ONNX workflow without exposing hidden agent logs.`;
    return describeRoom(cameraPosition || new THREE.Vector3());
  }

  return {
    id: "building-interior-kit",
    label: "Building Interior Kit",
    build,
    constrainPlayer,
    describeRoom,
    getContextAnswer,
    proceduralObjects,
  };
}

export function createWorkshopObjectKit(THREE, helpers) {
  const { addMesh, boxGeo, tubeGeo, gearGeo, materials } = helpers;

  const objects = [
    ["hammer", "Hammer", "hand tool", ["handle", "head", "claw", "striking face"], [-3.35, 1.08, -1.45], [0, .18, .12], "Drives and pulls nails. Start with light taps, keep your off hand clear, and strike with the flat face."],
    ["hand-saw", "Hand Saw", "cutting tool", ["blade", "teeth", "handle"], [-4.15, 1.05, -1.1], [0, -.12, -.08], "Cuts wood with sharp teeth. Mark the cut, brace the board, and use long controlled strokes."],
    ["nail-box", "Box of Nails", "fasteners", ["nails", "heads", "points"], [-2.65, 1.02, -1.18], [0, .3, 0], "Fasteners for joining wood. Choose a length that holds securely without punching through."],
    ["screwdriver", "Screwdriver", "hand tool", ["handle", "shaft", "tip"], [3.25, 1.05, -1.5], [0, -.25, .04], "Turns screws. Match the tip to the screw head and press straight down while turning."],
    ["wrench", "Wrench", "hand tool", ["jaw", "handle", "adjuster"], [2.55, 1.05, -1.18], [0, .05, -.14], "Grips nuts and bolts. Keep the jaw seated and pull smoothly to avoid rounding the fastener."],
    ["clamp", "Wood Clamp", "holding tool", ["fixed jaw", "sliding jaw", "screw", "handle"], [3.85, 1.12, -.85], [0, -.45, 0], "Holds work steady while cutting, drilling, gluing, or fastening."],
    ["measuring-tape", "Measuring Tape", "layout tool", ["case", "blade", "hook", "lock"], [.12, .93, .15], [0, .25, 0], "Sets accurate lengths before cutting or assembly. Hook the end firmly and read directly above the mark."],
    ["level", "Level", "layout tool", ["body", "vial", "bubble", "edge"], [.4, .94, .55], [0, -.18, 0], "Checks whether a surface is horizontal or vertical. Center the bubble between the marks."],
    ["paint-can", "Paint Can", "finishing supply", ["can", "lid", "label", "paint"], [4.12, .36, 2.35], [0, .1, 0], "Protects and finishes surfaces. Stir well, test on scrap, and keep the lid sealed."],
    ["toolbox", "Toolbox", "storage", ["case", "handle", "latch", "tray"], [-4.05, .38, 2.55], [0, .45, 0], "Stores and organizes tools so sharp or heavy items stay contained."],
    ["safety-goggles", "Safety Goggles", "protective gear", ["lens", "frame", "strap"], [4.05, 1.38, 1.25], [0, -.1, 0], "Protects eyes from chips, dust, splashes, and flying fasteners."],
    ["wood-planks", "Wood Planks", "material", ["grain", "edges", "faces", "ends"], [-1.85, .28, 3.55], [0, .28, 0], "Base material for many projects. Inspect for warp, knots, splits, and grain direction."],
    ["drill-body", "Cordless Drill", "power tool", ["chuck", "trigger", "grip", "battery"], [1.95, .34, 3.45], [0, -.4, 0], "Makes holes and drives screws. Select the correct bit, set torque, and keep the bit straight."],
    ["wood-glue", "Wood Glue", "adhesive", ["bottle", "nozzle", "cap", "glue"], [-5.02, 1.12, .4], [0, .25, 0], "Bonds clean fitted wood surfaces. Clamp the joint and wipe squeeze-out before it hardens."]
  ].map(([id, label, type, parts, position, rotation, context]) => ({
    id, label, type, parts, context,
    position: { x: position[0], y: position[1], z: position[2] },
    rotation: { x: rotation[0], y: rotation[1], z: rotation[2] },
    quick: {
      use: `Use ${label.toLowerCase()} for ${context.charAt(0).toLowerCase()}${context.slice(1)}`,
      safety: safetyFor(type, label),
      works: worksFor(type, label)
    }
  }));

  function safetyFor(type, label) {
    if (type.includes("cutting")) return "Clamp the work, keep hands out of the blade path, and store the blade safely.";
    if (type.includes("power")) return "Wear eye protection, keep loose clothing clear, and disconnect power before changing bits.";
    if (type.includes("protective")) return "Use it before the risky step starts. Replace it if cracked or badly scratched.";
    if (type.includes("finishing") || type.includes("adhesive")) return "Ventilate the area, avoid skin and eye contact, and follow the label.";
    return `Use the ${label.toLowerCase()} with eye protection and keep fingers clear of pinch, strike, or slip paths.`;
  }

  function worksFor(type, label) {
    if (label === "Hammer") return "Works with nails, wood planks, pry tasks, and rough assembly.";
    if (label === "Wood Clamp") return "Works with saws, drills, glue-ups, sanding, and assembly.";
    if (label === "Measuring Tape" || label === "Level") return "Works with layout marks, shelves, framing, planks, and accurate cuts.";
    if (type.includes("material")) return "Works with saws, nails, screws, glue, clamps, sandpaper, and finish.";
    return "Works with related workshop setup, measurement, fastening, and safety steps.";
  }

  function tag(group, item) {
    group.userData.workshopObjectId = item.id;
    group.userData.workshopObject = item;
    group.traverse((node) => {
      if (!node.isMesh) return;
      node.userData.workshopObjectId = item.id;
      node.userData.workshopObject = item;
    });
  }

  function buildObject(parent, item) {
    const group = new THREE.Group();
    group.position.set(item.position.x, item.position.y, item.position.z);
    group.rotation.set(item.rotation.x, item.rotation.y, item.rotation.z);
    group.scale.setScalar(item.id === "wood-planks" ? 1.1 : 1);

    if (item.id === "hammer") {
      addMesh(group, tubeGeo(.78, .045), materials.wood, { x: -.1 }, { z: .1 });
      addMesh(group, boxGeo(.28, .16, .16), materials.metal, { x: .27 });
      addMesh(group, boxGeo(.09, .22, .18), materials.metal, { x: .43 });
    } else if (item.id === "hand-saw") {
      addMesh(group, boxGeo(.96, .04, .26), materials.metal, { x: .15 });
      for (let i = 0; i < 9; i++) addMesh(group, boxGeo(.05, .035, .06), materials.metal, { x: -.25 + i * .09, y: -.035, z: -.15 }, { z: .7 });
      addMesh(group, boxGeo(.28, .18, .12), materials.wood, { x: -.48 });
    } else if (item.id === "nail-box") {
      addMesh(group, boxGeo(.56, .18, .38), materials.darkWood);
      for (let i = 0; i < 12; i++) addMesh(group, tubeGeo(.28, .009, 8, 1), materials.metal, { x: -.22 + (i % 6) * .09, y: .14, z: -.1 + Math.floor(i / 6) * .14 }, { z: Math.PI / 2 });
    } else if (item.id === "screwdriver") {
      addMesh(group, tubeGeo(.62, .027), materials.metal, { x: .12 });
      addMesh(group, tubeGeo(.28, .075), materials.rubber, { x: -.35 });
      addMesh(group, boxGeo(.08, .018, .018), materials.metal, { x: .48 });
    } else if (item.id === "wrench") {
      addMesh(group, tubeGeo(.55, .035), materials.metal);
      addMesh(group, gearGeo(10, .09, .16, .045), materials.metal, { x: .34 }, { z: Math.PI / 2 });
      addMesh(group, boxGeo(.18, .06, .045), materials.metal, { x: -.34 });
    } else if (item.id === "clamp") {
      addMesh(group, boxGeo(.78, .06, .08), materials.metal, { y: .05 });
      addMesh(group, boxGeo(.08, .5, .12), materials.metal, { x: -.35, y: -.18 });
      addMesh(group, boxGeo(.08, .36, .12), materials.metal, { x: .28, y: -.11 });
      addMesh(group, tubeGeo(.35, .018), materials.brass, { x: .36, y: -.05 }, { z: Math.PI / 2 });
    } else if (item.id === "measuring-tape") {
      addMesh(group, boxGeo(.42, .24, .38), materials.brass);
      addMesh(group, boxGeo(.32, .05, .08), materials.metal, { x: .35, y: .03 });
    } else if (item.id === "level") {
      addMesh(group, boxGeo(.86, .09, .18), materials.goldGlow);
      addMesh(group, boxGeo(.2, .055, .2), materials.glass, { x: -.25 });
      addMesh(group, boxGeo(.2, .055, .2), materials.glass, { x: .25 });
    } else if (item.id === "paint-can") {
      addMesh(group, tubeGeo(.42, .18, 24, 1), materials.metal, {}, { z: Math.PI / 2 });
      addMesh(group, boxGeo(.22, .22, .03), materials.paper, { z: .19 });
    } else if (item.id === "toolbox") {
      addMesh(group, boxGeo(.82, .34, .42), materials.darkWood);
      addMesh(group, boxGeo(.82, .06, .44), materials.redGlow, { y: .2 });
      addMesh(group, tubeGeo(.42, .025), materials.metal, { y: .36 }, { z: Math.PI / 2 });
    } else if (item.id === "safety-goggles") {
      addMesh(group, boxGeo(.24, .12, .05), materials.glass, { x: -.15 });
      addMesh(group, boxGeo(.24, .12, .05), materials.glass, { x: .15 });
      addMesh(group, tubeGeo(.58, .01), materials.rubber, { z: -.05 }, { z: Math.PI / 2 });
    } else if (item.id === "wood-planks") {
      for (let i = 0; i < 4; i++) addMesh(group, boxGeo(1.45, .12, .26), materials.wood, { y: i * .13, z: (i - 1.5) * .12 }, { y: (i - 1.5) * .05 });
    } else if (item.id === "drill-body") {
      addMesh(group, boxGeo(.48, .28, .22), materials.rubber, { x: -.05, y: .08 });
      addMesh(group, tubeGeo(.32, .07), materials.metal, { x: .33, y: .1 }, { z: Math.PI / 2 });
      addMesh(group, boxGeo(.18, .42, .16), materials.rubber, { x: -.08, y: -.22 });
      addMesh(group, boxGeo(.34, .16, .2), materials.brass, { x: -.02, y: -.48 });
    } else if (item.id === "wood-glue") {
      addMesh(group, tubeGeo(.38, .12, 18, 1), materials.paper, {}, { z: Math.PI / 2 });
      addMesh(group, tubeGeo(.16, .04, 12, 1), materials.brass, { y: .28 }, { z: Math.PI / 2 });
    } else {
      addMesh(group, boxGeo(.35, .25, .3), materials.wood);
    }

    tag(group, item);
    parent.add(group);
    return group;
  }

  function build(scene) {
    const root = new THREE.Group();
    root.name = "WorkshopObjectKitRoot";
    scene.add(root);
    const meshes = new Map();
    for (const item of objects) meshes.set(item.id, buildObject(root, item));
    return { root, objects, meshes };
  }

  function getObject(id) { return objects.find((item) => item.id === id) || null; }

  return {
    id: "workshop-object-kit",
    label: "Workshop Object Kit",
    build,
    getObject,
    objects
  };
}

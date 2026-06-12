const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const key = (x, y) => `${x},${y}`;
const d = (a, b) => Math.hypot(n(a.x) - n(b.x), n(a.z) - n(b.z));
function inBarn(p, b, pad) { return Math.abs(n(p.x) - n(b.position?.x)) <= n(b.size?.x) / 2 + pad && Math.abs(n(p.z) - n(b.position?.z)) <= n(b.size?.z) / 2 + pad; }
function zoneCost(p, zones = []) { return Number((1 + zones.reduce((sum, z) => sum + Math.max(0, 1 - d(p, z.position) / Math.max(0.1, n(z.radius, 1))) * n(z.intensity, 0.3) * 1.8, 0)).toFixed(3)); }
export function createOrchardWalkabilitySnapshot(orchard = {}, options = {}) {
  const cellSize = Math.max(0.5, n(options.cellSize, 2));
  const margin = Math.max(0, n(options.margin, 8));
  const width = Math.ceil((n(orchard.width, 72) + margin * 2) / cellSize);
  const height = Math.ceil((n(orchard.depth, 96) + margin * 2) / cellSize);
  const origin = { x: -n(orchard.width, 72) / 2 - margin, z: -n(orchard.depth, 96) / 2 - margin };
  const trees = (orchard.treeRows ?? []).flatMap((r) => r.trees ?? []);
  const barns = orchard.barnLandmarks ?? [];
  const cells = [];
  const blockedCells = [];
  for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
    const world = { x: origin.x + (x + 0.5) * cellSize, y: 0, z: origin.z + (y + 0.5) * cellSize };
    const tree = trees.find((t) => d(world, t.position) <= n(t.radius, 0.8) + n(options.treePadding, 1.1));
    const barn = barns.find((b) => inBarn(world, b, n(options.barnPadding, 1.5)));
    const outside = Math.abs(world.x) > n(orchard.width, 72) / 2 + 2 || Math.abs(world.z) > n(orchard.depth, 96) / 2 + 2;
    const walkable = !tree && !barn && !outside;
    const cell = { x, y, key: key(x, y), world, walkable, cost: walkable ? zoneCost(world, orchard.hauntedZones) : Infinity, material: walkable ? "orchard-lane" : tree ? "tree" : barn ? "barn" : "fence" };
    cells.push(cell); if (!walkable) blockedCells.push({ x, y, key: cell.key, world, reason: cell.material });
  }
  return { id: options.id ?? "orchard-walkability", seed: orchard.seed ?? "zombie-orchard", width, height, cellSize, origin, cells, blockedCells, rooms: [], corridors: [], regions: [], spawnPoints: orchard.monsterSpawnZones ?? [], objectiveMarkers: [{ id: "start", kind: "start", position: orchard.safeClearings?.[0]?.position ?? { x: 0, z: 36 } }, { id: "keeper", kind: "boss", position: orchard.barnLandmarks?.[0]?.position ?? { x: 0, z: -42 } }], navHints: orchard.navHints ?? {} };
}

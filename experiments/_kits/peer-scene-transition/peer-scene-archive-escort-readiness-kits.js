export const SCENE_ARCHIVE_ESCORT_READINESS_DOMAIN_TREE = `
peer-scene-archive-escort-readiness-domain
├─ survivor-wayfinding-domain
│  ├─ archivist-beacon-domain
│  │  └─ scene-archivist-beacon-kit
│  └─ memory-map-domain
│     └─ scene-memory-map-thread-kit
├─ protection-routing-domain
│  ├─ oath-sentinel-domain
│  │  └─ scene-oath-sentinel-post-kit
│  └─ lantern-supply-domain
│     └─ scene-lantern-supply-cache-kit
├─ extraction-handoff-domain
│  ├─ safe-passage-domain
│  │  └─ scene-safe-passage-token-kit
│  └─ archive-door-domain
│     └─ scene-archive-door-readiness-kit
└─ renderer-handoff
   └─ scene-archive-escort-renderer-handoff-kit
      └─ renderer consumes descriptors only
`;

const ORDER = ["camp", "crossroads", "forest", "bridge", "shrine", "ending"];
const SUPPLIES = ["Lantern", "Bridge rope", "Forest sequence solved", "Bridge repaired", "Shrine opened", "Map shard", "Silver clue"];
const PROTECTION = ["call", "light", "rope", "shelter", "vow", "door"];

function clamp01(value) {
  const number = Number.isFinite(Number(value)) ? Number(value) : 0;
  return Math.max(0, Math.min(1, number));
}

function slug(value) {
  return String(value ?? "unknown").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "unknown";
}

function normalizeState(state = {}) {
  const inventory = Array.isArray(state.inventory) ? state.inventory : [];
  const visitedScenes = Array.isArray(state.visitedScenes) ? state.visitedScenes : [];
  const log = Array.isArray(state.log) ? state.log : [];
  return {
    ...state,
    currentScene: state.currentScene ?? state.sceneId ?? "camp",
    inventory,
    visitedScenes,
    log,
    pressureScore: Number.isFinite(Number(state.pressureScore)) ? Number(state.pressureScore) : Math.min(100, log.length * 11)
  };
}

function sceneEntries(scenes = {}) {
  const entries = Object.entries(scenes);
  return entries.length ? entries : ORDER.map((id) => [id, { title: id, exits: {} }]);
}

function sceneIndex(sceneId) {
  const index = ORDER.indexOf(sceneId);
  return index < 0 ? 0 : index;
}

function missingForScene(scene, state) {
  return Object.values(scene.exits ?? {}).flatMap((exit) => (exit.requires ?? []).filter((need) => !state.inventory.includes(need) && !state.inventory.includes(String(need).replaceAll("-", " "))));
}

function routeExits(entries) {
  return entries.flatMap(([id, scene], sceneSlot) => Object.entries(scene.exits ?? {}).map(([exitId, exit], exitSlot) => ({ id, scene, sceneSlot, exitId, exit, exitSlot })));
}

export function createSceneArchivistBeaconKit() {
  return {
    id: "scene-archivist-beacon-kit",
    describe({ sceneId = "camp", state = {}, scenes = {} } = {}) {
      const safe = normalizeState(state);
      return sceneEntries(scenes).map(([id, scene], index) => {
        const current = id === sceneId || id === safe.currentScene;
        const visited = current || safe.visitedScenes.includes(id);
        const missing = missingForScene(scene, safe).length;
        const urgency = clamp01(0.16 + missing * 0.18 + (current ? 0.31 : 0) + (visited ? 0.12 : 0) + safe.pressureScore / 360);
        return {
          id: `archivist-beacon-${id}`,
          kind: "archivist-beacon",
          sceneId: id,
          label: scene.title ?? id,
          slot: index,
          x: 8 + ((index * 19) % 82),
          y: 12 + ((index * 31) % 64),
          urgency,
          current,
          visited,
          missingRoutes: missing
        };
      });
    },
    snapshot(input) {
      const beacons = this.describe(input);
      return { kit: this.id, beacons: beacons.length, urgent: beacons.filter((beacon) => beacon.urgency > 0.55).length };
    }
  };
}

export function createSceneMemoryMapThreadKit() {
  return {
    id: "scene-memory-map-thread-kit",
    describe({ sceneId = "camp", state = {}, scenes = {} } = {}) {
      const safe = normalizeState(state);
      return routeExits(sceneEntries(scenes)).map(({ id, sceneSlot, exitId, exit, exitSlot }) => {
        const required = exit.requires ?? [];
        const missing = required.filter((need) => !safe.inventory.includes(need) && !safe.inventory.includes(String(need).replaceAll("-", " ")));
        const open = missing.length === 0;
        return {
          id: `memory-map-${id}-${exitId}`,
          kind: "memory-map-thread",
          sceneId: id,
          targetSceneId: exit.to ?? exitId,
          label: exit.label ?? exit.to ?? exitId,
          slot: sceneSlot * 2 + exitSlot,
          arc: clamp01((sceneSlot + 1) / Math.max(1, ORDER.length)),
          threadStrength: clamp01((open ? 0.54 : 0.18) + safe.visitedScenes.length * 0.04 + (id === sceneId ? 0.16 : 0)),
          open,
          missing
        };
      });
    },
    snapshot(input) {
      const threads = this.describe(input);
      return { kit: this.id, threads: threads.length, open: threads.filter((thread) => thread.open).length };
    }
  };
}

export function createSceneOathSentinelPostKit() {
  return {
    id: "scene-oath-sentinel-post-kit",
    describe({ sceneId = "camp", state = {}, scenes = {} } = {}) {
      const safe = normalizeState(state);
      return sceneEntries(scenes).map(([id, scene], index) => {
        const visited = id === sceneId || safe.visitedScenes.includes(id);
        const missing = missingForScene(scene, safe).length;
        const strength = clamp01(0.22 + (visited ? 0.36 : 0.08) + safe.inventory.length * 0.035 - missing * 0.06);
        return {
          id: `oath-sentinel-${id}`,
          kind: "oath-sentinel-post",
          sceneId: id,
          glyph: PROTECTION[index] ?? id.slice(0, 3),
          slot: index,
          x: 16 + ((index * 13) % 70),
          y: 22 + ((index * 17) % 54),
          strength,
          guarded: strength > 0.48,
          missingRoutes: missing
        };
      });
    },
    snapshot(input) {
      const sentinels = this.describe(input);
      return { kit: this.id, sentinels: sentinels.length, guarded: sentinels.filter((sentinel) => sentinel.guarded).length };
    }
  };
}

export function createSceneLanternSupplyCacheKit() {
  return {
    id: "scene-lantern-supply-cache-kit",
    describe({ sceneId = "camp", state = {} } = {}) {
      const safe = normalizeState(state);
      const inventoryItems = safe.inventory.map((item, index) => ({ source: "inventory", label: item, index }));
      const neededItems = SUPPLIES.filter((supply) => !safe.inventory.includes(supply)).map((item, index) => ({ source: "needed", label: item, index: index + inventoryItems.length }));
      return [...inventoryItems, ...neededItems].slice(0, 8).map((item, index) => ({
        id: `lantern-cache-${slug(item.label)}`,
        kind: "lantern-supply-cache",
        sceneId,
        label: String(item.label),
        source: item.source,
        slot: index,
        reserve: clamp01((item.source === "inventory" ? 0.62 : 0.24) + (8 - index) * 0.035),
        ready: item.source === "inventory"
      }));
    },
    snapshot(input) {
      const caches = this.describe(input);
      return { kit: this.id, caches: caches.length, ready: caches.filter((cache) => cache.ready).length };
    }
  };
}

export function createSceneSafePassageTokenKit() {
  return {
    id: "scene-safe-passage-token-kit",
    describe({ sceneId = "camp", state = {}, scenes = {} } = {}) {
      const safe = normalizeState(state);
      const currentIndex = sceneIndex(sceneId);
      return sceneEntries(scenes).map(([id, scene], index) => {
        const visited = id === sceneId || safe.visitedScenes.includes(id);
        const missing = missingForScene(scene, safe);
        const clearance = clamp01((visited ? 0.5 : 0.14) + (index <= currentIndex ? 0.18 : 0) + safe.inventory.length * 0.04 - missing.length * 0.075);
        return {
          id: `safe-passage-${id}`,
          kind: "safe-passage-token",
          sceneId: id,
          label: scene.title ?? id,
          slot: index,
          clearance,
          sealed: missing.length > 0,
          ready: clearance > 0.52 && missing.length === 0,
          missing
        };
      });
    },
    snapshot(input) {
      const tokens = this.describe(input);
      return { kit: this.id, tokens: tokens.length, ready: tokens.filter((token) => token.ready).length };
    }
  };
}

export function createSceneArchiveDoorReadinessKit() {
  return {
    id: "scene-archive-door-readiness-kit",
    describe({ sceneId = "camp", state = {}, scenes = {} } = {}) {
      const safe = normalizeState(state);
      const entries = sceneEntries(scenes);
      const visitedCount = new Set([safe.currentScene, ...safe.visitedScenes]).size;
      const routeProgress = clamp01(visitedCount / Math.max(1, entries.length));
      const supplyProgress = clamp01(safe.inventory.length / 6);
      const pressureRelief = clamp01(1 - safe.pressureScore / 140);
      const readiness = clamp01(routeProgress * 0.45 + supplyProgress * 0.35 + pressureRelief * 0.2);
      return [{
        id: "archive-door-final",
        kind: "archive-door-readiness",
        sceneId,
        label: "Archive escort door",
        routeProgress,
        supplyProgress,
        pressureRelief,
        readiness,
        open: readiness > 0.72,
        missingScenes: entries.map(([id]) => id).filter((id) => !safe.visitedScenes.includes(id) && id !== safe.currentScene)
      }];
    },
    snapshot(input) {
      const [door] = this.describe(input);
      return { kit: this.id, doors: 1, readiness: door.readiness, open: door.open };
    }
  };
}

export function createSceneArchiveEscortRendererHandoffKit() {
  return {
    id: "scene-archive-escort-renderer-handoff-kit",
    describe(descriptors = {}) {
      const counts = {
        archivistBeacons: descriptors.archivistBeacons?.length ?? 0,
        memoryMapThreads: descriptors.memoryMapThreads?.length ?? 0,
        oathSentinelPosts: descriptors.oathSentinelPosts?.length ?? 0,
        lanternSupplyCaches: descriptors.lanternSupplyCaches?.length ?? 0,
        safePassageTokens: descriptors.safePassageTokens?.length ?? 0,
        archiveDoorReadiness: descriptors.archiveDoorReadiness?.length ?? 0
      };
      return {
        id: this.id,
        policy: "renderer-consumes-descriptors-only",
        descriptors,
        counts,
        descriptorCount: Object.values(counts).reduce((sum, count) => sum + count, 0)
      };
    },
    snapshot(descriptors) {
      const handoff = this.describe(descriptors);
      return { kit: this.id, ...handoff.counts, descriptorCount: handoff.descriptorCount };
    }
  };
}

export function createSceneArchiveEscortReadinessDomainKit() {
  const archivistBeaconKit = createSceneArchivistBeaconKit();
  const memoryMapThreadKit = createSceneMemoryMapThreadKit();
  const oathSentinelPostKit = createSceneOathSentinelPostKit();
  const lanternSupplyCacheKit = createSceneLanternSupplyCacheKit();
  const safePassageTokenKit = createSceneSafePassageTokenKit();
  const archiveDoorReadinessKit = createSceneArchiveDoorReadinessKit();
  const rendererHandoffKit = createSceneArchiveEscortRendererHandoffKit();

  function descriptors(input = {}) {
    return {
      archivistBeacons: archivistBeaconKit.describe(input),
      memoryMapThreads: memoryMapThreadKit.describe(input),
      oathSentinelPosts: oathSentinelPostKit.describe(input),
      lanternSupplyCaches: lanternSupplyCacheKit.describe(input),
      safePassageTokens: safePassageTokenKit.describe(input),
      archiveDoorReadiness: archiveDoorReadinessKit.describe(input)
    };
  }

  return {
    id: "peer-scene-archive-escort-readiness-domain-kit",
    tree: SCENE_ARCHIVE_ESCORT_READINESS_DOMAIN_TREE,
    kitCount: 8,
    describe(input = {}) {
      const handoff = rendererHandoffKit.describe(descriptors(input));
      return {
        sceneId: input.sceneId ?? input.state?.currentScene ?? "camp",
        kit: this.id,
        kitCount: this.kitCount,
        policy: handoff.policy,
        descriptors: handoff.descriptors,
        counts: handoff.counts,
        descriptorCount: handoff.descriptorCount
      };
    },
    snapshot(input = {}) {
      const description = this.describe(input);
      const door = description.descriptors.archiveDoorReadiness[0];
      return {
        kit: this.id,
        sceneId: description.sceneId,
        kitCount: this.kitCount,
        ...description.counts,
        descriptorCount: description.descriptorCount,
        archiveDoorReadinessValue: door?.readiness ?? 0,
        archiveDoorOpen: Boolean(door?.open)
      };
    }
  };
}

const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp01 = (value) => Math.max(0, Math.min(1, n(value)));
const pct = (value) => Math.round(clamp01(value) * 100) / 100;
const pos = (value = {}, fallback = {}) => ({
  x: n(value.x, n(fallback.x)),
  y: n(value.y, n(fallback.y)),
  z: n(value.z ?? value.y, n(fallback.z ?? fallback.y))
});
const list = (value) => Array.isArray(value) ? value : [];
const idPart = (value, fallback) => String(value ?? fallback).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || String(fallback);
const dist = (a = {}, b = {}) => Math.hypot(n(a.x) - n(b.x), n(a.z ?? a.y) - n(b.z ?? b.y));

export const ZOMBIE_ORCHARD_CURE_CRAFTING_DOMAIN_TREE = `zombie-orchard-cure-crafting-readiness-domain
├─ cure-resource-domain
│  ├─ infected-root-sample-domain
│  │  └─ zombie-infected-root-sample-kit
│  └─ antidote-press-domain
│     └─ zombie-antidote-press-queue-kit
├─ orchard-defense-domain
│  ├─ sap-distiller-domain
│  │  └─ zombie-sap-distiller-node-kit
│  └─ barricade-graft-domain
│     └─ zombie-barricade-graft-plan-kit
├─ survivor-cure-domain
│  ├─ survivor-signal-domain
│  │  └─ zombie-survivor-signal-glyph-kit
│  └─ dawn-cure-ritual-domain
│     └─ zombie-dawn-cure-ritual-window-kit
└─ renderer-handoff
   └─ zombie-orchard-cure-crafting-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

const OWNERSHIP = Object.freeze({
  renderer: false,
  dom: false,
  browserInput: false,
  three: false,
  webgl: false,
  audio: false,
  assetLoading: false,
  frameLoop: false
});

function orchardBounds(snapshot = {}) {
  const bounds = snapshot.bounds ?? snapshot.orchard?.bounds ?? {};
  return {
    minX: n(bounds.minX, -34),
    maxX: n(bounds.maxX, 34),
    minZ: n(bounds.minZ, -24),
    maxZ: n(bounds.maxZ, 24)
  };
}

function lanePositions(snapshot = {}) {
  const bounds = orchardBounds(snapshot);
  const lanes = list(snapshot.visualDomains?.lanes).length ? list(snapshot.visualDomains?.lanes) : [
    { id: "north-row", center: { x: bounds.minX * 0.45, z: bounds.minZ * 0.44 } },
    { id: "center-row", center: { x: 0, z: 0 } },
    { id: "south-row", center: { x: bounds.maxX * 0.45, z: bounds.maxZ * 0.44 } }
  ];
  return lanes.map((lane, index) => ({ ...lane, center: pos(lane.center ?? lane.position, { x: -14 + index * 14, z: index % 2 ? 5 : -6 }) }));
}

function threatPressure(snapshot = {}) {
  return clamp01(n(snapshot.horde?.pressure01, snapshot.pressure01 ?? 0) + list(snapshot.monsters).length * 0.055 + (snapshot.danger ? 0.18 : 0));
}

function roundNumber(snapshot = {}) {
  return n(snapshot.round?.round, snapshot.round?.nextRound ?? 1);
}

export function createZombieInfectedRootSampleKit() {
  return {
    id: "zombie-infected-root-sample-kit",
    role: "sample infected orchard roots and rare apples for cure reagents",
    evaluate(snapshot = {}) {
      const pressure = threatPressure(snapshot);
      const apples = list(snapshot.orchard?.activeApples).slice(0, 3);
      const lanes = lanePositions(snapshot).slice(0, 3);
      const source = apples.length ? apples : lanes;
      return source.map((item, index) => {
        const p = pos(item.position ?? item.center, { x: -12 + index * 12, z: index % 2 ? 9 : -9 });
        const rarity = item.typeId === "golden" ? 0.95 : item.typeId === "rot" ? 0.78 : 0.45 + index * 0.08;
        return {
          id: `infected-root-sample-${idPart(item.id ?? item.typeId, index)}`,
          kind: "infected-root-sample",
          position: p,
          potency: pct(rarity),
          urgency: pct(Math.max(pressure, 0.25 + rarity * 0.45)),
          requiredAction: "sample-root-before-horde-crosses-row",
          label: item.label ?? `Root sample ${index + 1}`
        };
      });
    }
  };
}

export function createZombieAntidotePressQueueKit() {
  return {
    id: "zombie-antidote-press-queue-kit",
    role: "turn apples and samples into antidote batches",
    evaluate(snapshot = {}) {
      const appleCount = n(snapshot.appleCount, snapshot.apples ?? 0);
      const health = clamp01(snapshot.health01 ?? 1);
      const pressure = threatPressure(snapshot);
      const batches = Math.max(1, Math.min(4, Math.ceil((appleCount + 1) / 2)));
      return Array.from({ length: batches }, (_, index) => {
        const applesNeeded = Math.max(0, 2 + index - appleCount);
        const readiness = clamp01((appleCount - index) / 4 + health * 0.35 + (1 - pressure) * 0.2);
        return {
          id: `antidote-press-queue-${index + 1}`,
          kind: "antidote-press-queue",
          slot: index + 1,
          position: { x: -18 + index * 12, y: 0, z: 18 },
          applesNeeded,
          readiness: pct(readiness),
          urgency: pct(1 - health + pressure * 0.35),
          label: applesNeeded ? `Needs ${applesNeeded} apples` : "Press antidote"
        };
      });
    }
  };
}

export function createZombieSapDistillerNodeKit() {
  return {
    id: "zombie-sap-distiller-node-kit",
    role: "place distillers on safe tree pockets for cure resin",
    evaluate(snapshot = {}) {
      const trees = list(snapshot.visualDomains?.trees).slice(0, 4);
      const lanes = lanePositions(snapshot);
      const fallback = lanes.map((lane, index) => ({ id: lane.id, position: lane.center, canopy: 0.45 + index * 0.1 }));
      return (trees.length ? trees : fallback).slice(0, 4).map((tree, index) => {
        const p = pos(tree.position ?? tree.center, { x: -20 + index * 12, z: -16 });
        const nearestThreat = list(snapshot.monsters).reduce((best, monster) => Math.min(best, dist(p, monster.position)), Infinity);
        const safety = clamp01((nearestThreat === Infinity ? 22 : nearestThreat) / 22);
        return {
          id: `sap-distiller-node-${idPart(tree.id, index)}`,
          kind: "sap-distiller-node",
          position: p,
          safety: pct(safety),
          yield01: pct(0.38 + safety * 0.42 + index * 0.04),
          label: safety > 0.6 ? "Safe resin tap" : "Threatened resin tap"
        };
      });
    }
  };
}

export function createZombieBarricadeGraftPlanKit() {
  return {
    id: "zombie-barricade-graft-plan-kit",
    role: "plan living barricade grafts on high-pressure horde lanes",
    evaluate(snapshot = {}, hordeReadiness = {}) {
      const lanes = hordeReadiness.rendererHandoff?.descriptors?.spawnLaneForecasts ?? lanePositions(snapshot);
      const pressure = threatPressure(snapshot);
      return list(lanes).slice(0, 4).map((lane, index) => {
        const from = pos(lane.from ?? lane.center, { x: -24 + index * 16, z: -20 });
        const to = pos(lane.to ?? snapshot.player?.position, { x: 0, z: 0 });
        const urgency = clamp01(n(lane.urgency, pressure) + index * 0.05);
        return {
          id: `barricade-graft-plan-${idPart(lane.id, index)}`,
          kind: "barricade-graft-plan",
          from,
          to,
          priority: pct(urgency),
          graftCost: 1 + Math.round(urgency * 3),
          label: urgency > 0.67 ? "Graft now" : "Prepare graft"
        };
      });
    }
  };
}

export function createZombieSurvivorSignalGlyphKit() {
  return {
    id: "zombie-survivor-signal-glyph-kit",
    role: "surface survivor signal glyphs and escort directions",
    evaluate(snapshot = {}) {
      const bounds = orchardBounds(snapshot);
      const health = clamp01(snapshot.health01 ?? 1);
      const pressure = threatPressure(snapshot);
      const player = pos(snapshot.player?.position, { x: 0, z: 0 });
      const anchors = [
        { id: "well-house", position: { x: bounds.minX + 7, z: bounds.maxZ - 7 } },
        { id: "tractor-shed", position: { x: bounds.maxX - 8, z: bounds.minZ + 8 } },
        { id: "root-cellar", position: { x: bounds.minX + 10, z: bounds.minZ + 9 } }
      ];
      return anchors.map((anchor, index) => {
        const urgency = clamp01(pressure * 0.7 + (1 - health) * 0.5 - index * 0.08);
        return {
          id: `survivor-signal-glyph-${anchor.id}`,
          kind: "survivor-signal-glyph",
          position: anchor.position,
          from: player,
          urgency: pct(urgency),
          escortDistance: Math.round(dist(player, anchor.position)),
          label: urgency > 0.55 ? "Survivor call" : "Quiet signal"
        };
      });
    }
  };
}

export function createZombieDawnCureRitualWindowKit() {
  return {
    id: "zombie-dawn-cure-ritual-window-kit",
    role: "forecast the final cure ritual window across round pressure",
    evaluate(snapshot = {}, cureState = {}) {
      const round = roundNumber(snapshot);
      const pressure = threatPressure(snapshot);
      const apples = n(snapshot.appleCount, 0);
      const sampleCount = list(cureState.infectedRootSamples).length;
      const readiness = clamp01(apples / 6 + sampleCount / 8 + n(snapshot.clears) / 20 - pressure * 0.25);
      return [
        {
          id: "dawn-cure-ritual-window-primary",
          kind: "dawn-cure-ritual-window",
          position: { x: 0, y: 0, z: -22 },
          round,
          readiness: pct(readiness),
          pressure: pct(pressure),
          secondsUntilDawn: Math.max(20, Math.round(95 - readiness * 55 + pressure * 35)),
          label: readiness > 0.72 ? "Start dawn cure" : "Build cure readiness"
        }
      ];
    }
  };
}

export function createZombieOrchardCureCraftingRendererHandoffKit() {
  return {
    id: "zombie-orchard-cure-crafting-renderer-handoff-kit",
    policy: "renderer-consumes-descriptors-only",
    ownership: OWNERSHIP,
    compose(descriptors = {}, summary = {}) {
      return {
        id: "zombie-orchard-cure-crafting-renderer-handoff",
        policy: "renderer-consumes-descriptors-only",
        ownership: OWNERSHIP,
        descriptors,
        descriptorCounts: Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, list(value).length])),
        summary: { ...summary }
      };
    }
  };
}

export function createZombieOrchardCureCraftingReadinessDomainKit() {
  const kits = {
    infectedRootSamples: createZombieInfectedRootSampleKit(),
    antidotePressQueues: createZombieAntidotePressQueueKit(),
    sapDistillerNodes: createZombieSapDistillerNodeKit(),
    barricadeGraftPlans: createZombieBarricadeGraftPlanKit(),
    survivorSignalGlyphs: createZombieSurvivorSignalGlyphKit(),
    dawnCureRitualWindows: createZombieDawnCureRitualWindowKit(),
    rendererHandoff: createZombieOrchardCureCraftingRendererHandoffKit()
  };
  return {
    id: "zombie-orchard-cure-crafting-readiness-domain-kit",
    domainTree: ZOMBIE_ORCHARD_CURE_CRAFTING_DOMAIN_TREE,
    ownership: OWNERSHIP,
    kits,
    compose(snapshot = {}, hordeReadiness = {}) {
      const partial = {
        infectedRootSamples: kits.infectedRootSamples.evaluate(snapshot),
        antidotePressQueues: kits.antidotePressQueues.evaluate(snapshot),
        sapDistillerNodes: kits.sapDistillerNodes.evaluate(snapshot),
        barricadeGraftPlans: kits.barricadeGraftPlans.evaluate(snapshot, hordeReadiness),
        survivorSignalGlyphs: kits.survivorSignalGlyphs.evaluate(snapshot)
      };
      partial.dawnCureRitualWindows = kits.dawnCureRitualWindows.evaluate(snapshot, partial);
      const summary = {
        descriptorCount: Object.values(partial).reduce((sum, values) => sum + list(values).length, 0),
        cureReadiness: partial.dawnCureRitualWindows[0]?.readiness ?? 0,
        pressure: pct(threatPressure(snapshot)),
        rendererConsumes: "descriptors-only"
      };
      return {
        id: "zombie-orchard-cure-crafting-readiness",
        domainTree: ZOMBIE_ORCHARD_CURE_CRAFTING_DOMAIN_TREE,
        descriptors: partial,
        summary,
        rendererHandoff: kits.rendererHandoff.compose(partial, summary),
        ownership: OWNERSHIP
      };
    }
  };
}

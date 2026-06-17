import {
  signalBastionMaps,
  signalBastionTowers,
  signalBastionEnemies,
  signalBastionWaves,
  signalBastionRewards,
  signalBastionCampaign
} from "./content.js";

const map = signalBastionMaps.obsidianSpiral;
const bossCycle = ["warden", "oracle", "colossus"];

function endlessWave(index) {
  const source = signalBastionWaves[index % signalBastionWaves.length];
  const round = index + 1;
  const boss = round % 10 === 0;
  const multiplier = 1 + Math.floor(index / signalBastionWaves.length) * 0.32 + round * 0.018;
  return {
    ...source,
    id: `endless-${String(round).padStart(3, "0")}`,
    label: boss ? `Endless Boss ${round}` : `Endless ${round}: ${source.label}`,
    reward: Math.round(source.reward * multiplier),
    groups: boss
      ? [
          { archetype: bossCycle[(round / 10 - 1) % bossCycle.length], count: 1, cadence: 1 },
          ...source.groups.map((group) => ({ ...group, count: Math.ceil(group.count * multiplier * 0.7), cadence: Math.max(0.1, group.cadence * 0.86), delay: (group.delay ?? 0) + 2 }))
        ]
      : source.groups.map((group) => ({ ...group, count: Math.ceil(group.count * multiplier), cadence: Math.max(0.1, group.cadence * 0.88) }))
  };
}

export const signalBastionEndlessPreset = Object.freeze({
  mode: "endless",
  campaign: signalBastionCampaign,
  rewards: signalBastionRewards,
  level: {
    id: "signal-bastion-endless",
    label: "Signal Bastion: Obsidian Spiral",
    width: 960,
    height: 540,
    startingCurrency: 210,
    buildOrder: Object.keys(signalBastionTowers),
    path: map.path,
    slots: map.slots,
    vital: { ...map.vital, maxHealth: 30 },
    blueprints: signalBastionTowers,
    archetypes: signalBastionEnemies,
    waves: Array.from({ length: 60 }, (_, index) => endlessWave(index))
  },
  presentation: {
    mapId: map.id,
    mapLabel: map.label,
    palette: {
      path: "rgba(255,118,132,.20)",
      core: "rgba(255,227,109,.95)",
      buildable: "rgba(183,247,255,.42)",
      warning: "rgba(255,139,123,.96)"
    }
  }
});

export default signalBastionEndlessPreset;

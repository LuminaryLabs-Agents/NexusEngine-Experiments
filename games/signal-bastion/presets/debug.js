import {
  signalBastionMaps,
  signalBastionTowers,
  signalBastionEnemies,
  signalBastionRewards,
  signalBastionCampaign
} from "./content.js";

const map = signalBastionMaps.emberCauseway;

export const signalBastionDebugPreset = Object.freeze({
  mode: "debug",
  campaign: signalBastionCampaign,
  rewards: signalBastionRewards,
  level: {
    id: "signal-bastion-debug",
    label: "Signal Bastion: Debug Range",
    width: 960,
    height: 540,
    startingCurrency: 999,
    buildOrder: Object.keys(signalBastionTowers),
    path: map.path,
    slots: map.slots,
    vital: { ...map.vital, maxHealth: 99 },
    blueprints: signalBastionTowers,
    archetypes: signalBastionEnemies,
    waves: [
      { id: "debug-01", label: "Unit Sampler", reward: 1, groups: Object.keys(signalBastionEnemies).filter((id) => !signalBastionEnemies[id].boss).map((archetype, index) => ({ archetype, count: 1, cadence: 0.25, delay: index * 0.15 })) },
      { id: "debug-02", label: "Boss Sampler", reward: 1, groups: ["warden", "oracle", "colossus"].map((archetype, index) => ({ archetype, count: 1, cadence: 1, delay: index * 4 })) }
    ]
  },
  presentation: {
    mapId: map.id,
    mapLabel: "Debug Range",
    palette: {
      path: "rgba(255,255,255,.22)",
      core: "rgba(255,227,109,.95)",
      buildable: "rgba(102,240,184,.60)",
      warning: "rgba(255,139,123,.96)"
    }
  }
});

export default signalBastionDebugPreset;

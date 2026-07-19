export const signalBastionMaps = Object.freeze({
  emberCauseway: {
    id: "ember-causeway",
    label: "Ember Causeway",
    path: [
      { x: 40, y: 318 }, { x: 178, y: 318 }, { x: 248, y: 210 }, { x: 390, y: 210 },
      { x: 492, y: 350 }, { x: 660, y: 350 }, { x: 735, y: 250 }, { x: 918, y: 250 }
    ],
    slots: [
      { id: "slot-a", x: 150, y: 246, tags: ["frontline"] },
      { id: "slot-b", x: 238, y: 386, tags: ["bend"] },
      { id: "slot-c", x: 354, y: 144, tags: ["high-ground"] },
      { id: "slot-d", x: 438, y: 286, tags: ["center"] },
      { id: "slot-e", x: 570, y: 420, tags: ["support"] },
      { id: "slot-f", x: 635, y: 274, tags: ["crossfire"] },
      { id: "slot-g", x: 750, y: 170, tags: ["late"] },
      { id: "slot-h", x: 806, y: 330, tags: ["core"] }
    ],
    vital: { id: "core", label: "Dawn Core", x: 914, y: 250, maxHealth: 24 }
  },
  frostCanal: {
    id: "frost-canal",
    label: "Frost Canal",
    path: [
      { x: 34, y: 164 }, { x: 164, y: 164 }, { x: 238, y: 292 }, { x: 360, y: 292 },
      { x: 440, y: 132 }, { x: 612, y: 132 }, { x: 700, y: 386 }, { x: 920, y: 386 }
    ],
    slots: [
      { id: "slot-a", x: 132, y: 238, tags: ["frontline"] },
      { id: "slot-b", x: 254, y: 118, tags: ["upper"] },
      { id: "slot-c", x: 318, y: 374, tags: ["canal"] },
      { id: "slot-d", x: 430, y: 218, tags: ["hinge"] },
      { id: "slot-e", x: 552, y: 214, tags: ["support"] },
      { id: "slot-f", x: 642, y: 326, tags: ["late"] },
      { id: "slot-g", x: 760, y: 454, tags: ["core"] },
      { id: "slot-h", x: 812, y: 302, tags: ["crossfire"] }
    ],
    vital: { id: "core", label: "Glacier Core", x: 922, y: 386, maxHealth: 22 }
  },
  obsidianSpiral: {
    id: "obsidian-spiral",
    label: "Obsidian Spiral",
    path: [
      { x: 52, y: 438 }, { x: 172, y: 438 }, { x: 172, y: 176 }, { x: 372, y: 176 },
      { x: 372, y: 404 }, { x: 594, y: 404 }, { x: 594, y: 146 }, { x: 828, y: 146 }, { x: 916, y: 270 }
    ],
    slots: [
      { id: "slot-a", x: 104, y: 348, tags: ["entrance"] },
      { id: "slot-b", x: 244, y: 246, tags: ["spiral"] },
      { id: "slot-c", x: 300, y: 474, tags: ["lower"] },
      { id: "slot-d", x: 456, y: 294, tags: ["center"] },
      { id: "slot-e", x: 522, y: 104, tags: ["upper"] },
      { id: "slot-f", x: 662, y: 484, tags: ["late"] },
      { id: "slot-g", x: 724, y: 232, tags: ["core"] },
      { id: "slot-h", x: 842, y: 96, tags: ["boss"] }
    ],
    vital: { id: "core", label: "Obsidian Core", x: 916, y: 270, maxHealth: 20 }
  }
});

export const signalBastionTowers = Object.freeze({
  bolt: { id: "bolt", label: "Bolt Spire", cost: 45, upgradeCost: 38, maxLevel: 5, range: 126, damage: 22, fireRate: 1.18, projectileSpeed: 390, color: "#8bd3ff", role: "single-target" },
  ember: { id: "ember", label: "Ember Loom", cost: 70, upgradeCost: 52, maxLevel: 4, range: 104, damage: 13, fireRate: 2.45, projectileSpeed: 330, splash: 34, color: "#ffbc6b", role: "splash" },
  slow: { id: "slow", label: "Frost Pin", cost: 55, upgradeCost: 44, maxLevel: 4, range: 116, damage: 9, fireRate: 1.55, projectileSpeed: 350, slow: { amount: 0.42, duration: 1.8 }, color: "#b7f7ff", role: "control" },
  prism: { id: "prism", label: "Prism Lance", cost: 95, upgradeCost: 72, maxLevel: 4, range: 150, damage: 36, fireRate: 0.86, projectileSpeed: 520, color: "#d9b8ff", role: "sniper" },
  thumper: { id: "thumper", label: "Thumper Drum", cost: 88, upgradeCost: 66, maxLevel: 4, range: 92, damage: 18, fireRate: 1.35, projectileSpeed: 260, splash: 54, color: "#ff8c7a", role: "heavy-splash" },
  volt: { id: "volt", label: "Volt Web", cost: 76, upgradeCost: 58, maxLevel: 4, range: 112, damage: 12, fireRate: 2.8, projectileSpeed: 430, color: "#72f6ff", role: "rapid" },
  umbra: { id: "umbra", label: "Umbra Needle", cost: 84, upgradeCost: 64, maxLevel: 4, range: 122, damage: 19, fireRate: 1.75, projectileSpeed: 420, color: "#ad8cff", role: "stealth-reveal" },
  bloom: { id: "bloom", label: "Bloom Mortar", cost: 110, upgradeCost: 86, maxLevel: 3, range: 132, damage: 16, fireRate: 1.05, projectileSpeed: 250, splash: 72, color: "#ff7fb8", role: "area-denial" },
  siphon: { id: "siphon", label: "Siphon Reed", cost: 64, upgradeCost: 48, maxLevel: 4, range: 108, damage: 11, fireRate: 1.9, projectileSpeed: 360, color: "#7fffc7", role: "income" },
  bastion: { id: "bastion", label: "Bastion Bell", cost: 130, upgradeCost: 95, maxLevel: 3, range: 96, damage: 42, fireRate: 0.55, projectileSpeed: 300, splash: 42, color: "#ffe36d", role: "boss-breaker" },
  flare: { id: "flare", label: "Flare Needle", cost: 58, upgradeCost: 42, maxLevel: 4, range: 118, damage: 10, fireRate: 2.1, projectileSpeed: 450, color: "#ffd38a", role: "reveal" },
  anchor: { id: "anchor", label: "Anchor Coil", cost: 102, upgradeCost: 78, maxLevel: 4, range: 136, damage: 27, fireRate: 1.0, projectileSpeed: 340, slow: { amount: 0.25, duration: 1.1 }, color: "#91a8ff", role: "elite-control" }
});

export const signalBastionSecondCommand = Object.freeze({
  unlockAfterWave: 1,
  upgradeBlueprintId: "bolt",
  specialistBlueprintId: "volt",
  upgradePurpose: "focused impact",
  specialistPurpose: "rapid crossfire"
});

export const signalBastionEnemies = Object.freeze({
  runner: { id: "runner", label: "Runner", maxHealth: 58, speed: 58, reward: 6, coreDamage: 1, radius: 9, color: "#84f0a4" },
  skitter: { id: "skitter", label: "Skitter", maxHealth: 34, speed: 90, reward: 4, coreDamage: 1, radius: 7, color: "#d7ff8a" },
  brute: { id: "brute", label: "Brute", maxHealth: 155, speed: 34, reward: 13, coreDamage: 2, radius: 13, color: "#ff9c7a" },
  shieldbearer: { id: "shieldbearer", label: "Shieldbearer", maxHealth: 210, speed: 30, reward: 18, coreDamage: 2, radius: 14, color: "#9db8ff", shield: 90 },
  veil: { id: "veil", label: "Veil", maxHealth: 74, speed: 72, reward: 10, coreDamage: 1, radius: 8, color: "#b091ff", stealth: true },
  splitter: { id: "splitter", label: "Splitter", maxHealth: 120, speed: 44, reward: 12, coreDamage: 2, radius: 12, color: "#ffc772", splitsInto: "skitter" },
  carrier: { id: "carrier", label: "Carrier", maxHealth: 260, speed: 26, reward: 24, coreDamage: 3, radius: 16, color: "#ff7faa", spawns: "runner" },
  bulwark: { id: "bulwark", label: "Bulwark", maxHealth: 330, speed: 22, reward: 28, coreDamage: 3, radius: 17, color: "#ffd27a", aura: "armor" },
  seer: { id: "seer", label: "Seer", maxHealth: 92, speed: 64, reward: 12, coreDamage: 1, radius: 9, color: "#e4c6ff", aura: "haste" },
  breaker: { id: "breaker", label: "Breaker", maxHealth: 420, speed: 18, reward: 36, coreDamage: 5, radius: 18, color: "#ff6d6d" },
  glider: { id: "glider", label: "Glider", maxHealth: 70, speed: 82, reward: 9, coreDamage: 1, radius: 8, color: "#9bf5ff", traversal: "flying" },
  leech: { id: "leech", label: "Leech", maxHealth: 105, speed: 52, reward: 11, coreDamage: 1, radius: 10, color: "#77ffb8", drain: true },
  warden: { id: "warden", label: "Warden", maxHealth: 980, speed: 24, reward: 75, coreDamage: 8, radius: 20, color: "#ffdc6e", boss: true },
  oracle: { id: "oracle", label: "Oracle", maxHealth: 1280, speed: 20, reward: 95, coreDamage: 10, radius: 21, color: "#d8a8ff", boss: true, phases: 3 },
  colossus: { id: "colossus", label: "Colossus", maxHealth: 1850, speed: 16, reward: 130, coreDamage: 14, radius: 24, color: "#ff846d", boss: true, phases: 4 }
});

function wave(id, label, reward, groups) {
  return { id: `wave-${String(id).padStart(2, "0")}`, label, reward, groups };
}

export const signalBastionWaves = Object.freeze([
  wave(1, "First Signal", 24, [{ archetype: "runner", count: 8, cadence: 0.76 }]),
  wave(2, "Dense Braid", 32, [{ archetype: "runner", count: 7, cadence: 0.6 }, { archetype: "brute", count: 3, cadence: 1.1, delay: 2.3 }]),
  wave(3, "Glass Swarm", 44, [{ archetype: "skitter", count: 14, cadence: 0.42 }, { archetype: "brute", count: 4, cadence: 0.95, delay: 3.0 }]),
  wave(4, "Armored Press", 56, [{ archetype: "brute", count: 8, cadence: 0.78 }, { archetype: "runner", count: 10, cadence: 0.38, delay: 4.2 }]),
  wave(5, "Warden", 90, [{ archetype: "warden", count: 1, cadence: 1.0 }, { archetype: "skitter", count: 18, cadence: 0.34, delay: 3.5 }]),
  wave(6, "Veiled Step", 66, [{ archetype: "veil", count: 10, cadence: 0.54 }, { archetype: "runner", count: 12, cadence: 0.34, delay: 2.0 }]),
  wave(7, "Split Teeth", 72, [{ archetype: "splitter", count: 8, cadence: 0.76 }, { archetype: "skitter", count: 16, cadence: 0.28, delay: 4.0 }]),
  wave(8, "Shield Line", 82, [{ archetype: "shieldbearer", count: 8, cadence: 0.72 }, { archetype: "brute", count: 6, cadence: 0.9, delay: 3.2 }]),
  wave(9, "High Wind", 88, [{ archetype: "glider", count: 20, cadence: 0.34 }, { archetype: "veil", count: 8, cadence: 0.62, delay: 4.0 }]),
  wave(10, "Oracle", 120, [{ archetype: "oracle", count: 1, cadence: 1.0 }, { archetype: "runner", count: 18, cadence: 0.32, delay: 3.0 }]),
  wave(11, "Leech Bloom", 96, [{ archetype: "leech", count: 18, cadence: 0.44 }, { archetype: "skitter", count: 22, cadence: 0.24, delay: 5.0 }]),
  wave(12, "Carrier Tide", 104, [{ archetype: "carrier", count: 7, cadence: 0.9 }, { archetype: "runner", count: 18, cadence: 0.3, delay: 3.0 }]),
  wave(13, "Seer Choir", 112, [{ archetype: "seer", count: 14, cadence: 0.52 }, { archetype: "veil", count: 14, cadence: 0.48, delay: 2.0 }]),
  wave(14, "Bulwark Gate", 122, [{ archetype: "bulwark", count: 6, cadence: 1.0 }, { archetype: "shieldbearer", count: 10, cadence: 0.62, delay: 2.0 }]),
  wave(15, "Warden Refrain", 155, [{ archetype: "warden", count: 1, cadence: 1.0 }, { archetype: "splitter", count: 12, cadence: 0.48, delay: 2.0 }, { archetype: "skitter", count: 24, cadence: 0.2, delay: 6.0 }]),
  wave(16, "Breaker March", 134, [{ archetype: "breaker", count: 5, cadence: 1.1 }, { archetype: "brute", count: 12, cadence: 0.64, delay: 2.0 }]),
  wave(17, "Needle Rain", 142, [{ archetype: "glider", count: 32, cadence: 0.22 }, { archetype: "seer", count: 10, cadence: 0.54, delay: 4.0 }]),
  wave(18, "Draining Field", 150, [{ archetype: "leech", count: 24, cadence: 0.34 }, { archetype: "carrier", count: 6, cadence: 0.92, delay: 5.0 }]),
  wave(19, "Obscured Armor", 160, [{ archetype: "veil", count: 18, cadence: 0.38 }, { archetype: "shieldbearer", count: 14, cadence: 0.52, delay: 2.0 }]),
  wave(20, "Oracle Crown", 210, [{ archetype: "oracle", count: 1, cadence: 1.0 }, { archetype: "bulwark", count: 6, cadence: 0.8, delay: 2.0 }, { archetype: "glider", count: 24, cadence: 0.24, delay: 5.0 }]),
  wave(21, "Sunder Skies", 178, [{ archetype: "breaker", count: 6, cadence: 0.9 }, { archetype: "glider", count: 30, cadence: 0.2, delay: 3.0 }]),
  wave(22, "Carrier Wall", 186, [{ archetype: "carrier", count: 10, cadence: 0.76 }, { archetype: "bulwark", count: 6, cadence: 0.95, delay: 2.0 }]),
  wave(23, "Many Small Teeth", 192, [{ archetype: "splitter", count: 16, cadence: 0.42 }, { archetype: "skitter", count: 40, cadence: 0.16, delay: 5.0 }]),
  wave(24, "Silent Choir", 204, [{ archetype: "veil", count: 26, cadence: 0.3 }, { archetype: "seer", count: 18, cadence: 0.38, delay: 2.0 }]),
  wave(25, "Colossus", 280, [{ archetype: "colossus", count: 1, cadence: 1.0 }, { archetype: "shieldbearer", count: 16, cadence: 0.42, delay: 3.0 }]),
  wave(26, "Triage Collapse", 220, [{ archetype: "leech", count: 28, cadence: 0.26 }, { archetype: "breaker", count: 8, cadence: 0.74, delay: 3.0 }]),
  wave(27, "Three Fronts", 236, [{ archetype: "runner", count: 32, cadence: 0.18 }, { archetype: "brute", count: 18, cadence: 0.44, delay: 1.0 }, { archetype: "glider", count: 32, cadence: 0.18, delay: 2.0 }]),
  wave(28, "Vaulted Armor", 248, [{ archetype: "bulwark", count: 10, cadence: 0.64 }, { archetype: "shieldbearer", count: 22, cadence: 0.36, delay: 2.0 }, { archetype: "carrier", count: 8, cadence: 0.68, delay: 5.0 }]),
  wave(29, "Last Dark", 260, [{ archetype: "veil", count: 32, cadence: 0.24 }, { archetype: "seer", count: 18, cadence: 0.32, delay: 2.0 }, { archetype: "breaker", count: 10, cadence: 0.58, delay: 5.0 }]),
  wave(30, "Signal Eclipse", 420, [{ archetype: "warden", count: 1, cadence: 1.0 }, { archetype: "oracle", count: 1, cadence: 1.0, delay: 5.0 }, { archetype: "colossus", count: 1, cadence: 1.0, delay: 11.0 }, { archetype: "skitter", count: 60, cadence: 0.12, delay: 2.0 }])
]);

export const signalBastionRewards = Object.freeze([
  { id: "reserve-15", label: "+15 reserves", type: "currency", amount: 15 },
  { id: "core-3", label: "+3 core integrity", type: "core", amount: 3 },
  { id: "bolt-range", label: "Bolt +10 range", type: "tower-mod", tower: "bolt", stat: "range", amount: 10 },
  { id: "ember-splash", label: "Ember +20% splash", type: "tower-mod", tower: "ember", stat: "splash", multiplier: 1.2 },
  { id: "slow-duration", label: "Frost +0.4 slow", type: "tower-mod", tower: "slow", stat: "slow.duration", amount: 0.4 },
  { id: "prism-damage", label: "Prism +18% damage", type: "tower-mod", tower: "prism", stat: "damage", multiplier: 1.18 },
  { id: "next-discount", label: "Next build 30% cheaper", type: "discount", amount: 0.3 },
  { id: "siphon-income", label: "Siphon earns more", type: "tower-mod", tower: "siphon", stat: "rewardBonus", amount: 2 },
  { id: "repair-pulse", label: "Repair core after boss", type: "core-regen", amount: 2 },
  { id: "overcharge", label: "First tower overcharges", type: "temporary", stat: "fireRate", multiplier: 1.25 }
]);

export const signalBastionCampaign = Object.freeze({
  id: "signal-bastion-campaign",
  nodes: [
    { id: "causeway-01", mapId: "emberCauseway", preset: "default", title: "Hold the Causeway" },
    { id: "canal-02", mapId: "frostCanal", preset: "hard", title: "Freeze the Canal" },
    { id: "spiral-03", mapId: "obsidianSpiral", preset: "endless", title: "Break the Spiral" }
  ]
});

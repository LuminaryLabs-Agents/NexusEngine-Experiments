export const STYLE_DESCRIPTORS = [
  ["stone-surface-texture-kit", "surface", "stone"], ["wet-stone-texture-kit", "surface", "wet"], ["ancient-crack-texture-kit", "surface", "cracks"], ["moss-edge-texture-kit", "surface", "moss"], ["mineral-vein-texture-kit", "surface", "mineral"], ["eroded-edge-texture-kit", "surface", "eroded"], ["sediment-layer-texture-kit", "surface", "sediment"], ["rubble-noise-texture-kit", "surface", "rubble"], ["carved-rune-texture-kit", "surface", "runes"], ["aged-metal-texture-kit", "surface", "metal"],
  ["lantern-light-style-kit", "lighting", "lantern"], ["torch-flicker-style-kit", "lighting", "torch"], ["cyan-rune-light-style-kit", "lighting", "cyan"], ["door-goal-glow-style-kit", "lighting", "door"], ["pressure-plate-glow-style-kit", "lighting", "plate"], ["valve-proximity-glow-style-kit", "lighting", "valve"], ["creature-alert-light-style-kit", "lighting", "creature"], ["water-reflection-light-kit", "lighting", "water"], ["cave-depth-vignette-kit", "lighting", "vignette"], ["foreground-shadow-style-kit", "lighting", "shadow"],
  ["stone-dust-style-kit", "particles", "dust"], ["scrape-spark-style-kit", "particles", "scrape"], ["impact-chip-style-kit", "particles", "chip"], ["water-splash-style-kit", "particles", "splash"], ["bubble-column-style-kit", "particles", "bubble"], ["water-mist-style-kit", "particles", "mist"], ["foam-line-style-kit", "particles", "foam"], ["rune-spark-style-kit", "particles", "rune"], ["door-awakening-style-kit", "particles", "awakening"], ["sound-wave-particle-style-kit", "particles", "sound"],
  ["platform-silhouette-style-kit", "silhouette", "platform"], ["cave-wall-silhouette-kit", "silhouette", "wall"], ["foreground-stalactite-kit", "silhouette", "stalactite"], ["background-pillar-style-kit", "silhouette", "pillar"], ["machine-silhouette-style-kit", "silhouette", "machine"], ["door-monolith-style-kit", "silhouette", "monolith"], ["chain-silhouette-style-kit", "silhouette", "chain"], ["creature-silhouette-style-kit", "silhouette", "creature"], ["player-silhouette-style-kit", "silhouette", "player"], ["block-silhouette-style-kit", "silhouette", "block"],
  ["ancient-sluice-theme-kit", "theme", "sluice"], ["blackwater-theme-kit", "theme", "blackwater"], ["forgotten-temple-theme-kit", "theme", "temple"], ["subterranean-survival-theme-kit", "theme", "survival"], ["acoustic-stealth-theme-kit", "theme", "acoustic"], ["physical-puzzle-theme-kit", "theme", "physical"], ["blue-machine-magic-theme-kit", "theme", "blue"], ["warm-vs-cold-light-theme-kit", "theme", "warmcold"], ["reactive-world-theme-kit", "theme", "reactive"], ["steam-polish-style-composition-kit", "composition", "polish"]
].map(([id, layer, token], order) => ({ id, layer, token, order }));

export const STYLE = {
  descriptors: STYLE_DESCRIPTORS,
  palette: {
    stoneBase: "#172130",
    stoneMid: "#223144",
    stoneDark: "#0b111a",
    wetStone: "#0b1820",
    blackwater: "#03111f",
    cyan: "#57ddff",
    rune: "#9df7ff",
    warm: "#ffd166",
    danger: "#ff4f5f",
    moss: "#405b3f",
    mineral: "#9ff5ff"
  },
  movement: {
    normalMaxSpeed: 136,
    sneakMaxSpeed: 64,
    groundAccel: 1550,
    airAccel: 850,
    jumpVelocity: -410
  }
};

export function seededNoise(seed) {
  let value = seed | 0;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  return Math.abs(value % 1000) / 1000;
}

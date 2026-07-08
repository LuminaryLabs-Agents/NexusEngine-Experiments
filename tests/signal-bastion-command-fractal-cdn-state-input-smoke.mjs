import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createSignalBastionCommandFractalDomainKit } from "../games/signal-bastion/src/signal-bastion-command-fractal-domain-kit.js";

const boot = readFileSync("games/signal-bastion/src/boot.js", "utf8");
const renderer = readFileSync("games/signal-bastion/src/renderer-canvas.js", "utf8");
const kitSource = readFileSync("games/signal-bastion/src/signal-bastion-command-fractal-domain-kit.js", "utf8");
const manifest = readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8");

assert.match(boot, /https:\/\/cdn\.jsdelivr\.net\/gh\/LuminaryLabs-Dev\/NexusEngine@main\/src\/index\.js/, "Signal Bastion boot should use NexusEngine main CDN");
assert.doesNotMatch(boot, /LuminaryLabs-Dev\/NexusRealtime@main\/src\/index\.js/, "Signal Bastion boot should not import the old NexusRealtime runtime CDN");
assert.match(boot, /createSignalBastionCommandFractalDomainKit/, "boot should create the command fractal domain kit");
assert.match(boot, /getCommandFractal/, "GameHost should expose command fractal state");
assert.match(boot, /getRendererHandoff/, "GameHost should expose renderer handoff state");
assert.match(boot, /signalBastionCommandFractal: commandFractal/, "presentation should expose command fractal under domain state");
assert.match(boot, /signalBastionWaveChoreography: waveChoreography/, "presentation should expose wave choreography under domain state");
assert.match(boot, /signalBastionFrontlineTactics: frontlineTactics/, "presentation should expose frontline tactics under domain state");
assert.match(renderer, /drawCommandFractal/, "renderer should have a presentation-only command fractal drawing pass");
assert.match(renderer, /presentation\.commandFractal\?\.rendererHandoff\?\.descriptors/, "renderer should consume command fractal descriptors");
assert.doesNotMatch(renderer, /createRealtimeGame|createGenericDefense|engine\./, "renderer should not own engine or domain factories");
assert.match(kitSource, /rendererConsumesDescriptorsOnly: true/, "handoff kit should declare descriptor-only renderer policy");
assert.match(kitSource, /noFrameLoopOwnership: true/, "handoff kit should reject frame-loop ownership");
assert.match(manifest, /signal-bastion-command-fractal-domain-kit/, "manifest should list the command fractal domain kit");
assert.match(manifest, /signal-bastion-frontline-tactics-domain-kit/, "manifest should list the frontline tactics domain kit");

function makeState(index) {
  return {
    activeBlueprint: index % 2 ? "flare" : "bolt",
    preset: {
      level: {
        buildOrder: [
          { id: "bolt", label: "Bolt", role: "single", cost: { credits: 90 }, color: "#8bd3ff" },
          { id: "flare", label: "Flare", role: "splash", cost: { credits: 130 }, color: "#ff7a5c" }
        ]
      }
    },
    presentation: {
      rawSnapshot: {
        map: {
          vital: { x: 830, y: 120 },
          path: [
            { x: 80, y: 420 },
            { x: 260 + index * 5, y: 330 },
            { x: 520, y: 250 - index * 3 },
            { x: 830, y: 120 }
          ],
          slots: {
            a: { x: 240, y: 260 },
            b: { x: 410, y: 305 },
            c: { x: 600, y: 215 }
          }
        },
        structures: {
          structures: {
            t0: { id: "t0", x: 235, y: 255, level: 1 + (index % 3), range: 160, color: "#8bd3ff" },
            t1: { id: "t1", x: 425, y: 305, level: 2, range: 190, color: "#6bf0b8" }
          }
        },
        agents: {
          active: Object.fromEntries(Array.from({ length: index + 1 }, (_, n) => [`e${n}`, { id: `e${n}`, x: 90 + n * 62, y: 410 - n * 30, health: 60, maxHealth: 100, speed: 1 + n * 0.05 }]))
        },
        economy: { wallet: { credits: 120 + index * 25 } },
        session: { waveIndex: index, waveActive: index % 2 === 0 },
        level: { waves: Array.from({ length: 12 }, (_, n) => ({ enemies: Array.from({ length: 2 + n % 3 }, () => ({ type: "crawler" })) })) }
      }
    }
  };
}

const kit = createSignalBastionCommandFractalDomainKit();
for (const [index, state] of Array.from({ length: 10 }, (_, n) => makeState(n)).entries()) {
  const snapshot = kit.describe(state);
  assert.equal(snapshot.rendererNeutral, true, `case ${index} should stay renderer neutral`);
  assert.equal(snapshot.rendererHandoff.policy.rendererConsumesDescriptorsOnly, true, `case ${index} handoff should be descriptor-only`);
  assert.ok(snapshot.pathThreat.segments.length >= 3, `case ${index} should expose route threat`);
  assert.ok(snapshot.enemyIntent.threads.length >= index + 1, `case ${index} should expose enemy intent`);
  assert.equal(snapshot.commandChoices.options.length, 2, `case ${index} should expose command options`);
}

console.log("signal-bastion-command-fractal-cdn-state-input-smoke: CDN, state, and 10 intake cases passed");

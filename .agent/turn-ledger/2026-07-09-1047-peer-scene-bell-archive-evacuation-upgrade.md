# 2026-07-09 10:47 ET — Peer Scene Bell Archive Evacuation Upgrade

## Chosen experiment

`experiments/peer-scene-transition/`

## Why it was chosen

The latest completed upgrade on `main` was `games/rogue-lite-hellscape-siege/` with the Hellscape Obsidian Seed Vault pass. This run selected a different route.

Peer Scene Transition remains one of the least variable experience routes because its core loop is four small HTML scenes with action buttons and route exits. It is useful, but it still benefits from one stronger objective layer that makes scene progression feel more urgent and visually legible without turning the renderer or DOM into kit ownership.

The improvement adds a bell archive evacuation loop: arm warning bell towers, thread signal cords between scenes, seal archive crates, stabilize flood plank crossings, sign witness roster seals, and expose a dawn evidence ledger.

## Last upgraded experiment checked before selection

Latest commit and ledger context showed the previous completed route as `games/rogue-lite-hellscape-siege/` with the Hellscape Obsidian Seed Vault upgrade.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---|---:|---|---|---|
| `experiments/peer-scene-transition/` | Scene transition story proof | 2-5 min | HTML scene exits, action buttons, inventory tokens, visited-scene state, bell archive descriptors | No old runtime CDN in changed files | Yes through `scene-demo.js` and new bell archive entry |
| `experiments/vr-platformer-board/skyline-medevac.html` | Board-scale platform rescue | 1-3 min | Jumping, hazards, coins/oxygen, medevac descriptors | No known old CDN import found | Yes in upgraded route entry |
| `experiments/infinite-radial-terrain/` | Radial terrain flight | Open-ended | WASD flight, origin snapping, terrain LOD, shelter descriptors | No known old CDN import found | Yes in upgraded overlay entry |
| `experiments/high-fidelity-meadow/` | Procedural meadow scene | Open-ended | Camera movement, vegetation/ecology descriptors, soil health overlays | No known old CDN import found | Yes in upgraded overlay entry |
| `experiments/tiny-diffusion-lab/` | Browser diffusion lab | 3-8 min | Train/sample/checkpoint flow and museum/sample review descriptors | No known old CDN import found | Yes through Nexus diffusion/lab entries |
| `experiments/living-agent-lab/` | Agent market/civic route | 2-5 min | Agent choice, trust, permit/vendor/dispute descriptors | No known old CDN import found | Yes in upgraded overlay entry |
| `experiments/fogline-relay/` | First-person fog survey | 3-6 min | Scan targets, fog zones, timed pressure, hazards, rescue/clinic/lighthouse/tide descriptors | No known old CDN import found | Yes in upgraded overlay entries |
| `experiments/nexus-frontier-signal-isles/` | Field engineer island slice | 5-10 min | Scan, harvest, build, cargo, gates, storm/clinic/desalination descriptors | No known old CDN import found in changed files | Yes in changed entries |
| `apps/the-cavalry-of-rome/` | Painted Rome strategy map | 2-5 min | Pan/hover/dive map, army reveal, campaign readiness descriptors | No known old CDN import found | Yes in upgraded overlay entry |
| `games/signal-bastion/` | Tower defense route | 5-10 min | Tower placement, waves, range rings, supply descriptors | No known old CDN import found | Yes in upgraded overlay entry |
| `games/stonewake-depths/` | Flood rescue game | 5-10 min | Carry blocks, valve pressure, gates, survivor pings, archive descriptors | No known old CDN import found | Yes in upgraded overlay entry |
| `experiments/next-ledge/` | Grapple climb validation | 2-5 min | Grapple, ledges, swing pressure, summit/weather descriptors | No known old CDN import found | Yes in upgraded overlay entry |
| `experiments/sora-the-infinite/` | Open flight gateway | Open-ended | Flight gateway, launch rehearsal, rescue/rookery/orchard descriptors | No known old CDN import found | Yes in upgraded overlay entries |
| `experiments/zombie-orchard/` | Survival orchard slice | 3-8 min | Horde rounds, pressure, pickups, weapons, rescue descriptors | No known old CDN import found | Yes in upgraded overlay entries |
| `games/rogue-lite-hellscape-siege/` | Base siege action route | 5-12 min | Harvest, build, portals, waves, purification, forge, caravan, refuge, seed vault descriptors | No known old CDN import found in latest changed files | Yes; base route and changed entries import NexusEngine main CDN |
| `experiments/onnx-agent-lab/signal-calibration.html` | ONNX workshop calibration route | 3-6 min | Model handshake, fallback rails, tool/prompt/memory descriptors | No known old CDN import found | Yes in upgraded route entry |

## Domain ASCII tree

```txt
scene-bell-archive-evacuation-readiness-domain
├─ audible-warning-domain
│  ├─ bell-tower-anchor-domain
│  │  └─ scene-bell-tower-anchor-kit
│  └─ signal-cord-thread-domain
│     └─ scene-signal-cord-thread-kit
├─ archive-preservation-domain
│  ├─ archive-crate-domain
│  │  └─ scene-archive-crate-kit
│  └─ flood-plank-crossing-domain
│     └─ scene-flood-plank-crossing-kit
├─ witness-handoff-domain
│  ├─ witness-roster-seal-domain
│  │  └─ scene-witness-roster-seal-kit
│  └─ dawn-evidence-ledger-domain
│     └─ scene-dawn-evidence-ledger-kit
└─ renderer-handoff
   └─ scene-bell-archive-evacuation-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `scene-bell-tower-anchor-kit`
- `scene-signal-cord-thread-kit`
- `scene-archive-crate-kit`
- `scene-flood-plank-crossing-kit`
- `scene-witness-roster-seal-kit`
- `scene-dawn-evidence-ledger-kit`
- `scene-bell-archive-evacuation-renderer-handoff-kit`
- `scene-bell-archive-evacuation-readiness-domain-kit`

All reusable kit logic accepts plain scene/input state and returns serializable descriptor output. The kit boundary excludes renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, frame-loop, storage, navigation, and physics ownership.

## Files changed

Added:

- `experiments/_kits/peer-scene-transition/peer-scene-bell-archive-evacuation-kits.js`
- `experiments/peer-scene-transition/shared/scene-bell-archive-evacuation-readiness-entry.js`
- `tests/peer-scene-bell-archive-evacuation-readiness-kits-smoke.mjs`
- `tests/peer-scene-bell-archive-evacuation-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-1047-peer-scene-bell-archive-evacuation-upgrade.md`

Updated:

- `experiments/peer-scene-transition/index.html`
- `experiments/peer-scene-transition/crossroads.html`
- `experiments/peer-scene-transition/forest.html`
- `experiments/peer-scene-transition/bridge.html`
- `experiments/_shared/nexus-gallery-data.js`

## Tests added

- `tests/peer-scene-bell-archive-evacuation-readiness-kits-smoke.mjs`
  - 10 intake cases.
  - Validates all six descriptor families.
  - Validates readiness bounds, flood-pressure bounds, phase enums, descriptor counts, JSON safety, renderer handoff policy, and ownership exclusions.

- `tests/peer-scene-bell-archive-evacuation-cdn-state-input-smoke.mjs`
  - 10 simulated state/input cases.
  - Validates all four scene pages advertise the route marker and load the new entry.
  - Validates the changed entry imports NexusEngine main CDN, exposes `GameHost` readiness/tree/handoff functions, avoids old `NexusRealtime@`, and keeps the reusable kit file renderer-neutral.

## Validation results

Scratch local Node validation passed before connector writes:

```txt
node --check experiments/_kits/peer-scene-transition/peer-scene-bell-archive-evacuation-kits.js
node --check experiments/peer-scene-transition/shared/scene-bell-archive-evacuation-readiness-entry.js
node --check tests/peer-scene-bell-archive-evacuation-readiness-kits-smoke.mjs
node --check tests/peer-scene-bell-archive-evacuation-cdn-state-input-smoke.mjs
node tests/peer-scene-bell-archive-evacuation-readiness-kits-smoke.mjs
node tests/peer-scene-bell-archive-evacuation-cdn-state-input-smoke.mjs
```

Observed output:

```txt
Peer scene bell archive evacuation readiness kits smoke passed 10 intake cases.
Peer scene bell archive evacuation CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a cloned workspace because this shell runtime could not resolve `github.com`; this is a connector-only limitation, not a kit failure.

## NexusRealtime import audit

Changed files:

- `scene-bell-archive-evacuation-readiness-entry.js` imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- `scene-bell-archive-evacuation-readiness-entry.js` does not import `NexusRealtime@`.
- `peer-scene-bell-archive-evacuation-kits.js` has no runtime import and no renderer/browser ownership.
- `scene-demo.js` already imports NexusEngine main CDN.
- The four changed route pages load the new entry after the existing time capsule courier entry.
- No changed file adds an old NexusRealtime CDN dependency.

## Cleanup pass

- Preserved all four scene pages and existing transition logic.
- Preserved existing oracle, clue pressure, evidence ritual, archive escort, witness shelter, flood rescue, and time capsule courier passes.
- Added the new route marker consistently to all four scene hosts.
- Composed `GameHost.getRendererHandoff()` instead of replacing the previous handoff.
- Kept DOM panel rendering in the route entry and kept the reusable kits pure.
- No destructive deletes.

## Non-game handling

The chosen route is a small experience-driven web route, not a full arcade game. It was not deleted or renamed. The lesson is that scene-host experiments can become more playable when each route layer adds a concrete objective pressure instead of only more diagnostic descriptors.

## Next safe ledge

Bridge the bell archive evacuation descriptors into actual scene actions: a bell-ringing action at camp, signal cord repair at crossroads, archive crate sealing at forest, and dawn evidence handoff at bridge so readiness changes through explicit button actions instead of inferred visited/inventory state.

# 2026-07-09 04:43 ET — Peer Scene Transition time capsule courier upgrade

## Chosen experiment

`experiments/peer-scene-transition/`

## Why it was chosen

The latest completed upgrade on `main` was `experiments/infinite-radial-terrain/`, so this run selected a different route. Peer Scene Transition is a compact story-chain experiment with strong scene handoff infrastructure, but its camp/crossroads/forest/bridge pages still benefit from a more legible collectible-preservation objective that travels across scenes. This upgrade adds a memory-preservation courier layer: keepsake tags, archive satchels, lantern courier threads, gate seals, oath ledgers, and a final time capsule threshold.

## Last upgraded experiment

```txt
experiments/infinite-radial-terrain/
2026-07-09-0430-infinite-radial-terrain-skybridge-shelter-upgrade.md
```

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import audit | NexusEngine main CDN audit |
| --- | --- | --- | --- | --- | --- |
| `experiments/peer-scene-transition/` | Story-scene orchestration route. | Short scene chain. | Scene exits, tokens, inventory, transitions, flood rescue descriptors, and time capsule courier descriptors. | Changed files avoid old runtime CDN. | This run adds NexusEngine main CDN in the time capsule courier pass. |
| `experiments/vr-platformer-board/` | Floating XR platformer board. | Short platformer board. | Lane movement, jump, collectibles, hazards, comfort, traversal, companion rescue descriptors. | Shared compatibility naming may remain. | Route runtime imports NexusEngine main CDN. |
| `experiments/infinite-radial-terrain/` | Radial terrain tessellation flight. | Open-ended traversal demo. | WASD flight, LOD, origin snapping, survey, basecamp, avalanche, observatory evacuation, and skybridge shelter overlays. | Latest completed upgrade, skipped. | Recent skybridge pass uses NexusEngine main CDN. |
| `experiments/high-fidelity-meadow/` | Procedural meadow composition. | Open-ended scene. | Terrain, wind, vegetation, creatures, water-management overlays. | Existing old names may remain in shared files. | Recent creek irrigation pass uses NexusEngine main CDN. |
| `experiments/tiny-diffusion-lab/` | Browser CPU diffusion proof. | Lab session. | Prepare, train, sample, checkpoint, training mission descriptors, sample clinic descriptors. | Recent changed files avoid old runtime CDN. | Recent pass uses NexusEngine main CDN. |
| `experiments/living-agent-lab/` | Market trust agent lab. | Short lab loop. | ONNX/fallback agent, witness/evidence/restitution descriptors. | Recent changed files avoid old runtime CDN. | Recent pass uses NexusEngine main CDN. |
| `experiments/fogline-relay/` | First-person survey and rescue pressure. | Short objective loop. | Movement, scanning, relay repair, medical, battery, ambulance, and clinic overlays. | Existing legacy names may remain outside changed passes. | Recent overlays use NexusEngine main CDN. |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer island systems route. | Short systems slice. | Scan, harvest, build, pressure, gates, beacons, harbor/lighthouse overlays, storm surge relay. | Recent changed files avoid old runtime CDN. | Recent overlay imports NexusEngine main CDN. |
| `experiments/domain-mana-rift/` | Scoped-domain rift arena. | Very short rift objective scene. | Shared enemy, health, guard, mana, status, zone, vegetation, interaction kits, spire stabilization descriptors. | Recent changed files avoid old runtime CDN. | Recent pass uses NexusEngine main CDN. |
| `apps/the-cavalry-of-rome/` | Painterly Roman strategy visual proof. | Open-ended map inspection. | Pan, hover, dive, army descriptors, logistics, diplomacy, field hospital, grain convoy, and aqueduct sabotage overlays. | Recent changed files avoid old runtime CDN. | Recent aqueduct sabotage pass uses NexusEngine main CDN. |
| `games/signal-bastion/` | 2.5D tower defense. | Short wave session. | Tower cards, placement, waves, field hospital overlays. | Previous pass audited changed entry only. | Recent field hospital pass uses NexusEngine main CDN. |
| `games/stonewake-depths/` | Flooded cavern puzzle platformer. | Short puzzle rescue loop. | Block carry, valves, plates, survivor echo pings, chalk marks, air pockets, rope lifts. | Previous pass audited changed entry only. | Recent flood rescue pass uses NexusEngine main CDN. |
| `experiments/next-ledge/` | Grapple climb route. | Short climb run. | Aim, grapple, swing, stamina, ledge route, glacier supply descriptors. | Recent changed files avoid old runtime CDN. | Recent pass uses NexusEngine main CDN. |
| `experiments/sora-the-infinite/` | Aerial traversal / redirect route. | Short gateway/open traversal. | Flight preview, visual domains, migration overlays. | Existing legacy names may remain outside changed pass. | Recent rookery pass uses NexusEngine main CDN. |
| `experiments/zombie-orchard/` | Orchard survival slice. | Short survival round. | WASD movement, sprint, dodge, apple collection, gear use, horde pressure, cure crafting, safehouse evacuation, well restoration, seed bank quarantine descriptors. | Recent changed files avoid old runtime CDN. | Recent seed bank pass uses NexusEngine main CDN. |
| `games/rogue-lite-hellscape-siege/` | Action RPG/base siege route. | Short wave/action slice. | Portals, inventory, harvesting, building, wave defense, forge/caravan/refuge descriptors. | Existing legacy names may remain outside changed pass. | Recent refuge pass uses NexusEngine main CDN. |
| `experiments/BirdRun/` | Canvas bird runner. | Short runner. | Lane switching, wingbeat altitude, grove obstacles, nestling rescue, scoring. | Recent changed files avoid old runtime CDN. | Recent canopy rescue pass uses NexusEngine main CDN. |

## Domain ASCII tree

```txt
scene-time-capsule-courier-readiness-domain
├─ memory-preservation-domain
│  ├─ keepsake-tag-domain
│  │  └─ scene-keepsake-tag-kit
│  └─ archive-satchel-domain
│     └─ scene-archive-satchel-kit
├─ courier-routing-domain
│  ├─ lantern-courier-thread-domain
│  │  └─ scene-lantern-courier-thread-kit
│  └─ gate-seal-domain
│     └─ scene-gate-seal-kit
├─ final-handoff-domain
│  ├─ oath-ledger-domain
│  │  └─ scene-oath-ledger-kit
│  └─ time-capsule-threshold-domain
│     └─ scene-time-capsule-threshold-kit
└─ renderer-handoff
   └─ scene-time-capsule-courier-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
scene-keepsake-tag-kit
scene-archive-satchel-kit
scene-lantern-courier-thread-kit
scene-gate-seal-kit
scene-oath-ledger-kit
scene-time-capsule-threshold-kit
scene-time-capsule-courier-renderer-handoff-kit
scene-time-capsule-courier-readiness-domain-kit
```

The reusable kit accepts scene id, inventory, visited scenes, log entries, actions, progress, pressure, and memory-derived state. It emits deterministic serializable descriptors only and explicitly avoids renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, storage, navigation, and frame-loop ownership.

## Files changed

```txt
experiments/peer-scene-transition/index.html
experiments/peer-scene-transition/crossroads.html
experiments/peer-scene-transition/forest.html
experiments/peer-scene-transition/bridge.html
experiments/peer-scene-transition/shared/scene-time-capsule-courier-readiness-kits.js
experiments/peer-scene-transition/shared/scene-time-capsule-courier-readiness-entry.js
tests/scene-time-capsule-courier-readiness-kits-smoke.mjs
tests/scene-time-capsule-courier-cdn-state-input-smoke.mjs
.agent/turn-ledger/2026-07-09-0443-peer-scene-time-capsule-courier-upgrade.md
```

## Tests added

```txt
tests/scene-time-capsule-courier-readiness-kits-smoke.mjs
tests/scene-time-capsule-courier-cdn-state-input-smoke.mjs
```

## Validation results

Scratch Node validation passed before connector writes:

```txt
node --check experiments/peer-scene-transition/shared/scene-time-capsule-courier-readiness-kits.js
node --check experiments/peer-scene-transition/shared/scene-time-capsule-courier-readiness-entry.js
node --check tests/scene-time-capsule-courier-readiness-kits-smoke.mjs
node --check tests/scene-time-capsule-courier-cdn-state-input-smoke.mjs
node tests/scene-time-capsule-courier-readiness-kits-smoke.mjs
node tests/scene-time-capsule-courier-cdn-state-input-smoke.mjs
```

Observed outputs:

```txt
Peer Scene Transition time capsule courier readiness kits smoke passed 10 intake cases.
Peer Scene Transition time capsule courier CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a cloned workspace in this connector pass because the local runtime could not resolve `github.com`. The new smoke files are designed to run from the repo root after checkout.

## NexusRealtime import audit

Changed files do not import:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js
```

The new entry imports:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

## Cleanup pass

- Added one coherent collectible-preservation objective layer instead of another generic story glow overlay.
- Kept deterministic descriptor logic in `scene-time-capsule-courier-readiness-kits.js`.
- Kept DOM overlay, style injection, and `GameHost` patching in `scene-time-capsule-courier-readiness-entry.js`.
- Loaded the pass on the active lightweight story-chain pages: `index.html`, `crossroads.html`, `forest.html`, and `bridge.html`.
- Left `shrine.html` untouched because it is a separate desert/beach Three.js route rather than the compact scene-kit shell.
- Composed `GameHost.getRendererHandoff()` without replacing previous oracle, clue pressure, evidence ritual, archive escort, witness shelter, or flood rescue handoffs.

## Non-game handling

`Peer Scene Transition` is a small experience-driven web scene chain, so it was preserved and upgraded. The lesson from this pass is that scene-chain experiments gain replay value when scene state drives visible preservation/courier descriptors rather than only listing transition buttons.

## Next safe ledge

Make the time capsule descriptors actionable: allow the user to seal a keepsake tag, approve a courier thread, and spend one inventory clue to open a gate seal. Keep decision state in the new kits and let the route renderer consume descriptors only.

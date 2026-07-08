# Signal Bastion Frontline Tactics Readability Upgrade

## Summary

- Chosen experiment/game: `games/signal-bastion/`
- Upgrade: added renderer-neutral frontline tactics readability kits and integrated them into the existing Signal Bastion composed renderer handoff.
- Last upgraded experiment avoided: `experiments/tropical-island-scene/`
- Push target: `LuminaryLabs-Agents/NexusEngine-Experiments` `main`

## Why this experiment was chosen

The latest completed upgrade on `main` before this run was `.agent/turn-ledger/2026-07-08-0847-tropical-weather-shelter-upgrade.md`, which chose `experiments/tropical-island-scene/`. This run picked a different route. `games/signal-bastion/` already had strong command and wave choreography descriptor layers, but the actual frontline tactical choices were still implicit: which empty slot is worth building on now, whether the tower role mix is balanced, where to intercept pressure, which boss or elite deserves focus, when current damage is overkill, and when a weak tower is a salvage candidate.

## Last upgraded experiment

```txt
experiments/tropical-island-scene/
```

Latest prior ledger marker:

```txt
.agent/turn-ledger/2026-07-08-0847-tropical-weather-shelter-upgrade.md
```

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller and camera diagnostic sandbox upgraded with arena, locomotion, and camera composition readability. | Short sandbox, continuous. | WASD, spring camera, jump/backpedal/yaw, landing patches, focus ribbons, shoulder wedges, occlusion veils, comfort meters. | No changed-runtime old CDN. | Yes. |
| `experiments/peer-scene-transition/` | Scene transition and puzzle decision demo upgraded with oracle route forecasting. | Short puzzle loop. | Scene actions, exits, inventory, gates, local decision cues, future route forecast, pressure clocks, resource maps, ending readiness. | No changed-runtime old CDN in changed overlay. | Yes. |
| `apps/the-cavalry-of-rome/` | Strategy/campaign map prototype. | Medium campaign loop. | World actions, scouting, reinforcement, objectives. | No changed-runtime old CDN. | Yes. |
| `experiments/vr-platformer-board/` | Flat board platformer with VR-style comfort constraints. | Short platformer loop. | Move, jump, coins, hazards, exit, route risk. | No changed-runtime old CDN. | Yes. |
| `experiments/next-ledge/` | Grapple/swing traversal experiment. | Short traversal loop. | Grapple, swing, cargo, fall pressure, traversal readability, anchor timing. | Legacy base `session.js` still imports old NexusRealtime; changed wrapper imports NexusEngine main CDN. | Yes for changed wrapper. |
| `experiments/infinite-radial-terrain/` | Radial terrain flight and survey route. | Continuous flight sandbox. | WASD flight, terrain LOD, survey, altitude, route tasks, wayfinding. | No changed-runtime old CDN. | Yes. |
| `experiments/high-fidelity-meadow/` | Living meadow scene upgraded into a light pasture route planning micro experience. | Passive/short exploration, continuous. | Grass, flowers, sheep, ecology cues, grazing route scores, forage priorities, comfort arcs, water threads, gate return, shelter bands. | No changed-runtime old CDN. | Yes. |
| `experiments/fogline-relay/` | Fogline relay scan loop. | Short relay loop. | Move, scan, relays, wraith pressure, retreat. | No changed-runtime old CDN. | Yes. |
| `experiments/nexus-frontier-signal-isles/` | First-person survival/build signal-island prototype upgraded with expedition readiness. | Medium objective loop. | Move, scan, harvest, build, survive, unlock, carry cargo, activate beacon, read expedition runways. | No changed-runtime old CDN. | Yes. |
| `experiments/sora-the-infinite/` | Route-preview and launch/flightplan gateway. | Short planning loop. | Preview, preflight, flightplan, launch cues. | No changed-runtime old CDN. | Yes. |
| `experiments/zombie-orchard/` | Orchard survival/foraging loop. | Short wave loop. | Move, collect, gear, boss omen, safe harvest. | No changed-runtime old CDN. | Yes. |
| `experiments/tropical-island-scene/` | Tropical island lagoon scene upgraded with weather shelter readability. | Passive/short orbit exploration. | Orbit, fish, coconuts, beachcomber cues, lagoon navigation, storm fronts, shelter canopies, tide escape, wave warnings, supply caches, dusk return. | Legacy local ProtoKit import-map remains for old stack. | Yes for new overlays. |
| `games/signal-bastion/` | 2.5D tower-defense game upgraded with command, wave choreography, and frontline tactics readability. | 30-wave game. | Place/upgrade/sell towers, start waves, defend the vital, read command choices, wave cadence, and frontline build/intercept/salvage decisions. | No changed-runtime old CDN. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Rogue-lite survival siege. | Medium survival/extraction loop. | Harvest, craft, build, defend, extract. | No changed-runtime old CDN. | Yes. |

## Domain ASCII tree

```txt
signal-bastion-frontline-tactics-readability-domain
├─ placement-intent-domain
│  ├─ build-slot-value-domain
│  │  └─ bastion-build-slot-value-field-kit
│  └─ tower-role-balance-domain
│     └─ bastion-tower-role-balance-ribbon-kit
├─ intercept-response-domain
│  ├─ intercept-zone-domain
│  │  └─ bastion-intercept-zone-bracket-kit
│  └─ boss-focus-domain
│     └─ bastion-boss-focus-lens-kit
├─ economy-timing-domain
│  ├─ overkill-dampening-domain
│  │  └─ bastion-overkill-dampening-chip-kit
│  └─ salvage-window-domain
│     └─ bastion-salvage-window-flag-kit
└─ renderer-handoff
   └─ bastion-frontline-tactics-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
bastion-build-slot-value-field-kit
bastion-tower-role-balance-ribbon-kit
bastion-intercept-zone-bracket-kit
bastion-boss-focus-lens-kit
bastion-overkill-dampening-chip-kit
bastion-salvage-window-flag-kit
bastion-frontline-tactics-renderer-handoff-kit
signal-bastion-frontline-tactics-domain-kit
```

Changed:

```txt
signal-bastion boot composition
signal-bastion route shell cache bust
signal-bastion static smoke
signal-bastion command CDN smoke
run-checks suite wiring
manifest status and feature parity
```

The new kits accept plain Signal Bastion presentation/raw state snapshots and emit serializable descriptor groups. They do not import NexusEngine, NexusRealtime, DOM, browser input, Three.js, WebGL implementation classes, audio, asset loading, or frame-loop systems.

## Files changed

```txt
games/signal-bastion/src/signal-bastion-frontline-tactics-domain-kit.js
games/signal-bastion/src/boot.js
games/signal-bastion/index.html
tests/signal-bastion-frontline-tactics-domain-kits-smoke.mjs
tests/signal-bastion-frontline-tactics-cdn-state-input-smoke.mjs
tests/signal-bastion-static-smoke.mjs
tests/signal-bastion-command-fractal-cdn-state-input-smoke.mjs
tests/signal-bastion-presentation-bridge-smoke.mjs
scripts/run-checks.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-0858-signal-bastion-frontline-tactics-upgrade.md
```

## Tests added

```txt
tests/signal-bastion-frontline-tactics-domain-kits-smoke.mjs
tests/signal-bastion-frontline-tactics-cdn-state-input-smoke.mjs
```

The kit smoke contains 10 intake cases and checks:

```txt
build slot value fields
tower role balance ribbons
intercept zone brackets
boss focus lenses
overkill dampening chips
salvage window flags
renderer handoff counts
serializable descriptor boundaries
renderer ownership boundaries
```

The CDN/state/input smoke contains 10 simulated state cases and checks:

```txt
NexusEngine main CDN import
old NexusRealtime runtime CDN absence
frontline tactics import wiring
GameHost.getFrontlineTactics exposure
GameHost renderer handoff composition
route shell cache bust
run-checks wiring
renderer-neutral kit ownership
```

## Validation results

- Added 10-case kit smoke coverage for the Signal Bastion frontline tactics readability domain.
- Added 10-case CDN/state/input coverage for the changed boot, route shell, GameHost patch, and descriptor handoff.
- Refreshed existing Signal Bastion static, command-fractal CDN, and presentation-bridge smoke checks to account for the new composed domain and NexusEngine wording.
- Wired both new smoke files into `scripts/run-checks.mjs` for full and deploy validation.
- Connector-only run did not execute a local shell test runner. The intended validation commands are:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- `games/signal-bastion/src/boot.js` imports NexusEngine main via:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

- The changed Signal Bastion boot does not import:

```txt
LuminaryLabs-Dev/NexusRealtime@main/src/index.js
```

- Existing ProtoKit URLs still reference `NexusRealtime-ProtoKits`, which is a kit source compatibility dependency and not the old core runtime import.
- The reusable frontline tactics kit file does not import NexusRealtime, NexusEngine, DOM, Three.js, WebGL implementation classes, audio, asset loading, or frame-loop systems.

## Cleanup pass

- Avoided creating a versioned `signal-bastion-v2` route.
- Kept tactical descriptor generation in `signal-bastion-frontline-tactics-domain-kit.js`.
- Reused the existing Canvas presentation by emitting compatible descriptor kinds: `tower-synergy-cell-set`, `economy-flow-ribbon-set`, `path-threat-gradient`, `enemy-intent-thread-set`, and `wave-readiness-glyph`.
- Kept renderer code presentation-only; no renderer mutation or simulation ownership was added.
- Updated the canonical manifest instead of adding parallel metadata.
- Kept the existing command and wave choreography domains intact, then composed frontline tactics beside them.

## Non-game handling

`games/signal-bastion/` is a small experience-driven web game and was not deleted, renamed, or destructively refactored. The route is trying to prove a ProtoKit-backed tower-defense loop with browser-local input/render bridging; this pass preserved that proof and added a clearer tactical decision layer.

## Next safe ledge

Fold command, wave choreography, and frontline tactics into a single `signal-bastion-battlefield-readability-domain-kit` facade that delegates to the three existing domains while preserving their atomic internal boundaries and descriptor-only renderer handoff.

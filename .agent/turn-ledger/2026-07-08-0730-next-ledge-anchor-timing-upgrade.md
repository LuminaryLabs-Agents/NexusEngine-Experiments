# Next Ledge Anchor Timing Readability Upgrade

## Summary

- Chosen experiment: `experiments/next-ledge/`
- Upgrade: added renderer-neutral anchor timing readability kits and integrated their descriptor handoff into the existing Three/diegetic route.
- Last upgraded experiment avoided: `experiments/infinite-radial-terrain/`
- Push target: `LuminaryLabs-Agents/NexusEngine-Experiments` `main`

## Why this experiment was chosen

The last completed upgrade was `infinite-radial-terrain`, so this run selected a different route. `next-ledge` already had route-cargo and traversal readability descriptors, but it still left the most important grapple decisions implicit: when to release, which line of sight is worth taking, where energy pockets are, when wall bounces are becoming dangerous, how committed the next stair of anchors is, and how close the fail floor is. This made it a strong candidate for a massive readability improvement without replacing useful existing functionality.

## Last upgraded experiment

```txt
experiments/infinite-radial-terrain/
```

Latest prior commit marker:

```txt
fb5375cfcb4f69c7ff407f845aa3ff78cbda6888 Log infinite radial terrain wayfinding upgrade
```

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller and locomotion debug sandbox. | Short sandbox, continuous. | WASD, spring camera, jump/backpedal/yaw readability. | No changed-runtime old CDN. | Yes. |
| `experiments/peer-scene-transition/` | Scene transition and puzzle decision demo. | Short puzzle loop. | Scene actions, exits, inventory, gates, decision cues. | No changed-runtime old CDN. | Yes. |
| `apps/the-cavalry-of-rome/` | Strategy/campaign map prototype. | Medium campaign loop. | World actions, scouting, reinforcement, objectives. | No changed-runtime old CDN. | Yes. |
| `experiments/vr-platformer-board/` | Flat board platformer with VR-style comfort constraints. | Short platformer loop. | Move, jump, coins, hazards, exit, route risk. | No changed-runtime old CDN. | Yes. |
| `experiments/next-ledge/` | Grapple/swing traversal experiment. | Short traversal loop. | Grapple, swing, cargo, fall pressure, traversal readability, anchor timing. | Legacy base `session.js` still imports old NexusRealtime; changed wrapper imports NexusEngine main CDN. | Yes for changed wrapper. |
| `experiments/infinite-radial-terrain/` | Radial terrain flight and survey route. | Continuous flight sandbox. | WASD flight, terrain LOD, survey, altitude, route tasks, wayfinding. | No changed-runtime old CDN. | Yes. |
| `experiments/high-fidelity-meadow/` | Living meadow scene. | Passive/short exploration. | Grass, flowers, sheep, ecology route cues. | No changed-runtime old CDN. | Yes. |
| `experiments/fogline-relay/` | Fogline relay scan loop. | Short relay loop. | Move, scan, relays, wraith pressure, retreat. | No changed-runtime old CDN. | Yes. |
| `experiments/nexus-frontier-signal-isles/` | First-person survival/build signal-island prototype. | Medium objective loop. | Harvest, build, cargo, pressure, beacon. | No changed-runtime old CDN. | Yes. |
| `experiments/sora-the-infinite/` | Route-preview and launch/flightplan gateway. | Short planning loop. | Preview, preflight, flightplan, launch cues. | No changed-runtime old CDN. | Yes. |
| `experiments/zombie-orchard/` | Orchard survival/foraging loop. | Short wave loop. | Move, collect, gear, boss omen, safe harvest. | No changed-runtime old CDN. | Yes. |
| `experiments/tropical-island-scene/` | Tropical island lagoon scene. | Passive/short exploration. | Orbit, fish, coconuts, reef, beachcomber, lagoon cues. | Legacy local ProtoKit import-map remains for old stack. | Yes for new overlays. |
| `games/signal-bastion/` | Tower-defense wave game. | 30-wave game. | Place/upgrade towers, waves, leak risk, reserves. | No changed-runtime old CDN. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Rogue-lite survival siege. | Medium survival/extraction loop. | Harvest, craft, build, defend, extract. | No changed-runtime old CDN. | Yes. |

## Domain ASCII tree

```txt
next-ledge-anchor-timing-readability-domain
├─ timing-intent-domain
│  ├─ release-timing-domain
│  │  └─ anchor-release-timing-dial-kit
│  └─ line-of-sight-domain
│     └─ grapple-line-of-sight-strip-kit
├─ commitment-route-domain
│  ├─ energy-pocket-domain
│  │  └─ swing-energy-pocket-kit
│  └─ route-commitment-domain
│     └─ route-commitment-stair-kit
├─ hazard-anticipation-domain
│  ├─ wall-bounce-domain
│  │  └─ wall-bounce-warning-field-kit
│  └─ fail-floor-domain
│     └─ fail-floor-proximity-wave-kit
└─ renderer-handoff
   └─ anchor-timing-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
anchor-release-timing-dial-kit
grapple-line-of-sight-strip-kit
swing-energy-pocket-kit
wall-bounce-warning-field-kit
route-commitment-stair-kit
fail-floor-proximity-wave-kit
anchor-timing-renderer-handoff-kit
next-ledge-anchor-timing-readability-domain-kit
```

The new kits accept plain snapshot/cargo input and produce plain serializable descriptor output. They do not import NexusEngine, NexusRealtime, Three.js, WebGL, DOM, browser input, audio, assets, or frame-loop ownership.

## Files changed

```txt
experiments/next-ledge/src/anchor-timing-readability-kits.js
experiments/next-ledge/src/session-cargo-extraction-upgrade.js
experiments/next-ledge/src/diegetic-effects.js
experiments/next-ledge/src/runtime-loop.js
experiments/next-ledge/index.html
tests/next-ledge-traversal-readability-cdn-state-input-smoke.mjs
tests/next-ledge-anchor-timing-readability-kits-smoke.mjs
tests/next-ledge-anchor-timing-cdn-state-input-smoke.mjs
scripts/run-checks.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-0730-next-ledge-anchor-timing-upgrade.md
```

## Tests added

```txt
tests/next-ledge-anchor-timing-readability-kits-smoke.mjs
tests/next-ledge-anchor-timing-cdn-state-input-smoke.mjs
```

The kit smoke contains 10 intake cases and checks:

```txt
release timing dials
grapple line-of-sight strips
swing energy pockets
wall bounce warning fields
route commitment stairs
fail-floor proximity waves
renderer handoff counts
serializable descriptor boundaries
```

The CDN/state-input smoke contains 10 simulated state/input surfaces and checks:

```txt
NexusEngine main CDN import
old NexusRealtime runtime CDN absence in the changed wrapper
route shell cache bust
GameHost.getAnchorTimingReadability exposure
GameHost.getRendererHandoff composition
diegetic renderer descriptor consumption
renderer-neutral kit ownership
```

## Validation results

- Added 10-case kit smoke coverage for the new anchor timing domain.
- Added 10-case CDN/state/input coverage for the changed route wrapper and host.
- Refreshed the existing traversal CDN smoke to tolerate the new anchor timing route cache-bust while preserving traversal checks.
- Wired both new tests into `npm run check` and `npm run check:deploy` through `scripts/run-checks.mjs`.
- Connector-only run did not execute a local shell test runner. The intended validation commands are:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- `session-cargo-extraction-upgrade.js` imports NexusEngine main via:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

- The changed wrapper does not import:

```txt
LuminaryLabs-Dev/NexusRealtime@main/src/index.js
```

- The legacy base route file `experiments/next-ledge/src/session.js` still imports old NexusRealtime. It was not destructively replaced in this pass because the changed wrapper already provides the NexusEngine main CDN integration point and the base file owns existing traversal compatibility.
- The new reusable kit file does not import NexusRealtime, NexusEngine, DOM, Three.js, WebGL, audio, asset loading, or frame-loop systems.

## Cleanup pass

- Avoided adding a version-suffixed route.
- Kept reusable anchor timing logic in a renderer-neutral kit file.
- Kept Three.js and descriptor particles inside the existing presentation-only diegetic renderer.
- Preserved route-cargo and traversal readability outputs.
- Composed route-cargo, traversal, and anchor timing handoffs through `GameHost.getRendererHandoff()`.
- Updated the canonical manifest rather than creating duplicate route metadata.

## Non-game handling

`next-ledge` is a small experience-driven web experiment, not a complete game. It was not deleted, renamed, or destructively refactored. The route is trying to prove grapple traversal, generic cargo extraction, and descriptor-driven readability. This run preserved that proof and added a clearer anchor timing layer.

## Next safe ledge

Migrate the legacy base `experiments/next-ledge/src/session.js` from the old NexusRealtime runtime import to NexusEngine main once the remaining generic tether traversal ProtoKit compatibility path is available or safely wrapped by a local NexusEngine adapter.

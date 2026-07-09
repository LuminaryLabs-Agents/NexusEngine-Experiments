# 2026-07-09 13:31 ET — Third Person afterimage rescue upgrade

## Chosen experiment

`experiments/ThirdPersonFollowThrough/`

## Why it was chosen

The latest observed repo run before this pass was the Tiny Diffusion curriculum kiln upgrade, so this run avoided `experiments/tiny-diffusion-lab/`.

`experiments/ThirdPersonFollowThrough/` was the best target because it remained primarily a controller readability proof: useful for validating movement/camera math, but less variable, less objective-driven, and less game-like than the stronger survival, flood, flight, and field-engineer routes. The upgrade preserves the existing controller route and adds a new descriptor-only afterimage rescue layer so movement now leaves readable tactical traces, rescue flares, rope-swing arcs, signal drones, and a dawn readiness ledger.

## Last upgraded experiment

Latest observed commits before this run:

- `5a95b211517e2685a67efc005f9b8d145bfbe983` — `Log Tiny Diffusion curriculum kiln upgrade`
- `9941a3d4d167b6979a3faa2799cd399abe2f79fa` — `Update gallery for Tiny Diffusion curriculum kiln`
- `b1e2a6805b49cb16cedb1a5dc6f92d554cdbb8a0` — `Add Tiny Diffusion curriculum kiln CDN smoke`
- `7acbffcdba5b17e6deaecff8e0ac3c75188abead` — `Add Tiny Diffusion curriculum kiln kit smoke`
- `70fe9d7502f0fc81551a8b8b62ae06fd8da3c6e6` — `Add Tiny Diffusion curriculum kiln panel`

Last upgraded route inferred from those commits: `experiments/tiny-diffusion-lab/`.

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---|---:|---|---|---|
| `experiments/peer-scene-transition/` | Story-scene transition proof with bell archive evacuation overlays. | 3-6 min | Scene exits, puzzle tokens, transition state, archive evacuation descriptors. | Not found in changed-file audit | Yes in route overlays |
| `experiments/vr-platformer-board/skyline-medevac.html` | Board-scale platformer rescue pass. | 2-4 min | Jumping, coins, hazards, oxygen, medevac descriptors. | Not found in changed-file audit | Yes in medevac pass |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain tessellation. | 2-5 min | WASD flight, origin snapping, radial LOD, aquifer descriptors. | Not found in changed-file audit | Yes in upgraded overlay |
| `experiments/high-fidelity-meadow/` | Procedural meadow/ecology route. | 3-8 min | Walk/fly viewing, meadow visual systems, ecology descriptors. | Not found in changed-file audit | Yes in upgraded overlays |
| `experiments/tiny-diffusion-lab/` | Browser CPU diffusion lab. | 5-15 min | Train, sample, save/load checkpoint, curriculum kiln descriptors. | Not found in changed-file audit | Yes in latest overlay |
| `experiments/living-agent-lab/` | Market agent/trust loop. | 2-5 min | Agent action choice, trust descriptors, civic festival mediation. | Not found in changed-file audit | Yes in civic festival pass |
| `experiments/fogline-relay/` | First-person survey loop. | 3-6 min | Scan targets, fog zones, hazard pressure, signal courier descriptors. | Removed from changed route shell in prior pass | Yes in signal courier pass |
| `experiments/nexus-frontier-signal-isles/` | Field engineer island slice. | 4-8 min | Scan, harvest, build, gates, cargo, desalination descriptors. | Not found in changed-file audit | Yes in upgraded overlays |
| `apps/the-cavalry-of-rome/` | Painted Roman campaign visual proof. | 3-8 min | Pan map, hover regions, cinematic dive, army reveal, campaign overlays. | Not found in changed-file audit | Mixed route overlays; not audited this run |
| `games/signal-bastion/` | 2.5D tower defense. | 5-10 min | Tower cards, placement ghosts, range rings, supply convoy descriptors. | Not found in changed-file audit | Yes in supply convoy pass |
| `games/stonewake-depths/` | Flooded cavern rescue game. | 5-10 min | Blocks, valves, gates, rescue pings, glowworm cartography descriptors. | Not found in changed-file audit | Yes in upgraded overlays |
| `experiments/next-ledge/` | Grapple-climb validation. | 2-5 min | Grapple, swing pressure, ledge routing, drone relay rescue descriptors. | Not found in changed-file audit | Yes in upgraded overlays |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller validation route. | 2-5 min | Spring-arm camera, movement rays, traversal cues, afterimage rescue descriptors. | No in changed files | Yes in new afterimage rescue entry |
| `experiments/sora-the-infinite/` | Open aerial traversal gateway. | 3-7 min | Aerial movement, rescue overlays, radio beacon descriptors. | Not found in changed-file audit | Yes in radio beacon pass |
| `experiments/zombie-orchard/` | Survival horde slice. | 5-10 min | Rounds, horde pressure, pickups, rescue perimeter descriptors. | Not found in changed-file audit | Yes in upgraded overlays |
| `games/rogue-lite-hellscape-siege/` | Base-siege action route. | 8-15 min | Harvest, build, portals, wave defense, harvester covenant descriptors. | Not found in changed-file audit | Yes in upgraded overlays |
| `experiments/onnx-agent-lab/signal-calibration.html` | ONNX workshop calibration route. | 2-5 min | Model handshake, fallback rail, prompt intent, memory traces. | Not found in changed-file audit | Yes in signal calibration route |

## Domain ASCII tree

```txt
third-person-afterimage-rescue-readiness-domain
├─ motion-evidence-domain
│  ├─ afterimage-trace-domain
│  │  └─ third-person-afterimage-trace-kit
│  └─ landing-dust-domain
│     └─ third-person-landing-dust-puff-kit
├─ rescue-routing-domain
│  ├─ flare-waypoint-domain
│  │  └─ third-person-rescue-flare-waypoint-kit
│  └─ rope-swing-domain
│     └─ third-person-rope-swing-arc-kit
├─ extraction-handoff-domain
│  ├─ signal-drone-domain
│  │  ├─ drone-altitude-domain
│  │  │  └─ third-person-signal-drone-kit
│  └─ dawn-run-ledger-domain
│     └─ third-person-dawn-run-ledger-kit
└─ renderer-handoff
   └─ third-person-afterimage-rescue-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `third-person-afterimage-trace-kit`
- `third-person-landing-dust-puff-kit`
- `third-person-rescue-flare-waypoint-kit`
- `third-person-rope-swing-arc-kit`
- `third-person-signal-drone-kit`
- `third-person-dawn-run-ledger-kit`
- `third-person-afterimage-rescue-renderer-handoff-kit`
- `third-person-afterimage-rescue-readiness-domain-kit`

The reusable kit file explicitly excludes renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, physics engine, storage, navigation, and frame-loop ownership.

## Files changed

Added:

- `experiments/ThirdPersonFollowThrough/kits/third-person-afterimage-rescue-readiness-domain-kit.js`
- `experiments/ThirdPersonFollowThrough/app/afterimage-rescue-readiness-entry.js`
- `tests/third-person-afterimage-rescue-readiness-kits-smoke.mjs`
- `tests/third-person-afterimage-rescue-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-1331-third-person-afterimage-rescue-upgrade.md`

Changed:

- `experiments/ThirdPersonFollowThrough/app/index.js`
- `experiments/ThirdPersonFollowThrough/index.html`
- `experiments/_shared/nexus-gallery-data.js`

## Tests added

- `tests/third-person-afterimage-rescue-readiness-kits-smoke.mjs`
- `tests/third-person-afterimage-rescue-cdn-state-input-smoke.mjs`

## Validation results

Scratch validation passed before GitHub writes:

```txt
node --check experiments/ThirdPersonFollowThrough/kits/third-person-afterimage-rescue-readiness-domain-kit.js
node --check experiments/ThirdPersonFollowThrough/app/afterimage-rescue-readiness-entry.js
node --check experiments/ThirdPersonFollowThrough/app/index.js
node --check experiments/_shared/nexus-gallery-data.js
node tests/third-person-afterimage-rescue-readiness-kits-smoke.mjs
node tests/third-person-afterimage-rescue-cdn-state-input-smoke.mjs
```

Observed output:

```txt
Third Person afterimage rescue readiness kits smoke passed 10 intake cases.
Third Person afterimage rescue CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a full clone in this connector-driven run. The CDN smoke still validates the changed route import string, changed entry NexusEngine CDN import, old `NexusRealtime@` absence, GameHost accessors, reusable-kit isolation, and 10 simulated state/input cases.

## NexusRealtime import audit

Changed files:

- New `afterimage-rescue-readiness-entry.js` imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- New `afterimage-rescue-readiness-entry.js` does not import `NexusRealtime@`.
- New kit file is runtime-neutral and has no CDN import, DOM call, Three.js call, WebGL call, audio call, asset-loading call, storage call, or frame-loop ownership.
- `app/index.js` now imports the afterimage rescue pass.
- `index.html` now references the afterimage rescue pass and the updated cache-busted route app.

## Cleanup pass

- Kept the existing controller, arena, navigation, stealth, medevac, and traversal course passes intact.
- Added the new pass by composition through `GameHost.getRendererHandoff()`.
- Avoided destructive route cleanup because the experiment is a useful controller validation route.
- Updated gallery copy so the route card matches the new objective layer.

## Non-game handling

`experiments/ThirdPersonFollowThrough/` is a small experience-driven validation route, not a full game. It was not deleted or renamed. The route is trying to prove controller/camera readability, and the lesson preserved here is that a controller test becomes more useful when motion is visible as descriptor output that can be tested and consumed by a renderer without moving reusable logic into rendering code.

## Next safe ledge

Add a deeper controller-state export that records five seconds of movement snapshots and lets the afterimage rescue kits compare intended input, actor velocity, camera yaw, and recovery pad usage across time instead of deriving all descriptors from only the current frame.

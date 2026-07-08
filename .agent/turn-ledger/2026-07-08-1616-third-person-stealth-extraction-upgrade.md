# Third Person stealth extraction readiness upgrade

## Summary

Upgraded `experiments/ThirdPersonFollowThrough/` with a renderer-neutral stealth extraction readiness layer. The route now exposes patrol sight cones, noise pulses, cover islands, extraction breadcrumbs, stamina debt meters, and a final extraction commit badge as descriptor-only domain outputs.

## Chosen experiment

```txt
experiments/ThirdPersonFollowThrough/
```

## Why it was chosen

The latest repository activity before this run was the Next Ledge summit bivouac pass, so this run deliberately chose a different route. Third Person Follow Through remained one of the most diagnostic experiences in the portfolio: it had controller, debug, arena, locomotion, camera, and navigation challenge layers, but still lacked a second-order mission loop that forced the player to care about visibility, noise, cover, stamina, and extraction timing.

## Last upgraded experiment

```txt
experiments/next-ledge/
```

Latest observed upgrade surface:

```txt
summit-bivouac-readiness-renderer-handoff-pass
```

## Experiment inventory

| id | route | description | gameplay length | mechanics | old NexusRealtime import | NexusEngine main CDN |
|---|---|---|---|---|---|---|
| third-person-follow-through | `experiments/ThirdPersonFollowThrough/` | third-person controller training arena | 2-4 minutes | WASD, camera, debug rays, arena route, navigation challenge, stealth extraction | no changed-file runtime import | yes |
| peer-scene-transition | `experiments/peer-scene-transition/` | branching scene investigation route | 3-6 minutes | inventory, gates, clues, consequences | no changed-file runtime import | yes |
| the-cavalry-of-rome | `apps/the-cavalry-of-rome/` | Roman campaign command loop | 5-10 minutes | campaign actions, logistics, diplomacy | no changed-file runtime import | yes |
| vr-platformer-board | `experiments/vr-platformer-board/` | compact platformer board | 2-4 minutes | movement, jump, coins, hazards, exit, rescue | no changed-file runtime import | yes |
| next-ledge | `experiments/next-ledge/` | rope traversal and summit route | 2-5 minutes | grapple, swing, cargo, anchors, bivouac | no changed-file runtime import | yes |
| infinite-radial-terrain | `experiments/infinite-radial-terrain/` | radial terrain flight/survey route | 3-6 minutes | camera flight, LOD, wayfinding, resupply | no changed-file runtime import | yes |
| the-open-above | `experiments/the-open-above/` | free flight route | 3-8 minutes | bird flight, route readability, courier drops | no changed-file runtime import | yes |
| high-fidelity-meadow | `experiments/high-fidelity-meadow/` | meadow ecology scene | 3-6 minutes | grass, sheep, ecology, pasture routing | no changed-file runtime import | yes |
| fogline-relay | `experiments/fogline-relay/` | first-person relay rescue route | 4-8 minutes | scan, movement, relays, survivor rescue | no changed-file runtime import | yes |
| nexus-frontier-signal-isles | `experiments/nexus-frontier-signal-isles/` | island restoration mission | 5-10 minutes | scan, harvest, build, cargo, storm anchor | no changed-file runtime import | yes |
| sora-the-infinite | `experiments/sora-the-infinite/` | authored route-preview / sky rescue gateway | 1-3 minutes | preview, rehearsal, microflight, sky rescue | no changed-file runtime import | yes |
| zombie-orchard | `experiments/zombie-orchard/` | orchard survival/cure loop | 3-7 minutes | move, collect, waves, foraging, cure craft | no changed-file runtime import | yes |
| tropical-island-scene | `experiments/tropical-island-scene/` | lagoon island salvage route | 3-6 minutes | orbit, fish, coconuts, rescue, salvage | legacy local ProtoKit stack remains for old island/water imports | yes in changed overlays |
| cozy-island | `experiments/cozy-island/` | cozy castaway island | 2-5 minutes | island, campfire, smoke, clouds, comfort loop | legacy local ProtoKit stack remains for old island generation | yes in changed overlays |
| signal-bastion | `games/signal-bastion/` | 2.5D defense game | 10-20 minutes | placement, waves, command, evacuation | no changed-file runtime import | yes |
| rogue-lite-hellscape-siege | `games/rogue-lite-hellscape-siege/` | roguelite siege defense | 10-20 minutes | portals, harvesting, building, core defense, contracts | no changed-file runtime import | yes |

## Domain ASCII tree

```txt
third-person-stealth-extraction-readiness-domain
├─ threat-awareness-domain
│  ├─ patrol-sight-domain
│  │  └─ third-person-patrol-sight-cone-kit
│  └─ noise-trace-domain
│     └─ third-person-noise-trace-pulse-kit
├─ cover-and-route-domain
│  ├─ cover-island-domain
│  │  └─ third-person-cover-island-shadow-kit
│  └─ extraction-breadcrumb-domain
│     └─ third-person-extraction-breadcrumb-kit
├─ mastery-resolution-domain
│  ├─ stamina-debt-domain
│  │  └─ third-person-stamina-debt-meter-kit
│  └─ extraction-commit-domain
│     └─ third-person-extraction-commit-badge-kit
└─ renderer-handoff
   └─ third-person-stealth-extraction-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

```txt
third-person-patrol-sight-cone-kit
third-person-noise-trace-pulse-kit
third-person-cover-island-shadow-kit
third-person-extraction-breadcrumb-kit
third-person-stamina-debt-meter-kit
third-person-extraction-commit-badge-kit
third-person-stealth-extraction-renderer-handoff-kit
third-person-stealth-extraction-readiness-domain-kit
```

## Files changed

```txt
experiments/ThirdPersonFollowThrough/kits/third-person-stealth-extraction-readiness-domain-kit.js
experiments/ThirdPersonFollowThrough/app/stealth-extraction-readiness-entry.js
experiments/ThirdPersonFollowThrough/app/index.js
experiments/ThirdPersonFollowThrough/index.html
tests/third-person-stealth-extraction-readiness-kits-smoke.mjs
tests/third-person-stealth-extraction-cdn-state-input-smoke.mjs
scripts/run-checks.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-1616-third-person-stealth-extraction-upgrade.md
```

## Tests added

```txt
tests/third-person-stealth-extraction-readiness-kits-smoke.mjs
tests/third-person-stealth-extraction-cdn-state-input-smoke.mjs
```

## Validation results

Static/wired validation added:

- 10 kit smoke intake cases.
- 10 CDN/state/input intake cases.
- Asserted NexusEngine main CDN usage in the changed entry.
- Asserted old NexusRealtime runtime CDN absence in the changed entry.
- Asserted route cache marker: `stealth-extraction-readiness-v1`.
- Asserted route pass marker: `stealth-extraction-readiness-renderer-handoff-pass`.
- Asserted GameHost accessors:
  - `getStealthExtractionReadiness()`
  - `getThirdPersonStealthExtractionReadiness()`
  - `getRendererHandoff()` composition
- Asserted renderer-neutral kit boundaries.
- Registered both tests in full and deploy validation suites.

Runtime shell execution was not available in this connector run, so no local `npm run check` result is claimed.

Expected validation commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

Changed files were audited toward NexusEngine main CDN usage.

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

The new reusable kit file has no NexusRealtime, NexusEngine, DOM, browser input, Three.js, WebGL, audio, asset-loading, or frame-loop ownership. The new browser entry imports NexusEngine main CDN only as a route/runtime marker and consumes descriptors from the renderer-neutral domain.

## Cleanup pass

- Kept all stealth extraction calculations in a reusable kit file.
- Kept DOM rendering in the route entry only.
- Did not create any new branch.
- Did not remove existing navigation challenge functionality.
- Preserved existing arena, locomotion, camera-composition, and navigation challenge handoff composition.
- Updated only the canonical base route.
- No destructive changes were made.

## Non-game handling

Third Person Follow Through is a small experience-driven web game/training route, not a non-game utility. No deletion or rename was needed.

## Next safe ledge

Add a tiny scoring loop that converts stealth extraction descriptors into a deterministic post-run grade:

```txt
clean extraction
watched extraction
compromised extraction
fast route bonus
low-noise bonus
cover-chain bonus
```

That should remain separate from renderer ownership and should feed `GameHost.getState()` / replay validation rather than becoming UI-only state.

# 2026-07-08 19:31 - The Open Above Storm Shelter Upgrade

## Summary

Upgraded `experiments/the-open-above/` with a renderer-neutral storm shelter readiness loop. The route now adds ridge shelter beacons, thermal lift corridors, blanket cache warmth markers, lightning gap windows, medicine sling drops, and valley landing flares on top of the existing bird flight, terrain streaming, flight-route readability, and aerial courier layers.

## Chosen experiment

`experiments/the-open-above/`

## Why it was chosen

The latest logged upgrade before this run was `experiments/sora-the-infinite/` through the sky lighthouse pass, so this run selected a different route.

The Open Above already had high-fidelity bird flight, streaming terrain, route readability, and aerial courier descriptors, but it still lacked a human-stakes weather rescue loop. The storm shelter pass gives flight decisions a clearer objective: locate ridge shelters, ride thermals, avoid lightning gaps, deliver medicine, and align the valley landing without moving reusable logic into the renderer.

## Last upgraded experiment

`experiments/sora-the-infinite/` via sky lighthouse readiness.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---:|---:|---|---:|---:|
| `experiments/ThirdPersonFollowThrough/` | Third-person controller training arena | 2-4 min | WASD, spring-arm camera, debug rays, navigation, stealth extraction | no changed runtime import | yes via wrapper |
| `experiments/peer-scene-transition/` | Multi-scene investigation route | 5-8 min | scene travel, inventory gates, clues, evidence ritual | no changed runtime import | yes |
| `apps/the-cavalry-of-rome/` | Campaign map / command app | 8-12 min | campaign map, orders, logistics, diplomacy, field hospital | no changed pass import | yes |
| `experiments/vr-platformer-board/` | Flat VR-style platformer board | 2-4 min | move, jump, coins, hazards, escort, rescue | no changed runtime import | yes |
| `experiments/next-ledge/` | Grapple traversal route | 3-5 min | grapple, swing, cargo, rescue line, bivouac | no changed runtime import | yes |
| `experiments/infinite-radial-terrain/` | Procedural radial terrain flight | 4-7 min | camera flight, LOD rings, survey, resupply | no changed runtime import | yes |
| `experiments/the-open-above/` | Bird flight / aerial courier route | 4-7 min | flight, terrain streaming, route readability, courier, storm shelter airlift | no changed runtime import | yes |
| `experiments/high-fidelity-meadow/` | Scenic meadow route | 3-6 min | grass, flowers, sheep, flock safety, harvest festival | no changed runtime import | yes |
| `experiments/fogline-relay/` | First-person relay/scanning route | 5-8 min | movement, scan, relays, rescue, storm, radio, blackout | no changed runtime import | yes |
| `experiments/nexus-frontier-signal-isles/` | Frontier signal island route | 5-9 min | harvest, build mast, objectives, storm anchor, harbor relief | no changed runtime import | yes |
| `experiments/sora-the-infinite/` | Route preview gateway / flight-readiness lab | 2-4 min | route preview, launch rehearsal, flightplan, sky negotiation, preflight challenge, microflight trial, sky rescue, sky lighthouse | no changed runtime import | yes |
| `experiments/zombie-orchard/` | Survival orchard route | 5-8 min | move, collect, survival waves, cure crafting, safehouse evacuation | no changed runtime import | yes |
| `experiments/tropical-island-scene/` | Tropical island orbit scene | 3-6 min | orbit, lagoon navigation, reef rescue, tide salvage | legacy local island/water stack remains | yes in changed overlays |
| `experiments/cozy-island/` | Cozy generated island scene | 3-6 min | cloudbar island, campfire, castaway comfort, tidepool stewardship, turtle hatchery | legacy ProtoKits cloudbar still remains | yes in changed overlays |
| `games/signal-bastion/` | Oblique defense board | 10-15 min | placement, waves, command, evacuation, reconstruction | preserved generic defense ProtoKits | yes |
| `games/rogue-lite-hellscape-siege/` | Resource-defense roguelite board | 8-12 min | portals, harvesting, build, core defense, siegecraft, ash caravan | no changed runtime import | yes |

## Domain ASCII tree

```txt
open-above-storm-shelter-readiness-domain
├─ shelter-discovery-domain
│  ├─ ridge-shelter-domain
│  │  └─ open-above-ridge-shelter-beacon-kit
│  └─ thermal-lift-domain
│     └─ open-above-thermal-lift-corridor-kit
├─ weather-relief-domain
│  ├─ blanket-cache-domain
│  │  └─ open-above-blanket-cache-warmth-kit
│  └─ lightning-gap-domain
│     └─ open-above-lightning-gap-window-kit
├─ airlift-handoff-domain
│  ├─ medicine-sling-domain
│  │  └─ open-above-medicine-sling-drop-kit
│  └─ valley-landing-domain
│     └─ open-above-valley-landing-flare-kit
└─ renderer-handoff
   └─ open-above-storm-shelter-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `open-above-ridge-shelter-beacon-kit`
- `open-above-thermal-lift-corridor-kit`
- `open-above-blanket-cache-warmth-kit`
- `open-above-lightning-gap-window-kit`
- `open-above-medicine-sling-drop-kit`
- `open-above-valley-landing-flare-kit`
- `open-above-storm-shelter-renderer-handoff-kit`
- `open-above-storm-shelter-readiness-domain-kit`

Changed composition:

- `GameHost.getStormShelterReadiness()`
- `GameHost.getOpenAboveStormShelterReadiness()`
- `GameHost.getStormShelterReadinessTree()`
- `GameHost.getRendererHandoff()` now composes `openAboveStormShelter` and `openAboveStormShelter` descriptor counts.

## Files changed

```txt
experiments/the-open-above/open-above-storm-shelter-readiness-kits.js
experiments/the-open-above/open-above-storm-shelter-entry.js
experiments/the-open-above/index.html
tests/open-above-storm-shelter-readiness-kits-smoke.mjs
tests/open-above-storm-shelter-cdn-state-input-smoke.mjs
tests/open-above-playwright-cdn-state-input-smoke.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-1931-open-above-storm-shelter-upgrade.md
```

## Tests added

```txt
tests/open-above-storm-shelter-readiness-kits-smoke.mjs
tests/open-above-storm-shelter-cdn-state-input-smoke.mjs
```

Both new tests contain 10 intake cases.

The kit smoke validates:

```txt
ridge shelter beacon descriptors
thermal lift corridor descriptors
blanket cache warmth descriptors
lightning gap window descriptors
medicine sling drop descriptors
valley landing flare descriptors
renderer handoff descriptor counts
JSON serializability
renderer-neutral ownership policy
```

The CDN/state-input smoke validates:

```txt
NexusEngine main CDN import
old NexusRealtime runtime CDN absence in changed entry
route cache-busting
GameHost exposure
renderer handoff composition
manifest registration
validation routing through Open Above Playwright state/input smoke
10 simulated state/input outcomes
```

## Validation results

Static/local scratch validation completed before push:

- `node --check` passed for the new kit file.
- `node --check` passed for the new entry file.
- `node --check` passed for the new kit smoke.
- `node --check` passed for the new CDN/state-input smoke.
- `node --check` passed for the updated Open Above Playwright smoke.
- The new kit smoke was executed against generated files in scratch and passed all 10 intake cases.
- The new CDN/state-input smoke was executed against generated files in scratch and passed all 10 state/input cases.

Connector limitation:

- A full repo clone was not available from the execution sandbox.
- Repo-wide `npm run check` and `npm run check:deploy` were not executed in a cloned workspace.
- The new tests are wired through `tests/open-above-playwright-cdn-state-input-smoke.mjs`, which is already in the full check suite.

Expected repo commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

Changed runtime files use:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

`experiments/the-open-above/open-above-storm-shelter-entry.js` imports NexusEngine main CDN and does not import the old NexusRealtime main runtime CDN.

`experiments/the-open-above/open-above-storm-shelter-readiness-kits.js` does not import old NexusRealtime, does not touch DOM, and does not own browser input, Three.js, WebGL, audio, asset loading, or the frame loop.

Preserved legacy:

- `open-above.config.js` still points ProtoKit base imports at `LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.1/protokits` because the flight runtime still uses existing ProtoKit package URLs. This pass only migrates changed files toward NexusEngine main CDN.

## Cleanup pass

- Kept the upgrade on the canonical base route: `experiments/the-open-above/`.
- No versioned route was created.
- No destructive deletion was performed.
- Reusable storm shelter logic stayed in atomic, descriptor-only kits.
- The overlay only samples host state and presents descriptor buckets.
- Existing visual, flight-route readability, and aerial courier passes were preserved.

## Non-game handling

The Open Above is a small experience-driven web game route. No destructive cleanup was needed.

Lesson captured: a flight sandbox becomes more playable when weather pressure has a concrete airlift/shelter objective rather than only abstract route readability.

## Next safe ledge

Fold the storm shelter descriptors into the main HUD so players can see which storm rescue subgoal is blocking the safest valley landing:

```txt
ridge shelters located
thermal lift found
blanket caches warm
lightning gaps clear
medicine sling aligned
valley flares lined up
```

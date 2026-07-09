# 2026-07-08 23:28 - Cozy Island lagoon lantern rescue readiness upgrade

## Summary

Upgraded `experiments/cozy-island/` after the latest completed ledger showed `experiments/zombie-orchard/` well restoration work. This run intentionally chose a different route and added a lagoon lantern rescue objective layer: lantern buoy chains, firefly waypoints, rain tarp anchors, woven fish traps, signal kite spools, and an outrigger pickup window.

## Chosen experiment

`experiments/cozy-island/`

## Why it was chosen

- The latest completed ledger read was `experiments/zombie-orchard/`, so this run avoided repeating that route.
- Cozy Island is still one of the least game-like routes in the inventory because its base interaction is a passive cloudbar island with campfire, smoke, grass, and clouds.
- It already had castaway, tidepool, and sea turtle descriptor overlays, but the route still needed a stronger night rescue objective with clearer visual variety.
- The new pass keeps reusable logic out of the renderer and uses a NexusEngine main CDN entry overlay.

## Last upgraded experiment

`experiments/zombie-orchard/`

Latest completed ledger read:

- `.agent/turn-ledger/2026-07-08-2313-zombie-well-restoration-upgrade.md`

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller lab | Short sandbox | WASD, jump, camera, debug rays, navigation, stealth extraction, medevac | No old runtime CDN in recent overlays | Yes |
| `experiments/peer-scene-transition/` | Scene transition narrative route | Short route chain | scene gates, inventory, decisions, archive/evidence escort | No old runtime CDN in recent overlays | Yes |
| `apps/the-cavalry-of-rome/` | Campaign command app | Medium strategy loop | campaign map, logistics, orders, field hospital, grain convoy | Legacy bridge pockets preserved | Yes in passes |
| `experiments/vr-platformer-board/` | Small VR comfort platformer board | 2-5 minute loop | A/D, jump, coins, hazards, companion rescue | No old runtime CDN in route shell | Yes |
| `experiments/next-ledge/` | Grapple traversal route | 3-6 minute loop | swing, cargo, route rescue, ravine evacuation, summit bivouac | No changed-runtime audit in this run | Yes |
| `experiments/infinite-radial-terrain/` | Radial terrain flight/survey | Open-ended | camera flight, LOD rings, survey/basecamp | No changed-runtime audit in this run | Yes |
| `experiments/the-open-above/` | Aerial flight route | Open-ended | bird/balloon flight, terrain streaming, courier/shelter overlays | No changed-runtime audit in this run | Yes |
| `experiments/high-fidelity-meadow/` | Meadow ecology scene | Passive/open-ended | grass, flowers, sheep, pollinator/night watch overlays | No changed-runtime audit in this run | Yes |
| `experiments/fogline-relay/` | Relay scanning and repair route | 5-8 minute loop | movement, scan, relay repair, rescue, blackout recovery, clinic/ambulance overlays | Changed recent overlays do not import old runtime CDN | Yes |
| `experiments/nexus-frontier-signal-isles/` | Island frontier survival route | 5-10 minute loop | scan, harvest, build mast, storm anchor, harbor relief, lighthouse evacuation | No old runtime CDN in changed files from prior pass | Yes |
| `experiments/sora-the-infinite/` | Route preview gateway | Short gateway | launch preview, sky readiness overlays | No changed-runtime audit in this run | Yes |
| `experiments/zombie-orchard/` | Survival orchard arena | 3-8 minute loop | move, collect, horde, cure crafting, safehouse evacuation, well restoration | Changed well entry imports NexusEngine main CDN | Yes |
| `experiments/tropical-island-scene/` | Tropical island scene | Passive/open-ended | orbit, fish, coconuts, shelter/rescue/water overlays | Some old local island/water stack preserved | Yes in overlays |
| `experiments/cozy-island/` | Cozy cloudbar island | Passive/open-ended | island, campfire, clouds, castaway comfort, tidepool, turtle hatchery, lagoon lantern rescue | Legacy cloudbar ProtoKits preserved | Yes in overlays |
| `games/signal-bastion/` | Tower defense game | 20-30 waves | placement, waves, tactics, reconstruction | Generic defense bridge pockets preserved | Yes |
| `games/rogue-lite-hellscape-siege/` | Resource defense game | 10-20 minute loop | harvest, portals, build, siege, caravan | No changed-runtime audit in this run | Yes |

## Domain ASCII tree

```txt
cozy-island-lagoon-lantern-rescue-readiness-domain
├─ night-navigation-domain
│  ├─ lantern-buoy-domain
│  │  └─ cozy-island-lantern-buoy-chain-kit
│  └─ firefly-jar-domain
│     └─ cozy-island-firefly-jar-waypoint-kit
├─ shoreline-shelter-domain
│  ├─ rain-tarp-anchor-domain
│  │  └─ cozy-island-rain-tarp-anchor-kit
│  └─ woven-fish-trap-domain
│     └─ cozy-island-woven-fish-trap-kit
├─ dawn-rescue-domain
│  ├─ signal-kite-domain
│  │  └─ cozy-island-signal-kite-spool-kit
│  └─ outrigger-pickup-domain
│     └─ cozy-island-outrigger-pickup-window-kit
└─ renderer-handoff
   └─ cozy-island-lagoon-lantern-rescue-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `cozy-island-lantern-buoy-chain-kit`
- `cozy-island-firefly-jar-waypoint-kit`
- `cozy-island-rain-tarp-anchor-kit`
- `cozy-island-woven-fish-trap-kit`
- `cozy-island-signal-kite-spool-kit`
- `cozy-island-outrigger-pickup-window-kit`
- `cozy-island-lagoon-lantern-rescue-renderer-handoff-kit`
- `cozy-island-lagoon-lantern-rescue-readiness-domain-kit`

Changed:

- Cozy Island now loads `cozy-island-lagoon-lantern-rescue-entry.js` after the turtle hatchery overlay.
- `GameHost.getRendererHandoff()` is patched by the new overlay to compose `lagoonLanternRescueReadiness` after existing handoffs.
- `GameHost.getLagoonLanternRescueReadiness()` and `GameHost.getCozyIslandLagoonLanternRescueReadiness()` expose the new descriptor domain.
- Parent Cozy Island castaway kit and CDN smoke files import the new lagoon lantern smoke files.

## Files changed

- `experiments/cozy-island/cozy-island-lagoon-lantern-rescue-kits.js`
- `experiments/cozy-island/cozy-island-lagoon-lantern-rescue-entry.js`
- `experiments/cozy-island/index.html`
- `tests/cozy-island-lagoon-lantern-rescue-readiness-kits-smoke.mjs`
- `tests/cozy-island-lagoon-lantern-rescue-cdn-state-input-smoke.mjs`
- `tests/cozy-island-castaway-comfort-readiness-kits-smoke.mjs`
- `tests/cozy-island-castaway-comfort-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-08-2328-cozy-lagoon-lantern-rescue-upgrade.md`

## Tests added or changed

Added:

- `tests/cozy-island-lagoon-lantern-rescue-readiness-kits-smoke.mjs`
- `tests/cozy-island-lagoon-lantern-rescue-cdn-state-input-smoke.mjs`

Changed:

- `tests/cozy-island-castaway-comfort-readiness-kits-smoke.mjs`
- `tests/cozy-island-castaway-comfort-cdn-state-input-smoke.mjs`

Coverage:

- 10 kit intake cases.
- 10 CDN/state/input cases.
- All six atomic lagoon lantern rescue kits.
- Renderer handoff policy.
- Descriptor counts.
- JSON serializability.
- NexusEngine main CDN import validation.
- Old NexusRealtime runtime CDN absence in the changed runtime entry.
- GameHost lagoon lantern rescue accessor exposure.

## Validation results

Scratch validation performed before connector writes:

- `node --check /mnt/data/cozy-island-lagoon-lantern-rescue-kits.js` passed.
- `node --check /mnt/data/cozy-island-lagoon-lantern-rescue-entry.js` passed.
- `node --check /mnt/data/cozy-island-lagoon-lantern-rescue-readiness-kits-smoke.mjs` passed.
- `node --check /mnt/data/cozy-island-lagoon-lantern-rescue-cdn-state-input-smoke.mjs` passed.
- `node tests/cozy-island-lagoon-lantern-rescue-readiness-kits-smoke.mjs` passed all 10 intake cases in scratch.
- `node tests/cozy-island-lagoon-lantern-rescue-cdn-state-input-smoke.mjs` passed all 10 state/input cases in scratch.

Connector validation:

- GitHub accepted all writes directly on `main`.
- No branch was created.
- No pull request was created.

Not run in this connector pass:

- Full repo `npm run check`.
- Full repo `npm run check:deploy`.
- Browser-rendered Playwright run.

## NexusRealtime import audit

Changed files:

- `experiments/cozy-island/cozy-island-lagoon-lantern-rescue-entry.js`: imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js` and does not import old `NexusRealtime@main`.
- `experiments/cozy-island/cozy-island-lagoon-lantern-rescue-kits.js`: no runtime CDN import and no renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, physics, or frame-loop ownership.
- `tests/cozy-island-lagoon-lantern-rescue-cdn-state-input-smoke.mjs`: explicitly checks NexusEngine main CDN usage and old NexusRealtime main CDN absence.
- Existing `cozy-island-cloudbar.js` still imports older `NexusRealtime-ProtoKits` for the legacy island-generation stack. That was preserved because this run only added the new NexusEngine overlay.

## Manifest update

The route, entry, parent smoke, new tests, and this ledger now register the lagoon lantern rescue pass. The canonical `experiments/domain-kit-cutover-manifest.json` is still a very large one-line JSON blob. I did not replace the whole file in this connector run because that would risk a destructive overwrite. The next safe ledge is to normalize the manifest to multi-line JSON and add `cozy-island-lagoon-lantern-rescue-readiness-domain-kit` to the Cozy Island `domainCutover` list with status `lagoon-lantern-rescue-readiness-renderer-handoff-pass`.

## Cleanup pass

- Preserved the canonical route.
- Did not create a branch.
- Did not create a pull request.
- Did not remove useful functionality.
- Kept reusable lagoon lantern logic renderer-neutral.
- Kept the overlay as presentation-only Canvas drawing against descriptors.
- Kept all descriptor groups serializable.
- Routed new validation through the existing Cozy Island castaway smoke entry points.

## Non-game handling

`experiments/cozy-island/` is a small experience-driven web route, though it is more passive than most game routes. No delete, rename, or destructive refactor was needed.

## Next safe ledge

Normalize `experiments/domain-kit-cutover-manifest.json` into multi-line JSON, then add `cozy-island-lagoon-lantern-rescue-readiness-domain-kit` cleanly. After that, run full `npm run check`, `npm run check:deploy`, and a browser Playwright pass that verifies `window.GameHost.getCozyIslandLagoonLanternRescueReadiness()` plus `window.GameHost.getRendererHandoff().lagoonLanternRescueReadiness` after passive route load.
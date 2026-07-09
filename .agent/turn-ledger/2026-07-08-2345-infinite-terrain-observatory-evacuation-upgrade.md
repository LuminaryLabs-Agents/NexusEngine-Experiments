# 2026-07-08 23:45 - Infinite Radial Terrain observatory evacuation readiness upgrade

## Summary

Upgraded `experiments/infinite-radial-terrain/` after the latest completed ledger showed `experiments/cozy-island/` lagoon lantern rescue work. This run intentionally chose a different route and added an observatory evacuation objective layer: distress beacons, weather tower stability, ridge switchback routes, supply drop zones, summit radio relays, and helicopter evacuation windows.

## Chosen experiment

`experiments/infinite-radial-terrain/`

## Why it was chosen

- The latest completed ledger was `experiments/cozy-island/`, so this run avoided repeating that route.
- Infinite Radial Terrain remains an open-ended survey/flyover route with strong terrain technology but less direct objective pressure than the small game routes.
- The new pass adds a concrete high-altitude evacuation goal without moving reusable logic into the renderer.
- The route already uses NexusEngine main CDN in the base runtime, making it safe to add a new NexusEngine CDN overlay.

## Last upgraded experiment

`experiments/cozy-island/`

Latest completed ledger read:

- `.agent/turn-ledger/2026-07-08-2328-cozy-lagoon-lantern-rescue-upgrade.md`

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller lab | Short sandbox | WASD, jump, camera, debug rays, navigation, stealth extraction, medevac | No old runtime CDN in recent overlays | Yes |
| `experiments/peer-scene-transition/` | Scene transition narrative route | Short route chain | scene gates, inventory, decisions, archive/evidence escort | No old runtime CDN in recent overlays | Yes |
| `apps/the-cavalry-of-rome/` | Campaign command app | Medium strategy loop | campaign map, logistics, orders, field hospital, grain convoy | Legacy bridge pockets preserved | Yes in passes |
| `experiments/vr-platformer-board/` | Small VR comfort platformer board | 2-5 minute loop | A/D, jump, coins, hazards, companion rescue | No old runtime CDN in route shell | Yes |
| `experiments/next-ledge/` | Grapple traversal route | 3-6 minute loop | swing, cargo, route rescue, ravine evacuation, summit bivouac | No changed-runtime audit in this run | Yes |
| `experiments/infinite-radial-terrain/` | Radial terrain flight/survey | Open-ended | camera flight, LOD rings, expedition, survey contract, basecamp, avalanche rescue, observatory evacuation | No old runtime CDN in changed files | Yes |
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
terrain-observatory-evacuation-readiness-domain
├─ observatory-safety-domain
│  ├─ distress-beacon-domain
│  │  └─ terrain-observatory-distress-beacon-kit
│  └─ weather-tower-domain
│     └─ terrain-weather-tower-stability-kit
├─ evacuation-route-domain
│  ├─ ridge-switchback-domain
│  │  └─ terrain-ridge-switchback-route-kit
│  └─ supply-drop-zone-domain
│     └─ terrain-supply-drop-zone-kit
├─ airlift-handoff-domain
│  ├─ summit-radio-domain
│  │  └─ terrain-summit-radio-relay-kit
│  └─ evac-heli-window-domain
│     └─ terrain-evac-heli-window-kit
└─ renderer-handoff
   └─ terrain-observatory-evacuation-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `terrain-observatory-distress-beacon-kit`
- `terrain-weather-tower-stability-kit`
- `terrain-ridge-switchback-route-kit`
- `terrain-supply-drop-zone-kit`
- `terrain-summit-radio-relay-kit`
- `terrain-evac-heli-window-kit`
- `terrain-observatory-evacuation-renderer-handoff-kit`
- `terrain-observatory-evacuation-readiness-domain-kit`

Changed:

- Infinite Radial Terrain now loads `terrain-observatory-evacuation-readiness-entry.js` after the avalanche rescue overlay.
- `GameHost.getRendererHandoff()` is patched by the new overlay to compose `observatoryEvacuationReadiness` after existing handoffs.
- `GameHost.getObservatoryEvacuationReadiness()` and `GameHost.getInfiniteRadialTerrainObservatoryEvacuationReadiness()` expose the new descriptor domain.
- The route shell now advertises `observatory-evacuation-readiness-renderer-handoff-pass`.

## Files changed

- `experiments/_kits/infinite-radial-terrain/terrain-observatory-evacuation-readiness-kits.js`
- `experiments/infinite-radial-terrain/terrain-observatory-evacuation-readiness-entry.js`
- `experiments/infinite-radial-terrain/index.html`
- `tests/infinite-radial-terrain-observatory-evacuation-readiness-kits-smoke.mjs`
- `tests/infinite-radial-terrain-observatory-evacuation-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-08-2345-infinite-terrain-observatory-evacuation-upgrade.md`

## Tests added

- `tests/infinite-radial-terrain-observatory-evacuation-readiness-kits-smoke.mjs`
- `tests/infinite-radial-terrain-observatory-evacuation-cdn-state-input-smoke.mjs`

Coverage:

- 10 kit intake cases.
- 10 CDN/state/input cases.
- All six atomic observatory evacuation kits.
- Descriptor counts.
- Renderer handoff policy.
- JSON serializability.
- NexusEngine main CDN import validation.
- Old NexusRealtime runtime CDN absence in the changed runtime entry.
- GameHost observatory evacuation accessor exposure.

## Validation results

Scratch validation performed before connector writes:

- `node --check experiments/_kits/infinite-radial-terrain/terrain-observatory-evacuation-readiness-kits.js` passed.
- `node --check experiments/infinite-radial-terrain/terrain-observatory-evacuation-readiness-entry.js` passed.
- `node --check tests/infinite-radial-terrain-observatory-evacuation-readiness-kits-smoke.mjs` passed.
- `node --check tests/infinite-radial-terrain-observatory-evacuation-cdn-state-input-smoke.mjs` passed.
- `node tests/infinite-radial-terrain-observatory-evacuation-readiness-kits-smoke.mjs` passed all 10 intake cases in scratch.
- `node tests/infinite-radial-terrain-observatory-evacuation-cdn-state-input-smoke.mjs` passed all 10 state/input cases in scratch.

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

- `experiments/infinite-radial-terrain/terrain-observatory-evacuation-readiness-entry.js`: imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js` and does not import old `NexusRealtime@main`.
- `experiments/_kits/infinite-radial-terrain/terrain-observatory-evacuation-readiness-kits.js`: no runtime CDN import and no renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, physics, or frame-loop ownership.
- `tests/infinite-radial-terrain-observatory-evacuation-cdn-state-input-smoke.mjs`: explicitly checks NexusEngine main CDN usage and old NexusRealtime main CDN absence.
- Existing historical route helpers and older kit overlays were preserved because this run only added the new NexusEngine overlay.

## Cleanup pass

- Preserved the canonical route.
- Did not create a branch.
- Did not create a pull request.
- Did not remove useful functionality.
- Kept reusable observatory evacuation logic renderer-neutral.
- Kept the overlay as presentation-only DOM rendering against descriptors.
- Kept all descriptor groups serializable.
- Did not rewrite the large one-line manifest in this pass.

## Non-game handling

`experiments/infinite-radial-terrain/` is an open-ended flight/survey terrain route rather than a compact finite web game. It was not deleted or renamed because it proves useful radial terrain, terrain sampling, LOD, and descriptor-handoff functionality. The lesson is that objective overlays can add gameplay pressure without corrupting the terrain renderer or moving state truth into Three.js.

## Next safe ledge

Normalize `experiments/domain-kit-cutover-manifest.json` into multi-line JSON, add `terrain-observatory-evacuation-readiness-domain-kit` to Infinite Radial Terrain, and route the two new observatory evacuation smoke files through the parent Infinite Radial Terrain smoke before running full `npm run check`, `npm run check:deploy`, and a browser Playwright pass that verifies `window.GameHost.getInfiniteRadialTerrainObservatoryEvacuationReadiness()` plus `window.GameHost.getRendererHandoff().observatoryEvacuationHandoff` after route load.

# 2026-07-09 00:44 - Tropical Island mangrove nursery readiness upgrade

## Summary

Upgraded `experiments/tropical-island-scene/` after the latest observed completed upgrade targeted `experiments/peer-scene-transition/` with flood rescue readiness. This run intentionally chose a different route and added a mangrove nursery restoration objective layer: propagule clusters, root nursery cradles, crab burrow guards, brackish channel ribbons, heron roost watches, and dawn ranger tag ledgers.

## Chosen experiment

`experiments/tropical-island-scene/`

## Why it was chosen

- The latest observed completed route work was `experiments/peer-scene-transition/`, so this run avoided repeating that experiment.
- Tropical Island Scene is still largely a passive orbit/viewing scene even after several descriptor overlays.
- The route already imports NexusEngine main CDN in the main runtime and recent overlays, which made it safe to add another descriptor-only readiness pass without changing renderer ownership.
- A mangrove nursery restoration loop gives the island a clearer ecological objective while making the scene visually busier with shoreline markers, brackish ribbons, root lanes, roost rings, and ranger ledger points.

## Last upgraded experiment

Latest observed completed upgrade:

- `experiments/peer-scene-transition/` - Peer Scene flood rescue readiness upgrade, ending at commit `c451113bafea36553e1063b2ff3d367a5f34d6ed`.

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller lab | Short sandbox | WASD, jump, camera, debug rays, navigation, stealth extraction, medevac | No old runtime CDN in recent overlays | Yes |
| `experiments/peer-scene-transition/` | Scene transition route chain | 5-10 minute loop | scene gates, inventory, route decisions, archive/evidence/witness/flood rescue overlays | No old runtime CDN in recent changed files | Yes |
| `apps/the-cavalry-of-rome/` | Campaign command app | Medium strategy loop | campaign map, logistics, orders, field hospital, grain convoy | Legacy bridge pockets preserved | Yes in passes |
| `experiments/vr-platformer-board/` | Small VR comfort platformer board | 2-5 minute loop | A/D, jump, coins, hazards, companion rescue | No old runtime CDN in route shell | Yes |
| `experiments/next-ledge/` | Grapple traversal route | 3-6 minute loop | swing, cargo, route rescue, ravine evacuation, summit bivouac | No changed-runtime audit in this run | Yes |
| `experiments/infinite-radial-terrain/` | Radial terrain flight/survey | Open-ended | camera flight, LOD rings, expedition, survey contract, basecamp, avalanche rescue, observatory evacuation | No old runtime CDN in latest changed files | Yes |
| `experiments/the-open-above/` | Aerial flight route | Open-ended | bird/balloon flight, terrain streaming, courier/shelter/clinic overlays | Recent overlays import NexusEngine main CDN | Yes |
| `experiments/high-fidelity-meadow/` | Meadow ecology scene | Passive/open-ended | grass, flowers, sheep, pollinator/night watch overlays | No changed-runtime audit in this run | Yes |
| `experiments/fogline-relay/` | Relay scanning and repair route | 5-8 minute loop | movement, scan, relay repair, rescue, blackout recovery, clinic/ambulance overlays | Changed recent overlays do not import old runtime CDN | Yes |
| `experiments/nexus-frontier-signal-isles/` | Island frontier survival route | 5-10 minute loop | scan, harvest, build mast, storm anchor, harbor relief, lighthouse evacuation | No old runtime CDN in changed files from prior pass | Yes |
| `experiments/sora-the-infinite/` | Route preview gateway | Short gateway | launch preview, sky rescue/lighthouse overlays | No changed-runtime audit in this run | Yes |
| `experiments/zombie-orchard/` | Survival orchard arena | 3-8 minute loop | move, collect, horde, cure crafting, safehouse evacuation, well restoration | Changed well entry imports NexusEngine main CDN | Yes |
| `experiments/tropical-island-scene/` | Tropical island scene | Passive/open-ended | orbit, fish, coconuts, lagoon/beachcomber/weather/reef/tide/clinic/water/mangrove overlays | Existing import-map still maps old ProtoKit URLs locally; changed mangrove entry imports NexusEngine main CDN | Yes |
| `experiments/cozy-island/` | Cozy cloudbar island | Passive/open-ended | island, campfire, clouds, comfort, tidepool, turtle hatchery, lagoon rescue | Legacy cloudbar ProtoKits preserved | Yes in overlays |
| `games/signal-bastion/` | Tower defense game | 20-30 waves | placement, waves, tactics, evacuation/reconstruction | Generic defense bridge pockets preserved | Yes |
| `games/rogue-lite-hellscape-siege/` | Resource defense roguelite | 10-20 minute loop | harvest, portals, build, siege, expedition, caravan, forge overlays | Local historical loader name preserved; changed runtime main does not import old CDN | Yes |

## Domain ASCII tree

```txt
tropical-mangrove-nursery-readiness-domain
├─ seedling-source-domain
│  ├─ propagule-cluster-domain
│  │  └─ tropical-mangrove-propagule-cluster-kit
│  └─ root-nursery-domain
│     └─ tropical-root-nursery-cradle-kit
├─ shoreline-protection-domain
│  ├─ crab-burrow-domain
│  │  └─ tropical-crab-burrow-guard-kit
│  └─ brackish-channel-domain
│     └─ tropical-brackish-channel-ribbon-kit
├─ ranger-handoff-domain
│  ├─ heron-roost-domain
│  │  └─ tropical-heron-roost-watch-kit
│  └─ dawn-tagging-domain
│     └─ tropical-dawn-ranger-tag-ledger-kit
└─ renderer-handoff
   └─ tropical-mangrove-nursery-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `tropical-mangrove-propagule-cluster-kit`
- `tropical-root-nursery-cradle-kit`
- `tropical-crab-burrow-guard-kit`
- `tropical-brackish-channel-ribbon-kit`
- `tropical-heron-roost-watch-kit`
- `tropical-dawn-ranger-tag-ledger-kit`
- `tropical-mangrove-nursery-renderer-handoff-kit`
- `tropical-mangrove-nursery-readiness-domain-kit`

Changed:

- `experiments/tropical-island-scene/` now loads `mangrove-nursery-readiness-entry.js` after the rainwater purification pass.
- `GameHost.getMangroveNurseryReadiness()` and `GameHost.getTropicalMangroveNurseryReadiness()` expose the new readiness state.
- `GameHost.getRendererHandoff()` composes mangrove nursery descriptors while preserving earlier lagoon, beachcomber, weather, rescue, salvage, clinic, and rainwater descriptor handoffs.
- The parent tropical smoke imports the new kit smoke and CDN/state-input smoke.

## Files changed

- `experiments/tropical-island-scene/src/tropical-mangrove-nursery-readiness-domain-kit.js`
- `experiments/tropical-island-scene/src/mangrove-nursery-readiness-entry.js`
- `experiments/tropical-island-scene/index.html`
- `tests/tropical-mangrove-nursery-readiness-kits-smoke.mjs`
- `tests/tropical-mangrove-nursery-cdn-state-input-smoke.mjs`
- `tests/tropical-lagoon-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-0044-tropical-mangrove-nursery-upgrade.md`

## Tests added

- `tests/tropical-mangrove-nursery-readiness-kits-smoke.mjs`
- `tests/tropical-mangrove-nursery-cdn-state-input-smoke.mjs`

Coverage:

- 10 kit intake cases.
- 10 CDN/state-input cases.
- All six atomic mangrove nursery kits.
- Descriptor counts and descriptor bucket names.
- JSON serializability.
- Renderer handoff policy.
- NexusEngine main CDN import validation.
- Old NexusRealtime runtime CDN absence in the changed entry.
- Tropical route shell loading check.
- GameHost accessor exposure checks.
- Parent smoke routing.

## Validation results

Scratch validation performed before connector writes:

- `node --check experiments/tropical-island-scene/src/tropical-mangrove-nursery-readiness-domain-kit.js` passed.
- `node --check experiments/tropical-island-scene/src/mangrove-nursery-readiness-entry.js` passed.
- `node --check tests/tropical-mangrove-nursery-readiness-kits-smoke.mjs` passed.
- `node --check tests/tropical-mangrove-nursery-cdn-state-input-smoke.mjs` passed.
- `node --check tests/tropical-lagoon-cdn-state-input-smoke.mjs` passed.
- `node tests/tropical-mangrove-nursery-readiness-kits-smoke.mjs` passed all 10 intake cases in scratch.
- `node tests/tropical-mangrove-nursery-cdn-state-input-smoke.mjs` passed all 10 state/input cases in scratch.

Connector validation:

- GitHub accepted all writes directly on `main`.
- No branch was created.
- No pull request was created.

Not run in this connector pass:

- Full repo `npm run check`.
- Full repo `npm run check:deploy`.
- Browser-rendered Playwright.

## NexusRealtime import audit

Changed files:

- `experiments/tropical-island-scene/src/mangrove-nursery-readiness-entry.js`: imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js` and does not import old `LuminaryLabs-Dev/NexusRealtime@main`.
- `experiments/tropical-island-scene/src/tropical-mangrove-nursery-readiness-domain-kit.js`: no runtime CDN import and no renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, storage, routing, physics, or frame-loop ownership.
- `experiments/tropical-island-scene/index.html`: preserves the existing local import map for old ProtoKit URLs because the base scene still uses local compatibility kits; the new runtime pass is NexusEngine main CDN based.
- Tests explicitly check NexusEngine main CDN usage and old NexusRealtime main CDN absence in the changed runtime entry.

## Cleanup pass

- Preserved every existing island pass.
- Appended mangrove nursery after rainwater purification instead of replacing any active route script.
- Did not delete, rename, or remove useful route functionality.
- Did not create a branch or PR.
- Kept new reusable logic renderer-neutral.
- Kept overlay behavior descriptor-only.
- Kept all descriptors serializable.
- Did not rewrite the large one-line manifest in this pass.

## Non-game handling

`experiments/tropical-island-scene/` is a passive/open-ended visual scene rather than a compact finite web game. It was not deleted or renamed because it proves reusable island, water, fish, orbit camera, lagoon descriptor, and ecological readiness handoff behavior. The lesson is that objective overlays can create purpose without moving scene truth into WebGL.

## Next safe ledge

Normalize `experiments/domain-kit-cutover-manifest.json` into multi-line JSON, register `tropical-mangrove-nursery-readiness-domain-kit`, then run full `npm run check`, `npm run check:deploy`, and browser Playwright validation for `window.GameHost.getTropicalMangroveNurseryReadiness()` plus `window.GameHost.getRendererHandoff().descriptors.propaguleClusters` after route load.

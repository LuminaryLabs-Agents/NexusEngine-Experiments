# 2026-07-09 00:31 - Peer Scene flood rescue readiness upgrade

## Summary

Upgraded `experiments/peer-scene-transition/` after the latest observed route work targeted `experiments/the-open-above/` ridge clinic. This run intentionally chose a different experiment and added a flood-rescue objective layer: evacuee traces, flood gauge bands, canoe moorings, rope bridge spans, warm blanket caches, and dawn rescue rosters.

## Chosen experiment

`experiments/peer-scene-transition/`

## Why it was chosen

- The latest observed route work was `experiments/the-open-above/`, so this run avoided repeating that experiment.
- Peer Scene Transition is still a compact route-chain experience rather than a long simulation, and its variability mostly comes from gates and inventory rather than a concrete human-stakes objective.
- The route already imports NexusEngine main CDN through `shared/scene-demo.js`, so the new pass could deepen the domain without reintroducing old runtime drift.
- The new pass adds readable procedural variety through descriptor-only rescue traces, waterline bands, mooring markers, rope spans, caches, and roster badges.

## Last upgraded experiment

Latest observed route work:

- `experiments/the-open-above/` - Open Above ridge clinic overlay commits ending at `28d8989bb7b6b7d9f2f976e9279bc3cb09b3880d`.

Latest completed ledger before that:

- `games/rogue-lite-hellscape-siege/` - Hellscape sanctuary forge readiness upgrade.

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller lab | Short sandbox | WASD, jump, camera, debug rays, navigation, stealth extraction, medevac | No old runtime CDN in recent overlays | Yes |
| `experiments/peer-scene-transition/` | Scene transition route chain | 5-10 minute loop | scene gates, inventory, route decisions, archive/evidence/witness/flood rescue overlays | No old runtime CDN in changed files | Yes |
| `apps/the-cavalry-of-rome/` | Campaign command app | Medium strategy loop | campaign map, logistics, orders, field hospital, grain convoy | Legacy bridge pockets preserved | Yes in passes |
| `experiments/vr-platformer-board/` | Small VR comfort platformer board | 2-5 minute loop | A/D, jump, coins, hazards, companion rescue | No old runtime CDN in route shell | Yes |
| `experiments/next-ledge/` | Grapple traversal route | 3-6 minute loop | swing, cargo, route rescue, ravine evacuation, summit bivouac | No changed-runtime audit in this run | Yes |
| `experiments/infinite-radial-terrain/` | Radial terrain flight/survey | Open-ended | camera flight, LOD rings, expedition, survey contract, basecamp, avalanche rescue, observatory evacuation | No old runtime CDN in latest changed files | Yes |
| `experiments/the-open-above/` | Aerial flight route | Open-ended | bird/balloon flight, terrain streaming, courier/shelter/clinic overlays | No changed-runtime audit in this run | Yes |
| `experiments/high-fidelity-meadow/` | Meadow ecology scene | Passive/open-ended | grass, flowers, sheep, pollinator/night watch overlays | No changed-runtime audit in this run | Yes |
| `experiments/fogline-relay/` | Relay scanning and repair route | 5-8 minute loop | movement, scan, relay repair, rescue, blackout recovery, clinic/ambulance overlays | Changed recent overlays do not import old runtime CDN | Yes |
| `experiments/nexus-frontier-signal-isles/` | Island frontier survival route | 5-10 minute loop | scan, harvest, build mast, storm anchor, harbor relief, lighthouse evacuation | No old runtime CDN in changed files from prior pass | Yes |
| `experiments/sora-the-infinite/` | Route preview gateway | Short gateway | launch preview, sky rescue/lighthouse overlays | No changed-runtime audit in this run | Yes |
| `experiments/zombie-orchard/` | Survival orchard arena | 3-8 minute loop | move, collect, horde, cure crafting, safehouse evacuation, well restoration | Changed well entry imports NexusEngine main CDN | Yes |
| `experiments/tropical-island-scene/` | Tropical island scene | Passive/open-ended | orbit, fish, coconuts, shelter/rescue/water overlays | Some old local island/water stack preserved | Yes in overlays |
| `experiments/cozy-island/` | Cozy cloudbar island | Passive/open-ended | island, campfire, clouds, comfort, tidepool, turtle hatchery, lagoon rescue | Legacy cloudbar ProtoKits preserved | Yes in overlays |
| `games/signal-bastion/` | Tower defense game | 20-30 waves | placement, waves, tactics, evacuation/reconstruction | Generic defense bridge pockets preserved | Yes |
| `games/rogue-lite-hellscape-siege/` | Resource defense roguelite | 10-20 minute loop | harvest, portals, build, siege, expedition, caravan, forge overlays | Local historical loader name preserved; changed runtime main does not import old CDN | Yes |

## Domain ASCII tree

```txt
scene-flood-rescue-readiness-domain
├─ survivor-location-domain
│  ├─ evacuee-trace-domain
│  │  └─ scene-evacuee-trace-kit
│  └─ flood-gauge-domain
│     └─ scene-flood-gauge-band-kit
├─ crossing-stabilization-domain
│  ├─ canoe-mooring-domain
│  │  └─ scene-canoe-mooring-kit
│  └─ rope-bridge-domain
│     └─ scene-rope-bridge-span-kit
├─ dawn-relief-domain
│  ├─ blanket-cache-domain
│  │  └─ scene-warm-blanket-cache-kit
│  └─ rescue-roster-domain
│     └─ scene-dawn-roster-ledger-kit
└─ renderer-handoff
   └─ scene-flood-rescue-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `scene-evacuee-trace-kit`
- `scene-flood-gauge-band-kit`
- `scene-canoe-mooring-kit`
- `scene-rope-bridge-span-kit`
- `scene-warm-blanket-cache-kit`
- `scene-dawn-roster-ledger-kit`
- `scene-flood-rescue-renderer-handoff-kit`
- `scene-flood-rescue-readiness-domain-kit`

Changed:

- Peer scene route pages now load the flood rescue entry after the existing oracle, clue pressure, evidence ritual, archive escort, and witness shelter passes.
- `GameHost` is patched with `getSceneFloodRescueReadiness()`, `getFloodRescueReadiness()`, and `getSceneFloodRescueReadinessTree()`.
- `GameHost.getRendererHandoff()` is composed with a `sceneFloodRescue` descriptor bucket while preserving existing handoff counts.
- The overlay consumes descriptors only and does not own scene truth, storage, input, routing, or frame-loop behavior.

## Files changed

- `experiments/peer-scene-transition/shared/scene-flood-rescue-readiness-kits.js`
- `experiments/peer-scene-transition/shared/scene-flood-rescue-readiness-entry.js`
- `experiments/peer-scene-transition/index.html`
- `experiments/peer-scene-transition/camp.html`
- `experiments/peer-scene-transition/crossroads.html`
- `experiments/peer-scene-transition/forest.html`
- `experiments/peer-scene-transition/bridge.html`
- `tests/peer-scene-flood-rescue-readiness-kits-smoke.mjs`
- `tests/peer-scene-flood-rescue-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-0031-peer-scene-flood-rescue-upgrade.md`

## Tests added

- `tests/peer-scene-flood-rescue-readiness-kits-smoke.mjs`
- `tests/peer-scene-flood-rescue-cdn-state-input-smoke.mjs`

Coverage:

- 10 kit intake cases.
- 10 CDN/state/input cases.
- All six atomic flood rescue kits.
- Descriptor counts and descriptor bucket names.
- JSON serializability.
- Renderer handoff policy.
- NexusEngine main CDN import validation.
- Old NexusRealtime runtime CDN absence in the changed entry.
- Route page loading checks for `index.html` and `camp.html`.
- GameHost accessor exposure checks.

## Validation results

Scratch validation performed before connector writes:

- `node --check experiments/peer-scene-transition/shared/scene-flood-rescue-readiness-kits.js` passed.
- `node --check experiments/peer-scene-transition/shared/scene-flood-rescue-readiness-entry.js` passed.
- `node --check tests/peer-scene-flood-rescue-readiness-kits-smoke.mjs` passed.
- `node --check tests/peer-scene-flood-rescue-cdn-state-input-smoke.mjs` passed.
- `node tests/peer-scene-flood-rescue-readiness-kits-smoke.mjs` passed all 10 intake cases in scratch.
- `node tests/peer-scene-flood-rescue-cdn-state-input-smoke.mjs` passed all 10 state/input cases in scratch.

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

- `experiments/peer-scene-transition/shared/scene-flood-rescue-readiness-entry.js`: imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js` and does not import old `LuminaryLabs-Dev/NexusRealtime@main`.
- `experiments/peer-scene-transition/shared/scene-flood-rescue-readiness-kits.js`: no runtime CDN import and no renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, storage, routing, physics, or frame-loop ownership.
- Route HTML pages: load the new entry and preserve the existing peer scene boot path.
- Tests: explicitly check NexusEngine main CDN usage and old NexusRealtime main CDN absence in the changed runtime entry.

## Cleanup pass

- Preserved every existing scene page.
- Did not delete, rename, or replace useful functionality.
- Did not modify `shrine.html` because it is currently a separate Three desert/beach transition route and not the compact peer-scene HTML shell.
- Did not create a branch or PR.
- Kept new reusable logic renderer-neutral.
- Kept overlay behavior descriptor-only.
- Kept all descriptors serializable.
- Did not rewrite the large one-line manifest in this pass.

## Non-game handling

`experiments/peer-scene-transition/` is a small experience-driven web route chain, so no delete, refactor, or rename pass was needed. The new pass deepens the route with a rescue objective instead of replacing it.

## Next safe ledge

Normalize `experiments/domain-kit-cutover-manifest.json` into multi-line JSON, register `scene-flood-rescue-readiness-domain-kit`, then run full `npm run check`, `npm run check:deploy`, and a browser Playwright pass that verifies `window.GameHost.getSceneFloodRescueReadiness()` and `window.GameHost.getRendererHandoff().descriptors.sceneFloodRescue` after `camp.html` route load.

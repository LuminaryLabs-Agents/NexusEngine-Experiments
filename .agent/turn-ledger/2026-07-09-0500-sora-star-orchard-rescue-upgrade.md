# 2026-07-09 05:00 ET — Sora star orchard rescue upgrade

## Chosen experiment

`experiments/sora-the-infinite/`

## Why it was chosen

The latest completed upgrade on `main` was `experiments/peer-scene-transition/`, so this run selected a different route. `Sora the Infinite` is useful but still behaves more like a stacked gateway/readiness proof than a small game objective. This pass adds a more legible rescue logistics layer: starfruit groves, pollen currents, nest slings, cloud-bloom medicine, mooncalf courier routes, and a dawn orchard ledger that can be consumed by the renderer as descriptors.

## Last upgraded experiment

```txt
experiments/peer-scene-transition/
2026-07-09-0443-peer-scene-time-capsule-courier-upgrade.md
```

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import audit | NexusEngine main CDN audit |
| --- | --- | --- | --- | --- | --- |
| `experiments/peer-scene-transition/` | Story-scene orchestration route. | Short scene chain. | Scene exits, tokens, inventory, transitions, flood rescue descriptors, and time capsule courier descriptors. | Latest completed upgrade, skipped. | Recent time capsule pass uses NexusEngine main CDN. |
| `experiments/vr-platformer-board/` | Floating XR platformer board. | Short platformer board. | Lane movement, jump, collectibles, hazards, comfort, traversal, companion rescue descriptors. | Shared compatibility naming may remain. | Route runtime imports NexusEngine main CDN. |
| `experiments/infinite-radial-terrain/` | Radial terrain tessellation flight. | Open-ended traversal demo. | WASD flight, LOD, origin snapping, survey, basecamp, avalanche, observatory evacuation, and skybridge shelter overlays. | Recent changed files avoid old runtime CDN. | Recent skybridge pass uses NexusEngine main CDN. |
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
| `experiments/sora-the-infinite/` | Aerial traversal / route gateway. | Short gateway/open traversal. | Flight preview, launch rehearsal, microflight, sky rescue, lighthouse, rookery, and now star orchard rescue descriptors. | Changed files avoid old runtime CDN. | This run adds NexusEngine main CDN in the star orchard entry. |
| `experiments/zombie-orchard/` | Orchard survival slice. | Short survival round. | WASD movement, sprint, dodge, apple collection, gear use, horde pressure, cure crafting, safehouse evacuation, well restoration, seed bank quarantine descriptors. | Recent changed files avoid old runtime CDN. | Recent seed bank pass uses NexusEngine main CDN. |
| `games/rogue-lite-hellscape-siege/` | Action RPG/base siege route. | Short wave/action slice. | Portals, inventory, harvesting, building, wave defense, forge/caravan/refuge descriptors. | Existing legacy names may remain outside changed pass. | Recent refuge pass uses NexusEngine main CDN. |
| `experiments/BirdRun/` | Canvas bird runner. | Short runner. | Lane switching, wingbeat altitude, grove obstacles, nestling rescue, scoring. | Recent changed files avoid old runtime CDN. | Recent canopy rescue pass uses NexusEngine main CDN. |

## Domain ASCII tree

```txt
sora-star-orchard-rescue-readiness-domain
├─ astral-harvest-domain
│  ├─ starfruit-grove-domain
│  │  └─ sora-starfruit-grove-kit
│  └─ pollen-current-domain
│     └─ sora-pollen-current-kit
├─ shelter-repair-domain
│  ├─ nest-sling-domain
│  │  └─ sora-nest-sling-kit
│  └─ cloud-bloom-medicine-domain
│     └─ sora-cloud-bloom-medicine-kit
├─ escort-handoff-domain
│  ├─ mooncalf-courier-domain
│  │  └─ sora-mooncalf-courier-kit
│  └─ dawn-orchard-ledger-domain
│     └─ sora-dawn-orchard-ledger-kit
└─ renderer-handoff
   └─ sora-star-orchard-rescue-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
sora-starfruit-grove-kit
sora-pollen-current-kit
sora-nest-sling-kit
sora-cloud-bloom-medicine-kit
sora-mooncalf-courier-kit
sora-dawn-orchard-ledger-kit
sora-star-orchard-rescue-renderer-handoff-kit
sora-star-orchard-rescue-readiness-domain-kit
```

The reusable kit accepts route state, input, readiness, and prior Sora readiness layers. It emits serializable descriptors only and explicitly avoids renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, frame-loop, and physics ownership.

## Files changed

```txt
experiments/sora-the-infinite/index.html
experiments/sora-the-infinite/sora-star-orchard-rescue-readiness-kits.js
experiments/sora-the-infinite/sora-star-orchard-rescue-entry.js
tests/sora-star-orchard-rescue-readiness-kits-smoke.mjs
tests/sora-star-orchard-rescue-cdn-state-input-smoke.mjs
.agent/turn-ledger/2026-07-09-0500-sora-star-orchard-rescue-upgrade.md
```

## Tests added

```txt
tests/sora-star-orchard-rescue-readiness-kits-smoke.mjs
tests/sora-star-orchard-rescue-cdn-state-input-smoke.mjs
```

## Validation results

Scratch Node validation passed before connector writes:

```txt
node --check experiments/sora-the-infinite/sora-star-orchard-rescue-readiness-kits.js
node --check experiments/sora-the-infinite/sora-star-orchard-rescue-entry.js
node --check tests/sora-star-orchard-rescue-readiness-kits-smoke.mjs
node --check tests/sora-star-orchard-rescue-cdn-state-input-smoke.mjs
node tests/sora-star-orchard-rescue-readiness-kits-smoke.mjs
node tests/sora-star-orchard-rescue-cdn-state-input-smoke.mjs
```

Observed outputs:

```txt
Sora star orchard rescue readiness kits smoke passed 10 intake cases.
Sora star orchard rescue CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a cloned workspace because this runtime could not resolve `github.com`. The new smoke files are designed to run from the repo root after checkout.

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

- Added one coherent star-orchard rescue objective instead of another generic Sora glow layer.
- Kept descriptor generation in `sora-star-orchard-rescue-readiness-kits.js`.
- Kept DOM panel rendering and `GameHost` patching in `sora-star-orchard-rescue-entry.js`.
- Composed `GameHost.getRendererHandoff()` without replacing earlier route preview, sky rescue, sky lighthouse, or sky rookery handoffs.
- Updated the route copy and data marker so CDN/state-input validation can verify integration.

## Non-game handling

`Sora the Infinite` is not a tight standalone game loop; it is a route-preview gateway and layered readiness proof. It was preserved because the existing chain is useful. The lesson from this pass is that gateway experiments become more legible when each new readiness layer adds a concrete objective and an accounting ledger instead of only adding atmospheric descriptors.

## Next safe ledge

Turn star orchard descriptors into user actions: let the user harvest one starfruit grove, assign a mooncalf courier, and spend cloud-bloom medicine to stabilize a nest sling while keeping renderer state as descriptor consumption only.

# 2026-07-09 02:45 ET — Hellscape blood moon refuge upgrade

## Chosen experiment

`games/rogue-lite-hellscape-siege/`

## Why it was chosen

The latest completed route upgrade observed on `main` was `experiments/next-ledge/` via `Log Next Ledge glacier supply upgrade`, so this run selected a different route. `Rogue-Lite Hellscape Siege` is a small experience-driven web game and already has a wave/base loop, but it still benefits from a clearer civilian-refuge objective layer that makes the siege feel less like only harvesting/building and more like a survival rescue run.

## Last upgraded experiment

`experiments/next-ledge/`

Latest observed commit before this run:

```txt
af685c91b5f6539db97f6e4092307f528257dd20
Log Next Ledge glacier supply upgrade
```

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import audit | NexusEngine main CDN audit |
| --- | --- | --- | --- | --- | --- |
| `experiments/peer-scene-transition/` | Story-scene orchestration route. | Short scene chain. | Scene exits, tokens, inventory, transitions, flood rescue descriptors. | Existing shared loader naming may remain. | Recent overlays use NexusEngine main CDN where changed. |
| `experiments/vr-platformer-board/` | Floating XR platformer board. | Short platformer board. | Lane movement, jump, collectibles, hazards, comfort, traversal, companion rescue descriptors. | Shared compatibility naming may remain. | Route runtime imports NexusEngine main CDN. |
| `experiments/infinite-radial-terrain/` | Radial terrain tessellation flight. | Open-ended traversal demo. | WASD flight, LOD, origin snapping, survey and observatory evacuation overlays. | Changed overlays avoid old runtime CDN. | Recent overlays use NexusEngine main CDN. |
| `experiments/high-fidelity-meadow/` | Procedural meadow composition. | Open-ended scene. | Terrain, wind, vegetation, creatures, water-management overlays. | Existing old names may remain in shared files. | Recent creek irrigation pass uses NexusEngine main CDN. |
| `experiments/tiny-diffusion-lab/` | Browser CPU diffusion proof. | Lab session. | Train, sample, checkpoint, training mission descriptors. | Not selected because it is a lab, not a small game loop. | Uses NexusEngine diffusion module and route overlay checks. |
| `experiments/living-agent-lab/` | Market trust agent lab. | Short lab loop. | ONNX/fallback agent, witness/evidence/restitution descriptors. | Recent changed files avoid old runtime CDN. | Latest pass uses NexusEngine main CDN. |
| `experiments/fogline-relay/` | First-person survey and rescue pressure. | Short objective loop. | Movement, scanning, relay repair, medical overlays. | Existing legacy names may remain outside changed passes. | Recent overlays use NexusEngine main CDN. |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer island systems route. | Short systems slice. | Scan, harvest, build, pressure, gates, beacons, harbor/lighthouse overlays. | Existing legacy names may remain outside changed passes. | Recent overlays use NexusEngine main CDN. |
| `apps/the-cavalry-of-rome/` | Painterly Roman strategy visual proof. | Open-ended map inspection. | Pan, hover, dive, army descriptors, logistics and campaign overlays. | Existing legacy naming may remain. | Recent changed passes use NexusEngine main CDN. |
| `games/signal-bastion/` | 2.5D tower defense. | Short wave session. | Tower cards, placement, waves, field hospital overlays. | Previous pass audited changed entry only. | Recent field hospital pass uses NexusEngine main CDN. |
| `games/stonewake-depths/` | Flooded cavern puzzle platformer. | Short puzzle rescue loop. | Block carry, valves, plates, survivor echo pings, chalk marks, air pockets, rope lifts. | Previous pass audited changed entry only. | Recent flood rescue pass uses NexusEngine main CDN. |
| `experiments/next-ledge/` | Grapple climb route. | Short climb run. | Aim, grapple, swing, stamina, ledge route, glacier supply descriptors. | Last upgraded, skipped. | Latest pass uses NexusEngine main CDN. |
| `experiments/sora-the-infinite/` | Aerial traversal / redirect route. | Short gateway/open traversal. | Flight preview, visual domains, migration overlays. | Existing legacy names may remain outside changed pass. | Recent rookery pass uses NexusEngine main CDN. |
| `experiments/zombie-orchard/` | Survival orchard slice. | Short survival round. | Rounds, pickups, horde pressure, water restoration. | Existing legacy names may remain outside changed pass. | Recent well pass uses NexusEngine main CDN. |
| `games/rogue-lite-hellscape-siege/` | Action RPG/base siege route. | Short wave/action slice. | Portals, inventory, harvesting, building, wave defense, forge/caravan/refuge descriptors. | Changed files do not import old `LuminaryLabs-Dev/NexusRealtime@main`; shared page loader naming remains as compatibility shell. | This run added a new NexusEngine main CDN overlay. |

## Domain ASCII tree

```txt
hellscape-blood-moon-refuge-readiness-domain
├─ refugee-location-domain
│  ├─ refuge-sigil-domain
│  │  └─ hellscape-refuge-sigil-beacon-kit
│  └─ ash-medicine-domain
│     └─ hellscape-ash-medicine-cache-kit
├─ sanctuary-defense-domain
│  ├─ warded-shelter-ring-domain
│  │  └─ hellscape-warded-shelter-ring-kit
│  └─ demon-pressure-front-domain
│     └─ hellscape-demon-pressure-front-kit
├─ evacuation-handoff-domain
│  ├─ soul-ferry-route-domain
│  │  └─ hellscape-soul-ferry-route-kit
│  └─ dawn-refuge-ledger-domain
│     └─ hellscape-dawn-refuge-ledger-kit
└─ renderer-handoff
   └─ hellscape-blood-moon-refuge-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
hellscape-refuge-sigil-beacon-kit
hellscape-ash-medicine-cache-kit
hellscape-warded-shelter-ring-kit
hellscape-demon-pressure-front-kit
hellscape-soul-ferry-route-kit
hellscape-dawn-refuge-ledger-kit
hellscape-blood-moon-refuge-renderer-handoff-kit
hellscape-blood-moon-refuge-readiness-domain-kit
```

The reusable kit file keeps descriptor math headless and explicitly avoids renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, collision, inventory mutation, wave timing, and frame-loop ownership.

## Files changed

```txt
games/rogue-lite-hellscape-siege/index.html
games/rogue-lite-hellscape-siege/src/hellscape-blood-moon-refuge-readiness-domain-kit.js
games/rogue-lite-hellscape-siege/src/hellscape-blood-moon-refuge-readiness-entry.js
experiments/_shared/nexus-gallery-data.js
tests/hellscape-blood-moon-refuge-readiness-kits-smoke.mjs
tests/hellscape-blood-moon-refuge-cdn-state-input-smoke.mjs
.agent/turn-ledger/2026-07-09-0245-hellscape-blood-moon-refuge-upgrade.md
```

## Tests added

```txt
tests/hellscape-blood-moon-refuge-readiness-kits-smoke.mjs
tests/hellscape-blood-moon-refuge-cdn-state-input-smoke.mjs
```

## Validation results

Scratch Node validation passed before connector writes:

```txt
node --check games/rogue-lite-hellscape-siege/src/hellscape-blood-moon-refuge-readiness-domain-kit.js
node --check games/rogue-lite-hellscape-siege/src/hellscape-blood-moon-refuge-readiness-entry.js
node --check tests/hellscape-blood-moon-refuge-readiness-kits-smoke.mjs
node --check tests/hellscape-blood-moon-refuge-cdn-state-input-smoke.mjs
node tests/hellscape-blood-moon-refuge-readiness-kits-smoke.mjs
node tests/hellscape-blood-moon-refuge-cdn-state-input-smoke.mjs
```

Observed local outputs:

```txt
Hellscape blood moon refuge readiness kits smoke passed 10 intake cases.
Hellscape blood moon refuge CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a cloned workspace in this connector pass. The added CDN/state test performs static route/CDN checks and 10 simulated state/input cases.

## NexusRealtime import audit

Changed files do not import `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main`. The new overlay imports:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

The route still imports `experiments/_shared/nexus-realtime-page-loader.js` because that is the current gallery compatibility shell. The new runtime overlay and changed reusable kit are NexusEngine-CDN aligned.

## Cleanup pass

- New reusable kit logic is deterministic, serializable, and renderer-neutral.
- Route integration is cache-busted with `blood-moon-refuge-readiness-1`.
- Overlay patches `GameHost.getRendererHandoff()` without replacing previous fractal, expedition, siegecraft, infernal contract, ash caravan, or sanctuary forge descriptors.
- Gallery copy now names the blood moon refuge layer so the route card reflects the new objective loop.

## Non-game handling

`Rogue-Lite Hellscape Siege` is a small experience-driven web game, so no delete/refactor/rename was needed.

## Next safe ledge

Add the two Hellscape blood moon refuge tests to the central check runner after normalizing the long suite list, then move the refuge descriptors from the lightweight DOM overlay into the canvas renderer if deeper in-world visual integration is needed.

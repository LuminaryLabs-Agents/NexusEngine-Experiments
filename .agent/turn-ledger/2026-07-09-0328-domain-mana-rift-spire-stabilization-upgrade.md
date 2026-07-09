# 2026-07-09 03:28 ET — Domain Mana Rift spire stabilization upgrade

## Chosen experiment

`experiments/domain-mana-rift/`

## Why it was chosen

The latest completed `.agent` ledger on `main` is `experiments/tiny-diffusion-lab/` sample clinic. A later observed diff on `main` touched `experiments/nexus-frontier-signal-isles/` with storm surge relay files, so this run avoided both. `Domain Mana Rift` was a very short passive scoped-domain Three.js scene: it showed a rift, enemy body, particles, and imported shared domain kits, but it did not have a concrete objective, readable progress loop, rescue/stabilization state, or route-local NexusEngine main CDN handoff.

## Last upgraded experiment

Latest completed ledger:

```txt
experiments/tiny-diffusion-lab/
2026-07-09-0258-tiny-diffusion-sample-clinic-upgrade.md
```

Latest observed route touched after that ledger:

```txt
experiments/nexus-frontier-signal-isles/
storm-surge-relay-readiness files were present in the compare from deecdb04... to main.
```

This run selected a different route: `experiments/domain-mana-rift/`.

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import audit | NexusEngine main CDN audit |
| --- | --- | --- | --- | --- | --- |
| `experiments/peer-scene-transition/` | Story-scene orchestration route. | Short scene chain. | Scene exits, tokens, inventory, transitions, flood rescue descriptors. | Existing shared loader naming may remain. | Recent overlays use NexusEngine main CDN where changed. |
| `experiments/vr-platformer-board/` | Floating XR platformer board. | Short platformer board. | Lane movement, jump, collectibles, hazards, comfort, traversal, companion rescue descriptors. | Shared compatibility naming may remain. | Route runtime imports NexusEngine main CDN. |
| `experiments/infinite-radial-terrain/` | Radial terrain tessellation flight. | Open-ended traversal demo. | WASD flight, LOD, origin snapping, survey and observatory evacuation overlays. | Changed overlays avoid old runtime CDN. | Recent overlays use NexusEngine main CDN. |
| `experiments/high-fidelity-meadow/` | Procedural meadow composition. | Open-ended scene. | Terrain, wind, vegetation, creatures, water-management overlays. | Existing old names may remain in shared files. | Recent creek irrigation pass uses NexusEngine main CDN. |
| `experiments/tiny-diffusion-lab/` | Browser CPU diffusion proof. | Lab session. | Prepare, train, sample, checkpoint, training mission descriptors, sample clinic descriptors. | Latest completed ledger, skipped. | Latest completed ledger uses NexusEngine main CDN. |
| `experiments/living-agent-lab/` | Market trust agent lab. | Short lab loop. | ONNX/fallback agent, witness/evidence/restitution descriptors. | Recent changed files avoid old runtime CDN. | Recent pass uses NexusEngine main CDN. |
| `experiments/fogline-relay/` | First-person survey and rescue pressure. | Short objective loop. | Movement, scanning, relay repair, medical overlays. | Existing legacy names may remain outside changed passes. | Recent overlays use NexusEngine main CDN. |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer island systems route. | Short systems slice. | Scan, harvest, build, pressure, gates, beacons, harbor/lighthouse overlays, storm surge relay. | Latest observed changed route, skipped. | Recent overlay imports NexusEngine main CDN. |
| `experiments/domain-mana-rift/` | Scoped-domain rift arena. | Very short passive scene. | Shared enemy, health, guard, mana, status, zone, vegetation, interaction kits; this run adds rift stabilization descriptors. | Shared composer imports ProtoKits under the historical NexusRealtime name; changed route files avoid old NexusRealtime runtime CDN. | This run adds NexusEngine main CDN in the new route entry. |
| `apps/the-cavalry-of-rome/` | Painterly Roman strategy visual proof. | Open-ended map inspection. | Pan, hover, dive, army descriptors, logistics and campaign overlays. | Existing legacy naming may remain. | Recent changed passes use NexusEngine main CDN. |
| `games/signal-bastion/` | 2.5D tower defense. | Short wave session. | Tower cards, placement, waves, field hospital overlays. | Previous pass audited changed entry only. | Recent field hospital pass uses NexusEngine main CDN. |
| `games/stonewake-depths/` | Flooded cavern puzzle platformer. | Short puzzle rescue loop. | Block carry, valves, plates, survivor echo pings, chalk marks, air pockets, rope lifts. | Previous pass audited changed entry only. | Recent flood rescue pass uses NexusEngine main CDN. |
| `experiments/next-ledge/` | Grapple climb route. | Short climb run. | Aim, grapple, swing, stamina, ledge route, glacier supply descriptors. | Recent changed files avoid old runtime CDN. | Recent pass uses NexusEngine main CDN. |
| `experiments/sora-the-infinite/` | Aerial traversal / redirect route. | Short gateway/open traversal. | Flight preview, visual domains, migration overlays. | Existing legacy names may remain outside changed pass. | Recent rookery pass uses NexusEngine main CDN. |
| `experiments/zombie-orchard/` | Survival orchard slice. | Short survival round. | Rounds, pickups, horde pressure, water restoration. | Existing legacy names may remain outside changed pass. | Recent well pass uses NexusEngine main CDN. |
| `games/rogue-lite-hellscape-siege/` | Action RPG/base siege route. | Short wave/action slice. | Portals, inventory, harvesting, building, wave defense, forge/caravan/refuge descriptors. | Existing legacy names may remain outside changed pass. | Recent refuge pass uses NexusEngine main CDN. |
| `experiments/BirdRun/` | Canvas bird runner. | Short runner. | Lane switching, wingbeat altitude, grove obstacles, nestling rescue, scoring. | Recent changed files avoid old runtime CDN. | Recent canopy rescue pass uses NexusEngine main CDN. |

## Domain ASCII tree

```txt
domain-mana-rift-spire-stabilization-readiness-domain
├─ rift-forecast-domain
│  ├─ pulse-forecast-domain
│  │  └─ domain-mana-rift-pulse-forecast-kit
│  └─ pressure-vent-domain
│     └─ domain-mana-rift-pressure-vent-kit
├─ spire-stabilization-domain
│  ├─ spire-anchor-domain
│  │  └─ domain-mana-rift-spire-anchor-kit
│  └─ conduit-thread-domain
│     └─ domain-mana-rift-conduit-thread-kit
├─ evacuation-handoff-domain
│  ├─ ward-circle-domain
│  │  └─ domain-mana-rift-ward-circle-kit
│  └─ apprentice-ledger-domain
│     └─ domain-mana-rift-apprentice-ledger-kit
└─ renderer-handoff
   └─ domain-mana-rift-spire-stabilization-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
domain-mana-rift-pulse-forecast-kit
domain-mana-rift-pressure-vent-kit
domain-mana-rift-spire-anchor-kit
domain-mana-rift-conduit-thread-kit
domain-mana-rift-ward-circle-kit
domain-mana-rift-apprentice-ledger-kit
domain-mana-rift-spire-stabilization-renderer-handoff-kit
domain-mana-rift-spire-stabilization-readiness-domain-kit
```

The reusable kit accepts mana/rift/apprentice/anchor/player-distance intake and emits serializable descriptors only. It explicitly avoids renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, physics, and frame-loop ownership.

## Files changed

```txt
experiments/domain-mana-rift/index.html
experiments/domain-mana-rift/domain-mana-rift-spire-stabilization-kits.js
experiments/domain-mana-rift/domain-mana-rift-spire-stabilization-entry.js
tests/domain-mana-rift-spire-stabilization-readiness-kits-smoke.mjs
tests/domain-mana-rift-spire-stabilization-cdn-state-input-smoke.mjs
.agent/turn-ledger/2026-07-09-0328-domain-mana-rift-spire-stabilization-upgrade.md
```

## Tests added

```txt
tests/domain-mana-rift-spire-stabilization-readiness-kits-smoke.mjs
tests/domain-mana-rift-spire-stabilization-cdn-state-input-smoke.mjs
```

## Validation results

Scratch Node validation passed before connector writes:

```txt
node --check experiments/domain-mana-rift/domain-mana-rift-spire-stabilization-kits.js
node --check experiments/domain-mana-rift/domain-mana-rift-spire-stabilization-entry.js
node --check tests/domain-mana-rift-spire-stabilization-readiness-kits-smoke.mjs
node --check tests/domain-mana-rift-spire-stabilization-cdn-state-input-smoke.mjs
node tests/domain-mana-rift-spire-stabilization-readiness-kits-smoke.mjs
node tests/domain-mana-rift-spire-stabilization-cdn-state-input-smoke.mjs
```

Observed outputs:

```txt
Domain Mana Rift spire stabilization readiness kits smoke passed 10 intake cases.
Domain Mana Rift spire stabilization CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a cloned workspace because this runtime could not resolve `github.com`. The added CDN/state test performs static route/CDN checks and 10 simulated state/input cases.

## NexusRealtime import audit

Changed files do not import:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main
```

The new entry imports:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

Existing `experiments/_shared/scoped-domain-three-composer.js` still imports historical `NexusRealtime-ProtoKits@0.0.2` package URLs. This run did not rewrite the shared composer because it is used by multiple scoped-domain scenes; the changed route-specific entry is migrated toward NexusEngine main CDN as requested.

## Cleanup pass

- Reusable rift stabilization logic is deterministic and serializable.
- The route now has a clear objective: stabilize the spire, vent rift pressure, lock anchors, draw conduit threads, seal wards, and clear apprentice evacuation ledgers.
- Renderer handoff is descriptor-only and composed through `GameHost.getRendererHandoff()`.
- The route entry owns the DOM overlay only as integration code; atomic kits remain renderer-neutral.
- Cache-busted integration uses `domain-mana-rift-spire-stabilization-20260709`.

## Non-game handling

`Domain Mana Rift` is a small experience-driven web scene, not a non-game utility. It was not deleted, renamed, or refactored destructively. The lesson is that the scoped-domain scenes are visually useful but need an objective ledger and state/readiness handoff to become more game-like.

## Next safe ledge

Move the stabilization descriptors into the existing Three scene as actual low-poly spire anchors, conduit beams, ward circles, and vent plumes. Keep the descriptor generation in the new kits and let the Three renderer consume the handoff only.

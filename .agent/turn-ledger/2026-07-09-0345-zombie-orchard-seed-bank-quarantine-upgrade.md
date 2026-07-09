# 2026-07-09 03:45 ET — Zombie Orchard seed bank quarantine upgrade

## Chosen experiment

`experiments/zombie-orchard/`

## Why it was chosen

The latest completed upgrade ledger on `main` was `experiments/domain-mana-rift/`, so this run selected a different route. `Zombie Orchard` was already a small experience-driven web game, but its latest objective layers focused on survival readability, cure crafting, safehouse evacuation, and well restoration. It still lacked a durable long-term recovery objective that answered what the orchard is preserving after the immediate horde pressure clears. The seed bank quarantine layer adds a more meaningful restoration loop without moving reusable logic into the renderer.

## Last upgraded experiment

```txt
experiments/domain-mana-rift/
2026-07-09-0328-domain-mana-rift-spire-stabilization-upgrade.md
```

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import audit | NexusEngine main CDN audit |
| --- | --- | --- | --- | --- | --- |
| `experiments/peer-scene-transition/` | Story-scene orchestration route. | Short scene chain. | Scene exits, tokens, inventory, transitions, flood rescue descriptors. | Existing shared loader naming may remain. | Recent overlays use NexusEngine main CDN where changed. |
| `experiments/vr-platformer-board/` | Floating XR platformer board. | Short platformer board. | Lane movement, jump, collectibles, hazards, comfort, traversal, companion rescue descriptors. | Shared compatibility naming may remain. | Route runtime imports NexusEngine main CDN. |
| `experiments/infinite-radial-terrain/` | Radial terrain tessellation flight. | Open-ended traversal demo. | WASD flight, LOD, origin snapping, survey and observatory evacuation overlays. | Changed overlays avoid old runtime CDN. | Recent overlays use NexusEngine main CDN. |
| `experiments/high-fidelity-meadow/` | Procedural meadow composition. | Open-ended scene. | Terrain, wind, vegetation, creatures, water-management overlays. | Existing old names may remain in shared files. | Recent creek irrigation pass uses NexusEngine main CDN. |
| `experiments/tiny-diffusion-lab/` | Browser CPU diffusion proof. | Lab session. | Prepare, train, sample, checkpoint, training mission descriptors, sample clinic descriptors. | Recent changed files avoid old runtime CDN. | Recent pass uses NexusEngine main CDN. |
| `experiments/living-agent-lab/` | Market trust agent lab. | Short lab loop. | ONNX/fallback agent, witness/evidence/restitution descriptors. | Recent changed files avoid old runtime CDN. | Recent pass uses NexusEngine main CDN. |
| `experiments/fogline-relay/` | First-person survey and rescue pressure. | Short objective loop. | Movement, scanning, relay repair, medical overlays. | Existing legacy names may remain outside changed passes. | Recent overlays use NexusEngine main CDN. |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer island systems route. | Short systems slice. | Scan, harvest, build, pressure, gates, beacons, harbor/lighthouse overlays, storm surge relay. | Recent changed files avoid old runtime CDN. | Recent overlay imports NexusEngine main CDN. |
| `experiments/domain-mana-rift/` | Scoped-domain rift arena. | Very short passive scene. | Shared enemy, health, guard, mana, status, zone, vegetation, interaction kits, spire stabilization descriptors. | Latest completed upgrade, skipped. | Recent pass uses NexusEngine main CDN. |
| `apps/the-cavalry-of-rome/` | Painterly Roman strategy visual proof. | Open-ended map inspection. | Pan, hover, dive, army descriptors, logistics and campaign overlays. | Existing legacy naming may remain. | Recent changed passes use NexusEngine main CDN. |
| `games/signal-bastion/` | 2.5D tower defense. | Short wave session. | Tower cards, placement, waves, field hospital overlays. | Previous pass audited changed entry only. | Recent field hospital pass uses NexusEngine main CDN. |
| `games/stonewake-depths/` | Flooded cavern puzzle platformer. | Short puzzle rescue loop. | Block carry, valves, plates, survivor echo pings, chalk marks, air pockets, rope lifts. | Previous pass audited changed entry only. | Recent flood rescue pass uses NexusEngine main CDN. |
| `experiments/next-ledge/` | Grapple climb route. | Short climb run. | Aim, grapple, swing, stamina, ledge route, glacier supply descriptors. | Recent changed files avoid old runtime CDN. | Recent pass uses NexusEngine main CDN. |
| `experiments/sora-the-infinite/` | Aerial traversal / redirect route. | Short gateway/open traversal. | Flight preview, visual domains, migration overlays. | Existing legacy names may remain outside changed pass. | Recent rookery pass uses NexusEngine main CDN. |
| `experiments/zombie-orchard/` | Orchard survival slice. | Short survival round. | WASD movement, sprint, dodge, apple collection, gear use, horde pressure, cure crafting, safehouse evacuation, well restoration, seed bank quarantine descriptors. | Existing page loader still uses historical `attachNexusRealtimePageLoader` naming; changed seed bank files avoid old runtime CDN. | This run adds NexusEngine main CDN in the new seed bank entry. |
| `games/rogue-lite-hellscape-siege/` | Action RPG/base siege route. | Short wave/action slice. | Portals, inventory, harvesting, building, wave defense, forge/caravan/refuge descriptors. | Existing legacy names may remain outside changed pass. | Recent refuge pass uses NexusEngine main CDN. |
| `experiments/BirdRun/` | Canvas bird runner. | Short runner. | Lane switching, wingbeat altitude, grove obstacles, nestling rescue, scoring. | Recent changed files avoid old runtime CDN. | Recent canopy rescue pass uses NexusEngine main CDN. |

## Domain ASCII tree

```txt
zombie-orchard-seed-bank-quarantine-readiness-domain
├─ seed-preservation-domain
│  ├─ heirloom-seed-cache-domain
│  │  └─ zombie-orchard-heirloom-seed-cache-kit
│  └─ graft-scion-rack-domain
│     └─ zombie-orchard-graft-scion-rack-kit
├─ quarantine-defense-domain
│  ├─ spore-fence-domain
│  │  └─ zombie-orchard-spore-fence-lantern-kit
│  └─ compost-pit-domain
│     └─ zombie-orchard-compost-burn-pit-kit
├─ recovery-handoff-domain
│  ├─ orchard-row-charter-domain
│  │  └─ zombie-orchard-row-replant-charter-kit
│  └─ dawn-seed-ledger-domain
│     └─ zombie-orchard-dawn-seed-ledger-kit
└─ renderer-handoff
   └─ zombie-orchard-seed-bank-quarantine-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
zombie-orchard-heirloom-seed-cache-kit
zombie-orchard-graft-scion-rack-kit
zombie-orchard-spore-fence-lantern-kit
zombie-orchard-compost-burn-pit-kit
zombie-orchard-row-replant-charter-kit
zombie-orchard-dawn-seed-ledger-kit
zombie-orchard-seed-bank-quarantine-renderer-handoff-kit
zombie-orchard-seed-bank-quarantine-readiness-domain-kit
```

The reusable kit accepts orchard/player/horde/inventory/visual-domain intake and emits serializable descriptors only. It explicitly avoids renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, physics, and frame-loop ownership.

## Files changed

```txt
experiments/zombie-orchard/index.html
experiments/zombie-orchard/src/seed-bank-quarantine-readiness-kits.js
experiments/zombie-orchard/src/seed-bank-quarantine-readiness-entry.js
tests/zombie-orchard-seed-bank-quarantine-readiness-kits-smoke.mjs
tests/zombie-orchard-seed-bank-quarantine-cdn-state-input-smoke.mjs
tests/zombie-orchard-playwright-state-input-smoke.mjs
.agent/turn-ledger/2026-07-09-0345-zombie-orchard-seed-bank-quarantine-upgrade.md
```

## Tests added

```txt
tests/zombie-orchard-seed-bank-quarantine-readiness-kits-smoke.mjs
tests/zombie-orchard-seed-bank-quarantine-cdn-state-input-smoke.mjs
```

Updated:

```txt
tests/zombie-orchard-playwright-state-input-smoke.mjs
```

## Validation results

Scratch Node validation passed before connector writes:

```txt
node --check experiments/zombie-orchard/src/seed-bank-quarantine-readiness-kits.js
node --check experiments/zombie-orchard/src/seed-bank-quarantine-readiness-entry.js
node --check tests/zombie-orchard-seed-bank-quarantine-readiness-kits-smoke.mjs
node --check tests/zombie-orchard-seed-bank-quarantine-cdn-state-input-smoke.mjs
node --check tests/zombie-orchard-playwright-state-input-smoke.mjs
node tests/zombie-orchard-seed-bank-quarantine-readiness-kits-smoke.mjs
node tests/zombie-orchard-seed-bank-quarantine-cdn-state-input-smoke.mjs
```

Observed outputs:

```txt
Zombie Orchard seed bank quarantine readiness kits smoke passed 10 intake cases.
Zombie Orchard seed bank quarantine CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a cloned workspace in this connector pass. The parent Playwright-style smoke was updated, but only `node --check` was run for that file in scratch.

## NexusRealtime import audit

Changed files do not import:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js
```

The new entry imports:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

`experiments/zombie-orchard/index.html` still imports `attachNexusRealtimePageLoader` from the shared loader. That is legacy naming for the shared page loader, not an old runtime CDN import. This run did not rewrite the shared loader because it is used across multiple routes.

## Cleanup pass

- Added one coherent objective layer instead of ad hoc route UI: preserve heirloom seed caches, rack graft scions, fence spores, burn contaminated compost, charter replant rows, and ledger dawn seed distribution.
- Reusable kit logic is deterministic and serializable.
- DOM/canvas overlay logic lives only in the route entry.
- `GameHost.getRendererHandoff()` composes seed bank descriptors with existing cure, safehouse, and well handoffs.
- Cache-busted integration uses `zombie-orchard-seed-bank-quarantine-20260709`.

## Non-game handling

`Zombie Orchard` is a small experience-driven web game. It was not deleted, renamed, or destructively refactored. The lesson from this pass is that survival scenes become more meaningful when each immediate survival action also contributes to a durable recovery system.

## Next safe ledge

Move seed bank quarantine descriptors into the actual orchard view as small seed cache crates, graft racks, spore-fence lanterns, compost smoke pits, replant row flags, and dawn ledger markers. Keep descriptor generation in the new kits and let the renderer consume the handoff only.

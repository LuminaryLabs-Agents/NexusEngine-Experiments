# Nexus Engine Rename Migration

## Status

The core engine repo was renamed from:

```txt
https://github.com/LuminaryLabs-Dev/NexusRealtime
```

to:

```txt
https://github.com/LuminaryLabs-Dev/NexusEngine
```

This repository still lives at:

```txt
LuminaryLabs-Agents/NexusRealtime-Experiments
```

until the experiments repo itself is intentionally renamed.

## Naming rule

Use public-facing product language:

```txt
Nexus Engine
Nexus Engine Core
Nexus Engine Experiments
Nexus Engine Arcade
```

Keep package/import compatibility names unless a route-by-route code migration is explicitly planned:

```txt
nexusrealtime package alias
NexusRealtime import variable
createRealtimeGame API
```

This keeps existing experiments running while the repo/docs/URLs move to the Nexus Engine name.

## Implemented first-pass changes

- `package.json` now names this package `@luminarylabs/nexusengine-experiments`.
- `package.json` now points the `nexusrealtime` dependency alias at `github:LuminaryLabs-Dev/NexusEngine#main`.
- Root `index.html` now uses Nexus Engine gallery title, description, and aria label.
- `README.md` now describes the repo as Nexus Engine Experiments.
- `experiments/_shared/nexus-gallery-data.js` now uses `Nexus Engine playable routes` as gallery subtitle.

## Remaining safe text replacements

Search and replace in docs and visible copy:

```txt
NexusRealtime Experiments -> Nexus Engine Experiments
NexusRealtime Arcade -> Nexus Engine Arcade
NexusRealtime Core -> Nexus Engine Core
NexusRealtime browser experiments -> Nexus Engine browser experiments
LuminaryLabs-Dev/NexusRealtime -> LuminaryLabs-Dev/NexusEngine
```

## Import / URL replacements

Safe dependency URL replacement:

```txt
github:LuminaryLabs-Dev/NexusRealtime#main
->
github:LuminaryLabs-Dev/NexusEngine#main
```

Safe CDN URL replacement when found:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js
->
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

Do not rename the package alias from `nexusrealtime` until every route import is checked.

## Active gallery routes to verify

These are the current gallery-visible routes and should be smoke checked after the rename pass:

| # | Route | Path | Required check |
|---:|---|---|---|
| 1 | VR Platformer Board | `experiments/vr-platformer-board/` | boot, imports, visible title/copy |
| 2 | The Open Above | `experiments/the-open-above-harness/` | boot, imports, visible title/copy |
| 3 | High Fidelity Meadow | `experiments/high-fidelity-meadow/` | boot, imports, visible title/copy |
| 4 | Fogline Relay | `experiments/fogline-relay/` | boot, imports, visible title/copy |
| 5 | Nexus Frontier: Signal Isles | `experiments/nexus-frontier-signal-isles/` | boot, imports, visible title/copy |
| 6 | The Cavalry of Rome | `apps/the-cavalry-of-rome/` | boot, imports, visible title/copy |
| 7 | Signal Bastion | `games/signal-bastion/` | boot, imports, visible title/copy |
| 8 | Next Ledge | `experiments/next-ledge/` | boot, imports, visible title/copy |
| 9 | Sora The Infinite | `experiments/sora-the-infinite/` | boot, imports, visible title/copy |
| 10 | Zombie Orchard | `experiments/zombie-orchard/` | boot, imports, visible title/copy |
| 11 | Rogue-Lite Hellscape Siege | `games/rogue-lite-hellscape-siege/` | boot, imports, visible title/copy |

## First 20 arcade entries to sweep

These are the first 20 `arcade.json` routes called out for migration tracking:

| # | Route | Path |
|---:|---|---|
| 1 | Fogline Relay | `experiments/fogline-relay/` |
| 2 | The Open Above | `experiments/the-open-above/` |
| 3 | Zombie Orchard | `experiments/zombie-orchard/` |
| 4 | Rogue-Lite Hellscape Siege | `games/rogue-lite-hellscape-siege/` |
| 5 | Ember Rail | `experiments/aaa-batch/ember-rail/` |
| 6 | Tideglass Salvage | `experiments/aaa-batch/tideglass-salvage/` |
| 7 | Echo Lock | `experiments/aaa-batch/echo-lock/` |
| 8 | Hollow Warden | `experiments/aaa-batch/hollow-warden/` |
| 9 | Skyrig Suture | `experiments/aaa-batch/skyrig-suture/` |
| 10 | Mirage Stalker | `experiments/aaa-batch/mirage-stalker/` |
| 11 | Core Diver | `experiments/aaa-batch/core-diver/` |
| 12 | Starwell Cartographer | `experiments/aaa-batch/starwell-cartographer/` |
| 13 | Gravity Anvil | `experiments/aaa-batch/gravity-anvil/` |
| 14 | Lantern Vow | `experiments/aaa-batch/lantern-vow/` |
| 15 | Mammoth Bell | `experiments/aaa-batch/mammoth-bell/` |
| 16 | Mirrorfall Prism | `experiments/aaa-batch/mirrorfall-prism/` |
| 17 | Thunder Kite | `experiments/aaa-batch/thunder-kite/` |
| 18 | Glyph Sprinter | `experiments/aaa-batch/glyph-sprinter/` |
| 19 | Sporewright Canopy | `experiments/aaa-batch/sporewright-canopy/` |
| 20 | Rift Bazaar | `experiments/aaa-batch/rift-bazaar/` |

For each route, check:

```txt
README.md
index.html
src/main.js or boot script
hardcoded GitHub URLs
hardcoded jsDelivr URLs
visible title/HUD/debug labels
smoke-check labels
```

## Validation commands

Run after migration edits:

```bash
npm install
npm run generate
npm run check
npm run check:deploy
```

If generation rewrites gallery data, reapply public-facing Nexus Engine copy in the generator source rather than editing generated output only.

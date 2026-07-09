# 2026-07-09 01:46 ET — High Fidelity Meadow creek irrigation readiness upgrade

## Chosen experiment

`experiments/high-fidelity-meadow/`

## Why it was chosen

The latest observed changed route was `games/stonewake-depths/` and the latest completed ledger was `experiments/BirdRun/`, so this run avoided both. High Fidelity Meadow was selected because it is still a compact scene-driven route where visual richness depends on reusable descriptors, and the meadow can support a meaningful ecological water-management objective without pushing reusable logic into the renderer.

## Last upgraded experiment

- Latest observed repo commits: `games/stonewake-depths/` flood rescue readiness.
- Latest logged completed ledger before this run: `experiments/BirdRun/` canopy rescue.
- This run intentionally changed a different route: `experiments/high-fidelity-meadow/`.

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/peer-scene-transition/` | Story-scene orchestration proof with scene-hosted transitions, puzzle tokens, visited-scene state, inventory, and transition ledgers. | 3-6 minutes | Scene traversal, token collection, state-gated exits. | No changed runtime import in this run. | Existing route is gallery-managed; not changed here. |
| `experiments/vr-platformer-board/` | Floating platformer board for XR pose, input, comfort, spatial anchors, stereo descriptors, and renderer-neutral state. | 3-5 minutes | 2D platforming on a VR board, movement, jump, collectibles, hazards. | No changed runtime import in this run. | Already has NexusEngine CDN in route script. |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain tessellation with WASD flight, origin snapping, close LOD bands, and procedural terrain. | 4-8 minutes | Flight/survey traversal, LOD terrain inspection. | No changed runtime import in this run. | Previously migrated by route overlays. |
| `experiments/high-fidelity-meadow/` | Procedural meadow scene with terrain, wind, vegetation, sheep, sky, VFX, visual fractal descriptors, ecology, pasture routing, flock safety, harvest, pollinator, and night watch layers. | 4-8 minutes | Scene exploration, ecology readability, descriptor overlays, now creek irrigation readiness. | Changed files do not import old NexusRealtime runtime. | Changed entry imports NexusEngine main CDN. |
| `experiments/tiny-diffusion-lab/` | Browser-host proof for tiny CPU diffusion training, denoising, sampling, checkpoint save/load. | 5-10 minutes | Train/sample/checkpoint lab loop. | No changed runtime import in this run. | Previously migrated by route overlay. |
| `experiments/fogline-relay/` | First-person survey loop with scan targets, fog zones, timed pressure, hazards, and renderer-only buckets. | 5-10 minutes | First-person scan, repair, rescue, route pressure. | No changed runtime import in this run. | Previously migrated by route overlays. |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer slice for scan, harvest, build, pressure, gates, cargo, beacon, feedback, debug, and replay surfaces. | 5-10 minutes | Field engineering, resource routing, beacon and cargo objectives. | No changed runtime import in this run. | Previously migrated by route overlays. |
| `apps/the-cavalry-of-rome/` | Painterly Roman terrain map with hover regions, cinematic dives, and primitive-built full armies. | 5-8 minutes | Pannable map, region hover, tactical visual proof. | No changed runtime import in this run. | Previously migrated by route overlay. |
| `games/signal-bastion/` | 2.5D cel-style defense game with towers, HUD, placement ghost, range rings, and tactics panels. | 8-12 minutes | Tower placement, waves, defense, tactical descriptors. | No changed runtime import in this run. | Existing game runtime not changed here. |
| `games/stonewake-depths/` | Flooded cavern rescue game with block carrying, valves, rune gates, survivor pings, chalk marks, air pockets, rope lifts, and rescue bell extraction. | 8-12 minutes | Puzzle platformer rescue, pressure valves, extraction. | Latest observed route; intentionally avoided. | Latest observed flood rescue overlay uses NexusEngine CDN path. |
| `experiments/next-ledge/` | Grapple-climb validation with action input, ledge routes, swing pressure, feedback descriptors, and Three.js host. | 4-7 minutes | Grapple, climb, route extraction, rescue overlays. | No changed runtime import in this run. | Previously migrated by route overlays. |
| `experiments/sora-the-infinite/` | Open aerial traversal launcher/route that redirects into The Open Above and exposes visual domains for flight readability. | 2-4 minutes | Route launch, flight plan readability, migration readiness. | No changed runtime import in this run. | Previously migrated by route overlay. |
| `experiments/zombie-orchard/` | Survival slice for rounds, pressure, pickups, weapons, orchard content, and debug-friendly runtime state. | 6-10 minutes | Survival rounds, horde pressure, scavenging, well restoration. | No changed runtime import in this run. | Previously migrated by route overlay. |
| `games/rogue-lite-hellscape-siege/` | Base route for portals, inventory, harvesting, building, wave defense, FX, and renderer-only presentation. | 8-15 minutes | Action RPG, base siege, harvesting, wave defense. | No changed runtime import in this run. | Existing game runtime not changed here. |

## Domain ASCII tree

```txt
meadow-creek-irrigation-readiness-domain
├─ water-source-domain
│  ├─ spring-seep-domain
│  │  └─ meadow-spring-seep-source-kit
│  └─ creek-ribbon-domain
│     └─ meadow-creek-ribbon-course-kit
├─ flow-control-domain
│  ├─ stone-weir-domain
│  │  └─ weir-step-domain
│  │     └─ meadow-stone-weir-flow-kit
│  └─ irrigation-furrow-domain
│     └─ meadow-irrigation-furrow-grid-kit
├─ habitat-handoff-domain
│  ├─ frog-refuge-domain
│  │  └─ meadow-frog-refuge-pool-kit
│  └─ dawn-water-ledger-domain
│     └─ meadow-dawn-water-ledger-kit
└─ renderer-handoff
   └─ meadow-creek-irrigation-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `meadow-spring-seep-source-kit`
- `meadow-creek-ribbon-course-kit`
- `meadow-stone-weir-flow-kit`
- `meadow-irrigation-furrow-grid-kit`
- `meadow-frog-refuge-pool-kit`
- `meadow-dawn-water-ledger-kit`
- `meadow-creek-irrigation-renderer-handoff-kit`
- `meadow-creek-irrigation-readiness-domain-kit`

The kits accept meadow dimensions, height/path/yard samplers, sheep, flowers, day amount, and seed. They emit JSON-safe spring, creek, weir, furrow, frog pool, and water ledger descriptors. Composite logic composes atomic kit outputs without owning their internals.

## Files changed

```txt
experiments/high-fidelity-meadow/index.html
experiments/high-fidelity-meadow/src/meadow-creek-irrigation-readiness-kits.js
experiments/high-fidelity-meadow/src/meadow-creek-irrigation-entry.js
tests/high-fidelity-meadow-creek-irrigation-readiness-kits-smoke.mjs
tests/high-fidelity-meadow-creek-irrigation-cdn-state-input-smoke.mjs
tests/high-fidelity-meadow-playwright-state-input-smoke.mjs
.agent/turn-ledger/2026-07-09-0146-meadow-creek-irrigation-upgrade.md
```

## Tests added

```txt
tests/high-fidelity-meadow-creek-irrigation-readiness-kits-smoke.mjs
tests/high-fidelity-meadow-creek-irrigation-cdn-state-input-smoke.mjs
```

The parent meadow state/input smoke now imports the creek irrigation CDN/state smoke.

## Validation results

Scratch validation passed before connector writes:

```txt
node --check experiments/high-fidelity-meadow/src/meadow-creek-irrigation-readiness-kits.js
node --check experiments/high-fidelity-meadow/src/meadow-creek-irrigation-entry.js
node --check tests/high-fidelity-meadow-creek-irrigation-readiness-kits-smoke.mjs
node --check tests/high-fidelity-meadow-creek-irrigation-cdn-state-input-smoke.mjs
node tests/high-fidelity-meadow-creek-irrigation-readiness-kits-smoke.mjs
node tests/high-fidelity-meadow-creek-irrigation-cdn-state-input-smoke.mjs
```

Results:

```txt
High Fidelity Meadow creek irrigation readiness kits smoke passed 10 intake cases.
High Fidelity Meadow creek irrigation CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full repo `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a cloned workspace in this pass. The new CDN/state smoke is a local Playwright-style state/input validation that checks route markers, NexusEngine main CDN use, old NexusRealtime absence in changed entry, GameHost exposure, parent smoke routing, and 10 simulated state/input cases.

## NexusRealtime import audit

Changed entry:

```txt
experiments/high-fidelity-meadow/src/meadow-creek-irrigation-entry.js
```

uses:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

and does not import:

```txt
LuminaryLabs-Dev/NexusRealtime
```

The existing `package.json` still contains historical package names from the migration period; those were not changed because this run only modified High Fidelity Meadow route files and its tests.

## Cleanup pass

- Reused existing meadow host pattern rather than creating a new route shell.
- Kept reusable creek irrigation logic out of renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, physics, and frame-loop ownership.
- Put DOM/panel/canvas overlay behavior only in the route entry layer.
- Composed new descriptors into `GameHost.getRendererHandoff()` instead of replacing prior meadow handoffs.
- Preserved harvest, pollinator, and night watch overlays.

## Non-game handling

High Fidelity Meadow is a scene-driven experiment rather than a small scored game. It was not deleted or renamed. The lesson preserved: meadow quality improves when ecology and objective readability are expressed as descriptor-producing domains, while the renderer only consumes those descriptors.

## Next safe ledge

Normalize `experiments/domain-kit-cutover-manifest.json` away from its large one-line shape, then add `meadow-creek-irrigation-readiness-domain-kit` to the manifest safely. A follow-up could also move the creek overlay drawing into the existing WebGL render handoff so the watercourse aligns exactly to terrain projection instead of the lightweight screen-space overlay.

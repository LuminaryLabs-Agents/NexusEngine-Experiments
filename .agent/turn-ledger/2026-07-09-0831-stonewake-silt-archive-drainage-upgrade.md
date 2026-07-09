# 2026-07-09 08:31 ET — Stonewake Depths silt archive drainage upgrade

## Chosen experiment

`games/stonewake-depths/`

## Why it was chosen

The latest observed commit chain was the Zombie Orchard antiserum wellhouse pass, so this run intentionally chose a different route. Stonewake Depths is a compact 2D cavern rescue game with a clear but still fairly linear block/valve/plate/door loop. It had several additive rescue overlays already, but it still lacked a meaningful archive-preservation objective that turns the rising water into a second kind of pressure: save maps and fossil shelf records before silt buries the route.

## Last upgraded experiment

Latest commit scan before this work showed the last upgraded route was:

- `experiments/zombie-orchard/`
- Latest ledger commit: `Log Zombie Orchard antiserum wellhouse upgrade`

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import? | NexusEngine main CDN? |
|---|---|---:|---|---|---|
| `experiments/peer-scene-transition/` | Story-scene orchestration with local scene exits, tokens, inventory, and transition ledgers. | 3-8 min | Scene routing, puzzle tokens, inventory, transition validation | loader only / old naming remains | partial overlays |
| `experiments/vr-platformer-board/skyline-medevac.html` | Board-scale platformer rescue pass with skyline medevac descriptors. | 3-6 min | Jumping, coins, hazards, oxygen, medevac readiness | no changed old import | yes |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain tessellation and flight. | 5-10 min sandbox | WASD flight, radial LOD, procedural terrain | no changed old import | yes overlays |
| `experiments/high-fidelity-meadow/` | Procedural meadow with ecology, creek irrigation, and soil mycelium domains. | 5-10 min sandbox | Terrain, vegetation, wind, creature, VFX, ecology descriptors | no changed old import | yes overlays |
| `experiments/tiny-diffusion-lab/` | Browser-host tiny diffusion training and sampling proof. | 5-12 min lab | CPU training, samples, checkpoints, dataset expedition | no changed old import | yes |
| `experiments/living-agent-lab/` | Market-agent route with ONNX/fallback guard and civic festival descriptors. | 4-8 min lab | Agent action choice, trust, permits, routes, disputes | no changed old import | yes |
| `experiments/fogline-relay/` | First-person scan and fog pressure survey loop. | 4-8 min | Movement, scan, hazards, rescue/clinic/lighthouse descriptors | shared page loader uses old name | yes overlays |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer 3D kit utilization showcase. | 6-12 min sandbox | Scan, harvest, build, cargo, beacon, storm relay | no changed old import | yes overlays |
| `apps/the-cavalry-of-rome/` | Painted Roman strategy map proof. | 5-10 min sandbox | Pan, hover, dive, army descriptors, aqueduct sabotage | no changed old import | yes overlays |
| `games/signal-bastion/` | 2.5D tower-defense game. | 8-15 min | Towers, cards, range rings, hospital, supply convoy | no changed old import | yes overlays |
| `games/stonewake-depths/` | Flooded cavern rescue game with block carrying, valve pressure, rune plate, clinic, pressure lock, and now silt archive drainage. | 8-15 min | Carrying, valves, rune gates, pressure locks, silt gauges, siphon hoses, map cases | no changed old import | yes, new changed entry |
| `experiments/next-ledge/` | Grapple-climb validation with rescue descriptors. | 3-6 min | Grapple, ledges, swing pressure, rescue supply | no changed old import | yes overlays |
| `experiments/sora-the-infinite/` | Aerial traversal redirect into Open Above. | 3-8 min sandbox | Flight, visual domains, mood readability | no changed old import | yes overlays |
| `experiments/zombie-orchard/` | Survival slice for rounds, pressure, pickups, weapons, orchard content, and antiserum wellhouse descriptors. | 5-10 min | WASD, sprint, dodge, collect, gear, horde pressure, recovery overlays | shared page loader uses old name | yes overlays |
| `games/rogue-lite-hellscape-siege/` | Base-siege action route with ash caravan and ember well purification. | 8-15 min | Harvest, build, portals, waves, purification descriptors | no changed old import | yes overlays |
| `experiments/onnx-agent-lab/signal-calibration.html` | Signal-calibration workshop route. | 4-8 min lab | Model handshake, fallback rails, tools, prompt intent, memory trace | no changed old import | yes |

## Domain ASCII tree

```txt
stonewake-silt-archive-drainage-readiness-domain
├─ sediment-survey-domain
│  ├─ silt-gauge-domain
│  │  └─ stonewake-silt-depth-gauge-kit
│  └─ fossil-shelf-domain
│     └─ stonewake-fossil-shelf-archive-kit
├─ drainage-restoration-domain
│  ├─ siphon-hose-domain
│  │  └─ stonewake-siphon-hose-route-kit
│  └─ sump-crank-domain
│     └─ stonewake-sump-crank-wheel-kit
├─ survivor-record-handoff-domain
│  ├─ waxed-map-case-domain
│  │  └─ stonewake-waxed-map-case-kit
│  └─ dawn-drainage-ledger-domain
│     └─ stonewake-dawn-drainage-ledger-kit
└─ renderer-handoff
   └─ stonewake-silt-archive-drainage-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `createStonewakeSiltDepthGaugeKit`
- `createStonewakeFossilShelfArchiveKit`
- `createStonewakeSiphonHoseRouteKit`
- `createStonewakeSumpCrankWheelKit`
- `createStonewakeWaxedMapCaseKit`
- `createStonewakeDawnDrainageLedgerKit`
- `createStonewakeSiltArchiveDrainageRendererHandoffKit`
- `createStonewakeSiltArchiveDrainageReadinessDomainKit`

## Files changed

- Added `games/stonewake-depths/stonewake-silt-archive-drainage-kits.js`
- Added `games/stonewake-depths/stonewake-silt-archive-drainage-entry.js`
- Updated `games/stonewake-depths/index.html`
- Updated `experiments/_shared/nexus-gallery-data.js`
- Added `tests/stonewake-silt-archive-drainage-readiness-kits-smoke.mjs`
- Added `tests/stonewake-silt-archive-drainage-cdn-state-input-smoke.mjs`
- Added this changelog entry

## Tests added

- `tests/stonewake-silt-archive-drainage-readiness-kits-smoke.mjs`
  - 10 intake cases.
  - Checks all six descriptor families.
  - Checks descriptor-only renderer handoff.
  - Checks bounded readiness and silt pressure.
  - Checks mission-state enum.
  - Checks JSON serializability.
  - Checks readiness improves and silt pressure drops across the staged-to-prepared route.

- `tests/stonewake-silt-archive-drainage-cdn-state-input-smoke.mjs`
  - 10 simulated state/input cases.
  - Checks route marker and cache-busted script load.
  - Checks NexusEngine main CDN import.
  - Checks changed entry does not import old `NexusRealtime@`.
  - Checks `GameHost` readiness and renderer-handoff accessors.
  - Checks reusable kit source excludes DOM, window, input, canvas, WebGL, Three.js, audio, and frame-loop ownership.

## Validation results

Scratch validation passed before GitHub writes:

```txt
node --check games/stonewake-depths/stonewake-silt-archive-drainage-kits.js
node --check games/stonewake-depths/stonewake-silt-archive-drainage-entry.js
node --check tests/stonewake-silt-archive-drainage-readiness-kits-smoke.mjs
node --check tests/stonewake-silt-archive-drainage-cdn-state-input-smoke.mjs
node --check experiments/_shared/nexus-gallery-data.js
node tests/stonewake-silt-archive-drainage-readiness-kits-smoke.mjs
node tests/stonewake-silt-archive-drainage-cdn-state-input-smoke.mjs
```

Observed output:

```txt
Stonewake silt archive drainage readiness kits smoke passed 10 intake cases.
Stonewake silt archive drainage CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a cloned workspace in this connector-driven run. The required Playwright-style state/input validation coverage is represented by the local `.mjs` CDN/state/input smoke.

## NexusRealtime import audit

- New changed entry imports NexusEngine main CDN exactly:
  - `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`
- New changed entry does not import old `NexusRealtime@`.
- Stonewake route now loads the silt archive drainage pass as an additive module.
- Reusable kit file contains no `document`, `window`, `requestAnimationFrame`, canvas, WebGL, Three.js, audio, asset loading, storage, or browser-input ownership.

## Cleanup pass

- Kept reusable domain logic in a pure kit file separate from the DOM/canvas overlay entry.
- Entry composes with existing `GameHost.getRendererHandoff()` rather than replacing flood rescue, cave clinic, or pressure lock handoffs.
- Updated the Stonewake gallery copy so the launcher advertises the new objective layer.
- No route deletion or destructive refactor.
- No useful functionality removed.
- New overlay is additive and cache-busted.

## Non-game handling

Stonewake Depths is a small experience-driven web game, so no delete/refactor/rename pass was needed.

## Next safe ledge

Connect map-case pickup and fossil shelf preservation to actual in-game interaction state, then let the base Stonewake renderer draw a few permanent silt archive props in the cavern world while keeping the kit outputs descriptor-only.
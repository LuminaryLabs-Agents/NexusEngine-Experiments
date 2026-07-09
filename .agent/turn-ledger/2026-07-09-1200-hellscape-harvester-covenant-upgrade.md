# 2026-07-09 12:00 ET — Hellscape Harvester Covenant Upgrade

## Chosen experiment

`games/rogue-lite-hellscape-siege/`

## Why it was chosen

The latest completed turn upgraded `experiments/infinite-radial-terrain/` with the terrain aquifer cartography pass, so this run intentionally picked a different route. `Rogue-Lite Hellscape Siege` already has a working action/base-siege loop, but its newest descriptors were mostly recovery/accounting overlays. The weakest next ledge was a more procedural harvest objective that links existing inventory, wave pressure, corruption, enemy density, and extraction readiness into a readable play goal.

## Last upgraded experiment

`experiments/infinite-radial-terrain/` — terrain aquifer cartography, last logged by commit `1f0eefa915fe6dc94d526eb6b8110570fbc32bcc` after the terrain aquifer route and gallery commits.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/peer-scene-transition/` | Story scene orchestration proof with scene state exits, puzzle tokens, bell archive evacuation descriptors. | Short, 3-8 min. | HTML scene transitions, route exits, token validation, descriptor overlays. | Not changed this run. Legacy naming may remain in shared loader only. | Uses NexusEngine-era gallery metadata; not re-fetched this run. |
| `experiments/vr-platformer-board/skyline-medevac.html` | Board-scale platformer rescue pass with tether pylons, harnesses, wind, oxygen, medevac staging. | Short, 2-6 min. | A/D movement, jump, coins, hazards, rescue descriptors. | Not changed this run. | Uses upgraded route metadata; not re-fetched this run. |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain tessellation with aquifer cartography descriptors. | Open-ended, 3-10 min survey. | WASD flight, origin snapping, terrain LOD, water/cartography descriptors. | Not changed this run. | Latest route was upgraded immediately before this run. |
| `experiments/high-fidelity-meadow/` | Procedural meadow with terrain, wind, vegetation, creature, creek, and soil mycelium domains. | Open-ended, 3-10 min scene walk/look. | Procedural ecology descriptors, meadow scene presentation, environmental overlays. | Not changed this run. | Previously upgraded to NexusEngine overlay. |
| `experiments/tiny-diffusion-lab/` | Browser diffusion lab with CPU training, sampling, checkpoints, dataset/sample/latent descriptors. | Lab session, 5-15 min. | Dataset setup, training ticks, sampling, checkpoint/export readiness. | Not changed this run. | Previously upgraded to NexusEngine overlay. |
| `experiments/living-agent-lab/` | Market agent route with ONNX/fallback decisioning and civic festival descriptors. | Lab session, 4-10 min. | State-visible agent choices, permit/vendor/lantern/dispute descriptors. | Not changed this run. | Previously upgraded to NexusEngine overlay. |
| `experiments/fogline-relay/` | First-person fog survey with rescue, observatory, and signal courier overlays. | Short, 4-8 min. | Scan targets, fog zones, timed hazards, courier descriptors. | Not changed this run. | Previously upgraded to NexusEngine overlay. |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer island slice with scan, harvest, build, storm, hospital, solar desalination. | Short to medium, 6-12 min. | Scan/harvest/build gates, cargo, pressure, desalination descriptors. | Not changed this run. | Previously upgraded to NexusEngine overlay. |
| `apps/the-cavalry-of-rome/` | Pannable painterly Roman strategy visual proof with hover/dive/reveal. | Scenic, 2-6 min. | Map pan, region hover, cinematic dive, army reveal. | Not changed this run. | Previously upgraded in prior turns. |
| `games/signal-bastion/` | 2.5D tower defense with field hospital and supply convoy readiness. | Wave session, 5-12 min. | Tower cards, placement ghosts, enemies, range rings, convoy descriptors. | Not changed this run. | Previously upgraded to NexusEngine overlay. |
| `games/stonewake-depths/` | Flooded cavern rescue with valve pressure and silt archive drainage. | Puzzle session, 5-12 min. | Block carry, valve pressure, rune plates, survivor pings, drainage descriptors. | Not changed this run. | Previously upgraded to NexusEngine overlay. |
| `experiments/next-ledge/` | Grapple-climb validation with drone relay and summit rescue descriptors. | Short, 3-8 min. | Grapple, ledge routing, swing pressure, extraction descriptors. | Not changed this run. | Previously upgraded to NexusEngine overlay. |
| `experiments/sora-the-infinite/` | Gateway into The Open Above with sky rescue/orchard/rookery descriptor readiness. | Gateway/microtrial, 2-8 min. | Launch rehearsal, microflight trial, rescue/orchard descriptors. | Not changed this run. | Previously upgraded to NexusEngine overlay. |
| `experiments/zombie-orchard/` | Survival slice with rounds, horde pressure, cure and radio fence rescue. | Wave session, 5-12 min. | Rounds, pickups, weapons, horde pressure, rescue descriptors. | Not changed this run. | Previously upgraded to NexusEngine overlay. |
| `games/rogue-lite-hellscape-siege/` | Base-siege action route for portals, inventory, harvesting, building, waves, ember wells, seed vault, and now harvester covenant readiness. | Wave/action session, 6-14 min. | Realm portals, inventory, harvesting, building, wave defense, covenant harvest/tithe/extraction descriptors. | Route still references shared `nexus-realtime-page-loader.js` by filename; changed entry imports no old `NexusRealtime@` runtime. | `src/main.js` and the new covenant entry import `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`. |
| `experiments/onnx-agent-lab/signal-calibration.html` | Signal calibration workshop with model handshake/fallback readiness descriptors. | Lab session, 3-8 min. | Model/fallback calibration, tool cues, prompt intent, memory trace, scene gate. | Not changed this run. | Previously upgraded to NexusEngine overlay. |

## Domain ASCII tree

```txt
hellscape-harvester-covenant-readiness-domain
├─ harvest-pact-domain
│  ├─ bloodroot-plot-domain
│  │  └─ hellscape-bloodroot-plot-kit
│  └─ ash-sickle-path-domain
│     └─ hellscape-ash-sickle-path-kit
├─ soul-tithe-domain
│  ├─ ember-tithe-bowl-domain
│  │  └─ hellscape-ember-tithe-bowl-kit
│  └─ demon-audit-seal-domain
│     └─ hellscape-demon-audit-seal-kit
├─ escape-bargain-domain
│  ├─ covenant-wagon-wheel-domain
│  │  └─ hellscape-covenant-wagon-wheel-kit
│  └─ dawn-covenant-ledger-domain
│     └─ hellscape-dawn-covenant-ledger-kit
└─ renderer-handoff
   └─ hellscape-harvester-covenant-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `hellscape-bloodroot-plot-kit`
- `hellscape-ash-sickle-path-kit`
- `hellscape-ember-tithe-bowl-kit`
- `hellscape-demon-audit-seal-kit`
- `hellscape-covenant-wagon-wheel-kit`
- `hellscape-dawn-covenant-ledger-kit`
- `hellscape-harvester-covenant-renderer-handoff-kit`
- `hellscape-harvester-covenant-readiness-domain-kit`

## Files changed

Added:

- `games/rogue-lite-hellscape-siege/src/hellscape-harvester-covenant-readiness-domain-kit.js`
- `games/rogue-lite-hellscape-siege/src/hellscape-harvester-covenant-readiness-entry.js`
- `tests/hellscape-harvester-covenant-readiness-kits-smoke.mjs`
- `tests/hellscape-harvester-covenant-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-1200-hellscape-harvester-covenant-upgrade.md`

Updated:

- `games/rogue-lite-hellscape-siege/index.html`
- `experiments/_shared/nexus-gallery-data.js`

## Tests added

- `node tests/hellscape-harvester-covenant-readiness-kits-smoke.mjs`
- `node tests/hellscape-harvester-covenant-cdn-state-input-smoke.mjs`

Each smoke has 10 intake cases.

## Validation results

Local scratch validation before connector writes:

```txt
node --check games/rogue-lite-hellscape-siege/src/hellscape-harvester-covenant-readiness-domain-kit.js
node --check games/rogue-lite-hellscape-siege/src/hellscape-harvester-covenant-readiness-entry.js
node --check tests/hellscape-harvester-covenant-readiness-kits-smoke.mjs
node --check tests/hellscape-harvester-covenant-cdn-state-input-smoke.mjs
node tests/hellscape-harvester-covenant-readiness-kits-smoke.mjs
node tests/hellscape-harvester-covenant-cdn-state-input-smoke.mjs
```

Observed output:

```txt
Hellscape harvester covenant readiness kits smoke passed 10 intake cases.
Hellscape harvester covenant CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a full clone because the shell runtime could not resolve `github.com`; this is the same connector-only limitation seen in surrounding runs. The new CDN/state smoke is Playwright-style in that it validates route markup, CDN import string, GameHost accessors, renderer handoff composition, reusable-kit isolation, and 10 state/input transitions without owning browser execution.

## NexusRealtime import audit

- New changed entry imports NexusEngine main CDN: `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- New changed entry does not import `NexusRealtime@`.
- New reusable kit file has no DOM, browser input, Three.js, WebGL, audio, asset loading, network, storage, or frame-loop ownership.
- Existing route shell still imports the shared page loader whose filename contains `nexus-realtime-page-loader.js`; this run did not rename shared compatibility infrastructure because it is outside the changed kit and could affect many routes.

## Cleanup pass

- Kept all reusable logic in a route-local domain kit with deterministic inputs and descriptor outputs.
- Entry integration owns DOM overlay and GameHost patching only.
- Renderer receives descriptors through `hellscapeHarvesterCovenant` without domain logic moving into canvas renderer.
- Gallery metadata now describes the new objective loop.
- No destructive changes made.

## Non-game handling

Not applicable. `games/rogue-lite-hellscape-siege/` is a small experience-driven web game with a playable loop, so no delete/refactor/rename was needed.

## Next safe ledge

Render the new harvester covenant descriptors directly in the canvas renderer as subtle bloodroot plot rings, sickle route dashes, tithe bowl glows, audit seal icons, and wagon extraction lanes, while keeping all placement decisions descriptor-only.

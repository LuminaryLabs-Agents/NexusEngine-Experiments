# 2026-07-09 08:14 ET — Zombie Orchard antiserum wellhouse upgrade

## Chosen experiment

`experiments/zombie-orchard/`

## Why it was chosen

The latest observed upgrade chain was `experiments/tiny-diffusion-lab/` dataset expedition, so this run intentionally chose a different route. Zombie Orchard still had one of the lowest variability profiles in the gallery: a compact round-survival loop with pressure, pickups, weapons, orchard content, and debug-friendly state. It already had survival and recovery overlays, but lacked a medical cure-distribution layer that could convert scavenging into a clearer late-night rescue objective.

## Last upgraded experiment

Latest commit scan before this work showed the last route work was the Tiny Diffusion dataset expedition pass:

- `Add Tiny Diffusion dataset expedition kits`
- `Wire Tiny Diffusion dataset expedition overlay`
- `Load Tiny Diffusion dataset expedition pass`
- `Add Tiny Diffusion dataset expedition kit smoke`
- `Add Tiny Diffusion dataset expedition CDN smoke`

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
| `games/stonewake-depths/` | Flooded cavern rescue game. | 8-15 min | Carrying, valves, rune gates, pressure locks, rescue | no changed old import | yes overlays |
| `experiments/next-ledge/` | Grapple-climb validation with rescue descriptors. | 3-6 min | Grapple, ledges, swing pressure, rescue supply | no changed old import | yes overlays |
| `experiments/sora-the-infinite/` | Aerial traversal redirect into Open Above. | 3-8 min sandbox | Flight, visual domains, mood readability | no changed old import | yes overlays |
| `experiments/zombie-orchard/` | Survival slice for rounds, pressure, pickups, weapons, orchard content. | 5-10 min | WASD, sprint, dodge, collect, gear, horde pressure, recovery overlays | shared page loader uses old name | yes, new changed entry |
| `games/rogue-lite-hellscape-siege/` | Base-siege action route with ash caravan and ember well purification. | 8-15 min | Harvest, build, portals, waves, purification descriptors | no changed old import | yes overlays |
| `experiments/onnx-agent-lab/signal-calibration.html` | Signal-calibration workshop route. | 4-8 min lab | Model handshake, fallback rails, tools, prompt intent, memory trace | no changed old import | yes |

## Domain ASCII tree

```txt
zombie-orchard-antiserum-wellhouse-readiness-domain
├─ serum-brewing-domain
│  ├─ herbal-mortar-domain
│  │  └─ zombie-orchard-herbal-antiserum-mortar-kit
│  └─ moonwater-still-domain
│     └─ zombie-orchard-moonwater-still-kit
├─ infection-triage-domain
│  ├─ bite-triage-cot-domain
│  │  └─ zombie-orchard-bite-triage-cot-kit
│  └─ blood-sample-flag-domain
│     └─ zombie-orchard-blood-sample-flag-kit
├─ cure-handoff-domain
│  ├─ raven-courier-vial-domain
│  │  └─ zombie-orchard-raven-courier-vial-kit
│  └─ dawn-antiserum-ledger-domain
│     └─ zombie-orchard-dawn-antiserum-ledger-kit
└─ renderer-handoff
   └─ zombie-orchard-antiserum-wellhouse-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `createZombieOrchardHerbalAntiserumMortarKit`
- `createZombieOrchardMoonwaterStillKit`
- `createZombieOrchardBiteTriageCotKit`
- `createZombieOrchardBloodSampleFlagKit`
- `createZombieOrchardRavenCourierVialKit`
- `createZombieOrchardDawnAntiserumLedgerKit`
- `createZombieOrchardAntiserumWellhouseRendererHandoffKit`
- `createZombieOrchardAntiserumWellhouseReadinessDomainKit`

## Files changed

- Added `experiments/zombie-orchard/src/antiserum-wellhouse-readiness-kits.js`
- Added `experiments/zombie-orchard/src/antiserum-wellhouse-readiness-entry.js`
- Updated `experiments/zombie-orchard/index.html`
- Added `tests/zombie-orchard-antiserum-wellhouse-readiness-kits-smoke.mjs`
- Added `tests/zombie-orchard-antiserum-wellhouse-cdn-state-input-smoke.mjs`
- Added this changelog entry

## Tests added

- `tests/zombie-orchard-antiserum-wellhouse-readiness-kits-smoke.mjs`
  - 10 intake cases.
  - Checks all six descriptor families.
  - Checks descriptor-only renderer handoff.
  - Checks bounded readiness.
  - Checks mission-state enum.
  - Checks JSON serializability.

- `tests/zombie-orchard-antiserum-wellhouse-cdn-state-input-smoke.mjs`
  - 10 simulated state/input cases.
  - Checks route marker and script load.
  - Checks NexusEngine main CDN import.
  - Checks changed entry does not import old `NexusRealtime@`.
  - Checks `GameHost` readiness and renderer-handoff accessors.
  - Checks reusable kit source excludes renderer/browser/input/frame-loop ownership.

## Validation results

Scratch validation passed before GitHub writes:

```txt
node --check experiments/zombie-orchard/src/antiserum-wellhouse-readiness-kits.js
node --check experiments/zombie-orchard/src/antiserum-wellhouse-readiness-entry.js
node --check tests/zombie-orchard-antiserum-wellhouse-readiness-kits-smoke.mjs
node --check tests/zombie-orchard-antiserum-wellhouse-cdn-state-input-smoke.mjs
node tests/zombie-orchard-antiserum-wellhouse-readiness-kits-smoke.mjs
node tests/zombie-orchard-antiserum-wellhouse-cdn-state-input-smoke.mjs
```

Observed output:

```txt
Zombie Orchard antiserum wellhouse readiness kits smoke passed 10 intake cases.
Zombie Orchard antiserum wellhouse CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a cloned workspace in this connector-driven run. The required Playwright-style state/input validation coverage is represented by the local `.mjs` CDN/state/input smoke.

## NexusRealtime import audit

- New changed entry imports NexusEngine main CDN exactly:
  - `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`
- New changed entry does not import old `NexusRealtime@`.
- Existing Zombie Orchard route still calls the shared `attachNexusRealtimePageLoader` utility, which is legacy naming in the shared loader path rather than a newly added old CDN import.
- Reusable kit file contains no `document`, `window`, `globalThis`, `requestAnimationFrame`, canvas, WebGL, audio, asset loading, or browser-input ownership.

## Cleanup pass

- Kept reusable domain logic in a kit file separate from the DOM overlay entry.
- Entry composes with existing `GameHost.getRendererHandoff()` rather than replacing it.
- No route deletion or destructive refactor.
- No useful functionality removed.
- New overlay is additive and cache-busted.

## Non-game handling

Zombie Orchard is a small experience-driven web game, so no delete/refactor/rename pass was needed.

## Next safe ledge

Make the antiserum wellhouse affect the in-game orchard loop directly by letting collected herbs, apples, and vial pickups increment real `GameHost` state, then let the renderer visualize mortar/still/cot descriptors inside the main orchard world instead of only in the overlay panel.

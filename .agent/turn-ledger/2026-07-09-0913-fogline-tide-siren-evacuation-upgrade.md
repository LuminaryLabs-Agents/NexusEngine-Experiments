# 2026-07-09 09:13 ET — Fogline Relay tide siren evacuation upgrade

## Chosen experiment

`experiments/fogline-relay/`

## Why it was chosen

The previous completed upgrade targeted `experiments/next-ledge/`, so this run intentionally selected a different route. Fogline Relay remains one of the narrower experience-driven routes: a first-person fog survey loop with scan pressure, hazard state, and several descriptor overlays. It was selected because the base interaction has low variability and benefits from a clearer coastal evacuation objective that adds visual interest without moving reusable kit logic into renderer, DOM, input, audio, asset, WebGL, Three.js, physics, or frame-loop ownership.

## Last upgraded experiment

`experiments/next-ledge/` — summit weather station readiness.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import? | NexusEngine main CDN? |
|---|---|---:|---|---|---|
| `experiments/peer-scene-transition/` | Multi-page story-scene orchestration with inventory, visited-scene state, and transition ledgers. | 3-8 min | Explore scene exits, collect tokens, unlock routes. | No direct `NexusRealtime@` hit in connector audit. | Yes in upgraded readiness overlays where changed. |
| `experiments/vr-platformer-board/skyline-medevac.html` | Board-scale platformer rescue route with skyline medevac descriptors. | 2-5 min | Jump, avoid hazards, collect oxygen, stage medevac pod. | No direct `NexusRealtime@` hit in connector audit. | Yes in skyline medevac entry. |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain tessellation/LOD demo. | 3-6 min | WASD flight, origin snapping, procedural terrain traversal. | No direct `NexusRealtime@` hit in connector audit. | Yes in skybridge shelter overlay where changed. |
| `experiments/high-fidelity-meadow/` | Procedural meadow with terrain, wind, vegetation, ecology, creek, and soil domains. | 3-7 min | Explore scene/read descriptors; visual ecology composition. | No direct `NexusRealtime@` hit in connector audit. | Yes in soil mycelium overlay. |
| `experiments/tiny-diffusion-lab/` | Browser diffusion proof for tiny CPU denoising and checkpoint flow. | 5-15 min | Prepare, train, sample, checkpoint, inspect readiness. | No direct `NexusRealtime@` hit in connector audit. | Yes through diffusion/readiness entries. |
| `experiments/living-agent-lab/` | Market-agent lab with fallback/ONNX guard and civic festival mediation. | 3-8 min | Choose actions from visible state, increase trust, prepare festival. | No direct `NexusRealtime@` hit in connector audit. | Yes in civic festival entry. |
| `experiments/fogline-relay/` | First-person fog survey loop with survivor, storm, radio, blackout, ambulance, clinic, lighthouse, and tide evacuation descriptors. | 3-6 min | Move, scan, manage timed pressure, route evacuation cues, stage boat launch readiness. | Shared loader still uses old compatibility name; changed entry has no `NexusRealtime@`. | Yes: new tide siren entry imports NexusEngine main CDN. |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer island slice with scan, build, storm, cargo, and field-hospital triage. | 4-10 min | Scan targets, harvest resources, build signal mast, brace storm, route casualty care. | No direct `NexusRealtime@` import in changed entry. | Yes in field hospital triage entry. |
| `apps/the-cavalry-of-rome/` | Painterly Roman campaign map and aqueduct sabotage overlay. | 4-8 min | Pan/hover/dive map, inspect armies, read civic-water descriptors. | No direct `NexusRealtime@` hit in connector audit. | Yes in aqueduct sabotage pass. |
| `games/signal-bastion/` | Tower-defense route with supply convoy readiness. | 5-12 min | Place towers, read range/field hospital/supply overlays. | No direct `NexusRealtime@` hit in connector audit. | Yes in supply convoy entry. |
| `games/stonewake-depths/` | Flooded cavern rescue route with pump and silt archive overlays. | 5-10 min | Carry block, pressure plate, valve, gate, manage water/pressure. | No direct `NexusRealtime@` hit in connector audit. | Yes in pressure pump/archive entries. |
| `experiments/next-ledge/` | Grapple-climb validation with traversal, cargo, rescue, glacier supply, avalanche beacon, and summit weather station descriptors. | 3-8 min | Grapple, climb ledges, manage stamina/swing pressure, repair station. | Existing shared loader uses old compatibility naming; latest changed entry has no `NexusRealtime@`. | Yes in summit weather station entry. |
| `experiments/sora-the-infinite/` | Open aerial traversal route with visual flight domains. | 3-8 min | Flight/readiness descriptors, cloud/thermal/speed readability. | No direct `NexusRealtime@` hit in connector audit. | Yes in star orchard rescue entry. |
| `experiments/zombie-orchard/` | Survival slice for rounds, horde pressure, pickups, weapons, orchard content, and antiserum/seed descriptors. | 5-12 min | Survive waves, scavenge, pressure/horde handling. | No direct `NexusRealtime@` hit in connector audit. | Yes in upgraded readiness entries. |
| `games/rogue-lite-hellscape-siege/` | Base-siege action route with purification/refuge descriptors. | 6-15 min | Harvest, build, defend waves, prepare refuge/purification. | No direct `NexusRealtime@` hit in connector audit. | Yes in upgraded readiness passes. |
| `experiments/onnx-agent-lab/signal-calibration.html` | ONNX workshop route for signal calibration and tool understanding. | 3-8 min | Inspect tools, calibrate prompt intent, build memory trace, open scene gate. | No direct `NexusRealtime@` import in changed signal-calibration entry. | Yes in signal-calibration entry. |

## Domain ASCII tree

```txt
fogline-tide-siren-evacuation-readiness-domain
├─ flood-warning-domain
│  ├─ tide-gauge-domain
│  │  └─ fogline-tide-gauge-stake-kit
│  └─ siren-bell-domain
│     └─ fogline-siren-bell-tower-kit
├─ evacuation-routing-domain
│  └─ boat-route-domain
│     ├─ rope-lane-domain
│     │  └─ fogline-boat-rope-lane-kit
│     └─ family-muster-domain
│        └─ fogline-family-muster-flag-kit
├─ departure-supply-domain
│  ├─ fuel-drum-cache-domain
│  │  └─ fogline-fuel-drum-cache-kit
│  └─ dawn-evacuation-ledger-domain
│     └─ fogline-dawn-evacuation-ledger-kit
└─ renderer-handoff
   └─ fogline-tide-siren-evacuation-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added in `experiments/fogline-relay/src/tide-siren-evacuation-readiness-kits.js`:

- `fogline-tide-gauge-stake-kit`
- `fogline-siren-bell-tower-kit`
- `fogline-boat-rope-lane-kit`
- `fogline-family-muster-flag-kit`
- `fogline-fuel-drum-cache-kit`
- `fogline-dawn-evacuation-ledger-kit`
- `fogline-tide-siren-evacuation-renderer-handoff-kit`
- `fogline-tide-siren-evacuation-readiness-domain-kit`

## Files changed

- `experiments/fogline-relay/src/tide-siren-evacuation-readiness-kits.js`
- `experiments/fogline-relay/src/tide-siren-evacuation-readiness-entry.js`
- `experiments/fogline-relay/index.html`
- `tests/fogline-tide-siren-evacuation-readiness-kits-smoke.mjs`
- `tests/fogline-tide-siren-evacuation-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-0913-fogline-tide-siren-evacuation-upgrade.md`

## Tests added

- `tests/fogline-tide-siren-evacuation-readiness-kits-smoke.mjs`
  - 10 intake cases.
  - Validates all six atomic descriptor families, bounded readiness, bounded tide pressure, phase enums, descriptor counts, JSON safety, and renderer-neutral ownership flags.
- `tests/fogline-tide-siren-evacuation-cdn-state-input-smoke.mjs`
  - 10 simulated state/input cases.
  - Validates route markers, NexusEngine main CDN usage, old `NexusRealtime@` absence in the changed entry, `GameHost` accessors, renderer handoff composition, reusable-kit isolation, and readiness improvement.

## Validation results

Scratch validation run locally before connector writes:

```txt
node --check experiments/fogline-relay/src/tide-siren-evacuation-readiness-kits.js
node --check experiments/fogline-relay/src/tide-siren-evacuation-readiness-entry.js
node --check tests/fogline-tide-siren-evacuation-readiness-kits-smoke.mjs
node --check tests/fogline-tide-siren-evacuation-cdn-state-input-smoke.mjs
node tests/fogline-tide-siren-evacuation-readiness-kits-smoke.mjs
node tests/fogline-tide-siren-evacuation-cdn-state-input-smoke.mjs
```

Observed output:

```txt
Fogline tide siren evacuation readiness kits smoke passed 10 intake cases.
Fogline tide siren evacuation CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a full cloned workspace in this connector-driven run. The added Node smoke scripts passed against the generated files before GitHub writes.

## NexusRealtime import audit

- Root `.agent/README.md` remains historical memory and still uses old NexusRealtime naming.
- `experiments/fogline-relay/index.html` still imports `attachNexusRealtimePageLoader` by name from the shared loader. This was not changed because it is shared historical compatibility infrastructure.
- Repository code search found no direct `NexusRealtime@` CDN hit during this run.
- The changed entry imports only:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

- The changed entry does not contain `NexusRealtime@`.
- The reusable kit file contains no DOM, browser input, Three.js, WebGL runtime, audio, asset loading, network, storage, or frame-loop ownership.

## Cleanup pass

- Kept all existing Fogline overlays intact.
- Composed the tide siren descriptors into `GameHost.getRendererHandoff()` instead of replacing survivor, storm, radio, blackout, ambulance, clinic, or lighthouse descriptors.
- Kept renderer-owned overlay work in the route entry and kept reusable domain logic in the kit file.
- Added the new route script after the lighthouse battery pass so the new coastal evacuation overlay composes with prior handoffs.
- No destructive changes.
- No files deleted.
- No branches created.
- No other repo modified.

## Non-game handling

Fogline Relay is a small experience-driven web game, so no refactor/delete/rename was needed. The lesson from the previous low-variability state is that survey routes need concrete civic objectives and visible descriptor families to feel less like a debug scan corridor.

## Next safe ledge

Consolidate Fogline Relay's many canvas overlays into one route-local descriptor consumer. The next pass should preserve all headless readiness domains but reduce overlay stacking and duplicated coordinate projection helpers.

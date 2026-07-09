# 2026-07-09 08:44 ET — Signal Isles field hospital triage upgrade

## Chosen experiment

`experiments/nexus-frontier-signal-isles/`

## Why it was chosen

The previous completed upgrade targeted `games/stonewake-depths/`, so this run intentionally chose a different route. Signal Isles was selected because the existing field-engineer loop already had many systems exposed, but its human consequence layer was still low-variability: scan, build, cargo, storm, and evacuation descriptors existed, yet there was no separate care/triage objective that made the island feel occupied or procedurally reactive.

## Last upgraded experiment

`games/stonewake-depths/` — pressure lock pump readiness.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import? | NexusEngine main CDN? |
|---|---|---:|---|---|---|
| `experiments/peer-scene-transition/` | Multi-page story-scene orchestration with inventory, visited-scene state, and transition ledgers. | 3-8 min | Explore scene exits, collect tokens, unlock scene routes. | No direct `NexusRealtime@` hit in connector audit. | Yes in upgraded readiness overlays where changed. |
| `experiments/vr-platformer-board/skyline-medevac.html` | Board-scale platformer rescue route with skyline medevac descriptors. | 2-5 min | Jump, avoid hazards, collect oxygen, stage medevac pod. | No direct `NexusRealtime@` hit in connector audit. | Yes in skyline medevac entry. |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain tessellation/LOD demo. | 3-6 min | WASD flight, origin snapping, procedural terrain traversal. | No direct `NexusRealtime@` hit in connector audit. | Yes in skybridge shelter overlay where changed. |
| `experiments/high-fidelity-meadow/` | Procedural meadow scene with vegetation, ecology, creek, and soil domains. | 3-7 min | Explore scene/read descriptors; visual ecology composition. | No direct `NexusRealtime@` hit in connector audit. | Yes in soil mycelium overlay. |
| `experiments/tiny-diffusion-lab/` | Browser diffusion proof for tiny CPU denoising and checkpoint flow. | 5-15 min | Prepare, train, sample, checkpoint, inspect readiness. | No direct `NexusRealtime@` hit in connector audit. | Yes through diffusion and readiness entries. |
| `experiments/living-agent-lab/` | Market-agent lab with fallback/ONNX guard and civic festival mediation. | 3-8 min | Choose actions from visible state, increase trust, prepare festival. | No direct `NexusRealtime@` hit in connector audit. | Yes in civic festival entry. |
| `experiments/fogline-relay/` | First-person fog survey loop. | 3-6 min | Move, scan, manage timed pressure and hazard state. | No direct `NexusRealtime@` hit in connector audit. | Yes in lighthouse battery entry. |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer island slice with objective, scan, build, cargo, storm surge, and field hospital triage readiness. | 4-10 min | Scan targets, harvest resources, build signal mast, brace storm, route casualty care. | No direct `NexusRealtime@` import in changed entry. | Yes: new `field-hospital-triage-readiness-entry.js` imports NexusEngine main CDN. |
| `apps/the-cavalry-of-rome/` | Painterly Roman campaign map and aqueduct sabotage overlay. | 4-8 min | Pan/hover/dive map, inspect armies, read civic-water descriptors. | No direct `NexusRealtime@` hit in connector audit. | Yes in aqueduct sabotage pass. |
| `games/signal-bastion/` | Tower-defense route with supply convoy readiness. | 5-12 min | Place towers, read range/field hospital/supply overlays. | No direct `NexusRealtime@` hit in connector audit. | Yes in supply convoy entry. |
| `games/stonewake-depths/` | Flooded cavern rescue route with pump and silt archive overlays. | 5-10 min | Carry block, pressure plate, valve, gate, manage water/pressure. | No direct `NexusRealtime@` hit in connector audit. | Yes in pressure pump entry. |
| `experiments/next-ledge/` | Grapple-climb validation with glacier supply and avalanche beacon descriptors. | 3-8 min | Grapple, climb ledges, manage rescue/supply descriptors. | Uses shared page loader name only; changed passes use NexusEngine CDN. | Yes in upgraded readiness passes. |
| `experiments/sora-the-infinite/` | Open aerial traversal redirect/route with visual flight domains. | 3-8 min | Flight/readiness descriptors, cloud/thermal/speed readability. | No direct `NexusRealtime@` hit in connector audit. | Yes in star orchard rescue entry. |
| `experiments/zombie-orchard/` | Survival slice for rounds, horde pressure, pickups, weapons, and orchard content. | 5-12 min | Survive waves, scavenge, pressure/horde handling. | No direct `NexusRealtime@` hit in connector audit. | Yes in seed bank quarantine entry. |
| `games/rogue-lite-hellscape-siege/` | Base-siege action route with purification/refuge descriptors. | 6-15 min | Harvest, build, defend waves, prepare refuge/purification. | No direct `NexusRealtime@` hit in connector audit. | Yes in upgraded readiness passes. |
| `experiments/onnx-agent-lab/signal-calibration.html` | ONNX workshop route for signal calibration and tool understanding. | 3-8 min | Inspect tools, calibrate prompt intent, build memory trace, open scene gate. | No direct `NexusRealtime@` import in changed signal-calibration entry. | Yes in signal-calibration entry. |

## Domain ASCII tree

```txt
signal-isles-field-hospital-triage-readiness-domain
├─ casualty-discovery-domain
│  ├─ triage-flag-domain
│  │  └─ signal-isles-triage-flag-kit
│  └─ medicine-cache-domain
│     └─ signal-isles-medicine-cache-kit
├─ care-route-domain
│  ├─ stretcher-trail-domain
│  │  └─ trail-thread-domain
│  │     └─ signal-isles-stretcher-trail-thread-kit
│  └─ lantern-care-post-domain
│     └─ signal-isles-lantern-care-post-kit
├─ evacuation-handoff-domain
│  ├─ skiff-mooring-domain
│  │  └─ signal-isles-evac-skiff-mooring-kit
│  └─ dawn-care-ledger-domain
│     └─ signal-isles-dawn-care-ledger-kit
└─ renderer-handoff
   └─ signal-isles-field-hospital-triage-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added in `experiments/_kits/nexus-frontier-signal-isles/signal-isles-field-hospital-triage-readiness-domain-kits.js`:

- `signal-isles-triage-flag-kit`
- `signal-isles-medicine-cache-kit`
- `signal-isles-stretcher-trail-thread-kit`
- `signal-isles-lantern-care-post-kit`
- `signal-isles-evac-skiff-mooring-kit`
- `signal-isles-dawn-care-ledger-kit`
- `signal-isles-field-hospital-triage-renderer-handoff-kit`
- `signal-isles-field-hospital-triage-readiness-domain-kit`

## Files changed

- `experiments/_kits/nexus-frontier-signal-isles/signal-isles-field-hospital-triage-readiness-domain-kits.js`
- `experiments/nexus-frontier-signal-isles/src/field-hospital-triage-readiness-entry.js`
- `experiments/nexus-frontier-signal-isles/index.html`
- `experiments/_shared/nexus-gallery-data.js`
- `tests/signal-isles-field-hospital-triage-readiness-kits-smoke.mjs`
- `tests/signal-isles-field-hospital-triage-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-0844-signal-isles-field-hospital-triage-upgrade.md`

## Tests added

- `tests/signal-isles-field-hospital-triage-readiness-kits-smoke.mjs`
  - 10 intake cases.
  - Validates bounded readiness, bounded casualty pressure, mission-state enum, descriptor counts, JSON safety, and renderer-neutral ownership exclusions.
- `tests/signal-isles-field-hospital-triage-cdn-state-input-smoke.mjs`
  - 10 simulated state/input steps.
  - Validates route marker, NexusEngine main CDN string, old `NexusRealtime@` absence in the changed entry, `GameHost` accessors, renderer handoff composition, reusable-kit isolation, and readiness improvement.

## Validation results

Scratch validation run in the local execution workspace before connector writes:

```txt
node --check experiments/_kits/nexus-frontier-signal-isles/signal-isles-field-hospital-triage-readiness-domain-kits.js
node --check experiments/nexus-frontier-signal-isles/src/field-hospital-triage-readiness-entry.js
node --check tests/signal-isles-field-hospital-triage-readiness-kits-smoke.mjs
node --check tests/signal-isles-field-hospital-triage-cdn-state-input-smoke.mjs
node tests/signal-isles-field-hospital-triage-readiness-kits-smoke.mjs
node tests/signal-isles-field-hospital-triage-cdn-state-input-smoke.mjs
```

Observed output:

```txt
Signal Isles field hospital triage readiness kits smoke passed 10 intake cases.
Signal Isles field hospital triage CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run because the shell environment could not resolve `github.com`. This was treated as a connector-only limitation, not a kit failure.

## NexusRealtime import audit

- Root `.agent/README.md` still references the old NexusRealtime naming because it is durable historical memory; not changed in this run.
- The changed entry imports only:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

- The changed entry does not contain `NexusRealtime@`.
- The reusable kit file contains no DOM, browser input, Three.js, WebGL, audio, asset loading, storage, or frame-loop ownership.

## Cleanup pass

- Kept the storm-surge relay pass intact.
- Composed the new field hospital handoff into `GameHost.getRendererHandoff()` instead of replacing older descriptors.
- Kept reusable logic in `_kits/` and route/overlay logic in the route entry.
- No destructive changes.
- No files deleted.
- No branches created.
- No other repo modified.

## Next safe ledge

Make Signal Isles visually consume more of the composed descriptor families inside its main 3D renderer rather than stacking many canvas overlays. The next pass should consolidate overlay rendering into one descriptor consumer so the route stays readable as more readiness domains accumulate.

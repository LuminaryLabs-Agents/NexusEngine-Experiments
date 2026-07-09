# 2026-07-09 10:01 ET — Zombie Orchard radio fence rescue upgrade

## Chosen experiment

`experiments/zombie-orchard/`

## Why it was chosen

The latest completed Tiny Diffusion latent museum pass targeted `experiments/tiny-diffusion-lab/`, so this run selected a different route. Zombie Orchard is still one of the clearest small experience-driven web games in the repo, but much of its added depth was clustered around medical/crafting overlays. This upgrade adds a different survival objective layer: secure a dusk perimeter, power rescue radios, lace thorn barricades, arm flare tripwires, and move families to a stretcher handoff.

## Last upgraded experiment

Latest completed upgrade observed before this run: `experiments/tiny-diffusion-lab/` — latent museum curator readiness.

Latest completed turn-ledger searched during selection also showed the previous Fogline tide siren upgrade and confirmed this run should avoid repeating that route as well.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import? | NexusEngine main CDN? |
|---|---|---:|---|---|---|
| `experiments/peer-scene-transition/` | Multi-page story-scene orchestration with inventory, visited-scene state, and transition ledgers. | 3-8 min | Explore scene exits, collect tokens, unlock routes. | No direct `NexusRealtime@` hit in connector audit. | Yes in upgraded readiness overlays where changed. |
| `experiments/vr-platformer-board/skyline-medevac.html` | Board-scale platformer rescue route with skyline medevac descriptors. | 2-5 min | Jump, avoid hazards, collect oxygen, stage medevac pod. | No direct `NexusRealtime@` hit in connector audit. | Yes in skyline medevac entry. |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain tessellation/LOD demo. | 3-6 min | WASD flight, origin snapping, procedural terrain traversal. | No direct `NexusRealtime@` hit in connector audit. | Yes in skybridge shelter overlay where changed. |
| `experiments/high-fidelity-meadow/` | Procedural meadow with terrain, wind, vegetation, ecology, creek, and soil domains. | 3-7 min | Explore scene/read descriptors; visual ecology composition. | No direct `NexusRealtime@` hit in connector audit. | Yes in soil mycelium overlay. |
| `experiments/tiny-diffusion-lab/` | Browser diffusion proof with training, sampling, checkpointing, dataset expedition, sample clinic, and latent museum curator descriptors. | 5-15 min | Prepare dataset, train epochs, generate sample, checkpoint, curate output. | Changed entries use NexusEngine naming; no direct `NexusRealtime@` hit in connector audit. | Yes in main lab and overlay entries. |
| `experiments/living-agent-lab/` | Market-agent lab with fallback/ONNX guard and civic festival mediation. | 3-8 min | Choose actions from visible state, increase trust, prepare festival. | No direct `NexusRealtime@` hit in connector audit. | Yes in civic festival entry. |
| `experiments/fogline-relay/` | First-person fog survey loop with survivor, storm, radio, blackout, ambulance, clinic, lighthouse, and tide evacuation descriptors. | 3-6 min | Move, scan, manage timed pressure, route evacuation cues. | Shared loader still uses old compatibility name; changed entries avoid `NexusRealtime@`. | Yes in upgraded entries. |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer island slice with scan, build, storm, cargo, field hospital, and solar-desalination work. | 4-10 min | Scan targets, harvest resources, build signal mast, route care/freshwater cues. | No direct `NexusRealtime@` import in changed entries observed. | Yes in upgraded readiness entries. |
| `apps/the-cavalry-of-rome/` | Painterly Roman campaign map and aqueduct sabotage overlay. | 4-8 min | Pan/hover/dive map, inspect armies, read civic-water descriptors. | No direct `NexusRealtime@` hit in connector audit. | Yes in aqueduct sabotage pass. |
| `games/signal-bastion/` | Tower-defense route with supply convoy readiness. | 5-12 min | Place towers, read range, hospital, and supply overlays. | No direct `NexusRealtime@` hit in connector audit. | Yes in supply convoy entry. |
| `games/stonewake-depths/` | Flooded cavern rescue route with pump and silt archive overlays. | 5-10 min | Carry block, pressure plate, valve, gate, manage water/pressure. | No direct `NexusRealtime@` hit in connector audit. | Yes in pressure pump/archive entries. |
| `experiments/next-ledge/` | Grapple-climb validation with traversal, cargo, rescue, glacier supply, avalanche beacon, and summit weather descriptors. | 3-8 min | Grapple, climb ledges, manage stamina/swing pressure, repair station. | Shared loader uses old compatibility naming; latest changed entries avoid `NexusRealtime@`. | Yes in summit weather station entry. |
| `experiments/sora-the-infinite/` | Open aerial traversal route with visual flight domains. | 3-8 min | Flight/readiness descriptors, cloud/thermal/speed readability. | No direct `NexusRealtime@` hit in connector audit. | Yes in star orchard rescue entry. |
| `experiments/zombie-orchard/` | Survival slice for rounds, horde pressure, pickups, weapons, orchard content, antiserum, seed, and radio fence rescue descriptors. | 5-12 min | Survive waves, scavenge, manage horde pressure, secure perimeter rescue cues. | Route still uses shared loader with old compatibility function name; changed entry has no `NexusRealtime@`. | Yes: new radio fence entry imports NexusEngine main CDN. |
| `games/rogue-lite-hellscape-siege/` | Base-siege action route with purification/refuge descriptors. | 6-15 min | Harvest, build, defend waves, prepare refuge/purification. | No direct `NexusRealtime@` hit in connector audit. | Yes in upgraded readiness passes. |
| `experiments/onnx-agent-lab/signal-calibration.html` | ONNX workshop route for signal calibration and tool understanding. | 3-8 min | Inspect tools, calibrate prompt intent, build memory trace, open scene gate. | No direct `NexusRealtime@` import in changed signal-calibration entry. | Yes in signal-calibration entry. |

## Domain ASCII tree

```txt
zombie-orchard-radio-fence-rescue-readiness-domain
├─ perimeter-watch-domain
│  ├─ watchtower-mast-domain
│  │  └─ zombie-orchard-watchtower-mast-kit
│  └─ radio-beacon-domain
│     └─ zombie-orchard-radio-beacon-kit
├─ fence-defense-domain
│  ├─ thorn-barricade-domain
│  │  └─ zombie-orchard-thorn-barricade-lane-kit
│  └─ flare-tripwire-domain
│     └─ signal-flare-domain
│        └─ zombie-orchard-flare-tripwire-kit
├─ survivor-extraction-domain
│  ├─ stretcher-handoff-domain
│  │  └─ zombie-orchard-survivor-stretcher-handoff-kit
│  └─ dusk-perimeter-ledger-domain
│     └─ zombie-orchard-dusk-perimeter-ledger-kit
└─ renderer-handoff
   └─ zombie-orchard-radio-fence-rescue-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added in `experiments/zombie-orchard/src/radio-fence-rescue-readiness-kits.js`:

- `zombie-orchard-watchtower-mast-kit`
- `zombie-orchard-radio-beacon-kit`
- `zombie-orchard-thorn-barricade-lane-kit`
- `zombie-orchard-flare-tripwire-kit`
- `zombie-orchard-survivor-stretcher-handoff-kit`
- `zombie-orchard-dusk-perimeter-ledger-kit`
- `zombie-orchard-radio-fence-rescue-renderer-handoff-kit`
- `zombie-orchard-radio-fence-rescue-readiness-domain-kit`

## Files changed

- `experiments/zombie-orchard/src/radio-fence-rescue-readiness-kits.js`
- `experiments/zombie-orchard/src/radio-fence-rescue-readiness-entry.js`
- `experiments/zombie-orchard/index.html`
- `experiments/_shared/nexus-gallery-data.js`
- `tests/zombie-orchard-radio-fence-rescue-readiness-kits-smoke.mjs`
- `tests/zombie-orchard-radio-fence-rescue-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-1001-zombie-orchard-radio-fence-rescue-upgrade.md`

## Tests added

- `tests/zombie-orchard-radio-fence-rescue-readiness-kits-smoke.mjs`
  - 10 intake cases.
  - Validates all six atomic descriptor families, bounded readiness, mission-state enum, descriptor counts, JSON safety, and descriptor-only handoff policy.
- `tests/zombie-orchard-radio-fence-rescue-cdn-state-input-smoke.mjs`
  - 10 simulated state/input cases.
  - Validates route markers, NexusEngine main CDN usage, old `NexusRealtime@` absence in the changed entry, `GameHost` accessor exposure, renderer handoff composition, reusable-kit isolation, and readiness improvement.

## Validation results

Scratch validation run locally before connector writes:

```txt
node --check experiments/zombie-orchard/src/radio-fence-rescue-readiness-kits.js
node --check experiments/zombie-orchard/src/radio-fence-rescue-readiness-entry.js
node --check tests/zombie-orchard-radio-fence-rescue-readiness-kits-smoke.mjs
node --check tests/zombie-orchard-radio-fence-rescue-cdn-state-input-smoke.mjs
node tests/zombie-orchard-radio-fence-rescue-readiness-kits-smoke.mjs
node tests/zombie-orchard-radio-fence-rescue-cdn-state-input-smoke.mjs
```

Observed output:

```txt
Zombie Orchard radio fence rescue readiness kits smoke passed 10 intake cases.
Zombie Orchard radio fence rescue CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a full cloned workspace in this connector-driven run. The new Node smoke scripts passed against the generated files before GitHub writes.

## NexusRealtime import audit

- Root `.agent/README.md` remains historical memory and still uses old NexusRealtime naming.
- Repository code search for `NexusRealtime@` returned no direct CDN hit during this run.
- `experiments/zombie-orchard/index.html` still imports `attachNexusRealtimePageLoader` by name from shared compatibility infrastructure. It was not renamed in this pass because the request focused on changed experiment overlay migration and the shared loader is not the new kit boundary.
- The changed radio fence entry imports only `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- The changed radio fence entry does not contain `NexusRealtime@`.
- The reusable kit file contains no DOM, browser input, Three.js runtime, WebGL runtime, audio runtime, asset loading, network calls, storage writes, physics ownership, or frame-loop ownership.

## Cleanup pass

- Preserved all existing Zombie Orchard survival, horde, cure, safehouse, well, seed bank, and antiserum overlays.
- Composed the radio fence descriptor handoff into `GameHost.getRendererHandoff()` instead of replacing existing handoff data.
- Added the script after the antiserum wellhouse pass so the new rescue overlay stacks after prior state accessors are available.
- Updated the gallery metadata to advertise the new objective layer.
- No destructive changes.
- No files deleted.
- No branches created.
- No other repo modified.

## Non-game handling

Zombie Orchard is a small experience-driven web game, so no delete, refactor, or rename was needed. The lesson from this route is that horde survival becomes clearer when the player has a visible civic/rescue perimeter objective, not just wave pressure and scavenging.

## Next safe ledge

Unify Zombie Orchard's many readiness panels into one route-local descriptor dashboard. Keep the headless domains separate, but consume all descriptor families through one overlay so the route stops accumulating stacked panels.

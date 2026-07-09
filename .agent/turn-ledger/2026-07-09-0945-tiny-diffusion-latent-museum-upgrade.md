# 2026-07-09 09:45 ET — Tiny Diffusion Lab latent museum curator upgrade

## Chosen experiment

`experiments/tiny-diffusion-lab/`

## Why it was chosen

The latest completed turn-ledger entry found before this run was `experiments/fogline-relay/` for the tide siren evacuation pass. A newer raw commit also showed an in-progress Signal Isles solar desalination kit addition, so this run avoided both Fogline and Signal Isles and selected Tiny Diffusion Lab.

Tiny Diffusion Lab remains one of the least game-like and least variable routes: the user presses prepare/train/generate/checkpoint buttons and watches a small CPU diffusion proof. This pass keeps the lab intact but adds a clearer experience objective: curate generated samples into a small latent museum exhibition with seed vitrines, a noise tunnel, denoise witness frames, provenance plaques, export crates, and an exhibition ledger.

## Last upgraded experiment

Latest completed changelog: `experiments/fogline-relay/` — tide siren evacuation readiness.

Latest raw commit observed before this run: `experiments/nexus-frontier-signal-isles/` solar desalination kits, without a completed ledger at selection time.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import? | NexusEngine main CDN? |
|---|---|---:|---|---|---|
| `experiments/peer-scene-transition/` | Multi-page story-scene orchestration with inventory, visited-scene state, and transition ledgers. | 3-8 min | Explore scene exits, collect tokens, unlock routes. | No direct `NexusRealtime@` hit in connector audit. | Yes in upgraded readiness overlays where changed. |
| `experiments/vr-platformer-board/skyline-medevac.html` | Board-scale platformer rescue route with skyline medevac descriptors. | 2-5 min | Jump, avoid hazards, collect oxygen, stage medevac pod. | No direct `NexusRealtime@` hit in connector audit. | Yes in skyline medevac entry. |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain tessellation/LOD demo. | 3-6 min | WASD flight, origin snapping, procedural terrain traversal. | No direct `NexusRealtime@` hit in connector audit. | Yes in skybridge shelter overlay where changed. |
| `experiments/high-fidelity-meadow/` | Procedural meadow with terrain, wind, vegetation, ecology, creek, and soil domains. | 3-7 min | Explore scene/read descriptors; visual ecology composition. | No direct `NexusRealtime@` hit in connector audit. | Yes in soil mycelium overlay. |
| `experiments/tiny-diffusion-lab/` | Browser diffusion proof with training, sampling, checkpointing, dataset expedition, sample clinic, and latent museum curator descriptors. | 5-15 min | Prepare dataset, train epochs, generate sample, checkpoint, curate output into exhibition readiness. | Changed entry has no `NexusRealtime@`; route uses NexusEngine CDN for main and overlay entries. | Yes: main lab and latent museum entry import NexusEngine main CDN. |
| `experiments/living-agent-lab/` | Market-agent lab with fallback/ONNX guard and civic festival mediation. | 3-8 min | Choose actions from visible state, increase trust, prepare festival. | No direct `NexusRealtime@` hit in connector audit. | Yes in civic festival entry. |
| `experiments/fogline-relay/` | First-person fog survey loop with survivor, storm, radio, blackout, ambulance, clinic, lighthouse, and tide evacuation descriptors. | 3-6 min | Move, scan, manage timed pressure, route evacuation cues. | Shared loader still uses old compatibility name; changed entry has no `NexusRealtime@`. | Yes in tide siren entry. |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer island slice with scan, build, storm, cargo, field-hospital triage, and observed solar-desalination kit work. | 4-10 min | Scan targets, harvest resources, build signal mast, brace storm, route care/freshwater cues. | No direct `NexusRealtime@` import in changed entries observed. | Yes in upgraded readiness entries. |
| `apps/the-cavalry-of-rome/` | Painterly Roman campaign map and aqueduct sabotage overlay. | 4-8 min | Pan/hover/dive map, inspect armies, read civic-water descriptors. | No direct `NexusRealtime@` hit in connector audit. | Yes in aqueduct sabotage pass. |
| `games/signal-bastion/` | Tower-defense route with supply convoy readiness. | 5-12 min | Place towers, read range/field hospital/supply overlays. | No direct `NexusRealtime@` hit in connector audit. | Yes in supply convoy entry. |
| `games/stonewake-depths/` | Flooded cavern rescue route with pump and silt archive overlays. | 5-10 min | Carry block, pressure plate, valve, gate, manage water/pressure. | No direct `NexusRealtime@` hit in connector audit. | Yes in pressure pump/archive entries. |
| `experiments/next-ledge/` | Grapple-climb validation with traversal, cargo, rescue, glacier supply, avalanche beacon, and summit weather descriptors. | 3-8 min | Grapple, climb ledges, manage stamina/swing pressure, repair station. | Existing shared loader uses old compatibility naming; latest changed entry has no `NexusRealtime@`. | Yes in summit weather station entry. |
| `experiments/sora-the-infinite/` | Open aerial traversal route with visual flight domains. | 3-8 min | Flight/readiness descriptors, cloud/thermal/speed readability. | No direct `NexusRealtime@` hit in connector audit. | Yes in star orchard rescue entry. |
| `experiments/zombie-orchard/` | Survival slice for rounds, horde pressure, pickups, weapons, orchard content, and antiserum/seed descriptors. | 5-12 min | Survive waves, scavenge, pressure/horde handling. | No direct `NexusRealtime@` hit in connector audit. | Yes in upgraded readiness entries. |
| `games/rogue-lite-hellscape-siege/` | Base-siege action route with purification/refuge descriptors. | 6-15 min | Harvest, build, defend waves, prepare refuge/purification. | No direct `NexusRealtime@` hit in connector audit. | Yes in upgraded readiness passes. |
| `experiments/onnx-agent-lab/signal-calibration.html` | ONNX workshop route for signal calibration and tool understanding. | 3-8 min | Inspect tools, calibrate prompt intent, build memory trace, open scene gate. | No direct `NexusRealtime@` import in changed signal-calibration entry. | Yes in signal-calibration entry. |

## Domain ASCII tree

```txt
tiny-diffusion-latent-museum-curator-readiness-domain
├─ collection-intake-domain
│  ├─ seed-vitrine-domain
│  │  └─ tiny-diffusion-seed-vitrine-kit
│  └─ noise-tunnel-domain
│     └─ tiny-diffusion-noise-tunnel-map-kit
├─ artifact-interpretation-domain
│  └─ denoise-witness-domain
│     ├─ frame-witness-domain
│     │  └─ tiny-diffusion-denoise-witness-frame-kit
│     └─ provenance-plaque-domain
│        └─ tiny-diffusion-provenance-plaque-kit
├─ exhibition-handoff-domain
│  ├─ export-crate-domain
│  │  └─ tiny-diffusion-export-crate-kit
│  └─ exhibition-ledger-domain
│     └─ tiny-diffusion-exhibition-ledger-kit
└─ renderer-handoff
   └─ tiny-diffusion-latent-museum-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added in `experiments/tiny-diffusion-lab/kits/tiny-diffusion-latent-museum-curator-readiness-domain-kit.js`:

- `tiny-diffusion-seed-vitrine-kit`
- `tiny-diffusion-noise-tunnel-map-kit`
- `tiny-diffusion-denoise-witness-frame-kit`
- `tiny-diffusion-provenance-plaque-kit`
- `tiny-diffusion-export-crate-kit`
- `tiny-diffusion-exhibition-ledger-kit`
- `tiny-diffusion-latent-museum-renderer-handoff-kit`
- `tiny-diffusion-latent-museum-curator-readiness-domain-kit`

## Files changed

- `experiments/tiny-diffusion-lab/kits/tiny-diffusion-latent-museum-curator-readiness-domain-kit.js`
- `experiments/tiny-diffusion-lab/app/latent-museum-curator-readiness-entry.js`
- `experiments/tiny-diffusion-lab/index.html`
- `experiments/_shared/nexus-gallery-data.js`
- `tests/tiny-diffusion-latent-museum-curator-readiness-kits-smoke.mjs`
- `tests/tiny-diffusion-latent-museum-curator-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-0945-tiny-diffusion-latent-museum-upgrade.md`

## Tests added

- `tests/tiny-diffusion-latent-museum-curator-readiness-kits-smoke.mjs`
  - 10 intake cases.
  - Validates all six atomic descriptor families, bounded readiness, status enum, descriptor counts, JSON safety, renderer handoff policy, and readiness improvement.
- `tests/tiny-diffusion-latent-museum-curator-cdn-state-input-smoke.mjs`
  - 10 simulated state/input cases.
  - Validates route markers, NexusEngine main CDN usage, old `NexusRealtime@` absence in the changed entry, TinyDiffusionLab accessor exposure, renderer handoff composition, reusable-kit isolation, and final readiness.

## Validation results

Scratch validation run locally before connector writes:

```txt
node --check experiments/tiny-diffusion-lab/kits/tiny-diffusion-latent-museum-curator-readiness-domain-kit.js
node --check experiments/tiny-diffusion-lab/app/latent-museum-curator-readiness-entry.js
node --check tests/tiny-diffusion-latent-museum-curator-readiness-kits-smoke.mjs
node --check tests/tiny-diffusion-latent-museum-curator-cdn-state-input-smoke.mjs
node tests/tiny-diffusion-latent-museum-curator-readiness-kits-smoke.mjs
node tests/tiny-diffusion-latent-museum-curator-cdn-state-input-smoke.mjs
```

Observed output:

```txt
Tiny diffusion latent museum curator readiness kits smoke passed 10 intake cases.
Tiny diffusion latent museum curator CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a full cloned workspace in this connector-driven run. The new Node smoke scripts passed against the generated files before GitHub writes.

## NexusRealtime import audit

- Root `.agent/README.md` remains historical memory and still uses old NexusRealtime naming.
- `experiments/tiny-diffusion-lab/main.js` already imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- The new `latent-museum-curator-readiness-entry.js` imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- The new entry does not contain `NexusRealtime@`.
- The new reusable kit file contains no DOM, browser input, Three.js runtime, WebGL runtime, audio runtime, asset loading, network calls, storage writes, or frame-loop ownership.

## Cleanup pass

- Preserved the original Tiny Diffusion Lab training/sampling/checkpoint flow.
- Preserved training mission, dataset expedition, and sample clinic readiness overlays.
- Added the new latent museum panel as a composed descriptor consumer, not a replacement.
- Patched `TinyDiffusionLab.getRendererHandoff()` by composition so previous handoffs remain available.
- Kept renderer-owned DOM work in the route entry and reusable domain logic in the kit file.
- Updated the gallery card to advertise the new objective.
- No destructive changes.
- No files deleted.
- No branches created.
- No other repo modified.

## Non-game handling

Tiny Diffusion Lab is not primarily a small web game; it is a browser-side ML/domain proof. It was not deleted or renamed because it proves useful NexusEngine diffusion runtime integration. The lesson is that ML/lab routes need a visible objective wrapper so the user has a reason to train, sample, save, and inspect results beyond watching debug metrics.

## Next safe ledge

Fold the training mission, dataset expedition, sample clinic, and latent museum panels into one local descriptor dashboard so Tiny Diffusion Lab has fewer separate overlay loops while preserving each atomic readiness domain for headless testing.

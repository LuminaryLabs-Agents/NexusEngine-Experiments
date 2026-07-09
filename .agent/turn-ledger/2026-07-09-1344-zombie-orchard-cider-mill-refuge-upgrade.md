# 2026-07-09 13:44 ET — Zombie Orchard cider mill refuge upgrade

## Chosen experiment

`experiments/zombie-orchard/`

## Why it was chosen

The latest visible completed work on `main` targeted `experiments/ThirdPersonFollowThrough/` with the afterimage rescue pass, so this run intentionally chose a different route. Zombie Orchard already had wave survival, horde pressure, pickup, cure, seed, antiserum, and radio-fence overlays, but its evacuation layer still leaned on abstract perimeter descriptors instead of a concrete refuge loop. The cider mill upgrade adds a place-based objective with provisions, lantern routes, barricades, wagons, and family handoff pressure.

## Last upgraded experiment

`experiments/ThirdPersonFollowThrough/` — afterimage rescue pass, based on the latest visible commits: `Load third person afterimage rescue pass`, `Wire third person afterimage rescue entry`, `Add third person afterimage rescue CDN smoke`, `Add third person afterimage rescue kit smoke`, `Add third person afterimage rescue entry`, and `Add third person afterimage rescue kits`.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import? | NexusEngine main CDN? |
|---|---|---:|---|---|---|
| `experiments/peer-scene-transition/` | Multi-page story-scene orchestration with inventory, visited-scene state, transitions, and bell archive descriptors. | 3-8 min | Explore scenes, collect tokens, unlock exits, preserve scene memory. | No direct `NexusRealtime@` hit in connector audit. | Yes in upgraded readiness overlays where changed. |
| `experiments/vr-platformer-board/skyline-medevac.html` | Board-scale platformer rescue route with medevac descriptors. | 2-5 min | Jump, avoid hazards, collect oxygen, stage medevac pod. | No direct `NexusRealtime@` hit in connector audit. | Yes in skyline medevac entry. |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain tessellation and LOD proof. | 3-6 min | WASD flight, origin snapping, terrain traversal, aquifer cartography. | No direct `NexusRealtime@` hit in connector audit. | Yes in aquifer cartography entry. |
| `experiments/high-fidelity-meadow/` | Procedural meadow scene with vegetation, creek, ecology, and soil descriptors. | 3-7 min | Explore/read visual ecology descriptors. | No direct `NexusRealtime@` hit in connector audit. | Yes in soil mycelium overlay. |
| `experiments/tiny-diffusion-lab/` | Browser diffusion proof for tiny CPU denoising, checkpoints, and curation. | 5-15 min | Prepare, train, sample, checkpoint, inspect readiness. | No direct `NexusRealtime@` hit in connector audit. | Yes through diffusion/readiness entries. |
| `experiments/living-agent-lab/` | Market-agent lab with fallback/ONNX guard and civic festival mediation. | 3-8 min | Choose actions, increase trust, prepare festival descriptors. | No direct `NexusRealtime@` hit in connector audit. | Yes in civic festival entry. |
| `experiments/fogline-relay/` | First-person fog survey and timed signal rescue loop. | 3-6 min | Move, scan targets, manage timed pressure and hazard state. | No direct `NexusRealtime@` hit in connector audit. | Yes in upgraded readiness entries. |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer island slice with scan, harvest, build, cargo, triage, and desalination. | 4-10 min | Scan targets, harvest resources, build signal mast, brace storm, route care/water. | No direct `NexusRealtime@` hit in connector audit. | Yes in triage/desalination entries. |
| `apps/the-cavalry-of-rome/` | Painterly Roman campaign map and tactical descriptor proof. | 4-8 min | Pan/hover/dive map, inspect armies, read logistics/civic overlays. | No direct `NexusRealtime@` hit in connector audit. | Yes in upgraded campaign passes. |
| `games/signal-bastion/` | 2.5D tower defense with field hospital and supply convoy overlays. | 5-12 min | Place towers, read ranges, manage convoy readiness. | No direct `NexusRealtime@` hit in connector audit. | Yes in supply convoy entry. |
| `games/stonewake-depths/` | Flooded cavern rescue route with pump, clinic, archive, and glowworm descriptors. | 5-10 min | Carry block, use valves/pressure plates, route rescue. | No direct `NexusRealtime@` hit in connector audit. | Yes in pressure/glowworm entries. |
| `experiments/next-ledge/` | Grapple-climb validation with glacier supply, avalanche, weather, and drone relay descriptors. | 3-8 min | Grapple, climb, swing, read rescue descriptors. | Shared loader uses NexusRealtime naming only; changed passes use NexusEngine CDN. | Yes in upgraded readiness passes. |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller route with spring-arm camera, debug rays, traversal, medevac, and afterimage rescue overlays. | 3-8 min | Move, jump, debug rays, inspect controller/readiness descriptors. | No direct `NexusRealtime@` hit in latest changed entries. | Yes in afterimage/traversal entries. |
| `experiments/sora-the-infinite/` | Open aerial traversal gateway into The Open Above with beacon/rescue descriptors. | 3-8 min | Flight/readiness descriptors, cloud/thermal/speed readability. | No direct `NexusRealtime@` hit in connector audit. | Yes in star orchard/radio entries. |
| `experiments/zombie-orchard/` | Survival slice with rounds, horde pressure, pickups, weapons, rescue overlays, and the new cider mill refuge pass. | 5-12 min | Survive waves, scavenge, craft/restore/quarantine, build radio fence, stage cider mill refuge wagons. | Shared page loader still uses NexusRealtime naming, but no old `NexusRealtime@` CDN import in the changed entry. | Yes: `cider-mill-refuge-readiness-entry.js` imports NexusEngine main CDN. |
| `games/rogue-lite-hellscape-siege/` | Base-siege action route with harvesting, building, waves, refuge, purification, and covenant descriptors. | 6-15 min | Harvest, build, defend waves, prepare refuge/purification. | No direct `NexusRealtime@` hit in connector audit. | Yes in upgraded readiness passes. |
| `experiments/onnx-agent-lab/signal-calibration.html` | ONNX workshop route for model handshakes, fallback rails, prompt intent, and scene gates. | 3-8 min | Inspect tools, calibrate prompt intent, build memory trace, open scene gate. | No direct `NexusRealtime@` import in changed entry. | Yes in signal-calibration entry. |

## Domain ASCII tree

```txt
zombie-orchard-cider-mill-refuge-readiness-domain
├─ refuge-provision-domain
│  ├─ cider-press-domain
│  │  └─ zombie-orchard-cider-press-kit
│  └─ root-cellar-cache-domain
│     └─ zombie-orchard-root-cellar-cache-kit
├─ path-clearing-domain
│  ├─ mill-lantern-route-domain
│  │  └─ lantern-waypoint-domain
│  │     └─ zombie-orchard-mill-lantern-route-kit
│  └─ sawbuck-barricade-domain
│     └─ zombie-orchard-sawbuck-barricade-kit
├─ family-handoff-domain
│  ├─ refugee-wagon-domain
│  │  └─ zombie-orchard-refugee-wagon-kit
│  └─ dawn-refuge-ledger-domain
│     └─ zombie-orchard-dawn-refuge-ledger-kit
└─ renderer-handoff
   └─ zombie-orchard-cider-mill-refuge-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added in `experiments/zombie-orchard/src/cider-mill-refuge-readiness-kits.js`:

- `zombie-orchard-cider-press-kit`
- `zombie-orchard-root-cellar-cache-kit`
- `zombie-orchard-mill-lantern-route-kit`
- `zombie-orchard-sawbuck-barricade-kit`
- `zombie-orchard-refugee-wagon-kit`
- `zombie-orchard-dawn-refuge-ledger-kit`
- `zombie-orchard-cider-mill-refuge-renderer-handoff-kit`
- `zombie-orchard-cider-mill-refuge-readiness-domain-kit`

## Files changed

- `experiments/zombie-orchard/src/cider-mill-refuge-readiness-kits.js`
- `experiments/zombie-orchard/src/cider-mill-refuge-readiness-entry.js`
- `experiments/zombie-orchard/index.html`
- `experiments/_shared/nexus-gallery-data.js`
- `tests/zombie-orchard-cider-mill-refuge-readiness-kits-smoke.mjs`
- `tests/zombie-orchard-cider-mill-refuge-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-1344-zombie-orchard-cider-mill-refuge-upgrade.md`

## Tests added

- `tests/zombie-orchard-cider-mill-refuge-readiness-kits-smoke.mjs`
  - 10 intake cases: cold start, apple-heavy, cellar-stocked, lantern route, sawbuck braced, wagons loading, family progress, horde surge, near complete, complete.
  - Validates bounded readiness, bounded pressure, mission-state enum, descriptor counts, JSON safety, descriptor-only renderer hints, and readiness improvement.
- `tests/zombie-orchard-cider-mill-refuge-cdn-state-input-smoke.mjs`
  - 10 simulated state/input cases.
  - Validates route marker, entry script load, NexusEngine main CDN import, absence of old `NexusRealtime@` CDN import in the changed entry, `GameHost` accessors, renderer handoff composition, and reusable-kit ownership exclusions.

## Validation results

Scratch validation passed before GitHub writes:

```txt
node --check experiments/zombie-orchard/src/cider-mill-refuge-readiness-kits.js
node --check experiments/zombie-orchard/src/cider-mill-refuge-readiness-entry.js
node --check tests/zombie-orchard-cider-mill-refuge-readiness-kits-smoke.mjs
node --check tests/zombie-orchard-cider-mill-refuge-cdn-state-input-smoke.mjs
node tests/zombie-orchard-cider-mill-refuge-readiness-kits-smoke.mjs
node tests/zombie-orchard-cider-mill-refuge-cdn-state-input-smoke.mjs
```

Observed output:

```txt
Zombie Orchard cider mill refuge readiness kits smoke passed 10 intake cases.
Zombie Orchard cider mill refuge CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

During validation the first kit-smoke run caught a low-descriptor cold-start case. The kit was fixed by raising the minimum root-cellar, sawbuck, and wagon descriptor counts so every intake case produces enough renderer-neutral visual variety.

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a full cloned workspace because the shell runtime could not resolve `github.com`; this is the same connector-only limitation seen in earlier runs. The changed smoke scripts were executed locally against the generated files before connector writes.

## NexusRealtime import audit

- New changed entry `experiments/zombie-orchard/src/cider-mill-refuge-readiness-entry.js` imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- New changed entry has no `NexusRealtime@` CDN import.
- The route still has the shared loader import `../_shared/nexus-realtime-page-loader.js`. That is a shared compatibility loader name, not an old external runtime CDN import. It was left intact to avoid breaking page boot behavior outside this pass.
- The reusable kit file contains no renderer, DOM, browser-input, Three.js, WebGL, audio, asset-loading, physics, storage, or frame-loop ownership.

## Cleanup pass

- Kept all cider mill logic in domain kits and entry-level presentation glue.
- Did not move reusable logic into canvas, Three.js, browser input, DOM ownership, storage, or the frame loop.
- Added deterministic seeded descriptor positions.
- Ensured all new descriptors are JSON-safe and use `rendererHints.consumes = 'descriptor-only'`.
- Updated route marker, footer copy, and gallery metadata so the pass is discoverable.

## Non-game handling

Zombie Orchard is a small experience-driven web game/survival slice, so no delete, refactor, or rename was needed.

## Next safe ledge

Turn the cider mill refuge descriptors into playable in-world pickups/objectives: pressing apples into cider, carrying crates to the root cellar, lighting lantern waypoints, bracing sawbucks, and loading wagons before the horde pressure crosses the mill-under-siege threshold.

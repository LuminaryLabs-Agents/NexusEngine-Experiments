# 2026-07-09 21:00 UTC — ONNX Agent Lab red-team evacuation upgrade

## Chosen experiment

`experiments/onnx-agent-lab/red-team-evacuation.html`.

## Why it was chosen

`experiments/onnx-agent-lab/` is useful, but it is still one of the least game-like routes in the catalog. The existing incident router improved it as an operations desk, but the broader lab can still feel like an inspectable workshop rather than a small experience. This run adds a clearer objective loop: run canary prompt strips, lock sandbox gates, tag evidence chains, rehearse rollback branches, rotate operator handoffs, load model metadata, and close a red-team drill ledger.

## Last upgraded experiment

The latest observed completed changelog at repository head before this run was `experiments/fogline-relay/`, specifically the search dog rescue upgrade.

This run avoids `experiments/fogline-relay/` and changes `experiments/onnx-agent-lab/` instead.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import? | NexusEngine main CDN? |
|---|---|---:|---|---|---|
| `experiments/peer-scene-transition/` | Story-scene orchestration proof with scene-host actions, route tokens, archive/ferry/bell/moon-gate overlays. | 3-7 min | Click actions, collect tokens, unlock transitions, inspect readiness panels. | Not observed in latest changed files. | Yes in upgraded entries. |
| `experiments/vr-platformer-board/storm-harbor.html` | Board-scale platformer evacuation route with storm harbor readiness. | 2-4 min | A/D movement, jump, collect, avoid hazards, inspect rescue readiness. | Not observed in latest changed files. | Yes in upgraded entries. |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain tessellation with LOD, aquifer, glacier, and mirage/glacier descriptors. | 2-6 min | WASD flight, vertical flight, arrow look, terrain inspection, descriptor handoff inspection. | No in recent upgraded entries. | Yes in upgraded entries. |
| `experiments/high-fidelity-meadow/` | Procedural meadow with terrain, wind, vegetation, ecology, creek, and soil mycelium overlays. | 3-8 min | Explore meadow ecology and inspect descriptor overlays. | Not observed in latest changed files. | Yes in upgraded entries. |
| `experiments/tiny-diffusion-lab/` | Browser diffusion lab with CPU training, sampling, checkpoints, curation, repair, and curriculum descriptors. | 5-15 min | Train, sample, checkpoint, inspect readiness panels. | Not observed in latest changed files. | Yes in upgraded entries. |
| `experiments/living-agent-lab/` | Market-agent route with fallback/ONNX decisioning and civic festival descriptors. | 3-8 min | Agent action selection, trust state, permit/vendor/dispute/steward readiness. | No in changed civic entry. | Yes in upgraded entry. |
| `experiments/fogline-relay/` | First-person fog survey with scan targets, hazards, observatory/courier/search dog overlays. | 5-8 min | Move/look, scan targets, manage fog pressure, cast scent grid, prepare rescue handoff. | No in changed search dog files. | Yes in upgraded entries. |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer island slice with scan, harvest, build, storm, hospital, desalination, and mangrove bridge descriptors. | 6-10 min | Explore, scan, harvest, build, manage storm/water/bridge readiness. | No in changed bridge/desalination entries. | Yes in upgraded entries. |
| `apps/the-cavalry-of-rome/` | Painterly Roman strategy map with region inspection and morale descriptors. | 4-10 min | Pan/select regions, inspect campaign descriptors and tactical readiness. | No in changed standard-bearer pass. | Yes in upgraded pass. |
| `games/signal-bastion/` | 2.5D defense game with tower cards, field hospital, and supply convoy descriptors. | 5-12 min | Place towers, inspect cards, survive waves, manage supply readiness. | No in changed supply entry. | Yes in upgraded entry. |
| `games/stonewake-depths/` | Flooded cavern rescue game with valves, rune gates, survivor pings, and cartography descriptors. | 6-12 min | Carry blocks, operate valves, solve gates, rescue survivors. | No in changed cartography entry. | Yes in upgraded entry. |
| `experiments/next-ledge/` | Grapple climb route with ledge/swing validation and drone rescue descriptors. | 3-7 min | Move, grapple/action input, ledge climb, inspect rescue feedback. | No in changed entries. | Yes in upgraded entries. |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller validation with traversal and afterimage descriptors. | 3-6 min | Move, camera follow, debug overlay, traverse course, inspect descriptors. | No in changed entries. | Yes in upgraded entries. |
| `experiments/sora-the-infinite/` | Open aerial gateway with rescue, lighthouse, rookery, orchard, radio, and cloud clinic descriptors. | 4-8 min | Fly/steer, inspect sky route, staged rescue overlays. | No in changed entries. | Yes in upgraded entries. |
| `experiments/zombie-orchard/` | Survival slice with horde pressure, pickups, weapons, cure/radio/refuge overlays. | 5-12 min | Move, sprint, dodge, collect, fight horde, manage readiness overlays. | No in latest changed entries. | Yes in upgraded entries. |
| `games/rogue-lite-hellscape-siege/` | Base-siege action route with portals, inventory, harvesting, building, waves, and quarantine descriptors. | 8-15 min | Harvest, build, fight waves, maintain base, inspect descriptors. | No in changed entries. | Yes in upgraded entries. |
| `experiments/onnx-agent-lab/red-team-evacuation.html` | Red-team evacuation workshop route for model failure containment with canary prompts, sandbox gates, evidence chains, rollback routes, operator cards, and drill ledgers. | 3-8 min | Click drill actions, improve readiness, reduce containment pressure, inspect descriptor-only handoff. | No in changed red-team entry. | Yes; new entry imports NexusEngine main CDN. |

## Domain ASCII tree

```txt
onnx-workshop-red-team-evacuation-readiness-domain
├─ adversarial-signal-domain
│  ├─ canary-prompt-domain
│  │  └─ onnx-red-team-canary-prompt-strip-kit
│  └─ sandbox-gate-domain
│     └─ onnx-red-team-sandbox-gate-lock-kit
├─ evidence-recovery-domain
│  ├─ evidence-chain-domain
│  │  └─ onnx-red-team-evidence-chain-tag-kit
│  └─ rollback-route-domain
│     └─ rollback-branch-domain
│        └─ onnx-red-team-rollback-branch-route-kit
├─ operator-evacuation-domain
│  ├─ operator-card-domain
│  │  └─ onnx-red-team-operator-evacuation-card-kit
│  └─ dawn-drill-ledger-domain
│     └─ onnx-red-team-dawn-drill-ledger-kit
└─ renderer-handoff
   └─ onnx-red-team-evacuation-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added `experiments/_kits/onnx-agent-lab/onnx-workshop-red-team-evacuation-kits.js`.

Atomic kits:

- `onnx-red-team-canary-prompt-strip-kit`
- `onnx-red-team-sandbox-gate-lock-kit`
- `onnx-red-team-evidence-chain-tag-kit`
- `onnx-red-team-rollback-branch-route-kit`
- `onnx-red-team-operator-evacuation-card-kit`
- `onnx-red-team-dawn-drill-ledger-kit`
- `onnx-red-team-evacuation-renderer-handoff-kit`

Composite kit:

- `onnx-workshop-red-team-evacuation-readiness-domain-kit`

Ownership boundary:

- Reusable kit logic owns deterministic descriptor production only.
- Reusable kit logic does not own renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, ONNX runtime loading, model inference, storage, navigation, network, or frame-loop ownership.

## Files changed

Added:

- `experiments/_kits/onnx-agent-lab/onnx-workshop-red-team-evacuation-kits.js`
- `experiments/onnx-agent-lab/red-team-evacuation.html`
- `experiments/onnx-agent-lab/red-team-evacuation-entry.js`
- `tests/onnx-workshop-red-team-evacuation-readiness-kits-smoke.mjs`
- `tests/onnx-workshop-red-team-evacuation-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-2100-onnx-red-team-evacuation-upgrade.md`

Updated:

- `experiments/_shared/nexus-gallery-data.js`

## Tests added

- `tests/onnx-workshop-red-team-evacuation-readiness-kits-smoke.mjs`
  - 10 intake cases.
  - Checks domain identity, renderer-handoff pass ID, descriptor-only policy, all six descriptor families, readiness bounds, pressure bounds, mission-state enum, JSON safety, ownership exclusions, and cold-to-ready score improvement.
- `tests/onnx-workshop-red-team-evacuation-cdn-state-input-smoke.mjs`
  - 10 simulated state/input cases.
  - Checks route marker, cache-busted entry loading, NexusEngine main CDN import, old `NexusRealtime@` absence, `GameHost` accessors, reusable-kit isolation, descriptor totals, readiness/pressure bounds, and 10-step readiness improvement.

## Validation results

Scratch validation run from a local file mirror before connector writes:

```txt
node --check experiments/_kits/onnx-agent-lab/onnx-workshop-red-team-evacuation-kits.js
node --check experiments/onnx-agent-lab/red-team-evacuation-entry.js
node --check experiments/_shared/nexus-gallery-data.js
node --check tests/onnx-workshop-red-team-evacuation-readiness-kits-smoke.mjs
node --check tests/onnx-workshop-red-team-evacuation-cdn-state-input-smoke.mjs
node tests/onnx-workshop-red-team-evacuation-readiness-kits-smoke.mjs
node tests/onnx-workshop-red-team-evacuation-cdn-state-input-smoke.mjs
```

Observed outputs:

```txt
ONNX workshop red-team evacuation readiness kits smoke passed 10 intake cases.
ONNX workshop red-team evacuation CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a full cloned workspace in this connector-driven run. The added CDN/state-input smoke performs Playwright-style source and state validation by reading the route shell and simulating 10 state cases through the new kit.

## NexusRealtime import audit

Changed entry imports NexusEngine main CDN:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

Changed entry does not import old `NexusRealtime@`.

Changed reusable kit source contains no DOM access, no `requestAnimationFrame`, no Three ownership, no WebGL runtime ownership, no audio ownership, no asset loading, no ONNX runtime loading, no model inference, no storage ownership, no navigation ownership, no network ownership, and no browser input ownership.

## Cleanup pass

- Preserved the existing ONNX Agent Lab index and `incident-router.html` route.
- Added the red-team evacuation route as a new experience-driven workshop drill instead of deleting useful incident-router functionality.
- Kept reusable logic in a deterministic kit file and kept DOM/UI work in the browser entry adapter.
- Composed descriptor-only handoff through `GameHost.getRendererHandoff()` instead of replacing any previous handoff.
- Updated gallery metadata so the ONNX Agent Lab card routes to the new, more objective-driven drill.

## Non-game handling

ONNX Agent Lab is primarily a workshop, not a small conventional web game. This run did not delete or rename the existing workshop. It logs the lesson that a workshop proof becomes more useful when the abstract model-operation concept is framed as a short, repeatable drill with state/input feedback and a renderer-neutral descriptor tree.

## Next safe ledge

The next safe improvement is to merge the incident-router and red-team evacuation descriptors into one shared ONNX operations domain so the lab can choose between incident triage, fallback routing, and red-team containment without duplicating browser adapter patterns.

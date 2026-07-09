# 2026-07-09 0215 Living Agent market trust restoration upgrade

## Summary

Upgraded `experiments/living-agent-lab/` from a compact ONNX/fallback action-choice proof into a more objective-driven market trust restoration route.

The route now has renderer-neutral domain kits for witness trails, evidence stalls, restitution routing, guard permits, crowd calm, and mediator oath handoff. The browser route still owns DOM, canvas drawing, input, model loading, and the frame loop.

## Chosen experiment

```txt
experiments/living-agent-lab/
```

## Why it was chosen

The latest observed repo work before this run was `games/signal-bastion/` field hospital readiness, so this run avoided Signal Bastion.

`experiments/living-agent-lab/` was selected because it was a small route with low gameplay variability: load a model, mutate apple state, ask the guard to choose an action, and render static market actors.

It was safe to upgrade without deleting or replacing useful ONNX functionality.

## Last upgraded experiment

```txt
games/signal-bastion/
```

Latest observed commits before this pass:

```txt
Add Signal Bastion field hospital readiness kits
Wire Signal Bastion field hospital overlay
Load Signal Bastion field hospital readiness route
Add Signal Bastion field hospital kit smoke
Add Signal Bastion field hospital CDN state smoke
```

## Experiment inventory

| Experiment | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---:|---:|---|---:|---:|
| `peer-scene-transition` | Story scene orchestration across hosted HTML scenes. | 3 to 8 min | Scene exits, puzzle tokens, transition ledger. | Not changed in this pass | Mixed historical route |
| `vr-platformer-board` | Floating XR-style platformer board. | 3 to 6 min | Lane movement, jumping, collectibles, comfort/readability descriptors. | Not changed in this pass | Yes in route |
| `infinite-radial-terrain` | Camera-driven radial terrain tessellation. | 3 to 8 min | WASD flight, LOD, origin snapping, terrain survey. | Not changed in this pass | Yes in recent overlays |
| `high-fidelity-meadow` | Procedural meadow visual route. | 2 to 6 min | Terrain, wind, vegetation, visual descriptors. | Not changed in this pass | Yes in recent overlays |
| `tiny-diffusion-lab` | Browser diffusion training proof. | 2 to 10 min | Prepare, train, sample, checkpoint. | Not changed in this pass | Yes |
| `living-agent-lab` | ONNX/fallback guard choice route. | 2 to 5 min | Model loading, visible state, agent action choice, trust restoration. | No changed-file old runtime import | Yes, added this pass |
| `fogline-relay` | First-person fog survey route. | 5 to 10 min | Scan targets, repair, hazards, fog pressure. | Not changed in this pass | Yes in recent overlays |
| `nexus-frontier-signal-isles` | Field engineer island route. | 5 to 10 min | Scan, harvest, build, storm pressure, cargo, beacon. | Not changed in this pass | Yes in recent overlays |
| `the-cavalry-of-rome` | Painterly Roman tactical map proof. | 3 to 7 min | Pan, hover regions, cinematic dive, army reveal. | Not changed in this pass | Yes in recent overlays |
| `signal-bastion` | Tower defense game. | 5 to 12 min | Tower placement, waves, tactics, hospital readiness. | Not changed in this pass | Yes in recent overlays |
| `stonewake-depths` | Flooded cavern puzzle platformer. | 5 to 12 min | Block carry, pressure plates, valves, water, rescue descriptors. | Not changed in this pass | Yes in recent overlays |
| `next-ledge` | Grapple climb validation. | 3 to 8 min | Grapple, climbing, routes, swing pressure. | Not changed in this pass | Yes in recent overlays |
| `sora-the-infinite` | Open aerial traversal gateway. | 2 to 5 min | Redirect/flight launch, visual domains, rookery migration descriptors. | Not changed in this pass | Yes in recent overlays |
| `zombie-orchard` | Survival orchard slice. | 5 to 10 min | Rounds, pickups, weapons, horde pressure, water restoration. | Not changed in this pass | Yes in recent overlays |
| `rogue-lite-hellscape-siege` | Action RPG base siege route. | 8 to 15 min | Portals, harvest, build, wave defense. | Not changed in this pass | Yes in recent overlays |

## Domain ASCII tree

```txt
living-agent-market-trust-restoration-domain
├─ trust-observation-domain
│  ├─ witness-trail-domain
│  │  └─ living-agent-witness-trail-kit
│  └─ evidence-stall-domain
│     └─ living-agent-evidence-stall-kit
├─ restitution-path-domain
│  ├─ return-route-domain
│  │  └─ living-agent-restitution-route-kit
│  └─ gate-permit-domain
│     └─ living-agent-guard-permit-kit
├─ civic-handoff-domain
│  ├─ crowd-calm-domain
│  │  └─ living-agent-crowd-calm-kit
│  └─ mediator-oath-domain
│     └─ living-agent-mediator-oath-kit
└─ renderer-handoff
   └─ living-agent-market-trust-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
living-agent-witness-trail-kit
living-agent-evidence-stall-kit
living-agent-restitution-route-kit
living-agent-guard-permit-kit
living-agent-crowd-calm-kit
living-agent-mediator-oath-kit
living-agent-market-trust-renderer-handoff-kit
living-agent-market-trust-restoration-domain-kit
```

## Files changed

```txt
experiments/living-agent-lab/index.html
experiments/living-agent-lab/market-trust-restoration-readiness-kits.js
experiments/living-agent-lab/market-trust-restoration-readiness-entry.js
experiments/_shared/nexus-gallery-data.js
tests/agent-labs-static-smoke.mjs
tests/living-agent-market-trust-readiness-kits-smoke.mjs
tests/living-agent-market-trust-cdn-state-input-smoke.mjs
.agent/turn-ledger/2026-07-09-0215-living-agent-market-trust-upgrade.md
```

## Tests added

```txt
tests/living-agent-market-trust-readiness-kits-smoke.mjs
tests/living-agent-market-trust-cdn-state-input-smoke.mjs
```

## Validation results

Scratch validation passed before connector writes:

```txt
node --check experiments/living-agent-lab/market-trust-restoration-readiness-kits.js
node --check experiments/living-agent-lab/market-trust-restoration-readiness-entry.js
node --check tests/living-agent-market-trust-readiness-kits-smoke.mjs
node --check tests/living-agent-market-trust-cdn-state-input-smoke.mjs
node --check tests/agent-labs-static-smoke.mjs
node tests/living-agent-market-trust-readiness-kits-smoke.mjs
node tests/living-agent-market-trust-cdn-state-input-smoke.mjs
node tests/agent-labs-static-smoke.mjs
```

Output:

```txt
Living Agent market trust restoration readiness kits smoke passed 10 intake cases.
Living Agent market trust restoration CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
agent-labs-static-smoke.mjs passed
```

Full repo `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a cloned workspace during this connector pass.

## NexusRealtime import audit

Changed runtime entry imports NexusEngine main CDN:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

Changed files do not import the old `NexusRealtime@main` runtime.

The existing `@huggingface/transformers` CDN import is preserved because it is the route's ONNX model loader, not the Nexus runtime.

## Cleanup pass

- Preserved existing ONNX/fallback action choice behavior.
- Added a trust route line to make the market objective clearer.
- Added a descriptor panel and markers from the new handoff.
- Surfaced Living Agent Lab in gallery data as a first-class card.
- Kept reusable kit source free of renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, and frame-loop ownership.

## Non-game handling

This route is a small experience-driven lab rather than a conventional game. It was not deleted or renamed because it proves a useful ONNX choice model surface. The lesson logged here is that the lab needed a visible objective state, not removal.

## Next safe ledge

Normalize and extend the route so the inline browser host can move into `main.js`, while the market trust kits stay renderer-neutral and testable by themselves.

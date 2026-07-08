# 2026-07-07 Peer Scene Transition Fractal Domain Handoff Pass

## Summary

Upgraded `experiments/peer-scene-transition/` instead of repeating the latest upgraded experiment, `next-ledge`.

The selected experiment was the smallest and least varied canonical route: a peer HTML scene-transition validation route with a short scene-click loop. The patch keeps the route useful, but splits the scene experience into smaller renderer-neutral domain kits that emit route graph, gate preview, puzzle hint, ambient variation, completion constellation, and renderer handoff descriptors.

## Chosen experiment

`experiments/peer-scene-transition/`

## Why it was chosen

- It is different from the latest upgraded route, `next-ledge`.
- It had the least variability and spectacle compared with first-person, aerial, survival, strategic defense, and rogue-lite routes.
- Its gameplay loop is short enough to safely harden with focused scene-domain kits.
- It was already a scene-domain validation route, so fractalizing scene subdomains was directly aligned with its purpose.
- It did not require destructive route deletion, folder rename, or functionality removal.

## Last upgraded experiment

Latest observed changelog / commit ledger: `next-ledge`, from `Log Next Ledge visual fractal domain pass`.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import audit | NexusEngine main CDN usage |
| --- | --- | ---: | --- | --- | --- |
| `experiments/peer-scene-transition/` | Peer HTML scene-domain validation route with camp, crossroads, forest, bridge, shrine, and ending hosts. | ~3-6 min | Scene transitions, action buttons, token gates, route ledger, forest/bridge/shrine puzzle chains. | No old `NexusRealtime` import found in changed files; changed browser host now explicitly rejects `NexusRealtime` text in smoke. | Changed browser host imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`. |
| `experiments/next-ledge/` | Cinematic grapple-climb validation demo using route progress, anchors, rope/tether traversal, and visual-fractal descriptors. | ~2-5 min per sector | Click/tap/Space grapple, A/D swing, R restart, N sector advance, anchor locks, rest anchors, summit anchor. | Prior ledger says deeper base `session.js` still needs a dedicated old-runtime migration. | Prior visual wrapper uses NexusEngine main CDN. |
| `experiments/fogline-relay/` | First-person fog-forest relay route for scan/survey/zone/pressure/hazard domains. | ~4-8 min | Movement/look, hold scan, relay objectives, fog volumes, wraith pressure. | Not changed in this pass. | Not changed in this pass. |
| `experiments/nexus-frontier-signal-isles/` | Broad kit-utilization field-engineer showcase. | ~8-15 min | First-person movement/look, scan, harvest shards, build mast, pressure wave, root gate, cargo delivery, final beacon. | Not changed in this pass. | Not changed in this pass. |
| `experiments/sora-the-infinite/` | Aerial/open traversal lane redirected through Open Above visual-fractal work. | ~5-12 min | Pitch/bank/boost, terrain streaming, flock/scatter descriptors, cloud/thermal/speed visual domains. | Not changed in this pass. | Manifest records Open Above visual-fractal wrapper work. |
| `experiments/zombie-orchard/` | Kit-composed survival orchard experiment. | ~6-12 min | Move/sprint/dodge, pickups, gear use/swap, survival waves, horde pressure. | Not changed in this pass. | Prior state has separate state-input smoke, not touched here. |
| `games/signal-bastion/` | Strategic pressure tower-defense route with the strongest executable route-domain replay proof. | ~15-30 min authored waves; longer endless | 2.5D defense, tower placement/upgrades, waves, bosses, budget, range rings, strategic replay lane. | Not changed in this pass. | Not changed in this pass. |
| `games/rogue-lite-hellscape-siege/` | Unified rogue-lite action-defense-extraction game route. | ~10-25 min | Realm portals, inventory/materials, harvest/pickups, build blueprints, wave/core defense, FX. | Not changed in this pass. | Not changed in this pass. |

## Domain ASCII tree

```txt
peer-scene-transition-domain
├─ scene-state-domain
│  ├─ scene-state-kit
│  ├─ scene-inventory-domain
│  │  ├─ scene-inventory-kit
│  │  └─ scene-completion-constellation-kit
│  └─ scene-pressure-kit
├─ scene-route-domain
│  ├─ scene-manifest-kit
│  ├─ scene-route-graph-kit
│  └─ scene-transition-domain
│     ├─ scene-transition-kit
│     └─ scene-gate-preview-kit
├─ scene-puzzle-domain
│  ├─ scene-action-kit
│  └─ scene-puzzle-hint-kit
├─ scene-visual-domain
│  ├─ scene-visual-descriptor-kit
│  └─ scene-ambient-domain
│     └─ scene-ambient-variation-kit
└─ renderer-handoff
   └─ scene-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

A parent domain still does not own every child domain. The composite `peer-scene-domain-kit` only composes descriptor surfaces. Route graph, gate preview, puzzle hinting, ambient variation, and completion constellation can be tested independently and do not own DOM, browser input, navigation, Three.js, WebGL, audio, asset loading, or frame-loop behavior.

## Kits added or changed

Changed existing kits:

- `scene-state-kit`
- `scene-visual-descriptor-kit`
- `scene-pressure-kit`
- `scene-action-kit`
- `scene-transition-kit`
- `scene-manifest-kit`
- `scene-inventory-kit`

Added / exposed smaller kits:

- `scene-route-graph-kit`
- `scene-gate-preview-kit`
- `scene-puzzle-hint-kit`
- `scene-ambient-variation-kit`
- `scene-completion-constellation-kit`
- `scene-renderer-handoff-kit`
- `peer-scene-domain-kit`

## Files changed

- `experiments/_kits/peer-scene-transition/peer-scene-transition-kits.js`
- `experiments/peer-scene-transition/shared/scene-demo.js`
- `experiments/peer-scene-transition/shared/scene-style.css`
- `tests/peer-scene-transition-fractal-kits-smoke.mjs`
- `tests/peer-scene-transition-playwright-smoke.mjs`
- `scripts/run-checks.mjs`
- `experiments/domain-kit-cutover-manifest.json`
- `.agent/turn-ledger/2026-07-07-peer-scene-transition-fractal-domain-handoff-pass.md`

## Tests added

- `tests/peer-scene-transition-fractal-kits-smoke.mjs`
  - Adds 70 direct intake cases across the 7 new/exposed fractal kits.
  - Existing changed kits remain covered by `tests/peer-scene-transition-kits-smoke.mjs`, which already gives the prior scene kits 10 intake cases each.
- `tests/peer-scene-transition-playwright-smoke.mjs`
  - Pulls the NexusEngine main CDN through the changed browser host.
  - Validates state/input progression through camp → crossroads → forest.
  - Validates renderer-neutral handoff descriptor counts.
  - Validates changed files do not import old `NexusRealtime`.

`tests/peer-scene-transition-playwright-smoke.mjs` and `tests/peer-scene-transition-fractal-kits-smoke.mjs` are wired into deploy checks because the changed experiment’s kit and CDN/state-input contracts should not drift.

## Validation results

Scratch validation run:

```txt
node --check /mnt/data/kit.js
node --check /mnt/data/scene-demo.js
node /mnt/data/tests/peer-scene-transition-kits-smoke.mjs
node /mnt/data/tests/fractal-test.mjs
```

Observed result:

```txt
peer scene transition kit smoke passed: 140 intake cases
peer scene transition fractal kits smoke passed: 70 intake cases
```

The Playwright/CDN smoke was updated but not executed in this scratch environment because the browser run depends on repository-local Playwright availability and live CDN fetch behavior. The test itself performs the required checks when run in the repo workflow.

## NexusRealtime import audit

Changed files:

- `experiments/peer-scene-transition/shared/scene-demo.js`
  - Imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
  - Does not import `NexusRealtime`.
- `tests/peer-scene-transition-playwright-smoke.mjs`
  - Reads `scene-demo.js`.
  - Asserts the NexusEngine CDN URL is present.
  - Asserts old `NexusRealtime` text is absent from the changed browser host.

No other route was migrated in this pass.

## Cleanup pass

- No route deleted.
- No route renamed.
- No useful functionality removed.
- Renderer/browser responsibilities remain in `scene-demo.js` and CSS.
- Reusable kit logic remains renderer-neutral and descriptor-driven.
- The route remains a small experience-driven web game / scene validation route.
- The manifest now records the new peer-scene domain kit split and CDN bridge note.

## Next safe ledge

Run the full repository check in a proper checkout with dependencies installed:

```txt
npm run check:deploy
```

Then migrate any remaining old `NexusRealtime` imports found outside `peer-scene-transition` through narrow route-specific patches, starting with the already-identified `next-ledge` base `session.js` only after fetching and validating the full file.

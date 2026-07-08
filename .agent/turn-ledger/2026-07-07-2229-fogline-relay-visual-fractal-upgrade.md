# Agent Ledger Entry: Fogline Relay Visual Fractal Upgrade

Date: 2026-07-07 22:29 America/New_York
Actor: experiment-upgrade agent
Repo: LuminaryLabs-Agents/NexusEngine-Experiments
Branch: main

## Goal

Make one massive meaningful improvement over one canonical experiment without repeating the latest upgraded route. This pass upgrades `experiments/fogline-relay/` by splitting its fog/survey presentation layer into smaller renderer-neutral descriptor kits, integrating those descriptors into both the Three.js and Canvas renderers, migrating the changed runtime URL to the NexusEngine main CDN, adding smoke coverage, and recording the cutover in repo memory.

## Files Read First

- `README.md`
- `.agent/START_HERE.md`
- `.agent/cycle-state.md`
- `.agent/route-canonicalization.md`
- `.agent/turn-ledger/README.md`
- `.agent/templates/ledger-entry-template.md`
- `experiments/domain-kit-cutover-manifest.json`
- `experiments/fogline-relay/index.html`
- `experiments/fogline-relay/src/main.js`
- `experiments/fogline-relay/src/session.js`
- `experiments/fogline-relay/src/urls.js`
- `experiments/fogline-relay/src/fogline-relay-kit.js`
- `experiments/fogline-relay/src/level.js`
- `experiments/fogline-relay/src/visual-signals.js`
- `experiments/fogline-relay/src/fogline-content-adapter.js`
- `experiments/fogline-relay/src/fogline-environment-preset.js`
- `experiments/fogline-relay/src/renderer.js`
- `experiments/fogline-relay/src/three-renderer.js`
- `experiments/fogline-relay/src/runtime-loop.js`
- `experiments/fogline-relay/src/input-adapter.js`
- `tests/fogline-three-renderer-smoke.mjs`
- `scripts/run-checks.mjs`

## Last Upgraded Experiment Found

The latest commit history before this pass showed `zombie-orchard` as the last upgraded route, ending with `Log Zombie Orchard fractal domain upgrade`. This pass intentionally avoided Zombie Orchard and selected a different route.

## Experiment Inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import state | NexusEngine main CDN state |
| --- | --- | --- | --- | --- | --- |
| `peer-scene-transition` | Scene-transition puzzle route with peer HTML scene hosts and shrine/forest/bridge puzzle gates. | Short multi-scene puzzle slice. | Scene exits, lantern gate, forest/bridge/shrine puzzle steps, route graph descriptors. | Already recorded as NexusEngine CDN browser host. | Current descriptor pass already recorded. |
| `next-ledge` | Cinematic grapple-climb validation demo. | Short ascent slice. | Grapple, swing, sector advance, route progress, visual cliff/rope/cloud descriptors. | Existing route-progress migration state. | Partial `engine.n.genericRouteProgress` consumption plus descriptor pass already recorded. |
| `fogline-relay` | First-person fog-forest relay/survey route. | Short objective relay. | Move/look, hold scan, fog volumes, relay objectives, wraith pressure. | `src/urls.js` still used `LuminaryLabs-Dev/NexusRealtime@0.0.1` before this pass. | Changed to `LuminaryLabs-Dev/NexusEngine@main/src/index.js`. |
| `nexus-frontier-signal-isles` | Broad field-engineer kit-utilization showcase. | Medium composition slice. | Scan, harvest, build mast, survive wave, unlock gate, deliver cargo, activate beacon. | Not changed in this pass. | Broad kit showcase, not the least bounded target here. |
| `sora-the-infinite` | Aerial/open traversal route redirected through Open Above visual layer. | Open traversal slice. | Assisted pitch/bank/boost, terrain patching, flock/scatter, thermal/contrail descriptors. | Not changed in this pass. | Open Above visual layer already records GameHost descriptor state. |
| `zombie-orchard` | Kit-composed survival orchard route. | Survival-wave slice. | Move/sprint/dodge, collect/pickup, gear use/swap, survival waves. | Last upgraded route. | Already migrated in its changed stack. |
| `signal-bastion` | Strategic tower-defense game and only executable route-domain replay lane. | Long strategic pressure game. | Build, upgrade, sell, waves, bosses, maps, presentation descriptors. | Already heavily migrated and not selected. | Remains strongest executable route-domain lane. |
| `rogue-lite-hellscape-siege` | Action-defense-extraction game. | Medium/long rogue-lite run. | Portals, harvesting, pickups, build blueprints, core defense, extraction loop. | Not changed in this pass. | Unified base route already recorded. |

## Chosen Experiment

`experiments/fogline-relay/`

## Why It Was Chosen

`fogline-relay` was still marked `existing` in the domain cutover manifest while adjacent routes already had visual fractal descriptor passes. It also had a clear old runtime URL in `src/urls.js`, and its core loop was mechanically simple: walk, scan relays, avoid wraiths, enter gate. That made it the best target for a bounded but meaningful upgrade that increases procedural visual variety without moving renderer, DOM, browser input, Three.js, Canvas, WebGL, audio, frame-loop, or asset loading into reusable kit logic.

## Domain ASCII Tree

```txt
fogline-relay
├─ fog-survey-domain
│  ├─ route-guidance-domain
│  │  ├─ route-thread-domain
│  │  │  └─ fogline-route-thread-kit
│  │  └─ ground-readability-domain
│  │     └─ fogline-ground-mottle-kit
│  ├─ relay-scan-domain
│  │  ├─ relay-aura-domain
│  │  │  └─ fogline-relay-aura-kit
│  │  └─ canopy-light-domain
│  │     └─ fogline-canopy-shaft-kit
│  ├─ threat-pressure-domain
│  │  └─ fogline-wraith-echo-kit
│  ├─ completion-gate-domain
│  │  └─ fogline-gate-sigil-kit
│  └─ survey-pressure-bridge
│     └─ existing fogline-survey-pressure-bridge-kit
└─ renderer-handoff
   └─ fogline-visual-fractal-domain-kit emits serializable descriptors only
```

## Kits Added or Changed

Added route-local, renderer-neutral descriptor kits:

- `fogline-visual-fractal-domain-kit`
- `fogline-route-thread-kit`
- `fogline-ground-mottle-kit`
- `fogline-relay-aura-kit`
- `fogline-wraith-echo-kit`
- `fogline-gate-sigil-kit`
- `fogline-canopy-shaft-kit`

Changed integration surfaces:

- `session.js` now computes `visualFractal` descriptors and exposes them in both `snapshot.visualFractal` and `snapshot.domain.foglineVisualFractal`.
- `renderer.js` consumes descriptors in the Canvas fallback.
- `three-renderer.js` consumes descriptors through retained `fractalMeshes` instances.

## Change Summary

- Migrated Fogline Relay runtime URL from `LuminaryLabs-Dev/NexusRealtime@0.0.1/src/index.js` to `LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- Added deterministic visual descriptor kits for route threads, ground mottles, relay auras, wraith echoes, gate sigils, and canopy shafts.
- Integrated the descriptor handoff into the session snapshot.
- Rendered the descriptors in both Canvas and Three paths while keeping renderer code responsible only for presentation.
- Updated the manifest to record the Fogline Relay descriptor-domain pass and new feature parity.
- Added 70 smoke intake assertions: 10 cases for each of the 7 new/changed descriptor kits.
- Added a Playwright-style CDN/state-input smoke that boots Fogline Relay, injects runtime input, checks movement, and verifies descriptor handoff state.
- Wired the new Fogline Relay smokes into both full and deploy checks.

## Files Changed

- `experiments/fogline-relay/index.html`
- `experiments/fogline-relay/src/urls.js`
- `experiments/fogline-relay/src/fogline-visual-fractal-kits.js`
- `experiments/fogline-relay/src/session.js`
- `experiments/fogline-relay/src/renderer.js`
- `experiments/fogline-relay/src/three-renderer.js`
- `tests/fogline-three-renderer-smoke.mjs`
- `tests/fogline-relay-visual-fractal-kits-smoke.mjs`
- `tests/fogline-relay-playwright-state-input-smoke.mjs`
- `scripts/run-checks.mjs`
- `experiments/domain-kit-cutover-manifest.json`
- `.agent/turn-ledger/2026-07-07-2229-fogline-relay-visual-fractal-upgrade.md`

## Tests Added / Changed

- Added `tests/fogline-relay-visual-fractal-kits-smoke.mjs`.
  - 7 kit/composite surfaces.
  - 10 intake cases per surface.
  - 70 descriptor intake checks total.
  - Rejects renderer, material, DOM, and audio ownership in descriptors.
- Added `tests/fogline-relay-playwright-state-input-smoke.mjs`.
  - Asserts the NexusEngine main CDN URL.
  - Rejects the old NexusRealtime 0.0.1 runtime URL.
  - Boots the page through a local HTTP server.
  - Injects input into `engine.foglineRelay`.
  - Asserts player movement and descriptor handoff surfaces.
- Changed `tests/fogline-three-renderer-smoke.mjs`.
  - Guards `syncVisualFractal`, `fractalMeshes`, Canvas descriptor draw functions, and Nexus Engine branding.
- Changed `scripts/run-checks.mjs`.
  - Wires Fogline visual-fractal and Playwright CDN state/input smokes into full and deploy checks.

## Validation Results

Static validation completed through GitHub contents refetches after writing:

- Confirmed `experiments/fogline-relay/src/urls.js` now uses the NexusEngine main CDN.
- Confirmed `experiments/fogline-relay/src/fogline-visual-fractal-kits.js` exists with the seven descriptor kit names.
- Confirmed `experiments/fogline-relay/src/session.js` exposes `visualFractal` and `domain.foglineVisualFractal`.
- Confirmed `tests/fogline-relay-visual-fractal-kits-smoke.mjs` encodes 70 intake checks.
- Confirmed `scripts/run-checks.mjs` includes the new Fogline Relay visual and Playwright checks.

Runtime validation was not executed in this connector-only run because no shell/Node runner was available. The changed checks are wired for:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime Import Audit

Changed files:

- `experiments/fogline-relay/src/urls.js` now imports runtime from `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- `tests/fogline-relay-playwright-state-input-smoke.mjs` asserts the NexusEngine main CDN URL and rejects `LuminaryLabs-Dev/NexusRealtime@0.0.1/src/index.js`.

Known compatible legacy naming remains:

- The local module variable name remains `NexusRealtime` to avoid a broad mechanical rename in this patch.
- `NexusRealtime-ProtoKits` package URLs and shared loader filenames remain unchanged because those names are current repo-level compatibility surfaces, not the runtime URL changed in this pass.

## Cleanup Pass

- Kept new kits serializable and renderer-neutral.
- Kept Canvas/Three rendering code in renderer files.
- Kept DOM, browser input, frame-loop, and asset loading outside the new kit file.
- Avoided destructive route deletion.
- Worked only in `LuminaryLabs-Agents/NexusEngine-Experiments` on `main`.
- Did not create a branch.

## Decision Notes

This is a route-local visual descriptor hardening pass, not a claim that Fogline Relay now has executable deterministic route-domain replay. The descriptor kits create pressure for future promotion into ProtoKits, but should stay route-local until another route proves the same fog/survey surfaces are reusable.

## Risks / Watch Items

- The Playwright smoke depends on external CDN availability for the browser boot path.
- The Three renderer now keeps extra transparent descriptor meshes; the count is bounded by descriptor IDs, but runtime validation should confirm no low-end device regression.
- Future work should avoid treating visual descriptor coverage as simulation or replay coverage.

## Next Safe Ledge

Add a deterministic Fogline Relay replay fixture that drives a fixed scan route through all three relays, records wraith pressure, gate progression, objective flow, and the visual fractal descriptor snapshot hash, then wires it as planned fixture coverage without claiming a new executable lane.

## Do Not Do Next

- Do not repeat Zombie Orchard as the next upgraded route.
- Do not claim Fogline Relay as a second executable route-domain replay lane yet.
- Do not move Three.js, Canvas, DOM, browser input, WebGL, audio, frame-loop, or asset loading into reusable kit code.
- Do not create branches.
- Do not delete or fold route folders from this pass.

# 2026-07-08 0531 — Hellscape expedition readability upgrade

## Chosen experiment

`games/rogue-lite-hellscape-siege/`

## Why it was chosen

The latest completed upgrade was `apps/the-cavalry-of-rome/`, so this pass selected a different route. Rogue-Lite Hellscape Siege already had realm pressure, resource routing, portal beacons, build affordances, and wave threat lanes, but the player still lacked a clear expedition layer: where to extract, where it is safe, how to evade enemies, when to craft, where the boss pressure is building, and how to return from realms.

## Last upgraded experiment

`apps/the-cavalry-of-rome/`

Latest known commit before this pass: `6dbf769eccb0c67a55025fbba8a0e7428f0bda6f` — `Log Cavalry battlefield orders upgrade`.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller arena and camera debug route. | 1-3 minute controller sandbox. | WASD movement, jump, camera orbit, debug rig/rays, arena descriptors, locomotion readability descriptors. | No changed-runtime old runtime CDN. | Yes through arena/locomotion wrapper and base app runtime files. |
| `experiments/peer-scene-transition/` | HTML scene route with routes, puzzles, atmosphere, chronicle, and consequence descriptors. | 3-8 minute story/puzzle pass. | Scene transitions, inventory, gate checks, consequences. | No changed-runtime old runtime CDN. | Yes. |
| `apps/the-cavalry-of-rome/` | Campaign map command prototype. | 5-15 minute strategy sandbox. | Map movement, supply, morale, command choices, scout vectors, flank risk, reinforcement callouts, attrition forecasts, turn tempo, objective pressure. | Legacy files remain; active handoff uses NexusEngine CDN. | Yes in active handoff. |
| `experiments/vr-platformer-board/` | Board-scale platformer route. | 2-5 minute traversal run. | Move, jump, reset, collect, avoid hazards, reach exit. | Old ProtoKit CDN removed from changed route. | Yes. |
| `experiments/next-ledge/` | Grapple/swing ledge climb route. | 3-8 minute traversal loop. | Grapple, swing, cargo, sector progress, recovery. | No changed-wrapper old runtime CDN. | Yes. |
| `experiments/infinite-radial-terrain/` | Procedural radial terrain flight/survey scene. | 3-10 minute flyover/survey loop. | Camera flight, survey transects, altitude corridors, hazards. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/high-fidelity-meadow/` | Living meadow visual scene. | 2-6 minute ambient exploration/readability pass. | Grass, flowers, sheep, pollinator/shepherd/ecology descriptors. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/fogline-relay/` | Fog relay pressure route. | 5-10 minute traversal/scanning loop. | Move, scan, relay completion, wraith pressure, route memory. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/nexus-frontier-signal-isles/` | First-person island/resource/build/cargo objective route. | 5-12 minute objective loop. | Move, scan, harvest, build mast, survive pressure, unlock gate, carry cargo, activate beacon. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/sora-the-infinite/` | Authored route-preview and launch-rehearsal gateway. | 2-4 minute preview/interstitial. | Build lift, rehearse controls, read thermal slots, drift warnings, countdown rings, target ghosts, launch to The Open Above. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/zombie-orchard/` | Orchard survival wave route. | 5-12 minute survival loop. | Move, collect, melee timing, waves, resources. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/tropical-island-scene/` | Cel-shaded island lagoon scene. | 2-5 minute orbit/view loop. | Drag orbit, fish, falling coconuts, reflective water, beachcomber readability overlays. | ProtoKit import-map still references `NexusRealtime-ProtoKits`; no old `LuminaryLabs-Dev/NexusRealtime` runtime CDN in changed entry. | Yes in base route and overlay entry. |
| `games/signal-bastion/` | Tower defense command route. | 10-20 minute wave loop. | Place and upgrade towers, read path pressure, wave readiness, command choices, and wave choreography. | No old `LuminaryLabs-Dev/NexusRealtime` runtime CDN in changed boot; ProtoKits bridge URLs remain for generic defense kits. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Survival defense game route. | 8-20 minute defense loop. | Harvest, build, portals, core defense, wave pressure, extraction routes, safe zones, survival vectors, crafting windows, boss wake signatures, and exit compass. | No changed-runtime old runtime CDN. | Yes. |
| `games/rogue-lite-hellscape-siege-v2/` | Removed legacy version path. | Not active. | Superseded by canonical route. | Not active. | Not active. |

## Domain ASCII tree

```txt
hellscape-expedition-readability-domain
├─ route-intent-domain
│  ├─ extraction-route-domain
│  │  └─ hellscape-extraction-route-kit
│  └─ realm-exit-domain
│     └─ hellscape-realm-exit-compass-kit
├─ survival-response-domain
│  ├─ safe-zone-domain
│  │  └─ hellscape-safe-zone-beacon-kit
│  └─ survival-vector-domain
│     └─ hellscape-survival-vector-kit
├─ escalation-planning-domain
│  ├─ crafting-window-domain
│  │  └─ hellscape-crafting-window-kit
│  └─ boss-wake-domain
│     └─ hellscape-boss-wake-signature-kit
└─ renderer-handoff
   └─ hellscape-expedition-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `hellscape-extraction-route-kit`
- `hellscape-safe-zone-beacon-kit`
- `hellscape-survival-vector-kit`
- `hellscape-crafting-window-kit`
- `hellscape-boss-wake-signature-kit`
- `hellscape-realm-exit-compass-kit`
- `hellscape-expedition-renderer-handoff-kit`
- `hellscape-expedition-readability-domain-kit`

Changed integration:

- `main.js` now imports `createHellscapeExpeditionReadabilityDomainKit`.
- `snapshot()` now adds `state.expeditionReadability` and `domain.hellscapeExpeditionReadability`.
- `GameHost.getExpeditionReadability()` exposes the new domain state.
- `GameHost.getRendererHandoff()` now composes visual-fractal and expedition-readability descriptors.
- Canvas presentation now renders expedition descriptors as overlays only.

## Files changed

- `games/rogue-lite-hellscape-siege/src/hellscape-expedition-readability-domain-kit.js`
- `games/rogue-lite-hellscape-siege/src/main.js`
- `games/rogue-lite-hellscape-siege/src/renderer/canvas-renderer.js`
- `tests/hellscape-expedition-readability-domain-kits-smoke.mjs`
- `tests/hellscape-expedition-readability-cdn-state-input-smoke.mjs`
- `scripts/run-checks.mjs`
- `experiments/domain-kit-cutover-manifest.json`
- `.agent/turn-ledger/2026-07-08-0531-hellscape-expedition-readability-upgrade.md`

## Tests added

- `tests/hellscape-expedition-readability-domain-kits-smoke.mjs`
  - 10 intake cases.
  - Checks extraction routes, safe zones, survival vectors, crafting windows, boss wake signatures, realm exit compass, and renderer handoff.
  - Validates descriptor shape, serializability, handoff counts, and ownership boundaries.
- `tests/hellscape-expedition-readability-cdn-state-input-smoke.mjs`
  - 10 state/input cases.
  - Checks NexusEngine main CDN usage, old NexusRealtime runtime absence, route boot path, GameHost exposure, renderer descriptor consumption, and check wiring.

Updated:

- `scripts/run-checks.mjs`
- `experiments/domain-kit-cutover-manifest.json`

## Validation results

Static connector validation completed by writing all changed files through the GitHub contents API and checking expected tokens through the added smoke files.

Runtime shell validation was not executed in this connector-only pass. Wired commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- Changed Hellscape runtime keeps the requested runtime import: `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- Changed Hellscape runtime does not import `LuminaryLabs-Dev/NexusRealtime@main`.
- Existing package and ProtoKit references remain because the route still uses local Hellscape runtime kits, but the browser entry touched in this pass uses NexusEngine main CDN.
- New expedition readability kits are plain JavaScript descriptor factories and do not import renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop code.

## Cleanup pass

- Preserved the canonical game route instead of adding another version suffix.
- Reused the existing canvas renderer and kept new logic in descriptor-producing kits.
- Composed new expedition descriptors with the existing visual-fractal handoff.
- Updated manifest status so the route records both the older visual-fractal pass and this expedition readability pass.
- Avoided destructive rewrites and did not revive removed legacy `-v2` route paths.

## Non-game route handling

Rogue-Lite Hellscape Siege is a small experience-driven web game. It was not deleted, renamed, or refactored away. The pass preserved harvesting, portals, building, and core defense while adding a clearer expedition layer.

## Next safe ledge

Add a deterministic Hellscape replay fixture that starts in lobby, enters a resource realm, harvests one node, follows an extraction route, returns to base, places a selected build, starts a wave, and snapshot-hashes visual plus expedition renderer-handoff descriptors.

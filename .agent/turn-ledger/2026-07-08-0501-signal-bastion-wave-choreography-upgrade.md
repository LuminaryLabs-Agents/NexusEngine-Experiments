# 2026-07-08 0501 — Signal Bastion wave choreography readability upgrade

## Chosen experiment

`games/signal-bastion/`

## Why it was chosen

The latest completed upgrade was `experiments/sora-the-infinite/`, so this pass selected a different route. Signal Bastion is already a complete tower-defense route, but its weakest remaining readability surface was wave choreography: players could place towers and see command descriptors, yet the timing and consequence shape of incoming waves, leaks, reserve risk, and upgrade priority were still inferred from raw activity. This pass adds a second, deeper readability layer without moving truth into the renderer.

## Last upgraded experiment

`experiments/sora-the-infinite/`

Latest known ledger before this pass: `.agent/turn-ledger/2026-07-08-0446-sora-launch-rehearsal-upgrade.md`.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller arena and camera debug route. | 1-3 minute controller sandbox. | WASD movement, jump, camera orbit, debug rig/rays, arena descriptors, locomotion readability descriptors. | No changed-runtime old runtime CDN. | Yes through arena/locomotion wrapper and base app runtime files. |
| `experiments/peer-scene-transition/` | HTML scene route with routes, puzzles, atmosphere, chronicle, and consequence descriptors. | 3-8 minute story/puzzle pass. | Scene transitions, inventory, gate checks, consequences. | No changed-runtime old runtime CDN. | Yes. |
| `apps/the-cavalry-of-rome/` | Campaign map command prototype. | 5-15 minute strategy sandbox. | Map movement, supply, morale, command choices. | Legacy file remains; active handoff uses CDN. | Yes in active handoff. |
| `experiments/vr-platformer-board/` | Board-scale platformer route. | 2-5 minute traversal run. | Move, jump, reset, collect, avoid hazards, reach exit. | Old ProtoKit CDN removed from changed route. | Yes. |
| `experiments/next-ledge/` | Grapple/swing ledge climb route. | 3-8 minute traversal loop. | Grapple, swing, cargo, sector progress, recovery. | No changed-wrapper old runtime CDN. | Yes. |
| `experiments/infinite-radial-terrain/` | Procedural radial terrain flight/survey scene. | 3-10 minute flyover/survey loop. | Camera flight, survey transects, altitude corridors, hazards. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/high-fidelity-meadow/` | Living meadow visual scene. | 2-6 minute ambient exploration/readability pass. | Grass, flowers, sheep, pollinator/shepherd/ecology descriptors. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/fogline-relay/` | Fog relay pressure route. | 5-10 minute traversal/scanning loop. | Move, scan, relay completion, wraith pressure, route memory. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/nexus-frontier-signal-isles/` | First-person island/resource/build/cargo objective route. | 5-12 minute objective loop. | Move, scan, harvest, build mast, survive pressure, unlock gate, carry cargo, activate beacon. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/sora-the-infinite/` | Authored route-preview and launch-rehearsal gateway. | 2-4 minute preview/interstitial. | Build lift, rehearse controls, read thermal slots, drift warnings, countdown rings, target ghosts, launch to The Open Above. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/zombie-orchard/` | Orchard survival wave route. | 5-12 minute survival loop. | Move, collect, melee timing, waves, resources. | No changed-runtime old runtime CDN. | Yes. |
| `experiments/tropical-island-scene/` | Cel-shaded island lagoon scene. | 2-5 minute orbit/view loop. | Drag orbit, fish, falling coconuts, reflective water, beachcomber readability overlays. | ProtoKit import-map still references `NexusRealtime-ProtoKits`; no old `LuminaryLabs-Dev/NexusRealtime` runtime CDN in changed entry. | Yes in base route and overlay entry. |
| `games/signal-bastion/` | Tower defense command route. | 10-20 minute wave loop. | Place and upgrade towers, read path pressure, wave readiness, command choices, and now wave choreography. | No old `LuminaryLabs-Dev/NexusRealtime` runtime CDN in changed boot; ProtoKits bridge URLs remain for generic defense kits. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Survival defense game route. | 8-20 minute defense loop. | Harvest, build, portals, core defense, wave pressure. | No changed-runtime old runtime CDN. | Yes. |

## Domain ASCII tree

```txt
signal-bastion-wave-choreography-domain
├─ wave-forecast-domain
│  ├─ spawn-cadence-domain
│  │  └─ bastion-spawn-cadence-rail-kit
│  └─ leak-risk-domain
│     └─ bastion-leak-risk-funnel-kit
├─ defense-response-domain
│  ├─ coverage-gap-domain
│  │  └─ bastion-coverage-gap-cell-kit
│  └─ upgrade-priority-domain
│     └─ bastion-upgrade-priority-pin-kit
├─ combat-tempo-domain
│  ├─ reserve-meter-domain
│  │  └─ bastion-panic-reserve-meter-kit
│  └─ projectile-tempo-domain
│     └─ bastion-projectile-tempo-spark-kit
└─ renderer-handoff
   └─ bastion-wave-choreography-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `bastion-spawn-cadence-rail-kit`
- `bastion-leak-risk-funnel-kit`
- `bastion-coverage-gap-cell-kit`
- `bastion-upgrade-priority-pin-kit`
- `bastion-panic-reserve-meter-kit`
- `bastion-projectile-tempo-spark-kit`
- `bastion-wave-choreography-renderer-handoff-kit`
- `signal-bastion-wave-choreography-domain-kit`

Changed integration:

- `boot.js` now composes the existing command-fractal domain with the new wave-choreography domain.
- `GameHost.getWaveChoreography()` exposes the new descriptor domain.
- `GameHost.getRendererHandoff()` now returns a composed command plus wave-choreography handoff.
- The existing canvas renderer consumes the combined descriptor stream through the already-rendered command-fractal primitive kinds.

## Files changed

- `games/signal-bastion/src/signal-bastion-wave-choreography-domain-kit.js`
- `games/signal-bastion/src/boot.js`
- `tests/signal-bastion-wave-choreography-domain-kits-smoke.mjs`
- `tests/signal-bastion-wave-choreography-cdn-state-input-smoke.mjs`
- `scripts/run-checks.mjs`
- `experiments/domain-kit-cutover-manifest.json`
- `.agent/turn-ledger/2026-07-08-0501-signal-bastion-wave-choreography-upgrade.md`

## Tests added

- `tests/signal-bastion-wave-choreography-domain-kits-smoke.mjs`
  - 10 intake cases.
  - Checks spawn cadence rails, leak risk funnels, coverage gap cells, upgrade priority pins, panic reserve meters, projectile tempo sparks, renderer handoff counts, JSON serializability, and ownership boundaries.
- `tests/signal-bastion-wave-choreography-cdn-state-input-smoke.mjs`
  - Checks NexusEngine main CDN usage in changed Signal Bastion boot.
  - Checks absence of old `LuminaryLabs-Dev/NexusRealtime@main` runtime CDN in changed boot.
  - Checks `GameHost.getWaveChoreography()`, composed renderer handoff, check wiring, and 10 state/input cases.

Updated:

- `scripts/run-checks.mjs` wires both new tests into full and deploy validation.

## Validation results

Static connector validation completed by writing the changed files through the GitHub contents API and checking expected tokens in the updated files.

Runtime shell validation was not executed in this connector-only pass. Wired commands:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

- Changed Signal Bastion boot keeps the requested runtime import: `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- Changed Signal Bastion boot does not import `LuminaryLabs-Dev/NexusRealtime@main`.
- Existing `NexusRealtime-ProtoKits` URLs remain for generic defense DSK bridges; they are ProtoKit dependency URLs, not the old runtime CDN import.
- New reusable wave choreography kits are plain JavaScript descriptor factories and do not import renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, or frame-loop code.

## Cleanup pass

- Reused the existing canvas command-fractal renderer by emitting renderer-compatible descriptor groups with semantic sub-kinds, avoiding renderer branching and keeping presentation thin.
- Kept all new wave choreography logic in atomic kits.
- Preserved the 30-wave tower-defense loop and existing placement/session commands.
- Avoided destructive route rewrites.
- Updated the canonical manifest instead of adding a versioned route.

## Non-game route handling

Signal Bastion is a small experience-driven web game. It was not deleted, renamed, or refactored away. This pass preserved the game loop and added a descriptor layer that makes wave intent, defensive weakness, and upgrade response more legible.

## Next safe ledge

Add a deterministic Signal Bastion wave-choreography replay fixture that starts a wave, places two towers, upgrades one tower, leaks one enemy, fires projectiles, and snapshot-hashes the composed command plus wave choreography renderer handoff descriptors.

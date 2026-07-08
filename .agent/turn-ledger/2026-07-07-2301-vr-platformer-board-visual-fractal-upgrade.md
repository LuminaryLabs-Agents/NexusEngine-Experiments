# VR Platformer Board Visual Fractal Upgrade

Timestamp: 2026-07-07 23:01 America/New_York
Repo: LuminaryLabs-Agents/NexusEngine-Experiments
Branch policy: pushed directly to main; no branch created.

## Chosen experiment

`experiments/vr-platformer-board/`

## Why it was chosen

The latest visible upgrade sequence was `peer-scene-transition`, so this run avoided that route.

`vr-platformer-board` had useful platformer/XR kit wiring, but the play surface still read as a flat mini board with only skyline, auras, depth rings, and orbit markers. It had less visual variability and less moment-to-moment readability than the recently upgraded visual-fractal routes.

## Last upgraded experiment

Latest commit history showed the most recent run focused on `peer-scene-transition` atmospheric handoff checks and kits.

## Experiment inventory

| id | description | gameplay length | gameplay mechanics | old NexusRealtime import | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| peer-scene-transition | Scene-host story/puzzle route with inventory and transition ledgers. | Short puzzle chain. | click actions, scene exits, inventory tokens. | no in latest routed work | yes |
| vr-platformer-board | Floating XR board platformer validation. | Short micro-platformer board. | A/D move, Space jump, R reset, drag head pose, stereo/comfort state. | migrated in this run | yes |
| infinite-radial-terrain | Camera-driven radial terrain tessellation. | Open-ended terrain demo. | WASD flight, radial LOD, origin snapping. | not changed this run | not audited in this run |
| high-fidelity-meadow | Procedural meadow scene. | Open-ended scene. | camera/exploration presentation, vegetation/creature/sky domains. | not changed this run | not audited in this run |
| fogline-relay | First-person fog relay scan route. | Short objective loop. | WASD/mouse look, scan, relays, wraith pressure. | previously migrated | yes |
| nexus-frontier-signal-isles | Field-engineer system showcase. | Medium objective loop. | scan, harvest, build, pressure wave, gate unlock. | not changed this run | not audited in this run |
| the-cavalry-of-rome | Painterly Roman map visual proof. | Open-ended visual map. | pan/hover/cinematic map dive. | not changed this run | not audited in this run |
| signal-bastion | 2.5D tower-defense game. | Full game route. | tower placement, waves, upgrades, bosses, endless mode. | not changed this run | not audited in this run |
| next-ledge | Grapple-climb validation. | Short sector climb. | swing, grapple, rest anchors, summit, sector advance. | mixed legacy base and visual wrapper | yes in wrapper |
| sora-the-infinite | Redirect route into The Open Above. | Open-ended aerial route via redirect. | flight, boost, terrain stream, visual domains. | route is redirect | indirect through Open Above |
| zombie-orchard | Survival/horde resource route. | Wave survival loop. | move, sprint, dodge, collect, gear use, waves. | previously migrated | yes |
| rogue-lite-hellscape-siege | Base route for action defense extraction. | Medium/full game route. | portals, inventory, harvest, build, wave defense. | not changed this run | not audited in this run |

## Domain ASCII tree

```txt
vr-platformer-board-domain
├─ board-world-readability
│  ├─ atmospheric-dome
│  │  └─ vr-board-atmospheric-dome-kit
│  └─ depth-lanes
│     └─ vr-board-depth-lane-kit
├─ platformer-readability
│  ├─ platform-relief
│  │  └─ vr-board-platform-relief-kit
│  ├─ hazard-telemetry
│  │  └─ vr-board-hazard-telemetry-kit
│  ├─ collectible-constellation
│  │  └─ vr-board-collectible-constellation-kit
│  └─ avatar-motion
│     └─ vr-board-motion-trail-kit
└─ comfort-and-handoff
   ├─ comfort-focus
   │  └─ vr-board-comfort-focus-kit
   └─ renderer-handoff
      └─ vr-board-renderer-handoff-kit
         └─ renderer consumes descriptors only
```

## Kits added or changed

Changed:

- `vr-board-world-seed-kit`
- `vr-board-challenge-director-kit`
- `vr-board-depth-lane-kit`
- `vr-board-hud-descriptor-kit`
- `vr-board-composition-kit`

Added:

- `VR_PLATFORMER_BOARD_VISUAL_DOMAIN_TREE`
- `vr-board-atmospheric-dome-kit`
- `vr-board-platform-relief-kit`
- `vr-board-hazard-telemetry-kit`
- `vr-board-collectible-constellation-kit`
- `vr-board-comfort-focus-kit`
- `vr-board-motion-trail-kit`
- `vr-board-renderer-handoff-kit`

## Files changed

- `experiments/_kits/vr-platformer-board/vr-platformer-board-kits.js`
- `experiments/vr-platformer-board/index.html`
- `tests/vr-platformer-board-visual-fractal-kits-smoke.mjs`
- `tests/vr-platformer-board-playwright-state-input-smoke.mjs`
- `scripts/run-checks.mjs`
- `experiments/domain-kit-cutover-manifest.json`
- `.agent/turn-ledger/2026-07-07-2301-vr-platformer-board-visual-fractal-upgrade.md`

## Tests added

- `tests/vr-platformer-board-visual-fractal-kits-smoke.mjs`
  - 10 intake cases.
  - Covers atmospheric dome, platform relief, hazard telemetry, collectible constellation, comfort focus, motion trail, renderer handoff, and composition.
  - Checks descriptor counts, clamped values, renderer ownership exclusions, and composition handoff.

- `tests/vr-platformer-board-playwright-state-input-smoke.mjs`
  - 10 state/input intake cases.
  - Checks NexusEngine main CDN import, input submission, platformer simulation handoff, composition creation, and visual renderer consumption points.

## Validation results

Static validation completed through GitHub file refetch after writes:

- The route now imports NexusEngine main via CDN.
- The route wires the new visual kits into `boardCompositionKit`.
- The renderer consumes descriptor buckets through draw functions only.
- New smoke tests are wired into both full and deploy check suites.
- Manifest now records `vr-platformer-board` as `xr-board-visual-fractal-renderer-handoff-pass`.

Runtime shell validation was not executed in this connector-only run. The validation commands are wired for:

```bash
npm run check
npm run check:deploy
```

## NexusRealtime import audit

Changed runtime file:

- `experiments/vr-platformer-board/index.html`
  - Before: `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js`
  - After: `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`

Remaining use of the `NexusRealtime` local variable in the browser code is only a compatibility variable name for the imported NexusEngine module passed into existing ProtoKit factory functions.

## Cleanup pass

- Kept reusable kit logic renderer-neutral.
- Kept Canvas draw calls inside the route renderer.
- Kept DOM, browser input, WebGL, audio, and frame-loop ownership outside reusable kit logic.
- Avoided destructive route pruning.
- Avoided new branch creation.
- Did not touch any other repo.

## Next safe ledge

Run `npm run check` and `npm run check:deploy` in a shell runner, then add a deterministic fixture for `vr-platformer-board` that replays movement, jump, reset, head-drag, comfort warning, and descriptor-count changes across fixed ticks.

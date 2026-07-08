# 2026-07-07 Open Above / Sora Visual Fractal Upgrade

## Summary
Upgraded the `sora-the-infinite` canonical lane by improving its redirected runtime target, `experiments/the-open-above/`, with a renderer-neutral visual fractal domain layer. The previous most recent upgrade series targeted `zombie-orchard`, so this pass intentionally avoided Zombie Orchard and selected the aerial lane because its old Sora gallery description still emphasized ring/checkpoint/updraft validation while the actual route redirects into open aerial traversal.

## Experiment inventory

| Experiment | Description | Gameplay length | Mechanics |
| --- | --- | --- | --- |
| `peer-scene-transition` | Story-scene orchestration through peer HTML scenes and scene exits. | Short puzzle chain, roughly 3-7 minutes. | Scene manifest exits, inventory tokens, lantern gate, forest/bridge/shrine puzzle states, debug panel. |
| `vr-platformer-board` | Floating platformer-board validation for XR pose/input descriptors. | Short traversal board, roughly 2-5 minutes. | XR pose, spatial anchors, platform descriptors, stereo-friendly state, jump/platform loop. |
| `infinite-radial-terrain` | Terrain LOD/tessellation camera demo. | Exploratory technical slice, open-ended. | WASD flight camera, radial patch LOD, origin snapping, procedural height field. |
| `high-fidelity-meadow` | Procedural meadow scene with visual target kits. | Scenic exploration, open-ended. | Terrain, wind, vegetation, creature/fur, sky, VFX, visual target composition. |
| `fogline-relay` | First-person fog forest relay. | Objective slice, roughly 5-10 minutes. | Move/look, hold scan, fog volumes, relay objectives, timed pressure, wraith hazards. |
| `nexus-frontier-signal-isles` | Broad field-engineer kit showcase. | Multi-step validation route, roughly 10-15 minutes. | Scan, harvest, build, pressure wave, gate unlock, route checkpoint, cargo delivery, beacon activation. |
| `the-cavalry-of-rome` | Painterly Roman terrain / map interaction proof. | Cinematic interaction slice, roughly 3-8 minutes. | Pannable map, hover regions, cinematic dive, army reveal. |
| `next-ledge` | Cinematic grapple-climb validation route. | Short climb, roughly 5-10 minutes. | Grapple, swing, route progress, ledge anchors, sector advance, Three.js snapshot renderer. |
| `sora-the-infinite` | Redirected aerial lane into `the-open-above`. | Open traversal, open-ended. | Assisted pitch/bank/boost, terrain streaming, flock/scatter descriptors, camera-relative sky. |
| `zombie-orchard` | Kit-composed survival orchard. | Wave survival, roughly 10-20 minutes. | Move/sprint/dodge, collect apples, weapon pickup/swap/use, horde pressure, boss warnings. |
| `signal-bastion` | Strategic tower-defense game. | Authored plus endless defense, long-form. | Tower placement, range rings, waves, enemies/bosses, upgrades, strategic pressure replay. |
| `rogue-lite-hellscape-siege` | Action-defense-extraction base route. | Action loop, roughly 10-25 minutes. | Realm portals, inventory, harvesting, pickups, building, core defense, FX presentation. |

## Selection rationale

- Recent commit history showed the latest upgrade series was `zombie-orchard`, so this pass did not select it.
- `sora-the-infinite` was weaker because the gallery and manifest still framed it around checkpoint/updraft/ring validation while the route now redirects into `the-open-above`.
- The actual open aerial traversal already had flight, terrain, flock, scatter, sky, and lighting ProtoKit consumption, but it lacked a small scoped visual-domain layer that could expose visual descriptor state back through `GameHost`.
- The upgrade keeps browser/CSS overlay rendering outside reusable kit logic while exposing deterministic descriptor state under `state.visualDomains`.

## Domain fractalization model

```txt
the-open-above
├─ flight-domain
│  ├─ flight-motion-kit                 [existing ProtoKit]
│  ├─ flight.feedback.speed-ribbon
│  │  └─ open-above-speed-ribbon-kit
│  └─ actor.wingtip.contrail
│     └─ open-above-wingtip-contrail-kit
├─ sky-domain
│  └─ sky.cloud.strata
│     └─ open-above-cloud-strata-kit
├─ terrain-domain
│  └─ terrain.horizon.ridgeline
│     └─ open-above-mountain-ridgeline-kit
├─ air-current-domain
│  └─ air.current.thermal-column
│     └─ open-above-thermal-column-kit
├─ readability-domain
│  └─ flight.mood.readability
│     └─ open-above-flight-mood-kit
└─ open-above-visual-fractal-domain-kit
   └─ renderer/browser overlay descriptor handoff
```

The point of the split is that a tree, cloud, thermal, contrail, speed cue, or mood cue should not be owned by the whole game object. Each concept gets a scoped boundary that accepts a snapshot, emits descriptors, and remains idempotent. The final domain kit composes the small kits, and the browser overlay consumes those descriptors without taking ownership of flight, terrain, or simulation state.

## Changed files

- `experiments/the-open-above/open-above-visual-domain-kits.js`
  - Added six atomic visual/domain kits and one composite visual fractal kit.
  - Exported `OPEN_ABOVE_VISUAL_KIT_TREE` for debug and documentation.
- `experiments/the-open-above/open-above-visual-layer.js`
  - Wraps `GameHost.getState`, `GameHost.tick`, and `GameHost.render` after the app boots.
  - Adds `GameHost.getVisualDomains()` and `GameHost.getVisualKitTree()`.
  - Renders a browser-only overlay from descriptors for cloud bands, ridgelines, speed ribbons, thermal columns, contrails, and flight mood.
- `experiments/the-open-above/index.html`
  - Loads the new visual layer after `open-above.js` and raises HUD/error z-index above the overlay.
- `experiments/domain-kit-cutover-manifest.json`
  - Updated the `sora-the-infinite` entry to record the Open Above visual-fractal upgrade and new domain kit boundaries.
- `experiments/_shared/nexus-gallery-data.js`
  - Updated the Sora card description/tags away from stale checkpoint/updraft wording.
- `tests/open-above-visual-domain-kits-smoke.mjs`
  - Gives every new atomic kit 10 different state intake cases and validates stable descriptor output.
- `tests/open-above-visual-static-smoke.mjs`
  - Guards renderer ownership exclusions and route wiring.
- `tests/open-above-playwright-cdn-state-input-smoke.mjs`
  - Pulls CDN URLs from config, boots the local route with Playwright, gives state input, and validates `visualDomains`.
- `scripts/run-checks.mjs`
  - Wires new full and deploy smoke coverage.

## Validation run in this environment

```txt
node tests/open-above-visual-domain-kits-smoke.mjs
node tests/open-above-visual-static-smoke.mjs
node --check experiments/the-open-above/open-above-visual-layer.js
node --check scripts/run-checks.mjs
```

Result: passed locally for the new kit/static syntax coverage. Full Playwright route validation is committed for repository CI/runtime but could not be executed in this local container because the repository dependencies and browser runtime were not available here.

## Final cleanup pass

- Did not remove any experiment route because the available repo metadata still keeps all canonical routes discoverable through the gallery/manifest contract.
- Folded the stale Sora checkpoint/updraft description into the actual Open Above redirect behavior instead of deleting the route.
- Kept reusable simulation domains in existing Core/ProtoKit imports and added only renderer-neutral descriptor kits at the experiment boundary.

## Next ledge

Promote these Open Above visual descriptor atoms into ProtoKits only after the Playwright CDN route smoke is green in CI and another route can consume at least one descriptor family without importing Open Above-specific names.

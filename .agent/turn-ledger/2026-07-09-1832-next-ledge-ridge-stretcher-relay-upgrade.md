# 2026-07-09 18:32 — Next Ledge ridge stretcher relay upgrade

## Chosen experiment

- `experiments/next-ledge/`
- New pass: `ridge-stretcher-relay-readiness-renderer-handoff-pass`
- New route entry: `experiments/next-ledge/src/ridge-stretcher-relay-readiness-entry.js`

## Why it was chosen

The latest completed upgrade found before selection was `experiments/living-agent-lab/market-fire-evacuation.html` / canal brigade, so this run intentionally chose a different route. Next Ledge is already a compact grapple-climb validation route, but its core loop is still comparatively linear: climb, swing, recover, and reach the summit. The ridge stretcher relay adds a clearer rescue objective, more visible procedural overlays, and a second planning layer around medical anchors, supply caches, belay spans, wind ribbons, signal panels, and a dawn stretcher ledger.

## Last upgraded experiment

- Last upgraded experiment observed from latest commit stream before selection: `experiments/living-agent-lab/market-fire-evacuation.html`
- Latest ledger commit observed before this run: `95076b1a23b23910d91857e8621f4fa971cb02eb` — `Log Living Agent canal brigade upgrade`

## Experiment inventory

| Experiment | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime imports | NexusEngine main CDN |
| --- | --- | --- | --- | --- | --- |
| `experiments/peer-scene-transition/` | Scene-host route proof with bell archive evacuation overlays. | 3–8 minutes | Click exits, collect puzzle tokens, scene-to-scene state. | No changed-route old CDN found in current pass. | Uses route passes that import NexusEngine main CDN. |
| `experiments/vr-platformer-board/storm-harbor.html` | Board-scale storm harbor platformer rescue. | 5–10 minutes | Jump, collect, avoid hazards, lighthouse/breakwater descriptors. | No changed-route old CDN found in current pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain inspection with rescue overlays. | 5–12 minutes | WASD flight, terrain LOD, origin snapping, beacon/rescue descriptors. | No changed-route old CDN found in current pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/high-fidelity-meadow/` | Procedural meadow ecology and restoration visual proof. | 4–10 minutes | Camera drift, ecology descriptors, wind/creature/vegetation domains. | Not changed in this pass. | Existing gallery reports Nexus Engine route. |
| `experiments/tiny-diffusion-lab/` | Browser diffusion training and curriculum lab. | 6–15 minutes | CPU training, sampling, checkpoints, readiness panels. | No changed-route old CDN found in current pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/living-agent-lab/market-fire-evacuation.html` | Procedural market emergency drill. | 5–12 minutes | Inspect lanterns, clear aisles, stage relays, account for civilians. | No changed-route old CDN found in current pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/fogline-relay/` | First-person fog survey and evacuation/rescue overlays. | 5–12 minutes | Scan targets, route through fog, avoid hazards, rescue descriptors. | Older page loader removed in a prior Fogline pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/nexus-frontier-signal-isles/` | Field engineer island slice. | 8–15 minutes | Scan, harvest, build, cargo gates, storm pressure. | No changed-route old CDN found in current pass. | Uses NexusEngine main CDN validation pass. |
| `apps/the-cavalry-of-rome/` | Painted Roman strategy-map proof. | 5–10 minutes | Pan/hover, region focus, army descriptors, morale overlays. | No changed-route old CDN found in current pass. | Uses NexusEngine main CDN validation pass. |
| `games/signal-bastion/` | 2.5D tower defense route. | 8–20 minutes | Tower cards, placement ghosts, waves, convoy descriptors. | Not changed in this pass. | Existing gallery reports Nexus Engine route. |
| `games/stonewake-depths/` | Flooded cavern rescue game. | 10–20 minutes | Block carrying, valves, rune plates, survivor pings. | No changed-route old CDN found in current pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/next-ledge/` | Grapple-climb validation route. | 4–9 minutes | Grapple/action input, ledges, swing pressure, rescue descriptors. | Changed route shell had `nexus-realtime-page-loader`; this pass removes it. | Changed entry imports NexusEngine main CDN. |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller/camera validation. | 5–10 minutes | Locomotion, spring camera, route caches, rescue overlays. | No changed-route old CDN found in current pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/sora-the-infinite/stormglass-courier.html` | Procedural open flight courier route. | 6–12 minutes | Thermal lanes, storm cells, buoy tuning, landing. | No changed-route old CDN found in current pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/zombie-orchard/` | Orchard survival slice. | 8–18 minutes | Rounds, horde pressure, pickups, weapons, refuge overlays. | No changed-route old CDN found in current pass. | Uses NexusEngine main CDN validation pass. |
| `games/rogue-lite-hellscape-siege/` | Base-siege action route. | 12–25 minutes | Portals, inventory, harvesting, building, waves. | No changed-route old CDN found in current pass. | Uses NexusEngine main CDN validation pass. |
| `experiments/onnx-agent-lab/red-team-evacuation.html` | Red-team evacuation workshop. | 6–15 minutes | Canary prompts, sandbox locks, evidence routing, rollback drills. | No changed-route old CDN found in current pass. | Uses NexusEngine main CDN validation pass. |

## Domain ASCII tree

```txt
next-ledge-ridge-stretcher-relay-readiness-domain
├─ ridge-medical-domain
│  ├─ stretcher-anchor-domain
│  │  └─ next-ledge-stretcher-anchor-kit
│  └─ med-pack-cache-domain
│     └─ next-ledge-med-pack-cache-kit
├─ traverse-safety-domain
│  ├─ belay-post-domain
│  │  └─ next-ledge-belay-post-kit
│  └─ wind-shear-ribbon-domain
│     └─ next-ledge-wind-shear-ribbon-kit
├─ extraction-handoff-domain
│  ├─ ridge-signal-panel-domain
│  │  └─ next-ledge-ridge-signal-panel-kit
│  └─ dawn-stretcher-ledger-domain
│     └─ next-ledge-dawn-stretcher-ledger-kit
└─ renderer-handoff
   └─ next-ledge-ridge-stretcher-relay-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added `experiments/next-ledge/src/ridge-stretcher-relay-readiness-kits.js` with:

- `next-ledge-stretcher-anchor-kit`
- `next-ledge-med-pack-cache-kit`
- `next-ledge-belay-post-kit`
- `next-ledge-wind-shear-ribbon-kit`
- `next-ledge-ridge-signal-panel-kit`
- `next-ledge-dawn-stretcher-ledger-kit`
- `next-ledge-ridge-stretcher-relay-renderer-handoff-kit`
- Composite domain kit: `next-ledge-ridge-stretcher-relay-readiness-domain-kit`

The reusable kits are deterministic, idempotent, descriptor-only, and explicitly do not own renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, physics, storage, network, or frame-loop behavior.

## Files changed

Added:

```txt
experiments/next-ledge/src/ridge-stretcher-relay-readiness-kits.js
experiments/next-ledge/src/ridge-stretcher-relay-readiness-entry.js
tests/next-ledge-ridge-stretcher-relay-readiness-kits-smoke.mjs
tests/next-ledge-ridge-stretcher-relay-cdn-state-input-smoke.mjs
.agent/turn-ledger/2026-07-09-1832-next-ledge-ridge-stretcher-relay-upgrade.md
```

Updated:

```txt
experiments/next-ledge/index.html
package.json
```

## Tests added

- `tests/next-ledge-ridge-stretcher-relay-readiness-kits-smoke.mjs`
  - Runs 10 generated intake cases through all new atomic kits and the composite domain.
  - Checks descriptor groups, descriptor counts, readiness bounds, wind-shear bounds, mission-state enum, JSON safety, malformed-state behavior, and cold-to-prepared improvement.
- `tests/next-ledge-ridge-stretcher-relay-cdn-state-input-smoke.mjs`
  - Validates route markers, NexusEngine main CDN import, absence of old `NexusRealtime@`, removal of old page loader from the changed shell, `GameHost` accessors, renderer handoff composition, reusable-kit ownership boundaries, 10 simulated input cases, and CDN download-to-local-`.mjs` syntax checking when network is available.

## Validation results

Observed local validation before connector writes:

```txt
node --check experiments/next-ledge/src/ridge-stretcher-relay-readiness-kits.js
node --check experiments/next-ledge/src/ridge-stretcher-relay-readiness-entry.js
npm run check:next-ledge-ridge-stretcher-relay

Next Ledge ridge stretcher relay readiness kits smoke passed 10 intake cases.
Next Ledge ridge stretcher relay CDN/state/input smoke passed 10 simulated cases; CDN validation: downloaded-to-local-mjs-and-syntax-checked.
```

Also checked syntax for both new test files and audited changed Next Ledge files with `rg`.

Full repo `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a full cloned workspace in this connector-driven run. The focused kit and CDN/state/input checks were run and passed.

## NexusRealtime import audit

- Changed route shell before this pass imported `../_shared/nexus-realtime-page-loader.js`.
- This pass removed that old route-shell loader from `experiments/next-ledge/index.html`.
- New entry imports only:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

- New and changed files contain no `NexusRealtime@` CDN import.
- `package.json` still has existing historical package names in dependencies/scripts; no dependency migration was attempted because this pass only changes the Next Ledge route and tests.

## Cleanup pass

- Confirmed the reusable kit file has no DOM, browser input, renderer, Three.js, WebGL, audio, asset loading, storage, network, or frame-loop ownership.
- Confirmed the browser entry owns only route integration and visual overlay drawing from descriptors.
- Confirmed the route advertises the new pass and loads the cache-busted entry.
- Confirmed the changed route shell migrates away from the old page loader.

## Next safe ledge

The next safe improvement is to consolidate repeated Next Ledge rescue overlays into a shared route-readiness registry so each pass contributes a descriptor family without increasing route-shell script count. Avoid upgrading `experiments/next-ledge/` again on the next automation run unless it is the only safe target.

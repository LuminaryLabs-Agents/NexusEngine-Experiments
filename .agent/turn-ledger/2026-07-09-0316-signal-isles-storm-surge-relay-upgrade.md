# 2026-07-09 03:16 ET — Signal Isles storm surge relay upgrade

## Summary

Upgraded `experiments/nexus-frontier-signal-isles/` with a renderer-neutral storm surge relay readiness layer. The route now adds tide gauges, breakwater braces, skiff anchors, flare mast pings, evacuation raft lanes, and surge manifest descriptors over the existing Signal Isles systems route.

## Chosen experiment

`experiments/nexus-frontier-signal-isles/`

## Why it was chosen

The latest completed upgrade observed on `main` was `experiments/tiny-diffusion-lab/` via `Log Tiny Diffusion sample clinic upgrade`, so this run picked a different experiment.

`Nexus Frontier: Signal Isles` is already an experience-driven web game, but compared to stronger wave/survival routes it still had relatively little environmental variability at the shoreline edge: scan, harvest, build, unlock, and evacuate lighthouse channels. A storm surge relay layer deepens the route with tide pressure, shoreline hardening, small-craft anchoring, flare signaling, raft routing, and evacuation accounting.

## Last upgraded experiment

`experiments/tiny-diffusion-lab/`

Latest observed commit before this run:

```txt
deecdb04d5775dd6b0dbd942b94bb6aabea32876
Log Tiny Diffusion sample clinic upgrade
```

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import audit | NexusEngine main CDN audit |
| --- | --- | --- | --- | --- | --- |
| `experiments/peer-scene-transition/` | Story-scene orchestration route. | Short scene chain. | Scene exits, tokens, inventory, transitions, flood rescue descriptors. | Existing shared loader naming may remain. | Recent overlays use NexusEngine main CDN where changed. |
| `experiments/vr-platformer-board/` | Floating XR platformer board. | Short platformer board. | Lane movement, jump, collectibles, hazards, comfort, traversal, companion rescue descriptors. | Shared compatibility naming may remain. | Route runtime imports NexusEngine main CDN. |
| `experiments/infinite-radial-terrain/` | Radial terrain tessellation flight. | Open-ended traversal demo. | WASD flight, LOD, origin snapping, survey and observatory evacuation overlays. | Changed overlays avoid old runtime CDN. | Recent overlays use NexusEngine main CDN. |
| `experiments/high-fidelity-meadow/` | Procedural meadow composition. | Open-ended scene. | Terrain, wind, vegetation, creatures, water-management overlays. | Existing old names may remain in shared files. | Recent creek irrigation pass uses NexusEngine main CDN. |
| `experiments/tiny-diffusion-lab/` | Browser CPU diffusion proof. | Lab session. | Prepare, train, sample, checkpoint, training mission descriptors, sample clinic descriptors. | Changed files do not import old `LuminaryLabs-Dev/NexusRealtime@main`. | Latest pass uses NexusEngine main CDN. |
| `experiments/living-agent-lab/` | Market trust agent lab. | Short lab loop. | ONNX/fallback agent, witness/evidence/restitution descriptors. | Recent changed files avoid old runtime CDN. | Latest pass uses NexusEngine main CDN. |
| `experiments/fogline-relay/` | First-person survey and rescue pressure. | Short objective loop. | Movement, scanning, relay repair, medical overlays. | Existing legacy names may remain outside changed passes. | Recent overlays use NexusEngine main CDN. |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer island systems route. | Short systems slice. | Scan, harvest, build, pressure, gates, beacons, harbor/lighthouse overlays, storm surge relay descriptors. | Changed files avoid old runtime CDN. | Existing main runtime and this pass use NexusEngine main CDN. |
| `apps/the-cavalry-of-rome/` | Painterly Roman strategy visual proof. | Open-ended map inspection. | Pan, hover, dive, army descriptors, logistics and campaign overlays. | Existing legacy naming may remain. | Recent changed passes use NexusEngine main CDN. |
| `games/signal-bastion/` | 2.5D tower defense. | Short wave session. | Tower cards, placement, waves, field hospital overlays. | Previous pass audited changed entry only. | Recent field hospital pass uses NexusEngine main CDN. |
| `games/stonewake-depths/` | Flooded cavern puzzle platformer. | Short puzzle rescue loop. | Block carry, valves, plates, survivor echo pings, chalk marks, air pockets, rope lifts. | Previous pass audited changed entry only. | Recent flood rescue pass uses NexusEngine main CDN. |
| `experiments/next-ledge/` | Grapple climb route. | Short climb run. | Aim, grapple, swing, stamina, ledge route, glacier supply descriptors. | Recent changed files avoid old runtime CDN. | Latest pass uses NexusEngine main CDN. |
| `experiments/sora-the-infinite/` | Aerial traversal / redirect route. | Short gateway/open traversal. | Flight preview, visual domains, migration overlays. | Existing legacy names may remain outside changed pass. | Recent rookery pass uses NexusEngine main CDN. |
| `experiments/zombie-orchard/` | Survival orchard slice. | Short survival round. | Rounds, pickups, horde pressure, water restoration. | Existing legacy names may remain outside changed pass. | Recent well pass uses NexusEngine main CDN. |
| `games/rogue-lite-hellscape-siege/` | Action RPG/base siege route. | Short wave/action slice. | Portals, inventory, harvesting, building, wave defense, forge/caravan/refuge descriptors. | Existing legacy names may remain outside changed pass. | Latest pass uses NexusEngine main CDN. |

## Domain ASCII tree

```txt
signal-isles-storm-surge-relay-readiness-domain
├─ surge-detection-domain
│  ├─ tide-gauge-domain
│  │  └─ signal-isles-tide-gauge-beacon-kit
│  └─ breakwater-brace-domain
│     └─ signal-isles-breakwater-brace-node-kit
├─ relay-stabilization-domain
│  ├─ skiff-anchor-domain
│  │  └─ signal-isles-skiff-anchor-buoy-kit
│  └─ flare-mast-domain
│     └─ signal-isles-flare-mast-ping-kit
├─ evacuation-accounting-domain
│  └─ raft-transfer-domain
│     ├─ raft-lane-domain
│     │  └─ signal-isles-evacuation-raft-lane-kit
│     └─ surge-manifest-domain
│        └─ signal-isles-surge-manifest-ledger-kit
└─ renderer-handoff
   └─ signal-isles-storm-surge-relay-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
signal-isles-tide-gauge-beacon-kit
signal-isles-breakwater-brace-node-kit
signal-isles-skiff-anchor-buoy-kit
signal-isles-flare-mast-ping-kit
signal-isles-evacuation-raft-lane-kit
signal-isles-surge-manifest-ledger-kit
signal-isles-storm-surge-relay-renderer-handoff-kit
signal-isles-storm-surge-relay-readiness-domain-kit
```

The reusable kit file consumes existing Signal Isles state and emits serializable descriptors only. It explicitly keeps DOM, browser input, Three.js, WebGL, audio, asset loading, collision, session mutation, and frame-loop ownership outside reusable kit logic.

## Files changed

```txt
experiments/nexus-frontier-signal-isles/index.html
experiments/nexus-frontier-signal-isles/src/storm-surge-relay-readiness-entry.js
experiments/_kits/nexus-frontier-signal-isles/signal-isles-storm-surge-relay-readiness-domain-kits.js
tests/signal-isles-storm-surge-relay-readiness-kits-smoke.mjs
tests/signal-isles-storm-surge-relay-cdn-state-input-smoke.mjs
.agent/turn-ledger/2026-07-09-0316-signal-isles-storm-surge-relay-upgrade.md
```

## Tests added

```txt
tests/signal-isles-storm-surge-relay-readiness-kits-smoke.mjs
tests/signal-isles-storm-surge-relay-cdn-state-input-smoke.mjs
```

## Validation results

Scratch Node validation passed before connector writes:

```txt
node --check experiments/nexus-frontier-signal-isles/src/storm-surge-relay-readiness-entry.js
node --check tests/signal-isles-storm-surge-relay-readiness-kits-smoke.mjs
node --check tests/signal-isles-storm-surge-relay-cdn-state-input-smoke.mjs
node tests/signal-isles-storm-surge-relay-readiness-kits-smoke.mjs
node tests/signal-isles-storm-surge-relay-cdn-state-input-smoke.mjs
```

Observed local outputs:

```txt
Signal Isles storm surge relay readiness kits smoke passed 10 intake cases.
Signal Isles storm surge relay CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a cloned workspace because this runtime could not resolve `github.com`. The added CDN/state/input smoke performs route/CDN checks and 10 simulated state/input cases.

## NexusRealtime import audit

Changed runtime entry imports NexusEngine main CDN:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

Changed files do not import `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main`.

The route's original `main.js` already imports NexusEngine main CDN and was not migrated in this pass because it was already compliant.

## Cleanup pass

- Did not delete or rename any Signal Isles functionality.
- Preserved the existing main runtime, composition, input adapter, and Three.js renderer.
- Added a small overlay entry that patches GameHost by composition rather than replacing existing runtime methods outright.
- Kept new reusable kit source free of renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, and frame-loop ownership.
- Added data-upgrade and cache-busted loading markers to the route shell.

## Non-game handling

`Nexus Frontier: Signal Isles` is a small experience-driven web game, so no delete/refactor/rename handling was needed.

## Next safe ledge

Move the storm surge visual overlay from a separate canvas patch into the native Signal Isles renderer descriptor pass once the renderer exposes a stable descriptor plug-in hook, while keeping all surge scoring and route choice logic in the atomic domain kit.

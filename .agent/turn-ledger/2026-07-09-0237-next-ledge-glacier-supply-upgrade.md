# 2026-07-09 02:37 ET — Next Ledge glacier supply upgrade

## Chosen experiment

`experiments/next-ledge/`

## Why it was chosen

The latest observed completed upgrade in `main` was `Living Agent Lab` via `Log Living Agent market trust upgrade`, so this run selected a different route. `Next Ledge` already had a strong grapple loop, but its newest objective pressure still leaned toward abstract readability descriptors. The best safe ledge was a mission layer that makes the climb feel like a cold-weather rescue supply run without moving reusable logic into the renderer.

## Last upgraded experiment

`experiments/living-agent-lab/`

Latest observed commit before this run:

```txt
0f11ef47421bee1882d8a2d7c1259f2955e95e86
Log Living Agent market trust upgrade
```

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import audit | NexusEngine main CDN audit |
| --- | --- | --- | --- | --- | --- |
| `experiments/peer-scene-transition/` | Story-scene orchestration route. | Short scene chain. | Scene exits, tokens, inventory, transitions. | Existing legacy naming may appear in shared loader references. | Gallery route, existing route-specific audit required before changing. |
| `experiments/vr-platformer-board/` | Floating XR platformer board. | Short platformer board. | Lane movement, jump, collectibles, hazards, comfort descriptors. | Route has legacy shared naming in some surrounding infrastructure. | Uses NexusEngine CDN in board runtime. |
| `experiments/infinite-radial-terrain/` | Radial terrain tessellation flight. | Open-ended traversal demo. | WASD flight, LOD, origin snapping, survey overlays. | Previous changed overlays avoided old runtime CDN. | Uses NexusEngine main CDN in changed overlays. |
| `experiments/high-fidelity-meadow/` | Procedural meadow composition. | Open-ended scene. | Terrain, wind, vegetation, creatures, water-management overlays. | Existing old names may remain in shared files. | Recent creek irrigation pass uses NexusEngine main CDN. |
| `experiments/tiny-diffusion-lab/` | Browser CPU diffusion proof. | Lab session. | Train, sample, checkpoints. | Not selected because it is a lab, not a small game loop. | Uses NexusEngine module concepts. |
| `experiments/living-agent-lab/` | Market trust agent lab. | Short lab loop. | ONNX/fallback agent, witness/evidence/restitution descriptors. | Last upgraded, skipped. | Latest pass uses NexusEngine main CDN checks. |
| `experiments/fogline-relay/` | First-person survey and rescue pressure. | Short objective loop. | Movement, scanning, relay repair, medical overlays. | Existing legacy names may remain outside changed passes. | Recent overlays use NexusEngine main CDN. |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer island systems route. | Short systems slice. | Scan, harvest, build, pressure, gates, beacons. | Existing legacy names may remain outside changed passes. | Recent overlays use NexusEngine main CDN. |
| `apps/the-cavalry-of-rome/` | Painterly Roman strategy visual proof. | Open-ended map inspection. | Pan, hover, dive, army descriptors. | Existing legacy naming may remain. | Recent changed pass uses NexusEngine main CDN. |
| `games/signal-bastion/` | 2.5D tower defense. | Short wave session. | Tower cards, placement, waves, hospital overlays. | Previous pass audited changed entry only. | Recent field hospital pass uses NexusEngine main CDN. |
| `games/stonewake-depths/` | Flooded cavern puzzle platformer. | Short puzzle rescue loop. | Block carry, valves, plates, rescue descriptors. | Previous pass audited changed entry only. | Recent flood rescue pass uses NexusEngine main CDN. |
| `experiments/next-ledge/` | Grapple climb route. | Short climb run. | Aim, grapple, swing, stamina, ledge route, rescue/cargo descriptors. | Changed files do not import old `LuminaryLabs-Dev/NexusRealtime@main`; shared page loader keeps legacy naming only. | This run added a new NexusEngine main CDN overlay. |
| `experiments/sora-the-infinite/` | Aerial traversal / redirect route. | Short gateway/open traversal. | Flight preview, visual domains, migration overlays. | Existing legacy names may remain outside changed pass. | Recent rookery pass uses NexusEngine main CDN. |
| `experiments/zombie-orchard/` | Survival orchard slice. | Short survival round. | Rounds, pickups, horde pressure, water restoration. | Existing legacy names may remain outside changed pass. | Recent well pass uses NexusEngine main CDN. |
| `games/rogue-lite-hellscape-siege/` | Action RPG/base siege route. | Short wave/action slice. | Portals, inventory, harvesting, building, siege pressure. | Existing legacy names may remain outside changed pass. | Earlier passes use NexusEngine main CDN checks. |

## Domain ASCII tree

```txt
next-ledge-glacier-supply-readiness-domain
├─ frost-navigation-domain
│  ├─ storm-lantern-domain
│  │  └─ next-ledge-storm-lantern-chain-kit
│  └─ crampon-rail-domain
│     └─ next-ledge-crampon-step-rail-kit
├─ cold-safety-domain
│  ├─ warmth-cache-domain
│  │  └─ next-ledge-frostbite-warmth-cache-kit
│  └─ avalanche-cornice-domain
│     └─ next-ledge-avalanche-cornice-warning-kit
├─ extraction-supply-domain
│  ├─ rescue-sled-domain
│  │  └─ next-ledge-rescue-sled-transfer-lane-kit
│  └─ summit-ledger-domain
│     └─ next-ledge-summit-supply-ledger-kit
└─ renderer-handoff
   └─ next-ledge-glacier-supply-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

```txt
next-ledge-storm-lantern-chain-kit
next-ledge-crampon-step-rail-kit
next-ledge-frostbite-warmth-cache-kit
next-ledge-avalanche-cornice-warning-kit
next-ledge-rescue-sled-transfer-lane-kit
next-ledge-summit-supply-ledger-kit
next-ledge-glacier-supply-renderer-handoff-kit
next-ledge-glacier-supply-readiness-domain-kit
```

The reusable kit file explicitly avoids renderer, DOM, browser input, Three.js, WebGL, audio, asset loading, physics, and frame-loop ownership.

## Files changed

```txt
experiments/next-ledge/index.html
experiments/next-ledge/src/glacier-supply-readiness-kits.js
experiments/next-ledge/src/glacier-supply-readiness-entry.js
experiments/_shared/nexus-gallery-data.js
tests/next-ledge-glacier-supply-readiness-kits-smoke.mjs
tests/next-ledge-glacier-supply-cdn-state-input-smoke.mjs
.agent/turn-ledger/2026-07-09-0237-next-ledge-glacier-supply-upgrade.md
```

## Tests added

```txt
tests/next-ledge-glacier-supply-readiness-kits-smoke.mjs
tests/next-ledge-glacier-supply-cdn-state-input-smoke.mjs
```

## Validation results

Scratch Node validation passed before connector writes:

```txt
node --check experiments/next-ledge/src/glacier-supply-readiness-kits.js
node --check experiments/next-ledge/src/glacier-supply-readiness-entry.js
node --check tests/next-ledge-glacier-supply-readiness-kits-smoke.mjs
node --check tests/next-ledge-glacier-supply-cdn-state-input-smoke.mjs
node tests/next-ledge-glacier-supply-readiness-kits-smoke.mjs
node tests/next-ledge-glacier-supply-cdn-state-input-smoke.mjs
```

Observed local outputs:

```txt
Next Ledge glacier supply readiness kits smoke passed 10 intake cases.
Next Ledge glacier supply CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a cloned workspace in this pass because this runtime cannot resolve `github.com` from the local sandbox. The added CDN/state test performs static route/CDN checks and 10 simulated state/input cases.

## NexusRealtime import audit

Changed files do not import `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main`. The new overlay imports:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

Existing `experiments/_shared/nexus-realtime-page-loader.js` naming remains in `index.html` because it is the current gallery/shared-loader compatibility shell. The changed runtime overlay is NexusEngine-CDN based.

## Cleanup pass

- New reusable kit logic is headless and deterministic.
- Route integration is cache-busted with `glacier-supply-readiness-1`.
- Overlay is descriptor-driven and patches `GameHost.getRendererHandoff()` without replacing older rescue-line, bivouac, or ravine evacuation handoffs.
- Gallery text was updated so the card explains the new glacier supply layer.

## Non-game handling

`Next Ledge` is a small experience-driven web game, so no delete/refactor/rename was needed.

## Next safe ledge

Add the two new Next Ledge glacier supply tests to `scripts/run-checks.mjs` after normalizing the long suite list, then render the glacier descriptors directly through the Three renderer rather than the lightweight overlay if the route needs deeper visual integration.

# 2026-07-09 04:00 ET — Fogline lighthouse battery readiness upgrade

## Chosen experiment

`experiments/fogline-relay/`

## Why it was chosen

The latest repository commits show the previous completed upgrade targeted `experiments/zombie-orchard/` with a seed bank quarantine pass, so this run selected a different route. Fogline Relay already has a strong survey/scan base, but its moment-to-moment objective layer was still mostly abstract fog traversal; the new pass adds a concrete lighthouse power-restoration objective that creates stronger visual landmarks and a clearer route-level purpose.

## Last upgraded experiment

`experiments/zombie-orchard/` — seed bank quarantine readiness pass, visible in the newest commit group:

- `fcec2214216f671ff9012963c5ec90795e40eb35` — Add Zombie Orchard seed bank quarantine kits
- `ca14a2e86ba584ac8d779ca8eb824586c94e1243` — Wire Zombie Orchard seed bank quarantine entry
- `12048ee1d9449bd501a5ef35078fb5c475b07db9` — Add Zombie Orchard seed bank CDN smoke
- `dc6275e86fb68f522cee5de960f7d954172970a1` — Route Zombie Orchard seed bank smoke coverage

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---|---:|---|---|---|
| `experiments/peer-scene-transition/` | Story-scene orchestration with scene-local state and route exits. | 2–5 min | Scene visits, inventory tokens, transition ledger. | Audit required outside this pass. | Existing overlays use NexusEngine CDN pattern. |
| `experiments/vr-platformer-board/` | Floating board platformer validation for XR pose and comfort. | 2–4 min | Lane traversal, jump, collectibles, rescue descriptors. | Audit required outside this pass. | Uses NexusEngine main CDN in route script. |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain tessellation. | 3–6 min | WASD flight, origin snapping, LOD rings. | Audit required outside this pass. | Previously upgraded toward NexusEngine CDN. |
| `experiments/high-fidelity-meadow/` | Procedural meadow composed from terrain, wind, vegetation, creature, fur, sky, VFX, and visual-target domains. | 3–8 min | Scene exploration, procedural descriptors. | Audit required outside this pass. | Previously upgraded toward NexusEngine CDN. |
| `experiments/tiny-diffusion-lab/` | Browser-host proof for CPU denoising and sample review. | 5–15 min | Train/sample/save/load, sample clinic descriptors. | Audit required outside this pass. | Sample clinic entry uses NexusEngine CDN. |
| `experiments/living-agent-lab/` | Market-agent route with ONNX/fallback action choice and trust descriptors. | 3–6 min | Agent action choice, witness/evidence/restitution loop. | Audit required outside this pass. | Market trust entry uses NexusEngine CDN. |
| `experiments/fogline-relay/` | First-person survey loop for scan targets, fog zones, timed pressure, hazards, rescue overlays, and now lighthouse power restoration. | 3–7 min | Move/look/scan/restart, fog pressure, rescue descriptors, battery restoration descriptors. | Changed files do not import old NexusRealtime runtime CDN. | New lighthouse entry imports `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`. |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer slice for scan, harvest, build, route cargo, beacon, and storm surge relay. | 5–10 min | Scan, harvest, build, evacuation relay descriptors. | Audit required outside this pass. | Storm surge pass uses NexusEngine CDN. |
| `apps/the-cavalry-of-rome/` | Painterly Roman terrain map with cinematic region/army presentation. | 3–8 min | Pannable map, hover regions, campaign logistics overlays. | Audit required outside this pass. | Recent readiness passes use NexusEngine style. |
| `games/signal-bastion/` | 2.5D tower-defense game with command and field hospital overlays. | 5–12 min | Tower placement, defense waves, evacuation/clinic descriptors. | Audit required outside this pass. | Field hospital pass uses NexusEngine CDN. |
| `games/stonewake-depths/` | Flooded cavern rescue puzzle-platformer. | 4–8 min | Block carry, valves, pressure, echo rescue. | Audit required outside this pass. | Flood rescue pass uses NexusEngine CDN. |
| `experiments/next-ledge/` | Grapple climb validation with glacier supply descriptors. | 3–6 min | Grapple/swing/climb, warmth cache, rescue-sled descriptors. | Audit required outside this pass. | Glacier supply pass uses NexusEngine CDN. |
| `experiments/sora-the-infinite/` | Open aerial traversal gateway into The Open Above with visual domains. | 2–5 min | Open flight/redirect, rookery migration descriptors. | Audit required outside this pass. | Rookery pass uses NexusEngine CDN. |
| `experiments/zombie-orchard/` | Survival slice for rounds, horde pressure, pickups, weapons, orchard content. | 4–10 min | Horde survival, scavenging, seed bank quarantine descriptors. | Last upgraded; skipped this run. | Latest seed bank pass uses NexusEngine CDN pattern. |
| `games/rogue-lite-hellscape-siege/` | Base-siege action route with harvest/build/wave-defense and refuge descriptors. | 6–15 min | Harvest, build, waves, refuge evacuation. | Audit required outside this pass. | Blood moon refuge pass uses NexusEngine CDN. |

## Domain ASCII tree

```txt
fogline-lighthouse-battery-readiness-domain
├─ power-source-domain
│  ├─ hand-crank-generator-domain
│  │  └─ fogline-hand-crank-generator-kit
│  └─ battery-cache-domain
│     └─ fogline-battery-cache-kit
├─ beam-routing-domain
│  └─ fresnel-alignment-domain
│     ├─ lens-angle-domain
│     │  └─ fogline-fresnel-alignment-kit
│     └─ fog-breach-domain
│        └─ fogline-fog-breach-window-kit
├─ evacuation-signal-domain
│  ├─ family-signal-flare-domain
│  │  └─ fogline-family-signal-flare-kit
│  └─ dawn-beam-ledger-domain
│     └─ fogline-dawn-beam-ledger-kit
└─ renderer-handoff
   └─ fogline-lighthouse-battery-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `fogline-hand-crank-generator-kit`
- `fogline-battery-cache-kit`
- `fogline-fresnel-alignment-kit`
- `fogline-fog-breach-window-kit`
- `fogline-family-signal-flare-kit`
- `fogline-dawn-beam-ledger-kit`
- `fogline-lighthouse-battery-renderer-handoff-kit`
- `fogline-lighthouse-battery-readiness-domain-kit`

## Files changed

- `experiments/fogline-relay/index.html`
- `experiments/fogline-relay/src/lighthouse-battery-readiness-kits.js`
- `experiments/fogline-relay/src/lighthouse-battery-readiness-entry.js`
- `tests/fogline-lighthouse-battery-readiness-kits-smoke.mjs`
- `tests/fogline-lighthouse-battery-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-0400-fogline-lighthouse-battery-upgrade.md`

## Tests added

- `tests/fogline-lighthouse-battery-readiness-kits-smoke.mjs`
  - 10 intake cases.
  - Validates all six atomic descriptor families.
  - Validates mission-state enum, bounded readiness, descriptor counts, serializability, and descriptor-only renderer handoff.

- `tests/fogline-lighthouse-battery-cdn-state-input-smoke.mjs`
  - 10 simulated state/input cases.
  - Validates route marker and entry loading.
  - Validates NexusEngine main CDN import.
  - Validates no old NexusRealtime CDN import in the changed entry.
  - Validates reusable kit source avoids browser/renderer primitives.

## Validation results

Scratch validation passed before connector writes:

```txt
node --check experiments/fogline-relay/src/lighthouse-battery-readiness-kits.js
node --check experiments/fogline-relay/src/lighthouse-battery-readiness-entry.js
node --check tests/fogline-lighthouse-battery-readiness-kits-smoke.mjs
node --check tests/fogline-lighthouse-battery-cdn-state-input-smoke.mjs
node tests/fogline-lighthouse-battery-readiness-kits-smoke.mjs
node tests/fogline-lighthouse-battery-cdn-state-input-smoke.mjs
```

Observed outputs:

```txt
Fogline lighthouse battery readiness kits smoke passed 10 intake cases.
Fogline lighthouse battery CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a cloned workspace because this runtime could not resolve `github.com`. The new tests are static/local `.mjs` validations and are ready to run in a normal checkout.

## NexusRealtime import audit

Changed files:

- `experiments/fogline-relay/src/lighthouse-battery-readiness-entry.js` imports NexusEngine main CDN:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

- The changed entry does not import `NexusRealtime@main` or `NexusRealtime@0.0.1`.
- The reusable kit file has no runtime/CDN import and no browser/renderer primitive ownership.
- `experiments/fogline-relay/index.html` still uses the existing route loader naming for compatibility; this pass did not change the shared loader.

## Cleanup pass

- Reusable lighthouse logic is isolated in `lighthouse-battery-readiness-kits.js`.
- The overlay entry owns only presentation-layer canvas drawing and `GameHost` composition.
- Renderer handoff remains descriptor-only.
- Existing Fogline rescue, ambulance, and clinic overlays were preserved.
- No destructive route deletion or rename occurred.

## Next safe ledge

Unify Fogline overlay composition into a small shared patch helper so each readiness entry does not repeat `composeRendererHandoff`, overlay sizing, and descriptor projection logic.

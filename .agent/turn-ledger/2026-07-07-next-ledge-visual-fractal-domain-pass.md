# 2026-07-07 Next Ledge Visual Fractal Domain Pass

## Summary

Upgraded `experiments/next-ledge/` with a visual-fractal descriptor layer while preserving the existing traversal loop and keeping `signal-bastion` as the only executable route-domain replay lane.

The prior recent visual-fractal work had already touched `zombie-orchard`, and the manifest now also records a concurrent `sora-the-infinite` / `the-open-above` visual-fractal pass. This pass intentionally selected `next-ledge` as a different route: mechanically strong, but visually lower-variance than the more content-heavy survival/strategy routes.

## Experiment inventory

| Route | Description | Gameplay length | Mechanics |
| --- | --- | ---: | --- |
| `experiments/peer-scene-transition/` | Peer HTML scene-domain validation route with lantern/forest/bridge/shrine scene exits. | ~3-6 min | Scene transitions, puzzle gates, manifest exits, debug panel. |
| `experiments/next-ledge/` | Cinematic grapple-climb validation demo using route progress and tether traversal. | ~2-5 min per sector | Click/tap/Space grapple, A/D swing, R restart, N sector advance, anchor locks, rest anchors, summit anchor. |
| `experiments/fogline-relay/` | First-person fog-forest relay route for scan/survey/zone/pressure/hazard domains. | ~4-8 min | Movement/look, hold scan, relay objectives, fog volumes, wraith pressure. |
| `experiments/nexus-frontier-signal-isles/` | Broad kit-utilization field-engineer showcase. | ~8-15 min | First-person movement/look, scan, harvest shards, build mast, pressure wave, root gate, cargo delivery, final beacon. |
| `experiments/sora-the-infinite/` | Aerial/open traversal lane redirected through Open Above visual-fractal work. | ~5-12 min | Pitch/bank/boost, terrain streaming, flock/scatter descriptors, cloud/thermal/speed visual domains. |
| `experiments/zombie-orchard/` | Kit-composed survival orchard experiment. | ~6-12 min | Move/sprint/dodge, pickups, gear use/swap, survival waves, horde pressure. |
| `games/signal-bastion/` | Strategic pressure tower-defense route with the strongest executable route-domain replay proof. | ~15-30 min authored waves; longer endless | 2.5D defense, tower placement/upgrades, waves, bosses, budget, range rings, strategic replay lane. |
| `games/rogue-lite-hellscape-siege/` | Unified rogue-lite action-defense-extraction game route. | ~10-25 min | Realm portals, inventory/materials, harvest/pickups, build blueprints, wave/core defense, FX. |

## Selection rationale

`next-ledge` was selected because:

- It is different from the already-upgraded `zombie-orchard` route.
- It has a tight but visually repeatable loop: anchors, rope, probe, cliff depth, and motion cues.
- It benefits from many small scoped visual kits without needing destructive route changes.
- It is already the first seed/harden candidate for traversal/cargo pressure, so descriptor hardening helps without overclaiming executable replay.

## Scoped domain split

```txt
next-ledge-visual-fractal-domain-kit
├─ cliff-wall-domain
│  ├─ cliff-strata-band-kit
│  │  └─ sediment-line-domain
│  ├─ cliff-crack-vein-kit
│  │  └─ fracture-spark-domain
│  └─ climb-shadow-pocket-kit
├─ anchor-readability-domain
│  ├─ anchor-aura-ring-kit
│  ├─ anchor-marker-glyph-kit
│  └─ rest-summit-beacon-kit
├─ rope-expression-domain
│  ├─ rope-braid-segment-kit
│  └─ rope-spark-knot-kit
├─ ascent-atmosphere-domain
│  ├─ cloud-wisp-strip-kit
│  ├─ moon-haze-gradient-kit
│  └─ danger-fall-streak-kit
└─ renderer descriptor handoff
   └─ no renderer, DOM, input, or runtime ownership
```

The important architectural point is that a domain is not a parent object controlling all subdomains. A cliff does not need to know the implementation details of a crack vein, and a rope does not need to know how the renderer draws braided fibers. Each kit accepts a small deterministic intake and emits a descriptor surface. The composite domain only composes the descriptors.

## Files changed

- Added `experiments/next-ledge/src/visual-fractal-kits.js`.
- Updated `experiments/next-ledge/src/session-visual-upgrade.js` to:
  - import `NexusEngine@main` via CDN for the visual engine wrapper,
  - keep the existing base session wrapper intact,
  - compose `visualFractal` descriptor output into `snapshot.domain.visualFractal`,
  - include descriptor counts and kit usage in `snapshot.domain.visualQuality`.
- Added `tests/next-ledge-visual-fractal-kits-smoke.mjs`.
- Added `tests/next-ledge-nexusengine-cdn-playwright-state-input-smoke.mjs`.
- Updated `scripts/run-checks.mjs` to wire the new smokes into full and deploy checks.
- Updated `experiments/domain-kit-cutover-manifest.json` for the Next Ledge visual-fractal descriptor pass while preserving the concurrent Open Above / Sora manifest state.

## Validation run locally in scratch workspace

```txt
node --check /mnt/data/visual-fractal-kits.js
node --check /mnt/data/session-visual-upgrade.js
node --check /mnt/data/test1.mjs
node --check /mnt/data/test2.mjs
node --check /mnt/data/run-checks-merge.mjs
node tests/next-ledge-visual-fractal-kits-smoke.mjs
node tests/next-ledge-nexusengine-cdn-playwright-state-input-smoke.mjs
```

Results:

```txt
next ledge visual fractal kits smoke passed: 70 intake cases
next ledge NexusEngine CDN playwright/state-input smoke passed: 10 intake cases
```

## Import audit note

Direct code search did not return indexed `NexusRealtime` hits, but file inspection found old imports in Next Ledge session files. This pass updated `session-visual-upgrade.js` to `LuminaryLabs-Dev/NexusEngine@main`. The deeper base `session.js` still imports the old runtime and should be migrated in a separate narrow patch because it is a 563-line route simulation file and should not be rewritten casually through a partial-file connector path.

## Cleanup pass

The cleanup pass was additive only:

- New kits were grouped under one coherent `next-ledge-visual-fractal-domain-kit` rather than scattered unrelated helpers.
- The existing parallax/render style descriptor layer remains the presentation bridge.
- The new visual kits do not own renderer, browser, DOM, input, Three.js, asset loading, or frame timing.
- No route was deleted or renamed.
- No new executable replay lane was claimed.

## Next ledge

Migrate `experiments/next-ledge/src/session.js` from the old `NexusRealtime` CDN import to `LuminaryLabs-Dev/NexusEngine@main` in a dedicated patch that fetches/replaces the full file safely and verifies the base simulation still exposes `createRealtimeGame` compatibility or uses `createRealtimeEngine/createEngine` directly.

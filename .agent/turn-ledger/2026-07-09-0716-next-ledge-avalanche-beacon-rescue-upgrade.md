# 2026-07-09 07:16 ET — Next Ledge Avalanche Beacon Rescue Upgrade

## Chosen experiment

`experiments/next-ledge/`

## Why it was chosen

The latest completed upgrade before this run was `games/stonewake-depths/`, so this run needed a different route.

Next Ledge was chosen because it is a compact grapple-climb validation route with useful movement foundations, but most of the play space still reads as traversal plus route safety overlays. The new avalanche beacon rescue pass adds a clearer emergency objective loop: locate buried signals, probe the snowfield, establish shelter, secure belay lines, deploy search teams, and track victim extraction readiness.

## Last upgraded experiment

Latest observed completed commit series before this run:

- `a81e7caefc7ebbff386216e87710de14e1b05470` — Add Stonewake cave clinic triage kits
- `064ac6d5a8395995f6b10dd5f48459aa3cd4b8bf` — Wire Stonewake cave clinic triage overlay
- `d4ed22cb5efff191c2313fcc8a11bbf922b8fecd` — Add Stonewake cave clinic triage kit smoke
- `2685eff7c0b41de9f3861e28791a613cacbfb466` — Add Stonewake cave clinic triage CDN smoke
- `b1a573ab56b86e8ca517f6eb4667ed1e487dd631` — Load Stonewake cave clinic triage pass
- `59f56cbe661948693828414bf18f5c4ba660d181` — Log Stonewake cave clinic triage upgrade

This run avoided `games/stonewake-depths/`.

## Experiment inventory

| Route | Description | Gameplay length | Mechanics | Old NexusRealtime import | NexusEngine main CDN |
|---|---|---:|---|---|---|
| `experiments/peer-scene-transition/` | Story scene transition proof | 3–8 min | scene exits, inventory tokens, route ledgers | no changed import observed | yes in added overlays |
| `experiments/vr-platformer-board/skyline-medevac.html` | Board platformer medevac route | 2–5 min | jump, coins, hazards, oxygen, medevac descriptors | no changed import observed | yes |
| `experiments/infinite-radial-terrain/` | Radial terrain flight demo | open-ended | WASD flight, origin snapping, LOD bands | no changed import observed | yes in overlays |
| `experiments/high-fidelity-meadow/` | Procedural meadow ecology scene | open-ended | terrain, wind, vegetation, ecology descriptors | no changed import observed | yes in overlays |
| `experiments/tiny-diffusion-lab/` | Browser diffusion lab | 5–15 min | train, sample, checkpoint, sample clinic | no changed import observed | yes in overlays |
| `experiments/living-agent-lab/` | Market ONNX/fallback agent route | 3–8 min | agent decisions, market trust, civic mediation | no changed import observed | yes |
| `experiments/fogline-relay/` | First-person fog survey loop | 3–8 min | scan targets, hazards, lighthouse battery | no changed import observed | yes in overlays |
| `experiments/nexus-frontier-signal-isles/` | Field engineer island systems slice | 4–10 min | scan, harvest, build, storm surge relay | no changed import observed | yes in overlays |
| `apps/the-cavalry-of-rome/` | Strategy-map visual proof | 3–8 min | pan, hover, regional army view, aqueduct sabotage | no changed import observed | yes in overlays |
| `games/signal-bastion/` | 2.5D tower-defense game | 5–12 min | tower placement, waves, upgrades, field hospital, supply convoy | old ProtoKits names in dependency URLs only | yes in `boot.js` and overlays |
| `games/stonewake-depths/` | Flooded cavern rescue platformer | 5–12 min | block carry, valves, survivor pings, extraction, cave clinic triage | no changed old runtime import observed | yes in overlays |
| `experiments/next-ledge/` | Grapple-climb avalanche rescue route | 2–5 min | grapple, ledge routes, swing pressure, glacier supply, beacon rescue | shared loader still carries NexusRealtime naming; changed entry has no old runtime import | yes in changed entry |
| `experiments/sora-the-infinite/` | Open aerial traversal redirect | open-ended | open flight, visual domains, rescue readiness | no changed import observed | yes in overlays |
| `experiments/zombie-orchard/` | Orchard survival slice | 5–10 min | rounds, pickups, weapons, seed bank quarantine | no changed import observed | yes in overlays |
| `games/rogue-lite-hellscape-siege/` | Base siege action route | 8–15 min | harvest, build, waves, ash caravan, blood moon refuge | no changed import observed | yes in overlays |
| `experiments/onnx-agent-lab/signal-calibration.html` | ONNX workshop signal calibration | 3–8 min | model handshake, fallback rail, tool cues | no changed import observed | yes |

## Domain ASCII tree

```txt
next-ledge-avalanche-beacon-rescue-readiness-domain
├─ buried-signal-domain
│  ├─ beacon-ping-domain
│  │  └─ next-ledge-beacon-ping-arc-kit
│  └─ probe-grid-domain
│     └─ next-ledge-probe-grid-flag-kit
├─ survival-shelter-domain
│  ├─ snow-cave-domain
│  │  └─ next-ledge-snow-cave-marker-kit
│  └─ rope-belay-domain
│     └─ next-ledge-rope-belay-anchor-kit
├─ extraction-command-domain
│  ├─ search-team-domain
│  │  └─ next-ledge-search-team-lantern-kit
│  └─ victim-ledger-domain
│     └─ next-ledge-avalanche-victim-ledger-kit
└─ renderer-handoff
   └─ next-ledge-avalanche-beacon-rescue-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `next-ledge-beacon-ping-arc-kit`
- `next-ledge-probe-grid-flag-kit`
- `next-ledge-snow-cave-marker-kit`
- `next-ledge-rope-belay-anchor-kit`
- `next-ledge-search-team-lantern-kit`
- `next-ledge-avalanche-victim-ledger-kit`
- `next-ledge-avalanche-beacon-rescue-renderer-handoff-kit`
- `next-ledge-avalanche-beacon-rescue-readiness-domain-kit`

No existing reusable kit was destructively changed.

## Files changed

Added:

- `experiments/next-ledge/src/avalanche-beacon-rescue-readiness-kits.js`
- `experiments/next-ledge/src/avalanche-beacon-rescue-readiness-entry.js`
- `tests/next-ledge-avalanche-beacon-rescue-readiness-kits-smoke.mjs`
- `tests/next-ledge-avalanche-beacon-rescue-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-0716-next-ledge-avalanche-beacon-rescue-upgrade.md`

Updated:

- `experiments/next-ledge/index.html`
- `experiments/_shared/nexus-gallery-data.js`

## Tests added

- `tests/next-ledge-avalanche-beacon-rescue-readiness-kits-smoke.mjs`
- `tests/next-ledge-avalanche-beacon-rescue-cdn-state-input-smoke.mjs`

Both tests use 10 intake/state cases.

## Validation results

Scratch validation passed before connector writes:

```txt
node --check experiments/next-ledge/src/avalanche-beacon-rescue-readiness-kits.js
node --check experiments/next-ledge/src/avalanche-beacon-rescue-readiness-entry.js
node --check tests/next-ledge-avalanche-beacon-rescue-readiness-kits-smoke.mjs
node --check tests/next-ledge-avalanche-beacon-rescue-cdn-state-input-smoke.mjs
node tests/next-ledge-avalanche-beacon-rescue-readiness-kits-smoke.mjs
node tests/next-ledge-avalanche-beacon-rescue-cdn-state-input-smoke.mjs
```

Observed output:

```txt
Next Ledge avalanche beacon rescue readiness kits smoke passed 10 intake cases.
Next Ledge avalanche beacon rescue CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a cloned workspace in this connector-only run. The added tests are designed to run inside the repository with Node.

## NexusRealtime import audit

Changed entry:

- `experiments/next-ledge/src/avalanche-beacon-rescue-readiness-entry.js` imports NexusEngine main via:
  - `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`
- The changed entry does not import old `NexusRealtime@` runtime.

Existing route context:

- `experiments/next-ledge/index.html` still imports the shared `nexus-realtime-page-loader.js` name. That is an existing shared-loader naming artifact, not a changed old runtime CDN import.
- The changed route now advertises `avalanche-beacon-rescue-readiness-renderer-handoff-pass`.
- No old NexusRealtime runtime import was added.

## Cleanup pass

- Reusable avalanche beacon rescue kit logic has no DOM, browser input, Three.js, WebGL, audio, asset loading, frame-loop, physics, or storage ownership.
- Renderer/DOM/canvas work is isolated to `avalanche-beacon-rescue-readiness-entry.js`.
- The new entry composes with the existing `GameHost.getRendererHandoff()` instead of replacing the base route or existing rescue-line, summit-bivouac, ravine-evacuation, and glacier-supply overlays.
- Existing Next Ledge movement, grapple, and overlay passes are preserved.
- No destructive deletion, route rename, or functionality removal was performed.

## Non-game handling

`experiments/next-ledge/` is a small playable web experiment, so no delete/refactor/rename action was needed.

## Purpose-driven commit ledger

- `a3cf775e278d2a8e2ef6ca7e5647e3cc72554a89` — Add Next Ledge avalanche beacon rescue kits
- `b161df2a13877f43030b78dd9981eb194b158351` — Wire Next Ledge avalanche beacon rescue overlay
- `061845f34fa07253703c5274a80fe240f498c33d` — Load Next Ledge avalanche beacon rescue pass
- `cf61d56833f81c05f73cb1f9a93d245be4c2785f` — Add Next Ledge avalanche beacon rescue kit smoke
- `fed1aff013ab1794772db8014290f72761a42065` — Add Next Ledge avalanche beacon rescue CDN smoke
- `8dcfa80206a42497a76fc10d1214cccffa261cb9` — Update gallery for Next Ledge avalanche beacon rescue

## Next safe ledge

Add a deterministic replay fixture that drives grapple swing, beacon lock, probe confirmation, snow-cave shelter readiness, and extraction ledger phase through the same `GameHost` surface, then pull the avalanche phase into the existing hidden HUD readout for screen-reader parity.

# 2026-07-09 07:28 ET — Hellscape Ember Well Purification Upgrade

## Chosen experiment

`games/rogue-lite-hellscape-siege/`

## Why it was chosen

The latest completed upgrade before this run was `experiments/next-ledge/`, so this run needed a different route.

`games/rogue-lite-hellscape-siege/` was chosen because it is already a playable siege loop, but its survival pressure still leans heavily on combat, harvesting, building, and stacked readiness overlays. The new ember well purification layer adds a clearer civic-survival objective inside the hellscape: scan tainted water sources, stage brimstone filters, cool them with rune loops, fill sanctified cisterns, route water bearers, and account for dawn clean-water readiness.

## Last upgraded experiment

Latest observed completed commit series before this run:

- `a3cf775e278d2a8e2ef6ca7e5647e3cc72554a89` — Add Next Ledge avalanche beacon rescue kits
- `b161df2a13877f43030b78dd9981eb194b158351` — Wire Next Ledge avalanche beacon rescue overlay
- `061845f34fa07253703c5274a80fe240f498c33d` — Load Next Ledge avalanche beacon rescue pass
- `cf61d56833f81c05f73cb1f9a93d245be4c2785f` — Add Next Ledge avalanche beacon rescue kit smoke
- `fed1aff013ab1794772db8014290f72761a42065` — Add Next Ledge avalanche beacon rescue CDN smoke
- `8dcfa80206a42497a76fc10d1214cccffa261cb9` — Update gallery for Next Ledge avalanche beacon rescue
- `c8de8b37ee0b10e728cf42bd7cc08910b0fca2f5` — Log Next Ledge avalanche beacon rescue upgrade

This run avoided `experiments/next-ledge/`.

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
| `games/stonewake-depths/` | Flooded cavern rescue platformer | 5–12 min | block carry, valves, survivor pings, cave clinic triage | no changed old runtime import observed | yes in overlays |
| `experiments/next-ledge/` | Grapple-climb avalanche rescue route | 2–5 min | grapple, ledge routes, swing pressure, glacier supply, beacon rescue | shared loader still carries NexusRealtime naming | yes in changed entry |
| `experiments/sora-the-infinite/` | Open aerial traversal redirect/gateway | open-ended | route preview, flight gates, rescue/logistics descriptors | no changed import observed | yes in overlays |
| `experiments/zombie-orchard/` | Orchard survival slice | 5–10 min | rounds, pickups, weapons, quarantine/recovery overlays | no changed import observed | yes in overlays |
| `games/rogue-lite-hellscape-siege/` | Base siege action route | 8–15 min | harvest, build, waves, ash caravan, forge, blood moon refuge, ember well purification | shared loader still carries NexusRealtime naming | yes in `main.js` and changed entry |
| `experiments/onnx-agent-lab/signal-calibration.html` | ONNX workshop signal calibration | 3–8 min | model handshake, fallback rail, tool cues | no changed import observed | yes |

## Domain ASCII tree

```txt
hellscape-ember-well-purification-readiness-domain
├─ water-source-domain
│  ├─ ash-well-scan-domain
│  │  └─ hellscape-ash-well-scan-kit
│  └─ brimstone-filter-domain
│     └─ hellscape-brimstone-filter-kit
├─ purification-chain-domain
│  ├─ coolant-rune-domain
│  │  └─ hellscape-coolant-rune-loop-kit
│  └─ sanctified-cistern-domain
│     └─ hellscape-sanctified-cistern-kit
├─ survivor-relief-domain
│  ├─ water-bearer-route-domain
│  │  └─ hellscape-water-bearer-route-kit
│  └─ dawn-purification-ledger-domain
│     └─ hellscape-dawn-purification-ledger-kit
└─ renderer-handoff
   └─ hellscape-ember-well-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `hellscape-ash-well-scan-kit`
- `hellscape-brimstone-filter-kit`
- `hellscape-coolant-rune-loop-kit`
- `hellscape-sanctified-cistern-kit`
- `hellscape-water-bearer-route-kit`
- `hellscape-dawn-purification-ledger-kit`
- `hellscape-ember-well-renderer-handoff-kit`
- `hellscape-ember-well-purification-readiness-domain-kit`

No existing reusable kit was destructively changed.

## Files changed

Added:

- `games/rogue-lite-hellscape-siege/src/hellscape-ember-well-purification-readiness-domain-kit.js`
- `games/rogue-lite-hellscape-siege/src/hellscape-ember-well-purification-readiness-entry.js`
- `tests/hellscape-ember-well-purification-readiness-kits-smoke.mjs`
- `tests/hellscape-ember-well-purification-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-0728-hellscape-ember-well-purification-upgrade.md`

Updated:

- `games/rogue-lite-hellscape-siege/index.html`
- `experiments/_shared/nexus-gallery-data.js`

## Tests added

- `tests/hellscape-ember-well-purification-readiness-kits-smoke.mjs`
- `tests/hellscape-ember-well-purification-cdn-state-input-smoke.mjs`

Both tests use 10 intake/state cases.

## Validation results

Scratch validation passed before connector writes:

```txt
node --check games/rogue-lite-hellscape-siege/src/hellscape-ember-well-purification-readiness-domain-kit.js
node --check games/rogue-lite-hellscape-siege/src/hellscape-ember-well-purification-readiness-entry.js
node --check tests/hellscape-ember-well-purification-readiness-kits-smoke.mjs
node --check tests/hellscape-ember-well-purification-cdn-state-input-smoke.mjs
node tests/hellscape-ember-well-purification-readiness-kits-smoke.mjs
node tests/hellscape-ember-well-purification-cdn-state-input-smoke.mjs
```

Observed output:

```txt
Hellscape ember well purification readiness kits smoke passed 10 intake cases.
Hellscape ember well purification CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a cloned workspace in this connector-only run. The local shell still cannot resolve `github.com`, so validation was performed with scratch Node files before connector writes.

## NexusRealtime import audit

Changed entry:

- `games/rogue-lite-hellscape-siege/src/hellscape-ember-well-purification-readiness-entry.js` imports NexusEngine main via:
  - `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`
- The changed entry does not import old `NexusRealtime@` runtime.

Existing route context:

- `games/rogue-lite-hellscape-siege/index.html` still imports the shared `nexus-realtime-page-loader.js` by name. That is an existing shared-loader naming artifact, not a changed old runtime CDN import.
- `games/rogue-lite-hellscape-siege/src/main.js` already imports NexusEngine main CDN.
- No old NexusRealtime runtime import was added.

## Cleanup pass

- Reusable ember well purification kit logic has no DOM, browser input, Three.js, WebGL, audio, asset loading, frame-loop, physics, or storage ownership.
- Renderer/DOM overlay work is isolated to `hellscape-ember-well-purification-readiness-entry.js`.
- The new entry composes with the existing `GameHost.getRendererHandoff()` instead of replacing the base route or the ash caravan, sanctuary forge, and blood moon refuge overlays.
- Existing movement, harvesting, building, waves, and refuge functionality are preserved.
- No destructive deletion, route rename, or functionality removal was performed.

## Non-game handling

`games/rogue-lite-hellscape-siege/` is a small playable web game, so no delete/refactor/rename action was needed.

## Purpose-driven commit ledger

- `7e085ad3a648497757ac29dd54986b294a3afdf7` — Add Hellscape ember well purification kits
- `1dc602f92d9f955f5403fea3777860415b43d1c6` — Wire Hellscape ember well purification overlay
- `915ed9000bee35b690a9d5dc6f60e3c5d89a0331` — Load Hellscape ember well purification pass
- `363ab94cb0cea86379cbbf1c678597c80290d927` — Add Hellscape ember well purification kit smoke
- `666bf64bed5bdbc2fcebb1debe173da99f3ebafa` — Add Hellscape ember well purification CDN smoke
- `bd3b5443d460cd47a49a2ea09b94e2d1b1f6c70f` — Update gallery for Hellscape ember well purification

## Next safe ledge

Pull the ember well descriptors into the canvas renderer as translucent map markers so the purified cisterns, water bearer routes, and ash well scan zones appear inside the world, while keeping the route renderer descriptor-only and the kit layer headless.

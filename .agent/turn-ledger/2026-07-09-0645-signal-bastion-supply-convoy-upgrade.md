# 2026-07-09 06:45 ET — Signal Bastion Supply Convoy Upgrade

## Chosen experiment

`games/signal-bastion/`

## Why it was chosen

Signal Bastion already had a functional 2.5D tower-defense loop, but it was still mostly about placing towers and surviving waves. The route had room for a more purpose-driven logistics layer that could make the same board feel less static without putting reusable logic into the canvas renderer.

This run adds a renderer-neutral supply convoy readiness domain: ammo cache pallets, ration/water crates, forward convoy lanes, ambush watch arcs, repair crew routes, and a night quartermaster ledger.

## Last upgraded experiment

Latest observed commit series before this run was the Living Agent Lab civic festival mediation pass:

- `ba76588aac78e2798c92ab8f848beb06a18efc42` — Add Living Agent civic festival mediation kits
- `e229f8e5eccf3844a8e6c057ff9e82ac8d639c45` — Add Living Agent civic festival mediation entry
- `e8aed59d94c4a8171c41eb9461e70784b596a7b5` — Add Living Agent civic festival kit smoke
- `2366f29267b42c449c968a9930f2c29b6e5466c2` — Add Living Agent civic festival CDN smoke
- `ed38d4949ca3e8fefe627c5d1a66e6634fc1fffb` — Load Living Agent civic festival pass
- `8c217dc8148cb62a0de9b37ae038d0593cb8f7a6` — Update gallery for Living Agent civic festival

This run avoided `experiments/living-agent-lab/`.

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
| `games/signal-bastion/` | 2.5D tower-defense game | 5–12 min | tower placement, waves, upgrades, hospital/evacuation, now supply convoy | old ProtoKits names in dependency URLs only | yes in `boot.js` and new entry |
| `games/stonewake-depths/` | Flooded cavern rescue platformer | 5–12 min | block carry, valves, survivor pings, extraction | no changed import observed | yes in overlays |
| `experiments/next-ledge/` | Grapple ledge validation | 2–5 min | grapple, ledge routes, glacier supply | no changed import observed | yes in overlays |
| `experiments/sora-the-infinite/` | Open aerial traversal redirect | open-ended | open flight, visual domains, rescue readiness | no changed import observed | yes in overlays |
| `experiments/zombie-orchard/` | Orchard survival slice | 5–10 min | rounds, pickups, weapons, seed bank quarantine | no changed import observed | yes in overlays |
| `games/rogue-lite-hellscape-siege/` | Base siege action route | 8–15 min | harvest, build, waves, refuge readiness | no changed import observed | yes in overlays |
| `experiments/onnx-agent-lab/signal-calibration.html` | ONNX workshop signal calibration | 3–8 min | model handshake, fallback rail, tool cues | no changed import observed | yes |

## Domain ASCII tree

```txt
signal-bastion-supply-convoy-readiness-domain
├─ supply-intake-domain
│  ├─ ammo-cache-domain
│  │  └─ bastion-ammo-cache-pallet-kit
│  └─ ration-water-domain
│     └─ bastion-ration-water-crate-kit
├─ route-security-domain
│  ├─ convoy-lane-domain
│  │  └─ bastion-forward-convoy-lane-kit
│  └─ ambush-watch-domain
│     └─ bastion-ambush-watchtower-kit
├─ resupply-handoff-domain
│  ├─ repair-crew-domain
│  │  └─ bastion-repair-crew-route-kit
│  └─ night-quartermaster-ledger-domain
│     └─ bastion-night-quartermaster-ledger-kit
└─ renderer-handoff
   └─ bastion-supply-convoy-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `bastion-ammo-cache-pallet-kit`
- `bastion-ration-water-crate-kit`
- `bastion-forward-convoy-lane-kit`
- `bastion-ambush-watchtower-kit`
- `bastion-repair-crew-route-kit`
- `bastion-night-quartermaster-ledger-kit`
- `bastion-supply-convoy-renderer-handoff-kit`
- `signal-bastion-supply-convoy-readiness-domain-kit`

No existing reusable kit was destructively changed.

## Files changed

Added:

- `games/signal-bastion/src/signal-bastion-supply-convoy-readiness-domain-kit.js`
- `games/signal-bastion/src/signal-bastion-supply-convoy-readiness-entry.js`
- `tests/signal-bastion-supply-convoy-readiness-kits-smoke.mjs`
- `tests/signal-bastion-supply-convoy-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-0645-signal-bastion-supply-convoy-upgrade.md`

Updated:

- `games/signal-bastion/index.html`
- `experiments/_shared/nexus-gallery-data.js`

## Tests added

- `tests/signal-bastion-supply-convoy-readiness-kits-smoke.mjs`
- `tests/signal-bastion-supply-convoy-cdn-state-input-smoke.mjs`

Each test uses 10 intake/state cases.

## Validation results

Scratch validation passed before connector writes:

```txt
node --check games/signal-bastion/src/signal-bastion-supply-convoy-readiness-domain-kit.js
node --check games/signal-bastion/src/signal-bastion-supply-convoy-readiness-entry.js
node --check tests/signal-bastion-supply-convoy-readiness-kits-smoke.mjs
node --check tests/signal-bastion-supply-convoy-cdn-state-input-smoke.mjs
node tests/signal-bastion-supply-convoy-readiness-kits-smoke.mjs
node tests/signal-bastion-supply-convoy-cdn-state-input-smoke.mjs
```

Observed output:

```txt
Signal Bastion supply convoy readiness kits smoke passed 10 intake cases.
Signal Bastion supply convoy CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a cloned workspace in this connector-only run. The added tests are designed to run in the repo with Node.

## NexusRealtime import audit

Changed entry:

- `games/signal-bastion/src/signal-bastion-supply-convoy-readiness-entry.js` imports NexusEngine main via:
  - `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`
- The changed entry does not import old `NexusRealtime@` runtime.

Existing `games/signal-bastion/src/boot.js` still references ProtoKits URLs with `NexusRealtime-ProtoKits` in the repository name. This is not the old runtime import, but it remains legacy naming debt outside this pass.

## Cleanup pass

- New reusable kit logic has no DOM, browser input, Three.js, WebGL, audio, asset loading, frame-loop, or physics ownership.
- The entry patch composes with existing `GameHost` accessors instead of replacing the base boot path.
- Existing reconstruction and field-hospital passes are preserved.
- Gallery metadata was updated to surface the new supply-convoy objective.

## Non-game handling

`games/signal-bastion/` is already a small playable route, so no deletion, refactor, or rename was needed.

## Next safe ledge

Make the canvas renderer expose a compact supply convoy HUD row from descriptor summaries, or move Signal Bastion's remaining bridge/protokit URLs toward cleaner NexusEngine-named package boundaries without disrupting the existing defense DSK bridge.

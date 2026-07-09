# 2026-07-09 07:46 ET — Stonewake Pressure Lock Pump Upgrade

## Chosen experiment

`games/stonewake-depths/`

## Why it was chosen

The latest completed upgrade before this run was `games/rogue-lite-hellscape-siege/`, so this run needed a different route.

`games/stonewake-depths/` was chosen because it is already a small playable web game, but it still benefits from a clearer second-to-second flood infrastructure objective. The new pressure lock pump layer adds a readable hydraulic route over the existing block, plate, valve, water, and exit loop: stage pressure wheels, pull pump chains, mark chalk depth lines, find bellows air pockets, relay carbide lamps, and account for lockmaster readiness before the chamber floods.

## Last upgraded experiment

Latest observed completed commit before this run:

- `4fe1af848919877441a200bcd904e69067caf7d6` — Log Hellscape ember well purification upgrade

This run avoided `games/rogue-lite-hellscape-siege/`.

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
| `games/signal-bastion/` | 2.5D tower-defense game | 5–12 min | tower placement, waves, field hospital, supply convoy | old ProtoKits names in dependency URLs only | yes in `boot.js` and overlays |
| `games/stonewake-depths/` | Flooded cavern rescue platformer | 5–12 min | block carry, valves, survivor pings, cave clinic triage, pressure lock pump route | no changed old runtime import observed | yes in overlays |
| `experiments/next-ledge/` | Grapple-climb avalanche rescue route | 2–5 min | grapple, ledge routes, swing pressure, glacier supply, beacon rescue | shared loader still carries NexusRealtime naming | yes in changed entry |
| `experiments/sora-the-infinite/` | Open aerial traversal redirect/gateway | open-ended | route preview, flight gates, rescue/logistics descriptors | no changed import observed | yes in overlays |
| `experiments/zombie-orchard/` | Orchard survival slice | 5–10 min | rounds, pickups, weapons, quarantine/recovery overlays | no changed import observed | yes in overlays |
| `games/rogue-lite-hellscape-siege/` | Base siege action route | 8–15 min | harvest, build, waves, ash caravan, forge, blood moon refuge, ember well purification | shared loader still carries NexusRealtime naming | yes in `main.js` and changed entry |
| `experiments/onnx-agent-lab/signal-calibration.html` | ONNX workshop signal calibration | 3–8 min | model handshake, fallback rail, tool cues | no changed import observed | yes |

## Domain ASCII tree

```txt
stonewake-pressure-lock-pump-readiness-domain
├─ hydraulic-control-domain
│  ├─ pressure-gate-domain
│  │  └─ stonewake-pressure-gate-wheel-kit
│  └─ pump-chain-domain
│     └─ stonewake-pump-chain-tension-kit
├─ air-pocket-routing-domain
│  ├─ bellows-air-pocket-domain
│  │  └─ stonewake-bellows-air-pocket-kit
│  └─ chalk-depth-marker-domain
│     └─ stonewake-chalk-depth-marker-kit
├─ rescue-power-handoff-domain
│  ├─ carbide-lamp-relay-domain
│  │  └─ stonewake-carbide-lamp-relay-kit
│  └─ lockmaster-ledger-domain
│     └─ stonewake-lockmaster-ledger-kit
└─ renderer-handoff
   └─ stonewake-pressure-lock-pump-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `stonewake-pressure-gate-wheel-kit`
- `stonewake-pump-chain-tension-kit`
- `stonewake-bellows-air-pocket-kit`
- `stonewake-chalk-depth-marker-kit`
- `stonewake-carbide-lamp-relay-kit`
- `stonewake-lockmaster-ledger-kit`
- `stonewake-pressure-lock-pump-renderer-handoff-kit`
- `stonewake-pressure-lock-pump-readiness-domain-kit`

No existing reusable kit was destructively changed.

## Files changed

Added:

- `games/stonewake-depths/stonewake-pressure-lock-pump-kits.js`
- `games/stonewake-depths/stonewake-pressure-lock-pump-entry.js`
- `tests/stonewake-pressure-lock-pump-readiness-kits-smoke.mjs`
- `tests/stonewake-pressure-lock-pump-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-0746-stonewake-pressure-lock-pump-upgrade.md`

Updated:

- `games/stonewake-depths/index.html`
- `experiments/_shared/nexus-gallery-data.js`

## Tests added

- `tests/stonewake-pressure-lock-pump-readiness-kits-smoke.mjs`
- `tests/stonewake-pressure-lock-pump-cdn-state-input-smoke.mjs`

Both tests use 10 intake/state cases.

## Validation results

Scratch validation passed before connector writes:

```txt
node --check games/stonewake-depths/stonewake-pressure-lock-pump-kits.js
node --check games/stonewake-depths/stonewake-pressure-lock-pump-entry.js
node --check tests/stonewake-pressure-lock-pump-readiness-kits-smoke.mjs
node --check tests/stonewake-pressure-lock-pump-cdn-state-input-smoke.mjs
node tests/stonewake-pressure-lock-pump-readiness-kits-smoke.mjs
node tests/stonewake-pressure-lock-pump-cdn-state-input-smoke.mjs
```

Observed output:

```txt
Stonewake pressure lock pump readiness kits smoke passed 10 intake cases.
Stonewake pressure lock pump CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a cloned workspace in this connector-only run. Validation was performed with scratch Node files before connector writes.

## NexusRealtime import audit

Changed entry:

- `games/stonewake-depths/stonewake-pressure-lock-pump-entry.js` imports NexusEngine main via:
  - `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`
- The changed entry does not import old `NexusRealtime@` runtime.

Existing route context:

- `games/stonewake-depths/index.html` still loads existing Stonewake base and prior overlay scripts.
- `stonewake-rescue-readiness-entry.js` and `stonewake-cave-clinic-triage-entry.js` remain in place.
- No old NexusRealtime runtime import was added.

## Cleanup pass

- Reusable pressure lock pump kit logic has no DOM, browser input, Three.js, WebGL, audio, asset loading, frame-loop, physics, or storage ownership.
- Renderer/DOM overlay work is isolated to `stonewake-pressure-lock-pump-entry.js`.
- The new entry composes with the existing `GameHost.getRendererHandoff()` instead of replacing the base route or the existing flood rescue and cave clinic overlays.
- Existing movement, carrying, plate, valve, door, water, clinic, and rescue functionality are preserved.
- No destructive deletion, route rename, or functionality removal was performed.

## Non-game handling

`games/stonewake-depths/` is a small playable web game, so no delete/refactor/rename action was needed.

## Purpose-driven commit ledger

- `f12785fc5ea536b6956dff2b3ac4591c6aa84189` — Add Stonewake pressure lock pump kits
- `9997398c6e5efcac1c7bf3be68846edecf3e3369` — Wire Stonewake pressure lock pump overlay
- `745169919edf6cdf483e5ab909b06bb370a66d77` — Add Stonewake pressure lock pump kit smoke
- `be9f6094c9a4785e4e00bb6c5b32db9f1da9cea2` — Add Stonewake pressure lock pump CDN smoke
- `2b1898c5490592a4d3759d67335e4c3f5693d50e` — Load Stonewake pressure lock pump pass
- `b6dc007fb595047b6c0ee24a926247d5630f17f1` — Update gallery for Stonewake pressure lock pump

## Next safe ledge

Pull the pressure lock descriptors into the core Stonewake canvas renderer as richer physical props, especially waterline chalk marks, chain pulleys, and glowing air-pocket bells, while keeping the kit layer descriptor-only and headless.

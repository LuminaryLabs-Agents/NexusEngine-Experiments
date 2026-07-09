# 2026-07-09 06:58 ET — Stonewake Cave Clinic Triage Upgrade

## Chosen experiment

`games/stonewake-depths/`

## Why it was chosen

The latest completed upgrade before this run was `games/signal-bastion/`, so this run needed a different route.

Stonewake Depths was chosen because it was already playable, but most of its higher-order objective space still focused on escape mechanics: carry the block, prime the valve, wake the plate, and open the gate. It had good foundations but less procedural mission variety than stronger routes. The new cave clinic pass adds an explicit medical rescue layer that makes the same generated cavern read as a triage route rather than only a platform puzzle.

## Last upgraded experiment

Latest observed completed commit series before this run:

- `8f7ba64321df8ad6a87b71874b3bc3f7c9029bb3` — Add Signal Bastion supply convoy kits
- `5bf0cac84a948fc1d9fdb939ab64e67bf29c4c3d` — Load Signal Bastion supply convoy pass
- `cf1cc84d942e225a72774ed400f3fd9271120c72` — Add Signal Bastion supply convoy kit smoke
- `e1ad9a7dd9d41a09b9b2745daed7216bed22a7bc` — Add Signal Bastion supply convoy CDN smoke
- `2179c6aed7a9b7d71b22d460294c42621aaf34b0` — Wire Signal Bastion supply convoy route
- `135b7cd614b0ea73c509b6f63c323eee8e704151` — Update gallery for Signal Bastion supply convoy
- `faea3eaa18e7f1daca3ae6be15c6ff59f2ddabab` — Log Signal Bastion supply convoy upgrade

This run avoided `games/signal-bastion/`.

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
| `experiments/next-ledge/` | Grapple ledge validation | 2–5 min | grapple, ledge routes, glacier supply | shared loader still carries NexusRealtime naming; changed files none | yes in overlays |
| `experiments/sora-the-infinite/` | Open aerial traversal redirect | open-ended | open flight, visual domains, rescue readiness | no changed import observed | yes in overlays |
| `experiments/zombie-orchard/` | Orchard survival slice | 5–10 min | rounds, pickups, weapons, seed bank quarantine | no changed import observed | yes in overlays |
| `games/rogue-lite-hellscape-siege/` | Base siege action route | 8–15 min | harvest, build, waves, refuge readiness | no changed import observed | yes in overlays |
| `experiments/onnx-agent-lab/signal-calibration.html` | ONNX workshop signal calibration | 3–8 min | model handshake, fallback rail, tool cues | no changed import observed | yes |

## Domain ASCII tree

```txt
stonewake-cave-clinic-triage-readiness-domain
├─ patient-stabilization-domain
│  ├─ thermal-blanket-domain
│  │  └─ stonewake-thermal-blanket-cache-kit
│  └─ splint-stretcher-domain
│     └─ stonewake-splint-stretcher-route-kit
├─ cave-infrastructure-domain
│  ├─ glowworm-lantern-domain
│  │  └─ stonewake-glowworm-lantern-string-kit
│  └─ sump-pump-domain
│     └─ stonewake-sump-pump-prime-kit
├─ extraction-accounting-domain
│  ├─ medic-triage-domain
│  │  └─ stonewake-medic-triage-card-kit
│  └─ evacuation-stretcher-ledger-domain
│     └─ stonewake-evacuation-stretcher-ledger-kit
└─ renderer-handoff
   └─ stonewake-cave-clinic-triage-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `stonewake-thermal-blanket-cache-kit`
- `stonewake-splint-stretcher-route-kit`
- `stonewake-glowworm-lantern-string-kit`
- `stonewake-sump-pump-prime-kit`
- `stonewake-medic-triage-card-kit`
- `stonewake-evacuation-stretcher-ledger-kit`
- `stonewake-cave-clinic-triage-renderer-handoff-kit`
- `stonewake-cave-clinic-triage-readiness-domain-kit`

No existing reusable kit was destructively changed.

## Files changed

Added:

- `games/stonewake-depths/stonewake-cave-clinic-triage-kits.js`
- `games/stonewake-depths/stonewake-cave-clinic-triage-entry.js`
- `tests/stonewake-cave-clinic-triage-readiness-kits-smoke.mjs`
- `tests/stonewake-cave-clinic-triage-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-0658-stonewake-cave-clinic-triage-upgrade.md`

Updated:

- `games/stonewake-depths/index.html`

## Tests added

- `tests/stonewake-cave-clinic-triage-readiness-kits-smoke.mjs`
- `tests/stonewake-cave-clinic-triage-cdn-state-input-smoke.mjs`

Both tests use 10 intake/state cases.

## Validation results

Scratch validation passed before connector writes:

```txt
node --check games/stonewake-depths/stonewake-cave-clinic-triage-kits.js
node --check games/stonewake-depths/stonewake-cave-clinic-triage-entry.js
node --check tests/stonewake-cave-clinic-triage-readiness-kits-smoke.mjs
node --check tests/stonewake-cave-clinic-triage-cdn-state-input-smoke.mjs
node tests/stonewake-cave-clinic-triage-readiness-kits-smoke.mjs
node tests/stonewake-cave-clinic-triage-cdn-state-input-smoke.mjs
```

Observed output:

```txt
Stonewake cave clinic triage readiness kits smoke passed 10 intake cases.
Stonewake cave clinic triage CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a cloned workspace in this connector-only run. The added tests are designed to run inside the repository with Node.

## NexusRealtime import audit

Changed entry:

- `games/stonewake-depths/stonewake-cave-clinic-triage-entry.js` imports NexusEngine main via:
  - `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`
- The changed entry does not import old `NexusRealtime@` runtime.

Existing route context:

- `games/stonewake-depths/index.html` now loads the cave clinic pass after the existing flood rescue pass.
- No old NexusRealtime runtime import was added.

## Cleanup pass

- Reusable cave clinic kit logic has no DOM, browser input, Three.js, WebGL, audio, asset loading, frame-loop, physics, or storage ownership.
- Renderer/DOM/canvas work is isolated to `stonewake-cave-clinic-triage-entry.js`.
- The new entry composes with the existing `GameHost.getRendererHandoff()` instead of replacing the base boot path or the flood rescue overlay.
- Existing flood rescue descriptors are preserved.
- No destructive deletion, route rename, or functionality removal was performed.

## Non-game handling

`games/stonewake-depths/` is already a small playable web game, so no delete/refactor/rename action was needed.

## Next safe ledge

Move the new cave clinic descriptor summary into the main Stonewake HUD and add a small deterministic replay fixture that drives block carry, valve priming, plate engagement, and stretcher extraction readiness through the same `GameHost` surface.

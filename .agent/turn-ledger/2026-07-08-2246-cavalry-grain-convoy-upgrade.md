# 2026-07-08 22:46 — Cavalry grain convoy upgrade

## Summary

Upgraded `apps/the-cavalry-of-rome/` and `experiments/The Cavalry of Rome/` with a new renderer-neutral grain convoy readiness layer. The pass adds granary pressure, mule cart routes, ambush risk, bridge repair crews, legion ration priorities, civilian market relief, a descriptor-only overlay, 10-case kit smoke validation, 10-case CDN/state-input validation, manifest registration, and routed smoke coverage.

## Chosen experiment

`the-cavalry-of-rome`

Canonical route:

```txt
apps/the-cavalry-of-rome/
```

Experiment mirror:

```txt
experiments/The Cavalry of Rome/
```

## Why it was chosen

The latest observed upgrade sequence was `nexus-frontier-signal-isles` / Signal Isles lighthouse evacuation, so this run needed a different route. Cavalry of Rome was a strong candidate because it still behaves primarily like a painterly tactical visual proof with panning, hover, selection, and campaign-readiness overlays, rather than a tight small web-game loop with concrete supply pressure. The grain convoy layer gives the campaign map an objective readable logistics problem: feed front lines, protect mule carts, repair bridges, and relieve neutral markets.

## Last upgraded experiment

Latest commit search before this run showed the freshest route work as Signal Isles lighthouse evacuation:

```txt
4983c8cd1d4601d4a95fbaa45da4c6a0729a7922 Route Signal Isles lighthouse evacuation smoke
```

This run did not repeat that experiment.

## Experiment inventory

| Route | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import? | NexusEngine main CDN? |
| --- | --- | --- | --- | --- | --- |
| `experiments/peer-scene-transition/` | Story-scene orchestration proof with scene state, puzzle tokens, route gates, debug ledger. | 3-8 min | Scene choices, inventory, transitions, small token puzzles. | No changed-runtime old import observed in manifest. | Yes, through browser host overlays. |
| `experiments/vr-platformer-board/` | Floating platformer board validation. | 2-5 min | A/D movement, jump, coins, hazards, exit, rescue descriptors. | No changed-runtime old import observed in manifest. | Yes. |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain tessellation. | 3-6 min | WASD flight, radial LOD, survey/basecamp descriptors. | No changed-runtime old import observed in manifest. | Yes. |
| `experiments/high-fidelity-meadow/` | Procedural meadow scene with terrain, vegetation, animals, and ecology descriptors. | 2-6 min | Explore/readability only; stewardship overlays. | No changed-runtime old import observed in manifest. | Yes. |
| `experiments/tiny-diffusion-lab/` | Browser-host proof for tiny CPU diffusion. | 5-15 min | Train, sample, checkpoint, review readiness descriptors. | No changed-runtime old import observed in gallery metadata. | Yes in changed training-mission overlay. |
| `experiments/fogline-relay/` | First-person fog survey loop. | 5-10 min | Move, scan, relay, fog pressure, rescue/recovery descriptors. | No changed-runtime old import observed in manifest. | Yes. |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer slice. | 8-15 min | Scan, harvest, build, pressure gates, cargo, beacon. | No changed-runtime old import observed in manifest. | Yes. |
| `apps/the-cavalry-of-rome/` | Painterly Roman campaign/tactical visual proof. | 4-10 min | Pan, hover, select, campaign logistics, orders, hospital, grain convoy. | No changed-runtime old import observed in changed files. | Yes in new pass. |
| `games/signal-bastion/` | 2.5D tower defense. | 10-20 min | Place towers, waves, tactics, evacuation/reconstruction descriptors. | No changed-runtime old import observed in manifest. | Yes. |
| `experiments/next-ledge/` | Grapple-climb validation. | 3-8 min | Grapple, swing, ledges, cargo, rescue/bivouac descriptors. | No changed-runtime old import observed in manifest. | Yes. |
| `experiments/sora-the-infinite/` | Route-preview/open-flight gateway. | 1-3 min | Route preview, launch readiness, flightplan, sky rescue/lighthouse descriptors. | No changed-runtime old import observed in manifest. | Yes. |
| `experiments/zombie-orchard/` | Survival pressure slice. | 5-12 min | Move, collect, rounds, horde pressure, crafting/evacuation descriptors. | No changed-runtime old import observed in manifest. | Yes. |
| `games/rogue-lite-hellscape-siege/` | Action/base siege route. | 8-18 min | Harvest, build, inventory, defense, caravans/contracts. | No changed-runtime old import observed in manifest. | Yes. |

## Domain ASCII tree

```txt
cavalry-grain-convoy-readiness-domain
├─ supply-origin-domain
│  ├─ granary-stockpile-domain
│  │  └─ cavalry-granary-stockpile-pressure-kit
│  └─ mule-cart-route-domain
│     └─ cavalry-mule-cart-route-kit
├─ road-security-domain
│  ├─ ambush-risk-domain
│  │  └─ cavalry-road-ambush-risk-kit
│  └─ bridge-repair-domain
│     └─ cavalry-bridge-repair-crew-kit
├─ relief-handoff-domain
│  ├─ legion-ration-domain
│  │  └─ cavalry-legion-ration-priority-kit
│  └─ civilian-market-domain
│     └─ cavalry-civilian-market-relief-kit
└─ renderer-handoff
   └─ cavalry-grain-convoy-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added

```txt
cavalry-granary-stockpile-pressure-kit
cavalry-mule-cart-route-kit
cavalry-road-ambush-risk-kit
cavalry-bridge-repair-crew-kit
cavalry-legion-ration-priority-kit
cavalry-civilian-market-relief-kit
cavalry-grain-convoy-renderer-handoff-kit
cavalry-grain-convoy-readiness-domain-kit
```

## Files changed

```txt
experiments/The Cavalry of Rome/src/cavalry-grain-convoy-readiness-domain-kit.js
experiments/The Cavalry of Rome/src/cavalry-grain-convoy-readiness-pass.js
experiments/The Cavalry of Rome/index.html
apps/the-cavalry-of-rome/index.html
tests/cavalry-grain-convoy-readiness-kits-smoke.mjs
tests/cavalry-grain-convoy-cdn-state-input-smoke.mjs
tests/cavalry-campaign-fractal-cdn-state-input-smoke.mjs
experiments/domain-kit-cutover-manifest.json
.agent/turn-ledger/2026-07-08-2246-cavalry-grain-convoy-upgrade.md
```

## Tests added

```txt
tests/cavalry-grain-convoy-readiness-kits-smoke.mjs
tests/cavalry-grain-convoy-cdn-state-input-smoke.mjs
```

Both new tests use 10 intake cases.

## Validation results

Scratch validation performed before connector push:

```txt
node --check cavalry-grain-convoy-readiness-domain-kit.js
node --check cavalry-grain-convoy-readiness-pass.js
node --check cavalry-grain-convoy-readiness-kits-smoke.mjs
node --check cavalry-grain-convoy-cdn-state-input-smoke.mjs
node tests/cavalry-grain-convoy-readiness-kits-smoke.mjs
node tests/cavalry-grain-convoy-cdn-state-input-smoke.mjs
```

Observed scratch outcomes:

```txt
Cavalry grain convoy readiness kit smoke passed.
Cavalry grain convoy CDN/state-input smoke passed.
```

Full repo `npm run check`, `npm run check:deploy`, and browser Playwright were not run from a cloned workspace because the sandbox could not resolve `github.com`. Connector writes succeeded directly against `LuminaryLabs-Agents/NexusEngine-Experiments` on `main`.

## NexusRealtime import audit

Changed runtime file:

```txt
experiments/The Cavalry of Rome/src/cavalry-grain-convoy-readiness-pass.js
```

Uses NexusEngine main CDN:

```txt
https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js
```

No changed file intentionally imports:

```txt
LuminaryLabs-Dev/NexusRealtime@main
```

## Cleanup pass

- Kept the reusable grain convoy kit free of DOM, renderer, Three.js, WebGL, audio, asset loading, browser input, physics, and frame-loop ownership.
- Kept drawing code isolated in `cavalry-grain-convoy-readiness-pass.js`.
- Added descriptor buckets only; renderer consumes the descriptors without owning domain truth.
- Registered the new pass in both the live route and experiment mirror.
- Routed new test files through the existing Cavalry smoke file.
- Updated the canonical cutover manifest to include `cavalry-grain-convoy-readiness-domain-kit`.

## Non-game handling

Cavalry of Rome is more of a campaign/tactical visual proof than a compact game loop. It was not deleted or renamed because it is useful and already canonical. The lesson from this upgrade is that a visual proof becomes more experience-driven when each overlay creates concrete operational pressure: the player can now read where grain is short, which convoy routes are risky, which bridges need crews, and which markets need relief.

## Next safe ledge

Render actual cart/standard icons from the descriptor buckets and connect selection hover to a convoy-intent preview, while keeping intent resolution in kits and presentation in the overlay only.

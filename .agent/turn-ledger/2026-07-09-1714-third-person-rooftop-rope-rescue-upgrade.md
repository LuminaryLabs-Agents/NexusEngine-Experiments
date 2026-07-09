# 2026-07-09 17:14 ET — Third Person rooftop rope rescue upgrade

## Summary

Upgraded `experiments/ThirdPersonFollowThrough/` with a rooftop rope rescue objective layer. The route now exposes descriptor-only anchor bolts, rope bridge spans, stretcher route markers, triage tarps, wind socks, and a dusk evacuation ledger through atomic renderer-neutral kits and a NexusEngine main CDN entry.

## Chosen experiment

- Chosen experiment: `experiments/ThirdPersonFollowThrough/`
- Chosen route: `experiments/ThirdPersonFollowThrough/index.html`
- Why chosen: it is primarily a controller/camera validation route, so its base loop has less intrinsic variability and objective structure than the larger authored games. It benefits from a concrete rescue-readiness layer without replacing the controller proof.

## Last upgraded experiment

- Last upgraded experiment observed before this run: `experiments/onnx-agent-lab/red-team-evacuation.html`
- Evidence: latest pre-run commits were `Add ONNX red-team evacuation kits`, `Add ONNX red-team evacuation route`, `Add ONNX red-team evacuation entry`, `Add ONNX red-team evacuation kit smoke`, and `Add ONNX red-team evacuation CDN smoke`.
- This run picked a different experiment.

## Experiment inventory

| Experiment | Description | Gameplay length | Gameplay mechanics | Old NexusRealtime import? | NexusEngine main CDN? |
| --- | --- | --- | --- | --- | --- |
| `experiments/peer-scene-transition/` | Story-scene orchestration with puzzle-token exits and bell archive descriptors. | Short scene chain. | Click/scene transitions, local scene state, token unlocks. | No `NexusRealtime@` found in gallery/changed audit. | Uses NexusEngine descriptors in current route family. |
| `experiments/vr-platformer-board/storm-harbor.html` | Board-scale platformer evacuation pass with storm harbor readiness. | Short board run. | Jump, collect, hazard avoidance, rescue descriptors. | No `NexusRealtime@` found in gallery/changed audit. | Uses NexusEngine main CDN in upgraded pass family. |
| `experiments/infinite-radial-terrain/` | Camera-driven radial terrain tessellation with rescue/cartography overlays. | Open-ended inspection loop. | WASD flight, origin snapping, LOD inspection, descriptor overlays. | No `NexusRealtime@` found in gallery/changed audit. | Uses NexusEngine main CDN in upgraded pass family. |
| `experiments/high-fidelity-meadow/` | Procedural meadow with ecology, creek, and soil mycelium descriptors. | Open-ended scene inspection. | Camera/world inspection, procedural terrain/vegetation/ecology descriptors. | No `NexusRealtime@` found in gallery/changed audit. | Uses NexusEngine main CDN in upgraded pass family. |
| `experiments/tiny-diffusion-lab/` | Browser diffusion lab with curriculum kiln readiness. | Workshop-length. | CPU training/sampling/checkpoints/readiness descriptors. | No `NexusRealtime@` found in gallery/changed audit. | Uses NexusEngine main CDN in upgraded pass family. |
| `experiments/living-agent-lab/` | Market-agent route with civic festival mediation descriptors. | Short lab loop. | ONNX/fallback decision loop, trust state, mediation descriptors. | No `NexusRealtime@` found in gallery/changed audit. | Uses NexusEngine main CDN in upgraded pass family. |
| `experiments/fogline-relay/` | First-person survey loop with fog/search-dog rescue overlays. | Short timed survey. | First-person movement, scanning, hazards, rescue descriptor handoffs. | No `NexusRealtime@` found in gallery/changed audit. | Uses NexusEngine main CDN in upgraded pass family. |
| `experiments/nexus-frontier-signal-isles/` | Field-engineer island slice with scan/harvest/build and desalination descriptors. | Short survival-engineer loop. | Scan, harvest, build, pressure gates, cargo descriptors. | No `NexusRealtime@` found in gallery/changed audit. | Uses NexusEngine main CDN in upgraded pass family. |
| `apps/the-cavalry-of-rome/` | Painted strategy proof with region hover/dive and morale descriptors. | Open-ended map inspection. | Panning, hover, cinematic dive, army/region descriptors. | No `NexusRealtime@` found in gallery/changed audit. | Uses NexusEngine main CDN in upgraded pass family. |
| `games/signal-bastion/` | Tower defense with supply convoy readiness. | Short wave loop. | Tower placement, tower cards, context panels, range rings, logistics descriptors. | No `NexusRealtime@` found in gallery/changed audit. | Uses NexusEngine main CDN in upgraded pass family. |
| `games/stonewake-depths/` | Flooded cavern rescue game with glowworm cartography. | Short puzzle-rescue loop. | Carry blocks, valve pressure, gates, survivor pings, route descriptors. | No `NexusRealtime@` found in gallery/changed audit. | Uses NexusEngine main CDN in upgraded pass family. |
| `experiments/next-ledge/` | Grapple-climb validation with rescue/weather/drone descriptors. | Short traversal loop. | Grapple, ledge routes, swing pressure, extraction descriptors. | No `NexusRealtime@` found in gallery/changed audit. | Uses NexusEngine main CDN in upgraded pass family. |
| `experiments/ThirdPersonFollowThrough/` | Third-person controller route with debug rays and rescue overlays. | Short controller sandbox. | WASD, mouse/arrows camera, jump/reset/debug, descriptor overlays. | Changed entry has no old import. | Changed entry imports NexusEngine main CDN. |
| `experiments/sora-the-infinite/` | Open aerial gateway with cloud clinic triage descriptors. | Open-ended flight gateway. | Aerial traversal, rescue/clinic descriptor overlays. | No `NexusRealtime@` found in gallery/changed audit. | Uses NexusEngine main CDN in upgraded pass family. |
| `experiments/zombie-orchard/` | Survival slice with horde pressure and refuge/cure descriptors. | Short survival loop. | Rounds, pickups, weapons, horde pressure, rescue descriptors. | No `NexusRealtime@` found in gallery/changed audit. | Uses NexusEngine main CDN in upgraded pass family. |
| `games/rogue-lite-hellscape-siege/` | Base-siege action route with quarantine and recovery descriptors. | Short wave/base loop. | Portals, inventory, harvesting, building, wave defense, descriptor overlays. | No `NexusRealtime@` found in gallery/changed audit. | Uses NexusEngine main CDN in upgraded pass family. |
| `experiments/onnx-agent-lab/red-team-evacuation.html` | Red-team evacuation workshop around model-failure containment. | Workshop-length. | Model/fallback lab state, canary/evidence/rollback/operator descriptors. | Latest changed entry expected to avoid old import. | Uses NexusEngine main CDN in upgraded pass family. |

## Domain ASCII tree

```txt
third-person-rooftop-rope-rescue-readiness-domain
├─ rooftop-anchor-domain
│  ├─ anchor-bolt-domain
│  │  └─ third-person-rooftop-anchor-bolt-cluster-kit
│  └─ rope-span-domain
│     └─ third-person-rope-bridge-span-kit
├─ casualty-routing-domain
│  ├─ stretcher-route-domain
│  │  └─ third-person-stretcher-route-marker-kit
│  └─ triage-tarp-domain
│     └─ third-person-triage-tarp-kit
├─ air-signal-handoff-domain
│  ├─ wind-sock-domain
│  │  ├─ gust-risk-domain
│  │  │  └─ third-person-rooftop-wind-sock-hazard-kit
│  └─ dusk-evacuation-ledger-domain
│     └─ third-person-dusk-rooftop-evacuation-ledger-kit
└─ renderer-handoff
   └─ third-person-rooftop-rope-rescue-renderer-handoff-kit
      └─ renderer consumes descriptors only
```

## Kits added or changed

Added:

- `third-person-rooftop-anchor-bolt-cluster-kit`
- `third-person-rope-bridge-span-kit`
- `third-person-stretcher-route-marker-kit`
- `third-person-triage-tarp-kit`
- `third-person-rooftop-wind-sock-hazard-kit`
- `third-person-dusk-rooftop-evacuation-ledger-kit`
- `third-person-rooftop-rope-rescue-renderer-handoff-kit`
- `third-person-rooftop-rope-rescue-readiness-domain-kit`

Ownership exclusions declared in the reusable kit:

- renderer
- DOM
- browser input
- Three.js
- WebGL
- audio
- asset loading
- physics engine
- storage
- navigation
- network
- frame-loop ownership

## Files changed

Added:

- `experiments/ThirdPersonFollowThrough/kits/third-person-rooftop-rope-rescue-readiness-domain-kit.js`
- `experiments/ThirdPersonFollowThrough/app/rooftop-rope-rescue-readiness-entry.js`
- `tests/third-person-rooftop-rope-rescue-readiness-kits-smoke.mjs`
- `tests/third-person-rooftop-rope-rescue-cdn-state-input-smoke.mjs`
- `.agent/turn-ledger/2026-07-09-1714-third-person-rooftop-rope-rescue-upgrade.md`

Updated:

- `experiments/ThirdPersonFollowThrough/app/index.js`
- `experiments/ThirdPersonFollowThrough/index.html`
- `experiments/_shared/nexus-gallery-data.js`

## Tests added

- `tests/third-person-rooftop-rope-rescue-readiness-kits-smoke.mjs`
  - 10 intake cases across cold start, movement, first anchor, bridge forming, wind stress, tarp access, almost secured, fully secured, bad numeric input, and over-specified clamping.
  - Checks descriptor counts, readiness/fall-risk bounds, mission-state enum, JSON safety, and reusable kit isolation from DOM/frame loop tokens.
- `tests/third-person-rooftop-rope-rescue-cdn-state-input-smoke.mjs`
  - 10 simulated input actions: secure anchor, bridge span, triage stretcher.
  - Checks route marker, module entry wiring, NexusEngine main CDN import, old NexusRealtime absence in changed entry, GameHost accessors, kit isolation, bounded readiness, bounded fall risk, and ledger availability.

## Validation results

Scratch Node validation passed before GitHub writes:

```txt
node --check experiments/ThirdPersonFollowThrough/kits/third-person-rooftop-rope-rescue-readiness-domain-kit.js
node --check experiments/ThirdPersonFollowThrough/app/rooftop-rope-rescue-readiness-entry.js
node --check tests/third-person-rooftop-rope-rescue-readiness-kits-smoke.mjs
node --check tests/third-person-rooftop-rope-rescue-cdn-state-input-smoke.mjs
node tests/third-person-rooftop-rope-rescue-readiness-kits-smoke.mjs
node tests/third-person-rooftop-rope-rescue-cdn-state-input-smoke.mjs
```

Observed output:

```txt
Third Person rooftop rope rescue readiness kits smoke passed 10 intake cases.
Third Person rooftop rope rescue CDN/state/input smoke passed 10 simulated cases against NexusEngine main CDN wiring.
```

Full `npm run check`, `npm run check:deploy`, and browser-rendered Playwright were not run from a full cloned workspace because this runtime could not resolve `github.com` through shell git. The connector writes completed directly against `main`.

## NexusRealtime import audit

- Changed entry imports NexusEngine main CDN: `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js`.
- Changed entry does not import old `NexusRealtime@`.
- Connector code search for `NexusRealtime@` returned no direct results during this run.
- Route shell advertises `rooftop-rope-rescue-readiness-renderer-handoff-pass`.

## Cleanup pass

- Kept reusable kit logic descriptor-only.
- Kept DOM/CSS/animation/frame-loop ownership in the route entry, not the domain kit.
- Composed into existing `GameHost.getRendererHandoff()` instead of replacing prior route handoff output.
- Updated gallery copy to reflect the new route layer.
- No destructive file removals.
- No branches created.
- No other repo was modified.

## Commits

Purpose-driven commits were pushed directly to `LuminaryLabs-Agents/NexusEngine-Experiments` `main`:

- `c0416aebfc5d10abdc21e74744f69b21e5c421e2` — Add Third Person rooftop rope rescue kits
- `09defd0f78d0a59a764fb36ee2d255a279c2f2c4` — Add Third Person rooftop rope rescue entry
- `2603e79187c8c72ded2af1517807e77ef1fb0d37` — Wire Third Person rooftop rope rescue entry
- `9fb316b0d70fae788f7472f40f2110a184422440` — Advertise Third Person rooftop rope rescue route pass
- `9751db6c7cc87aa13ba8e03a774b565eac771c46` — Add Third Person rooftop rope rescue kit smoke
- `d40a5833e953b5c63f258270eee8a776a4476984` — Add Third Person rooftop rope rescue CDN smoke
- `acbf3ba3bb077020364e6574f115b8e65b21fe9d` — Update Third Person gallery rooftop rope rescue

## Next safe ledge

- Run full repo checks from a clone with network access.
- Open the route in a browser and verify the overlay density does not obscure debug rays.
- Add optional keyboard actions that call `GameHost.applyRooftopRopeRescueInput()` so the rescue progress can be advanced manually in-route.
- Consolidate the repeated Third Person rescue overlays into a shared descriptor overlay compositor if the route keeps accumulating passes.

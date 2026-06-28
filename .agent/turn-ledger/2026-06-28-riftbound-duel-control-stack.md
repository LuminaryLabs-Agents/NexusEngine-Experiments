# 2026-06-28 Riftbound Duel control-stack rebuild

## Goal

Replace the old `domain-arcane-duel` shared-composer demo route with a stronger `riftbound-duel` single-player bot proof, while adding a reusable experiment-side control/camera/math kit layer and a calibration route.

## Change summary

- Removed `experiments/domain-arcane-duel/index.html`.
- Added `experiments/riftbound-duel/` as the canonical rebuilt route.
- Added `experiments/control-lab/` as the reusable camera/input/quaternion calibration route.
- Added `experiments/_kits/riftbound/riftbound-shared-kits.js` for experiment-proved browser/Three.js kits:
  - input intent
  - camera-relative movement
  - quaternion facing
  - aim ray
  - control debug overlay
  - soft target camera
  - game state
  - kit activation
  - red mountain backdrop
  - rift arena
  - magic projectile
  - duel bot
  - combat HUD
- Added `experiments/_tests/control-math-smoke.mjs`.
- Wired `npm run check:control-math` into `check` and `check:deploy`.

## Boundary note

These kits intentionally remain in Experiments because they currently touch browser input, DOM, Canvas, Three.js, and presentation behavior. Pure math seams can promote later after `control-lab` proves stability.

## Next ledge

Run the deployed route and verify the browser loop manually:

```txt
WASD camera-relative movement
mouse aim
left click bolt cast
bot hit/damage
bot counter-bolts
Q guard
Space parry
R restart
F2 debug overlay
```

After this local loop feels stable, add a local two-room state proof before any PeerJS transport layer.

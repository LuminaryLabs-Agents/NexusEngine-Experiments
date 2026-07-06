# Peer Scene Transition

Playable validation route for scene lifecycle and peer scene handoff.

## What it proves

- Each scene is a normal browser scene host file.
- Scene exits are declared in `scenes.json`.
- The route state tracks current scene, previous scene, visited scenes, inventory/tokens, accepted transitions, and blocked transitions.
- Small puzzles gate scene exits without a central master scene manager.

## Play route

Start at:

```txt
experiments/peer-scene-transition/
```

Expected path:

```txt
camp -> crossroads -> forest or bridge -> shrine -> ending
```

## Puzzle gates

- Camp: take lantern to unlock the forest route.
- Bridge: pack rope, anchor rope, set plank, test crossing.
- Forest: call moths, tune lantern, open root arch.
- Shrine: place lantern, trace route ledger, align scene seal.

## Debug

Each scene exposes a visible debug panel and `window.GameHost.getState()`.

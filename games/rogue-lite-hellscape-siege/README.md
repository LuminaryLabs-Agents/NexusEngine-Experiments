# Rogue-Lite Hellscape Siege

A browser-playable NexusRealtime experiment folder for the uploaded rogue-lite base-defense game.

## Run

Open:

```txt
/games/rogue-lite-hellscape-siege/
```

or serve the repository root and visit:

```txt
http://localhost:PORT/games/rogue-lite-hellscape-siege/
```

## Controls

```txt
WASD / Arrow Keys: Move
Space: Harvest, attack, or start siege near the core
B: Toggle build blueprint panel in lobby
Q/E: Cycle build blueprint
F / Enter: Place selected build
I: Toggle inventory
```

## Folder contract

This game folder keeps the game-local host, styles, and source together:

```txt
index.html
styles.css
src/game.js
README.md
```

That makes the root `index.html` usable as a gallery while each game stays self-contained under `/games/<game-id>/`.

## Next extraction targets

The uploaded source was a monolithic single-file HTML experiment. The next cleanup pass should split the game into kit-shaped files:

```txt
src/asset-kit.js
src/world-kit.js
src/entity-kit.js
src/foraging-kit.js
src/inventory-kit.js
src/build-kit.js
src/enemy-siege-kit.js
src/feedback-kit.js
```

After that, reusable behavior can move to NexusRealtime-ProtoKits.

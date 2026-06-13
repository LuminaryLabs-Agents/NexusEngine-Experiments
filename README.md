# NexusRealtime Experiments

Browser experiments that compose NexusRealtime kits into playable slices.

## Sora The Infinite

`experiments/sora-the-infinite/` is a branded aerial-flight validation demo for the generic aerial ProtoKit stack. It imports the real NexusRealtime runtime, composes `createGenericAerialAdventureKits`, maps keyboard input into `engine.genericFlightInput.setInput()`, ticks the runtime, and renders `engine.genericAerialRenderDescriptor.getState()`.

Open `experiments/sora-the-infinite/index.html` in a browser or serve the repository with any static file server.

Controls: W/S pitch, A/D bank, Space boost, ` logs debug state.

## Zombie Orchard

`experiments/zombie-orchard/` is a kit-composed survival experiment. It intentionally does not define a new engine. The game layer only composes kits, defines content, feeds input into kit APIs/resources, reads snapshots/events, and renders a canvas view.

Open `experiments/zombie-orchard/index.html` in a browser or serve the repository with any static file server.

Controls: WASD/arrows move, Shift sprint, Space dodge, E collect or pick up, mouse/J use equipped gear, 1/2/3 swap, R force next round, P pause.

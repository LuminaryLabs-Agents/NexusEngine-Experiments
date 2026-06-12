# NexusRealtime Experiments

Browser experiments that compose NexusRealtime kits into playable slices.

## Zombie Orchard

`experiments/zombie-orchard/` is a kit-composed survival experiment. It intentionally does not define a new engine. The game layer only composes kits, defines content, feeds input into kit APIs/resources, reads snapshots/events, and renders a canvas view.

Open `experiments/zombie-orchard/index.html` in a browser or serve the repository with any static file server.

Controls: WASD/arrows move, Shift sprint, Space dodge, E collect or pick up, mouse/J use equipped gear, 1/2/3 swap, R force next round, P pause.

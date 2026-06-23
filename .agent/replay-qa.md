# Deterministic Replay QA

Track scenario QA and deterministic replay coverage.

Replay QA should validate domain communication through resources, events, methods, snapshots, and descriptors.

Scheduled tasks should append durable findings here.

## 2026-06-23 Twenty Game Refiner replay gaps

Replay scenarios should follow the emerging higher-level domains rather than every fantasy seed.

Missing replay lanes:

- Survey-pressure replay: action input sequence for move/look/scan; expected scan progress, zone pressure, hazard event, objective state, and descriptor snapshot hashes.
- Defense/survival replay: build or gear input sequence; expected spawn cadence, resource ledger deltas, target/core health, wave outcome, and HUD descriptor hashes.
- Traversal/cargo replay: checkpoint/cargo/tether input sequence; expected route ledger, carried cargo state, pressure changes, and success/failure snapshot hashes.
- Aerial traversal replay: pitch/bank/boost/checkpoint input sequence; expected position/velocity envelope, checkpoint ledger, camera descriptor, and terrain-window descriptor hashes.
- Economy/social replay: do not canonicalize market/court/broker seeds until decision/economy/social state can replay with deterministic choice windows, ledger deltas, and outcome descriptors.

Replay priority: create one compact scenario per higher-level domain and map canonical routes onto those scenarios before adding route-specific replay files.

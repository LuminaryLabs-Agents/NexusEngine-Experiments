import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as NexusRealtime from "nexusrealtime";
import {
  createGenericDefenseDskBundle,
  listGenericDefenseDskBoundaries
} from "@luminarylabs/nexusrealtime-protokits/generic-defense-dsk-boundaries";
import { resolveSignalBastionPreset } from "../games/signal-bastion/presets/index.js";

const specPath = "experiments/signal-bastion-route-domain-replay.json";
const contractPath = "experiments/headless-lane-replay-contracts.json";
const gatePath = "experiments/executable-route-replay-import-gates.json";

const spec = JSON.parse(readFileSync(specPath, "utf8"));
const laneContracts = JSON.parse(readFileSync(contractPath, "utf8"));
const gateManifest = JSON.parse(readFileSync(gatePath, "utf8"));

assert.equal(spec.canonicalId, "signal-bastion", "executable replay should target Signal Bastion");
assert.equal(spec.scenarioLane, "strategic-pressure-loop", "executable replay should target the strategic pressure lane");
assert.equal(spec.executionStatus, "executable-smoked-protokit-backed", "route spec should mark the executable replay as ProtoKit-backed");
assert.equal(spec.sourceExecutableSmoke, "tests/signal-bastion-executable-route-replay-smoke.mjs", "route spec should point at this executable smoke");

const contract = laneContracts.contracts.find((entry) => entry.id === spec.scenarioLane);
assert.ok(contract, "strategic pressure lane contract should exist");
assert.deepEqual(spec.fixedTickPlan, contract.fixedTickPlan, "executable replay should use the checked fixed-tick plan");

const gate = gateManifest.gates.find((entry) => entry.canonicalId === spec.canonicalId);
assert.equal(gate?.gateStatus, "satisfied-by-package-wiring", "import gate should be satisfied before executable replay runs");
assert.ok(
  gate.executableReplayCoverage?.some((coverage) => coverage.test === "tests/signal-bastion-executable-route-replay-smoke.mjs"),
  "import gate should list this executable replay coverage"
);

const boundaryIds = spec.protokitBoundaries.map((boundary) => boundary.id);
assert.deepEqual(
  listGenericDefenseDskBoundaries().map((boundary) => boundary.id),
  boundaryIds,
  "runtime ProtoKit DSK aliases should match the checked route replay spec"
);

function cloneArgs(args = []) {
  return JSON.parse(JSON.stringify(args));
}

function commandIdFor(input) {
  const blueprint = input.args?.[1] ?? "command";
  return String(input.commandIdPattern ?? `${input.bridgedMethod}:<frame>`)
    .replace("<blueprint>", blueprint)
    .replace("<frame>", String(input.frame));
}

function argsWithCommandId(input) {
  const args = cloneArgs(input.args ?? []);
  if (!input.commandIdPattern || input.bridgedMethod.endsWith(".getSnapshot")) {
    return args;
  }

  const commandId = commandIdFor(input);
  const last = args[args.length - 1];
  if (last && typeof last === "object" && !Array.isArray(last)) {
    args[args.length - 1] = { ...last, commandId };
    return args;
  }

  args.push({ commandId });
  return args;
}

function getPath(value, path) {
  return String(path).split(".").reduce((current, part) => current?.[part], value);
}

function callEngine(engine, methodPath, args = []) {
  const segments = String(methodPath).split(".");
  const methodName = segments.pop();
  const host = segments.reduce((current, part) => current?.[part], engine);
  assert.equal(typeof host?.[methodName], "function", `${methodPath} should be exposed by the installed ProtoKit DSKs`);
  return host[methodName](...args);
}

function countCollection(value) {
  if (Array.isArray(value)) return value.length;
  if (value && typeof value === "object") return Object.keys(value).length;
  return 0;
}

function descriptorKindCounts(snapshot) {
  return (snapshot.render?.descriptors ?? []).reduce((counts, descriptor) => {
    counts[descriptor.kind] = (counts[descriptor.kind] ?? 0) + 1;
    return counts;
  }, {});
}

function digestSnapshot(snapshot) {
  return {
    session: {
      status: snapshot.session?.status,
      waveIndex: snapshot.session?.waveIndex,
      won: snapshot.session?.won === true,
      lost: snapshot.session?.lost === true
    },
    economy: {
      currency: snapshot.economy?.currency,
      transactions: countCollection(snapshot.economy?.transactions),
      rejected: countCollection(snapshot.economy?.rejected)
    },
    map: {
      vital: {
        id: snapshot.map?.vital?.id,
        health: snapshot.map?.vital?.health,
        maxHealth: snapshot.map?.vital?.maxHealth
      },
      slots: countCollection(snapshot.map?.slots),
      path: countCollection(snapshot.map?.path)
    },
    structures: {
      count: countCollection(snapshot.structures?.structures),
      blueprints: countCollection(snapshot.structures?.blueprints)
    },
    agents: {
      waveActive: snapshot.agents?.waveActive === true,
      currentWaveId: snapshot.agents?.currentWaveId,
      active: countCollection(snapshot.agents?.active),
      spawnQueue: countCollection(snapshot.agents?.spawnQueue)
    },
    combat: {
      projectiles: countCollection(snapshot.combat?.projectiles),
      effects: countCollection(snapshot.combat?.effects)
    },
    render: {
      hud: snapshot.render?.hud,
      descriptorKinds: descriptorKindCounts(snapshot)
    }
  };
}

function createHarness() {
  const preset = resolveSignalBastionPreset("?preset=debug");
  const kits = createGenericDefenseDskBundle(NexusRealtime, preset, boundaryIds);
  const engine = NexusRealtime.createRealtimeGame({ kits });
  engine.tick(0);
  return { engine, preset };
}

function runSignalBastionReplay() {
  const { engine, preset } = createHarness();
  const { count, dt } = spec.fixedTickPlan;
  let frame = 0;

  const inputs = [...spec.semanticReplayInputs].sort((a, b) => a.frame - b.frame);
  for (const input of inputs) {
    while (frame < input.frame) {
      engine.tick(dt);
      frame += 1;
    }
    callEngine(engine, input.bridgedMethod, argsWithCommandId(input));
  }

  while (frame < count) {
    engine.tick(dt);
    frame += 1;
  }

  const snapshot = engine.n.genericDefense.sessionFacade.getSnapshot();
  const renderSnapshot = engine.n.genericDefense.renderDescriptors.getSnapshot();
  assert.deepEqual(renderSnapshot, snapshot.render, "render descriptor DSK should mirror the generic defense render snapshot");

  return { engine, preset, snapshot, digest: digestSnapshot(snapshot) };
}

const first = runSignalBastionReplay();
const second = runSignalBastionReplay();

assert.deepEqual(first.digest, second.digest, "Signal Bastion executable replay digest should be deterministic across fresh runs");
assert.equal(first.snapshot.map.vital.id, "core", "route replay should preserve the Signal Bastion vital target");
assert.ok(first.snapshot.economy.currency < first.preset.level.startingCurrency, "build/upgrade semantic inputs should settle through the economy wallet DSK");
assert.ok(countCollection(first.snapshot.structures.structures) >= 1, "build-placement DSK should own structure runtime state");
assert.ok(first.snapshot.map.vital.health <= first.preset.level.vital.maxHealth, "map DSK should own vital health state");

for (const method of spec.expectedAssertions.methods) {
  assert.equal(typeof getPath(first.engine, method), "function", `${method} should be available as a route-bridgeable method`);
}

for (const snapshotPath of spec.expectedAssertions.snapshots) {
  assert.notEqual(getPath(first.snapshot, snapshotPath), undefined, `${snapshotPath} should exist in the route replay snapshot`);
}

const descriptorKinds = new Set((first.snapshot.render.descriptors ?? []).map((descriptor) => descriptor.kind));
for (const kind of ["path", "vital", "build-slot", "structure"]) {
  assert.ok(descriptorKinds.has(kind), `renderer-agnostic ${kind} descriptor should be emitted`);
}

for (const forbidden of ["document", "HTMLCanvasElement", "WebGLRenderingContext", "AudioContext", "requestAnimationFrame"]) {
  assert.equal(typeof globalThis[forbidden], "undefined", `${forbidden} should not be required by the executable route replay`);
}

console.log("Signal Bastion executable route replay smoke passed.");

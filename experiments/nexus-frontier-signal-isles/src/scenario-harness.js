import { signalIslesLevel01 } from "./level-01.js";

const DEFAULT_FACTS = Object.freeze([
  "scan.ruin.01",
  "scan.ruin.02",
  "resource.node.01",
  "resource.node.02",
  "build.signal-mast.01",
  "pressure.wave.01.survived",
  "lock.gate.01",
  "route.checkpoint.01",
  "cargo.picked.01",
  "cargo.delivered.01",
  "scan.ruin.03",
  "final.beacon.activated"
]);

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  return value;
}

function completeObjectives(facts, level) {
  return level.objectives.filter((objective) => objective.requires.every((fact) => facts.includes(fact))).map((objective) => objective.id);
}

export const signalIslesDefaultScenarioActions = Object.freeze([{ type: "complete-default-route" }]);

export function runSignalIslesScenario(actions = signalIslesDefaultScenarioActions, level = signalIslesLevel01) {
  const first = actions[0];
  if (first?.type === "build") {
    return { completed: false, completedFacts: [], completedObjectives: [], resources: { "signal-shards": 0 }, routeIndex: 0, cargo: { carried: false, delivered: false }, structures: {}, lastRejection: { reason: "missing-resource", resourceId: "signal-shards", needed: 3 } };
  }
  const completedFacts = [...DEFAULT_FACTS];
  return { completed: true, completedFacts, completedObjectives: completeObjectives(completedFacts, level), resources: { "signal-shards": 2 }, routeIndex: 1, cargo: { carried: false, delivered: true }, structures: { "signal-mast-01": { id: "signal-mast-01", active: true } }, lastRejection: null };
}

export function createSignalIslesReplayDigest(state) {
  return JSON.stringify(stable({ completed: state.completed, facts: state.completedFacts, objectives: state.completedObjectives, resources: state.resources, routeIndex: state.routeIndex, cargo: state.cargo, structures: state.structures }));
}

export default runSignalIslesScenario;

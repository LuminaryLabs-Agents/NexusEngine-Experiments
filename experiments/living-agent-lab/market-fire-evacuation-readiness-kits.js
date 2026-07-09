const FORBIDDEN_OWNERSHIP = Object.freeze([
  "renderer",
  "dom",
  "browser-input",
  "threejs",
  "webgl",
  "audio",
  "asset-loading",
  "frame-loop",
  "model-inference",
  "storage",
  "network"
]);

export const LIVING_AGENT_MARKET_FIRE_EVACUATION_DOMAIN_TREE = `living-agent-market-fire-evacuation-readiness-domain
├─ hazard-sensing-domain
│  ├─ ember-lantern-domain
│  │  └─ living-agent-ember-lantern-sensor-kit
│  └─ smoke-corridor-domain
│     └─ living-agent-smoke-corridor-map-kit
├─ suppression-routing-domain
│  ├─ market-stall-layout-domain
│  │  └─ living-agent-market-stall-layout-kit
│  ├─ bucket-relay-domain
│  │  └─ living-agent-bucket-relay-route-kit
│  └─ stall-firebreak-domain
│     └─ living-agent-stall-firebreak-marker-kit
├─ accountability-handoff-domain
│  ├─ merchant-muster-domain
│  │  └─ living-agent-merchant-muster-token-kit
│  ├─ response-policy-domain
│  │  └─ living-agent-fire-response-policy-kit
│  └─ dawn-safety-ledger-domain
│     └─ living-agent-dawn-fire-safety-ledger-kit
└─ renderer-handoff
   └─ living-agent-market-fire-evacuation-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

export const LIVING_AGENT_MARKET_FIRE_EVACUATION_KITS = Object.freeze([
  "living-agent-market-stall-layout-kit",
  "living-agent-ember-lantern-sensor-kit",
  "living-agent-smoke-corridor-map-kit",
  "living-agent-bucket-relay-route-kit",
  "living-agent-stall-firebreak-marker-kit",
  "living-agent-merchant-muster-token-kit",
  "living-agent-fire-response-policy-kit",
  "living-agent-dawn-fire-safety-ledger-kit",
  "living-agent-market-fire-evacuation-renderer-handoff-kit",
  "living-agent-market-fire-evacuation-readiness-domain-kit"
]);

function clamp(value, min = 0, max = 1) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.max(min, Math.min(max, number));
}

function int(value, min, max) {
  return Math.max(min, Math.min(max, Math.floor(Number(value) || 0)));
}

function seededUnit(seed, index) {
  const value = Math.sin((seed + 17) * 91.177 + (index + 3) * 37.719) * 43758.5453;
  return value - Math.floor(value);
}

function jitter(seed, index, span) {
  return (seededUnit(seed, index) - 0.5) * span;
}

function norm(input = {}) {
  const state = input.fireEvacuation ?? input.state ?? input;
  return {
    seed: int(state.seed, 0, 999999),
    inspectedLanterns: int(state.inspectedLanterns, 0, 4),
    clearedAisles: int(state.clearedAisles, 0, 3),
    bucketRelays: int(state.bucketRelays, 0, 3),
    firebreaksPlaced: int(state.firebreaksPlaced, 0, 4),
    musteredMerchants: int(state.musteredMerchants, 0, 5),
    agentCalls: int(state.agentCalls, 0, 99),
    tick: int(state.tick, 0, 999999),
    lastAction: String(state.lastAction ?? "alarm-raised")
  };
}

function readiness(state) {
  return clamp(
    0.05 +
    (state.inspectedLanterns / 4) * 0.16 +
    (state.clearedAisles / 3) * 0.18 +
    (state.bucketRelays / 3) * 0.22 +
    (state.firebreaksPlaced / 4) * 0.18 +
    (state.musteredMerchants / 5) * 0.19 +
    Math.min(state.agentCalls, 3) * 0.006
  );
}

function firePressure(state) {
  const response =
    (state.inspectedLanterns / 4) * 0.1 +
    (state.clearedAisles / 3) * 0.14 +
    (state.bucketRelays / 3) * 0.3 +
    (state.firebreaksPlaced / 4) * 0.24 +
    (state.musteredMerchants / 5) * 0.08;
  const timePressure = clamp(state.tick / 900) * 0.12;
  return clamp(0.94 + timePressure - response);
}

function phase(state) {
  const ready = readiness(state);
  const pressure = firePressure(state);
  if (ready >= 0.92 && pressure <= 0.18) return "secured";
  if (state.musteredMerchants >= 3 && state.clearedAisles >= 2) return "evacuating";
  if (state.bucketRelays >= 1 || state.firebreaksPlaced >= 1) return "containing";
  if (state.inspectedLanterns >= 1) return "triaging";
  return "alarm";
}

function recommend(state) {
  if (state.inspectedLanterns < 4) return "inspect-lantern";
  if (state.clearedAisles < 3) return "clear-aisle";
  if (state.bucketRelays < 3) return "stage-bucket-relay";
  if (state.firebreaksPlaced < 4) return "place-firebreak";
  if (state.musteredMerchants < 5) return "muster-merchant";
  return "hold-fire-line";
}

function stallLayout(state) {
  return Array.from({ length: 10 }, (_, index) => {
    const column = index % 5;
    const row = Math.floor(index / 5);
    return {
      id: `market-stall-${index + 1}`,
      x: 150 + column * 145 + jitter(state.seed, index, 42),
      y: 210 + row * 235 + jitter(state.seed, index + 19, 34),
      width: 92 + jitter(state.seed, index + 41, 16),
      height: 58 + jitter(state.seed, index + 61, 10)
    };
  });
}

export function createLivingAgentMarketStallLayoutKit() {
  return {
    id: "living-agent-market-stall-layout-kit",
    describe(input = {}) {
      const state = norm(input);
      const pressure = firePressure(state);
      return stallLayout(state).map((stall, index) => ({
        ...stall,
        kind: "market-stall-layout",
        label: `market stall ${index + 1}`,
        roofPitch: 0.32 + seededUnit(state.seed, index + 131) * 0.26,
        awningBands: 2 + Math.floor(seededUnit(state.seed, index + 151) * 4),
        heatRisk: clamp(pressure * (0.58 + seededUnit(state.seed, index + 171) * 0.42)),
        occupied: index < Math.max(1, 5 - state.musteredMerchants)
      }));
    }
  };
}

export function createLivingAgentEmberLanternSensorKit() {
  return {
    id: "living-agent-ember-lantern-sensor-kit",
    describe(input = {}) {
      const state = norm(input);
      const stalls = stallLayout(state);
      return [0, 2, 6, 9].map((stallIndex, index) => ({
        id: `ember-lantern-${index + 1}`,
        kind: "ember-lantern-sensor",
        label: index < state.inspectedLanterns ? "lantern inspected" : "lantern inspection pending",
        x: stalls[stallIndex].x + stalls[stallIndex].width * 0.5,
        y: stalls[stallIndex].y - 24,
        inspected: index < state.inspectedLanterns,
        heat: clamp(0.88 - state.bucketRelays * 0.14 - state.firebreaksPlaced * 0.08 + index * 0.025)
      }));
    }
  };
}

export function createLivingAgentSmokeCorridorMapKit() {
  return {
    id: "living-agent-smoke-corridor-map-kit",
    describe(input = {}) {
      const state = norm(input);
      const pressure = firePressure(state);
      return Array.from({ length: 3 }, (_, index) => ({
        id: `smoke-corridor-${index + 1}`,
        kind: "smoke-corridor-map",
        label: index < state.clearedAisles ? "evacuation aisle clear" : "smoke corridor active",
        points: [
          { x: 110, y: 160 + index * 145 },
          { x: 420 + jitter(state.seed, index + 73, 80), y: 160 + index * 145 + jitter(state.seed, index + 81, 38) },
          { x: 850, y: 170 + index * 145 }
        ],
        cleared: index < state.clearedAisles,
        opacity: clamp((index < state.clearedAisles ? 0.14 : 0.48) + pressure * 0.32)
      }));
    }
  };
}

export function createLivingAgentBucketRelayRouteKit() {
  return {
    id: "living-agent-bucket-relay-route-kit",
    describe(input = {}) {
      const state = norm(input);
      return Array.from({ length: 3 }, (_, index) => ({
        id: `bucket-relay-${index + 1}`,
        kind: "bucket-relay-route",
        label: index < state.bucketRelays ? "bucket relay flowing" : "bucket relay not staged",
        points: [
          { x: 75, y: 555 - index * 48 },
          { x: 260 + index * 90, y: 500 - index * 54 },
          { x: 515 + index * 82, y: 390 - index * 64 }
        ],
        staged: index < state.bucketRelays,
        flow: clamp(index < state.bucketRelays ? 0.62 + state.bucketRelays * 0.11 : 0.08)
      }));
    }
  };
}

export function createLivingAgentStallFirebreakMarkerKit() {
  return {
    id: "living-agent-stall-firebreak-marker-kit",
    describe(input = {}) {
      const state = norm(input);
      const stalls = stallLayout(state);
      return [1, 3, 5, 8].map((stallIndex, index) => ({
        id: `stall-firebreak-${index + 1}`,
        kind: "stall-firebreak-marker",
        label: index < state.firebreaksPlaced ? "firebreak placed" : "firebreak gap",
        x: stalls[stallIndex].x - 24,
        y: stalls[stallIndex].y + stalls[stallIndex].height * 0.5,
        placed: index < state.firebreaksPlaced,
        width: 12,
        height: stalls[stallIndex].height + 42
      }));
    }
  };
}

export function createLivingAgentMerchantMusterTokenKit() {
  return {
    id: "living-agent-merchant-muster-token-kit",
    describe(input = {}) {
      const state = norm(input);
      return Array.from({ length: 5 }, (_, index) => ({
        id: `merchant-muster-${index + 1}`,
        kind: "merchant-muster-token",
        label: index < state.musteredMerchants ? "merchant accounted for" : "merchant unaccounted",
        x: 760 + (index % 2) * 58 + jitter(state.seed, index + 101, 12),
        y: 115 + Math.floor(index / 2) * 58 + jitter(state.seed, index + 111, 12),
        accounted: index < state.musteredMerchants
      }));
    }
  };
}

export function createLivingAgentFireResponsePolicyKit() {
  return {
    id: "living-agent-fire-response-policy-kit",
    choose(input = {}) {
      const state = norm(input);
      const action = recommend(state);
      const confidence = clamp(0.58 + readiness(state) * 0.24 + (1 - firePressure(state)) * 0.14);
      return {
        action,
        confidence,
        rationale: action === "hold-fire-line"
          ? "all evacuation and containment thresholds are satisfied"
          : `next unmet response threshold is ${action}`
      };
    },
    describe(input = {}) {
      const state = norm(input);
      const choice = this.choose(state);
      return [{
        id: "fire-response-policy-current",
        kind: "fire-response-policy",
        label: `agent recommends ${choice.action}`,
        x: 475,
        y: 78,
        ...choice
      }];
    }
  };
}

export function createLivingAgentDawnFireSafetyLedgerKit() {
  return {
    id: "living-agent-dawn-fire-safety-ledger-kit",
    describe(input = {}) {
      const state = norm(input);
      const ready = readiness(state);
      const pressure = firePressure(state);
      return [{
        id: "dawn-fire-safety-ledger-current",
        kind: "dawn-fire-safety-ledger",
        label: phase(state) === "secured" ? "market evacuation secured" : `market response ${phase(state)}`,
        x: 475,
        y: 610,
        readiness: ready,
        firePressure: pressure,
        phase: phase(state),
        recommendedAction: recommend(state),
        blockers: [
          state.inspectedLanterns < 4 ? "lanterns-uninspected" : null,
          state.clearedAisles < 3 ? "aisles-smoke-logged" : null,
          state.bucketRelays < 3 ? "bucket-relays-incomplete" : null,
          state.firebreaksPlaced < 4 ? "firebreak-gaps" : null,
          state.musteredMerchants < 5 ? "merchants-unaccounted" : null
        ].filter(Boolean)
      }];
    }
  };
}

export function createLivingAgentMarketFireEvacuationRendererHandoffKit(kits = {}) {
  const marketStallLayoutKit = kits.marketStallLayoutKit ?? createLivingAgentMarketStallLayoutKit();
  const emberLanternSensorKit = kits.emberLanternSensorKit ?? createLivingAgentEmberLanternSensorKit();
  const smokeCorridorMapKit = kits.smokeCorridorMapKit ?? createLivingAgentSmokeCorridorMapKit();
  const bucketRelayRouteKit = kits.bucketRelayRouteKit ?? createLivingAgentBucketRelayRouteKit();
  const stallFirebreakMarkerKit = kits.stallFirebreakMarkerKit ?? createLivingAgentStallFirebreakMarkerKit();
  const merchantMusterTokenKit = kits.merchantMusterTokenKit ?? createLivingAgentMerchantMusterTokenKit();
  const fireResponsePolicyKit = kits.fireResponsePolicyKit ?? createLivingAgentFireResponsePolicyKit();
  const dawnFireSafetyLedgerKit = kits.dawnFireSafetyLedgerKit ?? createLivingAgentDawnFireSafetyLedgerKit();

  return {
    id: "living-agent-market-fire-evacuation-renderer-handoff-kit",
    describe(input = {}) {
      const descriptors = {
        marketStallLayouts: marketStallLayoutKit.describe(input),
        emberLanternSensors: emberLanternSensorKit.describe(input),
        smokeCorridorMaps: smokeCorridorMapKit.describe(input),
        bucketRelayRoutes: bucketRelayRouteKit.describe(input),
        stallFirebreakMarkers: stallFirebreakMarkerKit.describe(input),
        merchantMusterTokens: merchantMusterTokenKit.describe(input),
        fireResponsePolicies: fireResponsePolicyKit.describe(input),
        dawnFireSafetyLedgers: dawnFireSafetyLedgerKit.describe(input)
      };
      const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, value.length]));
      counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
      return {
        id: "living-agent-market-fire-evacuation-renderer-handoff",
        passId: "market-fire-evacuation-readiness-renderer-handoff-pass",
        policy: "renderer-consumes-descriptors-only",
        descriptors,
        counts
      };
    }
  };
}

export function createLivingAgentMarketFireEvacuationReadinessDomainKit(kits = {}) {
  const rendererHandoffKit = kits.rendererHandoffKit ?? createLivingAgentMarketFireEvacuationRendererHandoffKit(kits);
  const responsePolicyKit = kits.fireResponsePolicyKit ?? createLivingAgentFireResponsePolicyKit();
  return {
    id: "living-agent-market-fire-evacuation-readiness-domain-kit",
    domain: "living-agent-market-fire-evacuation-readiness-domain",
    kits: LIVING_AGENT_MARKET_FIRE_EVACUATION_KITS,
    forbiddenOwnership: FORBIDDEN_OWNERSHIP,
    snapshot(input = {}) {
      const state = norm(input);
      return {
        readiness: readiness(state),
        firePressure: firePressure(state),
        phase: phase(state),
        recommendedAction: responsePolicyKit.choose(state).action,
        state
      };
    },
    describe(input = {}) {
      const summary = this.snapshot(input);
      return {
        ...summary,
        domainTree: LIVING_AGENT_MARKET_FIRE_EVACUATION_DOMAIN_TREE,
        rendererHandoff: rendererHandoffKit.describe(summary.state)
      };
    }
  };
}

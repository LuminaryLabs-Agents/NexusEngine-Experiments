const stableArray = (value) => Array.isArray(value) ? [...value] : [];
const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, n(value, min)));
const clamp01 = (value) => clamp(value, 0, 1);
const round = (value, digits = 3) => Number(n(value).toFixed(digits));
const lower = (value) => String(value ?? "").toLowerCase();

function rendererContract(owner) {
  return {
    owner,
    rendererConsumes: "living agent market guardian descriptors only",
    rendererMustOwn: ["DOM placement", "Canvas draw order", "color application", "button affordances", "view interpolation"],
    rendererMustNotOwn: ["agent choice truth", "market facts", "browser input", "ONNX session", "Hugging Face loader", "asset loading", "audio", "frame loop", "Three.js", "WebGL"]
  };
}

function factsText(input = {}) {
  const facts = stableArray(input.world?.facts).join(" ");
  return lower([input.vision, facts, input.world?.guard?.bubble, input.lastChoice?.label ?? input.world?.lastChoice?.label].filter(Boolean).join(" "));
}

function currentActions(input = {}) {
  if (Array.isArray(input.actions)) return input.actions.map(String);
  if (Array.isArray(input.availableActions)) return input.availableActions.map(String);
  const actions = ["patrol market", "warn player", "question merchant"];
  if (input.world?.apple?.stolen) actions.push("accuse player");
  if (!input.world?.apple?.stolen && input.world?.gate?.locked !== false) actions.push("unlock gate");
  return actions;
}

function appleRisk(input = {}) {
  const text = factsText(input);
  const stolen = Boolean(input.world?.apple?.stolen) || text.includes("apple stolen: true") || text.includes("stole apple");
  const returned = text.includes("returned apple") || text.includes("apple stolen: false");
  return clamp01((stolen ? 0.7 : 0.12) + (returned ? -0.42 : 0) + (lower(input.world?.guard?.mood).includes("suspicious") ? 0.18 : 0));
}

function gateRisk(input = {}) {
  const locked = input.world?.gate?.locked !== false && !factsText(input).includes("gate locked: false");
  const choice = lower(input.world?.lastChoice?.label ?? input.lastChoice?.label);
  return clamp01((locked ? 0.42 : 0.12) + (choice.includes("unlock") ? -0.24 : 0) + appleRisk(input) * 0.22);
}

function trustScore(input = {}) {
  const text = factsText(input);
  const last = lower(input.world?.lastChoice?.label ?? input.lastChoice?.label);
  return clamp01(0.58 + (text.includes("returned apple") ? 0.22 : 0) + (last.includes("question merchant") ? 0.08 : 0) - appleRisk(input) * 0.34);
}

function urgency(input = {}) {
  const status = lower(input.world?.model?.status ?? input.model?.status);
  const needsLoad = !status.includes("loaded") && !status.includes("fallback");
  return clamp01(appleRisk(input) * 0.46 + gateRisk(input) * 0.22 + (needsLoad ? 0.18 : 0.08) + (stableArray(input.world?.trace).length > 6 ? 0.08 : 0));
}

export const LIVING_AGENT_MARKET_GUARDIAN_READINESS_DOMAIN_TREE = Object.freeze({
  root: "living-agent-market-guardian-readiness-domain",
  subdomains: [
    {
      id: "perception-evidence-domain",
      subdomains: [
        { id: "guard-sightline-domain", kits: ["living-agent-guard-sightline-kit"] },
        { id: "witness-statement-domain", kits: ["living-agent-witness-statement-kit"] }
      ]
    },
    {
      id: "decision-pressure-domain",
      subdomains: [
        { id: "accusation-threshold-domain", kits: ["living-agent-accusation-threshold-kit"] },
        { id: "gate-duty-domain", kits: ["living-agent-gate-duty-kit"] }
      ]
    },
    {
      id: "consequence-handoff-domain",
      subdomains: [
        { id: "restitution-path-domain", kits: ["living-agent-restitution-path-kit"] },
        { id: "trust-ledger-domain", kits: ["living-agent-trust-ledger-kit"] }
      ]
    },
    {
      id: "renderer-handoff",
      kits: ["living-agent-market-guardian-renderer-handoff-kit"],
      contract: "renderer consumes descriptors only"
    }
  ],
  contract: "renderer consumes living agent market guardian descriptors only; no DOM, browser input, Three.js, WebGL, audio, asset loading, ONNX session, Hugging Face loader, or frame-loop ownership"
});

export function createLivingAgentGuardSightlineKit({ maxSightlines = 3 } = {}) {
  return {
    id: "living-agent-guard-sightline-kit",
    domain: "living-agent-market-guardian-readiness/perception-evidence-domain/guard-sightline-domain",
    describe(input = {}) {
      const world = input.world ?? {};
      const guard = world.guard ?? { x: 480, y: 250 };
      const targets = [
        ["player", world.player ?? { x: 170, y: 300 }],
        ["apple", world.apple ?? { x: 310, y: 330 }],
        ["gate", world.gate ?? { x: 650, y: 290 }]
      ];
      const risk = appleRisk(input);
      return targets.slice(0, maxSightlines).map(([label, entity], index) => {
        const distance = Math.hypot(n(entity.x) - n(guard.x), n(entity.y) - n(guard.y));
        const visibility = clamp01(1 - distance / 760 + risk * 0.22 - index * 0.04);
        return {
          id: `market-sightline-${label}`,
          kind: "market-guardian-sightline",
          label,
          from: { x: round(guard.x), y: round(guard.y) },
          to: { x: round(entity.x), y: round(entity.y) },
          visibility: round(visibility),
          status: visibility > 0.72 ? "clear-watch" : visibility > 0.44 ? "partial-watch" : "blind-spot",
          rendererContract: rendererContract("living-agent-guard-sightline-kit")
        };
      });
    },
    snapshot(input) {
      const sightlines = this.describe(input);
      return { sightlines: sightlines.length, blindSpots: sightlines.filter((item) => item.status === "blind-spot").length };
    }
  };
}

export function createLivingAgentWitnessStatementKit({ maxStatements = 4 } = {}) {
  return {
    id: "living-agent-witness-statement-kit",
    domain: "living-agent-market-guardian-readiness/perception-evidence-domain/witness-statement-domain",
    describe(input = {}) {
      const facts = stableArray(input.world?.facts).slice(0, maxStatements);
      const merchantMood = lower(input.world?.merchant?.mood || "neutral");
      const risk = appleRisk(input);
      const base = facts.length ? facts : ["market is quiet"];
      return base.map((fact, index) => {
        const credibility = clamp01(0.48 + (merchantMood.includes("nervous") ? -0.12 : 0.08) + (lower(fact).includes("stole") ? 0.24 : 0) - index * 0.04);
        return {
          id: `witness-statement-${index}`,
          kind: "market-witness-statement",
          statement: String(fact),
          credibility: round(credibility),
          urgency: round(clamp01(risk * 0.64 + (1 - credibility) * 0.18 + index * 0.03)),
          status: credibility > 0.68 ? "usable" : credibility > 0.42 ? "needs-corroboration" : "weak",
          rendererContract: rendererContract("living-agent-witness-statement-kit")
        };
      });
    },
    snapshot(input) {
      const statements = this.describe(input);
      return { statements: statements.length, usable: statements.filter((item) => item.status === "usable").length };
    }
  };
}

export function createLivingAgentAccusationThresholdKit() {
  return {
    id: "living-agent-accusation-threshold-kit",
    domain: "living-agent-market-guardian-readiness/decision-pressure-domain/accusation-threshold-domain",
    describe(input = {}) {
      const risk = appleRisk(input);
      const actions = currentActions(input);
      const canAccuse = actions.includes("accuse player");
      const threshold = clamp01(0.64 - risk * 0.28 + (canAccuse ? -0.12 : 0.08));
      const pressure = clamp01(risk * 0.8 + (canAccuse ? 0.16 : 0));
      return [{
        id: "accusation-threshold",
        kind: "market-accusation-threshold",
        threshold: round(threshold),
        pressure: round(pressure),
        recommendedAction: pressure > threshold ? "accuse player" : pressure > 0.44 ? "warn player" : "patrol market",
        status: pressure > threshold ? "ready-to-accuse" : pressure > 0.44 ? "warn-first" : "observe",
        rendererContract: rendererContract("living-agent-accusation-threshold-kit")
      }];
    },
    snapshot(input) {
      const [threshold] = this.describe(input);
      return { status: threshold.status, pressure: threshold.pressure };
    }
  };
}

export function createLivingAgentGateDutyKit() {
  return {
    id: "living-agent-gate-duty-kit",
    domain: "living-agent-market-guardian-readiness/decision-pressure-domain/gate-duty-domain",
    describe(input = {}) {
      const risk = gateRisk(input);
      const locked = input.world?.gate?.locked !== false;
      const trust = trustScore(input);
      return [{
        id: "gate-duty-check",
        kind: "market-gate-duty",
        locked,
        releaseConfidence: round(clamp01(trust * 0.62 + (locked ? 0.04 : 0.3) - risk * 0.28)),
        risk: round(risk),
        status: !locked ? "open" : trust > 0.7 && risk < 0.42 ? "unlock-ok" : "hold-gate",
        rendererContract: rendererContract("living-agent-gate-duty-kit")
      }];
    },
    snapshot(input) {
      const [gate] = this.describe(input);
      return { status: gate.status, releaseConfidence: gate.releaseConfidence };
    }
  };
}

export function createLivingAgentRestitutionPathKit({ maxSteps = 3 } = {}) {
  return {
    id: "living-agent-restitution-path-kit",
    domain: "living-agent-market-guardian-readiness/consequence-handoff-domain/restitution-path-domain",
    describe(input = {}) {
      const risk = appleRisk(input);
      const returned = factsText(input).includes("returned apple") || input.world?.apple?.stolen === false;
      const steps = returned
        ? ["confirm apple returned", "thank merchant", "restore market trust"]
        : ["recover apple", "question merchant", "guide player to restitution"];
      return steps.slice(0, maxSteps).map((step, index) => ({
        id: `restitution-path-${index}`,
        kind: "market-restitution-path",
        step,
        order: index + 1,
        readiness: round(clamp01((returned ? 0.72 : 0.38) + index * 0.08 - risk * 0.12)),
        status: returned ? "restoring" : index === 0 ? "urgent" : "pending",
        rendererContract: rendererContract("living-agent-restitution-path-kit")
      }));
    },
    snapshot(input) {
      const steps = this.describe(input);
      return { steps: steps.length, urgent: steps.filter((item) => item.status === "urgent").length };
    }
  };
}

export function createLivingAgentTrustLedgerKit({ maxEntries = 5 } = {}) {
  return {
    id: "living-agent-trust-ledger-kit",
    domain: "living-agent-market-guardian-readiness/consequence-handoff-domain/trust-ledger-domain",
    describe(input = {}) {
      const trace = stableArray(input.world?.trace).slice(0, maxEntries);
      const score = trustScore(input);
      const entries = trace.length ? trace : [`trust score ${round(score, 2)}`];
      return entries.map((entry, index) => ({
        id: `trust-ledger-${index}`,
        kind: "market-trust-ledger-entry",
        entry: String(entry),
        trustScore: round(clamp01(score - index * 0.025)),
        status: score > 0.68 ? "trusted" : score > 0.42 ? "watch" : "fragile",
        rendererContract: rendererContract("living-agent-trust-ledger-kit")
      }));
    },
    snapshot(input) {
      const entries = this.describe(input);
      return { entries: entries.length, trusted: entries.filter((item) => item.status === "trusted").length };
    }
  };
}

export function createLivingAgentMarketGuardianRendererHandoffKit() {
  return {
    id: "living-agent-market-guardian-renderer-handoff-kit",
    domain: "living-agent-market-guardian-readiness/renderer-handoff",
    compose(groups = {}, summary = {}) {
      const descriptors = {
        guardSightlines: stableArray(groups.guardSightlines),
        witnessStatements: stableArray(groups.witnessStatements),
        accusationThresholds: stableArray(groups.accusationThresholds),
        gateDutyChecks: stableArray(groups.gateDutyChecks),
        restitutionPaths: stableArray(groups.restitutionPaths),
        trustLedgerEntries: stableArray(groups.trustLedgerEntries)
      };
      const counts = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, value.length]));
      counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
      return {
        id: "living-agent-market-guardian-renderer-handoff",
        rendererConsumes: "descriptors-only",
        descriptors,
        counts,
        summary,
        rendererContract: rendererContract("living-agent-market-guardian-renderer-handoff-kit")
      };
    }
  };
}

export function createLivingAgentMarketGuardianReadinessDomainKit() {
  const kits = {
    guardSightline: createLivingAgentGuardSightlineKit(),
    witnessStatement: createLivingAgentWitnessStatementKit(),
    accusationThreshold: createLivingAgentAccusationThresholdKit(),
    gateDuty: createLivingAgentGateDutyKit(),
    restitutionPath: createLivingAgentRestitutionPathKit(),
    trustLedger: createLivingAgentTrustLedgerKit(),
    rendererHandoff: createLivingAgentMarketGuardianRendererHandoffKit()
  };
  return {
    id: "living-agent-market-guardian-readiness-domain-kit",
    domainTree: LIVING_AGENT_MARKET_GUARDIAN_READINESS_DOMAIN_TREE,
    kits,
    describe(input = {}) {
      const groups = {
        guardSightlines: kits.guardSightline.describe(input),
        witnessStatements: kits.witnessStatement.describe(input),
        accusationThresholds: kits.accusationThreshold.describe(input),
        gateDutyChecks: kits.gateDuty.describe(input),
        restitutionPaths: kits.restitutionPath.describe(input),
        trustLedgerEntries: kits.trustLedger.describe(input)
      };
      const summary = {
        readiness: round(clamp01(trustScore(input) * 0.44 + (1 - urgency(input)) * 0.3 + (1 - gateRisk(input)) * 0.18 + 0.08)),
        urgency: round(urgency(input)),
        trust: round(trustScore(input)),
        evidenceRisk: round(appleRisk(input)),
        recommendedAction: groups.accusationThresholds[0]?.recommendedAction ?? "patrol market"
      };
      return {
        id: "living-agent-market-guardian-readiness",
        domainTree: this.domainTree,
        ...groups,
        summary,
        rendererHandoff: kits.rendererHandoff.compose(groups, summary)
      };
    },
    snapshot(input = {}) {
      const described = this.describe(input);
      return {
        readiness: described.summary.readiness,
        urgency: described.summary.urgency,
        descriptors: described.rendererHandoff.counts.total
      };
    }
  };
}

const SIGNAL_BASTION_COMMAND_TREE = `signal-bastion-command-fractal-domain
├─ battlefield-readability
│  ├─ path-threat-domain
│  │  └─ bastion-path-threat-gradient-kit
│  └─ enemy-intent-domain
│     └─ bastion-enemy-intent-thread-kit
├─ command-economy-domain
│  ├─ economy-flow-domain
│  │  └─ bastion-economy-flow-ribbon-kit
│  ├─ tower-synergy-domain
│  │  └─ bastion-tower-synergy-cell-kit
│  └─ command-choice-domain
│     └─ bastion-command-choice-band-kit
├─ wave-readiness-domain
│  └─ bastion-wave-readiness-glyph-kit
└─ renderer-handoff
   └─ bastion-command-renderer-handoff-kit
      └─ renderer consumes descriptors only`;

const DEFAULT_COLORS = Object.freeze({
  threat: "#ff7a5c",
  economy: "#ffe36d",
  synergy: "#6bf0b8",
  intent: "#ff7f7a",
  command: "#8bd3ff",
  ready: "#f7a8ff"
});

function number(value, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, number(value, min)));
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return Object.values(value);
  return [];
}

function getPresentation(input = {}) {
  return input.presentation?.rawSnapshot ? input.presentation : input.rawSnapshot ? input : { rawSnapshot: input };
}

function getRaw(input = {}) {
  return getPresentation(input).rawSnapshot ?? {};
}

function point(value = {}) {
  return {
    x: number(value.x),
    y: number(value.y),
    z: number(value.z)
  };
}

function midpoint(a = {}, b = {}) {
  return {
    x: (number(a.x) + number(b.x)) * 0.5,
    y: (number(a.y) + number(b.y)) * 0.5,
    z: (number(a.z) + number(b.z)) * 0.5
  };
}

function nearestPoint(source, points) {
  let best = points[0] ?? { x: 0, y: 0, z: 0 };
  let bestDistance = Infinity;
  for (const candidate of points) {
    const distance = Math.hypot(number(source.x) - number(candidate.x), number(source.y) - number(candidate.y));
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return point(best);
}

function makeId(prefix, parts = []) {
  return [prefix, ...parts].map((part) => String(part).replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-|-$/g, "")).filter(Boolean).join(":");
}

function getMap(raw) {
  return raw.map ?? raw.level?.map ?? {};
}

function getPath(raw) {
  const path = asArray(getMap(raw).path).map(point);
  if (path.length >= 2) return path;
  return [
    { x: 80, y: 440, z: 0 },
    { x: 250, y: 330, z: 0 },
    { x: 520, y: 280, z: 0 },
    { x: 780, y: 160, z: 0 }
  ];
}

function getVital(raw) {
  return point(getMap(raw).vital ?? { x: 820, y: 135, z: 0 });
}

function getStructures(raw) {
  return asArray(raw.structures?.structures ?? raw.structures ?? raw.towers).filter((item) => item && typeof item === "object");
}

function getAgents(raw) {
  return asArray(raw.agents?.active ?? raw.agents ?? raw.enemies).filter((item) => item && typeof item === "object");
}

function getBuildCatalog(raw, input) {
  const preset = input.preset ?? {};
  return asArray(input.buildCatalog ?? raw.buildCatalog ?? preset.level?.buildOrder ?? preset.buildOrder).filter(Boolean);
}

export function createBastionPathThreatGradientKit() {
  return {
    id: "bastion-path-threat-gradient-kit",
    kind: "descriptor-kit",
    describe(input = {}) {
      const raw = getRaw(input);
      const path = getPath(raw);
      const waveIndex = number(raw.session?.waveIndex ?? raw.wave?.index ?? raw.waveIndex);
      const activeAgents = getAgents(raw).length;
      const segments = [];
      for (let index = 0; index < path.length - 1; index += 1) {
        const pressure = clamp((activeAgents * 0.08) + (waveIndex * 0.035) + (index / Math.max(1, path.length - 1)) * 0.42);
        segments.push({
          id: makeId("path-threat", [index]),
          kind: "path-threat-segment",
          from: path[index],
          to: path[index + 1],
          mid: midpoint(path[index], path[index + 1]),
          pressure,
          width: 18 + pressure * 34,
          color: DEFAULT_COLORS.threat,
          pulse: 0.2 + pressure * 0.8
        });
      }
      return {
        id: "bastion-path-threat-gradient",
        kind: "path-threat-gradient",
        rendererNeutral: true,
        segments
      };
    }
  };
}

export function createBastionEconomyFlowRibbonKit() {
  return {
    id: "bastion-economy-flow-ribbon-kit",
    kind: "descriptor-kit",
    describe(input = {}) {
      const raw = getRaw(input);
      const map = getMap(raw);
      const slots = asArray(map.slots).map(point).slice(0, 8);
      const vital = getVital(raw);
      const credits = number(raw.economy?.wallet?.credits ?? raw.wallet?.credits ?? raw.economy?.credits);
      const intensity = clamp(credits / 650, 0.18, 1);
      const ribbons = slots.map((slot, index) => ({
        id: makeId("economy-ribbon", [index]),
        kind: "economy-flow-ribbon",
        from: vital,
        to: slot,
        mid: midpoint(vital, slot),
        value: Math.round(credits),
        intensity,
        width: 4 + intensity * 8,
        color: DEFAULT_COLORS.economy
      }));
      return {
        id: "bastion-economy-flow-ribbons",
        kind: "economy-flow-ribbon-set",
        rendererNeutral: true,
        credits,
        ribbons
      };
    }
  };
}

export function createBastionTowerSynergyCellKit() {
  return {
    id: "bastion-tower-synergy-cell-kit",
    kind: "descriptor-kit",
    describe(input = {}) {
      const raw = getRaw(input);
      const structures = getStructures(raw);
      const cells = structures.map((structure, index) => {
        const level = number(structure.level, 1);
        const range = number(structure.range, number(structure.radius, 95));
        const neighbors = structures.filter((candidate) => candidate !== structure && Math.hypot(number(candidate.x) - number(structure.x), number(candidate.y) - number(structure.y)) <= Math.max(150, range * 0.75)).length;
        return {
          id: makeId("tower-synergy", [structure.id ?? index]),
          kind: "tower-synergy-cell",
          center: point(structure),
          radius: Math.max(48, range * 0.28 + level * 8),
          range,
          level,
          neighbors,
          synergy: clamp((neighbors * 0.22) + (level * 0.16), 0.12, 1),
          color: structure.color ?? DEFAULT_COLORS.synergy
        };
      });
      return {
        id: "bastion-tower-synergy-cells",
        kind: "tower-synergy-cell-set",
        rendererNeutral: true,
        cells
      };
    }
  };
}

export function createBastionEnemyIntentThreadKit() {
  return {
    id: "bastion-enemy-intent-thread-kit",
    kind: "descriptor-kit",
    describe(input = {}) {
      const raw = getRaw(input);
      const path = getPath(raw);
      const vital = getVital(raw);
      const agents = getAgents(raw).slice(0, 18);
      const threads = agents.map((agent, index) => {
        const source = point(agent);
        const target = agent.target ? point(agent.target) : nearestPoint(source, [...path, vital]);
        const hp = clamp(number(agent.health ?? agent.hp, 1) / Math.max(1, number(agent.maxHealth ?? agent.maxHp, 1)));
        return {
          id: makeId("enemy-intent", [agent.id ?? index]),
          kind: "enemy-intent-thread",
          from: source,
          to: target,
          mid: midpoint(source, target),
          danger: clamp((agent.boss ? 0.45 : 0.12) + (1 - hp) * 0.22 + number(agent.speed, 1) * 0.08),
          color: agent.color ?? DEFAULT_COLORS.intent,
          width: agent.boss ? 5 : 2.5
        };
      });
      return {
        id: "bastion-enemy-intent-threads",
        kind: "enemy-intent-thread-set",
        rendererNeutral: true,
        threads
      };
    }
  };
}

export function createBastionWaveReadinessGlyphKit() {
  return {
    id: "bastion-wave-readiness-glyph-kit",
    kind: "descriptor-kit",
    describe(input = {}) {
      const raw = getRaw(input);
      const waveIndex = number(raw.session?.waveIndex ?? raw.wave?.index ?? raw.waveIndex);
      const wave = raw.level?.waves?.[waveIndex] ?? raw.wave ?? {};
      const active = Boolean(raw.session?.waveActive ?? raw.wave?.active);
      const queueCount = asArray(wave.spawnQueue ?? wave.queue ?? wave.enemies).length;
      const center = getVital(raw);
      return {
        id: "bastion-wave-readiness-glyph",
        kind: "wave-readiness-glyph",
        rendererNeutral: true,
        center,
        waveIndex,
        active,
        queueCount,
        label: active ? `WAVE ${waveIndex + 1} ACTIVE` : `WAVE ${waveIndex + 1} READY`,
        urgency: clamp((active ? 0.55 : 0.18) + queueCount * 0.045),
        rings: [0, 1, 2].map((ring) => ({
          id: makeId("wave-ring", [ring]),
          kind: "wave-readiness-ring",
          center,
          radius: 42 + ring * 28 + queueCount * 1.2,
          opacity: 0.22 + ring * 0.08,
          color: active ? DEFAULT_COLORS.threat : DEFAULT_COLORS.ready
        }))
      };
    }
  };
}

export function createBastionCommandChoiceBandKit() {
  return {
    id: "bastion-command-choice-band-kit",
    kind: "descriptor-kit",
    describe(input = {}) {
      const raw = getRaw(input);
      const catalog = getBuildCatalog(raw, input);
      const activeBlueprint = input.activeBlueprint ?? raw.activeBlueprint ?? raw.build?.selectedBlueprint ?? catalog[0]?.id ?? null;
      const credits = number(raw.economy?.wallet?.credits ?? raw.wallet?.credits ?? raw.economy?.credits);
      const options = catalog.map((entry, index) => {
        const id = entry.id ?? entry.towerType ?? entry.name ?? `option-${index}`;
        const cost = number(entry.cost?.credits ?? entry.cost ?? entry.price);
        return {
          id: makeId("command-choice", [id]),
          kind: "command-choice-option",
          blueprintId: String(id),
          label: String(entry.label ?? entry.name ?? id),
          role: String(entry.role ?? entry.kind ?? "tower"),
          selected: String(id) === String(activeBlueprint),
          affordable: credits >= cost,
          cost,
          index,
          color: entry.color ?? DEFAULT_COLORS.command
        };
      });
      return {
        id: "bastion-command-choice-band",
        kind: "command-choice-band",
        rendererNeutral: true,
        activeBlueprint,
        options
      };
    }
  };
}

export function createBastionCommandRendererHandoffKit() {
  return {
    id: "bastion-command-renderer-handoff-kit",
    kind: "descriptor-kit",
    describe(parts = {}) {
      const descriptors = [
        parts.pathThreat,
        parts.economyFlow,
        parts.towerSynergy,
        parts.enemyIntent,
        parts.waveReadiness,
        parts.commandChoices
      ].filter(Boolean);
      return {
        id: "bastion-command-renderer-handoff",
        kind: "renderer-handoff",
        rendererNeutral: true,
        policy: {
          rendererConsumesDescriptorsOnly: true,
          noDomOwnership: true,
          noInputOwnership: true,
          noFrameLoopOwnership: true,
          noWebglOwnership: true,
          noAudioOwnership: true,
          noAssetLoadingOwnership: true
        },
        descriptors,
        counts: {
          descriptors: descriptors.length,
          pathSegments: parts.pathThreat?.segments?.length ?? 0,
          economyRibbons: parts.economyFlow?.ribbons?.length ?? 0,
          synergyCells: parts.towerSynergy?.cells?.length ?? 0,
          intentThreads: parts.enemyIntent?.threads?.length ?? 0,
          commandOptions: parts.commandChoices?.options?.length ?? 0
        }
      };
    }
  };
}

export function createSignalBastionCommandFractalDomainKit() {
  const pathThreatKit = createBastionPathThreatGradientKit();
  const economyFlowKit = createBastionEconomyFlowRibbonKit();
  const towerSynergyKit = createBastionTowerSynergyCellKit();
  const enemyIntentKit = createBastionEnemyIntentThreadKit();
  const waveReadinessKit = createBastionWaveReadinessGlyphKit();
  const commandChoiceKit = createBastionCommandChoiceBandKit();
  const handoffKit = createBastionCommandRendererHandoffKit();
  return {
    id: "signal-bastion-command-fractal-domain-kit",
    kind: "composite-descriptor-kit",
    tree: SIGNAL_BASTION_COMMAND_TREE,
    describe(input = {}) {
      const pathThreat = pathThreatKit.describe(input);
      const economyFlow = economyFlowKit.describe(input);
      const towerSynergy = towerSynergyKit.describe(input);
      const enemyIntent = enemyIntentKit.describe(input);
      const waveReadiness = waveReadinessKit.describe(input);
      const commandChoices = commandChoiceKit.describe(input);
      const rendererHandoff = handoffKit.describe({ pathThreat, economyFlow, towerSynergy, enemyIntent, waveReadiness, commandChoices });
      return {
        id: "signal-bastion-command-fractal-domain",
        kind: "command-fractal-domain",
        rendererNeutral: true,
        tree: SIGNAL_BASTION_COMMAND_TREE,
        pathThreat,
        economyFlow,
        towerSynergy,
        enemyIntent,
        waveReadiness,
        commandChoices,
        rendererHandoff
      };
    }
  };
}

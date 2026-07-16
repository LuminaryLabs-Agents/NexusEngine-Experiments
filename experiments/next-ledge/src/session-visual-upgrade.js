import * as NexusEngine from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@main/src/index.js";
import { createParallaxKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/parallax-kit/index.js";
import { createConfigurableRenderLayerKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/configurable-render-layer-kit/index.js";
import { createNextLedgeSession as createBaseNextLedgeSession } from "./session.js?v=mastery-crest-1";
import {
  createNextLedgeParallaxInput,
  createNextLedgeRenderStyleInput,
  createNextLedgeVisualQualityReport
} from "./next-ledge-visual-domain.js";
import { createNextLedgeVisualFractalDomainKit } from "./visual-fractal-kits.js";

function createRuntimeEngine(options = {}) {
  const createEngine = NexusEngine.createRealtimeGame ?? NexusEngine.createRealtimeEngine ?? NexusEngine.createEngine;
  if (typeof createEngine !== "function") {
    throw new Error("NexusEngine CDN runtime did not expose createRealtimeGame/createRealtimeEngine/createEngine.");
  }
  return createEngine(options);
}

function createHeadlessRenderer() {
  if (typeof NexusEngine.createRenderer === "function") return NexusEngine.createRenderer("headless");
  if (typeof NexusEngine.createHeadlessRenderer === "function") return NexusEngine.createHeadlessRenderer();
  return undefined;
}

function createVisualEngine() {
  return createRuntimeEngine({
    kits: [
      createParallaxKit(NexusEngine, createNextLedgeParallaxInput({})),
      createConfigurableRenderLayerKit(NexusEngine, createNextLedgeRenderStyleInput({}))
    ],
    renderer: createHeadlessRenderer()
  });
}

export function createNextLedgeSession(options = {}) {
  const base = createBaseNextLedgeSession(options);
  const visualEngine = createVisualEngine();
  const visualFractal = createNextLedgeVisualFractalDomainKit(options.visualFractal ?? {});

  function decorate(snapshot = {}) {
    const parallaxInput = createNextLedgeParallaxInput(snapshot);
    visualEngine.parallax?.configure?.(parallaxInput, "next-ledge-visual-sync");
    visualEngine.tick?.(0);

    const parallaxSnapshot = visualEngine.parallax?.getDescriptors?.() ?? null;
    const renderStyleInput = createNextLedgeRenderStyleInput(snapshot, parallaxSnapshot);
    visualEngine.configurableRenderLayers?.configure?.(renderStyleInput, "next-ledge-style-sync");
    visualEngine.tick?.(0);

    const renderStyleSnapshot = visualEngine.configurableRenderLayers?.getResolvedLayers?.() ?? null;
    const fractalSnapshot = visualFractal.compose(snapshot);
    return {
      ...snapshot,
      domain: {
        ...(snapshot.domain ?? {}),
        parallax: parallaxSnapshot,
        renderStyles: renderStyleSnapshot,
        visualFractal: fractalSnapshot,
        visualQuality: {
          ...createNextLedgeVisualQualityReport(snapshot, parallaxSnapshot, renderStyleSnapshot),
          uses: [
            "parallax-kit",
            "configurable-render-layer-kit",
            "next-ledge-visual-fractal-domain-kit",
            "cliff-strata-band-kit",
            "cliff-crack-vein-kit",
            "anchor-aura-ring-kit",
            "rope-braid-segment-kit",
            "cloud-wisp-strip-kit",
            "danger-fall-streak-kit"
          ],
          visualFractalDescriptors:
            fractalSnapshot.cliffStrata.length +
            fractalSnapshot.cliffCracks.length +
            fractalSnapshot.anchorAuras.length +
            fractalSnapshot.ropeBraids.length +
            fractalSnapshot.cloudWisps.length +
            fractalSnapshot.fallStreaks.length
        }
      }
    };
  }

  function update(dt, input = {}) {
    return decorate(base.update(dt, input));
  }

  function snapshot() {
    return decorate(base.snapshot());
  }

  return {
    ...base,
    visualEngine,
    update,
    snapshot
  };
}

export default createNextLedgeSession;

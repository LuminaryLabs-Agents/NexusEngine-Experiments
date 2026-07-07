export function createOnnxLocalModelKit() {
  const config = {
    modelName: "Qwen2.5 2B Instruct",
    format: "ONNX",
    quantization: "2-bit",
    runtime: "ONNX Runtime Web",
    cacheName: "workshop-qwen25-2b-onnx-cache-v1",
    manifestUrl: "",
    files: ["model.onnx", "tokenizer.json", "tokenizer_config.json", "generation_config.json", "special_tokens_map.json"]
  };

  const state = {
    status: localStorage.getItem("workshop.model.status") || "not-installed",
    backend: "checking",
    progress: Number(localStorage.getItem("workshop.model.progress") || 0),
    message: "Local model is optional. Fallback workshop answers are available now.",
    canUseWebGPU: false,
    canUseWasm: true,
    hasOrt: false,
    sessionReady: false,
    lastError: ""
  };

  const listeners = new Set();
  function emit() { for (const listener of listeners) listener(getState()); }
  function subscribe(listener) { listeners.add(listener); listener(getState()); return () => listeners.delete(listener); }

  async function checkCapabilities() {
    state.canUseWebGPU = Boolean(navigator.gpu);
    state.canUseWasm = typeof WebAssembly !== "undefined";
    state.backend = state.canUseWebGPU ? "WebGPU preferred" : "WASM fallback";
    state.hasOrt = Boolean(globalThis.ort);
    state.message = state.hasOrt ? "ONNX Runtime Web detected." : "ONNX Runtime Web is not loaded yet. Fallback object chat remains active.";
    emit();
    return getState();
  }

  function setModelSource({ manifestUrl = "", files = [] } = {}) {
    config.manifestUrl = manifestUrl;
    if (files.length) config.files = files;
    state.message = manifestUrl ? "Model source configured." : "Model source cleared. Add hosted model URLs before installing the real model.";
    emit();
  }

  async function install() {
    await checkCapabilities();
    state.status = "downloading";
    state.progress = 0;
    state.lastError = "";
    localStorage.setItem("workshop.model.status", state.status);
    emit();

    if (!config.manifestUrl) {
      state.status = "needs-source";
      state.message = "No Qwen2.5 2B ONNX source URL is configured yet. Fallback object chat remains active.";
      localStorage.setItem("workshop.model.status", state.status);
      emit();
      return getState();
    }

    try {
      const base = config.manifestUrl.replace(/\/$/, "");
      const urls = config.files.map((file) => `${base}/${file}`);
      const cache = await caches.open(config.cacheName);
      for (let i = 0; i < urls.length; i++) {
        const response = await fetch(urls[i], { cache: "reload" });
        if (!response.ok) throw new Error(`Failed to fetch ${urls[i]}: ${response.status}`);
        await cache.put(urls[i], response.clone());
        state.progress = Math.round(((i + 1) / urls.length) * 100);
        state.message = `Cached ${i + 1} of ${urls.length} model files.`;
        localStorage.setItem("workshop.model.progress", String(state.progress));
        emit();
      }
      state.status = "cached";
      state.message = "Model files are cached. Runtime session creation can be enabled after the exact ONNX graph path is configured.";
      localStorage.setItem("workshop.model.status", state.status);
      emit();
      return getState();
    } catch (error) {
      state.status = "failed";
      state.lastError = error?.message || String(error);
      state.message = state.lastError;
      localStorage.setItem("workshop.model.status", state.status);
      emit();
      return getState();
    }
  }

  async function clearCache() {
    await caches.delete(config.cacheName);
    state.status = "not-installed";
    state.progress = 0;
    state.sessionReady = false;
    state.message = "Cached model files cleared.";
    localStorage.setItem("workshop.model.status", state.status);
    localStorage.setItem("workshop.model.progress", "0");
    emit();
    return getState();
  }

  async function unload() {
    state.sessionReady = false;
    state.status = state.status === "ready" ? "cached" : state.status;
    state.message = "Runtime session unloaded. Cached files were kept.";
    emit();
    return getState();
  }

  function fallbackAnswer({ object, question }) {
    if (!object) return "Select a workshop object first, then ask how to use it, what it works with, or what safety issue to watch for.";
    const q = (question || "").toLowerCase();
    if (q.includes("safe") || q.includes("danger") || q.includes("risk")) return object.quick?.safety || object.context;
    if (q.includes("how") || q.includes("use")) return object.quick?.use || object.context;
    if (q.includes("work") || q.includes("with") || q.includes("other")) return object.quick?.works || object.context;
    if (q.includes("part") || q.includes("made")) return `${object.label} has these key parts: ${(object.parts || []).join(", ")}.`;
    return object.context || `${object.label} is a ${object.type || "workshop object"}.`;
  }

  function buildPrompt({ object, room, question }) {
    return [
      "You are a practical workshop assistant.",
      "Answer briefly and focus on safe, useful workshop guidance.",
      "",
      `Room: ${room || "first-person workshop"}`,
      `Object: ${object?.label || "none"}`,
      `Type: ${object?.type || "unknown"}`,
      `Parts: ${(object?.parts || []).join(", ") || "unknown"}`,
      "",
      `Question: ${question || "What is this?"}`
    ].join("\n");
  }

  async function answer({ object, room, question }) {
    const prompt = buildPrompt({ object, room, question });
    return { source: state.sessionReady ? "onnx" : "fallback", prompt, text: fallbackAnswer({ object, question }) };
  }

  function getState() {
    return { ...state, modelName: config.modelName, format: config.format, quantization: config.quantization, runtime: config.runtime, cacheName: config.cacheName, manifestUrl: config.manifestUrl, files: [...config.files] };
  }

  checkCapabilities();
  return { id: "onnx-local-model-kit", label: "Local Model Kit", getState, subscribe, checkCapabilities, install, unload, clearCache, setModelSource, answer, buildPrompt };
}

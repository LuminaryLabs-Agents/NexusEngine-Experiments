export function createOnnxLocalModelKit() {
  const DEFAULT_SOURCE_BASE_URL = "https://huggingface.co/onnx-community/Qwen2.5-1.5B-Instruct/resolve/main";

  const config = {
    modelName: "Qwen2.5 1.5B Instruct",
    modelId: "onnx-community/Qwen2.5-1.5B-Instruct",
    format: "ONNX",
    quantization: "Q4F16",
    runtime: "ONNX Runtime Web",
    cacheName: "workshop-qwen25-15b-onnx-q4f16-cache-v1",
    sourceBaseUrl: localStorage.getItem("workshop.model.sourceBaseUrl") || DEFAULT_SOURCE_BASE_URL,
    modelFile: "onnx/model_q4f16.onnx",
    files: [
      "onnx/model_q4f16.onnx",
      "tokenizer.json",
      "tokenizer_config.json",
      "generation_config.json",
      "special_tokens_map.json"
    ],
    ortScriptUrl: "https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js"
  };

  const state = {
    status: localStorage.getItem("workshop.model.status") || "not-installed",
    backend: "checking",
    progress: Number(localStorage.getItem("workshop.model.progress") || 0),
    message: "Local model is optional. Fallback workshop answers are available now.",
    canUseWebGPU: false,
    canUseWasm: typeof WebAssembly !== "undefined",
    deviceMemory: navigator.deviceMemory || null,
    hasOrt: Boolean(globalThis.ort),
    sessionReady: false,
    tokenizerReady: false,
    lastError: ""
  };

  const listeners = new Set();
  let session = null;
  let tokenizerConfig = null;
  let runtimeLoadPromise = null;

  function emit() {
    for (const listener of listeners) listener(getState());
  }

  function subscribe(listener) {
    listeners.add(listener);
    listener(getState());
    return () => listeners.delete(listener);
  }

  function modelUrl(file) {
    return `${config.sourceBaseUrl.replace(/\/$/, "")}/${file}`;
  }

  async function checkCapabilities() {
    state.canUseWebGPU = Boolean(navigator.gpu);
    state.canUseWasm = typeof WebAssembly !== "undefined";
    state.hasOrt = Boolean(globalThis.ort);
    state.backend = state.canUseWebGPU ? "WebGPU preferred" : "WASM fallback";
    state.message = state.hasOrt ? "ONNX Runtime Web detected." : "ONNX Runtime Web can be loaded when installing.";
    emit();
    return getState();
  }

  function setModelSource({ sourceBaseUrl = "", manifestUrl = "" } = {}) {
    config.sourceBaseUrl = (sourceBaseUrl || manifestUrl || DEFAULT_SOURCE_BASE_URL).trim();
    localStorage.setItem("workshop.model.sourceBaseUrl", config.sourceBaseUrl);
    state.message = "Model source saved.";
    emit();
    return getState();
  }

  function resetModelSource() {
    config.sourceBaseUrl = DEFAULT_SOURCE_BASE_URL;
    localStorage.setItem("workshop.model.sourceBaseUrl", config.sourceBaseUrl);
    state.message = "Model source reset to the default Hugging Face ONNX repo.";
    emit();
    return getState();
  }

  function loadRuntimeScript() {
    if (globalThis.ort) {
      state.hasOrt = true;
      return Promise.resolve(globalThis.ort);
    }

    if (runtimeLoadPromise) return runtimeLoadPromise;

    runtimeLoadPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector("script[data-workshop-ort]");
      if (existing) {
        existing.addEventListener("load", () => resolve(globalThis.ort));
        existing.addEventListener("error", () => reject(new Error("ONNX Runtime Web failed to load.")));
        return;
      }

      const script = document.createElement("script");
      script.src = config.ortScriptUrl;
      script.async = true;
      script.dataset.workshopOrt = "true";
      script.onload = () => globalThis.ort ? resolve(globalThis.ort) : reject(new Error("ONNX Runtime Web loaded without a global runtime."));
      script.onerror = () => reject(new Error("ONNX Runtime Web failed to load."));
      document.head.appendChild(script);
    });

    return runtimeLoadPromise.then((ort) => {
      state.hasOrt = true;
      emit();
      return ort;
    });
  }

  async function cacheModelFiles() {
    const cache = await caches.open(config.cacheName);
    for (let index = 0; index < config.files.length; index++) {
      const file = config.files[index];
      const url = modelUrl(file);
      const response = await fetch(url, { cache: "reload" });
      if (!response.ok) throw new Error(`Failed to fetch ${file}: ${response.status}`);
      await cache.put(url, response.clone());
      state.progress = Math.round(((index + 1) / config.files.length) * 100);
      state.message = `Cached ${index + 1} of ${config.files.length} model files.`;
      localStorage.setItem("workshop.model.progress", String(state.progress));
      emit();
    }
  }

  async function loadTokenizerConfigFromCache() {
    const cache = await caches.open(config.cacheName);
    const response = await cache.match(modelUrl("tokenizer_config.json")) || await cache.match(modelUrl("tokenizer.json"));
    if (!response) {
      state.tokenizerReady = false;
      return null;
    }

    tokenizerConfig = await response.json();
    state.tokenizerReady = true;
    return tokenizerConfig;
  }

  async function tryCreateSession() {
    if (!globalThis.ort || !config.sourceBaseUrl) return false;

    const providers = state.canUseWebGPU ? ["webgpu", "wasm"] : ["wasm"];
    try {
      session = await globalThis.ort.InferenceSession.create(modelUrl(config.modelFile), { executionProviders: providers });
      state.sessionReady = true;
      state.status = "ready";
      state.message = "ONNX session is ready. Workshop harness and object chat can now route through the local runtime when generation is wired.";
      localStorage.setItem("workshop.model.status", state.status);
      emit();
      return true;
    } catch (error) {
      session = null;
      state.sessionReady = false;
      state.status = "cached";
      state.message = "Model files are cached. Session creation needs a browser-compatible ONNX graph and enough device memory.";
      state.lastError = error?.message || String(error);
      localStorage.setItem("workshop.model.status", state.status);
      emit();
      return false;
    }
  }

  async function install() {
    await checkCapabilities();

    try {
      state.status = "downloading";
      state.progress = 0;
      state.lastError = "";
      localStorage.setItem("workshop.model.status", state.status);
      localStorage.setItem("workshop.model.progress", "0");
      emit();

      await cacheModelFiles();
      await loadRuntimeScript();
      await loadTokenizerConfigFromCache();
      state.status = "cached";
      state.message = "Model files are cached.";
      localStorage.setItem("workshop.model.status", state.status);
      emit();

      await tryCreateSession();
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

  async function unload() {
    session = null;
    state.sessionReady = false;
    state.status = state.status === "ready" ? "cached" : state.status;
    state.message = "Runtime session unloaded. Cached files were kept.";
    emit();
    return getState();
  }

  async function clearCache() {
    await caches.delete(config.cacheName);
    session = null;
    tokenizerConfig = null;
    state.status = "not-installed";
    state.progress = 0;
    state.sessionReady = false;
    state.tokenizerReady = false;
    state.lastError = "";
    state.message = "Cached model files cleared.";
    localStorage.setItem("workshop.model.status", state.status);
    localStorage.setItem("workshop.model.progress", "0");
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
    return {
      source: session && tokenizerConfig ? "onnx-runtime-loaded" : "fallback",
      prompt,
      text: fallbackAnswer({ object, question })
    };
  }

  function getState() {
    return {
      ...state,
      modelName: config.modelName,
      modelId: config.modelId,
      format: config.format,
      quantization: config.quantization,
      runtime: config.runtime,
      cacheName: config.cacheName,
      sourceBaseUrl: config.sourceBaseUrl,
      manifestUrl: config.sourceBaseUrl,
      modelFile: config.modelFile,
      files: [...config.files]
    };
  }

  checkCapabilities();

  return {
    id: "onnx-local-model-kit",
    label: "Local Model Kit",
    getState,
    subscribe,
    checkCapabilities,
    setModelSource,
    resetModelSource,
    install,
    unload,
    clearCache,
    answer,
    buildPrompt
  };
}

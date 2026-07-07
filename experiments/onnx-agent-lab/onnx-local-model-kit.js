export function createOnnxLocalModelKit() {
  const DEFAULT_SOURCE_BASE_URL = "";
  const TARGET_MODEL_ID = "Qwen/Qwen3.5-2B";

  const config = {
    modelName: "Qwen3.5 2B",
    modelId: TARGET_MODEL_ID,
    format: "ONNX",
    quantization: "browser quantized",
    runtime: "ONNX Runtime Web",
    cacheName: "workshop-qwen35-2b-onnx-cache-v1",
    sourceBaseUrl: localStorage.getItem("workshop.model.sourceBaseUrl") || DEFAULT_SOURCE_BASE_URL,
    modelFile: "onnx/model_q4f16.onnx",
    files: [
      "onnx/model_q4f16.onnx",
      "tokenizer.json",
      "tokenizer_config.json",
      "generation_config.json",
      "special_tokens_map.json"
    ],
    ortScriptUrl: "https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js",
    memoryLimit: 8
  };

  const state = {
    status: localStorage.getItem("workshop.model.status") || "not-installed",
    backend: "checking",
    progress: Number(localStorage.getItem("workshop.model.progress") || 0),
    message: "Qwen3.5 2B is selected. Add a hosted ONNX source URL to load it in-browser.",
    canUseWebGPU: false,
    canUseWasm: typeof WebAssembly !== "undefined",
    deviceMemory: navigator.deviceMemory || null,
    hasOrt: Boolean(globalThis.ort),
    sessionReady: false,
    tokenizerReady: false,
    lastError: "",
    memoryCount: 0
  };

  const listeners = new Set();
  const memory = [];
  let session = null;
  let tokenizerConfig = null;
  let runtimeLoadPromise = null;

  function emit() {
    state.memoryCount = memory.length;
    for (const listener of listeners) listener(getState());
  }

  function subscribe(listener) {
    listeners.add(listener);
    listener(getState());
    return () => listeners.delete(listener);
  }

  function remember(role, text) {
    const clean = String(text || "").trim();
    if (!clean) return;
    memory.push({ role, text: clean, at: Date.now() });
    while (memory.length > config.memoryLimit) memory.shift();
    emit();
  }

  function clearMemory() {
    memory.length = 0;
    emit();
  }

  function recentMemoryText(limit = 6) {
    return memory.slice(-limit).map((item) => `${item.role}: ${item.text}`).join("\n");
  }

  function isAffirmative(text) {
    return /\b(yes|yeah|yep|sure|open|start|go|enter|show|scene|workshop)\b/i.test(text || "");
  }

  function modelUrl(file) {
    return `${config.sourceBaseUrl.replace(/\/$/, "")}/${file}`;
  }

  async function checkCapabilities() {
    state.canUseWebGPU = Boolean(navigator.gpu);
    state.canUseWasm = typeof WebAssembly !== "undefined";
    state.hasOrt = Boolean(globalThis.ort);
    state.backend = state.canUseWebGPU ? "WebGPU preferred" : "WASM fallback";
    state.message = config.sourceBaseUrl ? (state.hasOrt ? "ONNX Runtime Web detected." : "ONNX Runtime Web can be loaded when installing.") : "Qwen3.5 2B is selected. Add a hosted ONNX source URL before loading.";
    emit();
    return getState();
  }

  function setModelSource({ sourceBaseUrl = "", manifestUrl = "" } = {}) {
    config.sourceBaseUrl = (sourceBaseUrl || manifestUrl || "").trim();
    localStorage.setItem("workshop.model.sourceBaseUrl", config.sourceBaseUrl);
    state.message = config.sourceBaseUrl ? "Qwen3.5 2B ONNX source saved." : "Model source cleared. Add a hosted ONNX URL before loading.";
    emit();
    return getState();
  }

  function resetModelSource() {
    config.sourceBaseUrl = DEFAULT_SOURCE_BASE_URL;
    localStorage.setItem("workshop.model.sourceBaseUrl", config.sourceBaseUrl);
    state.message = "Qwen3.5 2B remains selected. No verified default ONNX source is bundled.";
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
    if (!config.sourceBaseUrl) throw new Error("Qwen3.5 2B needs a hosted ONNX source URL before files can be cached.");

    const cache = await caches.open(config.cacheName);
    for (let index = 0; index < config.files.length; index++) {
      const file = config.files[index];
      const url = modelUrl(file);
      const response = await fetch(url, { cache: "reload" });
      if (!response.ok) throw new Error(`Failed to fetch ${file}: ${response.status}`);
      await cache.put(url, response.clone());
      state.progress = Math.round(((index + 1) / config.files.length) * 100);
      state.message = `Cached ${index + 1} of ${config.files.length} Qwen3.5 2B files.`;
      localStorage.setItem("workshop.model.progress", String(state.progress));
      emit();
    }
  }

  async function loadTokenizerConfigFromCache() {
    if (!config.sourceBaseUrl) {
      state.tokenizerReady = false;
      return null;
    }

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
      state.message = "Qwen3.5 2B ONNX session is ready. The workshop agent is active.";
      localStorage.setItem("workshop.model.status", state.status);
      emit();
      return true;
    } catch (error) {
      session = null;
      state.sessionReady = false;
      state.status = "cached";
      state.message = "Qwen3.5 2B files are cached. Session startup needs a compatible browser/runtime and graph.";
      state.lastError = error?.message || String(error);
      localStorage.setItem("workshop.model.status", state.status);
      emit();
      return false;
    }
  }

  async function install() {
    await checkCapabilities();

    if (!config.sourceBaseUrl) {
      state.status = "needs-source";
      state.progress = 0;
      state.message = "Qwen3.5 2B is selected, but no verified ONNX source URL is configured.";
      state.lastError = "Add a hosted ONNX base URL containing model and tokenizer files.";
      localStorage.setItem("workshop.model.status", state.status);
      localStorage.setItem("workshop.model.progress", "0");
      emit();
      return getState();
    }

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
      state.message = "Qwen3.5 2B files are cached.";
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

  function buildPrompt({ object, room, question, memoryText = "" }) {
    return [
      "You are Qwen3.5 2B running as a local ONNX workshop assistant.",
      "Use the recent conversation as short-term memory.",
      "Answer briefly and focus on safe, useful workshop guidance.",
      "",
      `Room: ${room || "first-person workshop"}`,
      `Object: ${object?.label || "none"}`,
      `Type: ${object?.type || "unknown"}`,
      `Parts: ${(object?.parts || []).join(", ") || "unknown"}`,
      "",
      "Recent conversation:",
      memoryText || "none",
      "",
      `Question: ${question || "What is this?"}`
    ].join("\n");
  }

  function fallbackChatText({ text, object }) {
    const lower = String(text || "").toLowerCase();
    const remembered = recentMemoryText(4);

    if (isAffirmative(text)) {
      return "Yes. I can open the workshop scene now. I will keep this chat beside you while you inspect tools.";
    }

    if (object) return fallbackAnswer({ object, question: text });

    if (lower.includes("remember") || lower.includes("said") || lower.includes("last")) {
      return remembered ? `I am keeping the last few turns in memory:\n${remembered}\n\nWhen you are ready, say yes and I will open the workshop scene.` : "My short-term memory is empty right now. Tell me what you want to do, then say yes when you want to open the scene.";
    }

    if (lower.includes("model") || lower.includes("onnx") || lower.includes("qwen")) {
      return `The local model target is ${config.modelName}. I need a hosted ONNX source URL before I can cache and start the real browser runtime. Say yes when you want to open the workshop scene.`;
    }

    return "I am loaded as the workshop agent. I will keep the last few things you say in memory and use them when you ask about tools. Do you want to open the workshop scene?";
  }

  async function chat({ text, object = null, room = "workshop entry" } = {}) {
    remember("you", text);
    const memoryText = recentMemoryText(6);
    const prompt = buildPrompt({ object, room, question: text, memoryText });
    const reply = fallbackChatText({ text, object });
    remember("agent", reply);

    return {
      source: session && tokenizerConfig ? "onnx-runtime-loaded" : "memory-harness",
      wantsScene: isAffirmative(text),
      prompt,
      text: reply,
      memory: [...memory]
    };
  }

  async function answer({ object, room, question }) {
    const memoryText = recentMemoryText(6);
    const prompt = buildPrompt({ object, room, question, memoryText });
    const text = fallbackAnswer({ object, question });
    remember("you", question);
    remember("agent", text);
    return {
      source: session && tokenizerConfig ? "onnx-runtime-loaded" : "fallback",
      prompt,
      text,
      memory: [...memory]
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
      files: [...config.files],
      memory: [...memory]
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
    clearMemory,
    answer,
    chat,
    buildPrompt
  };
}

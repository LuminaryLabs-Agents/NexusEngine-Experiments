export function createOnnxLocalModelKit() {
  const DEFAULT_SOURCE_BASE_URL = "https://huggingface.co/onnx-community/Qwen3.5-2B-ONNX-OPT/resolve/main";
  const TARGET_MODEL_ID = "onnx-community/Qwen3.5-2B-ONNX-OPT";
  const SOURCE_STORAGE_KEY = "workshop.model.qwen35.sourceBaseUrl";

  const config = {
    modelName: "Qwen3.5 2B",
    modelId: TARGET_MODEL_ID,
    format: "ONNX",
    quantization: "Q4F16 OPT",
    runtime: "ONNX Runtime Web",
    cacheName: "workshop-qwen35-2b-onnx-opt-q4f16-cache-v1",
    sourceBaseUrl: localStorage.getItem(SOURCE_STORAGE_KEY) || DEFAULT_SOURCE_BASE_URL,
    modelFile: "onnx/decoder_model_merged_q4f16.onnx",
    files: [
      "onnx/decoder_model_merged_q4f16.onnx",
      "onnx/decoder_model_merged_q4f16.onnx_data",
      "onnx/embed_tokens_q4f16.onnx",
      "onnx/embed_tokens_q4f16.onnx_data",
      "chat_template.jinja",
      "config.json",
      "generation_config.json",
      "preprocessor_config.json",
      "processor_config.json",
      "tokenizer.json",
      "tokenizer_config.json"
    ],
    ortScriptUrl: "https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js",
    memoryLimit: 8
  };

  const state = {
    status: localStorage.getItem("workshop.model.status") || "not-installed",
    backend: "checking",
    progress: Number(localStorage.getItem("workshop.model.progress") || 0),
    message: "Qwen3.5 2B ONNX OPT is selected and ready to cache from Hugging Face.",
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
    state.message = state.hasOrt ? "ONNX Runtime Web detected." : "ONNX Runtime Web can be loaded when installing.";
    emit();
    return getState();
  }

  function setModelSource({ sourceBaseUrl = "", manifestUrl = "" } = {}) {
    config.sourceBaseUrl = (sourceBaseUrl || manifestUrl || DEFAULT_SOURCE_BASE_URL).trim();
    localStorage.setItem(SOURCE_STORAGE_KEY, config.sourceBaseUrl);
    state.message = "Qwen3.5 2B ONNX source saved.";
    emit();
    return getState();
  }

  function resetModelSource() {
    config.sourceBaseUrl = DEFAULT_SOURCE_BASE_URL;
    localStorage.setItem(SOURCE_STORAGE_KEY, config.sourceBaseUrl);
    state.message = "Qwen3.5 2B ONNX source reset to the ONNX Community OPT repo.";
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
      state.message = `Cached ${index + 1} of ${config.files.length} Qwen3.5 2B files.`;
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

  function inferIntent(text) {
    const lower = String(text || "").toLowerCase();
    if (isAffirmative(text)) return "open-scene";
    if (/\b(not|wrong|avoid|instead|when not|bad fit|bad tool|not right)\b/.test(lower)) return "limits-and-alternatives";
    if (/\b(safe|danger|risk|hurt|injury|watch out|careful)\b/.test(lower)) return "safety";
    if (/\b(how|use|using|operate|do i)\b/.test(lower)) return "use";
    if (/\b(works with|with|pair|other tools|related)\b/.test(lower)) return "compatibility";
    if (/\b(part|made|material|component)\b/.test(lower)) return "parts";
    if (/\b(remember|said|last|memory)\b/.test(lower)) return "memory";
    if (/\b(model|onnx|qwen|runtime)\b/.test(lower)) return "model-status";
    return "direct-answer";
  }

  function objectSummary(object) {
    if (!object) return "No tool is currently selected.";
    return `${object.label} is a ${object.type}. Parts: ${(object.parts || []).join(", ") || "unknown"}. Context: ${object.context || "none"}`;
  }

  function buildDirectorPrompt({ object, room, question, memoryText = "" }) {
    return [
      "SYSTEM DIRECTOR:",
      "You are Qwen3.5 2B running as a local ONNX workshop assistant.",
      "Use the latest user message as the primary instruction.",
      "Infer the user's intent instead of matching canned examples.",
      "Use the selected object and recent memory only as grounding context.",
      "Answer conversationally, briefly, and practically.",
      "Do not repeat a generic tool description if the user asks when not to use it, what to use instead, or what the limitation is.",
      "If the user asks to open the scene, acknowledge that the scene can open.",
      "",
      `Scene room: ${room || "first-person workshop"}`,
      `Selected object: ${objectSummary(object)}`,
      "Recent memory:",
      memoryText || "none",
      "",
      `Latest user message: ${question || "What is this?"}`,
      `Inferred intent: ${inferIntent(question)}`
    ].join("\n");
  }

  function directorFallback({ text, object }) {
    const intent = inferIntent(text);
    const remembered = recentMemoryText(4);
    const label = object?.label || "the selected tool";
    const type = object?.type || "tool";

    if (intent === "open-scene") return "Yes. I can open the workshop scene now and keep this chat beside you while you inspect tools.";
    if (intent === "memory") return remembered ? `I am holding these recent turns:\n${remembered}` : "I do not have any earlier turns in memory yet.";
    if (intent === "model-status") return `I am targeting ${config.modelName} from ${config.modelId} through ONNX Runtime Web. I use the latest message, short memory, and selected workshop object as context.`;

    if (!object) {
      return "I do not have a workshop object in focus yet. Click a tool in the scene, then ask about its use, limits, safety, or alternatives.";
    }

    if (intent === "limits-and-alternatives") {
      if (label.toLowerCase().includes("measuring tape")) return "A measuring tape is not the right tool when you need to verify level, square, angle, or very fine tolerances. Use a level for flatness, a square for 90 degree layout, calipers for tiny measurements, or a rigid ruler when the tape hook would shift.";
      if (label.toLowerCase().includes("hammer")) return "A hammer is the wrong tool when the fastener needs controlled torque, when the material can dent, or when you need removal without damage. Use a screwdriver, wrench, clamp, or pry tool depending on the job.";
      if (label.toLowerCase().includes("saw")) return "A hand saw is not ideal for metal, masonry, precision curves, or cuts where the board cannot be clamped. Use the right blade, a powered saw, or a different cutting tool for those cases.";
      return `${label} is not the right choice when the job needs a different kind of control than a ${type} provides. Match the tool to the operation: measuring, holding, cutting, fastening, finishing, or protecting.`;
    }

    if (intent === "safety") return object.quick?.safety || `Use ${label} with eye protection, stable footing, and clear hand placement.`;
    if (intent === "compatibility") return object.quick?.works || `${label} works best with tools and materials that support its specific ${type} role.`;
    if (intent === "parts") return `${label} has these key parts: ${(object.parts || []).join(", ") || "unknown"}.`;
    if (intent === "use") return object.quick?.use || object.context || `${label} is used as a ${type}.`;

    return `${label} is a ${type}. For your last question, the key is to decide whether you are measuring, holding, cutting, fastening, finishing, or protecting. ${object.context || "Use it only when its role matches the task."}`;
  }

  function tokenizeForStream(text) {
    return String(text || "").match(/\S+\s*/g) || [];
  }

  async function streamText(text, onToken) {
    const tokens = tokenizeForStream(text);
    let out = "";
    for (const token of tokens) {
      out += token;
      onToken?.(token, out);
      await new Promise((resolve) => setTimeout(resolve, 22));
    }
    return out;
  }

  async function streamChat({ text, object = null, room = "workshop entry", onToken } = {}) {
    remember("you", text);
    const memoryText = recentMemoryText(6);
    const prompt = buildDirectorPrompt({ object, room, question: text, memoryText });
    const reply = directorFallback({ text, object });
    const streamed = await streamText(reply, onToken);
    remember("agent", streamed);

    return {
      source: session && tokenizerConfig ? "onnx-runtime-loaded" : "director-harness",
      wantsScene: isAffirmative(text),
      prompt,
      text: streamed,
      memory: [...memory]
    };
  }

  async function chat({ text, object = null, room = "workshop entry" } = {}) {
    return streamChat({ text, object, room });
  }

  async function answer({ object, room, question }) {
    return streamChat({ text: question, object, room });
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
    streamChat,
    buildPrompt: buildDirectorPrompt
  };
}

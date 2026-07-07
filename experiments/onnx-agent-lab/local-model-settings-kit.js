export function createLocalModelSettingsKit({ modelKit }) {
  let root = null;
  let statusEls = {};

  function make(tag, className = "", text = "") {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  }

  function installStyles() {
    if (document.querySelector("#workshop-settings-style")) return;
    const style = document.createElement("style");
    style.id = "workshop-settings-style";
    style.textContent = `
      .settings-button{position:fixed;right:16px;top:16px;z-index:12;border:1px solid rgba(255,225,138,.34);border-radius:999px;background:rgba(12,11,9,.72);color:#ffe18a;padding:10px 13px;font:800 12px Inter,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;backdrop-filter:blur(12px)}
      .settings-overlay{position:fixed;inset:0;z-index:20;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.58);backdrop-filter:blur(8px)}
      .settings-overlay[data-open="true"]{display:flex}.settings-panel{width:min(680px,calc(100vw - 28px));max-height:calc(100vh - 38px);overflow:auto;border:1px solid rgba(255,255,255,.14);border-radius:22px;background:rgba(18,16,13,.96);box-shadow:0 32px 120px rgba(0,0,0,.58);color:#f7eddd;padding:18px}.settings-panel header{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:14px}.settings-panel h2{margin:0;color:#ffe18a;font-size:16px;letter-spacing:.1em;text-transform:uppercase}.settings-panel p{color:#cfc2ad;line-height:1.42}.settings-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0}.settings-row{border:1px solid rgba(255,255,255,.1);border-radius:14px;background:rgba(255,255,255,.04);padding:10px}.settings-row strong{display:block;color:#ffe18a;font-size:11px;letter-spacing:.08em;text-transform:uppercase;margin-bottom:5px}.settings-row span{color:#fff;font-size:14px}.settings-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}.settings-actions button,.settings-close{border:1px solid rgba(255,225,138,.36);border-radius:999px;background:rgba(255,225,138,.12);color:#ffe18a;padding:10px 12px;font-weight:800;cursor:pointer}.settings-actions button.secondary{border-color:rgba(131,220,255,.28);color:#83dcff;background:rgba(131,220,255,.1)}.settings-actions button.danger{border-color:rgba(255,142,125,.32);color:#ff8e7d;background:rgba(255,142,125,.09)}.settings-progress{height:9px;border-radius:99px;background:rgba(255,255,255,.1);overflow:hidden;margin-top:8px}.settings-progress span{display:block;height:100%;width:0%;background:linear-gradient(90deg,#ffe18a,#9fffc8)}.settings-note{border-left:3px solid #83dcff;padding-left:10px;font-size:13px}.settings-source{display:grid;grid-template-columns:1fr auto;gap:8px;margin-top:12px}.settings-source input{border:1px solid rgba(255,255,255,.15);border-radius:12px;background:rgba(0,0,0,.26);color:white;padding:10px;font:inherit}.settings-source button{border:1px solid rgba(131,220,255,.28);border-radius:12px;background:rgba(131,220,255,.1);color:#83dcff;font-weight:800;cursor:pointer}@media(max-width:720px){.settings-grid{grid-template-columns:1fr}.settings-source{grid-template-columns:1fr}.settings-panel header{flex-direction:column}.settings-close{align-self:flex-end}}
    `;
    document.head.appendChild(style);
  }

  function renderStatus(state) {
    if (!statusEls.status) return;
    statusEls.status.textContent = state.status;
    statusEls.backend.textContent = state.backend;
    statusEls.model.textContent = state.modelName;
    statusEls.format.textContent = `${state.format}, ${state.quantization}`;
    statusEls.runtime.textContent = state.runtime;
    statusEls.cache.textContent = state.cacheName;
    statusEls.webgpu.textContent = state.canUseWebGPU ? "available" : "not available";
    statusEls.progressText.textContent = `${state.progress || 0}%`;
    statusEls.message.textContent = state.message || "";
    statusEls.progressBar.style.width = `${state.progress || 0}%`;
    statusEls.source.value = state.manifestUrl || "";
  }

  function create() {
    installStyles();
    const openButton = make("button", "settings-button", "Settings");
    const overlay = make("section", "settings-overlay");
    overlay.setAttribute("aria-hidden", "true");
    const panel = make("div", "settings-panel");
    panel.innerHTML = `
      <header><div><h2>Local model settings</h2><p>Install settings for optional local Qwen answers. The workshop still works with fallback object context when the model is not installed.</p></div><button class="settings-close" type="button">Close</button></header>
      <div class="settings-grid"><div class="settings-row"><strong>Model</strong><span data-k="model"></span></div><div class="settings-row"><strong>Format</strong><span data-k="format"></span></div><div class="settings-row"><strong>Runtime</strong><span data-k="runtime"></span></div><div class="settings-row"><strong>Backend</strong><span data-k="backend"></span></div><div class="settings-row"><strong>Status</strong><span data-k="status"></span></div><div class="settings-row"><strong>WebGPU</strong><span data-k="webgpu"></span></div><div class="settings-row"><strong>Cache</strong><span data-k="cache"></span></div><div class="settings-row"><strong>Progress</strong><span data-k="progressText"></span><div class="settings-progress"><span data-k="progressBar"></span></div></div></div>
      <p class="settings-note" data-k="message"></p><div class="settings-source"><input data-k="source" placeholder="Hosted model base URL, for example Cloudflare R2 or Hugging Face resolved path" /><button type="button" data-action="source">Set source</button></div>
      <div class="settings-actions"><button type="button" data-action="install">Install / cache model</button><button type="button" class="secondary" data-action="check">Check device</button><button type="button" class="secondary" data-action="unload">Unload runtime</button><button type="button" class="danger" data-action="clear">Clear cache</button></div>`;
    overlay.appendChild(panel);
    document.body.append(openButton, overlay);
    root = { openButton, overlay, panel };
    statusEls = {
      model: panel.querySelector('[data-k="model"]'), format: panel.querySelector('[data-k="format"]'), runtime: panel.querySelector('[data-k="runtime"]'), backend: panel.querySelector('[data-k="backend"]'), status: panel.querySelector('[data-k="status"]'), webgpu: panel.querySelector('[data-k="webgpu"]'), cache: panel.querySelector('[data-k="cache"]'), progressText: panel.querySelector('[data-k="progressText"]'), progressBar: panel.querySelector('[data-k="progressBar"]'), message: panel.querySelector('[data-k="message"]'), source: panel.querySelector('[data-k="source"]')
    };
    const open = () => { overlay.dataset.open = "true"; overlay.setAttribute("aria-hidden", "false"); };
    const close = () => { overlay.dataset.open = "false"; overlay.setAttribute("aria-hidden", "true"); };
    openButton.addEventListener("click", open);
    panel.querySelector(".settings-close").addEventListener("click", close);
    overlay.addEventListener("click", (event) => { if (event.target === overlay) close(); });
    panel.querySelector('[data-action="install"]').addEventListener("click", () => modelKit.install());
    panel.querySelector('[data-action="check"]').addEventListener("click", () => modelKit.checkCapabilities());
    panel.querySelector('[data-action="unload"]').addEventListener("click", () => modelKit.unload());
    panel.querySelector('[data-action="clear"]').addEventListener("click", () => modelKit.clearCache());
    panel.querySelector('[data-action="source"]').addEventListener("click", () => modelKit.setModelSource({ manifestUrl: statusEls.source.value.trim() }));
    modelKit.subscribe(renderStatus);
    return { open, close, element: overlay, button: openButton };
  }

  return { id: "local-model-settings-kit", label: "Local Model Settings Kit", create, get root() { return root; } };
}

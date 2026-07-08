import {
  OPEN_ABOVE_VISUAL_KIT_TREE,
  createOpenAboveVisualFractalDomainKit
} from "./open-above-visual-domain-kits.js";

const visualDomain = createOpenAboveVisualFractalDomainKit();
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const pct = (value) => `${Math.round(Number(value || 0) * 10000) / 100}%`;

function ensureOverlay() {
  let root = document.querySelector("#open-above-visual-fractal-overlay");
  if (root) return root;
  const style = document.createElement("style");
  style.textContent = `
    #open-above-visual-fractal-overlay{position:fixed;inset:0;pointer-events:none;overflow:hidden;mix-blend-mode:screen;z-index:2}
    #open-above-visual-fractal-overlay .oa-band,#open-above-visual-fractal-overlay .oa-ridge,#open-above-visual-fractal-overlay .oa-ribbon,#open-above-visual-fractal-overlay .oa-thermal,#open-above-visual-fractal-overlay .oa-contrail{position:absolute;will-change:transform,opacity;transform:translate3d(0,0,0)}
    #open-above-visual-fractal-overlay .oa-band{height:7vh;border-radius:999px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.36),transparent);filter:blur(24px)}
    #open-above-visual-fractal-overlay .oa-ridge{left:-8vw;width:116vw;border-radius:50% 50% 0 0;background:linear-gradient(180deg,rgba(89,119,116,.24),rgba(20,42,38,.03));filter:blur(1px)}
    #open-above-visual-fractal-overlay .oa-ribbon{width:26vw;height:2px;border-radius:999px;background:linear-gradient(90deg,transparent,rgba(220,246,255,.66),transparent);filter:blur(.4px)}
    #open-above-visual-fractal-overlay .oa-thermal{border:1px solid rgba(198,245,255,.32);border-radius:999px;background:radial-gradient(circle,rgba(160,245,255,.18),transparent 68%)}
    #open-above-visual-fractal-overlay .oa-contrail{width:19vw;height:4px;border-radius:999px;background:linear-gradient(90deg,rgba(255,255,255,.54),transparent);filter:blur(2px)}
    #open-above-visual-fractal-overlay .oa-mood{position:absolute;inset:-4%;background:radial-gradient(circle at 50% 38%,rgba(255,255,255,.10),transparent 38%),radial-gradient(circle at 50% 95%,rgba(95,189,255,.12),transparent 62%);will-change:opacity;}
  `;
  document.head.appendChild(style);
  root = document.createElement("section");
  root.id = "open-above-visual-fractal-overlay";
  root.setAttribute("aria-hidden", "true");
  root.innerHTML = `<div class="oa-mood"></div>`;
  document.body.appendChild(root);
  return root;
}

function syncElements(root, className, items, render) {
  const live = new Set(items.map((item) => item.id));
  for (const item of items) {
    let element = root.querySelector(`[data-id="${CSS.escape(item.id)}"]`);
    if (!element) {
      element = document.createElement("i");
      element.className = className;
      element.dataset.id = item.id;
      root.appendChild(element);
    }
    render(element, item);
  }
  for (const element of [...root.querySelectorAll(`.${className}`)]) {
    if (!live.has(element.dataset.id)) element.remove();
  }
}

function withVisualDomains(state = {}) {
  const visualDomains = visualDomain.compose(state);
  return { ...clone(state), visualDomains };
}

function renderVisualDomains(state = {}) {
  const root = ensureOverlay();
  const visual = state.visualDomains ?? visualDomain.compose(state);
  const mood = visual.mood ?? {};
  const moodEl = root.querySelector(".oa-mood");
  moodEl.style.opacity = String(Math.max(0.08, Math.min(0.7, mood.haze ?? 0.14)));
  syncElements(root, "oa-band", visual.cloudStrata ?? [], (el, item) => {
    el.style.left = pct(item.x01 - item.width01 / 2);
    el.style.top = pct(item.y01);
    el.style.width = pct(item.width01);
    el.style.opacity = String(item.opacity);
    el.style.filter = `blur(${Math.round(item.blurPx)}px)`;
    el.style.transform = `scale(${item.scale})`;
  });
  syncElements(root, "oa-ridge", visual.ridgelines ?? [], (el, item) => {
    el.style.top = pct(item.y01 + item.rollOffset);
    el.style.height = pct(item.height01);
    el.style.opacity = String(item.opacity);
    el.style.transform = `translateX(${pct(item.parallax)})`;
  });
  syncElements(root, "oa-ribbon", visual.speedRibbons ?? [], (el, item) => {
    el.style.left = pct(item.x01 - item.length01 / 2);
    el.style.top = pct(item.y01);
    el.style.width = pct(item.length01);
    el.style.opacity = String(item.opacity);
    el.style.transform = `rotate(${item.bend * 38}deg)`;
  });
  syncElements(root, "oa-thermal", visual.thermals ?? [], (el, item) => {
    el.style.left = pct(item.x01 - item.radius01);
    el.style.top = pct(item.y01 - item.radius01);
    el.style.width = pct(item.radius01 * 2);
    el.style.height = pct(item.radius01 * 2);
    el.style.opacity = String(item.opacity);
    el.style.transform = `rotate(${item.spin * 80}deg)`;
  });
  syncElements(root, "oa-contrail", visual.contrails ?? [], (el, item) => {
    el.style.left = pct(item.x01 - item.length01 / 2);
    el.style.top = pct(item.y01);
    el.style.width = pct(item.length01);
    el.style.opacity = String(item.opacity);
    el.style.transform = `scaleX(${item.taper})`;
  });
  return visual;
}

function installWhenReady(attempt = 0) {
  const host = window.GameHost;
  if (!host?.getState || !host?.tick) {
    if (attempt < 600) requestAnimationFrame(() => installWhenReady(attempt + 1));
    return;
  }
  if (host.__openAboveVisualFractalInstalled) return;
  host.__openAboveVisualFractalInstalled = true;
  const rawGetState = host.getState.bind(host);
  const rawTick = host.tick.bind(host);
  const rawRender = host.render?.bind(host);
  host.getVisualDomains = () => clone(visualDomain.compose(rawGetState() ?? {}));
  host.getVisualKitTree = () => OPEN_ABOVE_VISUAL_KIT_TREE;
  host.getState = () => {
    const state = withVisualDomains(rawGetState() ?? {});
    renderVisualDomains(state);
    return state;
  };
  host.tick = (delta, input) => {
    const state = withVisualDomains(rawTick(delta, input) ?? {});
    renderVisualDomains(state);
    return state;
  };
  if (rawRender) {
    host.render = () => {
      const state = withVisualDomains(rawRender() ?? rawGetState() ?? {});
      renderVisualDomains(state);
      return state;
    };
  }
  renderVisualDomains(host.getState());
}

installWhenReady();

import { startAaaBatchRoute } from "../../experiments/aaa-batch/host/batch-host.js";

const STYLE_ID = "generated-route-contrast-style";

function injectGeneratedRouteContrastStyles(documentRef = document) {
  if (documentRef.getElementById(STYLE_ID)) return;
  const style = documentRef.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    :root {
      color-scheme: dark;
      --hud-bg: rgba(4,3,12,.88);
      --hud-bg-strong: rgba(2,2,8,.94);
      --hud-text: #fffaf0;
      --hud-muted: #ffe3a3;
      --hud-hot: #ffffff;
      --hud-outline: rgba(255,255,255,.20);
    }
    html, body {
      margin: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #05030d;
      color: var(--hud-text);
      font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    }
    #app, #game {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      display: block;
    }
    #hud {
      position: fixed;
      left: 18px;
      top: 18px;
      z-index: 4;
      max-width: min(760px, calc(100vw - 36px));
      display: grid;
      gap: 8px;
      pointer-events: none;
      color: var(--hud-text);
      text-shadow: 0 2px 14px rgba(0,0,0,.86);
    }
    #title, #status, #readout {
      width: max-content;
      max-width: 100%;
      border-radius: 16px;
      background: var(--hud-bg);
      box-shadow: 0 18px 60px rgba(0,0,0,.44), inset 0 0 0 1px var(--hud-outline);
      -webkit-backdrop-filter: blur(16px) saturate(1.25);
      backdrop-filter: blur(16px) saturate(1.25);
    }
    #title {
      margin: 0;
      padding: 10px 13px;
      color: var(--hud-hot);
      font-weight: 950;
      letter-spacing: .08em;
      text-transform: uppercase;
      font-size: .92rem;
    }
    #status, #readout {
      margin: 0;
      padding: 8px 12px;
      color: var(--hud-muted);
      font-size: .82rem;
      font-weight: 750;
      line-height: 1.35;
    }
    #err {
      position: fixed;
      z-index: 6;
      inset: 18px;
      overflow: auto;
      white-space: pre-wrap;
      padding: 16px;
      color: #fff1ea;
      background: rgba(42,4,2,.94);
      border: 0;
      border-radius: 18px;
      box-shadow: 0 22px 80px rgba(0,0,0,.54), inset 0 0 0 1px rgba(255,210,190,.22);
    }
    #err[hidden] { display: none; }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        scroll-behavior: auto !important;
      }
    }
  `;
  documentRef.head.append(style);
}

export function startGeneratedApplicationRoute(slug = document.body?.dataset?.appId) {
  injectGeneratedRouteContrastStyles();
  if (!slug) throw new Error("Missing generated application slug.");
  startAaaBatchRoute(slug);
}

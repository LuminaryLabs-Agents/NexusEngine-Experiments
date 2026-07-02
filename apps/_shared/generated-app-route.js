import { startAaaBatchRoute } from "../../experiments/aaa-batch/host/batch-host.js";

const STYLE_ID = "generated-route-contrast-style";
const CAVALRY_CAMPAIGN_VERSION = "campaign-017";

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

function ensureCavalryGeneratedHost() {
  let app = document.querySelector("#app");
  if (!app) {
    app = document.createElement("main");
    app.id = "app";
    document.body.append(app);
  }
  let game = document.querySelector("#game");
  if (!game) {
    game = document.createElement("canvas");
    game.id = "game";
    game.setAttribute("role", "application");
    app.prepend(game);
  }
  let commandBar = document.querySelector("#commandBar");
  if (!commandBar) {
    commandBar = document.createElement("div");
    commandBar.id = "commandBar";
    commandBar.hidden = true;
    app.append(commandBar);
  }
  let stamp = document.querySelector("#buildStamp");
  if (!stamp) {
    stamp = document.createElement("div");
    stamp.id = "buildStamp";
    Object.assign(stamp.style, {
      position: "fixed",
      right: "12px",
      bottom: "12px",
      zIndex: "120",
      color: "rgba(255,239,190,.62)",
      font: "800 10px/1.2 Inter,system-ui,sans-serif",
      letterSpacing: ".08em",
      textTransform: "uppercase",
      pointerEvents: "none",
      textShadow: "0 2px 8px #000"
    });
    document.body.append(stamp);
  }
  stamp.textContent = CAVALRY_CAMPAIGN_VERSION;
  globalThis.selectedUnitId = globalThis.selectedUnitId ?? null;
  globalThis.CavalryExpectedBuild = CAVALRY_CAMPAIGN_VERSION;
}

async function startCavalryCampaignRoute() {
  ensureCavalryGeneratedHost();
  const suffix = `?v=${CAVALRY_CAMPAIGN_VERSION}`;
  await import(`../../experiments/The%20Cavalry%20of%20Rome/src/main-realistic.js${suffix}`);
  await import(`../../experiments/The%20Cavalry%20of%20Rome/src/vegetation-pass.js${suffix}`);
  await import(`../../experiments/The%20Cavalry%20of%20Rome/src/universal-animation-library-pass.js${suffix}`);
  await import(`../../experiments/The%20Cavalry%20of%20Rome/src/hex-battlefield-pass.js${suffix}`);
  await import(`../../experiments/The%20Cavalry%20of%20Rome/src/hex-squad-visual-pass.js${suffix}`);
  await import(`../../experiments/The%20Cavalry%20of%20Rome/src/hex-gameplay-pass.js${suffix}`);
  await import(`../../experiments/The%20Cavalry%20of%20Rome/src/hex-action-ui-pass.js${suffix}`);
  await import(`../../experiments/The%20Cavalry%20of%20Rome/src/hex-combat-controller-pass.js${suffix}`);
  await import(`../../experiments/The%20Cavalry%20of%20Rome/src/cavalry-arena-polish-pass.js${suffix}`);
  await import(`../../experiments/The%20Cavalry%20of%20Rome/src/cavalry-campaign-map-pass.js${suffix}`);
}

export function startGeneratedApplicationRoute(slug = document.body?.dataset?.appId) {
  injectGeneratedRouteContrastStyles();
  if (!slug) throw new Error("Missing generated application slug.");
  if (slug === "the-cavalry-of-rome") {
    startCavalryCampaignRoute().catch((error) => {
      const err = document.querySelector("#err");
      if (err) {
        err.hidden = false;
        err.textContent = String(error?.stack ?? error?.message ?? error);
      } else {
        throw error;
      }
    });
    return;
  }
  startAaaBatchRoute(slug);
}

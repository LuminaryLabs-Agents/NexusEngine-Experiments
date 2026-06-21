const STYLE_ID = "nexus-arcade-gloss-overrides";

function injectArcadeGlossOverrides(documentRef = document) {
  if (documentRef.getElementById(STYLE_ID)) return;
  const style = documentRef.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    :root {
      --gloss-card-height: clamp(244px, 32vh, 336px);
      --gloss-panel: rgba(255,255,255,.16);
      --gloss-panel-hot: rgba(255,255,255,.26);
      --gloss-depth: rgba(20,8,34,.58);
      --gloss-sheen: linear-gradient(145deg, rgba(255,255,255,.58) 0%, rgba(255,255,255,.22) 15%, rgba(255,255,255,.055) 42%, rgba(255,255,255,0) 62%);
      --gloss-edge: linear-gradient(90deg, #ffffff, #ff4fd8, #ffe14a, #7cff9b, #53d6ff, #ffffff);
    }

    @keyframes zipperSwoopIn {
      0% {
        opacity: 0;
        transform: translate3d(var(--zipper-offset), 58px, 0) rotateZ(var(--zipper-rotation)) rotateX(12deg) scale(.89);
        filter: blur(12px) saturate(.78) brightness(.88);
      }
      58% {
        opacity: 1;
        transform: translate3d(var(--zipper-swoop), -14px, 0) rotateZ(var(--zipper-swoop-rotation)) rotateX(-4deg) scale(1.032);
        filter: blur(1px) saturate(1.25) brightness(1.12);
      }
      100% {
        opacity: 1;
        transform: translate3d(0, 0, 0) rotateZ(0deg) rotateX(0deg) scale(1);
        filter: blur(0) saturate(1.08) brightness(1);
      }
    }

    .nexus-route-list {
      gap: 26px !important;
      padding-top: 18px !important;
      perspective: 1500px !important;
      perspective-origin: 50% 18%;
    }

    .nexus-route-row {
      --zipper-offset: -196px;
      --zipper-rotation: -9deg;
      --zipper-swoop: 22px;
      --zipper-swoop-rotation: 2.5deg;
      min-height: var(--gloss-card-height) !important;
      padding: 24px 24px 24px 0 !important;
      border-radius: 36px !important;
      overflow: hidden !important;
      background:
        radial-gradient(circle at var(--row-x) var(--row-y), rgba(255,255,255,.34), rgba(255,225,74,.18) 15%, rgba(83,214,255,.16) 31%, transparent 56%),
        var(--gloss-sheen),
        linear-gradient(116deg, rgba(255,79,216,.32), rgba(255,225,74,.24) 24%, rgba(124,255,155,.23) 52%, rgba(83,214,255,.30) 78%, rgba(143,92,255,.28)),
        repeating-linear-gradient(112deg, rgba(255,255,255,.16) 0 2px, transparent 2px 38px, rgba(255,255,255,.10) 38px 41px, transparent 41px 76px),
        linear-gradient(180deg, rgba(255,255,255,.20), rgba(255,255,255,.055) 46%, rgba(12,4,24,.46));
      box-shadow:
        0 30px 86px rgba(0,0,0,.34),
        0 0 54px rgba(255,79,216,.20),
        0 0 58px rgba(83,214,255,.18),
        inset 0 2px 0 rgba(255,255,255,.62),
        inset 0 -24px 48px rgba(6,2,18,.26),
        inset 0 0 0 1px rgba(255,255,255,.28) !important;
      opacity: 1 !important;
      transform-origin: 50% 54%;
      will-change: transform, opacity, filter;
      animation: zipperSwoopIn .92s cubic-bezier(.12,.88,.16,1.08) backwards !important;
      animation-delay: var(--zipper-delay) !important;
    }

    .nexus-route-row.is-even {
      --zipper-offset: -196px;
      --zipper-rotation: -9deg;
      --zipper-swoop: 22px;
      --zipper-swoop-rotation: 2.5deg;
      margin-right: clamp(22px, 5vw, 92px) !important;
    }

    .nexus-route-row.is-odd {
      --zipper-offset: 196px;
      --zipper-rotation: 9deg;
      --zipper-swoop: -22px;
      --zipper-swoop-rotation: -2.5deg;
      margin-left: clamp(22px, 5vw, 92px) !important;
    }

    .nexus-route-row::before {
      background:
        linear-gradient(125deg, rgba(255,255,255,.54), rgba(255,255,255,.14) 18%, transparent 35%),
        radial-gradient(circle at var(--row-x) var(--row-y), rgba(255,255,255,.34), rgba(255,79,216,.22) 15%, rgba(83,214,255,.18) 36%, transparent 62%) !important;
      opacity: .58 !important;
      mix-blend-mode: screen;
    }

    .nexus-route-row::after {
      bottom: -11px !important;
      width: min(72%, 1180px) !important;
      height: 9px !important;
      background: var(--gloss-edge) !important;
      opacity: .92 !important;
      filter: drop-shadow(0 0 18px rgba(255,255,255,.42)) drop-shadow(0 0 28px rgba(83,214,255,.38)) !important;
    }

    .nexus-route-row:hover {
      animation-play-state: running;
      transform: translate3d(0, -9px, 0) rotateZ(var(--zipper-swoop-rotation)) scale(1.018) !important;
      filter: saturate(1.18) brightness(1.06);
      box-shadow:
        0 38px 96px rgba(0,0,0,.38),
        0 0 72px rgba(255,79,216,.26),
        0 0 78px rgba(83,214,255,.24),
        inset 0 2px 0 rgba(255,255,255,.78),
        inset 0 -28px 54px rgba(6,2,18,.22),
        inset 0 0 0 1px rgba(255,255,255,.34) !important;
    }

    .nexus-route-row.is-selected {
      background:
        radial-gradient(circle at var(--row-x) var(--row-y), rgba(255,255,255,.38), rgba(255,225,74,.20) 17%, rgba(83,214,255,.18) 35%, transparent 60%),
        var(--gloss-sheen),
        linear-gradient(116deg, rgba(255,79,216,.40), rgba(255,225,74,.30) 25%, rgba(124,255,155,.28) 54%, rgba(83,214,255,.34) 80%, rgba(143,92,255,.32)),
        linear-gradient(180deg, rgba(255,255,255,.24), rgba(255,255,255,.075) 46%, rgba(12,4,24,.48)) !important;
      outline: 2px solid rgba(255,255,255,.46) !important;
    }

    .nexus-route-title {
      font-size: clamp(1.36rem, 2.25vw, 2.3rem) !important;
      line-height: .98 !important;
      max-width: 16ch;
    }

    .nexus-route-kind,
    .nexus-route-desc,
    .nexus-route-open {
      background: rgba(4,2,14,.54) !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.24), inset 0 0 0 1px rgba(255,255,255,.16) !important;
      -webkit-backdrop-filter: blur(8px) saturate(1.3);
      backdrop-filter: blur(8px) saturate(1.3);
    }

    .nexus-route-desc {
      -webkit-line-clamp: 4 !important;
      font-size: clamp(1rem, 1.22vw, 1.18rem) !important;
      line-height: 1.35 !important;
      padding: 13px 15px !important;
    }

    .nexus-route-accent {
      min-height: calc(var(--gloss-card-height) - 44px) !important;
      width: 9px !important;
      box-shadow: 0 0 28px rgba(255,255,255,.38), 0 0 36px rgba(83,214,255,.30) !important;
    }

    @media (max-width:1180px) {
      .nexus-route-row { min-height: clamp(220px, 30vh, 310px) !important; }
      .nexus-route-title { max-width: none; }
    }

    @media (max-width:760px) {
      .nexus-route-list { gap: 20px !important; }
      .nexus-route-row {
        min-height: 220px !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
        padding: 18px 12px 18px 0 !important;
        border-radius: 28px !important;
      }
      .nexus-route-row:hover { transform: translate3d(0, -4px, 0) scale(1.006) !important; }
      .nexus-route-desc { -webkit-line-clamp: 3 !important; }
    }

    @media (prefers-reduced-motion: reduce) {
      .nexus-route-row {
        opacity: 1 !important;
        animation: none !important;
        transform: none !important;
      }
      .nexus-route-row:hover { transform: none !important; }
    }
  `;
  documentRef.head.append(style);
}

injectArcadeGlossOverrides();

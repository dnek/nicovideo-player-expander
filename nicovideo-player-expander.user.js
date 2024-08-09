// ==UserScript==
// @name        nicovideo-player-expander
// @namespace   https://github.com/dnek
// @version     1.1
// @author      dnek
// @description Move the sidebar down and expand the player to fit the window size on nicovideo.
// @description:ja    ニコニコ動画のサイドバーを下に移動し、ウィンドウサイズに合わせてプレイヤーを拡大します。「nicovideo-next-video-canceler」「nicovideo-autoplay-canceler」は別のスクリプトです。
// @homepageURL https://github.com/dnek/nicovideo-player-expander
// @updateURL   https://github.com/dnek/nicovideo-player-expander/raw/main/nicovideo-player-expander.user.js
// @downloadURL https://github.com/dnek/nicovideo-player-expander/raw/main/nicovideo-player-expander.user.js
// @match       https://www.nicovideo.jp/watch/*
// @grant       GM_addStyle
// @license     MIT license
// ==/UserScript==

GM_addStyle(`
@media not all and (display-mode: fullscreen) {
  #root > div.min-w_\\[max-content\\] {
    min-width: auto;
  }
  div[aria-label="nicovideo-content"] > section.grid-template-areas_\\[_\\"player_sidebar\\"_\\"meta_sidebar\\"_\\"bottom_sidebar\\"_\\"\\._sidebar\\"_\\] {
    --watch-player-expandable-width-by-browser: calc(
      100vw
      - var(--watch-layout-gap-width) * 2
      - var(--scrollbar-width)
    );
    --watch-player-expandable-height-by-browser: calc(
      100vh
      - var(--common-header-height)
      - var(--web-header-height)
      - var(--watch-controller-height)
      - var(--watch-actionbar-height)
      - var(--watch-player-bottom-margin-height)
    );
    --watch-player-expandable-width: calc(
      min(
        var(--watch-player-expandable-width-by-browser),
        var(--watch-player-expandable-height-by-browser) * (16 / 9)
      )
    );
    grid-template-columns: var(--watch-player-expandable-width);
    grid-template-areas: "player" "meta" "bottom" "sidebar";
  }
  div.grid-area_\\[sidebar\\] > div[data-watch-floating-panel="floating"] > section {
    position: fixed;
    top: calc(var(--sizes-common-header-in-view-height) + var(--sizes-web-header-height) + var(--spacing-x3));
    width: var(--sizes-watch-sidebar-width);
  }
}
`);

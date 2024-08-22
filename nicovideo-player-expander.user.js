// ==UserScript==
// @name        nicovideo-player-expander
// @namespace   https://github.com/dnek
// @version     1.6
// @author      dnek
// @description ニコニコ動画のサイドバーを下に移動し、ウィンドウサイズに合わせてプレイヤーを拡大します。プレイヤー右下の全画面表示アイコンの左隣のアイコンでこの機能のON/OFFを切り替えられます。「nicovideo-next-video-canceler」「nicovideo-autoplay-canceler」は別のスクリプトです。
// @description:ja    ニコニコ動画のサイドバーを下に移動し、ウィンドウサイズに合わせてプレイヤーを拡大します。プレイヤー右下の全画面表示アイコンの左隣のアイコンでこの機能のON/OFFを切り替えられます。「nicovideo-next-video-canceler」「nicovideo-autoplay-canceler」は別のスクリプトです。
// @homepageURL https://github.com/dnek/nicovideo-player-expander
// @updateURL   https://github.com/dnek/nicovideo-player-expander/raw/main/nicovideo-player-expander.user.js
// @downloadURL https://github.com/dnek/nicovideo-player-expander/raw/main/nicovideo-player-expander.user.js
// @match       https://www.nicovideo.jp/watch/*
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_setValue
// @license     MIT license
// ==/UserScript==

(async function () {
    'use strict';

    const getIsExpanded = async () => await GM_getValue('isExpanded', true);

    const expanderStyleEl = GM_addStyle(`
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
    div.grid-area_\\[sidebar\\] > div[data-nvpc-part="floating"] > section {
        position: fixed;
        top: calc(var(--sizes-common-header-in-view-height) + var(--sizes-web-header-height) + var(--spacing-x3));
        width: var(--sizes-watch-sidebar-width);
    }
    div:has(> div > button[aria-label="コメント投稿ボタン"]) {
        min-width: auto !important;
    }
    @media (max-width: 600px), (max-height: 650px) {
        div.d_flex:has(> button[aria-label$=" 秒戻る"]) {
            gap: 0;
            > div.d_flex {
                flex-flow: column;
                > span.mx_x0_5 {
                    display: none;
                }
            }
        }
    }
    @media (max-width: 550px), (max-height: 620px) {
        div:has(> button[aria-label="設定"]) {
            gap: 0;
        }
    }
}
`);
    expanderStyleEl.disabled = await getIsExpanded();

    const initExpandButton = (parentNode) => {
        const fullScreenButtonEl = parentNode.querySelector('button[aria-label="全画面表示する"]');
        if (fullScreenButtonEl !== null) {
            const expandButtonEl = document.createElement('button');
            expandButtonEl.setAttribute('class', 'cursor_pointer');
            expandButtonEl.setAttribute('tabindex', '0');
            expandButtonEl.setAttribute('type', 'button');
            fullScreenButtonEl.before(expandButtonEl);

            const refreshExpansion = async () => {
                const isExpanded = await getIsExpanded();
                expanderStyleEl.disabled = !isExpanded;
                // These SVGs are chevrons-collapse-from-lines.svg and chevrons-expand-to-lines.svg in gravity-ui/icons.
                // gravity-ui/icons is licensed under the MIT License.
                // https://github.com/gravity-ui/icons/blob/main/LICENSE
                const svgPath = isExpanded ?
                    '<path fill-rule="evenodd" d="M1.5 2.75a.75.75 0 0 0-1.5 0v10.5a.75.75 0 0 0 1.5 0zm14.5 0a.75.75 0 0 0-1.5 0v10.5a.75.75 0 0 0 1.5 0zM3.47 4.97a.75.75 0 0 0 0 1.06L5.44 8L3.47 9.97a.75.75 0 1 0 1.06 1.06l2.5-2.5a.75.75 0 0 0 0-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0m9.06 1.06a.75.75 0 0 0-1.06-1.06l-2.5 2.5a.75.75 0 0 0 0 1.06l2.5 2.5a.75.75 0 1 0 1.06-1.06L10.56 8z" clip-rule="evenodd"/>' :
                    '<path fill-rule="evenodd" d="M1.5 2.75a.75.75 0 0 0-1.5 0v10.5a.75.75 0 0 0 1.5 0zm14.5 0a.75.75 0 0 0-1.5 0v10.5a.75.75 0 0 0 1.5 0zM6.53 4.97a.75.75 0 0 1 0 1.06L4.56 8l1.97 1.97a.75.75 0 1 1-1.06 1.06l-2.5-2.5a.75.75 0 0 1 0-1.06l2.5-2.5a.75.75 0 0 1 1.06 0m2.94 1.06a.75.75 0 0 1 1.06-1.06l2.5 2.5a.75.75 0 0 1 0 1.06l-2.5 2.5a.75.75 0 1 1-1.06-1.06L11.44 8z" clip-rule="evenodd"/>';
                expandButtonEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16" class="w_auto h_x5 p_base fill_icon.watchControllerBase hover:fill_icon.watchControllerHover">${svgPath}</svg>`;
                expandButtonEl.setAttribute('aria-label', isExpanded ? 'ウィンドウサイズ解除' : 'ウィンドウサイズ表示');
            };

            refreshExpansion();

            expandButtonEl.addEventListener('click', async () => {
                await GM_setValue('isExpanded', !(await getIsExpanded()));
                await refreshExpansion();
            });
        }

    };

    const observer = new MutationObserver((mutationList, observer) => {
        mutationList.filter(mutation => mutation.type === 'childList').forEach(mutation => {
            for (const node of mutation.addedNodes) {
                if (
                    node.nodeType === 1 &&
                    node.innerHTML.includes('aria-label="全画面表示する"')
                ) {
                    initExpandButton(node);
                }
            }
        });
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
})();

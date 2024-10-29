// ==UserScript==
// @name        nicovideo-player-expander
// @namespace   https://github.com/dnek
// @version     3.2
// @author      dnek
// @description ニコニコ動画のプレイヤーを2種類の方法（「シアターモード」または「ブラウザ内最大化」）で拡大します。プレイヤー右下のアイコンでこれらの機能を切り替えられます。それぞれtキー、bキーでも（ブラウザ内最大化解除はescキーでも）切り替えられます。「nicovideo-next-video-canceler」「nicovideo-autoplay-canceler」は別のスクリプトです。
// @description:ja    ニコニコ動画のプレイヤーを2種類の方法（「シアターモード」または「ブラウザ内最大化」）で拡大します。プレイヤー右下のアイコンでこれらの機能を切り替えられます。それぞれtキー、bキーでも（ブラウザ内最大化解除はescキーでも）切り替えられます。「nicovideo-next-video-canceler」「nicovideo-autoplay-canceler」は別のスクリプトです。
// @homepageURL https://github.com/dnek/nicovideo-player-expander
// @updateURL   https://github.com/dnek/nicovideo-player-expander/raw/main/nicovideo-player-expander.user.js
// @downloadURL https://github.com/dnek/nicovideo-player-expander/raw/main/nicovideo-player-expander.user.js
// @match       https://www.nicovideo.jp/watch/*
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_setValue
// @license     MIT license
// ==/UserScript==

(async () => {
    'use strict';

    const THEATER_MODE_BUTTON_CONTAINER_ID = 'npebTheaterModeButtonContainer';
    const BROWSER_FULL_BUTTON_CONTAINER_ID = 'npebBrowserFullButtonContainer';

    let _isTheaterMode = await GM_getValue('isTheaterMode', false);
    const getIsTheaterMode = () => _isTheaterMode;
    const setIsTheaterMode = (newValue) => {
        _isTheaterMode = newValue;
        GM_setValue('isTheaterMode', newValue);
    };

    const theaterModeStyleEl = GM_addStyle(`
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
@media (max-width: 720px), (max-height: 720px) {
    div:has(> button[aria-label="設定"]) {
        gap: 0;
    }
}
@media (max-width: 650px), (max-height: 680px) {
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
@media (max-width: 580px), (max-height: 640px) {
    svg.fill_icon\\.watchControllerBase {
        padding-inline: 4px;
    }
}
`);
    theaterModeStyleEl.disabled = getIsTheaterMode();

    let isBrowserFull = false;

    const browserFullStyleEl = GM_addStyle(`
:not(
    :has([data-styling-id=":r2:"]),
    [data-styling-id=":r2:"], [data-styling-id=":r2:"] *,
    :has([data-nvpc-scope="watch-floating-panel"]),
    [data-nvpc-scope="watch-floating-panel"],
    [data-nvpc-scope="watch-floating-panel"] *,
    :is([data-scope="toast"]), :is([data-scope="toast"]) *,
    :is(body > [data-part="positioner"]), :is(body > [data-part="positioner"]) *,
    :is(body > [data-part="backdrop"]), :is(body > [data-part="backdrop"]) *,
    body
) {
    display: none;
}
body {
    overflow-y: hidden !important;
}
#root > div.min-w_\\[max-content\\] {
    min-width: auto;
}
div[aria-label="nicovideo-content"] {
    padding-block: 0;
}
div.grid-area_\\[player\\] div.bdr_m {
    border-radius: 0;
}
div[aria-label="nicovideo-content"] > section.grid-template-areas_\\[_\\"player_sidebar\\"_\\"meta_sidebar\\"_\\"bottom_sidebar\\"_\\"\\._sidebar\\"_\\] {
    grid-template-columns: 100vw;
    grid-template-areas: "player" "meta" "bottom" "sidebar";
    padding-inline: 0;
    padding-bottom: 0;
    row-gap: 0;
}
div[data-styling-id=":r3:"] {
    aspect-ratio: auto;
    height: calc(
        100vh
        - var(--watch-controller-height)
        - var(--watch-player-actionbar-gap-height)
        - var(--watch-actionbar-height)
    );
}
div.grid-area_\\[sidebar\\] > div[data-nvpc-part="floating"] > section {
    position: fixed;
    top: var(--spacing-x3);
    width: var(--sizes-watch-sidebar-width);
}
div:has(> div > button[aria-label="コメント投稿ボタン"]) {
    min-width: auto !important;
}
@media (max-width: 640px) {
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
@media (max-width: 550px) {
    div:has(> button[aria-label="設定"]) {
        gap: 0;
    }
}
#${THEATER_MODE_BUTTON_CONTAINER_ID}, button[aria-label="全画面表示する"] {
    display: none;
}
`);
    browserFullStyleEl.disabled = true;

    const baseStyleEl = GM_addStyle(`
.npeb_container {
    display: grid;
    > .npeb_tooltip_container {
        position: relative;
        > .npeb_tooltip {
            visibility: hidden;
            min-width: max-content;
            background-color: var(--colors-tooltip-background);
            color: var(--colors-tooltip-text-on-background);
            font-size: var(--font-sizes-s);
            border-radius: var(--radii-s);
            padding: var(--spacing-base);
            position: absolute;
            top: 0;
            left: 50%;
            transform: translate(-50%, -135%);
            opacity: 0;
            transition: opacity .2s .2s;
        }
    }
}
.npeb_container:is(:hover,[data-hover]) .npeb_tooltip {
    visibility: visible;
    opacity: 1;
}
.npeb_icon {
    stroke: var(--colors-icon-watch-controller-base);
}
.npeb_icon:is(:hover,[data-hover]) {
    stroke: var(--colors-icon-watch-controller-hover);
}
`);
    baseStyleEl.disabled = true;

    const videoFullscreenStyleEl = GM_addStyle(`
.npeb_container {
    display: none;
}
`);

    let refreshButtonsAndStyles = () => { };
    let switchTheaterMode = () => { };
    let switchBrowserFull = () => { };

    const initButtons = () => {
        const fullScreenButtonEl = document.querySelector('button[aria-label="全画面表示する"]');
        if (fullScreenButtonEl === null) {
            return;
        }

        const initButton = (containerId, svgPathToOn, svgPathToOff, captionToOn, captionToOff) => {
            const buttonContainerEl = document.createElement('div');
            buttonContainerEl.setAttribute('id', containerId);
            buttonContainerEl.classList.add('npeb_container');

            const tooltipContainerEl = document.createElement('div');
            tooltipContainerEl.classList.add('npeb_tooltip_container');

            const tooltipEl = document.createElement('span');
            tooltipEl.classList.add('npeb_tooltip');
            tooltipContainerEl.appendChild(tooltipEl);

            buttonContainerEl.appendChild(tooltipContainerEl);

            const buttonEl = document.createElement('button');
            buttonEl.classList.add('cursor_pointer');
            buttonEl.setAttribute('tabindex', '0');
            buttonEl.setAttribute('type', 'button');
            buttonContainerEl.appendChild(buttonEl);

            fullScreenButtonEl.before(buttonContainerEl);

            const setButtonIsOn = (isOn) => {
                const svgPath = isOn ? svgPathToOff : svgPathToOn;
                buttonEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="w_auto h_x5 p_base fill_icon.watchControllerBase hover:fill_icon.watchControllerHover npeb_icon">${svgPath}</svg>`;
                buttonEl.setAttribute('aria-label', isOn ? captionToOff : captionToOn);
                tooltipEl.innerHTML = isOn ? captionToOff : captionToOn;
            };

            return [buttonEl, setButtonIsOn];
        };

        const [theaterModeButtonEl, setTheaterModeButtonIsOn] = initButton(
            THEATER_MODE_BUTTON_CONTAINER_ID,
            `<rect x="4" y="4" width="16" height="9" stroke-width="2" stroke-linejoin="round" />
<rect x="4" y="18" width="16" height="2" stroke-width="2" stroke-linejoin="round" />`,
            `<rect x="4" y="4" width="9" height="16" stroke-width="2" stroke-linejoin="round" />
<rect x="18" y="4" width="2" height="16" stroke-width="2" stroke-linejoin="round" />`,
            'シアターモードにする（t）',
            'シアターモード解除（t）'
        );

        const [browserFullButtonEl, setbrowserFullButtonIsOn] = initButton(
            BROWSER_FULL_BUTTON_CONTAINER_ID,
            `<rect x="1.5" y="2.5" width="21" height="19" fill="transparent" stroke-width="2" stroke-linejoin="round" />
<polyline points="6,12 9,9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
<polyline points="6,12 9,15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
<polyline points="18,12 15,9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
<polyline points="18,12 15,15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`,
            `<rect x="1.5" y="2.5" width="21" height="19" fill="transparent" stroke-width="2" stroke-linejoin="round" />
<polyline points="10,12 7,9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
<polyline points="10,12 7,15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
<polyline points="14,12 17,9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
<polyline points="14,12 17,15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`,
            'ブラウザ内で最大化する（b）',
            'ブラウザ内最大化解除（b）'
        );

        refreshButtonsAndStyles = async () => {
            const isVideoFullscreen = document.fullscreenElement !== null;
            baseStyleEl.disabled = isVideoFullscreen;
            videoFullscreenStyleEl.disabled = !isVideoFullscreen;
            const isTheaterModeRequired = !isBrowserFull && getIsTheaterMode();
            theaterModeStyleEl.disabled = isVideoFullscreen || !isTheaterModeRequired;
            browserFullStyleEl.disabled = isVideoFullscreen || !isBrowserFull;
            setTheaterModeButtonIsOn(isTheaterModeRequired);
            setbrowserFullButtonIsOn(isBrowserFull);
        };

        refreshButtonsAndStyles();

        switchTheaterMode = async () => {
            setIsTheaterMode(!getIsTheaterMode());
            refreshButtonsAndStyles();
        };

        theaterModeButtonEl.addEventListener('click', switchTheaterMode);

        switchBrowserFull = () => {
            isBrowserFull = !isBrowserFull;
            refreshButtonsAndStyles();
        };

        browserFullButtonEl.addEventListener('click', switchBrowserFull);

        console.log('nicovideo-player-expander buttons are added.')
    };

    document.addEventListener('fullscreenchange', () => {
        refreshButtonsAndStyles();
    });

    document.addEventListener('keydown', (e) => {
        if (document.fullscreenElement !== null) {
            return;
        }

        if (e.target && ['input', 'textarea'].includes(e.target.tagName.toLowerCase())) {
            return;
        }
        if (e.isComposing || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.repeat) {
            return;
        }

        if (e.code === 'KeyT' && !isBrowserFull) {
            switchTheaterMode();
        }

        if (e.code === 'KeyB' || (e.code === 'Escape' && isBrowserFull)) {
            switchBrowserFull();
        }
    });

    setInterval(() => {
        if (document.getElementById(THEATER_MODE_BUTTON_CONTAINER_ID) === null) {
            initButtons();
        }
    }, 100);
})();

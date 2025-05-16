// ==UserScript==
// @name         Universal Media Shortcuts
// @description  Adds custom shortcuts to video players
// @version      0.20.0
// @author       Nour Nasser
// @namespace    https://github.com/Nourz1234
// @match        *://*/*
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @updateURL    https://raw.githubusercontent.com/Nourz1234/user-scripts/main/projects/universal-media-shortcuts/dist/index.js
// @downloadURL  https://raw.githubusercontent.com/Nourz1234/user-scripts/main/projects/universal-media-shortcuts/dist/index.js
// ==/UserScript==
(function () {
    'use strict';

    function arrRemove(arr, item) {
        const index = arr.indexOf(item);
        if (index !== -1) {
            arr.splice(index, 1);
        }
    }

    async function sleep(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    /**
     * checks if a window is the top window (not an iframe)
     */
    function isTopFrame(win = window) {
        return win === win.parent;
    }
    function createElementFromHTML(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.firstElementChild instanceof HTMLElement ? temp.firstElementChild : null;
    }
    function fail(error) {
        throw error;
    }

    var skipDlgStyles = `
.VE_Main {
    all: revert;
    direction: ltr;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    transition-duration: 0.2s;
}

.VE_Main * {
    color: #C0C0C5;
    font-size: 16px;
}

.VE_Background_Blur {
    position: absolute;
    background: rgba(0, 0, 0, 0.8);
    width: 100%;
    height: 100%;
}

.VE_SkipDlg {
    box-shadow: 0px 0px 10px #1939F5;
    background: #151515;
    z-index: 100;
}

.VE_SkipDlg_Title {
    text-align: center;
    background: #1939F5;
    padding: 5px;
    font-weight: bold;
}

.VE_SkipDlg_Client {
    padding: 5px;
    border: 1px solid #1939F5;
    box-shadow: inset 0px 0px 10px #1939F5;
}

.VE_NumUpDown {
    display: flex;
    flex-direction: row;
    border: 1px solid #404040;
}

.VE_NumUpDown:hover {
    border-color: #0a2ae8;
}

.VE_NumUpDown input[type=number] {
    -moz-appearance: textfield;
    appearance: textfield;
    background: transparent;
    padding: 0px 3px;
    border: none;
    width: 20px;
}

.VE_NumUpDown .VE_NumUpDown_Up,
.VE_NumUpDown .VE_NumUpDown_Down {
    fill: #1939F5;
    font-size: 10px;
    padding: 3px;
    background: transparent;
    border: none;
}

.VE_NumUpDown .VE_NumUpDown_Up:active svg,
.VE_NumUpDown .VE_NumUpDown_Down:active svg {
    transform: scale(0.7);
}

.VE_Button {
    padding: 8px;
    background: #1939F5;
    border: none;
}

.VE_Button:hover {
    background: #0a2ae8;
}

.VE_Button:active {
    background: #0721b5;
}

.VE_Select select {
    border: 1px solid #404040;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    height: 100%;
    padding: 0px 20px 0px 0px;
    background: #151515;
    background-image:
        linear-gradient(45deg, transparent 50%, #1939F5 50%),
        linear-gradient(135deg, #1939F5 50%, transparent 50%),
        linear-gradient(to right, #404040, #404040);
    background-position:
        calc(100% - 10px) 50%,
        calc(100% - 5px) 50%,
        calc(100% - 20px) 0px;
    background-size:
        5px 5px,
        5px 5px,
        1px 100%;
    background-repeat: no-repeat;
}

.VE_Select select:hover {
    border-color: #0a2ae8;
}`;

    var skipDlgHtml = `<div class="VE_Main" style="opacity: 0;">
    <div class="VE_Background_Blur"></div>
    <div class="VE_SkipDlg">
        <div class="VE_SkipDlg_Title">
            <label>Skip</label>
        </div>
        <div class="VE_SkipDlg_Client">
            <div style="display: flex; flex-direction: row; align-items: baseline;">
                <label>Mins:</label>
                <div class="VE_NumUpDown" style="margin-left: 5px">
                    <input class="VE_NumUpDown_Value VE_Skip_Mins" type="number" disabled value="1" min="0" />
                    <div style="display: flex; flex-direction: column; border-left: 1px solid #404040;">
                        <button class="VE_NumUpDown_Up">
                            <svg height="7" width="7">
                                <path d="M0,7 L3.5,0 L7,7 Z" />
                            </svg>
                        </button>
                        <button class="VE_NumUpDown_Down">
                            <svg height="7" width="7">
                                <path d="M0,0 L3.5,7 L7,0 Z" />
                            </svg>
                        </button>
                    </div>
                </div>
                <label style="margin-left: 5px">Secs:</label>
                <div class="VE_Select" style="margin-left: 5px; align-self: stretch;">
                    <select class="VE_Skip_Secs">
                        <option value="00">00</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option selected value="30">30</option>
                        <option value="40">40</option>
                        <option value="50">50</option>
                    </select>
                </div>
            </div>
            <div style="display: flex; flex-direction: row-reverse; margin-top: 5px">
                <button class="VE_Skip_Cancel VE_Button">Cancel</button>
                <button class="VE_Skip_Ok VE_Button" style="margin-right: 5px">Ok</button>
            </div>
        </div>
    </div>
</div>`;

    var styles = `
.ums-controls-hidden * {
    cursor: none !important;
}

.ums-controls-hidden.jwplayer> .jw-wrapper> :not(.jw-media, .jw-captions),
.ums-controls-hidden.video-js> :not(video, .vjs-text-track-display),
.ums-controls-hidden.plyr> :not(.plyr__video-wrapper),
.ums-controls-hidden.ytd-player>.html5-video-player> :not(.html5-video-container, .ytp-caption-window-container),
.ums-controls-hidden.pjscssed> :not(:has(> video)) {
    display: none !important;
}

.ums-cc-hidden.jwplayer> .jw-wrapper> .jw-captions,
.ums-cc-hidden.video-js> .vjs-text-track-display,
/* .ums-cc-hidden.plyr> :not(.plyr__video-wrapper), */
.ums-cc-hidden.ytd-player>.html5-video-player> .ytp-caption-window-container {
    display: none;
}`;

    const log = console.info.bind(null, '[Universal Media Shortcuts]');
    log('Starting...', window.location.href);
    GM_addStyle(styles);
    GM_addStyle(skipDlgStyles);
    const playersSelector = [
        '.jwplayer',
        '.video-js',
        '.plyr',
        '.ytd-player', // youtube player
        '.pjscssed', // PlayerJS
    ].join(',');
    let currentPlayer;
    let currentVideo;
    function toggleControlsVisibility() {
        if (currentPlayer.classList.contains('ums-controls-hidden')) {
            currentPlayer.classList.remove('ums-controls-hidden');
        }
        else {
            currentPlayer.classList.add('ums-controls-hidden');
        }
        currentVideo.focus();
    }
    function toggleCaptionsVisibility() {
        if (currentPlayer.classList.contains('ums-cc-hidden')) {
            currentPlayer.classList.remove('ums-cc-hidden');
        }
        else {
            currentPlayer.classList.add('ums-cc-hidden');
        }
    }
    function skip() {
        if (document.querySelector('.VE_SkipDlg') != null) {
            return;
        }
        const skipDlg = createElementFromHTML(skipDlgHtml)
            ?? fail(new Error('Failed to create skip dialog.'));
        const udUp = skipDlg.querySelector('.VE_NumUpDown_Up')
            ?? fail(new Error("Couldn't find skip dialog part"));
        const udDn = skipDlg.querySelector('.VE_NumUpDown_Down')
            ?? fail(new Error("Couldn't find skip dialog part"));
        const inputMins = skipDlg.querySelector('.VE_Skip_Mins')
            ?? fail(new Error("Couldn't find skip dialog part"));
        const inputSecs = skipDlg.querySelector('.VE_Skip_Secs')
            ?? fail(new Error("Couldn't find skip dialog part"));
        const btnCancel = skipDlg.querySelector('.VE_Skip_Cancel')
            ?? fail(new Error("Couldn't find skip dialog part"));
        const btnOk = skipDlg.querySelector('.VE_Skip_Ok')
            ?? fail(new Error("Couldn't find skip dialog part"));
        udUp.addEventListener('click', function () {
            let value = parseInt(inputMins.value);
            value += 1;
            inputMins.value = Math.min(99, value).toString();
        });
        udDn.addEventListener('click', function () {
            let value = parseInt(inputMins.value);
            value -= 1;
            inputMins.value = Math.max(0, value).toString();
        });
        let wasPlaying = false;
        function loadPreferences() {
            const minsValue = GM_getValue('MinsValue', 1);
            const secsIndex = GM_getValue('SecsIndex', 2);
            inputMins.value = minsValue.toString();
            inputSecs.selectedIndex = secsIndex;
        }
        function savePreferences() {
            const minsValue = parseInt(inputMins.value);
            const secsIndex = inputSecs.selectedIndex;
            GM_setValue('MinsValue', minsValue);
            GM_setValue('SecsIndex', secsIndex);
        }
        function close() {
            currentPlayer.removeChild(skipDlg);
            if (wasPlaying) {
                void currentVideo.play();
            }
            arrRemove(rules, cancelRule);
            arrRemove(rules, okRule);
        }
        function show() {
            loadPreferences();
            currentPlayer.appendChild(skipDlg);
            setTimeout(() => {
                skipDlg.style.opacity = '1';
            }, 0);
            wasPlaying = !currentVideo.paused;
            currentVideo.pause();
            rules.unshift(cancelRule, okRule);
        }
        function doSkip() {
            savePreferences();
            const mins = parseInt(inputMins.value);
            const secs = parseInt(inputSecs.value);
            currentVideo.currentTime += (mins * 60) + secs;
            close();
        }
        btnCancel.addEventListener('click', close);
        btnOk.addEventListener('click', doSkip);
        const cancelRule = { key: 'Escape', handler: close, noDefault: true, noOtherHandlers: true };
        const okRule = { key: 'Enter', handler: doSkip, noDefault: true, noOtherHandlers: true };
        show();
    }
    function skipForward() {
        currentVideo.currentTime += 3;
    }
    function skipBackward() {
        currentVideo.currentTime -= 3;
    }
    function volUp() {
        currentVideo.volume = Math.min(1, currentVideo.volume + 0.05);
    }
    function volDown() {
        currentVideo.volume = Math.max(0, currentVideo.volume - 0.05);
    }
    function togglePause() {
        if (currentVideo.paused) {
            void currentVideo.play();
        }
        else {
            currentVideo.pause();
        }
    }
    function speedUp() {
        currentVideo.playbackRate += 0.05;
    }
    function speedDown() {
        currentVideo.playbackRate -= 0.05;
    }
    function speedReset() {
        currentVideo.playbackRate = 1;
    }
    // rules
    const rules = [
        // ]
        {
            code: 'BracketRight',
            handler: toggleControlsVisibility,
            noDefault: true,
            noOtherHandlers: true,
        },
        // [
        {
            code: 'BracketLeft',
            handler: toggleCaptionsVisibility,
            noDefault: true,
            noOtherHandlers: true,
        },
        { code: 'KeyQ', handler: skip, noDefault: true, noOtherHandlers: true },
        { code: 'ArrowRight', handler: skipForward, noDefault: true, noOtherHandlers: true },
        { code: 'ArrowLeft', handler: skipBackward, noDefault: true, noOtherHandlers: true },
        { code: 'ArrowUp', handler: volUp, noDefault: true, noOtherHandlers: true },
        { code: 'ArrowDown', handler: volDown, noDefault: true, noOtherHandlers: true },
        { code: 'Space', handler: togglePause, noDefault: true, noOtherHandlers: true },
        // playback speed control
        { code: 'ArrowRight', altKey: true, handler: speedUp, noDefault: true, noOtherHandlers: true },
        { code: 'ArrowLeft', altKey: true, handler: speedDown, noDefault: true, noOtherHandlers: true },
        { code: 'Numpad0', altKey: true, handler: speedReset, noDefault: true, noOtherHandlers: true },
        // disable mute key
        { key: 'm', handler: null, noDefault: true, noOtherHandlers: true },
        // disable next key (9anime)
        { key: 'n', handler: null, noDefault: true, noOtherHandlers: true },
        // disable back key (9anime)
        { key: 'b', handler: null, noDefault: true, noOtherHandlers: true },
        // disable the numpad
        { code: 'Numpad0', handler: null, noDefault: true, noOtherHandlers: true },
        { code: 'Numpad1', handler: null, noDefault: true, noOtherHandlers: true },
        { code: 'Numpad2', handler: null, noDefault: true, noOtherHandlers: true },
        { code: 'Numpad3', handler: null, noDefault: true, noOtherHandlers: true },
        { code: 'Numpad4', handler: null, noDefault: true, noOtherHandlers: true },
        { code: 'Numpad5', handler: null, noDefault: true, noOtherHandlers: true },
        { code: 'Numpad6', handler: null, noDefault: true, noOtherHandlers: true },
        { code: 'Numpad7', handler: null, noDefault: true, noOtherHandlers: true },
        { code: 'Numpad8', handler: null, noDefault: true, noOtherHandlers: true },
        { code: 'Numpad9', handler: null, noDefault: true, noOtherHandlers: true },
        { code: 'NumpadAdd', handler: null, noDefault: true, noOtherHandlers: true },
        { code: 'NumpadSubtract', handler: null, noDefault: true, noOtherHandlers: true },
        { code: 'NumpadMultiply', handler: null, noDefault: true, noOtherHandlers: true },
        { code: 'NumpadDivide', handler: null, noDefault: true, noOtherHandlers: true },
        { code: 'NumpadDecimal', handler: null, noDefault: true, noOtherHandlers: true },
        { code: 'NumpadEnter', handler: null, noDefault: true, noOtherHandlers: true },
    ];
    function isSameKey(evt, rule) {
        const { key, code, ctrlKey = false, altKey = false, shiftKey = false } = rule;
        const modifiersMatch = ctrlKey === evt.ctrlKey && altKey === evt.altKey
            && shiftKey == evt.shiftKey;
        if (!modifiersMatch) {
            return false;
        }
        if (key) {
            return key === evt.key;
        }
        else if (code) {
            return code === evt.code;
        }
        return false;
    }
    function ensureCurrentPlayer() {
        const video = document.querySelector('video');
        if (video === null) {
            return false;
        }
        const player = video.closest(playersSelector);
        if (player === null) {
            // alert('Player not supported!');
            return false;
        }
        currentVideo = video;
        currentPlayer = player;
        return true;
    }
    function globalKeyHandler(e) {
        if (isTopFrame() && !document.fullscreenElement) {
            return;
        }
        if (!ensureCurrentPlayer()) {
            return;
        }
        for (const rule of rules.filter(x => isSameKey(e, x))) {
            rule.handler?.();
            if (rule.noDefault) {
                // no default
                e.preventDefault();
            }
            if (rule.noOtherHandlers) {
                // eat the event!
                e.stopImmediatePropagation();
                break;
            }
        }
    }
    function globalKeyBlockHandler(e) {
        if (isTopFrame() && !document.fullscreenElement) {
            return;
        }
        if (!ensureCurrentPlayer()) {
            return;
        }
        e.preventDefault();
        e.stopImmediatePropagation();
    }
    async function onFullscreenChange() {
        if (!ensureCurrentPlayer()) {
            return;
        }
        if (document.fullscreenElement) {
            await sleep(100);
            currentVideo.focus();
        }
    }
    document.addEventListener('keydown', globalKeyHandler, { capture: true });
    document.addEventListener('keyup', globalKeyBlockHandler, { capture: true });
    document.addEventListener('keypress', globalKeyBlockHandler, { capture: true });
    document.addEventListener('fullscreenchange', () => void onFullscreenChange(), { capture: true });

})();

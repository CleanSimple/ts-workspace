// ==UserScript==
// @name         Universal Media Shortcuts
// @description  Adds custom shortcuts to video players
// @version      0.23.0
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

    function hasKey(obj, key) {
        return key in obj;
    }
    function isKeyReadonly(obj, key) {
        let currentObj = obj;
        while (currentObj !== null) {
            const desc = Object.getOwnPropertyDescriptor(currentObj, key);
            if (desc) {
                return desc.writable === false || desc.set === undefined;
            }
            currentObj = Object.getPrototypeOf(currentObj);
        }
        return true;
    }

    let currentInstance;
    function setCurrentInstance(instance) {
        const prev = currentInstance;
        currentInstance = instance;
        return () => {
            currentInstance = prev;
        };
    }
    function onMounted(callback) {
        if (currentInstance === null) {
            throw new Error();
        }
        currentInstance.mountedHooks.push(callback);
    }

    class Ref {
        _current = null;
        get current() {
            return this._current;
        }
        setCurrent(value) {
            this._current = value;
        }
    }
    function createRef() {
        return new Ref();
    }

    const Fragment = 'Fragment';
    function createVNode(type, props = {}, children = [], isDev = false) {
        return { type, props, children, mountedHooks: [], isDev };
    }
    function jsx(type, props) {
        let children = props.children ?? [];
        children = Array.isArray(children) ? children : [children];
        delete props.children;
        return createVNode(type, props, children, false);
    }
    function render(root, element) {
        return _render(root, element);
    }
    function _render(root, element, isSvgContext = false) {
        if (element === undefined || element === null || typeof element === 'boolean') {
            return;
        }
        else if (typeof element === 'string' || typeof element === 'number') {
            root.appendChild(document.createTextNode(String(element)));
            return;
        }
        const renderChildren = (node, children, isSvg) => children.flat().forEach(child => _render(node, child, isSvg));
        const { type, props, children } = element;
        if (typeof type === 'function') {
            const rest = setCurrentInstance(element);
            try {
                const vNode = type({ ...props, children });
                _render(root, vNode, isSvgContext);
                element.mountedHooks.forEach(mountedHook => mountedHook());
            }
            finally {
                rest();
            }
        }
        else if (type === Fragment) {
            // renderChildren(root, children);
            const fragment = document.createDocumentFragment();
            renderChildren(fragment, children, isSvgContext);
            root.appendChild(fragment);
        }
        else {
            const isSvg = isSvgContext || type === 'svg';
            const elem = isSvg
                ? document.createElementNS('http://www.w3.org/2000/svg', type)
                : document.createElement(type);
            if (props) {
                setProps(elem, props, isSvg);
            }
            renderChildren(elem, children, isSvg);
            root.appendChild(elem);
        }
    }
    function setProps(elem, props, isSvg) {
        Object.entries(props).forEach(([key, value]) => {
            if (key === 'ref' && value instanceof Ref) {
                value.setCurrent(elem);
            }
            else if (key === 'style' && value instanceof Object) {
                Object.assign(elem.style, value);
            }
            else if (key === 'dataset' && value instanceof Object) {
                Object.assign(elem.dataset, value);
            }
            else if (/^on[A-Z]/.exec(key)) {
                elem.addEventListener(key.slice(2).toLowerCase(), value);
            }
            else if (hasKey(elem, key) && !isKeyReadonly(elem, key)) {
                Object.assign(elem, { [key]: value });
            }
            else {
                if (isSvg) {
                    elem.setAttributeNS(null, key, String(value));
                }
                else {
                    elem.setAttribute(key, String(value));
                }
            }
        });
    }

    var skipDlgStyles = `:root {
    --main-color: #1939F5;
    --border-color: #404040;
    --border-active-color: #0a2ae8;
    --background-color: #151515;
    --text-color: #C0C0C5;
}


.skip-dlg-container {
    all: revert;

    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    transition-duration: 0.2s;
    /* font */
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: initial;
    font-weight: initial;
    font-style: initial;
    color: var(--text-color);

    * {
        font-family: inherit;
        font-size: inherit;
        font-weight: inherit;
        font-style: inherit;
        color: inherit;
    }

    .backdrop {
        position: absolute;
        background: rgba(0, 0, 0, 0.8);
        width: 100%;
        height: 100%;
    }
}


.skip-dlg {
    box-shadow: 0px 0px 10px var(--main-color);
    background: var(--background-color);
    z-index: 100;

    .title {
        text-align: center;
        background: var(--main-color);
        padding: 5px;
        font-weight: bold;
    }

    .body {
        padding: 5px;
        border: 1px solid var(--main-color);
        box-shadow: inset 0px 0px 10px var(--main-color);
    }

    .select-container select {
        border: 1px solid var(--border-color);
        appearance: none;
        height: 100%;
        padding: 0px 25px 0px 5px;
        background: var(--background-color);
        background-image:
            linear-gradient(45deg, transparent 50%, var(--main-color) 50%),
            linear-gradient(135deg, var(--main-color) 50%, transparent 50%),
            linear-gradient(to right, var(--border-color), var(--border-color));
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

    .select-container select:hover {
        border-color: var(--border-active-color);
    }

    button {
        padding: 8px;
        background: var(--main-color);
        border: none;
    }

    button:hover {
        filter: brightness(125%);
    }

    .actions-container {
        display: flex;
        flex-direction: row-reverse;
    }
}
`;

    var styles = `/* hiding controls */
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

/* handle dark backdrop in DoodStream player */
.ums-controls-hidden.video-js> .vjs-text-track-display {
    background: none !important;
}



/* hiding subtitles */
.ums-cc-hidden.jwplayer> .jw-wrapper> .jw-captions,
.ums-cc-hidden.video-js> .vjs-text-track-display,
/* .ums-cc-hidden.plyr> :not(.plyr__video-wrapper), */
.ums-cc-hidden.ytd-player>.html5-video-player> .ytp-caption-window-container {
    display: none !important;
}
`;

    var upDownControlStyles = `.up-down-control {
    display: flex;
    flex-direction: row;
    border: 1px solid var(--border-color);
}

.up-down-control:hover {
    border-color: var(--border-active-color);
}

.up-down-control input[type=number] {
    appearance: textfield;
    background: transparent;
    padding: 0px 3px;
    border: none;
    width: 20px;
}

.up-down-control .btn-increment,
.up-down-control .btn-decrement {
    fill: var(--main-color);
    font-size: 10px;
    padding: 3px;
    line-height: 7px;
    background: transparent;
    border: none;
}

.up-down-control .btn-increment:active svg,
.up-down-control .btn-decrement:active svg {
    transform: scale(0.7);
}
`;

    function UpDown({ value = 1, onValueChanged, ...props }) {
        const input = createRef();
        function increment() {
            if (!input.current)
                throw new Error();
            value = Math.min(99, value + 1);
            input.current.value = value.toString();
            onValueChanged?.(value);
        }
        function decrement() {
            if (!input.current)
                throw new Error();
            value = Math.max(0, value - 1);
            console.info(input);
            input.current.value = value.toString();
            onValueChanged?.(value);
        }
        return (jsx("div", { className: 'up-down-control', ...props, children: [jsx("input", { ref: input, type: 'number', disabled: true, value: value.toString(), min: '0' }), jsx("div", { style: {
                        display: 'flex',
                        flexDirection: 'column',
                        borderLeft: '1px solid #404040',
                    }, children: [jsx("button", { className: 'btn-increment', onClick: increment, children: jsx("svg", { height: '7', width: '7', children: jsx("path", { d: 'M0,7 L3.5,0 L7,7 Z' }) }) }), jsx("button", { className: 'btn-decrement', onClick: decrement, children: jsx("svg", { height: '7', width: '7', children: jsx("path", { d: 'M0,0 L3.5,7 L7,0 Z' }) }) })] })] }));
    }

    function SkipDlg({ targetVideo, enterRule, escRule, onClosed }) {
        const container = createRef();
        const wasPlaying = !targetVideo.paused;
        let skipMins = GM_getValue('MinsValue', 1);
        let skipSecs = GM_getValue('SecsValue', 0);
        function close() {
            container.current?.remove();
            if (wasPlaying) {
                void targetVideo.play();
            }
            onClosed();
        }
        function show() {
            targetVideo.pause();
            if (!container.current)
                throw new Error();
            container.current.style.opacity = '1';
        }
        function handleCancel() {
            close();
        }
        function handleOk() {
            GM_setValue('MinsValue', skipMins);
            GM_setValue('SecsValue', skipSecs);
            targetVideo.currentTime += (skipMins * 60) + skipSecs;
            close();
        }
        enterRule.handler = handleOk;
        escRule.handler = handleCancel;
        onMounted(show);
        return (jsx("div", { ref: container, className: 'skip-dlg-container', style: { opacity: 1 }, children: [jsx("div", { className: 'backdrop' }), jsx("div", { className: 'skip-dlg', children: [jsx("div", { className: 'title', children: jsx("label", { children: "Skip" }) }), jsx("div", { className: 'body', children: [jsx("div", { style: { display: 'flex', flexDirection: 'row', alignItems: 'baseline' }, children: [jsx("label", { children: "Mins:" }), jsx(UpDown, { value: skipMins, onValueChanged: (mins) => skipMins = mins, style: { marginLeft: '5px' } }), jsx("label", { style: { marginLeft: '5px' }, children: "Secs:" }), jsx("div", { className: 'select-container', style: { marginLeft: '5px', alignSelf: 'stretch' }, children: jsx("select", { onChange: (e) => skipSecs = parseInt(e.currentTarget.value), children: [0, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((secs) => (jsx("option", { selected: secs == skipSecs, value: secs.toString(), children: secs.toString().padStart(2, '0') }))) }) })] }), jsx("div", { className: 'actions-container', style: { marginTop: '5px' }, children: [jsx("button", { onClick: handleCancel, children: "Cancel" }), jsx("button", { style: { marginRight: '5px' }, onClick: handleOk, children: "Ok" })] })] })] })] }));
    }

    const log = console.info.bind(null, '[Universal Media Shortcuts]');
    log('Starting...', window.location.href);
    GM_addStyle(styles);
    GM_addStyle(upDownControlStyles);
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
        if (document.querySelector('.skip-dlg-container') != null) {
            return;
        }
        function onClosed() {
            arrRemove(rules, escRule);
            arrRemove(rules, enterRule);
        }
        const escRule = { key: 'Escape', handler: null, noDefault: true, noOtherHandlers: true };
        const enterRule = { key: 'Enter', handler: null, noDefault: true, noOtherHandlers: true };
        rules.unshift(escRule, enterRule);
        render(currentPlayer, jsx(SkipDlg, { targetVideo: currentVideo, enterRule: enterRule, escRule: escRule, onClosed: onClosed }));
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

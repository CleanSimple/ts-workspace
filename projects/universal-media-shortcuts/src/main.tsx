import { render } from '@lib/plain-jsx';
import { arrRemove, isTopFrame, sleep } from '@lib/utils';
import skipDlgStyles from './styles/skip-dlg.css';
import styles from './styles/styles.css';
import upDownControlStyles from './styles/up-down-control.css';
import type { HotkeyRule } from './types';
import { SkipDlg } from './UI/SkipDlg';

type LogType = typeof console.info;
const log: LogType = console.info.bind(null, '[Universal Media Shortcuts]');

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

let currentPlayer: HTMLElement;
let currentVideo: HTMLVideoElement;

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

    render(
        currentPlayer,
        <SkipDlg
            targetVideo={currentVideo}
            enterRule={enterRule}
            escRule={escRule}
            onClosed={onClosed}
        />,
    );
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
const rules: HotkeyRule[] = [
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

function isSameKey(evt: KeyboardEvent, rule: HotkeyRule) {
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

    const player = video.closest<HTMLElement>(playersSelector);
    if (player === null) {
        // alert('Player not supported!');
        return false;
    }

    currentVideo = video;
    currentPlayer = player;
    return true;
}

function globalKeyHandler(e: KeyboardEvent) {
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

function globalKeyBlockHandler(e: KeyboardEvent) {
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

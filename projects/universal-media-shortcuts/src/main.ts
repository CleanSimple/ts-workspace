import type { Hotkey, VideoContext } from './types';

import { sleep } from '@cleansimple/utils-js';
import { Hotkeys } from './hotkeys';
import skipDlgStyles from './styles/skip-dlg.css';
import styles from './styles/styles.css';
import upDownControlStyles from './styles/up-down-control.css';
import { VideoContextManager } from './video-context-manager';

type LogType = typeof console.info;
const log: LogType = console.info.bind(null, '[Universal Media Shortcuts]');

log('Starting...', window.location.href);

GM_addStyle(styles);
GM_addStyle(upDownControlStyles);
GM_addStyle(skipDlgStyles);

function matchKey(evt: KeyboardEvent, hotkey: Hotkey) {
    const { key, code, ctrlKey = false, altKey = false, shiftKey = false } = hotkey;

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

function matchState(evt: KeyboardEvent, hotkey: Hotkey, context: VideoContext) {
    const { when = 'default' } = hotkey;
    switch (when) {
        case 'default':
            return ['playing', 'paused'].includes(context.playerWrapper.status);
        case 'playing':
            return context.playerWrapper.status === 'playing';
        case 'paused':
            return context.playerWrapper.status === 'paused';
        case 'skipping':
            return context.playerWrapper.status === 'skipping';
    }
}

function makeHandler<
    TEvent extends Event,
    T extends (e: TEvent, context: VideoContext) => void,
>(eventHandler: T) {
    return (e: TEvent) => {
        if (e.target instanceof HTMLVideoElement) {
            const context = VideoContextManager.getContext(e.target);
            if (context) {
                eventHandler(e, context);
            }
        }
        else {
            for (const video of document.querySelectorAll('video')) {
                const context = VideoContextManager.getContext(video);
                if (context?.playerWrapper.isEventSource(e)) {
                    eventHandler(e, context);
                    break;
                }
            }
        }
    };
}

function handleKeyDown(e: KeyboardEvent, context: VideoContext) {
    const matchingHotkeys = Hotkeys.filter(hotkey =>
        matchKey(e, hotkey) && matchState(e, hotkey, context)
    );
    for (const hotkey of matchingHotkeys) {
        hotkey.handler?.(context);
        if (hotkey.noDefault) {
            // no default
            e.preventDefault();
        }
        if (hotkey.noOtherHandlers) {
            // eat the event!
            e.stopImmediatePropagation();
            break;
        }
    }
}

function handleKeyPress(e: KeyboardEvent, _context: VideoContext) {
    e.preventDefault();
    e.stopImmediatePropagation();
}

function handleKeyUp(e: KeyboardEvent, _context: VideoContext) {
    e.preventDefault();
    e.stopImmediatePropagation();
}

function handleClick(e: MouseEvent, context: VideoContext) {
    context.playerWrapper.focus();
}

async function handleFullscreenChange(e: Event, context: VideoContext) {
    if (document.fullscreenElement) {
        await sleep(100);
        context.playerWrapper.focus();
    }
}

document.addEventListener('keydown', makeHandler(handleKeyDown), { capture: true });
document.addEventListener('keyup', makeHandler(handleKeyUp), { capture: true });
document.addEventListener('keypress', makeHandler(handleKeyPress), { capture: true });
document.addEventListener('click', makeHandler(handleClick), { capture: true });
document.addEventListener('fullscreenchange', makeHandler(handleFullscreenChange), {
    capture: true,
});

import type { VideoContext } from './types';

import { isTopFrame } from '@cleansimple/utils-js';
import { queueAsyncHandler } from './handler-queue';
import { Hotkeys } from './hotkeys';
import skipDlgStyles from './styles/skip-dlg.css';
import styles from './styles/styles.css';
import upDownControlStyles from './styles/up-down-control.css';
import {
    exitFullscreenMessage,
    isExitFullscreenMessage,
    isRequestFullscreenMessage,
    matchKey,
    matchState,
    requestFullscreenMessage,
} from './utils';
import { VideoContextManager } from './video-context-manager';

type LogType = typeof console.info;
const log: LogType = console.info.bind(null, '[Universal Media Shortcuts]');

log('Starting...', window.location.href);

GM_addStyle(styles);
GM_addStyle(upDownControlStyles);
GM_addStyle(skipDlgStyles);

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

let inMemoryFullscreenState: boolean = false;
async function handleDoubleClick(e: MouseEvent, context: VideoContext) {
    if (!context.playerWrapper.isEventSource(e, 'video')) {
        return;
    }

    e.preventDefault();
    e.stopImmediatePropagation();

    context.playerWrapper.focus();

    inMemoryFullscreenState = !inMemoryFullscreenState;
    try {
        if (inMemoryFullscreenState) {
            await context.playerWrapper.requestFullscreen();
        }
        else {
            await document.exitFullscreen();
        }
    }
    catch {
        if (!isTopFrame()) {
            if (inMemoryFullscreenState) {
                window.parent.postMessage(requestFullscreenMessage(), '*');
            }
            else {
                window.parent.postMessage(exitFullscreenMessage(), '*');
            }
        }
    }
}

async function handleRequestFullscreen(e: MessageEvent) {
    if (!isTopFrame()) {
        // bubble up
        window.parent.postMessage(e.data, '*');
        return;
    }

    if (document.fullscreenElement) {
        return;
    }

    for (const iframe of document.querySelectorAll('iframe')) {
        if (iframe.contentWindow === e.source) {
            await iframe.requestFullscreen();
            break;
        }
    }
}

async function handleExitFullscreen(e: MessageEvent) {
    if (!isTopFrame()) {
        // bubble up
        window.parent.postMessage(e.data, '*');
        return;
    }
    if (!document.fullscreenElement) {
        return;
    }

    await document.exitFullscreen();
}

document.addEventListener('keydown', makeHandler(handleKeyDown), { capture: true });
document.addEventListener('keyup', makeHandler(handleKeyUp), { capture: true });
document.addEventListener('keypress', makeHandler(handleKeyPress), { capture: true });
document.addEventListener('click', makeHandler(handleClick), { capture: true });
document.addEventListener('dblclick', makeHandler(handleDoubleClick), { capture: true });
window.addEventListener('message', event => {
    if (isRequestFullscreenMessage(event.data)) {
        queueAsyncHandler(() => handleRequestFullscreen(event));
    }
    if (isExitFullscreenMessage(event.data)) {
        queueAsyncHandler(() => handleExitFullscreen(event));
    }
});

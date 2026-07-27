import type { VideoContext } from './types';

import { addMessageHandler, isTopFrame, sendMessage } from '@cleansimple/utils-js';
import { Hotkeys } from './hotkeys';
import skipDlgStyles from './styles/skip-dlg.css';
import styles from './styles/styles.css';
import upDownControlStyles from './styles/up-down-control.css';
import { matchKey, matchState } from './utils';
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

async function handleDoubleClick(e: MouseEvent, context: VideoContext) {
    if (!context.playerWrapper.isEventSource(e, 'video')) {
        return;
    }

    e.preventDefault();
    e.stopImmediatePropagation();

    const isFullscreen = isTopFrame()
        ? document.fullscreenElement !== null
        : await sendMessage(window.parent, 'is-fullscreen', void 0, {
            targetOrigin: '*',
        });
    try {
        if (isFullscreen) {
            await document.exitFullscreen();
        }
        else {
            await context.playerWrapper.requestFullscreen();
        }
    }
    catch {
        if (!isTopFrame()) {
            await sendMessage(
                window.parent,
                isFullscreen ? 'exit-fullscreen' : 'request-fullscreen',
                void 0,
                { targetOrigin: '*' },
            );
        }
    }
    context.playerWrapper.focus();
}

document.addEventListener('keydown', makeHandler(handleKeyDown), { capture: true });
document.addEventListener('keyup', makeHandler(handleKeyUp), { capture: true });
document.addEventListener('keypress', makeHandler(handleKeyPress), { capture: true });
document.addEventListener('click', makeHandler(handleClick), { capture: true });
document.addEventListener('dblclick', makeHandler(handleDoubleClick), { capture: true });

addMessageHandler('is-fullscreen', async ({ reply }) => {
    if (isTopFrame()) {
        reply(document.fullscreenElement !== null, { targetOrigin: '*' });
    }
    else {
        const isFullscreen = await sendMessage(window.parent, 'is-fullscreen', void 0, {
            targetOrigin: '*',
        });
        reply(isFullscreen, { targetOrigin: '*' });
    }
});

addMessageHandler('request-fullscreen', async ({ event, reply, reject }) => {
    try {
        if (isTopFrame()) {
            if (document.fullscreenElement) {
                return;
            }
            if (!event.source) {
                return;
            }

            for (const iframe of document.querySelectorAll('iframe')) {
                if (iframe.contentWindow === event.source) {
                    await iframe.requestFullscreen();
                    break;
                }
            }
        }
        else {
            await sendMessage(window.parent, 'request-fullscreen', void 0);
        }
        reply(void 0, { targetOrigin: '*' });
    }
    catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)), { targetOrigin: '*' });
    }
});

addMessageHandler('exit-fullscreen', async ({ reply, reject }) => {
    try {
        if (isTopFrame()) {
            await document.exitFullscreen();
        }
        else {
            await sendMessage(window.parent, 'exit-fullscreen', void 0);
        }
        reply(void 0, { targetOrigin: '*' });
    }
    catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)), { targetOrigin: '*' });
    }
});

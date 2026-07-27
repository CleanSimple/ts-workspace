import type { Hotkey, VideoContext } from './types';

export function matchKey(evt: KeyboardEvent, hotkey: Hotkey) {
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

export function matchState(evt: KeyboardEvent, hotkey: Hotkey, context: VideoContext) {
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

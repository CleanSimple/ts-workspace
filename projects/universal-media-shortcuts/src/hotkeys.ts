import type { Hotkey } from './types';

export const Hotkeys: Hotkey[] = [
    {
        code: 'BracketRight',
        handler: (context) => context.playerWrapper.toggleControlsVisibility(),
        noDefault: true,
        noOtherHandlers: true,
    },
    {
        code: 'BracketLeft',
        handler: (context) => context.playerWrapper.toggleCaptionsVisibility(),
        noDefault: true,
        noOtherHandlers: true,
    },
    {
        code: 'KeyQ',
        handler: (context) => context.playerWrapper.toggleSkipDialog(),
        noDefault: true,
        noOtherHandlers: true,
    },
    {
        code: 'ArrowRight',
        handler: (context) => context.playerWrapper.skipForward(),
        noDefault: true,
        noOtherHandlers: true,
    },
    {
        code: 'ArrowLeft',
        handler: (context) => context.playerWrapper.skipBackward(),
        noDefault: true,
        noOtherHandlers: true,
    },
    {
        code: 'ArrowUp',
        handler: (context) => context.playerWrapper.volUp(),
        noDefault: true,
        noOtherHandlers: true,
    },
    {
        code: 'ArrowDown',
        handler: (context) => context.playerWrapper.volDown(),
        noDefault: true,
        noOtherHandlers: true,
    },
    {
        code: 'Space',
        handler: (context) => context.playerWrapper.togglePause(),
        noDefault: true,
        noOtherHandlers: true,
    },

    // playback speed control
    {
        code: 'ArrowRight',
        altKey: true,
        handler: (context) => context.playerWrapper.speedUp(),
        noDefault: true,
        noOtherHandlers: true,
    },
    {
        code: 'ArrowLeft',
        altKey: true,
        handler: (context) => context.playerWrapper.speedDown(),
        noDefault: true,
        noOtherHandlers: true,
    },
    {
        code: 'Numpad0',
        altKey: true,
        handler: (context) => context.playerWrapper.speedReset(),
        noDefault: true,
        noOtherHandlers: true,
    },

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

    /* Skip Dialog Hotkeys */
    {
        code: 'KeyQ',
        when: 'skipping',
        handler: (context) => context.playerWrapper.toggleSkipDialog(),
        noDefault: true,
        noOtherHandlers: true,
    },
    {
        code: 'Escape',
        when: 'skipping',
        handler: (context) => context.playerWrapper.toggleSkipDialog(),
        noDefault: true,
        noOtherHandlers: true,
    },
    {
        code: 'Enter',
        when: 'skipping',
        handler: (context) => context.playerWrapper.skipDialogAccept(),
        noDefault: true,
        noOtherHandlers: true,
    },
];

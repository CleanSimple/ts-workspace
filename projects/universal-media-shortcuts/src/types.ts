import type { PlayerWrapper } from './player-wrapper';

export interface VideoContext {
    playerWrapper: PlayerWrapper;
}

export type HotkeyHandler = (context: VideoContext) => void;

export interface Hotkey {
    key?: string;
    code?: string;
    shiftKey?: boolean;
    ctrlKey?: boolean;
    altKey?: boolean;
    when?: 'default' | 'playing' | 'paused' | 'skipping';
    handler: HotkeyHandler | null;
    noDefault: boolean;
    noOtherHandlers: boolean;
}

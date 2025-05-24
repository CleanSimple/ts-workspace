export type Handler = () => void;

export interface HotkeyRule {
    key?: string;
    code?: string;
    shiftKey?: boolean;
    ctrlKey?: boolean;
    altKey?: boolean;
    handler: Handler | null;
    noDefault: boolean;
    noOtherHandlers: boolean;
}

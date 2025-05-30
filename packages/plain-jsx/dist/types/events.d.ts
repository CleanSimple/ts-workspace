import type { EventHandler } from './types';
export declare class LifecycleEvents {
    private readonly mountedHandlers;
    private readonly readyHandlers;
    private readonly renderedHandlers;
    private isListening;
    private level;
    listen(node: Node): void;
    private mounted;
    pushLevel(): void;
    popLevel(): void;
    onMounted(handler: EventHandler): void;
    onReady(handler: EventHandler): void;
    onRendered(handler: EventHandler): void;
}

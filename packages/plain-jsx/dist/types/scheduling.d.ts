import type { MaybePromise } from '@cleansimple/utils-js';
type Action = () => MaybePromise<void>;
export declare function nextTick(callback: Action): void;
export interface IHasUpdates {
    flushUpdates: () => void;
}
export declare class DeferredUpdatesScheduler {
    private static _items;
    private static _scheduled;
    static schedule(item: IHasUpdates): void;
    private static flush;
}
export declare function runAsync(action: Action): void;
export {};

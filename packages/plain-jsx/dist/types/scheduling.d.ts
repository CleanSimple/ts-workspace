import type { Action, MaybePromise } from '@cleansimple/utils-js';
type MaybeAsyncAction = () => MaybePromise<void>;
export declare function nextTick(callback: MaybeAsyncAction): void;
export interface IHasUpdates {
    flushUpdates: Action;
}
export declare class DeferredUpdatesScheduler {
    private static _items;
    private static _scheduled;
    static schedule(item: IHasUpdates): void;
    private static flush;
}
export {};

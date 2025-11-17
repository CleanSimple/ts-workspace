import type { IHasUpdates } from './types';
export declare class DeferredUpdatesScheduler {
    private static _items;
    private static _scheduled;
    static schedule(item: IHasUpdates): void;
    private static flush;
}

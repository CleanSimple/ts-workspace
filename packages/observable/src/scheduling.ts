import type { IHasUpdates } from './types';

export class DeferredUpdatesScheduler {
    private static _items: IHasUpdates[] = [];
    private static _scheduled: boolean = false;

    public static schedule(item: IHasUpdates) {
        DeferredUpdatesScheduler._items.push(item);
        if (DeferredUpdatesScheduler._scheduled) return;
        DeferredUpdatesScheduler._scheduled = true;
        queueMicrotask(DeferredUpdatesScheduler.flush);
    }

    private static flush(this: void) {
        const items = DeferredUpdatesScheduler._items;
        DeferredUpdatesScheduler._items = [];
        DeferredUpdatesScheduler._scheduled = false;
        const n = items.length;
        for (let i = 0; i < n; ++i) {
            items[i].flushUpdates();
        }
    }
}

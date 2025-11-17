class DeferredUpdatesScheduler {
    static _items = [];
    static _scheduled = false;
    static schedule(item) {
        DeferredUpdatesScheduler._items.push(item);
        if (DeferredUpdatesScheduler._scheduled)
            return;
        DeferredUpdatesScheduler._scheduled = true;
        queueMicrotask(DeferredUpdatesScheduler.flush);
    }
    static flush() {
        const items = DeferredUpdatesScheduler._items;
        DeferredUpdatesScheduler._items = [];
        DeferredUpdatesScheduler._scheduled = false;
        const n = items.length;
        for (let i = 0; i < n; ++i) {
            items[i].flushUpdates();
        }
    }
}

export { DeferredUpdatesScheduler };

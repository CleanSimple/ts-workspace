let _callbacks = new Array();
let _scheduled = false;
function nextTick(callback) {
    _callbacks.push(callback);
    if (_scheduled)
        return;
    _scheduled = true;
    queueMicrotask(flushNextTickCallbacks);
}
function flushNextTickCallbacks() {
    const callbacks = _callbacks;
    _callbacks = [];
    _scheduled = false;
    const n = callbacks.length;
    for (let i = 0; i < n; ++i) {
        runAsync(callbacks[i]);
    }
}
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
function runAsync(action) {
    try {
        const result = action();
        if (result instanceof Promise) {
            result.catch(err => console.error(err));
        }
    }
    catch (err) {
        console.error(err);
    }
}

export { DeferredUpdatesScheduler, nextTick, runAsync };

import type { Action, MaybePromise } from '@cleansimple/utils-js';

type MaybeAsyncAction = () => MaybePromise<void>;
let _callbacks = new Array<MaybeAsyncAction>();
let _scheduled = false;

export function nextTick(callback: MaybeAsyncAction) {
    _callbacks.push(callback);
    if (_scheduled) return;
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

function runAsync(action: MaybeAsyncAction) {
    try {
        const result = action();
        if (result instanceof Promise) {
            result.catch(err => console.error(err));
        }
    } catch (err) {
        console.error(err);
    }
}

export interface IHasUpdates {
    flushUpdates: Action;
}

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

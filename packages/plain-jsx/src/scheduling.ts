import type { MaybePromise } from '@cleansimple/utils-js';

type Action = () => MaybePromise<void>;
let _callbacks = new Array<Action>();
let _queued = false;

function runNextTickCallbacks() {
    const callbacks = _callbacks;
    _callbacks = [];
    _queued = false;
    const n = callbacks.length;
    for (let i = 0; i < n; i++) {
        runAsync(callbacks[i]);
    }
}

export function nextTick(callback: Action) {
    _callbacks.push(callback);
    if (_queued) {
        return;
    }
    _queued = true;
    queueMicrotask(runNextTickCallbacks);
}

export function runAsync(action: Action) {
    try {
        const result = action();
        if (result instanceof Promise) {
            result.catch(err => console.error(err));
        }
    } catch (err) {
        console.error(err);
    }
}

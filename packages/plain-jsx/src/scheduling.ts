import type { MaybePromise } from '@cleansimple/utils-js';

type Action = () => MaybePromise<void>;
let callbacks = new Array<Action>();
let queued = false;

function runNextTickCallbacks() {
    const n = callbacks.length;
    queued = false;
    for (let i = 0; i < n; i++) {
        runAsync(callbacks[i]);
    }
    callbacks = [];
}

export function nextTick(callback: Action) {
    callbacks.push(callback);
    if (queued) {
        return;
    }
    queued = true;
    queueMicrotask(runNextTickCallbacks);
}

export function runAsync(action: () => MaybePromise<void>) {
    try {
        const result = action();
        if (result instanceof Promise) {
            result.catch(err => console.error(err));
        }
    } catch (err) {
        console.error(err);
    }
}

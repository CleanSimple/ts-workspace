import type { Action } from '@lib/utils';

let callbacks = new Array<Action>();
let queued = false;

function runNextTickCallbacks() {
    queued = false;
    for (const callback of callbacks) {
        callback();
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

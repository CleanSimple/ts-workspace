let callbacks = new Array();
let queued = false;
function runNextTickCallbacks() {
    queued = false;
    for (const callback of callbacks) {
        void callback();
    }
    callbacks = [];
}
function nextTick(callback) {
    callbacks.push(callback);
    if (queued) {
        return;
    }
    queued = true;
    queueMicrotask(runNextTickCallbacks);
}

export { nextTick };

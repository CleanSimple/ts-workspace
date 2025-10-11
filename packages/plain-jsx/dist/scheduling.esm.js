let callbacks = new Array();
let queued = false;
function runNextTickCallbacks() {
    const n = callbacks.length;
    queued = false;
    for (let i = 0; i < n; i++) {
        runAsync(callbacks[i]);
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

export { nextTick, runAsync };

let _callbacks = new Array();
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
function nextTick(callback) {
    _callbacks.push(callback);
    if (_queued) {
        return;
    }
    _queued = true;
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

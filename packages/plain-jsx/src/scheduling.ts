type MaybeAsyncAction = () => void | Promise<void>;

let _callbacks: MaybeAsyncAction[] = [];
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

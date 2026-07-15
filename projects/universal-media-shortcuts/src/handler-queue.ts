const _handlers: (() => Promise<void>)[] = [];
let _flushQueued = false;

async function flushHandlers() {
    while (_handlers.length > 0) {
        const handler = _handlers.shift()!;
        await handler();
    }
    _flushQueued = false;
}

export function queueAsyncHandler(handler: () => Promise<void>) {
    _handlers.push(handler);
    if (!_flushQueued) {
        _flushQueued = true;
        queueMicrotask(() => void flushHandlers());
    }
}

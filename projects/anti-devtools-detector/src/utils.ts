const url = new URL(window.location.href);
const hostname = url.hostname;
const LogTitle = `[Anti-Devtools-Detector: ${hostname}]`;

export const log = console.log.bind(null, LogTitle);
export const info = console.info.bind(null, LogTitle);

export function heh() {
    log('heh ¬‿¬');
}

export function createVerboseProxyForObject(obj: object) {
    return new Proxy(obj, {
        get: function(target: Record<string | symbol, unknown>, name) {
            info('Get:', name);
            const val = target[name];
            if (typeof val === 'function') {
                const func = val.bind(target) as (...args: unknown[]) => unknown;
                return createVerboseProxyForFunction(func);
            }
            return val;
        },
        set: function(target: Record<string | symbol, unknown>, name, value) {
            info('Set:', name, 'Value:', value);
            target[name] = value;
            return true;
        },
    });
}

function createVerboseProxyForFunction(fn: (...args: unknown[]) => unknown) {
    return new Proxy(fn, {
        apply: function(target, thisArg, argumentsList: unknown[]) {
            info('Call:', argumentsList);
            return target(...argumentsList);
        },
    });
}

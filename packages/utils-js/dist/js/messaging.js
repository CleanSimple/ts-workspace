/** @import { MaybePromise } from '@cleansimple/utils-js' */
const isDedicatedWorker = typeof DedicatedWorkerGlobalScope !== 'undefined'
    && globalThis instanceof DedicatedWorkerGlobalScope;
/**
 * @template {keyof Messages} T
 * @param {unknown} data
 * @returns {data is ResponseEnvelope<T> | ErrorResponseEnvelope}
 */
function isResponseEnvelope(data) {
    return typeof data === 'object' && data !== null
        && 'id' in data && typeof data.id === 'number'
        && 'kind' in data && data.kind === 'response'
        && 'type' in data && typeof data.type === 'string';
}
/**
 * @param {unknown} error
 * @returns {SerializedError}
 */
function serializeError(error) {
    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
            stack: error.stack,
            cause: error.cause,
        };
    }
    return {
        name: 'UnknownError',
        message: String(error),
    };
}
/**
 * @param {SerializedError} data
 * @returns {Error}
 */
function deserializeError(data) {
    const error = new Error(data.message);
    error.name = data.name;
    if (data.stack) {
        error.stack = data.stack;
    }
    error.cause = data.cause;
    return error;
}
let lastId = 0;
/**
 * @template {keyof Messages} T
 * @param {MessageTarget} target
 * @param {T} type
 * @param {Messages[T]['payload']} payload
 * @param {MessageOptions} [options={}]
 * @returns {Promise<Messages[T]["response"]>}
 */
export function sendMessage(target, type, payload, options = {}) {
    return new Promise((resolve, reject) => {
        const messageId = ++lastId;
        const handler = (result) => {
            if (!isResponseEnvelope(result.data)) {
                return;
            }
            if (result.data.id !== messageId) {
                return;
            }
            listenerTarget.removeEventListener('message', handler);
            if (result.data.type === 'error') {
                reject(deserializeError(result.data.data));
            }
            else {
                resolve(result.data.data);
            }
        };
        const listenerTarget = (typeof ServiceWorker !== 'undefined' && target instanceof ServiceWorker)
            || (typeof Worker !== 'undefined' && target instanceof Worker)
            ? target
            : globalThis;
        listenerTarget.addEventListener('message', handler);
        target.postMessage({
            id: messageId,
            kind: 'request',
            type: type,
            data: payload,
        }, options);
    });
}
/**
 * @template {keyof Messages} T
 * @param {MessageEvent<RequestEnvelope<T>>} event
 * @param {Messages[T]['response']} payload
 * @param {MessageOptions} [options={}]
 * @returns {void}
 */
function replyToMessage(event, payload, options = {}) {
    const source = event.source ?? (isDedicatedWorker ? self : null);
    if (!source)
        return;
    source.postMessage({
        id: event.data.id,
        kind: 'response',
        type: event.data.type,
        data: payload,
    }, options);
}
/**
 * @template {keyof Messages} T
 * @param {MessageEvent<RequestEnvelope<T>>} event
 * @param {Error} error
 * @param {MessageOptions} [options={}]
 * @returns {void}
 */
function rejectMessage(event, error, options = {}) {
    const source = event.source ?? (isDedicatedWorker ? self : null);
    if (!source)
        return;
    source.postMessage({
        id: event.data.id,
        kind: 'response',
        type: 'error',
        data: serializeError(error),
    }, options);
}
/**
 * @template {keyof Messages} T
 * @param {T} type
 * @param {MessageHandler<T>} handler
 * @returns {() => void}
 */
export function addMessageHandler(type, handler) {
    const onMessage = (event) => {
        if (event.data.kind === 'request' && event.data.type === type) {
            void handler({
                message: event.data,
                event,
                reply: (payload, options) => replyToMessage(event, payload, options),
                reject: (error, options) => rejectMessage(event, error, options),
            });
        }
    };
    globalThis.addEventListener('message', onMessage);
    return () => globalThis.removeEventListener('message', onMessage);
}
/**
 * @typedef {(
 *     event: {
 *         message: RequestEnvelope<T>;
 *         event: MessageEvent;
 *         reply: (payload: Messages[T]['response'], options?: MessageOptions) => void;
 *         reject: (error: Error, options?: MessageOptions) => void;
 *     },
 * ) => MaybePromise<void>} MessageHandler
 * @template {keyof Messages} T
 */
/** @typedef {Window | Worker | ServiceWorker} MessageTarget */
/**
 * @typedef {Object} RequestEnvelope
 * @property {number} id
 * @property {'request'} kind
 * @property {T} type
 * @property {Messages[T]['payload']} data
 */
/**
 * @typedef {Object} ResponseEnvelope
 * @property {number} id
 * @property {'response'} kind
 * @property {T} type
 * @property {Messages[T]['response']} data
 */
/**
 * @typedef {Object} ErrorResponseEnvelope
 * @property {number} id
 * @property {'response'} kind
 * @property {'error'} type
 * @property {SerializedError} data
 */
/**
 * @typedef {Object} Messages
 * @property {Object} 'ping'
 * @property {void} 'ping'.payload
 * @property {'pong'} 'ping'.response
 */
/**
 * @typedef {Object} SerializedError
 * @property {string} name
 * @property {string} message
 * @property {string | undefined} [stack]
 * @property {unknown} [cause]
 */
/**
 * @typedef {Object} MessageOptions
 * @property {Transferable[]} [transfer]
 * @property {string} [targetOrigin]
 */

import type { MaybePromise } from '@cleansimple/utils-js';

export interface RequestEnvelope<T extends keyof Messages> {
    id: number;
    kind: 'request';
    type: T;
    data: Messages[T]['payload'];
}

export interface ResponseEnvelope<T extends keyof Messages> {
    id: number;
    kind: 'response';
    type: T;
    data: Messages[T]['response'];
}

export interface ErrorResponseEnvelope {
    id: number;
    kind: 'response';
    type: 'error';
    data: SerializedError;
}

export interface Messages {
    'ping': {
        payload: void;
        response: 'pong';
    };
}

interface SerializedError {
    name: string;
    message: string;
    stack?: string | undefined;
    cause?: unknown;
}

interface MessageOptions {
    transfer?: Transferable[];
    targetOrigin?: string;
}

type MessageHandler<T extends keyof Messages> = (
    event: {
        message: RequestEnvelope<T>;
        event: MessageEvent;
        reply: (payload: Messages[T]['response'], options?: MessageOptions) => void;
        reject: (error: Error, options?: MessageOptions) => void;
    },
) => MaybePromise<void>;

type MessageTarget = Window | Worker | ServiceWorker;

const isDedicatedWorker = typeof DedicatedWorkerGlobalScope !== 'undefined'
    && globalThis instanceof DedicatedWorkerGlobalScope;

function isResponseEnvelope<T extends keyof Messages>(
    data: unknown,
): data is ResponseEnvelope<T> | ErrorResponseEnvelope {
    return typeof data === 'object' && data !== null
        && 'id' in data && typeof data.id === 'number'
        && 'kind' in data && data.kind === 'response'
        && 'type' in data && typeof data.type === 'string';
}

function serializeError(error: unknown): SerializedError {
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

function deserializeError(data: SerializedError): Error {
    const error = new Error(data.message);
    error.name = data.name;
    if (data.stack) {
        error.stack = data.stack;
    }
    error.cause = data.cause;

    return error;
}

let lastId = 0;
export function sendMessage<T extends keyof Messages>(
    target: MessageTarget,
    type: T,
    payload: Messages[T]['payload'],
    options: MessageOptions = {},
) {
    return new Promise<Messages[T]['response']>((resolve, reject) => {
        const messageId = ++lastId;
        const handler = (result: MessageEvent) => {
            if (!isResponseEnvelope(result.data)) {
                return;
            }
            if (result.data.id !== messageId) {
                return;
            }

            listenerTarget.removeEventListener('message', handler as EventListener);

            if (result.data.type === 'error') {
                reject(deserializeError(result.data.data));
            }
            else {
                resolve(result.data.data);
            }
        };

        const listenerTarget =
            (typeof ServiceWorker !== 'undefined' && target instanceof ServiceWorker)
                || (typeof Worker !== 'undefined' && target instanceof Worker)
                ? target
                : globalThis;
        listenerTarget.addEventListener('message', handler as EventListener);

        target.postMessage(
            {
                id: messageId,
                kind: 'request',
                type: type,
                data: payload,
            } satisfies RequestEnvelope<T>,
            options,
        );
    });
}

function replyToMessage<T extends keyof Messages>(
    event: MessageEvent<RequestEnvelope<T>>,
    payload: Messages[T]['response'],
    options: MessageOptions = {},
) {
    const source = event.source ?? (isDedicatedWorker ? self : null);
    if (!source) return;
    source.postMessage(
        {
            id: event.data.id,
            kind: 'response',
            type: event.data.type,
            data: payload,
        } satisfies ResponseEnvelope<T>,
        options,
    );
}

function rejectMessage<T extends keyof Messages>(
    event: MessageEvent<RequestEnvelope<T>>,
    error: Error,
    options: MessageOptions = {},
) {
    const source = event.source ?? (isDedicatedWorker ? self : null);
    if (!source) return;
    source.postMessage(
        {
            id: event.data.id,
            kind: 'response',
            type: 'error',
            data: serializeError(error),
        } satisfies ErrorResponseEnvelope,
        options,
    );
}

export function addMessageHandler<T extends keyof Messages>(
    type: T,
    handler: MessageHandler<T>,
) {
    const onMessage = (event: MessageEvent<RequestEnvelope<T>>) => {
        if (event.data.kind === 'request' && event.data.type === type) {
            void handler({
                message: event.data,
                event,
                reply: (payload, options) => replyToMessage(event, payload, options),
                reject: (error, options) => rejectMessage(event, error, options),
            });
        }
    };

    globalThis.addEventListener('message', onMessage as EventListener);
    return () => globalThis.removeEventListener('message', onMessage as EventListener);
}

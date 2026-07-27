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
type MessageHandler<T extends keyof Messages> = (event: {
    message: RequestEnvelope<T>;
    event: MessageEvent;
    reply: (payload: Messages[T]['response'], options?: MessageOptions) => void;
    reject: (error: Error, options?: MessageOptions) => void;
}) => MaybePromise<void>;
type MessageTarget = Window | Worker | ServiceWorker;
export declare function sendMessage<T extends keyof Messages>(target: MessageTarget, type: T, payload: Messages[T]['payload'], options?: MessageOptions): Promise<Messages[T]["response"]>;
export declare function addMessageHandler<T extends keyof Messages>(type: T, handler: MessageHandler<T>): () => void;
export {};

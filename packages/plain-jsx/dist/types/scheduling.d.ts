import type { MaybePromise } from '@cleansimple/utils-js';
type Action = () => MaybePromise<void>;
export declare function nextTick(callback: Action): void;
export declare function runAsync(action: Action): void;
export {};

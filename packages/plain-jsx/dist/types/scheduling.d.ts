import type { MaybePromise } from '@lib/utils';
type Action = () => MaybePromise<void>;
export declare function nextTick(callback: Action): void;
export {};

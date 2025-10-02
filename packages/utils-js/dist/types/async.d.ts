import type { ConditionFn, Getter, Predicate } from './types';
export declare function sleep(milliseconds: number): Promise<void>;
interface WaitUntilOptions {
    timeoutMs?: number;
    intervalMs?: number;
}
export declare function waitUntil(condition: ConditionFn, { timeoutMs, intervalMs }?: WaitUntilOptions): Promise<boolean>;
interface PollOptions extends WaitUntilOptions {
    timeoutMs?: number;
    intervalMs?: number;
}
export declare function poll<T>(getter: Getter<T>, predicate: Predicate<T>, { timeoutMs, intervalMs }?: PollOptions): Promise<T | null>;
export {};

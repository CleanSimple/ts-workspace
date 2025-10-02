import type { ConditionFn, Getter, Predicate } from './types';

export async function sleep(milliseconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

interface WaitUntilOptions {
    timeoutMs?: number;
    intervalMs?: number;
}

export async function waitUntil(
    condition: ConditionFn,
    { timeoutMs = 0, intervalMs = 100 }: WaitUntilOptions = {},
): Promise<boolean> {
    const startTime = new Date();
    while (!condition()) {
        if (timeoutMs > 0) {
            const elapsed = Date.now() - startTime.getTime();
            if (elapsed > timeoutMs) return false;
        }
        await sleep(intervalMs);
    }
    return true;
}

interface PollOptions extends WaitUntilOptions {
    timeoutMs?: number;
    intervalMs?: number;
}

export async function poll<T>(
    getter: Getter<T>,
    predicate: Predicate<T>,
    { timeoutMs = 0, intervalMs = 100 }: PollOptions = {},
): Promise<T | null> {
    const startTime = new Date();
    let value;
    while (!predicate(value = getter())) {
        if (timeoutMs > 0) {
            const elapsed = Date.now() - startTime.getTime();
            if (elapsed > timeoutMs) return null;
        }
        await sleep(intervalMs);
    }
    return value;
}

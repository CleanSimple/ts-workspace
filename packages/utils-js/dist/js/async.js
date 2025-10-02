/** @import { ConditionFn, Getter, Predicate } from './types' */
/**
 * @param {number} milliseconds
 * @returns {Promise<void>}
 */
export async function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}
/**
 * @param {ConditionFn} condition
 * @param {WaitUntilOptions}
 * @returns {Promise<boolean>}
 */
export async function waitUntil(condition, { timeoutMs = 0, intervalMs = 100 } = {}) {
    const startTime = new Date();
    while (!condition()) {
        if (timeoutMs > 0) {
            const elapsed = Date.now() - startTime.getTime();
            if (elapsed > timeoutMs)
                return false;
        }
        await sleep(intervalMs);
    }
    return true;
}
/**
 * @template T
 * @param {Getter<T>} getter
 * @param {Predicate<T>} predicate
 * @param {PollOptions}
 * @returns {Promise<T | null>}
 */
export async function poll(getter, predicate, { timeoutMs = 0, intervalMs = 100 } = {}) {
    const startTime = new Date();
    let value;
    while (!predicate(value = getter())) {
        if (timeoutMs > 0) {
            const elapsed = Date.now() - startTime.getTime();
            if (elapsed > timeoutMs)
                return null;
        }
        await sleep(intervalMs);
    }
    return value;
}
/**
 * @typedef {Object} WaitUntilOptions
 * @property {number} [timeoutMs]
 * @property {number} [intervalMs]
 */
/**
 * @typedef {Object} PollOptions
 * @property {number} [timeoutMs]
 * @property {number} [intervalMs]
 */

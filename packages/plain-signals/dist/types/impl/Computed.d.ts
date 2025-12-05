import type { SignalsOf } from '../types';
import { ComputedSignal } from '../abstract/ComputedSignal';
/**
 * Multi source computed signal
 */
export declare class Computed<T extends readonly unknown[], R> extends ComputedSignal<R> {
    private readonly _signals;
    private readonly _compute;
    constructor(signals: SignalsOf<T>, compute: (...values: T) => R);
    compute(): R;
}

import { ComputedSignal } from '../abstract/ComputedSignal';
import { Signal } from '../abstract/Signal';
/**
 * Single source computed signal
 */
export declare class ComputedSingle<T, R> extends ComputedSignal<R> {
    private readonly _signal;
    private readonly _compute;
    constructor(signal: Signal<T>, compute: (value: T) => R);
    protected compute(): R;
}

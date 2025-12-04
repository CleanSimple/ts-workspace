import { Signal } from '../abstract/Signal';
/**
 * Single source computed signal
 */
export declare class ComputedSingle<T, R> extends Signal<R> {
    private readonly _signal;
    private readonly _compute;
    private readonly _dependencyUpdatedCallback;
    private _value;
    private _shouldCompute;
    constructor(signal: Signal<T>, compute: (value: T) => R);
    get value(): R;
}

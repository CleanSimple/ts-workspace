import type { SignalsOf } from '../types';
import { Signal } from '../abstract/Signal';
/**
 * Multi source computed signal
 */
export declare class Computed<T extends readonly unknown[], R> extends Signal<R> {
    private readonly _signals;
    private readonly _compute;
    private readonly _dependencyUpdatedCallback;
    private _value;
    private _shouldCompute;
    constructor(signals: SignalsOf<T>, compute: (...values: T) => R);
    get value(): R;
}

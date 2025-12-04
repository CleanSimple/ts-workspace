import type { ObservablesOf } from '../types';
import { ObservableBase } from './ObservableBase';
/**
 * Multi source computed observable
 */
export declare class Computed<T extends readonly unknown[], R> extends ObservableBase<R> {
    private readonly _observables;
    private readonly _compute;
    private readonly _dependencyUpdatedCallback;
    private _value;
    private _shouldCompute;
    constructor(observables: ObservablesOf<T>, compute: (...values: T) => R);
    get value(): R;
}

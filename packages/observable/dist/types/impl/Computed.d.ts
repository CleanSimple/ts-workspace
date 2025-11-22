import type { IDependent, ObservablesOf } from '../types';
import { ObservableBase } from './ObservableBase';
/**
 * Multi source computed observable
 */
export declare class Computed<T extends readonly unknown[], R> extends ObservableBase<R> implements IDependent {
    private readonly _observables;
    private readonly _compute;
    private _value;
    private _shouldReCompute;
    constructor(observables: ObservablesOf<T>, compute: (...values: T) => R);
    onDependencyUpdated(): void;
    get value(): R;
}

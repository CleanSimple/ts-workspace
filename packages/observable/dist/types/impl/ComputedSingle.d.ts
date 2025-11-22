import type { IDependent, Observable } from '../types';
import { ObservableBase } from './ObservableBase';
/**
 * Single source computed observable
 */
export declare class ComputedSingle<T, R> extends ObservableBase<R> implements IDependent {
    private readonly _observable;
    private readonly _compute;
    private _value;
    private _shouldReCompute;
    constructor(observable: Observable<T>, compute: (value: T) => R);
    onDependencyUpdated(): void;
    get value(): R;
}

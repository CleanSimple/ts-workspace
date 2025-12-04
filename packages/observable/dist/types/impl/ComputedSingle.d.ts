import type { Observable } from '../abstract/Observable';
import { ObservableBase } from './ObservableBase';
/**
 * Single source computed observable
 */
export declare class ComputedSingle<T, R> extends ObservableBase<R> {
    private readonly _observable;
    private readonly _compute;
    private readonly _dependencyUpdatedCallback;
    private _value;
    private _shouldCompute;
    constructor(observable: Observable<T>, compute: (value: T) => R);
    get value(): R;
}

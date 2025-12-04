import type { Observable } from '../abstract/Observable';

import { SENTINEL } from '../sentinel';
import { notifyDependents, registerDependent } from '../tracking';
import { ObservableBase } from './ObservableBase';

/**
 * Single source computed observable
 */
export class ComputedSingle<T, R> extends ObservableBase<R> {
    private readonly _observable: Observable<T>;
    private readonly _compute: (value: T) => R;
    private readonly _dependencyUpdatedCallback: () => void;
    private _value: R;
    private _shouldCompute: boolean;

    public constructor(observable: Observable<T>, compute: (value: T) => R) {
        super();
        this._observable = observable;
        this._compute = compute;
        this._value = SENTINEL as R;
        this._shouldCompute = true;

        this._dependencyUpdatedCallback = () => {
            this.scheduleNotification();
            this._shouldCompute = true;
            notifyDependents(this);
        };

        registerDependent(observable, this._dependencyUpdatedCallback);
    }

    public override get value(): R {
        if (this._shouldCompute) {
            this._shouldCompute = false;
            this._value = this._compute(this._observable.value);
        }
        return this._value;
    }
}

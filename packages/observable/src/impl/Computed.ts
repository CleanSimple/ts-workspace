import type { ObservablesOf } from '../types';

import { SENTINEL } from '../sentinel';
import { notifyDependents, registerDependent } from '../tracking';
import { ObservableBase } from './ObservableBase';

/**
 * Multi source computed observable
 */
export class Computed<T extends readonly unknown[], R> extends ObservableBase<R> {
    private readonly _observables: ObservablesOf<T>;
    private readonly _compute: (...values: T) => R;
    private readonly _dependencyUpdatedCallback: () => void;
    private _value: R;
    private _shouldCompute: boolean;

    public constructor(observables: ObservablesOf<T>, compute: (...values: T) => R) {
        super();
        this._observables = observables;
        this._compute = compute;
        this._value = SENTINEL as R;
        this._shouldCompute = true;

        this._dependencyUpdatedCallback = () => {
            this.scheduleNotification();
            this._shouldCompute = true;
            notifyDependents(this);
        };

        for (let i = 0; i < observables.length; ++i) {
            registerDependent(observables[i], this._dependencyUpdatedCallback);
        }
    }

    public override get value(): R {
        if (this._shouldCompute) {
            this._shouldCompute = false;
            this._value = this._compute(
                ...this._observables.map(observable => observable.value) as unknown as T,
            );
        }
        return this._value;
    }
}

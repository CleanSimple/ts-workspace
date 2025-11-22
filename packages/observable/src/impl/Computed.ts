import type { IDependent, ObservablesOf } from '../types';

import { ObservableBase } from './ObservableBase';

/**
 * Multi source computed observable
 */
export class Computed<T extends readonly unknown[], R> extends ObservableBase<R>
    implements IDependent
{
    private readonly _observables: ObservablesOf<T>;
    private readonly _compute: (...values: T) => R;
    private _value: R;
    private _shouldReCompute: boolean;

    public constructor(observables: ObservablesOf<T>, compute: (...values: T) => R) {
        super();
        this._observables = observables;
        this._compute = compute;
        this._value = this._compute(
            ...observables.map(observable => observable.value) as unknown as T,
        );
        this._shouldReCompute = false;

        for (let i = 0; i < observables.length; ++i) {
            (observables[i] as ObservableBase<T>).registerDependent(this);
        }
    }

    public onDependencyUpdated() {
        this.scheduleUpdate();
        this._shouldReCompute = true;
        this.notifyDependents();
    }

    public override get value(): R {
        if (this._shouldReCompute) {
            this._shouldReCompute = false;
            this._value = this._compute(
                ...this._observables.map(observable => observable.value) as unknown as T,
            );
        }
        return this._value;
    }
}

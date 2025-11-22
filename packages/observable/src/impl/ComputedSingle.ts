import type { IDependent, Observable } from '../types';

import { ObservableBase } from './ObservableBase';

/**
 * Single source computed observable
 */
export class ComputedSingle<T, R> extends ObservableBase<R> implements IDependent {
    private readonly _observable: Observable<T>;
    private readonly _compute: (value: T) => R;
    private _value: R;
    private _shouldReCompute: boolean;

    public constructor(observable: Observable<T>, compute: (value: T) => R) {
        super();
        this._observable = observable;
        this._compute = compute;
        this._value = this._compute(observable.value);
        this._shouldReCompute = false;

        (observable as ObservableBase<T>).registerDependent(this);
    }

    public onDependencyUpdated(): void {
        this.scheduleUpdate();
        this._shouldReCompute = true;
        this.notifyDependents();
    }

    public override get value(): R {
        if (this._shouldReCompute) {
            this._shouldReCompute = false;
            this._value = this._compute(this._observable.value);
        }
        return this._value;
    }
}

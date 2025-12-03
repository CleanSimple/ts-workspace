import type { IDependent, Observable } from '../types';

import { ObservableBase } from './ObservableBase';

/**
 * Single source computed observable
 */
export class ComputedSingle<T, R> extends ObservableBase<R> implements IDependent {
    private readonly _observable: Observable<T>;
    private readonly _compute: (value: T) => R;
    private _value: R;
    private _shouldCompute: boolean;

    public constructor(observable: Observable<T>, compute: (value: T) => R) {
        super();
        this._observable = observable;
        this._compute = compute;
        this._value = null!;
        this._shouldCompute = true;

        (observable as ObservableBase<T>).registerDependent(this);
    }

    public onDependencyUpdated(): void {
        this.scheduleUpdate();
        this._shouldCompute = true;
        this.notifyDependents();
    }

    public override get value(): R {
        if (this._shouldCompute) {
            this._shouldCompute = false;
            this._value = this._compute(this._observable.value);
        }
        return this._value;
    }
}

import { ComputedSignal } from '../abstract/ComputedSignal';
import { Signal } from '../abstract/Signal';
import { IDependency_registerDependent } from '../interfaces/IDependency';

/**
 * Single source computed signal
 */
export class ComputedSingle<T, R> extends ComputedSignal<R> {
    private readonly _signal: Signal<T>;
    private readonly _compute: (value: T) => R;

    public constructor(signal: Signal<T>, compute: (value: T) => R) {
        super();
        this._signal = signal;
        this._compute = compute;

        signal[IDependency_registerDependent](this);
    }

    protected override compute(): R {
        return this._compute(this._signal.value);
    }
}

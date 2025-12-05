import type { SignalsOf } from '../types';

import { ComputedSignal } from '../abstract/ComputedSignal';
import { IDependency_registerDependent } from '../interfaces/IDependency';

/**
 * Multi source computed signal
 */
export class Computed<T extends readonly unknown[], R> extends ComputedSignal<R> {
    private readonly _signals: SignalsOf<T>;
    private readonly _compute: (...values: T) => R;

    public constructor(signals: SignalsOf<T>, compute: (...values: T) => R) {
        super();
        this._signals = signals;
        this._compute = compute;

        for (let i = 0; i < signals.length; ++i) {
            signals[i][IDependency_registerDependent](this);
        }
    }

    public override compute(): R {
        return this._compute(
            ...this._signals.map(signal => signal.value) as unknown as T,
        );
    }
}

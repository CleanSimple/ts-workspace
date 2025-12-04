import type { SignalsOf } from '../types';

import { Signal } from '../abstract/Signal';
import { SENTINEL } from '../sentinel';
import { notifyDependents, registerDependent } from '../tracking';

/**
 * Multi source computed signal
 */
export class Computed<T extends readonly unknown[], R> extends Signal<R> {
    private readonly _signals: SignalsOf<T>;
    private readonly _compute: (...values: T) => R;
    private readonly _dependencyUpdatedCallback: () => void;
    private _value: R;
    private _shouldCompute: boolean;

    public constructor(signals: SignalsOf<T>, compute: (...values: T) => R) {
        super();
        this._signals = signals;
        this._compute = compute;
        this._value = SENTINEL as R;
        this._shouldCompute = true;

        this._dependencyUpdatedCallback = () => {
            this.schedule();
            this._shouldCompute = true;
            notifyDependents(this);
        };

        for (let i = 0; i < signals.length; ++i) {
            registerDependent(signals[i], this._dependencyUpdatedCallback);
        }
    }

    public override get value(): R {
        if (this._shouldCompute) {
            this._shouldCompute = false;
            this._value = this._compute(
                ...this._signals.map(signal => signal.value) as unknown as T,
            );
        }
        return this._value;
    }
}

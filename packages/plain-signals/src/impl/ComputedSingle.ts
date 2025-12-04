import { Signal } from '../abstract/Signal';
import { SENTINEL } from '../sentinel';
import { notifyDependents, registerDependent } from '../tracking';

/**
 * Single source computed signal
 */
export class ComputedSingle<T, R> extends Signal<R> {
    private readonly _signal: Signal<T>;
    private readonly _compute: (value: T) => R;
    private readonly _dependencyUpdatedCallback: () => void;
    private _value: R;
    private _shouldCompute: boolean;

    public constructor(signal: Signal<T>, compute: (value: T) => R) {
        super();
        this._signal = signal;
        this._compute = compute;
        this._value = SENTINEL as R;
        this._shouldCompute = true;

        this._dependencyUpdatedCallback = () => {
            this.schedule();
            this._shouldCompute = true;
            notifyDependents(this);
        };

        registerDependent(signal, this._dependencyUpdatedCallback);
    }

    public override get value(): R {
        if (this._shouldCompute) {
            this._shouldCompute = false;
            this._value = this._compute(this._signal.value);
        }
        return this._value;
    }
}

import { Signal } from '../abstract/Signal.esm.js';
import { SENTINEL } from '../sentinel.esm.js';
import { notifyDependents, registerDependent } from '../tracking.esm.js';

/**
 * Single source computed signal
 */
class ComputedSingle extends Signal {
    _signal;
    _compute;
    _dependencyUpdatedCallback;
    _value;
    _shouldCompute;
    constructor(signal, compute) {
        super();
        this._signal = signal;
        this._compute = compute;
        this._value = SENTINEL;
        this._shouldCompute = true;
        this._dependencyUpdatedCallback = () => {
            this.schedule();
            this._shouldCompute = true;
            notifyDependents(this);
        };
        registerDependent(signal, this._dependencyUpdatedCallback);
    }
    get value() {
        if (this._shouldCompute) {
            this._shouldCompute = false;
            this._value = this._compute(this._signal.value);
        }
        return this._value;
    }
}

export { ComputedSingle };

import { Signal } from '../abstract/Signal.esm.js';
import { SENTINEL } from '../sentinel.esm.js';
import { notifyDependents, registerDependent } from '../tracking.esm.js';

/**
 * Multi source computed signal
 */
class Computed extends Signal {
    _signals;
    _compute;
    _dependencyUpdatedCallback;
    _value;
    _shouldCompute;
    constructor(signals, compute) {
        super();
        this._signals = signals;
        this._compute = compute;
        this._value = SENTINEL;
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
    get value() {
        if (this._shouldCompute) {
            this._shouldCompute = false;
            this._value = this._compute(...this._signals.map(signal => signal.value));
        }
        return this._value;
    }
}

export { Computed };

import { ComputedSignal } from '../abstract/ComputedSignal.esm.js';
import { IDependency_registerDependent } from '../interfaces/IDependency.esm.js';

/**
 * Multi source computed signal
 */
class Computed extends ComputedSignal {
    _signals;
    _compute;
    constructor(signals, compute) {
        super();
        this._signals = signals;
        this._compute = compute;
        for (let i = 0; i < signals.length; ++i) {
            signals[i][IDependency_registerDependent](this);
        }
    }
    compute() {
        return this._compute(...this._signals.map(signal => signal.value));
    }
}

export { Computed };

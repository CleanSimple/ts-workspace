import { ComputedSignal } from '../abstract/ComputedSignal.esm.js';
import { IDependency_registerDependent } from '../interfaces/IDependency.esm.js';

/**
 * Single source computed signal
 */
class ComputedSingle extends ComputedSignal {
    _signal;
    _compute;
    constructor(signal, compute) {
        super();
        this._signal = signal;
        this._compute = compute;
        signal[IDependency_registerDependent](this);
    }
    compute() {
        return this._compute(this._signal.value);
    }
}

export { ComputedSingle };

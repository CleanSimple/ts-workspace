import { Signal } from '../abstract/Signal.esm.js';
import { IDependency_registerDependent } from '../interfaces/IDependency.esm.js';
import { IDependent_onDependencyUpdated } from '../interfaces/IDependent.esm.js';

/**
 * Proxy signal
 */
class ReadOnlyVal extends Signal {
    _signal;
    _value;
    constructor(signal) {
        super();
        this._signal = signal;
        this._value = signal.value;
        signal[IDependency_registerDependent](this);
    }
    get value() {
        return this._value;
    }
    /* IDependent */
    [IDependent_onDependencyUpdated]() {
        this.schedule();
        this._value = this._signal.value;
        this.notifyDependents();
    }
}

export { ReadOnlyVal };

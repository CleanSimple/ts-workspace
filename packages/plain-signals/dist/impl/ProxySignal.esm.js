import { Signal } from '../abstract/Signal.esm.js';
import { notifyDependents, registerDependent } from '../tracking.esm.js';

/**
 * Proxy signal
 */
class ProxySignal extends Signal {
    _dependencyUpdatedCallback;
    _value;
    constructor(signal) {
        super();
        this._value = signal.value;
        this._dependencyUpdatedCallback = () => {
            this.schedule();
            this._value = signal.value;
            notifyDependents(this);
        };
        registerDependent(signal, this._dependencyUpdatedCallback);
    }
    get value() {
        return this._value;
    }
}

export { ProxySignal };

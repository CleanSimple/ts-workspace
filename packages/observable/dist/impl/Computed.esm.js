import { SENTINEL } from '../sentinel.esm.js';
import { notifyDependents, registerDependent } from '../tracking.esm.js';
import { ObservableBase } from './ObservableBase.esm.js';

/**
 * Multi source computed observable
 */
class Computed extends ObservableBase {
    _observables;
    _compute;
    _dependencyUpdatedCallback;
    _value;
    _shouldCompute;
    constructor(observables, compute) {
        super();
        this._observables = observables;
        this._compute = compute;
        this._value = SENTINEL;
        this._shouldCompute = true;
        this._dependencyUpdatedCallback = () => {
            this.scheduleNotification();
            this._shouldCompute = true;
            notifyDependents(this);
        };
        for (let i = 0; i < observables.length; ++i) {
            registerDependent(observables[i], this._dependencyUpdatedCallback);
        }
    }
    get value() {
        if (this._shouldCompute) {
            this._shouldCompute = false;
            this._value = this._compute(...this._observables.map(observable => observable.value));
        }
        return this._value;
    }
}

export { Computed };

import { SENTINEL } from '../sentinel.esm.js';
import { notifyDependents, registerDependent } from '../tracking.esm.js';
import { ObservableBase } from './ObservableBase.esm.js';

/**
 * Single source computed observable
 */
class ComputedSingle extends ObservableBase {
    _observable;
    _compute;
    _dependencyUpdatedCallback;
    _value;
    _shouldCompute;
    constructor(observable, compute) {
        super();
        this._observable = observable;
        this._compute = compute;
        this._value = SENTINEL;
        this._shouldCompute = true;
        this._dependencyUpdatedCallback = () => {
            this.scheduleNotification();
            this._shouldCompute = true;
            notifyDependents(this);
        };
        registerDependent(observable, this._dependencyUpdatedCallback);
    }
    get value() {
        if (this._shouldCompute) {
            this._shouldCompute = false;
            this._value = this._compute(this._observable.value);
        }
        return this._value;
    }
}

export { ComputedSingle };

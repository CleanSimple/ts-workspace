import { ObservableBase } from './ObservableBase.esm.js';

/**
 * Single source computed observable
 */
class ComputedSingle extends ObservableBase {
    _observable;
    _compute;
    _value;
    _shouldReCompute;
    constructor(observable, compute) {
        super();
        this._observable = observable;
        this._compute = compute;
        this._value = this._compute(observable.value);
        this._shouldReCompute = false;
        observable.registerDependent(this);
    }
    onDependencyUpdated() {
        this.scheduleUpdate();
        this._shouldReCompute = true;
        this.notifyDependents();
    }
    get value() {
        if (this._shouldReCompute) {
            this._shouldReCompute = false;
            this._value = this._compute(this._observable.value);
        }
        return this._value;
    }
}

export { ComputedSingle };

import { ObservableBase } from './ObservableBase.esm.js';

/**
 * Multi source computed observable
 */
class Computed extends ObservableBase {
    _observables;
    _compute;
    _value;
    _shouldReCompute;
    constructor(observables, compute) {
        super();
        this._observables = observables;
        this._compute = compute;
        this._value = this._compute(...observables.map(observable => observable.value));
        this._shouldReCompute = false;
        for (let i = 0; i < observables.length; ++i) {
            observables[i].registerDependent(this);
        }
    }
    onDependencyUpdated() {
        this.scheduleUpdate();
        this._shouldReCompute = true;
        this.notifyDependents();
    }
    get value() {
        if (this._shouldReCompute) {
            this._shouldReCompute = false;
            this._value = this._compute(...this._observables.map(observable => observable.value));
        }
        return this._value;
    }
}

export { Computed };

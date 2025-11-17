import { ObservableImpl } from './observable.esm.js';
import { DeferredUpdatesScheduler } from './scheduling.esm.js';

class Computed extends ObservableImpl {
    _compute;
    _observables;
    _value;
    _shouldReCompute;
    constructor(observables, compute) {
        super();
        this._compute = compute;
        this._observables = observables;
        this._value = this._compute(...observables.map(observable => observable.value));
        this._shouldReCompute = false;
        for (let i = 0; i < observables.length; ++i) {
            observables[i].registerDependant(this);
        }
    }
    onDependencyUpdated() {
        this.invalidate();
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
class MultiObservableSubscription {
    _observables;
    _observer;
    _subscriptions;
    _pendingUpdates = false;
    constructor(observables, observer) {
        this._observer = observer;
        this._observables = observables;
        this._subscriptions = [];
        for (let i = 0; i < observables.length; ++i) {
            this._subscriptions.push(observables[i].registerDependant(this));
        }
    }
    onDependencyUpdated() {
        if (this._pendingUpdates)
            return;
        this._pendingUpdates = true;
        DeferredUpdatesScheduler.schedule(this);
    }
    flushUpdates() {
        if (!this._pendingUpdates)
            return;
        this._pendingUpdates = false;
        this._observer(...this._observables.map(observable => observable.value));
    }
    unsubscribe() {
        for (let i = 0; i < this._subscriptions.length; ++i) {
            this._subscriptions[i].unsubscribe();
        }
    }
}

export { Computed, MultiObservableSubscription };

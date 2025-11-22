import { DeferredUpdatesScheduler } from '../scheduling.esm.js';

class MultiObservableSubscription {
    _observables;
    _observer;
    _subscriptions;
    _pendingUpdates = false;
    constructor(observables, observer) {
        this._observables = observables;
        this._observer = observer;
        this._subscriptions = [];
        for (let i = 0; i < observables.length; ++i) {
            this._subscriptions.push(observables[i].registerDependent(this));
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

export { MultiObservableSubscription };

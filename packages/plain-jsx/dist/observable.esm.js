import { DeferredUpdatesScheduler } from './scheduling.esm.js';

/* helpers */
function val(initialValue) {
    return new ValImpl(initialValue);
}
function ref() {
    return new ValImpl(null);
}
function computed(observables, compute) {
    return new Computed(observables, compute);
}
function subscribe(observables, observer) {
    return new MultiObservableSubscription(observables, observer);
}
/**
 * Base class for observables
 */
class ObservableImpl {
    _subscriptions = null;
    _dependents = null;
    _nextDependantId = 0;
    _nextSubscriptionId = 0;
    _prevValue = null;
    _pendingUpdates = false;
    registerDependant(dependant) {
        this._dependents ??= new Map();
        const id = ++this._nextDependantId;
        this._dependents.set(id, new WeakRef(dependant));
        return {
            unsubscribe: () => {
                this._dependents.delete(id);
            },
        };
    }
    notifyDependents() {
        if (!this._dependents)
            return;
        for (const [id, ref] of this._dependents.entries()) {
            const dependant = ref.deref();
            if (dependant) {
                dependant.onDependencyUpdated();
            }
            else {
                this._dependents.delete(id);
            }
        }
    }
    invalidate() {
        if (!this._subscriptions)
            return;
        if (this._pendingUpdates)
            return;
        this._pendingUpdates = true;
        this._prevValue = this.value;
        DeferredUpdatesScheduler.schedule(this);
    }
    flushUpdates() {
        if (!this._pendingUpdates)
            return;
        const prevValue = this._prevValue;
        const value = this.value;
        this._pendingUpdates = false;
        this._prevValue = null;
        if (value === prevValue) {
            return;
        }
        for (const observer of this._subscriptions.values()) {
            observer(value);
        }
    }
    subscribe(observer) {
        this._subscriptions ??= new Map();
        const id = ++this._nextSubscriptionId;
        this._subscriptions.set(id, observer);
        return {
            unsubscribe: () => {
                this._subscriptions.delete(id);
            },
        };
    }
    computed(compute) {
        return new ComputedSingle(compute, this);
    }
}
/**
 * Simple observable value implementation
 */
class ValImpl extends ObservableImpl {
    _value;
    constructor(initialValue) {
        super();
        this._value = initialValue;
    }
    get value() {
        return this._value;
    }
    set value(newValue) {
        if (newValue === this._value)
            return;
        this.invalidate();
        this._value = newValue;
        this.notifyDependents();
    }
}
class ComputedSingle extends ObservableImpl {
    _compute;
    _observable;
    _value;
    _shouldReCompute;
    constructor(compute, observable) {
        super();
        this._compute = compute;
        this._observable = observable;
        this._value = this._compute(observable.value);
        this._shouldReCompute = false;
        observable.registerDependant(this);
    }
    onDependencyUpdated() {
        this.invalidate();
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

export { ObservableImpl, ValImpl, computed, ref, subscribe, val };

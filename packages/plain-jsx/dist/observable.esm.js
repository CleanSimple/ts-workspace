import { DeferredUpdatesScheduler } from './scheduling.esm.js';

/* helpers */
function val(initialValue) {
    return new ValImpl(initialValue);
}
function computed(observables, compute) {
    return new Computed(observables, compute);
}
function ref() {
    return new ValImpl(null);
}
/**
 * Base class for observables
 */
class ObservableImpl {
    subscriptions = new Map();
    dependents = [];
    _nextSubscriptionId = 0;
    _prevValue = null;
    _pendingUpdates = false;
    registerDependant(dependant) {
        this.dependents.push(new WeakRef(dependant));
    }
    notifyDependents() {
        const n = this.dependents.length;
        let write = 0;
        for (let i = 0; i < n; ++i) {
            const dependant = this.dependents[i].deref();
            if (dependant) {
                dependant.onDependencyUpdated();
                this.dependents[write++] = this.dependents[i];
            }
        }
        this.dependents.length = write;
    }
    invalidate() {
        if (this._pendingUpdates) {
            return;
        }
        this._pendingUpdates = true;
        this._prevValue = this.value;
        DeferredUpdatesScheduler.schedule(this);
    }
    flushUpdates() {
        if (!this._pendingUpdates) {
            return;
        }
        const prevValue = this._prevValue;
        const value = this.value;
        this._pendingUpdates = false;
        this._prevValue = null;
        if (value === prevValue) {
            return;
        }
        for (const observer of this.subscriptions.values()) {
            observer(value);
        }
    }
    subscribe(observer) {
        const id = ++this._nextSubscriptionId;
        this.subscriptions.set(id, observer);
        return {
            unsubscribe: () => {
                this.subscriptions.delete(id);
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
        this.invalidate();
        this._value = newValue;
        this.notifyDependents();
    }
}
class ComputedSingle extends ObservableImpl {
    compute;
    observable;
    _value;
    _shouldReCompute;
    constructor(compute, observable) {
        super();
        this.compute = compute;
        this.observable = observable;
        this._value = this.compute(observable.value);
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
            this._value = this.compute(this.observable.value);
        }
        return this._value;
    }
}
class Computed extends ObservableImpl {
    compute;
    observables;
    _value;
    _shouldReCompute;
    constructor(observables, compute) {
        super();
        this.compute = compute;
        this.observables = observables;
        this._value = this.compute(...observables.map(observable => observable.value));
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
            this._value = this.compute(...this.observables.map(observable => observable.value));
        }
        return this._value;
    }
}

export { ObservableImpl, ValImpl, computed, ref, val };

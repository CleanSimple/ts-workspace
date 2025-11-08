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
const TaskAborted = Symbol('TaskAborted');
function task(action) {
    const value = val(undefined);
    const error = val(undefined);
    const status = val('Running');
    const isRunning = status.computed(status => status === 'Running');
    const isCompleted = status.computed(status => status !== 'Running');
    const isSuccess = status.computed(status => status === 'Success');
    const isError = status.computed(status => status === 'Error');
    let abortController = null;
    const run = () => {
        if (abortController) {
            abortController.abort(TaskAborted);
        }
        abortController = new AbortController();
        status.value = 'Running';
        error.value = undefined;
        action({ signal: abortController.signal }).then((result) => {
            value.value = result;
            status.value = 'Success';
        }).catch(err => {
            if (err === TaskAborted)
                return;
            error.value = err;
            status.value = 'Error';
        });
    };
    run();
    return { value, status, isRunning, isCompleted, isSuccess, isError, error, rerun: run };
}
/**
 * Base class for observables
 */
class ObservableImpl {
    _observers = null;
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
        if (!this._observers)
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
        for (const observer of this._observers.values()) {
            observer(value);
        }
    }
    subscribe(observer) {
        this._observers ??= new Map();
        const id = ++this._nextSubscriptionId;
        this._observers.set(id, observer);
        return {
            unsubscribe: () => {
                this._observers.delete(id);
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

export { ObservableImpl, ValImpl, computed, ref, subscribe, task, val };

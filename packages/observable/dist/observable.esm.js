import { DeferredUpdatesScheduler } from './scheduling.esm.js';

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
            try {
                const result = observer(value);
                if (result instanceof Promise) {
                    result.catch(err => console.error(err));
                }
            }
            catch (err) {
                console.error(err);
            }
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

export { ObservableImpl };

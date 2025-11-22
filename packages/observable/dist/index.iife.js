var Observable = (function (exports) {
    'use strict';

    class DeferredUpdatesScheduler {
        static _items = [];
        static _scheduled = false;
        static schedule(item) {
            DeferredUpdatesScheduler._items.push(item);
            if (DeferredUpdatesScheduler._scheduled)
                return;
            DeferredUpdatesScheduler._scheduled = true;
            queueMicrotask(DeferredUpdatesScheduler.flush);
        }
        static flush() {
            const items = DeferredUpdatesScheduler._items;
            DeferredUpdatesScheduler._items = [];
            DeferredUpdatesScheduler._scheduled = false;
            const n = items.length;
            for (let i = 0; i < n; ++i) {
                items[i].flushUpdates();
            }
        }
    }

    /**
     * Base class for observables
     * Handles subscriptions and dispatching updates
     */
    class ObservableBase {
        _observers = null;
        _dependents = null;
        _nextDependantId = 0;
        _nextSubscriptionId = 0;
        _prevValue = null;
        _pendingUpdates = false;
        registerDependent(dependant) {
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
        scheduleUpdate() {
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
    }

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

    /**
     * Simple observable value implementation
     */
    class ValImpl extends ObservableBase {
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
            this.scheduleUpdate();
            this._value = newValue;
            this.notifyDependents();
        }
    }

    function val(initialValue) {
        return new ValImpl(initialValue);
    }
    function computed(source, compute) {
        return Array.isArray(source)
            ? source.length === 1
                ? new ComputedSingle(source[0], compute)
                : new Computed(source, compute)
            : new ComputedSingle(source, compute);
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
    function isObservable(value) {
        return value instanceof ObservableBase;
    }
    function isVal(value) {
        return value instanceof ValImpl;
    }

    exports.computed = computed;
    exports.isObservable = isObservable;
    exports.isVal = isVal;
    exports.subscribe = subscribe;
    exports.task = task;
    exports.val = val;

    return exports;

})({});

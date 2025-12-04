var Observable = (function (exports) {
    'use strict';

    class DeferredNotifier {
        _isScheduled = false;
        scheduleNotification() {
            if (this._isScheduled)
                return;
            this._isScheduled = true;
            this.onScheduleNotification();
            DeferredNotifier._scheduledNotifiers.push(this);
            if (DeferredNotifier._scheduledNotifiers.length === 1) {
                queueMicrotask(DeferredNotifier.dispatchNotifications);
            }
        }
        /* static members */
        static _scheduledNotifiers = [];
        static dispatchNotifications() {
            const notifiers = DeferredNotifier._scheduledNotifiers;
            DeferredNotifier._scheduledNotifiers = [];
            const n = notifiers.length;
            for (let i = 0; i < n; ++i) {
                const notifier = notifiers[i];
                notifier._isScheduled = false;
                notifier.onDispatchNotification();
            }
        }
    }

    const ObservableSymbol = Symbol('Observable');
    class Observable extends DeferredNotifier {
        [ObservableSymbol] = true;
    }

    const SENTINEL = Symbol('SENTINEL');

    class TrackingInfo {
        lastDependentId = 0;
        dependents = new Map();
    }
    const _TrackingMap = new WeakMap();
    function registerDependent(observable, dependent) {
        let trackingInfo = _TrackingMap.get(observable);
        if (!trackingInfo) {
            trackingInfo = new TrackingInfo();
            _TrackingMap.set(observable, trackingInfo);
        }
        const id = ++trackingInfo.lastDependentId;
        trackingInfo.dependents.set(id, new WeakRef(dependent));
        return {
            unregister: () => {
                trackingInfo.dependents.delete(id);
            },
        };
    }
    function notifyDependents(observable) {
        const trackingInfo = _TrackingMap.get(observable);
        if (!trackingInfo)
            return;
        if (!trackingInfo.dependents.size)
            return;
        for (const [id, ref] of trackingInfo.dependents.entries()) {
            const dependent = ref.deref();
            if (dependent) {
                dependent();
            }
            else {
                trackingInfo.dependents.delete(id);
            }
        }
    }

    /**
     * Base class for observables
     * Handles subscriptions and dispatching updates
     */
    class ObservableBase extends Observable {
        _lastObserverId = 0;
        _observers = null;
        _prevValue = null;
        onScheduleNotification() {
            this._prevValue = this.value;
        }
        onDispatchNotification() {
            const prevValue = this._prevValue;
            this._prevValue = null;
            if (!this._observers?.size)
                return;
            const value = this.value;
            if (value === prevValue)
                return;
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
            const id = ++this._lastObserverId;
            this._observers ??= new Map();
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
        _dependencyUpdatedCallback;
        _value;
        _shouldCompute;
        constructor(observables, compute) {
            super();
            this._observables = observables;
            this._compute = compute;
            this._value = SENTINEL;
            this._shouldCompute = true;
            this._dependencyUpdatedCallback = () => {
                this.scheduleNotification();
                this._shouldCompute = true;
                notifyDependents(this);
            };
            for (let i = 0; i < observables.length; ++i) {
                registerDependent(observables[i], this._dependencyUpdatedCallback);
            }
        }
        get value() {
            if (this._shouldCompute) {
                this._shouldCompute = false;
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

    class MultiObservableSubscription extends DeferredNotifier {
        _observables;
        _observer;
        _dependencyUpdatedCallback;
        _registrations;
        constructor(observables, observer) {
            super();
            this._observables = observables;
            this._observer = observer;
            this._registrations = [];
            this._dependencyUpdatedCallback = () => this.scheduleNotification();
            for (let i = 0; i < observables.length; ++i) {
                this._registrations.push(registerDependent(observables[i], this._dependencyUpdatedCallback));
            }
        }
        onScheduleNotification() { }
        onDispatchNotification() {
            this._observer(...this._observables.map(observable => observable.value));
        }
        unsubscribe() {
            for (let i = 0; i < this._registrations.length; ++i) {
                this._registrations[i].unregister();
            }
        }
    }

    /**
     * Simple observable value implementation
     */
    class Val extends ObservableBase {
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
            this.scheduleNotification();
            this._value = newValue;
            notifyDependents(this);
        }
    }

    Observable.prototype.computed = function (compute) {
        return new ComputedSingle(this, compute);
    };

    function val(initialValue) {
        return new Val(initialValue);
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
        return value instanceof Observable;
    }
    function isVal(value) {
        return value instanceof Val;
    }

    exports.computed = computed;
    exports.isObservable = isObservable;
    exports.isVal = isVal;
    exports.subscribe = subscribe;
    exports.task = task;
    exports.val = val;

    return exports;

})({});

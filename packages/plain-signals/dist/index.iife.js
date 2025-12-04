var PlainSignals = (function (exports) {
    'use strict';

    class Schedulable {
        _isScheduled = false;
        schedule() {
            if (this._isScheduled)
                return;
            this._isScheduled = true;
            this.onSchedule();
            Schedulable._pendingItems.push(this);
            if (Schedulable._pendingItems.length === 1) {
                queueMicrotask(Schedulable.flush);
            }
        }
        /* static members */
        static _pendingItems = [];
        static _cyclicScheduleCount = 0;
        static flush() {
            const items = Schedulable._pendingItems;
            Schedulable._pendingItems = [];
            const n = items.length;
            for (let i = 0; i < n; ++i) {
                const item = items[i];
                item._isScheduled = false;
                item.onDispatch();
            }
            // detect cyclic scheduling
            if (Schedulable._pendingItems.length > 0) {
                Schedulable._cyclicScheduleCount++;
                if (Schedulable._cyclicScheduleCount >= 100) {
                    // break the cycle to avoid starving the event loop
                    Schedulable._pendingItems = [];
                    throw new Error('Too many nested updates');
                }
            }
            else {
                Schedulable._cyclicScheduleCount = 0;
            }
        }
    }

    const SignalSymbol = Symbol('Signal');
    class Signal extends Schedulable {
        [SignalSymbol] = true;
        _lastObserverId = 0;
        _observers = null;
        _prevValue = null;
        onSchedule() {
            this._prevValue = this.value;
        }
        onDispatch() {
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

    const SENTINEL = Symbol('SENTINEL');

    class TrackingInfo {
        lastDependentId = 0;
        dependents = new Map();
    }
    const _TrackingMap = new WeakMap();
    function registerDependent(dependency, dependent) {
        let trackingInfo = _TrackingMap.get(dependency);
        if (!trackingInfo) {
            trackingInfo = new TrackingInfo();
            _TrackingMap.set(dependency, trackingInfo);
        }
        const id = ++trackingInfo.lastDependentId;
        trackingInfo.dependents.set(id, new WeakRef(dependent));
        return {
            unregister: () => {
                trackingInfo.dependents.delete(id);
            },
        };
    }
    function notifyDependents(dependency) {
        const trackingInfo = _TrackingMap.get(dependency);
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
     * Multi source computed signal
     */
    class Computed extends Signal {
        _signals;
        _compute;
        _dependencyUpdatedCallback;
        _value;
        _shouldCompute;
        constructor(signals, compute) {
            super();
            this._signals = signals;
            this._compute = compute;
            this._value = SENTINEL;
            this._shouldCompute = true;
            this._dependencyUpdatedCallback = () => {
                this.schedule();
                this._shouldCompute = true;
                notifyDependents(this);
            };
            for (let i = 0; i < signals.length; ++i) {
                registerDependent(signals[i], this._dependencyUpdatedCallback);
            }
        }
        get value() {
            if (this._shouldCompute) {
                this._shouldCompute = false;
                this._value = this._compute(...this._signals.map(signal => signal.value));
            }
            return this._value;
        }
    }

    /**
     * Single source computed signal
     */
    class ComputedSingle extends Signal {
        _signal;
        _compute;
        _dependencyUpdatedCallback;
        _value;
        _shouldCompute;
        constructor(signal, compute) {
            super();
            this._signal = signal;
            this._compute = compute;
            this._value = SENTINEL;
            this._shouldCompute = true;
            this._dependencyUpdatedCallback = () => {
                this.schedule();
                this._shouldCompute = true;
                notifyDependents(this);
            };
            registerDependent(signal, this._dependencyUpdatedCallback);
        }
        get value() {
            if (this._shouldCompute) {
                this._shouldCompute = false;
                this._value = this._compute(this._signal.value);
            }
            return this._value;
        }
    }

    class MultiSourceSubscription extends Schedulable {
        _signals;
        _observer;
        _dependencyUpdatedCallback;
        _registrations;
        constructor(signals, observer) {
            super();
            this._signals = signals;
            this._observer = observer;
            this._registrations = [];
            this._dependencyUpdatedCallback = () => this.schedule();
            for (let i = 0; i < signals.length; ++i) {
                this._registrations.push(registerDependent(signals[i], this._dependencyUpdatedCallback));
            }
        }
        onSchedule() { }
        onDispatch() {
            this._observer(...this._signals.map(signal => signal.value));
        }
        unsubscribe() {
            for (let i = 0; i < this._registrations.length; ++i) {
                this._registrations[i].unregister();
            }
        }
    }

    /**
     * Simple value signal implementation
     */
    class Val extends Signal {
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
            this.schedule();
            this._value = newValue;
            notifyDependents(this);
        }
    }

    Signal.prototype.computed = function (compute) {
        return new ComputedSingle(this, compute);
    };

    /**
     * Proxy signal
     */
    class ProxySignal extends Signal {
        _dependencyUpdatedCallback;
        _value;
        constructor(signal) {
            super();
            this._value = signal.value;
            this._dependencyUpdatedCallback = () => {
                this.schedule();
                this._value = signal.value;
                notifyDependents(this);
            };
            registerDependent(signal, this._dependencyUpdatedCallback);
        }
        get value() {
            return this._value;
        }
    }

    Val.prototype.asReadOnly = function () {
        return new ProxySignal(this);
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
    function subscribe(signal, observer) {
        return new MultiSourceSubscription(signal, observer);
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
        return {
            value: value.asReadOnly(),
            status: status.asReadOnly(),
            isRunning,
            isCompleted,
            isSuccess,
            isError,
            error: error.asReadOnly(),
            rerun: run,
        };
    }
    function isSignal(value) {
        return value instanceof Signal;
    }
    function isVal(value) {
        return value instanceof Val;
    }

    exports.computed = computed;
    exports.isSignal = isSignal;
    exports.isVal = isVal;
    exports.subscribe = subscribe;
    exports.task = task;
    exports.val = val;

    return exports;

})({});

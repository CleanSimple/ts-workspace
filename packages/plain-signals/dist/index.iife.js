var PlainSignals = (function (exports) {
    'use strict';

    const IDependency_registerDependent = Symbol('IDependency_registerDependent');

    const IDependent_onDependencyUpdated = Symbol('IDependent_onDependencyUpdated');

    class Schedulable {
        _isScheduled = false;
        schedule() {
            if (Schedulable._cyclicScheduleCount >= 100) {
                // break the cycle to avoid starving the event loop
                throw new Error('Too many nested updates');
            }
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
        static version = 0;
        static flush() {
            const items = Schedulable._pendingItems;
            Schedulable._pendingItems = [];
            Schedulable.version++;
            for (let i = 0; i < items.length; ++i) {
                const item = items[i];
                item._isScheduled = false;
                try {
                    item.onDispatch();
                }
                catch (e) {
                    console.error(e);
                }
            }
            // track cyclic scheduling
            if (Schedulable._pendingItems.length > 0) {
                Schedulable._cyclicScheduleCount++;
            }
            else {
                Schedulable._cyclicScheduleCount = 0;
            }
        }
    }

    const SignalSymbol = Symbol('Signal');
    class Signal extends Schedulable {
        [SignalSymbol] = true;
        _lastDependentId = 0;
        _lastObserverId = 0;
        _dependents = null;
        _observers = null;
        _prevValue = null;
        notifyDependents() {
            if (!this._dependents?.size)
                return;
            for (const [id, ref] of this._dependents.entries()) {
                const dependent = ref.deref();
                if (dependent) {
                    dependent[IDependent_onDependencyUpdated]();
                }
                else {
                    this._dependents.delete(id);
                }
            }
        }
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
        /* IDependency */
        [IDependency_registerDependent](dependent) {
            const id = ++this._lastDependentId;
            this._dependents ??= new Map();
            this._dependents.set(id, new WeakRef(dependent));
            return {
                unregister: () => {
                    this._dependents.delete(id);
                },
            };
        }
    }

    const SENTINEL = Symbol('SENTINEL');

    class ComputedSignal extends Signal {
        _value = SENTINEL;
        _version = -1;
        _isScheduling = false;
        get value() {
            if (this._isScheduling) {
                return this._value;
            }
            if (this._version < Schedulable.version) {
                this._version = Schedulable.version;
                this._value = this.compute();
            }
            return this._value;
        }
        /* IDependent */
        [IDependent_onDependencyUpdated]() {
            this._isScheduling = true;
            this.schedule();
            this._isScheduling = false;
            this.notifyDependents();
        }
    }

    /**
     * Multi source computed signal
     */
    class Computed extends ComputedSignal {
        _signals;
        _compute;
        constructor(signals, compute) {
            super();
            this._signals = signals;
            this._compute = compute;
            for (let i = 0; i < signals.length; ++i) {
                signals[i][IDependency_registerDependent](this);
            }
        }
        compute() {
            return this._compute(...this._signals.map(signal => signal.value));
        }
    }

    /**
     * Single source computed signal
     */
    class ComputedSingle extends ComputedSignal {
        _signal;
        _compute;
        constructor(signal, compute) {
            super();
            this._signal = signal;
            this._compute = compute;
            signal[IDependency_registerDependent](this);
        }
        compute() {
            return this._compute(this._signal.value);
        }
    }

    class MultiSourceSubscription extends Schedulable {
        _signals;
        _observer;
        _registrations;
        constructor(signals, observer) {
            super();
            this._signals = signals;
            this._observer = observer;
            this._registrations = [];
            for (let i = 0; i < signals.length; ++i) {
                this._registrations.push(signals[i][IDependency_registerDependent](this));
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
        /* IDependent */
        [IDependent_onDependencyUpdated]() {
            this.schedule();
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
            this.notifyDependents();
        }
    }

    Signal.prototype.computed = function (compute) {
        return new ComputedSingle(this, compute);
    };

    /**
     * Proxy signal
     */
    class ReadOnlyVal extends Signal {
        _signal;
        _value;
        constructor(signal) {
            super();
            this._signal = signal;
            this._value = signal.value;
            signal[IDependency_registerDependent](this);
        }
        get value() {
            return this._value;
        }
        /* IDependent */
        [IDependent_onDependencyUpdated]() {
            this.schedule();
            this._value = this._signal.value;
            this.notifyDependents();
        }
    }

    Val.prototype.asReadOnly = function () {
        return new ReadOnlyVal(this);
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

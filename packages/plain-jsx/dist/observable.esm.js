import { nextTick } from './scheduling.esm.js';
import { _Sentinel, Sentinel } from './sentinel.esm.js';

class Observable {
    computed(compute) {
        return new ComputedSingle(compute, this);
    }
}
/** internal use */
class ObservableImpl extends Observable {
    observers = [];
    immediateObservers = [];
    hasDeferredNotifications = false;
    notifyObserversCallback;
    constructor() {
        super();
        this.notifyObserversCallback = this.notifyObservers.bind(this);
    }
    onUpdated() {
        if (this.immediateObservers.length) {
            const value = this.value;
            for (const observer of this.immediateObservers) {
                observer(value);
            }
        }
        if (this.observers.length) {
            if (this.hasDeferredNotifications) {
                return;
            }
            this.hasDeferredNotifications = true;
            nextTick(this.notifyObserversCallback);
        }
    }
    notifyObservers() {
        this.hasDeferredNotifications = false;
        const value = this.value;
        for (const observer of this.observers) {
            observer(value);
        }
    }
    subscribe(observer, immediate = true) {
        const observers = immediate ? this.immediateObservers : this.observers;
        if (!observers.includes(observer)) {
            observers.push(observer);
        }
        return {
            unsubscribe: this.unsubscribe.bind(this, observer, immediate),
        };
    }
    unsubscribe(observer, immediate) {
        const observers = immediate ? this.immediateObservers : this.observers;
        const index = observers.indexOf(observer);
        if (index > -1) {
            observers.splice(index, 1);
        }
    }
}
/**
 * Simple observable value implementation
 */
class Val extends ObservableImpl {
    _value;
    constructor(initialValue) {
        super();
        this._value = initialValue;
    }
    get value() {
        return this._value;
    }
    set value(newValue) {
        if (this._value === newValue) {
            return;
        }
        this._value = newValue;
        this.onUpdated();
    }
}
/** internal use */
class ComputedSingle extends Observable {
    observable;
    compute;
    _value;
    constructor(compute, observable) {
        super();
        this.compute = compute;
        this.observable = observable;
        this._value = compute(observable.value);
    }
    get value() {
        return this._value;
    }
    subscribe(observer, immediate) {
        return this.observable.subscribe((value) => {
            this._value = this.compute(value);
            observer(this._value);
        }, immediate);
    }
}
/** internal use */
class Computed extends ObservableImpl {
    observables;
    compute;
    _value;
    constructor(observables, compute) {
        super();
        this.compute = compute;
        this.observables = observables;
        this._value = _Sentinel;
        for (const observable of observables) {
            observable.subscribe(() => {
                this._value = _Sentinel;
                this.onUpdated();
            }, true);
        }
    }
    get value() {
        if (this._value instanceof Sentinel) {
            this._value = this.compute(...this.observables.map(observable => observable.value));
        }
        return this._value;
    }
}
function val(initialValue) {
    return new Val(initialValue);
}
function computed(observables, compute) {
    return new Computed(observables, compute);
}
function ref() {
    return new Val(null);
}

export { Observable, Val, computed, ref, val };

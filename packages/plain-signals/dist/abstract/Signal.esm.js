import { IDependency_registerDependent } from '../interfaces/IDependency.esm.js';
import { IDependent_onDependencyUpdated } from '../interfaces/IDependent.esm.js';
import { Schedulable } from './Schedulable.esm.js';

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

export { Signal };

import { Schedulable } from './Schedulable.esm.js';

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

export { Signal };

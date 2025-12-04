import { Schedulable } from '../abstract/Schedulable.esm.js';
import { registerDependent } from '../tracking.esm.js';

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

export { MultiSourceSubscription };

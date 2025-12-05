import { Schedulable } from '../abstract/Schedulable.esm.js';
import { IDependency_registerDependent } from '../interfaces/IDependency.esm.js';
import { IDependent_onDependencyUpdated } from '../interfaces/IDependent.esm.js';

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

export { MultiSourceSubscription };

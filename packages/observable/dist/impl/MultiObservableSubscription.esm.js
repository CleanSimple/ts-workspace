import { DeferredNotifier } from '../abstract/DeferredNotifier.esm.js';
import { registerDependent } from '../tracking.esm.js';

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

export { MultiObservableSubscription };

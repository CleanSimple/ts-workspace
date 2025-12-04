import type { ObservablesOf, Registration, Subscription } from '../types';

import { DeferredNotifier } from '../abstract/DeferredNotifier';
import { registerDependent } from '../tracking';

export class MultiObservableSubscription<T extends readonly unknown[]> extends DeferredNotifier
    implements Subscription
{
    private readonly _observables: ObservablesOf<T>;
    private readonly _observer: (...values: T) => void;
    private readonly _dependencyUpdatedCallback: () => void;
    private readonly _registrations: Registration[];

    public constructor(observables: ObservablesOf<T>, observer: (...values: T) => void) {
        super();
        this._observables = observables;
        this._observer = observer;
        this._registrations = [];

        this._dependencyUpdatedCallback = () => this.scheduleNotification();

        for (let i = 0; i < observables.length; ++i) {
            this._registrations.push(
                registerDependent(observables[i], this._dependencyUpdatedCallback),
            );
        }
    }

    protected override onScheduleNotification(): void {/* empty */}

    protected override onDispatchNotification(): void {
        this._observer(...this._observables.map(observable => observable.value) as unknown as T);
    }

    public unsubscribe() {
        for (let i = 0; i < this._registrations.length; ++i) {
            this._registrations[i].unregister();
        }
    }
}

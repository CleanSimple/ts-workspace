import type { IDependent, IHasUpdates, ObservablesOf, Subscription } from '../types';
import type { ObservableBase } from './ObservableBase';

import { DeferredUpdatesScheduler } from '../scheduling';

export class MultiObservableSubscription<T extends readonly unknown[]>
    implements Subscription, IDependent, IHasUpdates
{
    private readonly _observables: ObservablesOf<T>;
    private readonly _observer: (...values: T) => void;
    private readonly _subscriptions: Subscription[];
    private _pendingUpdates: boolean = false;

    public constructor(observables: ObservablesOf<T>, observer: (...values: T) => void) {
        this._observables = observables;
        this._observer = observer;
        this._subscriptions = [];
        for (let i = 0; i < observables.length; ++i) {
            this._subscriptions.push(
                (observables[i] as ObservableBase<T>).registerDependent(this),
            );
        }
    }

    public onDependencyUpdated() {
        if (this._pendingUpdates) return;
        this._pendingUpdates = true;
        DeferredUpdatesScheduler.schedule(this);
    }

    public flushUpdates() {
        if (!this._pendingUpdates) return;
        this._pendingUpdates = false;
        this._observer(...this._observables.map(observable => observable.value) as unknown as T);
    }

    public unsubscribe() {
        for (let i = 0; i < this._subscriptions.length; ++i) {
            this._subscriptions[i].unsubscribe();
        }
    }
}

import type { IDependant, IHasUpdates, ObservablesOf, Subscription } from './types';

import { ObservableImpl } from './observable';
import { DeferredUpdatesScheduler } from './scheduling';

export class Computed<T extends readonly unknown[], R> extends ObservableImpl<R>
    implements IDependant
{
    private readonly _compute: (...values: T) => R;
    private readonly _observables: ObservablesOf<T>;
    private _value: R;
    private _shouldReCompute: boolean;

    public constructor(observables: ObservablesOf<T>, compute: (...values: T) => R) {
        super();
        this._compute = compute;
        this._observables = observables;
        this._value = this._compute(
            ...observables.map(observable => observable.value) as unknown as T,
        );
        this._shouldReCompute = false;

        for (let i = 0; i < observables.length; ++i) {
            (observables[i] as ObservableImpl<T>).registerDependant(this);
        }
    }

    public onDependencyUpdated() {
        this.invalidate();
        this._shouldReCompute = true;
        this.notifyDependents();
    }

    public override get value(): R {
        if (this._shouldReCompute) {
            this._shouldReCompute = false;
            this._value = this._compute(
                ...this._observables.map(observable => observable.value) as unknown as T,
            );
        }
        return this._value;
    }
}

export class MultiObservableSubscription<T extends readonly unknown[]>
    implements Subscription, IDependant, IHasUpdates
{
    private readonly _observables: ObservablesOf<T>;
    private readonly _observer: (...values: T) => void;
    private readonly _subscriptions: Subscription[];
    private _pendingUpdates: boolean = false;

    public constructor(observables: ObservablesOf<T>, observer: (...values: T) => void) {
        this._observer = observer;
        this._observables = observables;
        this._subscriptions = [];
        for (let i = 0; i < observables.length; ++i) {
            this._subscriptions.push(
                (observables[i] as ObservableImpl<T>).registerDependant(this),
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

import type { IDependant, IHasUpdates, ObservablesOf, Subscription } from './types';
import { ObservableImpl } from './observable';
export declare class Computed<T extends readonly unknown[], R> extends ObservableImpl<R> implements IDependant {
    private readonly _compute;
    private readonly _observables;
    private _value;
    private _shouldReCompute;
    constructor(observables: ObservablesOf<T>, compute: (...values: T) => R);
    onDependencyUpdated(): void;
    get value(): R;
}
export declare class MultiObservableSubscription<T extends readonly unknown[]> implements Subscription, IDependant, IHasUpdates {
    private readonly _observables;
    private readonly _observer;
    private readonly _subscriptions;
    private _pendingUpdates;
    constructor(observables: ObservablesOf<T>, observer: (...values: T) => void);
    onDependencyUpdated(): void;
    flushUpdates(): void;
    unsubscribe(): void;
}

import type { IDependent, IHasUpdates, ObservablesOf, Subscription } from '../types';
export declare class MultiObservableSubscription<T extends readonly unknown[]> implements Subscription, IDependent, IHasUpdates {
    private readonly _observables;
    private readonly _observer;
    private readonly _subscriptions;
    private _pendingUpdates;
    constructor(observables: ObservablesOf<T>, observer: (...values: T) => void);
    onDependencyUpdated(): void;
    flushUpdates(): void;
    unsubscribe(): void;
}

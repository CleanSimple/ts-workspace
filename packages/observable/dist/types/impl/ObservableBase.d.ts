import type { IDependent, IHasUpdates, Observable, Observer, Subscription } from '../types';
/**
 * Base class for observables
 * Handles subscriptions and dispatching updates
 */
export declare abstract class ObservableBase<T> implements Observable<T>, IHasUpdates {
    private _observers;
    private _dependents;
    private _nextDependantId;
    private _nextSubscriptionId;
    private _prevValue;
    private _pendingUpdates;
    registerDependent(dependant: IDependent): {
        unsubscribe: () => void;
    };
    protected notifyDependents(): void;
    protected scheduleUpdate(): void;
    flushUpdates(): void;
    abstract get value(): T;
    subscribe(observer: Observer<T>): Subscription;
}

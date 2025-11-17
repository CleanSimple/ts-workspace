import type { IDependant, IHasUpdates, Observable, Observer, Subscription } from './types';
/**
 * Base class for observables
 */
export declare abstract class ObservableImpl<T> implements Observable<T>, IHasUpdates {
    private _observers;
    private _dependents;
    private _nextDependantId;
    private _nextSubscriptionId;
    private _prevValue;
    private _pendingUpdates;
    registerDependant(dependant: IDependant): {
        unsubscribe: () => void;
    };
    protected notifyDependents(): void;
    protected invalidate(): void;
    flushUpdates(): void;
    abstract get value(): T;
    subscribe(observer: Observer<T>): Subscription;
    computed<TComputed>(compute: (value: T) => TComputed): Observable<TComputed>;
}

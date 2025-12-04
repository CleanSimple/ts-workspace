import type { Observer, Subscription } from '../types';
import { Observable } from '../abstract/Observable';
/**
 * Base class for observables
 * Handles subscriptions and dispatching updates
 */
export declare abstract class ObservableBase<T> extends Observable<T> {
    private _lastObserverId;
    private _observers;
    private _prevValue;
    protected onScheduleNotification(): void;
    protected onDispatchNotification(): void;
    subscribe(observer: Observer<T>): Subscription;
}

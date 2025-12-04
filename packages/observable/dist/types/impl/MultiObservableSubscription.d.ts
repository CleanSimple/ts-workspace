import type { ObservablesOf, Subscription } from '../types';
import { DeferredNotifier } from '../abstract/DeferredNotifier';
export declare class MultiObservableSubscription<T extends readonly unknown[]> extends DeferredNotifier implements Subscription {
    private readonly _observables;
    private readonly _observer;
    private readonly _dependencyUpdatedCallback;
    private readonly _registrations;
    constructor(observables: ObservablesOf<T>, observer: (...values: T) => void);
    protected onScheduleNotification(): void;
    protected onDispatchNotification(): void;
    unsubscribe(): void;
}

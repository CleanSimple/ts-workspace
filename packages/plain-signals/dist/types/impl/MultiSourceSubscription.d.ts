import type { SignalsOf, Subscription } from '../types';
import { Schedulable } from '../abstract/Schedulable';
export declare class MultiSourceSubscription<T extends readonly unknown[]> extends Schedulable implements Subscription {
    private readonly _signals;
    private readonly _observer;
    private readonly _dependencyUpdatedCallback;
    private readonly _registrations;
    constructor(signals: SignalsOf<T>, observer: (...values: T) => void);
    protected onSchedule(): void;
    protected onDispatch(): void;
    unsubscribe(): void;
}

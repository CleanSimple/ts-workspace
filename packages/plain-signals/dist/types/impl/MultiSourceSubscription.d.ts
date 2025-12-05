import type { IDependent } from '../interfaces/IDependent';
import type { SignalsOf, Subscription } from '../types';
import { Schedulable } from '../abstract/Schedulable';
import { IDependent_onDependencyUpdated } from '../interfaces/IDependent';
export declare class MultiSourceSubscription<T extends readonly unknown[]> extends Schedulable implements Subscription, IDependent {
    private readonly _signals;
    private readonly _observer;
    private readonly _registrations;
    constructor(signals: SignalsOf<T>, observer: (...values: T) => void);
    protected onSchedule(): void;
    protected onDispatch(): void;
    unsubscribe(): void;
    [IDependent_onDependencyUpdated](): void;
}

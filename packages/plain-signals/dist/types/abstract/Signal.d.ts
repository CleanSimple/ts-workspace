import type { IDependency } from '../interfaces/IDependency';
import type { IDependent } from '../interfaces/IDependent';
import type { Observer, Registration, Subscription } from '../types';
import { IDependency_registerDependent } from '../interfaces/IDependency';
import { Schedulable } from './Schedulable';
declare const SignalSymbol: unique symbol;
export declare abstract class Signal<T> extends Schedulable implements IDependency {
    protected readonly [SignalSymbol] = true;
    private _lastDependentId;
    private _lastObserverId;
    private _dependents;
    private _observers;
    private _prevValue;
    protected notifyDependents(): void;
    protected onSchedule(): void;
    protected onDispatch(): void;
    abstract get value(): T;
    subscribe(observer: Observer<T>): Subscription;
    [IDependency_registerDependent](dependent: IDependent): Registration;
}
export {};

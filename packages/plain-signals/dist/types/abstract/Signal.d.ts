import type { Observer, Subscription } from '../types';
import { Schedulable } from './Schedulable';
declare const SignalSymbol: unique symbol;
export declare abstract class Signal<T> extends Schedulable {
    protected readonly [SignalSymbol] = true;
    private _lastObserverId;
    private _observers;
    private _prevValue;
    protected onSchedule(): void;
    protected onDispatch(): void;
    abstract get value(): T;
    subscribe(observer: Observer<T>): Subscription;
}
export {};

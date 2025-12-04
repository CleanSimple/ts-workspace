import type { Observer, Subscription } from '../types';
import { DeferredNotifier } from './DeferredNotifier';
declare const ObservableSymbol: unique symbol;
export declare abstract class Observable<T> extends DeferredNotifier {
    protected readonly [ObservableSymbol] = true;
    abstract get value(): T;
    abstract subscribe(observer: Observer<T>): Subscription;
}
export {};

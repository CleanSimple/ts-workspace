import type { Observer, Subscription } from '../types';

const ObservableSymbol = Symbol('Observable');

export abstract class Observable<T> {
    protected readonly [ObservableSymbol] = true;
    public abstract get value(): T;
    public abstract subscribe(observer: Observer<T>): Subscription;
}

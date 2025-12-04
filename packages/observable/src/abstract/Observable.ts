import type { Observer, Subscription } from '../types';

import { DeferredNotifier } from './DeferredNotifier';

const ObservableSymbol = Symbol('Observable');

export abstract class Observable<T> extends DeferredNotifier {
    protected readonly [ObservableSymbol] = true;
    public abstract get value(): T;
    public abstract subscribe(observer: Observer<T>): Subscription;
}

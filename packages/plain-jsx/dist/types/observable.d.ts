import type { Action, AnyFunc } from '@lib/utils';
import type { FunctionalComponent } from '.';
export interface Subscription {
    unsubscribe: Action;
}
export type Observer<T> = (value: T) => void;
export declare abstract class Observable<T> {
    abstract get value(): T;
    abstract subscribe(observer: Observer<T>, immediate?: boolean): Subscription;
}
/** internal use */
declare abstract class ObservableImpl<T> extends Observable<T> {
    protected readonly observers: Observer<T>[];
    protected readonly immediateObservers: Observer<T>[];
    private hasDeferredNotifications;
    private readonly notifyObserversCallback;
    constructor();
    protected onUpdated(): void;
    private notifyObservers;
    subscribe(observer: Observer<T>, immediate?: boolean): Subscription;
    private unsubscribe;
}
/**
 * Simple observable value implementation
 */
export declare class Val<T> extends ObservableImpl<T> {
    private _value;
    constructor(initialValue: T);
    get value(): T;
    set value(newValue: T);
    computed<TComputed>(compute: (value: T) => TComputed): Observable<TComputed>;
}
type ObservableParameters<T extends AnyFunc, P = Parameters<T>> = {
    [K in keyof P]: Observable<P[K]>;
};
export declare function val<T>(initialValue: T): Val<T>;
export declare function computed<T extends AnyFunc>(compute: T, ...observables: ObservableParameters<T>): Observable<ReturnType<T>>;
export declare function ref<T extends Element | FunctionalComponent<never, any>, U = T extends Element ? T : T extends FunctionalComponent<never, infer TRef> ? TRef : never>(): Observable<U | null>;
export {};

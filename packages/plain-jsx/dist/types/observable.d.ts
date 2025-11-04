import type { Action } from '@cleansimple/utils-js';
import type { FunctionalComponent } from '.';
import type { IHasUpdates } from './scheduling';
export interface Subscription {
    unsubscribe: Action;
}
export type Observer<T> = (value: T) => void;
export interface Observable<T> {
    get value(): T;
    subscribe: (observer: Observer<T>) => Subscription;
    computed: <TComputed>(compute: (value: T) => TComputed) => Observable<TComputed>;
}
export interface Val<T> extends Observable<T> {
    set value(newValue: T);
}
export type Ref<T> = Observable<T | null>;
export declare function val<T>(initialValue: T): Val<T>;
export declare function computed<T extends readonly unknown[], R>(observables: ObservablesOf<T>, compute: (...values: T) => R): Observable<R>;
export declare function ref<T extends Element | FunctionalComponent<never, any>, U = T extends Element ? T : T extends FunctionalComponent<never, infer TRef> ? TRef : never>(): Ref<U>;
interface IDependant {
    onDependencyUpdated: () => void;
}
/**
 * Base class for observables
 */
export declare abstract class ObservableImpl<T> implements Observable<T>, IHasUpdates {
    private readonly subscriptions;
    private readonly dependents;
    private _nextSubscriptionId;
    private _prevValue;
    private _pendingUpdates;
    registerDependant(dependant: IDependant): void;
    protected notifyDependents(): void;
    protected invalidate(): void;
    flushUpdates(): void;
    abstract get value(): T;
    subscribe(observer: Observer<T>): Subscription;
    computed<TComputed>(compute: (value: T) => TComputed): Observable<TComputed>;
}
/**
 * Simple observable value implementation
 */
export declare class ValImpl<T> extends ObservableImpl<T> {
    private _value;
    constructor(initialValue: T);
    get value(): T;
    set value(newValue: T);
}
type ObservablesOf<T extends readonly unknown[]> = {
    [K in keyof T]: Observable<T[K]>;
};
export {};

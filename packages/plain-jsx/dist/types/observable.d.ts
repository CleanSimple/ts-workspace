import type { Action } from '@cleansimple/utils-js';
import type { FunctionalComponent } from '.';
export interface Subscription {
    unsubscribe: Action;
}
export type Observer<T> = (value: T) => void;
export interface Observable<T> {
    get value(): T;
    subscribe: (observer: Observer<T>, instance?: object) => Subscription;
    computed: <TComputed>(compute: (value: T) => TComputed) => Observable<TComputed>;
}
export interface Val<T> extends Observable<T> {
    set value(newValue: T);
}
export type Ref<T> = Observable<T | null>;
export declare function val<T>(initialValue: T): Val<T>;
export declare function computed<T extends readonly unknown[], R>(observables: ObservablesOf<T>, compute: (...values: T) => R): Observable<R>;
export declare function ref<T extends Element | FunctionalComponent<never, any>, U = T extends Element ? T : T extends FunctionalComponent<never, infer TRef> ? TRef : never>(): Ref<U>;
interface INotificationSource {
    notify: () => void;
}
declare class SubscriptionImpl<T> implements Subscription {
    readonly cb: Observer<T>;
    readonly instance: object | null;
    private readonly id;
    private observableImpl;
    constructor(cb: Observer<T>, instance: object | null, observableImpl: ObservableImpl<T>);
    unsubscribe(): void;
}
interface IDependant {
    onDependencyUpdated: () => void;
}
/**
 * Base class for observables
 */
export declare abstract class ObservableImpl<T> implements Observable<T>, INotificationSource {
    private readonly subscriptions;
    private readonly dependents;
    private _nextSubscriptionId;
    private _prevValue;
    private _pendingNotify;
    registerDependant(dependant: IDependant): void;
    protected notifyDependents(): void;
    protected queueNotify(): void;
    notify(): void;
    addSubscription(subscription: SubscriptionImpl<T>): number;
    removeSubscription(id: number): void;
    abstract get value(): T;
    subscribe(observer: Observer<T>, instance?: object): Subscription;
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

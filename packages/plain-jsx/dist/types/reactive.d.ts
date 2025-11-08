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
type TaskStatus = 'Running' | 'Success' | 'Error';
export interface Task<T> {
    value: Observable<T | undefined>;
    status: Observable<TaskStatus>;
    isRunning: Observable<boolean>;
    isCompleted: Observable<boolean>;
    isSuccess: Observable<boolean>;
    isError: Observable<boolean>;
    error: Observable<unknown>;
    rerun: Action;
}
type TaskAction<T> = (params: {
    signal: AbortSignal;
}) => Promise<T>;
export type ObservablesOf<T extends readonly unknown[]> = {
    [K in keyof T]: Observable<T[K]>;
};
export type ValueOf<T> = T extends Observable<infer V> ? V : T;
export type ValuesOf<T> = T extends readonly unknown[] ? {
    [K in keyof T]: ValueOf<T[K]>;
} : [ValueOf<T>];
export interface IDependant {
    onDependencyUpdated: Action;
}
export declare function val<T>(initialValue: T): Val<T>;
export declare function ref<T extends Element | FunctionalComponent<never, any>, U = T extends Element ? T : T extends FunctionalComponent<never, infer TRef> ? TRef : never>(): Ref<U>;
export declare function computed<T extends readonly unknown[], R>(observables: ObservablesOf<T>, compute: (...values: T) => R): Observable<R>;
export declare function subscribe<T extends readonly unknown[]>(observables: ObservablesOf<T>, observer: (...values: T) => void): Subscription;
export declare function task<T>(action: TaskAction<T>): Task<T>;
/**
 * Base class for observables
 */
export declare abstract class ObservableImpl<T> implements Observable<T>, IHasUpdates {
    private _observers;
    private _dependents;
    private _nextDependantId;
    private _nextSubscriptionId;
    private _prevValue;
    private _pendingUpdates;
    registerDependant(dependant: IDependant): {
        unsubscribe: () => void;
    };
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
export {};

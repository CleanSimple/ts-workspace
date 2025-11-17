import type { Observable, ObservablesOf, Subscription, Task, TaskAction, Val } from './types';
export declare function val<T>(initialValue: T): Val<T>;
export declare function computed<T extends readonly unknown[], R>(observables: ObservablesOf<T>, compute: (...values: T) => R): Observable<R>;
export declare function subscribe<T extends readonly unknown[]>(observables: ObservablesOf<T>, observer: (...values: T) => void): Subscription;
export declare function task<T>(action: TaskAction<T>): Task<T>;
export declare function isObservable(value: unknown): value is Observable<unknown>;
export declare function isVal(value: unknown): value is Val<unknown>;

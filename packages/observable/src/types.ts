export interface Subscription {
    unsubscribe: () => void;
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

export type TaskStatus = 'Running' | 'Success' | 'Error';
export type TaskAction<T> = (params: { signal: AbortSignal }) => Promise<T>;

export interface Task<T> {
    value: Observable<T | undefined>;
    status: Observable<TaskStatus>;
    isRunning: Observable<boolean>;
    isCompleted: Observable<boolean>;
    isSuccess: Observable<boolean>;
    isError: Observable<boolean>;
    error: Observable<unknown>;
    rerun: () => void;
}

export type ObservablesOf<T extends readonly unknown[]> = {
    [K in keyof T]: Observable<T[K]>;
};

export interface IDependant {
    onDependencyUpdated: () => void;
}

export interface IHasUpdates {
    flushUpdates: () => void;
}

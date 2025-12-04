import type { Observable } from './abstract/Observable';

export interface Subscription {
    unsubscribe: () => void;
}
export interface Registration {
    unregister: () => void;
}

export type Observer<T> = (value: T) => void | Promise<void>;

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

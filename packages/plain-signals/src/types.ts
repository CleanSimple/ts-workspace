import type { Signal } from './abstract/Signal';

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
    value: Signal<T | undefined>;
    status: Signal<TaskStatus>;
    isRunning: Signal<boolean>;
    isCompleted: Signal<boolean>;
    isSuccess: Signal<boolean>;
    isError: Signal<boolean>;
    error: Signal<unknown>;
    rerun: () => void;
}

export type SignalsOf<T extends readonly unknown[]> = {
    [K in keyof T]: Signal<T[K]>;
};

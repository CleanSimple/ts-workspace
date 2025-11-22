import type {
    Observable,
    ObservablesOf,
    Subscription,
    Task,
    TaskAction,
    TaskStatus,
    Val,
} from './types';

import { Computed } from './impl/Computed';
import { ComputedSingle } from './impl/ComputedSingle';
import { MultiObservableSubscription } from './impl/MultiObservableSubscription';
import { ObservableBase } from './impl/ObservableBase';
import { ValImpl } from './impl/ValImpl';

export function val<T>(initialValue: T): Val<T> {
    return new ValImpl<T>(initialValue);
}

export function computed<T extends readonly unknown[], R>(
    observables: ObservablesOf<T>,
    compute: (...values: T) => R,
): Observable<R>;
export function computed<T, R>(
    observable: Observable<T>,
    compute: (value: T) => R,
): Observable<R>;

export function computed<R>(
    source: Observable<unknown> | Observable<unknown>[],
    compute: (...values: unknown[]) => R,
): Observable<R> {
    return Array.isArray(source)
        ? source.length === 1
            ? new ComputedSingle(source[0], compute)
            : new Computed(source, compute)
        : new ComputedSingle(source, compute);
}

export function subscribe<T extends readonly unknown[]>(
    observables: ObservablesOf<T>,
    observer: (...values: T) => void,
): Subscription {
    return new MultiObservableSubscription(observables, observer);
}

const TaskAborted = Symbol('TaskAborted');

export function task<T>(action: TaskAction<T>): Task<T> {
    const value = val<T | undefined>(undefined);
    const error = val<unknown>(undefined);
    const status = val<TaskStatus>('Running');
    const isRunning = status.computed(status => status === 'Running');
    const isCompleted = status.computed(status => status !== 'Running');
    const isSuccess = status.computed(status => status === 'Success');
    const isError = status.computed(status => status === 'Error');
    let abortController: AbortController | null = null;

    const run = () => {
        if (abortController) {
            abortController.abort(TaskAborted);
        }
        abortController = new AbortController();

        status.value = 'Running';
        error.value = undefined;
        action({ signal: abortController.signal }).then((result) => {
            value.value = result;
            status.value = 'Success';
        }).catch(err => {
            if (err === TaskAborted) return;
            error.value = err;
            status.value = 'Error';
        });
    };

    run();
    return { value, status, isRunning, isCompleted, isSuccess, isError, error, rerun: run };
}

export function isObservable(value: unknown): value is Observable<unknown> {
    return value instanceof ObservableBase;
}

export function isVal(value: unknown): value is Val<unknown> {
    return value instanceof ValImpl;
}

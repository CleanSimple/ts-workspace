import type { SignalsOf, Subscription, Task, TaskAction, TaskStatus } from './types';

import { Signal } from './abstract/Signal';
import { Computed } from './impl/Computed';
import { ComputedSingle } from './impl/ComputedSingle';
import { MultiSourceSubscription } from './impl/MultiSourceSubscription';
import { Val } from './impl/Val';

import './extensions/SignalExtensions';
import './extensions/ValExtensions';

export function val<T>(initialValue: T): Val<T> {
    return new Val<T>(initialValue);
}

export function computed<T extends readonly unknown[], R>(
    signals: SignalsOf<T>,
    compute: (...values: T) => R,
): Signal<R>;
export function computed<T, R>(
    signal: Signal<T>,
    compute: (value: T) => R,
): Signal<R>;

export function computed<R>(
    source: Signal<unknown> | Signal<unknown>[],
    compute: (...values: unknown[]) => R,
): Signal<R> {
    return Array.isArray(source)
        ? source.length === 1
            ? new ComputedSingle(source[0], compute)
            : new Computed(source, compute)
        : new ComputedSingle(source, compute);
}

export function subscribe<T extends readonly unknown[]>(
    signal: SignalsOf<T>,
    observer: (...values: T) => void,
): Subscription {
    return new MultiSourceSubscription(signal, observer);
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
    return {
        value: value.asReadOnly(),
        status: status.asReadOnly(),
        isRunning,
        isCompleted,
        isSuccess,
        isError,
        error: error.asReadOnly(),
        rerun: run,
    };
}

export function isSignal(value: unknown): value is Signal<unknown> {
    return value instanceof Signal;
}

export function isVal(value: unknown): value is Val<unknown> {
    return value instanceof Val;
}

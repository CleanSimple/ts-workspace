import type { Action } from '@cleansimple/utils-js';
import type { FunctionalComponent } from '.';
import type { IHasUpdates } from './scheduling';

import { DeferredUpdatesScheduler } from './scheduling';

/* types */
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

type TaskAction<T> = (params: { signal: AbortSignal }) => Promise<T>;

export type ObservablesOf<T extends readonly unknown[]> = {
    [K in keyof T]: Observable<T[K]>;
};

export type ValueOf<T> = T extends Observable<infer V> ? V : T;

export type ValuesOf<T> = T extends readonly unknown[] ? {
        [K in keyof T]: ValueOf<T[K]>;
    }
    : [ValueOf<T>];

export interface IDependant {
    onDependencyUpdated: Action;
}

/* helpers */
export function val<T>(initialValue: T): Val<T> {
    return new ValImpl<T>(initialValue);
}

export function ref<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends Element | FunctionalComponent<never, any>,
    U = T extends Element ? T : T extends FunctionalComponent<never, infer TRef> ? TRef : never,
>(): Ref<U> {
    return new ValImpl<U | null>(null);
}

export function computed<T extends readonly unknown[], R>(
    observables: ObservablesOf<T>,
    compute: (...values: T) => R,
): Observable<R> {
    return new Computed(observables, compute);
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

/**
 * Base class for observables
 */
export abstract class ObservableImpl<T> implements Observable<T>, IHasUpdates {
    private _observers: Map<number, Observer<T>> | null = null;
    private _dependents: Map<number, WeakRef<IDependant>> | null = null;
    private _nextDependantId = 0;
    private _nextSubscriptionId = 0;
    private _prevValue: T | null = null;
    private _pendingUpdates = false;

    public registerDependant(dependant: IDependant) {
        this._dependents ??= new Map();
        const id = ++this._nextDependantId;
        this._dependents.set(id, new WeakRef(dependant));
        return {
            unsubscribe: () => {
                this._dependents!.delete(id);
            },
        };
    }

    protected notifyDependents() {
        if (!this._dependents) return;
        for (const [id, ref] of this._dependents.entries()) {
            const dependant = ref.deref();
            if (dependant) {
                dependant.onDependencyUpdated();
            }
            else {
                this._dependents.delete(id);
            }
        }
    }

    protected invalidate() {
        if (!this._observers) return;
        if (this._pendingUpdates) return;
        this._pendingUpdates = true;
        this._prevValue = this.value;
        DeferredUpdatesScheduler.schedule(this);
    }

    public flushUpdates() {
        if (!this._pendingUpdates) return;
        const prevValue = this._prevValue;
        const value = this.value;
        this._pendingUpdates = false;
        this._prevValue = null;
        if (value === prevValue) {
            return;
        }
        for (const observer of this._observers!.values()) {
            observer(value);
        }
    }

    public abstract get value(): T;

    public subscribe(observer: Observer<T>): Subscription {
        this._observers ??= new Map();
        const id = ++this._nextSubscriptionId;
        this._observers.set(id, observer);
        return {
            unsubscribe: () => {
                this._observers!.delete(id);
            },
        };
    }

    public computed<TComputed>(compute: (value: T) => TComputed): Observable<TComputed> {
        return new ComputedSingle(compute, this);
    }
}

/**
 * Simple observable value implementation
 */
export class ValImpl<T> extends ObservableImpl<T> {
    private _value: T;

    public constructor(initialValue: T) {
        super();
        this._value = initialValue;
    }

    public override get value() {
        return this._value;
    }

    public set value(newValue) {
        if (newValue === this._value) return;
        this.invalidate();
        this._value = newValue;
        this.notifyDependents();
    }
}

class ComputedSingle<TVal, TComputed> extends ObservableImpl<TComputed> implements IDependant {
    private readonly _compute: (value: TVal) => TComputed;
    private readonly _observable: Observable<TVal>;
    private _value: TComputed;
    private _shouldReCompute: boolean;

    public constructor(compute: (value: TVal) => TComputed, observable: Observable<TVal>) {
        super();
        this._compute = compute;
        this._observable = observable;
        this._value = this._compute(observable.value);
        this._shouldReCompute = false;

        (observable as ObservableImpl<TVal>).registerDependant(this);
    }

    public onDependencyUpdated(): void {
        this.invalidate();
        this._shouldReCompute = true;
        this.notifyDependents();
    }

    public override get value(): TComputed {
        if (this._shouldReCompute) {
            this._shouldReCompute = false;
            this._value = this._compute(this._observable.value);
        }
        return this._value;
    }
}

class Computed<T extends readonly unknown[], R> extends ObservableImpl<R> implements IDependant {
    private readonly _compute: (...values: T) => R;
    private readonly _observables: ObservablesOf<T>;
    private _value: R;
    private _shouldReCompute: boolean;

    public constructor(observables: ObservablesOf<T>, compute: (...values: T) => R) {
        super();
        this._compute = compute;
        this._observables = observables;
        this._value = this._compute(
            ...observables.map(observable => observable.value) as unknown as T,
        );
        this._shouldReCompute = false;

        for (let i = 0; i < observables.length; ++i) {
            (observables[i] as ObservableImpl<T>).registerDependant(this);
        }
    }

    public onDependencyUpdated() {
        this.invalidate();
        this._shouldReCompute = true;
        this.notifyDependents();
    }

    public override get value(): R {
        if (this._shouldReCompute) {
            this._shouldReCompute = false;
            this._value = this._compute(
                ...this._observables.map(observable => observable.value) as unknown as T,
            );
        }
        return this._value;
    }
}

class MultiObservableSubscription<T extends readonly unknown[]>
    implements Subscription, IDependant, IHasUpdates
{
    private readonly _observables: ObservablesOf<T>;
    private readonly _observer: (...values: T) => void;
    private readonly _subscriptions: Subscription[];
    private _pendingUpdates: boolean = false;

    public constructor(observables: ObservablesOf<T>, observer: (...values: T) => void) {
        this._observer = observer;
        this._observables = observables;
        this._subscriptions = [];
        for (let i = 0; i < observables.length; ++i) {
            this._subscriptions.push(
                (observables[i] as ObservableImpl<T>).registerDependant(this),
            );
        }
    }

    public onDependencyUpdated() {
        if (this._pendingUpdates) return;
        this._pendingUpdates = true;
        DeferredUpdatesScheduler.schedule(this);
    }

    public flushUpdates() {
        if (!this._pendingUpdates) return;
        this._pendingUpdates = false;
        this._observer(...this._observables.map(observable => observable.value) as unknown as T);
    }

    public unsubscribe() {
        for (let i = 0; i < this._subscriptions.length; ++i) {
            this._subscriptions[i].unsubscribe();
        }
    }
}
